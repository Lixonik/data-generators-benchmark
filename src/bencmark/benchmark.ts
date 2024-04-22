import { performance } from 'perf_hooks'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { PathLike } from 'fs'
import { ComparedResult } from './types'
import { getFunctionName } from './utils'
import { Canvas, createCanvas } from 'canvas'
import { ChartConfiguration, ChartData, ChartItem } from 'chart.js'
import { Chart } from 'chart.js/auto'

export class Benchmark {
    private static generatorFunctions: Function[] = []

    static pushCandidate = (...candidates: Function[]) => {
        Benchmark.generatorFunctions.push(...candidates)
    }

    static removeCandidate = (...candidates: Function[]) => {
        Benchmark.generatorFunctions = Benchmark.generatorFunctions.filter(fn => !candidates.includes(fn))
    }

    static clearCandidates = () => {
        Benchmark.generatorFunctions = []
    }

    static plotAndSaveMeasurementTimesCharts(pathToMeasurementsPng?: PathLike) {
        pathToMeasurementsPng ??= './measurements'

        const timesToGeneration: number[][] = []
        let loopNumbers: number[] = []

        Benchmark.generatorFunctions.forEach((fn) => {
            const comparedResult = this.getFunctionTimeSeriesAndLoopIndices(fn)

            const { timeToGeneration, loopIndices, measurementHash } = comparedResult

            timesToGeneration.push(timeToGeneration)
            loopNumbers = loopIndices

        })
        const canvas = Benchmark.generateGraph(loopNumbers, timesToGeneration)
        const buffer = canvas.toBuffer('image/png')

        if (!existsSync(pathToMeasurementsPng)) {
            mkdirSync(pathToMeasurementsPng)
        }

        writeFileSync(`${pathToMeasurementsPng}/measurements.png`, buffer)
    }

    static printAvgGenerationTimes(precision?: number) {
        Benchmark.generatorFunctions.forEach((fn) => {
            const functionName = getFunctionName(fn)
            const { timeToGeneration, measurementHash } = this.getFunctionTimeSeriesAndLoopIndices(fn)

            const sumOfTimesToGeneration = timeToGeneration.reduce((acc, time) => acc + time, 0)

            const avgGenerationTime: number = sumOfTimesToGeneration / timeToGeneration.length

            console.log('Measurement hash = ', measurementHash)
            console.log(`Average generation time for function ${functionName} = ${precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime
            } ms`)
        })
    }

    static printPerformanceLevels() {
        const avgGenerationTimes: number[] = []
        const measurementHashes: number[] = []

        Benchmark.generatorFunctions.forEach((fn) => {
            const { timeToGeneration, measurementHash } = this.getFunctionTimeSeriesAndLoopIndices(fn)

            const sumOfTimesToGeneration = timeToGeneration.reduce((acc, time) => acc + time, 0)

            avgGenerationTimes.push(sumOfTimesToGeneration / timeToGeneration.length)
            measurementHashes.push(measurementHash)
        })

        const minValue: number = Math.min(...avgGenerationTimes)

        const performanceLevels: string[] = avgGenerationTimes.map(avgGenerationTime => {
            const percentageExceedingMinGenerationTime = avgGenerationTime / minValue

            if (percentageExceedingMinGenerationTime === 1) {
                return 'high'
            } else if (percentageExceedingMinGenerationTime > 1 && percentageExceedingMinGenerationTime < 2) {
                return 'middle'
            } else {
                return 'low'
            }
        })

        for (let index = 0; index < performanceLevels.length; index++) {
            const functionName = getFunctionName(Benchmark.generatorFunctions[index])
            console.log('Measurement hash = ', measurementHashes[index])
            console.log(`Performance level for function ${functionName} -- ${performanceLevels[index]}`)
        }
    }

    private static getFunctionTimeSeriesAndLoopIndices(fn: Function, loopCount: 100 | 1000 | 5000 | 10_000 = 100): ComparedResult {
        const loopIndices: number[] = []
        const timeToGeneration: number[] = []
        let measurementHash = 0

        for (let i = -1; i < loopCount; i++) {
            measurementHash += Math.random()
            const start = performance.now()
            fn()
            const end = performance.now()
            const duration = end - start

            loopIndices.push(i)
            timeToGeneration.push(duration)
        }

        loopIndices.shift()
        timeToGeneration.shift()

        return {
            measurementHash,
            timeToGeneration,
            loopIndices,
        }
    }

    private static generateGraph = (loopIndices: number[], timeToGeneration: number[][]): Canvas => {
        const width = 1200, height = 800
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d') as unknown as ChartItem
        const plugin = {
            id: 'customCanvasBackgroundImage',
            beforeDraw: (chart: Chart) => {
                const ctx = chart.ctx
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            },
        }

        const generateRandomColor = () => {
            const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
            const r = randomBetween(0, 255)
            const g = randomBetween(0, 255)
            const b = randomBetween(0, 255)

            return `rgb(${r},${g},${b})`
        }

        const data: ChartData = {
            labels: loopIndices.map(String),
            datasets:
                timeToGeneration.map(((time, index) => {
                    return {
                        label: Benchmark.getFunctionName(index),
                        data: time,
                        borderColor: generateRandomColor(),
                        borderWidth: 2,
                        fill: false,
                    }
                })),
        }
        const config: ChartConfiguration = {
            type: 'line',
            data: data,
            plugins: [plugin],
        }
        new Chart(ctx, config)
        return canvas
    }

    private static getFunctionName(index: number) {
        return getFunctionName(Benchmark.generatorFunctions[index])
    }
}
