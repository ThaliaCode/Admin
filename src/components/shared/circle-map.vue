<template>
	<div class="content-center">
		<v-tooltip top>
			<div slot="activator">
				<button :style="getStyles" class="circle">
					{{ total }}
				</button>
				<span :style="getLabelColor">{{ getText }}</span>
			</div>
			<span>{{ getLabelText }}</span>
		</v-tooltip>
	</div>
</template>

<script>
function getLabelColor() {
	const colorSelected = this.colors.find((c) => c.id === this.itemId);
	const color = `color: ${colorSelected ? colorSelected.labelColor : '#FFF'};`;
	return `${color}`;
}

function getColor() {
	const colorSelected = this.colors.find((c) => c.id === this.itemId);
	const color = `color: ${colorSelected ? colorSelected.color : '#DDA300'};`;
	return `${color}`;
}

function getStyles() {
	const colorSelected = this.colors.find((c) => c.id === this.itemId);
	const background = `background-color: ${
		colorSelected ? colorSelected.background : '#FFF'
	};`;
	const border = `border: 2px solid ${
		colorSelected && colorSelected.id !== 0 ? colorSelected.color : '#085D63'
	};`;
	return `${background} ${this.getColor} ${border}`;
}

function getText() {
	const colorSelected = this.colors.find((c) => c.id === this.itemId);
	return colorSelected ? colorSelected.text : '';
}

function getLabelText() {
	const colorSelected = this.colors.find((c) => c.id === this.itemId);
	return colorSelected ? colorSelected.label : 'Todos';
}

function data() {
	return {
		colors: [
			{
				id: 0,
				background: '#085D63',
				color: '#FFF',
				labelColor: 'color(primary)',
				text: 'Total',
				label: 'Total',
			},
			{
				id: 1,
				color: '#DDA300',
				labelColor: '#DDA300',
				background: '#FFFFFF',
				text: 'S',
				label: 'Solicitado',
			},
			{
				id: 2,
				color: '#4690F7',
				labelColor: '#4690F7',
				background: '#FFFFFF',
				text: 'EC',
				label: 'En camino',
			},
			{
				id: 3,
				color: 'color(primary)',
				labelColor: 'color(primary)',
				background: '#FFFFFF',
				text: 'E',
				label: 'Entregado',
			},
			{
				id: 4,
				color: '#F40029',
				labelColor: '#F40029',
				background: '#FFFFFF',
				text: 'C',
				label: 'Cancelado',
			},
			{
				id: 5,
				color: '#085D63',
				labelColor: '#085D63',
				background: '#FFFFFF',
				text: 'C',
				label: 'Confirmado',
			},
			{
				id: 6,
				color: 'color(success)',
				labelColor: 'color(success)',
				background: '#FFFFFF',
				text: 'LR',
				label: 'Listo para recoger',
			},
			{
				id: 7,
				color: '#DDA300',
				labelColor: '#DDA300',
				background: '#FFFFFF',
				text: 'A',
				label: 'Asignado',
			},
		],
	};
}

export default {
	name: 'circle-map',
	data,
	computed: {
		getStyles,
		getText,
		getColor,
		getLabelColor,
		getLabelText,
	},
	props: {
		itemId: {
			type: Number,
			default: 0,
		},
		total: {
			type: Number,
			default: 0,
		},
		label: {
			type: String,
			default: 'Total',
		},
	},
};
</script>

<style lang="scss" scoped>
.circle {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 15px;
	font-weight: bold;
	text-align: center;
	margin: 0 auto;
	border: 1px solid #dda300;
	margin-bottom: 5px;
}
.content-center {
	display: inline-block;
	justify-content: center;
	align-items: center;
	text-align: center;
	margin-left: 4px;
	margin-right: 4px;
}
</style>
