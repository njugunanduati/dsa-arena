"""Disposable worker for trusted local code. This is NOT a security sandbox."""
import contextlib
import io
import json
import sys
import resource
resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
resource.setrlimit(resource.RLIMIT_FSIZE, (65536, 65536))
resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))

class CappedOutput(io.TextIOBase):
    def write(self, value):
        return len(value)

payload = json.load(sys.stdin)
try:
    scope = {}
    with contextlib.redirect_stdout(CappedOutput()), contextlib.redirect_stderr(CappedOutput()):
        exec(compile(payload['code'], '<solution>', 'exec'), scope)
        result = scope['solve'](*payload['args'])
    output = json.dumps({'actual': result}, allow_nan=False)
    if len(output) > 65536:
        raise ValueError('Result too large')
    print(output)
except BaseException as exc:
    print(json.dumps({'error': f'{type(exc).__name__}: {str(exc)[:500]}'}))
