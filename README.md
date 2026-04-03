# 🌿 CAD M CAD B – Younger's Hunger
## Pure Veg Restaurant Website | Durg, Chhattisgarh

---

## 📁 Project Structure

```
cadmcadb/
├── index.html          # Main website (all sections)
├── style.css           # All styles (responsive, mobile-first)
├── script.js           # Frontend JS (animations, tabs, forms)
├── admin.html          # Admin panel (password protected)
├── server.js           # Node.js + Express backend
├── package.json        # Dependencies
├── data/               # Auto-created: JSON data storage
│   ├── reservations.json
│   ├── contacts.json
│   └── menu.json
└── README.md
```

---

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start
# OR with auto-reload:
npm run dev

# 3. Open browser
http://localhost:3000          # Website
http://localhost:3000/admin    # Admin panel
```

---

## 🔐 Admin Panel Login

- **URL:** `/admin`
- **Default username:** `admin`
- **Default password:** `cadmcadb2024`

⚠️ **Change password before going live!**

Set environment variables:
```bash
ADMIN_USER=yourUsername ADMIN_PASS=yourStrongPassword npm start
```

---

## 🌐 Deployment

### Option A: Vercel (Recommended for static)
```bash
npm install -g vercel
vercel --prod
```

### Option B: Railway / Render (Full Node.js backend)
1. Push code to GitHub
2. Connect repo to Railway.app or Render.com
3. Set environment variables:
   - `PORT` = 3000
   - `ADMIN_USER` = your username
   - `ADMIN_PASS` = your secure password

### Option C: VPS / cPanel
```bash
npm install
npm start
# Use PM2 for production:
npm install -g pm2
pm2 start server.js --name "cadmcadb"
pm2 save
```

---

## 📱 Features

- ✅ Sticky navbar with scroll effect
- ✅ Full-screen hero with real restaurant image
- ✅ Quick action bar (call/WhatsApp/directions)
- ✅ USP strip
- ✅ About section with stats
- ✅ Tabbed menu (5 categories, 23 dishes)
- ✅ Gallery grid (6 real photos)
- ✅ Real Google reviews display (6 reviews)
- ✅ Table reservation form (with WhatsApp fallback)
- ✅ Contact section with embedded Google Map
- ✅ Footer with social links
- ✅ Floating WhatsApp button
- ✅ Smooth scroll animations (IntersectionObserver)
- ✅ Mobile-first responsive (360px–1400px)
- ✅ SEO meta tags + JSON-LD structured data
- ✅ Node.js backend (reservations + contacts storage)
- ✅ Admin panel (view/confirm/delete reservations)
- ✅ Indian phone validation (6–9 prefix, 10 digits)

---

## 📞 Real Business Data Used

| Field | Value |
|-------|-------|
| Name | CAD M CAD B – Younger's Hunger |
| Address | Gurudwara Rd, New Deepak Nagar, Guru Nanak Nagar, Durg, CG 491001 |
| Phone | +91 99938 62777 |
| Hours | 11:00 AM – 11:30 PM (Daily) |
| Rating | 4.1★ Google (1,600+ reviews) |
| Price | ₹200–₹400 per person |

---

## 🎨 Design Choices

- **Fonts:** Playfair Display (headings) + Poppins (body)
- **Colors:** Forest Green (#2d6a4f) + Warm Orange (#e07c24) + Cream (#fdfaf5)
- **Theme:** Warm, earthy, premium-yet-approachable vegetarian
- **Animations:** CSS IntersectionObserver reveals + subtle hover effects
- **Images:** Real photos from restaurantguru.in (Google Maps sourced)
