document.addEventListener("DOMContentLoaded", () => {
    const aboutRadio = document.getElementById("tab-2");
    const projectsRadio = document.getElementById("tab-1");
    const heroView = document.getElementById("heroView");
    const aboutView = document.getElementById("aboutView");
    const container = document.querySelector(".page-content");

    function showAbout() {
        document.body.classList.add("no-bg");
        aboutView.style.display = "grid";
        heroView.style.display = "none";
        heroView.classList.remove("active");
        aboutView.classList.add("active");
        container.classList.remove("no-scroll");
    }

    function showProjects() {
        document.body.classList.remove("no-bg");
        aboutView.style.display = "none";
        heroView.style.display = "grid";
        heroView.classList.add("active");
        aboutView.classList.remove("active");
        container.classList.add("no-scroll");
    }

    aboutRadio.addEventListener("change", () => {
        if (aboutRadio.checked) showAbout();
    });
    projectsRadio.addEventListener("change", () => {
        if (projectsRadio.checked) showProjects();
    });

    showProjects();

    const menu = document.querySelector(".navbar-menu");
    const radios = document.querySelectorAll(
        '.navbar-item input[type="radio"]'
    );

    // Create gooey highlight div once
    const gooey = document.createElement("div");
    gooey.classList.add("gooey-highlight");
    menu.style.position = "relative";
    menu.appendChild(gooey);

    function updateGooeyPosition() {
        let selectedIndex = -1;
        radios.forEach((radio, i) => {
            if (radio.checked) selectedIndex = i;
        });

        if (selectedIndex === -1) {
            gooey.style.opacity = "0";
            return;
        }

        gooey.style.opacity = "1";
        gooey.style.left = `${selectedIndex * 12}rem`;

        // Restart the stretch animation:
        gooey.style.animation = "none";
        // Trigger reflow to reset animation
        void gooey.offsetWidth;
        gooey.style.animation = "gooeyStretch 300ms ease forwards";
    }

    radios.forEach((radio) => {
        radio.addEventListener("change", updateGooeyPosition);
    });

    // Run once on load to position highlight on first item
    updateGooeyPosition();
});
