import React, {useEffect, useRef, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';
import {read,write,remaining} from './storage';
import {restoreCourse,transition,canRun} from './course';
import ChapterLesson from './ChapterLesson';
import ProgressDashboard from './ProgressDashboard';
import './style.css';
const COURSE_KEY='arena.course.v1';

export default function App(){
 const [problems,setProblems]=useState([]),[chapters,setChapters]=useState([]),[course,setCourse]=useState(null);
 const [drafts,setDrafts]=useState(()=>read('arena.drafts',{}));
 const [result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saveError,setSaveError]=useState(false),[now,setNow]=useState(Date.now());
 const current=useRef(null),request=useRef(null);
 function persist(next){current.current=next;setCourse(next);if(!write(COURSE_KEY,next))setSaveError(true);}
 function send(action){if(current.current)persist(transition(current.current,action,chapters,problems));}
 useEffect(()=>{const controller=new AbortController();
  async function load(){try{
   const responses=await Promise.all(['/api/problems','/api/chapters'].map(url=>fetch(url,{signal:controller.signal})));
   if(responses.some(r=>!r.ok))throw Error('Unable to load your chapters.');
   const [ps,cs]=await Promise.all(responses.map(r=>r.json()));
   setProblems(ps);setChapters(cs);
   let restored=restoreCourse(read(COURSE_KEY,{}),cs,ps);
   restored=transition(restored,{type:'expire',now:Date.now()},cs,ps);
   persist(restored);setNow(Date.now());
  }catch(e){if(e.name!=='AbortError')setError(`${e.message} Check that the API is running and reload.`);}}
  load();return()=>controller.abort();
 },[]);
 useEffect(()=>{if(!write('arena.drafts',drafts))setSaveError(true);},[drafts]);
 useEffect(()=>{
  if(course?.status!=='running')return;
  const tick=()=>{setNow(Date.now());if(current.current?.status==='running'&&current.current.deadline<=Date.now())send({type:'expire'});};
  tick();const timer=setInterval(tick,250);return()=>clearInterval(timer);
 },[course?.status,course?.deadline,chapters,problems]);
 useEffect(()=>{request.current?.controller.abort();request.current=null;setBusy(false);setResult(null);setError('');},[course?.activeId]);
 useEffect(()=>()=>request.current?.controller.abort(),[]);
 const p=problems.find(p=>p.id===course?.activeId),chapter=chapters[course?.chapterIndex];
 async function run(mode){
  if(!p||request.current||!canRun(current.current)){send({type:'expire'});return;}
  const token={controller:new AbortController(),id:p.id,deadline:current.current.deadline};
  request.current=token;setBusy(true);setError('');setResult(null);
  try{
   const response=await fetch('/api/submissions',{method:'POST',signal:token.controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({problem_id:p.id,code:drafts[p.id]??p.starter,mode})});
   if(!response.ok)throw Error('Execution failed. Try again while your timer is running.');
   const data=await response.json();
   if(current.current.activeId!==token.id||current.current.deadline!==token.deadline)return;
   if(!canRun(current.current)){send({type:'expire'});return;}
   setResult(data);
   if(mode==='submit')send({type:'submit',problemId:token.id,accepted:data.accepted});
  }catch(e){if(e.name!=='AbortError')setError(e.message);}finally{
   if(request.current===token){request.current=null;setBusy(false);}
  }
 }
 const running=canRun(course,now),seconds=course?.status==='running'?remaining(course.deadline,now):course?.status==='solved'?(course.finishedSeconds??0):(p?.minutes||20)*60;
 function advance(){setResult(null);setError('');send({type:'next'});setNow(Date.now());}
 const courseComplete=course?.status==='complete';
 return <><header><a className="brand" href="/">◈ <span>DSA<span className="accent">Arena</span></span></a><span className="tag">DAILY PYTHON DSA PRACTICE</span><span className="local">● Local workspace</span></header>
 <main><section className="intro"><div><span className="eyebrow">YOUR LEARNING PATH</span><h1>Build understanding. Earn your next chapter.</h1><p>One question. One timer. Five concepts mastered before you move on.</p></div></section>
 {course&&<ProgressDashboard course={course} chapters={chapters} problems={problems}/>}
 {saveError&&<div role="alert" className="error">Browser storage is unavailable. Keep this tab open; your timer and progress may not survive reload.</div>}
 {error&&<div role="alert" className="error">{error}</div>}
 {course?.notice&&<div role="status" className="course-notice">{course.notice}</div>}
 {courseComplete?<section className="completion"><span className="eyebrow">PATH COMPLETE</span><h2>Three chapters. Fifteen concepts. Well earned.</h2><p>You solved five questions in each chapter. Your chapter badges and activity history are saved in this browser.</p></section>:
 <div className="workspace"><aside><div className="section-label">CHAPTER PATH</div><div className="chapter-path">{chapters.map((c,i)=>{const count=(course?.earned[c.id]||[]).length;return <div key={c.id} className={i===course?.chapterIndex?'chapter-current':''}><span>{count===5?'✓':i>course?.chapterIndex?'🔒':i+1}</span><div><strong>{c.title}</strong><small>{count} / 5 solved · 10 in pool</small></div></div>;})}</div>
 <div className="section-label pool-label">CURRENT CHAPTER POOL</div><nav aria-label="Chapter question pool">{problems.filter(q=>q.chapter_id===chapter?.id).map((q,i)=>{const active=q.id===p?.id,solved=(course?.earned[chapter.id]||[]).includes(q.id);return <button key={q.id} className={'problem '+(active?'active':'')} disabled={!active} aria-current={active?'step':undefined}><span className="number">{solved?'✓':active?'→':'🔒'}</span><span><strong>{q.title}</strong><small>{q.difficulty} · {q.minutes} min{active?' · Current':''}</small></span></button>;})}</nav>
 <div className="aside-note">Five rounds, ten questions.<p>Solve one question from each concept pair. A timeout swaps to the other question in that pair. Question navigation stays locked.</p></div></aside>
 <article>{p&&chapter?<><div className="problem-head"><span className="pill">{p.difficulty} · {p.minutes} min</span><span>Concept {course.roundIndex+1} / 5</span></div><div className="chapter-lesson-link"><ChapterLesson chapter={chapter}/></div><h2 className="question-title">{p.title}</h2><p className="concept-label">{chapter.concepts[course.roundIndex].title}</p><p className="description">{p.description}</p>
 <h3>Constraints & approach</h3><ul className="guidance">{p.constraints.map(t=><li key={t}>{t}</li>)}</ul><h3>Examples</h3><div className="examples">{p.examples.map((c,i)=><div key={i}><small>EXAMPLE {i+1}</small><pre>Input: {JSON.stringify(c.args)}{'\n'}Output: {JSON.stringify(c.expected)}</pre></div>)}</div>
 <section className="hints"><h3>Need a nudge?</h3><p>Reveal a little at a time. Hints don’t reduce your score.</p>{p.hints.slice(0,course.hints).map((hint,i)=><div className="hint" key={hint}><small>HINT {i+1}</small><p>{hint}</p></div>)}<button disabled={course.hints>=p.hints.length||course.status==='solved'} onClick={()=>send({type:'hint'})}>{course.hints>=p.hints.length?'All hints revealed':`Reveal hint ${course.hints+1} of ${p.hints.length}`}</button></section>
 <div className="contract"><strong>Your function: <code>{p.function_name}</code></strong><p>{p.result_mode==='mutated_first_arg'?'Modify the original list; the runner ignores the return value.':'Return your answer; arguments follow the order in the examples.'} {p.test_count} cases check your submission.</p><strong>Before submitting, explain</strong><ul>{p.prompts.map(t=><li key={t}>{t}</li>)}</ul><p>Tests check output behavior. Complexity and method restrictions are self-review requirements.</p></div></>:<p>Loading your learning path…</p>}</article>
 <section className="coding"><div className="timer"><div><small>THIS QUESTION ONLY · {p?.minutes||'—'} MIN LIMIT</small><strong role="timer" aria-label="Time remaining">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</strong></div>{course?.status==='ready'?<button className="primary" disabled={!p} onClick={()=>{setNow(Date.now());send({type:'start'});}}>Start question</button>:<span className="timer-state">{course?.status==='solved'?'✓ Completed':'● Timer running'}</span>}</div>
 <p className="execution-hint" role="status">{course?.status==='solved'?'Solved in time. Continue to your next concept.':running?'Testing is unlocked. The timer continues while you read, edit, or reload.':'Start this question’s timer to run examples or submit. You cannot skip it.'}</p>
 {course?.status==='solved'&&<div className="next-question"><button className="primary" onClick={advance}>{course.roundIndex<4?'Next concept →':course.chapterIndex<chapters.length-1?`Unlock ${chapters[course.chapterIndex+1].title} →`:'Finish learning path →'}</button><p>{(course.earned[chapter.id]||[]).length} / 5 successful questions in this chapter</p></div>}
 <div className="editor-head"><span>solution.py</span><span>Python 3</span></div>{p&&<CodeMirror key={p.id} aria-label="Python code editor" value={drafts[p.id]??p.starter} height="330px" theme="dark" extensions={[python()]} editable={!busy&&course.status!=='solved'} onChange={value=>setDrafts(prev=>({...prev,[p.id]:value}))}/>}
 <div className="actions"><span>{p?.result_mode==='mutated_first_arg'?'Modify the original list':'Return a value'}</span><button disabled={busy||!running} onClick={()=>run('run')}>▷ Run examples</button><button className="primary" disabled={busy||!running} onClick={()=>run('submit')}>{busy?'Testing…':'Submit solution →'}</button></div>
 <div className="results" aria-live="polite"><div className="section-label">TEST RESULTS</div>{!result?<p>{busy?'Running your solution…':'Examples are practice. Only an accepted full submission completes a question.'}</p>:<><h3 className={result.accepted?'success':'failure'}>{result.accepted?(result.mode==='submit'?'Accepted — concept mastered!':'Examples passed — submit to complete this question.'):'Keep going — some cases failed'}</h3>{result.results.map(r=><details key={r.case}><summary>{r.passed?'✓':'✕'} Case {r.case} {!r.args?'· Hidden':''}<span>{r.elapsed_ms} ms</span></summary>{r.args&&<pre>Input: {JSON.stringify(r.args)}{'\n'}Expected: {JSON.stringify(r.expected)}{'\n'}Actual: {JSON.stringify(r.actual)}</pre>}{r.error&&<pre>{r.error}</pre>}</details>)}</>}</div>
 </section></div>}<footer>DSA ARENA <span>Understand the concept. Earn the next step.</span></footer></main></>;
}
