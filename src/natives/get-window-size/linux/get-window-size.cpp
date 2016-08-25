#include <cstdio>

extern "C" {
    #include <X11/Xlib.h>
    #include <X11/Xutil.h>
    #include <X11/Xos.h>
}

int main (int argc, char** argv) {
    if (argc != 2) {
        printf("Incorrect arguments\n");
        return 1;
    }

    unsigned long windowId   = 0;

    sscanf(argv[1], "%lx", &windowId);

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return 1;
    }

    Window rootWindow = 0;
    int x,y;
    unsigned int width, height, borderWidth, depth;

    Status sendEventStatus = XGetGeometry(
        display,
        windowId,
        &rootWindow,
        &x,
        &y,
        &width,
        &height,
        &borderWidth,
        &depth
    );
    
    int result = 0;

    if (!sendEventStatus) {
        printf("Cannot send event.\n");
        result = 1;
    } else {
        printf("%u\n%u\n", width, height);
    }

    XCloseDisplay(display);

    return result;
}
