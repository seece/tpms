
var Log = require('log')
	, config = require('./config')
	, moment = require('moment')
	, mongoose = require('mongoose')
	, filetypes = require('./filetypes')
	, db = require('./db')
	, fs = require('fs')
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
		logged_in : false,
		timeformat : config.time.timeformat,
		success : false,
		errormessage : false,
		admin : false,
		config : config
	};

	if (params === undefined) {
		params = {};
	}
	
	extend(params, vars);
	extend(params, config.pms.defaults);
	res.render(view, params);
}

var isAdmin = function(req, res) {
	if (req.logged_in === true) {
		return true;
	} else {
		return false;
	}
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

// takes in millisecs
var prettifyDuration = function (diff)  {
	var days = Math.round(diff / (24*60*60*1000));
	var hours = Math.round((diff % (24*60*60*1000)) / (60*60*1000));
	var minutes = Math.round((diff % (60*60*1000)) / (60*1000));
	var seconds = Math.round((diff % (60*1000)) / (1000));
	var days_string = days > 0 ? days + " days " : "";
	return days_string+hours+"h " + minutes + "m " + seconds + "s";
}

// trims and replaces non alphabetical characters with substitutes
var makeDirname = function (name) {
	name = name.substr(0, 255);
	name = name.replace(/^ */g, "");
	name = name.replace(/ *$/g, "");
	name = name.replace(/[,\.\/\\()]/g, "");
	name = name.replace(/ /g, "_");
	name = name.replace(/[^A-Za-z_0-9]/g, "");
	name = name.replace(/_{2,}/g, "_"); // no long lines of underscores
	return name;
};

// hello leonarven
var escapeString = function (name) {
	name = name.replace(/<|>/g,"");
	return name;
}


//console.log(trimCompoName( "   ,. 22    1)sa)naX[] } {{  /a/b.trw   ") + '|');

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

				doc.diff = diff;
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

		var componame = escapeString( decodeURIComponent(req.body.componame));
		componame = componame.substr(0, config.limit.componame);
		var dirname = makeDirname(componame);

		db.model.Compo.find({
				directory_name : dirname  
		}, function (err, docs) {

			if (docs.length > 0) {
				// submission failed, match found
				var compo = docs[0];
				req.flash('error', 'There is already a compo with the name ' + compo.name);
				exports.compoForm(req, res);

			} else {
				// compo name is unique, continue

				var description = escapeString(req.body.description);
				description = description.substr(0, config.limit.description)
				var format = req.body.format;
				var end_time = req.body.date + ' ' + req.body.time; 
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
					compo.directory_name = dirname;

					fs.mkdirSync(config.pms.upload_dir + dirname, 0777);
					log.info('Created a new directory:' + config.pms.upload_dir + dirname);

					//console.log(compo);

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

			}
		});

	} else {
		// error! only admin can create compos
		req.flash('error', "I'm afraid I can't let you do that, Dave.");
		render(req, res, '404', {});
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
	// recieve the file, handle the parameters and add an entry to the db
	
	var componame = req.params.componame;
	log.debug('Someone submitting entry to ' + componame);
	var entryname = req.body.entryname;
	var nickname = req.body.nickname;
	var description = req.body.description;
	var old_entries;

	db.model.Compo.findOne({name:componame}, {}, {},
			function (err, doc) {
				console.log(err);
				if (!err) {
					old_entries = doc.entries;

					var query = { name : componame };
					var filename = req.files.file.name;
					filename = config.pms.name_prefix_in_uploads ? nickname +'_-_' + filename : filename;

					var newEntry = new db.model.Entry();
					newEntry.name = entryname;
					newEntry.owner = nickname;
					newEntry.description = description;
					newEntry.filename = filename;

					var new_entry_list = old_entries;
					old_entries.push(newEntry);

					db.model.Compo.update(query, { entries : new_entry_list }, {}, 
							function (err, numAffected) {
								if (!err) {

									// database update successful, now move the file
									log.debug('uploaded %s (%s Kb) to %s as %s'
												, req.files.file.name
												, req.files.file.size / 1024 | 0 
												, req.files.file.path
												, req.body.entryname);

									var fileBuffer = fs.readFileSync(req.files.file.path);
									var compo_dir = doc.directory_name;

									var writePath = config.pms.upload_dir + compo_dir + '\\' + filename;
									if (doc.directory_name) {
										var jea = doc.directory_name;
										fs.writeFileSync(config.pms.upload_dir + jea + '/' + filename, fileBuffer);
									} else {
										log.error("Empty directory name in %s!", doc.name);
									}

									req.flash('success', "Entry '"+entryname+"' submitted successfully!");
									res.redirect('/');
								} else {
									// an error occured
									log.error(err);	
									req.flash('error', "Mongoose error: " + err);
									render(req, res, '404', {});
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

exports.loginForm = function (req, res) {
	render(req, res, 'login', {});
}

exports.userLogin = function (req, res) {
	var username = req.body.username;	
	var password = req.body.password;	
}
