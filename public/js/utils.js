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
