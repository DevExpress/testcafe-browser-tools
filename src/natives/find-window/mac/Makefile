include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/find-window-x86.o" || true
	rm "${DEST}/find-window-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/find-window-x86.o" $(TARGET_ARGS_X86) find-window.m
	clang -c -o "${DEST}/find-window-arm.o" $(TARGET_ARGS_ARM) find-window.m
