all: clean build
clean:
	rm "${DEST}/find-window.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/find-window.o" find-window.m
