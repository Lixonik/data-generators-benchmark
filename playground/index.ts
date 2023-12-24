import { faker } from '@faker-js/faker'
import Benchmark from '../src/index'
import { randomString } from 'zufall'

const fakerGeneratorString = (arg: number) => faker.string.alpha(arg)

const zufallGeneratorString = (arg: number) => randomString(arg)

Benchmark.pushCandidate(fakerGeneratorString)
Benchmark.pushCandidate(zufallGeneratorString)

Benchmark.plotAndSaveMeasurementTimesCharts()

Benchmark.printAvgGenerationTimes(2)

Benchmark.printPerformanceLevels()