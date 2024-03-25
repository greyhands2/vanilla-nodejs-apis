// tcp (Net) clien that connects to port 6000 and sends the word "ping"



const net = require('net')


// define the ouitbound message to send
let outboundMessage = 'ping'


// create a server

const client = net.createConnection({port:6000}, function(){
	// send the message
	client.write(outboundMessage)


})


// when the server writes back , log what is says then kill the client


client.on('data', function(inboundMessage){
	let messageString = inboundMessage.toString()

	console.log("I wrote "+outboundMessage+ " and they said "+inboundMessage)

	client.end()
})

