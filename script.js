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

// Observe all sections except filmography (keeps its dark bg solid)
document.querySelectorAll('.section:not(.filmography)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// 3D Carousel
const cards = Array.from(document.querySelectorAll('.carousel-card'));
const totalCards = cards.length;
let currentIndex = 0;
let autoRotateTimer = null;

const positions = [
    { x: '-50%', y: '-60%', tx: '0px',    scale: 1,    z: 5, opacity: 1    },  // center
    { x: '-50%', y: '-60%', tx: '360px',  scale: 0.82, z: 4, opacity: 0.85 },  // right 1
    { x: '-50%', y: '-60%', tx: '620px',  scale: 0.65, z: 3, opacity: 0.6  },  // right 2
    { x: '-50%', y: '-60%', tx: '-620px', scale: 0.65, z: 3, opacity: 0.6  },  // left 2
    { x: '-50%', y: '-60%', tx: '-360px', scale: 0.82, z: 4, opacity: 0.85 },  // left 1
];

let hoveredCard = null;
let modalOpen = false;

function applyPositions() {
    cards.forEach((card, i) => {
        const pos = (i - currentIndex + totalCards) % totalCards;
        const p = positions[pos];
        const liftY = (card === hoveredCard && pos === 0) ? -32 : 0;
        const shadowSize = (card === hoveredCard && pos === 0) ? '0 40px 90px rgba(0,0,0,0.45)' : '0 20px 60px rgba(0,0,0,0.25)';
        card.style.transform = `translate(${p.x}, ${p.y}) translateX(${p.tx}) translateY(${liftY}px) scale(${p.scale})`;
        card.style.zIndex = p.z;
        card.style.opacity = p.opacity;
        card.style.boxShadow = shadowSize;
        if (pos === 0) {
            card.classList.add('is-center');
        } else {
            card.classList.remove('is-center');
            if (card === hoveredCard) hoveredCard = null;
        }
    });
}

// Initial render
applyPositions();

// Auto-rotate
autoRotateTimer = setInterval(() => {
    cards.forEach(c => c.classList.remove('flipped'));
    currentIndex = (currentIndex + 1) % totalCards;
    applyPositions();
}, 2300);
cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
        if (card.classList.contains('is-center')) {
            hoveredCard = card;
            applyPositions();
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    });
    card.addEventListener('mouseleave', () => {
        hoveredCard = null;
        applyPositions();
        if (!autoRotateTimer && !modalOpen) {
            autoRotateTimer = setInterval(() => {
                cards.forEach(c => c.classList.remove('flipped'));
                currentIndex = (currentIndex + 1) % totalCards;
                applyPositions();
            }, 2300);
        }
    });
});

// Click: side card = go to center | center card = open modal
cards.forEach((card, i) => {
    card.addEventListener('click', () => {
        const pos = (i - currentIndex + totalCards) % totalCards;
        if (pos === 0) {
            // Open modal
            const title = card.querySelector('.card-back h3').textContent;
            const poem  = card.querySelector('.poem-text p').textContent;
            const img   = card.querySelector('.card-front img').src;
            document.getElementById('modalTitle').textContent    = title;
            document.getElementById('modalPoemText').textContent = poem;
            const coverImg = document.getElementById('modalCoverImg');
            coverImg.src = img;
            // Adjust object-position per image so text is not cropped
            const imgFilename = decodeURIComponent(img.split('/').pop());
            const positionMap = {
                'Uncertainty over Uncertainties.jpg': '65% 55%',
                'devulge now, or maybe later.jpg':    'center center',
                'Locum Pacificum.jpg':                '20% center',
                'Lumina in the Leaves.jpg':           'center center',
            };
            coverImg.style.objectPosition = positionMap[imgFilename] || 'center center';
            document.getElementById('poemModal').classList.add('active');
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
            modalOpen = true;
        } else {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
            cards.forEach(c => c.classList.remove('flipped'));
            currentIndex = i;
            applyPositions();
        }
    });
});

function closeModal() {
    document.getElementById('poemModal').classList.remove('active');
    modalOpen = false;
    if (!autoRotateTimer) {
        autoRotateTimer = setInterval(() => {
            cards.forEach(c => c.classList.remove('flipped'));
            currentIndex = (currentIndex + 1) % totalCards;
            applyPositions();
        }, 2300);
    }
}

// Close modal
document.getElementById('poemModalClose').addEventListener('click', closeModal);
document.getElementById('poemModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('poemModal')) closeModal();
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
