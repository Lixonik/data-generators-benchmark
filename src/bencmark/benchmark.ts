import { performance } from 'perf_hooks'
import { ChartConfiguration, ChartData, ChartItem } from 'chart.js'
import { Chart } from 'chart.js/auto'
import * as fs from 'fs'
import { PathLike } from 'fs'
import { createCanvas } from 'canvas'

export class Benchmark {
    static generatorFunctions: Function[] = []

    static pushCandidate = (...candidates: Function[]) => {
        Benchmark.generatorFunctions.push(...candidates)
    }

    static measureTime(pathToMeasurementsPng?: PathLike) {
        Benchmark.generatorFunctions.forEach((fn) => {
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
}
