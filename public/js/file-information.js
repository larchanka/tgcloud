class FileInformation extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.innerHTML = '<layout-loader text="Loading file..."></layout-loader>';

        this.loadFile()
            .then((res) => {
                if (res.status === 'error') window.renderLogin();
                
                this.renderFile(res);
            })
            .catch((_err) => {
                window.renderLogin();
            });
    }
  
    disconnectedCallback() {
        
    }

    loadFile() {
        const fileId = this.getAttribute('fileid');

        return fetch('/api/v1/files/' + fileId)
            .then(res => res.json());
    }

    renderFile(fileData) {
        if (!fileData) {
            this.innerHTML = 'File not found'
        } else {
            const asssetData = fileData.vc.pop();
            const iconClass = window.FileIcons.getClassWithColor(asssetData.assetName);
            const fileType = /[^.]+$/.exec(asssetData.assetName)[0];

            this.innerHTML = `
                <div class="container">
                    <div class="file-information">
                        <div class="file-data">
                            <h1 class="file-name"><span class="${iconClass}"></span>${asssetData.assetName}</h1>
                            <div class="file-size">Size: ${formatSizeUnits(asssetData.assetSize)}</div>
                            <div class="file-date">${formatDate(asssetData.createdAt)}</div>
                            <div class="file-actions">
                                <a href="/api/v1/file/${fileData._id}/${asssetData.assetHash}" download="${asssetData.assetName}">Download</a>
                                <button id="file-${asssetData.assetHash}">Delete</button>
                            </div>
                        </div>
                        <div class="file-preview">
                            ${['mp4', 'mov', 'wmv'].indexOf(fileType) > -1
                                ? `<video controls src="/api/v1/file/${fileData._id}/${asssetData.assetHash}"></video>`
                                : ''}

                            ${['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(fileType) > -1
                                ? `<img src="/api/v1/file/${fileData._id}/${asssetData.assetHash}" alt="${asssetData.assetName}">`
                                : ''}

                            ${['pdf'].indexOf(fileType) > -1
                                ? `<div id="pdf-preview"></div>`
                                : ''}

                            ${['mp3', 'wav', 'weba'].indexOf(fileType) > -1
                                ? `<audio controls src="/api/v1/file/${fileData._id}/${asssetData.assetHash}"></audio>`
                                : ''}

                            ${['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf'].indexOf(fileType) > -1
                                ? `<!--${document.location.origin}/api/v1/file/${fileData._id}/${asssetData.assetHash}-->`
                                : ''}
                        </div>
                </div>
            `;

            document.getElementById(`file-${asssetData.assetHash}`).addEventListener('click', () => {
                showConfirm({
                    text: `Are you sure you want to delete ${asssetData.assetName}?`,
                    callback: () => {
                        deleteFile(fileData._id, asssetData.assetHash)
                            .then(() => {
                                document.location.hash = '/';
                            });
                    }
                });
            })

            if (fileType === 'pdf') {
                PDFObject.embed(`/api/v1/file/${fileData._id}/${asssetData.assetHash}`, "#pdf-preview", { height: '40vh'});
            }
        }
    }
  }

customElements.define("file-information", FileInformation);
