
class Filters extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.render();
    }
  
    disconnectedCallback() {
        
    }

    static get observedAttributes() {
        return ['filters'];
    }

    attributeChangedCallback(_name, _oldValue, _newValue) {
        this.render();
    }

    render() {
        const filters = JSON.parse(this.getAttribute('filters').replace(/~/g, '"'));

        const btns = [
            {
                name: 'Name',
                id: 'nameFilter',
                field: 'originalName',
            },
            {
                name: 'Created',
                id: 'createdFilter',
                field: 'updatedAt',
            },
            {
                name: 'Size',
                id: 'sizeFilter',
                field: 'originalSize',
            },
        ];

        this.innerHTML = `
        
            <div class="filters">
                ${btns.map(btn => {
                    const filter = {sort: { [btn.field]: filters.sort[btn.field] ? filters.sort[btn.field] * -1 : 1 }};
                    return `
                    <div
                        id="${btn.id}"
                        class="${filters.sort && filters.sort[btn.field] ? `${filters.sort[btn.field] === 1 ? 'arrow-up' : 'arrow-down'}` : ''}"
                        onclick='window.loadFiles(${JSON.stringify(filter)})'
                    >
                        <button>${btn.name}</button>
                    </div>
                `;
                }).join('')}
            </div>

        `;
    }
  }

customElements.define("file-filters", Filters);

class FilesList extends HTMLElement {
    constructor() {
      super();

      this.filter = { sort: { updatedAt: -1 } };
    }
  
    connectedCallback() {
        this.innerHTML = '<layout-loader text="Loading files..."></layout-loader>';

        const isLoggedIn = Boolean(this.getAttribute('isloggedin'));

        if (isLoggedIn)
            this.loadFiles();

        window.loadFiles = this.loadFiles.bind(this);
    }
  
    disconnectedCallback() {
        
    }

    loadFiles(filter = this.filter) {
        this.filter = filter;
        
        return fetch(`/api/v1/files${filter ? '/filter/' + JSON.stringify(filter).replace(/"/g, '~') : ''}`)
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
        if (!files.length) {
            this.innerHTML = 'Files not found'
        } else {
            const userId = Number(this.getAttribute('userid'));
            this.innerHTML = `
                <div class="container">
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
                                ></file-item>
                            `;
                        }).join('')}
                    </ul>
                </div>
            `;
        }
    }
  }

customElements.define("files-list", FilesList);
