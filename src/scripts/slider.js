document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slider-block");
    const thumbs = document.querySelectorAll(".scroll-thumb");
    const progress = document.querySelector(".scroll-progress");
    const heroView = document.getElementById("heroView");

    let currentIndex = 0;
    let isAnimating = false;
    let queuedIndex = null;
    let currentTranslateY = 0;

    // Sensitivity
    const SWIPE_THRESHOLD = 30; // px movement to trigger change
    const WHEEL_THRESHOLD = 15; // mouse wheel sensitivity

    // Popup elements
    const popupOverlay = document.querySelector(".popup-overlay");
    const popupImage = document.querySelector(".popup-image");
    const popupTitle = document.querySelector(".popup-title");
    const popupDesc = document.querySelector(".popup-desc");
    const popupClose = document.querySelector(".popup-close");

    // Projects data (unchanged)
    const projects = [
        {
            title: "Postnet",
            desc: "App Design",
            colors: ["#D11532", "#080058", "#312E33", "#FFFFFF"],
            popupImageSrc: "/src/media/projects/postnet/postnetLogo.svg",
            popupImageAlt: "PostNet Logo",
        },
        {
            title: "Hypro",
            desc: "Branding",
            colors: ["#0D0D0D", "#3A3A3A", "#5A5A5A", "#AAAAAA"],
            popupImageSrc: "/src/media/projects/hypro/hyproLogo.svg",
            popupImageAlt: "Hypro Logo",
        },
        {
            title: "Doodle Dev",
            desc: "Web App",
            colors: ["#A1BFFF", "#8FA9F8", "#5D7FF7", "#204DE8"],
            popupImageSrc: "/src/media/projects/doodleDev/doodleDevLogo.svg",
            popupImageAlt: "Doodle Dev Logo",
        },
        {
            title: "Villa 39",
            desc: "Website",
            colors: ["#EEEEEE", "#CCCCCC", "#AAAAAA", "#888888"],
            popupImageSrc: "/src/media/projects/villa39/villa39Logo.svg",
            popupImageAlt: "Villa 39 Logo",
        },
        {
            title: "Postnet",
            desc: "App Design",
            colors: ["#D11532", "#080058", "#312E33", "#FFFFFF"],
            popupImageSrc: "/src/media/projects/postnet/postnetLogo.svg",
            popupImageAlt: "PostNet Logo",
        },
    ];

    const paletteDots = document.querySelectorAll(".project-sidebar .color");
    const projectTitle = document.querySelector(".project-title");
    const projectDesc = document.querySelector(".project-desc");

    // Helper: Is popup open?
    function isPopupOpen() {
        return !popupOverlay.classList.contains("hidden");
    }

    // Disable/enable body scroll on popup open/close
    function disableBodyScroll() {
        document.body.style.overflow = "hidden";
    }
    function enableBodyScroll() {
        document.body.style.overflow = "";
    }

    // Get block height
    function getBlockHeight() {
        const slide = slides[0];
        const style = getComputedStyle(slide);
        const marginTop = parseFloat(style.marginTop || 0);
        const marginBottom = parseFloat(style.marginBottom || 0);
        const gap = parseFloat(getComputedStyle(slider).gap || 0);
        return slide.offsetHeight + marginTop + marginBottom + gap;
    }

    // Update scroll progress bar and active thumb
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

    // Show new slide and hide old one
    function setActiveSlide(newIndex, oldIndex) {
        slides.forEach((slide, i) => {
            if (i === oldIndex && oldIndex !== newIndex) {
                slide.classList.add("fade-out");
                setTimeout(() => {
                    slide.classList.add("hidden");
                    slide.classList.remove("fade-out");
                }, 400);
            }
            if (i === newIndex) {
                slide.classList.remove("hidden");
                void slide.offsetWidth; // force reflow
                slide.classList.remove("fade-out");
            }
        });
    }

    // Animate slider to given index
    function animateTo(index) {
        isAnimating = true;
        const blockHeight = getBlockHeight();
        const targetY = -blockHeight * index;
        const startY = currentTranslateY;
        const duration = 400;
        const startTime = performance.now();
        const oldIndex = currentIndex;

        // Start fade and movement together
        setActiveSlide(index, oldIndex);

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

                if (queuedIndex !== null && queuedIndex !== currentIndex) {
                    const nextIndex = queuedIndex;
                    queuedIndex = null;
                    goTo(nextIndex);
                }
            }
        }

        requestAnimationFrame(animate);
        updateProgress(index);
        updateSidebar(index);
    }

    // Slide navigation
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

    // Mouse wheel navigation (disabled if popup open)
    window.addEventListener(
        "wheel",
        (e) => {
            if (isPopupOpen()) return;
            if (!heroView.classList.contains("active")) return;
            if (!isAnimating) {
                if (e.deltaY > WHEEL_THRESHOLD) {
                    next();
                } else if (e.deltaY < -WHEEL_THRESHOLD) {
                    prev();
                }
            }
            e.preventDefault();
        },
        { passive: false }
    );

    // Touch dragging with live feedback (disabled if popup open)
    let startY = 0;
    let dragStartTranslate = 0;
    let dragging = false;

    window.addEventListener(
        "touchstart",
        (e) => {
            if (isPopupOpen()) return;
            if (!heroView.classList.contains("active")) return;
            startY = e.touches[0].clientY;
            dragStartTranslate = currentTranslateY;
            dragging = true;
        },
        { passive: true }
    );

    window.addEventListener(
        "touchmove",
        (e) => {
            if (isPopupOpen()) return;
            if (!heroView.classList.contains("active") || !dragging) return;
            const currentY = e.touches[0].clientY;
            const dy = currentY - startY;
            slider.style.transform = `translateY(${dragStartTranslate + dy}px)`;
            e.preventDefault();
        },
        { passive: false }
    );

    window.addEventListener("touchend", (e) => {
        if (isPopupOpen()) return;
        if (!heroView.classList.contains("active") || !dragging) return;
        dragging = false;

        const endY = e.changedTouches[0].clientY;
        const dy = endY - startY;

        if (Math.abs(dy) > SWIPE_THRESHOLD) {
            if (dy < 0) {
                next();
            } else {
                prev();
            }
        } else {
            animateTo(currentIndex); // snap back
        }
    });

    // Keyboard navigation (disabled if popup open)
    window.addEventListener("keydown", (e) => {
        if (isPopupOpen()) return;
        if (!heroView.classList.contains("active")) return;
        if (e.key === "ArrowDown") {
            next();
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            prev();
            e.preventDefault();
        }
    });

    // Recalculate on resize
    window.addEventListener("resize", () => {
        const blockHeight = getBlockHeight();
        currentTranslateY = -blockHeight * currentIndex;
        slider.style.transform = `translateY(${currentTranslateY}px)`;
    });

    // Thumb dots click
    thumbs.forEach((thumb, index) => {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
            if (isPopupOpen()) return;
            goTo(index);
        });
    });

    // Update sidebar colors and text based on current index
    function updateSidebar(index) {
        const project = projects[index];
        paletteDots.forEach((dot, i) => {
            dot.style.backgroundColor = project.colors[i] || "#ddd";
        });
        projectTitle.textContent = project.title;
        projectDesc.textContent = project.desc;
    }

    // Show popup with data from a slide index
    function showPopup(index) {
        const project = projects[index];
        popupImage.src = project.popupImageSrc;
        popupImage.alt = project.popupImageAlt;
        popupTitle.textContent = project.title;
        popupDesc.textContent = project.desc;
        popupOverlay.classList.remove("hidden");
        disableBodyScroll();
    }

    // Close popup
    function closePopup() {
        popupOverlay.classList.add("hidden");
        enableBodyScroll();
    }
    popupClose.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    // Slide click opens popup
    slides.forEach((slide, index) => {
        slide.style.cursor = "pointer";
        slide.addEventListener("click", () => {
            showPopup(index);
        });
    });

    // Initialize
    goTo(0);
    updateProgress(0);
});
