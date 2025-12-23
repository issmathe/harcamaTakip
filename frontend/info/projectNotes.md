backend render sitahmet@gmail
frontend vercel 


backend/
│
├─ models/                          # MongoDB modelleri (Mongoose şemaları)
│  ├─ Gelir.js                      # Gelir verilerini tanımlayan model
│  ├─ Harcama.js                    # Harcama verilerini tanımlayan model
│
├─ routes/                          # API endpoint dosyaları
│  ├─ gelirs.js                     # /api/gelirs -> Gelir CRUD işlemleri
│  ├─ harcama.js                    # /api/harcama -> Harcama CRUD işlemleri
│
├─ node_modules/                    # Bağımlılıkların bulunduğu klasör (otomatik)
│
├─ database.js                      # MongoDB bağlantısını yöneten dosya
│
├─ index.js                         # Uygulamanın ana giriş noktası (Express server)
│
├─ .env                             # Ortam değişkenleri (PORT, MONGO_URI, vb.)
│
└─ package.json                     # Proje bilgileri ve bağımlılık listesi





src/
├─ assets/                  # Resimler, ikonlar, fontlar vb.
│
├─ components/              # Tekrar kullanılabilir bileşenler
│  ├─ Home/                 # Ana sayfa ile ilgili componentler
│  │  ├─ Header.jsx         # Üst header (bakiye ve kartlar)
│  │  ├─ MainContent.jsx    # Wheel, harcama modal, gelir modal vs.
│  │  └─ BottomNav.jsx      # Alt navigation bar, Home özel
│
├─ context/                 # Context API dosyaları
│  └─ TotalsContext.jsx     # Gelir, gider, bakiye verilerini yöneten context
│
├─ hooks/                   # Özel hooklar
│  └─ useTotals.js          # TotalsContext ile ilgili özel hook
│
├─ pages/                   # Router ile yönlendirilen tam sayfa bileşenleri
│  ├─ Home.jsx              # Ana sayfa
│  ├─ Gelirler.jsx          # Gelirleri listeleme 
│  ├─ Harcamalar.jsx        # Harcamaları 
│  ├─ Raporlar.jsx          # Raporlama sayfası
│  └─ KayitEkleme.jsx       # Gelir / Harcama 
│
├─ App.jsx                  # Router ve genel 
├─ index.js                 # React root
└─ index.css / tailwind.css # Global stiller ve Tailwind ayarları


