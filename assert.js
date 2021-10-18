/**
 * @name assert.js
 * @version 1.0.0 dev
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 */
(function(window){
"use strict";

function assert (c) {
  if (!c) {
    var s = ":";
    Array.prototype.slice.call(arguments, 1).forEach(
      function (item) { s += " " + JSON.stringify(item); }
    );
    throw new Error("Assertion failed" + s);
  }
  return true;
}

if (typeof window !== "undefined") {
  window.assert = assert;
}

}(window));
