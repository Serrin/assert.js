/** assert.js * @version 1.1.0 esm * @see https://github.com/Serrin/assert.js * @license MIT */
"use strict";
function assert(c,...a){if(!c){throw new Error(a.length?"Assertion failed: "+JSON.stringify(a).slice(1,-1).replaceAll(",",", "):"Assertion failed");}return true;}
export default assert;
export {assert};