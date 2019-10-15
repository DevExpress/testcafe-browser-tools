all: clean build
clean:
	rm "${DEST}/get-window-size.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/get-window-size.o" get-window-size.m
