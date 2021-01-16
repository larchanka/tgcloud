function formatSizeUnits(bytes){
    if      (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + ' GB'; }
    else if (bytes >= 1048576)    { bytes = (bytes / 1048576).toFixed(2) + ' MB'; }
    else if (bytes >= 1024)       { bytes = (bytes / 1024).toFixed(2) + ' KB'; }
    else if (bytes > 1)           { bytes = bytes + ' bytes'; }
    else if (bytes == 1)          { bytes = bytes + ' byte'; }
    else                          { bytes = '0 bytes'; }
    return bytes;
}

function formatDate(date) {
    const options = { hour12: false, hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'short', day: 'numeric', };

    return new Date(date).toLocaleDateString('en-US', options);
}

const onTelegramAuth = (user) => {
    fetch('/signin', {
        method: 'post',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => {
        document.getElementById('root').innerHTML = '<layout-header></layout-header><application-root route="' + document.location.hash.replace('#', '') + '"></application-root>';
    });
}

const deleteFile = (fileId, checksum) => {
    return fetch(`/api/v1/file/${fileId}/${checksum}`, { method: 'delete' })
        .then(resp => resp.json());
}

const showConfirm = (options) => {
    const modalId = new Date().getTime();
    const html = `
    <div class="modal-container" id="modal-${modalId}">
        <div class="modal confirm">
            <div class="modal-body">
                <h2>${options.text}</h2>
            </div>
            <div class="modal-btns">
                <button
                    id="modal-${modalId}-cancel"
                >Cancel</button>
                <button
                    id="modal-${modalId}-confirm"
                    class="btn-danger"
                >Confirm</button>
            </div>
        </div>
    </div>
    `;

    document.getElementById('modals').innerHTML = html;

    document.getElementById(`modal-${modalId}-cancel`).addEventListener('click', () => {
        document.getElementById(`modal-${modalId}`).remove();
    });

    document.getElementById(`modal-${modalId}-confirm`).addEventListener('click', () => {
        if (options.callback) {
            options.callback();
        }
        document.getElementById(`modal-${modalId}`).remove();
    });
}
