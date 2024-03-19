/**
 * primary file for the API
 **/

// dependencies
const server = require('./lib/server.js')
const workers = require('./lib/workers.js')
const cli  = require('./lib/cli.js')

// Declare the app
const app = {}

// init function
app.init = function(){
	// start the server
	server.init()

	// start the workers
	workers.init()

	// start the cli but make sure it starts last
	setTimeout(function(){
		cli.init()
	}, 50)
}


// execute function
app.init()



module.exports = app