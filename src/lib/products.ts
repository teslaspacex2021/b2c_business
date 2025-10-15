// Product data management layer
// This will be replaced with actual database operations later

export interface Product {
  id: string;
  title: string;
  description: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockAlert: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  tags: string[];
  specifications?: Record<string, string>;
  published: boolean;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords: string[];
  views: number;
  orders: number;
  rating?: number;
  reviewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Mock data storage (in real app, this would be database operations)
let productsData: Product[] = [
  {
    id: '1',
    title: 'Industrial LED Lighting System',
    description: 'High-efficiency LED lighting solutions for industrial applications. These premium LED systems provide exceptional brightness and energy efficiency, perfect for warehouses, manufacturing facilities, and large commercial spaces.',
    category: 'electronics',
    status: 'Published',
    price: 1299.99,
    stock: 45,
    sku: 'LED-IND-001',
    weight: 5.2,
    dimensions: '24 x 12 x 6 inches',
    image: '/images/products/led-lighting.jpg',
    images: [
      '/images/products/led-lighting-1.jpg',
      '/images/products/led-lighting-2.jpg',
      '/images/products/led-lighting-3.jpg',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    views: 1234,
    orders: 23,
    tags: ['LED', 'Industrial', 'Energy Efficient', 'Commercial'],
    specifications: {
      'Power Consumption': '50W',
      'Lumens': '6000 LM',
      'Color Temperature': '5000K',
      'Lifespan': '50,000 hours',
      'Warranty': '3 years',
    }
  },
  {
    id: '2',
    title: 'CNC Machining Center',
    description: 'Precision CNC machining center for manufacturing operations',
    category: 'machinery',
    status: 'Published',
    price: 89999.99,
    stock: 3,
    sku: 'CNC-MAC-002',
    weight: 2500.0,
    dimensions: '120 x 80 x 100 inches',
    image: '/images/products/cnc-machine.jpg',
    images: [
      '/images/products/cnc-machine-1.jpg',
      '/images/products/cnc-machine-2.jpg',
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    views: 856,
    orders: 5,
    tags: ['CNC', 'Machinery', 'Manufacturing', 'Precision'],
    specifications: {
      'Max Workpiece Size': '1000 x 800 x 600 mm',
      'Spindle Speed': '8000 RPM',
      'Tool Capacity': '20 tools',
      'Accuracy': '±0.005 mm',
      'Power': '15 kW',
    }
  },
  {
    id: '3',
    title: 'Steel Construction Materials',
    description: 'High-grade steel materials for construction and infrastructure',
    category: 'materials',
    status: 'Draft',
    price: 299.99,
    stock: 150,
    sku: 'STL-CON-003',
    weight: 50.0,
    dimensions: '10 x 2 x 1 feet',
    image: '/images/products/steel-materials.jpg',
    images: [
      '/images/products/steel-materials-1.jpg',
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
    views: 423,
    orders: 0,
    tags: ['Steel', 'Construction', 'Infrastructure', 'Materials'],
    specifications: {
      'Grade': 'A36',
      'Yield Strength': '36,000 psi',
      'Tensile Strength': '58,000-80,000 psi',
      'Coating': 'Galvanized',
    }
  },
  {
    id: '4',
    title: 'Electronic Control Systems',
    description: 'Advanced electronic control systems for industrial automation',
    category: 'electronics',
    status: 'Published',
    price: 2599.99,
    stock: 12,
    sku: 'ECS-AUTO-004',
    weight: 8.5,
    dimensions: '18 x 12 x 8 inches',
    image: '/images/products/control-systems.jpg',
    createdAt: '2023-12-28',
    updatedAt: '2024-01-12',
    views: 967,
    orders: 18,
    tags: ['Electronics', 'Control', 'Automation', 'Industrial'],
    specifications: {
      'Input Voltage': '24V DC',
      'Output Channels': '16',
      'Communication': 'Ethernet, RS485',
      'Operating Temperature': '-10°C to 60°C',
    }
  },
  {
    id: '5',
    title: 'Heavy Duty Conveyor Belt',
    description: 'Durable conveyor belt systems for material handling',
    category: 'machinery',
    status: 'Published',
    price: 4999.99,
    stock: 8,
    sku: 'CVB-HD-005',
    weight: 150.0,
    dimensions: '50 x 3 x 0.5 feet',
    image: '/images/products/conveyor-belt.jpg',
    createdAt: '2023-12-20',
    updatedAt: '2024-01-08',
    views: 678,
    orders: 12,
    tags: ['Conveyor', 'Material Handling', 'Heavy Duty', 'Industrial'],
    specifications: {
      'Belt Width': '36 inches',
      'Max Load': '5000 lbs',
      'Speed': '0-200 ft/min',
      'Material': 'Reinforced Rubber',
    }
  },
  {
    id: '6',
    title: 'Aluminum Alloy Sheets',
    description: 'Premium aluminum alloy sheets for various applications',
    category: 'materials',
    status: 'Published',
    price: 199.99,
    stock: 200,
    sku: 'ALU-SHT-006',
    weight: 15.0,
    dimensions: '4 x 8 x 0.125 feet',
    image: '/images/products/aluminum-sheets.jpg',
    createdAt: '2023-12-15',
    updatedAt: '2024-01-05',
    views: 534,
    orders: 8,
    tags: ['Aluminum', 'Alloy', 'Sheets', 'Materials'],
    specifications: {
      'Alloy': '6061-T6',
      'Thickness': '0.125 inches',
      'Finish': 'Mill Finish',
      'Temper': 'T6',
    }
  },
];

// Simulate database operations with localStorage for persistence
const STORAGE_KEY = 'b2b_products_data';

// Load products from localStorage on initialization
if (typeof window !== 'undefined') {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      productsData = JSON.parse(storedData);
    } catch (error) {
      console.error('Error loading products from storage:', error);
    }
  }
}

// Save products to localStorage
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productsData));
  }
};

// Product management functions
export const getAllProducts = (): Product[] => {
  return [...productsData];
};

export const getPublishedProducts = (): Product[] => {
  return productsData.filter(product => product.status === 'Published');
};

export const getProductById = (id: string): Product | null => {
  return productsData.find(product => product.id === id) || null;
};

export const createProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'orders'>): Product => {
  const newProduct: Product = {
    ...productData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    views: 0,
    orders: 0,
  };
  
  productsData.push(newProduct);
  saveToStorage();
  
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const index = productsData.findIndex(product => product.id === id);
  if (index === -1) return null;
  
  productsData[index] = {
    ...productsData[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  
  saveToStorage();
  return productsData[index];
};

export const deleteProduct = (id: string): boolean => {
  const index = productsData.findIndex(product => product.id === id);
  if (index === -1) return false;
  
  productsData.splice(index, 1);
  saveToStorage();
  
  return true;
};

export const incrementProductViews = (id: string): void => {
  const product = productsData.find(p => p.id === id);
  if (product) {
    product.views += 1;
    saveToStorage();
  }
};

export const incrementProductOrders = (id: string): void => {
  const product = productsData.find(p => p.id === id);
  if (product) {
    product.orders += 1;
    saveToStorage();
  }
};

// Search and filter functions
export const searchProducts = (query: string, category?: string, status?: string): Product[] => {
  let filtered = [...productsData];
  
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    filtered = filtered.filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.sku.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(product => product.category === category);
  }
  
  if (status && status !== 'all') {
    filtered = filtered.filter(product => product.status === status);
  }
  
  return filtered;
};

// Category management
export const getProductCategories = (): string[] => {
  const categories = [...new Set(productsData.map(product => product.category))];
  return categories.sort();
};

// Statistics
export const getProductStats = () => {
  const total = productsData.length;
  const published = productsData.filter(p => p.status === 'Published').length;
  const draft = productsData.filter(p => p.status === 'Draft').length;
  const archived = productsData.filter(p => p.status === 'Archived').length;
  const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalViews = productsData.reduce((sum, p) => sum + p.views, 0);
  const totalOrders = productsData.reduce((sum, p) => sum + p.orders, 0);
  
  return {
    total,
    published,
    draft,
    archived,
    totalValue,
    totalViews,
    totalOrders,
    conversionRate: totalViews > 0 ? (totalOrders / totalViews * 100) : 0,
  };
};
