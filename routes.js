//var async = require(async);

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
	basepath : "http://localhost:3000/"
};

// supplies basic settings to the template
// also checks if user has logged in
var renderWithDefaults = function (req, res, view, params) {
	vars = {logged_in : req.isAuthenticated() };
	extend(params, vars);
	extend(params, defaults);
	res.render(view, params);
}

function ensureAuthenticated(req, res, next) {
	console.log("ENSURING");
	if (req.isAuthenticated()) { return next(); }
	console.log("FAILURE");
	res.redirect('/user/login');
};

exports.index = function (req, res) {

	console.log("Index GET!");

	renderWithDefaults(req, res, 'main', {});
};

exports.compo = function (req, res) {
	// show specific compo details
	//log.debug("Compo GET!");

	var currentcompo = req.params.componame;
	var currententry = req.params.entryid;

	if (currentcompo === undefined) {
		// list all the compos
		var pagetitle = 'All compos';
		renderWithDefaults(req, res, 'compo_list', {title: 'jaja'});
	} else {
		var pagetitle = req.params.componame + " : compos";
		renderWithDefaults(req, res, 'compo', {
			title: pagetitle,
			componame: currentcompo
		});
		//renderWithDefaults(req, res, 'compo', {title: pagetitle, componame: currentcompo});

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



