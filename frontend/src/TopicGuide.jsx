import React, {useEffect, useRef} from 'react';

const guides = {
  'move-zeroes': {
    title: 'Arrays & in-place changes',
    description: 'An array is an ordered sequence. Each value has a position, called an index, starting at 0. In Python, we use a list for these exercises.',
    takeaway: 'In-place means changing that same list instead of building a replacement. You can use a few temporary variables while keeping extra space constant: O(1).',
    before: ['4', '0', '7'], after: ['4', '7', '0'],
    caption: 'The same list, rearranged. Nonzero values keep their order.',
    note: 'Assigning nums = another_list only changes the local name. Update the original list’s elements to change what the caller sees.',
  },
  'nearby-duplicate': {
    title: 'Hash maps & sets',
    description: 'A dictionary (hash map) connects a key to a value. A set remembers unique values. Both support average O(1) lookup, so you can avoid scanning everything you have already seen.',
    takeaway: 'These structures trade extra memory for fast lookups. A dictionary can remember a value’s position; a set can track membership.',
    before: ['key', '→', 'value'], after: ['7', '→', 'index 2'],
    caption: 'A dictionary entry can associate a number with a position.',
    note: 'Think about what you need to remember, and when that information should be updated.',
  },
  'first-unique-char': {
    title: 'Strings & frequency maps',
    description: 'A string is an ordered sequence of characters. Unlike lists, Python strings are immutable: you cannot replace a character at an index.',
    takeaway: 'A frequency map is a dictionary that stores how often each character occurs. Counting is different from remembering only whether you have seen a character.',
    before: ['a', 'b', 'a'], after: ['a: 2', 'b: 1', ''],
    caption: '“aba” contains two a characters and one b character.',
    note: 'String order and dictionary counts give you different information. Consider which information the question needs.',
  },
};

function Example({guide}) {
  return <figure className="topic-example"><svg viewBox="0 0 390 205" role="img" aria-label={guide.caption}>
    <text x="20" y="24" className="diagram-label">{guide.title.startsWith('Arrays')?'BEFORE':'EXAMPLE'}</text>
    {guide.before.map((value,i)=><g key={i}><rect x={20+i*122} y="38" width="106" height="48" rx="8"/><text x={73+i*122} y="68" textAnchor="middle">{value}</text></g>)}
    <path d="M195 98 v25 m-6 -6 6 6 6 -6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <text x="20" y="145" className="diagram-label">{guide.title.startsWith('Arrays')?'AFTER · SAME LIST':'DICTIONARY'}</text>
    {guide.after.map((value,i)=>value&&<g key={i}><rect x={20+i*122} y="155" width="106" height="40" rx="8" className="diagram-result"/><text x={73+i*122} y="181" textAnchor="middle">{value}</text></g>)}
  </svg><figcaption>{guide.caption}</figcaption></figure>;
}

export default function TopicGuide({problem}) {
  const dialog=useRef(null);
  const guide=guides[problem.id];
  useEffect(()=>{dialog.current?.close();},[problem.id]);
  if(!guide)return <span>{problem.day} · {problem.topic}</span>;
  return <><button className="topic-trigger" onClick={()=>dialog.current.showModal()} aria-haspopup="dialog" aria-label={`Learn about ${problem.topic}`}>{problem.day} · {problem.topic} <span aria-hidden="true">ⓘ</span></button>
    <dialog ref={dialog} className="topic-dialog" aria-labelledby="topic-title" aria-describedby="topic-description" onClick={e=>{if(e.target===dialog.current){const box=dialog.current.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.current.close();}}}>
      <div className="topic-dialog-heading"><span className="eyebrow">QUICK CONCEPT</span><button autoFocus aria-label="Close topic explanation" onClick={()=>dialog.current.close()}>×</button></div>
      <h2 id="topic-title">{guide.title}</h2><p id="topic-description">{guide.description}</p><p>{guide.takeaway}</p>
      <Example guide={guide}/><p className="topic-note">{guide.note}</p>
      <button className="primary" onClick={()=>dialog.current.close()}>Got it — back to practice</button>
    </dialog></>;
}
