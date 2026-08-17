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
// SMOOTH PAGE LOAD
// ===============================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});

// ===============================
// END
// ===============================
