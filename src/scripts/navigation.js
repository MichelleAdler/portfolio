document.addEventListener("DOMContentLoaded", function () {
    const aboutRadio = document.getElementById("tab2");
    const projectsRadio = document.getElementById("tab1");
    const heroView = document.getElementById("heroView");
    const aboutView = document.getElementById("aboutView");

    function showAbout() {
        document.body.classList.add("no-bg");
        aboutView.style.display = "grid";
        heroView.style.display = "none";
        heroView.classList.remove("active");
        aboutView.classList.add("active");
    }

    function showProjects() {
        document.body.classList.remove("no-bg");
        aboutView.style.display = "none";
        heroView.style.display = "grid";
        heroView.classList.add("active");
        aboutView.classList.remove("active");
    }

    // Listen for radio state changes instead of clicks
    aboutRadio.addEventListener("change", () => {
        if (aboutRadio.checked) showAbout();
    });

    projectsRadio.addEventListener("change", () => {
        if (projectsRadio.checked) showProjects();
    });

    // Initialize to projects view
    showProjects();
});
