all: clean build
clean:
	rm "${DEST}/get-window-max-bounds" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/get-window-max-bounds" -framework Cocoa get-window-max-bounds.m
