include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/get-window-size-x86.o" || true
	rm "${DEST}/get-window-size-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/get-window-size-x86.o" $(TARGET_ARGS_X86) get-window-size.m
	clang -c -o "${DEST}/get-window-size-arm.o" $(TARGET_ARGS_ARM) get-window-size.m
