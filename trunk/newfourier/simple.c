#include <complex.h>
#include <fftw3.h>
#include <math.h>

const int N = 11;

#define MAP(i,end,min,max)	(min + (1.0*i/end)*(max - min))

int	main(void) {
	double	*PCMin, *PCMout;
	fftw_complex *FFT;
	fftw_plan PCM2FFT, FFT2PCM;
	int	i;

	PCMin = fftw_malloc(sizeof(*PCMin) * N);
	FFT = fftw_malloc(sizeof(*FFT) * N);
	PCMout = fftw_malloc(sizeof(*PCMout) * N);
	PCM2FFT = fftw_plan_dft_r2c_1d(N, PCMin, FFT, FFTW_MEASURE);
	FFT2PCM = fftw_plan_dft_c2r_1d(N, FFT, PCMout, FFTW_MEASURE);

	for (i = 0; i < N; i++)
		PCMin[i] = 2*cos(MAP(i, N, 0, 2*M_PI)) + 123*cos(-M_PI/4+MAP(i, N, 0, 4*M_PI)) + 7*cos(MAP(i, N, 0, 10*M_PI));

	fftw_execute(PCM2FFT); /* repeat as needed */
	fftw_execute(FFT2PCM); /* repeat as needed */

	for (i = 0; i < N; i++)
		printf("%f\t=> %f\t+ %fi\t(%f)\t\t=> %f\n",
			creal(PCMin[i]), creal(FFT[i])/N*2, cimag(FFT[i])/N*2, sqrt(creal(FFT[i])*creal(FFT[i]) + cimag(FFT[i])*cimag(FFT[i]))/N*2, creal(PCMout[i])/N);

	printf("shifting FFT\n");

	for (i = 0; i < N; i++)
		FFT[i] = sqrt(creal(FFT[i])*creal(FFT[i]) + cimag(FFT[i])*cimag(FFT[i]));

	for (i = 0; i < N; i++)
		printf("%f\t=> %f\t+ %fi\t(%f)\t\t=> %f\n",
			creal(PCMin[i]), creal(FFT[i])/N*2, cimag(FFT[i])/N*2, sqrt(creal(FFT[i])*creal(FFT[i]) + cimag(FFT[i])*cimag(FFT[i]))/N*2, creal(PCMout[i])/N);

	printf("recomputing output\n");

	fftw_execute(FFT2PCM); /* repeat as needed */

	for (i = 0; i < N; i++)
		printf("%f\t=> %f\t+ %fi\t(%f)\t\t=> %f\n",
			creal(PCMin[i]), creal(FFT[i])/N*2, cimag(FFT[i])/N*2, sqrt(creal(FFT[i])*creal(FFT[i]) + cimag(FFT[i])*cimag(FFT[i]))/N*2, creal(PCMout[i])/N);

	fftw_destroy_plan(PCM2FFT);
	fftw_destroy_plan(FFT2PCM);
	fftw_free(PCMin);
	fftw_free(FFT);
	fftw_free(PCMout);

	return(0);
}
