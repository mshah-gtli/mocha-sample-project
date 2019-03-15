
require('colors');
var _ = require('lodash');

/* @description - writes a line with a return to standard out
 * @params - message, string message for writing
 * */
exports.writeLn = writeLn;

/* @description - writes messages to stderr in color red
 * @params - any
 * */
exports.writeError = writeError;

/* @description - writes messages to stderr in color yellow
 * @params - any
 * */
exports.writeWarn = writeWarn;

/* @description - writes messages to stderr in color green
 * @params - any
 * */
exports.writeSuccess = writeSuccess;

/* @description - writes messages to stderr in color blue
 * @params - any
 * */
exports.writeInfo = writeInfo;

function writeLn( message ) {
    process.stderr.write( message );
    process.stderr.write( '\n' );
}

function writeError () {
    var args = Array.prototype.slice.call(arguments);
    _.forEach( args, function(n,key) { 
        writeLn( ( typeof n === 'string' ) ? n.red : n )
    } );
}

function writeWarn () {
    var args = Array.prototype.slice.call(arguments);
    _.forEach( args, function(n,key) { 
        writeLn( ( typeof n === 'string' ) ? n.yellow : n )
    } );
}

function writeInfo () {
    var args = Array.prototype.slice.call(arguments);
    _.forEach( args, function(n,key) { 
        writeLn( ( typeof n === 'string' ) ? n.cyan : n )
    } );
}

function writeSuccess () {
    var args = Array.prototype.slice.call(arguments);
    _.forEach( args, function(n,key) { 
        writeLn( ( typeof n === 'string' ) ? n.green : n )
    } );
}
