#define _POSIX_C_SOURCE 200809L
#include <semaphore.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
/* Unnamed process-shared semaphore lives in a shared anonymous mapping. */
int main(void) {
    sem_t *sem = mmap(NULL, sizeof(*sem), PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANONYMOUS, -1, 0);
    if (sem == MAP_FAILED) { perror("mmap"); return EXIT_FAILURE; }
    if (sem_init(sem, 1, 0) == -1) { perror("sem_init"); munmap(sem, sizeof(*sem)); return EXIT_FAILURE; }
    pid_t child = fork();
    if (child == -1) { perror("fork"); sem_destroy(sem); munmap(sem, sizeof(*sem)); return EXIT_FAILURE; }
    if (child == 0) {
        puts("Consumer waiting for producer"); fflush(stdout);
        if (sem_wait(sem) == -1) { perror("sem_wait"); _exit(1); }
        puts("Consumer acquired token"); fflush(stdout);
        _exit(0);
    }
    puts("Producer posting token"); fflush(stdout);
    if (sem_post(sem) == -1) perror("sem_post");
    int status;
    if (waitpid(child, &status, 0) == -1) perror("waitpid");
    if (sem_destroy(sem) == -1) perror("sem_destroy");
    if (munmap(sem, sizeof(*sem)) == -1) perror("munmap");
    return WIFEXITED(status) && WEXITSTATUS(status) == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
