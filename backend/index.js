// 🔹 dotenv en başta yüklenmeli
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const database = require('./database.js');
const denemeRoute = require("./routes/denemes.js");
const gelirRoutes = require("./routes/gelir");

// Passport ve session
const passport = require("passport");
require("./passport"); // Passport.js dosyasını dahil et
const session = require("express-session"); // 🔹 express-session kullan

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Express session ayarları (Google Auth için)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mevcut rotalar
app.use("/api", denemeRoute);
app.use("/gelir", gelirRoutes);

// Google ile giriş
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("/profile")
);

// Kullanıcı profili
app.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/auth/google");
  res.send(`<h1>Hoşgeldin, ${req.user.displayName}</h1>`);
});

// Çıkış
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Server başlatma
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  database();
  console.log(`Server is running on port ${PORT}`);
});
