include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/set-window-bounds-x86.o" || true
	rm "${DEST}/set-window-bounds-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/set-window-bounds-x86.o" $(TARGET_ARGS_X86) set-window-bounds.m
	clang -c -o "${DEST}/set-window-bounds-arm.o" $(TARGET_ARGS_ARM) set-window-bounds.m
