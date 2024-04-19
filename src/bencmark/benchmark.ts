import { performance } from 'perf_hooks'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { PathLike } from 'fs'
import { ComparedResult } from './types'
import { generateGraph, getFunctionName } from './utils'

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

		Benchmark.generatorFunctions.forEach((fn) => {
			const functionName = getFunctionName(fn)
			const comparedResult = this.getFunctionTimeSeriesAndLoopIndices(fn)

			const { timeToGeneration, loopIndices, measurementHash } = comparedResult

			const canvas = generateGraph(loopIndices, timeToGeneration)
			const buffer = canvas.toBuffer('image/png')

			if (!existsSync(pathToMeasurementsPng)) {
				mkdirSync(pathToMeasurementsPng)
			}

			writeFileSync(`${pathToMeasurementsPng}/${functionName}_${measurementHash}.png`, buffer)
		})
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
}
