#include <assert.h>
#include <complex.h>
#include <fftw3.h>
#include <math.h>
#include <stdint.h>
#include <stdlib.h>

const int N = 400;

static int samplespersec, samplelen, bitspersample, numchannels;

static double *LPCMin, *RPCMin;
static fftw_complex *LFFT, *RFFT;
static fftw_plan PCM2LFFT;
static fftw_plan PCM2RFFT;

//static double *PCMout;
//static fftw_plan FFT2PCM;

void	xapple_init(const int _N, const int samplespersec, const int _samplelen, const int _bitspersample, const int _numchannels);
void	xapple_sample(const void *_buf, const double *Lmags, const double *Rmags);
void	xapple_end(void);

static int inX = 0;

void	magic_init(const int _samplespersec, const uint32_t _samplelen, const int _bitspersample, const int _numchannels) {
	printf("initializing magic\n");

	samplespersec = _samplespersec;
	samplelen = _samplelen/(_bitspersample/8)/_numchannels;
	bitspersample = _bitspersample;
	numchannels = _numchannels;

	LPCMin = fftw_malloc(sizeof(*LPCMin) * N);
	assert(LPCMin != NULL);

	LFFT = fftw_malloc(sizeof(*LFFT) * (N/2+1));
	assert(LFFT != NULL);

	PCM2LFFT = fftw_plan_dft_r2c_1d(N, LPCMin, LFFT, FFTW_MEASURE);
	assert(PCM2LFFT != NULL);

	RPCMin = fftw_malloc(sizeof(*RPCMin) * N);
	assert(RPCMin != NULL);

	RFFT = fftw_malloc(sizeof(*RFFT) * (N/2+1));
	assert(RFFT != NULL);

	PCM2RFFT = fftw_plan_dft_r2c_1d(N, RPCMin, RFFT, FFTW_MEASURE);
	assert(PCM2RFFT != NULL);

//	PCMout = fftw_malloc(sizeof(*PCMout) * N);
//	assert(PCMout != NULL);
//
//	FFT2PCM = fftw_plan_dft_c2r_1d(N, FFT, PCMout, FFTW_MEASURE);
//	assert(FFT2PCM != NULL);

	printf("magic initialization finished\n");

	if (getenv("DISPLAY") != NULL)
		inX = 1;

	xapple_init(N/2, samplespersec, samplelen, bitspersample, numchannels);
}

void	magic_sample(const void *_buf) {
	assert((bitspersample == 8) || (bitspersample == 16));

	if ((bitspersample == 16) && (numchannels == 2)) {
		const struct {
			const int16_t L, R;
		} *buf = _buf;
		int	i;

		for (i = 0; i < N; i++) {
			LPCMin[i] = buf[samplelen*i/N].L;
			RPCMin[i] = buf[samplelen*i/N].R;
		}
	} else if ((bitspersample == 16) && (numchannels == 1)) {
		const int16_t *buf = _buf;
		int	i;

		for (i = 0; i < N; i++)
			RPCMin[i] = LPCMin[i] = buf[samplelen*i/N];
	} else if ((bitspersample == 8) && (numchannels == 2)) {
		const struct {
			const unsigned char L, R;
		} *buf = _buf;
		int	i;

		for (i = 0; i < N; i++) {
			LPCMin[i] = buf[samplelen*i/N].L;
			RPCMin[i] = buf[samplelen*i/N].R;
		}
	} else if ((bitspersample == 8) && (numchannels == 1)) {
		const unsigned char *buf = _buf;
		int	i;

		for (i = 0; i < N; i++)
			RPCMin[i] = LPCMin[i] = buf[samplelen*i/N];
	}

	fftw_execute(PCM2LFFT);
	fftw_execute(PCM2RFFT);

	{
		double	Lmags[N/2], Rmags[N/2];
		int	i;

		for (i = 0; i < N/2; i++) {
			double	logi = log(i+1)/M_LN2;

			Lmags[i] = logi*sqrt(creal(LFFT[i+1])*creal(LFFT[i+1]) + cimag(LFFT[i+1])*cimag(LFFT[i+1]))/(N/2);
			Rmags[i] = logi*sqrt(creal(RFFT[i+1])*creal(RFFT[i+1]) + cimag(RFFT[i+1])*cimag(RFFT[i+1]))/(N/2);
		}
		xapple_sample(_buf, Lmags, Rmags);
	}
}

void	magic_end(void) {
	fftw_free(LPCMin);
	fftw_free(LFFT);
	fftw_destroy_plan(PCM2LFFT);

	fftw_free(RPCMin);
	fftw_free(RFFT);
	fftw_destroy_plan(PCM2RFFT);

//	fftw_free(PCMout);
//	fftw_destroy_plan(FFT2PCM);

	xapple_end();
}
