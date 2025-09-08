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

    const SWIPE_THRESHOLD = 30; // px movement to trigger change
    const WHEEL_THRESHOLD = 15; // mouse wheel sensitivity

    // Popup elements
    const popupOverlay = document.querySelector(".popup-overlay");
    const popupContent = document.querySelector(".popup-content");
    const popupClose = document.querySelector(".popup-close");

    const popupFiles = [
        "/src/pages/postnet.html",
        "/src/pages/doodleDev.html",
        "/src/pages/hypro.html",
        "/src/pages/villa39.html",
        "/src/pages/postnet.html",
    ];

    const projects = [
        {
            title: "Postnet",
            desc:
                "Stationary and courier company" +
                "<br><br>" +
                "| Mobile app design",
            colors: ["#D11532", "#080058", "#312E33", "#FFFFFF"],
        },
        {
            title: "Doodle Dev",
            desc:
                "Software development company" +
                "<br><br>" +
                "| Branding, logo and website",
            colors: ["#DDF344", "#A1BFFF", "#3B4883", "#D9D9D9"],
        },
        {
            title: "Hypro Hydraulics",
            desc:
                "Hydraulics components and services company" +
                "<br><br>" +
                "| Branding, logo and website",
            colors: ["#ACC5DA", "#49637A", "#2E475C", "#172A3A"],
        },
        {
            title: "Villa 39",
            desc:
                "In-house goldsmith and jeweler" +
                "<br><br>" +
                "| Branding, logo and website",
            colors: ["#4E4327", "#4C5547", "#7C8378", "#181918"],
        },
        {
            title: "Postnet",
            desc: "App concept and design",
            colors: ["#D11532", "#080058", "#312E33", "#FFFFFF"],
        },
    ];

    const paletteDots = document.querySelectorAll(".project-sidebar .color");
    const projectTitle = document.querySelector(".project-title");
    const projectDesc = document.querySelector(".project-desc");

    function isPopupOpen() {
        return !popupOverlay.classList.contains("hidden");
    }

    function disableBodyScroll() {
        document.body.style.overflow = "hidden";
    }
    function enableBodyScroll() {
        document.body.style.overflow = "";
    }

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

    function animateTo(index) {
        isAnimating = true;
        const blockHeight = getBlockHeight();
        const targetY = -blockHeight * index;
        const startY = currentTranslateY;
        const duration = 400;
        const startTime = performance.now();
        const oldIndex = currentIndex;

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

    window.addEventListener("resize", () => {
        const blockHeight = getBlockHeight();
        currentTranslateY = -blockHeight * currentIndex;
        slider.style.transform = `translateY(${currentTranslateY}px)`;
    });

    thumbs.forEach((thumb, index) => {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
            if (isPopupOpen()) return;
            goTo(index);
        });
    });

    function updateSidebar(index) {
        const project = projects[index];
        paletteDots.forEach((dot, i) => {
            dot.style.backgroundColor = project.colors[i] || "#ddd";
        });
        projectTitle.innerHTML = project.title;
        projectDesc.innerHTML = project.desc;
    }

    // NEW: Load popup content from external HTML file
    function showPopup(index) {
        const fileUrl = popupFiles[index];
        if (!fileUrl) {
            popupContent.innerHTML = "<p>Sorry, no content available.</p>";
            popupOverlay.classList.remove("hidden");
            disableBodyScroll();
            return;
        }
        fetch(fileUrl)
            .then((response) => {
                if (!response.ok)
                    throw new Error("Failed to load popup content");
                return response.text();
            })
            .then((html) => {
                popupContent.innerHTML = html;
                popupOverlay.classList.remove("hidden");
                disableBodyScroll();

                toggleDeviceSetup();
            })
            .catch((err) => {
                popupContent.innerHTML = `<p>Error loading content: ${err.message}</p>`;
                popupOverlay.classList.remove("hidden");
                disableBodyScroll();
            });
    }

    function closePopup() {
        popupOverlay.classList.add("hidden");
        popupContent.innerHTML = ""; // clear content on close
        enableBodyScroll();
    }

    popupClose.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    slides.forEach((slide, index) => {
        slide.style.cursor = "pointer";
        slide.addEventListener("click", () => {
            showPopup(index);
        });
    });

    // Initialize
    goTo(0);
    updateProgress(0);

    function toggleDeviceSetup() {
        const options = document.querySelectorAll(".toggle-option");
        const indicator = document.getElementById("indicator");
        const pcImage = document.getElementById("pcImage");
        const phoneImage = document.getElementById("phoneImage");

        const popup = document.querySelector(".popup");
        const left = document.querySelector(".left-container");
        const right = document.querySelector(".right-container");

        function updateStuck(el) {
            const popupHeight = popup.clientHeight;
            const elBottom = el.offsetTop + el.offsetHeight;

            if (popup.scrollTop + popupHeight >= elBottom) {
                // Add stuck class
                el.classList.add("stuck");
                // Freeze scroll visually at bottom
                el.scrollTop = el.scrollHeight - el.clientHeight;
            } else {
                el.classList.remove("stuck");
            }
        }

        popup.addEventListener("scroll", function () {
            // Sync scroll for left/right containers, but only if not stuck
            if (!left.classList.contains("stuck")) {
                left.scrollTop = Math.min(
                    popup.scrollTop,
                    left.scrollHeight - left.clientHeight
                );
            }
            if (!right.classList.contains("stuck")) {
                right.scrollTop = Math.min(
                    popup.scrollTop,
                    right.scrollHeight - right.clientHeight
                );
            }

            // Update stuck class
            updateStuck(left);
            updateStuck(right);
        });

        if (options.length > 0) {
            function setActive(device) {
                options.forEach((opt) => opt.classList.remove("active"));
                const selected = document.querySelector(
                    `.toggle-option[data-device="${device}"]`
                );
                selected.classList.add("active");

                // Move indicator
                indicator.style.left = selected.offsetLeft + "px";

                // Swap images
                if (device === "pc") {
                    pcImage.classList.remove("hide");
                    pcImage.classList.add("show");
                    phoneImage.classList.remove("show");
                    phoneImage.classList.add("hide");
                } else {
                    phoneImage.classList.remove("hide");
                    phoneImage.classList.add("show");
                    pcImage.classList.remove("show");
                    pcImage.classList.add("hide");
                }
            }

            const active = document.querySelector(".toggle-option.active");
            indicator.style.left = active.offsetLeft + "px";

            options.forEach((opt) => {
                opt.addEventListener("click", () => {
                    setActive(opt.dataset.device);
                });
            });
        }

        const iframe = document.getElementById("figma-frame");
        const loader = document.getElementById("custom-loader");

        if (iframe) {
            // Also use the iframe load event as a fallback
            iframe.addEventListener("load", function () {
                hideLoader();
            });

            function hideLoader() {
                setTimeout(() => (loader.style.display = "none"), 8000);
            }
        }
    }
});
