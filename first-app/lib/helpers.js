// helpers for various tasks
const crypto = require('crypto')
const queryString = require('querystring')
const config = require('../config.js')
const https = require('https')
const helpers = {}

// sample for testing that simply returns a number

helpers.getANumber = function(){
	return Math.floor(Math.random() * 100)
}


// create a SHA256 hash
helpers.hash = function(str){
	if(typeof(str) === 'string' && str.length.trim() > 0){
		const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
		return hash
	} else {
		return false
	}
}


// parse json string to object without throwing an error
helpers.parseJSONToObject = function(jsonStr){
	try {
		const obj = JSON.parse(jsonStr)
		return obj
	} catch(err){
		return {}
	}
	
}

// create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength){
	strLength = (typeof(strLength) === 'number' && s > 0 ) ? strLength : false
	if(strLength){
		// define all the possible characters
		const possibleCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

		let randomString = ''
		for(let x = 0; x < strLength; x++){
			//generate a random index between 0 to length of possible characters
			let randomIndex = Math.floor(Math.random() * possibleCharacters.length)

			// get random character
			randomCharacter = possibleCharacters.charAt(randomIndex)
			// append random character to string
			randomString += randomCharacter

		}
		return randomString
	} else {
		return false
	}
}

// send sms via twilio
helpers.sendTwilioSms = function(phone, msg, callback){
	// validate parameters
	phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone : false
	msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg : false // twilio takes max of 1600 msg length

	if(phone && msg){
		// configure twilio request payload
		const payload = {
			From: config.twilio.fromPhone,
			To: '+234'+phone,
			Body: msg

		}


		// stringify the payload for query string
		let stringPayload = queryString.stringify(payload)

		// configure the request details
		const requestDetails = {
			protocol : 'https:',
			hostname: 'api.twilio.com',
			method: 'POST',
			path: '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
			auth: config.twilio.accountSid+':'+config.twilio.authToken,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": Buffer.byteLength(stringPayload)

			}
		}

		// instantiate request object
		let req = https.request(requestDetails, function(res){
			// grab the status of the sent request
			let status = res.statusCode
			if(status === 200 || status === 201){
				callback(false)
			} else {
				callback(`Status code returned was ${status}`)
			}
		})

		// bind to the error event so it does not get thrown
		req.on('error', function(err){
			callback(err)
		})

		// add the payload to the request
		req.write(stringPayload)

		// end the request which would send it off
		req.end()



	} else {
		callback("Given parameters where missing or invalid")
	}
}





module.exports = helpers