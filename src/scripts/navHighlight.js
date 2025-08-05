document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector(".nav-highlight");
    const links = Array.from(nav.querySelectorAll(".nav-link"));
    const highlight = nav.querySelector(".highlight-bg");

    // Set initial active
    let activeIndex = 0; // "About" by default
    links[activeIndex].classList.add("active");

    links.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            links.forEach((l) => l.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    const aboutBtn = document.getElementById("aboutBtn");
    const projectsBtn = document.getElementById("projectsBtn");
    const heroView = document.getElementById("heroView");
    const aboutView = document.getElementById("aboutView");

    function showAbout() {
        aboutView.style.display = "grid";
        heroView.style.display = "none";
        aboutBtn.classList.add("active");
        projectsBtn.classList.remove("active");
    }

    function showProjects() {
        aboutView.style.display = "none";
        heroView.style.display = "grid";
        projectsBtn.classList.add("active");
        aboutBtn.classList.remove("active");
    }

    // Initialize
    showProjects();

    aboutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showAbout();
    });

    projectsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showProjects();
    });
});
