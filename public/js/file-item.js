class FileItem extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.render();

        window.showFileListContext = this.showContext.bind(this);
    }
  
    disconnectedCallback() {
        
    }

    static get observedAttributes() {
        return ['id',
        'iconClass',
        'userId',
        'createdBy',
        'fileName',
        'createdAt',
        'fileSize',];
    }

    showContext(id) {

    }

    onDragStart(event) {
        event
          .dataTransfer
          .setData('text/plain', event.target.id);
      
        event
          .currentTarget
          .classList.add('is-dragged');
    }

    onDragStop(event) {
        event
          .currentTarget
          .classList.remove('is-dragged');
    }

    render() {
        const id = this.getAttribute('id');
        const iconClass = this.getAttribute('iconClass');
        const userId = Number(this.getAttribute('userId'));
        const createdBy = Number(this.getAttribute('createdBy'));
        const fileName = this.getAttribute('fileName');
        const fileChecksum = this.getAttribute('fileChecksum');
        const createdAt = this.getAttribute('createdAt');
        const isPrivate = this.getAttribute('isPrivate') === 'true';
        const fileSize = Number(this.getAttribute('fileSize'));
        // const isPrivate = this.getAttribute('isPrivate') === 'true';
        const isOwner = userId === createdBy

        this.innerHTML = `
            <li id="file-${id}" data-id="${id}" class="file-item draggable" draggable="true">
                <input type="checkbox" id="file-checkbox-${id}" data-file-id="${id}" class="file-checkbox file-checkbox-item" />
                &nbsp;
                <span class="file-icon-span ${iconClass}"></span>
                <a href="/file/${id}">
                    ${fileName}
                    ${!isOwner ? `<small class="shared">
                    <img src="/img/user-group.svg" alt="shared" />
                    </small>` : `
                        <small class="shared">
                            <img src="/img/${isPrivate ? 'shield' : 'padlock'}.svg" alt="shared" />
                        </small>
                    `}
                </a>
                <div class="file-date">${formatDate(createdAt, true)}</div>
                <div class="file-size">
                    ${formatSizeUnits(fileSize)}
                </div>
            </li>
        `;

        const menuItems = [
            {
                title: 'Share',
                tip: '',
                icon: './img/share.svg',
                onclick: function() {
                    console.log('Item 1 clicked');
                }
            },
            {
                title: 'Delete',
                tip: '',
                icon: './img/delete.svg',
                onclick: () => {
                    showConfirm({
                        text: `Are you sure you want to delete ${fileName}?`,
                        callback: () => {
                            deleteFile(id, fileChecksum)
                                .then(() => {
                                    loadFiles();
                                });
                        }
                    });
                }
            },
        ];

        document.getElementById(`file-${id}`).addEventListener('contextmenu', (e) => {
            e.preventDefault();

            new contextualMenu({
                items: menuItems,
            });
        });

        document.getElementById(`file-${id}`).addEventListener('dragstart', this.onDragStart);
        document.getElementById(`file-${id}`).addEventListener('dragend', this.onDragStop);

        document.getElementById(`file-checkbox-${id}`).addEventListener('change', window.selectFile);
    }
}

customElements.define("file-item", FileItem);
