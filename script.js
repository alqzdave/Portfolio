// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background and text color on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const heroSection = document.querySelector('.hero');
    const heroHeight = heroSection.offsetHeight;
    
    if (window.scrollY > heroHeight - 100) {
        // On white sections - use classes instead of inline styles
        navLinks.forEach(link => {
            link.classList.add('dark-mode');
        });
    } else {
        // On home/hero section
        navLinks.forEach(link => {
            link.classList.remove('dark-mode');
        });
    }
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// 3D Carousel functionality
const cards = document.querySelectorAll('.carousel-card');
let currentIndex = 0;
const totalCards = cards.length;

function rotateCarousel() {
    cards.forEach((card, index) => {
        let position = (index - currentIndex + totalCards) % totalCards;
        card.setAttribute('data-pos', position);
    });
}

function nextCard() {
    currentIndex = (currentIndex + 1) % totalCards;
    rotateCarousel();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    rotateCarousel();
}

// Auto-rotate carousel
setInterval(nextCard, 3000);

// Click on cards to center them
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        currentIndex = index;
        rotateCarousel();
    });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}
