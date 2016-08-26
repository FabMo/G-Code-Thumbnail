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
