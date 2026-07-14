import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Check, X, ShieldAlert, CreditCard, DollarSign,
  Briefcase, TrendingUp, Hotel as HotelIcon, Plus, FileText, ChevronRight,
  MapPin, RefreshCw, Trash2, Edit, LogOut
} from 'lucide-react';
import { Booking, Hotel, Destination, Language, RoomType, Review, HotelSchedule, Supplement, Transfer } from '../types';
import { translations } from '../translations';
import { InteractiveMap } from './InteractiveMap';

interface B2BDashboardProps {
  bookings: Booking[];
  hotels: Hotel[];
  destinations: Destination[];
  lang: Language;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmed' | 'cancelled', paymentStatus: 'paid' | 'unpaid') => void;
  onAddHotel: (hotel: Hotel) => void;
  onAddDestination: (destination: Destination) => void;
  onDeleteHotel: (hotelId: string) => void;
  onUpdateRoomInventory: (hotelId: string, roomId: string, newInventory: number) => void;
  onUpdateHotel: (hotel: Hotel) => void;
  onLogout: () => void;
  onClearDemoData?: () => Promise<void>;
}

export const B2BDashboard: React.FC<B2BDashboardProps> = ({
  bookings,
  hotels,
  destinations,
  lang,
  onUpdateBookingStatus,
  onAddHotel,
  onAddDestination,
  onDeleteHotel,
  onUpdateRoomInventory,
  onUpdateHotel,
  onLogout,
  onClearDemoData,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'content' | 'schedule'>('stats');

  const [editHotelData, setEditHotelData] = useState<Hotel | null>(null);

  // New Schedule Override Form State (managed inside the edit modal)
  const [schedNameEn, setSchedNameEn] = useState('');
  const [schedNameAr, setSchedNameAr] = useState('');
  const [schedRoomId, setSchedRoomId] = useState('all');
  const [schedStart, setSchedStart] = useState('');
  const [schedEnd, setSchedEnd] = useState('');
  const [schedPrice, setSchedPrice] = useState('');
  const [schedInventory, setSchedInventory] = useState('');
  const [schedIsBlocked, setSchedIsBlocked] = useState(false);

  // Add Hotel Form State
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelNameEn, setNewHotelNameEn] = useState('');
  const [newHotelNameAr, setNewHotelNameAr] = useState('');
  const [newHotelDestId, setNewHotelDestId] = useState(destinations[0]?.id || 'cairo');

  // Sync newHotelDestId if destinations are fetched later
  useEffect(() => {
    if (destinations.length > 0 && (!newHotelDestId || !destinations.find(d => d.id === newHotelDestId))) {
      setNewHotelDestId(destinations[0].id);
    }
  }, [destinations, newHotelDestId]);
  const [newHotelStars, setNewHotelStars] = useState(5);
  const [newHotelDescEn, setNewHotelDescEn] = useState('');
  const [newHotelDescAr, setNewHotelDescAr] = useState('');
  const [newHotelAddressEn, setNewHotelAddressEn] = useState('');
  const [newHotelAddressAr, setNewHotelAddressAr] = useState('');
  const [newHotelBasePrice, setNewHotelBasePrice] = useState(200);
  const [newHotelLat, setNewHotelLat] = useState(30.0);
  const [newHotelLng, setNewHotelLng] = useState(31.0);
  const [newHotelImgUrl, setNewHotelImgUrl] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop');

  // Child Policies and Transfers for establishing hotels
  const [newHotelChildPolicyEn, setNewHotelChildPolicyEn] = useState('Children up to 5 years stay free of charge when using existing bedding. Children from 6 to 11 years stay with 50% discount.');
  const [newHotelChildPolicyAr, setNewHotelChildPolicyAr] = useState('الأطفال حتى سن ٥ سنوات يقيمون مجاناً عند استخدام الأسرة الموجودة. الأطفال من سن ٦ إلى ١١ سنة يحصلون على خصم ٥٠٪.');
  
  const [newHotelTransfers, setNewHotelTransfers] = useState<Transfer[]>([
    { id: 'trans-1', fromEn: 'Cairo Airport', fromAr: 'مطار القاهرة', vehicleEn: 'Sedan Car', vehicleAr: 'سيارة سيدان', pricePerPerson: 15 },
    { id: 'trans-2', fromEn: 'Hurghada Airport', fromAr: 'مطار الغردقة', vehicleEn: 'Hiace Van', vehicleAr: 'سيارة هايس', pricePerPerson: 10 }
  ]);
  
  // Temporary single transfer input states
  const [newTransferFromEn, setNewTransferFromEn] = useState('');
  const [newTransferFromAr, setNewTransferFromAr] = useState('');
  const [newTransferVehicleEn, setNewTransferVehicleEn] = useState('');
  const [newTransferVehicleAr, setNewTransferVehicleAr] = useState('');
  const [newTransferPricePerPerson, setNewTransferPricePerPerson] = useState<number>(15);

  // Supplements state
  const [newHotelSupplements, setNewHotelSupplements] = useState<Supplement[]>([
    { id: 'supp-1', nameEn: 'Soft All Inclusive', nameAr: 'إقامة شاملة كلي خفيف', price: 350 },
    { id: 'supp-2', nameEn: 'Pool Or Sea View Room Upgrade', nameAr: 'ترقية لغرفة مطلة على المسبح أو البحر', price: 500 }
  ]);
  const [newSupplementNameEn, setNewSupplementNameEn] = useState('');
  const [newSupplementNameAr, setNewSupplementNameAr] = useState('');
  const [newSupplementPrice, setNewSupplementPrice] = useState<number>(100);

  // Dynamic Room types during creation
  const [newHotelRooms, setNewHotelRooms] = useState<RoomType[]>([
    {
      id: 'room-std',
      nameEn: 'Standard Business Room',
      nameAr: 'غرفة أعمال قياسية',
      descriptionEn: 'High speed wifi and spacious desk designed for corporate travel.',
      descriptionAr: 'اتصال إنترنت فائق السرعة ومكتب عمل فسيح مخصص لرحلات الشركات.',
      pricePerNight: 200,
      capacity: 2,
      maxOccupancy: 3,
      amenitiesEn: ['Corporate Desk', 'Fiber Internet', 'Coffee Machine'],
      amenitiesAr: ['مكتب عمل للشركات', 'إنترنت ألياف ضوئية', 'ركن تحضير قهوة'],
      inventory: 15
    },
    {
      id: 'room-exec',
      nameEn: 'Executive Premium Suite',
      nameAr: 'جناح تنفيذي متميز',
      descriptionEn: 'Full living area, complimentary lounge access, and mini-conference setups.',
      descriptionAr: 'صالة معيشة متكاملة، دخول مجاني للصالة التنفيذية، وإعدادات للمؤتمرات المصغرة.',
      pricePerNight: 300,
      capacity: 3,
      maxOccupancy: 4,
      amenitiesEn: ['Executive Boardroom Access', 'VIP Amenities', 'Mini Bar'],
      amenitiesAr: ['دخول قاعة الاجتماعات التنفيذية', 'مرافق كبار الشخصيات', 'ميني بار'],
      inventory: 8
    }
  ]);

  // Schedule overrides during creation
  const [newHotelSchedules, setNewHotelSchedules] = useState<HotelSchedule[]>([]);
  // Temporary creation override form states
  const [newSchedNameEn, setNewSchedNameEn] = useState('');
  const [newSchedNameAr, setNewSchedNameAr] = useState('');
  const [newSchedRoomId, setNewSchedRoomId] = useState('all');
  const [newSchedStart, setNewSchedStart] = useState('');
  const [newSchedEnd, setNewSchedEnd] = useState('');
  const [newSchedPrice, setNewSchedPrice] = useState('');
  const [newSchedInventory, setNewSchedInventory] = useState('');
  const [newSchedIsBlocked, setNewSchedIsBlocked] = useState(false);

  // Temporary room creation states for Add Hotel Property modal
  const [tempRoomNameEn, setTempRoomNameEn] = useState('');
  const [tempRoomNameAr, setTempRoomNameAr] = useState('');
  const [tempRoomDescEn, setTempRoomDescEn] = useState('');
  const [tempRoomDescAr, setTempRoomDescAr] = useState('');
  const [tempRoomPrice, setTempRoomPrice] = useState('150');
  const [tempRoomInventory, setTempRoomInventory] = useState('15');
  const [tempRoomCapacity, setTempRoomCapacity] = useState('2');
  const [tempRoomMaxOcc, setTempRoomMaxOcc] = useState('4');
  const [tempRoomBoardPreset, setTempRoomBoardPreset] = useState('BB');
  const [tempRoomBoardTypeEn, setTempRoomBoardTypeEn] = useState('Bed & Breakfast');
  const [tempRoomBoardTypeAr, setTempRoomBoardTypeAr] = useState('إقامة مع الإفطار');

  // Custom user requested simplified hotel form state
  const [newHotelImages, setNewHotelImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop'
  ]);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [tempRoomPeriodStart, setTempRoomPeriodStart] = useState('');
  const [tempRoomPeriodEnd, setTempRoomPeriodEnd] = useState('');
  const [childPolicyCount, setChildPolicyCount] = useState<number>(2);
  const [childPolicyAge, setChildPolicyAge] = useState<number>(12);
  const [childPolicyPrice, setChildPolicyPrice] = useState<number>(25);

  // Add Destination Form State
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [newDestId, setNewDestId] = useState('');
  const [newDestNameEn, setNewDestNameEn] = useState('');
  const [newDestNameAr, setNewDestNameAr] = useState('');
  const [newDestDescEn, setNewDestDescEn] = useState('');
  const [newDestDescAr, setNewDestDescAr] = useState('');
  const [newDestImg, setNewDestImg] = useState('https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=600&auto=format&fit=crop');

  // Selected invoice state for viewing B2B billing details
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  // Interactive Lookup States for Live Room Booking Schedule & Daily Allotment
  const [lookupHotelId, setLookupHotelId] = useState('');
  const [lookupRoomId, setLookupRoomId] = useState('');
  const [lookupStartDate, setLookupStartDate] = useState('');
  const [lookupEndDate, setLookupEndDate] = useState('');
  const [lookupSearchTerm, setLookupSearchTerm] = useState('');

  // Rate calculator based on dates, seasons and allotments
  const calculateRateLookup = (hId: string, rId: string, sDateStr: string, eDateStr: string) => {
    if (!hId || !rId || !sDateStr || !eDateStr) return null;
    const hotel = hotels.find(h => h.id === hId);
    if (!hotel) return null;
    const room = hotel.rooms.find(r => r.id === rId);
    if (!room) return null;

    const start = new Date(sDateStr);
    const end = new Date(eDateStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return {
        success: false,
        nights: 0,
        basePrice: room.pricePerNight,
        dates: [],
        totalPrice: 0,
        minAllotment: 0,
        isBlocked: false,
        errorEn: 'Check-out date must be after check-in date.',
        errorAr: 'يجب أن يكون تاريخ المغادرة لاحقاً لتاريخ الوصول.'
      };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let total = 0;
    let minAllot = Infinity;
    let anyBlocked = false;
    const dateDetails = [];

    for (let i = 0; i < nights; i++) {
      const current = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const curStr = current.toISOString().split('T')[0];

      // Find matching bookings for this day
      const dailyBookings = bookings.filter(b => {
        if (b.hotelId !== hId || b.roomTypeId !== rId || b.status === 'cancelled') return false;
        const bIn = new Date(b.checkIn).getTime();
        const bOut = new Date(b.checkOut).getTime();
        const curTime = current.getTime();
        return curTime >= bIn && curTime < bOut;
      });

      // Find schedule override
      const override = hotel.schedules?.find(sched => {
        const isDateInRange = curStr >= sched.startDate && curStr <= sched.endDate;
        const isRoomMatching = sched.roomTypeId === 'all' || sched.roomTypeId === rId;
        return isDateInRange && isRoomMatching;
      });

      const dayPrice = override?.priceOverride !== undefined ? override.priceOverride : room.pricePerNight;
      const dayInventory = override?.inventoryOverride !== undefined ? override.inventoryOverride : room.inventory;
      const isBlocked = !!override?.isBlocked;

      const dayAllotment = isBlocked ? 0 : Math.max(0, dayInventory - dailyBookings.length);

      if (isBlocked) anyBlocked = true;
      if (dayAllotment < minAllot) minAllot = dayAllotment;

      total += dayPrice;
      dateDetails.push({
        date: curStr,
        price: dayPrice,
        allotment: dayAllotment,
        isBlocked,
        seasonName: override ? (isRtl ? override.nameAr : override.nameEn) : undefined
      });
    }

    return {
      success: true,
      nights,
      basePrice: room.pricePerNight,
      dates: dateDetails,
      totalPrice: total,
      minAllotment: minAllot === Infinity ? 0 : minAllot,
      isBlocked: anyBlocked
    };
  };

  // Financial Stats
  const totalWholesaleRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const averageContractValue = bookings.length > 0
    ? Math.round(totalWholesaleRevenue / bookings.filter(b => b.status === 'confirmed').length || 0)
    : 0;

  const pendingApprovalsCount = bookings.filter(b => b.status === 'pending').length;

  const isRtl = lang === 'ar';

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelNameEn || !newHotelNameAr) {
      alert(isRtl ? 'يرجى كتابة اسم الفندق باللغتين العربية والإنجليزية.' : 'Please enter the hotel name in both English and Arabic.');
      return;
    }
    if (newHotelRooms.length === 0) {
      alert(isRtl ? 'يرجى إضافة نوع غرفة واحد على الأقل.' : 'Please add at least one room type.');
      return;
    }

    const hotelId = newHotelNameEn.toLowerCase().replace(/\s+/g, '-');
    
    // Map rooms to have prefix of hotelId
    const mappedRooms = newHotelRooms.map(r => ({
      ...r,
      id: r.id.startsWith(hotelId) ? r.id : `${hotelId}-${r.id}`
    }));

    // Map schedules to have updated room IDs if needed
    const mappedSchedules = newHotelSchedules.map(s => {
      if (s.roomTypeId !== 'all' && !s.roomTypeId.startsWith(hotelId)) {
        return { ...s, roomTypeId: `${hotelId}-${s.roomTypeId}` };
      }
      return s;
    });

    // Compute basePrice as the lowest room price
    const computedBasePrice = Math.min(...newHotelRooms.map(r => r.pricePerNight));

    // Generate child policies
    const generatedChildPolicyEn = `Up to ${childPolicyCount} children under ${childPolicyAge} years of age: $${childPolicyPrice} per child.`;
    const generatedChildPolicyAr = `بحد أقصى ${childPolicyCount} أطفال حتى سن ${childPolicyAge} سنة: بقيمة ${childPolicyPrice}$ للطفل.`;

    // Ensure we have exactly 5 images
    const finalImages = [...newHotelImages];
    for (let i = 0; i < 5; i++) {
      if (!finalImages[i] || finalImages[i].trim() === '') {
        finalImages[i] = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop';
      }
    }

    const newHotel: Hotel = {
      id: hotelId,
      nameEn: newHotelNameEn,
      nameAr: newHotelNameAr,
      destinationId: newHotelDestId,
      stars: newHotelStars,
      rating: 5.0,
      descriptionEn: `Contracted hotel property: ${newHotelNameEn}`,
      descriptionAr: `فندق متعاقد عليه: ${newHotelNameAr}`,
      benefitsEn: ['24/7 Corporate desk', 'Late check-out', 'Favorable cancellation terms'],
      benefitsAr: ['مكتب مساعدة للشركات ٢٤/٧', 'مغادرة متأخرة مجانية', 'شروط إلغاء تفضيلية وعقد مرن'],
      images: finalImages.slice(0, 5),
      lat: newHotelLat,
      lng: newHotelLng,
      addressEn: newHotelAddressEn || 'Egypt Touristic zone',
      addressAr: newHotelAddressAr || 'المنطقة السياحية، مصر',
      basePrice: computedBasePrice,
      reviews: [],
      rooms: mappedRooms,
      schedules: mappedSchedules,
      childPolicyEn: generatedChildPolicyEn,
      childPolicyAr: generatedChildPolicyAr,
      supplements: newHotelSupplements,
      transfers: [] // Reset/disable transfers as it was not requested
    };

    onAddHotel(newHotel);
    setShowAddHotelModal(false);
    
    // reset form
    setNewHotelNameEn('');
    setNewHotelNameAr('');
    setNewHotelAddressEn('');
    setNewHotelAddressAr('');
    setNewHotelImages([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop'
    ]);
    setMapSearchQuery('');
    setChildPolicyCount(2);
    setChildPolicyAge(12);
    setChildPolicyPrice(25);
    setNewHotelSupplements([
      { id: 'supp-1', nameEn: 'Soft All Inclusive', nameAr: 'إقامة شاملة كلي خفيف', price: 350 }
    ]);
    setNewSupplementNameEn('');
    setNewSupplementNameAr('');
    setNewSupplementPrice(100);
    setNewHotelRooms([
      {
        id: 'room-std',
        nameEn: 'Standard Business Room',
        nameAr: 'غرفة أعمال قياسية',
        descriptionEn: 'High speed wifi and spacious desk designed for corporate travel.',
        descriptionAr: 'اتصال إنترنت فائق السرعة ومكتب عمل فسيح مخصص لرحلات الشركات.',
        pricePerNight: 200,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Corporate Desk', 'Fiber Internet', 'Coffee Machine'],
        amenitiesAr: ['مكتب عمل للشركات', 'إنترنت ألياف ضوئية', 'ركن تحضير قهوة'],
        inventory: 15
      }
    ]);
    setNewHotelSchedules([]);
  };

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestId || !newDestNameEn || !newDestNameAr) {
      alert(isRtl ? 'يرجى كتابة رمز الوجهة والاسم باللغتين.' : 'Please fill in destination ID and names.');
      return;
    }

    const newDest: Destination = {
      id: newDestId.toLowerCase().trim(),
      nameEn: newDestNameEn,
      nameAr: newDestNameAr,
      descriptionEn: newDestDescEn,
      descriptionAr: newDestDescAr,
      image: newDestImg
    };

    onAddDestination(newDest);
    setShowAddDestModal(false);

    setNewDestId('');
    setNewDestNameEn('');
    setNewDestNameAr('');
    setNewDestDescEn('');
    setNewDestDescAr('');
  };

  // Generate date array for the Live Schedule tab (next 10 days)
  const getNext10Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const dayOfWeek = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
      dates.push({
        raw: d.toISOString().split('T')[0],
        formatted: `${day}/${month}`,
        dayName: dayOfWeek
      });
    }
    return dates;
  };

  const scheduleDates = getNext10Days();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-600" />
            {t.dashboardTitle}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {isRtl ? 'إدارة الأسعار وحصص الغرف والعقود وتأكيد الحجوزات مع مصفوفة التواريخ الديناميكية.' : 'Configure corporate contracts, live inventories, rates, mapping coordinates and reservation rosters.'}
          </p>
        </div>

        {/* Dynamic CTAs */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddHotelModal(true)}
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.addHotelBtn}
          </button>
          <button
            onClick={() => setShowAddDestModal(true)}
            className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.addDestBtn}
          </button>
          {onClearDemoData && (hotels.length > 0 || destinations.length > 0 || bookings.length > 0) && (
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  isRtl 
                    ? 'هل أنت متأكد من رغبتك في حذف جميع البيانات الوهمية؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة الفنادق والوجهات والحجوزات المسجلة حالياً لبدء قاعدة بيانات جديدة حقيقية.'
                    : 'Are you sure you want to delete all demo/mock data? This action is irreversible and will delete all hotels, destinations, and bookings to start a clean database with real data.'
                );
                if (confirmed) {
                  onClearDemoData();
                }
              }}
              className="bg-red-50 text-red-750 border border-red-200 hover:bg-red-100 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title={isRtl ? 'مسح كافة البيانات الوهمية للبدء في وضع بيانات حقيقية' : 'Delete all demo/mock data to start with clean real data'}
            >
              <Trash2 className="w-4 h-4" />
              {isRtl ? 'مسح البيانات الوهمية' : 'Clear Demo Data'}
            </button>
          )}
          <button
            onClick={onLogout}
            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            {isRtl ? 'خروج المشرف' : 'Admin Logout'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-1 gap-1">
        {[
          { id: 'stats', label: t.dashStats, icon: TrendingUp },
          { id: 'bookings', label: t.dashBookings, icon: FileText },
          { id: 'content', label: t.dashContent, icon: HotelIcon },
          { id: 'schedule', label: t.dashSchedule, icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-amber-500 text-amber-700 bg-amber-500/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'bookings' && pendingApprovalsCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CORPORATE ANALYTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fadeIn">
          {/* STATS HERO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="absolute right-4 top-4 text-amber-500/10">
                <FileText className="w-16 h-16 stroke-1" />
              </div>
              <span className="text-slate-500 text-xs font-mono tracking-wider uppercase">{t.totalBookings}</span>
              <h3 className="text-4xl font-black text-slate-900 mt-2 font-mono">{bookings.length}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-bold">↑ 100%</span>
                <span>direct contracted allotments</span>
              </p>
            </div>

            {/* Wholesale Revenue */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="absolute right-4 top-4 text-emerald-500/10">
                <DollarSign className="w-16 h-16 stroke-1" />
              </div>
              <span className="text-slate-500 text-xs font-mono tracking-wider uppercase">{t.totalRevenue}</span>
              <h3 className="text-4xl font-black text-emerald-600 mt-2 font-mono">${totalWholesaleRevenue.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-650 font-bold">↑ 12%</span>
                <span>commission optimized</span>
              </p>
            </div>

            {/* Avg Contract Value */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="absolute right-4 top-4 text-sky-500/10">
                <Briefcase className="w-16 h-16 stroke-1" />
              </div>
              <span className="text-slate-500 text-xs font-mono tracking-wider uppercase">{t.averageBooking}</span>
              <h3 className="text-4xl font-black text-slate-900 mt-2 font-mono">${averageContractValue.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">Multi-room group itineraries</p>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="absolute right-4 top-4 text-rose-500/10">
                <ShieldAlert className="w-16 h-16 stroke-1" />
              </div>
              <span className="text-slate-500 text-xs font-mono tracking-wider uppercase">{t.pendingBookings}</span>
              <h3 className={`text-4xl font-black mt-2 font-mono ${pendingApprovalsCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`}>
                {pendingApprovalsCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1">B2B client bank/invoice review</p>
            </div>
          </div>

          {/* SECONDARY INFO GRAPHIC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Destinations Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-amber-600 w-4 h-4" />
                {isRtl ? 'حجم الحجوزات حسب الوجهات السياحية' : 'Wholesale Distribution by Destination'}
              </h4>
              <div className="space-y-4">
                {destinations.map((dest) => {
                  const destBookingsCount = bookings.filter(b => {
                    const h = hotels.find(ht => ht.id === b.hotelId);
                    return h?.destinationId === dest.id;
                  }).length;
                  const totalCount = bookings.length || 1;
                  const ratio = (destBookingsCount / totalCount) * 100;

                  return (
                    <div key={dest.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-700 font-semibold">{isRtl ? dest.nameAr : dest.nameEn}</span>
                        <span className="text-slate-500">{destBookingsCount} bookings ({Math.round(ratio)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${ratio || 4}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B2B Invoicing Information */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CreditCard className="text-emerald-600 w-4 h-4" />
                  {isRtl ? 'أنظمة الحسابات لخطوة B2B' : 'Agency Payment Methods split'}
                </h4>
                <p className="text-xs text-slate-650 mb-4 leading-relaxed">
                  {isRtl ? 'تسهيلات سداد وتقسيم مرن لوكالات السفر الشريكة معنا لضمان تأكيد حصص الحجوزات.' : 'Detailed ratio of the transaction types utilized by travel agents during booking procedures.'}
                </p>

                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">CREDIT CARD</span>
                    <span className="text-slate-900 font-bold text-sm block mt-1">
                      {bookings.filter(b => b.paymentMethod === 'credit_card').length}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">BANK TRANS.</span>
                    <span className="text-slate-900 font-bold text-sm block mt-1">
                      {bookings.filter(b => b.paymentMethod === 'bank_transfer').length}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">CREDIT LINE</span>
                    <span className="text-slate-900 font-bold text-sm block mt-1">
                      {bookings.filter(b => b.paymentMethod === 'invoice').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mt-4 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                <span className="text-xs text-slate-700 leading-relaxed">
                  {isRtl 
                    ? 'يتم تعيين شروط حد الائتمان تلقائياً لكل شركة بعد مراجعة سجلها التجاري المرفق مع الحجوزات.'
                    : 'Wholesale credit lines are refreshed on the 1st of each month. Invoices can be managed in the Reservations Tab.'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESERVATIONS MANAGER */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
          {/* Booking search bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
              {isRtl ? 'قائمة الحجوزات الحية للشركات' : 'Corporate Hotel Reservations Ledger'}
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-mono text-[10px] uppercase">
                  <th className="p-4">{t.bookingId}</th>
                  <th className="p-4">{t.agency}</th>
                  <th className="p-4">{t.hotel}</th>
                  <th className="p-4">{t.room}</th>
                  <th className="p-4">{t.dates}</th>
                  <th className="p-4 text-right">{t.totalPrice}</th>
                  <th className="p-4 text-center">{t.status}</th>
                  <th className="p-4 text-center">{t.payment}</th>
                  <th className="p-4 text-center">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-450">
                      {t.noBookingsFound}
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 text-slate-700">
                      <td className="p-4 font-mono text-slate-950 font-bold">{booking.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{booking.agentCompany}</div>
                        <div className="text-[10px] text-slate-500">{booking.agentName}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{isRtl ? booking.hotelNameAr : booking.hotelNameEn}</td>
                      <td className="p-4 text-slate-650">{isRtl ? booking.roomTypeNameAr : booking.roomTypeNameEn}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-600">
                        <div>{booking.checkIn}</div>
                        <div className="text-slate-450">to {booking.checkOut}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900 font-mono">${booking.totalPrice}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-750 border border-emerald-250' :
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-750 border border-amber-250' :
                          'bg-rose-50 text-rose-750 border border-rose-250'
                        }`}>
                          {booking.status === 'confirmed' ? t.confirmed :
                           booking.status === 'pending' ? t.pending : t.cancelled}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-750' : 'bg-rose-50 text-rose-750'
                          }`}>
                            {booking.paymentStatus === 'paid' ? t.paid : t.unpaid}
                          </span>
                          <span className="text-[8px] text-slate-500 uppercase">{booking.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Invoice view btn */}
                          <button
                            onClick={() => setSelectedInvoice(booking)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                            title="Invoice Details"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Approval / Status actions */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'confirmed', 'unpaid')}
                              className="bg-emerald-500 text-slate-950 p-1 rounded-md hover:bg-emerald-400 transition-colors cursor-pointer"
                              title="Confirm Reservation"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, booking.status, 'paid')}
                              className="bg-amber-500 text-slate-950 p-1 rounded-md hover:bg-amber-400 transition-colors cursor-pointer"
                              title="Mark as Paid"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'cancelled', booking.paymentStatus)}
                              className="bg-rose-50 text-rose-700 border border-rose-200 p-1 rounded-md hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Cancel Reservation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MANAGER (DYNAMIC HOTELS / COUNTRIES) */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-fadeIn">
          {destinations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm">
              <div className="bg-amber-50 text-amber-700 p-4 rounded-full w-fit mx-auto mb-4">
                <MapPin className="w-10 h-10 text-amber-600" />
              </div>
              <h4 className="text-lg font-black text-slate-800">
                {isRtl ? 'لا توجد وجهات سياحية حتى الآن' : 'No Destinations Created Yet'}
              </h4>
              <p className="text-xs text-slate-555 mt-2 leading-relaxed">
                {isRtl 
                  ? 'يرجى البدء بإضافة وجهة سياحية أولاً (مثال: القاهرة، شرم الشيخ، الغردقة، إلخ) من خلال الزر الموجود في الأعلى لتتمكن من إضافة الفنادق المتعاقد عليها تحتها.'
                  : 'Please start by adding a destination hub first (e.g., Cairo, Sharm El Sheikh, Hurghada, etc.) using the button above to be able to register contracted hotels under them.'}
              </p>
              <button
                onClick={() => setShowAddDestModal(true)}
                className="mt-5 bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isRtl ? 'إضافة وجهة سياحية جديدة' : 'Add New Destination'}
              </button>
            </div>
          ) : (
            destinations.map((dest) => {
              const destHotels = hotels.filter((h) => h.destinationId === dest.id);
              return (
                <div key={dest.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  {/* Destination Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-500/15 text-amber-800 p-2 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">
                          {isRtl ? dest.nameAr : dest.nameEn}
                        </h4>
                        <p className="text-xs text-slate-550 mt-0.5">
                          {isRtl ? dest.descriptionAr : dest.descriptionEn}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                      {destHotels.length} {isRtl ? 'فنادق متعاقدة' : 'properties'}
                    </span>
                  </div>

                  {/* Hotels under this destination */}
                  {destHotels.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500">
                        {isRtl
                          ? 'لا توجد فنادق متعاقد عليها في هذه الوجهة بعد. اضغط على "+ إضافة فندق متعاقد عليه" لتسجيل فندق جديد.'
                          : 'No contracted properties in this destination yet. Click "+ Add Contracted Hotel" to seed a property.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {destHotels.map((hotel) => (
                        <div key={hotel.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-4 flex gap-4 relative">
                          <img
                            src={hotel.images[0]}
                            alt={hotel.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                              <span className="text-amber-600 font-bold">{hotel.stars} ★</span>
                              <span>•</span>
                              <span>{isRtl ? hotel.addressAr : hotel.addressEn}</span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 truncate mt-1">
                              {isRtl ? hotel.nameAr : hotel.nameEn}
                            </h5>
                            <p className="text-[11px] text-slate-650 line-clamp-2 mt-1.5 leading-relaxed">
                              {isRtl ? hotel.descriptionAr : hotel.descriptionEn}
                            </p>

                            <div className="flex items-center justify-between gap-2 mt-3 text-xs border-t border-slate-200 pt-2.5">
                              <span className="font-mono text-emerald-700 font-bold">
                                ${hotel.basePrice} / night
                              </span>

                              <div className="flex gap-1.5">
                                {/* Edit Hotel CTA */}
                                <button
                                  onClick={() => setEditHotelData(JSON.parse(JSON.stringify(hotel)))}
                                  className="text-amber-700 hover:text-amber-800 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>{isRtl ? 'تعديل الفندق والأسعار' : 'Edit Hotel & Rates'}</span>
                                </button>
                                
                                {/* Delete Hotel CTA */}
                                <button
                                  onClick={() => {
                                    if (confirm(isRtl ? 'هل أنت متأكد من رغبتك في حذف هذا الفندق نهائياً؟' : 'Are you sure you want to terminate this hotel contract?')) {
                                      onDeleteHotel(hotel.id);
                                    }
                                  }}
                                  className="text-rose-600 hover:text-rose-700 bg-rose-550/10 border border-rose-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title={isRtl ? 'إلغاء التعاقد' : 'Terminate Contract'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: LIVE ALLOTMENT SCHEDULE (CALENDAR MATRIX) */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn space-y-8">
          <div>
            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-amber-600 w-5 h-5" />
              {t.bookingCalendarHeader}
            </h4>
            <p className="text-xs text-slate-650 mt-1 leading-relaxed">
              {t.allotmentInfo}
            </p>
          </div>

          {/* SECTION A: Rate & Allotment Lookup Calculator */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div>
              <h5 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block animate-pulse"></span>
                {isRtl ? 'حاسبة أسعار ومقاعد الغرف التفاعلية بالتواريخ' : 'Interactive Multi-Date Rate & Allotment Calculator'}
              </h5>
              <p className="text-[11px] text-slate-550 mt-0.5">
                {isRtl ? 'استعلم فوراً عن السعر الإجمالي وتفاصيل الغرف والحصة المتاحة لأي فترة إقامة.' : 'Instantly look up the precise room rate, contract season, and daily allotment for any custom date range.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">{isRtl ? 'اختر الفندق' : 'Select Hotel'}</label>
                <select
                  value={lookupHotelId}
                  onChange={(e) => {
                    setLookupHotelId(e.target.value);
                    const selectedH = hotels.find(h => h.id === e.target.value);
                    if (selectedH && selectedH.rooms.length > 0) {
                      setLookupRoomId(selectedH.rooms[0].id);
                    } else {
                      setLookupRoomId('');
                    }
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 w-full focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="">-- {isRtl ? 'اختر فندقاً' : 'Select a Hotel'} --</option>
                  {hotels.map(h => (
                    <option key={h.id} value={h.id}>{isRtl ? h.nameAr : h.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">{isRtl ? 'نوع الغرفة' : 'Room Type'}</label>
                <select
                  value={lookupRoomId}
                  onChange={(e) => setLookupRoomId(e.target.value)}
                  disabled={!lookupHotelId}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 w-full focus:outline-none focus:border-amber-500 font-bold disabled:opacity-60"
                >
                  <option value="">-- {isRtl ? 'اختر نوع الغرفة' : 'Select a Room'} --</option>
                  {lookupHotelId && (hotels.find(h => h.id === lookupHotelId)?.rooms || []).map(r => (
                    <option key={r.id} value={r.id}>{isRtl ? r.nameAr : r.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">{isRtl ? 'من تاريخ (Check-in)' : 'Date From (Check-in)'}</label>
                <input
                  type="date"
                  value={lookupStartDate}
                  onChange={(e) => setLookupStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 w-full focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">{isRtl ? 'إلى تاريخ (Check-out)' : 'Date To (Check-out)'}</label>
                <input
                  type="date"
                  value={lookupEndDate}
                  onChange={(e) => setLookupEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 w-full focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Render Lookup Results */}
            {(() => {
              const res = calculateRateLookup(lookupHotelId, lookupRoomId, lookupStartDate, lookupEndDate);
              if (!res) return null;
              
              if (!res.success) {
                return (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-bold">
                    ⚠️ {isRtl ? res.errorAr : res.errorEn}
                  </div>
                );
              }

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 animate-slideDown shadow-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-slate-100 divide-dashed">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">{isRtl ? 'عدد الليالي' : 'Total Nights'}</span>
                      <span className="text-base font-black text-slate-900 font-mono">{res.nights} {isRtl ? 'ليالي' : 'Nights'}</span>
                    </div>
                    <div className="space-y-1 pt-3 md:pt-0 md:pl-4 rtl:md:pr-4">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">{isRtl ? 'أقل غرف متاحة (Allotment)' : 'Min Available Seats'}</span>
                      <span className={`text-base font-black font-mono ${res.minAllotment === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {res.isBlocked ? (isRtl ? 'مغلق تماماً' : 'Blocked') : `${res.minAllotment} ${isRtl ? 'غرف' : 'Rooms'}`}
                      </span>
                    </div>
                    <div className="space-y-1 pt-3 md:pt-0 md:pl-4 rtl:md:pr-4">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">{isRtl ? 'السعر القياسي' : 'Standard Base Rate'}</span>
                      <span className="text-base font-black text-slate-700 font-mono">${res.basePrice} / {isRtl ? 'ليلة' : 'night'}</span>
                    </div>
                    <div className="space-y-1 pt-3 md:pt-0 md:pl-4 rtl:md:pr-4">
                      <span className="text-[10px] text-amber-900 font-extrabold block uppercase tracking-wider">{isRtl ? 'الإجمالي الكلي ($)' : 'Total Cost ($)'}</span>
                      <span className="text-base font-black text-emerald-750 font-mono bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 inline-block">${res.totalPrice}</span>
                    </div>
                  </div>

                  {/* Daily Rate Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">{isRtl ? 'تفاصيل السعر والمقاعد ليلة بليلة:' : 'Night-by-Night Pricing & Availability Breakdown:'}</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {res.dates.map((d, dIdx) => (
                        <div key={dIdx} className={`border rounded-xl p-2.5 text-center space-y-1 transition-colors ${
                          d.isBlocked ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="text-[10px] font-bold text-slate-600 font-mono">{d.date}</div>
                          <div className="text-xs font-black text-slate-900 font-mono">${d.price}</div>
                          <div className="text-[9px] text-slate-500">
                            {d.isBlocked ? (
                              <span className="bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold uppercase">{isRtl ? 'مغلق' : 'Blocked'}</span>
                            ) : (
                              <span>{isRtl ? 'متاح:' : 'Qty:'} <strong className="text-slate-800 font-black">{d.allotment}</strong></span>
                            )}
                          </div>
                          {d.seasonName && (
                            <div className="text-[8px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded truncate" title={d.seasonName}>
                              {d.seasonName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION B: 10-Day Live Allotment & Daily Pricing Grid */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {isRtl ? 'جدول توزيع الغرف والأسعار المباشر (١٠ أيام القادمة)' : 'Live 10-Day Room Allotment & Daily Pricing Matrix'}
            </h5>
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <div className="min-w-[800px]">
                {/* Grid Header */}
                <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500 text-center uppercase py-3 font-bold">
                  <div className="col-span-3 text-left px-4">{isRtl ? 'الفندق ونوع الغرفة' : 'Property & Room Allocation'}</div>
                  {scheduleDates.map((date, i) => (
                    <div key={i} className="col-span-1 border-l border-slate-200">
                      <div>{date.dayName}</div>
                      <div className="text-slate-900 font-bold mt-0.5">{date.formatted}</div>
                    </div>
                  ))}
                </div>

                {/* Grid Rows */}
                <div className="divide-y divide-slate-200 text-xs">
                  {hotels.map((hotel) => (
                    <div key={hotel.id} className="divide-y divide-slate-100">
                      {hotel.rooms.map((room) => {
                        return (
                          <div key={room.id} className="grid grid-cols-12 items-center py-2.5 hover:bg-slate-50/40 text-slate-700">
                            <div className="col-span-3 px-4">
                              <span className="font-bold text-slate-900 block truncate">
                                {isRtl ? hotel.nameAr : hotel.nameEn}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {isRtl ? room.nameAr : room.nameEn}
                              </span>
                            </div>

                            {scheduleDates.map((date, idx) => {
                              // Check if there is any booking scheduled for this date & room
                              const matchingBookings = bookings.filter(b => {
                                if (b.hotelId !== hotel.id || b.roomTypeId !== room.id || b.status === 'cancelled') return false;
                                const checkInTime = new Date(b.checkIn).getTime();
                                const checkOutTime = new Date(b.checkOut).getTime();
                                const cellTime = new Date(date.raw).getTime();
                                return cellTime >= checkInTime && cellTime < checkOutTime;
                              });

                              // Find active schedule override
                              const activeSchedule = hotel.schedules?.find(sched => {
                                const isDateInRange = date.raw >= sched.startDate && date.raw <= sched.endDate;
                                const isRoomMatching = sched.roomTypeId === 'all' || sched.roomTypeId === room.id;
                                return isDateInRange && isRoomMatching;
                              });

                              const isBlocked = activeSchedule?.isBlocked;
                              const customInventory = activeSchedule?.inventoryOverride !== undefined 
                                ? activeSchedule.inventoryOverride 
                                : room.inventory;

                              const remainingAllotment = isBlocked ? 0 : Math.max(0, customInventory - matchingBookings.length);
                              const isBooked = matchingBookings.length > 0;

                              return (
                                <div key={idx} className={`col-span-1 border-l border-slate-150 text-center font-mono py-1.5 transition-all ${
                                  isBlocked ? 'bg-rose-50/70' : activeSchedule ? 'bg-amber-50/30' : ''
                                }`}>
                                  <div className="flex flex-col items-center justify-center space-y-1">
                                    {/* Availability badge */}
                                    <span className={`inline-block w-6 py-0.5 text-[10px] font-bold rounded ${
                                      isBlocked ? 'bg-rose-600 text-white' :
                                      remainingAllotment === 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      isBooked ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                      {isBlocked ? '✕' : remainingAllotment}
                                    </span>

                                    {/* Price for this Date */}
                                    <span className={`text-[9px] font-black px-1 py-0.2 rounded ${
                                      activeSchedule?.priceOverride !== undefined 
                                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                                        : 'text-slate-500 bg-slate-50 border border-slate-150 font-medium'
                                    }`}>
                                      ${activeSchedule?.priceOverride !== undefined ? activeSchedule.priceOverride : room.pricePerNight}
                                    </span>

                                    {/* Schedule name indicator badge */}
                                    {activeSchedule && (
                                      <span className="text-[7px] text-amber-800 font-extrabold bg-amber-200/60 px-1 py-0.2 rounded block truncate w-full max-w-[55px]" title={isRtl ? activeSchedule.nameAr : activeSchedule.nameEn}>
                                        {isRtl ? activeSchedule.nameAr : activeSchedule.nameEn}
                                      </span>
                                    )}

                                    {isBooked && !isBlocked && (
                                      <span className="text-[8px] text-slate-500 block truncate w-full max-w-[50px]">
                                        {matchingBookings[0].agentCompany.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: Contracts & Seasonal Rates Directory */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                  {isRtl ? 'دليل أسعار عقود الفنادق وفترات الصلاحية من وإلى' : 'Contract Seasons & Specific Date Rates Directory'}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {isRtl ? 'قائمة شاملة بجميع فترات الصلاحية (من / وإلى) والأسعار المعتمدة لجميع الفنادق والغرف.' : 'Comprehensive database of all date validities (From / To) and certified pricing across rooms.'}
                </p>
              </div>
              <div className="w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث باسم الفندق أو الغرفة...' : 'Filter by hotel or room type...'}
                  value={lookupSearchTerm}
                  onChange={(e) => setLookupSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-850 w-full focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* List all specific rate periods */}
            {(() => {
              // Gather standard room rates for all hotels
              const standardRates = hotels.flatMap(h => h.rooms.map(r => ({
                id: `std-${h.id}-${r.id}`,
                hotelNameEn: h.nameEn,
                hotelNameAr: h.nameAr,
                roomNameEn: r.nameEn,
                roomNameAr: r.nameAr,
                startDate: 'Year-Round',
                startDateAr: 'طوال العام',
                endDate: 'Year-Round',
                endDateAr: 'طوال العام',
                price: r.pricePerNight,
                allotment: r.inventory,
                isBlocked: false,
                isSeasonal: false,
                seasonNameEn: 'Standard Year-Round Contract',
                seasonNameAr: 'العقد القياسي السنوي'
              })));

              // Gather seasonal override rates
              const seasonalRates = hotels.flatMap(h => (h.schedules || []).map(s => {
                const targetRooms = s.roomTypeId === 'all' 
                  ? h.rooms 
                  : h.rooms.filter(r => r.id === s.roomTypeId);
                
                return targetRooms.map(r => ({
                  id: `override-${s.id}-${r.id}`,
                  hotelNameEn: h.nameEn,
                  hotelNameAr: h.nameAr,
                  roomNameEn: r.nameEn,
                  roomNameAr: r.nameAr,
                  startDate: s.startDate,
                  startDateAr: s.startDate,
                  endDate: s.endDate,
                  endDateAr: s.endDate,
                  price: s.priceOverride !== undefined ? s.priceOverride : r.pricePerNight,
                  allotment: s.inventoryOverride !== undefined ? s.inventoryOverride : r.inventory,
                  isBlocked: s.isBlocked,
                  isSeasonal: true,
                  seasonNameEn: s.nameEn,
                  seasonNameAr: s.nameAr
                }));
              })).flat();

              const allRates = [...standardRates, ...seasonalRates];
              
              // Filter based on search term
              const filteredRates = allRates.filter(rate => {
                const term = lookupSearchTerm.toLowerCase();
                if (!term) return true;
                return (
                  rate.hotelNameEn.toLowerCase().includes(term) ||
                  rate.hotelNameAr.includes(term) ||
                  rate.roomNameEn.toLowerCase().includes(term) ||
                  rate.roomNameAr.includes(term) ||
                  rate.seasonNameEn.toLowerCase().includes(term) ||
                  rate.seasonNameAr.includes(term)
                );
              });

              if (filteredRates.length === 0) {
                return (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    {isRtl ? 'لا توجد نتائج مطابقة لفلتر البحث.' : 'No contracted rates matched your search filter.'}
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                  <table className="min-w-full divide-y divide-slate-200 text-center text-xs text-slate-700">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500 font-mono">
                      <tr>
                        <th className="px-4 py-3 text-left pl-6">{isRtl ? 'الفندق المتعاقد عليه' : 'Contracted Hotel'}</th>
                        <th className="px-4 py-3 text-left">{isRtl ? 'نوع الغرفة' : 'Room Type'}</th>
                        <th className="px-4 py-3">{isRtl ? 'التاريخ من' : 'Valid From'}</th>
                        <th className="px-4 py-3">{isRtl ? 'التاريخ إلى' : 'Valid To'}</th>
                        <th className="px-4 py-3">{isRtl ? 'سعر الغرفة ($)' : 'Room Price ($)'}</th>
                        <th className="px-4 py-3">{isRtl ? 'الحصة (Allotment)' : 'Allotment'}</th>
                        <th className="px-4 py-3 text-right pr-6">{isRtl ? 'الموسم / العقد' : 'Contract Season / Classification'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-center">
                      {filteredRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-left pl-6 font-bold text-slate-900">
                            {isRtl ? rate.hotelNameAr : rate.hotelNameEn}
                          </td>
                          <td className="px-4 py-3 text-left font-semibold text-slate-700">
                            {isRtl ? rate.roomNameAr : rate.roomNameEn}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {isRtl ? rate.startDateAr : rate.startDate}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {isRtl ? rate.endDateAr : rate.endDate}
                          </td>
                          <td className="px-4 py-3">
                            {rate.isBlocked ? (
                              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border border-rose-100">{isRtl ? 'مغلق' : 'Blocked'}</span>
                            ) : (
                              <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                                rate.isSeasonal 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-amber-50 text-amber-800 border border-amber-100'
                              }`}>
                                ${rate.price}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 font-bold">
                            {rate.isBlocked ? '0' : rate.allotment}
                          </td>
                          <td className="px-4 py-3 text-right pr-6">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full font-bold ${
                              rate.isSeasonal
                                ? 'bg-amber-500/10 text-amber-800 border border-amber-500/20'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isRtl ? rate.seasonNameAr : rate.seasonNameEn}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* INVOICE BILLING DETAIL POPUP DIALOG */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-slate-700 font-mono text-xs">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">
                {t.appName} - B2B Contract Invoice
              </span>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-550 hover:text-slate-900 cursor-pointer font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Ticket content */}
            <div className="p-6 space-y-4">
              <div className="text-center font-bold text-lg text-amber-600 uppercase tracking-widest pb-3 border-b border-dashed border-slate-200">
                Official Contract Voucher
              </div>

              <div className="space-y-2 text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-450">RESERVATION ID:</span>
                  <span className="text-slate-900 font-bold">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">BOOKING DATE:</span>
                  <span className="text-slate-850">{selectedInvoice.bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">AGENCY PARTNER:</span>
                  <span className="text-slate-900 font-bold">{selectedInvoice.agentCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">TAX ID / COMM. REG:</span>
                  <span className="text-slate-850">{selectedInvoice.companyTaxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">AGENT NAME:</span>
                  <span className="text-slate-850">{selectedInvoice.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">AGENT CONTACT:</span>
                  <span className="text-slate-850">{selectedInvoice.agentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">AGENT EMAIL:</span>
                  <span className="text-slate-850">{selectedInvoice.agentEmail}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 space-y-2 text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-450">HOTEL PROPERTY:</span>
                  <span className="text-slate-800 font-semibold">{selectedInvoice.hotelNameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">ROOM ALLOCATION:</span>
                  <span className="text-slate-850">{selectedInvoice.roomTypeNameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">CHECK-IN DATE:</span>
                  <span className="text-slate-850">{selectedInvoice.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">CHECK-OUT DATE:</span>
                  <span className="text-slate-850">{selectedInvoice.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">GUESTS:</span>
                  <span className="text-slate-850">{selectedInvoice.guestsCount}</span>
                </div>
                {selectedInvoice.childrenCount && selectedInvoice.childrenCount > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-450">CHILDREN COUNT:</span>
                      <span className="text-slate-850">{selectedInvoice.childrenCount} ({selectedInvoice.childAges} yrs)</span>
                    </div>
                    {selectedInvoice.hasExtraBed && (
                      <div className="flex justify-between">
                        <span className="text-slate-450">EXTRA BED REQUESTED:</span>
                        <span className="text-amber-600 font-bold">YES (+$25/night)</span>
                      </div>
                    )}
                  </>
                ) : null}
                {selectedInvoice.transferId && (
                  <div className="flex justify-between">
                    <span className="text-slate-450">AIRPORT TRANSFER:</span>
                    <span className="text-slate-850 truncate max-w-[200px]" title={selectedInvoice.transferNameEn}>{selectedInvoice.transferNameEn} (+${selectedInvoice.transferPrice})</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 space-y-2 text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-450">PAYMENT TYPE:</span>
                  <span className="text-amber-600 uppercase font-semibold">{selectedInvoice.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">PAYMENT STATUS:</span>
                  <span className={`font-bold ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-rose-650'}`}>
                    {selectedInvoice.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">RESERVATION STATUS:</span>
                  <span className={`font-bold uppercase ${
                    selectedInvoice.status === 'confirmed' ? 'text-emerald-600' :
                    selectedInvoice.status === 'pending' ? 'text-amber-650' : 'text-rose-650'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-double border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-900">
                <span>TOTAL CONTRACT AMOUNT:</span>
                <span className="text-emerald-600 font-black">${selectedInvoice.totalPrice}</span>
              </div>
            </div>

            {/* Print action footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
              <button
                onClick={() => window.print()}
                className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors text-xs cursor-pointer"
              >
                Print / Download Contract Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {isRtl ? 'إضافة فندق متعاقد عليه جديد' : 'Establish New Contracted Hotel Property'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddHotelModal(false)}
                className="text-slate-450 hover:text-slate-800 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleCreateHotel} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-700 bg-white">
              {/* Part 1: Hotel Name, Destination, Stars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{isRtl ? 'اسم الفندق (En)' : 'Hotel Name (En)'}</label>
                  <input
                    type="text"
                    required
                    value={newHotelNameEn}
                    onChange={(e) => setNewHotelNameEn(e.target.value)}
                    placeholder="e.g. Sunrise Royal Resort"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{isRtl ? 'اسم الفندق (Ar)' : 'Hotel Name (Ar)'}</label>
                  <input
                    type="text"
                    required
                    value={newHotelNameAr}
                    onChange={(e) => setNewHotelNameAr(e.target.value)}
                    placeholder="مثال: منتجع شروق الشمس"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{t.destinationLabel}</label>
                  <select
                    value={newHotelDestId}
                    onChange={(e) => setNewHotelDestId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {isRtl ? d.nameAr : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{t.stars}</label>
                  <select
                    value={newHotelStars}
                    onChange={(e) => setNewHotelStars(parseInt(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                  </select>
                </div>
              </div>

              {/* Part 2: Exactly 5 Images of the Hotel (URL or upload) */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                  {isRtl ? 'صور الفندق (5 صور مطلوبة)' : 'Hotel Photo Gallery (Exactly 5 Photos Required)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col space-y-2 text-center relative shadow-sm hover:border-amber-500 transition-all">
                      <div className="text-[10px] text-slate-400 font-mono">#{idx + 1}</div>
                      <div className="w-full h-16 rounded-lg bg-slate-200 overflow-hidden relative">
                        {newHotelImages[idx] ? (
                          <img src={newHotelImages[idx]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Image</div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newHotelImages[idx]}
                        onChange={(e) => {
                          const updated = [...newHotelImages];
                          updated[idx] = e.target.value;
                          setNewHotelImages(updated);
                        }}
                        placeholder="Image URL"
                        className="bg-white border border-slate-250 rounded px-1.5 py-0.5 text-[10px] text-slate-800 w-full focus:outline-none"
                      />
                      <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold py-1 px-2 rounded cursor-pointer transition-colors block">
                        {isRtl ? 'تحميل من الجهاز' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                const updated = [...newHotelImages];
                                updated[idx] = base64String;
                                setNewHotelImages(updated);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3: Address & Map location without coordinates (Search & Pin only) */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <label className="block text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                  {isRtl ? 'العنوان وتحديد الموقع على الخريطة' : 'Hotel Address & Geographic Map Location'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">{isRtl ? 'العنوان بالإنجليزي' : 'Address Line (En)'}</label>
                    <input
                      type="text"
                      value={newHotelAddressEn}
                      onChange={(e) => setNewHotelAddressEn(e.target.value)}
                      placeholder="e.g. Hurghada, Egypt"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">{isRtl ? 'العنوان بالعربي' : 'Address Line (Ar)'}</label>
                    <input
                      type="text"
                      value={newHotelAddressAr}
                      onChange={(e) => setNewHotelAddressAr(e.target.value)}
                      placeholder="مثال: الغردقة، مصر"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <label className="block text-slate-800 text-xs font-bold">{isRtl ? 'ابحث لتحديد موقع الفندق على الخريطة' : 'Search to Pin Hotel on Map'}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const q = mapSearchQuery.toLowerCase().trim();
                          const preset = q.includes('cairo') || q.includes('قاهرة') ? { lat: 30.0444, lng: 31.2357 } :
                                         q.includes('giza') || q.includes('جيزة') || q.includes('pyramids') ? { lat: 29.9792, lng: 31.1342 } :
                                         q.includes('sharm') || q.includes('شرم') ? { lat: 27.9158, lng: 34.3299 } :
                                         q.includes('hurghada') || q.includes('غردقة') ? { lat: 27.2579, lng: 33.8116 } :
                                         q.includes('dahab') || q.includes('دهب') ? { lat: 28.5010, lng: 34.5154 } :
                                         q.includes('marsa') || q.includes('مرسى') ? { lat: 25.0717, lng: 34.8967 } :
                                         q.includes('luxor') || q.includes('أقصر') ? { lat: 25.6872, lng: 32.6396 } :
                                         q.includes('aswan') || q.includes('أسوان') ? { lat: 24.0889, lng: 32.8998 } :
                                         q.includes('alexandria') || q.includes('إسكندرية') ? { lat: 31.2001, lng: 29.9187 } : null;
                          if (preset) {
                            setNewHotelLat(preset.lat);
                            setNewHotelLng(preset.lng);
                          } else {
                            const destObj = destinations.find(d => d.id === newHotelDestId);
                            if (destObj) {
                              if (destObj.id === 'cairo') { setNewHotelLat(30.0444); setNewHotelLng(31.2357); }
                              else if (destObj.id === 'sharm') { setNewHotelLat(27.9158); setNewHotelLng(34.3299); }
                              else if (destObj.id === 'hurghada') { setNewHotelLat(27.2579); setNewHotelLng(33.8116); }
                              else if (destObj.id === 'luxor') { setNewHotelLat(25.6872); setNewHotelLng(32.6396); }
                              else if (destObj.id === 'dahab') { setNewHotelLat(28.5010); setNewHotelLng(34.5154); }
                              else { setNewHotelLat(29.9); setNewHotelLng(31.2); }
                            }
                          }
                        }
                      }}
                      placeholder={isRtl ? 'اكتب اسم المدينة (مثال: دهب، الغردقة، شرم الشيخ، القاهرة)...' : 'Type city/hotel (e.g. Dahab, Hurghada, Cairo)...'}
                      className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const q = mapSearchQuery.toLowerCase().trim();
                        const preset = q.includes('cairo') || q.includes('قاهرة') ? { lat: 30.0444, lng: 31.2357 } :
                                       q.includes('giza') || q.includes('جيزة') || q.includes('pyramids') ? { lat: 29.9792, lng: 31.1342 } :
                                       q.includes('sharm') || q.includes('شرم') ? { lat: 27.9158, lng: 34.3299 } :
                                       q.includes('hurghada') || q.includes('غردقة') ? { lat: 27.2579, lng: 33.8116 } :
                                       q.includes('dahab') || q.includes('دهب') ? { lat: 28.5010, lng: 34.5154 } :
                                       q.includes('marsa') || q.includes('مرسى') ? { lat: 25.0717, lng: 34.8967 } :
                                       q.includes('luxor') || q.includes('أقصر') ? { lat: 25.6872, lng: 32.6396 } :
                                       q.includes('aswan') || q.includes('أسوان') ? { lat: 24.0889, lng: 32.8998 } :
                                       q.includes('alexandria') || q.includes('إسكندرية') ? { lat: 31.2001, lng: 29.9187 } : null;
                        if (preset) {
                          setNewHotelLat(preset.lat);
                          setNewHotelLng(preset.lng);
                        } else {
                          const destObj = destinations.find(d => d.id === newHotelDestId);
                          if (destObj) {
                            if (destObj.id === 'cairo') { setNewHotelLat(30.0444); setNewHotelLng(31.2357); }
                            else if (destObj.id === 'sharm') { setNewHotelLat(27.9158); setNewHotelLng(34.3299); }
                            else if (destObj.id === 'hurghada') { setNewHotelLat(27.2579); setNewHotelLng(33.8116); }
                            else if (destObj.id === 'luxor') { setNewHotelLat(25.6872); setNewHotelLng(32.6396); }
                            else if (destObj.id === 'dahab') { setNewHotelLat(28.5010); setNewHotelLng(34.5154); }
                            else { setNewHotelLat(29.9); setNewHotelLng(31.2); }
                          }
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      {isRtl ? 'ابحث' : 'Search'}
                    </button>
                  </div>
                  
                  <InteractiveMap
                    lat={newHotelLat}
                    lng={newHotelLng}
                    hotelName={newHotelNameEn || 'New Property'}
                    address={newHotelAddressEn || 'Coordinates Selector'}
                    lang={lang}
                    editable={true}
                    onCoordinatesChange={(clat, clng) => {
                      setNewHotelLat(clat);
                      setNewHotelLng(clng);
                    }}
                  />
                </div>
              </div>

              {/* Part 4: Room types with specific price per night and custom periods from-to */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <label className="block text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                  {isRtl ? 'إدارة الغرف وفترات الأسعار التعاقدية (من - إلى)' : 'Room Types & Specific Period Pricing (From - To)'}
                </label>

                {/* Adding dynamic room type */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">{isRtl ? 'اسم الغرفة (En)' : 'Room Name (En)'}</label>
                      <input
                        type="text"
                        value={tempRoomNameEn}
                        onChange={(e) => setTempRoomNameEn(e.target.value)}
                        placeholder="e.g. Standard Pool View Room"
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">{isRtl ? 'اسم الغرفة (Ar)' : 'Room Name (Ar)'}</label>
                      <input
                        type="text"
                        value={tempRoomNameAr}
                        onChange={(e) => setTempRoomNameAr(e.target.value)}
                        placeholder="مثال: غرفة قياسية مطلة على المسبح"
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">{isRtl ? 'الفترة من' : 'Period From'}</label>
                      <input
                        type="date"
                        value={tempRoomPeriodStart}
                        onChange={(e) => setTempRoomPeriodStart(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 w-full font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">{isRtl ? 'الفترة إلى' : 'Period To'}</label>
                      <input
                        type="date"
                        value={tempRoomPeriodEnd}
                        onChange={(e) => setTempRoomPeriodEnd(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 w-full font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">{isRtl ? 'سعر الليلة لهذه الفترة ($)' : 'Rate / Night ($)'}</label>
                      <input
                        type="number"
                        value={tempRoomPrice}
                        onChange={(e) => setTempRoomPrice(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-850 font-mono w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!tempRoomNameEn || !tempRoomNameAr) {
                        alert(isRtl ? 'يرجى إدخال اسم الغرفة باللغتين.' : 'Please enter room name in both languages.');
                        return;
                      }
                      if (!tempRoomPrice) {
                        alert(isRtl ? 'يرجى إدخال سعر الليلة.' : 'Please enter the price per night.');
                        return;
                      }
                      const rId = `room-${Date.now()}`;
                      const rate = parseInt(tempRoomPrice) || 150;

                      // 1. Create RoomType
                      const newRoom: RoomType = {
                        id: rId,
                        nameEn: tempRoomNameEn,
                        nameAr: tempRoomNameAr,
                        descriptionEn: 'Premium executive client comfort.',
                        descriptionAr: 'راحة متميزة ومرافق عصرية ملائمة لأعمال الشركات.',
                        pricePerNight: rate,
                        inventory: 15,
                        capacity: 2,
                        maxOccupancy: 3,
                        amenitiesEn: ['Wifi', 'Corporate Desk', 'AC'],
                        amenitiesAr: ['إنترنت هوائي', 'مكتب عمل', 'تكييف هواء']
                      };

                      // 2. Add matching specific date rate override if periods are specified
                      if (tempRoomPeriodStart && tempRoomPeriodEnd) {
                        const newOverride: HotelSchedule = {
                          id: `sched-create-${Date.now()}`,
                          nameEn: `Season Period: ${tempRoomNameEn}`,
                          nameAr: `فترة موسمية: ${tempRoomNameAr}`,
                          startDate: tempRoomPeriodStart,
                          endDate: tempRoomPeriodEnd,
                          roomTypeId: rId,
                          priceOverride: rate,
                          inventoryOverride: 15
                        };
                        setNewHotelSchedules([...newHotelSchedules, newOverride]);
                      }

                      setNewHotelRooms([...newHotelRooms, newRoom]);
                      setTempRoomNameEn('');
                      setTempRoomNameAr('');
                      setTempRoomPeriodStart('');
                      setTempRoomPeriodEnd('');
                      setTempRoomPrice('150');
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-4 rounded-xl w-full cursor-pointer transition-colors shadow-sm animate-fadeIn"
                  >
                    {isRtl ? '+ إضافة نوع الغرفة وتعيين السعر والفترة' : '+ Add Room Type & Allot price period'}
                  </button>
                </div>

                {/* List of currently added rooms with validity periods */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 block">{isRtl ? 'أنواع الغرف وأسعار الفترات المضافة حالياً:' : 'Currently Configured Room Types & Specific Periods:'}</label>
                  {newHotelRooms.length === 0 ? (
                    <p className="text-xs text-rose-600 font-bold italic">{isRtl ? 'يرجى إضافة غرفة واحدة على الأقل.' : 'At least one room type is required.'}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newHotelRooms.map((room) => {
                        const matchingScheds = newHotelSchedules.filter(s => s.roomTypeId === room.id);
                        return (
                          <div key={room.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative shadow-xs">
                            <div>
                              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-2">
                                <span className="font-extrabold text-xs text-slate-900">{isRtl ? room.nameAr : room.nameEn}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewHotelRooms(newHotelRooms.filter(r => r.id !== room.id));
                                    setNewHotelSchedules(newHotelSchedules.filter(s => s.roomTypeId !== room.id));
                                  }}
                                  className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="text-[11px] text-slate-700 font-bold">
                                {isRtl ? 'السعر الافتراضي:' : 'Default Price:'} <span className="text-emerald-700 font-mono">${room.pricePerNight}</span>
                              </div>
                            </div>
                            {matchingScheds.length > 0 && (
                              <div className="mt-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 space-y-1">
                                <div className="text-[9px] uppercase font-bold text-amber-900">{isRtl ? 'الفترة النشطة المحددة:' : 'Configured Period Override:'}</div>
                                {matchingScheds.map((sch) => (
                                  <div key={sch.id} className="text-[10px] text-slate-600 font-mono flex justify-between">
                                    <span>{sch.startDate} - {sch.endDate}</span>
                                    <span className="font-bold text-emerald-700">${sch.priceOverride}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Part 5: Child policy structured values */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                  {isRtl ? 'تحديد سياسة الأطفال (العدد والسن والمبلغ)' : 'Child Policy Definition (Count, Age & Surcharge)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-650 block mb-1">{isRtl ? 'أقصى عدد للأطفال' : 'Max Children Count'}</label>
                    <input
                      type="number"
                      value={childPolicyCount}
                      onChange={(e) => setChildPolicyCount(parseInt(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-650 block mb-1">{isRtl ? 'أقصى سن للأطفال' : 'Max Child Age Limit'}</label>
                    <input
                      type="number"
                      value={childPolicyAge}
                      onChange={(e) => setChildPolicyAge(parseInt(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-650 block mb-1">{isRtl ? 'المبلغ المطلوب للطفل في الليلة ($)' : 'Price Per Child/Night ($)'}</label>
                    <input
                      type="number"
                      value={childPolicyPrice}
                      onChange={(e) => setChildPolicyPrice(parseInt(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-850 font-mono w-full"
                    />
                  </div>
                </div>
                <div className="text-xs bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-650 italic">
                  {isRtl ? `السياسة الناتجة: بحد أقصى ${childPolicyCount} من الأطفال حتى سن ${childPolicyAge} سنة بسعر ${childPolicyPrice}$ للطفل في الليلة.` : `Generated Policy: Up to ${childPolicyCount} children under ${childPolicyAge} years stay for $${childPolicyPrice} per night.`}
                </div>
              </div>

              {/* Part 6: Supplements prices */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <label className="block text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                  {isRtl ? 'أسعار الإضافات والخدمات (Supplements)' : 'Hotel Contract Supplements & Services Pricing'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Supplement input subform */}
                  <div className="md:col-span-1 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'اسم الإضافة بالإنجليزي' : 'Supplement Name (En)'}</label>
                      <input
                        type="text"
                        value={newSupplementNameEn}
                        onChange={(e) => setNewSupplementNameEn(e.target.value)}
                        placeholder="e.g. Soft All Inclusive / Sea View"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-850 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'اسم الإضافة بالعربي' : 'Supplement Name (Ar)'}</label>
                      <input
                        type="text"
                        value={newSupplementNameAr}
                        onChange={(e) => setNewSupplementNameAr(e.target.value)}
                        placeholder="مثال: إقامة شاملة كلي خفيف"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-850 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'سعر الإضافة ($)' : 'Supplement Price ($)'}</label>
                      <input
                        type="number"
                        value={newSupplementPrice}
                        onChange={(e) => setNewSupplementPrice(parseInt(e.target.value) || 0)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-850 font-mono w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSupplementNameEn || !newSupplementNameAr) {
                          alert(isRtl ? 'يرجى ملء اسم الإضافة باللغتين.' : 'Please enter supplement name in both languages.');
                          return;
                        }
                        const supplementId = `supp-${Date.now()}`;
                        const newSupp = {
                          id: supplementId,
                          nameEn: newSupplementNameEn,
                          nameAr: newSupplementNameAr,
                          price: newSupplementPrice
                        };
                        setNewHotelSupplements([...newHotelSupplements, newSupp]);
                        setNewSupplementNameEn('');
                        setNewSupplementNameAr('');
                        setNewSupplementPrice(100);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] py-1.5 w-full rounded-lg cursor-pointer transition-colors"
                    >
                      {isRtl ? '+ إضافة الخدمة الإضافية' : '+ Add Supplement'}
                    </button>
                  </div>

                  {/* Supplements List */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">{isRtl ? 'الإضافات والترقيات المدرجة:' : 'Configured Supplements & Upgrades:'}</label>
                    {newHotelSupplements.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl text-slate-400 text-xs">
                        {isRtl ? 'لا توجد إضافات مدخلة بعد لهذا الفندق.' : 'No supplements added yet.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {newHotelSupplements.map((sp) => (
                          <div key={sp.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
                            <div>
                              <div className="font-extrabold text-slate-900">{isRtl ? sp.nameAr : sp.nameEn}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{isRtl ? 'سعر إضافي اختياري للشركات' : 'Optional contract supplement'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-50 text-amber-700 px-2.5 py-1 text-xs rounded border border-amber-100 font-mono font-black">${sp.price}</span>
                              <button
                                type="button"
                                onClick={() => setNewHotelSupplements(newHotelSupplements.filter(s => s.id !== sp.id))}
                                className="text-rose-650 hover:text-rose-800 font-bold p-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs cursor-pointer font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC ADD DESTINATION MODAL DIALOG */}
      {showAddDestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {isRtl ? 'إضافة وجهة سياحية جديدة' : 'Add New Tourist Destination'}
              </h3>
              <button
                onClick={() => setShowAddDestModal(false)}
                className="text-slate-450 hover:text-slate-800 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleCreateDestination} className="p-6 space-y-4 text-slate-700 bg-white">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">Destination Code / Unique ID</label>
                  <input
                    type="text"
                    required
                    value={newDestId}
                    onChange={(e) => setNewDestId(e.target.value)}
                    placeholder="e.g. dahab, marsa-alam"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-550 text-xs mb-1.5">Destination Name (English)</label>
                    <input
                      type="text"
                      required
                      value={newDestNameEn}
                      onChange={(e) => setNewDestNameEn(e.target.value)}
                      placeholder="e.g. Dahab"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 text-xs mb-1.5">اسم الوجهة (العربية)</label>
                    <input
                      type="text"
                      required
                      value={newDestNameAr}
                      onChange={(e) => setNewDestNameAr(e.target.value)}
                      placeholder="مثال: دهب"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{t.descEn}</label>
                  <textarea
                    rows={2}
                    value={newDestDescEn}
                    onChange={(e) => setNewDestDescEn(e.target.value)}
                    placeholder="English description of the beauty and B2B capacity of this location..."
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">{t.descAr}</label>
                  <textarea
                    rows={2}
                    value={newDestDescAr}
                    onChange={(e) => setNewDestDescAr(e.target.value)}
                    placeholder="الوصف بالعربية لهذه الوجهة والفرص الاستثمارية..."
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 text-xs mb-1.5">Image Cover Link URL</label>
                  <input
                    type="text"
                    value={newDestImg}
                    onChange={(e) => setNewDestImg(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDestModal(false)}
                  className="border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB-INTEGRATED / FULL EDIT HOTEL MODAL DIALOG */}
      {editHotelData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="border-b border-slate-150 p-6 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {isRtl ? `تعديل فندق: ${editHotelData.nameAr}` : `Edit Hotel: ${editHotelData.nameEn}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRtl ? 'تعديل البيانات الأساسية للفندق، أنواع الغرف، الأسعار وجدول المواعيد المدمج.' : 'Modify property variables, room rates, allotments, and custom schedule overrides.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditHotelData(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-8">
              
              {/* SECTION 1: Standard Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                  {isRtl ? '١. المعلومات الأساسية والتعاقد' : '1. Core Contract Info'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'اسم الفندق (En)' : 'Hotel Name (En)'}</label>
                    <input
                      type="text"
                      value={editHotelData.nameEn}
                      onChange={(e) => setEditHotelData({ ...editHotelData, nameEn: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'اسم الفندق (Ar)' : 'Hotel Name (Ar)'}</label>
                    <input
                      type="text"
                      value={editHotelData.nameAr}
                      onChange={(e) => setEditHotelData({ ...editHotelData, nameAr: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'التصنيف بالنجوم' : 'Stars Class'}</label>
                    <select
                      value={editHotelData.stars}
                      onChange={(e) => setEditHotelData({ ...editHotelData, stars: parseInt(e.target.value) })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full"
                    >
                      <option value={3}>3 ★★★</option>
                      <option value={4}>4 ★★★★</option>
                      <option value={5}>5 ★★★★★</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'سعر الليلة الأساسي ($)' : 'Base Contract Price ($)'}</label>
                    <input
                      type="number"
                      value={editHotelData.basePrice}
                      onChange={(e) => setEditHotelData({ ...editHotelData, basePrice: parseInt(e.target.value) || 0 })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'الوجهة السياحية' : 'Destination Unit'}</label>
                    <select
                      value={editHotelData.destinationId}
                      onChange={(e) => setEditHotelData({ ...editHotelData, destinationId: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full font-mono text-[11px]"
                    >
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{isRtl ? d.nameAr : d.nameEn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'العنوان الجغرافي (En)' : 'Address Line (En)'}</label>
                    <input
                      type="text"
                      value={editHotelData.addressEn}
                      onChange={(e) => setEditHotelData({ ...editHotelData, addressEn: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'العنوان الجغرافي (Ar)' : 'Address Line (Ar)'}</label>
                    <input
                      type="text"
                      value={editHotelData.addressAr}
                      onChange={(e) => setEditHotelData({ ...editHotelData, addressAr: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'الوصف التعاقدي (En)' : 'Contractual Description (En)'}</label>
                    <textarea
                      rows={2}
                      value={editHotelData.descriptionEn}
                      onChange={(e) => setEditHotelData({ ...editHotelData, descriptionEn: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'الوصف التعاقدي (Ar)' : 'Contractual Description (Ar)'}</label>
                    <textarea
                      rows={2}
                      value={editHotelData.descriptionAr}
                      onChange={(e) => setEditHotelData({ ...editHotelData, descriptionAr: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-slate-600 text-xs mb-1 font-bold">Image Cover URL Link</label>
                    <input
                      type="text"
                      value={editHotelData.images[0] || ''}
                      onChange={(e) => {
                        const imgs = [...editHotelData.images];
                        imgs[0] = e.target.value;
                        setEditHotelData({ ...editHotelData, images: imgs });
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-bold">{isRtl ? 'إحداثيات الخريطة (Lat / Lng)' : 'Map Coordinates (Lat / Lng)'}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={editHotelData.lat}
                        onChange={(e) => setEditHotelData({ ...editHotelData, lat: parseFloat(e.target.value) || 0 })}
                        placeholder="Lat"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-xs text-slate-850 focus:outline-none w-1/2 font-mono"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={editHotelData.lng}
                        onChange={(e) => setEditHotelData({ ...editHotelData, lng: parseFloat(e.target.value) || 0 })}
                        placeholder="Lng"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-xs text-slate-850 focus:outline-none w-1/2 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 1B: Child Policies & Transfers */}
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 space-y-4 font-sans">
                  <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-amber-900 border-b border-amber-500/20 pb-1.5">
                    {isRtl ? 'سياسات الأطفال والترقيات وعقود النقل والمواصلات' : 'Child Policies, Contract Supplements & Transfer Pricing'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">{isRtl ? 'سياسة الأطفال (En)' : 'Child Policy (English)'}</label>
                      <textarea
                        rows={2}
                        value={editHotelData.childPolicyEn || ''}
                        onChange={(e) => setEditHotelData({ ...editHotelData, childPolicyEn: e.target.value })}
                        placeholder="e.g. Children under 6 stay free. Children 6-12 pay 50% rate."
                        className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">{isRtl ? 'سياسة الأطفال (Ar)' : 'Child Policy (Arabic)'}</label>
                      <textarea
                        rows={2}
                        value={editHotelData.childPolicyAr || ''}
                        onChange={(e) => setEditHotelData({ ...editHotelData, childPolicyAr: e.target.value })}
                        placeholder="مثال: الأطفال دون سن ٦ سنوات مجاناً. الأطفال ٦-١٢ سنة يدفعون ٥٠٪."
                        className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-amber-500 w-full resize-none"
                      />
                    </div>
                  </div>

                  {/* Transfer Options */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-slate-800 block uppercase tracking-wider">{isRtl ? 'أسعار نقل وتوصيل الأفراد (حسب الوجهة ونوع السيارة):' : 'Per-Person Transfer Options & Rates (by Location & Vehicle):'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(editHotelData.transfers || []).map((tr, tIdx) => (
                        <div key={tr.id || tIdx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{isRtl ? tr.fromAr : tr.fromEn}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {isRtl ? `السيارة: ${tr.vehicleAr || 'سيدان'}` : `Vehicle: ${tr.vehicleEn || 'Sedan'}`}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{isRtl ? 'سعر للفرد الواحد' : 'Rate per person'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs rounded border border-emerald-100 font-mono font-black">${tr.pricePerPerson || (tr as any).price || 0}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newTransfers = (editHotelData.transfers || []).filter(t => t.id !== tr.id);
                                setEditHotelData({ ...editHotelData, transfers: newTransfers });
                              }}
                              className="text-rose-600 hover:text-rose-800 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add route subform */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'من موقع بالإنجليزية' : 'From Location (En)'}</label>
                          <input
                            type="text"
                            id="editTransEn"
                            placeholder="e.g. Cairo Airport"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'من موقع بالعربية' : 'From Location (Ar)'}</label>
                          <input
                            type="text"
                            id="editTransAr"
                            placeholder="مثال: مطار القاهرة"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'نوع السيارة بالإنجليزية' : 'Vehicle Type (En)'}</label>
                          <input
                            type="text"
                            id="editTransVehicleEn"
                            placeholder="e.g. Sedan Car"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'نوع السيارة بالعربية' : 'Vehicle Type (Ar)'}</label>
                          <input
                            type="text"
                            id="editTransVehicleAr"
                            placeholder="مثال: سيارة سيدان"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 w-full"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-1/2">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'سعر الفرد ($)' : 'Price Per Person ($)'}</label>
                            <input
                              type="number"
                              id="editTransPrice"
                              defaultValue={15}
                              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-850 w-full font-mono text-center h-[32px]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const enInput = document.getElementById('editTransEn') as HTMLInputElement;
                              const arInput = document.getElementById('editTransAr') as HTMLInputElement;
                              const vehEnInput = document.getElementById('editTransVehicleEn') as HTMLInputElement;
                              const vehArInput = document.getElementById('editTransVehicleAr') as HTMLInputElement;
                              const priceInput = document.getElementById('editTransPrice') as HTMLInputElement;
                              if (enInput && arInput && priceInput) {
                                if (!enInput.value || !arInput.value) {
                                  alert(isRtl ? 'يرجى ملء اسم موقع الانطلاق باللغتين.' : 'Please enter source locations in both languages.');
                                  return;
                                }
                                const newTr = {
                                  id: `trans-edit-${Date.now()}`,
                                  fromEn: enInput.value,
                                  fromAr: arInput.value,
                                  vehicleEn: (vehEnInput && vehEnInput.value) || 'Standard Sedan',
                                  vehicleAr: (vehArInput && vehArInput.value) || 'سيدان قياسية',
                                  pricePerPerson: parseInt(priceInput.value) || 15
                                };
                                const currentTransfers = editHotelData.transfers || [];
                                setEditHotelData({
                                  ...editHotelData,
                                  transfers: [...currentTransfers, newTr]
                                });
                                enInput.value = '';
                                arInput.value = '';
                                if (vehEnInput) vehEnInput.value = '';
                                if (vehArInput) vehArInput.value = '';
                                priceInput.value = '15';
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 rounded-lg h-[32px] w-1/2 transition-colors cursor-pointer"
                          >
                            {isRtl ? '+ إضافة' : '+ Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supplements Option */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <label className="text-xs font-extrabold text-slate-800 block uppercase tracking-wider">{isRtl ? 'الإضافات والترقيات التعاقدية (Supplements):' : 'Contract Supplements & Upgrades:'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(editHotelData.supplements || []).map((sp, sIdx) => (
                        <div key={sp.id || sIdx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{isRtl ? sp.nameAr : sp.nameEn}</span>
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'إضافة اختيارية' : 'Optional supplement'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 text-xs rounded border border-amber-100 font-mono font-black">${sp.price}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSupps = (editHotelData.supplements || []).filter(s => s.id !== sp.id);
                                setEditHotelData({ ...editHotelData, supplements: newSupps });
                              }}
                              className="text-rose-600 hover:text-rose-800 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add supplement subform */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'الإضافة بالإنجليزية' : 'Supplement Name (En)'}</label>
                        <input
                          type="text"
                          id="editSuppEn"
                          placeholder="e.g. Soft All Inclusive"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 w-full"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'الإضافة بالعربية' : 'Supplement Name (Ar)'}</label>
                        <input
                          type="text"
                          id="editSuppAr"
                          placeholder="مثال: إقامة شاملة كلي خفيف"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{isRtl ? 'السعر ($)' : 'Price ($)'}</label>
                          <input
                            type="number"
                            id="editSuppPrice"
                            defaultValue={100}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-850 w-full font-mono text-center h-[32px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const enInput = document.getElementById('editSuppEn') as HTMLInputElement;
                            const arInput = document.getElementById('editSuppAr') as HTMLInputElement;
                            const priceInput = document.getElementById('editSuppPrice') as HTMLInputElement;
                            if (enInput && arInput && priceInput) {
                              if (!enInput.value || !arInput.value) {
                                alert(isRtl ? 'يرجى ملء اسم الإضافة باللغتين.' : 'Please enter supplement name in both languages.');
                                return;
                              }
                              const newSp = {
                                id: `supp-edit-${Date.now()}`,
                                nameEn: enInput.value,
                                nameAr: arInput.value,
                                price: parseInt(priceInput.value) || 100
                              };
                              const currentSupps = editHotelData.supplements || [];
                              setEditHotelData({
                                ...editHotelData,
                                supplements: [...currentSupps, newSp]
                              });
                              enInput.value = '';
                              arInput.value = '';
                              priceInput.value = '100';
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 rounded-lg h-[32px] w-1/2 transition-colors cursor-pointer"
                        >
                          {isRtl ? '+ إضافة' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Room Inventory Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-400">
                    {isRtl ? '٢. إدارة أنواع الغرف والأسعار والعدد المتاح' : '2. Room Types, Inventory & Dynamic Pricing'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newRoomId = `room-${Date.now()}`;
                      const newRoom: RoomType = {
                        id: newRoomId,
                        nameEn: 'Standard Deluxe',
                        nameAr: 'غرفة ديلوكس قياسية',
                        descriptionEn: 'Premium comfort with standard B2B amenities.',
                        descriptionAr: 'راحة فائقة ومجهزة بمرافق الأعمال القياسية المتكاملة.',
                        pricePerNight: editHotelData.basePrice || 200,
                        capacity: 2,
                        maxOccupancy: 3,
                        amenitiesEn: ['Corporate Desk', 'Fiber Internet'],
                        amenitiesAr: ['مكتب عمل للشركات', 'إنترنت ألياف ضوئية'],
                        inventory: 10,
                        boardTypeEn: 'Bed & Breakfast',
                        boardTypeAr: 'إقامة مع الإفطار'
                      };
                      setEditHotelData({
                        ...editHotelData,
                        rooms: [...editHotelData.rooms, newRoom]
                      });
                    }}
                    className="bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة نوع غرفة' : 'Add Room Type'}</span>
                  </button>
                </div>

                {editHotelData.rooms.length === 0 ? (
                  <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                    {isRtl ? 'تنبيه: يجب إضافة نوع غرفة واحد على الأقل للفندق لتلقي الحجوزات.' : 'Warning: At least one room type is required for B2B booking channels.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editHotelData.rooms.map((room, rIdx) => (
                      <div key={room.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                          <span className="font-mono text-[9px] font-extrabold text-slate-400">
                            ID: {room.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedRooms = editHotelData.rooms.filter(r => r.id !== room.id);
                              setEditHotelData({ ...editHotelData, rooms: updatedRooms });
                            }}
                            className="text-rose-600 hover:bg-rose-100 p-1 rounded-md transition-colors cursor-pointer"
                            title={isRtl ? 'حذف نوع الغرفة' : 'Delete Room Type'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'الاسم (En)' : 'Name (En)'}</label>
                            <input
                              type="text"
                              value={room.nameEn}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].nameEn = e.target.value;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'الاسم (Ar)' : 'Name (Ar)'}</label>
                            <input
                              type="text"
                              value={room.nameAr}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].nameAr = e.target.value;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'نوع الإقامة (En)' : 'Board Basis (En)'}</label>
                            <input
                              type="text"
                              value={room.boardTypeEn || ''}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].boardTypeEn = e.target.value;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              placeholder="e.g. Bed & Breakfast"
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'نوع الإقامة (Ar)' : 'Board Basis (Ar)'}</label>
                            <input
                              type="text"
                              value={room.boardTypeAr || ''}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].boardTypeAr = e.target.value;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              placeholder="مثال: إقامة مع الإفطار"
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'سعر الليلة ($)' : 'Price Per Night ($)'}</label>
                            <input
                              type="number"
                              value={room.pricePerNight}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].pricePerNight = parseInt(e.target.value) || 0;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'عدد الغرف الإجمالي' : 'Base Inventory Count'}</label>
                            <input
                              type="number"
                              value={room.inventory}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].inventory = parseInt(e.target.value) || 0;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'السعة القياسية' : 'Capacity (pax)'}</label>
                            <input
                              type="number"
                              value={room.capacity}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].capacity = parseInt(e.target.value) || 2;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-slate-550 text-[10px] uppercase font-mono block mb-1">{isRtl ? 'أقصى سعة للأطفال' : 'Max Occupancy'}</label>
                            <input
                              type="number"
                              value={room.maxOccupancy}
                              onChange={(e) => {
                                const newRooms = [...editHotelData.rooms];
                                newRooms[rIdx].maxOccupancy = parseInt(e.target.value) || 4;
                                setEditHotelData({ ...editHotelData, rooms: newRooms });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: Integrated Schedule and Date Overrides Manager */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                  {isRtl ? '٣. جدول المواعيد والاستثناءات (دمج متكامل للتعديل)' : '3. Hotel Schedule & Dynamic Date Overrides'}
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Form to Add Schedule Override */}
                  <div className="lg:col-span-1 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 mb-1">
                      {isRtl ? 'إضافة استثناء مواعيد جديد' : 'New Date Override'}
                    </h5>

                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'اسم المناسبة / الموسم (En)' : 'Event / Season Name (En)'}</label>
                      <input
                        type="text"
                        value={schedNameEn}
                        onChange={(e) => setSchedNameEn(e.target.value)}
                        placeholder="e.g. Cairo Conference Week"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'اسم المناسبة / الموسم (Ar)' : 'Event / Season Name (Ar)'}</label>
                      <input
                        type="text"
                        value={schedNameAr}
                        onChange={(e) => setSchedNameAr(e.target.value)}
                        placeholder="مثال: مؤتمر القاهرة الطبي"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'تاريخ البدء' : 'Start Date'}</label>
                        <input
                          type="date"
                          value={schedStart}
                          onChange={(e) => setSchedStart(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'تاريخ الانتهاء' : 'End Date'}</label>
                        <input
                          type="date"
                          value={schedEnd}
                          onChange={(e) => setSchedEnd(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'نوع الغرفة المستهدفة' : 'Apply to Room Type'}</label>
                      <select
                        value={schedRoomId}
                        onChange={(e) => setSchedRoomId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 w-full"
                      >
                        <option value="all">{isRtl ? 'جميع أنواع الغرف' : 'All Room Types'}</option>
                        {editHotelData.rooms.map(r => (
                          <option key={r.id} value={r.id}>{isRtl ? r.nameAr : r.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'السعر المعدل ($)' : 'Price Override ($)'}</label>
                        <input
                          type="number"
                          value={schedPrice}
                          onChange={(e) => setSchedPrice(e.target.value)}
                          placeholder="e.g. 350"
                          disabled={schedIsBlocked}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-0.5">{isRtl ? 'العدد المتاح المعدل' : 'Allotment Override'}</label>
                        <input
                          type="number"
                          value={schedInventory}
                          onChange={(e) => setSchedInventory(e.target.value)}
                          placeholder="e.g. 5"
                          disabled={schedIsBlocked}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 w-full font-mono disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="isBlockedCheck"
                        checked={schedIsBlocked}
                        onChange={(e) => {
                          setSchedIsBlocked(e.target.checked);
                          if (e.target.checked) {
                            setSchedPrice('');
                            setSchedInventory('');
                          }
                        }}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="isBlockedCheck" className="text-xs text-slate-700 font-extrabold cursor-pointer">
                        {isRtl ? 'إغلاق الحجوزات بالكامل (Blackout)' : 'Full Blackout / Block Bookings'}
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!schedNameEn || !schedNameAr || !schedStart || !schedEnd) {
                          alert(isRtl ? 'يرجى تحديد الاسم وتاريخ البدء وتاريخ الانتهاء للاستثناء.' : 'Please specify a name, start date, and end date for the schedule override.');
                          return;
                        }
                        const newSched: HotelSchedule = {
                          id: `sched-${Date.now()}`,
                          nameEn: schedNameEn,
                          nameAr: schedNameAr,
                          startDate: schedStart,
                          endDate: schedEnd,
                          roomTypeId: schedRoomId,
                          priceOverride: schedPrice ? parseInt(schedPrice) : undefined,
                          inventoryOverride: schedInventory ? parseInt(schedInventory) : undefined,
                          isBlocked: schedIsBlocked
                        };
                        const updatedSchedules = [...(editHotelData.schedules || []), newSched];
                        setEditHotelData({
                          ...editHotelData,
                          schedules: updatedSchedules
                        });
                        // Reset schedule form
                        setSchedNameEn('');
                        setSchedNameAr('');
                        setSchedRoomId('all');
                        setSchedStart('');
                        setSchedEnd('');
                        setSchedPrice('');
                        setSchedInventory('');
                        setSchedIsBlocked(false);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2 w-full rounded-xl mt-2 transition-colors cursor-pointer"
                    >
                      {isRtl ? '+ إضافة موعد للاستثناءات' : '+ Add Schedule Override'}
                    </button>
                  </div>

                  {/* Right Column: Listing of Current Overrides */}
                  <div className="lg:col-span-2 space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isRtl ? 'المواعيد والاستثناءات المسجلة حالياً' : 'Active Registered Date Schedules'}
                    </h5>

                    {(!editHotelData.schedules || editHotelData.schedules.length === 0) ? (
                      <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4">
                        <Calendar className="w-8 h-8 text-slate-350 animate-pulse mb-2" />
                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                          {isRtl
                            ? 'لا توجد مواعيد مخصصة أو استثناءات مسجلة لهذا الفندق بعد. الأسعار والحصص الافتراضية ستطبق لجميع الأيام.'
                            : 'No custom schedules configured yet. Default prices and allotments will apply unconditionally to all dates.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {editHotelData.schedules.map((sched) => {
                          const associatedRoom = editHotelData.rooms.find(r => r.id === sched.roomTypeId);
                          return (
                            <div key={sched.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs text-slate-900">
                                    {isRtl ? sched.nameAr : sched.nameEn}
                                  </span>
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                    {sched.roomTypeId === 'all' 
                                      ? (isRtl ? 'كل الغرف' : 'All Rooms') 
                                      : (isRtl ? associatedRoom?.nameAr : associatedRoom?.nameEn)}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-550 font-mono">
                                  {sched.startDate} {isRtl ? 'إلى' : 'to'} {sched.endDate}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right flex flex-col gap-0.5">
                                  {sched.isBlocked ? (
                                    <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-100 uppercase">
                                      {isRtl ? 'إغلاق كامل' : 'Blackout'}
                                    </span>
                                  ) : (
                                    <div className="flex gap-1.5 text-[9px] font-mono">
                                      {sched.priceOverride !== undefined && (
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                                          Price: ${sched.priceOverride}
                                        </span>
                                      )}
                                      {sched.inventoryOverride !== undefined && (
                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-bold">
                                          Qty: {sched.inventoryOverride}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = editHotelData.schedules?.filter(s => s.id !== sched.id) || [];
                                    setEditHotelData({ ...editHotelData, schedules: filtered });
                                  }}
                                  className="text-rose-550 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title={isRtl ? 'حذف الاستثناء' : 'Delete Schedule'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-150 p-6 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
              <button
                type="button"
                onClick={() => setEditHotelData(null)}
                className="border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs cursor-pointer font-bold"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateHotel(editHotelData);
                  setEditHotelData(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-colors"
              >
                {isRtl ? 'حفظ وحفظ التغييرات السحابية' : 'Save Property Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
