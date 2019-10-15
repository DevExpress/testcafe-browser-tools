all: clean build
clean:
	rm "${DEST}/resize.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/resize.o" resize.m
