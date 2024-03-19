// these are cli related tasks


// dependencies

const readline = require('readline')

const util = require('util') // to set up cli specific login

const debug = util.debuglog('cli')

const events = require('events')

class _events extends events{}

var e = new _events()


// instantiate the cli module object
const cli = {}


//input handlers
e.on('man', function(str){
	cli.responders.help()

})

e.on('help', function(str){
	cli.responders.help()

})

e.on('exit', function(str){
	cli.responders.exit()

})

e.on('stats', function(str){
	cli.responders.stats()

})

e.on('list users', function(str){
	cli.responders.listUsers()

})

e.on('more user info', function(str){
	cli.responders.moreUserInfo(str)

})

e.on('list checks', function(str){
	cli.responders.listChecks(str)

})

e.on('more check info', function(str){
	cli.responders.moreCheckInfo(str)

})


e.on('list logs', function(str){
	cli.responders.listLogs()

})

e.on('more log info', function(str){
	cli.responders.moreLogInfo()

})



// responders
cli.responders = {}

// help / Man

cli.responders.help = function(){
	console.log("You asked for help")
}

cli.responders.exit = function(){
	console.log("You asked for exit")
}

cli.responders.stats = function(){
	console.log("You asked for stats")
}

cli.responders.listUsers = function(){
	console.log("You asked for list users")
}

cli.responders.moreUserInfo = function(str){
	console.log(`You asked for more user info based on ${str}`)
}


cli.responders.listChecks = function(str){
	console.log(`You asked for list checks based on ${str}`)
}

cli.responders.moreCheckInfo = function(str){
	console.log(`You asked for more check info based on ${str}`)
}

cli.responders.listLogs = function(){
	console.log("You asked for list logs")
}

cli.responders.moreLogInfo = function(str){
	console.log(`You asked for more log info based on ${str}`)
}

//input processor
cli.processInput = function(str){
	str = typeof(str) === 'string' && str.trim().length > 0 ? str : false

	// process input only if user wrote something
	if(str){
		// codify the unique strings that identify different questions the user can ask
		let uniqueInputs = [
			'man',
			'help',
			'exit',
			'stats',
			'list users',
			'more user info',
			'list checks',
			'more check info',
			'list logs',
			'more log info'

		]

		// go through the possible inputs and emit an event when a match is found
		let matchFound = false
		let counter = 0

		uniqueInputs.some(function(input){
			if(str.toLowerCase().indexOf(input) > -1){
				matchFound = true

				// emit an event matching the unique input, and include the full string given
				e.emit(input, str)
				return true
			}

		})

		// if no match is found tell the user to try again
		if(!matchFound){
			console.log("Sorry, try again")
		}
	}
}

// init script
cli.init = function(){
	console.log('\x1b[34m%s\x1b[0m', 'The CLI is running') // dark blue

	
	//start the interface
	let _interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '>>' // you can put whatever prompt symbol you want or leave it blank
	})

	//create an initial prompt
	_interface.prompt()

	// handle each line of input seperately
	_interface.on('line', function(str){
		//send to the input processor
		cli.processInput(str)

		// reinitialize the prompt else they wont see it again
		_interface.prompt()

		// if the user stops the cli, kill the associated process
		_interface.on('close', function(){
			process.exit(0) // the zero is a status code means everything is fine before exit
		})

	})
}

// export the module
module.exports = cli





