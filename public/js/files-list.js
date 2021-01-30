class FilesList extends HTMLElement {
    constructor() {
      super();

      this.filter = { sort: { updatedAt: -1 } };
      this.categories = [];
    }
  
    connectedCallback() {
        this.innerHTML = '<layout-loader text="Loading files..."></layout-loader>';

        const isLoggedIn = Boolean(this.getAttribute('isloggedin'));

        this.categoryId = this.getAttribute('categoryid');

        if (isLoggedIn)
            this.render();
    }
  
    disconnectedCallback() {
        
    }

    render() {
        const userId = Number(this.getAttribute('userid'));

        this.innerHTML = `
            <div class="container">
                <div class="aside-container">
                    <div class="aside">
                        <div class="sticky">
                            <layout-header></layout-header>
                            <h3>Categories</h3>
                            <files-list-categories categoryid="${this.categoryId || ''}" userid="${userId}"></files-list-categories>
                            <files-list-add-category></files-list-add-category>
                        </div>
                    </div>
                    <div class="aside-content">
                        <files-list-items userid="${userId}" categoryid="${this.categoryId || ''}"></files-list-items>
                    </div>
                    <div class="aside-actions">
                        <h4>Upload Files</h4>
                        <file-upload userid="${userId}" categoryid="${this.categoryId || ''}" isloggedin="true"></file-upload>
                    </div>
                </div>
            </div>
        `;
    }
  }

customElements.define("files-list", FilesList);
