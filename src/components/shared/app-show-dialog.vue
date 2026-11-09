<template>
	<div>
		<v-dialog
			content-class="app-show-dialog"
			persistent
			v-model="showModalInit"
			:max-width="maxWidthDialog"
		>
			<v-card>
				<v-layout
					wrap
					justify-space-between
					align-center
					pa-2
					px-3
					class="background-dialog"
				>
					<v-flex text-xs-left>
						<v-layout align-center>
							<v-flex xs1>
								<button>
									<v-icon :color="colorDialog"> report_problem </v-icon>
								</button>
							</v-flex>
							<v-flex
								ml-2
								xs11
								:class="[`${colorDialog}--text`, 'title-dialog']"
							>
								{{ titleHeader }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex text-xs-right>
						<button type="button" @click="$emit('close-dialog')">
							<v-icon :color="colorDialog">clear</v-icon>
						</button>
					</v-flex>
				</v-layout>
			</v-card>
			<v-card-actions class="content-dialog">
				<v-layout row justify-center pa-2 px-3 ma-0>
					<div
						:class="[`${colorDialog}--text`, 'message-color']"
						:style="`background-color: rgba(${hexToRgb(colorHex)}, 0.1)`"
					>
						{{ textContent }}
					</div>
				</v-layout>
				<div class="content-products mt-2" v-if="showProducts">
					<v-layout
						row
						justify-center
						py-2
						px-1
						ma-0
						text-xs-center
						class="content-title"
					>
						<v-flex class="title-column" xs5>Producto</v-flex>
						<v-flex class="title-column" xs2>Cod.</v-flex>
						<v-flex class="title-column" xs2 v-if="priceMin">P. Minimo</v-flex>
						<v-flex class="title-column" xs2 v-if="priceMin">P. Venta</v-flex>
						<v-flex
							class="title-column"
							v-if="!priceMin"
							:class="validWarehouse ? 'xs2' : 'xs3'"
							>Stock</v-flex
						>
						<v-flex
							class="title-column"
							:class="validWarehouse ? 'xs2' : 'xs3'"
							v-if="validWarehouse"
							>Almacen</v-flex
						>
					</v-layout>
					<v-layout
						py-2
						px-1
						ma-0
						text-xs-center
						class="ft-12 border"
						v-for="(item, index) in products"
						:key="index"
					>
						<v-flex text-xs-center xs5>{{ item.name }}</v-flex>
						<v-flex text-xs-center :class="validWarehouse ? 'xs2' : 'xs3'">
							{{ item.code }}
						</v-flex>
						<v-flex text-xs-center xs2 v-if="priceMin">{{
							item.priceSaleMin
						}}</v-flex>
						<v-flex text-xs-center xs2 v-if="priceMin">{{
							item.salePrice
						}}</v-flex>
						<v-flex
							text-xs-center
							v-if="!priceMin"
							:class="validWarehouse ? 'xs2' : 'xs3'"
							>{{ item.stock }}</v-flex
						>
						<v-flex
							text-xs-center
							:class="validWarehouse ? 'xs2' : 'xs0'"
							v-if="validWarehouse"
							>{{ item.warehouseName }}</v-flex
						>
					</v-layout>
				</div>
			</v-card-actions>
		</v-dialog>
	</div>
</template>

<script>
function hexToRgb(hex) {
	const rgb = hex
		.replace(
			/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
			(m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`
		)
		.substring(1)
		.match(/.{2}/g)
		.map((x) => parseInt(x, 16));
	return rgb.join(',');
}

export default {
	name: 'app-show-dialog',
	methods: {
		hexToRgb,
	},
	props: {
		showModalInit: {
			type: Boolean,
			default: false,
		},
		titleHeader: String,
		textContent: String,
		colorDialog: {
			default: 'primary',
			type: String,
		},
		colorHex: {
			default: 'color(primary)',
			type: String,
		},
		backgroundContent: String,
		maxWidthDialog: {
			default: '571px',
			type: String,
		},
		showProducts: {
			default: false,
			type: Boolean,
		},
		products: {
			type: Array,
			default: () => [],
		},
		validWarehouse: {
			default: true,
			type: Boolean,
		},
		priceMin: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.title-dialog {
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, medium);
	font-weight: 900;
}

.message-color {
	border: 1px solid currentColor;
	border-radius: 3px;
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small13);
	padding: 12px 25px;
	width: 100%;
}

.content-dialog {
	flex-direction: column;
}

.content-products {
	font-size: 13px;
	width: 85%;
}

.title {
	color: #4a4a4a;
}

.content-title {
	background-color: color(primary);
	color: map-get($colors, white);
}

.ft-12 {
	font-size: 12px;
}

.border {
	border: 1px solid map-get($colors, grey-border);
}
</style>
