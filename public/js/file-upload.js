class FilesUpload extends HTMLElement {
    constructor() {
      super();

      this.isPrivate = true;
      this.isEncrypted = true;
      this.totalFiles = 0;
      this.filesToUpload = 0;
    }
  
    connectedCallback() {
        this.renderForm();
    }
  
    disconnectedCallback() {
        
    }

    renderForm() {
        function handleDrop(e) {
            let dt = e.dataTransfer
            let files = dt.files

            handleFiles(files)
        }

        const handleFiles = (files) => {
            $("#status").empty().text('Uploading');
            this.filesToUpload = files.length;
            ([...files]).forEach((file) => uploadFile(file, this.isPrivate, this.isEncrypted));
        }
          
        function highlight(e) {
            dropArea.classList.add('highlight')
        }
        
        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }

        const uploadFile = (file, isPrivate, isEncrypted) => {
            var url = '/api/v1/upload'
            var xhr = new XMLHttpRequest()
            var formData = new FormData()
            xhr.open('POST', url, true)
          
            xhr.addEventListener('readystatechange', (e) => {
              if (xhr.readyState == 4 && xhr.status == 200) {
                  this.totalFiles += 1;
                  console.log(this.totalFiles, this.filesToUpload)

                  if (this.totalFiles >= this.filesToUpload) {
                    $("#status").empty().text('Uploaded');
                    this.totalFiles = 0;
                    this.filesToUpload = 0;

                    document.location.replace('/');
                  }
              }
              else if (xhr.readyState == 4 && xhr.status != 200) {
                $("#status").empty().text('Error');
                document.location.reload();
              }
            })
          
            formData.append('selectedFile', file);
            formData.append('isEncrypted', isEncrypted);
            formData.append('isPrivate', isPrivate);
            xhr.send(formData)
        }

        const setIsPrivate = () => {
            this.isPrivate = !this.isPrivate;

            this.renderForm();
        }

        const setIsEncrypted = () => {
            this.isEncrypted = !this.isEncrypted;

            this.renderForm();
        }

        this.innerHTML = `
        <div class="upload-file container">
            <form id="uploadForm" enctype="multipart/form-data" method="post">
                <div id="drop-area">
                    <input type="file" id="fileElem" multiple name="selectedFile" />
                    <label class="button" for="fileElem">Select some files</label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="isPrivate"
                            id="isPrivate"
                        />
                        Is Private
                    </label>
                </div>
                <div style="display:none">
                    <label>
                        <input
                            type="checkbox"
                            name="isEncrypted"
                            id="isEncrypted"
                        />
                        Is Encrypted
                    </label>
                </div>
            </form>
            <span id="status"></span>
        </div>
        `;

        let dropArea = document.getElementById('drop-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        })
          
        function preventDefaults (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        });
          
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        });

        document.getElementById('fileElem').onchange = (e) => {
            handleFiles(e.target.files);
        }

        dropArea.addEventListener('drop', handleDrop, false);

        document.getElementById('isPrivate').removeEventListener('change', setIsPrivate, false);
        document.getElementById('isPrivate').addEventListener('change', setIsPrivate, false);

        document.getElementById('isEncrypted').removeEventListener('change', setIsEncrypted, false);
        document.getElementById('isEncrypted').addEventListener('change', setIsEncrypted, false);

        if (this.isPrivate) {
            document.getElementById('isPrivate').setAttribute('checked', '');
        }

        if (this.isEncrypted) {
            document.getElementById('isEncrypted').setAttribute('checked', '');
        }
    }
  }

customElements.define("file-upload", FilesUpload);
