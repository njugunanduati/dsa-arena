import pytest
from fastapi.testclient import TestClient
from backend.main import app

from backend.tests.solutions import SOLUTIONS
from backend.problems import PROBLEMS, CHAPTERS

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

def send(client, code, problem='move-zeroes', mode='submit'):
    return client.post('/api/submissions', json={'problem_id':problem,'code':code,'mode':mode})

def test_catalog_and_health(client):
    assert client.get('/api/health').json()=={'status':'ok'}
    data=client.get('/api/problems').json()
    assert len(data)==30
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
    assert next(p for p in data if p['id']=='nearby-duplicate')['examples'][0]=={'args':[[4,2,7,4,9],3],'expected':True}
    assert next(p for p in data if p['id']=='first-unique-char')['examples'][2]=={'args':['aabbcc'],'expected':-1}
    for id in ['nearby-duplicate','first-unique-char']:
        result=send(client,SOLUTIONS[id],problem=id,mode='run').json()
        assert result['accepted'] and len(result['results'])==3


def test_curriculum_has_ten_questions_and_five_retry_pairs_per_chapter(client):
    assert client.get('/api/chapters').json()==CHAPTERS
    assert len({p['id'] for p in PROBLEMS})==30
    assert set(SOLUTIONS)=={p['id'] for p in PROBLEMS}
    for chapter in CHAPTERS:
        questions=[p for p in PROBLEMS if p['chapter_id']==chapter['id']]
        assert len(questions)==10 and len(chapter['concepts'])==5
        for concept in chapter['concepts']:
            pair=[p for p in questions if p['concept_id']==concept['id']]
            assert len(pair)==2
            assert pair[0]['minutes']==pair[1]['minutes']
            assert all(20<=p['minutes']<=45 and len(p['hints'])==3 for p in pair)
