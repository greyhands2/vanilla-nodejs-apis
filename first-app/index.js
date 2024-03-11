/**
 * primary file for the API
 **/

const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder;
const config = require('./config.js')
const fs = require('fs')
const handlers = require('./lib/handlers.js')





// server should respond to all request with  a string

// instantiate http server
const serverHttp = http.createServer(function(req, res){
	return unifiedServer(req, res)
})




// instantiate https server
const httpsServerOptions={}
httpsServerOptions.key = fs.readFileSync('./https/key.pem')
httpsServerOptions.cert = fs.readFileSync('./https/cert.pem') 
const serverHttps = https.createServer(httpsServerOptions, function(req, res){
	return unifiedServer(req, res)
})



const httpPort = config.httpPort || 3000
serverHttp.listen(httpPort, function(){
	console.log(`http server listening on port ${httpPort}`)
})

const httpsPort = config.httpsPort || 3001
serverHttps.listen(httpsPort, function(){
	console.log(`https server listening on port ${httpsPort}`)
})
// All the server logic for both htp and https
const unifiedServer = function(req, res){
	// get the url and parse it
	const parsedURL = url.parse(req.url, true) // the true here  enables query string data

	// get path from url

	const path = parsedURL.pathname // e.g the /blablaapi/v1/palavaapp
	const trimmedPath = path.replace(/^\/+|\/+$/g, '')

	// get the http method
	const method = req.method.toLowerCase()

	//fetch the querystring
	const queryStringObj = parsedURL.query

	 //get the headers as an object
	const headers = req.headers // our jwt tokens or cookies would be here

	// get the payload if there is
	const decoder = new StringDecoder('utf8')

	const buffer = '' // variable to contain the complete utf8 data

	// the request object emits an event called data that contains the streams of data in the request body payload

	req.on('data', function(data){
		buffer += decoder.write(data) // everytime little data is streamed in, we decode the undecoded data to utf8 and append that bit to the buffer
	}) // note this data event would only be called if there's data sent

	// the request object also emits an event called 'end' when the req object finishes emitting streams of data
	req.on('end', function(){
		buffer += decoder.end()
		//choose the handler this request should goto
		const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
		//construct the data ibject to send to the handler
		const data = {
			trimmedPath,
			queryStringObj,
			method,
			headers,
			'payload': buffer
		} 

		// route the request to the handler
		chosenHandler(data, function(statusCode, payload){
			// use the status code called back by the handler or default to 200
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200


			// use the callback provided by handler or default to {}
			payload = (typeof(payload) === 'object' && !Array.isArray(payload)) ? payload : {}

			// convert to string
			payloadString = JSON.stringify(payload)

				res.setHeader('Content-Type', 'application/json') // tell the client we are returning JSON
				res.writeHead(statusCode) // set a status code
				res.end(payloadString) // return the JSON
	

			// log the path the user asked for
			console.log("the request payload is: ", buffer)
		})

			// send response
	

	}) // note the end event would always be called whether there's data sent or not


}



// define a request router
const router = {
	ping : handlers.ping,
	users: handlers.users
 }
