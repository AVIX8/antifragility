const express = require('express')
const path = require('path')
const morgan = require('morgan')
const server = express()

server.use(morgan('dev'))

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
})

server.use('/static', express.static('static'))
server.use('/src', express.static('src'))

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`🚀 Server started at http://localhost:${port}`)
})
