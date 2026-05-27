import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const PRODUCTS_DB_KEY = 'ecommerce_mock_products';

const DEFAULT_MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'AuraSound Max ANC Headphones',
    description: 'Experience audiophile-grade sound quality with active hybrid noise cancellation. Features 40mm dynamic drivers, custom acoustic design, and up to 45 hours of battery life with speed charge. Made from carbon fiber and premium lambskin leather for ultimate comfort.',
    price: 349.99,
    discount: 15, // 15% off
    category: 'Audio',
    brand: 'AuraSound',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'AS-MAX-001',
    featured: true,
    status: 'active',
    rating: 4.8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-2',
    name: 'KeyChron Q5 Pro Mechanical Keyboard',
    description: 'A fully customizable double-gasket mechanical keyboard with QMK/VIA support, south-facing RGB, and CNC aluminum body. Comes with hot-swappable Keychron K Pro switches and double-shot PBT keycaps for a rich tactile writing experience.',
    price: 189.99,
    discount: 10, // 10% off
    category: 'Peripherals',
    brand: 'Keychron',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'KC-Q5P-002',
    featured: true,
    status: 'active',
    rating: 4.9,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-3',
    name: 'ChronoClassic Sapphire Watch',
    description: 'A luxury mechanical watch featuring a precision automatic movement visible through a scratch-proof sapphire crystal caseback. Water-resistant up to 100m, with a premium stainless steel bracelet and luminescent hands.',
    price: 899.00,
    discount: 0,
    category: 'Wearables',
    brand: 'ChronoClassic',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'CC-SAP-003',
    featured: true,
    status: 'active',
    rating: 4.7,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Lumix G9II Mirrorless Camera',
    description: 'High-performance mirrorless camera featuring a 25.2MP sensor, Phase Hybrid Autofocus, and 60fps burst shooting. Supports 5.7K video recording, high-resolution hand-held 100MP shots, and industry-leading image stabilization.',
    price: 1699.99,
    discount: 5, // 5% off
    category: 'Cameras',
    brand: 'Lumix',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'LX-G92-004',
    featured: false,
    status: 'active',
    rating: 4.6,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Nomad Base One Max MagSafe Charger',
    description: 'A heavy-duty, glass and metal MagSafe charging hub. Features official 15W MagSafe fast charging for iPhone, an integrated Apple Watch charger, and a weighted design that stays firmly anchored to your nightstand.',
    price: 149.95,
    discount: 20, // 20% off
    category: 'Accessories',
    brand: 'Nomad',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'NM-B1M-005',
    featured: false,
    status: 'active',
    rating: 4.4,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-6',
    name: 'BeamOne Smart Portable Speaker',
    description: 'Weatherproof smart speaker designed for outdoor and indoor listening. Delivers wide soundstage, deep bass, and automatic Trueplay tuning that matches the audio profile to your surroundings. Connects via Wi-Fi, Bluetooth, and Apple AirPlay 2.',
    price: 229.00,
    discount: 10,
    category: 'Audio',
    brand: 'BeamOne',
    stock: 0, // Out of stock to test stock handling!
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'BO-SPS-006',
    featured: false,
    status: 'active',
    rating: 4.5,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-7',
    name: 'UltraWide Pro Curved Display 38"',
    description: '38-inch curved UltraWide QHD+ IPS monitor with Nano IPS technology, DCI-P3 98% color gamut, and VESA DisplayHDR 600. Includes Thunderbolt 3 connectivity with 94W power delivery to clean up your workspace cabling.',
    price: 1199.99,
    discount: 12,
    category: 'Peripherals',
    brand: 'LG',
    stock: 3, // Low stock alert test!
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'LG-38UW-007',
    featured: true,
    status: 'active',
    rating: 4.9,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-8',
    name: 'Apex Pro Titanium Smartphone',
    description: 'A titanium-bodied superphone with a 6.8-inch LTPO 120Hz display, a custom Snapdragon 8 Gen 3 chipset, and a 200MP quadruple-sensor camera system. Supports satellite messaging, dual-layer privacy vault, and 100W wireless charging.',
    price: 1299.00,
    discount: 0,
    category: 'Mobiles',
    brand: 'Apex',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
    ],
    sku: 'AP-PRO-008',
    featured: true,
    status: 'active',
    rating: 4.8,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to initialize products in localStorage if not exists
const getMockProducts = () => {
  if (typeof window === 'undefined') return DEFAULT_MOCK_PRODUCTS;
  const stored = localStorage.getItem(PRODUCTS_DB_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(DEFAULT_MOCK_PRODUCTS));
    return DEFAULT_MOCK_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const productService = {
  isMock: !isSupabaseConfigured,

  async getProducts(filters = {}) {
    if (isSupabaseConfigured) {
      let query = supabase.from('products').select('*');

      // Category filter
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      // Brand filter
      if (filters.brand && filters.brand !== 'All') {
        query = query.eq('brand', filters.brand);
      }

      // Status filter
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      } else if (!filters.status) {
        query = query.eq('status', 'active');
      }

      // Featured filter
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      // Price range
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Search query
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      // Availability filter
      if (filters.availability === 'in-stock') {
        query = query.gt('stock', 0);
      } else if (filters.availability === 'out-of-stock') {
        query = query.eq('stock', 0);
      }

      // Order / Sort
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low-high':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high-low':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'rating':
            // Ratings require joining review calculations, in Supabase we order by ID default or custom
            query = query.order('created_at', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Inject average ratings (mock values or from real review aggregates)
      // For simplicity, we merge with a rating field or default
      const productsWithRating = data.map(p => ({
        ...p,
        rating: p.rating || 4.5
      }));

      // Clientside rating filter if requested (since average rating isn't a direct DB field on product usually)
      if (filters.rating) {
        return productsWithRating.filter(p => p.rating >= parseFloat(filters.rating));
      }

      return productsWithRating;
    } else {
      // Mock flow
      let list = [...getMockProducts()];

      // Filters
      if (filters.category && filters.category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.brand && filters.brand !== 'All') {
        list = list.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
      }
      if (filters.status && filters.status !== 'All') {
        list = list.filter(p => p.status === filters.status);
      } else if (!filters.status) {
        list = list.filter(p => p.status === 'active');
      }
      if (filters.featured !== undefined) {
        list = list.filter(p => p.featured === filters.featured);
      }
      if (filters.minPrice !== undefined) {
        list = list.filter(p => p.price * (1 - (p.discount || 0) / 100) >= filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        list = list.filter(p => p.price * (1 - (p.discount || 0) / 100) <= filters.maxPrice);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      if (filters.availability) {
        if (filters.availability === 'in-stock') {
          list = list.filter(p => p.stock > 0);
        } else if (filters.availability === 'out-of-stock') {
          list = list.filter(p => p.stock === 0);
        }
      }
      if (filters.rating) {
        list = list.filter(p => (p.rating || 4.5) >= parseFloat(filters.rating));
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low-high':
            list.sort((a, b) => {
              const priceA = a.price * (1 - (a.discount || 0) / 100);
              const priceB = b.price * (1 - (b.discount || 0) / 100);
              return priceA - priceB;
            });
            break;
          case 'price-high-low':
            list.sort((a, b) => {
              const priceA = a.price * (1 - (a.discount || 0) / 100);
              const priceB = b.price * (1 - (b.discount || 0) / 100);
              return priceB - priceA;
            });
            break;
          case 'rating':
            list.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
            break;
          case 'newest':
          default:
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } else {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return list;
    }
  },

  async getProductById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { ...data, rating: data.rating || 4.5 };
    } else {
      // Mock flow
      const products = getMockProducts();
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
  },

  async createProduct(productData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            discount: parseFloat(productData.discount || 0),
            category: productData.category,
            brand: productData.brand,
            stock: parseInt(productData.stock),
            images: productData.images,
            sku: productData.sku,
            featured: productData.featured || false,
            status: productData.status || 'active'
          }
        ])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      // Mock flow
      const products = getMockProducts();
      const newProduct = {
        id: `prod-${Math.random().toString(36).substr(2, 9)}`,
        ...productData,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount || 0),
        stock: parseInt(productData.stock),
        rating: 5.0,
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products));
      return newProduct;
    }
  },

  async updateProduct(id, productData) {
    if (isSupabaseConfigured) {
      const updates = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount || 0),
        category: productData.category,
        brand: productData.brand,
        stock: parseInt(productData.stock),
        images: productData.images,
        sku: productData.sku,
        featured: productData.featured,
        status: productData.status
      };
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      // Mock flow
      const products = getMockProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');

      const updated = {
        ...products[idx],
        ...productData,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount || 0),
        stock: parseInt(productData.stock)
      };
      products[idx] = updated;
      localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products));
      return updated;
    }
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      // Mock flow
      const products = getMockProducts();
      const filtered = products.filter(p => p.id !== id);
      if (filtered.length === products.length) throw new Error('Product not found');
      localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  async getCategories() {
    // Collect active categories
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');
      if (error) throw error;
      const cats = data.map(d => d.category);
      return ['All', ...Array.from(new Set(cats))];
    } else {
      const products = getMockProducts().filter(p => p.status === 'active');
      const cats = products.map(p => p.category);
      return ['All', ...Array.from(new Set(cats))];
    }
  },

  async getBrands() {
    // Collect active brands
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .eq('status', 'active');
      if (error) throw error;
      const brands = data.map(d => d.brand);
      return ['All', ...Array.from(new Set(brands))];
    } else {
      const products = getMockProducts().filter(p => p.status === 'active');
      const brands = products.map(p => p.brand);
      return ['All', ...Array.from(new Set(brands))];
    }
  }
};
