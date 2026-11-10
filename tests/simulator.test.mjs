import test from 'node:test'
import assert from 'node:assert/strict'
import { createScenario,transition,availableActions } from '../src/lib/simulator.mjs'
const step=(s,...actions)=>actions.reduce(transition,s)
test('fork returns different values, distinct PID',()=>{const s=step(createScenario('process-creation'),'fork');assert.equal(s.childPid,3101);assert.equal(s.returnParent,3101);assert.equal(s.returnChild,0)})
test('exit makes waitable child, wait reaps',()=>{const z=step(createScenario('process-termination'),'fork','exit');assert.equal(z.child,'zombie');assert.equal(step(z,'wait').child,'reaped')})
test('exec retains PID',()=>{const s=step(createScenario('program-execution'),'exec');assert.equal(s.pid,3100);assert.equal(s.image,'program-b')})
test('decrement at zero blocks; post releases without negative values',()=>{const b=step(createScenario('sysv-semaphores'),'wait-sem');assert.equal(b.blocked,true);assert.equal(b.semaphore,0);const p=step(b,'post-sem');assert.equal(p.blocked,false);assert.equal(p.semaphore,0)})
test('post then wait decrements',()=>{const p=step(createScenario('posix-semaphores'),'post-sem','wait-sem');assert.equal(p.semaphore,0);assert.equal(p.blocked,false)})
test('reader sees shared writer value after attach',()=>{const s=step(createScenario('sysv-shared-memory'),'attach','write','read');assert.equal(s.readerValue,1)})
test('POSIX object requires size before map; unlink keeps mapping',()=>{const s=step(createScenario('posix-shared-memory'),'open','map');assert.equal(s.mapped,false);const next=step(s,'size','map','write','unlink');assert.equal(next.mapped,true);assert.equal(next.sharedValue,1);assert.equal(next.nameExists,false)})
test('all seven scenarios expose working controls',()=>{for(const id of Object.keys(availableActions)){let s=createScenario(id);for(const [action] of availableActions[id]){s=transition(s,action)}assert.equal(s.step,availableActions[id].length)}})
