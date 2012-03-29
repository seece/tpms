
var Log = require('log')
	, config = require('./config')
	, moment = require('moment')
	, mongoose = require('mongoose')
	, filetypes = require('./filetypes')
	, db = require('./db')
	;

var log = new Log();

// set up database
mongoose.connect('mongodb://' + config.db.host+'/'+config.db.database);
log.debug('Connecting to database %s at %s.', config.db.database, config.db.host);

db.init(mongoose, function (err) {
	log.debug('Created models from schemas.');
});

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

var compoExists = function(componame, success, fail) {
	if (componame !== undefined) {
		if (componame !== '') {
			db.model.Compo.find({
				name: decodeURIComponent(componame)
			}, function (err, docs) {
					if (docs.length > 0) {
						success(docs[0]);
					} else {
						fail();
					}
			});
		} else {
			fail();
		}
	} else {
		fail();
	}


};

var prettifyDuration = function (diff)  {
	var days = Math.round(diff / (24*60*60*1000));
	var hours = Math.round((diff % (24*60*60*1000)) / (60*60*1000));
	var minutes = Math.round((diff % (60*60*1000)) / (60*1000));
	var seconds = Math.round((diff % (60*1000)) / (1000));

	var days_string = days > 0 ? days + " days" : "";

	return days_string+hours+"h " + minutes + "m " + seconds + "s";
	
}

// route exports

exports.listCompos = function (req, res, obj) {
	// if obj is empty, it'll list all compos

	db.model.Compo.find(obj, function (err, docs) {
		if (err === null) {

			// prepare for viewing
			// could this be achieved with mongoose middleware too?
			for (var i in docs) {        
				var doc = (docs[i]);
				var diff = moment(doc.deadline).diff(Date.now());
				var difference = moment(doc.deadline).from(Date.now(), false);

				if (diff < 0) {
					doc.ended = true;
				} else {
					doc.ended = false;
				}

				doc.clean_deadline = moment.humanizeDuration(diff); 

				var pretty_diff = prettifyDuration(diff);

				doc.countdown = pretty_diff;
				doc.entryamount = doc.entries.length;
				doc.encoded_name = encodeURIComponent(doc.name); 
				if (doc.format === undefined || doc.format === '') {
					doc.format = filetypes.any;
				}

				//console.log(docs[i]);
			}

			// from ScheduleBot
			docs.sort(function (a, b) {
				return -moment(a.deadline).diff(Date.now()) - moment(b.deadline).diff(Date.now());
			});

			render(req, res, 'compo_list', { 
				compos : docs
			});

		} else {
			log.error("Cannot list compos with requirement: " = obj.toString());
			req.flash('error', 'Invalid url');
			render(req, res, 'compo_list', { 
				compos : {}
			});
		}
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

		//console.log(req.body);

		var componame = req.body.componame;

		compoExists(componame, function (compo) {
			//log.debug('Name collision in compo creation.');
			req.flash('error', 'There is already a compo with the name ' + compo.name);
		
			exports.compoForm(req, res);
		},

		// if there isn't a compo with this name, continue
		function (err) {

			var description = req.body.description;
			var format = req.body.format;
			var end_time = req.body.date; 
			var username, deadline;

			//console.log(req.body);

			if (componame === undefined || componame === '' | componame === 'all') {
				req.flash('error', "Invalid compo name");
				render(req, res, 'main', {});
			} else {

				date = moment(config.time.timeformat);
				// add some html -tag stripping
				var compo = new db.model.Compo();
				compo.name = componame;
				compo.description = description;
				deadline = moment(end_time, config.time.timeformat);
				compo.deadline = deadline;
				compo.format = format;

				console.log(compo);

				compo.save(function (err) {
					if (err !== null) {
						console.log(err);
						req.flash('error', "Couldn't save compo! Blame stupid mongoose. Error: " + err.toString());

						render(req, res, 'main', {});

					} else {
						log.debug("Saved some stuff, at least according to mongoose.");
						req.flash('success', "compo '" + componame + "' created successfully");

						render(req, res, 'main', {});
					}
				});

			}
		})
	}
}

exports.entryForm = function (req, res) {

	compoExists(req.params.componame, function(compo) {
				render(req, res, 'entryform', {
					componame: compo.name 
				});
		}, 
		// on fail
		function () {
			req.flash('error', 'Invalid competition name.');
			render(req, res, '404', {});
		});

}

exports.submitEntry = function (req, res) {
	var componame = req.params.componame;
	log.debug('Someone submitting entry to ' + componame);
	var entryname = req.body.entryname;
	var nickname = req.body.nickname;
	var description = req.body.description;
	var old_entries;

	db.model.Compo.findOne({name:componame}, {}, {},
			function (err, doc) {
				console.log(err);
//				console.log(doc);
				if (!err) {
					//console.log(doc.entries);

					old_entries = doc.entries;

					var query = { name : componame };

					var newEntry = new db.model.Entry();
					newEntry.name = entryname;
					newEntry.owner = nickname;
					newEntry.description = description;

					var new_entry_list = old_entries;
					old_entries.push(newEntry);

					console.log(doc.entries);
					console.log('----');
					console.log(new_entry_list);

					db.model.Compo.update(query, { entries : new_entry_list }, {}, 
							function (err, numAffected) {
								if (!err) {
									//log.debug(numAffected);	

									req.flash('success', "Entry '"+entryname+"' submitted successfully!");
									res.redirect('/');
								} else {
										log.error(err);	
									// an error occured
								}
							});

				} else {

				}

			}
			);


	
}

exports.viewCompo = function (req, res) {
	if (req.params.componame === 'all') {
		exports.listCompos(req, res, {});
	} else {
		compoExists(req.params.componame, function (compo) {
			compo.encoded_name = encodeURIComponent(compo.name);
			render(req, res, 'compo', {compo : compo});	
		},

		function (err) {
			req.flash('error', "Invalid competition name");
			render(req, res, '404', {});
		});
	}

	log.debug('Viewing compo.');	
}

