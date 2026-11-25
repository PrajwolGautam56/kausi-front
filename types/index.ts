export type Room = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  compareAt?: number;
  capacity: number;
  beds: string;
  size: string;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  featured?: boolean;
};

export type Package = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  priceLabel: string;
  inclusions: string[];
  badge?: string;
};

export type SiteContent = {
  hero: { eyebrow: string; title: string; subtitle: string; image: string };
  about: { eyebrow: string; title: string; description: string };
  rooms: Room[];
  packages: Package[];
  contact: {
    phone: string;
    altPhone: string;
    managementPhones: string[];
    hotlinePhones: string[];
    email: string;
    address: string;
  };
};

export type Booking = {
  id?: string;
  reference?: string;
  guestName: string;
  email: string;
  phone: string;
  roomId: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  specialRequests?: string;
  status?: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled";
  source?: "website" | "walk-in" | "phone" | "partner";
  total?: number;
  createdAt?: string;
};

export type RateOverride = {
  date: string;
  roomId: string;
  price: number;
  availableRooms: number;
  closed?: boolean;
};
