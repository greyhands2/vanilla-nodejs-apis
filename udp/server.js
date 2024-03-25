// example udp server, creating a udp datagram server listening on 6000

// dependencies

const dgram = require('dgram')



// creating a server
const server = dgram.createSocket('udp4')

server.on('message', function(messageBuffer, sender){
	// do something with the sender or incoming message

	let messageString = messageBuffer.toString()

	console.log(messageString)
})

// bind to 6000
server.bind(6000)