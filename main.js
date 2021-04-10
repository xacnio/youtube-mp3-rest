const express = require('express')
const _app = require('./app.js')
const config = require('./config')
const {getMainURL} = require('./scripts/funcs')
const app = express();

app.use('/ui', express.static('ui'))
app.use(express.static('mp3'))
app.use(_app)
app.listen(config.port, config.hostname, () => {
    console.log(`Started on ${getMainURL(config)}`)
    console.log(`Test via form: ${getMainURL(config)}/ui`)
});