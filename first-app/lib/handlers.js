const _data = require('./data.js')
const helpers = require('./helpers')
//handlers
const handlers = {}

handlers.ping = function(data, callback){

	callback(200)
}

handlers.notFound = function(data, callback){

	callback(404)
}

handlers.users = function(data, callback){
	const acceptableMethods = ['post', 'get', 'put', 'delete']
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._users[data.method](data, callback)
	} else {
		callback(405)
	}
}


// container for users sub methods
handlers._users = {
	// firstname, lastname, phone, password, tosAgreement
	post: function(data, callback){
		// check that all required fields are filled out
		const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
		const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
		const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
		const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false
		const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? data.payload.tosAgreement : false

		if(firstName && lastName && password && phone && tosAgreement){
			// make sure that the use does not already exist
			_data.read(data.trimmedPath, phone, function(err, data){
				if(err){
					// hash the password
					const hashedPassword = helpers.hash(password)
				} else {
					callback(400, {Error: "User with that phone number already exists"})
				}
			})

		} else {
			callback("Missing required fields")
		}
	},
	get: function(data, callback){

	},
	put: function(data, callback){

	},
	delete: function(data, callback){

	},
}

module.exports=handlers