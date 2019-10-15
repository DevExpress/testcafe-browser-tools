//
//  testcafe-browser-tools.m
//  Dispatch browser manipulation commands
//

#include <fcntl.h>
#import <Cocoa/Cocoa.h>

typedef int command (int argc, const char * argv[]);

int bringToFront (int argc, const char * argv[]);
int closeWindow (int argc, const char * argv[]);
int findWindow (int argc, const char * argv[]);
int generateThumbnail (int argc, const char * argv[]);
int getWindowBounds (int argc, const char * argv[]);
int getWindowMaxBounds (int argc, const char * argv[]);
int getWindowSize (int argc, const char * argv[]);
int openWindow (int argc, const char * argv[]);
int resize (int argc, const char * argv[]);
int screenshot (int argc, const char * argv[]);
int setWindowBounds (int argc, const char * argv[]);

int main (int argc, const char * argv[]) {
    int fd = open(argv[1], O_WRONLY);

    if (fd != -1)
        dup2(fd, STDOUT_FILENO);

    @autoreleasepool {
        id commands = @{
            @"bring-to-front": [NSValue valueWithPointer: &bringToFront],
            @"close": [NSValue valueWithPointer: &closeWindow],
            @"find-window": [NSValue valueWithPointer: &findWindow],
            @"generate-thumbnail": [NSValue valueWithPointer: &generateThumbnail],
            @"get-window-bounds": [NSValue valueWithPointer: &getWindowBounds],
            @"get-window-max-bounds": [NSValue valueWithPointer: &getWindowMaxBounds],
            @"get-window-size": [NSValue valueWithPointer: &getWindowSize],
            @"open": [NSValue valueWithPointer: &openWindow],
            @"resize": [NSValue valueWithPointer: &resize],
            @"screenshot": [NSValue valueWithPointer: &screenshot],
            @"set-window-bounds": [NSValue valueWithPointer: &setWindowBounds],

        };

        id commandName = [NSString stringWithUTF8String:argv[2]];

        id item = commands[commandName];

        if (item == nil)
            return 1;

        command *commandPointer = (command *)[item pointerValue];

        int exitCode = (*commandPointer)(argc - 2, argv + 2);

        printf("\nExit code: %d\n", exitCode);

        if (fd != -1) {
            fsync(fd);
            close(fd);
        }
    }

    return 0;
}

