function clearStr(str)
{
    str = str.replace(/ /g, "_")
    str = str.replace(/ğ/gim, "g") .replace(/ü/gim, "u").replace(/ş/gim, "s").replace(/ı/gim, "i").replace(/ö/gim, "o") .replace(/ç/gim, "c").replace(/Ğ/gim, "G") .replace(/Ü/gim, "U") .replace(/Ş/gim, "S") .replace(/İ/gim, "I").replace(/Ö/gim, "O") .replace(/Ç/gim, "C").toLowerCase();
    str = str.replace(/[^a-zA-Z0-9-_]/g, "")
    return str
}

function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return url.match(p)[1];
    }
    return false;
}

function getMainURL(config)
{
    return 'http' + (config.https ? 's' : '') + `://${config.hostname}` + (config.port != 80 ? ':' + config.port : '');
}

module.exports = {
    clearStr,
    matchYoutubeUrl,
    getMainURL
}