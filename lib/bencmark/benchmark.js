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
var Benchmark = /** @class */ (function () {
    function Benchmark() {
    }
    Benchmark.plotAndSaveMeasurementTimesCharts = function (pathToMeasurementsPng) {
        var _this = this;
        pathToMeasurementsPng !== null && pathToMeasurementsPng !== void 0 ? pathToMeasurementsPng : (pathToMeasurementsPng = './measurements');
        Benchmark.generatorFunctions.forEach(function (fn) {
            var functionName = (0, utils_1.getFunctionName)(fn);
            var comparedResult = _this.getFunctionTimeSeriesAndLoopIndices(fn);
            var timeToGeneration = comparedResult.timeToGeneration, loopIndices = comparedResult.loopIndices, measurementHash = comparedResult.measurementHash;
            var canvas = (0, utils_1.generateGraph)(loopIndices, timeToGeneration);
            var buffer = canvas.toBuffer('image/png');
            if (!(0, fs_1.existsSync)(pathToMeasurementsPng)) {
                (0, fs_1.mkdirSync)(pathToMeasurementsPng);
            }
            (0, fs_1.writeFileSync)("".concat(pathToMeasurementsPng, "/").concat(functionName, "_").concat(measurementHash, ".png"), buffer);
        });
    };
    Benchmark.printAvgGenerationTimes = function (precision) {
        var _this = this;
        Benchmark.generatorFunctions.forEach(function (fn) {
            var functionName = (0, utils_1.getFunctionName)(fn);
            var _a = _this.getFunctionTimeSeriesAndLoopIndices(fn), timeToGeneration = _a.timeToGeneration, measurementHash = _a.measurementHash;
            var sumOfTimesToGeneration = timeToGeneration.reduce(function (acc, time) { return acc + time; }, 0);
            var avgGenerationTime = sumOfTimesToGeneration / timeToGeneration.length;
            console.log('Measurement hash = ', measurementHash);
            console.log("Average generation time for function ".concat(functionName, " = ").concat(precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime, " ms"));
        });
    };
    Benchmark.printPerformanceLevels = function () {
        var _this = this;
        var avgGenerationTimes = [];
        var measurementHashes = [];
        Benchmark.generatorFunctions.forEach(function (fn) {
            var _a = _this.getFunctionTimeSeriesAndLoopIndices(fn), timeToGeneration = _a.timeToGeneration, measurementHash = _a.measurementHash;
            var sumOfTimesToGeneration = timeToGeneration.reduce(function (acc, time) { return acc + time; }, 0);
            avgGenerationTimes.push(sumOfTimesToGeneration / timeToGeneration.length);
            measurementHashes.push(measurementHash);
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
            var functionName = (0, utils_1.getFunctionName)(Benchmark.generatorFunctions[index]);
            console.log('Measurement hash = ', measurementHashes[index]);
            console.log("Performance level for function ".concat(functionName, " -- ").concat(performanceLevels[index]));
        }
    };
    Benchmark.getFunctionTimeSeriesAndLoopIndices = function (fn, loopCount) {
        if (loopCount === void 0) { loopCount = 100; }
        var loopIndices = [];
        var timeToGeneration = [];
        var measurementHash = 0;
        for (var i = -1; i < loopCount; i++) {
            measurementHash += Math.random();
            var start = perf_hooks_1.performance.now();
            fn();
            var end = perf_hooks_1.performance.now();
            var duration = end - start;
            loopIndices.push(i);
            timeToGeneration.push(duration);
        }
        loopIndices.shift();
        timeToGeneration.shift();
        return {
            measurementHash: measurementHash,
            timeToGeneration: timeToGeneration,
            loopIndices: loopIndices,
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
    return Benchmark;
}());
exports.Benchmark = Benchmark;
