export interface Review {
  id: string;
  authorCompany: string;
  authorName: string;
  rating: number;
  commentEn: string;
  commentAr: string;
  date: string;
}

export interface HotelSchedule {
  id: string;
  nameEn: string;
  nameAr: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  roomTypeId: string; // apply to this room type id (e.g. 'all' or specific room ID)
  priceOverride?: number; // custom price for this range
  inventoryOverride?: number; // custom allotment count for this range
  isBlocked?: boolean; // full blackout dates
}

export interface RoomType {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  pricePerNight: number;
  capacity: number;
  maxOccupancy: number;
  amenitiesEn: string[];
  amenitiesAr: string[];
  inventory: number; // available rooms in total
  boardTypeEn?: string;
  boardTypeAr?: string;
}

export interface Supplement {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
}

export interface Transfer {
  id: string;
  fromEn: string;
  fromAr: string;
  vehicleEn: string;
  vehicleAr: string;
  pricePerPerson: number;
}

export interface Hotel {
  id: string;
  nameEn: string;
  nameAr: string;
  destinationId: string;
  stars: number;
  rating: number;
  descriptionEn: string;
  descriptionAr: string;
  benefitsEn: string[];
  benefitsAr: string[];
  images: string[];
  lat: number;
  lng: number;
  addressEn: string;
  addressAr: string;
  basePrice: number;
  reviews: Review[];
  rooms: RoomType[];
  schedules?: HotelSchedule[];
  childPolicyEn?: string;
  childPolicyAr?: string;
  supplements?: Supplement[];
  transfers?: Transfer[];
}

export interface Destination {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelNameEn: string;
  hotelNameAr: string;
  roomTypeId: string;
  roomTypeNameEn: string;
  roomTypeNameAr: string;
  agentCompany: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  companyTaxId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'invoice';
  bookingDate: string;
  childrenCount?: number;
  childAges?: string;
  hasExtraBed?: boolean;
  transferId?: string;
  transferNameEn?: string;
  transferNameAr?: string;
  transferPrice?: number;
  boardTypeEn?: string;
  boardTypeAr?: string;
}

export type Language = 'en' | 'ar';
