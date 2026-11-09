<template>
	<v-layout row wrap white class="card-top">
		<v-flex xs12 class="card-top-header">
			<v-layout row wrap align-center>
				<v-flex xs10>
					<h3 class="card-top-title text-underline">
						{{ top.title }}
					</h3>
				</v-flex>
				<v-flex xs2 text-xs-right>
					<v-btn
						class="btn-auto btn-excel-graphics ma-0"
						@click="$emit('download-excel')"
					>
						<img src="/static/img/excel.svg" alt="download" height="20" />
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout
				row
				wrap
				class="card-top-list"
				:class="show ? `card-top-list-collapse-${topIndex}` : ''"
				:style="
					!show
						? 'overflow-y: hidden'
						: 'height: calc((33px * 10) + 43px); overflow-y: scroll'
				"
			>
				<v-flex xs12>
					<v-layout row wrap class="card-top-list-header">
						<template v-for="(column, index) in top.columns">
							<v-flex :class="column.class">
								<label v-if="column.value" class="header-text">
									{{ column.value }}
								</label>
								<v-btn
									icon
									small
									class="btn-icon-flat"
									@click.stop="$emit('on-sort', top, index)"
									v-if="column.showSort"
								>
									<v-icon color="primary">{{ column.icon }}</v-icon>
								</v-btn>
							</v-flex>
						</template>
					</v-layout>
				</v-flex>
				<v-flex xs12 py-1 v-for="(row, index) in top.rows" :key="`${row.id}-${index}`">
					<v-layout row wrap align-center class="card-top-list-body">
						<template v-for="column in top.columns">
							<v-flex :class="column.class">
								<template v-if="column.value">
									<template v-if="column.name === 'name'">
										<template v-if="row.code">
											<p class="body-name body-small mb-0">
												{{ row.code }}
											</p>
											<p class="body-name mb-0">
												<v-tooltip top>
													<span slot="activator" class="body-name body-xsmall">
														{{ row[column.name] | limitTo(46) }}
													</span>
													<span>{{ row[column.name] }}</span>
												</v-tooltip>
											</p>
										</template>
										<template v-else>
											<span class="body-name">
												{{ row[column.name] }}
											</span>
										</template>
									</template>
									<template v-else-if="column.name === 'phone'">
										<app-tooltip-button
											img="/static/icon/whatsapp-logo.png"
											height="22"
											:text="`Enviar un mensaje a ${row.name}`"
											@click-icon="$emit('send-whatsapp', row)"
										></app-tooltip-button>
									</template>
									<template v-else-if="column.name === 'units'">
										<app-tooltip-button
											icon="remove_red_eye"
											:text="unitsList(row[column.name])"
											color="primary"
											size="16"
										/>
									</template>
									<template v-else>
										<span class="body-total">
											<template v-if="column.name === 'unitQuantity' || !column.amount">
												{{ row[column.name] | round }}
											</template>
											<template
												v-else-if="
													column.name === 'benefitsSales' ||
													column.name === 'benefitsAmount'
												"
											>
												{{ row[column.name] | round }}
											</template>
											<template v-else>
												{{ currency }}{{ row[column.name] | round }}
											</template>
										</span>
									</template>
								</template>
								<template v-else>
									<span class="body-number success--text"> {{ index + 1 }}. </span>
								</template>
							</v-flex>
						</template>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 text-xs-center v-if="top.rows.length > 10">
			<v-btn class="btn-auto card-top-btn" depressed flat @click="showAll">
				<template v-if="show">
					Ver menos <v-icon color="primary">arrow_drop_up</v-icon>
				</template>
				<template v-else>
					Ver todo <v-icon color="primary">arrow_drop_down</v-icon>
				</template>
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
import appTooltipButton from '@/components/shared/app-tooltip-button';

function disabledSelected({ units }) {
	return units && units.length === 1;
}

function setScroll() {
	const tagName = `card-top-list-collapse-${this.topIndex}`;
	const tag = document.getElementsByClassName(tagName);
	if (tag.length > 0) {
		tag[0].scrollTop = 0;
	}
}

function showAll() {
	this.show = !this.show;
	this.setScroll();
}

function unitsList(units) {
	return units.map((e) => `${e.name}: ${e.quantity}`).join(' | ');
}

function data() {
	return {
		show: false,
	};
}

export default {
	name: 'top-list',
	components: {
		appTooltipButton,
	},
	data,
	methods: {
		disabledSelected,
		setScroll,
		showAll,
		unitsList,
	},
	props: {
		currency: String,
		topIndex: [Number, String],
		top: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

<style lang="scss" scoped>
.card-top {
	background-color: color(white);
	border-radius: 4px;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11);

	&-header {
		background-color: color(top-background);
		padding: 8px 13px 8px 22px;
	}

	&-title {
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium16);
	}

	&-list {
		align-content: flex-start;
		border-top: 1px solid color(top-border);
		border-bottom: 1px solid color(top-border);
		height: calc((33px * 10) + 23px);

		&-header {
			background-color: color(top-subheader);

			.header-text {
				color: color(primary);
				font-family: font(open-semibold);
				font-size: size(small);
			}
		}

		&-body {
			.body-number {
				font-family: font(open-bold);
				font-size: size(small13);
			}

			.body-name {
				color: color(brown-grey);
				font-family: font(open-semibold);
				font-size: size(small13);
				line-height: 1;
			}

			.body-small {
				font-size: size(small11);
			}

			.body-xsmall {
				font-size: size(small8);
			}

			.body-total {
				color: color(background-sidebar);
				font-family: font(open-bold);
				font-size: size(medium16);
			}
		}
	}
}

.text-underline {
	text-decoration: underline;
}

.btn-excel-graphics {
	background-color: color(background-excel) !important;
	border-radius: 5px !important;
	height: 30px !important;
	width: 30px !important;
}

.btn-icon-flat {
	min-width: 0 !important;
	width: auto !important;
	height: auto !important;
	margin: 0 !important;
	padding: 0 !important;
	border: none !important;
	box-shadow: none !important;
	background: transparent !important;
}

.btn-icon-flat .v-icon {
	margin: 0 !important;
	padding: 0 !important;
	line-height: 1 !important;
}
</style>
