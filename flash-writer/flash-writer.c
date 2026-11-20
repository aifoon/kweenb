// Writes an image to the storage of a speaker and reads it back:
//   flash-writer /dev/rdiskN [progress file] < image
// prints "ok:<sha256 of what was read back>:<bytes>" when done.
// While it reads back it keeps "<bytes read back> <bytes in all>" in the
// progress file, when one is given, so the progress can be shown.
//
// macOS does not let a program open an external disk directly, not even
// with administrator rights ("Operation not permitted"). The way Apple
// provides is /usr/libexec/authopen, which opens the disk and hands the open
// file over; Raspberry Pi Imager does the same. This tool asks authopen for
// the disk, writes what comes in on its input in whole blocks, and reads the
// same number of bytes back to tell their checksum.
//
// Built by flash-writer/build.sh into resources/usbboot/flash-writer.
#include <CommonCrypto/CommonDigest.h>
#include <errno.h>
#include <fcntl.h>
#include <regex.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/uio.h>
#include <sys/wait.h>
#include <unistd.h>

#define BLOCK (4 * 1024 * 1024)
#define SECTOR 4096

static int fail(const char *what) {
  fprintf(stderr, "flash-writer: %s: %s\n", what, strerror(errno));
  return 1;
}

// ask authopen to open the disk for reading and writing, and take the open
// file it sends back
static int openThroughAuthopen(const char *device) {
  int pair[2];
  if (socketpair(AF_UNIX, SOCK_STREAM, 0, pair) != 0) return -1;
  pid_t child = fork();
  if (child < 0) return -1;
  if (child == 0) {
    close(pair[0]);
    dup2(pair[1], STDOUT_FILENO);
    char flags[16];
    snprintf(flags, sizeof(flags), "%d", O_RDWR);
    execl("/usr/libexec/authopen", "authopen", "-stdoutpipe", "-o", flags, device, (char *)NULL);
    _exit(127);
  }
  close(pair[1]);

  char data[64];
  char control[CMSG_SPACE(sizeof(int))];
  struct iovec iov = {data, sizeof(data)};
  struct msghdr message = {0};
  message.msg_iov = &iov;
  message.msg_iovlen = 1;
  message.msg_control = control;
  message.msg_controllen = sizeof(control);

  int fd = -1;
  ssize_t got = recvmsg(pair[0], &message, 0);
  if (got >= 0) {
    for (struct cmsghdr *c = CMSG_FIRSTHDR(&message); c; c = CMSG_NXTHDR(&message, c))
      if (c->cmsg_level == SOL_SOCKET && c->cmsg_type == SCM_RIGHTS) memcpy(&fd, CMSG_DATA(c), sizeof(fd));
  }
  close(pair[0]);
  int status = 0;
  waitpid(child, &status, 0);
  if (fd < 0) {
    errno = EPERM;
    fprintf(stderr, "flash-writer: authopen did not hand over %s (it ended with %d)\n", device,
            WIFEXITED(status) ? WEXITSTATUS(status) : -1);
  }
  return fd;
}

// read until the buffer is full or the input ends
static ssize_t readFull(int fd, unsigned char *buffer, size_t size) {
  size_t have = 0;
  while (have < size) {
    ssize_t got = read(fd, buffer + have, size - have);
    if (got < 0) {
      if (errno == EINTR) continue;
      return -1;
    }
    if (got == 0) break;
    have += (size_t)got;
  }
  return (ssize_t)have;
}

int main(int argc, char **argv) {
  if (argc != 2 && argc != 3) {
    fprintf(stderr, "usage: flash-writer /dev/rdiskN [progress file] < image\n");
    return 2;
  }
  // only ever a whole disk
  regex_t whole;
  regcomp(&whole, "^/dev/rdisk[0-9]+$", REG_EXTENDED | REG_NOSUB);
#ifdef FLASH_WRITER_TEST
  if (0) {
#else
  if (regexec(&whole, argv[1], 0, NULL, 0) != 0) {
#endif
    fprintf(stderr, "flash-writer: %s is not a whole disk\n", argv[1]);
    return 2;
  }

#ifdef FLASH_WRITER_TEST
  // tests write to an ordinary file
  int disk = open(argv[1], O_RDWR | O_CREAT, 0600);
#else
  int disk = openThroughAuthopen(argv[1]);
#endif
  if (disk < 0) return fail("opening the disk");

  unsigned char *buffer = NULL;
  if (posix_memalign((void **)&buffer, SECTOR, BLOCK) != 0) return fail("memory");

  // write what comes in, in whole blocks; the last one is filled up with
  // zeros to a whole sector
  unsigned long long total = 0;
  for (;;) {
    ssize_t have = readFull(STDIN_FILENO, buffer, BLOCK);
    if (have < 0) return fail("reading the image");
    if (have == 0) break;
    size_t whole_size = ((size_t)have + SECTOR - 1) / SECTOR * SECTOR;
    memset(buffer + have, 0, whole_size - (size_t)have);
    size_t done = 0;
    while (done < whole_size) {
      ssize_t wrote = write(disk, buffer + done, whole_size - done);
      if (wrote < 0) {
        if (errno == EINTR) continue;
        return fail("writing");
      }
      done += (size_t)wrote;
    }
    total += (unsigned long long)have;
    if ((size_t)have < BLOCK) break;
  }
  if (fsync(disk) != 0 && errno != ENOTTY && errno != EINVAL) return fail("finishing the write");

  // read the same bytes back
  if (lseek(disk, 0, SEEK_SET) != 0) return fail("going back to the start");
  CC_SHA256_CTX sha;
  CC_SHA256_Init(&sha);
  unsigned long long left = total;
  // how far reading back is, for whoever shows the progress (never a reason
  // to stop: without the file there is just no progress to show)
  int progress = argc == 3 ? open(argv[2], O_WRONLY | O_CREAT | O_TRUNC, 0600) : -1;
  while (left > 0) {
    size_t want = left > BLOCK ? BLOCK : (size_t)((left + SECTOR - 1) / SECTOR * SECTOR);
    ssize_t have = readFull(disk, buffer, want);
    if (have <= 0) return fail("reading back");
    size_t counts = (unsigned long long)have > left ? (size_t)left : (size_t)have;
    CC_SHA256_Update(&sha, buffer, (CC_LONG)counts);
    left -= counts;
    if (progress >= 0) {
      // a line of a fixed width, written over the one before
      char line[64];
      int length = snprintf(line, sizeof(line), "%20llu %20llu\n", total - left, total);
      if (pwrite(progress, line, (size_t)length, 0) < 0) {
        close(progress);
        progress = -1;
      }
    }
  }
  if (progress >= 0) close(progress);
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256_Final(digest, &sha);
  close(disk);

  printf("ok:");
  for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) printf("%02x", digest[i]);
  printf(":%llu\n", total);
  return 0;
}
