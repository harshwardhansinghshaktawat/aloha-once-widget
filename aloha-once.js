class AlohaOnce extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.hasAnimated = false; // Track if animation has already played
    this.observer = null;
  }
  
  static get observedAttributes() {
    return [
      'text', 'font-family', 'font-size', 'font-color', 
      'heading-tag', 'background-color', 'text-alignment'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      // Reset animation state when content changes
      if (this.hasAnimated) {
        this.resetAnimation();
      }
    }
  }
  
  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    // Setup intersection observer after render to ensure element is in DOM
    setTimeout(() => this.setupIntersectionObserver(), 0);
  }
  
  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.disconnectObserver();
    clearTimeout(this.animationTimeout);
  }
  
  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  setupIntersectionObserver() {
    // Disconnect any existing observer before creating a new one
    this.disconnectObserver();
    
    // Create a new IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Trigger animation when element enters viewport and hasn't animated yet
        if (entry.isIntersecting && !this.isAnimating && !this.hasAnimated) {
          this.isAnimating = true;
          this.animate();
        }
      });
    }, { 
      threshold: 0.2, // Increase threshold for better visibility trigger
      rootMargin: '0px' // Can be adjusted to trigger animation earlier/later
    });
    
    // Observe the container element instead of the whole component
    const container = this.shadowRoot.querySelector('.container');
    if (container) {
      this.observer.observe(container);
    }
  }
  
  resetAnimation() {
    // Reset animation state
    this.isAnimating = false;
    this.hasAnimated = false;
    
    // Remove active class from title
    const title = this.shadowRoot.querySelector('.Text--title');
    if (title) {
      title.classList.remove('is-active');
    }
    
    // Reconnect observer to watch for viewport entry again
    this.setupIntersectionObserver();
  }
  
  animate() {
    const title = this.shadowRoot.querySelector('.Text--title');
    if (title) {
      // Short delay before starting animation
      this.animationTimeout = setTimeout(() => {
        title.classList.add('is-active');
        this.hasAnimated = true; // Mark as animated
        
        // Disconnect observer after animation to prevent unnecessary callbacks
        this.disconnectObserver();
      }, 100);
    }
  }
  
  render() {
    const text = this.getAttribute('text') || 'Welcome';
    const fontFamily = this.getAttribute('font-family') || 'Montserrat';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 6; // In vw
    const fontColor = this.getAttribute('font-color') || '#264653'; // Deep teal
    const headingTag = this.getAttribute('heading-tag') || 'h1';
    const backgroundColor = this.getAttribute('background-color') || '#F4F1DE'; // Soft cream
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
        :host {
          display: block;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          position: absolute; /* Ensure it fills the parent */
          top: 0;
          left: 0;
          overflow: hidden; /* Prevent overflow issues */
        }
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: ${textAlignment === 'center' ? 'center' : textAlignment === 'right' ? 'flex-end' : 'flex-start'};
          background: ${backgroundColor};
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .Text--title {
          font-family: ${fontFamily};
          font-size: ${fontSize}vw;
          font-weight: 900;
          color: ${fontColor};
          filter: blur(0.5em);
          letter-spacing: 0.3em;
          opacity: 0;
          margin: 0;
          padding: 0;
          width: 100%; /* Ensure text spans full width */
          text-align: ${textAlignment};
          transition: filter 3s ease-out, letter-spacing 3s ease-out, opacity 2s ease-out 1s;
          will-change: filter, letter-spacing, opacity; /* Performance optimization */
        }
        .Text--title.is-active {
          filter: none;
          letter-spacing: 0;
          opacity: 1;
        }
      </style>
      <div class="container">
        <${headingTag} class="Text--title">${text}</${headingTag}>
      </div>
    `;
  }
}

customElements.define('aloha-once', AlohaOnce);
