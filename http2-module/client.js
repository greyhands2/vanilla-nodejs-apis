// http2 client


//dependency
const http2 = require('http2')
const decoder = require('string_decoder')
// create client


let client = http2.connect('http://localhost:6000')

// create the request
let req = client.request({
	':path': '/'
})

// when a message is received, add the pieces of it together until you reach the end
let str = ''
req.on('data', function(chunk){
	str+=chunk
})

req.on('end', function(){
	console.log(str)
})


req.end()
