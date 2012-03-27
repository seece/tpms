var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose')
	, model = require('./model')
	, config = require('./config')
	, moment = require('moment');

var Schema = mongoose.Schema 
	, ObjectId = Schema.ObjectId;

var server_name = config.db.host;
var db_name = config.db.database;

var db = mongoose.connect('mongodb://'+server_name+'/'+db_name);
log.debug('Connecting to MongoDB "' +db_name+ '" at ' + server_name);

// Database schema
//

var compoModel = mongoose.model('Compo', model.schemas.Compo);
var entryModel = mongoose.model('Entry', model.schemas.Entry);

//var compoModelInstance = new compoModel();
//compoModelInstance.name = "kompo!";
//compoModelInstance.description= "the best compo";

/*
compoModelInstance.save(function (err) {
	if (err !== null) {
		console.log(err);
	} else {
		console.log("Saved some stuff, at least according to mongoose.");
	}
});
*/

var extend = function(obj, defaults_obj) {
	for (var i in defaults_obj) {        
		if (!obj[i]) {
			obj[i] = defaults_obj[i];
		} else { 
			// don't get all recursive on me
			//extend(obj[i], defaults_obj[i]);
		}
	}
};

// TODO: Load these from config.json / config.js
var defaults = {
	title : "tpms",
	basepath : "http://localhost:3000/",
	timeformat : config.time.timeformat
};

// supplies basic settings to the template
// also checks if user has logged in
var renderWithDefaults = function (req, res, view, params) {
	vars = {logged_in : req.isAuthenticated() };
	if (req.isAuthenticated()) {
		vars.username = req.user.username;
		if (req.user.admin === undefined) {
			vars.admin = false;
		} else {
			vars.admin = true;
		}
	};
	
	// a quick hack for notices, you can't check for undefined in jade
	if (params.success === undefined) {
		params.success = false;		
	}

	if (params.errormessage === undefined) {
		params.errormessage = false;
	}

	extend(params, vars);
	extend(params, defaults);
	res.render(view, params);
}

function isAdmin(req, res) {
	if (req.isAuthenticated()) {
		if (req.user !== undefined) {
			if (req.user.admin == true) {
				return true;
			}
		}
	}

	return false;
}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/user/login');
};


exports.index = function (req, res) {

	console.log("Index GET!");

	// a quick test
	/*
	compoModelInstance.save(function (err) {
		if (err !== null) {
			console.log(err);
		} else {
			console.log("Saved some stuff, at least according to mongoose.");
		}
	});
	*/
		renderWithDefaults(req, res, 'main', {});
	};


exports.createcompo = function (req, res) {
	if (isAdmin(req, res)) {

		var componame = req.body.componame;
		var description = req.body.description;
		var username, date;

		// We can support guests adding compos too
		// but the admin check should be removed then
		if (req.user === undefined) {
			username = "Guest";
		} else {
			username = req.user.username;	
		}

		//console.log(req.params);

		if (componame === undefined) {
			renderWithDefaults(req, res, 'main', {
				errormessage: "ERROR: empty compo name"
			});
		} else {
			date = moment(config.time.timeformat);

			var c = new compoModel();
			c.name = componame;
			c.description = description;
			//c.deadline = 

			c.save(function (err) {
				if (err !== null) {
					console.log(err);
				} else {
					console.log("Saved some stuff, at least according to mongoose.");
				}
			});

			renderWithDefaults(req, res, 'main', {
				success: "compo '" + componame + "' created successfully"
			});
		}
	} else {
		res.redirect('user/login');
	}
};

var compoList = function (fn) {
	console.log("Compo list in action, sire");
	compoModel.find({}, function (err, docs) {
		//console.log("ARGARVH: " + typeof(docs));
		//console.log(docs[0]);
		//var temp = [ { name: "a", description: "b" } ];
		fn(docs);
	});

};

exports.compo = function (req, res) {
	// show specific compo details
	//log.debug("Compo GET!");
	
	switch(req.params.action) {
		case "view":
			var currentcompo = req.params.parameter;
			var currententry = req.params.entry;

			if (currentcompo === undefined) {
				// list all the compos
				var pagetitle = 'All compos';
				compoList( function (obj) {
					renderWithDefaults(req, res, 'compo_list', {title: 'jaja', compos : obj})
				});

			} else {
				// TODO: Check if compo exists
				if (currententry == undefined) {
					var pagetitle = req.params.componame + " : compos";
					renderWithDefaults(req, res, 'compo', {
						title: pagetitle,
						componame: currentcompo
					});
				} else {
					// TODO: check from db if the entry actually exists!
					var pagetitle = "entry details";
					var entrytitle = currententry; // real name from the db

					renderWithDefaults(req, res, 'entry_details', {
						title: pagetitle,
						componame: currentcompo,
						entryname: entrytitle 
					});
				}
			}
		break;

		case "create":
		// check if the user is logged in & admin
		if (isAdmin(req, res)) {
			var now = moment();
			var currentDate = now.format(config.time.timeformat);
			var currentTime = now.format(config.time.timeformat);

			renderWithDefaults(req, res, 'create_compo', {
				date : currentDate,
				time : currentTime
			});
			break;			
		}

		res.redirect('user/login');
		break;
		default:
			renderWithDefaults(req, res, '404', {});
	
		break;
	}
	

};

exports.register = function (req, res) {
	console.log("Register GET!");
	renderWithDefaults(req, res, 'register', {
		title: 'Register'
	});
};

exports.login = function (req, res) {
	console.log("Login GET!");
	
	renderWithDefaults(req, res, 'login', {
		title: 'Login'
	});

};

exports.listusers = function (req, res) {
	console.log("User list GET!");

	ensureAuthenticated(req, res, function () {
		res.render('userlist', {title: 'List all users'});	
	});
};



