Some random notes
=================

The config file
---------------

tpms
	singleuser
		Uses a hard coded user without login, useful for debug purposes. Don't use with release version.

The url format
--------------

/					redirect to /compo/view/all
/compo/view/:componame
/compo/view/all 	the default view
/compo/create/ 		GET: the compo submit form
					POST: parse compo submit data
/entry/view/:componame/:entryname		view single entry
/entry/submit/:componame		entry submit form
/admin/login		GET: show login form
					POST: parse login data

Mongoose stuff
--------------

Schemas/models are in db.js. You can access the models via db.model object. To initialize the database you need to pass the mongoose object from the main app to the db.init -function, and it will create the models from the schemas and make them available via the db.model -object.

Models are written with a Capital letter but schemas aren't.

An example:

//main.js
var mongoose = require('mongoose')
   ,db = require('./db');

mongoose.connect('mongodb://localhost/my_database');
db.init(mongoose, function (err) {
	console.log('Great success!');
});
