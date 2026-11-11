#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

static void on_exit_handler(void) {
    puts("atexit handler ran in process using exit()");
}
int main(void) {
    /* Flush before forking so inherited output buffers cannot duplicate output. */
    puts("Parent: first flush any pending stdio before fork");
    fflush(NULL);
    if (atexit(on_exit_handler) != 0) { fputs("atexit failed\n", stderr); return EXIT_FAILURE; }
    pid_t child = fork();
    if (child == -1) { perror("fork"); return EXIT_FAILURE; }
    if (child == 0) {
        /* _exit avoids running inherited C library exit handlers in child. */
        _exit(7);
    }
    int status = 0;
    if (waitpid(child, &status, 0) == -1) { perror("waitpid"); return EXIT_FAILURE; }
    if (WIFEXITED(status)) printf("Parent reaped child status %d\n", WEXITSTATUS(status));
    return EXIT_SUCCESS;
}
