document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('hidden');
            mainNav.classList.toggle('flex');
            mainNav.classList.toggle('flex-col');
            mainNav.classList.toggle('absolute');
            mainNav.classList.toggle('top-16');
            mainNav.classList.toggle('left-0');
            mainNav.classList.toggle('w-full');
            mainNav.classList.toggle('bg-background');
            mainNav.classList.toggle('p-4');
            mainNav.classList.toggle('border-b');
        });
    }

    // 2. Dummy Countdown Timer (Replace targetDate with actual race date)
    const targetDate = new Date("May 23, 2026 00:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) return; // Timer expired

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('cd-days').innerText = days.toString().padStart(2, '0');
        document.getElementById('cd-hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('cd-mins').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('cd-secs').innerText = seconds.toString().padStart(2, '0');
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();
});