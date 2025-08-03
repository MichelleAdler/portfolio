document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector(".nav-highlight");
    const links = Array.from(nav.querySelectorAll(".nav-link"));
    const highlight = nav.querySelector(".highlight-bg");

    function moveHighlight(index) {
        const btn = links[index];
        const navRect = nav.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        highlight.style.left = btnRect.left - navRect.left + "px";
        highlight.style.width = btnRect.width + "px";
    }

    // Set initial active
    let activeIndex = 1; // "Featured Projects" by default
    links[activeIndex].classList.add("active");
    moveHighlight(activeIndex);

    links.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            links.forEach((l) => l.classList.remove("active"));
            btn.classList.add("active");
            moveHighlight(idx);
        });
    });

    window.addEventListener("resize", () =>
        moveHighlight(links.findIndex((l) => l.classList.contains("active")))
    );
});
