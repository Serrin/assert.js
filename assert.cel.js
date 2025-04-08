/**
 * @name Celestra assert.js plugin
 * @version 1.1.0
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 * Required Celestra version: 5.6.2
 */
(function(celestra){
"use strict";
function assert(c,...a){if(!c){throw new Error(a.length?"Assertion failed: "+JSON.stringify(a).slice(1,-1).replaceAll(",",", "):"Assertion failed");}return true;}
celestra.assert=assert;
}(celestra));