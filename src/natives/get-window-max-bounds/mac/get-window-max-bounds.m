#import <Cocoa/Cocoa.h>
#include <stdio.h>

struct WindowRect {
    int left, top, right, bottom;
};

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

struct WindowRect getScreenRect (NSScreen *screen, NSScreen* primaryScreen, int useVisibleFrame) {
    NSRect screenRect        = useVisibleFrame ? [screen visibleFrame] : [screen frame];
    NSRect primaryScreenRect = [primaryScreen frame];

    // NOTE: We have to convert Y coordinate because NSScreen API uses different (0,0) point located in the bottom-left corner
    // of the primary display, and Y axis is inverted and directed bottom-to-top, unlike the regular top-to-bottom approach.
    double convertedY = primaryScreenRect.size.height - screenRect.origin.y - screenRect.size.height;

    struct WindowRect screenWinRect = {
        .left   = (int)screenRect.origin.x,
        .top    = (int)convertedY,
        .right  = (int)(screenRect.origin.x + screenRect.size.width),
        .bottom = (int)(convertedY + screenRect.size.height)
    };

    return screenWinRect;
}

double computeIntersectionArea (struct WindowRect rectA, struct WindowRect rectB) {
    double intersectionLeft   = max(rectA.left, rectB.left);
    double intersectionTop    = max(rectA.top, rectB.top);
    double intersectionRight  = min(rectA.right, rectB.right);
    double intersectionBottom = min(rectA.bottom, rectB.bottom);
    double intersectionWidth  = intersectionRight - intersectionLeft;
    double intersectionHeight = intersectionBottom - intersectionTop;

    if (intersectionWidth < 0 || intersectionHeight < 0)
        return 0;

    return intersectionWidth * intersectionHeight;
}

void getWindowMaxDimensions (struct WindowRect windowRect) {
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

    struct WindowRect maxWindowRect = getScreenRect(windowScreen, primaryScreen, true);

    printf("%d, %d, %d, %d", maxWindowRect.left, maxWindowRect.top, maxWindowRect.right, maxWindowRect.bottom);
}

int main (int argc, const char * argv[]) {
    if (argc < 5) {
        printf("Incorrect arguments\n");
        return 1;
    }

    @autoreleasepool {
        struct WindowRect windowRect;

        sscanf(argv[1], "%d", &windowRect.left);
        sscanf(argv[2], "%d", &windowRect.top);
        sscanf(argv[3], "%d", &windowRect.right);
        sscanf(argv[4], "%d", &windowRect.bottom);

        getWindowMaxDimensions(windowRect);
    }

    return 0;
}
