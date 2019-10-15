//
//  get-window-bounds.m
//  Return the bounds property of a window
//

#include "../../utils/mac/utils.h"

int getWindowBounds (int argc, const char * argv[]) {
    if (argc < 3) {
        printf("Incorrect arguments\n");
        return 1;
    }
    
    @autoreleasepool {
        NSString *processId = [NSString stringWithUTF8String:argv[1]];
        NSString *windowId = [NSString stringWithUTF8String:argv[2]];

        id properties = [getWindowOfProcess(processId, windowId) properties];
        NSRect bounds = [properties[@"bounds"] rectValue];
        
        printf("%d\n%d\n%d\n%d", (int)bounds.origin.x, (int)bounds.origin.y, (int)bounds.size.width, (int)bounds.size.height);
    }

    return 0;
}

