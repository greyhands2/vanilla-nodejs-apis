// this is a lib that demonstrates something throwing when it's init() is called

const example = {}

example.init = function(){
	// this is an error created intentionally (bar is not defined)

	let foo = bar
}

module.exports = example