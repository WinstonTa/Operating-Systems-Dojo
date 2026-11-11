# Linux C examples

These seven original examples are mapped one-to-one to the approved Operating Systems Dojo chapters. Run **only on a Linux system** with a C compiler and permission to use System V/POSIX IPC. They are real programs, not what the browser visualizes.

From the repository root:

```sh
mkdir -p /tmp/os-dojo-build
for example in examples/*.c; do
  cc -std=c11 -Wall -Wextra -pthread "$example" -o "/tmp/os-dojo-build/$(basename "$example" .c)"
done
/tmp/os-dojo-build/fork_wait
/tmp/os-dojo-build/exit_vs__exit
/tmp/os-dojo-build/exec_demo
/tmp/os-dojo-build/sysv_sem
/tmp/os-dojo-build/sysv_shm
/tmp/os-dojo-build/posix_sem
/tmp/os-dojo-build/posix_shm
```

Expected observations: distinct PIDs after fork; a waitable exit status; exec preserves the child PID; blocked semaphore acquisition proceeds after posting; shared memory becomes visible following synchronization; POSIX shared memory mappings survive unlink. Output interleaving varies with scheduling.

Cleanup: demos use IPC_PRIVATE or unique names, remove normal IPC objects, and wait for children. If force-killed, a System V object may persist; investigate with `ipcs` and remove **only objects you own** using `ipcrm`. Never run untrusted C code directly on a shared machine.
