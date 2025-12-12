// Polar-style animations for static site
(function() {
  // Animation configuration
  const config = {
    duration: 600,
    stagger: 100,
    threshold: 0.15,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
  };

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .polar-animate {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity ${config.duration}ms ${config.easing},
                  transform ${config.duration}ms ${config.easing};
    }
    .polar-animate.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .polar-animate-scale {
      opacity: 0;
      transform: scale(0.95);
      transition: opacity ${config.duration}ms ${config.easing},
                  transform ${config.duration}ms ${config.easing};
    }
    .polar-animate-scale.visible {
      opacity: 1;
      transform: scale(1);
    }
    /* Activity ticker animation */
    .activity-ticker-wrapper {
      animation: ticker-scroll 25s linear infinite;
    }
    @keyframes ticker-scroll {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    .activity-ticker-wrapper:hover {
      animation-play-state: paused;
    }
    /* Hide dates in activity items - override xl:flex */
    .activity-date-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  function init() {
    // Hero section - staggered fade in
    const hero = document.querySelector('.relative.flex.flex-col.items-center.justify-center.gap-4');
    if (hero) {
      const children = Array.from(hero.children);
      children.forEach((el, i) => {
        el.classList.add('polar-animate');
        el.style.transitionDelay = (i * config.stagger) + 'ms';
        // Trigger after small delay
        setTimeout(() => el.classList.add('visible'), 50);
      });
    }

    // Sections - animate on scroll
    const sections = document.querySelectorAll('section, [class*="flex flex-col gap-4"], [class*="flex flex-col gap-y-6"]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: config.threshold, rootMargin: '0px 0px -50px 0px' });

    sections.forEach((el, i) => {
      if (!el.closest('.relative.flex.flex-col.items-center.justify-center.gap-4')) {
        el.classList.add('polar-animate');
        observer.observe(el);
      }
    });

    // Cards - scale animation
    const cards = document.querySelectorAll('a[class*="rounded-2xl"]');
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 100);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(el => {
      el.classList.add('polar-animate-scale');
      cardObserver.observe(el);
    });

    // Activity ticker animation
    const activityHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent === 'Activity');
    if (activityHeading) {
      // Structure: heading -> parent div -> grandparent (activity box) -> children[1] is items container
      const activityBox = activityHeading.parentElement?.parentElement;
      if (activityBox) {
        const children = Array.from(activityBox.children);
        // Second child is the items container with class "relative h-[356px] overflow-hidden"
        const itemsContainer = children[1];
        if (itemsContainer && itemsContainer.classList.contains('overflow-hidden')) {
          // Get the inner flex column with items
          const itemsWrapper = itemsContainer.querySelector('.flex.flex-col');
          if (itemsWrapper) {
            // Remove any existing transform and add animation class
            itemsWrapper.style.transform = '';

            // Clone items for seamless loop
            const originalItems = itemsWrapper.innerHTML;
            itemsWrapper.innerHTML = originalItems + originalItems;
            itemsWrapper.classList.add('activity-ticker-wrapper');
          }
        }
      }

      // Hide dates in activity items (p tags with xl:flex class containing dates)
      document.querySelectorAll('p').forEach(p => {
        if (p.classList.contains('xl:flex') && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/.test(p.textContent.trim())) {
          p.classList.add('activity-date-hidden');
        }
      });
    }

    // Animate profit counter
    const profitSpans = document.querySelectorAll('span');
    profitSpans.forEach(el => {
      if (el.textContent && el.textContent.match(/^-?\$\d+\.\d{2}$/) && el.previousElementSibling?.textContent === 'Profit') {
        const originalValue = parseFloat(el.textContent.replace(/[$,-]/g, ''));
        let currentValue = el.textContent.startsWith('-') ? -originalValue : originalValue;

        setInterval(() => {
          // Random fluctuation
          const change = (Math.random() - 0.5) * 2;
          currentValue += change;
          el.textContent = (currentValue < 0 ? '-' : '') + '$' + Math.abs(currentValue).toFixed(2);
        }, 2000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
