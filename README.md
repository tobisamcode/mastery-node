# mastery-node

This book is for developers who want to build high-capacity network applications, such as social networks, collaborative document editing environments, using a language you already know.

# 1.

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

## Events

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

## Rule of Modularity

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

## The Network

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

## v8 (machine powering Node's core)

V8 is Google's JavaScript engine, written in C++. It compiles and executes JavaScript
code inside of a **VM (Virtual Machine)**. When a webpage loaded into Google
Chrome demonstrates some sort of dynamic effect, like automatically updating
a list or news feed, you are seeing JavaScript, compiled by V8, at work.

While Node itself will efficiently manage I/O operations, its process object
refers to the V8 runtime. As such, it is important to understand how to configure
the V8 environment, especially as your application grows in size.

---

---

## The process object

By now it should be clear as to how Node is structured, in terms of V8, the event
loop, and so forth. We are now going to discuss, in detail, how instructions that you
write (a JavaScript program) are compiled by V8 into a list of instructions whose
execution context is accessible via the native Node process object.

The single thread forming the spine of Node's event loop is V8's event loop. When
I/O operations are initiated within this loop they are delegated to **libuv**, which
manages the request using its own (multi-threaded, asynchronous) environment.
**libuv** announces the completion of I/O operations, allowing any callbacks waiting
on this event to be re-introduced to the main V8 thread for execution.

A Node process begins by constructing a single execution stack, with the global
context forming the base of the stack. Functions on this stack execute within their
own, local, context (sometimes referred to as scope), which remains enclosed within
the global context (which you'll hear referred to as closure). **Because Node is evented,
any given execution context can commit the running thread to handling an eventual
execution context. This is the purpose of callback functions**

---

---

# The Read-Eval-Print Loop and executing a Node program

Node's **REPL (Read-Eval-Print-Loop)** represents the Node shell. To enter the shell
prompt, enter Node via your terminal without passing a filename:

> node

You now have access to a running Node process, and may pass JavaScript
commands to this process. For example, after entering 2+2 the shell would send 4 to
stdout. Node's REPL is an excellent place to try out, debug, test, or otherwise play
with JavaScript code.

Because the REPL is a native object, programs can also use instances as a context in
which to run JavaScript interactively. For example, here we create our own custom
function sayHello, add it to the context of a REPL instance, and start the REPL,
emulating a Node shell prompt:

> require('repl').start("> ").context.sayHello = function() {

> return "Hello"

> };

Entering sayHello() at the prompt will result in Hello being sent to stdout.
Let's take everything we've learned in this chapter and create an interactive REPL
which allows us to execute JavaScript on a remote server.

---

---

---

---

---

---

# 2.

# Understanding Asynchronous Event-Driven Programming

Eliminating blocking processes through the use of event-driven, asynchronous I/O
is Node's primary organizational principle. We've learned how this design helps
developers in shaping information and adding capacity: lightweight, independent,
and share-nothing processes communicating through callbacks synchronized within
a predictable event loop.

Accompanying the growth in the popularity of Node is a growth in the number
of well-designed evented systems and applications. For a new technology to be
successful, it must eliminate existing problems and/or offer to consumers a better
solution at a lower cost in terms of time or effort or price. In its short and fertile
lifespan, the Node community has collaboratively proven that this new development
model is a viable alternative to existing technologies. The number and quality of
Node-based solutions powering enterprise-level applications provide further proof
that these new ideas are not only novel, but preferred.

## Broadcasting eventsIt is always good to have an accurate understanding of the total eventual cost of

asking for a service to be performed.
I/O is expensive. In the following chart (taken from Ryan Dahl's original presentation
on Node) we can see how many clock cycles typical system tasks consume. The
relative cost of I/O operations is striking.

L1 - cache3 cycles

L2 - cache14 cycles

RAM250 - cycles

Disk - 41,000,000 cycles

Network - 240,000,000 cycles

The reasons are clear enough: a disk is a physical device, a spinning metal platter
that buses data at a speed that cannot possibly match the speed of an on-chip or
near-chip cache moving data between the CPU and RAM (Random Access Memory).
Similarly, a network is bound by the speed in which data can travel through its
connecting "wires", modulated by its controllers. Even through fiber optic cables,
light itself needs 0.1344 seconds to travel around the world. In a network used by
billions of people regularly interacting across great distances, this sort of latency
builds up.

In the traditional marketplace described by an application running on a blocking
system the purchase of a file operation requires a significant expenditure of resources,
as we can see in the preceding table. Primarily this is due to scarcity: a fixed number
of processes, or "units of labor" are available, each able to handle only a single task,
and as the availability of labor decreases, its cost (to the client) increases.

The breakthrough in thinking reflected by Node's design is simple to understand
once one recognizes that most worker threads spend their time waiting—for more
instructions, a sub-task to complete, and so on. For example, a process assigned
to service the command format my hard drive will dedicate all of its allotted resources
to managing a workflow something like the following:

- Communicate to a device driver that a format request has been made
- Idle, waiting for an "unknowable" length of time
- Receive the signal format is complete
- Notify the client
- Clean up; shut down

In the preceding figure we see that an expensive worker is charging the client a
fixed fee per unit of time regardless of whether any useful work is being done (the
client is paying equally for activity and idleness). Or to put it another way, it is not
necessarily true, and most often simply not true, that the sub-tasks comprising a total
task each require identical effort or expertise, and therefore it is wasteful to pay a
premium price for such cheap labor

Sympathetically, we must also recognize that this worker can do no better even if
ready and able to handle more work—even the best intentioned worker cannot do
anything about I/O bottlenecks. The worker here is **I/O bound.**

A **blocking** process is therefore better understood as an **idle** process, and **idle**
processes are **bottlenecks** within the particular task and for the overall application
flow. What if multiple clients could share the same worker, such that the moment a
worker announces availability due to an I/O bottleneck, another job from another
client could be started?

Node has commoditized I/O through the introduction of an environment
where system resources are (ideally) never idle. Event-driven programming as
implemented by Node reflects the simple goal of lowering overall system costs
by encouraging the sharing of expensive labor, mainly by reducing the number of
I/O bottlenecks to zero. We no longer have a powerless chunk of rigidly-priced
unsophisticated labor; we can reduce all effort into discrete units with precisely
delineated shapes and therefore admit much more accurate pricing. Identical outlays
of capital can fund a much larger number of completed transactions, increasing the
efficiency of the market and the potential of the market in terms of new products and
new product categories. Many more concurrent transactions can be handled on the
same infrastructure, at the same cost.

If the start, stop, and idle states of a process are understood as being events that can be
subscribed to and acted upon we can begin to discuss how extremely complex systems
can be constructed within this new, and at heart quite simple to grasp, model.

What would an environment within which many client jobs are cooperatively
scheduled look like? And how is this message passing between events handled?

## Collaboration

The worker flow described in the previous section is an example of a blocking server.
Each worker is assigned a task or process, with each process able to accept only one
request for work. They'll be blocking other requests, even if idling:

![picture](https://github.com/tobisamcode/mastery-node/blob/main/assets/Screenshot%20from%202023-01-01%2016-23-34.png)

One drawback to this method is the amount of scheduling and worker surveillance
that needs to be done. The dispatcher must field a continuous stream of requests,
while managing messages coming from workers about their availability, neatly
breaking up requests into manageable tasks and efficiently sorting them such that
the fewest number of workers are idling.

Perhaps most importantly, what happens when all workers are fully booked? Does
the dispatcher begin to drop requests from clients? Dispatching is resource-intensive
as well, and there are limits even to the dispatcher's resources. If requests continue
to arrive and no worker is available to service them what does the dispatcher do?
Manage a queue? We now have a situation where the dispatcher is no longer doing
the right job (dispatching), and has become responsible for bookkeeping and keeping
lists, further diminishing operational efficiency.

## Queueing

In order to avoid overwhelming anyone, we might add a buffer between the clients
and the dispatcher.

This new worker is responsible for managing customer relations. Instead of speaking
directly with the dispatcher, the client speaks to the services manager, passing the
manager requests, and at some point in the future getting a call that their task has
been completed. Requests for work are added to a prioritized work queue (a stack
of orders with the most important one on top), and this manager waits for another
client to walk through the door. The following figure describes the situations:

![picture](https://github.com/tobisamcode/mastery-node/blob/main/assets/Screenshot%20from%202023-01-01%2016-26-59.png)

When a worker is idle the dispatcher can fetch the first item on the stack, pass
along any package workers have completed, and generally maintain a sane work
environment where nothing gets dropped or lost. If it comes to a point where all the
workers are idle and the task queue is empty, the office can sleep for a while, until
the next client arrives.

![picture](https://github.com/tobisamcode/mastery-node/blob/main/assets/Screenshot%20from%202023-01-01%2016-28-11.png)

When a worker is idle the dispatcher can fetch the first item on the stack, pass
along any package workers have completed, and generally maintain a sane work
environment where nothing gets dropped or lost. If it comes to a point where all the
workers are idle and the task queue is empty, the office can sleep for a while, until
the next client arrives.

This last model inspires Node's design. The primary modification is to occupy the
workers' pool solely with I/O tasks and delegate the remaining work to the single
thread of V8. If a JavaScript program is understood as the client, Node is the services
manager running through the provided instructions and prioritizing them. When
a potentially blocking task is encountered (I/O, timers, and streams) it is handed
over to the dispatcher (the libuv thread pool). Otherwise, the instruction is queued
up for the event loop to pop and execute.

## Understanding the event loop

Node processes JavaScript instructions using a **single thread**. Within your JavaScript
program no two operations will ever execute at exactly the same moment, as might
happen in a **multithreaded** environment. Understanding this fact is essential to
understanding how a Node program, or process, is designed and runs.

This does not mean that only one thread is being used on the machine hosting this
a Node process. Simply writing a callback does not magically create parallelism!
Recall Chapter 1, Understanding the Node Environment, and our discussion about the
process object—Node's "single thread" simplicity is in fact an abstraction created for
the benefit of developers. It is nevertheless crucial to remember that there are many
threads running in the background managing I/O (and other things), and these
threads unpredictably insert instructions, originally packaged as callbacks, into the
single JavaScript thread for processing.

Node executes instructions one by one until there are no further instructions
to execute, no more input or output to stream, and no further callbacks waiting
to be handled.

Even deferred events (such as timeouts) require an eventual interrupt in the event
loop to fulfill their promise.

For example, the following while loop will never terminate:

```js
var stop = false;
setTimeout(function () {
  stop = true;
}, 1000);
while (stop === false) {}
```

Even though one might expect, in approximately one second, the assignment of
a Boolean true to the variable stop, tripping the while conditional and interrupting
its loop, this will never happen. Why? This while loop starves the event loop by running
infinitely, greedily checking and rechecking a value that is never given a chance
to change, as the event loop is never given a chance to schedule our timer callback
for execution.

As such, programming Node implies programming the event loop. We've previously
discussed the event sources that are queued and otherwise arranged and ordered on
this event loop—I/O events, timer events, and so on.

When writing non-deterministic code it is imperative that no assumptions about
eventual callback orders are made. The abstraction that is Node masks the
complexity of the thread pool on which the straightforward main JavaScript thread
floats, leading to some surprising results.

We will now refine this general understanding with more information about how,
precisely, the callback execution order for each of these types is determined within
Node's event loop.

## Four sources of truth

- **Execution blocks**: The blocks of JavaScript code comprising the Node
  program, being expressions, loops, functions, and so on. This includes
  EventEmitter events emitted within the current execution context.

- **Timers**: Callbacks deferred to sometime in the future specified in
  milliseconds, such as setTimeout and setInterval.

- **I/O**: Prepared callbacks returned to the main thread after being delegated to
  Node's managed thread pool, such as filesystem calls and network listeners.

- **Deferred execution blocks**: Mainly the functions slotted on the stack
  according to the rules of setImmediate and nextTick.

We have learned how the deferred execution method setImmediate slots its
callbacks after I/O callbacks in the event queue, and nextTick slots its callbacks
before I/O and timer callbacks.
