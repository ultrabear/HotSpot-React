export const upgradeTimeStamps = <T extends HotSpot.WeakTimeStamps>(
	obj: T,
): Omit<T, "createdAt" | "updatedAt"> & HotSpot.TimeStamps => {
	return {
		...obj,
		createdAt: new Date(obj.createdAt),
		updatedAt: new Date(obj.updatedAt),
	};
};
