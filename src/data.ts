import { Destination, Hotel, Booking } from './types';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    descriptionEn: 'The historic capital, where modern business meets ancient wonders.',
    descriptionAr: 'العاصمة التاريخية، حيث يلتقي قطاع الأعمال الحديث بعجائب التاريخ القديم.',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'sharm',
    nameEn: 'Sharm El Sheikh',
    nameAr: 'شرم الشيخ',
    descriptionEn: 'The city of peace, famous for premium diving resorts and crystal beaches.',
    descriptionAr: 'مدينة السلام، الشهيرة بمنتجعات الغوص الفاخرة والشواطئ الكريستالية.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'hurghada',
    nameEn: 'Hurghada',
    nameAr: 'الغردقة',
    descriptionEn: 'Stunning Red Sea coastline, superb B2B family-and-group resorts.',
    descriptionAr: 'ساحل البحر الأحمر المذهل، ومنتجعات عائلية وجماعية ممتازة للشركات.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'luxor',
    nameEn: 'Luxor & Aswan',
    nameAr: 'الأقصر وأسوان',
    descriptionEn: 'The open-air museum of humanity with authentic classical heritage.',
    descriptionAr: 'المتحف المفتوح للبشرية مع التراث الكلاسيكي الأصيل على ضفاف النيل.',
    image: 'https://images.unsplash.com/photo-1608958416715-32bc837fe17d?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'alex',
    nameEn: 'Alexandria',
    nameAr: 'الإسكندرية',
    descriptionEn: 'The bride of the Mediterranean, offering cool sea breeze and rich heritage.',
    descriptionAr: 'عروس البحر الأبيض المتوسط، التي تقدم نسيم البحر المنعش والإرث الغني.',
    image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?q=80&w=600&auto=format&fit=crop'
  }
];

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'nile-ritz',
    nameEn: 'The Nile Ritz-Carlton',
    nameAr: 'ذا نيل ريتز كارلتون',
    destinationId: 'cairo',
    stars: 5,
    rating: 4.9,
    descriptionEn: 'Nestled in the heart of Cairo, this iconic luxury hotel captures the essence of classic elegance coupled with high-end premium B2B amenities, conference rooms, and gourmet dining with superb views of the Nile.',
    descriptionAr: 'يقع هذا الفندق الفاخر الشهير في قلب القاهرة، ويجسد جوهر الأناقة الكلاسيكية المقرنة مع وسائل الراحة المتميزة للشركات وقاعات المؤتمرات والمطاعم الفاخرة مع إطلالات رائعة على نهر النيل.',
    benefitsEn: ['Nile River Front', 'B2B Meeting Lounges', 'Olympic Swimming Pool', 'Luxury Spa & Fitness Center', 'Private Executive Lounge Access'],
    benefitsAr: ['واجهة مباشرة على نهر النيل', 'صالات اجتماعات مخصصة للشركات', 'مسبح أوليمبي', 'منتجع صحي فاخر ومركز لياقة', 'دخول حصري للصالة التنفيذية الخاصة'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 30.0475,
    lng: 31.2336,
    addressEn: '1113 Corniche El Nil, Cairo',
    addressAr: '١١١٣ كورنيش النيل، القاهرة',
    basePrice: 280,
    reviews: [
      {
        id: 'rev-1',
        authorCompany: 'Egypt Tours Ltd',
        authorName: 'Ahmed Aly',
        rating: 5,
        commentEn: 'Outstanding B2B services, the conference rooms were pristine and room service is highly responsive.',
        commentAr: 'خدمات ممتازة للشركات، قاعات المؤتمرات كانت في غاية النظافة وخدمة الغرف سريعة الاستجابة.',
        date: '2026-06-15'
      },
      {
        id: 'rev-2',
        authorCompany: 'Global Jet Travel',
        authorName: 'Sarah Jenkins',
        rating: 4.8,
        commentEn: 'Perfect Nile views and elite food selections. Highly recommended corporate rates.',
        commentAr: 'إطلالات مثالية على النيل وخيارات طعام راقية. نوصي بشدة بأسعار الشركات لديهم.',
        date: '2026-07-02'
      }
    ],
    rooms: [
      {
        id: 'nr-std',
        nameEn: 'Deluxe City View',
        nameAr: 'غرفة ديلوكس إطلالة على المدينة',
        descriptionEn: 'Spacious room with modern amenities, writing desk, and floor-to-ceiling windows showing downtown Cairo.',
        descriptionAr: 'غرفة فسيحة مع مرافق حديثة ومكتب عمل ونوافذ ممتدة من الأرض إلى السقف تطل على وسط القاهرة.',
        pricePerNight: 280,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Free High-Speed Wi-Fi', 'Workspace Desk', 'Mini Bar', 'Coffee Station', 'HD Interactive TV'],
        amenitiesAr: ['واي فاي مجاني سريع', 'مكتب عمل مجهز', 'ميني بار', 'ركن القهوة', 'شاشة تلفزيون تفاعلية HD'],
        inventory: 12
      },
      {
        id: 'nr-nile',
        nameEn: 'Premium Nile View',
        nameAr: 'غرفة بريميوم إطلالة نيلية كاملة',
        descriptionEn: 'Stunning full frontal view of the River Nile, equipped with premium bedding and complimentary executive lounge access.',
        descriptionAr: 'إطلالة أمامية مذهلة على نهر النيل مباشرة، مجهزة بأسرة فاخرة مع دخول مجاني للصالة التنفيذية.',
        pricePerNight: 350,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Direct Nile Balcony', 'Executive Lounge Pass', 'Nespresso Machine', 'Rain Shower', 'Daily Pressing Service'],
        amenitiesAr: ['شرفة مباشرة على النيل', 'بطاقة دخول الصالة التنفيذية', 'ماكينة نسبريسو', 'دش مطري فاخر', 'خدمة كي الملابس اليومية'],
        inventory: 8
      },
      {
        id: 'nr-suite',
        nameEn: 'Executive Nile Suite',
        nameAr: 'جناح تنفيذي مطل على النيل',
        descriptionEn: 'Large one-bedroom suite with a separate elegant living room, private bar, and majestic views of the Nile.',
        descriptionAr: 'جناح كبير من غرفة نوم واحدة وصالة معيشة منفصلة أنيقة، وبار خاص، وإطلالات مهيبة على نهر النيل.',
        pricePerNight: 550,
        capacity: 3,
        maxOccupancy: 4,
        amenitiesEn: ['Separate Living Room', 'Two Bathrooms', 'VIP B2B Welcoming Set', 'Butler Service', 'Complimentary Airport Transfer'],
        amenitiesAr: ['غرفة معيشة منفصلة', 'حمّامان فاخران', 'مجموعة استقبال VIP للشركات', 'خدمة الخادم الشخصي', 'نقل مجاني من وإلى المطار'],
        inventory: 4
      }
    ]
  },
  {
    id: 'mena-house',
    nameEn: 'Marriott Mena House',
    nameAr: 'ماريوت مينا هاوس',
    destinationId: 'cairo',
    stars: 5,
    rating: 4.8,
    descriptionEn: 'A historic sanctuary frequented by kings and emperors, located in the immediate shadow of the Great Pyramids of Giza. Features lush gardens, royal designs, and unparalleled view points.',
    descriptionAr: 'ملاذ تاريخي يتردد عليه الملوك والأباطرة، يقع مباشرة تحت ظلال أهرامات الجيزة العظيمة. يتميز بحدائق غناء وتصاميم ملكية وإطلالات لا مثيل لها.',
    benefitsEn: ['Pyramids View Balconies', 'Historic Gardens', 'Golf Course Access', 'Palatial Meeting Rooms', 'Award-winning Restaurants'],
    benefitsAr: ['شرفات مطلة على الأهرامات', 'حدائق تاريخية غناء', 'ملعب جولف متكامل', 'قاعات اجتماعات ملكية فاخرة', 'مطاعم حائزة على جوائز دولية'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 29.9856,
    lng: 31.1272,
    addressEn: '6 Pyramids Road, Giza, Cairo',
    addressAr: '٦ شارع الهرم، الجيزة، القاهرة',
    basePrice: 320,
    reviews: [
      {
        id: 'rev-3',
        authorCompany: 'Levant Agencies',
        authorName: 'Karim Nabih',
        rating: 4.9,
        commentEn: 'Unbelievable historic view of the Pyramids. Our corporate delegation was blown away by the hospitality.',
        commentAr: 'إطلالة تاريخية لا تصدق على الأهرامات. لقد ذهل وفد شركتنا بالضيافة الفائقة.',
        date: '2026-05-20'
      }
    ],
    rooms: [
      {
        id: 'mh-garden',
        nameEn: 'Garden View Room',
        nameAr: 'غرفة مطلة على الحدائق الملكية',
        descriptionEn: 'Overlooking the historically designed royal botanical gardens with high ceilings and arabesque architecture.',
        descriptionAr: 'تطل على الحدائق النباتية الملكية المصممة تاريخياً مع أسقف مرتفعة وعمارة أرابيسك مميزة.',
        pricePerNight: 320,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Garden Balcony', 'High Ceiling', 'Arabesque Minibar', 'Free Premium Wi-Fi'],
        amenitiesAr: ['شرفة على الحدائق', 'أسقف مرتفعة', 'ميني بار أرابيسك', 'واي فاي ممتاز مجاني'],
        inventory: 15
      },
      {
        id: 'mh-pyramid',
        nameEn: 'Grand Pyramid View',
        nameAr: 'غرفة مطلة على الهرم الأكبر',
        descriptionEn: 'Offers direct, breathtaking, and unobstructed view of the Great Pyramid of Giza from your private balcony.',
        descriptionAr: 'توفر إطلالة مباشرة ومذهلة وبدون عوائق على الهرم الأكبر بالجيزة من الشرفة الخاصة بك.',
        pricePerNight: 450,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Pyramid View Balcony', 'Premium Bath Amenities', 'Work Station', 'Fruit Basket Daily'],
        amenitiesAr: ['شرفة مطلة على الهرم', 'مستلزمات استحمام فاخرة', 'محطة عمل مجهزة', 'سلة فواكه يومية طازجة'],
        inventory: 10
      }
    ]
  },
  {
    id: 'fs-sharm',
    nameEn: 'Four Seasons Resort Sharm El Sheikh',
    nameAr: 'منتجع فور سيزونز شرم الشيخ',
    destinationId: 'sharm',
    stars: 5,
    rating: 5.0,
    descriptionEn: 'Cascading down a hillside into the Red Sea, this premier luxury resort offers elite dive centers, private yacht experiences, multi-million dollar corporate events space, and gorgeous private villas.',
    descriptionAr: 'ينحدر هذا المنتجع الفاخر على سفح تلة مطلة على البحر الأحمر، ويقدم مراكز غوص للنخبة، وتجارب يخوت خاصة، ومساحات للفعاليات المؤسسية الكبرى، وفيلات خاصة رائعة.',
    benefitsEn: ['Pristine House Reef', 'Private Marina & Yacht Charters', 'Multi-level infinity pools', 'Gourmet World Cuisines', 'Elite Corporate Support'],
    benefitsAr: ['شعاب مرجانية خلابة خاصة بالمنتجع', 'مرسى يخت خاص للتأجير', 'حمامات سباحة لامتناهية متعددة المستويات', 'مطاعم عالمية راقية', 'دعم متميز لفعاليات الشركات والوفود'],
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 27.9622,
    lng: 34.3912,
    addressEn: '4 Four Seasons Blvd, Sharm El Sheikh',
    addressAr: '٤ شارع فور سيزونز، شرم الشيخ',
    basePrice: 420,
    reviews: [
      {
        id: 'rev-4',
        authorCompany: 'Ocean Blue Holidays',
        authorName: 'Marco Rossi',
        rating: 5,
        commentEn: 'Absolute perfection. The dive center arranged custom corporate team-building dives which were superb.',
        commentAr: 'كمال مطلق. رتب مركز الغوص رحلات جماعية مخصصة لبناء الفريق لشركتنا وكانت ممتازة للغاية.',
        date: '2026-07-10'
      }
    ],
    rooms: [
      {
        id: 'fs-sea',
        nameEn: 'Imperial Sea View Room',
        nameAr: 'غرفة إمبراطورية مطلة على البحر والجزيرة',
        descriptionEn: 'Magnificent sea view overlooking Tiran Island, beautifully decorated with Mediterranean patterns and deep luxury beds.',
        descriptionAr: 'إطلالة بحرية رائعة على جزيرة تيران، مزينة بزخارف متوسطية راقية وأسرة وثيرية فاخرة.',
        pricePerNight: 420,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Panoramic Sea View Balcony', 'Deep Soaking Tub', 'Complimentary Minibar', 'Pillow Menu'],
        amenitiesAr: ['شرفة مطلة بنوراما على البحر', 'حوض استحمام عميق ومستقل', 'ميني بار مجاني متكامل', 'قائمة وسائد مخصصة للمستأجر'],
        inventory: 6
      },
      {
        id: 'fs-villa',
        nameEn: 'Elite Plunge Pool Suite',
        nameAr: 'جناح مع مسبح خاص مستقل',
        descriptionEn: 'Expansive private suite containing its own heated plunge pool, massive sun terrace, and ultimate privacy.',
        descriptionAr: 'جناح خاص واسع يحتوي على مسبح خاص مدفأ وشرفة تشمس ضخمة وخصوصية تامة للعملاء المتميزين.',
        pricePerNight: 780,
        capacity: 2,
        maxOccupancy: 4,
        amenitiesEn: ['Private Plunge Pool', 'Large Sun Deck', 'Luxury Living Area', 'Personal Host Service'],
        amenitiesAr: ['مسبح غطس خاص', 'شرفة تشمس ضخمة', 'منطقة معيشة فاخرة', 'خدمة مضيف شخصي على مدار الساعة'],
        inventory: 3
      }
    ]
  },
  {
    id: 'rixos-seagate',
    nameEn: 'Rixos Premium Seagate',
    nameAr: 'ريكسوس بريميوم سيجيت',
    destinationId: 'sharm',
    stars: 5,
    rating: 4.9,
    descriptionEn: 'An Ultra-All-Inclusive luxury retreat for discerning business and corporate events, featuring a massive private pier, state of the art water parks, premium Turkish wellness centers, and magnificent dining options.',
    descriptionAr: 'منتجع فاخر متكامل الخدمات والوجبات، مثالي لرحلات الأعمال والفعاليات المؤسسية، يتميز برصيف بحري خاص ضخم، ومدن ألعاب مائية حديثة، ومراكز علاجية تركية فاخرة.',
    benefitsEn: ['Ultra-All-Inclusive Concept', 'Gigantic Private Pier (850m)', 'Rixos Aqua Park', 'Premium Conference Center', 'Luxury VIP Cabanas'],
    benefitsAr: ['نظام شامل كلياً فائق الفخامة', 'رصيف بحري خاص عملاق (٨٥٠ م)', 'مدينة ألعاب ريكسوس المائية', 'مركز مؤتمرات متطور', 'كابينات كبار الشخصيات الفاخرة'],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 28.0261,
    lng: 34.4338,
    addressEn: 'Nabq Bay, Sharm El Sheikh',
    addressAr: 'خليج نبق، شرم الشيخ',
    basePrice: 380,
    reviews: [
      {
        id: 'rev-5',
        authorCompany: 'Saudi Al-Tayyar Agency',
        authorName: 'Fahad Bin Khalid',
        rating: 4.9,
        commentEn: 'The B2B packages are highly profitable for our agency. Exceptional buffet and client feedback was gold.',
        commentAr: 'باقات قطاع الأعمال لديهم مربحة للغاية لشركتنا. بوفيه استثنائي وآراء عملائنا كانت رائعة.',
        date: '2026-06-30'
      }
    ],
    rooms: [
      {
        id: 'rx-sup',
        nameEn: 'Superior Sea Side Room',
        nameAr: 'غرفة متفوقة جانب البحر',
        descriptionEn: 'Beautiful view towards the sea, offering elegant Turkish styling, high-end entertainment systems, and complimentary minibar refilled daily.',
        descriptionAr: 'إطلالة رائعة باتجاه البحر، تقدم طرازاً تركياً أنيقاً، ونظام ترفيه متطور، وميني بار مجاني يعاد تعبئته يومياً.',
        pricePerNight: 380,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['All-Inclusive Access', 'LED Smart TV', 'Daily Stocked Minibar', 'Luxury Toiletries'],
        amenitiesAr: ['دخول مجاني شامل لكافة الخدمات', 'شاشة ذكية LED', 'ميني بار يجدد يومياً', 'مستلزمات حمام فاخرة'],
        inventory: 20
      },
      {
        id: 'rx-fam',
        nameEn: 'Family Garden Suite',
        nameAr: 'جناح عائلي مطل على الحديقة',
        descriptionEn: 'Perfect configuration with two connected bedrooms and spacious lounge, ideal for corporate families or small delegations.',
        descriptionAr: 'تصميم مثالي يحتوي على غرفتين متصلتين وصالة واسعة، مثالي للعائلات أو وفود العمل الصغيرة.',
        pricePerNight: 580,
        capacity: 4,
        maxOccupancy: 6,
        amenitiesEn: ['Interconnected Rooms', 'Two LCD Screens', 'All-Inclusive Access', 'Fruit & Wine Set on Arrival'],
        amenitiesAr: ['غرف متصلة داخلياً', 'شاشتا عرض LCD', 'دخول مجاني شامل لكافة الخدمات', 'سلة فواكه ومشروب ترحيبي عند الوصول'],
        inventory: 10
      }
    ]
  },
  {
    id: 'steigenberger-aldau',
    nameEn: 'Steigenberger ALDAU Beach Hotel',
    nameAr: 'شتايجنبرجر ألدو بيتش',
    destinationId: 'hurghada',
    stars: 5,
    rating: 4.8,
    descriptionEn: 'The peak of Red Sea luxury, boasting a 400m private sandy beach, a massive lazy river, its own championship 9-hole golf course, and a vast array of water sports perfectly fitted for corporate leisure retreats.',
    descriptionAr: 'قمة الفخامة على ساحل البحر الأحمر، يتميز بشاطئ رملي خاص بطول ٤٠٠ متر، ومجرى مائي مريح (Lazy River)، وملعب جولف خاص بـ ٩ حفر، ومجموعة واسعة من الرياضات المائية للشركات.',
    benefitsEn: ['400m Private Sandy Beach', '9-hole Championship Golf', 'Massive Lazy River Pool', 'Vast Water-sports Station', 'Full Corporate Board Availability'],
    benefitsAr: ['شاطئ رملي خاص بطول ٤٠٠ متر', 'ملعب جولف بطولة ٩ حفر', 'مجرى مائي عملاق لامتناهي', 'محطة رياضات مائية متكاملة', 'توفر الإقامة الكاملة للشركات والوفود'],
    images: [
      'https://images.unsplash.com/photo-1455587734955-081b22074842?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 27.1611,
    lng: 33.8244,
    addressEn: 'Yussif Afifi Road, Hurghada',
    addressAr: 'طريق يوسف عفيفي، الغردقة',
    basePrice: 240,
    reviews: [
      {
        id: 'rev-6',
        authorCompany: 'Emaar Travel',
        authorName: 'Samer Wafiq',
        rating: 4.8,
        commentEn: 'Perfect pricing structures and great alignment. Our clients highly rated the lazy river and the massive beach area.',
        commentAr: 'هياكل تسعير ممتازة وتنسيق رائع مع الشركة. صنف عملائنا المجرى المائي والشاطئ الضخم بدرجات تقييم عالية جداً.',
        date: '2026-06-18'
      }
    ],
    rooms: [
      {
        id: 'st-std',
        nameEn: 'Deluxe Sea View Room',
        nameAr: 'غرفة ديلوكس مطلة على البحر',
        descriptionEn: 'Elegant room decorated in warm hues, boasting a wonderful sea view balcony and luxurious marble bathroom.',
        descriptionAr: 'غرفة أنيقة مزينة بألوان دافئة، تحتوي على شرفة مطلة على البحر وحمام رخامي فاخر.',
        pricePerNight: 240,
        capacity: 2,
        maxOccupancy: 3,
        amenitiesEn: ['Balcony with Sea View', 'Marble Bathroom', 'Tea & Coffee facilities', 'Complimentary In-room Wi-Fi'],
        amenitiesAr: ['شرفة مطلة على البحر', 'حمام رخامي فاخر', 'مرافق الشاي والقهوة', 'خدمة واي فاي مجانية داخل الغرفة'],
        inventory: 25
      },
      {
        id: 'st-suite',
        nameEn: 'Elite Sea Front Suite',
        nameAr: 'جناح النخبة المواجه للبحر مباشرة',
        descriptionEn: 'Perfect direct views of the waves with its own massive living room, desk and elite B2B greeting setups.',
        descriptionAr: 'إطلالة مباشرة ومثالية على أمواج البحر مع غرفة معيشة خاصة ضخمة، ومكتب وتجهيزات استقبال مخصصة لقطاع الأعمال.',
        pricePerNight: 420,
        capacity: 2,
        maxOccupancy: 4,
        amenitiesEn: ['Direct Sea View Balcony', 'Spacious Living Room', 'Executive Board Lounge Access', 'Premium Fruit Platter Daily'],
        amenitiesAr: ['شرفة أمامية على البحر مباشرة', 'صالة معيشة فسيحة جداً', 'دخول صالة الاجتماعات التنفيذية', 'طبق فواكه طازجة فاخر يومياً'],
        inventory: 6
      }
    ]
  },
  {
    id: 'winter-palace',
    nameEn: 'Sofitel Winter Palace Luxor',
    nameAr: 'سوفيتيل وينتر بالاس الأقصر',
    destinationId: 'luxor',
    stars: 5,
    rating: 4.9,
    descriptionEn: 'A masterpiece of Victorian architecture on the Nile bank, where historical legends walked. Surrounded by centennial royal gardens, this palace offers high-end services for elite corporate trips.',
    descriptionAr: 'تحفة معمارية فيكتورية على ضفاف النيل، حيث مشت الأساطير التاريخية. محاط بالحدائق الملكية المئوية، يقدم هذا القصر خدمات متميزة لرحلات الشركات الراقية.',
    benefitsEn: ['Historical Victorian Palace', 'Majestic Royal Gardens', 'French Gourmet Dining', 'Nile-side Pool', 'High-end Corporate Hospitality'],
    benefitsAr: ['قصر فيكتوري تاريخي أصيل', 'حدائق ملكية مهيبة عمرها قرن', 'مطاعم فرنسية فاخرة', 'مسبح مواجه لضفاف النيل', 'ضيافة مؤسسية راقية جداً'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop'
    ],
    lat: 25.6983,
    lng: 32.6394,
    addressEn: 'Corniche El Nil Street, Luxor',
    addressAr: 'شارع كورنيش النيل، الأقصر',
    basePrice: 190,
    reviews: [
      {
        id: 'rev-7',
        authorCompany: 'Nile Cruise Operators',
        authorName: 'Youssef El-Hady',
        rating: 5,
        commentEn: 'Booking our premium business groups here has always been a solid 5-star experience. The history is unmatched.',
        commentAr: 'كان حجز مجموعات أعمالنا الفاخرة هنا دائماً تجربة ممتازة ذات ٥ نجوم. تاريخ لا مثيل له.',
        date: '2026-05-12'
      }
    ],
    rooms: [
      {
        id: 'wp-classic',
        nameEn: 'Classic Garden Room',
        nameAr: 'غرفة كلاسيكية إطلالة على الحديقة الملكية',
        descriptionEn: 'Decorated in classical French Victorian styling, overlooking the magnificent botanical royal garden.',
        descriptionAr: 'مزينة على الطراز الفيكتوري الفرنسي الكلاسيكي، وتطل على الحديقة الملكية النباتية الرائعة.',
        pricePerNight: 190,
        capacity: 2,
        maxOccupancy: 2,
        amenitiesEn: ['Royal Garden View', 'Victorian Styling', 'High Ceiling', 'Complimentary Luxury Tea Tray'],
        amenitiesAr: ['إطلالة على الحديقة الملكية', 'تصميم فيكتوري كلاسيكي', 'أسقف شاهقة الارتفاع', 'صينية شاي فاخرة ترحيبية مجانية'],
        inventory: 15
      },
      {
        id: 'wp-palace',
        nameEn: 'Royal Nile Suite',
        nameAr: 'جناح ملكي مطل على النيل',
        descriptionEn: 'Live like royalty in a historic suite featuring high historical ceilings, private antiques, and frontal views of the Nile.',
        descriptionAr: 'عش كالبلاد الملكية في جناح تاريخي يتميز بأسقف تاريخية شاهقة وقطع أثرية خاصة وإطلالات أمامية على النيل.',
        pricePerNight: 490,
        capacity: 2,
        maxOccupancy: 4,
        amenitiesEn: ['Frontal Nile Balcony', 'Antique Furnishings', 'Private Butler Service', 'Executive Board Breakfast Pass'],
        amenitiesAr: ['شرفة أمامية على النيل', 'أثاث وتحف تاريخية أصلية', 'خدمة خادم شخصي مخصص', 'بطاقة إفطار في الصالة التنفيذية'],
        inventory: 4
      }
    ]
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B2B-10042',
    hotelId: 'nile-ritz',
    hotelNameEn: 'The Nile Ritz-Carlton',
    hotelNameAr: 'ذا نيل ريتز كارلتون',
    roomTypeId: 'nr-nile',
    roomTypeNameEn: 'Premium Nile View',
    roomTypeNameAr: 'غرفة بريميوم إطلالة نيلية كاملة',
    agentCompany: 'Al-Futtaim Travel Group',
    agentName: 'Mostafa Kamel',
    agentEmail: 'travel@alfuttaim.ae',
    agentPhone: '+971 4 123 4567',
    companyTaxId: 'CR-9087561-AE',
    checkIn: '2026-07-20',
    checkOut: '2026-07-25',
    guestsCount: 2,
    totalPrice: 1750, // 350 * 5 nights
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    bookingDate: '2026-07-10 11:24'
  },
  {
    id: 'B2B-10043',
    hotelId: 'fs-sharm',
    hotelNameEn: 'Four Seasons Resort Sharm El Sheikh',
    hotelNameAr: 'منتجع فور سيزونز شرم الشيخ',
    roomTypeId: 'fs-sea',
    roomTypeNameEn: 'Imperial Sea View Room',
    roomTypeNameAr: 'غرفة إمبراطورية مطلة على البحر والجزيرة',
    agentCompany: 'TUI Deutschland B2B',
    agentName: 'Hermann Müller',
    agentEmail: 'b2b.partners@tui.de',
    agentPhone: '+49 30 9876543',
    companyTaxId: 'DE-123456789',
    checkIn: '2026-08-01',
    checkOut: '2026-08-08',
    guestsCount: 2,
    totalPrice: 2940, // 420 * 7 nights
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'invoice',
    bookingDate: '2026-07-12 15:45'
  },
  {
    id: 'B2B-10044',
    hotelId: 'steigenberger-aldau',
    hotelNameEn: 'Steigenberger ALDAU Beach Hotel',
    hotelNameAr: 'شتايجنبرجر ألدو بيتش',
    roomTypeId: 'st-std',
    roomTypeNameEn: 'Deluxe Sea View Room',
    roomTypeNameAr: 'غرفة ديلوكس مطلة على البحر',
    agentCompany: 'Egypt Travel Net',
    agentName: 'Sherif Badawi',
    agentEmail: 'res@egypt-travel.net',
    agentPhone: '+20 100 123 4567',
    companyTaxId: 'EG-908-112',
    checkIn: '2026-07-15',
    checkOut: '2026-07-18',
    guestsCount: 2,
    totalPrice: 720, // 240 * 3 nights
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    bookingDate: '2026-07-13 09:12'
  }
];
