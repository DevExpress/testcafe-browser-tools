all: clean build
clean:
	rm "${DEST}/utils.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/utils.o" utils.m
