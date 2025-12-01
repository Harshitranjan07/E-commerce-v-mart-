// ---- Sample product data ----
const products = [
  { id: 1, title: "Classic White Tee", price: 399, desc: "Comfort cotton t-shirt" },
  { id: 2, title: "Blue Denim Jeans", price: 1299, desc: "Slim fit" },
  { id: 3, title: "Sneaker Run", price: 2499, desc: "Lightweight runners" },
  { id: 4, title: "Leather Wallet", price: 799, desc: "Bifold, premium" },
  { id: 5, title: "Sports Cap", price: 299, desc: "Breathable" },
  { id: 6, title: "Backpack 20L", price: 1499, desc: "Water-resistant" }
];

// ---- Cart state ----
const CART_KEY = 'eshop_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

const formatINR = n => '₹' + Number(n).toLocaleString('en-IN');

// ---- DOM refs ----
const productGrid = document.getElementById('productGrid');
const tpl = document.getElementById('productTpl');
const cartList = document.getElementById('cartList');
const subtotalEl = document.getElementById('subtotal');
const cartCountEl = document.getElementById('cartCount');
const searchInput = document.getElementById('search');
const sortSel = document.getElementById('sort');

// ---- Render products ----
function renderProducts(list) {
  productGrid.innerHTML = '';
  list.forEach(p => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.title').textContent = p.title;
    node.querySelector('.desc').textContent = p.desc;
    node.querySelector('.price').textContent = formatINR(p.price);
    node.querySelector('.img').textContent = p.title.split(' ')[0];
    node.querySelector('.addBtn').addEventListener('click', () => addToCart(p.id));
    productGrid.appendChild(node);
  });
}

// ---- Cart functions ----
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  flashCount();
}

function setQty(id, qty) {
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart();
}

function clearCart() {
  cart = {};
  saveCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
}

// ---- Render cart UI ----
function renderCart() {
  cartList.innerHTML = '';
  const ids = Object.keys(cart).map(Number);
  let total = 0;
  if (ids.length === 0) {
    cartList.innerHTML = '<div class="small">Your cart is empty.</div>';
  }
  ids.forEach(id => {
    const prod = products.find(p => p.id === id);
    const qty = cart[id];
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div class="cart-thumb">${prod.title.split(' ')[0]}</div>
      <div style="flex:1">
        <div style="font-weight:600">${prod.title}</div>
        <div class="small">${formatINR(prod.price)} x ${qty} = ${formatINR(prod.price * qty)}</div>
      </div>
    `;
    const controls = document.createElement('div');
    controls.innerHTML = `
      <div class="qty">
        <button data-id="${id}" class="dec">-</button>
        <div style="padding:.4rem .6rem">${qty}</div>
        <button data-id="${id}" class="inc">+</button>
      </div>
      <div style="margin-left:.5rem"><button data-id="${id}" class="small remove">✕</button></div>
    `;
    item.appendChild(controls);
    cartList.appendChild(item);

    controls.querySelector('.inc').addEventListener('click', () => setQty(id, cart[id] + 1));
    controls.querySelector('.dec').addEventListener('click', () => setQty(id, cart[id] - 1));
    controls.querySelector('.remove').addEventListener('click', () => removeItem(id));

    total += prod.price * qty;
  });
  subtotalEl.textContent = 'Subtotal: ' + formatINR(total);
  cartCountEl.textContent = ids.reduce((s, i) => s + cart[i], 0);
}

function flashCount() {
  cartCountEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 300 });
}

// ---- Search & Sort ----
function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  const s = sortSel.value;
  if (s === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
  if (s === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
  return list;
}

searchInput.addEventListener('input', () => renderProducts(getFiltered()));
sortSel.addEventListener('change', () => renderProducts(getFiltered()));

// ---- Checkout ----
function checkout() {
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    alert('Cart is empty');
    return;
  }
  const total = ids.reduce((s, id) => {
    const p = products.find(x => x.id == id);
    return s + p.price * cart[id];
  }, 0);
  const name = prompt(`Checkout — total ${formatINR(total)}\nEnter your name:`);
  if (name) {
    alert('Thanks ' + name + '! Order placed for ' + formatINR(total));
    clearCart();
  }
}

// ---- Event listeners ----
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear the cart?')) clearCart();
});
document.getElementById('checkoutBtn').addEventListener('click', checkout);
document.getElementById('checkoutAside').addEventListener('click', checkout);

// ---- Init ----
renderProducts(products);
renderCart();