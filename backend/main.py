import asyncio
import json
from pathlib import Path
import sys
import tempfile
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from backend.problems import PROBLEMS, BY_ID, CHAPTERS

app = FastAPI(title='DSA Arena', version='1.0.0')
slots = asyncio.Semaphore(2)
WORKER = str(Path(__file__).with_name('worker.py'))

class Submission(BaseModel):
    problem_id: str
    code: str = Field(min_length=1, max_length=20000)
    mode: str = 'run'

@app.get('/api/health')
def health():
    return {'status': 'ok'}

@app.get('/api/chapters')
def chapters():
    return CHAPTERS

@app.get('/api/problems')
def problems():
    return [{**{k:v for k,v in p.items() if k != 'cases'}, 'examples': p['cases'][:p['example_count']],
             'test_count': len(p['cases'])} for p in PROBLEMS]

async def evaluate(code, case, function_name, result_mode):
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix='dsa-') as directory:
        process = await asyncio.create_subprocess_exec(sys.executable, '-I', WORKER,
            stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL, cwd=directory, start_new_session=True,
            env={'PATH': '/usr/bin:/bin'})
        try:
            output, _ = await asyncio.wait_for(process.communicate(json.dumps({'code':code, 'args':case['args'], 'function_name':function_name, 'result_mode':result_mode}).encode()), timeout=3)
            result = json.loads(output) if process.returncode == 0 else {'error':'Worker exited (resource limit or process error)'}
        except asyncio.TimeoutError:
            result = {'error':'Time limit exceeded (3 seconds)'}
        except (ValueError, UnicodeDecodeError):
            result = {'error':'Invalid worker response'}
        finally:
            import os, signal
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            await process.wait()
    return {**result, 'passed': 'error' not in result and result.get('actual') == case['expected'],
            'elapsed_ms': round((time.monotonic()-started)*1000)}

@app.post('/api/submissions')
async def submit(body: Submission):
    if body.problem_id not in BY_ID:
        raise HTTPException(404, 'Problem not found')
    if body.mode not in ('run', 'submit'):
        raise HTTPException(422, 'mode must be run or submit')
    problem = BY_ID[body.problem_id]
    cases = problem['cases'] if body.mode == 'submit' else problem['cases'][:problem['example_count']]
    async with slots:
        results = []
        for i, case in enumerate(cases):
            result = await evaluate(body.code, case, problem['function_name'], problem['result_mode'])
            result['case'] = i+1
            if i < problem['example_count']:
                result.update(args=case['args'], expected=case['expected'])
            else:
                result.pop('actual', None)
            results.append(result)
    return {'accepted': all(r['passed'] for r in results), 'mode':body.mode, 'results':results}
