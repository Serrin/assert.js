/**
 * @name Celestra assert.js plugin
 * @version 1.2.0
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 * Required Celestra version: 5.6.3
 */
(function(celestra){
"use strict";
function assert(c,...a){if(c){return true;}throw new Error("Assertion failed"+(a.length?a.reduce((acc,e)=>acc+e+", ",": ").slice(0,-2):""));}
celestra.assert=assert;
}(celestra));