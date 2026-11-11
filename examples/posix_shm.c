#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
int main(void) {
    /* Per-process name avoids collision with concurrent demo users. */
    char name[80];
    int length = snprintf(name, sizeof(name), "/os_dojo_%ld", (long)getpid());
    if (length < 0 || (size_t)length >= sizeof(name)) return EXIT_FAILURE;
    int fd = shm_open(name, O_CREAT | O_EXCL | O_RDWR, 0600);
    if (fd == -1) { perror("shm_open"); return EXIT_FAILURE; }
    if (ftruncate(fd, 4096) == -1) { perror("ftruncate"); close(fd); shm_unlink(name); return EXIT_FAILURE; }
    int *data = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (data == MAP_FAILED) { perror("mmap"); close(fd); shm_unlink(name); return EXIT_FAILURE; }
    *data = 42;
    printf("Mapped shared object %s: %d\n", name, *data);
    if (shm_unlink(name) == -1) perror("shm_unlink");
    /* The mapping survives unlink until munmap. */
    printf("Value still mapped after unlink: %d\n", *data);
    if (munmap(data, 4096) == -1) perror("munmap");
    if (close(fd) == -1) { perror("close"); return EXIT_FAILURE; }
    (void)errno;
    return EXIT_SUCCESS;
}
