#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t child = fork();
    if (child == -1) { perror("fork"); return EXIT_FAILURE; }
    if (child == 0) {
        printf("Child PID %ld; fork returned 0 here\n", (long)getpid());
        fflush(stdout);
        _exit(7);
    }
    printf("Parent PID %ld; fork returned child PID %ld\n", (long)getpid(), (long)child);
    int status = 0;
    if (waitpid(child, &status, 0) == -1) { perror("waitpid"); return EXIT_FAILURE; }
    if (WIFEXITED(status)) printf("Child exit status: %d\n", WEXITSTATUS(status));
    /* Output order is NOT guaranteed; parent and child run concurrently. */
    return EXIT_SUCCESS;
}
