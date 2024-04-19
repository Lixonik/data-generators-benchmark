/// <reference types="node" />
import { PathLike } from 'fs';
export declare class Benchmark {
    private static generatorFunctions;
    static pushCandidate: (...candidates: Function[]) => void;
    static plotAndSaveMeasurementTimesCharts(pathToMeasurementsPng?: PathLike): void;
    static printAvgGenerationTimes(precision?: number): void;
    static printPerformanceLevels(): void;
    private static getFunctionTimeSeriesAndStringLengths;
}
