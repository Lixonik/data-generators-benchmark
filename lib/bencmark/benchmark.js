"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = void 0;
var perf_hooks_1 = require("perf_hooks");
var fs_1 = require("fs");
var utils_1 = require("./utils");
var canvas_1 = require("canvas");
var auto_1 = require("chart.js/auto");
var Benchmark = /** @class */ (function () {
    function Benchmark() {
    }
    Benchmark.plotAndSaveMeasurementTimesCharts = function (pathToMeasurementsPng) {
        var _this = this;
        pathToMeasurementsPng !== null && pathToMeasurementsPng !== void 0 ? pathToMeasurementsPng : (pathToMeasurementsPng = './measurements');
        var timesToGeneration = [];
        var iterationNumbers = [];
        Benchmark.generatorFunctions.forEach(function (fn) {
            var comparedResult = _this.getFunctionTimeSeriesAndIterationIndices(fn);
            var timeToGeneration = comparedResult.timeToGeneration, iterationIndices = comparedResult.iterationIndices, measurementHash = comparedResult.measurementHash;
            timesToGeneration.push(timeToGeneration);
            iterationNumbers = iterationIndices;
        });
        var canvas = Benchmark.generateGraph(iterationNumbers, timesToGeneration);
        var buffer = canvas.toBuffer('image/png');
        if (!(0, fs_1.existsSync)(pathToMeasurementsPng)) {
            (0, fs_1.mkdirSync)(pathToMeasurementsPng);
        }
        (0, fs_1.writeFileSync)("".concat(pathToMeasurementsPng, "/").concat((0, utils_1.getFunctionName)(Benchmark.generatorFunctions[0]), ".png"), buffer);
    };
    Benchmark.printAvgGenerationTimes = function (precision) {
        var _this = this;
        Benchmark.generatorFunctions.forEach(function (fn) {
            var functionName = (0, utils_1.getFunctionName)(fn);
            var _a = _this.getFunctionTimeSeriesAndIterationIndices(fn), timeToGeneration = _a.timeToGeneration, measurementHash = _a.measurementHash;
            var sumOfTimesToGeneration = timeToGeneration.reduce(function (acc, time) { return acc + time; }, 0);
            var avgGenerationTime = sumOfTimesToGeneration / timeToGeneration.length;
            console.log('Measurement hash = ', measurementHash);
            console.log("Average generation time for function ".concat(functionName, " = ").concat(precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime, " ms"));
        });
    };
    Benchmark.getFunctionTimeSeriesAndIterationIndices = function (fn, iterationCount) {
        if (iterationCount === void 0) { iterationCount = 100; }
        var iterationIndices = [];
        var timeToGeneration = [];
        var measurementHash = 0;
        for (var i = -1; i < iterationCount; i++) {
            measurementHash += Math.random();
            var start = perf_hooks_1.performance.now();
            fn();
            var end = perf_hooks_1.performance.now();
            var duration = end - start;
            iterationIndices.push(i);
            timeToGeneration.push(duration);
        }
        iterationIndices.shift();
        timeToGeneration.shift();
        return {
            measurementHash: measurementHash,
            timeToGeneration: timeToGeneration,
            iterationIndices: iterationIndices,
        };
    };
    Benchmark.getFunctionName = function (index) {
        return (0, utils_1.getFunctionName)(Benchmark.generatorFunctions[index]);
    };
    Benchmark.generatorFunctions = [];
    Benchmark.pushCandidate = function () {
        var _a;
        var candidates = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            candidates[_i] = arguments[_i];
        }
        (_a = Benchmark.generatorFunctions).push.apply(_a, __spreadArray([], __read(candidates), false));
    };
    Benchmark.removeCandidate = function () {
        var candidates = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            candidates[_i] = arguments[_i];
        }
        Benchmark.generatorFunctions = Benchmark.generatorFunctions.filter(function (fn) { return !candidates.includes(fn); });
    };
    Benchmark.clearCandidates = function () {
        Benchmark.generatorFunctions = [];
    };
    Benchmark.generateGraph = function (iterationIndices, timeToGeneration) {
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
        var getCandidateColor = function (index) {
            if (index === 0) {
                return "rgb(0, 0, 255)";
            }
            else if (index === 1) {
                return "rgb(255, 0, 0)";
            }
            var randomBetween = function (min, max) { return min + Math.floor(Math.random() * (max - min + 1)); };
            var r = randomBetween(0, 255);
            var g = randomBetween(0, 255);
            var b = randomBetween(0, 255);
            return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
        };
        var data = {
            labels: iterationIndices.map(String),
            datasets: timeToGeneration.map((function (time, index) {
                return {
                    label: Benchmark.getFunctionName(index),
                    data: time.map(utils_1.calculateOpsPerSecond),
                    borderColor: getCandidateColor(index),
                    borderWidth: 2,
                    fill: false,
                    borderDash: index % 2 ? [10, 10] : []
                };
            })),
        };
        var config = {
            type: 'line',
            data: data,
            plugins: [plugin],
        };
        new auto_1.Chart(ctx, config);
        return canvas;
    };
    return Benchmark;
}());
exports.Benchmark = Benchmark;
