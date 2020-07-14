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

    XWindowAttributes attr;

    Atom atom = XInternAtom (display, "_NET_ACTIVE_WINDOW", False);;
    XEvent xev;

    xev.xclient.type = ClientMessage;
    xev.xclient.serial = 0;
    xev.xclient.send_event = True;
    xev.xclient.display = display;
    xev.xclient.window = (Window) windowId;
    xev.xclient.message_type = atom;
    xev.xclient.format = 32;
    xev.xclient.data.l[0] = 2;
    xev.xclient.data.l[1] = 0;
    xev.xclient.data.l[2] = 0;
    xev.xclient.data.l[3] = 0;
    xev.xclient.data.l[4] = 0;

    XGetWindowAttributes(display, (Window) windowId, &attr);

    XSendEvent (display,
              attr.root, False,
              SubstructureRedirectMask | SubstructureNotifyMask,
              &xev);

    XSync(display, False);

    XRaiseWindow(display, (Window) windowId);
    XSync(display, False);

    XCloseDisplay(display);

    return 0;
}
