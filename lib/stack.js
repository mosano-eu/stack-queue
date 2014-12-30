var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    debug = require( 'debug' )( 'stack' );

// -----------------------------------------------------------------------------

var Stack = function ( queue ) {
    return queue ? this.queue( queue ) : this;
};

// Export Stack
module.exports = Stack;

// Inherate proto from Array
Stack.prototype = Object.create( Array.prototype );

/* class methods */

/* instance methods */
Stack.prototype.queue = function ( fn ) {

    if( Util.is.Array( fn ) ) {
        Util.Array.each( fn, this.queue, this );
        return this;
    }

    if( Util.isnt.Function( fn ) ) {
        throw new TypeError( "fn should be a function" );
    }

    debug( "queueing function " + ( fn.name || 'anonymous' ) );

    this.push( fn );

    return this;
};

Stack.prototype.unqueue = function ( i ) {

    if( Util.is.Function( fn ) ) {
        i = this.indexOf( fn );
    }

    if( ! this[ i ] ) {
        return false;
    }

    debug( "unqueueing function " + ( this[ i ].name || 'anonymous' ) );

    this.splice( i, 1 );

    return this;
};

Stack.prototype.dispatch = function () {

    var context = Util.extend( [], arguments ),
        promise = Promise.cast().bind( context );

    Util.Array.each( this, function ( fn ) {
        promise = promise.then(function ( value ) {

            // If some string or object has been passed, break stack
            if ( value ) {
                return value;
            }

            var fulfill, reject, next,
                args = Util.extend( [], context );

            args.push( next = function ( value ) {
                if ( Util.is.Error( value ) ) {
                    reject( value );
                    return;
                }

                fulfill( value );
            });

            return new Promise(function () {
                fulfill = arguments[0];
                reject = arguments[1];

                var result = fn.apply( this, args );

                if( result ) {
                    next( result );
                }
            });
        });
    });

    return promise;
};
