const assert = require('assert')

const app = require('../app.js')

const api = {}


// test that the app starts wwithout throwing error
api['test that app.init starts without throwing any error']  = function(done){
	assert.doesNotThrow(function(){
		app.init()
		done()
	}, TypeError)
}

api['/ping returns status 200'] = function(done){
	
}
const runTests = () => {
	let count = 0
	let countTestPassed = 0
	let countTestFailed = 0

	for(let test in api){
		count++
		if(api.hasOwnProperty(test)){
			try {
				api[test](function(){
					console.log(`${test} : PASSED`)
					countTestPassed++
				})
				
			} catch(e){
				console.log(`${test} : FAILED`, e)
				countTestFailed++
			}
		}
	}
	console.log("")
	console.log(`Number of tests: ${count}`)
	console.log(`Passed: ${countTestPassed}`)
	console.log(`Failed: ${countTestFailed}`)
	process.exit(0)
}

runTests()