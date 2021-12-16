include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/open-x86.o" || true
	rm "${DEST}/open-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/open-x86.o" $(TARGET_ARGS_X86) open.m
	clang -c -o "${DEST}/open-arm.o" $(TARGET_ARGS_ARM) open.m
