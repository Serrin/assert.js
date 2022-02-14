/** assert.js * @version 1.0.0 esm * @see https://github.com/Serrin/assert.js * @license MIT */
"use strict";
function assert(c){if(!c){throw new Error("Assertion failed:"+Array.prototype.slice.call(arguments,1).reduce(function(acc,v){return acc+" "+JSON.stringify(v);},""));}return true;}
export default assert;
export {assert};