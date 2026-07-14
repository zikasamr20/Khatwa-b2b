import React, { useState } from 'react';
import { 
  Star, ArrowLeft, ShieldAlert, CheckCircle, Calendar, Users, Percent,
  CreditCard, Award, FileText, Send, Building2, User, Mail, Phone,
  ChevronLeft, ChevronRight, Check, Baby, Car, HelpCircle, Clock
} from 'lucide-react';
import { Hotel, RoomType, Booking, Language, Review } from '../types';
import { translations } from '../translations';
import { InteractiveMap } from './InteractiveMap';

interface HotelDetailProps {
  hotel: Hotel;
  lang: Language;
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
  onAddReview: (hotelId: string, review: Review) => void;
  bookings?: Booking[];
}

export const HotelDetail: React.FC<HotelDetailProps> = ({
  hotel,
  lang,
  onBack,
  onNewBooking,
  onAddReview,
  bookings = []
}) => {
  const t = translations[lang];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  // Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [checkIn, setCheckIn] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState<string>(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'invoice'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<Booking | null>(null);

  // Review Form State
  const [reviewerCompany, setReviewerCompany] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Auto calculate nights and pricing
  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : diffDays;
  };

  const nights = getNights();

  const getRoomPriceForDates = (roomId: string, inDateStr: string, outDateStr: string) => {
    const room = hotel.rooms.find(r => r.id === roomId);
    if (!room) return { total: 0, avg: 0, nights: 0, available: 0, isBlocked: true };
    if (!inDateStr || !outDateStr) return { total: room.pricePerNight, avg: room.pricePerNight, nights: 1, available: room.inventory, isBlocked: false };
    
    const start = new Date(inDateStr);
    const end = new Date(outDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return { total: 0, avg: 0, nights: 0, available: 0, isBlocked: true };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let total = 0;
    let minAllot = Infinity;
    let anyBlocked = false;

    for (let i = 0; i < numNights; i++) {
      const current = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const curStr = current.toISOString().split('T')[0];

      const dailyBookings = (bookings || []).filter(b => {
        if (b.hotelId !== hotel.id || b.roomTypeId !== roomId || b.status === 'cancelled') return false;
        const bIn = new Date(b.checkIn).getTime();
        const bOut = new Date(b.checkOut).getTime();
        const curTime = current.getTime();
        return curTime >= bIn && curTime < bOut;
      });

      const override = hotel.schedules?.find(sched => {
        const isDateInRange = curStr >= sched.startDate && curStr <= sched.endDate;
        const isRoomMatching = sched.roomTypeId === 'all' || sched.roomTypeId === roomId;
        return isDateInRange && isRoomMatching;
      });

      const dayPrice = override?.priceOverride !== undefined ? override.priceOverride : room.pricePerNight;
      const dayInventory = override?.inventoryOverride !== undefined ? override.inventoryOverride : room.inventory;
      const isBlocked = !!override?.isBlocked;

      const dayAllotment = isBlocked ? 0 : Math.max(0, dayInventory - dailyBookings.length);

      if (isBlocked) anyBlocked = true;
      if (dayAllotment < minAllot) minAllot = dayAllotment;

      total += dayPrice;
    }

    return {
      total,
      avg: numNights > 0 ? Math.round((total / numNights) * 100) / 100 : 0,
      nights: numNights,
      available: minAllot === Infinity ? 0 : minAllot,
      isBlocked: anyBlocked
    };
  };

  // Children & Transfer Booking Options
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAges, setChildAges] = useState('');
  const [hasExtraBed, setHasExtraBed] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string>('none');

  const pricingDetail = selectedRoom ? getRoomPriceForDates(selectedRoom.id, checkIn, checkOut) : null;
  
  const hotelTransfers = hotel.transfers && hotel.transfers.length > 0 ? hotel.transfers : [
    { id: 'trans-1', fromEn: 'Cairo International Airport (Private Car)', fromAr: 'مطار القاهرة الدولي (سيارة خاصة)', price: 35 },
    { id: 'trans-2', fromEn: 'Hurghada Airport (VIP Limousine)', fromAr: 'مطار الغردقة الدولي (سيارة ليموزين)', price: 45 },
    { id: 'trans-3', fromEn: 'Sharm El Sheikh Airport (Mini-Van Group)', fromAr: 'مطار شرم الشيخ (حافلة صغيرة للمجموعات)', price: 60 }
  ];
  
  const selectedTransfer = hotelTransfers.find(t => t.id === selectedTransferId);
  const transferPriceValue = selectedTransfer ? selectedTransfer.price : 0;
  const extraBedPriceValue = hasExtraBed ? 25 * nights : 0;
  const baseRoomTotal = pricingDetail ? pricingDetail.total : 0;
  const totalPrice = baseRoomTotal + transferPriceValue + extraBedPriceValue;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !checkIn || !checkOut || !agencyName || !agentName || !agentEmail || !agentPhone || !taxId) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة لشركتكم.' : 'Please fill all required corporate details.');
      return;
    }

    const bookingId = 'B2B-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0');

    const newBooking: Booking = {
      id: bookingId,
      hotelId: hotel.id,
      hotelNameEn: hotel.nameEn,
      hotelNameAr: hotel.nameAr,
      roomTypeId: selectedRoom.id,
      roomTypeNameEn: selectedRoom.nameEn,
      roomTypeNameAr: selectedRoom.nameAr,
      agentCompany: agencyName,
      agentName: agentName,
      agentEmail: agentEmail,
      agentPhone: agentPhone,
      companyTaxId: taxId,
      checkIn: checkIn,
      checkOut: checkOut,
      guestsCount: guestsCount,
      totalPrice: totalPrice,
      status: 'pending', // sent to the admin dashboard for booking confirmation
      paymentStatus: 'unpaid',
      paymentMethod: paymentMethod,
      bookingDate: formattedDate,
      childrenCount: childrenCount,
      childAges: childAges,
      hasExtraBed: hasExtraBed,
      transferId: selectedTransferId !== 'none' ? selectedTransferId : undefined,
      transferNameEn: selectedTransfer?.fromEn,
      transferNameAr: selectedTransfer?.fromAr,
      transferPrice: selectedTransfer?.price,
      boardTypeEn: selectedRoom.boardTypeEn,
      boardTypeAr: selectedRoom.boardTypeAr
    };

    onNewBooking(newBooking);
    setBookingSuccessData(newBooking);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerCompany || !reviewerName || !reviewComment) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم الشركة والاسم والتعليق.' : 'Please fill out company, agent name and review text.');
      return;
    }

    const newReview: Review = {
      id: 'rev-' + Math.floor(1000 + Math.random() * 9000),
      authorCompany: reviewerCompany,
      authorName: reviewerName,
      rating: reviewRating,
      commentEn: lang === 'en' ? reviewComment : '',
      commentAr: lang === 'ar' ? reviewComment : '',
      date: new Date().toISOString().split('T')[0]
    };

    // Fallback translation if user enters comments in one language
    if (lang === 'en') {
      newReview.commentAr = reviewComment;
    } else {
      newReview.commentEn = reviewComment;
    }

    onAddReview(hotel.id, newReview);
    setReviewerCompany('');
    setReviewerName('');
    setReviewComment('');
    alert(t.alertNewReview);
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev + 1) % hotel.images.length);
  };

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  const isRtl = lang === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-550 hover:text-slate-800 transition-colors mb-6 cursor-pointer group bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 shadow-xs"
      >
        <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
        <span className="font-medium text-sm">{t.backToHotels}</span>
      </button>

      {/* Grid: Images and Fast specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Col: Images Slideshow */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
            <img
              src={hotel.images[activeImage]}
              alt={lang === 'ar' ? hotel.nameAr : hotel.nameEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
            
            {/* Arrows */}
            {hotel.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-full shadow-xs">
              {hotel.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeImage ? 'bg-amber-500 w-4' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {hotel.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden border shrink-0 transition-all ${
                  idx === activeImage ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-350'
                }`}
              >
                <img src={img} alt="hotel-thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Quick specs, rating & address */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div>
            {/* Stars & Rating */}
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 text-slate-600 text-sm">
                <span className="font-bold text-slate-900 text-base">{hotel.rating}</span>
                <span>/ 5 ({hotel.reviews.length} {t.reviewCount})</span>
              </div>
            </div>

            {/* Hotel Title */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              {isRtl ? hotel.nameAr : hotel.nameEn}
            </h1>
            <p className="text-slate-550 font-mono text-xs mt-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {isRtl ? hotel.addressAr : hotel.addressEn}
            </p>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mt-5 border-t border-slate-100 pt-5">
              {isRtl ? hotel.descriptionAr : hotel.descriptionEn}
            </p>
          </div>

          {/* Perks list */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-600 font-bold mb-3">
              {t.hotelBenefits}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {(isRtl ? hotel.benefitsAr : hotel.benefitsEn).map((perk, i) => (
                <li key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Available Room Types & Rates Grid */}
      <section className="mb-10 space-y-8" id="rooms-and-rates-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h3 className="text-2xl font-bold text-slate-900">
              {t.roomsAndRates}
            </h3>
          </div>
          
          {/* Active Date Selection Panel */}
          <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
            <span className="text-amber-700 uppercase tracking-wider font-extrabold">{isRtl ? 'تواريخ الاستعلام الحالية:' : 'Live Rate Query Dates:'}</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-medium">{isRtl ? 'من:' : 'In:'}</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-white border border-slate-250 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-medium">{isRtl ? 'إلى:' : 'Out:'}</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="bg-white border border-slate-250 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            {nights > 0 && (
              <span className="bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-black font-mono">
                {nights} {isRtl ? 'ليالي' : 'Nights'}
              </span>
            )}
          </div>
        </div>

        {/* SECTION A: Live Interactive Room Rates Directory Table for specified dates */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="text-amber-400 w-5 h-5" />
                {isRtl ? 'جدول أسعار وتوافر الغرف الفوري بالتواريخ المحددة' : 'Direct Room Rates & Availability Lookup Table'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isRtl 
                  ? 'أسعار حصرية محدثة بالوقت الفعلي شاملة جميع الخصومات وفترات المواسم للتواريخ المختارة.' 
                  : 'Instant corporate rate calculations including active seasonal promotions and direct allotments for chosen dates.'}
              </p>
            </div>
            <div className="bg-amber-400/10 border border-amber-400/25 px-3 py-1.5 rounded-xl text-[10px] text-amber-300 font-mono uppercase tracking-widest font-black self-start">
              {isRtl ? 'تحديث مباشر GDS' : 'GDS Live Sync'}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="min-w-full divide-y divide-slate-800 text-center text-xs text-slate-300">
              <thead className="bg-slate-800 font-black text-xs text-amber-400 border-b border-slate-700 tracking-wider">
                <tr>
                  <th className={`px-5 py-4 font-black ${isRtl ? 'text-right pr-6' : 'text-left pl-6'}`}>{isRtl ? 'نوع الغرفة المتعاقد عليها' : 'Contracted Room Type'}</th>
                  <th className="px-5 py-4 font-black">{isRtl ? 'السعة القصوى' : 'Max Occupancy'}</th>
                  <th className="px-5 py-4 font-black">{isRtl ? 'سعر العقد القياسي' : 'Standard Rate'}</th>
                  <th className="px-5 py-4 font-black text-white">{isRtl ? 'متوسط السعر للفترة' : 'Selected Avg Price'}</th>
                  <th className="px-5 py-4 font-black text-emerald-400">{isRtl ? 'الإجمالي الكلي ($)' : 'Total Price ($)'}</th>
                  <th className="px-5 py-4 font-black">{isRtl ? 'المقاعد المتاحة فورا' : 'Instant Allotment'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {hotel.rooms.map((room) => {
                  const pricing = getRoomPriceForDates(room.id, checkIn, checkOut);
                  return (
                    <tr key={room.id} className="hover:bg-slate-900/45 transition-colors">
                      <td className={`px-5 py-4.5 ${isRtl ? 'text-right pr-6' : 'text-left pl-6'}`}>
                        <span className="font-extrabold text-white text-sm block">
                          {isRtl ? room.nameAr : room.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-500 block max-w-sm truncate mt-0.5" title={isRtl ? room.descriptionAr : room.descriptionEn}>
                          {isRtl ? room.descriptionAr : room.descriptionEn}
                        </span>
                        {room.boardTypeEn && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 font-sans">
                              {isRtl ? `نوع الإقامة: ${room.boardTypeAr || room.boardTypeEn}` : `Board: ${room.boardTypeEn}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4.5 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-slate-300">{room.maxOccupancy}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4.5 font-mono text-slate-400">
                        ${room.pricePerNight} / {isRtl ? 'ليلة' : 'night'}
                      </td>
                      <td className="px-5 py-4.5">
                        {pricing.isBlocked ? (
                          <span className="text-rose-500 font-extrabold text-xs bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded">
                            {isRtl ? 'مغلق' : 'Blackout'}
                          </span>
                        ) : (
                          <span className="font-mono text-amber-300 font-extrabold">
                            ${pricing.avg} / {isRtl ? 'ليلة' : 'night'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4.5 font-mono">
                        {pricing.isBlocked ? (
                          <span className="text-slate-600">—</span>
                        ) : (
                          <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded">
                            ${pricing.total}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4.5 font-mono">
                        {pricing.isBlocked ? (
                          <span className="text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded">✕ {isRtl ? 'مغلق' : 'Blocked'}</span>
                        ) : pricing.available === 0 ? (
                          <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">{isRtl ? 'غير متاح' : 'Sold Out'}</span>
                        ) : (
                          <span className="text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                            {pricing.available} {isRtl ? 'غرف' : 'rooms'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION B: Child Policies & Airport Transfers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Child Accommodation Policy */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Baby className="text-amber-500 w-5 h-5 shrink-0" />
                <h4 className="text-lg font-bold text-slate-900">
                  {isRtl ? 'سياسات إقامة الأطفال للشركات' : 'Corporate Child Accommodation Policies'}
                </h4>
              </div>
              <p className="text-xs text-slate-550 mt-2 leading-relaxed font-semibold">
                {isRtl 
                  ? 'الشروط المعتمدة لإقامة الأطفال في الغرف مع ذويهم والأسرة الإضافية:'
                  : 'Approved terms and discount structures for child occupancy on standard agency contracts:'}
              </p>

              {/* Policy detail display */}
              <div className="mt-4 bg-slate-50 border border-slate-150 rounded-2xl p-4.5 text-xs text-slate-700 leading-relaxed font-semibold">
                {isRtl ? (
                  hotel.childPolicyAr ? (
                    <p className="whitespace-pre-line">{hotel.childPolicyAr}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">مجاناً</span>
                        <p>الأطفال أقل من ٦ سنوات مجاناً في نفس الغرفة مع الوالدين (بحد أقصى طفلين).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">خصم ٥٠٪</span>
                        <p>الأطفال من سن ٦ سنوات إلى ١١.٩٩ سنة يحصلون على خصم ٥٠٪ من سعر الفرد البالغ.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">كامل</span>
                        <p>الأطفال من سن ١٢ سنة فما فوق يعاملون كأشخاص بالغين ويحتسب لهم سعر فرد كامل.</p>
                      </div>
                    </div>
                  )
                ) : (
                  hotel.childPolicyEn ? (
                    <p className="whitespace-pre-line">{hotel.childPolicyEn}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">FREE</span>
                        <p>Children under 6 years stay free of charge in parents room using existing bedding (max 2 children).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">50% OFF</span>
                        <p>Children from 6 to 11.99 years receive a 50% discount from the standard adult room pricing.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-black font-mono text-[9px] uppercase">FULL</span>
                        <p>Children aged 12 years and above are charged the full adult corporate rate.</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] p-3 rounded-xl font-semibold">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isRtl 
                  ? 'يمكن طلب أسرّة إضافية للأطفال مباشرة من نموذج تأكيد الحجز.'
                  : 'Extra baby cots and child beds can be specified directly inside the reservation card.'}
              </span>
            </div>
          </div>

          {/* Airport & Ground Transportation Rates */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="text-amber-500 w-5 h-5 shrink-0" />
                <h4 className="text-lg font-bold text-slate-900">
                  {isRtl ? 'أسعار وعروض خدمات النقل المتعاقد عليها' : 'Contracted Airport & Ground Transfers'}
                </h4>
              </div>
              <p className="text-xs text-slate-550 mt-2 leading-relaxed font-semibold">
                {isRtl 
                  ? 'خدمات النقل البري المعتمدة بأسعار الجملة الصافية لوكالتكم مباشرة للفندق:'
                  : 'Pre-negotiated wholesale transfer rates available for your agency delegates directly to this hotel:'}
              </p>

              {/* Transfers directory display */}
              <div className="mt-4 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50">
                <table className="min-w-full text-xs text-slate-700 text-center font-semibold">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[10px] text-slate-500 font-mono uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left pl-5">{isRtl ? 'خط السير / نقطة الانطلاق' : 'Route / Starting Point'}</th>
                      <th className="px-4 py-2 text-right pr-5">{isRtl ? 'السعر الصافي ($)' : 'Wholesale Net Rate ($)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-semibold">
                    {hotel.transfers && hotel.transfers.length > 0 ? (
                      hotel.transfers.map((tr) => (
                        <tr key={tr.id} className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-2.5 text-left pl-5 text-slate-900 font-extrabold">
                            {isRtl ? tr.fromAr : tr.fromEn}
                          </td>
                          <td className="px-4 py-2.5 text-right pr-5 font-mono font-black text-amber-700">
                            ${tr.price}
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Fallback Standard Transfers list */
                      <>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-2.5 text-left pl-5 text-slate-900 font-extrabold">
                            {isRtl ? 'مطار القاهرة الدولي (سيارة خاصة)' : 'Cairo International Airport (Private Car)'}
                          </td>
                          <td className="px-4 py-2.5 text-right pr-5 font-mono font-black text-amber-700">
                            $35
                          </td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-2.5 text-left pl-5 text-slate-900 font-extrabold">
                            {isRtl ? 'مطار الغردقة الدولي (سيارة ليموزين)' : 'Hurghada Airport (VIP Limousine)'}
                          </td>
                          <td className="px-4 py-2.5 text-right pr-5 font-mono font-black text-amber-700">
                            $45
                          </td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-2.5 text-left pl-5 text-slate-900 font-extrabold">
                            {isRtl ? 'مطار شرم الشيخ (حافلة صغيرة للمجموعات)' : 'Sharm El Sheikh Airport (Mini-Van Group)'}
                          </td>
                          <td className="px-4 py-2.5 text-right pr-5 font-mono font-black text-amber-700">
                            $60
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] px-3.5 py-2.5 rounded-xl font-semibold">
              ℹ️ {isRtl 
                ? 'جميع أسعار النقل هي أسعار جملة صافية شاملة الضرائب ومستحقات السائق.'
                : 'All transfer pricing is net inclusive of tax, luggage assistance, and direct toll gate fees.'}
            </div>
          </div>
          
          {/* Contract Supplements & Board Upgrades */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Check className="text-amber-500 w-5 h-5 shrink-0" />
                <h4 className="text-lg font-bold text-slate-900">
                  {isRtl ? 'الإضافات والترقيات التعاقدية' : 'Contract Supplements & Upgrades'}
                </h4>
              </div>
              <p className="text-xs text-slate-550 mt-2 leading-relaxed font-semibold">
                {isRtl 
                  ? 'خيارات الوجبات والترقيات الإضافية المتاحة بأسعار صافية للفرد بالليلة:'
                  : 'Board supplements and contract upgrades available at wholesale net rates per night:'}
              </p>

              {/* Supplements directory display */}
              <div className="mt-4 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50">
                <table className="min-w-full text-xs text-slate-700 text-center font-semibold">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[10px] text-slate-500 font-mono uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left pl-5">{isRtl ? 'نوع الترقية / الإضافة' : 'Supplement / Upgrade Option'}</th>
                      <th className="px-4 py-2 text-right pr-5">{isRtl ? 'السعر الصافي ($)' : 'Wholesale Net Rate ($)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-semibold">
                    {hotel.supplements && hotel.supplements.length > 0 ? (
                      hotel.supplements.map((sp) => (
                        <tr key={sp.id} className="hover:bg-white/40 transition-colors">
                          <td className="px-4 py-2.5 text-left pl-5 text-slate-900 font-extrabold">
                            {isRtl ? sp.nameAr : sp.nameEn}
                          </td>
                          <td className="px-4 py-2.5 text-right pr-5 font-mono font-black text-amber-700">
                            ${sp.price}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-slate-400 text-center">
                          {isRtl ? 'لا توجد إضافات تعاقدية حالياً لهذا الفندق' : 'No contract supplements configured for this hotel'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] px-3.5 py-2.5 rounded-xl font-semibold">
              ℹ️ {isRtl 
                ? 'تطبق أسعار الإضافات والترقيات الصافية لكل شخص بالليلة الواحدة.'
                : 'Board supplements are quoted net per person per night unless otherwise specified.'}
            </div>
          </div>
        </div>

      </section>

      {/* Grid: Map and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive map */}
        <div className="lg:col-span-7">
          <InteractiveMap
            lat={hotel.lat}
            lng={hotel.lng}
            hotelName={isRtl ? hotel.nameAr : hotel.nameEn}
            address={isRtl ? hotel.addressAr : hotel.addressEn}
            lang={lang}
          />
        </div>

        {/* Agency reviews */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              {t.reviewsTitle}
            </h4>

            {/* Existing reviews list */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {hotel.reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs text-slate-700">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{rev.authorCompany}</span>
                      <span className="text-slate-450 ml-2">({rev.authorName})</span>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{isRtl ? rev.commentAr : rev.commentEn}"
                  </p>
                  <span className="block text-[10px] text-slate-450 font-mono mt-2 text-right">
                    {rev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add a review */}
          <form onSubmit={handleReviewSubmit} className="mt-6 border-t border-slate-100 pt-5">
            <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-500" />
              {t.addReview}
            </h5>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder={t.reviewAuthorPlaceholder}
                value={reviewerCompany}
                onChange={(e) => setReviewerCompany(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                required
              />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'مسؤول الحجز' : 'Agent Name'}
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                required
              />
            </div>

            {/* Star selector */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500">{t.ratingLabel}:</span>
              <div className="flex gap-1 text-slate-300">
                {[1, 2, 3, 4, 5].map((starsCount) => (
                  <button
                    type="button"
                    key={starsCount}
                    onClick={() => setReviewRating(starsCount)}
                    className="cursor-pointer transition-colors"
                  >
                    <Star className={`w-4 h-4 ${starsCount <= reviewRating ? 'text-amber-400 fill-current' : 'hover:text-amber-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              placeholder={t.reviewCommentPlaceholder}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full resize-none mb-3"
              required
            ></textarea>

            <button
              type="submit"
              className="w-full bg-slate-900 border border-slate-800 text-white font-semibold py-2 px-4 rounded-xl hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            >
              {t.submitReview}
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Booking Dialog / Slideover Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="text-amber-600 w-5 h-5" />
                  {t.bookDirect}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl ? hotel.nameAr : hotel.nameEn} • {isRtl ? selectedRoom.nameAr : selectedRoom.nameEn}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccessData(null);
                }}
                className="text-slate-450 hover:text-slate-800 font-bold cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccessData ? (
              /* Success / Invoice Screen */
              <div className="p-8 text-center bg-white text-slate-700">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Clock className="w-8 h-8 text-amber-650" />
                </div>
                <h4 className="text-2xl font-extrabold text-slate-900">
                  {lang === 'ar' ? 'تم إرسال طلب الحجز بنجاح!' : 'Booking Request Submitted!'}
                </h4>
                <p className="text-slate-550 text-sm mt-1.5">
                  {lang === 'ar'
                    ? 'تم إرسال طلب الحجز بنجاح إلى لوحة التحكم للإدارة لمراجعته وتأكيده. رقم الطلب الخاص بك هو:'
                    : 'Your booking request has been successfully submitted to the admin dashboard for review. Your request ID is:'} <span className="text-amber-600 font-mono font-bold">{bookingSuccessData.id}</span>
                </p>

                {/* Invoice Ticket */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left font-mono text-xs text-slate-700 max-w-md mx-auto my-6 space-y-2" dir="ltr">
                  <div className="text-center font-bold text-slate-800 border-b border-dashed border-slate-200 pb-3 mb-3 uppercase tracking-wider">
                    {t.appName} Booking Request Ticket (PENDING)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">STATUS:</span>
                    <span className="text-amber-650 font-black">PENDING REVIEW / معلق</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">AGENCY:</span>
                    <span className="text-slate-900 font-bold">{bookingSuccessData.agentCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">TAX ID/CR:</span>
                    <span className="text-slate-800">{bookingSuccessData.companyTaxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">HOTEL:</span>
                    <span className="text-slate-800">{bookingSuccessData.hotelNameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">ROOM TYPE:</span>
                    <span className="text-slate-800">{bookingSuccessData.roomTypeNameEn}</span>
                  </div>
                  {bookingSuccessData.boardTypeEn && (
                    <div className="flex justify-between">
                      <span className="text-slate-450">BOARD BASIS:</span>
                      <span className="text-slate-900 font-bold">{bookingSuccessData.boardTypeEn} ({bookingSuccessData.boardTypeAr || '—'})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-450">CHECK IN:</span>
                    <span className="text-slate-800">{bookingSuccessData.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">CHECK OUT:</span>
                    <span className="text-slate-800">{bookingSuccessData.checkOut}</span>
                  </div>
                  {bookingSuccessData.childrenCount && bookingSuccessData.childrenCount > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-450">CHILDREN:</span>
                        <span className="text-slate-800">{bookingSuccessData.childrenCount} ({bookingSuccessData.childAges} yrs)</span>
                      </div>
                      {bookingSuccessData.hasExtraBed && (
                        <div className="flex justify-between">
                          <span className="text-slate-450">EXTRA BED:</span>
                          <span className="text-amber-600 font-bold">YES (+$25/NIGHT)</span>
                        </div>
                      )}
                    </>
                  ) : null}
                  {bookingSuccessData.transferId && (
                    <div className="flex justify-between">
                      <span className="text-slate-450">TRANSFER:</span>
                      <span className="text-slate-800 truncate max-w-[220px]" title={bookingSuccessData.transferNameEn}>{bookingSuccessData.transferNameEn} (+${bookingSuccessData.transferPrice})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-450">PAYMENT METHOD:</span>
                    <span className="text-amber-600 font-bold uppercase">{bookingSuccessData.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-3 mt-3 flex justify-between text-base font-bold text-slate-900">
                    <span>TOTAL AMOUNT:</span>
                    <span className="text-emerald-600 font-black">${bookingSuccessData.totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingSuccessData(null);
                    onBack(); // back to listing
                  }}
                  className="bg-amber-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm cursor-pointer shadow-sm animate-pulse"
                >
                  {lang === 'ar' ? 'الرجوع للقائمة والتحقق من لوحة التحكم' : 'Done, Return to Listings'}
                </button>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-5 max-h-[500px] overflow-y-auto text-slate-700 bg-white">
                <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-xs text-amber-850 leading-relaxed">
                    {t.b2bNotice}
                  </span>
                </div>

                {/* Section 1: Agency Credentials */}
                <div>
                  <h4 className="text-xs font-mono uppercase text-amber-600 font-bold tracking-wider mb-3 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {t.agencyDetails}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.agencyName} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="e.g. Egypt Holidays Ltd"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.companyTaxId} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="e.g. CR-908123-EG"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.agentName} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g. Sherif Aly"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.agentPhone} <span className="text-rose-500">*</span></label>
                      <input
                        type="tel"
                        value={agentPhone}
                        onChange={(e) => setAgentPhone(e.target.value)}
                        placeholder="e.g. +20 100 123 4567"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full font-mono"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-550 text-xs mb-1.5">{t.agentEmail} <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        value={agentEmail}
                        onChange={(e) => setAgentEmail(e.target.value)}
                        placeholder="e.g. reservations@agency.com"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Dates & Occupancy */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-mono uppercase text-amber-600 font-bold tracking-wider mb-3 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {t.selectDates}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.checkIn} <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.checkOut} <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{t.guestsCount}</label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                      >
                        {Array.from({ length: selectedRoom.maxOccupancy }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {lang === 'ar' ? 'ضيوف' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2.5: Children & Ground Transfer Extras */}
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <h4 className="text-xs font-mono uppercase text-amber-600 font-bold tracking-wider mb-3 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-amber-500" />
                    {lang === 'ar' ? 'سياسات إقامة الأطفال والخدمات الإضافية' : 'Children Policies & Extra Services'}
                  </h4>

                  {/* Child Policies Info Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed font-semibold">
                    <span className="font-bold text-amber-700 block mb-1">
                      {lang === 'ar' ? '💡 سياسة إقامة الأطفال بهذا الفندق:' : '💡 Hotel Child Accommodation Rules:'}
                    </span>
                    {lang === 'ar' ? (
                      hotel.childPolicyAr ? hotel.childPolicyAr : 'الأطفال أقل من ٦ سنوات مجاناً في نفس الغرفة مع الوالدين (بحد أقصى طفلين). الأطفال من سن ٦ سنوات إلى ١١.٩٩ سنة يحصلون على خصم ٥٠٪.'
                    ) : (
                      hotel.childPolicyEn ? hotel.childPolicyEn : 'Children under 6 stay free of charge using existing bedding. Children 6-12 years receive a 50% discount.'
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Children count */}
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{lang === 'ar' ? 'عدد الأطفال المرافقين' : 'Number of Children'}</label>
                      <select
                        value={childrenCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value);
                          setChildrenCount(count);
                          if (count === 0) setChildAges('');
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                      >
                        <option value="0">0 {lang === 'ar' ? 'أطفال' : 'Children'}</option>
                        <option value="1">1 {lang === 'ar' ? 'طفل واحد' : 'Child'}</option>
                        <option value="2">2 {lang === 'ar' ? 'طفلان' : 'Children'}</option>
                        <option value="3">3 {lang === 'ar' ? '٣ أطفال' : 'Children'}</option>
                      </select>
                    </div>

                    {/* Children ages (only show if childrenCount > 0) */}
                    {childrenCount > 0 && (
                      <div>
                        <label className="block text-slate-550 text-xs mb-1.5">
                          {lang === 'ar' ? 'أعمار الأطفال (مثال: 5, 8)' : 'Children Ages (e.g. 5, 8)'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={childAges}
                          onChange={(e) => setChildAges(e.target.value)}
                          placeholder={lang === 'ar' ? 'أدخل الأعمار مفصولة بفاصلة' : 'Enter ages separated by commas'}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Extra Bed & Airport Transfers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Extra bed selection */}
                    <div className="flex flex-col justify-center">
                      <label className="flex items-center gap-2.5 border border-slate-200 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={hasExtraBed}
                          onChange={(e) => setHasExtraBed(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-950 block">{lang === 'ar' ? 'طلب سرير إضافي للأطفال' : 'Request Extra Child Bed'}</span>
                          <span className="text-slate-500 block text-[10px] mt-0.5">+ $25 / {lang === 'ar' ? 'الليلة' : 'night'}</span>
                        </div>
                      </label>
                    </div>

                    {/* Airport Transfer select */}
                    <div>
                      <label className="block text-slate-550 text-xs mb-1.5">{lang === 'ar' ? 'خدمة النقل والتوصيل (اختياري)' : 'Airport Transfer Service (Optional)'}</label>
                      <select
                        value={selectedTransferId}
                        onChange={(e) => setSelectedTransferId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                      >
                        <option value="none">{lang === 'ar' ? 'بدون خدمة نقل' : 'No Transfer Service'}</option>
                        {hotelTransfers.map((trans) => (
                          <option key={trans.id} value={trans.id}>
                            {lang === 'ar' ? trans.fromAr : trans.fromEn} (+ ${trans.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Payment */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-mono uppercase text-amber-600 font-bold tracking-wider mb-3 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    {t.paymentMethod}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Credit Card */}
                    <label className={`flex items-start gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="mt-1"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{t.creditCard}</span>
                        <span className="text-slate-500 block mt-1">Visa, Mastercard, AMEX with instant wholesale receipt.</span>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label className={`flex items-start gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'bank_transfer' ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-1"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{t.bankTransfer}</span>
                        <span className="text-slate-500 block mt-1">Khatwa B2B Bank Egypt Account: 1900-2030-CIB. Allotment held for 24h.</span>
                      </div>
                    </label>

                    {/* Invoice */}
                    <label className={`flex items-start gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'invoice' ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'invoice'}
                        onChange={() => setPaymentMethod('invoice')}
                        className="mt-1"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{t.invoice}</span>
                        <span className="text-slate-500 block mt-1">Charged directly to your authorized corporate B2B credit line.</span>
                      </div>
                    </label>
                  </div>

                  {/* Credit Card Fields Details */}
                  {paymentMethod === 'credit_card' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3 grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-450 mb-1">MOCK CREDIT CARD NUMBER</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-450 mb-1">EXPIRY DATE</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500 w-full text-center"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 mb-1">CVC/CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500 w-full text-center"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Calculation Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block">
                      ${selectedRoom.pricePerNight} x {nights || 1} {lang === 'ar' ? 'ليالي' : 'nights'}
                    </span>
                    <span className="text-slate-700 text-xs block mt-0.5">
                      {lang === 'ar' ? 'حصص مؤكدة مباشرة' : 'Direct Allotment Confirmed'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-450 text-[10px] block font-mono uppercase tracking-wider">{t.totalPrice}</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">${totalPrice}</span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                    }}
                    className="border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t.confirmBooking}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
