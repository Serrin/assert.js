# assert.js

A very simple assert function and microlibrary.

Latest version: 1.0.0

Date: 2021-10-17T11:19:21.089Z

Tested on desktop browsers with ES6+ compatibility (latest Firefox, latest Chrome, latest Edge, Internet Explorer 11) and mobile devices (iOS Safari, Chrome, Firefox and Android Chrome, Firefox, Samsung Internet, Edge).

````
assert(<condition>[,message1][...messageN]): return true or throw error with the messages
````

````javascript
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
````
Minified code:
````javascript
function assert(c){if(!c){var s=":";Array.prototype.slice.call(arguments,1).forEach(function(item){s+=" "+JSON.stringify(item);});throw new Error("Assertion failed"+s);}return true;}
````


## Download

edition|filename|size|testpage
-------|--------|----|--------
developer|__assert.js__|520 byte|__test-dev.html__
minified|__assert.min.js__|383 byte|__test-min.html__
ES6 module|__assert.esm.js__|336 byte|__test-esm.html__
Celestra plugin|__assert.cel.js__|459 byte|__test-cel.html__


## Test code

````javascript
assert(true);
// return true
assert(true, "lorem");
// return true
assert(false);
// Uncaught Error: Assertion failed:
assert(false, "lorem");
// Uncaught Error: Assertion failed: lorem
assert(false, "lorem", 3.14, [4,5,6], {a:1,b:2}, 42, "ipsum");
// Uncaught Error: Assertion failed: "lorem" 3.14 [4,5,6] {"a":1,"b":2} 42 "ipsum"
````

## License

https://opensource.org/licenses/MIT

MIT License

SPDX short identifier: MIT

Copyright (c) 2021 Ferenc Czigler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
