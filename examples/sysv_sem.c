#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/sem.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
/* Private set: demo avoids stale named keys and always removes set after wait. */
int main(void) {
    int id = semget(IPC_PRIVATE, 1, IPC_CREAT | 0600);
    if (id == -1) { perror("semget"); return EXIT_FAILURE; }
    if (semctl(id, 0, SETVAL, 0) == -1) { perror("semctl SETVAL"); semctl(id, 0, IPC_RMID); return EXIT_FAILURE; }
    pid_t child = fork();
    if (child == -1) { perror("fork"); semctl(id, 0, IPC_RMID); return EXIT_FAILURE; }
    struct sembuf op;
    if (child == 0) {
        op.sem_num = 0; op.sem_op = -1; op.sem_flg = 0;
        puts("Child waits on System V semaphore"); fflush(stdout);
        if (semop(id, &op, 1) == -1) { perror("child semop"); _exit(1); }
        puts("Child acquired semaphore"); fflush(stdout);
        _exit(0);
    }
    op.sem_num = 0; op.sem_op = 1; op.sem_flg = 0;
    puts("Parent posts a token"); fflush(stdout);
    if (semop(id, &op, 1) == -1) perror("parent semop");
    int status;
    if (waitpid(child, &status, 0) == -1) perror("waitpid");
    if (semctl(id, 0, IPC_RMID) == -1) { perror("semctl IPC_RMID"); return EXIT_FAILURE; }
    return WIFEXITED(status) && WEXITSTATUS(status) == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
