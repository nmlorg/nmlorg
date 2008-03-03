all: main wavinp

CFLAGS=-O20 -ffast-math -g3
CPPFLAGS=-Wall -I../fftw-3.1.1/api -I../naim-current/lua/lua511 -I../ncurses-5.5/include -I../ngl -D_GNU_SOURCE
LUALIB=../LuaJIT-1.1.2/src/liblua.a
#LUALIB=../naim-build/lua/liblua.la

main: magic.o wavplay.o lapple.o ../fftw-3.1.1/libfftw3.la ../ncurses-5.5/lib/libncursesw.a ../ngl/libngl.la
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o main magic.o wavplay.o lapple.o ${LDFLAGS} ../fftw-3.1.1/libfftw3.la ${LUALIB} ../ncurses-5.5/lib/libncursesw.a ../ngl/libngl.la -lm
	#strip main

wavplay: wavplay.o
	${CC} ${CFLAGS} -o wavplay wavplay.o
	strip wavplay

simple: simple.o ../fftw-3.1.1/libfftw3.la
	libtool --mode=link --tag=CC ${CC} ${CFLAGS} -o simple simple.o ${LDFLAGS} ../fftw-3.1.1/libfftw3.la
	strip simple

wavinp: wavinp.o
	${CC} ${CFLAGS} -o wavinp wavinp.o
	strip wavinp
