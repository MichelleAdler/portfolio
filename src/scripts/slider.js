document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slider-block");
    const thumbs = document.querySelectorAll(".scroll-thumb");
    const progress = document.querySelector(".scroll-progress");

    let currentIndex = 0;
    let isAnimating = false;
    let queuedIndex = null;
    let currentTranslateY = 0;

    // More reliable block height
    function getBlockHeight() {
        const slide = slides[0];
        const style = getComputedStyle(slide);
        const marginTop = parseFloat(style.marginTop || 0);
        const marginBottom = parseFloat(style.marginBottom || 0);
        const gap = parseFloat(getComputedStyle(slider).gap || 0);
        return slide.offsetHeight + marginTop + marginBottom + gap;
    }

    function updateProgress(index) {
        const first = thumbs[0].offsetTop;
        const last = thumbs[thumbs.length - 1].offsetTop;
        const gap = (last - first) / (thumbs.length - 1);
        const h = first + gap * index;
        progress.style.height = h + 5 + "px";

        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle("active", i === index);
        });
    }

    function animateTo(index) {
        isAnimating = true;

        const blockHeight = getBlockHeight();
        const targetY = -blockHeight * index;
        const startY = currentTranslateY;
        const duration = 400;
        const startTime = performance.now();

        function animate(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const currentY = startY + (targetY - startY) * ease;

            slider.style.transform = `translateY(${currentY}px)`;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                slider.style.transform = `translateY(${targetY}px)`;
                currentTranslateY = targetY;
                currentIndex = index;
                isAnimating = false;

                slides.forEach((slide, i) => {
                    if (i === currentIndex && i !== index) {
                        // This is the old visible slide — fade it out
                        slide.classList.add("fade-out");

                        // After fade finishes, hide it
                        setTimeout(() => {
                            slide.classList.add("hidden");
                            slide.classList.remove("fade-out");
                        }, 400); // match CSS transition
                    }

                    if (i === index) {
                        // This is the new active slide
                        slide.classList.remove("hidden");
                        // Force reflow so transition kicks in (very important!)
                        void slide.offsetWidth;
                        slide.classList.remove("fade-out");
                    }
                });

                if (queuedIndex !== null && queuedIndex !== currentIndex) {
                    const nextIndex = queuedIndex;
                    queuedIndex = null;
                    goTo(nextIndex);
                }
            }
        }

        requestAnimationFrame(animate);
        updateProgress(index);
    }

    function goTo(index) {
        const clamped = Math.max(0, Math.min(slides.length - 1, index));

        if (isAnimating) {
            queuedIndex = clamped;
            return;
        }

        if (clamped !== currentIndex) {
            animateTo(clamped);
        }
    }

    function next() {
        goTo(currentIndex + 1);
    }

    function prev() {
        goTo(currentIndex - 1);
    }

    // Scroll and key handling
    window.addEventListener(
        "wheel",
        (e) => {
            if (!isAnimating) {
                e.deltaY > 0 ? next() : prev();
            }
            e.preventDefault();
        },
        { passive: false }
    );

    let startY = 0;
    window.addEventListener(
        "touchstart",
        (e) => (startY = e.touches[0].clientY)
    );
    window.addEventListener("touchend", (e) => {
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dy) > 30) {
            dy < 0 ? next() : prev();
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") next(), e.preventDefault();
        if (e.key === "ArrowUp") prev(), e.preventDefault();
    });

    window.addEventListener("resize", () => {
        // Recalculate transform after layout change
        const blockHeight = getBlockHeight();
        currentTranslateY = -blockHeight * currentIndex;
        slider.style.transform = `translateY(${currentTranslateY}px)`;
    });

    // Make thumb dots clickable
    thumbs.forEach((thumb, index) => {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
            goTo(index);
        });
    });

    // Init
    goTo(0);
    updateProgress(0);
});
