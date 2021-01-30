class App extends HTMLElement {
    constructor() {
      super();
      this.route = '/';
      this.isLoggedIn = false;
      this.userData = null;
      this.isLoaded = false;
    }
  
    connectedCallback() {

        if (!this.isLoaded) {
            this.innerHTML = '<layout-loader></layout-loader>';
            this.isLoaded = true;
        }

        this.checkIfLogged()
            .then((res) => {
                if (res.status === 'error') {
                    this.userData = null;
                    this.isLoggedIn = false;
                    this.renderLogin();
                } else {
                    this.userData = res.message;
                    this.isLoggedIn = true;
                    this.renderRoutes();
                }
            });

        window.onhashchange = this.checkRoute;

        window.renderLogin = this.renderLogin.bind(this);

        window.document.addEventListener('click', (e) => {
            if (e.target.nodeName === 'A') {
                const href = e.target.href;

                if (href.indexOf(window.location.origin + '/') === 0 && !e.target.download) {
                    e.preventDefault();
                    window.history.pushState({}, '', href);
                }
            }
        }, false);
    }
  
    disconnectedCallback() {
        window.removeEventListener('hashchange', this.checkRoute);
    }
  
    static get observedAttributes() {
      return ['route'];
    }
  
    attributeChangedCallback(_name, _oldValue, _newValue) {
        this.renderRoutes();
    }
  
    adoptedCallback() {
      console.log('Element Moved');
    }

    checkIfLogged() {
        return fetch('/session')
            .then(resp => resp.json());
    }

    checkRoute() {
        this.route = document.location.pathname;

        document.getElementById('root').innerHTML = `<layout-header></layout-header><application-root route="${this.route}"></application-root>`;
    }

    renderRoutes() {
        const router = new Router({
            mode: 'history',
            root: '/'
        });
        
        if (this.isLoggedIn) {
            this.innerHTML = '';
            
            router
                .add(/file\/(.*)/, (file) => {
                    this.innerHTML = `<file-information userId="${this.userData.id}" isLoggedIn="${this.isLoggedIn}" fileId="${file}"></file-information>`;
                })
                .add(/category\/(.*)/, (categoryId) => {
                    this.innerHTML = `<files-list userId="${this.userData.id}" categoryid="${categoryId}" isLoggedIn="${this.isLoggedIn}"></files-list>`;
                })
                .add('', () => {
                    this.innerHTML = `<files-list userId="${this.userData.id}" isLoggedIn="${this.isLoggedIn}"></files-list>`;
                });
        }
    }

    renderLogin() {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'https://telegram.org/js/telegram-widget.js?14';
        s.setAttribute('data-telegram-login', 'larchanka_bot')
        s.setAttribute('data-size', 'large')
        s.setAttribute('data-onauth', 'onTelegramAuth(user)')
        s.setAttribute('data-request-access', 'write');

        document.getElementById('root').innerHTML = '<div id="app-root"></div>';

        document.getElementById('app-root').appendChild(s);
    }
  }

customElements.define("application-root", App);
