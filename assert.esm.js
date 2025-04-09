/** assert.js * @version 1.2.0 esm * @see https://github.com/Serrin/assert.js * @license MIT */
"use strict";
function assert(c,...a){if(c){return true;}throw new Error("Assertion failed"+(a.length?a.reduce((acc,e)=>acc+e+", ",": ").slice(0,-2):""));}
export default assert;
export {assert};