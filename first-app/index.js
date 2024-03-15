/**
 * primary file for the API
 **/

// dependencies
const server = require('./lib/server.js')
const workers = require('./lib/workers.js')


// Declare the app
const app = {}

// init function
app.init = function(){
	// start the server
	server.init()

	// start the workers
	//workers.init()
}


// execute function
app.init()



module.exports = app