all: clean build
clean:
	rm "${DEST}/resize" || true
build:
	mkdir "${DEST}" || true
	${CXX} resize.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/resize"
