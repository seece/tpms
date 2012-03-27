
var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	;

var self = this;
var Schema = mongoose.Schema;
 
var entry = new Schema({
		name		: String,
		created		: Date,
		url			: String,
		type		: String 	// audio, image, text, binary

});

var compo = new Schema({
		name 		: String,
		description : String,
		deadline 	: Date,
		entries		: [entry]
});


exports.model = {};

exports.init = function (mongoose, fn) {
	exports.model.Compo = mongoose.model('Compo', exports.schema.compo);

	// no errors, setup successfull
	fn(null);
};


