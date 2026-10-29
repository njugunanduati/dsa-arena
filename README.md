# DSA Arena

A Python practice app with a React + CodeMirror editor, FastAPI runner, and a guided chapter path.

## Learning path

- **Three chapters:** Arrays & In-place, Hash Maps & Sets, and Strings & Patterns.
- **Ten questions per chapter:** five concepts, with two questions per concept. Solve one from each pair: **five accepted questions unlock the next chapter**. You do not need to solve all ten.
- **One question at a time:** other questions and later chapters stay locked, even before starting. After an accepted full submission, choose **Next concept**, or unlock the next chapter after your fifth solve.
- **Fixed difficulty-based timers:** Easy questions get 20 or 25 minutes, Medium questions 30 or 35, and Hard questions 45. Start explicitly; Run Examples and Submit only work during that question's active time. There is no pause, time selector, reset, or skip.
- **Timeout retries:** when time expires, a notice appears and the other question in that concept pair is posed. Start a new timer when ready. Repeated timeouts alternate the pair; your completed concepts stay credited. Each replacement has its own saved draft and three hints.
- **Reload-safe deadlines:** the current question, deadline, hints, and progress save to browser storage. Time continues across reloads, closed tabs, and background tabs. If the deadline passed while away, the replacement question appears on return.
- **Acceptance boundary:** only a full accepted submission received before the deadline completes a question. Passing examples does not count. A late or stale response never credits the replacement question.
- **Chapter field guides:** descriptions, illustrated walkthroughs, Python methods, operation costs, code examples, and real uses. Includes list mutation vs copying, dictionary/set membership, and immutable string transformations.
- **Progressive hints:** reveal three nudges per question; hints have no score penalty.
- **Actual progress:** solved counts by difficulty, earned chapter badges, a 26-week submission activity grid, active days, and streaks. No placeholder activity or social statistics.

Drafts and progression are local to this browser, not an account. Clearing browser storage clears them; there is no cross-device sync. The chapter path uses `arena.course.v1`. Drafts from the earlier MVP remain under `arena.drafts`; older `arena.progress` records remain untouched but do not grant chapter credit. Course credit starts with the new guided path.

## Local setup

Requirements: macOS or Linux, Python 3.9+, Node.js 22.12+ (or 24+), npm. Windows users should use WSL because the runner uses POSIX process/resource limits.

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

Open **http://127.0.0.1:5173**. Vite proxies `/api` to port 8000, so both servers must run. API docs: **http://127.0.0.1:8000/docs**. Stop with Ctrl+C.

## Practice workflow

1. Read the current chapter's field guide and the assigned question. Reveal a hint if you need one.
2. Implement the provided named function. JSON inputs are passed as positional arguments. Return a JSON-serializable value. For mutation questions, change the original list; the return value is ignored.
3. Start the question's timer. Run Examples checks visible cases; Submit runs the full suite, including hidden cases. Test output shows pass/fail, visible inputs/results, execution time, and errors.
4. On acceptance, continue to the next concept. On timeout, try the alternate question on the same concept. Five successful concepts earn the chapter badge and unlock the next chapter.

Timers and navigation are enforced by the browser workflow, not a server-side proctoring system. The local API remains a direct evaluation endpoint. Complexity targets and method restrictions are learning requirements; output tests verify behavior, not asymptotic complexity or which Python methods you used.

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

Browser tests start both servers on ports 18000 and 15173. Override with `DSA_E2E_API_PORT` and `DSA_E2E_WEB_PORT` if those ports are busy. The suite covers execution, single-question locking, reload-safe deadlines, same-concept timeout replacement, hints, the field guide, and mobile layout. Frontend tests also cover five-solve unlocks, all-chapter completion, duplicate-credit prevention, malformed saved state, and late response rejection. Backend tests evaluate all 30 reference solutions and check input validation, hidden-case privacy, errors, resource timeouts, and recovery. Solutions exist only in test fixtures and are never returned by the catalog API.

## Execution model and limits

**Trusted local use only. Never expose this API to the internet or execute code supplied by other people.** Python executes with your user privileges. Disposable processes, isolated Python startup, temporary working directories, print suppression, two-second CPU and three-second wall limits per case, and process-group cleanup improve reliability; they are not a security sandbox. Code can still access files, network, or spawn processes. Two submissions execute concurrently per API process, with sequential cases per submission. Source is capped at 20,000 characters. Timings include process startup.

For public hosting, replace the worker with a hardened execution service using per-job containers/VMs, no network, restricted filesystems, memory/process quotas, admission limits, and authentication. This app intentionally does not publish a public runner.

## Project layout

- `frontend/src/App.jsx`: guided practice interface and request handling
- `frontend/src/course.js`: persisted chapter state, deadlines, unlocks, activity calculations
- `frontend/src/ChapterLesson.jsx`: illustrated chapter lessons and method references
- `frontend/src/ProgressDashboard.jsx`: actual activity and chapter badges
- `backend/problems.py`: 30-question curriculum, retry pairs, public/hidden cases, and hints
- `backend/daily_problems.py`: preserved original daily-practice source material
- `backend/main.py`: chapters, problem catalog, and submission API
- `backend/worker.py`: disposable local Python executor
- `backend/tests/solutions.py`: reference solutions used only by tests

Each chapter must contain exactly five concepts and each concept exactly two questions. The state machine and catalog tests enforce this curriculum contract. Add a reference solution for every new question.

## Curriculum source

Move Zeroes, First Duplicate Within K Positions, and First Non-Repeating Character come from **Daily Python DSA Practice**. The two later assignments retain their original signatures, source examples, constraints, and prompts. The other 27 questions, paired retries, hints, lessons, and difficulty allocations are new Arena curriculum additions requested for the chapter flow, not recovered chat assignments. The screenshot inspired progress counts, earned badges, and activity history; all displayed values come from actual local chapter attempts.
