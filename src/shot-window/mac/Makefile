all: clean build
clean:
	rm ${DEST}/shot-window || true
build:
	mkdir ${DEST} || true
	clang -o ${DEST}/shot-window -framework Cocoa shot-window.m
