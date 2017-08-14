//
//  find-window-cocoa.m
//  Find Cocoa ID of a window
//

#import <Cocoa/Cocoa.h>


NSString* getTestCafeWindowID(NSString* windowTitle);


int main (int argc, const char * argv[]) {
    @autoreleasepool {
        NSString* windowIdString = getTestCafeWindowID([NSString stringWithUTF8String:argv[1]]);
        int       windowId       = [windowID intValue];

        if (windowId == 0) {
            fprintf(stderr, "There are no TestCafe windows\n");
            return 1;
        }

        printf("%d\n", windowId);

        return 0;
    }

    return 0;
}

NSString* getTestCafeWindowID (NSString* windowTitle) {
    NSString *windowId = nil;

    CFArrayRef windowList  = CGWindowListCopyWindowInfo(1, kCGNullWindowID);
    CFIndex    windowCount = CFArrayGetCount(windowList);

    for (CFIndex i = 0; i < windowCount; i++) {
        NSDictionary *dict = (NSDictionary *) CFArrayGetValueAtIndex(windowList, i);

        for (NSString *key in dict) {
            if (![key isEqualToString: @"kCGWindowName"])
                continue;

            NSString *value    = (NSString *)[dict objectForKey: key];
            NSRange  textRange = [value rangeOfString: windowTitle];

            if (textRange.location != NSNotFound) {
                windowId = (NSString *) [dict objectForKey: @"kCGWindowNumber"];
                break;
            }
        }
    }

    CFRelease(windowList);
    return windowId;
}
