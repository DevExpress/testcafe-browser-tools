include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/screenshot-x86.o" || true
	rm "${DEST}/screenshot-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/screenshot-x86.o" $(TARGET_ARGS_X86) screenshot.m
	clang -c -o "${DEST}/screenshot-arm.o" $(TARGET_ARGS_ARM) screenshot.m
