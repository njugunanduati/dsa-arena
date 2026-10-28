import {beforeEach,expect,it} from 'vitest';
import {read,write,record,remaining} from './storage';
beforeEach(()=>localStorage.clear());
it('persists drafts across reads',()=>{write('drafts',{'two-sum':'def solve(): pass'});expect(read('drafts',{})).toEqual({'two-sum':'def solve(): pass'});});
it('recovers from malformed or unexpected storage',()=>{localStorage.setItem('drafts','bad');expect(read('drafts',{})).toEqual({});localStorage.setItem('drafts','[]');expect(read('drafts',{})).toEqual({});});
it('counts submissions and preserves a previous solve',()=>{let p=record({},'two-sum',false);expect(p['two-sum'].solved).toBe(false);p=record(p,'two-sum',true);p=record(p,'two-sum',false);expect(p['two-sum']).toMatchObject({attempts:3,solved:true});});
it('uses wall time and clamps countdown at zero',()=>{expect(remaining(60000,1000)).toBe(59);expect(remaining(60000,59999)).toBe(1);expect(remaining(60000,90000)).toBe(0);});
