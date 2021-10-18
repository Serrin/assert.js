/** assert.js * @version 1.0.0 esm * @see https://github.com/Serrin/assert.js * @license MIT */
"use strict";
function assert(c){if(!c){var s=":";Array.prototype.slice.call(arguments,1).forEach(function(item){s+=" "+JSON.stringify(item);});throw new Error("Assertion failed"+s);}return true;}
export default assert;
export {assert};