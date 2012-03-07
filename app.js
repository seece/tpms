
/**
 * Module dependencies.
 */

var express = require('express')
	, passport = require('passport')
  	, routes = require('./routes')
	, async = require('async')
	, mongoose = require('mongoose')
	, connect = require('connect')
	, Log = require('log')
	, users = require('./users')
	, Schema = mongoose.Schema
	, LocalStrategy = require('passport-local').Strategy
	, log = new Log('DEBUG');

passport.use(new LocalStrategy(
	function (username, password, done) {
			console.log("User " + username + " trying to log in.");
			var user = users.data[0];
			if (username == users.data[0].username) {
				if (password == users.data[0].password) {
					// correct!
					done(null, user);
					
				}

			}

		done(null, false);
	}
));

function findById(id, fn) {
	for (var i=0;i<users.data.length-1;i++) {
		if (users.data[i].id == id) {
			fn(null, users.data[i]);
		}
	}
};

passport.serializeUser(function(user, done) {
		  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
		  findById(id, function (err, user) {
					    done(err, user);
							  });
});

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
	app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
	app.use(express.session({ secret: 'TAIKASANA!' }));
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
					log.debug("HOLY SHIT "+ req.user.username +" logged in.");
					res.redirect('/');
				});

app.get('/user/logout', function (req, res, next){
	if (req.user !== undefined) {
		log.debug(req.user.username + " logging out.");
	}
	req.logout();
	res.redirect('/');
});

app.get('/', routes.index);

// a massive route :(
app.post('/compo/createcompo', routes.createcompo);
app.get('/compo/:action?/:parameter?/:entry?', routes.compo); 

app.get('/user/register', routes.register);
app.get('/user/login', routes.login);
app.get('/user/list', routes.listusers);

app.listen(3000);
log.info("A brand new tpms server listening on port "+app.address().port+" in "+app.settings.env+" mode, ready to rok");
