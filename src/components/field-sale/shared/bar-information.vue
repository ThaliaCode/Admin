<template>
	<v-layout justify-space-between align-center>
		<v-flex
			class="block-info"
			:style="`border-right-color: ${borderColor}`"
			text-xs-center
			v-for="info in information"
			:key="info.id"
		>
			<template v-if="info.label">
				<span
					v-if="labelImg"
					:class="{ 'span-block': !rowStyle || info.rowStyle }">
					<img :src="info.label" alt="" height="13" />
				</span>
				<span
					v-else
					:class="{ 'span-block': !rowStyle || info.rowStyle, 'span-color': labelColor && !info.rowStyle }">
					{{ info.label }}
				</span>
				<span v-if="showColon">:</span>
				<span :class="{ 'span-block span-value': !rowStyle || info.rowStyle, 'span-small': labelImg,
					'span-color': labelColor && info.rowStyle }">
					{{ info.value === 'undefined' || info.value === 'undefined km2' ? '---' : info.value }}
				</span>
			</template>
			<template v-else>
				<span :class="{ 'span-block span-value': !rowStyle ||
					info.rowStyle, 'span-color': labelColor && info.rowStyle }">
					{{ info.value === 'undefined' || info.value === 'undefined km2' ? '---' : info.value }}
				</span>
			</template>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'bar-information',
		props: {
			borderColor: String,
			information: {
				default: () => [],
				type: Array,
			},
			labelColor: {
				default: false,
				type: Boolean,
			},
			labelImg: {
				default: false,
				type: Boolean,
			},
			rowStyle: {
				default: true,
				type: Boolean,
			},
			showColon: {
				default: true,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.block-info {
		border-right-color: color(background-card-black);
		border-right-style: solid;
		border-right-width: 1px;
		color: color(paginationText);
		font-family: font(lato-regular);
		font-size: size(small13);

		&:last-child {
			border-right: 0px;
		}
	}
	
	.span-block {
		display: block;
		font-size: size(small10);

		&.span-value {
			font-size: size(small);
		}
	}

	.span-color {
		color: color(background-sidebar);
		font-family: font(open-semibold);
		font-size: size(medium);

		& + span {
			font-size: size(small);
		}
	}

	.span-small {
		font-size: size(small11);
		padding-left: 5px;
	}
</style>