import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import App from './App';
vi.mock('@uiw/react-codemirror',()=>({default:()=> <div>Python editor</div>}));
const chapters=['arrays','maps','strings'].map(id=>({id,title:{arrays:'Arrays & In-place',maps:'Hash Maps & Sets',strings:'Strings & Patterns'}[id],concepts:Array.from({length:5},(_,i)=>({id:`c${i}`,title:`Concept ${i+1}`}))}));
const problems=chapters.flatMap(ch=>ch.concepts.flatMap((c,index)=>[0,1].map(i=>({id:ch.id==='arrays'&&index===0?(i===0?'move-zeroes':'move-value'):`${ch.id}-${c.id}-${i}`,title:ch.id==='arrays'&&index===0?(i===0?'Move Zeroes':'Move a Value to the End'):`${ch.id} question ${index}-${i}`,chapter_id:ch.id,concept_id:c.id,minutes:20,difficulty:'Easy',starter:'def solve(nums): pass',function_name:'solve',description:'A practice problem.',constraints:[],prompts:[],hints:['Think about positions.','Try a pointer.','Check boundaries.'],examples:[],test_count:5,result_mode:'return'}))));
let host,root;
const button=text=>[...host.querySelectorAll('button')].find(b=>b.textContent.includes(text));
async function render(){host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<App/>));}
beforeEach(async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-29T12:00:00Z'));localStorage.clear();
 vi.stubGlobal('fetch',vi.fn(async url=>({ok:true,json:async()=>url==='/api/problems'?problems:url==='/api/chapters'?chapters:{mode:'submit',accepted:true,results:[]}})));
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 await render();
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals();});
it('locks all other questions and testing until the current timer starts',async()=>{
 expect(button('Run examples').disabled).toBe(true);expect(button('Submit solution').disabled).toBe(true);
 expect(button('Move a Value to the End').disabled).toBe(true);
 expect(button('arrays question 1-0').disabled).toBe(true);
 await act(async()=>button('Start question').click());
 expect(button('Run examples').disabled).toBe(false);
 expect(button('Move a Value to the End').disabled).toBe(true);
 expect(button('Pause')).toBeUndefined();expect(button('Reset timer')).toBeUndefined();
});
it('expires to the paired question, keeps progress locked, and requires a new Start',async()=>{
 await act(async()=>button('Start question').click());
 await act(async()=>vi.advanceTimersByTime(1200000));
 expect(host.querySelector('.question-title').textContent).toBe('Move a Value to the End');
 expect(host.textContent).toContain('Time’s up on Move Zeroes');
 expect(button('Run examples').disabled).toBe(true);
 expect(host.textContent).toContain('0 / 5 solved');
});
it('only an accepted full submission permits the next concept',async()=>{
 await act(async()=>button('Start question').click());
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({mode:'run',accepted:true,results:[]})});
 await act(async()=>button('Run examples').click());
 expect(button('Next concept')).toBeUndefined();
 await act(async()=>button('Submit solution').click());
 expect(host.textContent).toContain('Accepted — concept mastered!');
 expect(button('Submit solution').disabled).toBe(true);
 await act(async()=>button('Next concept').click());
 expect(host.querySelector('.question-title').textContent).toBe('arrays question 1-0');
 expect(button('Submit solution').disabled).toBe(true);
});
it('persists the exact deadline across a reload',async()=>{
 await act(async()=>button('Start question').click());
 await act(async()=>vi.advanceTimersByTime(10000));
 await act(async()=>root.unmount());host.remove();await render();
 expect(host.querySelector('[role="timer"]').textContent).toBe('19:50');
 expect(button('Start question')).toBeUndefined();
});
it('reveals hints incrementally and opens the methods lesson',async()=>{
 await act(async()=>button('Reveal hint 1').click());
 expect(host.textContent).toContain('Think about positions.');
 expect(host.textContent).not.toContain('Try a pointer.');
 await act(async()=>button('Learn: Arrays').click());
 const dialog=host.querySelector('dialog');expect(dialog.hasAttribute('open')).toBe(true);
 expect(dialog.textContent).toContain('append(x) / pop()');
 expect(dialog.querySelector('svg[role="img"]')).not.toBeNull();
 await act(async()=>dialog.querySelector('[aria-label="Close chapter lesson"]').click());expect(dialog.hasAttribute('open')).toBe(false);
});
it('discards an accepted response received after expiry',async()=>{
 let resolve;
 await act(async()=>button('Start question').click());
 fetch.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
 await act(async()=>button('Submit solution').click());
 await act(async()=>vi.advanceTimersByTime(1200000));
 await act(async()=>resolve({ok:true,json:async()=>({mode:'submit',accepted:true,results:[]})}));
 expect(host.querySelector('.question-title').textContent).toBe('Move a Value to the End');
 expect(button('Next concept')).toBeUndefined();expect(host.textContent).not.toContain('Accepted — concept mastered!');
});
it('unlocks the next chapter only after the fifth successful concept',async()=>{
 for(let i=0;i<5;i++){
  await act(async()=>button('Start question').click());
  await act(async()=>button('Submit solution').click());
  if(i<4){expect(button('Unlock Hash')).toBeUndefined();await act(async()=>button('Next concept').click());}
 }
 expect(button('Unlock Hash Maps & Sets')).toBeDefined();
 await act(async()=>button('Unlock Hash Maps & Sets').click());
 expect(host.querySelector('.question-title').textContent).toBe('maps question 0-0');
 expect(button('Start question')).toBeDefined();
});
