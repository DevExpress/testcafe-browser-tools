all: clean build
clean:
	rm "${DEST}/get-window-size" || true
build:
	mkdir "${DEST}" || true
	${CXX} get-window-size.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/get-window-size"
