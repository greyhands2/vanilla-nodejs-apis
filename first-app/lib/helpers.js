// helpers for various tasks
const crypto = require('crypto')
const config = require('../config.js')

const helpers = {}

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


helpers.


module.exports = helpers