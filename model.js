var mongoose = require('mongoose')
	, moment = require('moment');

var Schema = mongoose.Schema 
, ObjectId = Schema.ObjectId;

var Entry = new Schema({
	name : String,
	  description : String,
	  submitter : String,
	  created : { type: Date, default: Date.now },
	  fileurl : { type: String, default: "/404" }

})

var Compo = new Schema({
		name : String,
		description : String,
	 	created : { type: Date, default: Date.now },
		deadline : { type: Date },	
		creator : { type: String, default: "Anonymous", get: definitionChecker },
	  entries: [Entry]
})

function definitionChecker(str) {
	if (str === undefined) {
		return "undefined";
	} else {
		return str;
	}
}

exports.schemas = {};
exports.schemas.Compo = Compo;
exports.schemas.Entry = Entry;
