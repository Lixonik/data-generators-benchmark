"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var auto_1 = require("chart.js/auto");
var fs = __importStar(require("fs"));
var canvas_1 = require("canvas");
var Benchmark = /** @class */ (function () {
    function Benchmark() {
    }
    Benchmark.plotAndSaveMeasurementTimesCharts = function (pathToMeasurementsPng) {
        var _this = this;
        Benchmark.generatorFunctions.forEach(function (fn) {
            var timeSeriesAndStringLengths = _this.getFunctionTimeSeriesAndStringLengths(fn);
            var generatedStringLength = timeSeriesAndStringLengths.stringLengths;
            var timeToGeneration = timeSeriesAndStringLengths.timeSeries;
            for (var i = 0; i < 99; i++) {
                var start = perf_hooks_1.performance.now();
                fn(i);
                var end = perf_hooks_1.performance.now();
                var duration = end - start;
                generatedStringLength.push(i);
                timeToGeneration.push(duration);
            }
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
                labels: generatedStringLength.map(String),
                datasets: [
                    {
                        label: 'Line generation time vs length graph',
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
            var buffer = canvas.toBuffer('image/png');
            if (!fs.existsSync("".concat(pathToMeasurementsPng !== null && pathToMeasurementsPng !== void 0 ? pathToMeasurementsPng : './measurements'))) {
                fs.mkdirSync("".concat(pathToMeasurementsPng !== null && pathToMeasurementsPng !== void 0 ? pathToMeasurementsPng : './measurements'));
            }
            fs.writeFileSync("".concat(pathToMeasurementsPng !== null && pathToMeasurementsPng !== void 0 ? pathToMeasurementsPng : './measurements', "/").concat(fn.name, ".png"), buffer);
        });
    };
    Benchmark.printAvgGenerationTimes = function (precision) {
        var _this = this;
        Benchmark.generatorFunctions.forEach(function (fn) {
            var timeToGeneration = _this.getFunctionTimeSeriesAndStringLengths(fn).timeSeries;
            var sumOfTimesToGeneration = timeToGeneration.reduce(function (acc, time) { return acc + time; }, 0);
            var avgGenerationTime = sumOfTimesToGeneration / timeToGeneration.length;
            console.log("Average generation time for function ".concat(fn.name, " = ").concat(precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime, " ms"));
        });
    };
    Benchmark.printPerformanceLevels = function () {
        var _this = this;
        var avgGenerationTimes = [];
        Benchmark.generatorFunctions.forEach(function (fn) {
            var timeToGeneration = _this.getFunctionTimeSeriesAndStringLengths(fn).timeSeries;
            var sumOfTimesToGeneration = timeToGeneration.reduce(function (acc, time) { return acc + time; }, 0);
            avgGenerationTimes.push(sumOfTimesToGeneration / timeToGeneration.length);
        });
        var minValue = Math.min.apply(Math, __spreadArray([], __read(avgGenerationTimes), false));
        var performanceLevels = avgGenerationTimes.map(function (avgGenerationTime) {
            var percentageExceedingMinGenerationTime = avgGenerationTime / minValue;
            if (percentageExceedingMinGenerationTime === 1) {
                return 'high';
            }
            else if (percentageExceedingMinGenerationTime > 1 && percentageExceedingMinGenerationTime < 2) {
                return 'middle';
            }
            else {
                return 'low';
            }
        });
        for (var index = 0; index < performanceLevels.length; index++) {
            console.log("Performance level for function ".concat(Benchmark.generatorFunctions[index].name, " -- ").concat(performanceLevels[index]));
        }
    };
    Benchmark.getFunctionTimeSeriesAndStringLengths = function (fn) {
        var generatedStringLength = [];
        var timeToGeneration = [];
        for (var i = 0; i < 99; i++) {
            var start = perf_hooks_1.performance.now();
            fn(i);
            var end = perf_hooks_1.performance.now();
            var duration = end - start;
            generatedStringLength.push(i);
            timeToGeneration.push(duration);
        }
        return {
            timeSeries: timeToGeneration,
            stringLengths: generatedStringLength,
        };
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
    return Benchmark;
}());
exports.Benchmark = Benchmark;
