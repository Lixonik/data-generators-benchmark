/// <reference types="node" />
import { PathLike } from 'fs';
export declare class Benchmark {
    private static generatorFunctions;
    static pushCandidate: (...candidates: Function[]) => void;
    static removeCandidate: (...candidates: Function[]) => void;
    static clearCandidates: () => void;
    static plotAndSaveMeasurementTimesCharts(pathToMeasurementsPng?: PathLike): void;
    static saveMeasurementTimesSeries(pathToMeasurements?: PathLike): void;
    static printAvgGenerationTimes(precision?: number): void;
    private static getFunctionTimeSeriesAndIterationIndices;
    private static generateGraph;
    private static getFunctionName;
}
