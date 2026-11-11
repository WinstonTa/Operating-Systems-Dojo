#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
int main(void) {
    int id = shmget(IPC_PRIVATE, sizeof(int), IPC_CREAT | 0600);
    if (id == -1) { perror("shmget"); return EXIT_FAILURE; }
    int *shared = shmat(id, NULL, 0);
    if (shared == (void *)-1) { perror("shmat"); shmctl(id, IPC_RMID, NULL); return EXIT_FAILURE; }
    *shared = 41;
    pid_t child = fork();
    if (child == -1) { perror("fork"); shmdt(shared); shmctl(id, IPC_RMID, NULL); return EXIT_FAILURE; }
    if (child == 0) {
        *shared = 42;
        if (shmdt(shared) == -1) _exit(1);
        _exit(0);
    }
    int status;
    if (waitpid(child, &status, 0) == -1) { perror("waitpid"); shmdt(shared); shmctl(id, IPC_RMID, NULL); return EXIT_FAILURE; }
    /* waitpid provides the ordering for THIS example; unsynchronized shared writes race. */
    printf("Parent sees shared value %d after child exit\n", *shared);
    if (shmdt(shared) == -1) { perror("shmdt"); shmctl(id, IPC_RMID, NULL); return EXIT_FAILURE; }
    if (shmctl(id, IPC_RMID, NULL) == -1) { perror("shmctl"); return EXIT_FAILURE; }
    return WIFEXITED(status) && WEXITSTATUS(status) == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
