# stack-queue

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/findhit/stack-queue?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Test Status](http://strider.findhit.com/findhit/stack-queue/badge)](http://strider.findhit.com/findhit/stack-queue) [![Dependency Status](https://david-dm.org/findhit/stack-queue.svg)](https://david-dm.org/findhit/stack-queue)

Execution stacks compatible with promises

## Installation

```bash
npm install --save stack-queue
```

## Usage

Have you ever used [express](https://github.com/strongloop/express) or [connect](https://github.com/strongloop/connect)?

If so, you should know how they share they stack with `function ( req, res, next )`.

This module allows you to apply a **nextable queue** method in any circunstance,
and compatible with promises!

Lets see some examples:

### [connect](https://github.com/strongloop/connect) Example

This is how you would implement a [connect](https://github.com/strongloop/connect)-like example:

```js

var http = require( 'http' ),
    Stack = require( 'stack-queue' );

var stack = new Stack(),
    server = http.createServer( stack.dispatch.bind( stack ) ).listen( 80 );

// Now you should be able to stack things on request
stack.queue( function ( req, res, next ) {
    req.foo = 'bar';

    next();
});

// You can even chain stack.queue calls
stack
    .queue(function ( req, res ) {
        res.statusCode = 200;

        return somePromisedMethod();
    })
    .queue(function ( req, res, next ) {
        res.write( 'hey' );

        next();
    });

// Or provide an array with functions
stack.queue([
    function () { return true; },
    function () { throw new Error("WOW"); }
]);

```

### Do you have more examples?

Please **Pull Request** them! :)
