all: clean build
clean:
	rm "${DEST}/set-window-bounds.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/set-window-bounds.o" set-window-bounds.m
