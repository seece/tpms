
var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	;

var self = this;
var Schema = mongoose.Schema;

var trimName = function (name) {
	name = name.replace(/^ */g, "");
	name = name.replace(/ *$/g, "");
	name = name.replace(/[,\.\/\\()]/g, "");
	name = name.replace(/ /g, "_");
	name = name.replace(/[^A-Za-z_0-9]/g, "");
	return name;
};

var trimEntryname = function (name) {
	name = name.substr(0, 64);
	name = trimName(name);
	name = name.replace(/\//g, "");	// remove forward slashes
	name = name.replace(/\"/g, "");	
	return name;
};

function entryNameValidator(str) {
	console.log('validating ' + str);
	return (trimEntryname(str) !== "");
}
 
var entry = new Schema({
		name				: { type : String, required : true, validate: [entryNameValidator, 'invalid name']},
		owner				: { type : String, required : true},
		downloads		: Number, 
		points      : { type : Number, default: 0},
		description : { type : String, default: ""},
		created			: { type : Date,  default: Date.now },
		// file has to be found from /uploads/componame/filename
		filename	: { type : String, required : true}
});

var compo = new Schema({
		name		: { type : String, required : true },
		directory_name : { type : String, required : true },
		description : String,
		deadline	: { type : Date, required : true },
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


