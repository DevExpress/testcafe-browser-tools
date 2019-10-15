all: clean build
clean:
	rm "${DEST}/get-window-max-bounds.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/get-window-max-bounds.o" get-window-max-bounds.m
