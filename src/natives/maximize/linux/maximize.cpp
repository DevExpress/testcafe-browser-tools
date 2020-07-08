#include <cstdio>
#include "../../utils/any/exit-codes.h"

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

    unsigned long windowId = 0;

    sscanf(argv[1], "%lx", &windowId);

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return EXIT_CODE_DISPLAY_NOT_FOUND;
    }

    Window *activeWindow;
    Atom real;
    int format;
    unsigned long n,extra;

    XGetWindowProperty(
        display,
        DefaultRootWindow(display),
        XInternAtom(display, "_NET_ACTIVE_WINDOW", False),
        0,
        ~0,
        False,
        AnyPropertyType,
        &real,
        &format,
        &n,
        &extra,
        (unsigned char**)&activeWindow
    );

    XEvent event;

    event.xclient.type         = ClientMessage;
    event.xclient.serial       = 0;
    event.xclient.send_event   = True;
    event.xclient.message_type = XInternAtom(display, "_NET_WM_STATE", False);
    event.xclient.window       = (Window) windowId;
    event.xclient.format       = 32;

    event.xclient.data.l[0] = 1;
    event.xclient.data.l[1] = XInternAtom(display, "_NET_WM_STATE_MAXIMIZED_VERT", False);
    event.xclient.data.l[2] = XInternAtom(display, "_NET_WM_STATE_MAXIMIZED_HORZ", False);
    event.xclient.data.l[3] = 0;
    event.xclient.data.l[4] = 0;

    int result = 0;

    Status sendEventStatus = XSendEvent(
        display,
        DefaultRootWindow(display),
        False,
        SubstructureRedirectMask | SubstructureNotifyMask,
        &event
    );

    if (!sendEventStatus) {
        printf("Cannot send event.\n");
        result = 1;
    }

    XRaiseWindow(display, *activeWindow);
    XFree(activeWindow);
    XSync(display, False);

    XCloseDisplay(display);

    return result;
}
