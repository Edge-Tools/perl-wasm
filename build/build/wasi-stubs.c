#include <errno.h>

unsigned getuid(void)  { return 0; }
unsigned geteuid(void) { return 0; }
unsigned getgid(void)  { return 0; }
unsigned getegid(void) { return 0; }
int setuid(unsigned u) { (void)u; return 0; }
int setgid(unsigned g) { (void)g; return 0; }
unsigned umask(unsigned m) { (void)m; return 0; }

int  dup(int fd)            { (void)fd; errno = ENOSYS; return -1; }
int  pipe(int *fds)         { (void)fds; errno = ENOSYS; return -1; }
int  kill(int pid, int sig) { (void)pid; (void)sig; errno = ENOSYS; return -1; }
int  pause(void)            { errno = ENOSYS; return -1; }
int  wait(int *status)      { (void)status; errno = ENOSYS; return -1; }
int  execl(const char *path, ...)               { (void)path; errno = ENOSYS; return -1; }
int  execv(const char *path, char *const a[])    { (void)path; (void)a; errno = ENOSYS; return -1; }
int  execvp(const char *file, char *const a[])   { (void)file; (void)a; errno = ENOSYS; return -1; }

int   mknod(const char *p, unsigned mode, unsigned dev) { (void)p; (void)mode; (void)dev; errno = ENOSYS; return -1; }
char *ttyname(int fd) { (void)fd; errno = ENOSYS; return 0; }
void  tzset(void)     { }

int do_aspawn(void *really, void **mark, void **sp) { (void)really; (void)mark; (void)sp; return -1; }
int do_spawn(char *cmd) { (void)cmd; return -1; }
int PerlProc_pipe_cloexec(int *pipefd) { (void)pipefd; errno = ENOSYS; return -1; }
