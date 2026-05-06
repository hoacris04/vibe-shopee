const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// MySQL Database configuration
const dbConfig = {
  host: 'sql12.freesqldatabase.com',
  user: 'sql12825546',
  password: 'sCWdeFaUz4',
  database: 'sql12825546',
  port: 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database connection
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
    
    // Create tables if they don't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        category VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        quantity INT DEFAULT 0,
        link TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        discount_code VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        address TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        product_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        product_category VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        quantity INT,
        order_date VARCHAR(50),
        status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        tracking_number VARCHAR(100),
        tracking_info TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        payment_status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// SPX Tracking API function
async function fetchSPXData(trackingNumber) {
  if (!trackingNumber) return '';
  
  const url = `https://spx.vn/shipment/order/open/order/get_order_info?spx_tn=${trackingNumber}&language_code=vi`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const json = await response.json();
    
    if (json.retcode === 0 && json.data.sls_tracking_info.records) {
      const records = json.data.sls_tracking_info.records.filter(item => item.display_flag === 1);
      
      if (records.length > 0) {
        records.sort((a, b) => b.actual_time - a.actual_time);
        const latest = records[0];
        const date = new Date(latest.actual_time * 1000);
        const timeString = date.toLocaleString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return `${timeString} ${latest.description}`;
      }
    }
    return 'Chưa có thông tin';
  } catch (error) {
    console.error('Error fetching SPX data:', error);
    return 'Lỗi kết nối';
  }
}

// API Routes - Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, category, quantity, link, discount_code } = req.body;
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, category, quantity, link, discount_code) VALUES (?, ?, ?, ?, ?)',
      [name, category, quantity, link, discount_code]
    );
    res.json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, category, quantity, link, discount_code } = req.body;
  const { id } = req.params;
  
  try {
    await pool.execute(
      'UPDATE products SET name = ?, category = ?, quantity = ?, link = ?, discount_code = ? WHERE id = ?',
      [name, category, quantity, link, discount_code, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes - Orders
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { 
    recipient_name, address, product_name, product_category, 
    quantity, order_date, status, tracking_number, payment_status 
  } = req.body;
  
  try {
    const [result] = await pool.execute(
      `INSERT INTO orders (recipient_name, address, product_name, product_category, 
       quantity, order_date, status, tracking_number, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recipient_name, address, product_name, product_category, quantity, 
       order_date, status, tracking_number, payment_status]
    );
    res.json({ id: result.insertId, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { 
    recipient_name, address, product_name, product_category, 
    quantity, order_date, status, tracking_number, payment_status 
  } = req.body;
  const { id } = req.params;
  
  try {
    await pool.execute(
      `UPDATE orders SET recipient_name = ?, address = ?, product_name = ?, 
       product_category = ?, quantity = ?, order_date = ?, status = ?, 
       tracking_number = ?, payment_status = ? WHERE id = ?`,
      [recipient_name, address, product_name, product_category, quantity, 
       order_date, status, tracking_number, payment_status, id]
    );
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import orders from TSV data
app.post('/api/orders/bulk-import', async (req, res) => {
  const { orders } = req.body;
  
  if (!orders || !Array.isArray(orders)) {
    res.status(400).json({ error: 'Invalid data format' });
    return;
  }
  
  let imported = 0;
  let errors = 0;
  
  try {
    for (const order of orders) {
      try {
        await pool.execute(
          `INSERT INTO orders (recipient_name, address, product_name, product_category, 
           quantity, order_date, status, tracking_number, tracking_info, payment_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.recipient_name || '',
            order.address || '',
            order.product_name || '',
            order.product_category || '',
            order.quantity || null,
            order.order_date || '',
            order.status || 'Chờ đặt',
            order.tracking_number || '',
            order.tracking_info || '',
            order.payment_status || 'Chưa thanh toán'
          ]
        );
        imported++;
      } catch (err) {
        errors++;
        console.error('Error importing order:', err);
      }
    }
    
    res.json({ 
      message: `Import completed: ${imported} orders imported, ${errors} errors`,
      imported,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tracking info for a specific order
app.post('/api/orders/:id/update-tracking', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.execute('SELECT tracking_number FROM orders WHERE id = ?', [id]);
    
    if (rows.length === 0 || !rows[0].tracking_number) {
      res.status(404).json({ error: 'Order not found or no tracking number' });
      return;
    }
    
    const trackingInfo = await fetchSPXData(rows[0].tracking_number);
    
    await pool.execute(
      'UPDATE orders SET tracking_info = ? WHERE id = ?',
      [trackingInfo, id]
    );
    
    res.json({ message: 'Tracking info updated', tracking_info: trackingInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update all tracking info
app.post('/api/orders/update-all-tracking', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, tracking_number FROM orders WHERE tracking_number IS NOT NULL AND tracking_number != ""'
    );
    
    let updated = 0;
    for (const row of rows) {
      const trackingInfo = await fetchSPXData(row.tracking_number);
      await pool.execute(
        'UPDATE orders SET tracking_info = ? WHERE id = ?',
        [trackingInfo, row.id]
      );
      updated++;
    }
    
    res.json({ message: `Updated ${updated} orders` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import products from TSV data
app.post('/api/products/bulk-import', async (req, res) => {
  const { products } = req.body;
  
  if (!products || !Array.isArray(products)) {
    res.status(400).json({ error: 'Invalid data format' });
    return;
  }
  
  let imported = 0;
  let errors = 0;
  
  try {
    for (const product of products) {
      try {
        await pool.execute(
          `INSERT INTO products (name, category, quantity, link, discount_code) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            product.name || '',
            product.category || '',
            product.quantity || 0,
            product.link || '',
            product.discount_code || ''
          ]
        );
        imported++;
      } catch (err) {
        console.error('Error importing product:', err);
        errors++;
      }
    }
    
    res.json({ 
      message: `Imported ${imported} products successfully${errors > 0 ? `, ${errors} errors` : ''}`,
      imported,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-update tracking info every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Running automatic tracking update...');
  
  try {
    const [rows] = await pool.execute(
      'SELECT id, tracking_number FROM orders WHERE tracking_number IS NOT NULL AND tracking_number != ""'
    );
    
    for (const row of rows) {
      const trackingInfo = await fetchSPXData(row.tracking_number);
      await pool.execute(
        'UPDATE orders SET tracking_info = ? WHERE id = ?',
        [trackingInfo, row.id]
      );
    }
    
    console.log(`Auto-updated ${rows.length} orders`);
  } catch (error) {
    console.error('Error in auto-update:', error);
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

// Made with Bob
