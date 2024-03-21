// this file contains API (integration) tests


// dependencies
const assert = require('assert')
const http = require('http')
const app = require('../index.js')
const config = require('../config.js')



// holder for the test
const api = {}

// helper
const helpers = {}

helpers.makeGetRequest = function(path, callback){
	let reqObject = {
		protocol: 'http:',
		hostname: 'localhost',
		port: config.httpPort,
		method: "GET",
		path,
		headers: {
			'Content-Type': 'application/json'
		},
	}

	let req = http.request(reqObject, function(res){
		callback(res)
	})




	req.on('error', function(e){
		console.log('api test http request error: ', e)
	})


	req.end()
}

// the main init() should be able to run without throwing

api['app.init should start without throwing'] = function(done){
	assert.doesNotThrow(function(){
		app.init(function(err){
			done()
		})
	}, TypeError) // does not throw type error
}


// make a request to /ping
api['/ping should respond to GET with a 200 status code'] = function(done){
	helpers.makeGetRequest('/ping', function(res){
		assert.equal(res.statusCode, 200)
		done()
	})
}



// make a request to /api/users
api['/api/users should respond to GET with a 400 status code'] = function(done){
	helpers.makeGetRequest('/api/users', function(res){
		assert.equal(res.statusCode, 400)
		done()
	})
}




// make a request to random path
api['A random path should respond to GET with a 404 status code'] = function(done){
	helpers.makeGetRequest('/this/path/no/dey', function(res){
		assert.equal(res.statusCode, 404)
		done()
	})
}

module.exports = api
