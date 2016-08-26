# G-Code thumbnail

A simple library for creating 2D thumbnails from G-Code code. Shows the G1, G2
and G3 operations on XY plane. It can print the thumnail in a canvas, save it
as a PNG or returning a base 64 version of this PNG.

For installing this library:

    npm install gcodethumbnail

## Functionnalities

Generated documentation can be found
[here](http://gofabmo.org/G-Code-Thumbnail/).

Three functions are available. A type ``Colors`` is defined.

```javascript
/*
 * The colors for displaying G0, G1, G2 and G3 commands, each field is a string
 * of an hexadecimal color (ex: "#ff00ff"). If one field is undefined, the
 * corresponding G-Code command is not displayed.
 *
 * @typedef {object} Colors
 * @property {string} [colors.G0] - The colors for displaying G0 commands.
 * @property {string} [colors.G1] - The colors for displaying G1 commands.
 * @property {string} [colors.G2G3] - The colors for displaying G2 and G3
 *   commands.
 */
```

### Preview

```javascript
/**
 * Previews in a canvas the G-Code.
 *
 * @param {string} gcodeStr - The G-Code.
 * @param {Colors} colors - The colors for displaying the commands.
 * @param {Canvas|DOMElement} canvas - The canvas (from document or the canvas
 *   library).
 */
function preview(gcodeStr, colors, canvas)
```

### Get base 64

```javascript
/**
 * Gets the PNG thumbnail in base 64 representing the G-Code.
 *
 * @param {string} gcodeStr - The G-Code.
 * @param {Colors} colors - The colors for displaying the commands.
 * @param {number} width - The width in pixel.
 * @param {number} height - The height in pixel.
 * @return {string} The data URL of the image.
 */
exports.getBase64 = function(gcodeStr, colors, width, height)
```

### Generate PNG

```javascript
/**
 * Generates in the file the PNG thumbnail4 representing the G-Code. Important
 * note: does not manage errors unfortunately.
 *
 * @param {string} path - The path to the file for saving the PNG.
 * @param {string} gcodeStr - The G-Code.
 * @param {Colors} colors - The colors for displaying the commands.
 * @param {number} width - The width in pixel.
 * @param {number} height - The height in pixel.
 * @param {function} [callback] - If defined, called when the process is over.
 */
exports.generatePNG = function(path, gcodeStr, colors, width, height, callback)
```

## Example

```javascript
var path = require("path");
var Canvas = require("canvas");
var gcodethumbnail = require("./gcodethumbnail");

// Settings parameters
var colors = { G1 : '#000000', G2G3 : "#000000" };
var width = 250;
var height = 200;
var code = "(Illerminaty)\n";
code += "G1 Z-0.333 F66.6\n";
code += "G1 X2\n";
code += "G1 X1 Y1.73205\n";
code += "G1 X0 Y0\n";
code += "G1 Z1\n";
code += "G0 X0.4 Y0.57735\n";
code += "G1 Z-0.333 F66.6\n";
code += "G3 X1.6 R0.8 F91.1\n";
code += "G3 X0.4 R0.8\n";
code += "G1 Z1\n";

// Previewing the thumbnail in a canvas
var canvas = new Canvas(width, height);
gcodethumbnail.preview(code, colors, canvas);

// Getting the base 64
var base = gcodethumbnail.getBase64(code, colors, width, height);
console.log(base);

// Saving the thumbnail
var path = __dirname + '/thumbnail.png';
gcodethumbnail.generatePNG(path, code, colors, width, height);

// Important weakness of the library here: if in Linux environment and not
// root, will cause an error (EACCES: permission denied) but the callback
// function will be called.
gcodethumbnail.generatePNG("/thumbnail.png", code, colors, width, height,
    function() { console.log("Complete."); }
);
```

## License

For this software.

```
   Copyright 2016 Alex Canales

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

For the dependencies, check out there repositories.
