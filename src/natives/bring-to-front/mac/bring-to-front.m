//
//  bring-to-front.m
//  Place a window in foreground
//

#import "AppKit/AppKit.h"
#include "../../utils/mac/utils.h"


const int APP_ACTIVATION_DELAY = 100000;

int main (int argc, const char * argv[]) {
    if (argc < 3) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        NSString *processId = [NSString stringWithUTF8String:argv[1]];
        NSString *windowId = [NSString stringWithUTF8String:argv[2]];
          
        @try {
            [[NSRunningApplication runningApplicationWithProcessIdentifier: [processId intValue]] activateWithOptions: NSApplicationActivateAllWindows|NSApplicationActivateIgnoringOtherApps];

            usleep(APP_ACTIVATION_DELAY);

            id app    = getApplication(processId);

            id window = getWindowForApplication(app, windowId);

            [getApplicationWindow(processId, windowId) setIndex: 1];
        }
        @catch (NSException *exception) {
            return 0;
        }
    }

    return 0;
}

