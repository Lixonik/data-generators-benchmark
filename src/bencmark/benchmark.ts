import { performance } from 'perf_hooks'
import { ChartConfiguration, ChartData, ChartItem } from 'chart.js'
import { Chart } from 'chart.js/auto'
import * as fs from 'fs'
import { PathLike } from 'fs'
import { createCanvas } from 'canvas'
import { TimeSeriesAndStringLengths } from './types'


export class Benchmark {
    private static generatorFunctions: Function[] = []

    static pushCandidate = (...candidates: Function[]) => {
        Benchmark.generatorFunctions.push(...candidates)
    }

    static plotAndSaveMeasurementTimesCharts(pathToMeasurementsPng?: PathLike) {
        Benchmark.generatorFunctions.forEach((fn) => {
            const timeSeriesAndStringLengths = this.getFunctionTimeSeriesAndStringLengths(fn)

            const generatedStringLength: number[] = timeSeriesAndStringLengths.stringLengths
            const timeToGeneration: number[] = timeSeriesAndStringLengths.timeSeries

            for (let i = 0; i < 99; i++) {
                const start = performance.now()
                fn(i)
                const end = performance.now()
                const duration = end - start

                generatedStringLength.push(i)
                timeToGeneration.push(duration)
            }

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
            const data: ChartData = {
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
            }
            const config: ChartConfiguration = {
                type: 'line',
                data: data,
                plugins: [plugin],
            }
            new Chart(ctx, config)
            const buffer = canvas.toBuffer('image/png')

            if (!fs.existsSync(`${pathToMeasurementsPng ?? './measurements'}`)) {
                fs.mkdirSync(`${pathToMeasurementsPng ?? './measurements'}`)
            }

            fs.writeFileSync(`${pathToMeasurementsPng ?? './measurements'}/${fn.name}.png`, buffer)
        })
    }

    static printAvgGenerationTimes(precision?: number) {
        Benchmark.generatorFunctions.forEach((fn) => {
            const timeToGeneration = this.getFunctionTimeSeriesAndStringLengths(fn).timeSeries

            const sumOfTimesToGeneration = timeToGeneration.reduce((acc, time) => acc + time, 0)

            const avgGenerationTime: number = sumOfTimesToGeneration / timeToGeneration.length

            console.log(`Average generation time for function ${fn.name} = ${precision
                ? avgGenerationTime.toFixed(precision)
                : avgGenerationTime
            } ms`)
        })
    }

    static printPerformanceLevels() {
        const avgGenerationTimes: number[] = []

        Benchmark.generatorFunctions.forEach((fn) => {
            const timeToGeneration = this.getFunctionTimeSeriesAndStringLengths(fn).timeSeries

            const sumOfTimesToGeneration = timeToGeneration.reduce((acc, time) => acc + time, 0)

            avgGenerationTimes.push(sumOfTimesToGeneration / timeToGeneration.length)
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
            console.log(`Performance level for function ${Benchmark.generatorFunctions[index].name} -- ${performanceLevels[index]}`)
        }
    }

    private static getFunctionTimeSeriesAndStringLengths(fn: Function): TimeSeriesAndStringLengths {
        const generatedStringLength: number[] = []
        const timeToGeneration: number[] = []

        for (let i = 0; i < 99; i++) {
            const start = performance.now()
            fn(i)
            const end = performance.now()
            const duration = end - start

            generatedStringLength.push(i)
            timeToGeneration.push(duration)
        }
        return {
            timeSeries: timeToGeneration,
            stringLengths: generatedStringLength,
        }
    }
}
