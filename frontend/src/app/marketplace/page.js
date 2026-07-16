"use client";

import { useState, useEffect } from "react";

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/marketplace`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace products", error);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="marketplace-container">
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Savora Marketplace</h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>Selamatkan Makanan, Hemat Biaya, Kurangi Limbah.</p>
      
      <div className="marketplace-grid">
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', marginTop: '40px' }}>Belum ada produk rescue deal yang aktif saat ini.</p>
        ) : (
          products.map(p => (
            <div className="product-card" key={p.id}>
              <img src={p.photo_url || "https://via.placeholder.com/300x200?text=Savora"} alt={p.name} />
              <div className="product-card-body">
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, marginBottom: '5px' }}>
                  {p.category} • Stok: {p.stock}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '10px' }}>{p.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="price-strike" style={{ fontSize: '0.75rem' }}>{formatRupiah(p.original_price)}</div>
                    <div className="price-rescue" style={{ fontSize: '1.25rem' }}>{formatRupiah(p.rescue_price)}</div>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.875rem' }}>Pesan</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
