class LayoutHeader extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.render();
    }
  
    disconnectedCallback() {
        
    }

    render() {
        this.innerHTML = `
        <div class="header">
            <div class="logo">
                <img src="/img/data-transfer.svg" alt="TgCloud" />
                TgCloud
            </div>
            <div class="menu">
                <!-- <a href="/">Files</a> -->
            </div>
        </div>`;
    }
  }

customElements.define('layout-header', LayoutHeader);
