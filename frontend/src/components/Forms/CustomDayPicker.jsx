// Takvim bileşeni için özel tarih seçici

import React, { useState } from "react";
import { Typography, Modal, Button } from "antd";
import { EditOutlined } from '@ant-design/icons';

// DayPicker kütüphane importları
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // DayPicker'ın temel stilleri
import { format } from 'date-fns';
import { tr } from 'date-fns/locale'; // Türkçe dil desteği

import dayjs from "dayjs";

const { Text } = Typography;

// =========================================================================
// CustomDayPicker Bileşeni
// =========================================================================

/**
 * Resimdeki stile yakın, Ant Design Modal içinde mobil uyumlu tarih seçici bileşeni.
 * Ant Design Form.Item ile uyumlu çalışmak için 'value' ve 'onChange' kullanır.
 *
 * @param {Date | undefined} value - Seçili tarih (Date objesi)
 * @param {function} onChange - Tarih değiştiğinde çağrılan fonksiyon (Date objesi döner)
 * @param {function} disabledDate - Antd'den gelen, hangi tarihlerin devre dışı bırakılacağını belirleyen fonksiyon
 * @param {boolean} isIncome - Gelir formu içinse (renkleri değiştirir)
 */
const CustomDayPicker = ({ value, onChange, disabledDate, isIncome, ...rest }) => {
    const [pickerModalVisible, setPickerModalVisible] = useState(false);
    
    const selectedDay = value ? dayjs(value).toDate() : undefined;
    
    const displayDate = value 
        ? format(dayjs(value).toDate(), "d MMMM EEEE", { locale: tr })
        : "Tarih seçin";
        
    const incomeColor = "indigo"; // Gelir Modalı için renk
    const expenseColor = "blue"; // Harcama Modalı için renk
    const primaryColor = isIncome ? incomeColor : expenseColor;
    const buttonBgClass = `bg-${primaryColor}-600 border-none hover:bg-${primaryColor}-700`;

    const handleDayClick = (day) => {
        if (disabledDate && disabledDate(dayjs(day))) {
            return;
        }
        
        onChange(day); // Date objesini Form'a geri gönder
        setPickerModalVisible(false);
    };
    
    const CustomInput = (
        <div 
            onClick={() => setPickerModalVisible(true)}
            className={`flex justify-between items-center h-10 px-3 border border-gray-300 rounded-lg shadow-sm cursor-pointer bg-white 
                       hover:border-${primaryColor}-400 transition-all duration-200`}
        >
            <Text className="text-base text-gray-800 font-medium">
                {value ? format(dayjs(value).toDate(), 'dd.MM.yyyy') : 'Tarih seçin'}
            </Text>
            <EditOutlined className={`text-gray-500 hover:text-${primaryColor}-500`} />
        </div>
    );

    return (
        <>
            {CustomInput}

            <Modal
                title={null} 
                open={pickerModalVisible}
                onCancel={() => setPickerModalVisible(false)}
                footer={null}
                width={360} 
                centered
                className="custom-datepicker-modal" 
                styles={{
                    body: { padding: '0 0 16px 0' }, 
                    header: { display: 'none' } 
                }}
            >
                <div className="p-6">
                    {/* Başlık kısmı */}
                    <div className="mb-6 border-b pb-4">
                        <Text className="block text-gray-500 font-semibold mb-2">Tarih seçin</Text>
                        <div className="flex justify-between items-center">
                            <Text className="text-2xl sm:text-3xl font-bold text-gray-800">{displayDate}</Text>
                        </div>
                    </div>
                    
                    {/* DayPicker Takvimi */}
                    <DayPicker
                        mode="single"
                        locale={tr} 
                        selected={selectedDay}
                        onSelect={handleDayClick}
                        // Dayjs (Antd) disabledDate'i Date (DayPicker) objesine adapte ediyoruz
                        disabled={(day) => disabledDate && disabledDate(dayjs(day))} 
                        
                        classNames={{
                            root: "mx-auto", 
                            caption: "flex justify-center py-2 relative items-center",
                            caption_label: "text-lg font-bold text-gray-700",
                            nav_button_previous: "absolute left-0 text-xl text-gray-600 hover:text-blue-500",
                            nav_button_next: "absolute right-0 text-xl text-gray-600 hover:text-blue-500",
                            head_cell: "text-gray-900 font-semibold text-sm pt-4 pb-2",
                            cell: "p-1",
                            day: "h-10 w-10 text-lg rounded-full transition-colors duration-150 hover:bg-gray-100",
                            day_selected: `${buttonBgClass} text-white`, // Dinamik renk
                            day_today: `font-bold text-${primaryColor}-600 border border-${primaryColor}-600 rounded-full`,
                            day_outside: "text-gray-400",
                        }}
                    />
                    
                    {/* Alt Butonlar */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Button 
                            onClick={() => setPickerModalVisible(false)}
                            className="text-gray-600 font-semibold border-none hover:bg-gray-100"
                        >
                            İptal
                        </Button>
                        <Button 
                            type="primary"
                            onClick={() => setPickerModalVisible(false)}
                            className={`font-semibold ${buttonBgClass}`}
                        >
                            Kapat
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CustomDayPicker;