all: main wavinp

CFLAGS=-O20 -ffast-math -fexpensive-optimizations -msse2 -mfpmath=sse
CPPFLAGS=-Wall -I/home/dev/fftw-3.1.2/api -D_GNU_SOURCE
LDFLAGS=-L/usr/X11R6/lib

main: magic.o wavplay.o apple.o ngl.o xapple.o
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o main magic.o wavplay.o apple.o ngl.o xapple.o ${LDFLAGS} /home/dev/fftw-3.1.2/libfftw3.la -lncurses -lGL -lm -lao
	strip main

wavplay: wavplay.o
	${CC} ${CFLAGS} -o wavplay wavplay.o
	strip wavplay

simple: simple.o
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o simple simple.o ${LDFLAGS} /home/dev/fftw-3.1.2/libfftw3.la
	strip simple

wavinp: wavinp.o
	${CC} ${CFLAGS} -o wavinp wavinp.o
	strip wavinp
