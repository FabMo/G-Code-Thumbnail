/*jslint todo: true, browser: true, continue: true, white: true*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

"use strict";

var fs = require("fs");
var Canvas = require("canvas");
var gcodetogeometry = require("gcodetogeometry");

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

/**
 * Previews in a canvas the G-Code.
 *
 * @param {string} gcodeStr - The G-Code.
 * @param {Colors} colors - The colors for displaying the commands.
 * @param {Canvas|DOMElement} canvas - The canvas (from document or the canvas
 *   library).
 */
function preview(gcodeStr, colors, canvas) {

    /**
     * Calculates the ratio for the scale.
     * @param {object} gcode The parsed G-Code.
     * @param {object} canvas The DOM Element canvas.
     * @return {number} The scale ratio.
     */
    function calculateRatio(gcode, canvas) {
        var pW = Math.abs(gcode.size.max.x - gcode.size.min.x);
        var pH = Math.abs(gcode.size.max.y - gcode.size.min.y);
        var cW = parseInt(canvas.width, 10), cH = parseInt(canvas.height, 10);

        return Math.min(cW / pW, cH / pH);
    }

    /**
     * Draws a straight line.
     * @param {object} ctx The canvas 2D context.
     * @param {number} ratio The scale ratio.
     * @param {object} start The lowest point of the G-Code command.
     * @param {object} line The line defined by the G-Code command.
     * @param {number} height The canvas height.
     * @param {string} color The hexadecimal color in string.
     */
    function drawStraightLine(ctx, ratio, start, line, height, color) {
        var startX = Math.round(ratio * (line.start.x - start.x));
        var startY = Math.round(height - ratio * (line.start.y - start.y));
        var endX = Math.round(ratio * (line.end.x - start.x));
        var endY = Math.round(height - ratio * (line.end.y - start.y));
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle =  color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Draws a curved line.
     * @param {object} ctx The canvas 2D context.
     * @param {number} ratio The scale ratio.
     * @param {object} start The lowest point of the G-Code command.
     * @param {object} line The line defined by the G-Code command.
     * @param {number} height The canvas height.
     * @param {string} color The hexadecimal color in string.
     */
    function drawCurvedLine(ctx, ratio, start, line, height, color) {
        var i = 0;
        var b = line.beziers, l = {};
        ctx.beginPath();
        for(i = 0 ; i < b.length; i++) {
            l = b[i];
            ctx.moveTo(
                ratio * (l.p0.x - start.x), height - ratio * (l.p0.y - start.y)
            );
            ctx.bezierCurveTo(
                ratio * (l.p1.x - start.x), height - ratio * (l.p1.y - start.y),
                ratio * (l.p2.x - start.x), height - ratio * (l.p2.y - start.y),
                ratio * (l.p3.x - start.x), height - ratio * (l.p3.y - start.y)
            );
        }
        ctx.strokeStyle =  color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    if(colors === undefined) {
        return;
    }

    var gcode = gcodetogeometry.parse(gcodeStr);
    if((gcode.size.max.x === gcode.size.min.x) &&
            (gcode.size.max.y === gcode.size.min.y)) {
        return;
    }

    var start = { x : gcode.size.min.x, y : gcode.size.min.y };
    var i = 0, ratio = calculateRatio(gcode, canvas);
    var cH = parseInt(canvas.height, 10);
    var ctx = canvas.getContext("2d");

    // Cleaning
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    for(i = 0; i < gcode.lines.length; i++) {
        if(gcode.lines[i].type === "G0" && colors.G0 !== undefined) {
            drawStraightLine(ctx, ratio, start, gcode.lines[i], cH, colors.G0);
        } else if(gcode.lines[i].type === "G1" && colors.G1 !== undefined) {
            drawStraightLine(ctx, ratio, start, gcode.lines[i], cH, colors.G1);
        } else if((gcode.lines[i].type === "G2" ||
                    gcode.lines[i].type === "G3") && colors.G2G3 !== undefined)
        {
            drawCurvedLine(ctx, ratio, start, gcode.lines[i], cH, colors.G2G3);
        }
    }
}

function getCanvas(gcodeStr, colors, width, height) {
    var canvas = new Canvas(width, height);
    preview(gcodeStr, colors, canvas);
    return canvas;
}

/**
 * Gets the PNG thumbnail in base 64 representing the G-Code.
 *
 * @param {string} gcodeStr - The G-Code.
 * @param {Colors} colors - The colors for displaying the commands.
 * @param {number} width - The width in pixel.
 * @param {number} height - The height in pixel.
 * @return {string} The data URL of the image.
 */
exports.getBase64 = function(gcodeStr, colors, width, height) {
    var canvas = getCanvas(gcodeStr, colors, width, height);
    return canvas.toDataURL("img/png");
};

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
exports.generatePNG = function(path, gcodeStr, colors, width, height, callback) {
    var canvas = getCanvas(gcodeStr, colors, width, height);
    var out = fs.createWriteStream(path);
    var stream = canvas.pngStream();

    stream.on('data', function(chunk){
        out.write(chunk);

    });

    stream.on('end', function(){
        if(callback !== undefined) {
            callback(true);
        }
    });
};

exports.preview = preview;
