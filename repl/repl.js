// example repl server take in the word fizz and log out buzz

// repl: read eval print loop

const repl = require('repl')


// start the repl
repl.start({
	prompt: ">",
	eval: function(str){
		// evaluation function
		console.log("At the evaluation stage: ", str)

		// if the user said fizz say buzz back to them

		if(str.indexOf('fizz') > -1){
			console.log('buzz')
		}
	}
})


