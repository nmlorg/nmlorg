do
	require("util")

	window = ffs.draw.window.create(0, 0, 500, 500, "Fun")
	params = {
		flecc = 300,
		lightc = ffs.draw.window.maxlights(),
	}
	lights = {}
	flecs = {}

	for i = 1,params.lightc do
		local right, up = math.fmod(i, 2) == 1, math.fmod(math.floor(i/2), 2) == 1
		local R, G, B = math.random(0.0, 1.0), math.random(0.0, 1.0), math.random(0.0, 1.0)
		local C = R+G+B

		lights[i] = {
			right = right,
			up = up,
			x = right and 0 or ffs.draw.window.width(window),
			y = up and 0 or ffs.draw.window.height(window),
			z = -50,
			R = 0.5 + R/C/2,
			G = 0.5 + G/C/2,
			B = 0.5 + B/C/2,
		}
	end

	for i = 1,params.flecc do
		local right, up = math.fmod(i, 2) == 1, math.fmod(math.floor(i/2), 2) == 1

		flecs[i] = {
			right = right,
			up = up,
			x = right and 0 or ffs.draw.window.width(window),
			y = up and 0 or ffs.draw.window.height(window),
			z = -100.0*i/params.flecc,
		}
	end

	ffs.draw.register(function(waveform, transform)
		local function bound(t, dx, left, right, dy, bottom, top)
			if t.x+dx < left then
				dx = left - t.x
				t.right = true
			elseif t.x+dx > right then
				dx = right - t.x
				t.right = false
			end

			if t.y+dy < bottom then
				dy = bottom - t.y
				t.up = true
			elseif t.y+dy > top then
				dy = top - t.y
				t.up = false
			end

			return dx,dy
		end

		local i
		local COLS, LINES = ffs.draw.window.width(window), ffs.draw.window.height(window)

		assert(COLS > 0)
		assert(LINES > 0)

		ffs.draw.window.pick(window)
		ffs.draw.window.clear()
		ffs.draw.depth.enable()
		ffs.draw.light.enable()
		ffs.draw.shade.flat()

		for i = 1,#lights do
			local Lmax, Rmax = ffs.util.maxes(transform.L, transform.R, #transform.L*(i-1)/#lights+1, #transform.L*(i)/#lights)
			local max = (Lmax > Rmax) and Lmax or Rmax
			local dx = (lights[i].right and -1 or 1)*(2.0 - Lmax/400)
			local dy = (lights[i].up and -1 or 1)*(2.0 - Rmax/400)

			dx,dy = bound(lights[i], dx, 0, COLS, dy, 0, LINES)

			lights[i].x = lights[i].x + dx
			lights[i].y = lights[i].y + dy
			lights[i].z = -90.0 + 200.0*max/ffs.waveform.maxval

			ffs.draw.light.position(i, lights[i].x, lights[i].y, lights[i].z, 1)
			--ffs.draw.light.position(i, COLS/2, LINES/2, lights[i].z)
			--ffs.draw.light.direction(i, COLS/2-lights[i].x, LINES/2-lights[i].y, -100-lights[i].z)
			ffs.draw.light.diffuse(i, lights[i].R, lights[i].G, lights[i].B)
			ffs.draw.light.specular(i, lights[i].R, lights[i].G, lights[i].B)
			ffs.draw.light.enable(i)
		end

		ffs.draw.drawquads(
			0.0, 0.0, -100.0,
			COLS, 0.0, -100.0,
			COLS, LINES, -100.0,
			0.0, LINES, -100.0)
		ffs.draw.drawquads(
			0.0, 0.0, 0.0,
			COLS, 0.0, 0.0,
			COLS, 0.0, -100.0,
			0.0, 0.0, -100.0)
		ffs.draw.drawquads(
			0.0, LINES, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, -100.0,
			0.0, LINES, -100.0)
		ffs.draw.drawquads(
			COLS, LINES, 0.0,
			0.0, LINES, 0.0,
			0.0, LINES, -100.0,
			COLS, LINES, -100.0)
		ffs.draw.drawquads(
			COLS, 0.0, 0.0,
			COLS, LINES, 0.0,
			COLS, LINES, -100.0,
			COLS, 0.0, -100.0)

		ffs.draw.light.disable()
		ffs.draw.shade.smooth()

		for i = 1,#flecs do
			local x, y, z = flecs[i].x, flecs[i].y, flecs[i].z
			local Lmag = transform.L[math.floor(math.random(1, #transform.L))]
			local Rmag = transform.R[math.floor(math.random(1, #transform.R))]
			local dx = (flecs[i].right and -1 or 1)*(3.0 - 100.0*Lmag/ffs.waveform.maxval)
			local dy = (flecs[i].up and -1 or 1)*(3.0 - 100.0*Rmag/ffs.waveform.maxval)
			local dz = 0
			local width = 2

			dx,dy = bound(flecs[i], dx, 0, COLS, dy, 0, LINES)

			ffs.draw.shape.quads()
				ffs.draw.color(flecs[i].up and 0.6 or 0.0, 1.0, flecs[i].right and 0.6 or 0.0, -0.75*z/100.0)
				ffs.draw.vertex(x+dx-width, y+dy+width, z+dz)
				ffs.draw.vertex(x+dx+width, y+dy+width, z+dz)
				ffs.draw.vertex(x+dx+width, y+dy-width, z+dz)
				ffs.draw.vertex(x+dx-width, y+dy-width, z+dz)
			ffs.draw.shape.done()

			ffs.draw.shape.lines()
				ffs.draw.vertex(x+dx, y+dy, z+dz)
				ffs.draw.color(flecs[i].up and 0.6 or 0.0, 1.0, flecs[i].right and 0.6 or 0.0, 0.0)
				ffs.draw.vertex(x, y, z)
			ffs.draw.shape.done()

			flecs[i].x = flecs[i].x + dx
			flecs[i].y = flecs[i].y + dy
			flecs[i].z = flecs[i].z + dz
		end

		ffs.draw.linewidth(4.0)
		ffs.draw.shape.lines()
		for i = 1,#lights do
			--ffs.draw.color(lights[i].R, lights[i].G, lights[i].B)
			--ffs.draw.vertex(lights[i].x, lights[i].y, lights[i].z)
			--ffs.draw.vertex(lights[i].x, lights[i].y, lights[i].z-1000.0)
			ffs.draw.color(lights[i].R, lights[i].G, lights[i].B, 0.0)
			ffs.draw.vertex(COLS/2, LINES/2, lights[i].z)
			ffs.draw.color(lights[i].R, lights[i].G, lights[i].B, 0.5)
			ffs.draw.vertex(lights[i].x, lights[i].y, -100)
		end
		ffs.draw.shape.done()
		ffs.draw.linewidth(1.0)
		ffs.draw.depth.disable()

		ffs.draw.window.refresh(window)
	end)
end
