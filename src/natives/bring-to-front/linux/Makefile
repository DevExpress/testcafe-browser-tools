all: clean build
clean:
	rm "${DEST}/bring-to-front" || true
build:
	mkdir "${DEST}" || true
	${CXX} bring-to-front.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/bring-to-front"
