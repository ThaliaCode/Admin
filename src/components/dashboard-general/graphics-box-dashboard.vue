<template>
	<v-layout row wrap align-start class="graphics-box">
		<v-flex xs12 class="graphics-header">
			<v-layout row wrap align-center>
				<v-flex xs10>
					<span class="graphics-header-title">{{ title }}</span>
					<template v-if="showDropDownValue">
						<app-tooltip-button
							color="secondary"
							get-mouse-event
							icon="arrow_drop_down"
							text="Selecciona otro gráfico"
							@click-icon="showOptions"
						></app-tooltip-button>
						<v-menu
							v-model="showDropDown"
							content-class="dashboard-report-menu"
							:position-x="x"
							:position-y="y"
							absolute
							nudge-left="150"
							offset-y
						>
							<v-list>
								<template v-for="option in dropDownOptions">
									<v-list-tile
										v-if="!option.selected"
										:key="option.key"
										@click="$emit('change-graphic')"
									>
										<v-list-tile-title>{{ option.name }}</v-list-tile-title>
									</v-list-tile>
								</template>
							</v-list>
						</v-menu>
					</template>
				</v-flex>
				<v-flex xs2 text-xs-right>
					<v-btn
						@click="$emit('download-excel')"
						class="btn-auto btn-excel-graphics ma-0"
					>
						<img src="/static/img/excel.svg" alt="download" height="20" />
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex
			xs12
			class="graphics-body"
			:class="[pie ? 'px-0' : '', line ? 'py-2' : '']"
		>
			<template v-if="circle">
				<div class="d-flex flex-row align-center">
					<div>
						<vc-donut
							:background="graphicOptions.background"
							:foreground="graphicOptions.foreground"
							:size="graphicOptions.size"
							:unit="graphicOptions.unit"
							:thickness="graphicOptions.thickness"
							:has-legend="graphicOptions.hasLegend"
							:legend-placement="graphicOptions.legendPlacement"
							:sections="graphicOptions.sections"
							:total="graphicOptions.total"
							:start-angle="graphicOptions.startAngle"
						>
							<span class="graphics-circular-title">{{ title }}</span>
						</vc-donut>
					</div>
					<div>
						<v-layout row wrap mb-3>
							<v-flex
								xs12
								class="padding-legend"
								:class="{ 'categories-collapse': showMoreActive }"
								:style="
									showMoreActive
										? 'max-height: 230px; overflow-y: scroll'
										: 'max-height: 205px; overflow-y: hidden'
								"
							>
								<div
									class="graphics-circular-legend"
									v-for="section in graphicOptions.sections"
									:key="section.id"
								>
									<span class="graphics-circular-legend-label">{{
										section.label | limitTo(10)
									}}</span>
									<v-progress-linear
										class="graphics-circular-legend-bar"
										:style="`color: ${section.color}`"
										:color="section.color"
										:height="9"
										:value="section.value"
									></v-progress-linear>
									<span class="graphics-circular-legend-percentage">
										<span class="regular">{{ section.value }}%</span> ({{
											graphicOptions.total
										}})
									</span>
								</div>
							</v-flex>
						</v-layout>
						<v-btn
							v-if="showMore"
							class="btn-auto btn-show-categories ma-0"
							depressed
							flat
							@click="$emit('show-all')"
						>
							<template v-if="showMoreActive"> Ver menos </template>
							<template v-else> Ver todo </template>
						</v-btn>
					</div>
				</div>
			</template>
			<template v-if="bar">
				<vue-chart
					type="bar"
					:data="graphicOptions.data"
					class="graphic-container"
					:options="graphicOptions.options"
				></vue-chart>
			</template>
			<template v-if="line">
				<v-layout row wrap class="pb-4">
					<v-flex
						v-for="(category, catIdx) in graphicOptions.categories"
						:key="catIdx"
						class="category-caption"
					>
						<span
							class="category-indicator"
							:style="`background-color: ${graphicOptions.datasets[catIdx].borderColor[0]}`"
						></span>
						{{ category }}
					</v-flex>
				</v-layout>
				<vue-chart
					type="line"
					:data="graphicOptions"
					class="graphic-container"
					:options="graphicOptions.options"
				></vue-chart>
			</template>
			<template v-if="pie">
				<v-layout row wrap>
					<v-flex xs6 pt-5>
						<vue-chart
							type="pie"
							:data="graphicOptions"
							class="graphic-container"
							:options="graphicOptions.options"
						></vue-chart>
					</v-flex>
					<v-flex xs6 text-xs-right>
						<v-layout row wrap mb-3>
							<v-flex xs5 class="bold-black" text-xs-left> CATEGORÍA </v-flex>
							<v-flex xs4 text-xs-center class="bold-black"> BENF. </v-flex>
							<v-flex xs3 text-xs-center class="bold-black"> % </v-flex>
							<v-flex
								xs12
								:class="{ 'categories-collapse': showMoreActive }"
								:style="
									showMoreActive
										? 'max-height: 230px; overflow-y: scroll'
										: 'max-height: 205px; overflow-y: hidden'
								"
							>
								<v-layout
									row
									wrap
									class="graphics-circular-legend"
									v-for="(section, sectionIdx) in graphicOptions.sections"
									:key="section.id"
								>
									<v-flex xs5 text-xs-left class="label-category">
										<span
											class="legend-box"
											:style="`background-color:${graphicOptions.datasets[0].backgroundColor[sectionIdx]}`"
										></span>
										{{ section.label | limitTo(10) }}
									</v-flex>
									<v-flex xs4 text-xs-center class="values-category">
										{{ section.totalBenefits | round }}
									</v-flex>
									<v-flex xs3 text-xs-center class="values-category">
										<span class="regular">{{ section.value }}%</span>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-btn
							v-if="showMore"
							class="btn-auto btn-show-categories ma-0"
							depressed
							flat
							@click="$emit('show-all')"
						>
							<template v-if="showMoreActive"> Ver menos </template>
							<template v-else> Ver todo </template>
						</v-btn>
					</v-flex>
				</v-layout>
			</template>
		</v-flex>
	</v-layout>
</template>

<script>
import VueChart from 'vuechart';
import graphicBar from '@/components/field-sale/dashboard/graphic-bar';

function showOptions(e) {
	e.preventDefault();
	this.showDropDown = false;
	this.x = e.clientX;
	this.y = e.clientY;
	this.$nextTick(() => {
		this.showDropDown = true;
		this.$emit('show-options');
	});
}

function data() {
	return {
		showDropDown: false,
		x: 0,
		y: 0,
	};
}

export default {
	name: 'graphics-box-dashboard',
	components: {
		graphicBar,
		VueChart,
	},
	data,
	methods: {
		showOptions,
	},
	props: {
		bar: {
			default: false,
			type: Boolean,
		},
		circle: {
			default: false,
			type: Boolean,
		},
		dropDownOptions: {
			default: () => [],
			type: Array,
		},
		graphicOptions: {
			default: () => {},
			type: Object,
		},
		line: {
			default: false,
			type: Boolean,
		},
		pie: {
			default: false,
			type: Boolean,
		},
		showDropDownValue: {
			default: false,
			type: Boolean,
		},
		showMore: {
			default: false,
			type: Boolean,
		},
		showMoreActive: {
			default: false,
			type: Boolean,
		},
		title: String,
	},
};
</script>

<style lang="scss" scoped>
.graphics-box {
	background-color: color(white);
	border-radius: 4px;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11);
	height: 100%;
}

.graphics-header {
	background-color: color(top-background);
	height: 56px;
	padding: 13px 18px;

	&-title {
		border-bottom: 1px solid color(background-sidebar);
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium16);
	}
}

.graphics-body {
	margin: 0 auto;
	max-width: 672px;
	padding: 0px 38px;
}

.btn-excel-graphics {
	background-color: color(background-excel) !important;
	border-radius: 5px !important;
	height: 30px !important;
	width: 30px !important;
}

.graphics-circular {
	&-title {
		color: color(opacity-list-price);
		display: block;
		font-family: font(open-semibold);
		font-size: size(small);
		max-width: 74px;
		text-transform: uppercase;
	}

	&-legend {
		align-items: center;
		color: color(opacity-list-price);
		display: flex;
		flex-wrap: wrap;
		font-family: font(open-semibold);
		justify-content: flex-end;
		margin-bottom: 14px;

		&-label {
			display: inline-block;
			font-size: size(small);
			margin-right: auto;
			text-transform: uppercase;
		}

		&-percentage {
			display: inline-block;
			font-size: size(small10);
			min-width: 60px;
			text-align: right;

			.regular {
				font-family: font(open-regular);
			}
		}

		.progress-linear {
			border-radius: 4px !important;
			margin: 0px 5px 0px 15px !important;
			width: 8vw !important;
		}
	}
}

.padding-legend {
	padding-left: 1vw;
}

.btn-show-categories {
	color: color(primary);
	font-family: font(open-semibold);
	text-decoration: underline;
}

.bold-black {
	color: #1f1f1f !important;
	font-family: font(open-bold);
	font-size: size(small);
}

.legend-box {
	border: 1px solid color(black);
	display: inline-block;
	height: 9px;
	width: 9px;
}

.category-indicator {
	border-radius: 100%;
	display: inline-block;
	height: 9px;
	width: 9px;
}

.category-caption {
	color: #67758d;
	font-family: font(open-bold);
	font-size: size(small10);
}

.label-category {
	color: color(opacity-list-price);
	font-family: font(open-semibold);
	font-size: size(small);
	text-transform: uppercase;
}

.values-category {
	color: color(opacity-list-price);
	font-family: font(open-regular);
	font-size: size(small10);
}
</style>
