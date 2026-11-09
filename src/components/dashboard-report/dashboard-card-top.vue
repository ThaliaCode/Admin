<template>
	<v-layout row wrap white class="card-top">
		<v-flex xs12 px-3 pt-2 pb-2>
			<v-layout row wrap align-center>
				<v-flex xs10>
					<h3 class="card-top-title primary--text">
						Productos <span class="text-underline">más solicitados</span>
					</h3>
				</v-flex>
				<v-flex xs2 text-xs-right>
					<v-btn
					@click="$emit('download-excel-products')"
					class="btn-auto btn-excel-graphics ma-0">
						<img src="/static/img/excel.svg" alt="download" height="18">
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout
				row wrap class="card-top-list"
				:style="!show ? 'height: calc((49px * 5) + 23px); overflow: hidden' : `height: calc((49px * ${top.length}) + 23px)`"
			>
				<v-flex xs12>
					<v-layout row wrap class="card-top-list-header">
						<v-flex xs2></v-flex>
						<v-flex xs4>
							<label class="header-text">PRODUCTO</label>
						</v-flex>
						<v-flex xs4 text-xs-center>
							<label class="header-text">UND</label>
						</v-flex>
						<v-flex xs2 text-xs-center>
							<label class="header-text">CANT</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 py-2 v-for="(product, index) in top" :key="product.id">
					<v-layout row wrap align-center class="card-top-list-body">
						<v-flex xs2 text-xs-center>
							<span class="body-number success--text">
								{{ index + 1 }}
							</span>
						</v-flex>
						<v-flex xs4>
							<v-tooltip top>
								<span slot="activator" class="body-name">
									{{ product.name | limitTo(10) }}
								</span>
								<span>{{ product.name }}</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs4 text-xs-center v-if="product.units.length > 1">
							<app-select
								:disabled="disabledSelected(product)"
								:item="product.unitId"
								item-text="name"
								item-value="id"
								:items="product.units"
								place-holde="Unidades"
								model="unitId"
								return-object
								@input="$emit('set-unit', { row: product, unit: $event.value })"
							></app-select>
							<span class="body-text secondary--text">
								{{ product.unitName }}
							</span>
						</v-flex>
						<v-flex xs4 text-xs-center v-else>
							<span>
								{{ product.units[0].name }}
							</span>
						</v-flex>
						<v-flex xs2 text-xs-center>
							<span class="body-text secondary--text">
								{{ product.quantityShow }}
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 text-xs-center v-if="top.length > 5">
			<v-btn
				class="btn-auto card-top-btn"
				depressed
				flat
				@click="showAll"
			>
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
	function disabledSelected({ units }) {
		return units && units.length === 1;
	}

	function showAll() {
		this.show = !this.show;
	}

	function data() {
		return {
			show: false,
		};
	}

	export default {
		name: 'dashboard-card-top',
		data,
		methods: {
			disabledSelected,
			showAll,
		},
		props: {
			top: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.card-top {
		border: 1px solid color(maki-grey) !important;
		border-radius: 3px;

		&-title {
			font-family: font(open-semibold);
			font-size: size(medium18);
		}

		&-list {
			border-top: 1px solid color(top-border);
			border-bottom: 1px solid color(top-border);

			&-header {
				background-color: color(top-background);

				.header-text {
					color: color(paginationText);
					font-family: font(open-semibold);
					font-size: size(small10);
				}
			}

			&-body {
				.body-number {
					font-family: font(open-semibold);
					font-size: size(medium22);
				}

				.body-name {
					color: color(brown-grey);
					font-family: font(open-semibold);
					font-size: size(medium);
				}

				.body-text {
					font-family: font(open-bold);
					font-size: size(medium);
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
</style>