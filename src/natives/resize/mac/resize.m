//
//  resize.m
//  Resize a window to the specified width and height
//

#include "../../utils/mac/utils.h"

int main (int argc, const char * argv[]) {
    if (argc < 5) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        NSString *processId = [NSString stringWithUTF8String:argv[1]];
        NSString *windowId  = [NSString stringWithUTF8String:argv[2]];
            
        int width  = [[NSString stringWithUTF8String:argv[3]] intValue];
        int height = [[NSString stringWithUTF8String:argv[4]] intValue];

        id window     = getWindowOfProcess(processId, windowId);
        id properties = [window properties];
        NSRect bounds = [properties[@"bounds"] rectValue];

        bounds.size.width  = width;
        bounds.size.height = height;

        NSValue *boxedBounds = [NSValue valueWithRect:bounds];

        [window setBounds: boxedBounds];
    }

    return 0;
}

