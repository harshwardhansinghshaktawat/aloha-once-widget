class AlohaOnce extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
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
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
    }
    clearTimeout(this.animationTimeout);
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isAnimating) {
          this.isAnimating = true;
          this.animate();
          observer.unobserve(this);
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this);
  }

  animate() {
    const title = this.shadowRoot.querySelector('.Text--title');
    this.animationTimeout = setTimeout(() => {
      title.classList.add('is-active');
    }, 500);
  }

  render() {
    const text = this.getAttribute('text') || 'Welcome';
    const fontFamily = this.getAttribute('font-family') || 'Montserrat';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 6; // In vw
    const fontColor = this.getAttribute('font-color') || '#264653'; // Deep teal
    const headingTag = this.getAttribute('heading-tag') || 'h1';
    const backgroundColor = this.getAttribute('background-color') || '#F4F1DE'; // Soft cream
    const textAlignment = this.getAttribute('text-alignment') || 'center';

    this.isAnimating = false;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');

        :host {
          display: block; /* Ensure it behaves as a block element */
          width: 100%; /* Full width of parent */
          height: 100%; /* Full height of parent */
          margin: 0; /* Remove any default margins */
          padding: 0; /* Remove any default padding */
        }

        .container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: ${textAlignment};
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
          transition: filter 3s ease-out, letter-spacing 3s ease-out, opacity 2s ease-out 1s;
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
