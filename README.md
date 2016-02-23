# Bunyan conditional file stream
File stream that supports a callback to determine whether the entry needs to be logged or not.

## Usage
Usage example:
```javascript
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
logger.debug('this line will not appear in the log');
logger.debug({logIt: true}, 'this line will appear in the log');

```

## Limitations
Bunyan's `reopenFileStreams()` will not reopen this stream as it only deals with built-in
'file' streams. So whenever you call `reopenFileStreams()` in the logger, you should
also call `reopenFileStream()` on all instances of the `ConditionalFileStream` object.
