// worker relates tasks

// dependencies
const path = require('path')
const fs = require('fs')
const _data = require('./data.js')
const https = require('https')
const http = require('http')
const helpers = require('./helpers.js')
const url = require('url')
const _logs = require('./logs.js')
const util = require('util')
const debug = util.debuglog('workers') // we use node's debug util to replace our console log statements this way we can specify which logs we want to see when the app starts
// instantiate worker object

const workers = {}

//lookup all checks, get their data , send to a validator
workers.gatherAllChecks = function(){
	// get all the checks
	_data.list('checks', function(err, checks){
		if(!err && checks && checks.length > 0){
			checks.forEach(function(check){
				// read in the check data
				_data.read('checks', check, function(err, originalCheckData){
					if(!err && originalCheckData){
						// pass the data to the check validator and let that function continue or log errors as needed
						workers.validateCheckData(originalCheckData)
					} else {
						debug("Error: reading one of the checks data")
					}
				})
			})
		} else {
			debug("Error: Could not find any checks to process")
		}
	})
}

// sanity checking of the check data
workers.validateCheckData = function(originalCheckData){
	originalCheckData = (typeof(originalCheckData) === 'object' && !originalCheckData instanceof Array && originalCheckData !== null) ? originalCheckData : {}

	originalCheckData.id = ( typeof(originalCheckData.id) === 'string' && originalCheckData.id.trim().length === 20) ? originalCheckData.id.trim() : false

	originalCheckData.userPhone = ( typeof(originalCheckData.userPhone) === 'string' && originalCheckData.userPhone.trim().length === 10) ? originalCheckData.userPhone.trim() : false

	originalCheckData.protocol = ( typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol.trim()) > -1) ? originalCheckData.protocol : false

	originalCheckData.url = ( typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0) ? originalCheckData.url.trim() : false

	originalCheckData.method = ( typeof(originalCheckData.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method.trim()) > -1) ? originalCheckData.method : false

	originalCheckData.successCodes = ( typeof(originalCheckData.successCodes) === 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ) ? originalCheckData.successCodes : false

	originalCheckData.timeoutSeconds = ( typeof(originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 &&  originalCheckData.timeoutSeconds <= 5) ? originalCheckData.timeoutSeconds : false



	// set keys that may not be set if the workers have never seen this check before
	originalCheckData.state =  ( typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state.trim()) > -1) ? originalCheckData.state : 'down'


	originalCheckData.lastChecked = ( typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0) ? originalCheckData.lastChecked : false

	//if all the checks pass, pass the data along to the next step in the process
	if(
		originalCheckData &&
		originalCheckData.id &&
		originalCheckData.userPhone &&
		originalCheckData.protocol &&
		originalCheckData.url &&
		originalCheckData.method &&
		originalCheckData.successCodes &&
		originalCheckData.timeoutSeconds 
	){
		workers.performCheck(originalCheckData)
	} else {
		debug("Error: One of the checks is not properly formatted,  skkipping it")
	}

}

// perform the check, sent the originalCheckData and the outcome of the check process, to the next step in the process

workers.performCheck = function(originalCheckData){
	// prepare the initial check outcome
	let checkOutcome = {
		error: false,
		responseCode: false
	}

	// mark that the outcome has not been sent yet
	let outcomeSent = false

	// parse the hostname and path out of the original check data
	let parseUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true)
	let hostName = parsedURL.hostname
	let path = parsedURL.path // we are using here path and not pathname because we want the full querystring


	// construct the request
	const requestDetails = {
		protocol: originalCheckData.protocol+':',
		hostname: hostName,
		method: originalCheckData.method.toUpperCase(),
		path,
		timeout: originalCheckData.timeoutSeconds * 1000 // expected in ms
	}

	// instantiate the request object using either http or https module
	let _moduleToUse = originalCheckData.protocol === 'http' ? http : https

	let req = _moduleToUse.request(requestDetails, function(res){
		let status = res.statusCode

		// update the checkoutcome data and pass the data along
		checkOutcome.responseCode = status
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData, checkOutcome)
			outcomeSent = true
		}
	})


	// bind to the error event so it doesn't get thrown
	req.on('error', function(err){
		// update the checkOutcome and pass the data along
		checkOutcome.error = {
			error: true,
			value: err
		}
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData, checkOutcome)
			outcomeSent = true
		}
	})


	// bind to the timeout event

	req.on('timeout', function(err){
		// update the checkOutcome and pass the data along
		checkOutcome.error = {
			error: true,
			value: 'timeout'
		}
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData, checkOutcome)
			outcomeSent = true
		}
	})



	// end the request
	req.end()


}


// process the check outcome and update the check data as needed and trigger an alert to the user if needed

// special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = function(originalCheckData, checkOutcome){
	// decide if the check is considered up or down in it's current state
	let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'

	// decide if an alert is warranted
	let alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false

	// Log out the outcome
	let timeOfCheck = Date.now()
	workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck)



	//update the check data
	const newCheckData = originalCheckData
	newCheckData.state = state
	newCheckData.lastChecked = Date.now()



	// save the updates to disk
	_data.update('checks', newCheckData.id, newCheckData, function(err){
		if(!err){
			// send the new check data to the next phase in the process if needed
			if(alertWarranted){
				workers.alertUserToStatusChange(newCheckData)
			} else {
				debug("Check outcome has not changed, no alert needed")
			}

		} else {
			debug("Error trying to save the updates to one of the checks")
		}
	})
}


// alert the user as to change in their check status
workers.alertUserToStatusChange = function(newCheckData){
	const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`

	helpers.sendTwilioSms(newCheckData.userPhone, msg, function(err){
		if(!err){
			debug(`Success: User was alerted to a status change in their check via SMS: ${msg}`)
		} else {
			debug('Error: Could not send SMS alert to user whi had a state change in their check')
		}
	})
}

workers.log = function(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck){
	// form the log data
	const logData = {
		check: originalCheckData, 
		outcome: checkOutcome,
		state,
		alert: alertWarranted,
		time: timeOfCheck
	}
	// convert to string
	const logString = JSON.stringify(logData)


	// determine the name of the log file
	let logFileName = originalCheckData.id

	// append log string to the file
	_logs.append(logFileName, logString, function(err){
		if(!err){
			debug("Logging to file succeeded")
		} else {
			debug("Logging to file failed")
		}
	})
}

// timer to execute worker process once per min
workers.loop = function(){
	return setInterval(function(){
		workers.gatherAllChecks()
	}, 1000 * 60)
}

// rotate i.e compress the log files
workers.rotateLogs = function(){
	// list all the non-compressed logged files sitting in the .logs folder
	_logs.list(false, function(err, logs){
		if(!err && logs && logs instanceof Array && logs.length > 0 ){
			logs.forEach(function(logName){
				// compress the data to a different file
				let logId = logName.replace('.log', '')
				let newFileId = logId+'-'+Date.now()
				_logs.compress(logId, newFileId,  function(err){
					if(!err){
						// truncating the log
						_logs.truncate(logId, function(err){
							if(!err){
								debug("Success truncating log file")
							} else {
								debug("Error truncating log file")
							}
						})
					} else {
						debug("Error compressing one of the log files", err)
					}
				})
			})
		} else {
			debug("Error could not find any logs to rotate")
		}
	})
}



// timer to exeecute the log rotation process once per day
workers.logRotationLoop = function(){
	return setInterval(function(){
		workers.rotateLogs()
	}, 1000 * 60 * 60 * 24) // once per day
}

// init script
workers.init = function(){
	// send to console in yellow
	console.log('\x1b[33m%s\x1b[0m', 'Background workers are running')// }) since we do not want this log to be conditional we still maintained the console.log instead of debug
	// execute all the checks
	workers.gatherAllChecks()


	// call a loop so the checks continue to execute on their own later 
	workers.loop()


	// compress all existing logs immediately
	workers.rotateLogs()

	// call the compression loop so logs would be compressed later on
	workers.logRotationLoop()
}




module.exports = workers