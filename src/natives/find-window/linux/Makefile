all: clean build
clean:
	rm "${DEST}/find-window" || true
build:
	mkdir "${DEST}" || true
	${CXX} find-window.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/find-window"
