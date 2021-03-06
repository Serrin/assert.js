/**
 * @name assert.js
 * @version 1.0.1 dev
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 */
(function(window){
"use strict";

function assert (c) {
  if (!c) {
    throw new Error("Assertion failed:" +
      Array.prototype.slice.call(arguments, 1).reduce(
        function (acc, v) { return acc + " " + JSON.stringify(v); }, ""
      )
    );
  }
  return true;
}

if (typeof window !== "undefined") {
  window.assert = assert;
}

}(window));
