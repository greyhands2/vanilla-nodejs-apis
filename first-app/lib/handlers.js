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
			_data.read('users', phone, function(err, data){
				if(err){
					// hash the password
					const hashedPassword = helpers.hash(password)
					if(hashedPassword){
											// create the user object
						const userObject = {
							firstName,
							lastName,
							phone,
							hashedPassword,
							tosAgreement: true
						}

						// stor the user
						_data.create('users', phone, userObject, function(err){
							if(!err){
								callback(200)
							} else {
								console.log(err)
								callback(500, {Error: "Could not create the new user"})
							}
						})
					} else {
						callback(500, {Error: "Could not hash the user\'s password"})
					}


				} else {
					callback(400, {Error: "User with that phone number already exists"})
				}
			})

		} else {
			callback("Missing required fields")
		}
	},
	//required data: phone, optional data:none
	// @TODO only let an authenticated user access their object and not anyone elses'
	get: function(data, callback){
		// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false

		if(phone){
			// lookup the user
			_data.read('users', phone,  function(err, data1){
				if(!err && data1){
					// remove the hashed password from the user object before returning it to the requester
					delete data.hashedPassword
					callback(200, data1)
				} else {
					callback(404, {Error: "User not found"})
				}
			})
		} else {
			callback(400, {Error: "Missing required field"})
		}


	},
	// required data: phone, 
	// option data : firstname, lastname, password. at least one must be specified
	// @TODO only let an authenticated user update their own object and not anyone elses'
	put: function(data, callback){
		// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false


		//check for the optional fields
		const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
		const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
		
		const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false

		if(phone){
			// error if nothing is set to update
			if(firstName || lastName || phone || password){
				// lookup user
				_data.read('users', phone, function(err, userData){
					if(!err && userData){
						// update the fields
						if(firstName){
							userData.firstName = firstName
						}

						if(lastName){
							userData.lastName = lastName
						}

						if(password){
							userData.hashedPassword = helpers.hash(password)
						}

						// store the new updates
						_data.update('users', phone, userData, function(err){
							if(!err){
								callback(200)
							} else {
								callback(500, {Error: "Could not update the user"})
							}
						})
					} else {
						callback(404, {Error: "User not found"})
					}
				})
			} else {
				callback(400, {Error: "Missing field(s) to update"})
			}

		} else {
			callback(400, {Error: "Missing required field"})
		}


	},
	// required field : phone
	// @TODO only let an authenticated user update their own object and not anyone elses'
	// @TODO delete anyother data files associated with this user
	delete: function(data, callback){
			// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false

		if(phone){
			// lookup the user
			_data.read('users', phone,  function(err, userData){
				if(!err && userData){
					// delete the user data
					_data.delete('users', phone,  function(err){
						if(!err){
							callback(200)
						} else {
							callback(500, {Error: "Could not delete user"})
						}
					})
					
				} else {
					callback(404, {Error: "User not found"})
				}
			})
		} else {
			callback(400, {Error: "Missing required field"})
		}
	},
}

module.exports=handlers