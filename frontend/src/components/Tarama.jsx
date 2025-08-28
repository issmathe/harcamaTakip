import React, { useState } from "react";
import Tesseract from "tesseract.js";

function OCRComponent() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleScan = () => {
    if (!image) return;
    Tesseract.recognize(
      image,
      'eng', // İngilizce; Türkçe için 'tur' kullanabilirsin
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      setText(text);
    });
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleScan}>Scan</button>
      <p>Sonuç: {text}</p>
    </div>
  );
}

export default OCRComponent;
