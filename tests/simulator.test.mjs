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
test('all nineteen scenarios expose working controls',()=>{for(const id of Object.keys(availableActions)){let s=createScenario(id);for(const [action] of availableActions[id]){s=transition(s,action)}assert.equal(s.step,availableActions[id].length)}})

test('base-bounds catches invalid address and translates valid address',()=>{const valid=step(createScenario('base-bounds'),'bb-valid');assert.equal(valid.model.Result,'Physical 1120');const bad=step(valid,'bb-invalid');assert.equal(bad.model.Result,'Protection fault')})
test('paging preserves offset and replaces VPN',()=>{const s=step(createScenario('paging'),'pg-b');assert.equal(s.model['VPN'],1);assert.equal(s.model['Offset'],5);assert.equal(s.model['Physical address'],117)})
test('TLB miss is not page fault and subsequent access hits',()=>{const s=step(createScenario('tlb'),'tlb-two','tlb-two');assert.equal(s.model.Hits,1);assert.equal(s.model.Misses,1)})
test('fragmentation prevents oversized contiguous allocation',()=>{const s=step(createScenario('free-space'),'free-allocate','free-allocate-again');assert.equal(s.model.Result,'Allocation failed');assert.equal(s.model['Free holes'],'8,8,4')})
test('FIFO and LRU choose different pages when A is reused',()=>{const s=step(createScenario('replacement'),'rep-use-a','rep-fifo','rep-lru');assert.equal(s.model['FIFO victim'],'A');assert.equal(s.model['LRU victim'],'B')})
test('page fault cannot load until a frame is freed',()=>{const initial=step(createScenario('swapping'),'swap-fault','swap-load');assert.equal(initial.model['Resident frames'],'A,B');const next=step(initial,'swap-evict','swap-load');assert.equal(next.model['Resident frames'],'C,B')})
test('dup shares offset across descriptors',()=>{const s=step(createScenario('files-directories'),'fd-open','fd-read','fd-dup','fd-read-dup');assert.equal(s.model['Last read'],'efgh');assert.equal(s.model['Shared file offset'],8)})
test('filesystem needs name before read',()=>{const s=step(createScenario('file-system-implementation'),'fs-inode','fs-block','fs-link','fs-read');assert.equal(s.model['Last read'],'Hello')})
test('FFS locality teaching model changes illustrative seek distance',()=>{const s=step(createScenario('fast-file-system'),'ffs-local');assert.equal(s.model['Illustrative seek distance'],8)})
