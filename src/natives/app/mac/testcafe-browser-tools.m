//
//  testcafe-browser-tools.m
//  Dispatch browser manipulation commands
//

#include <unistd.h>
#import <Cocoa/Cocoa.h>


int main (int argc, const char * argv[]) {
    execv(argv[1], argv + 1);

    return 0;
}

