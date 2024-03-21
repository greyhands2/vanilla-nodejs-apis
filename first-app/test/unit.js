const assert = require('assert')
const helpers = require('../lib/helpers.js')
const logs = require('../lib/logs.js')
const exampleDebuggingProblem = require('../lib/exampleDebuggingProblem.js')


// holder for this tests
const unit = {}

//// assert that the getNumber function is returning a number
unit['helpers.getANumber should return a number again'] = function(done){
	let val = helpers.getANumber()
	assert.equal(typeof(val) , 'string')
	done()
}



// assert that the getNumber function is returning a number
unit['helpers.getANumber should return a number'] = function(done){
	let val = helpers.getANumber()

	assert.equal(typeof(val), 'number')
	done()
}


// logs.list should callback an arrya and a false error
unit['logs.list should callback an array of log lists and a false error'] = function(done){
	log.list(true, function(err, logFileNames){
		assert.equal(err, false)
		//do a truthy assertion
		assert.ok(logFileNames instanceof Array)
		assert.ok(logFileNames.length > 1)
	})
}

// truncate should not throw even if the id we send to truncate doesn't exist instead callback an error
unit['logs.truncate should not thorw if the log id does not exist, it should callback an error instead'] = function(done){
	assert.doesNotThrow(function(){
		logs.truncate("I do not exist", function(err){
			assert.ok(err)
			done()
		})
	}, TypeError) // does not throw a type error
}

// exampleDebuggingProblem should not throw but it does
unit['lexampleDebuggingProblem should not throw but it does'] = function(done){
	assert.doesNotThrow(function(){
		exampleDebuggingProblem.init()
		done()
	}, TypeError) // does not throw a type error
}


module.exports = unit