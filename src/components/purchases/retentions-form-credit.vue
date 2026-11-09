<template>
	<div>
		<div v-if="isEcuador">
			<p class="text-title mx-3 px-2">RETENCIÓN</p>
			<v-layout wrap align-end px-4 mb-3>
				<v-flex xs12 pb-2 body-1>
					<v-layout row wrap>
						<v-flex xs3 pt-2>
							<label class="caption">Retención Serie - Nro</label>
						</v-flex>
						<v-flex xs9>
							<v-layout row wrap>
								<v-flex xs5 pr-2>
									<app-input-text
										model="serie"
										:text="model.serie"
										:max-length="maxLengthSerie"
										@input="setRetentionData"
									></app-input-text>
									<!-- <span class="form-group__message" v-if="!model.serie">
										La serie es requerida
									</span> -->
								</v-flex>
								<v-flex xs5 pr-2>
									<app-input-text
										model="number"
										:text="model.number"
										type="number"
										@input="setRetentionData"
									></app-input-text>
									<!-- <span class="form-group__message" v-if="!model.number">
										El número es requerido
									</span> -->
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout wrap align-center px-4>
				<v-flex xs12 px-1 class="subheader-container">
					<v-subheader class="black--text body-2 px-2">
						RETENCIONES {{ isPeru ? 'IGV' : 'IVA ' }}
					</v-subheader>
				</v-flex>
				<v-flex xs12>
					<v-layout wrap>
						<v-flex xs12 v-for="(good, goodIndex) in goodsGroups" :key="goodIndex">
							<v-layout wrap align-end py-2>
								<v-flex xs3 px-3 class="pos-relative">
									<app-input-text
										class="label-input-retention"
										:disabled="readonly"
										:error="errors.goods.show"
										label="Base"
										model="base"
										:readonly="readonly"
										:text="good.base"
										type="number"
										@input="getGoodsValue($event, good, goodIndex)"
									/>
								</v-flex>
								<v-flex xs4 pr-2>
									<app-select
										clearable
										solo
										:item="good.retentionCode"
										item-text="autocomplete"
										item-value="code"
										:items="ivaRetentionCodes"
										:label="isEcuador ? 'Código Retención SRI' : 'Código Retención'"
										model="retentionCode"
										:return-object="false"
										@input="getGoodsValue($event, good, goodIndex)"
									/>
								</v-flex>
								<v-flex xs2 px-2>
									<app-input-text
										class="label-input-retention"
										:disabled="readonly"
										label="% Ret"
										model="retentionPercentage"
										readonly
										:text="good.retentionPercentage"
										type="number"
										@input="getGoodsValue($event, good, goodIndex)"
									/>
								</v-flex>
								<v-flex xs2 pl-2>
									<app-input-text
										class="label-input-retention"
										:disabled="readonly"
										label="Valor Ret."
										tooltip="Valor Retenido"
										model="retentionAmount"
										readonly
										:text="good.retentionAmount | round"
										type="number"
										@input="getGoodsValue($event, good, goodIndex)"
									/>
								</v-flex>
								<v-flex xs1 pl-2>
									<app-tooltip-button
										:disabled="disabledBtnAdd"
										color="primary"
										icon="add_box"
										text="Agregar fila"
										@click-icon="addRowGood"
									></app-tooltip-button>
									<app-tooltip-button
										color="error"
										icon="indeterminate_check_box"
										text="Eliminar fila"
										v-if="goodsGroups.length > 1"
										@click-icon="removeRowGood(goodIndex)"
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout wrap align-center px-4>
				<v-flex xs12 px-1 class="subheader-container">
					<v-subheader class="black--text body-2 px-2">
						RENTENCIONES RENTA
						<span class="form-group__message pos-relative pl-2" v-if="errors.rent.show">
							{{ errors.rent.message }}
						</span>
					</v-subheader>
				</v-flex>
				<v-flex xs12>
					<v-layout
						wrap
						pt-2
						align-center
						v-for="(rent, rentIndex) in groupCodes"
						:key="rentIndex"
					>
						<v-flex x12>
							<v-layout row wrap align-end>
								<v-flex :class="fromSale ? 'xs3' : 'xs4'">
									<v-layout row wrap align-end>
										<v-flex
											:class="fromSale ? 'xs12 px-3' : 'xs3 pr-1'"
											v-for="(base, baseIndex) in rent.bases"
											:key="baseIndex"
										>
											<app-input-text
												class="label-input-retention"
												:disabled="readonly"
												:label="rentIndex === 0 ? limitText(base.description, 13) : ''"
												:tooltip="base.description"
												model="value"
												:limit-to-filter="7"
												:readonly="readonly"
												:text="base.value"
												type="number"
												@input="getRentValue($event, rent.bases[baseIndex], rent)"
											/>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs4 pr-2 class="pos-relative">
									<app-select
										:item="rent.retentionCode"
										item-text="autocomplete"
										item-value="code"
										:items="retentionCodes"
										label="Código Retención SRI"
										model="retentionCode"
										:return-object="false"
										@input="getRentValue($event, rent)"
									/>
								</v-flex>
								<v-flex xs4>
									<v-layout wrap align-center>
										<v-flex xs6 px-2>
											<app-input-text
												class="label-input-retention"
												:disabled="readonly"
												:label="rentIndex === 0 ? '% Ret' : ''"
												model="retentionPercentage"
												readonly
												:text="rent.retentionPercentage"
												type="number"
												@input="getRentValue"
											/>
										</v-flex>
										<v-flex xs6 pl-2>
											<app-input-text
												class="label-input-retention"
												:disabled="readonly"
												:label="rentIndex === 0 ? 'Valor Ret.' : ''"
												tooltip="Valor Retenido"
												model="retentionAmount"
												readonly
												:text="rent.retentionAmount | round"
												type="number"
												@input="getRentValue"
											/>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs1 pl-2>
									<app-tooltip-button
										:disabled="disabledBtnAdd"
										color="primary"
										icon="add_box"
										:readonly="disabledBtnAdd"
										text="Agregar fila"
										@click-icon="addRow"
									></app-tooltip-button>
									<app-tooltip-button
										color="error"
										icon="indeterminate_check_box"
										text="Eliminar fila"
										v-if="groupCodes.length > 1"
										@click-icon="removeRow(rentIndex)"
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<v-layout wrap class="container-totals" px-5 mt-4 py-3>
			<v-flex xs6 pr-3>
				<v-layout wrap>
					<v-flex xs12 mb-2>
						<app-input-text
							label="Total Comisión"
							model="totalCommission"
							:text="model.totalCommission"
							type="number"
							@input="setRetentionData"
						/>
					</v-flex>
					<v-flex xs12 mb-2>
						<app-input-text
							:label="`Total Ret. ${isPeru ? 'IGV' : 'IVA'}`"
							:text="totalValueRetIva | round"
							readonly
							type="number"
						/>
					</v-flex>
					<v-flex xs12>
						<app-input-text
							label="Total Ret Renta"
							:text="totalValueRetRent | round"
							readonly
							type="number"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 pl-3>
				<v-flex xs12 mb-2>
					<app-input-text
						label="T. Rest. al Dep."
						:text="tRestalDep | round"
						readonly
						type="number"
					/>
				</v-flex>
				<v-flex xs12>
					<app-input-text
						label="Valor Neto"
						:text="netWorth | round"
						readonly
						type="number"
					/>
				</v-flex>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading || disabled"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import tableCode from '@/shared/table-code';

const { debounce } = helper;
// const { map, round, setNewPropertyByFunction } = lib;
const { map, setNewPropertyByFunction } = lib;
// const decimals2 = round(2);

function created() {
	const baseSale = {
		code: null,
		description: 'Base',
		id: null,
		percentage: 0,
		value: 0,
	};
	this.basesByModule = this.fromSale ? [{ ...baseSale }] : this.bases;
	this.loadRetentionCodes();
}

function addRow() {
	this.groupCodes.push({
		accountingCode: 0,
		bases: this.basesByModule.map((base) => {
			const newBase = { ...base };
			newBase.value = 0;
			return newBase;
		}),
		retentionAmount: 0,
		retentionCode: null,
		retentionPercentage: 0,
		subtotal: 0,
		basesTotal: 0,
	});
}

function addRowGood() {
	this.goodsGroups.push({
		accountingCode: 0,
		base: 0,
		retentionAmount: 0,
		retentionCode: null,
		retentionPercentage: 0,
	});
}

function disabledBtnAdd() {
	return false;
}

function getGoodsValue({ model, value }, item, index) {
	if (value) {
		if (model === 'retentionCode') {
			this.$set(item, model, value);
		} else {
			this.$set(item, model, Number.parseFloat(value).toFixed(2));
		}
		if (model === 'retentionCode') {
			const retentionGoods = this.ivaRetentionCodes.find((rc) => rc.code === value) || {};
			const retentionPercentageGoods = retentionGoods.percentage || 0;
			const retentionAmount = item.base * (retentionPercentageGoods / 100);
			this.$set(item, 'retentionAmount', retentionAmount);
			this.$set(item, 'retentionPercentage', retentionGoods.percentage);
		} else if (this.goodsGroups[index].retentionCode) {
			const retentionValue = this.goodsGroups[index].retentionPercentage / 100;
			const goodsRetentionAmount = Number(value) * retentionValue;
			this.$set(item, 'retentionAmount', goodsRetentionAmount);
		}
	} else {
		this.goodsGroups[0].accountingCode = 0;
		this.goodsGroups[0].base = 0;
		this.goodsGroups[0].retentionAmount = 0;
		this.goodsGroups[0].retentionPercentage = 0;
	}
}

function getRentValue({ model, value }, item, itemParent) {
	if (value) {
		if (model === 'retentionCode') {
			this.$set(item, model, value);
		} else {
			this.$set(item, model, Number.parseFloat(value).toFixed(2));
		}
		const newValue = itemParent ? itemParent.retentionCode : value;
		const newItem = itemParent || item;
		this.setGroupsCodes(newItem, newValue);
	}
}

async function loadRetentionCodes() {
	const request = [
		this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRetention}`),
		this.$httpSales.get(`catalog-sunat-details-list/${tableCode.Retentions}`),
	];
	[{ data: this.ivaRetentionCodes }, { data: this.retentionCodes }] = await Promise.all(
		request
	);
	this.setAutoCompleteFieldOn('ivaRetentionCodes', this.ivaRetentionCodes);
	this.setAutoCompleteFieldOn('retentionCodes', this.retentionCodes);
}

function setAutoCompleteFieldOn(flag, retentionCodes) {
	this[flag] = map(
		setNewPropertyByFunction('autocomplete', this.addProperties, false),
		retentionCodes
	);
}

function addProperties({ catalogSunatId, code, description, percentage }) {
	if (catalogSunatId === 9) {
		return `${code} - ${description} ${percentage}%`;
	}
	return `${code} - ${description}`;
}

function save() {
	const newBody = {};
	newBody.details = this.groupCodes.map((gc, gcIndex) => {
		const zero = { value: 0 };
		const recorded = { value: 0 };
		const tax = gc.bases[0];
		const exempt = { value: 0 };
		const newGc = {
			baseZero: zero.value,
			baseRecorded: recorded.value,
			baseTax: Number(tax.value),
			baseExempt: exempt.value,
			namePercentageTax: null,
			codePercentageTax: gc.retentionCode,
			percentageTax: gc.retentionPercentage,
			amountTax: gc.retentionAmount,
			codeAccounting: null,
			codeTax: '1',
			nameTax: 'RENTA',
			description: null,
			numberOrder: 1 + gcIndex,
		};
		return newGc;
	});
	if (this.goodsGroups.length) {
		const newGood = this.goodsGroups.map((good) => {
			const newRet = {
				baseIva: Number(good.base),
				namePercentageTax: null,
				codePercentageTax: good.retentionCode,
				percentageTax: good.retentionPercentage,
				amountTax: good.retentionAmount,
				codeAccounting: null,
				codeTax: '2',
				nameTax: 'IVA',
				numberOrder: newBody.details.length + 1,
			};
			return newRet;
		});
		newBody.details = newBody.details.concat(newGood);
	}
	this.$emit('save', newBody, this.model.totalCommission, this.netWorth);
}

function setGroupsCodes(group, val) {
	const basesSubtotal = group.bases.reduce((acum, base) => acum + Number(base.value), 0);
	const retention = this.retentionCodes.find((ret) => ret.code === val) || {};
	const percentage = retention.percentage || 0;
	const amount = percentage ? basesSubtotal * (percentage / 100) : 0;
	this.$set(group, 'basesTotal', basesSubtotal);
	this.$set(group, 'retentionPercentage', percentage);
	this.$set(group, 'retentionAmount', amount);
}

function removeRow(indexGroup) {
	this.groupCodes.splice(indexGroup, 1);
}

function removeRowGood(index) {
	this.goodsGroups.splice(index, 1);
}

function totalIva() {
	return this.goodsGroups.reduce((acum, g) => acum + Number(g.base), 0);
}

function totalValueRetIva() {
	return this.goodsGroups.reduce((acum, g) => acum + Number(g.retentionAmount), 0);
}

function totalsRent() {
	const valuesByBases = this.groupCodes.reduce((a, gc) => a.concat(gc.bases), []);
	return valuesByBases.reduce((a, gc, gcIdx) => {
		const newBase = { baseCode: null, baseValue: 0 };
		const newA = [...a];
		const baseFinded = newA.findIndex((d) => d.baseCode === gc.code);
		if (baseFinded > -1 || (this.fromSale && gcIdx > 0)) {
			const newBaseFinded = { ...newA[baseFinded] };
			newBaseFinded.baseValue = Number(newBaseFinded.baseValue) + Number(gc.value);
			newA[baseFinded] = { ...newBaseFinded };
		} else {
			newBase.baseCode = gc.code;
			newBase.baseValue = Number(gc.value);
			newA.push({ ...newBase });
		}
		return newA;
	}, []);
}

function limitText(text, size) {
	if (text) {
		if (text.length > size) {
			const cutText = text.substring(0, size);
			return `${cutText}...`;
		}
		return text;
	}
	return text;
}

function totalValueRetRent() {
	return this.groupCodes.reduce((a, tr) => Number(a) + Number(tr.retentionAmount), 0);
}

function setRetentionData($event) {
	this.$emit('set-data', $event);
}

function tRestalDep() {
	return (
		Number(this.totalValueRetIva) +
		Number(this.totalValueRetRent) +
		Number(this.model.totalCommission)
	);
}

function netWorth() {
	return Number(this.totalCredited) - Number(this.tRestalDep);
}

function changeNetWorth(value) {
	this.$emit('change-total', value);
}

function disabled() {
	return (
		!this.model.dateDocument ||
		!this.tRestalDep ||
		this.model.totalCommission >= this.totalCredited
	);
}

function maxLengthSerie() {
	return this.isEcuador ? 6 : null;
}

function data() {
	return {
		basesByModule: [],
		errors: {
			goods: {
				message: '',
				show: false,
			},
			rent: {
				message: '',
				show: false,
			},
			services: {
				message: '',
				show: false,
			},
		},
		goodsGroups: [
			{
				accountingCode: 0,
				base: 0,
				retentionAmount: 0,
				retentionCode: null,
				retentionPercentage: 0,
			},
		],
		groupCodes: [
			{
				accountingCode: 0,
				bases: [
					{
						code: null,
						description: 'Base',
						id: null,
						percentage: 0,
						value: 0,
					},
				],
				basesTotal: 0,
				retentionAmount: 0,
				retentionCode: null,
				retentionPercentage: 0,
				subtotal: 0,
			},
		],
		ivaRetentionCodes: [],
		productsAmount: 0,
		retentionCodes: [],
		totalCommission: null,
	};
}

export default {
	name: 'retentions-form',
	components: {
		autocompleteComponent,
		dateComponent,
		modalSidebarButton,
	},
	computed: {
		disabledBtnAdd,
		maxLengthSerie,
		totalIva,
		totalValueRetIva,
		totalsRent,
		totalValueRetRent,
		tRestalDep,
		netWorth,
		disabled,
	},
	created,
	data,
	methods: {
		addProperties,
		addRow,
		getGoodsValue: debounce(getGoodsValue),
		getRentValue: debounce(getRentValue),
		limitText,
		loadRetentionCodes,
		removeRow,
		save,
		setAutoCompleteFieldOn,
		setGroupsCodes,
		setRetentionData,
		addRowGood,
		removeRowGood,
	},
	props: {
		bases: {
			default: () => [],
			type: Array,
		},
		readonly: {
			deafult: false,
			type: Boolean,
		},
		fromSale: {
			deafult: false,
			type: Boolean,
		},
		model: {
			default: () => {},
			type: Object,
		},
		totalCredited: [String, Number],
		isLoading: {
			deafult: false,
			type: Boolean,
		},
	},
	watch: {
		netWorth: changeNetWorth,
	},
};
</script>

<style lang="scss" scoped>
.subheader-container {
	background-color: map-get($colors, hover-background-action);
	color: map-get($colors, paginationText);
}

.subheader {
	height: 34px;
}

.summary {
	background-color: map-get($colors, summary);
	border-bottom: 1px solid map-get($colors, blue-grey);
	border-right: 1px solid map-get($colors, blue-grey);

	.caption {
		font-weight: bold;
	}

	&-header {
		background-color: map-get($colors, summaryHeader);
		border-bottom: 1px solid map-get($colors, blue-grey);
	}

	&:last-of-type {
		border-right: 0px;
	}
}

.form-group__message {
	position: absolute;
}

.pos-relative {
	position: relative;
}

.margin-left-auto {
	margin-left: auto;
}

.error-caption {
	font-size: size(small10);
	position: absolute;
}

.label-customer {
	color: color(paginationText);
	font-family: font(open-regular);
	font-size: size(small13);
}

.label-document {
	font-family: font(open-semibold);
	padding-right: 15px;
}

.mx-datepicker {
	display: block !important;
}

.text-title {
	color: map-get($colors, paginationText);
	border-bottom: 1px solid map-get($colors, item-select);
	font-size: 14px;
}

.container-totals {
	background-color: map-get($colors, hover-background-action);
	border-top: 2px solid map-get($colors, primary);
}
</style>
