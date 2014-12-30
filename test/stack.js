var Stack = require( '../index' ),

    sinon = require( 'sinon' ),
    chai = require( 'chai' ),
    expect = chai.expect;

describe( "Stack", function () {
    var stack;

    beforeEach(function () {
        stack = new Stack();
    });

    it( "should queue a function", function () {
        stack.queue( sinon.stub() );
    });

    it( "should queue from an array", function () {

        var array = [
            sinon.stub(),
            sinon.stub(),
            sinon.stub(),
            sinon.stub(),
        ];

        stack.queue( array );

        expect( stack.length ).to.be.equal( array.length );

    });

    it( "shouldn't queue a string", function () {
        expect(function () {
            stack.queue( "yehe" );
        }).to.throw( Error );
    });

    it( "should capture errors to promise, from next", function () {

        stack.queue(function ( next ) {
            next( new Error( "test" ) );
        })

        return stack.dispatch()
            .then(function () {
                throw new Error( "stack should not fulfill this promise" );
            }, function ( err ) {
                expect( err.message ).to.equal( "test" );
            });
        });

    it( "should capture errors to promise, from second next", function () {

        stack.queue( sinon.stub().callsArg( 0 ) );

        stack.queue(function ( next ) {
            next( new Error( "test" ) );
        });

        return stack.dispatch()
            .then(function () {
                throw new Error( "stack should not fulfill this promise" );
            }, function ( err ) {
                expect( err.message ).to.equal( "test" );
            });
    });

    it( "should capture errors to promise, from internal throw", function () {

        stack.queue( sinon.stub().throws( new Error( "test" ) ) );

        return stack.dispatch()
            .then(function () {
                throw new Error( "stack should not fulfill this promise" );
            }, function ( err ) {
                expect( err.message ).to.equal( "test" );
            });

    });

    it( "should transport arguments given to dispatch", function () {

        var args = [
            'lol',
            'lola'
        ];

        stack.queue(function ( first, second, next ) {
            expect( first ).to.equal( args[0] );
            expect( second ).to.equal( args[1] );

            next();
        });

        return stack.dispatch( args[0], args[1] );
    });

    it( "should continue stack with some positive return instead of `next`", function () {

        stack.queue(function ( next ) {
            return 'yolo';
        });

        return stack.dispatch()
            .then(function ( value ) {
                expect( value ).to.equal( 'yolo' );
            });
    })

    it( "should NOT PASS execution of stack if a string is provided", function () {

        var functions = [
            sinon.stub().callsArg( 0 ),
            sinon.stub().returns( 'hehehe' ),
            sinon.stub().callsArg( 0 ),
        ];

        stack.queue( functions );

        return stack.dispatch()
            .then(function ( value ) {
                expect( value ).to.equal( 'hehehe' );

                expect( functions[0].callCount ).to.be.equal( 1 );
                expect( functions[1].callCount ).to.be.equal( 1 );
                expect( functions[2].callCount ).to.be.equal( 0 );
            });
    });

    it( "should NOT PASS execution of stack if an object is provided", function () {

        var functions = [
        sinon.stub().callsArg( 0 ),
        sinon.stub().returns( {} ),
        sinon.stub().callsArg( 0 ),
        ];

        stack.queue( functions );

        return stack.dispatch()
            .then(function ( value ) {
                expect( value ).to.deep.equal( {} );

                expect( functions[0].callCount ).to.be.equal( 1 );
                expect( functions[1].callCount ).to.be.equal( 1 );
                expect( functions[2].callCount ).to.be.equal( 0 );
            });
    });

    // Examples:

    describe( "small http simulation", function () {
        var req, res;

        beforeEach(function () {
            req = 'request';
            res = 'response';
        });

        // TODO
    });

});
