(function () {
    class UserHeader extends HTMLElement { 
        static get observedAttributes() {
          return ['userdata'];
        }

        constructor() {
          super();
        }

        connectedCallback() {
            this._upgradeProperty('userdata');
        }
    
        disconnectedCallback() {
          const btn = document.querySelector('#logout-btn');
          document.removeEventListener('click', this._logOut);
        }

        attributeChangedCallback(name) {
          this._upgradeProperty(name);
        }

        _logOut() {
          fetch('/signout')
            .then(() => {
              window.location.href = '/';
            })
            .catch(e => {
              console.error(e);
              alert('Something went wrong');
            })
        }

        _upgradeProperty(prop) {
          if (this.hasOwnProperty(prop) || this.getAttribute(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;

            this.render();
          }
        }

        set userData(data) {
          this.userdata = data;
        }

        get userData() {
          return this.userdata;
        }

        render() {
          const ud = this.getAttribute('userdata');
          
          if (!ud) {
            this.innerHTML = `ERROR`;
          } else {
            const userData = JSON.parse(ud);
            this.innerHTML = `
              <div class="user-header">
                ${userData.username}
                ${userData.photo_url ? `<img src="${userData.photo_url}" alt="${userData.username}" />` : ''}
                <button id="logout-btn">logout</button>
              </div>
            `;

            const btn = document.querySelector('#logout-btn');
            btn.addEventListener('click', this._logOut);
          }
        }

    }

    customElements.define("user-header", UserHeader);
})();
