import { Canvas, createCanvas } from 'canvas'
import { ChartConfiguration, ChartData, ChartItem } from 'chart.js'
import { Chart } from 'chart.js/auto'

export const generateGraph = (loopIndices: number[], timeToGeneration: number[]): Canvas => {
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
		labels: loopIndices.map(String),
		datasets: [
			{
				label: 'Generation time vs Loop index graph',
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
	return canvas
}

export const getFunctionName = (fn: Function): string => fn.name.split(' ').at(-1) ?? 'fn'