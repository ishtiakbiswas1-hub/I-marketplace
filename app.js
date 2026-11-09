const products = [
  {id:1,name:"Minimal Brand Kit",category:"templates",label:"Templates",price:590,description:"A polished starter identity for your next idea.",symbol:"✳",tone:"purple"},
  {id:2,name:"The Focus Workbook",category:"ebooks",label:"E-books",price:350,description:"A practical guide to planning focused work.",symbol:"▤",tone:"blue"},
  {id:3,name:"Creator Social Pack",category:"creative",label:"Creative assets",price:450,description:"Editable social graphics for fresh content.",symbol:"✦",tone:"orange"},
  {id:4,name:"Productivity Planner",category:"templates",label:"Templates",price:290,description:"Organise projects, goals and daily priorities.",symbol:"▦",tone:"green"},
  {id:5,name:"Design Resource Bundle",category:"creative",label:"Creative assets",price:790,description:"A versatile collection for creative projects.",symbol:"✺",tone:"pink"},
  {id:6,name:"Smart Work Toolkit",category:"software",label:"Software & tools",price:990,description:"A sample toolkit listing for your digital shop.",symbol:"⌘",tone:"gold"},
  {id:7,name:"Small Business Guide",category:"ebooks",label:"E-books",price:420,description:"Helpful reading for starting a small business.",symbol:"▧",tone:"orange"},
  {id:8,name:"Presentation Template Set",category:"templates",label:"Templates",price:520,description:"Clean presentation layouts for your next pitch.",symbol:"▣",tone:"blue"}
];
const money = n => "৳" + Number(n).toLocaleString("en-BD");
let cart = JSON.parse(localStorage.getItem("imp_cart") || "[]");
const grid = document.getElementById("productGrid");
const search = document.getElementById("productSearch");
const filter = document.getElementById("categoryFilter");
const toast = document.getElementById("toast");

function renderProducts(){
  const term = (search?.value || "").trim().toLowerCase();
  const category = filter?.value || "all";
  const shown = products.filter(p => (category === "all" || p.category === category) && (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)));
  grid.innerHTML = shown.length ? shown.map(p => `
    <article class="product-card">
      <div class="product-art ${p.tone}"><span>${p.symbol}</span></div>
      <div class="product-info"><span class="product-category">${p.label}</span><h3>${p.name}</h3>
      <p>${p.description}</p><div class="product-bottom"><strong class="product-price">${money(p.price)}</strong>
      <button class="add-button" data-add="${p.id}">+ Add to cart</button></div></div>
    </article>`).join("") : '<p class="no-results">No products found. Try another search.</p>';
}
function saveCart(){localStorage.setItem("imp_cart",JSON.stringify(cart));renderCart();}
function notify(message){toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200);}
function renderCart(){
  document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  const holder=document.getElementById("cartItems");
  if(!cart.length){holder.innerHTML='<p class="empty-cart">Your cart is empty. Find something useful!</p>';}
  else holder.innerHTML=cart.map(item=>`<div class="cart-row"><div><b>${item.name}</b><small>${item.qty} × ${money(item.price)}</small></div><div><b>${money(item.qty*item.price)}</b><br><button class="remove-item" data-remove="${item.id}">Remove</button></div></div>`).join("");
  document.getElementById("cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));
}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","false");document.getElementById("drawerScrim").classList.add("show");}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","true");document.getElementById("drawerScrim").classList.remove("show");}
grid.addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(!btn)return;const p=products.find(x=>x.id===Number(btn.dataset.add));const existing=cart.find(x=>x.id===p.id);if(existing)existing.qty++;else cart.push({...p,qty:1});saveCart();notify("Added to your cart");});
document.getElementById("cartItems").addEventListener("click",e=>{const btn=e.target.closest("[data-remove]");if(!btn)return;cart=cart.filter(x=>x.id!==Number(btn.dataset.remove));saveCart();});
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("drawerScrim").addEventListener("click",closeCart);
document.getElementById("checkoutButton").addEventListener("click",()=>notify("Checkout will be enabled after backend setup."));
search.addEventListener("input",renderProducts);filter.addEventListener("change",renderProducts);
document.querySelectorAll("[data-filter]").forEach(a=>a.addEventListener("click",()=>{filter.value=a.dataset.filter;renderProducts();}));
document.getElementById("menuToggle").addEventListener("click",()=>{const nav=document.getElementById("mainNav");nav.classList.toggle("open");document.getElementById("menuToggle").setAttribute("aria-expanded",nav.classList.contains("open")?"true":"false");});
document.getElementById("newsletterForm").addEventListener("submit",e=>{e.preventDefault();notify("Thanks! Newsletter signup will be connected in a later step.");e.target.reset();});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();
