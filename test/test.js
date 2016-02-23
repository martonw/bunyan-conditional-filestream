var fs = require('fs');

var mocha = require('mocha');
var should = require('should');
var bunyan = require('bunyan');

var ConditionalFileStream = require('../index');

describe("ConditionalFileStream", function () {

    var testFile = 'test/testfile.txt';

    before(function () {
        fs.writeFileSync(testFile, ""); // clean the log file
    });

    it("should create a new bunyan logger with a ConditionalFileStream stream", function (done) {

        var logger = bunyan.createLogger({
            name: 'testLogger',
            streams: [
                {
                    level: 'trace',
                    type: 'raw',
                    stream: new ConditionalFileStream({path: 'test/testfile.txt', callback: function (entry) {
                        return entry.logIt == true; // a simple condition that tells if we need to log this line or not
                    }})
                }
            ]
        });

        logger.debug('this line should not appear');
        logger.debug({logIt: true}, 'this line should appear');

        setTimeout(function () {
            var lines = fs.readFileSync(testFile, "utf8").split('\n');
            lines.should.have.length(2);
            done();
        }, 10);
    });

    it("should repoen the file for append", function (done) {

        var conditionalFileStream = new ConditionalFileStream({path: 'test/testfile.txt', callback: function (entry) {
            return entry.logIt == true; // a simple condition that tells if we need to log this line or not
        }});

        var logger = bunyan.createLogger({
            name: 'testLogger',
            streams: [
                {
                    level: 'trace',
                    type: 'raw',
                    stream: conditionalFileStream
                }
            ]
        });

        //logger.debug({logIt: true}, 'this line should appear');
        // now let's move the file, call reopen streams and write another line into it.
        fs.renameSync(testFile, testFile + ".rotated");
        conditionalFileStream.reopenFileStream();
        logger.debug({logIt: true}, 'this line should appear in the new log (not the rotated one)');

        setTimeout(function () {
            var lines = fs.readFileSync(testFile, "utf8").split('\n');
            lines.should.have.length(2);
            done();
        }, 10);
    });
});
