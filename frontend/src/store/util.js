/**
 * @template {HotSpot.WeakTimeStamps} T
 * @param {T} obj
 * @returns {Omit<T, "createdAt" | "updatedAt"> & HotSpot.TimeStamps}
 */

export const upgradeTimeStamps = (obj) => {
	return {
		...obj,
		createdAt: new Date(obj.createdAt),
		updatedAt: new Date(obj.updatedAt),
	};
};
