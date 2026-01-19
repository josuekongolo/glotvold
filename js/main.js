/* ==========================================================================
   Gløtvold - Main JavaScript
   ========================================================================== */

(function() {
    'use strict';

    /* --------------------------------------------------------------------------
       DOM Elements
       -------------------------------------------------------------------------- */
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const contactForm = document.getElementById('contact-form');

    /* --------------------------------------------------------------------------
       Mobile Navigation
       -------------------------------------------------------------------------- */
    function initMobileNav() {
        if (!menuToggle || !mobileNav) return;

        menuToggle.addEventListener('click', function() {
            const isOpen = mobileNav.classList.toggle('open');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav__link');
        mobileNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* --------------------------------------------------------------------------
       Header Scroll Effect
       -------------------------------------------------------------------------- */
    function initHeaderScroll() {
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 50;

        function updateHeader() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }

        // Throttle scroll event
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        updateHeader();
    }

    /* --------------------------------------------------------------------------
       Smooth Scroll for Anchor Links
       -------------------------------------------------------------------------- */
    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       Contact Form Handling
       -------------------------------------------------------------------------- */
    function initContactForm() {
        if (!contactForm) return;

        const formFields = {
            name: contactForm.querySelector('#name'),
            email: contactForm.querySelector('#email'),
            phone: contactForm.querySelector('#phone'),
            address: contactForm.querySelector('#address'),
            projectType: contactForm.querySelector('#projectType'),
            description: contactForm.querySelector('#description'),
            siteVisit: contactForm.querySelector('#siteVisit')
        };

        const submitBtn = contactForm.querySelector('.btn[type="submit"]');
        const formSuccess = document.createElement('div');
        formSuccess.className = 'form-success';
        formSuccess.style.display = 'none';
        formSuccess.innerHTML = `
            <h3>Takk for din henvendelse!</h3>
            <p>Vi har mottatt meldingen din og vil kontakte deg så snart som mulig, vanligvis innen én dag.</p>
            <p>Haster det? Ring oss direkte på <a href="tel:+47900XXXXX" style="color: white; text-decoration: underline;">900 XX XXX</a>.</p>
        `;
        contactForm.insertBefore(formSuccess, contactForm.firstChild);

        // Validation rules
        const validators = {
            name: function(value) {
                if (!value.trim()) return 'Vennligst oppgi ditt navn';
                if (value.trim().length < 2) return 'Navnet må være minst 2 tegn';
                return '';
            },
            email: function(value) {
                if (!value.trim()) return 'Vennligst oppgi din e-postadresse';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Vennligst oppgi en gyldig e-postadresse';
                return '';
            },
            phone: function(value) {
                if (!value.trim()) return 'Vennligst oppgi ditt telefonnummer';
                const phoneRegex = /^[\d\s\+\-]{8,}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Vennligst oppgi et gyldig telefonnummer';
                return '';
            },
            description: function(value) {
                if (!value.trim()) return 'Vennligst beskriv prosjektet ditt';
                if (value.trim().length < 10) return 'Beskrivelsen må være minst 10 tegn';
                return '';
            }
        };

        // Show/hide error message
        function showError(field, message) {
            const formGroup = field.closest('.form-group');
            let errorEl = formGroup.querySelector('.form-error');

            if (message) {
                field.classList.add('error');
                if (!errorEl) {
                    errorEl = document.createElement('span');
                    errorEl.className = 'form-error';
                    formGroup.appendChild(errorEl);
                }
                errorEl.textContent = message;
            } else {
                field.classList.remove('error');
                if (errorEl) {
                    errorEl.remove();
                }
            }
        }

        // Validate single field
        function validateField(fieldName) {
            const field = formFields[fieldName];
            if (!field || !validators[fieldName]) return true;

            const error = validators[fieldName](field.value);
            showError(field, error);
            return !error;
        }

        // Validate all fields
        function validateForm() {
            let isValid = true;

            Object.keys(validators).forEach(function(fieldName) {
                if (!validateField(fieldName)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        // Add blur validation
        Object.keys(validators).forEach(function(fieldName) {
            const field = formFields[fieldName];
            if (field) {
                field.addEventListener('blur', function() {
                    validateField(fieldName);
                });
                // Clear error on input
                field.addEventListener('input', function() {
                    if (field.classList.contains('error')) {
                        validateField(fieldName);
                    }
                });
            }
        });

        // Form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateForm()) {
                // Scroll to first error
                const firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            // Disable submit button and show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sender...';

            // Collect form data
            const formData = {
                name: formFields.name.value.trim(),
                email: formFields.email.value.trim(),
                phone: formFields.phone.value.trim(),
                address: formFields.address ? formFields.address.value.trim() : '',
                projectType: formFields.projectType ? formFields.projectType.value : '',
                description: formFields.description.value.trim(),
                wantSiteVisit: formFields.siteVisit ? formFields.siteVisit.checked : false,
                timestamp: new Date().toISOString()
            };

            try {
                // Simulate API call (replace with actual Resend API integration)
                await simulateFormSubmission(formData);

                // Show success message
                formSuccess.style.display = 'block';

                // Hide form fields
                const formFieldsContainer = contactForm.querySelector('.form-fields');
                if (formFieldsContainer) {
                    formFieldsContainer.style.display = 'none';
                }

                // Hide submit button
                submitBtn.style.display = 'none';

                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error('Form submission error:', error);

                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.style.marginBottom = 'var(--space-lg)';
                errorMessage.textContent = 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.';
                contactForm.insertBefore(errorMessage, contactForm.firstChild);

                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Simulate form submission (replace with actual API call)
    function simulateFormSubmission(data) {
        return new Promise(function(resolve, reject) {
            console.log('Form data submitted:', data);

            // Simulate network delay
            setTimeout(function() {
                // In production, replace with actual Resend API call:
                /*
                fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer YOUR_API_KEY',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'nettside@glotvold.no',
                        to: 'post@glotvold.no',
                        subject: `Ny henvendelse fra ${data.name}`,
                        html: `
                            <h2>Ny henvendelse fra nettsiden</h2>
                            <p><strong>Navn:</strong> ${data.name}</p>
                            <p><strong>E-post:</strong> ${data.email}</p>
                            <p><strong>Telefon:</strong> ${data.phone}</p>
                            <p><strong>Adresse/område:</strong> ${data.address || 'Ikke oppgitt'}</p>
                            <p><strong>Type prosjekt:</strong> ${data.projectType || 'Ikke valgt'}</p>
                            <p><strong>Beskrivelse:</strong></p>
                            <p>${data.description}</p>
                            <p><strong>Ønsker befaring:</strong> ${data.wantSiteVisit ? 'Ja' : 'Nei'}</p>
                        `
                    })
                })
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
                */

                resolve({ success: true });
            }, 1500);
        });
    }

    /* --------------------------------------------------------------------------
       Intersection Observer for Animations
       -------------------------------------------------------------------------- */
    function initAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const animatedElements = document.querySelectorAll('.service-card, .value-card, .feature, .project-card');

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(function(el) {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    /* --------------------------------------------------------------------------
       Click-to-Call Tracking
       -------------------------------------------------------------------------- */
    function initPhoneTracking() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Track phone call clicks (integrate with analytics if needed)
                console.log('Phone call initiated');

                // If using Google Analytics:
                // gtag('event', 'click', { event_category: 'contact', event_label: 'phone' });
            });
        });
    }

    /* --------------------------------------------------------------------------
       Lazy Loading Images
       -------------------------------------------------------------------------- */
    function initLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyImages = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    /* --------------------------------------------------------------------------
       Project Category Filter (for Projects page)
       -------------------------------------------------------------------------- */
    function initProjectFilter() {
        const categoryTags = document.querySelectorAll('.category-tag');
        const projectCards = document.querySelectorAll('.project-card');

        if (!categoryTags.length || !projectCards.length) return;

        categoryTags.forEach(function(tag) {
            tag.addEventListener('click', function() {
                const category = this.dataset.category;

                // Update active state
                categoryTags.forEach(function(t) {
                    t.classList.remove('category-tag--active');
                });
                this.classList.add('category-tag--active');

                // Filter projects
                projectCards.forEach(function(card) {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = '';
                        setTimeout(function() {
                            card.classList.add('fade-in');
                        }, 50);
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('fade-in');
                    }
                });
            });
        });
    }

    /* --------------------------------------------------------------------------
       Initialize All Functions
       -------------------------------------------------------------------------- */
    function init() {
        initMobileNav();
        initHeaderScroll();
        initSmoothScroll();
        initContactForm();
        initAnimations();
        initPhoneTracking();
        initLazyLoading();
        initProjectFilter();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
