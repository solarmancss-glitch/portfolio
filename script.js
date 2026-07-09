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