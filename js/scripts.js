// =====================================
// SOLARMAN Portfolio v3.0
// script.js
// =====================================

document.addEventListener('DOMContentLoaded', function () {

    // ---------- HAMBURGER MENU ----------
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ---------- SMOOTH SCROLL ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---------- HEADER SHADOW ----------
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 15px rgba(0,0,0,.08)';
        }
    });

    // ---------- ACTIVE NAV LINK ----------
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);

    // ---------- SCROLL ANIMATIONS ----------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.15
    });

    document.querySelectorAll('.card, .project, .testimonial, .about-grid, .contact-grid, .product-card').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
    document.querySelector('.hero')?.classList.add('show');

    // ---------- BACK TO TOP ----------
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- PROJECT FILTER ----------
    const filterBtns = document.querySelectorAll('.filter-btn:not(.product-filters .filter-btn)');
    const projects = document.querySelectorAll('.project');

    if (filterBtns.length && projects.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                projects.forEach(project => {
                    project.style.display = (filter === 'all' || project.dataset.category === filter) ? 'block' : 'none';
                });
            });
        });
    }

    // ---------- CONTACT FORM ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let valid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = '#e74c3c';
                } else {
                    input.style.borderColor = '';
                }
            });
            if (valid) {
                alert('Thank you for your message! I will get back to you soon.');
                this.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }

    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(el => {
        el.addEventListener('input', function () {
            if (this.value.trim()) {
                this.style.borderColor = '';
            }
        });
    });

    // ========== PRODUCTS / SHOP ==========
    let allProducts = [];

    function cleanFilename(name) {
        if (!name) return '';
        let cleaned = name.replace(/\s*\([^)]*\)/g, '');
        cleaned = cleaned.replace(/[^a-zA-Z0-9\s\-\.]/g, '');
        cleaned = cleaned.trim().replace(/\s+/g, '-');
        cleaned = cleaned.replace(/-+/g, '-');
        return cleaned.toLowerCase();
    }

    function getImageUrl(product) {
        if (product.Image && product.Image.trim() !== '') {
            return product.Image;
        }
        const cleaned = cleanFilename(product.Name);
        return `images/products/${cleaned}.jpg`;
    }

    function getDatasheetUrl(product) {
        const cleaned = cleanFilename(product.Name);
        return `images/products/dat-${cleaned}.jpg`;
    }

    async function loadProducts() {
        try {
            const url = 'inventory.json?t=' + Date.now();
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            allProducts = data.filter(item => item.Sale > 0);
            renderProducts('all');
        } catch (err) {
            console.warn('Could not load products:', err);
            document.getElementById('productGrid').innerHTML =
                `<p style="text-align:center; color:#888; padding:40px;">⚠️ Products are currently unavailable.</p>`;
        }
    }

    function renderProducts(filter) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        let items = allProducts;
        if (filter !== 'all') {
            items = allProducts.filter(p => (p.Category || '').toLowerCase().includes(filter));
        }
        if (items.length === 0) {
            grid.innerHTML = `<p style="text-align:center; color:#888; padding:40px;">No products found in this category.</p>`;
            return;
        }
        let html = '';
        items.forEach((item, index) => {
            const cat = (item.Category || '').toLowerCase();
            const catColor = { 'inverter': '#0057B8', 'battery': '#28a745', 'distribution box': '#F7931E' }[cat] || '#0057B8';
            const catIcon = { 'inverter': 'fa-microchip', 'battery': 'fa-battery-full', 'distribution box': 'fa-box' }[cat] || 'fa-box';
            const imagePath = getImageUrl(item);
            const datasheetPath = getDatasheetUrl(item);
            let specs = [];
            if (item.Watt && item.Watt > 0) specs.push(`${item.Watt}W`);
            if (item.Technology && item.Technology.trim() !== '') specs.push(item.Technology);
            if (item.Qty !== undefined) specs.push(`Stock: ${item.Qty}`);
            const specStr = specs.join(' • ');

            html += `
                <div class="product-card" data-category="${cat}">
                    <div class="product-image-wrapper" style="background: ${catColor}20;">
                        <img class="product-image" src="${imagePath}" alt="${item.Name}" loading="lazy"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'no-image\\' style=\\'background:${catColor};\\'><i class=\\'fas ${catIcon}\\'></i>${item.Name.substring(0,30)}</div>'">
                    </div>
                    <div class="product-body">
                        <div class="product-category">${item.Category}</div>
                        <div class="product-name">${item.Name}</div>
                        <div class="product-price">PKR ${item.Sale.toLocaleString()}</div>
                        <div class="product-specs"><span>${specStr}</span></div>
                        <div class="action-buttons">
                            <button class="btn-action btn-datasheet" onclick="openDatasheet('${datasheetPath}', '${item.Name}')">
                                <i class="fas fa-file-pdf"></i> Details
                            </button>
                            <a href="https://wa.me/923149233105?text=I'm%20interested%20in%20${encodeURIComponent(item.Name)}%20(PKR%20${item.Sale.toLocaleString()})" 
                               target="_blank" class="btn-action btn-buynow">
                                <i class="fas fa-shopping-cart"></i> Buy Now
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    function openDatasheet(imagePath, productName) {
        const modal = document.getElementById('productModal');
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <span class="modal-category">📄 Datasheet</span>
            <h2>${productName}</h2>
            <img src="${imagePath}" alt="Datasheet for ${productName}"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'text-align:center; padding:40px; color:#888;\\'>⚠️ Datasheet not available for ${productName}</p>'">
            <a href="${imagePath}" target="_blank" class="btn-whatsapp-modal" style="background:#0057B8;">
                <i class="fas fa-external-link-alt"></i> Open Full Size
            </a>
            <button onclick="closeModal()" class="btn-whatsapp-modal" style="background:#6c757d; margin-left:10px;">
                Close
            </button>
        `;
        modal.classList.add('show');
    }

    function closeModal() {
        document.getElementById('productModal').classList.remove('show');
    }

    document.getElementById('productModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    document.querySelectorAll('#productFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#productFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.filter);
        });
    });

    // Load products when page loads
    loadProducts();
});