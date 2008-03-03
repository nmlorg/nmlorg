ffs.util = {
	maxes = function(L, R, first, last)
		local j
		local Lmax, Rmax = L[math.floor(first)], R[math.floor(first)]

		assert(Lmax ~= nil)
		for j = math.floor(first)+1,math.ceil(last) do
			assert(L[j] ~= nil)
			if L[j] > Lmax then
				Lmax = L[j]
			end
			if R[j] > Rmax then
				Rmax = R[j]
			end
		end

		return Lmax,Rmax
	end,
}
