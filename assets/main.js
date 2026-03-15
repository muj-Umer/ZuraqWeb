/* ============================================
   ZURAQ — Main JavaScript (3D Orchestration)
   Initializes Three.js scenes, product viewers,
   hotspots, and scroll-linked animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- 3D SCENE INITIALIZATION ---
  const scenes = {};

  // Hero Scene (homepage only)
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && window.ZuraqScenes) {
    try {
      scenes.hero = new ZuraqScenes.HeroScene(heroCanvas);
    } catch (e) {
      console.log('Hero scene init skipped:', e.message);
    }
  }

  // Drop Vault (homepage only)
  const vaultCanvas = document.getElementById('drop-vault-canvas');
  if (vaultCanvas && window.ZuraqScenes) {
    try {
      scenes.vault = new ZuraqScenes.DropVault(vaultCanvas);
    } catch (e) {
      console.log('Vault scene init skipped:', e.message);
    }
  }

  // Floating Motif Scenes (various pages)
  const motifConfigs = [
    { id: 'journey-motifs', type: 'paisley' },
    { id: 'craft-motifs', type: 'floral' },
    { id: 'chapters-motifs', type: 'chamak' },
    { id: 'azulejo-motifs', type: 'paisley' },
    { id: 'aryan-motifs', type: 'floral' },
    { id: 'story-hero-canvas', type: 'star' },
    { id: 'story-motifs', type: 'paisley' }
  ];

  motifConfigs.forEach(config => {
    const container = document.getElementById(config.id);
    if (container && window.ZuraqScenes) {
      try {
        scenes[config.id] = new ZuraqScenes.MotifScene(container, config.type);
      } catch (e) {
        console.log(`${config.id} scene init skipped:`, e.message);
      }
    }
  });


  // --- PRODUCT VIEWERS (Drag-to-Rotate) ---
  const viewers = {};

  const azulejoViewer = document.getElementById('azulejo-viewer');
  if (azulejoViewer && window.ZuraqViewers) {
    viewers.azulejo = new ZuraqViewers.ProductViewer(azulejoViewer, { sensitivity: 0.3, maxTilt: 12 });
    viewers.azulejoZoom = new ZuraqViewers.MacroZoom(azulejoViewer);
  }

  const aryanViewer = document.getElementById('aryan-viewer');
  if (aryanViewer && window.ZuraqViewers) {
    viewers.aryan = new ZuraqViewers.ProductViewer(aryanViewer, { sensitivity: 0.2, maxTilt: 8 });
    viewers.aryanHotspots = new ZuraqViewers.HotspotViewer(aryanViewer);
  }


  // --- SCROLL REVEAL (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // --- NAVIGATION SCROLL STATE ---
  const nav = document.querySelector('.silk-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  // --- CONTINUOUS ROUTE PROGRESS ---
  const sections = document.querySelectorAll('[data-route-section]');
  const routeTrack = document.getElementById('nav-route-track');
  const routeLabel = document.getElementById('nav-route-label');

  if (sections.length && routeTrack && routeLabel) {
    const sectionData = Array.from(sections).map(section => ({
      id: section.id,
      label: section.getAttribute('data-route-section').charAt(0).toUpperCase() + section.getAttribute('data-route-section').slice(1),
      element: section
    }));

    // Override specific labels
    const labelMap = {
      'hero': 'Origin',
      'journey': 'Journey',
      'craft': 'Craft',
      'drops': 'Drops',
      'connect': 'Connect'
    };

    window.addEventListener('scroll', () => {
      // Calculate continuous progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      routeTrack.style.setProperty('--scroll-progress', `${Math.min(100, Math.max(0, scrollProgress))}%`);

      // Determine active section for label
      let currentSection = sections[0].getAttribute('data-route-section');

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // If top of section is at or above middle of screen, it's active
        if (rect.top <= window.innerHeight / 2) {
          currentSection = section.getAttribute('data-route-section');
        }
      });

      routeLabel.textContent = labelMap[currentSection] || currentSection;
    }, { passive: true });

    // Trigger once on load
    window.dispatchEvent(new Event('scroll'));
  }


  // --- PARALLAX ON HERO ---
  const heroLayers = document.querySelectorAll('.hero-bg-layer');
  if (heroLayers.length) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroLayers.forEach((layer, i) => {
        const speed = 0.1 + (i * 0.08);
        layer.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }


  // --- VAULT SCROLL-LINKED REVEAL ---
  if (scenes.vault) {
    const vaultSection = document.querySelector('.vault-section');
    if (vaultSection) {
      const vaultObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rect = vaultSection.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1,
              1 - (rect.top / (window.innerHeight * 0.5))
            ));
            scenes.vault.reveal(progress);
          }
        });
      }, {
        threshold: Array.from({ length: 20 }, (_, i) => i / 19)
      });

      vaultObserver.observe(vaultSection);

      // Also update on scroll for smoother animation
      window.addEventListener('scroll', () => {
        const rect = vaultSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = Math.max(0, Math.min(1,
            1 - (rect.top / (window.innerHeight * 0.5))
          ));
          scenes.vault.reveal(progress);
        }
      }, { passive: true });
    }
  }


  // --- HERO SCENE SCROLL FADE ---
  if (scenes.hero) {
    window.addEventListener('scroll', () => {
      const scrollProgress = window.scrollY / window.innerHeight;
      scenes.hero.updateScroll(scrollProgress);
    }, { passive: true });
  }


  // --- INQUIRY MODAL ---
  const inquiryOverlay = document.querySelector('.inquiry-overlay');
  const inquiryPanel = document.querySelector('.inquiry-panel');
  const inquiryOpenBtns = document.querySelectorAll('[data-open-inquiry]');
  const inquiryCloseBtn = document.querySelector('.inquiry-close');

  function openInquiry() {
    if (inquiryOverlay) inquiryOverlay.classList.add('open');
    if (inquiryPanel) inquiryPanel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeInquiry() {
    if (inquiryOverlay) inquiryOverlay.classList.remove('open');
    if (inquiryPanel) inquiryPanel.classList.remove('open');
    document.body.style.overflow = '';
  }

  inquiryOpenBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openInquiry();
  }));
  if (inquiryCloseBtn) inquiryCloseBtn.addEventListener('click', closeInquiry);
  if (inquiryOverlay) inquiryOverlay.addEventListener('click', closeInquiry);


  // --- SIZE SELECTOR ---
  const sizeOptions = document.querySelectorAll('.size-option');
  sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
      sizeOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });


  // --- MOBILE MENU ---
  const menuBtn = document.querySelector('.nav-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  // --- JOURNEY HORIZONTAL SCROLL ---
  const journeySection = document.querySelector('.journey-section');
  const journeyTrack = document.querySelector('.journey-track');

  if (journeySection && journeyTrack) {
    const chapters = journeyTrack.querySelectorAll('.journey-chapter');
    const totalChapters = chapters.length;

    journeySection.style.height = `${totalChapters * 100}vh`;

    window.addEventListener('scroll', () => {
      const rect = journeySection.getBoundingClientRect();
      const sectionTop = -rect.top;
      const sectionHeight = journeySection.offsetHeight - window.innerHeight;

      if (sectionTop >= 0 && sectionTop <= sectionHeight) {
        const progress = sectionTop / sectionHeight;
        const translateX = -(progress * (totalChapters - 1) * 100);
        journeyTrack.style.transform = `translateX(${translateX}vw)`;
      }
    }, { passive: true });

    // Sticky wrapper
    const journeySticky = document.createElement('div');
    journeySticky.style.cssText = `
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
    `;
    journeyTrack.parentNode.insertBefore(journeySticky, journeyTrack);
    journeySticky.appendChild(journeyTrack);
  }


  // --- FORM SUBMISSION ---
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'SUBMITTED ✓';
        btn.style.background = 'var(--gold)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2500);
      }
    });
  });


  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // Skip inquiry links
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = document.querySelector('.silk-nav').offsetHeight;
        const catNavHeight = document.querySelector('.category-nav')?.offsetHeight || 0;
        const offset = navHeight + catNavHeight;
        
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });


  // --- CATEGORY NAV ACTIVE STATE ---
  const categorySections = document.querySelectorAll('.collection-section');
  const categoryLinks = document.querySelectorAll('.category-link');
  
  if (categorySections.length && categoryLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          categoryLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-10% 0px -70% 0px'
    });
    
    categorySections.forEach(section => sectionObserver.observe(section));
  }


  // --- STAGGER ANIMATION FOR CHILDREN ---
  const staggerContainers = document.querySelectorAll('.stagger-children');
  staggerContainers.forEach(container => {
    const children = container.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

});
