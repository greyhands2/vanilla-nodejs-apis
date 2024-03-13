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

handlers.tokens = function(data, callback){
	const acceptableMethods = ['post', 'get', 'put', 'delete']
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._tokens[data.method](data, callback)
	} else {
		callback(405)
	}
}

handlers.checks = function(data, callback){
	const acceptableMethods = ['post', 'get', 'put', 'delete']
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._checks[data.method](data, callback)
	} else {
		callback(405)
	}
}

// container for user  methods
handlers.users = function(data, callback){
	const acceptableMethods = ['post', 'get', 'put', 'delete']
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._users[data.method](data, callback)
	} else {
		callback(405)
	}
}


// container for all the chesks methods
handlers._checks = {
	// checks - post
	// required data:  protocol(http or https), url, method, successCodes, timeout seconds
	// optional data none
	post: function(){
		// validate inputs
		// check that all required fields are filled out
		const protocol = typeof(data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
		const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
		const method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
		const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes > 0 ? data.payload.successCodes : false
		const timeoutSeconds = (typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 (&& data.payload.timeoutSeconds >=1 && data.payload.timeoutSeconds <= 5) ) ? data.payload.timeoutSeconds : false

			if(protocol && url && method && successCodes && timeoutSeconds){
		// get token from headers
			// get the token from the headers
			const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
			// lookup user phone by reading the token
			_data.read('tokens', token, function(err, tokenData){
				if(!err && tokenData){
					const userPhone = tokenData.phone
					// lookup the user data
					_data.read('users', userPhone, function(err, userData){
						if(!err && userData){
							const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : []
							// verify that the user has less than the number of maxchecks per user
							if(userChecks.length < config.maxChecks){
								// create a random id for the check
								const checkId = helpers.createRandomString(20)
								// create the check object and include the user's phone
								const checkObject = {
									id: checkId,
									userPhone,
									protocol,
									url,
									method,
									successCodes,
									timeoutSeconds
								}
								// save the object
								_date.create('checks', checkId, checkObject, function(err){
									if(!err){
										// add the checkid to the user's object
										userData.checks = userChecks
										userData.checks.push(checkId)

										// save the new user data
										_data.update('users', userPhone, userData, function(err){
											if(!err){
												// return data about the new check
												callback(200, checkObject)
											} else {
												callback(500, {Error: "Could not update the user with the new check"})
											}
										})
									} else {
										callback(500, {Error: "Could not create the new check"})
									}
								})
							} else {
								callback(400, {Error: `The user already has the max number of checks ${config.maxChecks}`})
							}
						} else {
							callback(403)
						}
					}) 

				} else {
					callback(403)
				}
			})
			
	} else {
		callback(400, {Error: "Missing required fields"})
	}
}


	}









// container for  token methods
handlers._tokens = {
	post: function(data, callback){
		const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
		const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false

		if(phone && password){
			// lookup user
			_data.read('users', phone, function(err, userData){
				if(!err){
					// hash sent password and compare to password stored in the user object
					const hashedPassword = helpers.hash(password)
					if(userData.hashedPassword === hashedPassword){
						// if valid create a new token with a random and set expiration date 1 hour into the future
						const tokenId = helpers.createRandomString(20)
						const expires = Date.now() + 1000 * 60 * 60
						const tokenObject = {
							phone: phone,
							id: tokenId,
							expires: expires
						}
						_data.create('tokens', tokenId, tokenObject,  function(err){
							if(!err){
								callback(200, tokenObject)
							} else {
								callback(500, {Error : "Could not create new token"})
							}
						})
					} else {
						callback(400, {Error: "Password did not match"})
					}
				} else {
					callback(400, {Error: "User not found"})
				}
			})
		} else {
			callback(400, {Error: "Missing required fields"})
		}
	},
	// get token
	// required data : id
	// optional data: none
	get: function(data, callback){
		// check the id sent is valid
		const id = (typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length === 20) ? data.queryStringObj.id.trim() : false

		if(id){
			// lookup the user
			_data.read('tokens', phone,  function(err, tokenData){
				if(!err && tokenData){
					// remove the hashed password from the user object before returning it to the requester
					
					callback(200, tokenData)
				} else {
					callback(404, {Error: "User not found"})
				}
			})
		} else {
			callback(400, {Error: "Missing required field"})
		}

	},

	// put token
	// required fields, id and expires
	// optional data is none
	put: function(data, callback){
		const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false
		const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? data.payload.extend : false
		if(id && extend){
			// token lookup
			_data.read('token', id, function(err, tokenData){
				if(!err){
					// ensure token is not expired as users can only extend a token that is still active else login again
					if(tokenData.expires > Date.now()){
						// set new expiration to an hour from now
						tokenData.expires = Date.now() + 1000 * 60 * 60

						// store data update
						_data.update('tokens', id, tokenObject, function(err){
							if(!err){
								callback(200)
							} else {
								callback(500, { Error: "Could not update token\'s expiration"})
							}
						})
					} else {
						callback(404, {Error: "Token is already expired and cannot be extended, use the login button"})
					}
				} else {
					callback(404, {Error: "Token data does not exist"})
				}
			})
		} else {
			callback(400, {Error: "Missing required field(s) or are invalid"})
		}
	},
	// delete tokens
	// required data is id
	// optional data is none
	delete: function(data, callback){
			// check that the id number provided is valid
		const id = (typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length === 20) ? data.queryStringObj.id.trim() : false

		if(id){
			// lookup the token
			_data.read('tokens', id,  function(err, tokenData){
				if(!err && tokenData){
					// delete the user data
					_data.delete('tokens', id,  function(err){
						if(!err){
							callback(200)
						} else {
							callback(500, {Error: "Could not delete token"})
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

// verify if a given tokenid is valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback){
	//lookup the token
	_data.read('tokens', id, function(err, tokenData){
		if(!err && tokenData){
			if(tokenData.phone === phone && tokenData.expires > Date.now()){
				callback(true)
			} else {
				callback(false)
			}
		} else {
			callback(false)
		}
	})
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
	
	get: function(data, callback){
		// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false

		if(phone){
			// get the token from the headers
			const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
			// verify that the given token is valid for the phone number
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
				if(tokenIsValid){
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
					callback(403, {Error: "Error missing required token in header or token is invalid"})
				}
			})



		} else {
			callback(400, {Error: "Missing required field"})
		}


	},
	// required data: phone, 
	// option data : firstname, lastname, password. at least one must be specified
	
	put: function(data, callback){
		// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false


		//check for the optional fields
		const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
		const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
		
		const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false

		if(phone){
					// get the token from the headers
			const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
			// verify that the given token is valid for the phone number
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
				if(tokenIsValid){
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
					callback(403, {Error: "Error missing required token in header or token is invalid"})
				}
			})


		} else {
			callback(400, {Error: "Missing required field"})
		}


	},
	// required field : phone
	
	// @TODO delete anyother data files associated with this user
	delete: function(data, callback){
			// check that the phone number provided is valid
		const phone = (typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length === 10) ? data.queryStringObj.phone.trim() : false

		if(phone){
							// get the token from the headers
			const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
			// verify that the given token is valid for the phone number
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
				if(tokenIsValid){
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
					callback(403, {Error: "Error missing required token in header or token is invalid"})
				}
			})


		} else {
			callback(400, {Error: "Missing required field"})
		}
	},
}






module.exports=handlers