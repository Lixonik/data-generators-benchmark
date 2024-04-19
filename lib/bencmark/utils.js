"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionName = exports.generateGraph = void 0;
var canvas_1 = require("canvas");
var auto_1 = require("chart.js/auto");
var generateGraph = function (loopIndices, timeToGeneration) {
    var width = 1200, height = 800;
    var canvas = (0, canvas_1.createCanvas)(width, height);
    var ctx = canvas.getContext('2d');
    var plugin = {
        id: 'customCanvasBackgroundImage',
        beforeDraw: function (chart) {
            var ctx = chart.ctx;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
    };
    var data = {
        labels: loopIndices.map(String),
        datasets: [
            {
                label: 'Generation time vs Loop index graph',
                data: timeToGeneration,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
            },
        ],
    };
    var config = {
        type: 'line',
        data: data,
        plugins: [plugin],
    };
    new auto_1.Chart(ctx, config);
    return canvas;
};
exports.generateGraph = generateGraph;
var getFunctionName = function (fn) { var _a; return (_a = fn.name.split(' ').at(-1)) !== null && _a !== void 0 ? _a : 'fn'; };
exports.getFunctionName = getFunctionName;
