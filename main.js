// --- GLOBAL VARIABLES ---
let targetDate = 0;
let countdownInterval;

// --- INITIALIZATION (Runs when the page loads) ---
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

    // 2. Schedule Page Trigger
    const scheduleContainer = document.getElementById("schedule-container");
    if (scheduleContainer) {
        loadSchedule(scheduleContainer);
    }

    // 3. Home Page Countdown Trigger
    if (document.getElementById('cd-days')) {
        initializeCountdown();
    }
});


// --- SCHEDULE PAGE LOGIC ---
async function loadSchedule(container) {
    try {
        const response = await fetch('/schedule.json');
        if (!response.ok) throw new Error("Failed to load schedule");

        const races = await response.json();

        // Dictionary to convert short months to full names for the headers
        const monthNames = {
            "Jan": "January", "Feb": "February", "Mar": "March",
            "Apr": "April", "May": "May", "Jun": "June",
            "Jul": "July", "Aug": "August", "Sep": "September",
            "Oct": "October", "Nov": "November", "Dec": "December"
        };

        // Group races by month and year
        const racesByMonth = {};
        races.forEach(race => {
            // Using startDate as you requested
            const parts = race.startDate.split(" ");
            const shortMonth = parts[0];
            const year = parts[2];
            const groupKey = `${monthNames[shortMonth]} ${year}`;

            if (!racesByMonth[groupKey]) {
                racesByMonth[groupKey] = [];
            }
            racesByMonth[groupKey].push(race);
        });

        // Build the HTML
        let htmlContent = "";

        for (const [monthYear, monthRaces] of Object.entries(racesByMonth)) {
            htmlContent += `
                <section>
                    <h2 class="mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
                        <span class="h-px flex-1 bg-border"></span>
                        <span class="px-4">${monthYear}</span>
                        <span class="h-px flex-1 bg-border"></span>
                    </h2>
                    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            `;

            monthRaces.forEach(race => {
                htmlContent += `
                    <a class="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5" href="${race.link}">
                        <div class="absolute right-3 top-3 z-10">
                            <span class="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">R${race.round}</span>
                        </div>
                        <div class="h-1 w-full bg-primary"></div>
                        <div class="flex flex-1 flex-col p-4">
                            <div class="mb-2 flex items-center gap-2">
                                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">${race.country}</span>
                            </div>
                            <h3 class="mb-3 text-lg font-bold leading-tight text-foreground group-hover:text-primary">${race.name}</h3>
                            <div class="mt-auto space-y-2">
                                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin h-4 w-4" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span>${race.circuit}</span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar h-4 w-4" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                                    <span>${race.startDate} - ${race.endDate || ''}</span>
                                </div>
                            </div>
                            <div class="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <span class="text-sm text-muted-foreground">View Routes</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                            </div>
                        </div>
                    </a>
                `;
            });

            htmlContent += `
                    </div>
                </section>
            `;
        }

        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("Error loading the schedule:", error);
        container.innerHTML = '<p class="text-center text-red-500 py-12">Failed to load the race calendar. Please check your schedule.json formatting.</p>';
    }
}


// --- HOME PAGE COUNTDOWN LOGIC ---
async function initializeCountdown() {
    try {
        const response = await fetch('/schedule.json');
        if (!response.ok) throw new Error("Failed to load schedule for countdown");

        const races = await response.json();
        const now = new Date().getTime();
        let nextRace = null;

        for (const race of races) {
            // Parses the startDate property into a timestamp
            const timeString = race.startDate || race.date;
            const raceStartTime = new Date(timeString).getTime();

            // If the race starts in the future, it's the next one
            if (raceStartTime > now) {
                nextRace = race;
                targetDate = raceStartTime;
                break;
            }
        }

        if (nextRace) {
            // Fill in the title and details dynamically
            const nameElement = document.getElementById('next-race-name');
            const detailsElement = document.getElementById('next-race-details');

            if (nameElement) nameElement.innerText = nextRace.name;
            if (detailsElement) {
                detailsElement.innerText = `Round ${nextRace.round} - ${nextRace.circuit} , ${nextRace.country}`;
            }

            // Immediately calculate time before starting interval
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        } else {
            // Fallback if the season is over (no future races found)
            const nameElement = document.getElementById('next-race-name');
            const detailsElement = document.getElementById('next-race-details');

            if (nameElement) nameElement.innerText = "Season Complete!";
            if (detailsElement) detailsElement.innerText = "Check back later for the next season's calendar.";

            document.getElementById('cd-days').innerText = "00";
            document.getElementById('cd-hours').innerText = "00";
            document.getElementById('cd-mins').innerText = "00";
            document.getElementById('cd-secs').innerText = "00";
        }

    } catch (error) {
        console.error("Error setting up countdown:", error);
        document.getElementById('next-race-name').innerText = "Error Loading Schedule";
        document.getElementById('next-race-details').innerText = "Please ensure schedule.json is configured correctly.";
    }
}

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
        clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-mins');
    const elSecs = document.getElementById('cd-secs');

    if (elDays) elDays.innerText = days.toString().padStart(2, '0');
    if (elHours) elHours.innerText = hours.toString().padStart(2, '0');
    if (elMins) elMins.innerText = minutes.toString().padStart(2, '0');
    if (elSecs) elSecs.innerText = seconds.toString().padStart(2, '0');
};