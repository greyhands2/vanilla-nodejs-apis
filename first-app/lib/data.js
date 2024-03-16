// library for storing and editiing data


// dependencies
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers.js')

// container doe the module

var lib = {}
// define base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/') // __dirname is a constant for the current directory we are in now
// wrtie data to file
lib.create = function(dir, file, data, callback){
	// open the file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// convert data to string
			var stringData = JSON.stringify(data)

			// write to file and close it
			fs.writeFile(fileDescriptor, stringData, function(err){
				if(!err){
					fs.close(fileDescriptor, function(err){
						if(!err){
							callback(false)
						} else {
							callback("Error closing new file")
						}
					})
				} else {
					callback("Error writing to file")
				}
			})

		} else {
			callback("Could not create new file, it may already exist");
		}
	}) // we are opening the file for writing so we use the wx flag
}


// read data

lib.read = function(dir, file, callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err, data){
		if(!err && data){
			const parsedData = helpers.parseJSONToObject(data)
			callback(false, parsedData)
		} else {
			callback(err, data)
		}
		
	})
}

// update an existing file with new data
lib.update = function(dir, file, data, callback){
	fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			var stringData = JSON.stringify(data)
			// truncate/delete the contents of file before writing on it
			fs.truncate(fileDescriptor, function(err){
				if(!err){
					// write to the file and close it
					fs.writeFile(fileDescriptor, stringData, function(err){
						if(!err){
							fs.close(fileDescriptor, function(err){
								if(!err){
									callback(false)
								} else {
									callback("Error closing updated file")
								}
							})
						} else {
							callback("Error writing to file")
						}
					})
				} else {
					callback("Error truncating file")
				}
			})
		} else {
			callback("Could not open the file for updating, it may not exist yet")
		}
	}) // r+ opens it for writing but error out if the file does not exist

}

// delete a file
lib.delete = function(dir, file, callback){
	fs.unlink(lib.baseDir+dir+"/"+file+".json", function(err){
		if(!err){
			callback(false)
		} else {
			callback("Error deleting file")
		}
	})
}

// list all items in a directory
lib.list = function(dir, callback){
	fs.readdir(lib.baseDir+dir+'/', function(err, data){
		if(!err && data && data.length > 0){
			let trimmedFileNames = []
			data.forEach(function(fileName){
				trimmedFileNames.push(fileName.replace('.json', ''))
			})
			callback(false, trimmedFileNames)
		} else {
			callback(err, data)
		}
	})
}

module.exports = lib