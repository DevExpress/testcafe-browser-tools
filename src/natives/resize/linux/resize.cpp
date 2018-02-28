#include <cstdio>

extern "C" {
    #include <X11/Xlib.h>
    #include <X11/Xutil.h>
    #include <X11/Xos.h>
}

int main (int argc, char** argv) {
    if (argc != 4) {
        printf("Incorrect arguments\n");
        return 1;
    }

    unsigned long windowId = 0;

    long width  = 0;
    long height = 0;

    sscanf(argv[1], "%lx", &windowId);
    sscanf(argv[2], "%ld", &width);
    sscanf(argv[3], "%ld", &height);

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return 1;
    }

    XWindowChanges wc;

    wc.width = width;
    wc.height = height;

    int ret = XConfigureWindow(display, windowId, CWWidth | CWHeight, &wc);
    XCloseDisplay(display);

    return ret == 0;
}
