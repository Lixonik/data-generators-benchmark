import { performance } from 'perf_hooks'
import { Chart } from 'chart.js';
import * as fs from 'fs';
import { createCanvas } from 'canvas';

export class Benchmark {
    static generatorFunctions: Function[] = []

    static pushCandidate = (candidate: Function) => {
        Benchmark.generatorFunctions.push(candidate)
    }

    static measureTime() {


        Benchmark.generatorFunctions.forEach(fn => {

            const x: number[] = []
            const y: number[] = []

            for (let i = 0; i < 999; i++) {
                const start = performance.now()
                fn(i)
                const end = performance.now()
                const duration = end - start

                x.push(i)
                y.push(duration)

                // Создайте элемент canvas в памяти с помощью jsdom
                const canvas = createCanvas(800, 600);
                const ctx = canvas.getContext('2d');

                // Настройки графика
                const chartConfig = {
                    type: 'line',
                    data: {
                        labels: x.map(String),
                        datasets: [{
                            label: 'График зависимости y от x',
                            data: y,
                            borderColor: 'blue',
                            borderWidth: 2,
                            fill: false,
                        }],
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: 'Значения x',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Значения y',
                                },
                            },
                        },
                    },
                };

                // Создайте график на основе настроек
                //@ts-ignore
                const chart = new Chart(ctx, chartConfig);

                // Сохраните график в файл .png
                const fileName = 'plot.png';
                const out = fs.createWriteStream(fileName);
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                out.on('finish', () => console.log(`График сохранен в файл: ${fileName}`));

                //console.log(`Время выполнения функции ${fn.name}: ${duration} миллисекунд, result = ${result}`)

                // fs.writeFileSync(path.join(process.cwd(), `/measurements/strings/${fn.name}.txt`), `${i} ${duration}\n`, { flag: 'a+' })
            }
        })
    }

}