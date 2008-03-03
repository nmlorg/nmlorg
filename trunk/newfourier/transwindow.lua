do
	require("util")

	transwin = ffs.draw.window.create(520, 270, 500, 230, "Transforms")

	ffs.draw.register(function(waveform, transform)
		local COLS, LINES = ffs.draw.window.width(transwin), ffs.draw.window.height(transwin)

		assert(COLS > 0)
		assert(LINES > 0)

		ffs.draw.window.pick(transwin)
		ffs.draw.window.clear()

		for i = 1,COLS do
			local Lmag, Rmag = ffs.util.maxes(transform.L, transform.R, #transform.L*(i-1)/COLS+1, #transform.L*(i)/COLS)

			Lmag = LINES*Lmag/ffs.waveform.maxval
			Rmag = LINES*Rmag/ffs.waveform.maxval

			ffs.draw.shape.lines()
				ffs.draw.color(173, 0, 0, 0.5)
				ffs.draw.vertex(i, 0, -1)
				ffs.draw.vertex(i, Lmag, -1)

				ffs.draw.color(0, 0, 173, 0.5)
				ffs.draw.vertex(i, 0, -1)
				ffs.draw.vertex(i, Rmag, -1)
			ffs.draw.shape.done()
		end

		ffs.draw.window.refresh(transwin)
	end)
end
