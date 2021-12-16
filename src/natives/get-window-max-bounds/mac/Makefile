include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/get-window-max-bounds-x86.o" || true
	rm "${DEST}/get-window-max-bounds-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/get-window-max-bounds-x86.o" $(TARGET_ARGS_X86) get-window-max-bounds.m
	clang -c -o "${DEST}/get-window-max-bounds-arm.o" $(TARGET_ARGS_ARM) get-window-max-bounds.m
