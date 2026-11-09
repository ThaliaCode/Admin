<template>
	<v-layout
		wrap
		align-center
		ma-2
		class="row-data"
		:class="padding"
	>
		<v-flex
			xs2
			primary--text
			px-2 py-1
			text-xs-right
			class="grey-block"
			:class="show ? 'radius-left-top' : 'radius-left'"
		>
			<template v-if="cashConfig">
				<v-btn
					class="btn-auto user-config ma-0"
					depressed
					disabled
					icon
				>
					<img
						src="/static/img/user-config.svg"
						alt=""
					/>
				</v-btn>
			</template>
			<template v-else>
				{{ quantityData }}
			</template>
		</v-flex>
		<v-flex
			px-2
			primary--text
			py-1 white
			class="border-y"
			:class="!amount && hasDetailsProp() ? 'xs8' : 'xs5'"
		>
			{{ titleData }}
		</v-flex>
		<v-flex
			px-2 py-1
			class="grey-block"
			:class="{
				'text-xs-center primary--text': amount,
				'empty-block': !amount && !warehousesData && !devicesData,
				'radius-right-top': show,
				'radius-right': !show,
				'xs2': !amount && hasDetailsProp(),
				'xs5': !hasDetailsProp(),
			}"
		>
			<template v-if="amount">
				<div class="block-collapse">
					{{ amount | round }}
					<button
						type="button"
						class="btn-collapse"
						v-if="hasDetailsProp()"
						@click.stop="showDetails"
					>
						<v-icon>
							<template v-if="show">
								arrow_drop_up
							</template>
							<template v-else>
								arrow_drop_down
							</template>
						</v-icon>
					</button>
				</div>
			</template>
			<template v-else-if="hasDetailsProp()">
				<div class="block-collapse">
					<button
						type="button"
						class="btn-collapse"
						@click.stop="showDetails"
					>
						<v-icon>
							<template v-if="show">
								arrow_drop_up
							</template>
							<template v-else>
								arrow_drop_down
							</template>
						</v-icon>
					</button>
				</div>
			</template>
			<template v-else-if="warehousesData">
				<v-layout wrap align-center>
					<v-flex xs6>
						<v-layout wrap align-center>
							<v-flex xs6 text-xs-right pr-2>
								{{ warehouses.open }}
							</v-flex>
							<v-flex xs6>
								<img
									src="/static/img/open.svg"
									alt=""
									height="10"
									width="10"
								>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6>
						<v-layout wrap align-center>
							<v-flex xs6 text-xs-right pr-2>
								{{ warehouses.close }}
							</v-flex>
							<v-flex xs6>
								<img
									src="/static/img/closed.svg"
									alt=""
									height="10"
									width="10"
								>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</template>
			<template v-else-if="devicesData">
				<v-layout wrap align-center>
					<v-flex xs6>
						<v-layout wrap align-center>
							<v-flex xs6 text-xs-right pr-2>
								{{ devices.online }}
							</v-flex>
							<v-flex xs6>
								<img
									src="/static/img/on.svg"
									alt=""
									height="10"
									width="10"
								>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6>
						<v-layout wrap align-center>
							<v-flex xs6 text-xs-right pr-2>
								{{ devices.offline }}
							</v-flex>
							<v-flex xs6>
								<img
									src="/static/img/off.svg"
									alt=""
									height="10"
									width="10"
								>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</template>
		</v-flex>
		<v-flex xs12 v-if="show">
			<v-layout
				class="block-title-detail"
				v-if="show && hasDetailsProp('heading')"
				wrap
			>
				<template v-for="heading in details.heading">
					<v-flex
						:key="heading.id"
						xs4 px-2 py-1
						text-xs-center
					>
						{{ heading.title }}
					</v-flex>
				</template>
			</v-layout>
			<template v-if="hasDetailsProp()">
				<v-layout
					class="block-detail"
					wrap
					v-for="detail in details.body"
					:key="detail.id"
				>
					<template v-if="details.heading">
						<v-flex
							v-for="(headingValue, index) in details.heading"
							:key="headingValue.id"
							px-2 py-1 xs4
							text-xs-center
							:class="{ 'border-r': index === 0, 'border-l': index === 2 }"
						>
							<template>
								{{ detail[headingValue.value] }}
							</template>
						</v-flex>
					</template>
					<template v-else>
						<v-flex
							px-2 py-1 text-xs-right xs2
							class="border-r"
						>
							{{ detail.total }}
						</v-flex>
						<v-flex px-2 py-1 xs5>
							<template v-if="detail.title">
								{{ detail.title }}	
							</template>
							<template v-else>
								{{ detail.initAmount | round }}
							</template>
						</v-flex>
						<v-flex
							px-2 py-1 xs5
							text-xs-center
							class="border-l"
						>
							{{ detail.amount | round }}
						</v-flex>
					</template>
				</v-layout>
			</template>
		</v-flex>
	</v-layout>
</template>

<script>
	function showDetails() {
		this.show = !this.show;
	}

	function hasDetailsProp(prop = 'body') {
		return this.details ? this.details[prop] : false;
	}

	function data() {
		return {
			show: false,
		};
	}

	export default {
		name: 'row-data',
		data,
		methods: {
			hasDetailsProp,
			showDetails,
		},
		props: {
			amount: Number,
			cashConfig: {
				default: false,
				type: Boolean,
			},
			details: {
				default: () => {},
				type: Object,
			},
			devices: {
				default: () => {},
				type: Object,
			},
			devicesData: {
				default: false,
				type: Boolean,
			},
			headingDetail: {
				default: () => [],
				type: Array,
			},
			padding: String,
			quantityData: [Number, String],
			titleData: String,
			warehouses: {
				default: () => {},
				type: Object,
			},
			warehousesData: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.grey-block {
		background-color: color(row-data-background);
		border: 1px solid color(background-table);
	}

	.border-y {
		border-bottom: 1px solid color(background-table);
		border-color: color(background-table) !important;
		border-top: 1px solid color(background-table);
	}

	.radius-left {
		border-bottom-left-radius: 3px;
		border-top-left-radius: 3px;
	}

	.radius-right {
		border-bottom-right-radius: 3px;
		border-top-right-radius: 3px;
	}

	.radius-left-top {
		border-top-left-radius: 3px;
	}

	.radius-right-top {
		border-top-right-radius: 3px;
	}

	.row-data {
		border-radius: 3px;
		font-family: font(open-semibold);
		font-size: size(small10);
	}

	.empty-block {
		height: 23px;
	}

	.block-collapse {
		background-color: transparent;
		border: 0px;
		box-shadow: none;
		position: relative;

		.btn-collapse {
			position: absolute;
			right: 0px;
			top: -3px;

			.icon {
				color: color(success);
				font-size: size(medium20);
			}
		}
	}

	.block-detail {
		background-color: color(background-table);
		border-bottom: 1px solid color(blue-grey);
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small9);

		.border-l {
			border-left: 1px solid color(blue-grey);
		}

		.border-r {
			border-right: 1px solid color(blue-grey);
		}

		&:last-child {
			border-bottom: none;
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;

			.border-l {
				border-bottom-right-radius: 3px;
			}

			.border-r {
				border-bottom-left-radius: 3px;
			}
		}
	}

	.block-title-detail {
		background-color: color(blue-grey);
		color: color(blue-card);
		font-family: font(open-regular);
		font-size: size(small8);
	}
</style>