var fs = require('fs');
var path = require('path');

function findFilesByWildcard(pattern) {
    var dir = path.dirname(pattern);
    var matcher = path.basename(pattern)
        .replace(/\./g, '\\.')
        .replace(/\?/g, '.?')
        .replace(/\*/g, '.*');
    var matches = [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var file = files[i];
        if (file.match(matcher)) {
            var stat = fs.statSync(path.join(dir, file));
            if (stat.isFile()) matches.push(path.join(dir, file));
        }
    }
    return matches;
}

module.exports = {
    findFiles: function(pattern) {
        var matches = findFilesByWildcard(pattern);
        return matches;
    },
    exists: function(file) {
        try {
            fs.statSync(file);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}