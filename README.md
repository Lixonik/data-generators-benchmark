# data-generators-benchmark
## A robust benchmarking library that supports high-resolution timers & returns statistically significant results.

### Documentation
The `Benchmark` class provides a means for benchmarking data generation functions. It measures the execution time of functions for various input data, plots generation time versus string length, and stores the results in images.

The functionality of the class is implemented using the following static methods available to the user:
1. `pushCandidate(...candidates: Function[]): void` -- method for adding candidate functions to the array of generator functions. Generator functions represent functions whose execution time will be measured and analyzed.
2. `removeCandidate(...candidates: Function[]): void` -- method for removing candidates functions from the array of generator functions.
3. `clearCandidate(): void` -- method for clearing all candidate functions from the array of generator functions.
4. `plotAndSaveMeasurementTimesCharts(pathToMeasurementsPng?: PathLike): void` -- the method builds and saves graphs of generation time versus string length for all added generator functions. The results are saved as PNG images. The path for saving images can be specified with the optional parameter `pathToMeasurementsPng`. If the path is not specified, the images are saved in the './measurements' directory.
5. `printAvgGenerationTimes(precision?: number): void` - the method prints to the console the average generation time for each generator function. The `precision` parameter is optional and specifies the number of decimal places to display the time in milliseconds. If `precision` is not specified, the full time value is printed.
6. `printPerformanceLevels(): void` - the method prints the performance level for each generator function to the console. The performance level is determined by comparing the average generation time with the minimum value among all generator functions. The "high" level is assigned to functions whose average generation time is equal to the minimum, the "middle" level is assigned to functions whose ratio of the minimum time to the function generation time is in the range from 1 to 2, the "low" level is assigned to functions for which this ratio is significant greater than or equal to 2.

### Installation
Via npm:
```shell
npm i --save data-generators-benchmark
```
In Node.js:
```ts
import Benchmark from 'data-generators-benchmark'
```

Usage example:
```ts
import { faker } from '@faker-js/faker'
import Benchmark from '../src/index'
import { randomString } from 'zufall'

const fakerGeneratorString = (arg: number) => faker.string.alpha(arg)

const zufallGeneratorString = (arg: number) => randomString(arg)

// Pushing generator functions to the benchmark
Benchmark.pushCandidate(fakerGeneratorString)
Benchmark.pushCandidate(zufallGeneratorString)
    
// Plotting performance charts
Benchmark.plotAndSaveMeasurementTimesCharts()

// Output of average generation time with a precision of two decimal places
Benchmark.printAvgGenerationTimes(2)
    
// // Output of perfomance levels for generator functions
Benchmark.printPerformanceLevels()
```