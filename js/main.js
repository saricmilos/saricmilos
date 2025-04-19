// main.js

// ===== Mobile Menu Toggle =====
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.classList.toggle('open');
});

// ===== Contact Form Submission (Mock) =====
const form = document.getElementById('contact-form');
const successMessage = document.getElementById('form-success');

if (form && successMessage) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Simulate form processing
        form.style.display = 'none';
        successMessage.style.display = 'block';

        // Optionally reset form after a delay
        setTimeout(() => {
            form.reset();
            form.style.display = 'block';
            successMessage.style.display = 'none';
        }, 5000);
    });
}

// ===== AOS Init =====
AOS.init({
    duration: 1000,
    once: true
});