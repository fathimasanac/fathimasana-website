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
      const targetId = link.getAttribute('href');

      // Only intercept same-page anchor links (starting with #)
      if (!targetId.startsWith('#')) {
        return; // let the browser navigate normally
      }

      e.preventDefault();
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
  const errorAlert = document.getElementById('form-error-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Select form fields
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subjectSelect = document.getElementById('form-subject');
      const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
      const message = document.getElementById('form-message').value;

      // Honeypot spam check
      const honeyField = document.getElementById('form-honey');
      const isSpam = honeyField && honeyField.value.trim() !== '';

      // Hide any previous alert messages
      if (successAlert) successAlert.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';

      // Show submitting state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Campaign Info...';

      // Handle spam bot silently to prevent them retrying
      if (isSpam) {
        console.warn("Spam detected via honeypot field.");
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent successfully!';
          contactForm.reset();
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }, 2000);
        }, 1000);
        return;
      }

      // Check configured form provider (default to formsubmit if undefined)
      const provider = (typeof CONFIG !== 'undefined' && CONFIG.FORM_PROVIDER)
        ? CONFIG.FORM_PROVIDER.toLowerCase()
        : 'formsubmit';

      let fetchUrl = '';
      let fetchBody = {};

      if (provider === 'web3forms') {
        const hasAccessKey = typeof CONFIG !== 'undefined' && CONFIG.WEB3FORMS_ACCESS_KEY && CONFIG.WEB3FORMS_ACCESS_KEY.trim() !== '';
        if (!hasAccessKey) {
          console.warn("Contact form set to web3forms, but no Access Key is configured in config.js.");
          if (errorAlert) {
            errorAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Form setup required: Please configure your Web3Forms Access Key in config.js.';
            errorAlert.style.display = 'flex';
          }
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          return;
        }
        fetchUrl = 'https://api.web3forms.com/submit';
        fetchBody = {
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          name: name,
          email: email,
          subject: `Portfolio Contact: ${subjectText}`,
          message: message,
          from_name: name
        };
      } else {
        // Fallback or default: FormSubmit
        const hasEmail = typeof CONFIG !== 'undefined' && CONFIG.RECEIVING_EMAIL && CONFIG.RECEIVING_EMAIL.trim() !== '';
        if (!hasEmail) {
          console.warn("Contact form set to formsubmit, but no receiving email is configured in config.js.");
          if (errorAlert) {
            errorAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Form setup required: Please configure your email in config.js.';
            errorAlert.style.display = 'flex';
          }
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          return;
        }
        fetchUrl = `https://formsubmit.co/ajax/${CONFIG.RECEIVING_EMAIL}`;
        fetchBody = {
          name: name,
          email: email,
          subject: `Portfolio Contact: ${subjectText}`,
          message: message,
          _subject: `New Portfolio Message from ${name}`,
          _captcha: "false" // Disable captcha verification page to optimize AJAX speed & stability
        };
      }

      // Set up a 10-second timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(fetchBody),
          signal: controller.signal
        });

        // Clear the timeout if the request completed
        clearTimeout(timeoutId);

        const data = await response.json();
        const success = response.ok || data.success === "true" || data.success === true;

        if (success) {
          // Success state
          submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent successfully!';
          console.log("SUCCESS BLOCK EXECUTED");

          window.dataLayer = window.dataLayer || [];
          console.log("Before push:", window.dataLayer);
          window.dataLayer.push({
            event: "generate_lead",
            form_name: "Portfolio Contact Form"
          });
          console.log("After push:", window.dataLayer);

          // Show success message
          if (successAlert) {
            successAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! I will get back to you shortly.';
            successAlert.style.display = 'flex';
            successAlert.style.opacity = '0';
            successAlert.style.transform = 'translateY(10px)';
            successAlert.style.transition = 'all 0.4s ease';

            setTimeout(() => {
              successAlert.style.opacity = '1';
              successAlert.style.transform = 'translateY(0)';
            }, 50);
          }

          // Reset form
          contactForm.reset();

          // Restore button state after 4 seconds
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            // Fade out success alert
            if (successAlert) {
              successAlert.style.opacity = '0';
              successAlert.style.transform = 'translateY(10px)';
              setTimeout(() => {
                successAlert.style.display = 'none';
              }, 400);
            }
          }, 4000);

        } else {
          throw new Error("Form delivery API responded with an error status.");
        }
      } catch (err) {
        // Clear the timeout in case of other errors
        clearTimeout(timeoutId);

        console.error("Error submitting contact form:", err);

        // Error state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (errorAlert) {
          if (err.name === 'AbortError') {
            errorAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Submission timed out. Please check your network or try again.';
          } else {
            errorAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Failed to send. Please check your network or try again later.';
          }
          errorAlert.style.display = 'flex';
          errorAlert.style.opacity = '0';
          errorAlert.style.transform = 'translateY(10px)';
          errorAlert.style.transition = 'all 0.4s ease';

          setTimeout(() => {
            errorAlert.style.opacity = '1';
            errorAlert.style.transform = 'translateY(0)';
          }, 50);

          // Hide error alert after 5 seconds
          setTimeout(() => {
            errorAlert.style.opacity = '0';
            errorAlert.style.transform = 'translateY(10px)';
            setTimeout(() => {
              errorAlert.style.display = 'none';
            }, 400);
          }, 5000);
        }
      }
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
    let lastClientX = 0;
    let lastClientY = 0;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      mouseX = e.pageX;
      mouseY = e.pageY;

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

    // Update coordinates when scrolling to keep stationary mouse aligned
    window.addEventListener('scroll', () => {
      if (isVisible) {
        mouseX = lastClientX + window.scrollX;
        mouseY = lastClientY + window.scrollY;
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
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      mouseX = e.pageX;
      mouseY = e.pageY;
      cursorRing.style.opacity = '1';
      cursorDot.style.opacity = '1';
      isVisible = true;
    });
    // ==========================================================================
    // WHATSAPP CLICK TRACKING
    // ==========================================================================

    const whatsappLink = document.getElementById("whatsapp-link");

    if (whatsappLink) {
      whatsappLink.addEventListener("click", () => {

        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
          event: "whatsapp_click"
        });

        console.log("WhatsApp Click Tracked");
      });
    }
  });

