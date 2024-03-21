/**
 * primary file for the API
 **/

// dependencies
const server = require('./lib/server.js')
const workers = require('./lib/workers.js')
const cli  = require('./lib/cli.js')
const cluster = require('cluster')
const os = require('os')
// Declare the app
const app = {}

// init function
app.init = function(callback){
	// if we're on the master thread, start the background workers and the cli
	if(cluster.isMaster){
		// start the workers
		workers.init()

		// start the cli but make sure it starts last
		setTimeout(function(){
			cli.init()
			callback()
		}, 50)

		// fork the process
		for(let i = 0; i < os.cpus().length; i++){
			cluster.fork() // this would start the app again and call this entry file again and by then a forked cluster that isn't master would be available and our else{} block can be activated and the server.init() can be called
		}
	} else {
		// if we're not on the master thread start the server
		server.init()

	}



	
}


// self invoking only if required directly
if(require.main === module){ // if another module like server js requires this file then let it auto init itself with the line in this if block else do nothing
	app.init(function(){})
}




module.exports = app