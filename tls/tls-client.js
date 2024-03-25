// tls client that connects to port 6000 and sends the word "ping".. TLS is like the https of tcp as it requires certificates



const tls = require('tls')
const fs = require('fs')
const path = require('path')
// define the ouitbound message to send
let outboundMessage = 'ping'


const options = {
	
	ca: key: fs.readFileSync(path.join(__dirname, "/../first-app/https/cert.pem"))
} // this is only required because we are using a self signed certificate

// create a client

const client = tls.connect(6000, options, function(){
	// send the message
	client.write(outboundMessage)


})


// when the server writes back , log what is says then kill the client


client.on('data', function(inboundMessage){
	let messageString = inboundMessage.toString()

	console.log("I wrote "+outboundMessage+ " and they said "+inboundMessage)

	client.end()
})

