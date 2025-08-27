import React from 'react';
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex items-center justify-between w-full h-16 bg-gray-800 px-8">
      <div className="h-16 w-16"></div>
      <nav>
        <ul className="flex gap-8">
          <Link to="/" className="text-white">ANASAYFA</Link>
          <Link to="/" className="text-white">HAKKIMIZDA</Link>
          <Link to="/" className="text-white">PROJELER</Link>
          <Link to="/" className="text-white">İLETİŞİM</Link>
        </ul>
      </nav>
      <div className="flex gap-8">
        <button className="px-4 py-2 rounded-md bg-blue-500 text-white">Kayıt ol</button>
        <button className="px-4 py-2 rounded-md bg-red-500 text-white">Giriş yap</button>
      </div>
    </header>
  );
};

export default Header;
