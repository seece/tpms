
var Log = require('log')
	, config = require('./config')
	, moment = require('moment')
	;

var log = new Log();

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

// append default values before rendering
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

	// defaults not declared in the config.json (confusing?)
	var vars = {
		logged_in : true,
		timeformat : config.time.timeformat,
		success : false,
		errormessage : false,
		admin : false
	};

	if (params === undefined) {
		params = {};
	}
	
	extend(params, vars);
	extend(params, config.pms.defaults);
	res.render(view, params);
}

var isAdmin = function(req, res) {
	return true;
}

exports.listCompos = function (req, res, obj) {
	render(req, res, 'compo_list', { 
		compos : {}
	});
};

exports.compoForm = function (req, res) {
	var now = moment();
	var currentDate = now.format(config.time.timeformat);
	var currentTime = now.format(config.time.timeformat);

	render(req, res, 'create_compo', {
		date : currentDate,
		time : currentTime
	});
};

exports.createCompo = function (req, res) {
	if (isAdmin(req, res)) {
		log.debug('Creating a new compo.');

		var componame = req.body.componame;
		var description = req.body.description;
		var username, date;

		console.log(req.body);

		if (componame === undefined || componame === '') {
			render(req, res, 'main', {
				errormessage: "ERROR: empty compo name"
			});
		} else {
			date = moment(config.time.timeformat);
			// add database saving here
			render(req, res, 'main', {
				success: "compo '" + componame + "' created successfully"
			});
		}
	}
}
