// library for storing and rotating logs

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// container for the module
const lib = {}

// base directory
lib.baseDir = path.join(__dirname, "/../.logs/")

// append a string to a file, create a file if it does not exist

lib.append = function(file, str, callback){
	// open file we use the 'a' for append so as to create it if it does not exist
	fs.open(lib.baseDir+file+'.log', 'a', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// append to file and close it
			fs.appendFile(fileDescriptor, str+'\n', function(err){
				if(!err){
					fs.close(fileDescriptor, function(e){
						if(!e){
							callback(false)
						} else {
							callback("Error closing file, it was being appanded")
						}
					})
				} else {
					callback("Error appending to file")
				}
			})
		} else {
			callback("Could not open file for appending")
		}
	})
}


// list all the logs and optionally include the compressed logs
lib.list = function(includeCompressedLogs, callback){
	fs.readdir(lib.baseDir, function(err, data){
		if(!err && data){
			let trimmedFileNames = []
			data.forEach(function(fileName){
				// add the .log files
				if(fileName.indexOf('.log') > -1){
					trimmedFileNames.push(fileName.replace('.log', ''))
				}

				// add on the .gz files
				if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
					trimmedFileNames.push(fileName.replace('.gz.b64', ''))
				}
			})

			callback(false, trimmedFileNames)
		} else {
			callback(err, data)
		}
	})
}


// compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = function(logId, newFileId, callback){
	let sourceFile = logId+'.log'
	let destFile = newFileId+'.gz.b64'

	// read the source file
	fs.readFile(lib.baseDir+sourceFile, 'utf8', function(err, inputString){
		if(!err && inputString){
			// compress the data using gzip
			zlib.gzip(inputString, function(err, buffer){
				if(!err && buffer){
					// send the new conpressed data to destination file
					fs.open(lib.baseDir+destFile, 'wx', function(Err, fileDescriptor){
						if(!err && fileDescriptor){
							// write to the destination file
							fs.writeFile(fileDescriptor, buffer.toString('base64'), function(err){
								if(!err){
									// close the destination file
									fs.close(fileDescriptor, function(err) {

										if(!err){
											callback(false)
										} else {
											callback(err)
										}
									})
								} else {
									callback(err)
								}
							})
						} else {
							callback(err)
						}
					})
				} else {
					callback(err)
				}
			})
		} else {
			callback(err)
		}
	})
}

// decompress the contents of a .gz.b64 file into a string variable

lib.decompress = function(fileId, callback){
	let fileName = fileId+'.gz.b64'
	fs.readFile(lib.baseDir+fileName, 'utf8', function(err, str){
		if(!err && str){
			// decompress data
			let inputBuffer = Buffer.from(str, 'base64')
			zlib.unzip(inputBuffer, function(err, outputBuffer){
				if(!err && outputBuffer){
					// create a string out of this buffer
					let str = outputBuffer.toString()
					callback(false, str)
				} else {
					callback(err)
				}
			})
		} else {
			callback(err)
		}
	})
}


// truncate a log file
lib.truncate = function(logId, callback){
	// the 0 there tells the function to truncate all the way
	fs.truncate(lib.baseDir+logId+'.log', 0, function(err){
		if(!err){
			callback(false)
		} else {
			callback(err)
		}
	})
}

module.exports = lib