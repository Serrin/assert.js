/**
 * @name assert.js
 * @version 1.2.0 dev
 * @see https://github.com/Serrin/assert.js
 * @license MIT https://opensource.org/licenses/MIT
 */
(function(window){
"use strict";

function assert(c, ...a) {
  if (c) { return true; }
  throw new Error("Assertion failed"
    + (a.length ? a.reduce((acc, e) => acc + e + ", ", ": ").slice(0, -2) : "")
  );
}

if (typeof window !== "undefined") {
  window.assert = assert;
}

}(window));
