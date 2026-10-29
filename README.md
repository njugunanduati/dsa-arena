# DSA Arena

A Python interview practice MVP with a React + CodeMirror editor and FastAPI runner.

## Features

- Your Daily Python DSA Practice questions: Move Zeroes (in-place practice), Day 2: First Duplicate Within K Positions, and Day 3: First Non-Repeating Character. Original function names, day labels, constraints, examples, and reflection prompts are included.
- Python syntax highlighting, autocomplete, line numbers, indentation, saved drafts, and reset to starter code.
- **Run examples** checks the visible examples for that question; **Submit solution** runs the full suite, including hidden edge cases. Results show pass/fail, execution time, visible input/output, and errors.
- 15/25/30/45/60-minute countdown with start, pause, reset, and expiry notice. Uses elapsed wall time so background tabs do not slow the countdown. Run Examples and Submit are enabled only while the timer is running; pause, reset, and expiry lock both actions. Editing remains available. timer state resets on page reload.
- Browser-local progress dashboard, submission count, permanent solved status, and drafts. No account required. Clearing browser storage removes this data; no server-side progress or cross-device sync in this MVP.
- Responsive layout, keyboard-accessible controls, and live execution feedback.

## Local setup

Requirements: macOS or Linux, Python 3.9+, Node.js 22.12+ (or 24+), npm. Windows users should use WSL (the runner uses POSIX process/resource limits).

```sh
git clone https://github.com/njugunanduati/dsa-arena.git
cd dsa-arena
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

In a second terminal:

```sh
cd dsa-arena/frontend
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` requests to port 8000; start both servers. API docs: **http://127.0.0.1:8000/docs**. Stop either server with Ctrl+C.

## Practice workflow

1. Choose a problem and implement the provided named function (`move_zeroes`, `nearby_duplicate`, or `first_unique_char`). Inputs are JSON values, passed as positional arguments; return a JSON-serializable value instead of reading stdin or printing an answer. For Move Zeroes, mutate the original list; the runner checks that list and ignores the return value.
2. Run examples for quick feedback. Submit for full evaluation; only submissions update progress. Hidden case details are omitted from API results.
3. Start the interview timer before running examples or submitting. Pause locks testing until you resume. Click the topic label for a short concept explanation and visual example. Drafts save as you type. A later failed submission never removes an earlier solve.

## Tests

From the repository root:

```sh
.venv/bin/python -m pytest backend/tests -q
cd frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start both servers automatically. They use dedicated ports 18000 and 15173; ensure these ports are free. They cover editing and execution, accepted/failed submissions, persistence, problem switching, search, timer controls and expiry, and mobile layout. Backend tests verify every reference solution, validation, errors, timeouts, and recovery. Reference solutions are test fixtures only.

## Execution model and limits

**Trusted local use only. Never expose this API to the internet or execute code supplied by other people.** The API runs arbitrary Python with the privileges of your user. Disposable subprocesses, isolated Python startup, a temporary working directory, output suppression, two-second CPU and three-second wall limits per case, and process-group cleanup provide reliability, not a security sandbox. Code can still access files, network, or create processes; there is no authentication or OS isolation. Two submissions execute at once per API process; submissions run cases sequentially. Source is limited to 20,000 characters. Timings include process startup and are not algorithm benchmarks. The test suite verifies outputs, not asymptotic complexity.

For public hosting, replace the worker with a hardened execution service using per-job containers/VMs, no network, restricted filesystem, memory/process quotas, admission limits, and authentication before deployment. This repository intentionally does not publish a public runner.

## Project layout

- `frontend/src/App.jsx`: practice interface and workflow
- `frontend/src/TopicGuide.jsx`: accessible concept popup with SVG examples
- `frontend/src/storage.js`: browser progress, drafts, timer arithmetic
- `backend/main.py`: catalog and submission endpoints
- `backend/worker.py`: disposable local Python executor
- `backend/problems.py`: problem statements, starters, public and hidden cases
- `backend/tests`, `frontend/src/*.test.js`, `frontend/e2e`: automated checks

Add a challenge in `backend/problems.py` with a unique ID, function name, starter signature, example count, guidance, and cases (visible examples first, followed by hidden cases). Add a reference solution to the backend test fixtures.

## Curriculum source

This catalog follows the **Daily Python DSA Practice** chat. Day 2 and Day 3 retain the retrieved statements, examples, constraints, 25-minute recommendations, and self-review prompts. Move Zeroes was reconstructed from the shared attempt and in-place follow-up; its extra examples and 30-minute default are Arena additions, not a verbatim recovered assignment. Added hidden cases cover empty input, duplicates, negative numbers, and boundary behavior. Approach restrictions and complexity targets are learning requirements; output tests do not prove them. No other earlier in-place follow-up questions were available in the readable chat history, so none have been invented.
