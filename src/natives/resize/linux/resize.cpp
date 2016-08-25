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

    XEvent event;

    event.xclient.type         = ClientMessage;
    event.xclient.serial       = 0;
    event.xclient.send_event   = True;
    event.xclient.message_type = XInternAtom(display, "_NET_WM_STATE", False);
    event.xclient.window       = (Window) windowId;
    event.xclient.format       = 32;

    event.xclient.data.l[0] = 0;
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
    
    event.xclient.message_type = XInternAtom(display, "_NET_MOVERESIZE_WINDOW", False);
    
    // NOTE: 0x2C00 means "assume direct user input, use only width and height, forget gravity"
    event.xclient.data.l[0] = 0x2C00;
    event.xclient.data.l[1] = 0; // NOTE: x
    event.xclient.data.l[2] = 0; // NOTE: y
    event.xclient.data.l[3] = width;
    event.xclient.data.l[4] = height;

    sendEventStatus = XSendEvent(
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
