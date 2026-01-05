/* ========================================
   Lumino AI Workshop Series - Interactive Features
   ======================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ========== Smooth Scroll Animations ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for scroll animations
    const cards = document.querySelectorAll('.tool-card, .resource-item, .prompt-card, .activity-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // ========== Copy to Clipboard Functionality ==========
    window.copyToClipboard = function (button, promptId) {
        let textToCopy;

        if (promptId) {
            // For activities page with specific prompt IDs
            const promptElement = document.getElementById(promptId);
            textToCopy = promptElement ? promptElement.textContent : '';
        } else {
            // For general copy buttons (find nearest prompt text)
            const promptCard = button.closest('.prompt-card') || button.closest('.activity-card');
            const promptText = promptCard.querySelector('.prompt-text');
            textToCopy = promptText ? promptText.textContent.trim() : '';
        }

        if (!textToCopy) {
            alert('No text found to copy');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = button.textContent;
            const originalBg = button.style.background;

            button.textContent = '✓ Copied!';
            button.style.background = 'linear-gradient(135deg, #a8e6a3 0%, #81c784 100%)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = originalBg;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy. Please try again.');
        });
    };

    // ========== Search Functionality ==========
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            performSearch(searchTerm);
        });
    }

    // ========== Filter Functionality ==========
    const filterButtons = document.querySelectorAll('.filter-btn');
    let activeFilter = 'all';

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            activeFilter = this.getAttribute('data-filter');
            performFilter(activeFilter);
        });
    });

    function performSearch(searchTerm) {
        const allCards = document.querySelectorAll('.prompt-card');
        const allSections = document.querySelectorAll('.section');
        const noResults = document.getElementById('noResults');
        let hasResults = false;

        allCards.forEach(card => {
            const title = card.querySelector('.prompt-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.prompt-description')?.textContent.toLowerCase() || '';
            const promptText = card.querySelector('.prompt-text')?.textContent.toLowerCase() || '';

            const matches = title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                promptText.includes(searchTerm);

            if (matches || searchTerm === '') {
                card.classList.remove('hidden');
                hasResults = true;
            } else {
                card.classList.add('hidden');
            }
        });

        // Hide empty sections
        allSections.forEach(section => {
            const visibleCards = section.querySelectorAll('.prompt-card:not(.hidden)');
            if (visibleCards.length === 0) {
                section.classList.add('hidden');
            } else {
                section.classList.remove('hidden');
            }
        });

        // Show/hide no results message
        if (noResults) {
            noResults.style.display = hasResults ? 'none' : 'block';
        }
    }

    function performFilter(platform) {
        const allCards = document.querySelectorAll('.prompt-card');
        const allSections = document.querySelectorAll('.section[data-platform]');

        if (platform === 'all') {
            allCards.forEach(card => card.classList.remove('hidden'));
            allSections.forEach(section => section.classList.remove('hidden'));
        } else {
            allSections.forEach(section => {
                if (section.getAttribute('data-platform') === platform) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        }
    }

    // ========== Navbar Active State ==========
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });

    // ========== Scroll Progress Indicator ==========
    const createScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #f7ccbc, #ff9b6a, #ffd966);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    };

    createScrollProgress();

    // ========== Parallax Effect for Header ==========
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            header.style.transform = `translateY(${scrolled * 0.5}px)`;
            header.style.opacity = 1 - (scrolled / 500);
        });
    }

    // ========== Lazy Loading Images ==========
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ========== Collapsible Sections for Activities ==========
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        const title = card.querySelector('.activity-title');
        if (title) {
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => {
                const content = card.querySelector('.activity-description').nextElementSibling;
                if (content) {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    content.style.animation = isHidden ? 'fadeInUp 0.3s ease' : '';
                }
            });
        }
    });

    // ========== Dynamic Greeting Based on Time ==========
    const updateGreeting = () => {
        const hour = new Date().getHours();
        const headerP = document.querySelector('.header p');

        if (headerP && headerP.textContent.includes('Comprehensive')) {
            let greeting = '';
            if (hour < 12) greeting = '☀️ Good Morning! ';
            else if (hour < 18) greeting = '🌤️ Good Afternoon! ';
            else greeting = '🌙 Good Evening! ';

            // Only add greeting if it's not already there
            if (!headerP.textContent.includes('Good')) {
                headerP.textContent = greeting + headerP.textContent;
            }
        }
    };

    updateGreeting();

    console.log('🚀 Lumino AI Workshop Series - Interactive features loaded!');
});
