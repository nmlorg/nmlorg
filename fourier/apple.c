#include <assert.h>
#include <curses.h>
#include <stdint.h>
#include <limits.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

static int N, samplespersec, samplelen, bitspersample, numchannels;
//static uint32_t *_colors = NULL;

void	apple_init(const int _N, const int _samplespersec, const int _samplelen, const int _bitspersample, const int _numchannels) {
	int	i;

	N = _N;
	samplespersec = _samplespersec;
	samplelen = _samplelen;
	bitspersample = _bitspersample;
	numchannels = _numchannels;

	initscr();
	start_color();
	leaveok(stdscr, TRUE);
	curs_set(0);
//	use_default_colors();
	for (i = 1; i < COLOR_PAIRS; i++)
		init_pair(i, i%COLORS, i/COLORS);
	bkgdset(ACS_HLINE | COLOR_PAIR(COLOR_GREEN));

//	_colors = malloc(COLORS*sizeof(*_colors));
//	for (i = 0; i < COLORS; i++) {
//		short	r, g, b;
//
//		color_content(i, &r, &g, &b);
//		_colors[i] = ((0xFF*r/1000) << 16) | ((0xFF*g/1000) << 8) | (0xFF*b/1000);
//	}
}

static int MIN(const int a, const int b) {
	return((a < b)?a:b);
}

static int MAX(const int a, const int b) {
	return((a > b)?a:b);
}

const char _keys[] = { 'C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B', };

static char *apple_note(const int bucket) {
	static char buf[4];
	int	i = 0, frequency = bucket*samplespersec,
		note = 12*log(frequency/16.3515978312874)/M_LN2 + 0.5,
		octave = note/12,
		key = note%12;

	buf[i++] = _keys[key];
	buf[i++] = octave + '0';
	if ((key > 0) && (_keys[key-1] == _keys[key]))
		buf[i++] = '#';
	buf[i++] = 0;

	return(buf);
}

static void apple_ch(int j, int i, int col) {
	chtype	ch;
	int	fg;

	ch = mvinch(j, i);
	fg = PAIR_NUMBER(ch & A_COLOR)%COLORS;
	attr_set(A_NORMAL, fg + col*COLORS, NULL);
	mvaddch(j, i, ch & (A_CHARTEXT|A_BOLD));
}

static void apple_ch2(int j, int i, int notsetcol, int combinecol) {
	chtype	ch;
	int	bg, fg;

	ch = mvinch(j, i);
	fg = PAIR_NUMBER(ch & A_COLOR)%COLORS;
	bg = PAIR_NUMBER(ch & A_COLOR)/COLORS;
	if (bg != COLOR_BLACK)
		attr_set(A_NORMAL, fg + combinecol*COLORS, NULL);
	else
		attr_set(A_NORMAL, fg + notsetcol*COLORS, NULL);
	mvaddch(j, i, ch & (A_CHARTEXT|A_BOLD));
}

static uint32_t _colors[] = {
//0x000000,0xAD0000,0x00AD00,0xADAD00,0x0000AD,0xAD00AD,0x00AD80,0xADADAD,
0x000000,0xFF0000,0x00FF00,0xFFFF00,0x0000FF,0xFF00FF,0x00FFFF,0xFFFFFF,
0xC0C0C0,0xFF0000,0x00FF00,0xFFFF00,0x0000FF,0xFF00FF,0x00FFFF,0xFFFFFF,
0x000000,0x00005f,0x000087,0x0000af,0x0000d7,0x0000ff,0x005f00,0x005f5f,0x005f87,0x005faf,0x005fd7,0x005fff,
0x008700,0x00875f,0x008787,0x0087af,0x0087d7,0x0087ff,0x00af00,0x00af5f,0x00af87,0x00afaf,0x00afd7,0x00afff,
0x00d700,0x00d75f,0x00d787,0x00d7af,0x00d7d7,0x00d7ff,0x00ff00,0x00ff5f,0x00ff87,0x00ffaf,0x00ffd7,0x00ffff,
0x5f0000,0x5f005f,0x5f0087,0x5f00af,0x5f00d7,0x5f00ff,0x5f5f00,0x5f5f5f,0x5f5f87,0x5f5faf,0x5f5fd7,0x5f5fff,
0x5f8700,0x5f875f,0x5f8787,0x5f87af,0x5f87d7,0x5f87ff,0x5faf00,0x5faf5f,0x5faf87,0x5fafaf,0x5fafd7,0x5fafff,
0x5fd700,0x5fd75f,0x5fd787,0x5fd7af,0x5fd7d7,0x5fd7ff,0x5fff00,0x5fff5f,0x5fff87,0x5fffaf,0x5fffd7,0x5fffff,
0x870000,0x87005f,0x870087,0x8700af,0x8700d7,0x8700ff,0x875f00,0x875f5f,0x875f87,0x875faf,0x875fd7,0x875fff,
0x878700,0x87875f,0x878787,0x8787af,0x8787d7,0x8787ff,0x87af00,0x87af5f,0x87af87,0x87afaf,0x87afd7,0x87afff,
0x87d700,0x87d75f,0x87d787,0x87d7af,0x87d7d7,0x87d7ff,0x87ff00,0x87ff5f,0x87ff87,0x87ffaf,0x87ffd7,0x87ffff,
0xaf0000,0xaf005f,0xaf0087,0xaf00af,0xaf00d7,0xaf00ff,0xaf5f00,0xaf5f5f,0xaf5f87,0xaf5faf,0xaf5fd7,0xaf5fff,
0xaf8700,0xaf875f,0xaf8787,0xaf87af,0xaf87d7,0xaf87ff,0xafaf00,0xafaf5f,0xafaf87,0xafafaf,0xafafd7,0xafafff,
0xafd700,0xafd75f,0xafd787,0xafd7af,0xafd7d7,0xafd7ff,0xafff00,0xafff5f,0xafff87,0xafffaf,0xafffd7,0xafffff,
0xd70000,0xd7005f,0xd70087,0xd700af,0xd700d7,0xd700ff,0xd75f00,0xd75f5f,0xd75f87,0xd75faf,0xd75fd7,0xd75fff,
0xd78700,0xd7875f,0xd78787,0xd787af,0xd787d7,0xd787ff,0xd7af00,0xd7af5f,0xd7af87,0xd7afaf,0xd7afd7,0xd7afff,
0xd7d700,0xd7d75f,0xd7d787,0xd7d7af,0xd7d7d7,0xd7d7ff,0xd7ff00,0xd7ff5f,0xd7ff87,0xd7ffaf,0xd7ffd7,0xd7ffff,
0xff0000,0xff005f,0xff0087,0xff00af,0xff00d7,0xff00ff,0xff5f00,0xff5f5f,0xff5f87,0xff5faf,0xff5fd7,0xff5fff,
0xff8700,0xff875f,0xff8787,0xff87af,0xff87d7,0xff87ff,0xffaf00,0xffaf5f,0xffaf87,0xffafaf,0xffafd7,0xffafff,
0xffd700,0xffd75f,0xffd787,0xffd7af,0xffd7d7,0xffd7ff,0xffff00,0xffff5f,0xffff87,0xffffaf,0xffffd7,0xffffff,
0x080808,0x121212,0x1c1c1c,0x262626,0x303030,0x3a3a3a,0x444444,0x4e4e4e,0x585858,0x626262,0x6c6c6c,0x767676,
0x808080,0x8a8a8a,0x949494,0x9e9e9e,0xa8a8a8,0xb2b2b2,0xbcbcbc,0xc6c6c6,0xd0d0d0,0xdadada,0xe4e4e4,0xeeeeee
};

int	RGB2index(unsigned int r, unsigned int g, unsigned int b, int max) {
	int	i, index = 0, bestval = 0xFFFFFF;

	for (i = 1; i < MIN(max, sizeof(_colors)/sizeof(*_colors)); i++) {
		int	dr = ((_colors[i] & 0xFF0000) >> 16) - r,
			dg = ((_colors[i] & 0x00FF00) >> 8) - g,
			db = (_colors[i] & 0x0000FF) - b,
			val = dr*dr + dg*dg + db*db;

		if (val < bestval) {
			bestval = val;
			index = i;
		}
	}

	return(index);
}

static void apple_color_set(unsigned long fore, unsigned long back) {
	int	fr = (fore & 0xFF0000) >> 16,
		fg = (fore & 0x00FF00) >> 8,
		fb = (fore & 0x0000FF),
		br = (back & 0xFF0000) >> 16,
		bg = (back & 0x00FF00) >> 8,
		bb = (back & 0x0000FF),
		fp = RGB2index(fr, fg, fb, COLORS),
		bp = RGB2index(br, bg, bb, COLOR_PAIRS/COLORS);

	if (fp > COLORS) {
		attrset(A_BOLD);
		fp -= COLORS;
	} else
		attrset(A_NORMAL);

	color_set(fp + bp*COLORS, NULL);
}

void	apple_sample(const void *_buf, const double *Lmags, const double *Rmags) {
	static unsigned char *decay = NULL;
	werase(stdscr);

	decay = realloc(decay, LINES*COLS*sizeof(*decay));

	if (bitspersample == 8) {
#if 0
		const unsigned char *buf = _buf;
		int	i;
#endif
	} else if ((bitspersample == 16) && (numchannels == 2)) {
		const struct {
			const int16_t L, R;
		} *buf = _buf;
		int	i;
		int	mags[COLS];

		for (i = 0; i < COLS; i++) {
			int	left = LINES/2+(LINES/2)*buf[samplelen*i/COLS].L/SHRT_MAX,
				right = LINES/2+(LINES/2)*buf[samplelen*i/COLS].R/SHRT_MAX,
				j, didone = 0,
				Lmag = LINES*Lmags[N*i/COLS]/SHRT_MAX,
				Rmag = LINES*Rmags[N*i/COLS]/SHRT_MAX;

			mags[i] = MAX(Lmag, Rmag);

			for (j = LINES-1; j >= 0; j--)
				if ((decay[i*LINES + j] & 0x0F) > 0) {
					int	col = decay[i*LINES + j] & 0xF0;

					if (col == 0x10)
						col = COLOR_RED;
					else if (col == 0x20)
						col = COLOR_BLUE;
					else
						col = COLOR_MAGENTA;

					if (col == didone)
						continue;
					else if (didone == 0)
						didone = col;
					else {
						didone = -1;
						col = COLOR_MAGENTA;
					}
					attr_set(A_NORMAL, col, NULL);
					mvvline(0, i, ACS_PLUS, j-1);
					if (didone == -1)
						break;
				}

			for (j = LINES-1; j >= 0; j--)
				if ((decay[i*LINES + j] & 0x0F) > 0)
					decay[i*LINES + j]--;
				else if (decay[i*LINES + j] > 0) {
//					if ((j > 0) && (decay[i*LINES + j-1] == 0))
//						decay[i*LINES + j-1] = (decay[i*LINES + j] & 0xF0) + 2;
					decay[i*LINES + j] = 0;
				}

			for (j = N*i/COLS+1; j < N*(i+1)/COLS; j++) {
				Lmag = MAX(Lmag, LINES*Lmags[j]/SHRT_MAX);
				Rmag = MAX(Rmag, LINES*Rmags[j]/SHRT_MAX);
			}
			Lmag = MIN(Lmag, LINES);
			Rmag = MIN(Rmag, LINES);

			if (Lmag+Rmag > 0) {
				if (Lmag > Rmag) {
					if (Rmag > 0) {
						attr_set(A_BOLD, COLOR_MAGENTA, NULL);
						mvvline(0, i, ACS_PLUS, Rmag);
					}
					attr_set(A_BOLD, COLOR_RED, NULL);
					mvvline(Rmag, i, ACS_PLUS, Lmag-Rmag-1);
					mvaddch(Lmag-1, i, ACS_BTEE);
					decay[i*LINES + Lmag] = 0x18;
				} else if (Rmag > Lmag) {
					if (Lmag > 0) {
						attr_set(A_BOLD, COLOR_MAGENTA, NULL);
						mvvline(0, i, ACS_PLUS, Lmag);
					}
					attr_set(A_BOLD, COLOR_BLUE, NULL);
					mvvline(Lmag, i, ACS_PLUS, Rmag-Lmag-1);
					mvaddch(Rmag-1, i, ACS_BTEE);
					decay[i*LINES + Rmag] = 0x28;
				} else {
					attr_set(A_BOLD, COLOR_MAGENTA, NULL);
					mvvline(0, i, ACS_PLUS, Lmag-1);
					mvaddch(Lmag-1, i, ACS_BTEE);
					decay[i*LINES + Lmag] = 0x38;
				}
			}

			apple_ch(left, i, COLOR_RED);
			if (i > 0) {
				int	lleft = LINES/2+(LINES/2)*buf[samplelen*(i-1)/COLS].L/SHRT_MAX;

				if (lleft < left)
					for (j = lleft+1; j < left; j++)
						apple_ch(j, i, COLOR_RED);
				else if (lleft > left)
					for (j = left+1; j < lleft; j++)
						apple_ch(j, i, COLOR_RED);
			}

			apple_ch2(right, i, COLOR_BLUE, COLOR_MAGENTA);
			if (i > 0) {
				int	lright = LINES/2+(LINES/2)*buf[samplelen*(i-1)/COLS].R/SHRT_MAX;

				if (lright < right)
					for (j = lright+1; j < right; j++)
						apple_ch2(j, i, COLOR_BLUE, COLOR_MAGENTA);
				else if (lright > right)
					for (j = right+1; j < lright; j++)
						apple_ch2(j, i, COLOR_BLUE, COLOR_MAGENTA);
			}
		}

		const int slots = 10;

		for (i = 0; i < slots; i++) {
			double	Lavg = 0, Ravg = 0;
			double	Lmax = 0, Rmax = 0;
			int	j, Lavgi, Ravgi, Lmaxi, Rmaxi;

			for (j = i*N/slots; j < (i+1)*N/slots; j++) {
				Lavg += Lmags[j];
				Ravg += Rmags[j];
				if (Lmags[j] > Lmax)
					Lmax = Lmags[j];
				if (Rmags[j] > Rmax)
					Rmax = Rmags[j];
			}
			Lavg = slots*Lavg/N;
			Ravg = slots*Ravg/N;

			Lavgi = LINES*Lavg/SHRT_MAX;
			Ravgi = LINES*Ravg/SHRT_MAX;

			if (Lavgi == Ravgi)
				for (j = i*COLS/slots; j < (i+1)*COLS/slots; j++)
					apple_ch(Lavgi, j, COLOR_MAGENTA);
			else
				for (j = i*COLS/slots; j < (i+1)*COLS/slots; j++) {
					apple_ch(Lavgi, j, COLOR_RED);
					apple_ch(Ravgi, j, COLOR_BLUE);
				}

			Lmaxi = LINES*Lmax/SHRT_MAX;
			Rmaxi = LINES*Rmax/SHRT_MAX;

			for (j = i*COLS/slots; j < (i+1)*COLS/slots; j++)
				if (Lmaxi > Rmaxi)
					apple_ch(Lmaxi, j, COLOR_YELLOW);
				else
					apple_ch(Rmaxi, j, COLOR_YELLOW);
		}

		for (i = 0; i < COLS; i++) {
			char	*key = apple_note(N*(i+1)/COLS);
			int	j;

			if ((i > 2) && (mags[i] > mags[i-1]) && (mags[i] > mags[i+1]) && (mags[i] > 2*mags[i-2]) && (mags[i] > 2*mags[i+2]))
				apple_color_set(
					(((i*6)%0xFF) << 16) | (((i*0)%0xFF) << 8) | ((i*0)%0xFF),
					(((i*0)%0x80 /*+ 0x80*/) << 16) | (((i*0)%0x80 /*+ 0x80*/) << 8) | ((i*3)%0x80 + 0x80));
			else
				apple_color_set(
					(((i*0)%0xFF) << 16) | (((i*6)%0xFF) << 8) | ((i*0)%0xFF),
					(((i*0)%0x80) << 16) | (((i*0)%0x80) << 8) | ((i*3)%0x80));
			for (j = LINES-strlen(key); j < LINES; j++)
				mvaddch(j, i, *(key++));
		}
	} else if ((bitspersample == 16) && (numchannels == 1)) {
		const int16_t *buf = _buf;
		int	i;

		for (i = 0; i < COLS; i++) {
			int	left = LINES/2+(LINES/2)*buf[samplelen*i/COLS]/SHRT_MAX,
				j, didone = 0,
				Lmag = LINES*Lmags[N*i/COLS]/SHRT_MAX;

			for (j = LINES-1; j >= 0; j--)
				if ((decay[i*LINES + j] & 0x0F) > 0) {
					int	col = decay[i*LINES + j] & 0xF0;

					if (col == 0x10)
						col = COLOR_RED;
					else if (col == 0x20)
						col = COLOR_BLUE;
					else
						col = COLOR_MAGENTA;

					if (col == didone)
						continue;
					else if (didone == 0)
						didone = col;
					else {
						didone = -1;
						col = COLOR_MAGENTA;
					}
					attr_set(A_NORMAL, col, NULL);
					mvvline(0, i, ACS_PLUS, j-1);
					if (didone == -1)
						break;
				}

			for (j = LINES-1; j >= 0; j--)
				if ((decay[i*LINES + j] & 0x0F) > 0)
					decay[i*LINES + j]--;
				else if (decay[i*LINES + j] > 0) {
//					if ((j > 0) && (decay[i*LINES + j-1] == 0))
//						decay[i*LINES + j-1] = (decay[i*LINES + j] & 0xF0) + 2;
					decay[i*LINES + j] = 0;
				}

			for (j = N*i/COLS+1; j < N*(i+1)/COLS; j++)
				Lmag = MAX(Lmag, LINES*Lmags[j]/SHRT_MAX);
			Lmag = MIN(Lmag, LINES);

			if (Lmag > 0) {
				attr_set(A_BOLD, COLOR_MAGENTA, NULL);
				mvvline(0, i, ACS_PLUS, Lmag-1);
				mvaddch(Lmag-1, i, ACS_BTEE);
				decay[i*LINES + Lmag] = 0x38;
			}

			attr_set(A_BOLD, COLOR_MAGENTA + COLOR_MAGENTA*COLORS, NULL);
			mvaddch(left, i, ' ');
			if (i > 0) {
				int	lleft = LINES/2+(LINES/2)*buf[samplelen*(i-1)/COLS]/SHRT_MAX;

				if (lleft < left)
					for (j = lleft+1; j < left; j++)
						mvaddch(j, i, ' ');
				else if (lleft > left)
					for (j = left+1; j < lleft; j++)
						mvaddch(j, i, ' ');
			}
		}
	}

	wrefresh(stdscr);
}

void	apple_end(void) {
	endwin();
}
