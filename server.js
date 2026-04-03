// =============================================
//  CAD M CAD B – Younger's Hunger
//  Node.js + Express Backend
//  server.js
// =============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Data file path ----
const DATA_DIR = path.join(__dirname, 'data');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Init files if missing
const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};
initFile(RESERVATIONS_FILE, []);
initFile(CONTACTS_FILE, []);
initFile(MENU_FILE, getDefaultMenu());

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ---- Helper: Read/Write JSON ----
const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
};
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ---- Input sanitize ----
const sanitize = (str) => String(str || '').trim().slice(0, 500);

// ---- Validate Indian phone ----
const isValidPhone = (phone) => /^[6-9][0-9]{9}$/.test(phone);

// ============================================
//  API ROUTES
// ============================================

// POST /api/reserve – Table Reservation
app.post('/api/reserve', (req, res) => {
  try {
    const { name, phone, guests, date, time, note } = req.body;

    if (!name || !phone || !guests || !date || !time) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number.' });
    }

    const reservation = {
      id: Date.now().toString(),
      name: sanitize(name),
      phone: sanitize(phone),
      guests: sanitize(guests),
      date: sanitize(date),
      time: sanitize(time),
      note: sanitize(note),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const reservations = readJson(RESERVATIONS_FILE);
    reservations.push(reservation);
    writeJson(RESERVATIONS_FILE, reservations);

    console.log(`✅ New Reservation: ${reservation.name} – ${reservation.date} ${reservation.time}`);
    res.json({ success: true, message: 'Reservation confirmed!', id: reservation.id });
  } catch (err) {
    console.error('Reserve error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/contact – Contact form
app.post('/api/contact', (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    const contact = {
      id: Date.now().toString(),
      name: sanitize(name),
      phone: sanitize(phone),
      email: sanitize(email),
      message: sanitize(message),
      createdAt: new Date().toISOString()
    };
    const contacts = readJson(CONTACTS_FILE);
    contacts.push(contact);
    writeJson(CONTACTS_FILE, contacts);
    res.json({ success: true, message: 'Message received!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/menu – Public menu
app.get('/api/menu', (req, res) => {
  const menu = readJson(MENU_FILE);
  res.json(menu);
});

// ============================================
//  ADMIN PANEL ROUTES (Basic Auth Protected)
// ============================================

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'cadmcadb2024';

const adminAuth = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const decoded = Buffer.from(auth.slice(6), 'base64').toString();
  const [user, pass] = decoded.split(':');
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// GET /api/admin/reservations
app.get('/api/admin/reservations', adminAuth, (req, res) => {
  const data = readJson(RESERVATIONS_FILE);
  res.json(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// PATCH /api/admin/reservations/:id
app.patch('/api/admin/reservations/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const reservations = readJson(RESERVATIONS_FILE);
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reservations[idx].status = status;
  writeJson(RESERVATIONS_FILE, reservations);
  res.json({ success: true });
});

// DELETE /api/admin/reservations/:id
app.delete('/api/admin/reservations/:id', adminAuth, (req, res) => {
  let reservations = readJson(RESERVATIONS_FILE);
  reservations = reservations.filter(r => r.id !== req.params.id);
  writeJson(RESERVATIONS_FILE, reservations);
  res.json({ success: true });
});

// GET /api/admin/contacts
app.get('/api/admin/contacts', adminAuth, (req, res) => {
  const data = readJson(CONTACTS_FILE);
  res.json(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// GET /api/admin/menu
app.get('/api/admin/menu', adminAuth, (req, res) => {
  res.json(readJson(MENU_FILE));
});

// PUT /api/admin/menu – Replace entire menu
app.put('/api/admin/menu', adminAuth, (req, res) => {
  writeJson(MENU_FILE, req.body);
  res.json({ success: true });
});

// ---- Serve admin panel ----
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ---- Catch-all: serve index ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  CAD M CAD B – Younger's Hunger Server  ║
║  Running at: http://localhost:${PORT}         ║
║  Admin Panel: http://localhost:${PORT}/admin  ║
╚══════════════════════════════════════════╝
  `);
});

// ---- Default Menu Data ----
function getDefaultMenu() {
  return {
    starters: [
      { id: 's1', name: 'Grilled Sandwich', desc: 'Crispy sandwich with fresh veggies & cheese', price: '80-120', tag: 'Bestseller' },
      { id: 's2', name: 'Paneer Chilly (Dry)', desc: 'Paneer with Indo-Chinese chilli sauce', price: '160-200', tag: '' },
      { id: 's3', name: 'French Fries', desc: 'Golden crispy masala fries', price: '80-120', tag: 'Fan Fav' },
      { id: 's4', name: 'Veg Manchurian', desc: 'Vegetable dumplings in Manchurian gravy', price: '140-180', tag: '' },
    ],
    maincourse: [
      { id: 'm1', name: 'White Sauce Pasta', desc: 'Signature creamy white sauce pasta', price: '150-200', tag: 'Must Try' },
      { id: 'm2', name: 'Lemon Garlic Noodles', desc: 'Wok-tossed lemon-garlic noodles', price: '130-180', tag: 'Bestseller' },
      { id: 'm3', name: 'Hakka Noodles', desc: 'Classic Indo-Chinese Hakka noodles', price: '120-160', tag: '' },
      { id: 'm4', name: 'Masala Dosa', desc: 'South Indian crispy dosa with masala', price: '100-140', tag: '' },
      { id: 'm5', name: 'Cheese Burger', desc: 'Veg patty burger with cheese & sauce', price: '120-160', tag: '' },
      { id: 'm6', name: 'Chinese Platter', desc: 'Assorted Chinese starters for sharing', price: '280-350', tag: '' },
    ],
    pizza: [
      { id: 'p1', name: 'Mexican Pizza', desc: 'Zesty pizza with jalapeños & corn', price: '180-250', tag: 'Must Try' },
      { id: 'p2', name: 'Cheese Pizza', desc: 'Classic loaded cheese pizza', price: '160-220', tag: '' },
      { id: 'p3', name: 'Paneer Pizza', desc: 'Paneer tikka pizza with capsicum', price: '200-280', tag: '' },
    ],
    desserts: [
      { id: 'd1', name: 'Chocolate Sizzler Brownie', desc: 'Hot brownie with vanilla ice cream', price: '180-220', tag: 'Most Loved' },
      { id: 'd2', name: 'Chocolate Custard', desc: 'Rich creamy chocolate custard', price: '100-140', tag: '' },
      { id: 'd3', name: 'Ferrero Rocher Dessert', desc: 'Indulgent Ferrero Rocher platter', price: '200-280', tag: 'Special' },
      { id: 'd4', name: 'Chocolate Sandwich', desc: 'Grilled chocolate-filled sandwich', price: '80-120', tag: '' },
    ],
    drinks: [
      { id: 'dr1', name: 'CAD Mango Thick Shake', desc: 'Signature mango ice cream shake', price: '120-160', tag: 'Signature' },
      { id: 'dr2', name: 'CAD Brownie Thick Shake', desc: 'Brownie blended thick shake', price: '130-170', tag: 'Bestseller' },
      { id: 'dr3', name: 'CAD Kit Kat Thick Shake', desc: 'Kit Kat creamy thick shake', price: '130-170', tag: '' },
      { id: 'dr4', name: 'Cold Coffee', desc: 'Refreshing blended cold coffee', price: '80-120', tag: '' },
      { id: 'dr5', name: 'CAD Mixed Mastani', desc: 'Ice cream mastani with dry fruits', price: '160-200', tag: 'New' },
      { id: 'dr6', name: 'Chocolate Frappe', desc: 'Velvety chocolate frappe', price: '120-160', tag: '' },
    ]
  };
}
