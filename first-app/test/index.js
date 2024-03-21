// test runner

// dependencies

// override the node env variable
process.env.NODE_ENV = 'testing'



// application logic for the test runner
_app = {}

// container for the tests
_app.tests = {}

_app.tests.unit = require('./unit.js')
_app.tests.api = require('./api.js')

// to count all the tests
_app.countTests = function(){
	let counter = 0
	for (let key in _app.tests){
		if(_app.tests.hasOwnProperty(key)){
			let subTests = _app.tests[key]
			for(let testName in subTests){
				if(subTests.hasOwnProperty(testName)){
					counter++
				}
			}
		}
	}
return counter
}


// produce test outcome report
_app.produceTestReport = function(limit, successes, errors){
	console.log("----------BEGIN TEST REPORT-------------")
	console.log("")
	console.log("Total Tests: ", limit)
	console.log("Pass:", successes)
	console.log("Fail: ", errors.length)
	console.log("")

	// if there are errors print them in detail
	if(errors.length > 0) {
		console.log("----------BEGIN ERROR DETAILS-------------")
		console.log("")

		errors.forEach(function(testError){
			console.log('\x1b[31m%s\x1b[0m', `http server listening on port ${testError.name}`)
			console.log(testError.error)
			console.log("")
		})

		console.log("")
		console.log("----------END ERROR DETAILS-------------")
	}

	console.log("")
	console.log("----------END TEST REPORT-------------")


	process.exit(0)

}






// run all the tests, collecting the errors and successes
_app.runTests = function(){
	let errors = []
	let successes = 0

	let limit = _app.countTests()

	let counter = 0

	for (let key in _app.tests){
		if(_app.tests.hasOwnProperty(key)){
			let subTests = _app.tests[key]
			for(let testName in subTests){
				if(subTests.hasOwnProperty(testName)){
					(function(){
						let temporaryTestName = testName
						let testValue = subTests[testName]
						// call the tests
						try{
							testValue(function(){
								// if it calls back without throeing then it succeeded, so log it green
								console.log('\x1b[32m%s\x1b[0m', `http server listening on port ${temporaryTestName}`) 
								counter++
								successes++
								if(counter === limit){
									_app.produceTestReport(limit, successes, errors)
								}
							})
						} catch(e){
							errors.push({
								name: testName,
								error: e
							})
							console.log('\x1b[31m%s\x1b[0m', `http server listening on port ${temporaryTestName}`) 
							counter++
							if(counter === limit){
								_app.produceTestReport(limit, successes, errors)
							}
						}
					})()
				}
			}
		}
	}
}


// run the tests
_app.runTests()