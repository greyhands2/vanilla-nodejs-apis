// example tcp (Net) server



// listens to port 6000 and sends the word "pong" to the client



// dependencies


const net = require('net')


// create the server

let server = net.createServer(function(connection){
	// send the word pong
	let outboundMessage = 'pong'
	connection.write(outboundMessage)


	// when the client writes something, log it out

	connection.on('data'  function(inboundMessage){
		let messageString = inboundMessage.toString()
		console.log("I wrote "+outboundMessage+ " and they said "+inboundMessage)
	})
})



// server listen

server.listen(6000)