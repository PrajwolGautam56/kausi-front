import { defaultContent, demoBookings } from "@/data/defaults";
import type { Booking, RateOverride, SiteContent } from "@/types";

type MemoryStore = { content: SiteContent; bookings: Booking[]; rates: RateOverride[] };
const globalStore = global as typeof globalThis & { hotelKausiStore?: MemoryStore };
export const memoryStore = globalStore.hotelKausiStore ?? {
  content: structuredClone(defaultContent),
  bookings: structuredClone(demoBookings),
  rates: [],
};
globalStore.hotelKausiStore = memoryStore;
