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
app.init = function(callback){
	// start the server
	server.init()

	// start the workers
	workers.init()

	// start the cli but make sure it starts last
	setTimeout(function(){
		cli.init()
		callback()
	}, 50)
}


// self invoking only if required directly
if(require.main === module){ // if another module like server js requires this file then let it auto init itself with the line in this if block else do nothing
	app.init(function(){})
}




module.exports = app