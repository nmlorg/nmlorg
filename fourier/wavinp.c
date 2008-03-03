#include <assert.h>
#include <stdio.h>
#include <stdint.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <sys/soundcard.h>

typedef struct {
	unsigned char ChunkID[4];
	uint32_t ChunkSize;
	unsigned char Format[4],
		Subchunk1ID[4];
	uint32_t Subchunk1Size;
	uint16_t AudioFormat,
		NumChannels;
	uint32_t SampleRate,
		ByteRate;
	uint16_t BlockAlign,
		BitsPerSample;
	unsigned char Subchunk2ID[4];
	uint32_t Subchunk2Size;
} riff_wave_t;

static void ioctl2(int d, int request, int val) {
	int	val2 = val, ret;

	fprintf(stderr, "ioctl(d=%i, request=%#X, val=%i) -> ", d, request, val);
	ret = ioctl(d, request, &val);
	assert(ret == 0);
	fprintf(stderr, "%i\n", val);
	assert(val == val2);
}

void	magic_init(const int samplespersec, const uint32_t samplelen, const int bitspersample, const int numchannels);
void	magic_sample(const void *buf);
void	magic_end(void);

int	main(void) {
	riff_wave_t header;

	header.ChunkID[0] = 'R';
	header.ChunkID[1] = 'I';
	header.ChunkID[2] = 'F';
	header.ChunkID[3] = 'F';
	header.ChunkSize = 0xFFFFFFFF;
	header.Format[0] = 'W';
	header.Format[1] = 'A';
	header.Format[2] = 'V';
	header.Format[3] = 'E';
	header.Subchunk1ID[0] = 'f';
	header.Subchunk1ID[1] = 'm';
	header.Subchunk1ID[2] = 't';
	header.Subchunk1ID[3] = ' ';
	header.Subchunk1Size = 16;
	header.AudioFormat = 1;
	header.NumChannels = 1;
	header.SampleRate = 44100;
	header.BitsPerSample = 16;
	header.ByteRate = header.SampleRate*(header.BitsPerSample/8)*header.NumChannels;
	header.BlockAlign = 4;
	header.Subchunk2ID[0] = 'd';
	header.Subchunk2ID[1] = 'a';
	header.Subchunk2ID[2] = 't';
	header.Subchunk2ID[3] = 'a';
	header.Subchunk2Size = 0xFFFFFFFF;

	write(STDOUT_FILENO, &header, sizeof(header));

	{
		int	dspfd;
		unsigned char buf[header.ByteRate/40];
		uint32_t ret = 1;

		printf("open(pathname=\"%s\", flags=%i)\n", "/dev/dsp", O_RDONLY);
		dspfd = open("/dev/dsp", O_RDONLY);
		assert(dspfd >= 0);

		ioctl2(dspfd, SNDCTL_DSP_SETFMT, AFMT_S16_NE);
		ioctl2(dspfd, SNDCTL_DSP_SPEED, header.SampleRate);
		ioctl2(dspfd, SNDCTL_DSP_STEREO, 0);
		ioctl2(dspfd, SNDCTL_DSP_SETFRAGMENT, 0x0007 | ((sizeof(buf)/(1 << 8) + 1) << 16));
		ioctl2(dspfd, SOUND_PCM_READ_BITS, header.BitsPerSample);
		ioctl2(dspfd, SOUND_PCM_READ_CHANNELS, header.NumChannels);
		ioctl2(dspfd, SOUND_PCM_READ_RATE, header.SampleRate);

		while (ret)
		{
			ret = read(dspfd, buf, sizeof(buf));
			write(STDOUT_FILENO, buf, ret);
		}

		close(dspfd);
	}

	return(0);
}
