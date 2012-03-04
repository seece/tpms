var Log = require('log')
	, log = new Log('DEBUG');

exports.createCompo = function (name, description, fn) {
	log.debug("Creating a new compo, bro");

	fn(null);
};
