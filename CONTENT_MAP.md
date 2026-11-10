# Course coverage / provenance map

Source material is in TaskBoard `tasks_OperatingSystemsDojo` as extracted Markdown. All seven text files were readable through the GitHub connector. Some figures are only OCR-like picture-text captions, **not image assets**. References below use verifiable chapter/section headings, not invented slide numbers.

| Lesson | Source | Core learning | Lab / code |
| --- | --- | --- | --- |
| Process Creation | 24 - Process Creation.md, §§24.1–24.5 | fork creates a child, return values, copies vs shared open-file descriptions, scheduling | parent/child timeline + fork_wait.c |
| Process Termination | 25 - Process Termination.md, §§25.1–25.4 | exit/_exit, handlers, stdio buffering, wait status | termination tracer + exit_vs__exit.c |
| Program Execution | 27 - Program Execution.md, §§27.1–27.5 | exec replaces program, not PID; argv/envp; FD_CLOEXEC | exec replacement explorer + exec_demo.c |
| System V Semaphores | 47 - System V Semaphores.md, §§47.1–47.9 | semget, semctl, semop, atomic decrement and blocking | semaphore scheduler + sysv_sem.c |
| System V Shared Memory | 48 - System V Shared Memory.md, §§48.1–48.8 | shmget, shmat, detach, shared data visibility, synchronization | memory explorer + sysv_shm.c |
| POSIX Semaphores | 53 - POSIX Semaphores.md, §§53.1–53.5 | sem_open, sem_wait, sem_post; named vs unnamed | POSIX semaphore scheduler + posix_sem.c |
| POSIX Shared Memory | 54 - POSIX Shared Memory.md, §§54.1–54.5 | shm_open, ftruncate, mmap, munmap, shm_unlink | mapped-memory explorer + posix_shm.c |

All lesson copy and C examples are original teaching material based on public Linux/POSIX behavior and the approved reference chapter topics. Interactive diagrams are new representations, not copies of figures. Browser labs are *simulations*, not actual kernel calls. C examples require local Linux and suitable toolchain; System V/POSIX availability varies by environment.

Misconception checks: fork does not guarantee child-first scheduling; exec does not create a second process; exit and _exit have different userspace cleanup; semaphore decrement can block; shared memory does not itself provide synchronization; shm_unlink and IPC_RMID do not instantly invalidate existing mappings/attachments.
