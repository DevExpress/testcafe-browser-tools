//
//  shot_window.m
//  Screenshot
//

#import <Cocoa/Cocoa.h>


NSString* getTestCafeWindowID(NSString* windowTitle);
int createWindowShot (CGWindowID windowID, NSString* screenshotPath);
int saveImage(NSString* fullPath, CGImageRef image);

int main (int argc, const char * argv[]) {
    @autoreleasepool {
        NSString* windowID = getTestCafeWindowID([NSString stringWithUTF8String:argv[1]]);

        if ([windowID intValue] == 0) {
            fprintf(stderr, "There are no TestCafe windows\n");
            return 1;
        }
        else {
            printf("Window is found\n");
            return createWindowShot([windowID intValue], [NSString stringWithUTF8String:argv[2]]);
        }
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

int createWindowShot (CGWindowID windowID, NSString* screenshotPath) {
    CGImageRef screenshotImage = CGWindowListCreateImage(
        CGRectNull,
        kCGWindowListOptionIncludingWindow,
        windowID,
        kCGWindowImageBoundsIgnoreFraming | kCGWindowImageShouldBeOpaque
    );

    int result = saveImage(screenshotPath, screenshotImage);

    CFRelease(screenshotImage);
    return result;
}

int saveImage (NSString* fullPath, CGImageRef image) {
    CFURLRef url = (__bridge CFURLRef)[NSURL fileURLWithPath:fullPath];

    CGImageDestinationRef destination = CGImageDestinationCreateWithURL(url, kUTTypePNG, 1, NULL);

    if (!destination) {
        fprintf(stderr, "Failed to create CGImageDestination for %s\n", [fullPath UTF8String]);
        return 2;
    }

    int result = 0;

    CGImageDestinationAddImage(destination, image, nil);

    if (!CGImageDestinationFinalize(destination)) {
        fprintf(stderr, "Failed to save screenshot to %s\n", [fullPath UTF8String]);
        result = 3;
    }

    CFRelease(destination);
    return result;
}
