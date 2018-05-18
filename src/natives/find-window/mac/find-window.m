//
//  find-window.m
//  Find AppleScript & Cocoa IDs of a window
//

#import <Cocoa/Cocoa.h>
#import <ScriptingBridge/ScriptingBridge.h>


const NSUInteger MAX_SEARCHING_ATTEMPTS_COUNT  = 10;
const NSUInteger SEARCHING_ATTEMPTS_DELAY      = 300000;

NSNumber * getOSAWindowId (NSNumber *processId, NSString *windowTitle) {
    @try {
        id app = [SBApplication applicationWithProcessIdentifier: [processId intValue] ];

        id windows = [app windows];
        id identifiedWindows = [windows filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"name contains %@", windowTitle]];

        if (![identifiedWindows count])
            return [NSNumber numberWithInt: 0];
                
        id targetWindow = identifiedWindows[0];

        return [targetWindow properties][@"id"];
    }
    @catch (NSException *exception) {
        return [NSNumber numberWithInt: 0];
    }
}

NSMutableDictionary * getTestCafeWindowID (NSString *windowTitle) {
    NSMutableDictionary *windowDescriptor = nil;

    NSArray *windowList  = (NSArray *) CGWindowListCopyWindowInfo(kCGWindowListOptionAll | kCGWindowListOptionAll, kCGNullWindowID);

    for (NSDictionary *dict in windowList) {
        id value = dict[(NSString *) kCGWindowName];

        if (!value)
            continue;

        NSString *windowName = value;
        NSRange  textRange   = [windowName rangeOfString: windowTitle options: NSCaseInsensitiveSearch];

        if (textRange.location != NSNotFound) {
            windowDescriptor = [NSMutableDictionary new];
            windowDescriptor[@"processId"] = dict[(NSString *)kCGWindowOwnerPID];
            windowDescriptor[@"cocoaId"] = dict[(NSString *)kCGWindowNumber];
            windowDescriptor[@"osaId"] = getOSAWindowId(windowDescriptor[@"processId"], windowTitle);
            break;
        }
    }

    return windowDescriptor;
}

int main (int argc, const char * argv[]) {
    if (argc < 2) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        NSDictionary *windowDescriptor   = nil;
        NSUInteger seachingAttemptsCount = 0;
        BOOL searchFinished              = NO;

        while (seachingAttemptsCount < MAX_SEARCHING_ATTEMPTS_COUNT && !searchFinished) {
            windowDescriptor = getTestCafeWindowID([NSString stringWithUTF8String:argv[1]]);
            
            searchFinished = !!windowDescriptor && [windowDescriptor[@"osaId"] intValue] != 0;

            if (!searchFinished) {
                seachingAttemptsCount++;

                usleep(SEARCHING_ATTEMPTS_DELAY);
            }
        }

        if (!windowDescriptor) {
            fprintf(stderr, "There are no TestCafe windows\n");
            return 1;
        }

        printf("%d\n", [windowDescriptor[@"processId"] intValue]);
        printf("%d\n", [windowDescriptor[@"cocoaId"] intValue]);
        printf("%d\n", [windowDescriptor[@"osaId"] intValue]);

        return 0;
    }

    return 0;
}

