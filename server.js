const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const queryString = require('querystring')

const handlers = {}
handlers.ping = function(data, callback){
	callback(200)
}
handlers.notFound = function(data, callback){
	callback(404)
}

handlers.users = function(data, callback){
	if(['post', 'get', 'put', 'delete'].indexOf(data.method) > -1){
		handlers._users[data.method](data, callback)
	} else {
		callback(405)
	}
}


handlers._users = {
	post: function(data, callback){

		let stringPayload = queryString.stringify(data.payload)
		let reqObj = {
			protocol: 'http:',
			hostname: 'www.blablabla',
			method: 'GET',
			path: "/endpoint",
			auth: "wf8w9u28r9erwe",
			headers: {
				"Content-Type": "application/json"
			}

		}


		let req = http.request(reqObj, function(res){
			let status = res.statusCode
			if(status === 200 ||  status === 201){
				callback(status, JSON.stringify(res.data))
			} else {
				callback(400, {error: "Something about your request didn't go well"})
			}
		})

		req.on('error', function(){
			callback(500, {error: "Something went wrong please try again"})
		})

		req.write(stringPayload)
		req.end()

	}
}





const server = http.createServer(function(req, res){
	let parsedUrl = url.parse(req.url, true)
	let path = parsedUrl.pathname
	let trimmedPath = path.replace(/^\/+|\/+$/g, '')

	
	let method = req.method.toLowerCase()
	let queryObj = parsedUrl.query

	let headers = req.headers

	let decoder = new StringDecoder('utf8')
	let buffer = ''

	req.on('data', function(data){
		buffer += decoder.write(data)
	})

	req.on('end', function(){
		buffer += decoder.end()
		

		

		try {
			let payload = JSON.parse(buffer)

			let chosenPath = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

			let data = {
				method,
				headers,
				payload,
				trimmedPath,
				queryObj

			}
			chosenPath(data, function(statusCode, payload){
				processResponse(res, 'json', statusCode, payload)
			})
		} catch(e){
			console.log(e)
			processResponse(res, 'json', 500, {error: "Something went wrong, please try again"})
		}

	})


})

const processResponse = function(res, contentType, statusCode, payload){
	payload = (typeof(payload) === 'object' && !payload instanceof Array) ? payload : {}

	res.setHeader('Content-Type', `application/${contentType}`)
	res.writeHead(statusCode)
	res.end(JSON.stringify(payload))
}

server.init = function(){
	let port = process.env.port || 3000
	server.listen(port, function(){
		console.log(`server runs on port ${port}`)
	})
}




const router = {
	ping: handlers.ping,
	users: handlers.users
}

module.exports = server