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
│  ├─ Gelirler.jsx          # Gelirleri listeleme sayfası
│  ├─ Harcamalar.jsx        # Harcamaları listeleme sayfası
│  ├─ Raporlar.jsx          # Raporlama sayfası
│  └─ KayitEkleme.jsx       # Gelir / Harcama ekleme sayfası
│
├─ App.jsx                  # Router ve genel layout
├─ index.js                 # React root
└─ index.css / tailwind.css # Global stiller ve Tailwind ayarları
