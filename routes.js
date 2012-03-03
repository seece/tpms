//exports.compo = require('./routes/index');

//exports.compo = function (req, res) {
//	console.log("OH YEAH");
//};

exports.index = function (req, res) {

	console.log("Index GET!");
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
	
	res.render('login', {title: 'Login'});
};

exports.listusers = function (req, res) {
	console.log("User list GET!");
};



