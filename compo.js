var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, model = require('./model');


exports.createCompo = function (obj, fn) {
	log.debug("Creating a new compo, bro");
	var conditions = { 	name: obj.name,
						description: obj.description
					};

	fn(null);
};
