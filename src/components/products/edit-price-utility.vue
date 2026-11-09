<template>
	<div class="pt-4">
		<v-flex xs5 px-4>
			<app-select
				label="Lista de Precio"
				item-text="name"
				item-value="id"
				:items="pricesLists"
				:item="model.priceListId"
				model="priceListId"
				@input="setPriceList"
			/>
		</v-flex>
		<v-layout
			row
			align-end
			justify-space-between
			class="border-bottom pb-4 mt-4 px-4"
		>
			<v-flex xs3>
				<div class="layout">
					<button
						class="btn-tab-header"
						:class="{ 'select-header': model.selectHeader === 'amount' }"
						@click="changeHeader('amount')"
					>
						Monto
					</button>
					<button
						class="btn-tab-header relative"
						:class="{ 'select-header': model.selectHeader === 'percentage' }"
						@click="changeHeader('percentage')"
					>
						Porc. %
					</button>
				</div>
			</v-flex>
			<v-flex>
				<v-radio-group
					class="edit-price-utility"
					row
					v-model="model.typeSelect"
				>
					<v-radio
						v-for="(type, index) in types"
						v-show="type.show"
						:key="index"
						:label="type.name"
						:value="type.value"
						color="primary"
						@change="changeType($event)"
					></v-radio>
				</v-radio-group>
			</v-flex>
			<v-flex xs3 ml-3>
				<v-layout v-if="model.selectHeader === 'percentage'">
					<v-flex>
						<app-input-text
							:text="model.percentage"
							label="Porc. %"
							model="percentage"
							@input="setAmount"
							@input-enter="setAmount"
						/>
					</v-flex>
				</v-layout>
				<v-layout row align-end v-else>
					<v-flex>
						<button class="btn-money mr-1">S/</button>
					</v-flex>
					<v-flex>
						<app-input-text
							:text="model.amount"
							label="Monto"
							model="amount"
							type="number"
							placeholder="0"
							@input="setAmount"
							@input-enter="setAmount"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-flex mt-3 px-4>
			<p class="primary--text ft-14">Calcular Utilidad por:</p>
			<v-flex xs5>
				<div class="layout">
					<button
						class="btn-tab"
						:class="{ select: model.calculate === 'ultCost' }"
						@click="calculateUtility('ultCost')"
					>
						Ult. Costo
					</button>
					<button
						v-if="showFlagKardexValued"
						class="btn-tab relative"
						:class="{ select: model.calculate === 'cProm' }"
						@click="calculateUtility('cProm')"
					>
						Costo Prom.
					</button>
				</div>
			</v-flex>
		</v-flex>
		<div xs12 class="overflow-auto pa-0">
			<app-table
				:columns="columns"
				:rows="rows"
				class="mt-3"
				color="primary"
				:input-search="false"
				:filter-columns="false"
				:items-quantity="rows.length"
				:items-total-quantity="rows.length"
				@column-input="columnInput"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.code }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.priceCost | round }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.priceCostIgv | round }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.priceUnit | round }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.priceSale | round }}
					</td>
					<td v-show="showRow(columns, 7)" class="px-2 pt-2 pb-2 width-30">
						<v-text-field
							:ref="`percentage${props.index}`"
							hide-details
							single-line
							type="number"
							class="filter-select shadow-inset input-max-width"
							:value="props.row.percentageUtility"
							:disabled="!props.row.priceCost === 0"
							@click.stop="() => false"
							@input="chnagePercentageUtility(props.row, $event)"
						></v-text-field>
					</td>
				</template>
			</app-table>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-text="Guardar"
				success-color="primary"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="$emit('edit-utility')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.model.priceListId = this.$userInfo.salPriceList.id;
	this.loadPricesLists();
}

async function loadPricesLists() {
	try {
		const response = await this.listPricingPromise();
		this.pricesLists = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function calculateUtility(value) {
	this.model.calculate = value;
	this.$emit('set-amount', this.model.typeSelect, this.model.amount, 'amount');
}

function changeHeader(value) {
	if (value === 'percentage') {
		this.types[2].show = false;
	} else {
		this.types[2].show = true;
	}
	this.model.selectHeader = value;
}

function setPriceList({ model, value }) {
	this.$emit('set-price-list', model, value);
}

function setAmount({ model, value }) {
	this.$emit('set-amount', this.model.typeSelect, value, model);
}

function changeType(value) {
	this.$emit('set-amount', value, this.model.amount, 'amount');
}

function chnagePercentageUtility(row, value) {
	this.$emit('percentage-utility', row, Number(value));
}

function columnInput(event) {
	const value = Number(event.event.target.value);
	this.$emit('column-input', value);
}

function data() {
	return {
		pricesLists: [],
	};
}

export default {
	name: 'edit-price-utility',
	created,
	components: {
		appTable,
		modalSidebarButton,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		model: {
			type: Object,
			default: {},
		},
		types: {
			type: Array,
			default: () => [],
		},
		showFlagKardexValued: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		calculateUtility,
		columnInput,
		chnagePercentageUtility,
		changeType,
		changeHeader,
		loadPricesLists,
		setAmount,
		setPriceList,
	},
	data,
};
</script>

<style lang="scss" scoped>
.border-bottom {
	border-bottom: 1px solid #e0e0e0;
}

.btn-money {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	padding: 6px 8px;
	font-weight: bold;
}

.btn-tab {
	background-color: #e5e5e5;
	border: 1px solid #e5e5e5;
	border-radius: 25px;
	color: #979797;
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
	padding: 4.5px 0;
	text-align: center;
	width: 123px;

	&.select {
		background-color: color(primary);
		color: color(white);
		z-index: 2;
	}
}

.btn-tab-header {
	background-color: #e5e5e5;
	border: 1px solid #e5e5e5;
	border-radius: 25px;
	color: #979797;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding: 4.5px 0;
	text-align: center;
	width: 90px;

	&.select-header {
		background-color: color(primary);
		color: color(white);
		font-size: 12px;
		z-index: 2;
	}
}

.relative {
	position: relative;
	right: 12px;
}

.ft-14 {
	font-size: 14px;
	font-family: font(open-bold);
}

.pa-0 {
	padding: 0 !important;
}

.width-30 {
	width: 16% !important;
}
</style>
