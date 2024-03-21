Note the index-cluster.js is a version of the app that takes advantage of node's cpu cluster capabilities 

Note: for the child process implementation we ude the cli service

Run Command

ENV_NAME=staging node index.js
ENV_NAME=production node index.js

To run the tests
node test 

start up app with debug messages for only the workers file for example
NODE_DEBUG=workers NODE_ENV=staging node index.js

To run in strict mode:

NODE_ENV=staging node --use_strict index-strict.js

using the Node Debugger

NODE_ENV=staging node inspect index-debug.js 


run with performance check
NODE_ENV=staging NODE_DEBUG=performance node index.js

when using the debugger use "cont" for continue the execution, "next" to step to the next breakpoint, "in" to step in,  "out" to step out and "pause" to pause it.
You can also use "repl" instead of "cont" to programmatically  work on the values

Nodejs Libaries used here
* Commandline Options:  we were able to start the app with env variables such as NODE_DEBUG, NODE_ENV

* Console 

* Crypto : we used it to hash passwords

* File System (fs) : allowed us to read, write, open, close, truncate and unlink files

* globals:  modules in the global space that we never have to require but can use anywhere in out app e.g: __dirname, __filename, exports, module, require()

* HTTP and HTTPS we used them to create servers and also to create http(s) requests


* Path : used to resolve our path and make it clean enough for our various uses

* Process

* Querystrings 

* String Decoder : we used it to parse an incoming request payload into a buffer which we can convert to whatever type we want mostly string

* Timers :  we do not need to require it explicitly , setInterval,  setTimeout

* URL

* Util

* Buffer

* Zlib : we used it for compression and decompression

* Stream

* Events

* OS 

* V8

* Readline

* Debugger :breakpoints commands like cont, repl, in, out, etc

* Error

* Assert

* DNS

* Performance Hooks

* Cluster being ablt to use all the cores in your machine

* Child processes: drop down to shell and do stuff in the system 





