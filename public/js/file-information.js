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
                el.innerHTML = `<b>One time share link:</b><br />${window.location.origin}/otl/${message}`;
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
            const assetData = fileData.vc.pop();
            const iconClass = window.FileIcons.getClassWithColor(assetData.assetName);
            const fileType = /[^.]+$/.exec(assetData.assetName)[0];
            const userId = Number(this.getAttribute('userid'));

            window.document.title = `TgCloud: ${assetData.assetName}`;

            const backUrl = fileData.categories.length ? `/category/${fileData.categories[0]._id}` : '/';

            const formats = {
                video: ['mp4', 'mov', 'wmv'],
                image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                pdf: ['pdf'],
                audio: ['mp3', 'wav', 'weba'],
            };

            this.innerHTML = `
                <div class="container">
                    <div class="file-information">
                        <div class="file-data">
                            <a href="${backUrl}" class="back-btn">Back to TgCloud</a>
                            <h1 class="file-name">${assetData.assetName}</h1>
                            <br />
                            <h3>Details</h3>
                            <div class="file-size">
                                <span class="faded">Size</span>
                                <br />${formatSizeUnits(assetData.assetSize)}</div>
                            <br />
                            <div class="file-date">
                                <span class="faded">Last modified</span>
                                <br />
                                ${formatDate(assetData.createdAt)}</div>
                            <br />
                            <div class="file-extention">
                                <span class="faded">Extention</span>
                                <br />
                                ${fileType}</div>
                            <br />
                            <div class="file-uploadedby">
                                <span class="faded">Uploaded by</span>
                                <br />
                                <a href="https://t.me/${fileData.telegramUser.user.username}" target="contact-user">
                                    @${fileData.telegramUser.user.username}
                                </a></div>
                            <br />
                            <br />
                            <ul class="file-actions">
                                <li>
                                <a href="/api/v1/file/${fileData._id}/${assetData.assetHash}" download="${assetData.assetName}">Download</a>
                                </li>
                                ${fileData.createdBy === userId ? `
                                <li>
                                <button id="share-${assetData.assetHash}">Share</button>
                                </li>
                                <li>
                                <label>
                                <input type="checkbox" id="isPrivate" /> Is Private
                                </label>
                                </li>
                                </li>
                                <li>
                                <button class="warning" id="file-${assetData.assetHash}">Delete</button>
                                </li>` : ''}
                            </ul>
                            <div id="sharelink" class="share-link"></div>
                        </div>
                        <div class="file-preview">
                            <div class="file-preview-content">
                                <div class="file-preview-content-name">
                                    ${assetData.assetName}
                                </div>
                                <div class="file-preview-view">
                                    ${formats.video.indexOf(fileType) > -1
                                        ? `<video controls src="/api/v1/file/${fileData._id}/${assetData.assetHash}"></video>`
                                        : ''}

                                    ${formats.image.indexOf(fileType) > -1
                                        ? `<img src="/api/v1/file/${fileData._id}/${assetData.assetHash}" alt="${assetData.assetName}">`
                                        : ''}

                                    ${formats.pdf.indexOf(fileType) > -1
                                        ? `<div id="pdf-preview"></div>`
                                        : ''}

                                    ${formats.audio.indexOf(fileType) > -1
                                        ? `<audio controls src="/api/v1/file/${fileData._id}/${assetData.assetHash}"></audio>`
                                        : ''}

                                    ${Object.keys(formats).map(k => formats[k]).flat().indexOf(fileType) === -1
                                        ? `
                                            <div class="unknown-file-preview">
                                                <div>
                                                    <span class="${iconClass} lg-font icon-u"></span>
                                                </div>
                                                <div>
                                                    <strong>.${fileType}</strong> file preview is not supported
                                                </div>
                                                <div>
                                                    <small>
                                                        ${assetData.assetName}
                                                        ·
                                                        ${formatSizeUnits(assetData.assetSize)}
                                                    </small>
                                                </div>
                                            </div>
                                        `
                                        : ''}
                                </div>
                            </div>
                        </div>
                </div>
            `;

            const deleteFileEl = document.getElementById(`file-${assetData.assetHash}`);
            if (deleteFileEl) {
                deleteFileEl.addEventListener('click', () => {
                    showConfirm({
                        text: `Are you sure you want to delete ${assetData.assetName}?`,
                        callback: () => {
                            deleteFile(fileData._id, assetData.assetHash)
                                .then(() => {
                                    document.location = '/';
                                });
                        }
                    });
                });
            }


            const shareFileEl = document.getElementById(`share-${assetData.assetHash}`);
            if (shareFileEl) {
                shareFileEl.addEventListener('click', (e) => {
                    this.getShareLink(e, assetData.assetHash);
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
                PDFObject.embed(`/api/v1/file/${fileData._id}/${assetData.assetHash}`, "#pdf-preview", { height: '100%', width: '100%'});
            }
        }
    }
  }

customElements.define("file-information", FileInformation);
