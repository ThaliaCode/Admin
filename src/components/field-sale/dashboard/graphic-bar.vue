<template>
	<v-flex xs12>
		<g-chart
			type="ColumnChart"
			:create-chart="(el, google) => new google.charts.Bar(el)"
			:data="chartData"
			:options="chartOptions"
			:settings="{ packages: ['bar'] }"
			@ready="onChartReady"
		/>
	</v-flex>
</template>

<script>
import { GChart } from 'vue-google-charts';

function chartOptions() {
	if (!this.chartsLib) {
		return null;
	}
	return this.chartsLib.charts.Bar.convertOptions({
		colors: ['color(primary)', '#d5331a'],
		height: 280,
		width: 535.5,
	});
}

function onChartReady(chart, google) {
	this.chartsLib = google;
}

function data() {
	return {
		chartsLib: null,
		chartData: [
			['Vendedores', '', ''],
			['V 1', 65000, '#ffffff'],
			['V 2', -10000, '#ffffff'],
			['V 3', 25000, '#ffffff'],
			['V 4', 10000, '#ffffff'],
			['V 5', 15000, '#ffffff'],
			['V 6', 55000, '#ffffff'],
			['V 7', -18000, '#ffffff'],
			['V 8', 45000, '#ffffff'],
			['V 9', -8000, '#ffffff'],
			['V 10', 30000, '#ffffff'],
			['V 11', 18000, '#ffffff'],
			['V 12', 43000, '#ffffff'],
		],
	};
}

export default {
	name: 'graphic-bar',
	components: {
		GChart,
	},
	computed: {
		chartOptions,
	},
	data,
	methods: {
		onChartReady,
	},
};
</script>

<style lang="scss" scoped></style>
