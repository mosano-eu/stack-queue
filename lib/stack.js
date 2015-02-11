var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' ),

    debug = require( 'debug' )( 'stack-queue:stack' );

// -----------------------------------------------------------------------------

/*
 *
 * @name Stack
 * @constructor
 *
 * @param {Object}   [options={}] An object with options.
 * @param {Function} [options.breakOn] Function that will eval if stack should
 *                   break execution or not. Defaults to a function that will
 *                   always break on a string.
 */
var Stack = function ( options, queue ) {

    // queue handling

    queue =
        Util.is.Array( queue ) || Util.is.Function( queue ) && queue ||
        Util.is.Array( options ) || Util.is.Function( options ) && options ||
        false;

        // Check if it is an array or function so we can queue it
        if( queue ) {
            this.queue( queue );
        }

    // options handling

    options = this.options = Util.is.Object( options ) && Util.extend( {}, options ) || {};
    options.__proto__ = Stack.defaultOptions;

        // Validations

        // breakOn
        if( options.hasOwnProperty( 'breakOn' ) ) {
            if( Util.isnt.Function( options.breakOn ) && options.breakOn !== false ) {
                throw new TypeError("options.breakOn should be either a function or false");
            }
        }

};

// Export Stack
module.exports = Stack;

// Load default options
Stack.defaultOptions = require( './default.options' );

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

    // Save the params that fn accepts
    fn.params = Util.Function.getParamNames( fn );

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

    var stack = this,
        dispatchArgs = arguments,
        context = Util.extend( [], arguments ),
        promise = Promise.cast().bind( context );

    Util.Array.each( stack, function ( fn ) {
        promise = promise.then(function ( value ) {

            // If some string or object has been passed, break stack
            if ( stack.options.breakOn && stack.options.breakOn( value ) ) {
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

                if( result || dispatchArgs.length === fn.params.length ) {
                    next( result );
                }
            });
        });
    });

    return promise;
};
