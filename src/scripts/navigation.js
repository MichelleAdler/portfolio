document.addEventListener("DOMContentLoaded", function () {
    const aboutBtn = document.getElementById("tab2");
    const projectsBtn = document.getElementById("tab1");
    const heroView = document.getElementById("heroView");
    const aboutView = document.getElementById("aboutView");

    function moveIndicatorToProjects() {
        document.querySelector(".indicator").style.left = "0%";
        document.querySelector(".indicator").style.margin = "0px 2px";
    }

    function moveIndicatorToAbout() {
        document.querySelector(".indicator").style.left = "50%"; // 130 + 2
        document.querySelector(".indicator").style.margin = "0px -2px";
    }

    function showAbout() {
        aboutBtn.checked = true;
        moveIndicatorToAbout();
        document.body.classList.add("no-bg");
        aboutView.style.display = "grid";
        heroView.style.display = "none";
        heroView.classList.remove("active");
        aboutView.classList.add("active");
    }

    function showProjects() {
        projectsBtn.checked = true;
        moveIndicatorToProjects();
        document.body.classList.remove("no-bg");
        aboutView.style.display = "none";
        heroView.style.display = "grid";
        heroView.classList.add("active");
        aboutView.classList.remove("active");
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
