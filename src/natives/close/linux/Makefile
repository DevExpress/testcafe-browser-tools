all: clean build
clean:
	rm "${DEST}/close" || true
build:
	mkdir "${DEST}" || true
	${CXX} close.cpp -I/usr/include/X11 -L/usr/lib/X11 -lX11 -o "${DEST}/close"
