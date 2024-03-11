// create and export config variables


// container for all environments


const environments = {}

// staging (default) envirionment
environments.staging = {
	httpPort: xxxx, // number
	httpsPort: xxxx, // number
	envName: 'xxxx', // string
	hashingSecret: 'xxxxxxx' // string
}

// production environment
environments.production = {
	httpPort: xxxx, // number
	httpsPort: xxxx, // number
	envName: 'xxxx', // string
	hashingSecret: 'xxxxxxx' // string
}

// determine which environment to be passed as a command line arguement
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// check if the current environments is one of ours

environmentToExport =  ( typeof(environments[currentEnvironment]) === 'object') ? environments[currentEnvironment] : environments["staging"]

module.exports = environmentToExport


