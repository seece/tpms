
var express = require('express')
, passport = require('passport')
, routes = require('./routes')
, async = require('async')
//, db = require('./db')
, connect = require('connect')
, Log = require('log')
, users = require('./users')
, fs = require('fs')
, path = require('path')
, cjson = require('cjson')
//, Schema = mongoose.Schema
, LocalStrategy = require('passport-local').Strategy
, log = new Log('DEBUG');

var config = cjson.load('./config.json');

if (!path.existsSync(config.pms.upload_dir)) {
	fs.mkdirSync(config.pms.upload_dir, 0777);
	log.info('Created directory ' + config.pms.upload_dir);
}

var app = express.createServer();

passport.use(new LocalStrategy(
			function (username, password, done) {

				if (users.db[username]) {
					if (users.db[username].password === password) {
						// use temporary variable to add username field
						var u = users.db[username];
						u.username = username;
						return done(null, u);
					}
				}

				return done(null, false);
			}
		));

var findUser = function (id, fn) {
	for (var u in users.db) {
		if (id === users.db[u].id) {
			fn(null, users.db[u]);
		}

	}
};

passport.serializeUser(function(user, done) {
	  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	  findUser(id, function (err, user) {
		      done(err, user);
			    });
});

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: config.pms.secret  }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));	
});

app.configure('production', function(){
});

app.dynamicHelpers({
	flash : function (req, res) {
		return req.flash();
	}
});

app.get('/', function(req, res) {
	//res.send('hai');
//	res.redirect('/compo/view/all');
	routes.listCompos(req, res);
});

app.get('/user/login/', routes.loginForm);
app.get('/user/login', routes.loginForm);
app.post('/user/login', 
		passport.authenticate('local', { 	successRedirect: '/',
											failureRedirect: '/user/login',
											failureFlash: true
		}));

app.get('/user/logout', function(req, res){
	req.logOut();
	req.flash('success', 'You have logged out.');
	res.redirect('/');
});

app.get('/compo/view/all', routes.listCompos);
app.get('/compo/view/:componame', routes.viewCompo);
app.get('/compo/create', routes.compoForm);
app.post('/compo/create', routes.createCompo);

app.post('/compo/vote/:componame');

app.get('/entry/submit/:componame', routes.entryForm);
app.post('/entry/submit/:componame', routes.submitEntry);
app.get('/entry/view/:entryname', routes.viewEntry);



app.listen(3000);
log.debug('started');
