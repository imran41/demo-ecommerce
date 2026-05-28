import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { productService } from './productService';
import { isFirebaseConfigured, db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const ORDERS_DB_KEY = 'ecommerce_mock_orders';

const DEFAULT_MOCK_ORDERS = [
  {
    id: 'ord-101',
    userId: 'mock-customer-uuid',
    userName: 'John Doe',
    userEmail: 'customer@ecommerce.com',
    products: [
      {
        id: 'prod-1',
        name: 'AuraSound Max ANC Headphones',
        price: 297.49, // discounted
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'prod-5',
        name: 'Nomad Base One Max MagSafe Charger',
        price: 119.96, // discounted
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      }
    ],
    amount: 537.41, // subtotal + tax + shipping
    paymentStatus: 'paid',
    paymentMethod: 'Card',
    orderStatus: 'Delivered',
    shippingAddress: {
      name: 'John Doe',
      phone: '+919999988888',
      address: 'Apt 4B, Skyview Towers, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301'
    },
    returnStatus: null,
    refundStatus: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    userId: 'mock-customer-uuid',
    userName: 'John Doe',
    userEmail: 'customer@ecommerce.com',
    products: [
      {
        id: 'prod-2',
        name: 'KeyChron Q5 Pro Mechanical Keyboard',
        price: 170.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
      }
    ],
    amount: 170.99,
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    orderStatus: 'Shipped',
    shippingAddress: {
      name: 'John Doe',
      phone: '+919999988888',
      address: 'Apt 4B, Skyview Towers, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301'
    },
    returnStatus: null,
    refundStatus: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-103',
    userId: 'mock-other-uuid',
    userName: 'Sarah Jenkins',
    userEmail: 'sarah.j@example.com',
    products: [
      {
        id: 'prod-8',
        name: 'Apex Pro Titanium Smartphone',
        price: 1299.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
      }
    ],
    amount: 1299.00,
    paymentStatus: 'pending',
    paymentMethod: 'COD',
    orderStatus: 'Pending',
    shippingAddress: {
      name: 'Sarah Jenkins',
      phone: '+919811122233',
      address: 'Flat 102, Green Meadows, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102'
    },
    returnStatus: null,
    refundStatus: null,
    createdAt: new Date().toISOString()
  }
];

// Initialize mock orders
const getMockOrders = () => {
  if (typeof window === 'undefined') return DEFAULT_MOCK_ORDERS;
  const stored = localStorage.getItem(ORDERS_DB_KEY);
  if (!stored) {
    localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
    return DEFAULT_MOCK_ORDERS;
  }
  return JSON.parse(stored);
};

// Helper to map Supabase snake_case orders with users join to camelCase
const mapDatabaseOrder = (dbOrder) => {
  if (!dbOrder) return null;
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id,
    userName: dbOrder.users?.name || dbOrder.shipping_address?.name || 'John Doe',
    userEmail: dbOrder.users?.email || 'customer@ecommerce.com',
    products: dbOrder.products || [],
    amount: parseFloat(dbOrder.amount || 0),
    paymentStatus: dbOrder.payment_status,
    paymentMethod: dbOrder.payment_method,
    orderStatus: dbOrder.order_status,
    shippingAddress: dbOrder.shipping_address,
    returnStatus: dbOrder.return_status,
    refundStatus: dbOrder.refund_status,
    createdAt: dbOrder.created_at
  };
};

export const orderService = {
  isMock: !isSupabaseConfigured && !isFirebaseConfigured,

  async createOrder(orderData) {
    if (isFirebaseConfigured) {
      const colRef = collection(db, 'orders');
      const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
      const dbUserId = (orderData.userId && orderData.userId !== 'mock-customer-uuid')
        ? orderData.userId
        : null;

      const newOrder = {
        id: orderId,
        userId: dbUserId,
        userName: orderData.userName || 'John Doe',
        userEmail: orderData.userEmail || 'customer@ecommerce.com',
        products: orderData.products,
        amount: parseFloat(orderData.amount),
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentMethod: orderData.paymentMethod,
        orderStatus: orderData.orderStatus || 'Pending',
        shippingAddress: orderData.shippingAddress,
        returnStatus: null,
        refundStatus: null,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(colRef, orderId), newOrder);

      // Update product stocks
      try {
        for (const item of orderData.products) {
          const product = await productService.getProductById(item.id);
          const newStock = Math.max(0, product.stock - item.quantity);
          await productService.updateProduct(item.id, { ...product, stock: newStock });
        }
      } catch (stockError) {
        console.error('Error updating stock after purchase:', stockError);
      }

      return newOrder;
    } else if (isSupabaseConfigured) {
      const dbUserId = (orderData.userId && orderData.userId !== 'mock-customer-uuid' && orderData.userId.includes('-'))
        ? orderData.userId
        : null;

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: dbUserId,
            products: orderData.products,
            amount: parseFloat(orderData.amount),
            payment_status: orderData.paymentStatus || 'pending',
            payment_method: orderData.paymentMethod,
            order_status: orderData.orderStatus || 'Pending',
            shipping_address: orderData.shippingAddress
          }
        ])
        .select('*, users(name, email)');

      if (error) throw error;

      // Update product stocks
      try {
        for (const item of orderData.products) {
          const product = await productService.getProductById(item.id);
          const newStock = Math.max(0, product.stock - item.quantity);
          await productService.updateProduct(item.id, { ...product, stock: newStock });
        }
      } catch (stockError) {
        console.error('Error updating stock after purchase:', stockError);
      }

      return mapDatabaseOrder(data[0]);
    } else {
      // Mock flow
      const orders = getMockOrders();
      const newOrder = {
        id: `ord-${Math.floor(100 + Math.random() * 900)}`,
        userId: orderData.userId || 'mock-customer-uuid',
        userName: orderData.userName || 'John Doe',
        userEmail: orderData.userEmail || 'customer@ecommerce.com',
        products: orderData.products,
        amount: parseFloat(orderData.amount),
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentMethod: orderData.paymentMethod,
        orderStatus: orderData.orderStatus || 'Pending',
        shippingAddress: orderData.shippingAddress,
        returnStatus: null,
        refundStatus: null,
        createdAt: new Date().toISOString()
      };

      orders.push(newOrder);
      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));

      // Update stock locally
      try {
        for (const item of orderData.products) {
          const product = await productService.getProductById(item.id);
          const newStock = Math.max(0, product.stock - item.quantity);
          await productService.updateProduct(item.id, { ...product, stock: newStock });
        }
      } catch (stockError) {
        console.error('Error updating mock stock:', stockError);
      }

      return newOrder;
    }
  },

  async getUserOrders(userId) {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list;
      } catch (err) {
        console.warn('Firestore index not ready, querying flat collection:', err);
        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name, email)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapDatabaseOrder);
    } else {
      const orders = getMockOrders();
      return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getOrderById(id) {
    if (isFirebaseConfigured) {
      const docSnap = await getDoc(doc(db, 'orders', id));
      if (!docSnap.exists()) throw new Error('Order not found');
      return docSnap.data();
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return mapDatabaseOrder(data);
    } else {
      const orders = getMockOrders();
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
  },

  async getAllOrders() {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list;
      } catch (err) {
        console.warn('Firestore index not ready, querying flat collection:', err);
        const snap = await getDocs(collection(db, 'orders'));
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapDatabaseOrder);
    } else {
      return getMockOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async updateOrderStatus(id, status) {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { orderStatus: status });
      const snap = await getDoc(docRef);
      return snap.data();
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', id)
        .select('*, users(name, email)');
      if (error) throw error;
      return mapDatabaseOrder(data[0]);
    } else {
      const orders = getMockOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      orders[idx].orderStatus = status;
      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
      return orders[idx];
    }
  },

  async requestReturn(id) {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { returnStatus: 'Requested' });
      const snap = await getDoc(docRef);
      return snap.data();
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({ return_status: 'Requested' })
        .eq('id', id)
        .select('*, users(name, email)');
      if (error) throw error;
      return mapDatabaseOrder(data[0]);
    } else {
      const orders = getMockOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      orders[idx].returnStatus = 'Requested';
      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
      return orders[idx];
    }
  },

  async handleReturnRequest(id, action) {
    const update = { returnStatus: action };
    if (action === 'Approved') {
      update.refundStatus = 'Requested';
    } else if (action === 'Completed') {
      update.refundStatus = 'Processed';
      update.paymentStatus = 'refunded';
      update.orderStatus = 'Cancelled';
    }

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, update);
      const snap = await getDoc(docRef);
      return snap.data();
    } else if (isSupabaseConfigured) {
      const dbUpdate = { return_status: action };
      if (action === 'Approved') {
        dbUpdate.refund_status = 'Requested';
      } else if (action === 'Completed') {
        dbUpdate.refund_status = 'Processed';
        dbUpdate.payment_status = 'refunded';
        dbUpdate.order_status = 'Cancelled';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(dbUpdate)
        .eq('id', id)
        .select('*, users(name, email)');
      if (error) throw error;
      return mapDatabaseOrder(data[0]);
    } else {
      const orders = getMockOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      
      orders[idx].returnStatus = action;
      if (action === 'Approved') {
        orders[idx].refundStatus = 'Requested';
      } else if (action === 'Completed') {
        orders[idx].refundStatus = 'Processed';
        orders[idx].paymentStatus = 'refunded';
        orders[idx].orderStatus = 'Cancelled';
      }

      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
      return orders[idx];
    }
  },

  async cancelOrder(id) {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { orderStatus: 'Cancelled', paymentStatus: 'failed' });
      const snap = await getDoc(docRef);
      return snap.data();
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({ order_status: 'Cancelled', payment_status: 'failed' })
        .eq('id', id)
        .select('*, users(name, email)');
      if (error) throw error;
      return mapDatabaseOrder(data[0]);
    } else {
      const orders = getMockOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      orders[idx].orderStatus = 'Cancelled';
      orders[idx].paymentStatus = 'failed';
      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
      return orders[idx];
    }
  },

  async getAnalytics() {
    let orders = [];
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(db, 'orders'));
      snap.forEach(doc => {
        orders.push(doc.data());
      });
    } else if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*, users(name, email)');
      if (error) throw error;
      orders = data.map(mapDatabaseOrder);
    } else {
      orders = getMockOrders();
    }

    // Calculations
    let totalSales = 0;
    let totalRevenue = 0;
    let productsCount = {};
    let categoriesCount = {};
    let dailyRevenue = {};
    let monthlyRevenue = {};

    orders.forEach(order => {
      if (order.orderStatus !== 'Cancelled') {
        totalSales += 1;
        
        // Sum amount
        const amt = parseFloat(order.amount || 0);
        totalRevenue += amt;

        // Daily / Monthly Revenue
        const date = new Date(order.createdAt);
        const dayStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g. "May 2026"

        dailyRevenue[dayStr] = (dailyRevenue[dayStr] || 0) + amt;
        monthlyRevenue[monthStr] = (monthlyRevenue[monthStr] || 0) + amt;

        // Products sold count and Categories sold
        order.products.forEach(p => {
          productsCount[p.name] = (productsCount[p.name] || 0) + (p.quantity || 1);
          let cat = 'Peripherals';
          if (p.name.includes('Headphones') || p.name.includes('Speaker')) cat = 'Audio';
          else if (p.name.includes('Watch')) cat = 'Wearables';
          else if (p.name.includes('Camera')) cat = 'Cameras';
          else if (p.name.includes('Charger')) cat = 'Accessories';
          else if (p.name.includes('Smartphone')) cat = 'Mobiles';
          
          categoriesCount[cat] = (categoriesCount[cat] || 0) + (p.quantity || 1);
        });
      }
    });

    // Top products array
    const topProducts = Object.entries(productsCount)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Top categories array
    const topCategories = Object.entries(categoriesCount)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);

    // Daily and monthly revenue sorting/formatting
    const sortedDaily = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days

    const sortedMonthly = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }));

    return {
      totalSales,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      topProducts,
      topCategories,
      dailyRevenue: sortedDaily,
      monthlyRevenue: sortedMonthly,
      orderTrends: orders.map(o => ({
        id: o.id,
        amount: o.amount,
        status: o.orderStatus,
        date: o.createdAt.split('T')[0]
      })).slice(-10) // Last 10 orders for trending
    };
  }
};

