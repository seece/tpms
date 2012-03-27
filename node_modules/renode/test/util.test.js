require('should')
var assert = require('assert');
var util = require('../util');

module.exports = {
    'supports wildcards in filename': function() {
        var files = util.findFiles('test/fixture/*.js');
        assert.includes(files, 'test/fixture/1.js');
        assert.includes(files, 'test/fixture/2.js');
        assert.equal(2, files.length);
    },
    'wildcards do not expand to directories': function() {
        var files = util.findFiles('test/fixture/*');
        assert.equal(3, files.length);
    },
}