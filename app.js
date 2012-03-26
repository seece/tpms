
var express = require('express')
, passport = require('passport')
//, routes = require('./routes')
, async = require('async')
, mongoose = require('mongoose')
, connect = require('connect')
, Log = require('log')
//, users = require('./users')
, Schema = mongoose.Schema
, config = require('./config')
, LocalStrategy = require('passport-local').Strategy
, log = new Log('DEBUG');

var app = express.createServer();

app.get('/', function(req, res) {
	res.send('hai');
});

app.listen(3000);
log.debug('started');
