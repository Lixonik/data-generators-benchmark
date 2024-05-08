"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOpsPerSecond = exports.getFunctionName = void 0;
var getFunctionName = function (fn) { var _a; return (_a = fn.name.split(' ').at(-1)) !== null && _a !== void 0 ? _a : 'fn'; };
exports.getFunctionName = getFunctionName;
var calculateOpsPerSecond = function (time) { return (time > 0) ? (1 / (time / 1000)) : 0; };
exports.calculateOpsPerSecond = calculateOpsPerSecond;
