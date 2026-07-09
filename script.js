// =====================================
// SOLARMAN Portfolio v2.0
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

    // ---------- SMOOTH SCROLL (all anchor links) ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80; // header height
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---------- HEADER SHADOW ON SCROLL ----------
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

    // ---------- SCROLL ANIMATIONS (Intersection Observer) ----------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.15
    });

    // Exclude hero and header from animation (hero is always visible)
    document.querySelectorAll('.card, .project, .testimonial, .about-grid, .contact-grid').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
    // Force hero to show immediately
    document.querySelector('.hero')?.classList.add('show');

    // ---------- BACK TO TOP BUTTON ----------
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
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project');

    if (filterBtns.length && projects.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;
                projects.forEach(project => {
                    if (filter === 'all' || project.dataset.category === filter) {
                        project.style.display = 'block';
                    } else {
                        project.style.display = 'none';
                    }
                });
            });
        });
    }

    // ---------- CONTACT FORM (basic validation + demo) ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Simple validation
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

    // ---------- RESET FORM BORDER ON INPUT ----------
    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(el => {
        el.addEventListener('input', function () {
            if (this.value.trim()) {
                this.style.borderColor = '';
            }
        });
    });

});
