import React from "react";
import { Select } from "antd";

const { Option } = Select;

const categories = [
  "Giyim", "Gıda", "Petrol", "Kira", "Fatura",
  "Eğitim", "Sağlık", "Ulaşım", "Eğlence",
  "Elektronik", "Spor", "Market", "Kırtasiye",
  "Restoran / Kafe", "Diğer"
];

const CategorySelect = () => {
  return (
    <div className="px-4 mt-4">
      <Select placeholder="Kategori seçin" style={{ width: "100%" }}>
        {categories.map(cat => (
          <Option key={cat} value={cat}>
            {cat}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CategorySelect;
