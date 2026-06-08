// Mobile Menu Toggle
console.log('[script] script.js loaded');
window.addEventListener('error', function(e){
    try { console.error('[script] window error:', e && e.message); } catch(_){}
});
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Footer resource modals (ensure handlers run early)
document.querySelectorAll('.resource-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation && e.stopImmediatePropagation();
        const id = this.dataset && this.dataset.modal;
        if (!id) return;
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        // after opening, sync accept button state and attach handlers
        syncModalButtons(modal);
    });
});

// Modal close handlers (overlay and close button)
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.hasAttribute('data-close')) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        }
    });
    const btn = modal.querySelector('.modal-close');
    if (btn) btn.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    });
});

// Sync modal buttons: initialize Accept disabled state, wire checkbox change and Cancel
function syncModalButtons(modal) {
    if (!modal) return;
    try {
        const body = modal.querySelector('.modal-body');
        if (!body) return;
        const checkbox = body.querySelector('input[type="checkbox"]');
        // primary accept button by ID or fallback to last button in body
        let acceptBtn = body.querySelector('button[id$="-accept-btn"]');
        const buttons = Array.from(body.querySelectorAll('button'));
        let cancelBtn = null;
        if (buttons.length) {
            // heuristic: first button is Cancel, last is Accept if acceptBtn not found
            cancelBtn = buttons[0];
            if (!acceptBtn && buttons.length > 1) acceptBtn = buttons[buttons.length - 1];
        }

        if (acceptBtn) {
            // initialize disabled state
            acceptBtn.disabled = !(checkbox && checkbox.checked);
            // ensure readable cursor
            acceptBtn.style.cursor = checkbox && checkbox.checked ? 'pointer' : 'not-allowed';
            // attach change listener once
            if (checkbox && !checkbox.dataset._bound) {
                checkbox.addEventListener('change', () => {
                    acceptBtn.disabled = !checkbox.checked;
                    acceptBtn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
                });
                checkbox.dataset._bound = '1';
            }
            // Accept button closes modal when clicked (only when enabled)
            if (!acceptBtn.dataset._closeBound) {
                acceptBtn.addEventListener('click', (e) => {
                    if (acceptBtn.disabled) return;
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                });
                acceptBtn.dataset._closeBound = '1';
            }
        }

        if (cancelBtn && !cancelBtn.dataset._cancelBound) {
            cancelBtn.addEventListener('click', (e) => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
            });
            cancelBtn.dataset._cancelBound = '1';
        }
    } catch (err) {
        console.error('syncModalButtons error', err);
    }
}

// Initialize existing modals on load (in case checkboxes are pre-checked)
document.querySelectorAll('.modal').forEach(m => syncModalButtons(m));

// Optional form submission handling if a contact form exists
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Add scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service cards for animation
document.querySelectorAll('.service-card').forEach(card => {
    // Leave opacity controlled by CSS/animation. Observe for animation trigger.
    observer.observe(card);
});

// FABRIC project slider: show one image, cycle on Next/Prev, loop
(function(){
    function initFabricSlider(){
        const slider = document.querySelector('.project-slider[data-images]');
        if(!slider) return;
        let images;
        try{
            images = JSON.parse(slider.getAttribute('data-images'));
        }catch(e){
            return;
        }
        const imgEls = Array.from(slider.querySelectorAll('.slider-img'));
        const nextBtn = slider.querySelector('.slider-next');
        const prevBtn = slider.querySelector('.slider-prev');
        let idx = 0;
        const slotCount = Math.max(1, imgEls.length);
        function show(i){
            // set current index (wrap)
            idx = ((i % images.length) + images.length) % images.length;
            // Use first slot as visible image; second slot kept for preloading next image
            const visible = imgEls[0];
            const preload = imgEls[1];
            if(visible){
                visible.src = images[idx];
                visible.classList.add('active');
                visible.onerror = function(){ this.onerror=null; this.src='https://via.placeholder.com/500x400?text=No+Image'; };
            }
            if(preload){
                const nextIndex = (idx + 1) % images.length;
                preload.src = images[nextIndex];
                preload.classList.remove('active');
                preload.onerror = function(){ this.onerror=null; this.src='https://via.placeholder.com/500x400?text=No+Image'; };
            }
        }
        nextBtn && nextBtn.addEventListener('click', function(){ show(idx+1); });
        prevBtn && prevBtn.addEventListener('click', function(){ show(idx-1); });
        // keyboard support
        slider.addEventListener('keydown', function(e){
            if(e.key === 'ArrowRight') nextBtn && nextBtn.click();
            if(e.key === 'ArrowLeft') prevBtn && prevBtn.click();
        });
        // initialize
        show(0);
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFabricSlider);
    else initFabricSlider();
})();
// Generic project-card slider: for cards that include multiple <img class="slider-img"> elements
(function(){
    function initProjectCardSliders(){
        console.log('[slider] initProjectCardSliders running');
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            // debug: log card found
            // eslint-disable-next-line no-console
            console.log('[slider] found project-card', card);
            const imgs = Array.from(card.querySelectorAll('.project-image .slider-img'));
            if(!imgs || imgs.length <= 1) {
                // no multiple slider images here
                // eslint-disable-next-line no-console
                console.log('[slider] skipping card (imgs <=1)', imgs.length);
                return;
            }

            // hide all images except the first
            imgs.forEach((img, i) => {
                img.style.display = (i === 0) ? 'block' : 'none';
                img.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
            });

            // track current visible index on the card element
            let current = 0;

            const nextBtn = card.querySelector('.next-button, .project-next-btn');
            if(!nextBtn) {
                // eslint-disable-next-line no-console
                console.log('[slider] no next button found for this card');
                return;
            }

            // eslint-disable-next-line no-console
            console.log('[slider] attaching click to nextBtn for', card);

            nextBtn.addEventListener('click', () => {
                // eslint-disable-next-line no-console
                console.log('[slider] next clicked (current ->)', current);
                // hide current
                imgs[current].style.display = 'none';
                imgs[current].setAttribute('aria-hidden', 'true');
                // advance index (wrap)
                current = (current + 1) % imgs.length;
                // show new current
                imgs[current].style.display = 'block';
                imgs[current].setAttribute('aria-hidden', 'false');
            });
        });
    }

    // expose for manual testing from console
    try{ window.initProjectCardSliders = initProjectCardSliders; }catch(e){}
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProjectCardSliders);
    else initProjectCardSliders();
})();
/**
 * Try loading the first reachable image from `candidates` into the provided img element.
 * Each candidate is URL-encoded before testing. On success, the img.src is set.
 * If none succeed, a placeholder is used.
 */
function loadImageCandidates(imgEl, candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        imgEl.src = 'https://via.placeholder.com/500x400?text=No+Image';
        return;
    }

    let tried = 0;

    function tryNext() {
        if (tried >= candidates.length) {
            imgEl.src = 'https://via.placeholder.com/500x400?text=No+Image';
            return;
        }

        const candidate = candidates[tried];
        // Encode spaces and special characters for URL use
        const encoded = encodeURI(candidate);
        const tester = new Image();
        tester.onload = function () {
            imgEl.src = encoded;
        };
        tester.onerror = function () {
            tried += 1;
            tryNext();
        };
        tester.src = encoded;
    }

    tryNext();
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'project-image';
    const image = document.createElement('img');
    image.alt = project.title;
    // Try to load the first available image from the project's image candidates.
    loadImageCandidates(image, project.images);
    imageWrapper.appendChild(image);

    const details = document.createElement('div');
    details.className = 'project-details';

    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const title = document.createElement('h3');
    title.textContent = project.title;
    const categories = document.createElement('div');
    categories.className = 'project-category';
    categories.innerHTML = project.categories.map(category => `<span class="badge">${category}</span>`).join('');
    meta.appendChild(title);
    meta.appendChild(categories);

    const description = document.createElement('p');
    description.textContent = project.description;

    const tech = document.createElement('p');
    tech.className = 'tech-stack';
    tech.innerHTML = `<strong>Technologies:</strong> ${project.tech}`;

    const nextButton = document.createElement('button');
    nextButton.className = 'project-next-btn';
    nextButton.textContent = 'Next Image';
    let imageIndex = 0;
    nextButton.addEventListener('click', () => {
        imageIndex = (imageIndex + 1) % project.images.length;
        // Attempt to load the selected image; if it fails, load the next available fallback.
        // Start searching from the newly selected index through the list once.
        const rotated = project.images.slice(imageIndex).concat(project.images.slice(0, imageIndex));
        loadImageCandidates(image, rotated);
    });

    details.appendChild(meta);
    details.appendChild(description);
    details.appendChild(tech);
    details.appendChild(nextButton);
    card.appendChild(imageWrapper);
    card.appendChild(details);

    return card;
}

// Dynamic project rendering removed — projects are now static in HTML.

// FABRIC image rotator: cycles through a list of candidate images when the Next Image button is clicked.
;(function setupFabricRotator(){
    const img = document.getElementById('fabricMainImg');
    const btn = document.getElementById('fabricNextBtn');
    if (!img || !btn) return;

    const candidates = [
        './assets/img/ARNOKS APP.png',
        './assets/img/fabric-exhibit.jpg',
        './assets/img/fabric-landing.png',
        './assets/fabric-texmap.png'
    ];
    let idx = 0;

    function setSrcFromCandidates(startIndex) {
        let tried = 0;
        const total = candidates.length;
        function tryOne(i) {
            if (tried >= total) {
                img.src = 'https://via.placeholder.com/500x400?text=No+Image';
                return;
            }
            const candidate = candidates[i % total];
            const encoded = encodeURI(candidate);
            const tester = new Image();
            tester.onload = function(){ img.src = encoded; };
            tester.onerror = function(){ tried++; tryOne(i+1); };
            tester.src = encoded;
        }
        tryOne(startIndex);
    }

    btn.addEventListener('click', () => {
        idx = (idx + 1) % candidates.length;
        setSrcFromCandidates(idx);
    });
})();

// Download CV Button: let the anchor's native behavior handle downloads (no interception)
// The link is set to `assets/CV.png` with a `download` attribute in HTML.