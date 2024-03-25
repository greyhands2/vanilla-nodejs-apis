 // example tls server



// listens to port 6000 and sends the word "pong" to the client TLS is like the https of tcp as it requires certificates



const tls = require('tls')
const fs = require('fs')
const path = require('path')



// server option
const options = {
	key: fs.readFileSync(path.join(__dirname, "/../first-app/https/key.pem")),
	cert: key: fs.readFileSync(path.join(__dirname, "/../first-app/https/cert.pem"))
}
// create the server

let server = tls.createServer(options, function(connection){
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