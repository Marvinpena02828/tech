// Product Data Management File
// This file contains all product information for the B2B website

export interface ProductData {
  id: string;
  title: string;
  sku: string;
  category: string;
  tags: string[];
  shortDescription: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  colors: Array<{ name: string; hex: string }>;
  description: string;
  videos?: string[]; // YouTube video IDs
  downloads?: Array<{ name: string; url: string; size?: string; type?: string }>;
  relatedProducts: string[]; // Array of product IDs
}

// Products Database - Organized by Category
export const productsDatabase: Record<string, ProductData> = {
  // ============================================
  // POWER BANK PRODUCTS
  // ============================================
  'titan-130rc': {
    id: 'titan-130rc',
    title: '130W Multi-Port Power Bank with Retractable USB-C Cable',
    sku: 'AY130RC',
    category: 'Power Bank',
    tags: ['130W Power Delivery', 'Retractable Cable', '20000mAh'],
    shortDescription: 'Never let your phone die when it matters most. Our high-capacity power banks give you fast charging, sleek design, and reliable performance perfect for travel, work, or emergencies.',
    images: [
      '/Images/products/Power Bank/1/Titan-130RC-01.png',
      '/Images/products/Power Bank/1/Titan-130RC-02.jpg',
      '/Images/products/Power Bank/1/Titan-130RC-03.jpg',
      '/Images/products/Power Bank/1/Titan-130RC-04.jpg',
      '/Images/products/Power Bank/1/Titan-130RC-05.png',
    ],
    features: [
      'High-Speed USB-C™ Power Delivery Port',
      'Built-in Retractable USB-C Cable',
      'Ultra-fast charging',
      'Long battery backup',
      'Sleek & durable design',
      'Fast Charging Technology',
      'Massive 20000mAh Capacity',
      '130W Power Delivery',
    ],
    specifications: {
      'Model': 'AY130RC',
      'Dimension': '132x74x31.5mm',
      'Color': 'Space Grey',
      'Weight': '355g',
    },
    colors: [
      { name: 'Space Grey', hex: '#6B7280' },
    ],
    description: `
      <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>•</strong> The AY130RC engineered for users who demand unstoppable power, superior durability, and fast, intelligent charging anytime, anywhere. With a massive 20000mAh capacity for powerhouse multiple-device charging, it effortlessly keeps your phones, tablets, and laptops charged throughout all your disruptions.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Designed with advanced technology, AY130RC optimizes charging efficiency, maintains battery health, and ensures stable high-speed output across all compatible devices.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Whether your day involves endless work calls, business trips, or leisurely travel, AY130RC has you covered. The USB-C™ Power Delivery port and built-in retractable USB-C Cable ensure seamless charging, while the 35W Qualcomm QC 3.0 port adds versatility.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Provides robust support for multi-tasking activities, and daily heavy use. Experience rapid, intelligent power delivery with improved efficiency and device protection.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Charge multiple devices at once with high-speed USB outputs designed for modern electronics.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Over-charge, over-heat, and short-circuit protection ensures reliable and safe charging every time.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Built with high-quality materials for durability while remaining compact enough to carry anywhere.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> Works seamlessly with iOS, Android, tablets, gaming consoles, TWS earbuds, and more.</li>
        <li style="margin-bottom: 8px;"><strong>•</strong> The AY130RC isn't just a power bank it's your dependable power partner. With cutting-edge technology, unmatched battery capacity, and a design made for real-world performance it guarantees that your devices remain powered when you need them most.</li>
      </ul>
    `,
    videos: [], // Add YouTube video IDs here, e.g., ['dQw4w9WgXcQ']
    downloads: [
      { name: 'Product Manual', url: '/downloads/titan-130rc-manual.pdf', size: '2.5 MB', type: 'PDF' },
      { name: 'Specification Sheet', url: '/downloads/titan-130rc-specs.pdf', size: '850 KB', type: 'PDF' },
      { name: 'Certification Documents', url: '/downloads/titan-130rc-certs.pdf', size: '1.2 MB', type: 'PDF' },
    ],
    relatedProducts: ['titan-new', 'powerup-10duo', 'powerup-duo'],
  },

  'titan-new': {
    id: 'titan-new',
    title: 'Titan Power Bank 20000mAh Fast Charging',
    sku: 'TITAN-NEW',
    category: 'Power Bank',
    tags: ['20000mAh', 'Fast Charging', 'Multiple Colors'],
    shortDescription: 'High-capacity portable power bank with fast charging technology. Available in multiple vibrant colors to match your style.',
    images: [
      '/Images/products/Power Bank/2/Titan-New-Image_20250908092932.png',
      '/Images/products/Power Bank/2/Blue-Titan-New-Image_20250908092932.png',
      '/Images/products/Power Bank/2/Purple-Titan-New-Image_20250908092932.png',
      '/Images/products/Power Bank/2/White-Titan-New-Image_20250908092932.png',
      '/Images/products/Power Bank/2/Image_20250912101847.jpg',
    ],
    features: [
      '20000mAh High Capacity',
      'Fast Charging Support',
      'Dual USB Output Ports',
      'LED Battery Indicator',
      'Compact & Portable Design',
      'Multiple Color Options',
      'Universal Compatibility',
      'Premium Build Quality',
    ],
    specifications: {
      'Model': 'TITAN-NEW',
      'Capacity': '20000mAh',
      'Color': 'Black, Blue, Purple, White',
      'Weight': '350g',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Purple', hex: '#8B5CF6' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>Titan Power Bank</h3><p>Reliable power on the go with our high-capacity Titan power bank.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['titan-130rc', 'powerup-10duo', 'e900b'],
  },

  'powerup-10duo': {
    id: 'powerup-10duo',
    title: 'PowerUp 10Duo Slim Power Bank',
    sku: 'PU-10DUO',
    category: 'Power Bank',
    tags: ['10000mAh', 'Slim Design', 'Dual Charging'],
    shortDescription: 'Ultra-slim power bank with dual charging capability. Perfect balance of capacity and portability.',
    images: [
      '/Images/products/Power Bank/3/E900B.jpg',
      '/Images/products/Power Bank/3/PowerUp-10Duo Blue.png',
      '/Images/products/Power Bank/3/PowerUp-10Duo-Purple.png',
      '/Images/products/Power Bank/3/PowerUp-10Duo-White.png',
      '/Images/products/Power Bank/3/PowerUp-10Duo-all-colour.jpg',
    ],
    features: [
      '10000mAh Capacity',
      'Ultra-Slim Profile',
      'Dual Output Ports',
      'Quick Charge Support',
      'Lightweight Design',
      'Multiple Colors Available',
      'LED Power Indicator',
      'Pocket-Friendly Size',
    ],
    specifications: {
      'Model': 'PU-10DUO',
      'Capacity': '10000mAh',
      'Color': 'Black, Blue, Purple, White',
      'Weight': '200g',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Purple', hex: '#8B5CF6' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>PowerUp 10Duo</h3><p>Slim and stylish power bank for everyday carry.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['titan-new', 'powerup-duo', 'pd20000'],
  },

  'powerup-duo': {
    id: 'powerup-duo',
    title: 'PowerUp Duo Compact Power Bank',
    sku: 'PU-DUO',
    category: 'Power Bank',
    tags: ['Compact', 'Dual Port', 'Travel Friendly'],
    shortDescription: 'Compact dual-port power bank perfect for quick charges on the go.',
    images: [
      '/Images/products/Power Bank/4/888_01.jpg',
      '/Images/products/Power Bank/4/Powerup-Duo-SA.png',
      '/Images/products/Power Bank/4/Blue-SA.png',
      '/Images/products/Power Bank/4/Purple-SA.png',
      '/Images/products/Power Bank/4/White-SA.png',
    ],
    features: [
      'Compact Form Factor',
      'Dual Charging Ports',
      'Fast Charge Technology',
      'Premium Finish',
      'Travel-Ready Design',
      'LED Status Indicator',
      'Universal Compatibility',
      'Durable Construction',
    ],
    specifications: {
      'Model': 'PU-DUO',
      'Capacity': '5000mAh',
      'Color': 'Black, Blue, Purple, White',
      'Weight': '150g',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Purple', hex: '#8B5CF6' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>PowerUp Duo</h3><p>Pocket-sized power for your daily needs.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['powerup-10duo', 'titan-new', 'pd20000'],
  },

  'pd20000': {
    id: 'pd20000',
    title: 'PowerPod 20000mAh PD Fast Charging Power Bank',
    sku: 'PD20000',
    category: 'Power Bank',
    tags: ['20000mAh', 'PD Fast Charging', 'Large Capacity'],
    shortDescription: 'High-capacity 20000mAh power bank with Power Delivery fast charging for laptops and smartphones.',
    images: [
      '/Images/products/Power Bank/5/PD20000.jpg',
      '/Images/products/Power Bank/5/Blue-PD20000.png',
      '/Images/products/Power Bank/5/PowerPod-20-Purple.png',
      '/Images/products/Power Bank/5/WHITE-SA-PD2000.png',
      '/Images/products/Power Bank/5/PD20000all.png',
    ],
    features: [
      '20000mAh Massive Capacity',
      'PD Fast Charging Support',
      'Laptop Compatible',
      'Triple Output Ports',
      'Digital Display',
      'Airline Safe',
      'Premium Materials',
      'Multiple Protection',
    ],
    specifications: {
      'Model': 'PD20000',
      'Capacity': '20000mAh',
      'Color': 'Black, Blue, Purple, White',
      'Weight': '400g',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Purple', hex: '#8B5CF6' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>PowerPod PD20000</h3><p>Professional-grade power bank for power users.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['titan-130rc', 'titan-new', 'powerup-10duo'],
  },

  // ============================================
  // WALL CHARGER PRODUCTS
  // ============================================
  'tripmate-36w': {
    id: 'tripmate-36w',
    title: 'TripMate 36W Dual Port Wall Charger',
    sku: 'TM-36W',
    category: 'Wall Charger',
    tags: ['36W', 'Dual Port', 'Travel'],
    shortDescription: 'Compact 36W dual-port wall charger with foldable plug design. Perfect travel companion for charging multiple devices.',
    images: [
      '/Images/products/Wall Charger/1/TripMate-36W.png',
      '/Images/products/Wall Charger/1/TripMate-36W-2.png',
      '/Images/products/Wall Charger/1/TripMate-LF2.jpg',
      '/Images/products/Wall Charger/1/tra-vel-plug_flatten.jpg',
    ],
    features: [
      '36W Total Power Output',
      'Dual USB-C Ports',
      'Foldable Plug Design',
      'Universal Voltage Support',
      'Compact & Lightweight',
      'Fast Charging Compatible',
      'Travel-Friendly',
      'Multiple Safety Protections',
    ],
    specifications: {
      'Model': 'TM-36W',
      'Power': '36W',
      'Ports': '2x USB-C',
      'Input': '100-240V AC',
    },
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>TripMate 36W</h3><p>Your perfect travel charging companion.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['tripmate-gan160', 'powerport-25cc', 'powerport-33'],
  },

  'tripmate-gan160': {
    id: 'tripmate-gan160',
    title: 'TripMate GaN 160W 4-Port Fast Charger',
    sku: 'TM-GAN160',
    category: 'Wall Charger',
    tags: ['160W', 'GaN Technology', '4-Port'],
    shortDescription: 'Ultra-powerful 160W GaN charger with 4 ports. Charge your laptop, tablet, and phones simultaneously.',
    images: [
      '/Images/products/Wall Charger/2/TripMate-GaN160.png',
      '/Images/products/Wall Charger/2/TripMate-GaN160-1.jpg',
      '/Images/products/Wall Charger/2/TripMate-GaN160-2.png',
      '/Images/products/Wall Charger/2/TripMate-GaN160-Ecom-3.jpg',
    ],
    features: [
      '160W Total Power Output',
      'GaN Technology - 40% Smaller',
      '4 Independent Ports',
      'Laptop Compatible (100W)',
      'Smart Power Distribution',
      'Premium Build Quality',
      'Universal Compatibility',
      'Advanced Heat Dissipation',
    ],
    specifications: {
      'Model': 'TM-GAN160',
      'Power': '160W Max',
      'Ports': '3x USB-C, 1x USB-A',
      'Technology': 'GaN III',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>TripMate GaN 160W</h3><p>Professional-grade charger for power users.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['tripmate-36w', 'powerport-33', 'powerport-25cc'],
  },

  'powerport-25cc': {
    id: 'powerport-25cc',
    title: 'PowerPort 25W USB-C Compact Charger',
    sku: 'PP-25CC',
    category: 'Wall Charger',
    tags: ['25W', 'USB-C PD', 'Compact'],
    shortDescription: 'Super compact 25W USB-C charger with Power Delivery. Perfect for iPhone and Samsung fast charging.',
    images: [
      '/Images/products/Wall Charger/3/POWERPORT-25CC-Black.jpg',
      '/Images/products/Wall Charger/3/POWERPORT-25CC-Black-EU.png',
      '/Images/products/Wall Charger/3/PowerPort-25CC-Ecom-2.jpg',
      '/Images/products/Wall Charger/3/POWERPORT-25cC-SA1-.png',
    ],
    features: [
      '25W Power Delivery',
      'Super Compact Design',
      'USB-C PD 3.0',
      'iPhone Super Fast Charging',
      'Samsung 25W Support',
      'Multiple Plug Types Available',
      'Lightweight & Portable',
      'Safety Certified',
    ],
    specifications: {
      'Model': 'PP-25CC',
      'Power': '25W',
      'Port': '1x USB-C PD',
      'Color': 'Black',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>PowerPort 25CC</h3><p>The perfect compact charger for your smartphone.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['powerport-33', 'tripmate-36w', 'tripmate-gan160'],
  },

  'powerport-33': {
    id: 'powerport-33',
    title: 'PowerPort 33W Dual USB-C Wall Charger',
    sku: 'PP-33',
    category: 'Wall Charger',
    tags: ['33W', 'Dual USB-C', 'Fast Charging'],
    shortDescription: 'Versatile 33W dual USB-C charger with multiple plug options (EU/UK). Charge two devices simultaneously.',
    images: [
      '/Images/products/Wall Charger/4/PowerPort-33-all.jpg',
      '/Images/products/Wall Charger/4/PowerPort-33 EU-B.png',
      '/Images/products/Wall Charger/4/PowerPort-33 EU-W.png',
      '/Images/products/Wall Charger/4/PowerPort-33 UK-B.png',
      '/Images/products/Wall Charger/4/PowerPort-33 UK-W.png',
    ],
    features: [
      '33W Total Output',
      'Dual USB-C Ports',
      'EU & UK Plug Options',
      'Black & White Colors',
      'Simultaneous Charging',
      'PD 3.0 Support',
      'Compact Design',
      'International Ready',
    ],
    specifications: {
      'Model': 'PP-33',
      'Power': '33W',
      'Ports': '2x USB-C',
      'Plug': 'EU, UK',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>PowerPort 33</h3><p>Dual-port fast charging for modern devices.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['powerport-25cc', 'tripmate-36w', 'tripmate-gan160'],
  },

  // ============================================
  // CAR CHARGER PRODUCTS
  // ============================================
  'powerdrive-mini': {
    id: 'powerdrive-mini',
    title: 'PowerDrive Mini Car Charger',
    sku: 'PD-MINI',
    category: 'Car Charger',
    tags: ['Compact', 'Fast Charging', 'USB-C'],
    shortDescription: 'Ultra-compact car charger that sits flush with your dashboard. Fast charging for all your devices.',
    images: [
      '/Images/products/Car Charger/1/1.jpg',
      '/Images/products/Car Charger/1/2.png',
      '/Images/products/Car Charger/1/2 copy.jpg',
    ],
    features: [
      'Ultra-Compact Design',
      'Flush Mount Installation',
      'Fast Charging Support',
      'USB-C & USB-A Ports',
      'LED Indicator',
      'Wide Compatibility',
      'Premium Metal Build',
      'Overheat Protection',
    ],
    specifications: {
      'Model': 'PD-MINI',
      'Power': '30W',
      'Ports': '1x USB-C, 1x USB-A',
      'Input': '12-24V DC',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>PowerDrive Mini</h3><p>Minimal design, maximum power for your car.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['powerdrive-230', 'tripmate-36w', 'powerport-25cc'],
  },

  'powerdrive-230': {
    id: 'powerdrive-230',
    title: 'PowerDrive 230W High-Power Car Charger',
    sku: 'PD-230',
    category: 'Car Charger',
    tags: ['230W', 'Laptop Charging', 'Professional'],
    shortDescription: 'Professional-grade 230W car charger for laptops, tablets, and smartphones. Ideal for road warriors.',
    images: [
      '/Images/products/Car Charger/2/PowerDrive-230 SA1_ copy.png',
      '/Images/products/Car Charger/2/image00001.jpeg',
      '/Images/products/Car Charger/2/image00004.jpeg',
      '/Images/products/Car Charger/2/image00008.jpeg',
    ],
    features: [
      '230W Total Power Output',
      'Laptop Fast Charging',
      'Multiple Ports',
      'Smart Power Distribution',
      'Premium Build Quality',
      'Temperature Control',
      'Universal Compatibility',
      'Professional Grade',
    ],
    specifications: {
      'Model': 'PD-230',
      'Power': '230W',
      'Ports': '2x USB-C, 1x USB-A',
      'Input': '12-24V DC',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>PowerDrive 230</h3><p>Ultimate car charging solution for professionals.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['powerdrive-mini', 'tripmate-gan160', 'titan-130rc'],
  },

  // ============================================
  // DATA AND CHARGE CABLES
  // ============================================
  'xcord-ac': {
    id: 'xcord-ac',
    title: 'XCord AC USB-A to USB-C Premium Cable',
    sku: 'XC-AC',
    category: 'Data and Charge Cables',
    tags: ['USB-A to USB-C', 'Fast Charging', 'Premium'],
    shortDescription: 'Premium braided USB-A to USB-C cable with fast charging support. Durable construction for long-lasting performance.',
    images: [
      '/Images/products/Data and Charge Cables/XCordAC/1600 XCord-AC Black-02.jpg',
      '/Images/products/Data and Charge Cables/XCordAC/xCord-AC-BLACK_Enhanced2.png',
      '/Images/products/Data and Charge Cables/XCordAC/xCord-AC-WHITE_.png',
      '/Images/products/Data and Charge Cables/XCordAC/xCord-AC-_all.jpg',
    ],
    features: [
      'Premium Braided Nylon',
      'Fast Charging Support',
      'Reinforced Connectors',
      'Data Sync Capable',
      'Multiple Lengths Available',
      'Universal Compatibility',
      'Tangle-Free Design',
      'Durable Construction',
    ],
    specifications: {
      'Model': 'XC-AC',
      'Type': 'USB-A to USB-C',
      'Length': '1m, 1.6m, 2m',
      'Color': 'Black, White',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>XCord AC</h3><p>Premium cable for reliable charging and data transfer.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['xcord-cc', 'xcord-ai', 'ecoline-cc120'],
  },

  'xcord-cc': {
    id: 'xcord-cc',
    title: 'XCord CC USB-C to USB-C Fast Charging Cable',
    sku: 'XC-CC',
    category: 'Data and Charge Cables',
    tags: ['USB-C to USB-C', '100W PD', 'Premium'],
    shortDescription: 'High-power USB-C to USB-C cable supporting up to 100W Power Delivery. Perfect for laptops and fast charging.',
    images: [
      '/Images/products/Data and Charge Cables/XCord-CC/xcord-cc-1.jpg',
    ],
    features: [
      '100W Power Delivery',
      'USB-C to USB-C',
      'Laptop Compatible',
      'Premium Materials',
      'E-Marker Chip',
      'Data Transfer Support',
      'Multiple Lengths',
      'Certified Quality',
    ],
    specifications: {
      'Model': 'XC-CC',
      'Type': 'USB-C to USB-C',
      'Power': '100W PD',
      'Length': '1m, 2m',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
    ],
    description: '<h3>XCord CC</h3><p>Professional-grade USB-C cable for power users.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['xcord-ac', 'ecoline-cc120', 'transline-ci'],
  },

  // ============================================
  // WIRELESS EARPHONES & HEADPHONES
  // ============================================
  'airclip-pro': {
    id: 'airclip-pro',
    title: 'AirClip Pro True Wireless Earbuds',
    sku: 'AC-PRO',
    category: 'WIRELESS EARPHONES & HEADPHONES',
    tags: ['True Wireless', 'ANC', 'Premium Sound'],
    shortDescription: 'Premium true wireless earbuds with active noise cancellation and crystal-clear sound quality.',
    images: [
      '/Images/products/WIRELESS EARPHONES & HEADPHONES/1/AirClip-Pro copy.jpg',
      '/Images/products/WIRELESS EARPHONES & HEADPHONES/1/new PURPLE SA copy.png',
      '/Images/products/WIRELESS EARPHONES & HEADPHONES/1/new. White SA2 copy.png',
      '/Images/products/WIRELESS EARPHONES & HEADPHONES/1/AirClip LF2 copy.jpg',
      '/Images/products/WIRELESS EARPHONES & HEADPHONES/1/AirClip LF3 copy.jpg',
    ],
    features: [
      'Active Noise Cancellation',
      'Crystal Clear Audio',
      'Long Battery Life',
      'Comfortable Fit',
      'Touch Controls',
      'IPX5 Water Resistant',
      'Wireless Charging Case',
      'Multiple Color Options',
    ],
    specifications: {
      'Model': 'AC-PRO',
      'Driver': '12mm Dynamic',
      'Battery': '8hrs + 32hrs case',
      'Color': 'Black, Purple, White',
    },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Purple', hex: '#8B5CF6' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    description: '<h3>AirClip Pro</h3><p>Immersive audio experience with premium sound quality.</p>',
    videos: [],
    downloads: [],
    relatedProducts: ['titan-130rc', 'xcord-ac', 'tripmate-36w'],
  },
};

// Helper function to get product by ID
export const getProductById = (id: string): ProductData | null => {
  return productsDatabase[id] || null;
};

// Helper function to get related products
export const getRelatedProducts = (productId: string) => {
  const product = productsDatabase[productId];
  if (!product) return [];
  
  return product.relatedProducts
    .map(id => productsDatabase[id])
    .filter(Boolean)
    .map(p => ({
      id: p.id,
      title: p.title,
      image: p.images[0],
      category: p.category,
    }));
};

// Helper function to get all products
export const getAllProducts = () => {
  return Object.values(productsDatabase);
};

// Helper function to get products by category
export const getProductsByCategory = (category: string) => {
  return Object.values(productsDatabase).filter(p => p.category === category);
};

// Helper function to get all categories
export const getAllCategories = () => {
  const categories = new Set(Object.values(productsDatabase).map(p => p.category));
  return Array.from(categories);
};

