# mastery-node

This book is for developers who want to build high-capacity network applications, such as social networks, collaborative document editing environments, using a language you already know.

# Extending JavaScript

The general principle is, operations must never block. Node's desire for speed
(high concurrency) and efficiency (minimal resource usage) demands the reduction
of waste. A waiting process is a wasteful process, especially when waiting for I/O.

JavaScript's asynchronous, event-driven design fits neatly into this model.
Applications express interest in some future event and are notified when that event
occurs. This common JavaScript pattern should be familiar to you:

```js
Window.onload = function () {
  // When all requested document resources are loaded,
  // do something with the resulting environment
};
element.onclick = function () {
  // Do something when the user clicks on this element
};
```

The time it will take for an I/O action to complete is unknown, so the pattern is to
ask for notification when an I/O event is emitted, whenever that may be, allowing
other operations to be completed in the meantime.
Node adds an enormous amount of new functionality to JavaScript. Primarily, the
additions provide evented I/O libraries offering the developer system access not
available to browser-based JavaScript, such as writing to the filesystem or opening
another system process. Additionally, the environment is designed to be modular,
allowing complex programs to be assembled out of smaller and simpler components.

---

# Events

Many of the JavaScript extensions in Node emit events. These events are instances
of events.EventEmitter. Any object can extend EventEmitter, providing
the developer with an elegant toolkit for building tight asynchronous interfaces
to object methods.
Work through this example demonstrating how to set an EventEmitter object
as the prototype of a function constructor. As each constructed instance now has
the EventEmitter object exposed to its prototype chain, this provides a natural
reference to the event API (Application Programming Interface). The counter
instance methods can therefore emit events, and these can be listened for. Here we
emit the latest count whenever the counter.increment method is called, and bind
a callback to the incremented event, which simply prints the current counter value
to the command line:

```js
var EventEmitter = require("events").EventEmitter;
var Counter = function (init) {
  this.increment = function () {
    init++;
    this.emit("incremented", init);
  };
};
Counter.prototype = new EventEmitter();
var counter = new Counter(10);
var callback = function (count) {
  console.log(count);
};
counter.addListener("incremented", callback);
counter.increment(); // 11
counter.increment(); // 12
```

To remove the event listeners bound to counter, use counter.
removeListener('incremented', callback). For consistency with browser-based
JavaScript, counter.on and counter.addListener are interchangeable.
The addition of EventEmitter as an extensible object greatly increases the
possibilities of JavaScript on the server. In particular, it allows I/O data streams
to be handled in an event-oriented manner, in keeping with the Node's principle
of asynchronous, non-blocking programming:

```js
var Readable = require("stream").Readable;
var readable = new Readable();
var count = 0;
readable._read = function () {
  if (++count > 10) {
    return readable.push(null);
  }
  setTimeout(function () {
    readable.push(count + "\n");
  }, 500);
};
readable.pipe(process.stdout);
```
