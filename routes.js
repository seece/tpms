
var Log = require('log')
	, config = require('./config')
	;

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

var render = function (req, res, view, params) {
	/* vars = {logged_in : req.isAuthenticated() };
	if (req.isAuthenticated()) {
		vars.username = req.user.username;
		if (req.user.admin === undefined) {
			vars.admin = false;
		} else {
			vars.admin = true;
		}
	};
	*/

	var vars = {logged_in : true };
	if (params === undefined) {
		params = {};

	}
	
	extend(params, vars);
	extend(params, config.pms.defaults);
	res.render(view, params);
}

exports.listCompos = function (req, res, obj) {
	render(req, res, 'compo_list', { 
		compos : {}
	});
}
