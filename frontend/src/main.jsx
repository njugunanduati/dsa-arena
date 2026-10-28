import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import CodeMirror from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';
import {read, write, remaining, record} from './storage';
import './style.css';

function App() {
  const [problems,setProblems]=useState([]), [selected,setSelected]=useState('move-zeroes');
  const [drafts,setDrafts]=useState(()=>read('arena.drafts',{}));
  const [progress,setProgress]=useState(()=>read('arena.progress',{}));
  const [filter,setFilter]=useState(''), [error,setError]=useState(''), [busy,setBusy]=useState(false), [result,setResult]=useState(null);
  const [minutes,setMinutes]=useState(30), [deadline,setDeadline]=useState(null), [seconds,setSeconds]=useState(1800);
  const [saveError,setSaveError]=useState(false);
  const locked=useRef(false);
  const p=problems.find(p=>p.id===selected);
  useEffect(()=>{fetch('/api/problems').then(r=>{if(!r.ok) throw Error('Unable to load problems');return r.json()}).then(setProblems).catch(e=>setError(e.message+'. Check that the API is running.'));},[]);
  useEffect(()=>{setSaveError(!write('arena.drafts',drafts) || !write('arena.progress',progress));},[drafts,progress]);
  useEffect(()=>{if(!deadline)return; const tick=()=>{const left=remaining(deadline);setSeconds(left);if(left===0)setDeadline(null);}; tick(); const id=setInterval(tick,250);return()=>clearInterval(id);},[deadline]);
  function choose(id){setSelected(id);setResult(null);setError('');if(!deadline){const duration=problems.find(item=>item.id===id)?.minutes||30;setMinutes(duration);setSeconds(duration*60);}}
  async function run(mode){
    if(locked.current || !p)return;
    locked.current=true;setBusy(true);setError('');setResult(null);
    try {const response=await fetch('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({problem_id:p.id,code:drafts[p.id]??p.starter,mode})});
      if(!response.ok)throw Error('Execution failed. Please retry.');
      const data=await response.json();setResult(data);
      if(mode==='submit')setProgress(prev=>record(prev,p.id,data.accepted));
    } catch(e){setError(e.message);}finally{setBusy(false);locked.current=false;}
  }
  const solved=problems.filter(p=>progress[p.id]?.solved).length;
  return <><header><a className="brand" href="/">◈ <span>DSA<span className="accent">Arena</span></span></a><span className="tag">DAILY PYTHON DSA PRACTICE</span><span className="local">● Local workspace</span></header>
    <main><section className="intro"><div><span className="eyebrow">THE DAILY REP</span><h1>Think clearly. Code confidently.</h1><p>One problem at a time. Build your interview instinct.</p></div><div className="score"><strong>{solved}<small> / {problems.length}</small></strong><span>problems solved</span><progress value={solved} max={problems.length||1}/></div></section>
    {saveError&&<div role="alert">Browser storage is unavailable. Drafts and progress may be lost on reload.</div>}
    {error&&<div className="error" role="alert">{error}</div>}
    <div className="workspace"><aside><div className="section-label">PROBLEM LIBRARY <span>{problems.length}</span></div><input aria-label="Search problems" placeholder="Search problems or topics…" value={filter} onChange={e=>setFilter(e.target.value)}/><nav>{problems.filter(p=>(p.title+p.topic).toLowerCase().includes(filter.toLowerCase())).map((item,i)=><button disabled={busy} key={item.id} className={'problem '+(selected===item.id?'active':'')} onClick={()=>choose(item.id)}><span className="number">{progress[item.id]?.solved?'✓':String(i+1).padStart(2,'0')}</span><span><strong>{item.title}</strong><small>{item.topic} · {item.difficulty}</small></span></button>)}</nav><div className="aside-note">Small steps, real progress.<p>Your drafts and submissions stay in this browser.</p></div></aside>
    <article>{p ? <><div className="problem-head"><span className="pill">{p.difficulty}</span><span>{p.day} · {p.topic}</span><span className="attempts">{progress[p.id]?.attempts||0} submissions</span></div><h2>{p.title}</h2><p className="description">{p.description}</p><h3>Constraints & approach</h3><ul className="guidance">{p.constraints.map(text=><li key={text}>{text}</li>)}</ul><h3>Examples</h3><div className="examples">{p.examples.map((c,i)=><div key={i}><small>EXAMPLE {i+1}</small><pre>Input: {JSON.stringify(c.args)}{'\n'}Output: {JSON.stringify(c.expected)}</pre></div>)}</div><div className="contract"><strong>Your task</strong><p>Implement <code>{p.function_name}</code>. {p.result_mode==='mutated_first_arg'?'Arena checks the original list after your function runs; returning a new list alone will fail.':'Arguments are passed in the order shown above; return your answer.'} {p.test_count} test cases check your submission.</p><strong>Before submitting, explain</strong><ul>{p.prompts.map(text=><li key={text}>{text}</li>)}</ul><p>These are self-review prompts. Automated tests check behavior; they do not prove complexity or enforce the approach restrictions.</p></div></>:<p>{error?'Start the backend and reload to connect.':'Loading your next challenge…'}</p>}</article>
    <section className="coding"><div className="timer"><div><small>INTERVIEW TIMER</small><strong role="timer" aria-label="Time remaining">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</strong></div><select aria-label="Session duration" disabled={!!deadline} value={minutes} onChange={e=>{setMinutes(+e.target.value);setSeconds(+e.target.value*60);}}>{[15,25,30,45,60].map(m=><option key={m} value={m}>{m} min</option>)}</select><button onClick={()=>deadline?setDeadline(null):setDeadline(Date.now()+seconds*1000)} disabled={seconds===0}>{deadline?'Pause':'Start'}</button><button aria-label="Reset timer" onClick={()=>{setDeadline(null);setSeconds(minutes*60);}}>↻</button></div>{seconds===0&&<p role="status">Time’s up! You can keep practicing or reset the timer.</p>}
    <div className="editor-head"><span>solution.py</span><span>Python 3</span><button disabled={busy||!p} onClick={()=>{if(window.confirm('Reset this draft to starter code?'))setDrafts({...drafts,[p.id]:p.starter});}}>Reset code</button></div>
    {p&&<CodeMirror aria-label="Python code editor" value={drafts[p.id]??p.starter} height="330px" theme="dark" extensions={[python()]} editable={!busy} onChange={value=>setDrafts(prev=>({...prev,[p.id]:value}))}/>}
    <div className="actions"><span>{p?.result_mode==='mutated_first_arg'?'Modify nums in place':'Return values · no input() needed'}</span><button disabled={busy||!p} onClick={()=>run('run')}>▷ Run examples</button><button className="primary" disabled={busy||!p} onClick={()=>run('submit')}>{busy?'Testing…':'Submit solution →'}</button></div>
    <div className="results" aria-live="polite"><div className="section-label">TEST RESULTS</div>{!result?<p>{busy?'Running your solution…':'Run the examples to check your approach. Submit to test every case.'}</p>:<><h3 className={result.accepted?'success':'failure'}>{result.accepted?(result.mode==='submit'?'Accepted — well played!':'Examples passed — ready to submit?'):'Keep going — some cases failed'}</h3>{result.results.map(r=><details key={r.case}><summary>{r.passed?'✓':'✕'} Case {r.case} {!r.args?'· Hidden':''}<span>{r.elapsed_ms} ms</span></summary>{r.args&&<pre>Input: {JSON.stringify(r.args)}{'\n'}Expected: {JSON.stringify(r.expected)}{'\n'}Actual: {JSON.stringify(r.actual)}</pre>}{r.error&&<pre>{r.error}</pre>}</details>)}</>}</div></section></div><footer>DSA ARENA <span>Practice with purpose.</span></footer></main></>;
}
createRoot(document.getElementById('root')).render(<App/>);
