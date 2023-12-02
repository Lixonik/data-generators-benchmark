import { performance } from 'perf_hooks'
import * as fs from 'fs'
import path from 'path'

export class Benchmark {
    static generatorFunctions: Function[] = []

    static pushCandidate = (candidate: Function) => {
        Benchmark.generatorFunctions.push(candidate)
    }

    static measureTime() {
        Benchmark.generatorFunctions.forEach(fn => {

            for (let i = 0; i < 999; i++) {
                const start = performance.now()
                fn(i)
                const end = performance.now()
                const duration = end - start

                //console.log(`Время выполнения функции ${fn.name}: ${duration} миллисекунд, result = ${result}`)

                fs.writeFileSync(path.join(process.cwd(), `/measurements/strings/${fn.name}.txt`), `${i} ${duration}\n`, { flag: 'a+' })
            }
        })
    }

}