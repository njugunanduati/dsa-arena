import pytest
from fastapi.testclient import TestClient
from backend.main import app

SOLUTIONS = {
 'move-zeroes': 'def move_zeroes(nums):\n write=0\n for read in range(len(nums)):\n  if nums[read]!=0:\n   nums[write],nums[read]=nums[read],nums[write]\n   write+=1',
 'nearby-duplicate': 'def nearby_duplicate(nums,k):\n seen={}\n for i,x in enumerate(nums):\n  if x in seen and i-seen[x]<=k: return True\n  seen[x]=i\n return False',
 'first-unique-char': 'def first_unique_char(s):\n counts={}\n for c in s: counts[c]=counts.get(c,0)+1\n for i,c in enumerate(s):\n  if counts[c]==1: return i\n return -1'
}

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

def send(client, code, problem='move-zeroes', mode='submit'):
    return client.post('/api/submissions', json={'problem_id':problem,'code':code,'mode':mode})

def test_catalog_and_health(client):
    assert client.get('/api/health').json()=={'status':'ok'}
    data=client.get('/api/problems').json()
    assert len(data)==3
    assert all('cases' not in p and len(p['examples'])==p['example_count'] for p in data)

@pytest.mark.parametrize('problem', SOLUTIONS)
def test_all_reference_solutions(client, problem):
    result=send(client,SOLUTIONS[problem],problem).json()
    assert result['accepted'],result
    assert len(result['results'])>=4
    assert 'expected' not in result['results'][-1]
    assert 'actual' not in result['results'][-1]

def test_run_does_not_run_hidden_cases(client):
    data=send(client,SOLUTIONS['move-zeroes'],mode='run').json()
    assert data['accepted'] and len(data['results'])==2

@pytest.mark.parametrize('code,error', [('def move_zeroes(:','SyntaxError'),('def move_zeroes(*args):\n raise ValueError("oops")','ValueError'),('x=1','KeyError')])
def test_errors(client,code,error):
    data=send(client,code,mode='run').json()
    assert not data['accepted']
    assert error in data['results'][0]['error']

def test_wrong_answer(client):
    assert not send(client,'def move_zeroes(*args): return []').json()['accepted']

def test_prints_do_not_break_protocol(client):
    assert send(client,'print("hello")\n'+SOLUTIONS['move-zeroes']).json()['accepted']

def test_timeout_and_recovery(client):
    result=send(client,'import time\ndef move_zeroes(*args): time.sleep(10)',mode='run').json()
    assert not result['accepted']
    assert 'Time limit' in result['results'][0]['error']
    assert send(client,SOLUTIONS['move-zeroes']).json()['accepted']

def test_validation(client):
    assert send(client,'x=1',problem='missing').status_code==404
    assert send(client,'x=1',mode='oops').status_code==422
    assert send(client,'').status_code==422
    assert send(client,'x'*20001).status_code==422


def test_returning_a_new_list_is_not_in_place(client):
    data=send(client,'def move_zeroes(nums): return [n for n in nums if n] + [0]*nums.count(0)').json()
    assert not data['accepted']

def test_original_attempt_fails_mutation_check(client):
    code='def move_zeroes(nums):\n zeroes=[n for n in nums if n==0]\n nums[:]=[n for n in nums if n!=0]\n return nums+zeroes'
    assert not send(client,code).json()['accepted']

def test_original_examples_are_visible(client):
    data=client.get('/api/problems').json()
    assert data[1]['examples'][0]=={'args':[[4,2,7,4,9],3],'expected':True}
    assert data[2]['examples'][2]=={'args':['aabbcc'],'expected':-1}
    for id in ['nearby-duplicate','first-unique-char']:
        result=send(client,SOLUTIONS[id],problem=id,mode='run').json()
        assert result['accepted'] and len(result['results'])==3
