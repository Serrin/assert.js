/**
 * @name Celestra assert.js plugin
 * @version 1.0.1
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 * Required Celestra version: 5.4.1
 */
(function(celestra){
"use strict";
function assert(c){if(!c){throw new Error("Assertion failed:"+Array.prototype.slice.call(arguments,1).reduce(function(acc,v){return acc+" "+JSON.stringify(v);},""));}return true;}
celestra.assert=assert;
}(celestra));