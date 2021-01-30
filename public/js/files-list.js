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
            this.loadCategories();

        window.loadFiles = this.loadFiles.bind(this);
        window.selectAllFiles = this.selectAllFiles;
        window.selectFile = this.selectFile;
        this.selectedFiles = [];
    }
  
    disconnectedCallback() {
        
    }

    selectAllFiles = (e) => {
        e.preventDefault();
        const isChecked = e.target.checked;
        document.querySelectorAll('.file-checkbox-item').forEach(el => {
            el.checked = isChecked;
        });

        if (document.querySelectorAll('.file-checkbox-item:checked').length < document.querySelectorAll('.file-checkbox').length - 1) {
            document.getElementById('select-all-files').checked = false;
        }
    }

    selectFile = (e) => {
        e.preventDefault();
        if (document.querySelectorAll('.file-checkbox-item:checked').length < document.querySelectorAll('.file-checkbox').length - 1) {
            document.getElementById('select-all-files').checked = false;
        } else {
            document.getElementById('select-all-files').checked = true;
        }
    }

    loadFiles(filter = this.filter) {
        this.filter = filter;
        
        return fetch(`/api/v1/files${filter ? '/filter/' + JSON.stringify(filter).replace(/"/g, '~') : ''}${this.categoryId ? '/category/' + this.categoryId : ''}`)
            .then(res => res.json())
            .then((res) => {
                if (res.status === 'error') window.renderLogin();
                
                this.renderFiles(res);
            })
            .catch((_err) => {
                window.renderLogin();
            });
    }

    loadCategories() {
        return fetch(`/api/v1/categories`)
            .then(res => res.json())
            .then((res) => {
                if (res.status === 'error') window.renderLogin();
                
                this.categories = res;

                return loadFiles();
            })
            .catch((_err) => {
                window.renderLogin();
            });
    }

    renderFiles(files = []) {
        const userId = Number(this.getAttribute('userid'));

        if (this.categoryId) {
            const activeCategory = this.categories.find(c => c._id === this.categoryId);
            window.document.title = `TgCloud: ${activeCategory.categoryTitle}`;
        } else {
            window.document.title = `TgCloud`;
        }

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
                        <file-filters filters="${JSON.stringify(this.filter).replace(/"/g, '~')}"></file-filters>
                        <ul class="file-list">
                            ${files.length ? files.map(file => {
                                const fileData = file.vc.pop();
                                const iconClass = window.FileIcons.getClassWithColor(fileData.assetName);
                                return `
                                    <file-item
                                        id="${file._id}"
                                        iconClass="${iconClass}"
                                        userId="${userId}"
                                        createdBy="${file.createdBy}"
                                        fileName="${fileData.assetName}"
                                        createdAt="${fileData.createdAt}"
                                        fileSize="${fileData.assetSize}"
                                        fileChecksum="${fileData.assetHash}"
                                        isPrivate="${file.isPrivate}"
                                    ></file-item>
                                `;
                            }).join('') : '<h3>Files not found</h3>'}
                        </ul>
                    </div>
                    <div class="aside-actions">
                        <h4>Upload Files</h4>
                        <file-upload userid="${userId}" categoryid="${this.categoryId}" isloggedin="true"></file-upload>
                    </div>
                </div>
            </div>
        `;
    }
  }

customElements.define("files-list", FilesList);
