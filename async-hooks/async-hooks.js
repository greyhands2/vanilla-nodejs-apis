// an async hook example



// dependencies


const async_hooks = require('async_hooks')
const fs = require('fs') // the reason we are using fs is, when tracking async operations lifecycle, you do not use async operations to track them and console.log is technically asynchronous hence the use of fs


// target execution context
var targetExecutionContext = false



// write an arbitrary async function


const whatTimeIsIt = function(callback){
	setInterval(function(){
		fs.writeSync(1, 'When the set interval runs the execution context is: '+async_hooks.executionAsyncId()+'\n')

		callback(Date.now())
	}, 1000)
}



whatTimeIsIt(function(time){
	fs.writeSync(1, "The time is "+time+"\n")
})


// define the async hooks
const hooks = {

	// avoid using console.log here as it would trigger an async call  and the async hooks in this file would track the lifecycle of all the async operations happening in this file, so console.log() would trigger more lifecycle events and the hooks in that trigger would trigger another console.log lifecycle event and we end up in a loop that crashes our system
	init(asyncId, type, triggerAsyncId, resource){
		fs.writeSync(1, "Hook init "+asyncId+"\n")
	},

	before(asyncId, type, triggerAsyncId, resource){
		fs.writeSync(1, "Hook before "+asyncId+"\n")
	},


	after(asyncId, type, triggerAsyncId, resource){
		fs.writeSync(1, "Hook after "+asyncId+"\n")
	},


	destroy(asyncId, type, triggerAsyncId, resource){
		fs.writeSync(1, "Hook destroy "+asyncId+"\n")
	},

	promiseResolve(asyncId, type, triggerAsyncId, resource){
		fs.writeSync(1, "Hook promise resolve "+asyncId+"\n")
	},
}


// create a new instance of the async hooks module
var asyncHook = async_hooks.createHook(hooks)

asyncHook.enable()
