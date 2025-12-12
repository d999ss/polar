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
    /* App icon inner shadow for soft edges */
    .app-icon-wrapper {
      position: relative;
      display: inline-block;
      border-radius: 24px;
      overflow: hidden;
    }
    .app-icon-wrapper::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 24px;
      box-shadow: inset 0 0 40px 20px rgba(249, 250, 251, 0.9);
      pointer-events: none;
    }
    .dark .app-icon-wrapper::after {
      box-shadow: inset 0 0 40px 20px rgba(9, 9, 11, 0.9);
    }
  `;
  document.head.appendChild(style);

  function init() {
    // Fix elements with inline opacity:0 styles (from Next.js hydration)
    document.querySelectorAll('[style*="opacity:0"], [style*="opacity: 0"]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // Wrap app icon in shadow wrapper for soft edges
    const appIcon = document.querySelector('img[alt="App Icon"]');
    if (appIcon && !appIcon.parentElement.classList.contains('app-icon-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'app-icon-wrapper';
      appIcon.parentElement.insertBefore(wrapper, appIcon);
      wrapper.appendChild(appIcon);
    }

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
    const activityHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent === 'Activity' || h.textContent === 'System Activity');
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

    // Populate empty tab panels with content
    const tabPanelContent = {
      // Integrate in under a minute - BetterAuth
      'radix-_R_2lbriv9fd5ulb_-content-BetterAuth': {
        title: 'BetterAuth Adapter',
        description: 'Payments and Checkouts made dead simple with BetterAuth',
        features: ['Secure & Simple Checkouts', 'Integrated Customer Portal', 'Granular & Reliable Webhook Handler', 'Global Merchant of Record'],
        learnMoreUrl: 'docs/integrate/sdk/adapters/better-auth.html',
        code: `import { betterAuth } from "better-auth";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const client = new Polar({ accessToken: 'xxx' });

const auth = betterAuth({
  // ... Better Auth config
  plugins: [
    polar({
      client,
      createCustomerOnSignUp: true,
      use: [
        checkout(...),
        portal(),
        usage(),
        webhooks(...)
      ],
    })
  ]
});`
      },
      // Integrate in under a minute - TypeScript
      'radix-_R_2lbriv9fd5ulb_-content-TypeScript': {
        title: 'TypeScript Adapter',
        description: 'Payments and Checkouts made dead simple with TypeScript',
        features: ['Secure & Simple Checkouts', 'Integrated Customer Portal', 'Granular & Reliable Webhook Handler', 'Global Merchant of Record'],
        learnMoreUrl: 'docs/api-reference/checkouts/create-session.html',
        code: `import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: 'xxx',
});

const checkout = await polar.checkouts.create({
  products: ["<PRODUCT_ID>"]
});

redirect(checkout.url)`
      },
      // Usage Based Billing - Delta Time
      'radix-_R_35briv9fd5ulb_-content-Delta Time': {
        title: 'Delta Time Strategy',
        description: 'Bill your customers for the time it takes to execute code on your infrastructure',
        features: ['Precise measurements of execution time', 'Bring your own time-resolver'],
        learnMoreUrl: 'docs/features/usage-based-billing/ingestion-strategies/delta-time-strategy.html',
        code: `import { Ingestion } from "@polar-sh/ingestion";
import { DeltaTimeStrategy } from "@polar-sh/ingestion/strategies/DeltaTime";

const nowResolver = () => performance.now();

const deltaTimeIngestion = Ingestion({ accessToken: 'xxx' })
  .strategy(new DeltaTimeStrategy(nowResolver))
  .ingest("execution-time");

export async function GET(request: Request) {
  const start = deltaTimeIngestion.client({
    externalCustomerId: "<USER_ID_FROM_YOUR_DATABASE>",
  });

  const stop = start();
  await sleep(1000);
  const delta = stop();

  return Response.json({ delta });
}`
      },
      // Usage Based Billing - Custom Ingestion
      'radix-_R_35briv9fd5ulb_-content-Custom Ingestion': {
        title: 'Custom Ingestion Strategy',
        description: 'Manually ingest data from your application to bill your customers',
        features: ['Manually ingest usage data', 'Use any custom metadata', 'Support for batch ingestion'],
        learnMoreUrl: 'https://github.com/polarsource/polar-ingestion',
        code: `import { Ingestion } from "@polar-sh/ingestion";

await Ingestion({ accessToken: 'xxx' }).ingest([
  {
    name: "<value>",
    externalCustomerId: "<USER_ID_FROM_YOUR_DATABASE>",
    metadata: {
      myProp: "value",
    },
  },
]);`
      }
    };

    // Helper to create tab panel content HTML
    function createTabPanelContent(config) {
      const featuresHtml = config.features.map(f => `
        <li class="flex flex-row items-center gap-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-blue-500"><path d="M20 6 9 17l-5-5"></path></svg>
          <p class="text-sm">${f}</p>
        </li>
      `).join('');

      return `
        <div class="flex w-full flex-col-reverse items-start justify-between gap-8 overflow-hidden rounded-3xl bg-gray-50 p-6 dark:bg-polar-900 lg:flex-row lg:gap-0 lg:p-0">
          <div class="flex flex-col gap-y-6 lg:p-8">
            <h2 class="text-2xl">${config.title}</h2>
            <p class="dark:text-polar-500 text-gray-500">${config.description}</p>
            <ul class="flex flex-col gap-y-2">
              ${featuresHtml}
            </ul>
            <a href="${config.learnMoreUrl}">
              <button class="inline-flex items-center justify-center gap-2 rounded-full bg-transparent text-blue-500 hover:text-blue-400 transition-colors text-sm font-medium">
                <span>Learn More</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </a>
          </div>
          <div class="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#D1AAF8] via-[#C3D6FA] via-60% to-[#C3D6FA] p-4 pl-8 lg:max-w-sm lg:rounded-none lg:rounded-br-3xl lg:p-10 lg:pl-10 xl:max-w-lg">
            <pre class="shiki" style="background-color:transparent;overflow-x:auto"><code class="text-xs text-black">${config.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>
        </div>
      `;
    }

    // Populate empty tab panels
    Object.entries(tabPanelContent).forEach(([panelId, config]) => {
      const panel = document.getElementById(panelId);
      if (panel && panel.innerHTML.trim() === '') {
        panel.innerHTML = createTabPanelContent(config);
      }
    });

    // Tab switching functionality
    document.querySelectorAll('[role="tab"]').forEach(tab => {
      tab.addEventListener('click', function() {
        const tablist = this.closest('[role="tablist"]');
        if (!tablist) return;

        // Get all tabs in this tablist
        const tabs = tablist.querySelectorAll('[role="tab"]');

        // Deactivate all tabs
        tabs.forEach(t => {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('data-state', 'inactive');
          // Hide corresponding panel
          const panelId = t.getAttribute('aria-controls');
          if (panelId) {
            const panel = document.getElementById(panelId);
            if (panel) panel.setAttribute('hidden', '');
          }
        });

        // Activate clicked tab
        this.setAttribute('aria-selected', 'true');
        this.setAttribute('data-state', 'active');

        // Show corresponding panel
        const panelId = this.getAttribute('aria-controls');
        if (panelId) {
          const panel = document.getElementById(panelId);
          if (panel) panel.removeAttribute('hidden');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
