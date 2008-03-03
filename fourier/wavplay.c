#include <assert.h>
#include <stdio.h>
#include <stdint.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <sys/soundcard.h>

const int samplespersec = 20;

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

	printf("ioctl(d=%i, request=%#X, val=%i)\n", d, request, val);
	ret = ioctl(d, request, &val);
	assert(ret == 0);
	assert(val == val2);
}

void	magic_init(const int samplespersec, const uint32_t samplelen, const int bitspersample, const int numchannels);
void	magic_sample(const void *buf);
void	magic_end(void);

int	main(void) {
	riff_wave_t header;

	read(STDIN_FILENO, &header, sizeof(header));

	printf("RIFF ChunkID"		"\t\"%.4s\"\n", header.ChunkID);
	printf("RIFF ChunkSize"		"\t%u\n", header.ChunkSize);
	printf("RIFF Format"		"\t\"%.4s\"\n", header.Format);
	printf("fmt Subchunk1ID"	"\t\"%.4s\"\n", header.Subchunk1ID);
	printf("fmt Subchunk1Size"	"\t%u\n", header.Subchunk1Size);
	printf("fmt AudioFormat"	"\t%u\n", header.AudioFormat);
	printf("fmt NumChannels"	"\t%u\n", header.NumChannels);
	printf("fmt SampleRate"		"\t%u\n", header.SampleRate);
	printf("fmt ByteRate"		"\t%u\n", header.ByteRate);
	printf("fmt BlockAlign"		"\t%u\n", header.BlockAlign);
	printf("fmt BitsPerSample"	"\t%u\n", header.BitsPerSample);
	printf("data Subchunk2ID"	"\t\"%.4s\"\n", header.Subchunk2ID);
	printf("data Subchunk2Size"	"\t%u%s\n", header.Subchunk2Size, (header.Subchunk2Size == 0)?" (just reading until EOF)":(header.Subchunk2Size > 0x70000000)?" (ridiculous; just reading until EOF)":"");

	if (header.Subchunk2Size > 0x70000000)
		header.Subchunk2Size = 0;

	{
		int	dspfd, docontinue = 1;
		unsigned char buf[header.ByteRate/samplespersec];
		uint32_t len = 0;

		printf("open(pathname=\"%s\", flags=%i)\n", "/dev/dsp", O_WRONLY);
		dspfd = open("/dev/dsp", O_WRONLY);
		assert(dspfd >= 0);

		ioctl2(dspfd, SOUND_PCM_WRITE_BITS, header.BitsPerSample);
		ioctl2(dspfd, SOUND_PCM_WRITE_CHANNELS, header.NumChannels);
		ioctl2(dspfd, SOUND_PCM_WRITE_RATE, header.SampleRate);
		ioctl2(dspfd, SNDCTL_DSP_SPEED, header.SampleRate);
		ioctl2(dspfd, SNDCTL_DSP_STEREO, (header.NumChannels == 2)?1:0);
		if (header.BitsPerSample == 8)
			ioctl2(dspfd, SNDCTL_DSP_SETFMT, AFMT_U8);
		else if (header.BitsPerSample == 16)
			ioctl2(dspfd, SNDCTL_DSP_SETFMT, AFMT_S16_NE);
		ioctl2(dspfd, SNDCTL_DSP_SETFRAGMENT, 0x0008 | ((sizeof(buf)/(1 << 8) + 1) << 16));

		magic_init(samplespersec, sizeof(buf), header.BitsPerSample, header.NumChannels);

		while (((header.Subchunk2Size == 0) || (len < header.Subchunk2Size)) && docontinue) {
			ssize_t	ret = 0, ret2;

			while ((ret < sizeof(buf)) && ((header.Subchunk2Size == 0) || (len+ret < header.Subchunk2Size))) {
				ret2 = read(STDIN_FILENO, buf+ret, sizeof(buf)-ret);
				if (ret2 < 1) {
					if (header.Subchunk2Size > 0) {
						printf("unexpected end of file\n");
						close(dspfd);
						magic_end();
						return(1);
					} else {
						docontinue = 0;
						break;
					}
				}
				ret += ret2;
			}
			len += ret;
			magic_sample(buf);
			ret2 = write(dspfd, buf, ret);
			assert(ret2 == ret);
		}

		printf("\n");

		if (header.Subchunk2Size > 0) {
			len = read(STDIN_FILENO, buf, sizeof(buf));
			assert(len == 0);
		}

		ioctl(dspfd, SOUND_PCM_SYNC, NULL);

		close(dspfd);

		magic_end();
	}

	return(0);
}
