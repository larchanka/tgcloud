class Loader extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.render();
    }
  
    disconnectedCallback() {
        
    }

    render() {
        const text = this.getAttribute('text') || 'Loading...';

        this.innerHTML = `<div class="progress" style="width:100%; position: fixed; bottom: 0; left: 0;">${text}</div>`;
    }
  }

customElements.define('layout-loader', Loader);
