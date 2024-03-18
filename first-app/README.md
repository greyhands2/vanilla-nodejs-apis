Run Command

ENV_NAME=staging node index.js
ENV_NAME=production node index.js



start up app with debug messages for only the workers file for example
NODE_DEBUG=workers NODE_ENV=staging node index.js



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