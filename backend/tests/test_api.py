import pytest
from fastapi.testclient import TestClient
from backend.main import app

SOLUTIONS = {
 'two-sum': 'def solve(nums, target):\n for i,x in enumerate(nums):\n  for j in range(i+1,len(nums)):\n   if x+nums[j]==target: return [i,j]',
 'palindrome': 'def solve(text):\n s="".join(c.lower() for c in text if c.isalnum())\n return s==s[::-1]',
 'max-subarray': 'def solve(nums):\n best=current=nums[0]\n for x in nums[1:]:\n  current=max(x,current+x)\n  best=max(best,current)\n return best',
 'brackets': 'def solve(text):\n stack=[]\n for c in text:\n  if c in "([{": stack.append(c)\n  elif not stack or stack.pop()!={")":"(","]":"[","}":"{"}[c]: return False\n return not stack',
 'binary-search': 'def solve(nums,target):\n lo,hi=0,len(nums)-1\n while lo<=hi:\n  mid=(lo+hi)//2\n  if nums[mid]==target: return mid\n  if nums[mid]<target: lo=mid+1\n  else: hi=mid-1\n return -1',
 'tree-depth': 'def solve(root):\n return 0 if root is None else 1+max(solve(root.get("left")),solve(root.get("right")))'
}

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

def send(client, code, problem='two-sum', mode='submit'):
    return client.post('/api/submissions', json={'problem_id':problem,'code':code,'mode':mode})

def test_catalog_and_health(client):
    assert client.get('/api/health').json()=={'status':'ok'}
    data=client.get('/api/problems').json()
    assert len(data)==6
    assert all('cases' not in p and len(p['examples'])==2 for p in data)

@pytest.mark.parametrize('problem', SOLUTIONS)
def test_all_reference_solutions(client, problem):
    result=send(client,SOLUTIONS[problem],problem).json()
    assert result['accepted'],result
    assert len(result['results'])>=4
    assert 'expected' not in result['results'][2]
    assert 'actual' not in result['results'][2]

def test_run_does_not_run_hidden_cases(client):
    data=send(client,SOLUTIONS['two-sum'],mode='run').json()
    assert data['accepted'] and len(data['results'])==2

@pytest.mark.parametrize('code,error', [('def solve(:','SyntaxError'),('def solve(*args):\n raise ValueError("oops")','ValueError'),('x=1','KeyError')])
def test_errors(client,code,error):
    data=send(client,code,mode='run').json()
    assert not data['accepted']
    assert error in data['results'][0]['error']

def test_wrong_answer(client):
    assert not send(client,'def solve(*args): return []').json()['accepted']

def test_prints_do_not_break_protocol(client):
    assert send(client,'print("hello")\n'+SOLUTIONS['two-sum']).json()['accepted']

def test_timeout_and_recovery(client):
    result=send(client,'import time\ndef solve(*args): time.sleep(10)',mode='run').json()
    assert not result['accepted']
    assert 'Time limit' in result['results'][0]['error']
    assert send(client,SOLUTIONS['two-sum']).json()['accepted']

def test_validation(client):
    assert send(client,'x=1',problem='missing').status_code==404
    assert send(client,'x=1',mode='oops').status_code==422
    assert send(client,'').status_code==422
    assert send(client,'x'*20001).status_code==422
