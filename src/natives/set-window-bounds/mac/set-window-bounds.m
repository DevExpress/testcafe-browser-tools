//
//  set-window-bounds.m
//  Set the bounds property of a window
//

#include "../../utils/mac/utils.h"

int setWindowBounds (int argc, const char * argv[]) {
    if (argc < 7) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        NSString *processId = [NSString stringWithUTF8String:argv[1]];
        NSString *windowId = [NSString stringWithUTF8String:argv[2]];
         
        NSRect bounds;

        sscanf(argv[3], "%lf", &bounds.origin.x);
        sscanf(argv[4], "%lf", &bounds.origin.y);
        sscanf(argv[5], "%lf", &bounds.size.width);
        sscanf(argv[6], "%lf", &bounds.size.height);

        NSValue *boxedBounds = [NSValue valueWithRect:bounds];
        
        [getWindowOfProcess(processId, windowId) setBounds: boxedBounds];
    }

    return 0;
}

