// Browser-local chapter state. A question owns its deadline until solved or timed out.
export function freshCourse(chapters, problems) {
  return {version:1, chapterIndex:0, roundIndex:0, activeId:pair(chapters,problems,0,0)[0]?.id,
    status:'ready', deadline:null, finishedSeconds:null, earned:{}, history:[], hints:0, notice:''};
}
function pair(chapters, problems, chapterIndex, roundIndex) {
  const chapter=chapters[chapterIndex], concept=chapter?.concepts[roundIndex];
  return problems.filter(p=>p.chapter_id===chapter?.id && p.concept_id===concept?.id);
}
export function restoreCourse(saved, chapters, problems) {
  const fresh=freshCourse(chapters,problems);
  if(saved?.version!==1 || !['ready','running','solved','complete'].includes(saved.status))return fresh;
  if(!Number.isInteger(saved.chapterIndex)||!Number.isInteger(saved.roundIndex))return fresh;
  const candidates=pair(chapters,problems,saved.chapterIndex,saved.roundIndex);
  if(!candidates.some(p=>p.id===saved.activeId))return fresh;
  if(!saved.earned || typeof saved.earned!=='object' || Array.isArray(saved.earned) ||
     !Array.isArray(saved.history) || !Number.isInteger(saved.hints) || saved.hints<0 || saved.hints>3)return fresh;
  for(let i=0;i<chapters.length;i++){
    const ids=saved.earned[chapters[i].id]||[];
    if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length)return fresh;
    for(let j=0;j<ids.length;j++)if(!pair(chapters,problems,i,j).some(p=>p.id===ids[j]))return fresh;
    if(i<saved.chapterIndex && ids.length!==5)return fresh;
    if(i>saved.chapterIndex && ids.length)return fresh;
  }
  const count=(saved.earned[chapters[saved.chapterIndex].id]||[]).length;
  if(count!==saved.roundIndex+(['solved','complete'].includes(saved.status)?1:0))return fresh;
  if(saved.status==='complete' && (saved.chapterIndex!==chapters.length-1 || count!==5))return fresh;
  if(saved.status==='running' && !Number.isFinite(saved.deadline))return fresh;
  return {...fresh,...saved,history:saved.history.filter(e=>e && Number.isFinite(e.at) && typeof e.problemId==='string').slice(-1000)};
}
function event(state, entry) {return [...state.history,entry].slice(-1000);}
export function transition(state, action, chapters, problems) {
  const now=action.now??Date.now();
  const p=problems.find(p=>p.id===state.activeId);
  const chapter=chapters[state.chapterIndex];
  if(!p||!chapter)return state;
  if(action.type==='expire'){
    if(state.status!=='running'||state.deadline>now)return state;
    const alternatives=pair(chapters,problems,state.chapterIndex,state.roundIndex);
    const next=alternatives.find(q=>q.id!==state.activeId);
    return {...state,status:'ready',activeId:next.id,deadline:null,finishedSeconds:null,hints:0,
      notice:`Time’s up on ${p.title}. Try again with a different question on ${chapter.concepts[state.roundIndex].title.toLowerCase()}. Start when you’re ready.`,
      history:event(state,{kind:'timeout',problemId:p.id,at:now})};
  }
  // Deadline is checked here as well as in the UI, including when a response arrives.
  if(state.status==='running' && state.deadline<=now)return transition(state,{type:'expire',now},chapters,problems);
  if(action.type==='start' && state.status==='ready')return {...state,status:'running',deadline:now+p.minutes*60000,notice:''};
  if(action.type==='hint' && ['ready','running'].includes(state.status))return {...state,hints:Math.min(3,state.hints+1)};
  if(action.type==='submit' && state.status==='running' && action.problemId===state.activeId){
    const history=event(state,{kind:'submission',problemId:p.id,at:now,accepted:!!action.accepted,difficulty:p.difficulty});
    if(!action.accepted)return {...state,history};
    const earned={...state.earned,[chapter.id]:[...(state.earned[chapter.id]||[]),p.id]};
    return {...state,earned,history,status:'solved',deadline:null,finishedSeconds:Math.max(0,Math.ceil((state.deadline-now)/1000)),notice:'Solved! Your next question is ready when you are.'};
  }
  if(action.type==='next' && state.status==='solved'){
    let chapterIndex=state.chapterIndex,roundIndex=state.roundIndex+1;
    if(roundIndex===5){chapterIndex++;roundIndex=0;}
    if(chapterIndex===chapters.length)return {...state,status:'complete',notice:'All chapters complete. You earned every chapter badge!'};
    return {...state,chapterIndex,roundIndex,activeId:pair(chapters,problems,chapterIndex,roundIndex)[0].id,
      status:'ready',deadline:null,finishedSeconds:null,hints:0,notice:''};
  }
  return state;
}
export function canRun(course, now=Date.now()) {return course?.status==='running' && course.deadline>now;}
export function dateKey(date) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function activityStats(history, now=new Date()) {
  const counts={};
  for(const e of history.filter(e=>e.kind==='submission')){const key=dateKey(new Date(e.at));counts[key]=(counts[key]||0)+1;}
  const days=[];
  for(let i=181;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);days.push({date:dateKey(d),count:counts[dateKey(d)]||0});}
  let best=0,run=0;
  for(const day of days){run=day.count?run+1:0;best=Math.max(best,run);}
  let current=0,index=days.length-1;if(!days[index].count)index--;
  while(index>=0&&days[index].count){current++;index--;}
  return {days,submissions:days.reduce((n,d)=>n+d.count,0),activeDays:days.filter(d=>d.count).length,best,current};
}
