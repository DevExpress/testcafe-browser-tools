#include <cstdio>
#include <cstring>
#include <cctype>
#include <cstdlib>
#include "../../utils/any/exit-codes.h"

extern "C" {
    #include <unistd.h>
    #include <X11/Xlib.h>
    #include <X11/Xutil.h>
    #include <X11/Xos.h>
}

const unsigned MAX_RETRY_COUNT = 10;
const unsigned RETRY_DELAY     = 300000;

struct Size {
    unsigned int width, height;
};

bool checkWindow (Display* display, Window currentWindow, char* windowTitlePart, Window* foundWindow);

void toLowerCase (char* str) {
    for(str; *str; str++)
        *str = tolower(*str);
}

Size getWindowSize (Display* display, Window window) {
    Window rootWindow = 0;
    int    x,y;
    struct Size size;
    unsigned int borderWidth, depth;

    XGetGeometry(
        display,
        window,
        &rootWindow,
        &x,
        &y,
        &size.width,
        &size.height,
        &borderWidth,
        &depth
    );

    return size;
}

size_t getStringsTotalLength (char** stringsList, size_t stringsCount) {
    size_t totalLength = 0;

    for (size_t i = 0; i < stringsCount; i++) {
        size_t stringLength = strlen(stringsList[i]);

        totalLength += stringLength ? stringLength + 1 : 0;
    }

    return totalLength;
}

char* stringsListToString (char **stringsList, size_t stringsCount) {
    size_t totalLength = getStringsTotalLength(stringsList, stringsCount);

    if (!totalLength)
        return NULL;

    char* result = (char*)calloc(totalLength, sizeof(char));
    char* ptr    = result;

    for (size_t i = 0; i < stringsCount; i++) {
        for(char* string = stringsList[i]; *string; string++, ptr++)
            *ptr = *string;

        *(ptr++) = '\n';
    }

    *(ptr - 1) = '\0';

    return result;
}

char* getWindowTitle (Display* display, Window window) {
    XTextProperty wmName;
    Status        status;

    status = XGetWMName(display, window, &wmName);

    if (!status)
        return NULL;

    char** stringsList;
    int stringsCount;

    XmbTextPropertyToTextList(display, &wmName, &stringsList, &stringsCount);

    char* result = stringsListToString(stringsList, stringsCount);

    if (result)
        toLowerCase(result);

    XFreeStringList(stringsList);

    return result;
}


bool checkChildrenWindows (Display* display, Window currentWindow, char* windowTitlePart, Window* foundWindow) {
    bool         windowFound      = false;
    unsigned int childrenCount    = 0;
    Window       rootWindow       = 0;
    Window       parentWindow     = 0;
    Window*      childrenWindows  = NULL;

    XQueryTree(display, currentWindow, &rootWindow, &parentWindow, &childrenWindows, &childrenCount);

    for (size_t i = 0; !windowFound && i < childrenCount; i++)
        windowFound = checkWindow(display, childrenWindows[i], windowTitlePart, foundWindow);

    XFree(childrenWindows);

    return windowFound;
}

bool checkWindow (Display* display, Window currentWindow, char* windowTitlePart, Window* foundWindow) {
    bool windowFound = false;
    Size windowSize  = getWindowSize(display, currentWindow);

    if (windowSize.width && windowSize.height) {
        char* windowTitle = getWindowTitle(display, currentWindow);

        if (windowTitle) {
            windowFound = strstr(windowTitle, windowTitlePart);

            free(windowTitle);
        }
    }

    if (windowFound) {
        *foundWindow = currentWindow;

        return true;
    }

    return checkChildrenWindows(display, currentWindow, windowTitlePart, foundWindow);
}

int main (int argc, char** argv) {
    if (argc != 2) {
        printf("Incorrect arguments\n");
        return EXIT_CODE_GENERAL_ERROR;
    }

    char* windowTitlePart = argv[1];

    toLowerCase(windowTitlePart);

    Display* display = XOpenDisplay(NULL);

    if (display == NULL) {
        printf("Cannot open display\n");
        return EXIT_CODE_GENERAL_ERROR;
    }

    bool   windowFound;
    Window foundWindow;

    windowFound = checkWindow(display, XDefaultRootWindow(display), windowTitlePart, &foundWindow);

    for (unsigned i = 0; !windowFound && i < MAX_RETRY_COUNT; i++) {
        usleep(RETRY_DELAY);

        windowFound = checkWindow(display, XDefaultRootWindow(display), windowTitlePart, &foundWindow);
    }

    if (windowFound)
        printf("%lx\n", foundWindow);

    XCloseDisplay(display);

    return windowFound ? EXIT_CODE_SUCCESS : EXIT_CODE_WINDOW_NOT_FOUND;
}
