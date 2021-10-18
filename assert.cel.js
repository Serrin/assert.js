/**
 * @name Celestra assert.js plugin
 * @version 1.0.0
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 * Required Celestra version: 5.2.0
 */
(function(celestra){
"use strict";
function assert(c){if(!c){var s=":";Array.prototype.slice.call(arguments,1).forEach(function(item){s+=" "+JSON.stringify(item);});throw new Error("Assertion failed"+s);}return true;}
celestra.assert=assert;
}(celestra));