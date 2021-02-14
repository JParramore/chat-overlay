if (window.__vat) {
    let data = document.createElement('div')
    data.id = 'video-data_oc'
    data.innerHTML = JSON.stringify(window.__vat)
    document.body.appendChild(data)
}
