// Deterministic teaching model. This is not Linux kernel execution.
export function createScenario(id) {
  return {id, step:0, pid:3100, childPid:null, image:'program-a', parent:'running', child:'not-created', returnParent:null, returnChild:null, status:null, semaphore:0, blocked:false, shared:false, sharedValue:0, readerValue:null, initialized:false, size:0, mapped:false, nameExists:false, log:['Scenario reset. Select an action to observe the state.']}
}
export const availableActions={
  'process-creation':[['fork','fork()'],['schedule-parent','Schedule parent'],['schedule-child','Schedule child']],
  'process-termination':[['fork','fork()'],['exit','Child exit(7)'],['wait','Parent wait()']],
  'program-execution':[['exec','execve(program-b)'],['reset-image','Load program A']],
  'sysv-semaphores':[['wait-sem','semop(-1)'],['post-sem','semop(+1)'],['reset-sem','Reset semaphore']],
  'sysv-shared-memory':[['attach','shmat() attach'],['write','Writer sets value +1'],['read','Reader observes'],['detach','shmdt() detach']],
  'posix-semaphores':[['wait-sem','sem_wait()'],['post-sem','sem_post()'],['reset-sem','Reset semaphore']],
  'posix-shared-memory':[['open','shm_open()'],['size','ftruncate(4096)'],['map','mmap()'],['write','Write +1'],['unlink','shm_unlink()']]
}
export function transition(state, action) {
  const s={...state,log:[...state.log],step:state.step+1}
  let note
  switch(action) {
    case 'fork':
      if(s.childPid!==null){note='A child already exists in this scenario.';break}
      s.childPid=3101;s.child='running';s.returnParent=3101;s.returnChild=0
      note='fork() created child PID 3101. Parent sees 3101; child sees 0. Scheduling remains unspecified.';break
    case 'schedule-parent':note=s.childPid===null?'First create a child.':'Parent resumed; no ordering guarantee relative to child.';break
    case 'schedule-child':note=s.childPid===null?'First create a child.':'Child resumed; scheduler order is not guaranteed.';break
    case 'exit':
      if(s.childPid===null){note='Create a child before terminating it.';break}
      s.child='zombie';s.status=7;note='Child exited with status 7; the parent has not reaped its waitable child yet.';break
    case 'wait':
      if(s.child!=='zombie'){note='No terminated child to reap; a real wait may block.';break}
      s.child='reaped';note='Parent wait() obtained child exit status 7 and reaped it.';break
    case 'exec':s.image='program-b';note='execve() replaced the process image; PID 3100 did not change.';break
    case 'reset-image':s.image='program-a';note='For visualization, restored the original program image.';break
    case 'wait-sem':
      if(s.semaphore>0){s.semaphore--;s.blocked=false;note='Decrement succeeded atomically; semaphore decreased by one.'}
      else{s.blocked=true;note='Semaphore is zero. The simulated consumer blocks; count cannot go negative.'}
      break
    case 'post-sem':
      if(s.blocked){s.blocked=false;note='Producer posted +1; a waiting consumer immediately acquired the token. Count stays 0.'}
      else{s.semaphore++;note='Posted +1. Semaphore count increased.'}
      break
    case 'reset-sem':s.semaphore=0;s.blocked=false;note='Semaphore initialized to 0; blocked queue cleared.';break
    case 'attach':s.shared=true;note='Writer and reader attached to the same shared bytes; mappings may use different virtual addresses.';break
    case 'detach':s.shared=false;note='Simulated processes detached their shared mappings.';break
    case 'read':
      if(!s.shared){note='Attach the shared segment before reading.';break}
      s.readerValue=s.sharedValue;note='Reader observed shared value '+s.readerValue+'. This demo assumes properly synchronized access.';break
    case 'open':s.nameExists=true;note='Created/opened a named POSIX shared memory object. Initial size: 0 bytes.';break
    case 'size':if(!s.nameExists){note='Call shm_open() first.';break}s.size=4096;note='ftruncate() set backing size to 4096 bytes.';break
    case 'map':if(!s.nameExists||!s.size){note='Open and size the object before mapping.';break}s.mapped=true;note='Mapped 4096 bytes with MAP_SHARED.';break
    case 'unlink':s.nameExists=false;note='Removed the name; an existing mapping remains valid until munmap().' ;break
    case 'write':
      if(s.id==='posix-shared-memory'?!s.mapped:!s.shared){note='Create and map/attach shared memory first.';break}
      s.sharedValue++;note='Writer stored '+s.sharedValue+' in shared memory.';break
    default:throw Error('Unsupported action '+action)
  }
  s.log=[...s.log.slice(-7),note]
  return s
}
