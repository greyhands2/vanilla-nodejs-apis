// example http2 server

// dependency
const http2 = require('http2')


// init server

const server = http2.createServer()


// on a stream(websocket), send back helloworld in html
server.on('stream', function(stream, headers){
	stream.respond({
		status: 200,
		'content-type': 'text/html'
	})

	stream.end('<html><body><p>Hello World</p></body></html>')
})

// listen on 6000
server.listen(6000)
