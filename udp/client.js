// example udp client sending a message to a udp server on port 6000




// dependency


const dgram = require('dgram')



// create the client


cinst client = dgram.createSocket('udp4')

// define the message and pull it into a buffer


let messageString = ' This is a message'

let messageBuffer = Buffer.from(messageString)


// send off the message
client.send(messageBuffer, 6000, 'localhost', function(err){
	client.close()
})
