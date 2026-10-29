import {expect,it} from 'vitest';
import {freshCourse,restoreCourse,transition,canRun,activityStats} from './course';
const chapters=['arrays','maps','strings'].map(id=>({id,concepts:Array.from({length:5},(_,i)=>({id:`c${i}`,title:`Concept ${i}`}))}));
const problems=chapters.flatMap(ch=>ch.concepts.flatMap(c=>[0,1].map(i=>({id:`${ch.id}-${c.id}-${i}`,chapter_id:ch.id,concept_id:c.id,minutes:20,difficulty:'Easy'}))));
const step=(s,a)=>transition(s,a,chapters,problems);
const fresh=()=>freshCourse(chapters,problems);
function solve(s,now=1000){s=step(s,{type:'start',now});return step(s,{type:'submit',problemId:s.activeId,accepted:true,now:now+100});}
it('starts one fixed timer and cannot restart or skip it',()=>{
 let s=fresh();expect(canRun(s,0)).toBe(false);
 s=step(s,{type:'start',now:1000});expect(s.deadline).toBe(1201000);
 expect(step(s,{type:'start',now:5000})).toBe(s);
 expect(step(s,{type:'next',now:5000})).toBe(s);
 expect(canRun(s,5000)).toBe(true);
});
it('timeout replaces with the other question on the same concept and requires Start',()=>{
 let s=step(fresh(),{type:'start',now:0});
 s=step(s,{type:'expire',now:1200000});
 expect(s.activeId).toBe('arrays-c0-1');expect(s.status).toBe('ready');expect(s.roundIndex).toBe(0);expect(s.earned).toEqual({});expect(s.notice).toContain('Try again');
 s=step(s,{type:'start',now:1200001});s=step(s,{type:'expire',now:2400001});
 expect(s.activeId).toBe('arrays-c0-0');expect(s.history).toHaveLength(2);
});
it('late accepted responses do not award a solve',()=>{
 let s=step(fresh(),{type:'start',now:0});s=step(s,{type:'submit',accepted:true,problemId:s.activeId,now:1200000});
 expect(s.earned).toEqual({});expect(s.status).toBe('ready');expect(s.activeId).toBe('arrays-c0-1');
});
it('ignores a response from the replaced question',()=>{
 let s=step(fresh(),{type:'start',now:0});s=step(s,{type:'expire',now:1200000});s=step(s,{type:'start',now:1200001});
 const next=step(s,{type:'submit',problemId:'arrays-c0-0',accepted:true,now:1200100});expect(next).toBe(s);
});
it('failed submissions retain the deadline; hints are progressive and capped',()=>{
 let s=step(fresh(),{type:'start',now:0});
 s=step(s,{type:'submit',problemId:s.activeId,accepted:false,now:100});
 expect(s.deadline).toBe(1200000);expect(s.roundIndex).toBe(0);
 for(let i=0;i<5;i++)s=step(s,{type:'hint',now:200});expect(s.hints).toBe(3);
});
it('awards once, then advances only after explicit continue',()=>{
 let s=solve(fresh());expect(s.status).toBe('solved');expect(s.earned.arrays).toHaveLength(1);expect(s.roundIndex).toBe(0);expect(canRun(s)).toBe(false);
 const duplicate=step(s,{type:'submit',problemId:s.activeId,accepted:true,now:1200});expect(duplicate).toBe(s);
 s=step(s,{type:'next',now:1200});expect(s.activeId).toBe('arrays-c1-0');expect(s.status).toBe('ready');expect(s.deadline).toBe(null);expect(s.hints).toBe(0);
});
it('needs exactly five concept solves to unlock the next chapter',()=>{
 let s=fresh();
 for(let i=0;i<5;i++){expect(s.chapterIndex).toBe(0);s=solve(s,1000+i*1000);if(i<4)s=step(s,{type:'next',now:1900+i*1000});}
 expect(s.earned.arrays).toHaveLength(5);expect(s.chapterIndex).toBe(0);
 s=step(s,{type:'next',now:7000});expect(s.chapterIndex).toBe(1);expect(s.roundIndex).toBe(0);expect(s.activeId).toBe('maps-c0-0');
});
it('completes after fifteen solves; retries do not require solving both variants',()=>{
 let s=fresh();
 for(let i=0;i<15;i++){s=solve(s,1000+i*1000);s=step(s,{type:'next',now:1900+i*1000});}
 expect(s.status).toBe('complete');expect(Object.values(s.earned).flat()).toHaveLength(15);
});
it('reload preserves a running deadline and expires it on return',()=>{
 const s=step(fresh(),{type:'start',now:0});const restored=restoreCourse(JSON.parse(JSON.stringify(s)),chapters,problems);
 expect(restored.deadline).toBe(1200000);expect(canRun(restored,1199999)).toBe(true);
 expect(step(restored,{type:'expire',now:1200001}).activeId).toBe('arrays-c0-1');
});
it('recovers malformed state and rejects inconsistent unlocks',()=>{
 expect(restoreCourse({version:1,status:'running'},chapters,problems)).toEqual(fresh());
 const s={...fresh(),chapterIndex:1,activeId:'maps-c0-0'};expect(restoreCourse(s,chapters,problems)).toEqual(fresh());
});
it('counts real submissions and streaks without counting timeouts',()=>{
 const history=[{kind:'submission',at:new Date(2026,9,28,12).getTime()},{kind:'submission',at:new Date(2026,9,29,12).getTime()},{kind:'timeout',at:new Date(2026,9,29,12).getTime()}];
 const stats=activityStats(history,new Date(2026,9,29,13));expect(stats.submissions).toBe(2);expect(stats.activeDays).toBe(2);expect(stats.current).toBe(2);expect(stats.best).toBe(2);expect(stats.days).toHaveLength(182);
});
