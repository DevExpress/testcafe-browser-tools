all: clean build
clean:
	rm "${DEST}/bring-to-front.o" || true
build:
	mkdir "${DEST}" || true
	clang -c -o "${DEST}/bring-to-front.o" bring-to-front.m
