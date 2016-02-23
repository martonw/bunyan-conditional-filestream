var util = require('util');
var assert = require('assert');
var fs = require('fs');
//var EventEmitter = require('events').EventEmitter;

var ConditionalFileStream = function ConditionalFileStream(options) {
    // Some assertations
    assert.equal((typeof options.path), "string");
    assert.equal((typeof options.callback), "function");
    // store settings
    this.path = options.path;
    this.stream = fs.createWriteStream(this.path,
        {flags: 'a', encoding: 'utf8'});
    this.callback = options.callback;
    this.type = 'raw'; // this is needed to get the log entry as an object rather than a string.
}

ConditionalFileStream.prototype.write = function write(entry) {
    assert(typeof entry, 'object')
    if (this.callback(entry)) {
        // so we need to log this - first, lets serialize
        var str = JSON.stringify(entry, safeCycles()) + '\n';
        this.stream.write(str);
    }
};

ConditionalFileStream.prototype.end = function end(s) {
    this.stream.end();
};

ConditionalFileStream.prototype.destroy = function destroy(s) {
    this.stream.destroy();
};

ConditionalFileStream.prototype.destroySoon = function destroySoon(s) {
    this.stream.destroySoon();
};

ConditionalFileStream.prototype.reopenFileStream = function reopenFileStream() {

    if (this.stream) {
        // Not sure if typically would want this, or more immediate
        // `s.stream.destroy()`.
        this.stream.end();
        this.stream.destroySoon();
        delete this.stream;
    }
    this.stream = fs.createWriteStream(this.path,
        {flags: 'a', encoding: 'utf8'});
        // this.stream.on('error', function (err) {
        //     self.emit('error', err, s);
        // });
};


//util.inherits(ConditionalFileStream, EventEmitter);

// This is the same implementation bunyan is using internally

// A JSON stringifier that handles cycles safely.
// Usage: JSON.stringify(obj, safeCycles())
function safeCycles() {
    var seen = [];
    return function (key, val) {
        if (!val || typeof (val) !== 'object') {
            return val;
        }
        if (seen.indexOf(val) !== -1) {
            return '[Circular]';
        }
        seen.push(val);
        return val;
    };
}

module.exports = ConditionalFileStream;
