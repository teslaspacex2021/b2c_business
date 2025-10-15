import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    title: 'Industrial LED Lighting System',
    description: 'High-efficiency LED lighting solutions for industrial applications. These premium LED systems provide exceptional brightness and energy efficiency, perfect for warehouses, manufacturing facilities, and large commercial spaces.',
    sku: 'LED-IND-001',
    price: 1299.99,
    comparePrice: 1599.99,
    costPrice: 850.00,
    stock: 45,
    lowStockAlert: 10,
    weight: 5.2,
    dimensions: {
      length: 24,
      width: 12,
      height: 6,
      unit: 'inches'
    },
    images: [
      '/images/products/led-lighting-1.jpg',
      '/images/products/led-lighting-2.jpg',
      '/images/products/led-lighting-3.jpg',
    ],
    category: 'electronics',
    subcategory: 'lighting',
    brand: 'IndustrialTech',
    tags: ['LED', 'Industrial', 'Energy Efficient', 'Commercial'],
    specifications: {
      'Power Consumption': '50W',
      'Lumens': '6000 LM',
      'Color Temperature': '5000K',
      'Lifespan': '50,000 hours',
      'Warranty': '3 years',
    },
    published: true,
    featured: true,
    seoTitle: 'Industrial LED Lighting System - High Efficiency Commercial Lighting',
    seoDescription: 'Premium industrial LED lighting systems for warehouses and manufacturing facilities. Energy efficient, long-lasting, and bright.',
    metaKeywords: ['industrial lighting', 'LED systems', 'commercial lighting', 'energy efficient'],
    views: 1234,
    orders: 23,
    rating: 4.8,
    reviewCount: 15,
  },
  {
    title: 'CNC Machining Center',
    description: 'Precision CNC machining center for manufacturing operations. Advanced 3-axis machining capabilities with high-speed spindle and automatic tool changer.',
    sku: 'CNC-MAC-002',
    price: 89999.99,
    comparePrice: 95000.00,
    costPrice: 65000.00,
    stock: 3,
    lowStockAlert: 2,
    weight: 2500.0,
    dimensions: {
      length: 120,
      width: 80,
      height: 100,
      unit: 'inches'
    },
    images: [
      '/images/products/cnc-machine-1.jpg',
      '/images/products/cnc-machine-2.jpg',
    ],
    category: 'machinery',
    subcategory: 'machining',
    brand: 'PrecisionTech',
    tags: ['CNC', 'Machinery', 'Manufacturing', 'Precision'],
    specifications: {
      'Max Workpiece Size': '1000 x 800 x 600 mm',
      'Spindle Speed': '8000 RPM',
      'Tool Capacity': '20 tools',
      'Accuracy': '±0.005 mm',
      'Power': '15 kW',
    },
    published: true,
    featured: true,
    seoTitle: 'CNC Machining Center - Precision Manufacturing Equipment',
    seoDescription: 'High-precision CNC machining center for manufacturing operations. 3-axis capabilities with automatic tool changer.',
    metaKeywords: ['CNC machine', 'machining center', 'manufacturing equipment', 'precision machining'],
    views: 856,
    orders: 5,
    rating: 4.9,
    reviewCount: 8,
  },
  {
    title: 'Steel Construction Materials - Grade A36',
    description: 'High-grade A36 steel materials for construction and infrastructure projects. Galvanized coating for superior corrosion resistance.',
    sku: 'STL-CON-003',
    price: 299.99,
    comparePrice: 349.99,
    costPrice: 180.00,
    stock: 150,
    lowStockAlert: 25,
    weight: 50.0,
    dimensions: {
      length: 10,
      width: 2,
      height: 1,
      unit: 'feet'
    },
    images: [
      '/images/products/steel-materials-1.jpg',
    ],
    category: 'materials',
    subcategory: 'steel',
    brand: 'SteelWorks',
    tags: ['Steel', 'Construction', 'Infrastructure', 'Materials'],
    specifications: {
      'Grade': 'A36',
      'Yield Strength': '36,000 psi',
      'Tensile Strength': '58,000-80,000 psi',
      'Coating': 'Galvanized',
    },
    published: false,
    featured: false,
    seoTitle: 'A36 Steel Construction Materials - High Grade Steel',
    seoDescription: 'Premium A36 grade steel materials for construction projects. Galvanized coating for corrosion resistance.',
    metaKeywords: ['A36 steel', 'construction materials', 'steel beams', 'galvanized steel'],
    views: 423,
    orders: 12,
    rating: 4.6,
    reviewCount: 5,
  },
  {
    title: 'Electronic Control Systems',
    description: 'Advanced electronic control systems for industrial automation. Programmable logic controller with multiple I/O channels.',
    sku: 'ECS-AUTO-004',
    price: 2599.99,
    comparePrice: 2899.99,
    costPrice: 1800.00,
    stock: 12,
    lowStockAlert: 5,
    weight: 8.5,
    dimensions: {
      length: 18,
      width: 12,
      height: 8,
      unit: 'inches'
    },
    images: [
      '/images/products/control-systems-1.jpg',
    ],
    category: 'electronics',
    subcategory: 'automation',
    brand: 'AutoTech',
    tags: ['Electronics', 'Control', 'Automation', 'Industrial'],
    specifications: {
      'Input Voltage': '24V DC',
      'Output Channels': '16',
      'Communication': 'Ethernet, RS485',
      'Operating Temperature': '-10°C to 60°C',
    },
    published: true,
    featured: false,
    seoTitle: 'Electronic Control Systems - Industrial Automation PLC',
    seoDescription: 'Advanced programmable logic controllers for industrial automation. Multiple I/O channels and communication options.',
    metaKeywords: ['PLC', 'control systems', 'industrial automation', 'programmable logic controller'],
    views: 967,
    orders: 18,
    rating: 4.7,
    reviewCount: 12,
  },
  {
    title: 'Heavy Duty Conveyor Belt System',
    description: 'Durable conveyor belt systems for material handling in manufacturing and warehouse environments.',
    sku: 'CVB-HD-005',
    price: 4999.99,
    comparePrice: 5499.99,
    costPrice: 3200.00,
    stock: 8,
    lowStockAlert: 3,
    weight: 150.0,
    dimensions: {
      length: 50,
      width: 3,
      height: 0.5,
      unit: 'feet'
    },
    images: [
      '/images/products/conveyor-belt-1.jpg',
    ],
    category: 'machinery',
    subcategory: 'material-handling',
    brand: 'ConveyorPro',
    tags: ['Conveyor', 'Material Handling', 'Heavy Duty', 'Industrial'],
    specifications: {
      'Belt Width': '36 inches',
      'Max Load': '5000 lbs',
      'Speed': '0-200 ft/min',
      'Material': 'Reinforced Rubber',
    },
    published: true,
    featured: false,
    seoTitle: 'Heavy Duty Conveyor Belt System - Material Handling Equipment',
    seoDescription: 'Industrial conveyor belt systems for heavy-duty material handling. Reinforced rubber construction.',
    metaKeywords: ['conveyor belt', 'material handling', 'industrial conveyor', 'heavy duty conveyor'],
    views: 678,
    orders: 12,
    rating: 4.5,
    reviewCount: 7,
  },
];

async function seedProducts() {
  console.log('Seeding products...');

  try {
    // Clear existing products
    await prisma.product.deleteMany();

    // Create new products
    for (const productData of sampleProducts) {
      await prisma.product.create({
        data: productData,
      });
    }

    console.log(`Successfully seeded ${sampleProducts.length} products`);
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

if (require.main === module) {
  seedProducts()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedProducts;

