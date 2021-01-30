class FilesListItems extends HTMLElement {
    constructor() {
      super();
      this.filter = { sort: { updatedAt: -1 } };
    }
  
    connectedCallback() {
        this.innerHTML = '<layout-loader text="Loading files..."></layout-loader>';

        this.categoryId = this.getAttribute('categoryid');

        window.loadFiles = this.loadFiles;
        window.selectAllFiles = this.selectAllFiles;
        window.selectFile = this.selectFile;
        this.selectedFiles = [];

        this.loadFiles();
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

    loadFiles = (filter = this.filter) => {
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

    renderFiles(files = []) {
        const userId = Number(this.getAttribute('userid'));

        this.innerHTML = `
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
        `;
    }
  }

customElements.define("files-list-items", FilesListItems);
