all: clean build
clean:
	rm "${DEST}/maximize" || true
build:
	mkdir "${DEST}" || true
	${CXX} maximize.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/maximize"
