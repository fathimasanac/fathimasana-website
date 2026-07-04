document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // MOBILE MENU TOGGLE
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      
      // Toggle menu icon
      const icon = mobileMenuBtn.querySelector('i');
      if (navLinksContainer.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars-staggered';
      }
    });
  }

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Prevent default navigation to avoid race conditions with DOM class toggle
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      // Close the menu first
      navLinksContainer.classList.remove('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-bars-staggered';
      }
      
      // Scroll to the target section smoothly
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==========================================================================
  // NAVBAR SCROLL EFFECT
  // ==========================================================================
  const navbarContainer = document.querySelector('.navbar-container');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbarContainer.classList.add('scrolled');
    } else {
      navbarContainer.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run on initial load in case the page is already scrolled
  handleScroll();

  // ==========================================================================
  // ACTIVE NAVIGATION LINK TRACKING
  // ==========================================================================
  const sections = document.querySelectorAll('section[id], header[id]');
  
  const activeLinkTracker = () => {
    const scrollPosition = window.scrollY + 120; // offset for nav bar

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', activeLinkTracker);

  // ==========================================================================
  // STATS COUNTER ANIMATION
  // ==========================================================================
  const statsSection = document.querySelector('.stats-section');
  const statVals = document.querySelectorAll('.stat-val');
  let animated = false;

  const countUp = (element, targetValue, duration = 2000, suffix = '') => {
    let start = 0;
    const increment = targetValue / (duration / 16); // ~60fps
    
    const updateCount = () => {
      start += increment;
      if (start >= targetValue) {
        element.textContent = targetValue.toLocaleString() + suffix;
      } else {
        element.textContent = Math.floor(start).toLocaleString() + suffix;
        requestAnimationFrame(updateCount);
      }
    };
    
    updateCount();
  };

  const initCounters = () => {
    statVals.forEach(val => {
      const text = val.textContent.trim().toLowerCase();
      
      // Determine targets and formats
      if (text.includes('8 to 200+')) {
        // Special case: Animate from 8 to 200
        let current = 8;
        const target = 200;
        const interval = setInterval(() => {
          if (current >= target) {
            val.textContent = "8 TO 200+";
            clearInterval(interval);
          } else {
            current += 4;
            val.textContent = `8 TO ${current}+`;
          }
        }, 30);
      } else if (text.includes('10,000+')) {
        countUp(val, 10000, 1800, '+');
      } else if (text.includes('4,00,000')) {
        // Count up to 400000 with currency formatting
        let start = 0;
        const target = 400000;
        const increment = target / 100;
        const interval = setInterval(() => {
          start += increment;
          if (start >= target) {
            val.textContent = "₹4,00,000";
            clearInterval(interval);
          } else {
            val.textContent = "₹" + Math.floor(start).toLocaleString('en-IN');
          }
        }, 15);
      } else if (text.includes('20') && text.includes('30')) {
        // Simple scale from 0 to target range
        let currentMin = 0;
        let currentMax = 0;
        const interval = setInterval(() => {
          if (currentMin >= 20 && currentMax >= 30) {
            val.textContent = "₹20 - ₹30";
            clearInterval(interval);
          } else {
            if (currentMin < 20) currentMin++;
            if (currentMax < 30) currentMax += 1.5;
            val.textContent = `₹${Math.floor(currentMin)} - ₹${Math.floor(currentMax)}`;
          }
        }, 40);
      }
    });
  };

  // Check if stats are in viewport using Intersection Observer
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          initCounters();
          animated = true;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  } else {
    // Fallback if IntersectionObserver is not supported
    initCounters();
  }

  // ==========================================================================
  // CONTACT FORM SUBMISSION
  // ==========================================================================
  const contactForm = document.getElementById('portfolio-contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const successAlert = document.getElementById('form-success-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Select form fields
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      // Show submitting state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Campaign Info...';

      // Simulate API request (1.5 seconds delay)
      setTimeout(() => {
        // Success state
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent successfully!';
        
        // Show success message
        successAlert.style.display = 'flex';
        successAlert.style.opacity = '0';
        successAlert.style.transform = 'translateY(10px)';
        successAlert.style.transition = 'all 0.4s ease';
        
        setTimeout(() => {
          successAlert.style.opacity = '1';
          successAlert.style.transform = 'translateY(0)';
        }, 50);

        // Reset form
        contactForm.reset();

        // Restore button state after 3 seconds
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Fade out success alert
          successAlert.style.opacity = '0';
          successAlert.style.transform = 'translateY(10px)';
          setTimeout(() => {
            successAlert.style.display = 'none';
          }, 400);
        }, 4000);
        
      }, 1500);
    });
  }

  // ==========================================================================
  // HERO PHOTO CARD INTERACTION (REVEAL NAME)
  // ==========================================================================
  const cardStack = document.querySelector('.visual-card-stack');
  if (cardStack) {
    cardStack.addEventListener('click', (e) => {
      e.stopPropagation();
      cardStack.classList.toggle('reveal-name');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!cardStack.contains(e.target)) {
        cardStack.classList.remove('reveal-name');
      }
    });
  }

  // ==========================================================================
  // PREMIUM CUSTOM CURSOR
  // ==========================================================================
  const cursorRing = document.getElementById('custom-cursor-ring');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (cursorRing && cursorDot) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let dotX = -100;
    let dotY = -100;
    let isVisible = false;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        // First movement within viewport
        cursorRing.style.opacity = '1';
        cursorDot.style.opacity = '1';
        
        // Initialize ring and dot position directly to avoid trailing from origin
        ringX = dotX = mouseX;
        ringY = dotY = mouseY;
        
        isVisible = true;
      }
    });

    // 60fps RequestAnimationFrame animation loop
    const renderCursor = () => {
      if (isVisible) {
        // Outer ring trailing interpolation (0.15 factor for smooth trailing)
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        // Inner dot trailing interpolation (0.35 factor for snappier tracking)
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;

        // GPU-accelerated translate3d transforms
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      
      requestAnimationFrame(renderCursor);
    };
    
    // Start the animation loop
    requestAnimationFrame(renderCursor);

    // Event Delegation: detect hovering on interactive elements vs text inputs
    document.addEventListener('mouseover', (e) => {
      const hoverable = e.target.closest('a, button, select, input[type="submit"], input[type="button"], [role="button"], .social-circle, .floating-whatsapp-btn, .visual-card-stack');
      const textInput = e.target.closest('input[type="text"], input[type="email"], input[type="tel"], textarea');

      if (textInput) {
        // Hide custom cursor and show default system text I-beam cursor
        cursorRing.style.opacity = '0';
        cursorDot.style.opacity = '0';
      } else {
        if (isVisible) {
          cursorRing.style.opacity = '1';
          cursorDot.style.opacity = '1';
        }
        
        if (hoverable) {
          cursorRing.classList.add('cursor-hover');
          cursorDot.classList.add('cursor-hover');
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const hoverable = e.target.closest('a, button, select, input[type="submit"], input[type="button"], [role="button"], .social-circle, .floating-whatsapp-btn, .visual-card-stack');
      const textInput = e.target.closest('input[type="text"], input[type="email"], input[type="tel"], textarea');

      if (textInput) {
        // Restore custom cursor when moving away from text inputs
        if (isVisible) {
          cursorRing.style.opacity = '1';
          cursorDot.style.opacity = '1';
        }
      }
      
      if (hoverable) {
        cursorRing.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      }
    });

    // Hide custom cursor when mouse leaves window bounds
    document.addEventListener('mouseleave', () => {
      cursorRing.style.opacity = '0';
      cursorDot.style.opacity = '0';
      isVisible = false;
    });

    // Show custom cursor when mouse returns to window bounds
    document.addEventListener('mouseenter', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorRing.style.opacity = '1';
      cursorDot.style.opacity = '1';
      isVisible = true;
    });
  }
});

