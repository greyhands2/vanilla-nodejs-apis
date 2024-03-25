
const server = require('./server.js')

const app = {}
app.init = function(){
	server.init()
}

if(require.main === module){
	app.init()
}



module.exports = app



