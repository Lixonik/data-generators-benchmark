import { performance } from 'perf_hooks'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { PathLike } from 'fs'
import { ComparedResult } from './types'
import { calculateOpsPerSecond, getFunctionName } from './utils'
import { Canvas, createCanvas } from 'canvas'
import { ChartConfiguration, ChartData, ChartItem, ScriptableLineSegmentContext } from 'chart.js'
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
        let iterationNumbers: number[] = []

        Benchmark.generatorFunctions.forEach((fn) => {
            const comparedResult = this.getFunctionTimeSeriesAndIterationIndices(fn)

            const { timeToGeneration, iterationIndices, measurementHash } = comparedResult

            timesToGeneration.push(timeToGeneration)
            iterationNumbers = iterationIndices

        })
        const canvas = Benchmark.generateGraph(iterationNumbers, timesToGeneration)
        const buffer = canvas.toBuffer('image/png')

        if (!existsSync(pathToMeasurementsPng)) {
            mkdirSync(pathToMeasurementsPng)
        }

        writeFileSync(`${pathToMeasurementsPng}/${getFunctionName(Benchmark.generatorFunctions[0])}.png`, buffer)
    }

    static saveMeasurementTimesSeries(pathToMeasurements?: PathLike) {
        pathToMeasurements ??= './time_series'

        let opsPerSecond = ''
        let dataBuffer = ''

        if (!existsSync(pathToMeasurements)) {
            mkdirSync(pathToMeasurements)
        }

        Benchmark.generatorFunctions.forEach((fn) => {
            const comparedResult = this.getFunctionTimeSeriesAndIterationIndices(fn)

            const { timeToGeneration, iterationIndices, measurementHash } = comparedResult

            opsPerSecond = timeToGeneration.map(calculateOpsPerSecond).join(', ')
            dataBuffer += `${getFunctionName(fn)}\n${opsPerSecond}\n`

        })
        writeFileSync(`${pathToMeasurements}/${getFunctionName(Benchmark.generatorFunctions[0])}.txt`, dataBuffer, { flag: 'w+' })
    }

    static printAvgGenerationTimes(precision?: number) {
        Benchmark.generatorFunctions.forEach((fn) => {
            const functionName = getFunctionName(fn)
            const { timeToGeneration, measurementHash } = this.getFunctionTimeSeriesAndIterationIndices(fn)

            const sumOfTimesToGeneration = timeToGeneration.reduce((acc, time) => acc + time, 0)

            const avgGenerationTime: number = sumOfTimesToGeneration / timeToGeneration.length

            console.log('Measurement hash = ', measurementHash)
            console.log(`Average generation time for function ${functionName} = ${precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime
            } ms`)
        })

        console.log('\n')
    }

    private static getFunctionTimeSeriesAndIterationIndices(fn: Function, iterationCount: 100 | 1000 | 5000 | 10_000 = 100): ComparedResult {
        const iterationIndices: number[] = []
        const timeToGeneration: number[] = []
        let measurementHash = 0

        for (let i = -1; i < iterationCount; i++) {
            measurementHash += Math.random()
            const start = performance.now()
            fn()
            const end = performance.now()
            const duration = end - start

            iterationIndices.push(i)
            timeToGeneration.push(duration)
        }

        iterationIndices.shift()
        timeToGeneration.shift()

        return {
            measurementHash,
            timeToGeneration,
            iterationIndices,
        }
    }

    private static generateGraph = (iterationIndices: number[], timeToGeneration: number[][]): Canvas => {
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

        const getCandidateColor = (index: number) => {
            if (index === 0) {
                return `rgb(0, 0, 255)`
            } else if (index === 1) {
                return `rgb(255, 0, 0)`
            }

            const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
            const r = randomBetween(0, 255)
            const g = randomBetween(0, 255)
            const b = randomBetween(0, 255)

            return `rgb(${r}, ${g}, ${b})`
        }

        const data: ChartData = {
            labels: iterationIndices.map(String),
            datasets:
                timeToGeneration.map(((time, index) => {
                    return {
                        label: Benchmark.getFunctionName(index),
                        data: time.map(calculateOpsPerSecond),
                        borderColor: getCandidateColor(index),
                        borderWidth: 2,
                        fill: false,
                        borderDash: index % 2 ? [10, 10] : [],
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
