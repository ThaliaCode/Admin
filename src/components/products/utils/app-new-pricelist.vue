<template>
	<div class="app-new-pricelist-main" :class="{ smallContainer: rotateIcon }">
		<div class="app-new-pricelist" @click="collapseContainer">
			<div class="app-new-pricelist-title">{{ list.name }}</div>
			<div class="collapse-icon">
				<v-icon :class="{ 'rotate-icon': rotateIcon }">
					keyboard_arrow_down
				</v-icon>
			</div>
		</div>
		<v-layout row wrap mb-2>
			<v-flex xs12>
				<v-layout row wrap align-center>
					<v-flex xs3>
						<v-subheader class="pr-0">Precio x unidad</v-subheader>
					</v-flex>
					<v-flex xs2>
						<v-text-field
							class="filter-select show-error"
							type="number"
							name="new-product--price"
							hide-details
							v-model.number="list[list.id].price"
							:rules="[list[list.id].price < maxNumber || errorMessage]"
							@update:error="captureError($event, 'price')"
							@input="setPriceRow(list.id, $event)"
						></v-text-field>
					</v-flex>
					<v-flex xs3>
						<v-subheader class="justify-end">Dscto. (%)</v-subheader>
					</v-flex>
					<v-flex xs2>
						<v-text-field
							class="filter-select show-error"
							type="number"
							name="new-product--price"
							hide-details
							v-model.number="list[list.id].discount"
							:rules="[
								list[list.id].discount < maxNumberDiscount ||
									errorMessageDiscount,
							]"
							@update:error="captureError($event, 'discount')"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout
					row
					wrap
					align-center
					v-for="(range, rangeIndex) in list[list.id].ranges"
					:key="rangeIndex"
				>
					<v-flex xs3>
						<v-subheader class="pr-0">Precio x mayor</v-subheader>
					</v-flex>
					<v-flex xs2>
						<v-text-field
							class="filter-select show-error"
							name="new-product-ranges"
							type="number"
							v-model.number="range.price"
							hide-details
							:rules="[range.price < maxNumber || errorMessage]"
							@update:error="captureError($event, 'rangePrice')"
							@input="setPriceId(range, rangeIndex, list.id)"
						></v-text-field>
					</v-flex>
					<v-flex xs1>
						<v-subheader>de</v-subheader>
					</v-flex>
					<v-flex xs1>
						<v-text-field
							class="filter-select show-error"
							name="new-product-from"
							type="number"
							v-model.number="range.from"
							hide-details
							:rules="[range.from < maxNumber || errorMessage]"
							@update:error="captureError($event, 'from')"
						></v-text-field>
					</v-flex>
					<v-flex xs1>
						<v-subheader>a</v-subheader>
					</v-flex>
					<v-flex xs1>
						<v-text-field
							class="filter-select show-error"
							name="new-product-to"
							type="number"
							v-model.number="range.to"
							hide-details
							:rules="[range.to < maxNumber || errorMessage]"
							@update:error="captureError($event, 'to')"
						></v-text-field>
					</v-flex>
					<v-flex xs1>
						<v-subheader>unid.</v-subheader>
					</v-flex>
					<v-flex xs1>
						<v-btn
							type="button"
							class="btn-list btn-list-remove"
							v-if="rangeIndex !== list[list.id].ranges.length - 1"
							@click="removePriceRange(list.id, rangeIndex)"
						>
							<v-icon>remove</v-icon>
						</v-btn>
						<v-btn
							type="button"
							class="btn-list btn-list-add"
							v-if="rangeIndex === list[list.id].ranges.length - 1"
							@click="addPriceRange(list.id)"
						>
							<v-icon>add</v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex>
				<v-layout
					row
					wrap
					align-center
					v-for="(range, rangeIndex) in list.units"
					:key="rangeIndex"
				>
					<v-layout row wrap align-center>
						<v-flex xs12 px-4>
							<h6 class="price-list-name pl-1">Precio por {{ range.name }}</h6>
						</v-flex>
						<v-flex xs8 px-3>
							<v-layout row wrap align-center px-2>
								<v-flex xs4 px-1 text-xs-center>
									<app-input-text
										v-if="basePriceComputed.PV === basePriceUsed"
										label="P. Vent."
										model="price"
										tooltip="Precio de Venta"
										type="number"
										class="sale-price"
										:text="range.price"
										@input="setUnitData($event, rangeIndex)"
									></app-input-text>
									<div v-else class="price-no-input">
										<v-tooltip top>
											<label slot="activator">P. Vent.</label>
											<span>Precio de Venta</span>
										</v-tooltip>
										<span>{{ range.price }}</span>
									</div>
								</v-flex>
								<!-- <v-flex xs3 px-1 text-xs-center>
										<app-input-text
											v-if="basePriceComputed.PU === basePriceUsed"
											label="P. Unit."
											model="unitPrice"
											tooltip="Precio Unitario"
											type="number"
											class="unit-price"
											:text="range.unitPrice"
											@input="setUnitData($event, rangeIndex)"
										></app-input-text>
										<span v-else class="price-no-input">
											<v-tooltip top>
												<label slot="activator">P. Unit.</label>
												<span>Precio de Unitario</span>
											</v-tooltip>
											<span>{{ range.unitPrice }}</span>
										</span>
									</v-flex> -->
								<!-- <v-flex xs3 px-1 text-xs-center>
										<label class="caption">{{ labelsByCountry.taxName }}</label><br>
										<span>{{ range.taxes }}</span>
									</v-flex> -->
								<v-flex xs3 px-1>
									<app-input-text
										label="Dscto."
										model="discount"
										tooltip="Descuento"
										type="number"
										class="discount"
										:text="range.discount"
										@input="setUnitData($event, rangeIndex)"
									></app-input-text>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs4 px-2>
							<v-flex xs12>
								<!-- <v-btn
									type="button"
									class="btn-list btn-list-remove"
									v-if="rangeIndex !== (list[list.id].units.length - 1)"
									@click="removePriceRange(range.id, rangeIndex)"
								>
									<v-icon>remove</v-icon>
								</v-btn> -->
								<button class="product-add-btn mt-1" type="button">
									<span>Precio x mayor</span>
									<v-icon
										class="product-add-btn-icon"
										color="primary"
										size="17"
										@click="addPriceRange(range.id)"
									>
										add_circle
									</v-icon>
								</button>
							</v-flex>
						</v-flex>
					</v-layout>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import BasePrice from '@/shared/basePrice';
import l from '@/shared/lib';

const { getDeeper } = l;

function created() {
	this.rotateIcon = this.openContainerFromOutside;
}

function basePriceComputed() {
	return BasePrice;
}

function basePriceUsed() {
	return getDeeper(
		'company',
		'settings',
		'flagBasePriceDefault'
	)(this.$userInfo);
}

function addPriceRange(id) {
	this.$emit('add-price-range', id);
}

function collapseContainer() {
	this.rotateIcon = !this.rotateIcon;
	this.$emit('collapse-price-list', this.rotateIcon);
}

function removePriceRange(id, index) {
	this.$emit('remove-price-range', { id, index });
}

function setPriceId(row, index, id) {
	this.list[id].ranges[index].price = row.price || 0;
}

function setUnitData({ model, value }, index) {
	this.$set(this.list.units[index], model, Number(value));
	// this.$emit('set-price-list', this.list);
}

function setPriceRow(id, value) {
	this.list[id].unitPrice = Number(
		(Number(value) / Number(`1.${this.labelsByCountry.percentage}`)).toFixed(2)
	);
}

function captureError(value, flag) {
	this.errors[flag] = value;
	const keys = Object.keys(this.errors);
	const el = keys.find((e) => this.errors[e]);
	this.disabledByError = !!el;
	this.$emit('disabled-accept-button', this.disabledByError);
}

function data() {
	return {
		maxNumber: 99999999,
		maxNumberDiscount: 1000,
		disabledByError: false,
		errorMessage: 'máximo 8 dígitos',
		errorMessageDiscount: '100 es el porcentaje máximo',
		rotateIcon: false,
		errors: {
			price: false,
			rangePrice: false,
			to: false,
			from: false,
		},
	};
}

export default {
	name: 'app-new-pricelist',
	data,
	created,
	computed: {
		basePriceComputed,
		basePriceUsed,
	},
	methods: {
		addPriceRange,
		captureError,
		collapseContainer,
		removePriceRange,
		setPriceId,
		setPriceRow,
		setUnitData,
	},
	props: {
		list: {
			default: () => {},
			required: true,
			type: Object,
		},
		openContainerFromOutside: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.app-new-pricelist-main {
	@include vertical-displacement;
	border: 1px solid color(item-select);
	border-radius: 5px;
	margin-bottom: 7px;
	height: 38px;
	overflow: hidden;
}

.smallContainer {
	height: auto;
}

.app-new-pricelist {
	@include flex-between;
	border-bottom: 1px solid #c3e7e8;
	cursor: pointer;
	color: color(primary);
	height: 38px;

	.app-new-pricelist-title {
		border-radius: 0px;
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
		margin-left: 30px;
	}
}

.collapse-icon {
	border-left: 1px solid map-get($colors, blue-grey);
	height: 22px;
	margin: 0 10px;
	padding-left: 10px;
	width: 32px;

	.icon {
		transform: rotateZ(0deg);

		&.rotate-icon {
			transform: rotateZ(180deg);
		}
	}
}

.new-pricelist-forms {
	align-items: center;
	display: grid;
	grid-column-gap: 10px;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: 50px;
	padding: 20px;
}

.pb-price {
	border-bottom: 1px solid color(border-green-light);
	margin: 7px 0px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}
</style>
