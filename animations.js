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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
