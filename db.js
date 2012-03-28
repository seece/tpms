
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
		format		: String 	// audio, image, text, binary

});

var compo = new Schema({
		name 		: String,
		description : String,
		deadline 	: Date,
		entries		: [entry],
		format		: String
});

entry.pre('save', function (next) {
	// put IRC notification here
	next();
});

exports.schema = {};
exports.schema.entry = entry;
exports.model = {};

exports.init = function (mongoose, fn) {
	exports.model.Entry = mongoose.model('Entry', entry);
	exports.model.Compo = mongoose.model('Compo', compo);

	// no errors, setup successfull
	fn(null);
};


