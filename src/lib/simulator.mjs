// Deterministic teaching model. This is not Linux kernel execution.
// Additional original, deterministic teaching models for virtual memory and file systems.
// Values are deliberately small so learners can calculate each state transition.
const advancedModels = {
  'address-spaces': {'Active process':'P1', 'Virtual address':'0x20', 'Physical address':'0x120', 'Isolation':'Per-process mappings'},
  'base-bounds': {'Base':1000, 'Bound':256, 'Virtual address':0, 'Result':'No translation yet'},
  'segmentation': {'Segment':'none', 'Offset':'—', 'Physical address':'—', 'Status':'Not translated'},
  'free-space': {'Free holes':'8,8,16', 'Allocated':0, 'Requested':'—', 'Result':'Ready'},
  'paging': {'Page size':16, 'Mapping':'VPN 0→3; VPN 1→7', 'VPN':'—', 'Offset':'—', 'Physical address':'—'},
  'tlb': {'Cached VPN':'none', 'Hits':0, 'Misses':0, 'Last access':'—'},
  'small-page-tables': {'Virtual pages':256, 'Mapped pages':0, 'Allocated leaf tables':0, 'Table regions':'none'},
  'swapping': {'Resident frames':'A,B', 'Pending fault':'none', 'Last event':'Ready'},
  'replacement': {'Loaded frames':'A,B,C', 'Recently used':'none', 'FIFO victim':'—', 'LRU victim':'—'},
  'files-directories': {'Open descriptors':'none', 'Shared file offset':0, 'Last read':'—', 'File bytes':'abcdefgh'},
  'file-system-implementation': {'Inode':'free', 'Data block':'free', 'Directory entry':'none', 'Last read':'—'},
  'fast-file-system': {'Placement':'scattered', 'Illustrative seek distance':72, 'Notes':'Classic rotational disk model'}
}
const advancedActions = {
  'address-spaces':[['vm-p1','Switch to P1'],['vm-p2','Switch to P2'],['vm-access','Translate 0x20']],
  'base-bounds':[['bb-valid','Translate VA 120'],['bb-invalid','Translate VA 300']],
  'segmentation':[['seg-code','Code: offset 20'],['seg-heap','Heap: offset 12'],['seg-invalid','Invalid code offset 80']],
  'free-space':[['free-allocate','Allocate 12'],['free-allocate-again','Allocate another 12'],['free-reset','Restore free holes']],
  'paging':[['pg-a','Translate VA 13'],['pg-b','Translate VA 21'],['pg-invalid','Translate unmapped VA 48']],
  'tlb':[['tlb-two','Access VPN 2'],['tlb-three','Access VPN 3'],['tlb-switch','Switch address space']],
  'small-page-tables':[['table-low','Map a page in region 0'],['table-high','Map a page in region 7'],['table-reset','Reset mappings']],
  'swapping':[['swap-fault','Access nonresident C'],['swap-evict','Evict A'],['swap-load','Load C']],
  'replacement':[['rep-use-a','Reference A'],['rep-fifo','Victim under FIFO'],['rep-lru','Victim under LRU']],
  'files-directories':[['fd-open','open() file'],['fd-read','read(fd 3, 4)'],['fd-dup','dup(3) → fd 4'],['fd-read-dup','read(fd 4, 4)']],
  'file-system-implementation':[['fs-inode','Allocate inode'],['fs-block','Allocate data block'],['fs-link','Add directory entry'],['fs-read','Read linked file']],
  'fast-file-system':[['ffs-local','Group related blocks'],['ffs-scattered','Scatter blocks']]
}
function applyAdvanced(s,action) {
  const m=s.model
  switch(s.id) {
    case 'address-spaces':
      if(action==='vm-p1') { m['Active process']='P1';m['Physical address']='0x120';return 'P1 selected: virtual address 0x20 belongs to its own mapping.' }
      if(action==='vm-p2') { m['Active process']='P2';m['Physical address']='0x520';return 'P2 selected: the same virtual address can refer to different physical memory.' }
      if(action==='vm-access') return m['Active process']+' VA 0x20 → PA '+m['Physical address']+'. Mappings are process-specific.'
      break
    case 'base-bounds':
      if(action==='bb-valid') {m['Virtual address']=120;m['Result']='Physical 1120';return '120 < 256, so 1000 + 120 = physical 1120.'}
      if(action==='bb-invalid') {m['Virtual address']=300;m['Result']='Protection fault';return '300 is outside [0,256). The MMU traps instead of adding the base.'}
      break
    case 'segmentation': {
      const map={'seg-code':['code',20,2020,true],'seg-heap':['heap',12,4012,true],'seg-invalid':['code',80,'—',false]}
      const spec=map[action]
      if(!spec)break
      m['Segment']=spec[0];m['Offset']=spec[1];m['Physical address']=spec[2];m['Status']=spec[3]?'Valid':'Bounds fault'
      return spec[3]?'Segment base plus in-range offset yields '+spec[2]+'.':'Code segment length is 64. Offset 80 is invalid.'
    }
    case 'free-space':
      if(action==='free-reset'){m['Free holes']='8,8,16';m['Allocated']=0;m['Result']='Reset';return 'Restored three nonadjacent free holes.'}
      if(action==='free-allocate'||action==='free-allocate-again'){
        m['Requested']=12
        const holes=String(m['Free holes']).split(',').map(Number)
        const idx=holes.findIndex(x=>x>=12)
        if(idx<0){m['Result']='Allocation failed';return 'No single contiguous hole can fit 12 bytes, even if total free bytes exceed 12.'}
        holes[idx]-=12;m['Free holes']=holes.join(',');m['Allocated']=Number(m['Allocated'])+12;m['Result']='Allocated 12'
        return 'First-fit chose the first fitting hole; splitting left '+holes[idx]+' bytes in that region.'
      }
      break
    case 'paging':{
      const lookup={'pg-a':13,'pg-b':21,'pg-invalid':48}
      if(!(action in lookup))break
      const va=lookup[action],vpn=Math.floor(va/16),offset=va%16,frames={0:3,1:7}
      m['VPN']=vpn;m['Offset']=offset
      if(!(vpn in frames)){m['Physical address']='Unmapped';return 'VPN '+vpn+' has no valid mapping; translation faults.'}
      m['Physical address']=frames[vpn]*16+offset
      return 'VA '+va+' = VPN '+vpn+' and offset '+offset+'; frame '+frames[vpn]+' yields PA '+m['Physical address']+'.'
    }
    case 'tlb':
      if(action==='tlb-switch'){m['Cached VPN']='none';m['Last access']='Address-space switch';return 'The model flushes TLB contents to avoid cross-process translation reuse.'}
      if(action==='tlb-two'||action==='tlb-three'){
        const vpn=action==='tlb-two'?'2':'3',hit=m['Cached VPN']===vpn
        m[hit?'Hits':'Misses']=Number(m[hit?'Hits':'Misses'])+1;m['Cached VPN']=vpn;m['Last access']='VPN '+vpn+' '+(hit?'hit':'miss')
        return hit?'Translation found in TLB: no page-table walk.':'Translation absent from TLB; a valid page-table lookup fills this model cache. Not a page fault.'
      }
      break
    case 'small-page-tables':
      if(action==='table-reset'){m['Mapped pages']=0;m['Allocated leaf tables']=0;m['Table regions']='none';return 'Removed example mappings and leaf table allocations.'}
      if(action==='table-low'||action==='table-high'){
        const region=action==='table-low'?'0':'7',existing=String(m['Table regions'])==='none'?[]:String(m['Table regions']).split(',')
        if(existing.includes(region))return 'Region '+region+' already has a mapped example page.'
        existing.push(region);m['Table regions']=existing.join(',');m['Mapped pages']=Number(m['Mapped pages'])+1;m['Allocated leaf tables']=existing.length
        return 'Allocated one leaf table for previously unused region '+region+'. A sparse address space need not allocate all leaf tables.'
      }
      break
    case 'swapping':
      if(action==='swap-fault'){m['Pending fault']='C';m['Last event']='Page fault';return 'Page C is valid but nonresident. There is no free frame; select a victim.'}
      if(action==='swap-evict'){
        if(m['Pending fault']!=='C')return 'Access nonresident page C first to create a pending fault.'
        m['Resident frames']='free,B';m['Last event']='Evicted A';return 'Victim A was evicted from its frame (dirty pages would need writeback).'
      }
      if(action==='swap-load'){
        if(m['Pending fault']!=='C'||m['Resident frames']!=='free,B')return 'First fault C and evict A to free a frame.'
        m['Resident frames']='C,B';m['Pending fault']='none';m['Last event']='Loaded C';return 'Loaded C from backing storage; faulting access can now retry.'
      }
      break
    case 'replacement':
      if(action==='rep-use-a'){m['Recently used']='A';return 'A becomes most recently used; FIFO insertion order remains A,B,C.'}
      if(action==='rep-fifo'){m['FIFO victim']='A';return 'FIFO chooses A: it was inserted earliest, even if referenced recently.'}
      if(action==='rep-lru'){m['LRU victim']=m['Recently used']==='A'?'B':'A';return 'LRU victim is '+m['LRU victim']+' based on recency (initially A is least recent; reusing A makes B oldest).'}
      break
    case 'files-directories':
      if(action==='fd-open'){m['Open descriptors']='3';m['Shared file offset']=0;m['Last read']='—';return 'open() created fd 3 with open-file offset 0.'}
      if(action==='fd-read'||action==='fd-read-dup'){
        const fd=action==='fd-read'?'3':'4'
        if(!String(m['Open descriptors']).split(',').includes(fd))return 'File descriptor '+fd+' is not open. Open or duplicate it first.'
        const old=Number(m['Shared file offset']);m['Last read']=String(m['File bytes']).slice(old,old+4)||'(EOF)';m['Shared file offset']=Math.min(8,old+4)
        return 'read(fd '+fd+') returned '+m['Last read']+'; both descriptors share the resulting offset '+m['Shared file offset']+'.'
      }
      if(action==='fd-dup'){if(m['Open descriptors']==='none')return 'Call open() first.';m['Open descriptors']='3,4';return 'dup(3) created fd 4 referring to the same open-file description and offset.'}
      break
    case 'file-system-implementation':
      if(action==='fs-inode'){m['Inode']='allocated #7';return 'Allocated inode 7 for an example file.'}
      if(action==='fs-block'){if(m['Inode']==='free')return 'Allocate the inode first.';m['Data block']='allocated #42';return 'The inode now points to data block 42.'}
      if(action==='fs-link'){if(m['Data block']==='free')return 'Allocate the data block first.';m['Directory entry']='notes.txt → inode 7';return 'Directory lookup can now resolve notes.txt to inode 7.'}
      if(action==='fs-read'){if(m['Directory entry']==='none')return 'Create the directory entry before the path can be opened.';m['Last read']='Hello';return 'Resolved notes.txt → inode 7 → block 42 and read its file bytes.'}
      break
    case 'fast-file-system':
      if(action==='ffs-local'){m['Placement']='same cylinder group';m['Illustrative seek distance']=8;return 'Related inode and data blocks grouped together, reducing illustrative rotating-disk seek distance.'}
      if(action==='ffs-scattered'){m['Placement']='scattered';m['Illustrative seek distance']=72;return 'Scattered physical placement increases illustrative mechanical seek distance.'}
      break
  }
  throw Error('Unsupported action '+action+' for '+s.id)
}

export function createScenario(id) {
  return {id, step:0, pid:3100, childPid:null, image:'program-a', parent:'running', child:'not-created', returnParent:null, returnChild:null, status:null, semaphore:0, blocked:false, shared:false, sharedValue:0, readerValue:null, initialized:false, size:0, mapped:false, nameExists:false, model:{...(advancedModels[id]||{})}, log:['Scenario reset. Select an action to observe the state.']}
}
export const availableActions={
  ...advancedActions,
  'process-creation':[['fork','fork()'],['schedule-parent','Schedule parent'],['schedule-child','Schedule child']],
  'process-termination':[['fork','fork()'],['exit','Child exit(7)'],['wait','Parent wait()']],
  'program-execution':[['exec','execve(program-b)'],['reset-image','Load program A']],
  'sysv-semaphores':[['wait-sem','semop(-1)'],['post-sem','semop(+1)'],['reset-sem','Reset semaphore']],
  'sysv-shared-memory':[['attach','shmat() attach'],['write','Writer sets value +1'],['read','Reader observes'],['detach','shmdt() detach']],
  'posix-semaphores':[['wait-sem','sem_wait()'],['post-sem','sem_post()'],['reset-sem','Reset semaphore']],
  'posix-shared-memory':[['open','shm_open()'],['size','ftruncate(4096)'],['map','mmap()'],['write','Write +1'],['unlink','shm_unlink()']]
}
export function transition(state, action) {
  const s={...state,model:{...state.model},log:[...state.log],step:state.step+1}
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
    default:note=applyAdvanced(s,action)
  }
  s.log=[...s.log.slice(-7),note]
  return s
}
