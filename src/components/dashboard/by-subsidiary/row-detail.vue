<template>
	<v-layout wrap class="row-detail my-1">
		<v-flex
			xs6 text-xs-right pr-2
			class="row-detail-label"
			:style="`background-color: ${background}`"
		>
			<template v-if="tooltip">
				<v-tooltip top>
					<span slot="activator">{{ label }}:</span>
					<span>{{ tooltip }}</span>
				</v-tooltip>
			</template>
			<template v-else>
				{{ label }}:
			</template>
		</v-flex>
		<v-flex
			xs6 text-xs-left pl-2
			class="row-detail-value"
			:style="`border: 1px solid ${background}`"
		>
			<span>{{ value }}</span>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'row-detail',
		props: {
			background: {
				default: '#3280dc',
				type: String,
			},
			label: String,
			tooltip: String,
			value: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.row-detail {
		border-radius: 3px;
		color: color(white);
		font-family: font(open-semibold);
		font-size: size(small11);
	}

	.row-detail-label {
		border-bottom-left-radius: 3px;
		border-top-left-radius: 3px;
	}

	.row-detail-value {
		align-items: center;
		border-bottom-right-radius: 3px;
		border-top-right-radius: 3px;
		display: flex;
	}
</style>