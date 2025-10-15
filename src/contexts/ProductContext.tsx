'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductInfo {
  id: string;
  title: string;
  price?: number | string;
  image?: string;
  url?: string;
}

interface ProductContextType {
  currentProduct: ProductInfo | null;
  setCurrentProduct: (product: ProductInfo | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(null);

  return (
    <ProductContext.Provider value={{ currentProduct, setCurrentProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
