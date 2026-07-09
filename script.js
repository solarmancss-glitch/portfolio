// =====================================
// SOLARMAN Portfolio v1
// script.js
// =====================================

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {

        if (this.hash !== "") {
            e.preventDefault();

            const target = document.querySelector(this.hash);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }

    });
});


// Change header shadow on scroll

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.15)";

    } else {

        header.style.boxShadow = "0 2px 15px rgba(0,0,0,.08)";

    }

});


// Highlight active navigation link

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        if (pageYOffset >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});


// Simple fade-in animation

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll(".card, .project, section").forEach(el => {

    el.classList.add("hidden");

    observer.observe(el);

});
// ========== PRODUCTS SECTION ==========
let allProducts = [];

// Load inventory and render products
async function loadProducts() {
    try {
        const url = 'inventory.json?t=' + Date.now();
        const response = await fetch(url);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        // Filter only items with sale > 0 (in stock)
        allProducts = data.filter(item => item.Sale > 0);
        renderProducts('all');
    } catch (err) {
        console.warn('Could not load products from inventory.json:', err);
        document.getElementById('productGrid').innerHTML = 
            `<p style="text-align:center; color:#888; padding:40px;">⚠️ Products are currently unavailable. Please try again later.</p>`;
    }
}

function renderProducts(filter) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    let items = allProducts;
    if (filter !== 'all') {
        items = allProducts.filter(p => p.Category.toLowerCase().includes(filter));
    }
    if (items.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:#888; padding:40px;">No products found in this category.</p>`;
        return;
    }
    let html = '';
    items.forEach(item => {
        // Use a placeholder image – you can replace with actual image URL if you add an "Image" field
        const imageUrl = item.Image || `https://via.placeholder.com/400x200/0057B8/FFFFFF?text=${encodeURIComponent(item.Name.substring(0,20))}`;
        // Build specs
        let specs = [];
        if (item.Watt && item.Watt > 0) specs.push(`${item.Watt}W`);
        if (item.Technology && item.Technology.trim() !== '') specs.push(item.Technology);
        if (item.Qty !== undefined) specs.push(`Stock: ${item.Qty}`);
        const specStr = specs.join(' • ');
        html += `
            <div class="product-card" data-category="${item.Category.toLowerCase()}">
                <img class="product-image" src="${imageUrl}" alt="${item.Name}" loading="lazy" />
                <div class="product-body">
                    <div class="product-category">${item.Category}</div>
                    <div class="product-name">${item.Name}</div>
                    <div class="product-price">PKR ${item.Sale.toLocaleString()}</div>
                    <div class="product-specs"><span>${specStr}</span></div>
                    <button class="btn-detail" onclick="openModal(${items.indexOf(item)})">View Details</button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function openModal(index) {
    const item = allProducts[index];
    if (!item) return;
    const modal = document.getElementById('productModal');
    const body = document.getElementById('modalBody');
    const imageUrl = item.Image || `https://via.placeholder.com/600x300/0057B8/FFFFFF?text=${encodeURIComponent(item.Name.substring(0,30))}`;
    let specs = [];
    if (item.Watt && item.Watt > 0) specs.push(`<strong>Wattage:</strong> ${item.Watt}W`);
    if (item.Technology && item.Technology.trim() !== '') specs.push(`<strong>Technology:</strong> ${item.Technology}`);
    if (item.Purchase) specs.push(`<strong>Cost Price:</strong> PKR ${item.Purchase.toLocaleString()}`);
    if (item.Qty !== undefined) specs.push(`<strong>Stock:</strong> ${item.Qty} units`);
    const specHtml = specs.map(s => `<p>${s}</p>`).join('');

    body.innerHTML = `
        <img src="${imageUrl}" alt="${item.Name}" />
        <span class="modal-category">${item.Category}</span>
        <h2>${item.Name}</h2>
        <div class="modal-price">PKR ${item.Sale.toLocaleString()}</div>
        <div class="modal-specs">${specHtml}</div>
        <a href="https://wa.me/923149233105?text=I'm%20interested%20in%20${encodeURIComponent(item.Name)}%20(PKR%20${item.Sale.toLocaleString()})" 
           target="_blank" class="btn-whatsapp-modal">
            <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
        </a>
    `;
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('show');
}

// Click outside modal to close
document.getElementById('productModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Product filter buttons
document.querySelectorAll('#productFilters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#productFilters .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        renderProducts(filter);
    });
});

// Call loadProducts when page loads (after existing DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    loadProducts();
});
