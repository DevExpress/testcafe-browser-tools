all: clean build
clean:
	rm ${DEST}/screenshot || true
build:
	mkdir ${DEST} || true
	clang -o ${DEST}/screenshot -framework Cocoa screenshot.m
