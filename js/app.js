/**
 * PrimePicks Store - Main Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentCategory = "all";
  let searchQuery = "";
  let sortBy = "default";
  let cart = JSON.parse(localStorage.getItem("primepicks_cart")) || [];
  let appliedCoupon = null;

  // DOM Elements
  const productsGrid = document.getElementById("products-grid");
  const categoryPillsContainer = document.getElementById("category-pills");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const productsCountEl = document.getElementById("products-count");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const cartBtn = document.getElementById("cart-btn");
  const cartBadge = document.getElementById("cart-badge");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartDiscountRow = document.getElementById("cart-discount-row");
  const cartDiscountEl = document.getElementById("cart-discount");
  const cartTotalEl = document.getElementById("cart-total");
  const couponInput = document.getElementById("coupon-input");
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Quick View Modal Elements
  const quickViewModal = document.getElementById("quick-view-modal");
  const closeQuickViewBtn = document.getElementById("close-quick-view-btn");
  const modalImg = document.getElementById("modal-img");
  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalRating = document.getElementById("modal-rating");
  const modalReviews = document.getElementById("modal-reviews");
  const modalPrice = document.getElementById("modal-price");
  const modalOldPrice = document.getElementById("modal-old-price");
  const modalDesc = document.getElementById("modal-desc");
  const modalSpecs = document.getElementById("modal-specs");
  const modalAddToCartBtn = document.getElementById("modal-add-to-cart-btn");

  // Checkout Success Modal
  const checkoutSuccessModal = document.getElementById("checkout-success-modal");
  const closeSuccessModalBtn = document.getElementById("close-success-modal-btn");

  // Toast Container
  const toastContainer = document.getElementById("toast-container");

  // Format Currency (BRL)
  const formatMoney = (val) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  /* ==========================================================================
     Theme Management (Dark / Light)
     ========================================================================== */
  const savedTheme = localStorage.getItem("primepicks_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("primepicks_theme", newTheme);
    updateThemeIcon(newTheme);
    showToast(newTheme === "dark" ? "🌙 Modo escuro ativado" : "☀️ Modo claro ativado");
  });

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      themeIcon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
    } else {
      themeIcon.innerHTML = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`;
    }
  }

  /* ==========================================================================
     Category Pills Render
     ========================================================================== */
  function renderCategories() {
    categoryPillsContainer.innerHTML = CATEGORIES.map((cat) => `
      <button class="category-pill ${cat.id === currentCategory ? "active" : ""}" data-category="${cat.id}">
        ${cat.name}
      </button>
    `).join("");

    categoryPillsContainer.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCategory = btn.getAttribute("data-category");
        categoryPillsContainer.querySelectorAll(".category-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts();
      });
    });
  }

  /* ==========================================================================
     Product Rendering & Filtering
     ========================================================================== */
  function renderProducts() {
    let filtered = PRODUCTS_DATA.filter((p) => {
      const matchCategory = currentCategory === "all" || p.category === currentCategory;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    // Sorting
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    productsCountEl.textContent = `${filtered.length} produtos encontrados`;

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>Nenhum produto encontrado</h3>
          <p style="color: var(--text-muted);">Tente buscar por outro termo ou mudar de categoria.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map((product) => `
      <div class="product-card" data-id="${product.id}">
        <div class="card-image-wrap">
          <span class="card-badge ${product.badgeType}">${product.badge}</span>
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          <button class="quick-view-btn" data-id="${product.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Espiar
          </button>
        </div>
        <div class="product-card-body">
          <span class="card-category">${product.categoryName}</span>
          <h3 class="card-title">${product.title}</h3>
          <div class="card-rating">
            <div class="stars">★★★★★</div>
            <span><strong>${product.rating}</strong></span>
            <span class="reviews-num">(${product.reviewsCount})</span>
          </div>
          <div class="card-footer-info">
            <div class="price-box">
              <span class="price-old">${formatMoney(product.oldPrice)}</span>
              <span class="price-current">${formatMoney(product.price)}</span>
            </div>
            <button class="add-cart-btn" data-id="${product.id}" title="Adicionar ao carrinho">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    // Attach card action listeners
    productsGrid.querySelectorAll(".add-cart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-id"));
        addToCart(id);
      });
    });

    productsGrid.querySelectorAll(".quick-view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-id"));
        openQuickView(id);
      });
    });
  }

  /* ==========================================================================
     Cart Management
     ========================================================================== */
  function saveCart() {
    localStorage.setItem("primepicks_cart", JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(productId, quantity = 1) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    saveCart();
    showToast(`🛒 "${product.title}" adicionado ao carrinho!`);
  }

  function updateQuantity(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== productId);
    }
    saveCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart();
    showToast("Item removido do carrinho.");
  }

  function updateCartUI() {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.textContent = totalCount;
    cartBadge.style.display = totalCount > 0 ? "flex" : "none";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h4>Seu carrinho está vazio</h4>
          <p>Aproveite nossas ofertas exclusivas para adicionar produtos.</p>
        </div>
      `;
      cartSubtotalEl.textContent = formatMoney(0);
      cartDiscountRow.style.display = "none";
      cartTotalEl.textContent = formatMoney(0);
      return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <button class="remove-item-btn" data-id="${item.id}" title="Remover item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
          <div class="qty-control">
            <button class="qty-btn minus-btn" data-id="${item.id}">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `).join("");

    cartItemsContainer.querySelectorAll(".minus-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateQuantity(parseInt(btn.getAttribute("data-id")), -1));
    });

    cartItemsContainer.querySelectorAll(".plus-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateQuantity(parseInt(btn.getAttribute("data-id")), 1));
    });

    cartItemsContainer.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(parseInt(btn.getAttribute("data-id"))));
    });

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon === "PRIME10") {
      discount = subtotal * 0.1;
      cartDiscountRow.style.display = "flex";
      cartDiscountEl.textContent = `- ${formatMoney(discount)}`;
    } else {
      cartDiscountRow.style.display = "none";
    }

    const total = Math.max(0, subtotal - discount);
    cartSubtotalEl.textContent = formatMoney(subtotal);
    cartTotalEl.textContent = formatMoney(total);
  }

  // Cart Drawer open/close
  function openCart() {
    cartOverlay.classList.add("active");
    cartDrawer.classList.add("active");
  }

  function closeCart() {
    cartOverlay.classList.remove("active");
    cartDrawer.classList.remove("active");
  }

  cartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Apply Coupon
  applyCouponBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    if (code === "PRIME10") {
      appliedCoupon = "PRIME10";
      showToast("🎉 Cupom PRIME10 de 10% aplicado!");
      updateCartUI();
    } else if (code) {
      showToast("❌ Cupom inválido. Tente PRIME10");
    }
  });

  // Checkout
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Adicione produtos antes de finalizar!");
      return;
    }
    closeCart();
    checkoutSuccessModal.classList.add("active");
    cart = [];
    appliedCoupon = null;
    saveCart();
  });

  closeSuccessModalBtn.addEventListener("click", () => {
    checkoutSuccessModal.classList.remove("active");
  });

  /* ==========================================================================
     Quick View Modal
     ========================================================================== */
  let activeModalProductId = null;

  function openQuickView(productId) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    activeModalProductId = productId;
    modalImg.src = product.image;
    modalImg.alt = product.title;
    modalCategory.textContent = product.categoryName;
    modalTitle.textContent = product.title;
    modalRating.textContent = product.rating;
    modalReviews.textContent = `(${product.reviewsCount} avaliações)`;
    modalPrice.textContent = formatMoney(product.price);
    modalOldPrice.textContent = formatMoney(product.oldPrice);
    modalDesc.textContent = product.description;

    modalSpecs.innerHTML = product.specs.map((s) => `
      <div class="spec-badge">✓ ${s}</div>
    `).join("");

    quickViewModal.classList.add("active");
  }

  function closeQuickView() {
    quickViewModal.classList.remove("active");
  }

  closeQuickViewBtn.addEventListener("click", closeQuickView);
  quickViewModal.addEventListener("click", (e) => {
    if (e.target === quickViewModal) closeQuickView();
  });

  modalAddToCartBtn.addEventListener("click", () => {
    if (activeModalProductId) {
      addToCart(activeModalProductId);
      closeQuickView();
    }
  });

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ==========================================================================
     Search & Sort Listeners
     ========================================================================== */
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderProducts();
  });

  /* ==========================================================================
     Deals Countdown Timer Simulation
     ========================================================================== */
  let hours = 14, minutes = 22, seconds = 45;
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  setInterval(() => {
    if (seconds > 0) {
      seconds--;
    } else {
      seconds = 59;
      if (minutes > 0) {
        minutes--;
      } else {
        minutes = 59;
        if (hours > 0) hours--;
      }
    }
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }, 1000);

  /* ==========================================================================
     FAQ Accordion
     ========================================================================== */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      item.classList.toggle("active");
    });
  });

  /* ==========================================================================
     Initial Render
     ========================================================================== */
  renderCategories();
  renderProducts();
  updateCartUI();
});
