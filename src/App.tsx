import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Globe, Search, Star, Hotel as HotelIcon, Compass, MapPin, 
  TrendingUp, Award, Calendar, Bell, ChevronRight, CheckCircle, Flame, LogIn, Users,
  ShieldCheck, Zap, Sparkles, Receipt, Check, ArrowUpDown, X, Clock, Camera, ChevronLeft, Car, RefreshCw
} from 'lucide-react';
import { Hotel, Destination, Booking, Language, Review, PortalUser, formatPrice } from './types';
import { translations } from './translations';
import { HotelDetail } from './components/HotelDetail';
import { B2BDashboard } from './components/B2BDashboard';
import { collection, getDocs, getDoc, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  // Load State from LocalStorage or Fallback to pre-seeded static data
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('khatwa_lang');
    return (saved as Language) || 'ar'; // Default to Arabic as requested by user
  });

  const [activeView, setActiveView] = useState<'explore' | 'dashboard'>(() => {
    const saved = localStorage.getItem('khatwa_view');
    return (saved as any) || 'explore';
  });

  const [loggedInUser, setLoggedInUser] = useState<PortalUser | null>(() => {
    const saved = localStorage.getItem('khatwa_logged_in_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAdmin = loggedInUser ? true : (localStorage.getItem('khatwa_is_admin') === 'true');

  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const [selectedDestId, setSelectedDestId] = useState<string>('all');
  const destinationsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [starsFilter, setStarsFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Real-time notification toast alerts state
  const [toasts, setToasts] = useState<{ id: string; message: string; date: string }[]>([]);

  // Room schedules/rates modal state
  const [scheduleHotel, setScheduleHotel] = useState<Hotel | null>(null);
  const [scheduleCheckIn, setScheduleCheckIn] = useState<string>('');
  const [scheduleCheckOut, setScheduleCheckOut] = useState<string>('');

  // Gallery view modal state
  const [galleryHotel, setGalleryHotel] = useState<Hotel | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Automatically initialize schedule dates to tomorrow -> 5 days later
  useEffect(() => {
    if (scheduleHotel) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 6);
      const fiveDaysLaterStr = fiveDaysLater.toISOString().split('T')[0];
      
      setScheduleCheckIn(tomorrowStr);
      setScheduleCheckOut(fiveDaysLaterStr);
    }
  }, [scheduleHotel]);

  // Generate date array for the schedule table range
  const getDatesInRange = (startDateStr: string, endDateStr: string) => {
    const dates: string[] = [];
    if (!startDateStr || !endDateStr) return dates;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return dates;
    
    // limit to maximum 10 days to keep the grid super clean and elegant
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nightsCount = Math.min(10, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    for (let i = 0; i < nightsCount; i++) {
      const next = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push(next.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Formats dates dynamically for grid columns
  const formatScheduleDate = (dateStr: string, currentLang: Language) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', options);
  };

  // Calculates daily price and availability for a single room on a single night
  const getDailyRoomStatus = (hotelObj: Hotel, roomId: string, dateStr: string) => {
    const room = hotelObj.rooms.find(r => r.id === roomId);
    if (!room) return { price: 0, available: 0, isBlocked: true };
    
    const current = new Date(dateStr);
    const dailyBookings = bookings.filter(b => {
      if (b.hotelId !== hotelObj.id || b.roomTypeId !== roomId || b.status === 'cancelled') return false;
      const bIn = new Date(b.checkIn).getTime();
      const bOut = new Date(b.checkOut).getTime();
      const curTime = current.getTime();
      return curTime >= bIn && curTime < bOut;
    });

    const override = hotelObj.schedules?.find(sched => {
      const isDateInRange = dateStr >= sched.startDate && dateStr <= sched.endDate;
      const isRoomMatching = sched.roomTypeId === 'all' || sched.roomTypeId === roomId;
      return isDateInRange && isRoomMatching;
    });

    const price = override?.priceOverride !== undefined ? override.priceOverride : room.pricePerNight;
    const inventory = override?.inventoryOverride !== undefined ? override.inventoryOverride : room.inventory;
    const isBlocked = !!override?.isBlocked;
    const available = isBlocked ? 0 : Math.max(0, inventory - dailyBookings.length);

    return {
      price,
      available,
      isBlocked
    };
  };

  // Load data from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Load Destinations
        let loadedDestinations: Destination[] = [];
        try {
          const destSnap = await getDocs(collection(db, 'destinations'));
          loadedDestinations = destSnap.docs.map(doc => doc.data() as Destination);
          setDestinations(loadedDestinations);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'destinations');
        }

        // 2. Load Hotels
        let loadedHotels: Hotel[] = [];
        try {
          const hotelSnap = await getDocs(collection(db, 'hotels'));
          loadedHotels = hotelSnap.docs.map(doc => doc.data() as Hotel);
          setHotels(loadedHotels);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'hotels');
        }

        // 3. Load Bookings
        let loadedBookings: Booking[] = [];
        try {
          const bookingSnap = await getDocs(collection(db, 'bookings'));
          loadedBookings = bookingSnap.docs.map(doc => doc.data() as Booking);
          setBookings(loadedBookings);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'bookings');
        }

        setDbLoading(false);
      } catch (e) {
        console.error('Error loading Firestore database:', e);
        setDbLoading(false);
      }
    }

    loadData();
  }, []);

  // Synchronize items with LocalStorage
  useEffect(() => {
    localStorage.setItem('khatwa_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('khatwa_view', activeView);
  }, [activeView]);

  // Helper dictionary translator
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Add toast notification helper
  const addToastNotification = (msg: string) => {
    const newToast = {
      id: Math.random().toString(36).substring(2, 9),
      message: msg,
      date: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setToasts((prev) => [newToast, ...prev]);

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== newToast.id));
    }, 7000);
  };

  // Create booking handler
  const handleCreateBooking = async (newBooking: Booking) => {
    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
      setBookings((prev) => [newBooking, ...prev]);
      
      // Trigger alert notify as requested (تنبيهات فورية عند تأكيد كل عملية حجز جديدة)
      const alertMessage = lang === 'ar' 
        ? `تم تأكيد حجز مباشر جديد بنجاح! رقم الحجز: ${newBooking.id} بالفندق "${newBooking.hotelNameAr}" بواسطة وكالة "${newBooking.agentCompany}" بقيمة ${formatPrice(newBooking.totalPrice, lang)}.`
        : `New B2B Booking Confirmed! Ref: ${newBooking.id} at "${newBooking.hotelNameEn}" by Agency "${newBooking.agentCompany}" for ${formatPrice(newBooking.totalPrice, lang)}.`;
      
      addToastNotification(alertMessage);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${newBooking.id}`);
    }
  };

  // Manage booking status
  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled', paymentStatus: 'paid' | 'unpaid') => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status, paymentStatus });
      setBookings((prev) => prev.map(b => {
        if (b.id === bookingId) {
          const updated = { ...b, status, paymentStatus };
          
          // notify status change
          const alertMsg = lang === 'ar'
            ? `تم تحديث الحجز رقم ${bookingId} إلى [${status === 'confirmed' ? 'مؤكد' : 'ملغي'}] - وحالة الدفع [${paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}].`
            : `Reservation ${bookingId} updated to [${status.toUpperCase()}] and payment [${paymentStatus.toUpperCase()}].`;
          
          addToastNotification(alertMsg);
          return updated;
        }
        return b;
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  // Manage content additions
  const handleAddHotel = async (newHotel: Hotel) => {
    try {
      await setDoc(doc(db, 'hotels', newHotel.id), newHotel);
      setHotels((prev) => [newHotel, ...prev]);
      const alertMsg = lang === 'ar'
        ? `تم إضافة فندق متعاقد عليه جديد بنجاح: "${newHotel.nameAr}".`
        : `Successfully contracted new hotel property: "${newHotel.nameEn}".`;
      addToastNotification(alertMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `hotels/${newHotel.id}`);
    }
  };

  const handleAddDestination = async (newDest: Destination) => {
    try {
      await setDoc(doc(db, 'destinations', newDest.id), newDest);
      setDestinations((prev) => [...prev, newDest]);
      const alertMsg = lang === 'ar'
        ? `تم إضافة وجهة سياحية جديدة بنجاح: "${newDest.nameAr}".`
        : `Successfully added new tourist destination: "${newDest.nameEn}".`;
      addToastNotification(alertMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `destinations/${newDest.id}`);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      await deleteDoc(doc(db, 'hotels', hotelId));
      setHotels((prev) => prev.filter(h => h.id !== hotelId));
      const alertMsg = lang === 'ar' ? 'تم إلغاء العقد وحذف الفندق بنجاح.' : 'Hotel contract terminated successfully.';
      addToastNotification(alertMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hotels/${hotelId}`);
    }
  };

  const handleUpdateRoomInventory = async (hotelId: string, roomId: string, newInventory: number) => {
    try {
      const targetHotel = hotels.find(h => h.id === hotelId);
      if (!targetHotel) return;
      const updatedRooms = targetHotel.rooms.map(r => r.id === roomId ? { ...r, inventory: newInventory } : r);
      await updateDoc(doc(db, 'hotels', hotelId), { rooms: updatedRooms });
      setHotels((prev) => prev.map(h => {
        if (h.id === hotelId) {
          return {
            ...h,
            rooms: updatedRooms
          };
        }
        return h;
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hotels/${hotelId}`);
    }
  };

  const handleUpdateHotel = async (updatedHotel: Hotel) => {
    try {
      await setDoc(doc(db, 'hotels', updatedHotel.id), updatedHotel);
      setHotels((prev) => prev.map(h => h.id === updatedHotel.id ? updatedHotel : h));
      const alertMsg = lang === 'ar'
        ? `تم تحديث بيانات الفندق "${updatedHotel.nameAr}" والأسعار بنجاح.`
        : `Successfully updated hotel property "${updatedHotel.nameEn}" and rates.`;
      addToastNotification(alertMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hotels/${updatedHotel.id}`);
    }
  };

  const handleClearDemoData = async () => {
    try {
      // 1. Mark seeding as disabled permanently in system/config
      await setDoc(doc(db, 'system', 'config'), { seedingDisabled: true });

      // 2. Clear bookings
      const bookingSnap = await getDocs(collection(db, 'bookings'));
      for (const d of bookingSnap.docs) {
        await deleteDoc(doc(db, 'bookings', d.id));
      }
      setBookings([]);

      // 3. Clear hotels
      const hotelSnap = await getDocs(collection(db, 'hotels'));
      for (const d of hotelSnap.docs) {
        await deleteDoc(doc(db, 'hotels', d.id));
      }
      setHotels([]);

      // 4. Clear destinations
      const destSnap = await getDocs(collection(db, 'destinations'));
      for (const d of destSnap.docs) {
        await deleteDoc(doc(db, 'destinations', d.id));
      }
      setDestinations([]);

      const alertMsg = lang === 'ar'
        ? 'تم مسح جميع البيانات التجريبية بنجاح! قاعدة البيانات جاهزة الآن لاستقبال البيانات الحقيقية.'
        : 'All demo and mock data cleared successfully! The system is ready for live production data.';
      addToastNotification(alertMsg);
    } catch (err) {
      console.error("Error clearing demo data:", err);
      alert(lang === 'ar' ? 'فشل مسح البيانات التجريبية!' : 'Failed to clear demo data!');
    }
  };

  const handleAddReview = async (hotelId: string, review: Review) => {
    try {
      const targetHotel = hotels.find(h => h.id === hotelId);
      if (!targetHotel) return;
      const updatedReviews = [review, ...targetHotel.reviews];
      await updateDoc(doc(db, 'hotels', hotelId), { reviews: updatedReviews });
      setHotels((prev) => prev.map(h => {
        if (h.id === hotelId) {
          return {
            ...h,
            reviews: updatedReviews
          };
        }
        return h;
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hotels/${hotelId}`);
    }
  };

  // Filter Hotels based on search & tags
  const filteredHotels = hotels.filter((hotel) => {
    const matchDest = selectedDestId === 'all' || hotel.destinationId === selectedDestId;
    const matchStars = starsFilter === 'all' || hotel.stars.toString() === starsFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      hotel.nameEn.toLowerCase().includes(query) ||
      hotel.nameAr.toLowerCase().includes(query) ||
      hotel.descriptionEn.toLowerCase().includes(query) ||
      hotel.descriptionAr.toLowerCase().includes(query) ||
      hotel.addressEn.toLowerCase().includes(query) ||
      hotel.addressAr.toLowerCase().includes(query) ||
      hotel.benefitsEn.some(b => b.toLowerCase().includes(query)) ||
      hotel.benefitsAr.some(b => b.toLowerCase().includes(query));

    return matchDest && matchStars && matchQuery;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);

  const groupedDestinations = destinations.map(dest => {
    const destHotels = sortedHotels.filter(h => h.destinationId === dest.id);
    return {
      dest,
      hotels: destHotels
    };
  }).filter(group => group.hotels.length > 0);

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
          <Compass className="w-8 h-8 animate-spin-slow text-slate-950" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Khatwa B2B Gateway</h2>
        <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-wider">
          {lang === 'ar' ? 'جاري الاتصال السحابي الآمن لخطوة B2B...' : 'Connecting securely to Khatwa B2B cloud database...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-all duration-300 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Live notification popup hub - تنبيهات فورية */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md space-y-3 pointer-events-none" dir={isRtl ? 'rtl' : 'ltr'}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border-l-4 border-amber-500 text-slate-900 px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 border border-slate-200 animate-slideIn"
          >
            <div className="bg-amber-500 text-slate-950 p-1.5 rounded-full shrink-0">
              <Bell className="w-4 h-4 animate-swing" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-700 font-bold">
                  {t.notifyTitle}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{toast.date}</span>
              </div>
              <p className="text-xs text-slate-650 font-medium mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { setSelectedHotelId(null); setActiveView('explore'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-black text-xl shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow text-slate-950" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Khatwa <span className="text-amber-600 text-base font-bold">B2B</span></span>
              <span className="block text-[9px] text-slate-500 font-mono tracking-wider uppercase">Egypt Corporate Gateway</span>
            </div>
          </div>

          {/* Navigation Toggles */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => { setSelectedHotelId(null); setActiveView('explore'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'explore' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {t.navHome}
            </button>
            {isAdmin && (
              <button
                onClick={() => { setSelectedHotelId(null); setActiveView('dashboard'); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'dashboard' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {t.navDashboard}
              </button>
            )}
          </nav>

          {/* Utilities (Lang Switcher & Mobile toggle) */}
          <div className="flex items-center gap-3">
            {/* Multi Language Trigger */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-amber-550" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-1">
        
        {/* Dynamic routing render */}
        {activeView === 'dashboard' ? (
          /* CONTROL PANEL / DASHBOARD VIEW WITH ADMIN PASSCODE GATE */
          !loggedInUser ? (
            <AdminPasscodeGate
              lang={lang}
              onLoginSuccess={(user) => {
                setLoggedInUser(user);
                localStorage.setItem('khatwa_logged_in_user', JSON.stringify(user));
                const msg = lang === 'ar' ? 'مرحباً بك! تم تسجيل دخولك بنجاح.' : 'Welcome! Logged in successfully.';
                addToastNotification(msg);
              }}
              onCancel={() => {
                setActiveView('explore');
              }}
            />
          ) : (
            <B2BDashboard
              bookings={bookings}
              hotels={hotels}
              destinations={destinations}
              lang={lang}
              loggedInUser={loggedInUser}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onAddHotel={handleAddHotel}
              onAddDestination={handleAddDestination}
              onDeleteHotel={handleDeleteHotel}
              onUpdateRoomInventory={handleUpdateRoomInventory}
              onUpdateHotel={handleUpdateHotel}
              onClearDemoData={handleClearDemoData}
              onLogout={() => {
                setLoggedInUser(null);
                localStorage.removeItem('khatwa_logged_in_user');
                localStorage.removeItem('khatwa_is_admin');
                const msg = lang === 'ar' ? 'تم تسجيل الخروج بأمان.' : 'Logged out successfully.';
                addToastNotification(msg);
                setActiveView('explore');
              }}
            />
          )
        ) : selectedHotelId && selectedHotel ? (
          /* HOTEL DETAILS PAGE VIEW */
          <HotelDetail
            hotel={selectedHotel}
            lang={lang}
            onBack={() => setSelectedHotelId(null)}
            onNewBooking={handleCreateBooking}
            onAddReview={handleAddReview}
            bookings={bookings}
          />
        ) : (
          /* GENERAL EXPLORE / DIRECT LISTINGS VIEW */
          <div className="animate-fadeIn pb-16">
            
            {/* Elegant Hero Banner Area with custom Egypt tourism visual asset */}
            <section className="relative overflow-hidden bg-slate-950 text-white rounded-b-[40px] shadow-2xl py-28 text-center border-b border-amber-500/20">
              {/* Background image overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="/src/assets/images/egypt_bright_tourism_hero_1783942376425.jpg" 
                  alt={lang === 'ar' ? 'السياحة في مصر' : 'Egypt Tourism'} 
                  className="w-full h-full object-cover opacity-60 select-none scale-102 brightness-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              </div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                
                {/* Visual badge */}
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-full text-[11px] text-amber-300 font-extrabold mb-8 font-mono uppercase tracking-wider backdrop-blur-md animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {lang === 'ar' ? 'بوابة الوكلاء المعتمدة بمصر - ربط فوري مباشر' : 'Authorized GDS Direct Connection Portal'}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none mb-6 font-display">
                  {lang === 'ar' ? (
                    <>خطوتك الاحترافية <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">لحجوزات الفنادق المباشرة</span></>
                  ) : (
                    <>Egypt Hospitality <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Directly Connected</span></>
                  )}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                  {t.appSubtitle}
                </p>

                {/* Unified Search Console inside Hero */}
                <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-3xl flex flex-col lg:flex-row items-center gap-3 shadow-2xl relative z-20 text-slate-900 transition-all focus-within:ring-4 focus-within:ring-amber-500/30">
                  {/* Field 1: Hotel/Perks Search */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full lg:flex-[1.5]">
                    <Search className="w-5 h-5 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full placeholder-slate-400 font-semibold"
                    />
                  </div>

                  {/* Field 2: Destination Select */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full lg:flex-1">
                    <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                    <select
                      value={selectedDestId}
                      onChange={(e) => setSelectedDestId(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                    >
                      <option value="all">{lang === 'ar' ? 'جميع المدن / الوجهات' : 'All Destinations'}</option>
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{isRtl ? d.nameAr : d.nameEn}</option>
                      ))}
                    </select>
                  </div>

                  {/* Field 3: Stars Rating Select */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full lg:flex-1">
                    <Star className="w-5 h-5 text-amber-600 shrink-0 fill-amber-500/20" />
                    <select
                      value={starsFilter}
                      onChange={(e) => setStarsFilter(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                    >
                      <option value="all">{lang === 'ar' ? 'جميع مستويات النجوم' : 'All Star Ratings'}</option>
                      <option value="5">5 ★★★★★</option>
                      <option value="4">4 ★★★★</option>
                      <option value="3">3 ★★★</option>
                    </select>
                  </div>

                  {/* Field 4: Sorting dropdown */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full lg:flex-1">
                    <ArrowUpDown className="w-5 h-5 text-amber-600 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                    >
                      <option value="recommended">{lang === 'ar' ? 'الترتيب المقترح' : 'Recommended'}</option>
                      <option value="price-asc">{lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                      <option value="price-desc">{lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                      <option value="rating">{lang === 'ar' ? 'التقييم الأعلى' : 'Top Customer Rating'}</option>
                    </select>
                  </div>
                </div>

              </div>
            </section>

            {/* Destinations Tags Row */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-amber-700 tracking-wider font-extrabold">
                    {lang === 'ar' ? 'الوجهات السياحية الأكثر طلباً بمصر' : 'Trending Destinations'}
                  </h4>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 font-display">
                    {lang === 'ar' ? 'استكشف الفنادق حسب المدينة' : 'Browse Properties by Hub'}
                  </h3>
                </div>
                {selectedDestId !== 'all' && (
                  <button
                    onClick={() => setSelectedDestId('all')}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 px-4 py-2 rounded-xl font-black transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'عرض كافة الفنادق' : 'Show All Hotels'}
                  </button>
                )}
              </div>

              <div className="relative group/slider">
                {/* Left/Prev navigation button */}
                <button
                  onClick={() => {
                    if (destinationsRef.current) {
                      const multiplier = isRtl ? 1 : -1;
                      destinationsRef.current.scrollBy({ left: multiplier * 380, behavior: 'smooth' });
                    }
                  }}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-md border border-slate-200/80 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Slider list */}
                <div 
                  ref={destinationsRef}
                  className="flex gap-5 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none cursor-pointer"
                >
                  {/* "All" destination card */}
                  <div
                    onClick={() => setSelectedDestId('all')}
                    className={`relative w-[340px] h-[210px] rounded-2xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                      selectedDestId === 'all' 
                        ? 'border-amber-500 ring-4 ring-amber-500/10 scale-102 shadow-lg' 
                        : 'border-slate-200 hover:border-slate-350 hover:scale-102 hover:shadow-md'
                    }`}
                  >
                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80" alt="All Destinations" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/35 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <span className="text-[10px] text-amber-400 font-mono font-bold tracking-widest uppercase">EGYPT OVERVIEW</span>
                      <span className="font-black text-white text-lg mt-0.5">{t.allDestinations}</span>
                    </div>
                  </div>

                  {destinations.map((dest) => {
                    const hotelCount = hotels.filter(h => h.destinationId === dest.id).length;
                    const tags: Record<string, string> = {
                      cairo: lang === 'ar' ? '🏛️ عراقة تاريخية' : '🏛️ History & Business',
                      sharm: lang === 'ar' ? '🐠 شواطئ مدهشة' : '🐠 Premium Reefs',
                      hurghada: lang === 'ar' ? '🌴 منتجعات راقية' : '🌴 Resort Paradise',
                      luxor: lang === 'ar' ? '🏺 حضارة فرعونية' : '🏺 Open-Air Museum',
                      alex: lang === 'ar' ? '🌊 عروس البحر' : '🌊 Mediterranean Bride'
                    };

                    return (
                      <div
                        key={dest.id}
                        onClick={() => setSelectedDestId(dest.id)}
                        className={`relative w-[340px] h-[210px] rounded-2xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                          selectedDestId === dest.id 
                            ? 'border-amber-500 ring-4 ring-amber-500/10 scale-102 shadow-lg' 
                            : 'border-slate-200 hover:border-slate-350 hover:scale-102 hover:shadow-md'
                        }`}
                      >
                        <img src={dest.image} alt={dest.nameEn} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/35 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                          <span className="text-[9px] text-amber-300 font-mono font-extrabold tracking-wider uppercase">
                            {tags[dest.id] || 'EGYPT DESTINATION'}
                          </span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-black text-white text-lg">
                              {isRtl ? dest.nameAr : dest.nameEn}
                            </span>
                            <span className="bg-white/15 backdrop-blur-md text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full">
                              {hotelCount} {lang === 'ar' ? 'فنادق' : 'Hotels'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right/Next navigation button */}
                <button
                  onClick={() => {
                    if (destinationsRef.current) {
                      const multiplier = isRtl ? -1 : 1;
                      destinationsRef.current.scrollBy({ left: multiplier * 380, behavior: 'smooth' });
                    }
                  }}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-md border border-slate-200/80 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* Main Listings Grid Catalog (Spacious, beautifully styled grid) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">
                    {lang === 'ar' ? 'عقود الفنادق والأسعار المتاحة للشركات' : 'Contracted B2B Wholesale Portfolios'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'ar' 
                      ? `تم العثور على ${sortedHotels.length} فندقاً يطابق خيارات البحث الحالية من أصل ${hotels.length} عقداً فعالاً.` 
                      : `Displaying ${sortedHotels.length} matching hotel properties out of ${hotels.length} direct net GDS contracts.`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  <span className="text-xs text-slate-500 font-mono font-bold uppercase">{lang === 'ar' ? 'تصفية سريعة:' : 'Quick Tags:'}</span>
                  <button
                    onClick={() => { setSelectedDestId('all'); setSearchQuery(''); setStarsFilter('all'); }}
                    className="text-[10px] bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-750 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'إعادة تعيين الكل' : 'Reset Filters'}
                  </button>
                </div>
              </div>

              {groupedDestinations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm">
                  <div className="bg-amber-50 text-amber-700 p-4 rounded-full w-fit mx-auto mb-4">
                    <HotelIcon className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">{lang === 'ar' ? 'عذراً، لم نجد نتائج مطابقة' : 'No Contracted Hotels Found'}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === 'ar' 
                      ? 'جرب استخدام كلمات بحث مختلفة، أو قم بتغيير المدينة المختارة في محرك البحث بالأعلى للوصول لخيارات أوسع.' 
                      : 'Try adjusting your search terms, removing filter tags, or selecting a different Egypt tourist hub above.'}
                  </p>
                  <button
                    onClick={() => { setSelectedDestId('all'); setSearchQuery(''); setStarsFilter('all'); }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl mt-6 cursor-pointer"
                  >
                    {lang === 'ar' ? 'عرض كافة العقود الفعالة' : 'Clear All Filters & Show All'}
                  </button>
                </div>
              ) : (
                <div className="space-y-16">
                  {groupedDestinations.map((group) => (
                    <div key={group.dest.id} className="animate-fadeIn">
                      {/* Destination group header */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 text-amber-800 p-2.5 rounded-2xl flex items-center justify-center shadow-sm">
                            <MapPin className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-950 font-display">
                              {lang === 'ar' ? `فنادق ${group.dest.nameAr}` : `${group.dest.nameEn} Hotels`}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {lang === 'ar' ? `أسعار صافية وعقود مباشرة معتمدة في ${group.dest.nameAr}` : `Net rates and direct approved contracts in ${group.dest.nameEn}`}
                            </p>
                          </div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                          <HotelIcon className="w-3.5 h-3.5" />
                          <span>
                            {group.hotels.length} {lang === 'ar' ? (group.hotels.length === 1 ? 'فندق' : group.hotels.length === 2 ? 'فندقان' : 'فنادق') : 'Hotels'}
                          </span>
                        </div>
                      </div>

                      {/* Grid for destination hotels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {group.hotels.map((hotel) => {
                          const hotelDest = group.dest;
                          const retailPrice = Math.round(hotel.basePrice * 1.25);
                          const savingAmount = retailPrice - hotel.basePrice;

                          return (
                            <div
                              key={hotel.id}
                              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 group relative"
                            >
                              {/* Star Rating Overlay inside Image */}
                              <div className="relative h-56 bg-slate-100 overflow-hidden">
                                <img
                                  src={hotel.images[0]}
                                  alt={isRtl ? hotel.nameAr : hotel.nameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                {/* Destination Badge */}
                                <div className="absolute top-4 left-4 right-auto bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold border border-slate-200 text-slate-800 flex items-center gap-1.5 shadow-sm">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                  {isRtl ? hotelDest?.nameAr : hotelDest?.nameEn}
                                </div>

                                {/* Direct VIP Benefit Micro-badge */}
                                <div className="absolute bottom-4 left-4 right-auto bg-amber-500 text-slate-950 font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-md shadow-md tracking-wider">
                                  {lang === 'ar' ? '✓ سعر صافي معتمد' : '✓ GDS Direct Contract'}
                                </div>
                              </div>

                              <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-3">
                                    {/* Stars */}
                                    <div className="flex text-amber-500">
                                      {Array.from({ length: hotel.stars }).map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                      ))}
                                    </div>
                                    {/* Rating block */}
                                    <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] font-mono text-slate-600 flex items-center gap-1">
                                      <span className="font-extrabold text-amber-600 text-xs">{hotel.rating}</span>
                                      <span className="text-slate-400">/ 5</span>
                                    </div>
                                  </div>

                                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors font-display">
                                    {isRtl ? hotel.nameAr : hotel.nameEn}
                                  </h3>
                                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2.5 font-semibold">
                                    {isRtl ? hotel.descriptionAr : hotel.descriptionEn}
                                  </p>

                                  {/* Bulleted perks display */}
                                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                    {(isRtl ? hotel.benefitsAr : hotel.benefitsEn).slice(0, 3).map((perk, pIdx) => (
                                      <span key={pIdx} className="text-[9px] bg-slate-50 text-slate-600 border border-slate-150 rounded-lg px-2 py-0.5 font-semibold flex items-center gap-1">
                                        <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                        <span className="truncate max-w-[100px]">{perk}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* B2B Price Matrix & Call-to-Action */}
                                <div className="border-t border-slate-100 pt-5 mt-5 flex items-center justify-between gap-3">
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
                                      {t.basePriceLabel}
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-xl font-black text-emerald-600 font-mono">
                                        {formatPrice(hotel.basePrice, lang)}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-bold">/ {lang === 'ar' ? 'الليلة' : 'night'}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 line-through block font-mono">
                                      {lang === 'ar' ? `المعدل العام: ${formatPrice(retailPrice, lang)}` : `Public Retail Rate: ${formatPrice(retailPrice, lang)}`}
                                    </span>
                                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-1 rounded block w-fit">
                                      {lang === 'ar' ? `وفر ${formatPrice(savingAmount, lang)} لوكالتك` : `Save ${formatPrice(savingAmount, lang)} for your agency`}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                      onClick={() => {
                                        setGalleryHotel(hotel);
                                        setActiveGalleryIndex(0);
                                      }}
                                      className="border border-sky-500/30 text-sky-850 bg-sky-500/5 hover:bg-sky-500/10 font-extrabold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-101"
                                    >
                                      <Camera className="w-3 h-3 text-sky-650" />
                                      <span>{lang === 'ar' ? 'عرض صور الفندق' : 'View Hotel Photos'}</span>
                                    </button>

                                    <button
                                      onClick={() => setScheduleHotel(hotel)}
                                      className="border border-amber-500/30 text-amber-800 bg-amber-500/5 hover:bg-amber-500/10 font-extrabold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-101"
                                    >
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>{lang === 'ar' ? 'جدول المواعيد والأسعار' : 'Rates Schedule'}</span>
                                    </button>

                                    <button
                                      onClick={() => setSelectedHotelId(hotel.id)}
                                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-103 group/btn w-full"
                                    >
                                      <span>{t.viewDetails}</span>
                                      <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-0.5' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center text-xs text-slate-500 font-mono tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
          <p className="text-slate-800 uppercase font-black text-sm tracking-widest mb-1">Khatwa B2B Portal</p>
          <p className="text-[10px] text-slate-500">
            <span 
              onClick={() => { setSelectedHotelId(null); setActiveView('dashboard'); }}
              className="cursor-default select-none hover:opacity-80 active:opacity-60 transition-opacity"
              title="Khatwa International"
            >©</span> 2026 {t.appName} International. Negotiated Contract Allotment System.
          </p>
          <div className="mt-4">
            <button
              onClick={() => { setSelectedHotelId(null); setActiveView('dashboard'); }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold px-4 py-2.5 rounded-2xl text-[11px] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 hover:shadow-md"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'لوحة التحكم والشركاء' : 'Control Panel & Partner Portal'}</span>
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-3 text-[10px] text-slate-400">
            <span>TERMS_OF_CONTRACT</span>
            <span>•</span>
            <span>EGYPT_REGULATORY_LIC_1044</span>
            <span>•</span>
            <span>CREDIT_FACILITY_GUIDELINES</span>
          </div>
        </div>
      </footer>

      {/* Interactive Rates & Availability Schedule Modal */}
      {scheduleHotel && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-2xl border border-amber-500/20">
                  <Calendar className="w-6 h-6 text-amber-450" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    {lang === 'ar' ? `جدول أسعار وتوافر: ${scheduleHotel.nameAr}` : `Rates & Allotment: ${scheduleHotel.nameEn}`}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'ar' 
                      ? 'استعلام مباشر عن تواريخ الحصص والأسعار التعاقدية لجميع غرف الفندق المتاحة.'
                      : 'Live query of direct wholesale rates and contracted allotment calendars.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setScheduleHotel(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Date Filters */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 text-[11px] font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 uppercase tracking-wider font-extrabold text-[9px] bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                  {lang === 'ar' ? 'فلترة التواريخ:' : 'Date Query Filter:'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-slate-400 font-medium">{lang === 'ar' ? 'تاريخ الوصول (من):' : 'Check-In (In):'}</label>
                <input
                  type="date"
                  value={scheduleCheckIn}
                  onChange={(e) => setScheduleCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400 font-medium">{lang === 'ar' ? 'تاريخ المغادرة (إلى):' : 'Check-Out (Out):'}</label>
                <input
                  type="date"
                  value={scheduleCheckOut}
                  onChange={(e) => setScheduleCheckOut(e.target.value)}
                  min={scheduleCheckIn || new Date().toISOString().split('T')[0]}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Body / Table Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const dates = getDatesInRange(scheduleCheckIn, scheduleCheckOut);
                if (dates.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <p className="text-slate-400 text-xs font-semibold">
                        {lang === 'ar' ? 'الرجاء اختيار تواريخ صحيحة لعرض جدول المواعيد.' : 'Please select valid dates to display the query schedule.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Rooms List */}
                    <div className="space-y-6">
                      {scheduleHotel.rooms.map((room) => {
                        return (
                          <div key={room.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                              <div>
                                <h4 className="font-extrabold text-white text-xs">
                                  {lang === 'ar' ? room.nameAr : room.nameEn}
                                </h4>
                                <p className="text-[10px] text-slate-500 max-w-xl truncate mt-0.5">
                                  {lang === 'ar' ? room.descriptionAr : room.descriptionEn}
                                </p>
                              </div>
                              <div className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-lg text-[9px] font-mono shrink-0 flex items-center gap-1">
                                <span>{lang === 'ar' ? `الحد الأقصى: ${room.capacity} أفراد` : `Max Occupancy: ${room.capacity}`}</span>
                              </div>
                            </div>

                            {/* Horizontal scrolling day-by-day blocks with smaller font as requested */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                              {dates.map((dateStr) => {
                                const status = getDailyRoomStatus(scheduleHotel, room.id, dateStr);
                                return (
                                  <div 
                                    key={dateStr}
                                    className={`flex flex-col items-center justify-between text-center p-2.5 rounded-xl min-w-[76px] border transition-colors shrink-0 ${
                                      status.isBlocked
                                        ? 'bg-rose-950/25 border-rose-900/30 text-rose-300'
                                        : status.available === 0
                                        ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/30'
                                    }`}
                                  >
                                    {/* Date label - small font */}
                                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                                      {formatScheduleDate(dateStr, lang)}
                                    </span>

                                    {/* Price - small font */}
                                    <span className="text-[11px] font-black text-amber-400 mt-1 font-mono">
                                      {formatPrice(status.price, lang)}
                                    </span>

                                    {/* Status/Inventory - small font */}
                                    <span className={`text-[8px] font-bold mt-1.5 px-1.5 py-0.5 rounded-md leading-none ${
                                      status.isBlocked
                                        ? 'bg-rose-950 text-rose-400 border border-rose-900/40'
                                        : status.available === 0
                                        ? 'bg-slate-850 text-slate-550'
                                        : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                                    }`}>
                                      {status.isBlocked 
                                        ? (lang === 'ar' ? 'مغلق' : 'Blocked') 
                                        : status.available === 0
                                        ? (lang === 'ar' ? 'مكتمل' : 'Full')
                                        : (lang === 'ar' ? 'متاح' : 'Available')}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Child Policy Section */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-500">
                        <Users className="w-4 h-4 text-amber-500" />
                        <h4 className="font-extrabold text-xs">
                          {lang === 'ar' ? 'سياسة الأطفال والأسعار للفندق' : 'Hotel Child Policy & Rates'}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-semibold">
                        {lang === 'ar' 
                          ? (scheduleHotel.childPolicyAr || 'الأطفال أقل من ٦ سنوات مجاناً في نفس الغرفة مع الوالدين (بحد أقصى طفلين). الأطفال من سن ٦ سنوات إلى ١١.٩٩ سنة يحصلون على خصم ٥٠٪.')
                          : (scheduleHotel.childPolicyEn || 'Children under 6 stay free of charge using existing bedding. Children 6-12 years receive a 50% discount.')
                        }
                      </div>
                    </div>

                    {/* Transfers Section */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-500">
                        <Car className="w-4 h-4 text-amber-400" />
                        <h4 className="font-extrabold text-xs">
                          {lang === 'ar' ? 'أسعار خدمات النقل والمواصلات المتاحة للفندق' : 'Available Transfer Options & Contracted Rates'}
                        </h4>
                      </div>
                      <div className="space-y-2.5 font-mono text-xs">
                        {(scheduleHotel.transfers && scheduleHotel.transfers.length > 0 ? scheduleHotel.transfers : [
                          { id: 'trans-1', fromEn: 'Cairo International Airport (Private Car)', fromAr: 'مطار القاهرة الدولي (سيارة خاصة)', price: 35 },
                          { id: 'trans-2', fromEn: 'Hurghada Airport (VIP Limousine)', fromAr: 'مطار الغردقة الدولي (سيارة ليموزين)', price: 45 },
                          { id: 'trans-3', fromEn: 'Sharm El Sheikh Airport (Mini-Van Group)', fromAr: 'مطار شرم الشيخ (حافلة صغيرة للمجموعات)', price: 60 }
                        ]).map((tr) => {
                          const trPrice = tr.price !== undefined ? tr.price : ((tr as any).pricePerPerson !== undefined ? (tr as any).pricePerPerson : 0);
                          return (
                            <div key={tr.id} className="flex justify-between items-center text-slate-300">
                              <span className="font-sans text-[11px] font-semibold">{lang === 'ar' ? tr.fromAr : tr.fromEn}</span>
                              <span className="font-bold text-amber-450 text-[11px] font-mono">{formatPrice(trPrice, lang)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setScheduleHotel(null)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Photo Gallery Modal */}
      {galleryHotel && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500/10 text-sky-400 p-2 rounded-xl border border-sky-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    {lang === 'ar' ? `ألبوم صور: ${galleryHotel.nameAr}` : `Photo Album: ${galleryHotel.nameEn}`}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'ar' 
                      ? `نعرض لكم ${galleryHotel.images.length} صورة عالية الدقة لمرافق الفندق والغرف.`
                      : `Displaying ${galleryHotel.images.length} high-resolution photos of the hotel property.`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setGalleryHotel(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Image Slider Area */}
            <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-950 relative min-h-[320px] md:min-h-[420px]">
              <div className="relative w-full h-[260px] md:h-[360px] rounded-2xl overflow-hidden border border-slate-800 group">
                <img 
                  src={galleryHotel.images[activeGalleryIndex]} 
                  alt={galleryHotel.nameEn}
                  className="w-full h-full object-cover transition-all duration-300 select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Left & Right Arrows */}
                {galleryHotel.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveGalleryIndex((prev) => (prev - 1 + galleryHotel.images.length) % galleryHotel.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700/50 shadow-md transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveGalleryIndex((prev) => (prev + 1) % galleryHotel.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700/50 shadow-md transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Counter Tag */}
                <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-amber-400">
                  {activeGalleryIndex + 1} / {galleryHotel.images.length}
                </div>
              </div>

              {/* Thumbnails row */}
              {galleryHotel.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto w-full pb-1 justify-center max-w-lg scrollbar-thin">
                  {galleryHotel.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        idx === activeGalleryIndex ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setGalleryHotel(null)}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-black py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const targetId = galleryHotel.id;
                  setGalleryHotel(null);
                  setSelectedHotelId(targetId);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'عرض الفندق وحجز غرف' : 'View Hotel & Book'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

interface AdminPasscodeGateProps {
  lang: Language;
  onLoginSuccess: (user: PortalUser) => void;
  onCancel: () => void;
}

export function AdminPasscodeGate({
  lang,
  onLoginSuccess,
  onCancel
}: AdminPasscodeGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // For changing password
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<PortalUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRtl = lang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const emailLower = email.toLowerCase().trim();
      if (!emailLower || !password) {
        setIsLoading(false);
        setErrorMsg(isRtl ? 'يرجى ملء جميع الحقول!' : 'Please fill in all fields!');
        return;
      }

      // Check fallback / system built-in accounts first for smooth evaluation/administration
      if (emailLower === 'admin@khatwa.com' && password === 'KhatwaAdmin2026') {
        const fallbackUser: PortalUser = {
          id: 'admin@khatwa.com',
          email: 'admin@khatwa.com',
          password: 'KhatwaAdmin2026',
          role: 'admin',
          createdAt: '2026-07-18'
        };
        setIsLoading(false);
        onLoginSuccess(fallbackUser);
        return;
      }
      if (emailLower === 'supervisor@khatwa.com' && password === 'KhatwaSupervisor2026') {
        const fallbackUser: PortalUser = {
          id: 'supervisor@khatwa.com',
          email: 'supervisor@khatwa.com',
          password: 'KhatwaSupervisor2026',
          role: 'manager',
          createdAt: '2026-07-18'
        };
        setIsLoading(false);
        onLoginSuccess(fallbackUser);
        return;
      }
      if (emailLower === 'employee@khatwa.com' && password === 'KhatwaEmployee2026') {
        const fallbackUser: PortalUser = {
          id: 'employee@khatwa.com',
          email: 'employee@khatwa.com',
          password: 'KhatwaEmployee2026',
          role: 'editor',
          createdAt: '2026-07-18'
        };
        setIsLoading(false);
        onLoginSuccess(fallbackUser);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', emailLower));
      if (!userDoc.exists()) {
        setIsLoading(false);
        setErrorMsg(isRtl ? 'المستخدم غير مسجل بالنظام!' : 'User is not registered!');
        return;
      }

      const userData = userDoc.data() as PortalUser;
      if (userData.password !== password) {
        setIsLoading(false);
        setErrorMsg(isRtl ? 'كلمة المرور غير صحيحة!' : 'Incorrect password!');
        return;
      }

      if (userData.isTemporaryPassword) {
        // Force password change!
        setPendingUser(userData);
        setIsChangingPassword(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بقاعدة البيانات!' : 'Database connection error!');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newPassword || !confirmPassword) {
      setErrorMsg(isRtl ? 'يرجى ملء جميع حقول كلمة المرور!' : 'Please fill in all password fields!');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg(isRtl ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل!' : 'Password must be at least 4 characters!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isRtl ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
      return;
    }

    if (!pendingUser) return;
    setIsLoading(true);

    try {
      await updateDoc(doc(db, 'users', pendingUser.id), {
        password: newPassword,
        isTemporaryPassword: false
      });

      const updatedUser: PortalUser = {
        ...pendingUser,
        password: newPassword,
        isTemporaryPassword: false
      };

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMsg(isRtl ? 'فشل تحديث كلمة المرور في قاعدة البيانات!' : 'Failed to update password in database!');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Top bar accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600"></div>

        {!isChangingPassword ? (
          <>
            <div className="bg-amber-500 text-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
              <LogIn className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center">
              {isRtl ? 'بوابة تسجيل الدخول الآمنة' : 'Secure Login Portal'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed text-center">
              {isRtl 
                ? 'الدخول مخصص لمشرفي وموظفي منصة خطوة B2B المعتمدين لإدارة العقود وحصص الغرف وجدول المواعيد.'
                : 'Access is restricted to authorized Khatwa B2B administrators and staff to manage contracts, hotel inventories, and live schedules.'}
            </p>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl mt-4 font-bold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    {isRtl ? 'البريد الإلكتروني لحساب الموظف/المشرف' : 'Staff/Supervisor Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@khatwa.com"
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 w-full shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 w-full shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 border border-slate-200 text-slate-550 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  {isRtl ? 'رجوع للرئيسية' : 'Back to Home'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    isRtl ? 'دخول وتحقق' : 'Verify & Enter'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* FORCED CHANGE PASSWORD FORM */
          <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
            <div className="bg-amber-500 text-slate-950 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isRtl ? 'تحديث كلمة المرور المؤقتة' : 'Update Temporary Password'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {isRtl 
                  ? 'قام مشرف النظام بتعيين كلمة مرور مؤقتة لحسابك. لحماية خصوصية بياناتك وتأمين حسابك، يجب تعيين كلمة مرور جديدة خاصة بك للمتابعة.'
                  : 'Your account was set up with a temporary password. To secure your account, you must choose a new private password before logging in.'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 w-full shadow-inner"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 w-full shadow-inner"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPendingUser(null);
                  setErrorMsg('');
                }}
                className="flex-1 border border-slate-200 text-slate-550 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  isRtl ? 'تحديث كلمة المرور والدخول' : 'Update & Login'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
