include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/close-x86.o" || true
	rm "${DEST}/close-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/close-x86.o" $(TARGET_ARGS_X86) close.m
	clang -c -o "${DEST}/close-arm.o" $(TARGET_ARGS_ARM) close.m
