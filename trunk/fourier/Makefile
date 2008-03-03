all: main wavinp

CFLAGS=-O20 -ffast-math -fexpensive-optimizations -msse2 -mfpmath=sse
CPPFLAGS=-Wall -I../fftw-3.1.1/api -I../ncurses-5.5/include -D_GNU_SOURCE
LDFLAGS=-L/usr/X11R6/lib

main: magic.o wavplay.o apple.o ngl.o xapple.o
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o main magic.o wavplay.o apple.o ngl.o xapple.o ${LDFLAGS} ../fftw-3.1.1/libfftw3.la ../ncurses-5.5/lib/libncursesw.a -lGL -lm
	strip main

wavplay: wavplay.o
	${CC} ${CFLAGS} -o wavplay wavplay.o
	strip wavplay

simple: simple.o
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o simple simple.o ${LDFLAGS} ../fftw-3.1.1/libfftw3.la
	strip simple

wavinp: wavinp.o
	${CC} ${CFLAGS} -o wavinp wavinp.o
	strip wavinp
