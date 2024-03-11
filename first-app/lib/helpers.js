// helpers for various tasks
const crypto = require('crypto')
const config = require('../config.js')
const helpers = {}

// create a SHA256 hash
helpers.hash = function(str){
	if(typeof(str) === 'string' && str.length.trim() > 0){
		const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
	} else {
		return false
	}
}




module.exports = helpers