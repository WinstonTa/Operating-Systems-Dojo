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
        printf("Child PID %ld is about to exec /bin/echo\n", (long)getpid());
        fflush(stdout);
        char *const argv[] = {"echo", "Program image replaced, PID unchanged", NULL};
        extern char **environ;
        execve("/bin/echo", argv, environ);
        /* Reached only on error. */
        perror("execve");
        _exit(127);
    }
    int status;
    if (waitpid(child, &status, 0) == -1) { perror("waitpid"); return EXIT_FAILURE; }
    if (WIFEXITED(status)) printf("Child exit code %d\n", WEXITSTATUS(status));
    return EXIT_SUCCESS;
}
