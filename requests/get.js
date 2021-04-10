const yts = require('yt-search')
const { matchYoutubeUrl, clearStr } = require('../scripts/funcs.js')
const axios = require('axios')
const fs = require('fs')
const ID3Writer = require('browser-id3-writer');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../config.js');
const path = require('path')
const glob = require('glob')

/*
GET /get
    Query Parameters:
    - url: Youtube-URL
    - redirect (optional): if is 'true' : redirect to MP3 url after downloading
    - performer (optional): performer for MP3 meta data (default: video author name)
    - title (optional): title for MP3 meta data (default: video title)
*/
const get = async (req, res) => {
    if (req.query.length < 2 || req.query.url === undefined || req.query.url.length == 0)
        return Error(res, "INVALID_REQUEST")

    let video_id = matchYoutubeUrl(req.query.url);
    if (video_id == false)
        return Error(res, "INVALID_URL")

    glob(`mp3/*_${video_id}.mp3`, async (err, files) => {
        if (err == null && files.length == 1) {
            var filename = files[0]
            if (req.query.redirect !== undefined && req.query.redirect == 'true')
                return res.redirect(MP3_URL(filename))
            
            Success(res, MP3_URL(filename));
        }
        else {
            const search = await yts({ videoId: video_id });
            if (search == undefined)
                return Error(res, 'VIDEO_INFO_ERROR')
            
            var performer = (req.query.performer === undefined) ? search.author.name : req.query.performer
            var title = (req.query.title === undefined) ? search.title : req.query.title
            var thumb = null
            var filename = "./mp3/" + clearStr(search.title) + `_${video_id}.mp3`
            var thumb = null
            try {
                const response = await axios.get(search.thumbnail, { responseType: 'arraybuffer' })
                thumb = Buffer.from(response.data, "utf-8")
            }
            catch (err) {
                // continue without thumbnail
            }
            
            try {
                let stream = ytdl(video_id, { quality: 'highestaudio' });
                downloadmp3(stream, filename, thumb, performer, title).then(function (mp3) {
                    if (req.query.redirect !== undefined && req.query.redirect == 'true') {
                        return res.redirect(MP3_URL(filename))
                    }
                    Success(res, MP3_URL(filename));
                });
            }
            catch (err) {
                console.log(err)
                return Error(res, 'DOWNLOAD_ERROR')
            }
        }
    })    
}

function Success(res, url)
{
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: false, url }))
}

function Error(res, msg)
{
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: true, message: msg }))
}

function downloadmp3(stream, filename, thumb, performer, title)
{
    return new Promise(function(resolve, reject) {
        ffmpeg(stream)
            .audioBitrate(320)
            .save(filename)
            .on('end', () => {
                const writer = new ID3Writer(fs.readFileSync(filename));
                writer.setFrame('TIT2', title);
                writer.setFrame('TPE1', [performer]);
                if (thumb !== null)
                    writer.setFrame('APIC', { type: 3, data: thumb, description: 'youtube-mp3-rest' });
                writer.addTag();
                const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
                fs.writeFileSync(filename, taggedSongBuffer);
                resolve(taggedSongBuffer)
            });
    })
}

function MP3_URL(filename) {
    return 'http' + (config.https == true ? 's' : '') + "://" + config.hostname + (config.port == 80 ? '' : ':' + config.port) + "/" + path.basename(filename);
}


module.exports = get