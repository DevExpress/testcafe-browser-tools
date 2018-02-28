#include <cstdlib>
#include <cstdio>
#include <cstddef>
#include "lib/lodepng.h"

extern "C" {
    #include <unistd.h>
    #include <X11/Xlib.h>
    #include <X11/Xutil.h>
    #include <X11/Xos.h>
}

struct Image {
	unsigned char *data;

	size_t width;
	size_t height;
	size_t channels;
	size_t stride;

    Image (Display* display, Drawable drawable) {
        XWindowAttributes attr;

	    XGetWindowAttributes(display, drawable, &attr);

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

        XMapWindow(display, drawable);
        XRaiseWindow(display, (Window) drawable);
        XSync(display, False);
        usleep(500000);

        _allocateData(attr.width, attr.height, 4);

        XImage *ximage = XGetImage(display, drawable, 0, 0, width, height, AllPlanes, ZPixmap);

        unsigned long redMask = ximage->red_mask;
        unsigned long greenMask = ximage->green_mask;
        unsigned long blueMask = ximage->blue_mask;

        for (size_t i = 0; i < width; i++) {
            for (size_t j = 0; j < height ; j++) {
                unsigned long xpixel = XGetPixel(ximage, i, j);

                subpixel(j, i, 0) = (xpixel & redMask) >> 16;
                subpixel(j, i, 1) = (xpixel & greenMask) >> 8;
                subpixel(j, i, 2) = xpixel & blueMask;
                subpixel(j, i, 3) = 255;
            }
        }

        XRaiseWindow(display, *activeWindow);
        XFree(activeWindow);
        XSync(display, False);
    }

    void _allocateData (size_t width, size_t height, size_t channels = 4) {
        this->width    = width;
        this->height   = height;
        this->channels = channels;

        stride = width * channels;

        data = (unsigned char *)malloc(width * height * channels);

        if (!data) {
            fprintf(stderr, "Memory allocation failed\n");
            exit(1);
        }
    }

	void _throwLibraryError (unsigned errorCode) {
		fprintf(stderr, "Error %u: %s\n", errorCode, lodepng_error_text(errorCode));
        exit(1);
	}

	void save (const char* filename) {
		unsigned error = lodepng_encode32_file(filename, data, width, height);

		if (error)
			_throwLibraryError(error);
	}

	unsigned char& subpixel (size_t y, size_t x, size_t channel) {
		static unsigned char sink;

		sink = 0;

		if (y >= height || x >= width)
			return sink;

		return data[y * stride + x * channels + channel];
	}
};

int main (int argc, char *argv[]) {
	if (argc != 3) {
		printf("Incorrect arguments\n");
		return 1;
	}

    unsigned long windowId = 0;

    sscanf(argv[1], "%lx", &windowId);

	const char* fileName = argv[2];

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return 1;
    }

    Image screenshot(display, (Drawable) windowId);

    screenshot.save(fileName);

	return 0;
}
