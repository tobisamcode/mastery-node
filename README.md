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

---

# Rule of Modularity

This idea of building complex systems out of small pieces, loosely joined is seen
in the management theory, theories of government, physical manufacturing, and
many other contexts. In terms of software development, it advises developers to
contribute only the simplest and most useful component necessary within a larger
system. Large systems are hard to reason about, especially if the boundaries of its
components are fuzzy.
One of the primary difficulties when constructing scalable JavaScript programs
is the lack of a standard interface for assembling a coherent program out of many
smaller ones. For example, a typical web application might load dependencies using
a sequence of `<script>` tags in the `<head>` section of an HTML document:

```html
<head>
  <script src="fileA.js"></script>
  <script src="fileB.js"></script>
</head>
```

Ambivalently inserting unpredictable code fragments into an application frustrates
attempts to predictably shape functionality. What is needed is a standard way to
load and share discreet program modules.

Accordingly, Node introduced the concept of the **package**, following the CommonJS
specification. A package is a collection of program files bundled with a manifest
file describing the collection. Dependencies, authorship, purpose, structure, and
other important meta-data are exposed in a standard way. This encourages the
construction of large systems from many small, interdependent systems.

---

In many ways the success of Node is due to growth in the number and quality
of packages available to the developer community, distributed via Node's package
management system, npm.

The design choices of this system, both social and
technical, have done much to help make JavaScript a viable professional option
for systems programming.

# The Network

I/O in the browser is mercilessly hobbled, for very good reasons—if the JavaScript
on any given website could access your filesystem, or open up network connections
to any server, the WWW would be a less fun place.

For Node, I/O is of fundamental importance, and its focus from the start was to
simplify the creation of scalable systems with high I/O requirements. It is likely
that your first experience with Node was in writing an HTTP server.

Node supports several standard network protocols in addition to HTTP, such
as **TLS/SSL (Transport Layer Security/Secure Sockets Layer)**, and **UDP (User Datagram Protocol)**. With these tools we can easily build scalable network programs,
moving well beyond the somewhat dated **AJAX (Asynchronous JavaScript And Xml)** techniques familiar to the JavaScript developer.

---

---

# v8 (machine powering Node's core)

V8 is Google's JavaScript engine, written in C++. It compiles and executes JavaScript
code inside of a **VM (Virtual Machine)**. When a webpage loaded into Google
Chrome demonstrates some sort of dynamic effect, like automatically updating
a list or news feed, you are seeing JavaScript, compiled by V8, at work.

While Node itself will efficiently manage I/O operations, its process object
refers to the V8 runtime. As such, it is important to understand how to configure
the V8 environment, especially as your application grows in size.

---

---

# The process object

By now it should be clear as to how Node is structured, in terms of V8, the event
loop, and so forth. We are now going to discuss, in detail, how instructions that you
write (a JavaScript program) are compiled by V8 into a list of instructions whose
execution context is accessible via the native Node process object.

The single thread forming the spine of Node's event loop is V8's event loop. When
I/O operations are initiated within this loop they are delegated to **libuv**, which
manages the request using its own (multi-threaded, asynchronous) environment.
**libuv** announces the completion of I/O operations, allowing any callbacks waiting
on this event to be re-introduced to the main V8 thread for execution:
