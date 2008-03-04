#include <ao/ao.h>
#include <assert.h>
#include <stdio.h>
#include <stdint.h>
#include <unistd.h>
#include <fcntl.h>

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
		int	docontinue = 1;
		unsigned char buf[header.ByteRate/samplespersec];
		uint32_t len = 0;
		ao_device *dev;
		ao_sample_format sample_format;
		ao_option options[] = {
			{ "buf_time", "30", NULL },
		};

		ao_initialize();
		sample_format.bits = header.BitsPerSample;
		sample_format.rate = header.SampleRate;
		sample_format.channels = header.NumChannels;
		sample_format.byte_format = AO_FMT_NATIVE;
		dev = ao_open_live(ao_driver_id("alsa09"), &sample_format, options);

		magic_init(samplespersec, sizeof(buf), header.BitsPerSample, header.NumChannels);

		while (((header.Subchunk2Size == 0) || (len < header.Subchunk2Size)) && docontinue) {
			ssize_t	ret = 0, ret2;

			while ((ret < sizeof(buf)) && ((header.Subchunk2Size == 0) || (len+ret < header.Subchunk2Size))) {
				ret2 = read(STDIN_FILENO, buf+ret, sizeof(buf)-ret);
				if (ret2 < 1) {
					if (header.Subchunk2Size > 0) {
						printf("unexpected end of file\n");
						ao_close(dev);
						dev = NULL;
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
			ret2 = ao_play(dev, buf, ret);
			assert(ret2 != 0);
			magic_sample(buf);
		}

		printf("\n");

		if (header.Subchunk2Size > 0) {
			len = read(STDIN_FILENO, buf, sizeof(buf));
			assert(len == 0);
		}

		//ioctl(dspfd, SOUND_PCM_SYNC, NULL);

		ao_close(dev);
		dev = NULL;

		magic_end();
	}

	return(0);
}
