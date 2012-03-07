//var mongoose = require('mongoose')
//	, Schema = mongoose.Schema

// Database schemas
function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema,
			ObjectId = Schema.ObjectId;

	Compo = new Schema({
		name			: String,
		created 	: { type: Date, default: Date.now},
		deadline 	: { type: Date }
	});

	Entry = new Schema({
			name	: { type: String, max: 256 },
			id		: Number,
			format: String,
			created: { type: Date, default: Date.now}
			// needs an owner field...
	});

	User = new Schema({
		name			: { type: String, max: 64, index: {unique: true}},
		joined		:	{ type: Date, default: Date.now},
		group			:	String,
		email			: String,
		password	: String
	});


	mongoose.model('Compo', Compo);
	mongoose.model('Entry', Entry);
	mongoose.model('User', User);
	fn();
}

exports.defineModels = defineModels;
