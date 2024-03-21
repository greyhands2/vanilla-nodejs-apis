/**
 * primary file for the API
 **/

// dependencies
const server = require('./lib/server.js')
const workers = require('./lib/workers.js')
const cli  = require('./lib/cli.js')
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem.js')
// Declare the app
const app = {}

// init function
app.init = function(){
	debugger // add a debugging breakpoint
	// start the server
	server.init()
	debugger // add a debugging breakpoint
	// start the workers

	debugger // add a debugging breakpoint
	// start the server
	workers.init()
	debugger // add a debugging breakpoint
	// start the server
	// start the cli but make sure it starts last
	debugger // add a debugging breakpoint
	// start the server
	setTimeout(function(){
		cli.init()
		debugger
	}, 50)
	debugger // add a debugging breakpoint
	// start the server


	
	let foo = 1
	console.log("just assigned one to foo")
	debugger // add a debugging breakpoint
	// start the server

	
	foo++
	console.log("incremented foo")
	debugger // add a debugging breakpoint
	// start the server

	
	foo = foo * foo
	console.log("squared foo")
	debugger // add a debugging breakpoint
	// start the server


	
	foo = foo.toString()
	console.log("converted foo to string")
	debugger // add a debugging breakpoint
	// start the server


	// call the init script that will throw
	exampleDebuggingProblem.init()
	console.log("called the library")
	debugger
}


// execute function
app.init()



module.exports = app