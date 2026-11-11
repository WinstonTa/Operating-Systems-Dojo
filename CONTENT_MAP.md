# Operating Systems Dojo — content coverage

All nineteen source chapters in [TaskBoard/tasks_OperatingSystemsDojo](https://github.com/WinstonTa/TaskBoard/tree/main/tasks_OperatingSystemsDojo) are included. Content is original paraphrasing, **not** a republication of the Markdown sources. Some source figures were available only as extracted text and are not reproduced.

| Unit | Source | Lesson | Interactive mechanism |
|---|---|---|---|
| 13 | `vm-intro.md` | Address spaces | Switch active processes and observe that virtual address 0x20 maps to different physical regions. |
| 15 | `vm-mechanism.md` | Address translation | Try a valid address and an out-of-bounds address; inspect the translation result. |
| 16 | `vm-segmentation.md` | Segmentation | Select code, heap or invalid gaps and inspect segment-specific translations. |
| 17 | `vm-freespace.md` | Free-space management | Allocate from example free holes; compare a failed large request with leftover capacity. |
| 18 | `vm-paging.md` | Paging | Translate sample virtual addresses using a visible mapping table. |
| 19 | `vm-tlbs.md` | Translation lookaside buffers | Access repeated and new virtual pages to watch hit/miss counters. |
| 20 | `vm-smalltables.md` | Smaller page tables | Add mappings to two virtual regions; see how many leaf tables are needed. |
| 21 | `vm-beyondphys.md` | Beyond physical memory | Trigger a fault, evict a resident page and complete the load. |
| 22 | `vm-beyondphys-policy.md` | Page replacement policies | Mark A recently used and compare FIFO versus LRU eviction of A or B. |
| 24 | `24 - Process Creation.md` | Process creation | Press fork, then schedule parent or child. Observe separate memory and differing fork results. |
| 25 | `25 - Process Termination.md` | Process termination | Terminate the simulated child; use wait to observe parent reaping its status. |
| 27 | `27 - Program Execution.md` | Program execution | Switch the simulated process image from program A to B while keeping its PID. |
| 39 | `file-intro.md` | Files and directories | Open, read and duplicate a file descriptor, then inspect its shared cursor. |
| 40 | `file-implementation.md` | File-system implementation | Allocate an inode and a data block, link them through a directory and simulate a read. |
| 41 | `file-ffs.md` | Fast File System and locality | Compare an illustrative scattered block layout with a grouped locality layout. |
| 47 | `47 - System V Semaphores.md` | System V semaphores | Choose wait(-1) or post(+1), and inspect blocked process queues. |
| 48 | `48 - System V Shared Memory.md` | System V shared memory | Attach a writer and reader, update a shared counter and observe visibility. |
| 53 | `53 - POSIX Semaphores.md` | POSIX semaphores | Step through consumer waits and producer posts while tracking the count. |
| 54 | `54 - POSIX Shared Memory.md` | POSIX shared memory | Create, size, map, write, and unlink a simulated POSIX shared object. |

The original seven Linux-process and IPC chapters include corresponding runnable C examples. The twelve newly supplied chapters on virtual memory and file systems use deterministic visual experiments; their reference panes link to the source section. All questions are original practice, not publisher-provided assessment solutions.

All source headings listed in lesson `refs` were inventoried against the Markdown source. There is no claim of verified source figures. Browser models intentionally simplify real operating-system implementations and clearly disclose this.
