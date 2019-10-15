all: clean build
clean:
	rm "${DEST}/close.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/close.o" close.m
