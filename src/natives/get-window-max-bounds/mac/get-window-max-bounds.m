//
//  get-window-max-bounds.m
//  Compute the maximum available bounds for a window
//

#import <Cocoa/Cocoa.h>
#include <stdio.h>


double max (double a, double b) {
    return b > a ? b : a;
}

double min (double a, double b) {
    return b < a ? b : a;
}

NSScreen* getPrimaryScreen () {
    NSArray *screenArray  = [NSScreen screens];
    unsigned screenCount  = [screenArray count];

    for (unsigned index = 0; index < screenCount; index++) {
        NSScreen *screen = [screenArray objectAtIndex: index];
        NSRect screenRect = [screen frame];

        if (screenRect.origin.x == 0 && screenRect.origin.y == 0)
            return screen;
    }

    return NULL;
}

NSRect getScreenRect (NSScreen *screen, NSScreen* primaryScreen, int useVisibleFrame) {
    NSRect screenRect        = useVisibleFrame ? [screen visibleFrame] : [screen frame];
    NSRect primaryScreenRect = [primaryScreen frame];

    // NOTE: We have to convert Y coordinate because NSScreen API uses different (0,0) point located in the bottom-left corner
    // of the primary display, and Y axis is inverted and directed bottom-to-top, unlike the regular top-to-bottom approach.
    screenRect.origin.y = primaryScreenRect.size.height - screenRect.origin.y - screenRect.size.height;

    return screenRect;
}

double computeIntersectionArea (NSRect rectA, NSRect rectB) {
    double intersectionLeft   = max(rectA.origin.x, rectB.origin.x);
    double intersectionTop    = max(rectA.origin.y, rectB.origin.y);
    double intersectionRight  = min(rectA.origin.x + rectA.size.width, rectB.origin.x + rectB.size.width);
    double intersectionBottom = min(rectA.origin.y + rectA.size.height, rectB.origin.y + rectB.size.height);
    double intersectionWidth  = intersectionRight - intersectionLeft;
    double intersectionHeight = intersectionBottom - intersectionTop;

    if (intersectionWidth < 0 || intersectionHeight < 0)
        return 0;

    return intersectionWidth * intersectionHeight;
}

void getWindowMaxDimensions (NSRect windowRect) {
    NSScreen *primaryScreen  = getPrimaryScreen();
    NSScreen *windowScreen   = primaryScreen;

    NSArray *screenArray  = [NSScreen screens];
    unsigned screenCount  = [screenArray count];

    double maxArea = 0;

    for (unsigned index = 0; index < screenCount; index++) {
        NSScreen *screen = [screenArray objectAtIndex: index];
        NSRect screenRect = [screen frame];

        // NOTE: Looks like there is no API to get the display that owns the window from the process that doesn't own the window.
        // So we consider that the suitable display has biggest intersection area with the window.
        double area = computeIntersectionArea(windowRect, getScreenRect(screen, primaryScreen, false));

        if (area > maxArea) {
            maxArea      = area;
            windowScreen = screen;
        }

    }

    NSRect maxWindowRect = getScreenRect(windowScreen, primaryScreen, true);

    printf("%d\n%d\n%d\n%d", (int)maxWindowRect.origin.x, (int)maxWindowRect.origin.y, (int)maxWindowRect.size.width, (int)maxWindowRect.size.height);
}

int getWindowMaxBounds (int argc, const char * argv[]) {
    if (argc < 5) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        NSRect windowRect;

        sscanf(argv[1], "%lf", &windowRect.origin.x);
        sscanf(argv[2], "%lf", &windowRect.origin.y);
        sscanf(argv[3], "%lf", &windowRect.size.width);
        sscanf(argv[4], "%lf", &windowRect.size.height);

        getWindowMaxDimensions(windowRect);
    }

    return 0;
}
