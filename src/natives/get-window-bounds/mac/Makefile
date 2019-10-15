all: clean build
clean:
	rm "${DEST}/get-window-bounds.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/get-window-bounds.o" get-window-bounds.m
