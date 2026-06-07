// ==========================================================================
// MATON — Interactive Logic & Animations
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // --- CART STATE ---
  let cart = [];
  const FREE_SHIPPING_THRESHOLD = 50.0;

  // Cache DOM elements
  const cartTrigger = document.getElementById('cartTrigger');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCountBadge = document.getElementById('cartCount');
  
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartDrawerFooter = document.getElementById('cartDrawerFooter');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const progressBarText = document.getElementById('progressBarText');
  const progressFill = document.getElementById('progressFill');
  
  const cartBrowseBtn = document.getElementById('cartBrowseBtn');
  const cartToast = document.getElementById('cartToast');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Load cart from LocalStorage
  function loadCart() {
    const savedCart = localStorage.getItem('maton_cart');
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {
        cart = [];
      }
    }
    updateCartUI();
  }

  // Save cart to LocalStorage
  function saveCart() {
    localStorage.setItem('maton_cart', JSON.stringify(cart));
    updateCartUI();
  }

  // Open/Close Cart Drawer
  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  cartTrigger.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  if (cartBrowseBtn) {
    cartBrowseBtn.addEventListener('click', () => {
      closeCart();
      const productSection = document.getElementById('products');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Add Item to Cart
  function addToCart(id, name, price, img) {
    const parsedPrice = parseFloat(price);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price: parsedPrice,
        img,
        quantity: 1
      });
    }

    saveCart();
    showToast(`Added ${name} to selection`);
    
    // Auto open cart drawer on add
    setTimeout(() => {
      openCart();
    }, 400);
  }

  // Toast Notification
  function showToast(message) {
    const toastMsg = cartToast.querySelector('.toast-message');
    toastMsg.textContent = message;
    cartToast.classList.add('active');
    
    setTimeout(() => {
      cartToast.classList.remove('active');
    }, 2800);
  }

  // Remove Item
  function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
  }

  // Change Quantity
  function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeItem(id);
      } else {
        saveCart();
      }
    }
  }

  // Update Cart UI
  function updateCartUI() {
    // Total count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalCount;
    
    // Scale animation on badge
    cartCountBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      cartCountBadge.style.transform = 'scale(1)';
    }, 200);

    if (cart.length === 0) {
      cartEmptyState.style.display = 'flex';
      cartItemsContainer.style.display = 'none';
      cartDrawerFooter.style.display = 'none';
    } else {
      cartEmptyState.style.display = 'none';
      cartItemsContainer.style.display = 'flex';
      cartDrawerFooter.style.display = 'flex';
      
      // Render items
      cartItemsContainer.innerHTML = '';
      cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
          <div class="cart-item-img">
            <img src="${item.img}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <div class="cart-item-controls">
              <button class="qty-btn minus-btn" data-id="${item.id}">&minus;</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn plus-btn" data-id="${item.id}">&plus;</button>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">Remove</button>
          </div>
        `;
        cartItemsContainer.appendChild(itemEl);
      });

      // Recalculate values
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;

      // Free shipping progress bar
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressBarText.textContent = "You've qualified for FREE shipping!";
        progressFill.style.width = '100%';
      } else {
        const needed = FREE_SHIPPING_THRESHOLD - subtotal;
        progressBarText.textContent = `Add $${needed.toFixed(2)} more for FREE shipping`;
        const percent = (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
        progressFill.style.width = `${percent}%`;
      }
    }
  }

  // Delegate clicks in cart items container (plus, minus, remove)
  cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    const itemId = target.getAttribute('data-id');
    
    if (target.classList.contains('minus-btn')) {
      updateQuantity(itemId, -1);
    } else if (target.classList.contains('plus-btn')) {
      updateQuantity(itemId, 1);
    } else if (target.classList.contains('cart-item-remove')) {
      removeItem(itemId);
    }
  });

  // Global Add to Cart event delegator
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const img = btn.getAttribute('data-img');
      addToCart(id, name, price, img);
    }
  });

  // Checkout button interaction
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Proceeding to luxury checkout secure payment portal...');
    });
  }


  // --- PRODUCT TAB SELECTION ---
  const miniCards = document.querySelectorAll('.mini-product-card');
  const featuredImg = document.getElementById('featuredImg');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredDesc = document.getElementById('featuredDesc');
  const featuredPrice = document.getElementById('featuredPrice');
  const featuredAddBtn = document.getElementById('featuredAddBtn');

  miniCards.forEach(card => {
    card.addEventListener('click', () => {
      // Toggle active states
      miniCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Extract details
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = card.getAttribute('data-price');
      const img = card.getAttribute('data-img');
      const desc = card.getAttribute('data-desc');

      // Update Featured panel
      featuredTitle.textContent = name;
      featuredDesc.textContent = desc;
      featuredPrice.textContent = `$${parseFloat(price).toFixed(2)}`;
      
      featuredImg.style.transform = 'scale(0.8) rotate(-10deg)';
      featuredImg.style.opacity = '0';
      
      setTimeout(() => {
        featuredImg.src = img;
        featuredImg.style.transform = 'scale(1) rotate(0deg)';
        featuredImg.style.opacity = '1';
      }, 300);

      // Update CTA attributes
      featuredAddBtn.setAttribute('data-id', id);
      featuredAddBtn.setAttribute('data-name', name);
      featuredAddBtn.setAttribute('data-price', price);
      featuredAddBtn.setAttribute('data-img', img);
    });
  });


  // --- HERO THUMBNAIL INTERACTION ---
  const heroThumbs = document.querySelectorAll('.thumb-item');
  heroThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      // Highlight thumb
      heroThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      // Scroll smoothly to product collection grid
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Pre-select related mini card in product collections
      const targetId = thumb.getAttribute('data-target');
      let selectId = 'premium-ceremonial-matcha';
      if (targetId === 'whisk') selectId = 'barista-grade-matcha'; // map some variety
      if (targetId === 'mug') selectId = 'daily-culinary-matcha';

      const matchingMiniCard = document.querySelector(`.mini-product-card[data-id*="${targetId}"]`) || 
                               document.querySelector(`.mini-product-card[data-id="${selectId}"]`);
      if (matchingMiniCard) {
        setTimeout(() => {
          matchingMiniCard.click();
        }, 800);
      }
    });
  });


  // --- TESTIMONIAL SLIDER ---
  const testimonials = [
    {
      text: "“MATON has transformed my morning routine. The ceremonial grade is incredibly smooth, sweet, and brings an instant wave of calm focus to start my workday. No other brand matches this purity.”",
      author: "Clara Kensington",
      title: "Wellness Consultant, London"
    },
    {
      text: "“I've baked with a dozen matcha brands, but MATON's culinary grade retains a beautiful bright color and rich aroma even in hot ovens. It's truly ceremonial grade quality in kitchen bulk.”",
      author: "Chef Kaito Sato",
      title: "Pastry Head, Tokyo Bistro"
    },
    {
      text: "“The Starter Kit is the perfect gift. The ceramic mug is beautiful, and the whisk creates an incredible frothy micro-foam. I look forward to this ritual every single afternoon.”",
      author: "Dr. Marcus Vance",
      title: "Researcher & Author, Boston"
    }
  ];

  let currentSlide = 0;
  const testimonialTextEl = document.querySelector('.testimonial-text');
  const authorNameEl = document.querySelector('.author-name');
  const authorTitleEl = document.querySelector('.author-title');
  const testimonialsContainer = document.querySelector('.testimonials-container');

  function rotateTestimonials() {
    if (!testimonialTextEl) return;
    
    currentSlide = (currentSlide + 1) % testimonials.length;
    
    // Fade out
    testimonialTextEl.style.opacity = '0';
    testimonialTextEl.style.transform = 'translateY(10px)';
    authorNameEl.style.opacity = '0';
    authorTitleEl.style.opacity = '0';
    
    setTimeout(() => {
      // Update text
      const nextSlide = testimonials[currentSlide];
      testimonialTextEl.textContent = nextSlide.text;
      authorNameEl.textContent = nextSlide.author;
      authorTitleEl.textContent = nextSlide.title;
      
      // Fade in
      testimonialTextEl.style.opacity = '1';
      testimonialTextEl.style.transform = 'translateY(0)';
      authorNameEl.style.opacity = '1';
      authorTitleEl.style.opacity = '1';
    }, 600);
  }

  // Smooth style hooks for text animations
  if (testimonialTextEl) {
    testimonialTextEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    authorNameEl.style.transition = 'opacity 0.6s ease';
    authorTitleEl.style.transition = 'opacity 0.6s ease';
    // Auto-slide every 7 seconds
    setInterval(rotateTestimonials, 7000);
  }


  // --- INTERSECTION OBSERVER FOR SCROLL REVEALS ---
  const revealElements = document.querySelectorAll('.fade-in-up, .fade-in-scale');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully visible
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Initialize cart
  loadCart();
});
