/* =============================================
   CAD M CAD B – Younger's Hunger
   Frontend JavaScript
   ============================================= */

'use strict';

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ---- Hamburger menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- Scroll reveal animation ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger child reveals within same parent
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      let delay = 0;
      siblings.forEach(el => {
        if (el === entry.target) {
          setTimeout(() => el.classList.add('visible'), delay);
          delay += 80;
        }
      });
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Hero staggered reveal on load ----
window.addEventListener('load', () => {
  const heroItems = document.querySelectorAll('.hero-content .reveal');
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 180);
  });
});

// ---- Menu tabs ----
const tabBtns = document.querySelectorAll('.tab-btn');
const menuGrids = document.querySelectorAll('.menu-grid');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    menuGrids.forEach(g => g.classList.remove('active'));

    btn.classList.add('active');
    const grid = document.getElementById('tab-' + target);
    if (grid) {
      grid.classList.add('active');
      // Re-trigger reveal for newly shown cards
      grid.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), 80);
      });
    }
  });
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- Reservation form ----
const reserveForm = document.getElementById('reserveForm');
const formMsg = document.getElementById('formMsg');

// Set minimum date to today
const dateInput = document.getElementById('resDate');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

if (reserveForm) {
  reserveForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('resName').value.trim();
    const phone = document.getElementById('resPhone').value.trim();
    const guests = document.getElementById('resGuests').value;
    const date = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const note = document.getElementById('resNote').value.trim();

    // Phone validation: Indian mobile number
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      showMsg('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    const submitBtn = reserveForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Send to backend
    try {
      const resp = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, guests, date, time, note })
      });

      if (resp.ok) {
        showMsg(`✅ Thank you ${name}! Your table for ${guests} on ${formatDate(date)} at ${formatTime(time)} is confirmed. We'll call you at +91 ${phone}.`, 'success');
        reserveForm.reset();
        // Also send WhatsApp confirmation
        const waMsg = encodeURIComponent(`Hi, I have booked a table at CAD M CAD B.\n\nName: ${name}\nPhone: ${phone}\nGuests: ${guests}\nDate: ${formatDate(date)}\nTime: ${formatTime(time)}\n${note ? 'Note: ' + note : ''}`);
        setTimeout(() => {
          window.open(`https://wa.me/919993862777?text=${waMsg}`, '_blank');
        }, 1500);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Fallback: open WhatsApp
      const waMsg = encodeURIComponent(`Hi, I want to book a table at CAD M CAD B.\n\nName: ${name}\nPhone: ${phone}\nGuests: ${guests}\nDate: ${formatDate(date)}\nTime: ${formatTime(time)}\n${note ? 'Note: ' + note : ''}`);
      window.open(`https://wa.me/919993862777?text=${waMsg}`, '_blank');
      showMsg('✅ Redirecting to WhatsApp to confirm your reservation!', 'success');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Reservation 🎉';
  });
}

function showMsg(msg, type) {
  formMsg.textContent = msg;
  formMsg.className = 'form-msg ' + type;
  setTimeout(() => { formMsg.className = 'form-msg'; formMsg.textContent = ''; }, 8000);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}

// ---- Active nav highlight on scroll ----
const sections = document.querySelectorAll('section[id], div[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkItems.forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active-link');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ---- Lazy loading images ----
const lazyImages = document.querySelectorAll('[style*="background-image"]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      imageObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });

lazyImages.forEach(img => {
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.4s ease';
  imageObserver.observe(img);
});

// ---- Add active-link style dynamically ----
const style = document.createElement('style');
style.textContent = `.nav-links a.active-link { color: var(--green) !important; font-weight: 600; }`;
document.head.appendChild(style);
