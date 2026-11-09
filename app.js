
"use strict";

/* =====================================
   I MARKETPLACES MARKET PLACE
   Main JavaScript
===================================== */

const products = [
  {
    id: 1,
    name: "Minimal Brand Kit",
    category: "templates",
    label: "Templates",
    price: 590,
    description: "A polished starter identity for your next idea.",
    symbol: "✳",
    tone: "purple"
  },
  {
    id: 2,
    name: "The Focus Workbook",
    category: "ebooks",
    label: "E-books",
    price: 350,
    description: "A practical guide to planning focused work.",
    symbol: "▤",
    tone: "blue"
  },
  {
    id: 3,
    name: "Creator Social Pack",
    category: "creative",
    label: "Creative assets",
    price: 450,
    description: "Editable social graphics for fresh content.",
    symbol: "✦",
    tone: "orange"
  },
  {
    id: 4,
    name: "Productivity Planner",
    category: "templates",
    label: "Templates",
    price: 290,
    description: "Organise projects, goals and daily priorities.",
    symbol: "▦",
    tone: "green"
  },
  {
    id: 5,
    name: "Design Resource Bundle",
    category: "creative",
    label: "Creative assets",
    price: 790,
    description: "A versatile collection for creative projects.",
    symbol: "✺",
    tone: "pink"
  },
  {
    id: 6,
    name: "Smart Work Toolkit",
    category: "software",
    label: "Software & tools",
    price: 990,
    description: "A useful toolkit for your digital workflow.",
    symbol: "⌘",
    tone: "gold"
  },
  {
    id: 7,
    name: "Small Business Guide",
    category: "ebooks",
    label: "E-books",
    price: 420,
    description: "Helpful reading for starting a small business.",
    symbol: "▧",
    tone: "orange"
  },
  {
    id: 8,
    name: "Presentation Template Set",
    category: "templates",
    label: "Templates",
    price: 520,
    description: "Clean presentation layouts for your next pitch.",
    symbol: "▣",
    tone: "blue"
  }
];

/* =====================================
   ELEMENTS
===================================== */

const grid = document.getElementById("productGrid");
const search = document.getElementById("productSearch");
const filter = document.getElementById("categoryFilter");
const toast = document.getElementById("toast");

const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const drawerScrim = document.getElementById("drawerScrim");

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("imp_cart") || "[]");

  if (!Array.isArray(cart)) {
    cart = [];
  }
} catch (error) {
  cart = [];
}

/* =====================================
   CURRENCY
===================================== */

function money(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD");
}

/* =====================================
   PRODUCT DISPLAY
===================================== */

function renderProducts() {
  if (!grid) return;

  const term = search.value.trim().toLowerCase();
  const category = filter.value;

  const filteredProducts = products.filter(product => {

    const matchesCategory =
      category === "all" ||
      product.category === category;

    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <p class="no-results">
        No products found. Try another search.
      </p>
    `;
    return;
  }

  grid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">

      <div class="product-art ${product.tone}">
        <span>${product.symbol}</span>
      </div>

      <div class="product-info">

        <span class="product-category">
          ${product.label}
        </span>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div class="product-bottom">

          <strong class="product-price">
            ${money(product.price)}
          </strong>

          <button
            class="add-button"
            data-add="${product.id}"
            type="button"
          >
            + Add to cart
          </button>

        </div>
      </div>

    </article>
  `).join("");
}

/* =====================================
   SAVE CART
===================================== */

function saveCart() {

  try {
    localStorage.setItem(
      "imp_cart",
      JSON.stringify(cart)
    );
  } catch (error) {
    showToast("Unable to save cart in this browser.");
  }

  renderCart();
}

/* =====================================
   ADD TO CART
===================================== */

function addToCart(productId) {

  const product = products.find(
    item => item.id === Number(productId)
  );

  if (!product) return;

  const existingItem = cart.find(
    item => item.id === product.id
  );

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    });
  }

  saveCart();

  showToast("Product added to your cart!");
}

/* =====================================
   REMOVE FROM CART
===================================== */

function removeFromCart(productId) {

  cart = cart.filter(
    item => item.id !== Number(productId)
  );

  saveCart();

  showToast("Product removed.");
}

/* =====================================
   CART DISPLAY
===================================== */

function renderCart() {

  const validCart = cart.filter(item =>
    item &&
    Number.isFinite(Number(item.id)) &&
    Number.isFinite(Number(item.price)) &&
    Number(item.qty) > 0
  );

  cart = validCart;

  const totalQuantity = cart.reduce(
    (sum, item) => sum + Number(item.qty),
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.qty),
    0
  );

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = money(totalPrice);

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty. Find something useful!
      </p>
    `;

    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-row">

      <div>
        <b>${item.name}</b>

        <small>
          ${item.qty} × ${money(item.price)}
        </small>
      </div>

      <div>
        <b>${money(item.price * item.qty)}</b>

        <br>

        <button
          class="remove-item"
          data-remove="${item.id}"
          type="button"
        >
          Remove
        </button>
      </div>

    </div>
  `).join("");
}

/* =====================================
   CART OPEN / CLOSE
===================================== */

function openCart() {

  cartDrawer.classList.add("open");

  cartDrawer.setAttribute(
    "aria-hidden",
    "false"
  );

  drawerScrim.classList.add("show");
}

function closeCart() {

  cartDrawer.classList.remove("open");

  cartDrawer.setAttribute(
    "aria-hidden",
    "true"
  );

  drawerScrim.classList.remove("show");
}

/* =====================================
   NOTIFICATION
===================================== */

let toastTimeout;

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =====================================
   PRODUCT BUTTON EVENTS
===================================== */

grid.addEventListener("click", function(event) {

  const button = event.target.closest("[data-add]");

  if (!button) return;

  addToCart(button.dataset.add);

});

/* =====================================
   CART BUTTON EVENTS
===================================== */

cartItems.addEventListener("click", function(event) {

  const button = event.target.closest("[data-remove]");

  if (!button) return;

  removeFromCart(button.dataset.remove);

});

document
  .getElementById("cartButton")
  .addEventListener("click", openCart);

document
  .getElementById("closeCart")
  .addEventListener("click", closeCart);

drawerScrim.addEventListener(
  "click",
  closeCart
);

/* =====================================
   CHECKOUT
===================================== */

document
  .getElementById("checkoutButton")
  .addEventListener("click", function() {

    if (cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    showToast(
      "Checkout will be connected to the secure backend."
    );

  });

/* =====================================
   SEARCH
===================================== */

search.addEventListener(
  "input",
  renderProducts
);

/* =====================================
   CATEGORY FILTER
===================================== */

filter.addEventListener(
  "change",
  renderProducts
);

document
  .querySelectorAll("[data-filter]")
  .forEach(link => {

    link.addEventListener("click", function() {

      filter.value = this.dataset.filter;

      renderProducts();

    });

  });

/* =====================================
   MOBILE NAVIGATION
===================================== */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", function() {

  const isOpen = mainNav.classList.toggle("open");

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  menuToggle.textContent = isOpen ? "×" : "☰";

});

mainNav.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", function() {

    mainNav.classList.remove("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.textContent = "☰";

  });

});

/* =====================================
   NEWSLETTER
===================================== */

document
  .getElementById("newsletterForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    showToast(
      "Thank you! Newsletter service will be connected later."
    );

    this.reset();

  });

/* =====================================
   FOOTER YEAR
===================================== */

document.getElementById("year").textContent =
  new Date().getFullYear();

/* =====================================
   INITIALIZE WEBSITE
===================================== */

renderProducts();
renderCart();

console.log(
  "I marketplaces market place initialized successfully."
);
