// Main JavaScript for wedding website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initEnhancedSlideshows();
    initSmoothScroll();
    initMobileMenu();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background when scrolled
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 254, 245, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 254, 245, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
    });
}

// Enhanced Slideshow functionality with smart orientation and blur background
function initEnhancedSlideshows() {
    const slideshows = document.querySelectorAll('.hero-slideshow, .proposal-slideshow, .gallery-slideshow');
    
    slideshows.forEach(slideshow => {
        const slides = slideshow.querySelectorAll('.slide, .proposal-slide, .gallery-slide');
        
        if (slides.length > 0) {
            // Initialize the slideshow
            createSmartSlideshow(slideshow, slides);
        }
    });
}

function createSmartSlideshow(container, slides) {
    let currentSlide = 0;
    let isTransitioning = false;
    let slideTimeouts = [];
    let currentVideo = null;
    
    // Create slideshow structure
    const slideshowInner = document.createElement('div');
    slideshowInner.className = 'slideshow-inner';
    
    // Move all slides into the inner container
    slides.forEach(slide => {
        slideshowInner.appendChild(slide);
    });
    
    container.appendChild(slideshowInner);
    
    // Make container flexible
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.width = '100%';
    
    // Create navigation
    const navContainer = document.createElement('div');
    navContainer.className = 'slideshow-nav';
    
    slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        
        if (index === 0) {
            dot.classList.add('active');
        }
        
        dot.addEventListener('click', () => {
            if (!isTransitioning && index !== currentSlide) {
                goToSlide(index);
            }
        });
        
        navContainer.appendChild(dot);
    });
    
    container.appendChild(navContainer);
    
    // Function to detect orientation and aspect ratio
    function getSlideInfo(slide) {
        const img = slide.querySelector('img');
        const video = slide.querySelector('video');
        
        if (img && img.complete) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            return {
                type: 'image',
                orientation: aspectRatio > 1.1 ? 'landscape' : aspectRatio < 0.9 ? 'portrait' : 'square',
                aspectRatio: aspectRatio,
                width: img.naturalWidth,
                height: img.naturalHeight
            };
        } else if (video && video.videoWidth) {
            const aspectRatio = video.videoWidth / video.videoHeight;
            return {
                type: 'video',
                orientation: aspectRatio > 1.1 ? 'landscape' : aspectRatio < 0.9 ? 'portrait' : 'square',
                aspectRatio: aspectRatio,
                width: video.videoWidth,
                height: video.videoHeight
            };
        }
        
        return {
            type: 'unknown',
            orientation: 'landscape',
            aspectRatio: 16/9
        };
    }
    
    // Function to create blur background for portrait/square images
    function createBlurBackground(slide, mediaElement) {
        // Remove existing blur background
        const existingBlur = slide.querySelector('.blur-background');
        if (existingBlur) {
            existingBlur.remove();
        }
        
        const slideInfo = getSlideInfo(slide);
        
        // Only create blur background for non-landscape images
        if (slideInfo.orientation !== 'landscape' && slideInfo.type === 'image') {
            const blurBg = document.createElement('div');
            blurBg.className = 'blur-background';
            
            // Create a blurred version of the same image
            const blurImg = document.createElement('img');
            blurImg.src = mediaElement.src;
            blurImg.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                filter: blur(20px);
                transform: scale(1.1);
                opacity: 0.7;
            `;
            
            blurBg.appendChild(blurImg);
            slide.insertBefore(blurBg, slide.firstChild);
        }
    }
    
    // Function to calculate optimal container height
    function calculateOptimalHeight(slideInfo) {
        const containerWidth = container.offsetWidth;
        const maxHeight = window.innerHeight * 0.8; // Max 80% of viewport
        const minHeight = 300; // Minimum height
        
        let calculatedHeight;
        
        if (slideInfo.orientation === 'landscape') {
            // For landscape, use aspect ratio to calculate height
            calculatedHeight = containerWidth / slideInfo.aspectRatio;
        } else if (slideInfo.orientation === 'portrait') {
            // For portrait, limit height to prevent extremely tall containers
            calculatedHeight = Math.min(containerWidth * 1.2, containerWidth / slideInfo.aspectRatio * 0.8);
        } else {
            // For square, use a balanced height
            calculatedHeight = containerWidth * 0.8;
        }
        
        // Ensure height is within bounds
        return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
    }
    
    // Function to prepare slide styling
    function prepareSlideStyling() {
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            const video = slide.querySelector('video');
            
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.height = '100%';
            slide.style.opacity = '0';
            slide.style.transition = 'opacity 0.8s ease-in-out';
            slide.style.display = 'flex';
            slide.style.alignItems = 'center';
            slide.style.justifyContent = 'center';
            
            // Handle image sizing with smart orientation
            if (img) {
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                img.style.objectPosition = 'center';
                
                // Create blur background for non-landscape images
                img.addEventListener('load', () => {
                    createBlurBackground(slide, img);
                });
            }
            
            // Handle video sizing
            if (video) {
                video.style.maxWidth = '100%';
                video.style.maxHeight = '100%';
                video.style.objectFit = 'contain';
                video.style.objectPosition = 'center';
                video.muted = true;
                video.playsInline = true;
                
                // Update when video metadata loads
                video.addEventListener('loadedmetadata', () => {
                    updateContainerHeight();
                });
            }
        });
    }
    
    // Function to update container height based on current slide
    function updateContainerHeight() {
        const currentSlideEl = slides[currentSlide];
        const slideInfo = getSlideInfo(currentSlideEl);
        
        const optimalHeight = calculateOptimalHeight(slideInfo);
        container.style.height = optimalHeight + 'px';
        
        // Adjust inner container positioning
        slideshowInner.style.height = '100%';
        slideshowInner.style.display = 'flex';
        slideshowInner.style.alignItems = 'center';
        slideshowInner.style.justifyContent = 'center';
    }
    
    // Function to get slide duration
    function getSlideDuration(slide) {
        const img = slide.querySelector('img');
        const video = slide.querySelector('video');
        
        if (video) {
            // For videos, use video duration or minimum 4 seconds
            const duration = video.duration || 4;
            return Math.max(duration, 4) * 1000;
        } else if (img) {
            // For images, display for at least 4 seconds
            return 4000; // 4 seconds minimum
        }
        return 4000;
    }
    
    // Function to go to a specific slide
    function goToSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        
        isTransitioning = true;
        
        // Clear any existing timeouts
        slideTimeouts.forEach(timeout => clearTimeout(timeout));
        slideTimeouts = [];
        
        // Pause current video if playing
        if (currentVideo && !currentVideo.paused) {
            currentVideo.pause();
            currentVideo.currentTime = 0;
        }
        
        // Hide current slide
        slides[currentSlide].style.opacity = '0';
        
        // Update current slide
        currentSlide = index;
        
        // Show new slide
        const newSlide = slides[currentSlide];
        newSlide.style.opacity = '1';
        
        // Update navigation
        const dots = navContainer.querySelectorAll('.nav-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
        
        // Update container height
        updateContainerHeight();
        
        // Handle video playback
        const video = newSlide.querySelector('video');
        if (video) {
            currentVideo = video;
            video.play().catch(e => {
                console.log('Autoplay prevented, waiting for user interaction');
            });
            
            // Set timeout to next slide after video ends
            const duration = getSlideDuration(newSlide);
            const timeout = setTimeout(() => {
                goToNextSlide();
            }, duration);
            slideTimeouts.push(timeout);
        } else {
            currentVideo = null;
            
            // Set timeout to next slide for images
            const duration = getSlideDuration(newSlide);
            const timeout = setTimeout(() => {
                goToNextSlide();
            }, duration);
            slideTimeouts.push(timeout);
        }
        
        isTransitioning = false;
    }
    
    // Function to go to next slide
    function goToNextSlide() {
        const nextSlide = (currentSlide + 1) % slides.length;
        goToSlide(nextSlide);
    }
    
    // Handle video ended event
    slides.forEach(slide => {
        const video = slide.querySelector('video');
        if (video) {
            video.addEventListener('ended', () => {
                // Only advance if this is the current slide
                if (slide === slides[currentSlide] && !isTransitioning) {
                    goToNextSlide();
                }
            });
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        updateContainerHeight();
    }, 250));
    
    // Initialize
    prepareSlideStyling();
    
    // Start with first slide
    setTimeout(() => {
        slides[0].style.opacity = '1';
        updateContainerHeight();
        
        // Auto-advance for first slide
        const duration = getSlideDuration(slides[0]);
        const timeout = setTimeout(() => {
            goToNextSlide();
        }, duration);
        slideTimeouts.push(timeout);
    }, 100);
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// Gallery toggle functionality
document.addEventListener('click', function(e) {
    if (e.target.matches('.gallery-toggle') || e.target.closest('.gallery-toggle')) {
        const toggle = e.target.matches('.gallery-toggle') ? e.target : e.target.closest('.gallery-toggle');
        const view = toggle.dataset.view;
        
        // Update active button
        document.querySelectorAll('.gallery-toggle').forEach(t => t.classList.remove('active'));
        toggle.classList.add('active');
        
        // Toggle views
        const slideshow = document.getElementById('gallery-slideshow');
        const grid = document.getElementById('gallery-grid');
        
        if (view === 'slideshow') {
            slideshow.style.display = 'block';
            grid.style.display = 'none';
        } else {
            slideshow.style.display = 'none';
            grid.style.display = 'grid';
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.section-header, .story-section, .pov-card, .event-card, .registry-card, .asoebi-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Auto-resize textarea for admin form
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
});

// Countdown functionality
function updateCountdown() {
    const weddingDate = new Date('2026-03-07T13:00:00');
    const now = new Date();
    const diff = weddingDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
const handleResize = debounce(function() {
    // Recalculate any layout-dependent elements
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    document.documentElement.style.setProperty('--navbar-height', navbarHeight + 'px');
}, 250);

window.addEventListener('resize', handleResize);

// Preload images for better performance
function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

// Add loading states
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Smooth reveal animations
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    revealOnScroll();
});

// Export functions for potential external use
window.weddingSite = {
    updateCountdown,
    debounce,
    preloadImage,
    validateEmail,
    validatePhone
};