
# assert.js

A very simple assert function and microlibrary.

Latest version: 1.2.0

Date: 2025-04-09T19:27:02.796Z

Tested on desktop browsers (latest Firefox, latest Chrome, latest Edge) and mobile devices (iOS Safari, Chrome, Firefox and Android Chrome, Firefox, Samsung Internet, Edge).

````
assert(<condition>[,message1][,...messageN]): return true or throw an error with the messages
````

````javascript
function assert(c, ...a) {
  if (c) { return true; }
  throw new Error("Assertion failed"
    + (a.length ? a.reduce((acc, e) => acc + e + ", ", ": ").slice(0, -2) : "")
  );
}
````

Minified code:

````javascript
function assert(c,...a){if(c){return true;}throw new Error("Assertion failed"+(a.length?a.reduce((acc,e)=>acc+e+", ",": ").slice(0,-2):""));}
````


## Download

Github page: https://github.com/Serrin/assert.js

edition|filename|testpage
-------|--------|--------
developer|__assert.dev.js__|__test-dev.html__
minified|__assert.min.js__|__test-min.html__
ES6 module|__assert.esm.js__|__test-esm.html__
Celestra plugin|__assert.cel.js__|__test-cel.html__


## Test code

````javascript
alert(assert(true));
// return true

alert(assert(true, "lorem"));
// return true

try {
  assert(false);
} catch (e) {
  alert(e);
}
// Error: Assertion failed

try {
  assert(false, "lorem");
} catch (e) {
  alert(e);
}
// Error: Assertion failed: lorem

try {
  assert(false, "lorem", 42, 3.14, [1,2], JSON.stringify({"a":3, "b":4}), null, undefined, +"a");
} catch (error) {
  alert(error);
}
// Error: Assertion failed: lorem, 42, 3.14, 1,2, {"a":3,"b":4}, null, undefined, NaN
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
