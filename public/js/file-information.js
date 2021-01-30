class FileInformation extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.innerHTML = '<layout-loader text="Loading file..."></layout-loader>';

        this.loadFile();
    }
  
    disconnectedCallback() {
        
    }

    loadFile() {
        const fileId = this.getAttribute('fileid');

        return fetch('/api/v1/files/' + fileId)
            .then(res => res.json()).then((res) => {
                if (res.status === 'error') window.renderLogin();
                
                this.renderFile(res);
            })
            .catch((_err) => {
                window.renderLogin();
            });
    }

    setFilePrivacy = async (e) => {
        e.preventDefault();
        const fileId = this.getAttribute('fileid');

        try {
            const res = await fetch('/api/v1/files/' + fileId + '/privacy/' + (e.target.checked ? 'true' : 'false'));
            const res_1 = await res.json();
            if (res_1.status === 'error')
                window.renderLogin();

        } catch (_err) {
            window.renderLogin();
        }
    }

    getShareLink = (e, checksum) => {
        e.preventDefault();
        const fileId = this.getAttribute('fileid');
        const url = `http://testbot.com/api/v1/file/${fileId}/${checksum}/otl`;

        fetch(url).then(resp => resp.json())
            .then(({ message }) => {
                const el = document.getElementById('sharelink');
                el.innerHTML = `<b>One time share link:</b> ${window.location.origin}/otl/${message}`;
                el.style.display = 'block';
            })
            .catch(err => {
                this.renderLogin();
            });
    }

    renderFile(fileData) {
        if (!fileData) {
            this.innerHTML = 'File not found'
        } else {
            const asssetData = fileData.vc.pop();
            const iconClass = window.FileIcons.getClassWithColor(asssetData.assetName);
            const fileType = /[^.]+$/.exec(asssetData.assetName)[0];
            const userId = Number(this.getAttribute('userid'));

            this.innerHTML = `
                <div class="container">
                    <div class="file-information">
                        <div class="file-data">
                            <h1 class="file-name"><span class="${iconClass}"></span>${asssetData.assetName}</h1>
                            <div class="file-size">Size: ${formatSizeUnits(asssetData.assetSize)}</div>
                            <div class="file-date">${formatDate(asssetData.createdAt)}</div>
                            <ul class="file-actions">
                                <li>
                                <a href="/api/v1/file/${fileData._id}/${asssetData.assetHash}" download="${asssetData.assetName}">Download</a>
                                </li>
                                ${fileData.createdBy === userId ? `
                                <li>
                                <button id="file-${asssetData.assetHash}">Delete</button>
                                </li>
                                <li>
                                <label>
                                <input type="checkbox" id="isPrivate" /> Is Private
                                </label>
                                </li>
                                <li>
                                <button id="share-${asssetData.assetHash}">Share</button>
                                </li>` : ''}
                            </ul>
                            <div id="sharelink" class="share-link"></div>
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

            const deleteFileEl = document.getElementById(`file-${asssetData.assetHash}`);
            if (deleteFileEl) {
                deleteFileEl.addEventListener('click', () => {
                    showConfirm({
                        text: `Are you sure you want to delete ${asssetData.assetName}?`,
                        callback: () => {
                            deleteFile(fileData._id, asssetData.assetHash)
                                .then(() => {
                                    document.location = '/';
                                });
                        }
                    });
                });
            }


            const shareFileEl = document.getElementById(`share-${asssetData.assetHash}`);
            if (shareFileEl) {
                shareFileEl.addEventListener('click', (e) => {
                    this.getShareLink(e, asssetData.assetHash);
                });
            }

            const isPrivateEl = document.getElementById('isPrivate');
            
            if (isPrivateEl) {
                if (fileData.isPrivate) {
                    document.getElementById('isPrivate').setAttribute('checked', 'checked');
                }
                document.getElementById('isPrivate').addEventListener('change', this.setFilePrivacy, true);
            }

            if (fileType === 'pdf') {
                PDFObject.embed(`/api/v1/file/${fileData._id}/${asssetData.assetHash}`, "#pdf-preview", { height: '40vh'});
            }
        }
    }
  }

customElements.define("file-information", FileInformation);
