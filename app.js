
/**
 * Module dependencies.
 */

var express = require('express')
	, passport = require('passport')
  , routes = require('./routes')
	, async = require('async')
	, mongoose = require('mongoose')
	, users = require('./users')
	, Schema = mongoose.Schema
	, LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	function (username, password, done) {
			// let everyone through :D/		
			console.log("User " + username + " trying to log in.");
			var user = users.data[0];
			done(null, user);
	}
));

passport.serializeUser(function(user, done) {
		  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
		  findById(id, function (err, user) {
					    done(err, user);
							  });
});



var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/tpms');

// Database schemas

var Compo = new Schema({
	name			: String,
	created 	: { type: Date, default: Date.now},
	deadline 	: { type: Date }
});

var Entry = new Schema({
		name	: { type: String, max: 256 },
		id		: Number,
		format: String,
		created: { type: Date, default: Date.now}
		// needs an owner field...
});

var User = new Schema({
	name			: { type: String, max: 64},
	joined		:	{ type: Date, default: Date.now},
	group			:	String,
	email			: String,
	password	: String
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
	app.use(passport.initialize());
	app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// Routes
//
app.post('/user/login', passport.authenticate('local'),
				function (req, res) {
					console.log("HOLY SHIT successful login!");
					console.log(req.user);
					res.redirect('/');
				});

app.get('/user/logout', function (req, res, next){
	console.log("Logging out.");
	req.logout();
	res.redirect('/');
});

app.get('/', routes.index);
app.get('/compo/:componame?/:entryid?', routes.compo); 

app.get('/user/register', routes.register);
app.get('/user/login', routes.login);
app.get('/user/list', routes.listusers);

app.listen(3000);
console.log("A brand new tpms server listening on port %d in %s mode, ready to rok", app.address().port, app.settings.env);
