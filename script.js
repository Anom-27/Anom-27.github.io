// ===============================
// Portfolio Website Script
// Pritom Kumar Sen Anom
// Version 1.0
// ===============================

const root = document.documentElement;

const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const toTop = document.getElementById("toTop");

// ===============================
// THEME
// ===============================

// Default = Dark Mode
const storedTheme = localStorage.getItem("theme");

if (storedTheme) {
    if (storedTheme === "dark") {
        root.dataset.theme = "dark";
    }
} else {
    // First visit
    root.dataset.theme = "dark";
}

// Toggle Theme
themeToggle.addEventListener("click", () => {

    if (root.dataset.theme === "dark") {

        delete root.dataset.theme;
        localStorage.setItem("theme", "light");

    } else {

        root.dataset.theme = "dark";
        localStorage.setItem("theme", "dark");

    }

});

// ===============================
// MOBILE MENU
// ===============================

menuToggle.addEventListener("click", () => {

    nav.classList.toggle("open");

});

// Close menu after clicking a link
nav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        nav.classList.remove("open");

    });

});

// ===============================
// SCROLL REVEAL
// ===============================

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {
        threshold: 0.12
    }

);

revealItems.forEach(item => observer.observe(item));

// ===============================
// SCROLL SPY
// ===============================

const sections = document.querySelectorAll("section[id]");
const navLinks = nav.querySelectorAll("a");

function scrollSpy() {

    const scrollPosition = window.scrollY + 110;

    sections.forEach(section => {

        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute("id");

        if (scrollPosition >= top && scrollPosition < bottom) {

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === "#" + id
                );

            });

        }

    });

    // Back To Top Button
    if (window.scrollY > 450) {

        toTop.classList.add("show");

    } else {

        toTop.classList.remove("show");

    }

}

window.addEventListener("scroll", scrollSpy, {
    passive: true
});

scrollSpy();

// ===============================
// BACK TO TOP CLICK
// ===============================

toTop.addEventListener("click", (e) => {

    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });

});

// ===============================
// SMOOTH PAGE LOAD
// ===============================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});

// ===============================
// LIVE CP STATS
// ===============================

function setStat(card, field, value) {
    const el = card.querySelector('[data-field="' + field + '"]');
    if (el) el.textContent = value;
}

async function loadCodeforces(card, handle) {
    try {
        const res = await fetch("https://codeforces.com/api/user.info?handles=" + encodeURIComponent(handle));
        const data = await res.json();
        if (data.status !== "OK") throw new Error("cf error");
        const user = data.result[0];
        setStat(card, "rating", user.rating ?? "Unrated");
        setStat(card, "rank", user.rank ? user.rank.replace(/\b\w/g, c => c.toUpperCase()) : "—");
    } catch (err) {
        setStat(card, "rating", "N/A");
        setStat(card, "rank", "N/A");
    }

    try {
        const res = await fetch("https://codeforces-stats.tashif.codes/" + encodeURIComponent(handle));
        const data = await res.json();
        setStat(card, "solved", data.solved_problems_count ?? "N/A");
    } catch (err) {
        setStat(card, "solved", "N/A");
    }
}

async function loadCodechef(card, handle) {
    try {
        const res = await fetch("https://codechef-api.vercel.app/handle/" + encodeURIComponent(handle));
        const data = await res.json();
        if (!data || data.success === false) throw new Error("cc error");
        setStat(card, "rating", data.currentRating ?? "N/A");
        setStat(card, "rank", data.stars ?? "—");
        setStat(card, "solved", data.problemsSolved ?? data.fullySolved ?? "N/A");
    } catch (err) {
        setStat(card, "rating", "N/A");
        setStat(card, "rank", "N/A");
        setStat(card, "solved", "N/A");
    }
}

async function loadAtcoder(card, handle) {
    try {
        const res = await fetch("https://atcoder.jp/users/" + encodeURIComponent(handle) + "/history/json");
        if (!res.ok) throw new Error("atc error");
        const history = await res.json();
        if (!Array.isArray(history) || history.length === 0) throw new Error("no history");
        const last = history[history.length - 1];
        const maxRating = Math.max(...history.map(h => h.NewRating));
        setStat(card, "rating", last.NewRating ?? "N/A");
        setStat(card, "rank", maxRating ?? "—");
    } catch (err) {
        setStat(card, "rating", "N/A");
        setStat(card, "rank", "N/A");
    }

    try {
        const res = await fetch("https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=" + encodeURIComponent(handle));
        const data = await res.json();
        setStat(card, "solved", data.count ?? "N/A");
    } catch (err) {
        setStat(card, "solved", "N/A");
    }
}

document.querySelectorAll(".cp-card").forEach((card) => {
    const platform = card.dataset.cp;
    const handle = card.dataset.handle;
    if (platform === "codeforces") loadCodeforces(card, handle);
    if (platform === "codechef") loadCodechef(card, handle);
    if (platform === "atcoder") loadAtcoder(card, handle);
});

// ===============================
// END
// ===============================
