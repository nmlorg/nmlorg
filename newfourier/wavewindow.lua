do
	wavewin = ffs.draw.window.create(520, 0, 500, 230, "Waveforms")

	ffs.draw.register(function(waveform, transform)
		local COLS, LINES = ffs.draw.window.width(wavewin), ffs.draw.window.height(wavewin)

		assert(COLS > 0)
		assert(LINES > 0)

		ffs.draw.window.pick(wavewin)
		ffs.draw.window.clear()

		for i = 1,COLS do
			local left = (ffs.waveform.zeropoint and LINES/2 or 0)+LINES/2*waveform.L[math.floor(#waveform.L*i/COLS)]/ffs.waveform.maxval
			local right = (ffs.waveform.zeropoint and LINES/2 or 0)+LINES/2*waveform.R[math.floor(#waveform.R*i/COLS)]/ffs.waveform.maxval

			if i > 1 then
				local lleft = (ffs.waveform.zeropoint and LINES/2 or 0)+LINES/2*waveform.L[math.floor(#waveform.L*(i-1)/COLS)]/ffs.waveform.maxval
				local lright = (ffs.waveform.zeropoint and LINES/2 or 0)+LINES/2*waveform.R[math.floor(#waveform.R*(i-1)/COLS)]/ffs.waveform.maxval

				ffs.draw.linewidth(5.0)
				ffs.draw.shape.lines()
					ffs.draw.color(255, 0, 0, 0.2)
					--ffs.draw.vertex(i/2, lleft-LINES/4, -1)
					--ffs.draw.vertex(i/2, left-LINES/4, -1)
					ffs.draw.vertex(i, lleft, -1)
					ffs.draw.vertex(i, left, -1)

					ffs.draw.color(0, 0, 255, 0.2)
					--ffs.draw.vertex(COLS/2+i/2, lright-LINES/4, -1)
					--ffs.draw.vertex(COLS/2+i/2, right-LINES/4, -1)
					ffs.draw.vertex(i, lright, -1)
					ffs.draw.vertex(i, right, -1)
				ffs.draw.shape.done()
				ffs.draw.linewidth(1.0)
			end
		end

		ffs.draw.window.refresh(wavewin)
	end)
end
