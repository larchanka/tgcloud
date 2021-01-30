class FilesList extends HTMLElement {
    constructor() {
      super();

      this.filter = { sort: { updatedAt: -1 } };
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

    onDragOver(e) {
        e.currentTarget.classList.add('droppable-over');
        e.dataTransfer.dropEffect = 'copy';
    }

    onDragLeave(e) {
        e.currentTarget.classList.remove('droppable-over');
    }

    onDrop = (e) => {
        e.currentTarget.classList.remove('droppable-over');
        const draggableEl = document.getElementById(e
            .dataTransfer
            .getData('text'));
        const fileId = draggableEl.getAttribute('data-id');
        const categoryId = e.currentTarget.getAttribute('data-categoryid');
        fetch(`/api/v1/files/${fileId}/category/${categoryId ? categoryId : 'NaN'}`)
            .then(() => {
                draggableEl.remove();
            })
            .catch(e => {
                console.log(e);
                alert('Cannot change file\'s category!');
            });
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
        if (!files.length) {
            this.innerHTML = '<center>Files not found</center>'
        } else {
            const userId = Number(this.getAttribute('userid'));
            this.innerHTML = `
                <div class="container">
                    <div class="aside-container">
                        <div class="aside">
                            <h3>Categories</h3>
                            <ul class="categories">
                                <li><a href="/" class="droppable${!this.categoryId ? ' active' : ''}">No Category</a></li>
                                ${this.categories.map(c => (
                                    `<li>
                                    <a href="/category/${c._id}" id="category-${c._id}" data-categoryid="${c._id}" class="droppable${c._id === this.categoryId ? ' active' : ''}">${c.categoryTitle}</a>
                                    </li>`
                                ))}
                            </ul>
                            <h4>Upload Files</h4>
                            <file-upload userid="${userId}" categoryid="${this.categoryId}" isloggedin="true"></file-upload>
                        </div>
                        <div class="aside-content">
                            <file-filters filters="${JSON.stringify(this.filter).replace(/"/g, '~')}"></file-filters>
                            <ul class="file-list">
                                ${files.map(file => {
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
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;

            document.querySelectorAll('.droppable').forEach(el => {
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    el.addEventListener(eventName, (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }, true);
                })
                el.addEventListener('dragover', this.onDragOver);
                el.addEventListener('dragleave', this.onDragLeave);
                el.addEventListener('drop', this.onDrop);
            })
        }
    }
  }

customElements.define("files-list", FilesList);
