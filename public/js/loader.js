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

        this.innerHTML = `<progress style="width:100%; position: fixed; bottom: 0; left: 0;">${text}</progress>`;
    }
  }

customElements.define('layout-loader', Loader);
