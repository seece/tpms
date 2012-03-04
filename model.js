var mongoose = require('mongoose')
	, Schema = mongoose.Schema

// Database schemas

exports.Compo = new Schema({
	name			: String,
	created 	: { type: Date, default: Date.now},
	deadline 	: { type: Date }
});

exports.Entry = new Schema({
		name	: { type: String, max: 256 },
		id		: Number,
		format: String,
		created: { type: Date, default: Date.now}
		// needs an owner field...
});

exports.User = new Schema({
	name			: { type: String, max: 64},
	joined		:	{ type: Date, default: Date.now},
	group			:	String,
	email			: String,
	password	: String
});

