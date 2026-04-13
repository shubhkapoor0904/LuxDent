document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it has become visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeUpElements = document.querySelectorAll('.fade-up');
    fadeUpElements.forEach(el => {
        observer.observe(el);
    });

    // Pricing Toggle Logic
    const pricingSwitch = document.getElementById('pricing-switch');
    if (pricingSwitch) {
        pricingSwitch.addEventListener('change', (e) => {
            const isAnnual = e.target.checked;
            const amounts = document.querySelectorAll('.pricing-card .amount');
            
            amounts.forEach(amount => {
                if (isAnnual) {
                    // Start counter animation to new price
                    animateValue(amount, parseInt(amount.dataset.monthly), parseInt(amount.dataset.annual), 300);
                } else {
                    animateValue(amount, parseInt(amount.dataset.annual), parseInt(amount.dataset.monthly), 300);
                }
            });
        });
    }

    // Number Counter Animation for Pricing
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navCta = document.querySelector('.nav-cta');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            // Note: For a fully functional mobile menu, you'd toggle a class 
            // that changes display:none to display:flex and positions it absolutely.
            // This is a minimal placeholder for the toggle functionality.
            mobileToggle.classList.toggle('active');
            
            if (mobileToggle.classList.contains('active')) {
                // simple inline styling for demo purposes
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(10, 10, 10, 0.95)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--glass-border)';
                
                navCta.style.display = 'flex';
                navCta.style.position = 'absolute';
                navCta.style.top = '220px';
                navCta.style.left = '0';
                navCta.style.width = '100%';
                navCta.style.justifyContent = 'center';
                navCta.style.background = 'rgba(10, 10, 10, 0.95)';
                navCta.style.padding = '0 20px 20px';
            } else {
                navLinks.style.display = '';
                navCta.style.display = '';
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // If mobile menu is open, close it
                if (mobileToggle && mobileToggle.classList.contains('active')) {
                    mobileToggle.click();
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Tooth Scroll Animation Logic ---
    const FRAME_COUNT = 150; // Compressed to 150 frames as requested
    const TOTAL_RAW_FRAMES = 192;
    const canvas = document.getElementById('tooth-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const heroLoading = document.getElementById('hero-loading');
    const heroScrollSection = document.getElementById('hero-scroll');
    const heroText = document.getElementById('hero-text');

    let images = new Array(FRAME_COUNT);
    let currentProgress = 0;

    const loadingScreen = document.getElementById('lux-loading-screen');
    const loadingPct = document.getElementById('loading-percentage');
    const loadingTxt = document.getElementById('loading-text');

    let loadedCount = 0;

    const updateLoadingUI = () => {
        loadedCount++;
        const pct = Math.floor((loadedCount / FRAME_COUNT) * 100);
        if (loadingPct) loadingPct.textContent = `${pct}%`;
        
        if (loadingTxt) {
            if (pct > 85) loadingTxt.textContent = "Initializing LuxDent OS...";
            else if (pct > 50) loadingTxt.textContent = "Syncing Digital Vault...";
            else if (pct > 20) loadingTxt.textContent = "Loading Radiography Engine...";
        }

        if (loadedCount >= FRAME_COUNT) {
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.pointerEvents = 'none';
                    setTimeout(() => loadingScreen.style.display = 'none', 1000);
                }
                renderFrame(currentProgress);
            }, 600); // slight pause to let user see 100%
        }
    };

    const loadRemainingFrames = () => {
        for(let i = 1; i < FRAME_COUNT; i++) {
            const img = new Image();
            const frameWanted = Math.floor((i / (FRAME_COUNT - 1)) * (TOTAL_RAW_FRAMES - 1)) + 1;
            const padIndex = String(frameWanted).padStart(5, '0');
            
            img.onload = () => {
                const targetFrameIndex = Math.min(FRAME_COUNT - 1, Math.floor(currentProgress * FRAME_COUNT));
                if (i === targetFrameIndex && lastRenderedFrame !== targetFrameIndex) {
                    renderFrame(currentProgress);
                }
                updateLoadingUI();
            };
            img.onerror = () => {
                updateLoadingUI();
            };
            
            img.src = `assets/tooth/${padIndex}.png`;
            images[i] = img;
        }
    };

    // Load compressed 150 frames mapping across the total 192, prioritizing the first frame
    const firstImg = new Image();
    firstImg.fetchPriority = 'high';
    firstImg.src = `assets/tooth/00001.png`;
    firstImg.onload = () => {
        initCanvas();
        updateLoadingUI();
        loadRemainingFrames();
    };
    firstImg.onerror = () => {
        initCanvas();
        updateLoadingUI();
        loadRemainingFrames();
    };
    images[0] = firstImg;

    let lastRenderedFrame = -1;

    function renderFrame(progress) {
        // Clamp progress
        progress = Math.max(0, Math.min(1, progress));
        currentProgress = progress;
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        if (frameIndex === lastRenderedFrame) return;

        const img = images[frameIndex];
        if (!img || !img.complete || !img.naturalWidth) return;

        lastRenderedFrame = frameIndex;

        // Ensure canvas width height exactly matched the rendered DOM size for retina displays
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;

        // Force high-quality upscaling algorithmic rendering (fix pixelation)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect ratio contain logic
        // We calculate source height as img.height * 0.90 to crop out the VEO watermark perfectly
        const sx = 0;
        const sy = 0;
        const sw = img.width;
        const sh = img.height * 0.90; 

        const scale = Math.min(canvas.width / sw, canvas.height / sh); // Reverted to native full-bounds size
        const cw = sw * scale;
        const ch = sh * scale;
        const cx = (canvas.width - cw) / 2;
        const cy = (canvas.height - ch) / 2;

        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);

        // Feather the sharp cropped bottom edge directly on the canvas bounds
        const featherHeight = ch * 0.15; // Feather the bottom 15% of the drawn image
        ctx.globalCompositeOperation = 'destination-out';
        const gradient = ctx.createLinearGradient(0, cy + ch - featherHeight, 0, cy + ch);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)'); // Erases the image completely at the edge
        ctx.fillStyle = gradient;
        ctx.fillRect(cx, cy + ch - featherHeight, cw, featherHeight);
        ctx.globalCompositeOperation = 'source-over'; // Reset

        // Map text opacities according to progress (beat fading)
        if (progress > 0.15) {
            heroText.style.opacity = '0';
            heroText.style.pointerEvents = 'none';
        } else {
            heroText.style.opacity = '1';
            heroText.style.pointerEvents = 'auto';
            heroText.style.transform = `translateY(${progress * -100}px)`;
        }
        
        // Smoothly fade out the readability scrim after the text has started fading
        const textScrim = document.getElementById('text-scrim');
        if (textScrim) {
            // Begins fading at 0.1 progress, fully transparent by 0.3 progress
            const scrimOpacity = Math.max(0, Math.min(1, 1 - (progress - 0.1) * 5));
            textScrim.style.opacity = scrimOpacity;
        }

        canvas.style.opacity = '1'; // Fade in the canvas if it isn't
    }

    function initCanvas() {
        // Hide loader
        heroLoading.style.opacity = '0';
        setTimeout(() => heroLoading.style.display = 'none', 500);

        // Initial render
        renderFrame(0);

        // Handle Scroll to map to frames
        window.addEventListener('scroll', () => {
            // Get scroll progress specific to the hero section
            const rect = heroScrollSection.getBoundingClientRect();
            // Start scrolling the animation when the hero reaches the top of the viewport
            // Since it's sticky, we track how far its bottom is from the top of the viewport
            const scrollDistance = heroScrollSection.offsetHeight - window.innerHeight;
            const scrolledPixels = -rect.top;
            
            let progress = scrolledPixels / scrollDistance;
            renderFrame(progress);
        });

        // Handle resize re-render
        window.addEventListener('resize', () => {
            lastRenderedFrame = -1; // force render
            const rect = heroScrollSection.getBoundingClientRect();
            const scrollDistance = heroScrollSection.offsetHeight - window.innerHeight;
            const progress = -rect.top / scrollDistance;
            renderFrame(progress);
        });
    }

});
