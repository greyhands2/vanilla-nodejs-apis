// server related tasks

const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder;
const config = require('../config.js')
const fs = require('fs')
const handlers = require('./handlers.js')
const helpers = require('./helpers.js')
const path = require('path')
const util = require('util')
const debug = util.debuglog('server')

// instantiate the server module object
const server = {}
// instantiate http server
		server.serverHttp = http.createServer(function(req, res){
			return server.unifiedServer(req, res)
		})

		// instantiate https server
		server.httpsServerOptions={}
		server.httpsServerOptions.key = fs.readFileSync(path.join(__dirname, '/../https/key.pem'))
		server.httpsServerOptions.cert = fs.readFileSync(path.join(__dirname, '/../https/cert.pem')) 
		server.serverHttps = https.createServer(server.httpsServerOptions, function(req, res){
			return server.unifiedServer(req, res)
		})


// All the server logic for both htp and https
server.unifiedServer = function(req, res){
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

	let buffer = '' // variable to contain the complete utf8 data

	// the request object emits an event called data that contains the streams of data in the request body payload

	req.on('data', function(data){
		buffer += decoder.write(data) // everytime little data is streamed in, we decode the undecoded data to utf8 and append that bit to the buffer
	}) // note this data event would only be called if there's data sent

	// the request object also emits an event called 'end' when the req object finishes emitting streams of data
	req.on('end', function(){
		buffer += decoder.end()
		//choose the handler this request should goto
		const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound
		//construct the data ibject to send to the handler
		const data = {
			trimmedPath,
			queryStringObj,
			method,
			headers,
			'payload': helpers.parseJSONToObject(buffer)
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
	

			// if the response is 200, print green otherwise print red
				if(statusCode === 200) {
					debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`) // 32 green
				} else {
					debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`) // 31 red
				}
			
		})

			
	

	}) // note the end event would always be called whether there's data sent or not


}



// define a request router
server.router = {
	ping : handlers.ping,
	users: handlers.users,
	tokens: handlers.tokens,
	checks: handlers.checks,
 }


// init script
 server.init = function(){
 		

		server.httpPort = config.httpPort || 3000
		server.serverHttp.listen(server.httpPort, function(){
			
			console.log('\x1b[36m%s\x1b[0m', `http server listening on port ${server.httpPort}`) // light blue
		 }) // since we do not want this log to be conditional we still maintained the console.log instead of debug

		server.httpsPort = config.httpsPort || 3001
		server.serverHttps.listen(server.httpsPort, function(){
		
			console.log('\x1b[35m%s\x1b[0m', `https server listening on port ${server.httpsPort}`) // pink

		}) //since we do not want this log to be conditional we still maintained the console.log instead of debug
 }

module.exports = server