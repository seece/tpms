var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	, models = require('./models');

exports.saveCompo = function (db, obj, fn) {
	log.debug("Creating a new compo, bro");
	var conditions = { 	name: obj.name,
						description: obj.description
					};

	var update = {name : "badcompo"};
	var options = {};
	
	console.log(db);
	var c = new mongoose.model('Compo');

	c.name = "tehokompo!";
	c.deadline = Date.now();
	c.created = Date.now();

	console.log("ASLDKJASDLKJ");
	c.save(function (err) {
		if (!err) { 
			console.log("DB Save succesful."); 
		} else {
			console.log(err);
		}
	});

	fn(null);
};
