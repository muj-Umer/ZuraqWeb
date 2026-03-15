/* ============================================
   ZURAQ — Product Viewer
   Drag-to-rotate, macro-zoom, interactive hotspots
   ============================================ */

// --- DRAG TO ROTATE VIEWER ---
class ProductViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.image = container.querySelector('.viewer-image');
    this.isDragging = false;
    this.startX = 0;
    this.currentRotation = 0;
    this.momentum = 0;
    this.momentumDecay = 0.95;
    this.sensitivity = options.sensitivity || 0.3;
    this.maxTilt = options.maxTilt || 12;

    if (this.image) {
      this.init();
    }
  }

  init() {
    this.container.style.cursor = 'grab';
    this.container.style.perspective = '1200px';
    this.container.style.perspectiveOrigin = '50% 50%';

    // Touch events
    this.container.addEventListener('mousedown', (e) => this.onStart(e));
    this.container.addEventListener('mousemove', (e) => this.onMove(e));
    this.container.addEventListener('mouseup', () => this.onEnd());
    this.container.addEventListener('mouseleave', () => this.onEnd());

    // Touch
    this.container.addEventListener('touchstart', (e) => this.onStart(e.touches[0]), { passive: true });
    this.container.addEventListener('touchmove', (e) => this.onMove(e.touches[0]), { passive: true });
    this.container.addEventListener('touchend', () => this.onEnd());

    // Float animation
    this.animateFloat();
  }

  onStart(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.container.style.cursor = 'grabbing';
    this.momentum = 0;
  }

  onMove(e) {
    if (!this.isDragging) {
      // Subtle tilt on hover
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      this.image.style.transform = `
        rotateY(${x * 6}deg) 
        rotateX(${-y * 4}deg) 
        scale(1.02)
      `;
      return;
    }

    const deltaX = e.clientX - this.startX;
    this.momentum = deltaX * 0.1;
    this.currentRotation += deltaX * this.sensitivity;
    this.startX = e.clientX;

    // Clamp rotation for realism
    this.currentRotation = Math.max(-this.maxTilt, Math.min(this.maxTilt, this.currentRotation));

    this.image.style.transform = `
      rotateY(${this.currentRotation}deg)
      scale(1.03)
    `;
    this.image.style.transition = 'none';
  }

  onEnd() {
    this.isDragging = false;
    this.container.style.cursor = 'grab';

    // Spring back with momentum
    this.springBack();
  }

  springBack() {
    const animate = () => {
      if (this.isDragging) return;

      this.currentRotation *= 0.92;
      this.currentRotation += this.momentum;
      this.momentum *= this.momentumDecay;

      if (Math.abs(this.currentRotation) < 0.1 && Math.abs(this.momentum) < 0.01) {
        this.currentRotation = 0;
        this.image.style.transform = '';
        this.image.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        return;
      }

      this.image.style.transform = `rotateY(${this.currentRotation}deg) scale(1.01)`;
      this.image.style.transition = 'none';
      requestAnimationFrame(animate);
    };
    animate();
  }

  animateFloat() {
    // Subtle idle breathing animation
    if (!this.isDragging && Math.abs(this.currentRotation) < 0.5) {
      const time = Date.now() * 0.001;
      const subtle = Math.sin(time * 0.8) * 0.5;
      if (!this.isDragging) {
        this.image.style.transform = `rotateY(${subtle}deg) translateY(${Math.sin(time * 0.5) * 2}px)`;
      }
    }
    requestAnimationFrame(() => this.animateFloat());
  }
}


// --- MACRO ZOOM ---
class MacroZoom {
  constructor(container) {
    this.container = container;
    this.image = container.querySelector('.viewer-image');
    this.overlay = null;
    this.isZoomed = false;
    this.zoomLevel = 2.5;
    this.lensSize = 200;

    if (this.image) {
      this.createOverlay();
      this.createZoomBtn();
      this.bindEvents();
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'macro-zoom-overlay';
    this.overlay.innerHTML = `
      <div class="macro-zoom-container">
        <img src="${this.image.src}" alt="Fabric detail zoom" class="macro-zoom-image">
        <div class="macro-zoom-lens"></div>
        <div class="macro-zoom-info">
          <span class="accent-text">Drag to explore fabric detail</span>
        </div>
        <button class="macro-zoom-close">✕</button>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.zoomImage = this.overlay.querySelector('.macro-zoom-image');
    this.lens = this.overlay.querySelector('.macro-zoom-lens');
    this.closeBtn = this.overlay.querySelector('.macro-zoom-close');
  }

  createZoomBtn() {
    const btn = document.createElement('button');
    btn.className = 'macro-zoom-btn';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="16.5" y1="16.5" x2="22" y2="22"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <span>Fabric Detail</span>
    `;
    this.container.appendChild(btn);
    btn.addEventListener('click', () => this.open());
  }

  open() {
    this.isZoomed = true;
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isZoomed = false;
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Zoom lens follow
    const zoomContainer = this.overlay.querySelector('.macro-zoom-container');
    zoomContainer.addEventListener('mousemove', (e) => {
      const rect = zoomContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Move the zoomed image
      this.zoomImage.style.transform = `scale(${this.zoomLevel}) translate(${-(x - 0.5) * 30}%, ${-(y - 0.5) * 30}%)`;

      // Move lens indicator
      this.lens.style.left = `${e.clientX - rect.left - this.lensSize / 2}px`;
      this.lens.style.top = `${e.clientY - rect.top - this.lensSize / 2}px`;
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isZoomed) this.close();
    });
  }
}


// --- INTERACTIVE HOTSPOTS ---
class HotspotViewer {
  constructor(container) {
    this.container = container;
    this.hotspots = container.querySelectorAll('.hotspot');
    this.activePanel = null;

    this.init();
  }

  init() {
    this.hotspots.forEach(hotspot => {
      // Pulse animation
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel(hotspot);
      });

      // Create info panel
      const panel = document.createElement('div');
      panel.className = 'hotspot-panel glass-card';
      panel.innerHTML = `
        <h4>${hotspot.dataset.title || 'Detail'}</h4>
        <p>${hotspot.dataset.description || ''}</p>
        <span class="hotspot-panel-close">✕</span>
      `;
      hotspot.appendChild(panel);

      panel.querySelector('.hotspot-panel-close').addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel(hotspot);
      });
    });

    // Close on click outside
    document.addEventListener('click', () => this.closeAll());
  }

  togglePanel(hotspot) {
    const isOpen = hotspot.classList.contains('active');
    this.closeAll();
    if (!isOpen) {
      hotspot.classList.add('active');
      this.activePanel = hotspot;
    }
  }

  closePanel(hotspot) {
    hotspot.classList.remove('active');
    this.activePanel = null;
  }

  closeAll() {
    this.hotspots.forEach(h => h.classList.remove('active'));
    this.activePanel = null;
  }
}


// --- EXPORTS ---
window.ZuraqViewers = { ProductViewer, MacroZoom, HotspotViewer };
