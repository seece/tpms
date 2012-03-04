var Log = require('log')
	, log = new Log('DEBUG')
	, mongoose = require('mongoose');

var server_name = "localhost";
var db_name = "tpms";

exports.init = function() {
		var _db = mongoose.connect('mongodb://'+server_name+'/'+db_name);
		log.debug('Connecting to MongoDB "' +db_name+ '" at ' + server_name);
		return _db;
}
