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
// FOOTER YEAR
// ===============================

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===============================
// RESUME BUTTON
// Shown only when resume.pdf exists in the repo, so it can never be a dead link.
// ===============================

const resumeActions = document.getElementById("resumeActions");
if (resumeActions) {
    fetch("resume.pdf", { method: "HEAD" })
        .then((res) => { if (!res.ok) resumeActions.hidden = true; })
        .catch(() => { resumeActions.hidden = true; });
}

// ===============================
// LIVE CP STATS
// ===============================
//
// Each stat row is filled from a public API. If a value can't be fetched:
//   1. a static fallback typed into the card is used (data-fb-rating="1200",
//      data-fb-maxrating, data-fb-contests, data-fb-solved), otherwise
//   2. the row is hidden, so the page never shows "N/A".

const MISSING = [undefined, null, "", "N/A"];

function fallbackKey(field) {
    return "fb" + field.charAt(0).toUpperCase() + field.slice(1);
}

// Returns true when `value` came from the live API.
function setStat(card, field, value, isLive = true) {
    const el = card.querySelector('[data-field="' + field + '"]');
    if (!el) return false;

    const row = el.closest(".cp-detail-row");
    const hasValue = !MISSING.includes(value);
    const shown = hasValue ? value : card.dataset[fallbackKey(field)];

    if (shown === undefined) {
        if (row) row.hidden = true;
        return false;
    }

    el.textContent = shown;
    if (row) row.hidden = false;
    if (hasValue && isLive) card.dataset.live = "1";
    return hasValue && isLive;
}

// Footer line: only claim "Updated" when something really came from the API.
function finishCard(card, platformName) {
    const el = card.querySelector('[data-field="updated"]');
    if (!el) return;

    if (card.dataset.live === "1") {
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
        el.textContent = "Updated: " + today + " · Keep solving, keep improving.";
    } else {
        el.textContent = "Open the " + platformName + " profile for the latest figures.";
    }
}

// The profile page reports "471 problems solved for all time", but the public
// user.status API only exposes 401 of them — solves in private groups and gyms
// are not returned. Keep the profile figure as a floor, and let the live count
// take over once it climbs past it.
function applySolvedBase(card, count) {
    const base = Number(card.dataset.solvedBase);
    return Number.isFinite(base) ? Math.max(base, count) : count;
}

async function loadCodeforces(card, handle) {
    try {
        const res = await fetch("https://codeforces.com/api/user.info?handles=" + encodeURIComponent(handle));
        const data = await res.json();
        if (data.status !== "OK") throw new Error("cf error");
        const user = data.result[0];
        setStat(card, "rating", user.rating ?? "Unrated");
        setStat(card, "maxrating", user.maxRating);
        setStat(card, "friends", user.friendOfCount);
    } catch (err) {
        setStat(card, "rating", null);
        setStat(card, "maxrating", null);
        setStat(card, "friends", null);
    }

    try {
        const res = await fetch("https://codeforces.com/api/user.rating?handle=" + encodeURIComponent(handle));
        const data = await res.json();
        if (data.status !== "OK") throw new Error("cf rating error");
        setStat(card, "contests", data.result.length);
    } catch (err) {
        setStat(card, "contests", null);
    }

    try {
        const res = await fetch("https://codeforces.com/api/user.status?handle=" + encodeURIComponent(handle));
        const data = await res.json();
        if (data.status !== "OK") throw new Error("cf status error");
        const solved = new Set();
        data.result.forEach((sub) => {
            if (sub.verdict !== "OK") return;
            const p = sub.problem;
            solved.add((p.contestId ?? p.problemsetName ?? "?") + "-" + p.index);
        });
        setStat(card, "solved", applySolvedBase(card, solved.size));
    } catch (err) {
        // API unreachable: show the profile figure, but don't claim it is live.
        const base = Number(card.dataset.solvedBase);
        setStat(card, "solved", Number.isFinite(base) ? base : null, false);
    }

    finishCard(card, "Codeforces");
}

async function loadAtcoder(card, handle) {
    try {
        const res = await fetch("https://atcoder.jp/users/" + encodeURIComponent(handle) + "/history/json");
        if (!res.ok) throw new Error("atc error");
        const history = await res.json();
        if (!Array.isArray(history) || history.length === 0) throw new Error("no history");
        const last = history[history.length - 1];
        setStat(card, "rating", last.NewRating);
        setStat(card, "maxrating", Math.max(...history.map((h) => h.NewRating)));
        setStat(card, "contests", history.length);
    } catch (err) {
        setStat(card, "rating", null);
        setStat(card, "maxrating", null);
        setStat(card, "contests", null);
    }

    try {
        const res = await fetch("https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=" + encodeURIComponent(handle));
        const data = await res.json();
        setStat(card, "solved", data.count);
    } catch (err) {
        setStat(card, "solved", null);
    }

    finishCard(card, "AtCoder");
}

document.querySelectorAll(".cp-detail-card").forEach((card) => {
    const platform = card.dataset.cp;
    const handle = card.dataset.handle;
    if (platform === "codeforces") loadCodeforces(card, handle);
    if (platform === "atcoder") loadAtcoder(card, handle);
});

// ===============================
// END
// ===============================
