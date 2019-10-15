all: clean build
clean:
	rm "${DEST}/screenshot.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/screenshot.o" screenshot.m
