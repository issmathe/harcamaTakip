backend render.com
frontend vercel.com

backend/
│
├─ models/                          # MongoDB modelleri (Mongoose şemaları)
│  ├─ Gelir.js                      # Gelir verilerini tanımlayan model
│  ├─ Harcama.js                    # Harcama verilerini tanımlayan model
│
├─ routes/                          # API endpoint dosyaları
│  ├─ gelirs.js                     # /api/gelir -> Düz gelir ve transfer işlemleri
│  ├─ harcamas.js                    # /api/harcama -> Harcama işlemleri (Taksit, abonelik vb.)
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
│  │  ├─ MainContent.jsx    # Wheel ve harcama modal (Hafifletildi!)
│  │  └─ BottomNav.jsx      # Alt navigation bar, Home özel
│  │
│  └─ Forms/                # Form elemanları ve dışarı alınan akıllı modallar
│     ├─ CustomDayPicker.jsx # Ortak kullanılan takvim bileşeni
│     └─ GelirEkleModal.jsx  # Hem düz gelir hem transferi yöneten akıllı modal
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
│  ├─ Harcamalar.jsx        # Harcamaları listeleme
│  └─ Raporlar.jsx          # Raporlama sayfası
│
├─ App.jsx                  # Router ve genel ayarlar
├─ index.js                 # React root
└─ index.css / tailwind.css # Global stiller ve Tailwind ayarları

bu proje mern projesi ve bu proje backend mangodb ve render.com. frontend ise vercel.com ile hepside ücretsiz versiyonlar ile iphone 15 için özel kullanılıyor. kişiye özel bir uygulama.