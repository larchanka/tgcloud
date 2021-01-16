class FilesUpload extends HTMLElement {
    constructor() {
      super();
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

        function handleFiles(files) {
            $("#status").empty().text('Uploading');
            ([...files]).forEach(uploadFile);
        }
          
        function highlight(e) {
            dropArea.classList.add('highlight')
        }
        
        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }

        function uploadFile(file) {
            var url = '/api/v1/upload'
            var xhr = new XMLHttpRequest()
            var formData = new FormData()
            xhr.open('POST', url, true)
          
            xhr.addEventListener('readystatechange', function(e) {
              if (xhr.readyState == 4 && xhr.status == 200) {
                $("#status").empty().text('Uploaded');
                document.location.hash = '/';
              }
              else if (xhr.readyState == 4 && xhr.status != 200) {
                $("#status").empty().text('Error');
                document.location.reload();
              }
            })
          
            formData.append('selectedFile', file)
            xhr.send(formData)
        }

        this.innerHTML = `
            <div id="drop-area">
                <form id="uploadForm" enctype="multipart/form-data" method="post">
                    <input type="file" id="fileElem" multiple name="selectedFile" />
                    <label class="button" for="fileElem">Select some files</label>
                </form>
            </div>
            <span id="status"></span>
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

        dropArea.addEventListener('drop', handleDrop, false)
    }
  }

customElements.define("file-upload", FilesUpload);
