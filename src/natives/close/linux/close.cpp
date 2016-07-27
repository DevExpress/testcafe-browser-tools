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

    unsigned long windowId = 0;

    sscanf(argv[1], "%lx", &windowId);

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return 1;
    }

    XEvent event;

    event.xclient.type         = ClientMessage;
    event.xclient.serial       = 0;
    event.xclient.send_event   = True;
    event.xclient.message_type = XInternAtom(display, "_NET_CLOSE_WINDOW", False);
    event.xclient.window       = (Window) windowId;
    event.xclient.format       = 32;

    for (size_t i = 0; i < 5; i++)
        event.xclient.data.l[i] = 0;

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

    XCloseDisplay(display);

    return result;
}
