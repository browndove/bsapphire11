document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Background Visuals (Subtle Tech Particles) --- */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function init() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            // Low density for minimalist feel
            const pCount = Math.floor((width * height) / 18000);
            
            for (let i = 0; i < pCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.5,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3
                });
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                
                // Draw point
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 180) {
                        ctx.beginPath();
                        ctx.lineWidth = 0.5;
                        // Extremely subtle white lines
                        let alpha = 0.1 - (dist / 1800);
                        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
                        
                        // Very rare sapphire shimmer
                        if (i % 8 === 0 && j % 8 === 0) {
                            ctx.strokeStyle = `rgba(15, 82, 186, ${alpha * 2})`;
                        }
                        
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        
        window.addEventListener('resize', init);
        init();
        animate();
    }

    /* --- 2. Scroll Animations (Colab Inspired) --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const elementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Target both fade and slide animations
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-up');
    animatedElements.forEach(el => elementObserver.observe(el));


    /* --- 3. Sticky Header Adjustments --- */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* --- 4. Smooth Scrolling for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });
});


/* --- 5. Cookie Consent Banner --- */
document.addEventListener('DOMContentLoaded', () => {
    // Inject Banner HTML
    const bannerHTML = `
        <div id="cookie-banner" class="cookie-banner">
            <div class="cookie-text">
                <p>We use cookies to analyze site performance and deliver personalized content. By clicking "Accept", you agree to our use of cookies.</p>
            </div>
            <div class="cookie-buttons">
                <button id="cookie-accept" class="btn btn-primary">Accept</button>
                <button id="cookie-decline" class="btn btn-outline">Decline</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');
    const manageLinks = document.querySelectorAll('#manage-cookies-link');

    // Check if consent has already been given
    const cookieConsent = localStorage.getItem('blvcksapphire_cookie_consent');

    if (!cookieConsent) {
        // Show banner after short delay
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1500);
    }

    // Accept Cookies
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('blvcksapphire_cookie_consent', 'accepted');
        cookieBanner.classList.remove('show');
        setTimeout(() => { cookieBanner.style.display = 'none'; }, 300);
    });

    // Decline Cookies
    declineBtn.addEventListener('click', () => {
        localStorage.setItem('blvcksapphire_cookie_consent', 'declined');
        cookieBanner.classList.remove('show');
        setTimeout(() => { cookieBanner.style.display = 'none'; }, 300);
    });

    // Trigger Banner from Manage Cookies Link
    manageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            cookieBanner.style.display = 'flex';
            // slight delay to allow display to trigger before class addition for transition
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 10);
        });
    });
});


// Scroll to Top Button
const scrollTopBtn = document.createElement('div');
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.innerHTML = '&#8593;';
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(nav.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const navList = document.querySelector('.nav-list');
    const headerActions = document.querySelector('.header-actions');
    if (navList && headerActions) {
        const clonedActions = headerActions.cloneNode(true);
        clonedActions.classList.add('mobile-nav-actions');
        clonedActions.style.display = 'flex';
        clonedActions.style.flexDirection = 'column';
        clonedActions.style.marginTop = '1rem';
        const menuBtn = clonedActions.querySelector('.mobile-menu-btn');
        if(menuBtn) menuBtn.remove();
        
        const li = document.createElement('li');
        li.classList.add('mobile-only');
        li.appendChild(clonedActions);
        navList.appendChild(li);
    }
});
