"use client";

import React, { createContext, useContext, useState } from 'react';

const UmkmContext = createContext();

export function UmkmProvider({ children }) {
  const [umkmData, setUmkmData] = useState({
    users: {
      name: "Ibu Lestari",
      email: "lestari@gmail.com",
    },
    umkm_profiles: {
      business_name: "Warung Bu Lestari",
      address: "Jl. Kaliurang KM 5.5, Gg. Megatruh No. 15, Caturtunggal, Depok, Sleman, DI Yogyakarta 55281",
      geo_location: "-7.759247, 110.380735",
      rating: 4.8,
      keyword_safety_level: "Aman", // Sesuai PRD enum
      level: "Gold Rescuer", // Hardcoded dari Sidebar sebelumnya
    },
    // Extra visual fields untuk mockup
    tagline: "Makanan rumahan sehat, murah, dan lezat",
    category: "Makanan Siap Saji",
    isStoreOpen: true,
    phone: "081234567890",
    description: "Warung Bu Lestari menyediakan berbagai macam masakan rumahan dengan resep rahasia keluarga. Berkomitmen untuk mengurangi food waste.",
    nib: "1234567890123",
    npwp: "98.765.432.1-000.000"
  });

  return (
    <UmkmContext.Provider value={{ umkmData, setUmkmData }}>
      {children}
    </UmkmContext.Provider>
  );
}

export function useUmkm() {
  const context = useContext(UmkmContext);
  if (!context) {
    throw new Error('useUmkm must be used within a UmkmProvider');
  }
  return context;
}
