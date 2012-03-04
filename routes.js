//var async = require(async);

function ensureAuthenticated(req, res, next) {
	console.log("ENSURING");
	console.log(req._user_);
	if (req.isAuthenticated()) { return next(); }
	console.log("FAILURE");
	res.redirect('/user/login');
};

exports.index = function (req, res) {

	console.log("Index GET!");
	if (req.isAuthenticated()) {
		res.render('main', {title: "tpms", logged_in: true});
	} else {
		res.render('main', {title: "tpms", logged_in: false});
	}
};

exports.compo = function (req, res) {
	// show specific compo details
	console.log("Compo GET!");
	console.log(req.params.componame);

	var currentcompo = req.params.componame;
	var currententry = req.params.entryid;

	if (currentcompo === undefined) {
		// list all the compos
		var pagetitle = 'All compos';
		res.render('compo_list', {title: pagetitle});
	} else {
		var pagetitle = req.params.componame + " : compos";
		res.render('compo', {title: pagetitle, componame: currentcompo});

	}
};

exports.register = function (req, res) {
	console.log("Register GET!");
};

exports.login = function (req, res) {
	console.log("Login GET!");
	// check if logged in, if not, display login screen
	res.render('login', {
		title: 'Login', 
		logged_in: req.isAuthenticated()
	});
};

exports.listusers = function (req, res) {
	console.log("User list GET!");

	ensureAuthenticated(req, res, function () {
		res.render('userlist', {title: 'List all users'});	
	});
};



