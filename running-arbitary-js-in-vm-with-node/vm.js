// AN example vm(virtual machine) running some arbitrary commands

//dependencies

const vm = require('vm')


// define a context for the script to run in
const context = {
	foo: 25
}


// define the script that should execute
let script = new vm.Script(`
		foo = foo * 2;
		var bar = foo + 1;
		var fizz = 52;
`)

// run the script
script.runInNewContext(context)
console.log(context) // the context would output this => { foo: 50, bar: 51, fizz: 52 }
