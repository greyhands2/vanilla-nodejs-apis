// these are cli related tasks


// dependencies

const readline = require('readline')

const util = require('util') // to set up cli specific login

const os = require('os') // access things like load average, number of cpus, free memory and uptime

const v8 = require('v8') // get things like malloced_memory, peak_malloced_memory, allocated heap used, total heap allocated

const debug = util.debuglog('cli')

const events = require('events')

const _data = require('./data.js')

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
	cli.responders.moreLogInfo(str)

})



// responders
cli.responders = {}

// help / Man

cli.responders.help = function(){
	const commands = {
		'exit': 'Kill the CLI and the rest of the application',
		'man': 'Show this help page',
		'help': 'Alias of the "man" command',
		
		'stats': 'Get statistics on the underlying operating system and resource utilization',
		'list users': 'Show a list of all the registered (undeleted) users in the system',
		'more user info --{userId}': 'Show details of a specific user',
		'list checks --up --down': 'Show a list of all the active checks in the system including their state. The "--up" and "--down" flags are both optional',
		'more check info --{checkId}': 'Show details of a specified check',
		'list logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
		'more log info --{fileName}': 'Show details of a specified log file',
	} 

	// show a header for the help page that is as wide as the screem

	cli.horisontalLine()
	cli.centered("CLI MANUAL")
	cli.horisontalLine()
	cli.verticalSpace(2)

	// ahow each command followed by it's explanation in white and yellow respectively
	for(let key in commands){
		if(commands.hasOwnProperty(key)){
			let value = commands[key]
			let line = '\x1b[33m'+key+'\x1b[0m'
			let padding = 60 - line.length

			for(let i = 0; i < padding; i++){
				line+=' '
			}
			line+=value
			console.log(line)
			cli.verticalSpace()
		}
	}

	cli.verticalSpace(1)

	// end with another horizontal line
	cli.horisontalLine()
}


// create a vertical space
cli.verticalSpace = function(lines){
	lines = typeof(lines) == 'number' && lines > 0 ? lines : 1
	for(let i = 0; i < lines; i++){
		console.log('')
	}
}


cli.horisontalLine = function(){
	// get available screen size
	let width = process.stdout.columns

	let line = ''
	for(let i = 0; i < width; i++){
		line+='-'
	}
	console.log(line)
}

// create centered text on the screen
cli.centered = function(str){
	str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : ''

	// get the available screen size
	let width = process.stdout.columns

	//calculate the left padding there should be
	let leftPadding = Math.floor( (width - str.length) / 2 )

	// put in left padded spaces before the string itself
	let line = ''

	for(let i = 0; i < leftPadding; i++){
		line+=' '
	}

	line+= str
	console.log(line)

}


cli.responders.exit = function(){
	
	process.exit(0)
}

cli.responders.stats = function(){
	// compile an object of stats
	const stats = {
		'Load Average': os.loadavg().join(' '), // loadavg() returns an array so we join it to make is a set of strings
		'CPU Count': os.cpus().length, // returns an array cpus and since we just want to know how many cpus we get a length of the array
		'Free Memory': os.freemem(),
		'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
		'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
		'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100 ),
		'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100 ),
		'Uptime': os.uptime()+' Seconds'

	}	

	//Create a header for the stats
	cli.horisontalLine()
	cli.centered("SYSTEM STATISTICS")
	cli.horisontalLine()
	cli.verticalSpace(2)

	// log out eaach stat
	for(let key in stats){
		if(stats.hasOwnProperty(key)){
			let value = stats[key]
			let line = '\x1b[33m'+key+'\x1b[0m'
			let padding = 60 - line.length

			for(let i = 0; i < padding; i++){
				line+=' '
			}
			line+=value
			console.log(line)
			cli.verticalSpace()
		}
	}

	cli.verticalSpace(1)

	// end with another horizontal line
	cli.horisontalLine()
}

cli.responders.listUsers = function(){
	_data.list('users', function(err, userIds){
		if(!err && userIds.length > 0){
			cli.verticalSpace()
			userIds.forEach(function(userId){
				_data.read('users', userId, function(err, userData){
					if(!err && userData){
						let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `
						let numberOfChecks = ( typeof(userData.checks) === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ) ? userData.checks.length : 0

						line+=numberOfChecks
						console.log(line)
						cli.verticalSpace()
					}
				})
			})
		} else {
			console.log('\x1b[31m%s\x1b[0m', 'No users found')
		}
	})
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





