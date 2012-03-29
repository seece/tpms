
var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	;

var self = this;
var Schema = mongoose.Schema;
 
var entry = new Schema({
		name		: {type : String, required : true},
		owner		: {type : String, required : true},
		downloads	: Number, 
		description : { type : String, default: ""},
		created		: { type : Date, default: Date.now },
		url			: String

});

var compo = new Schema({
		name 		: { type : String, required : true },
		description : String,
		deadline 	: { type : Date, required : true },
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

	// no errors, setup successful
	fn(null);
};


