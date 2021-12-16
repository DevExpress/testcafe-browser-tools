include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/get-window-bounds-x86.o" || true
	rm "${DEST}/get-window-bounds-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/get-window-bounds-x86.o" $(TARGET_ARGS_X86) get-window-bounds.m
	clang -c -o "${DEST}/get-window-bounds-arm.o" $(TARGET_ARGS_ARM) get-window-bounds.m
