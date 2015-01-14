var Util = require( 'findhit-util' );

// -----------------------------------------------------------------------------

module.exports = {

    /**
     * Stack should break ALWAYS on Errors, but you could provide a method to
     * check either if it should break or not on a specific value.
     *
     * default
     */
    breakOn: function ( value ) {
        return Util.is.String( value );
    },

};
