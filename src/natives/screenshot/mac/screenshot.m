//
//  screenshot.m
//  Screenshot
//

#import <Cocoa/Cocoa.h>


int createWindowShot (CGWindowID windowID, NSString* screenshotPath);
int saveImage(NSString* fullPath, CGImageRef image);

int screenshot (int argc, const char * argv[]) {
    @autoreleasepool {
        int windowId = [[NSString stringWithUTF8String:argv[1]] intValue];

        return createWindowShot(windowId, [NSString stringWithUTF8String:argv[2]]);
    }

    return 0;
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
