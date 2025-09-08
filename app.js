// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTopBtn = document.getElementById('back-to-top');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const loadingSpinner = submitBtn.querySelector('.loading-spinner');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeFormHandling();
    initializeBackToTop();
    initializeSkillsInteraction();
    initializeLazyLoading();
    initializeFocusManagement();
    logPerformanceMetrics();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navbar.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Smooth scrolling for navigation links - FIXED
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Handle both #section and section formats
            const cleanTargetId = targetId.startsWith('#') ? targetId.substring(1) : targetId;
            const targetElement = document.getElementById(cleanTargetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight || 70;
                const offsetTop = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // Also handle hero section buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        if (button.getAttribute('href') && button.getAttribute('href').startsWith('#')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = navbar.offsetHeight || 70;
                    const offsetTop = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: Math.max(0, offsetTop),
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Update active navigation link based on scroll position
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

// Scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.pageYOffset;
        
        // Navbar background change on scroll
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        const heroBackground = document.querySelector('.hero-background');
        if (hero && heroBackground) {
            const scrollPercent = scrollTop / (hero.offsetHeight / 2);
            heroBackground.style.transform = `translateY(${scrollPercent * 50}px)`;
        }
        
        // Back to top button visibility - FIXED
        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    }, 16)); // ~60fps
}

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollTop = window.pageYOffset + 100; // Offset for navbar height

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
            // Remove active class from all nav links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current nav link
            if (correspondingNavLink) {
                correspondingNavLink.classList.add('active');
            }
        }
    });
}

// Initialize animations with Intersection Observer
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation classes and observe elements
    const elementsToAnimate = [
        { selector: '.section-header', class: 'fade-in' },
        { selector: '.about-text', class: 'slide-in-left' },
        { selector: '.skills-grid', class: 'slide-in-right' },
        { selector: '.project-card', class: 'fade-in' },
        { selector: '.contact-info', class: 'slide-in-left' },
        { selector: '.contact-form', class: 'slide-in-right' }
    ];

    elementsToAnimate.forEach(({ selector, class: animationClass }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.classList.add(animationClass);
            element.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(element);
        });
    });

    // Animate skill items with stagger effect
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.classList.add('fade-in');
        item.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(item);
    });

    // Animate project cards with stagger effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });
}

// Form handling with validation
function initializeFormHandling() {
    if (!contactForm) return;
    
    const formFields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        subject: document.getElementById('subject'),
        message: document.getElementById('message')
    };

    const errorElements = {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        subject: document.getElementById('subject-error'),
        message: document.getElementById('message-error')
    };

    // Real-time validation
    Object.keys(formFields).forEach(fieldName => {
        const field = formFields[fieldName];
        const errorElement = errorElements[fieldName];

        if (field && errorElement) {
            field.addEventListener('blur', function() {
                validateField(fieldName, field.value, errorElement);
            });

            field.addEventListener('input', function() {
                if (errorElement.textContent) {
                    validateField(fieldName, field.value, errorElement);
                }
            });
        }
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const formValues = {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            subject: formData.get('subject')?.trim() || '',
            message: formData.get('message')?.trim() || ''
        };

        let isFormValid = true;

        // Validate all fields
        Object.keys(formValues).forEach(fieldName => {
            const errorElement = errorElements[fieldName];
            if (errorElement) {
                const isValid = validateField(fieldName, formValues[fieldName], errorElement);
                if (!isValid) {
                    isFormValid = false;
                }
            }
        });

        if (isFormValid) {
            handleFormSubmission(formValues);
        } else {
            // Scroll to first error field
            const firstErrorField = contactForm.querySelector('.form-control:invalid, .form-control[style*="border-color: rgba(239, 68, 68"]');
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// Field validation function
function validateField(fieldName, value, errorElement) {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
            break;

        case 'email':
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;

        case 'subject':
            if (!value) {
                errorMessage = 'Subject is required';
                isValid = false;
            } else if (value.length < 5) {
                errorMessage = 'Subject must be at least 5 characters';
                isValid = false;
            }
            break;

        case 'message':
            if (!value) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters';
                isValid = false;
            }
            break;
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
        
        const field = document.getElementById(fieldName);
        if (field) {
            if (isValid) {
                field.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                errorElement.style.display = 'none';
            } else {
                field.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                errorElement.style.display = 'block';
            }
        }
    }

    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
async function handleFormSubmission(formData) {
    try {
        // Show loading state
        setLoadingState(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Log form data (in real app, this would be sent to a server)
        console.log('Form submitted with data:', formData);

        // Show success message
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Reset field borders
        const formFields = contactForm.querySelectorAll('.form-control');
        formFields.forEach(field => {
            field.style.borderColor = '';
        });

    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('There was an error sending your message. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state for form submission
function setLoadingState(isLoading) {
    if (!submitBtn || !btnText || !loadingSpinner) return;
    
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        submitBtn.style.opacity = '1';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 0.5rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                min-width: 300px;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }
            
            .notification--success {
                border-left: 4px solid #22c55e;
            }
            
            .notification--error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
            }
            
            .notification-message {
                color: #1f2937;
                font-weight: 500;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                margin-left: 1rem;
                transition: color 0.2s;
            }
            
            .notification-close:hover {
                color: #374151;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add notification to DOM
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Initialize back to top button - FIXED
function initializeBackToTop() {
    if (!backToTopBtn) return;
    
    // Ensure initial state is correct
    backToTopBtn.classList.remove('show');
    
    // Handle click event
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide based on scroll position
    function updateBackToTopVisibility() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    // Initial check
    updateBackToTopVisibility();
    
    // Listen to scroll events
    window.addEventListener('scroll', throttle(updateBackToTopVisibility, 100));
}

// Skills interaction
function initializeSkillsInteraction() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(skill => {
        skill.addEventListener('mouseenter', function() {
            const skillName = this.dataset.skill;
            this.style.transform = 'translateY(-10px) scale(1.05)';
            
            // Add tooltip effect
            if (!this.querySelector('.skill-tooltip')) {
                const tooltip = document.createElement('div');
                tooltip.className = 'skill-tooltip';
                tooltip.textContent = `Click to learn more about ${skillName}`;
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s;
                `;
                this.style.position = 'relative';
                this.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 100);
            }
        });

        skill.addEventListener('mouseleave', function() {
            this.style.transform = '';
            const tooltip = this.querySelector('.skill-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => tooltip.remove(), 200);
            }
        });

        skill.addEventListener('click', function() {
            const skillName = this.dataset.skill;
            showNotification(`${skillName} is one of my core technologies! Let's discuss how I can use it in your project.`, 'info');
        });
    });
}

// Enhanced project image lazy loading
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    img.onload = function() {
                        img.style.opacity = '1';
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Project card interactions
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add loading animation to project links
        const projectLinks = card.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add loading effect
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                this.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.pointerEvents = 'auto';
                    showNotification('Demo will be available soon! Check back later.', 'info');
                }, 1000);
            });
        });
    });
});

// Utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Enter key on project cards
    if (e.key === 'Enter' && e.target.classList.contains('project-card')) {
        e.target.click();
    }
});

// Add focus management for accessibility
function initializeFocusManagement() {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusableContent = document.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Performance monitoring
function logPerformanceMetrics() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                    console.log('DOM content loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
                }
            }, 0);
        });
    }
}

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment if you want to add a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}