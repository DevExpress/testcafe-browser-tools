all: clean build
clean:
	rm "${DEST}/screenshot" || true
build:
	mkdir "${DEST}" || true
	${CXX} -o "${DEST}/screenshot" lib/lodepng.cpp screenshot.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11
