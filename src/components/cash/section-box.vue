<template>
	<div>
		<general-filter class="layout wrap py-3 px-5">
			<v-flex xs12 sm3 pr-2 mb-2 v-if="isCash && isAdmin" class="relative">
				<v-layout column>
					<v-flex>
						<app-select
							:label="labelSucursal()"
							item-text="sucursalName"
							item-value="id"
							:item="subsidiaryId"
							model="subsidiaryId"
							:return-object="false"
							:items="subsidiaries"
							@input="getData"
						></app-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm3 pr-2 mb-2 v-if="isCash">
				<app-select
					:item="params.cashIds"
					label="Caja"
					item-text="name"
					item-value="id"
					:items="cashBoxes"
					model="cashIds"
					return-object
					@input="getData"
					:disabled="!isAdmin || selectedSubsidiary"
				></app-select>
			</v-flex>
			<v-flex xs12 sm3 pr-2 mb-2 v-else>
				<app-select
					:item="bankAccount"
					label="Cuenta bancaria"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					model="bankAccount"
					:return-object="false"
					@input="getDataBank"
				></app-select>
			</v-flex>
			<v-flex xs12 sm2 px-2 mb-2 v-if="isCash">
				<app-select
					:item="params.currency"
					label="Moneda"
					item-text="name"
					item-value="id"
					:items="currencies"
					model="currency"
					:return-object="false"
					@input="getData"
				></app-select>
			</v-flex>
			<v-flex xs12 sm1 px-2 mb-2 pt-4>
				<v-btn
					:disabled="isCash ? !cashIds: false"
					color="primary"
					class="btn-action btn-action-block"
					@click="filterCash"
				>
					Buscar
				</v-btn>
			</v-flex>
			<v-flex xs12 sm1 px-2 mb-2 pt-4>
				<v-btn
					color="pink"
					class="btn-action btn-action-block"
					@click="clearFilter"
				>
					Limpiar
				</v-btn>
			</v-flex>
		</general-filter>
		<v-layout
			wrap pa-5 mx-5
			class="section-box"
			v-if="items.length || lastBalance > 0"
		>
			<v-flex xs5>
				<vue-chart
					type="pie"
					:data="barData"
					class="graphic-container"
					:options="options"
				></vue-chart>
			</v-flex>
			<v-flex xs3 class="wrapper-legend" px-3>
				<v-layout align-center>
					<v-flex xs6 pl-4 class="center">
						<button
							class="legend b-green mr-2"
							@click="openDetail('Ingresos')"></button>
						<span class="label-legend l-green">Ingresos</span>
					</v-flex>
					<v-flex xs6 class="center">
						<button class="btn-more b-green" @click="$emit('open-entry', modelTab)">
							<v-icon color="white">add</v-icon>
						</button>
					</v-flex>
				</v-layout>
				<v-layout align-center>
					<v-flex xs6 pl-4 class="center">
						<button
							class="legend b-red mr-2"
							@click="openDetail('Egresos')"></button>
						<span class="label-legend l-red">Egresos</span>
					</v-flex>
					<v-flex xs6 class="center">
						<button class="btn-more b-red" @click="$emit('open-egress', modelTab)">
							<v-icon color="white">add</v-icon>
						</button>
					</v-flex>
				</v-layout>
				<v-layout
					wrap
					v-if="detail"
					class="wrapper-detail"
				>
					<v-flex xs6 class="wrapper-green" pt-2 px-2>
						Saldo anterior
					</v-flex>
					<v-flex xs6 class="wrapper-green" px-2 pt-2>
						{{ currentSymbol }} {{ lastBalance | round }}
					</v-flex>
					<v-flex v-if="!isAdmin" xs6 class="wrapper-yellow" pt-2 px-2>
						Venta de otros empleados
					</v-flex>
					<v-flex v-if="!isAdmin" xs6 class="wrapper-yellow" px-2 pt-2>
						{{ currentSymbol }} {{ otherEmployeesBalance | round }}
					</v-flex>
					<v-flex xs6 px-2>Venta del día</v-flex>
					<v-flex xs6 px-2>{{ currentSymbol }} {{ total | round }}</v-flex>
					<v-flex xs6 px-2 pb-2>Total acumulado</v-flex>
					<v-flex xs6 px-2 pb-2>{{ currentSymbol }} {{ totalCash | round }}</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs4 class="result-items" px-4>
				<result-items
					:items="items"
					:total="total"
					:current-symbol="currentSymbol"/>
			</v-flex>
		</v-layout>
		<v-layout
			class="section-box"
			v-else-if="selectedSubsidiary || disabledSearch"
			pa-4 mx-5
		>
			<p class="primary--text bold">Seleccione {{ labelSucursal() }}, caja y clic en Buscar</p>
		</v-layout>
		<v-layout wrap v-else pa-5 mx-5 class="section-box">
			<v-flex xs5>
				<p>La caja no cuenta con transacciones abiertas para mostrar</p>
			</v-flex>
			<v-flex xs7>
				<v-layout>
					<v-flex xs3>
						<v-layout align-center>
							<v-flex xs6 mr-3>
								<div class="legend b-green mr-2"></div>
								<span class="label-legend l-green">Ingresos</span>
							</v-flex>
							<v-flex xs4>
								<button class="btn-more b-green" @click="$emit('open-entry', modelTab)">
									<v-icon color="white">add</v-icon>
								</button>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs3>
						<v-layout align-center>
							<v-flex xs6 mr-3>
								<div class="legend b-red mr-2"></div>
								<span class="label-legend l-red">Egresos</span>
							</v-flex>
							<v-flex xs4>
								<button class="btn-more b-red" @click="$emit('open-egress', modelTab)">
									<v-icon color="white">add</v-icon>
								</button>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout mt-5 v-if="showClose && items.length" justify-center>
			<v-flex xs3 class="center">
				<button
					class="btn-close b-green"
					@click="openDialog">Cerrar Caja</button>
			</v-flex>
			<v-flex xs3 class="center">
				<button
					class="btn-close b-blue"
					@click="openDialogTransfer">Transferir a otra caja</button>
			</v-flex>
		</v-layout>
		<v-dialog v-model="closeCash" max-width="430px">
			<v-card>
				<v-card-text>
					<v-layout row>
						<v-flex xs12 class="center">¿Desea cerrar la caja?</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions class="wrapper-actions">
					<v-layout row justify-space-around>
						<v-flex xs3>
							<v-btn
								color="pink"
								class="btn-action btn-action-block"
								@click="cancelClose"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3>
							<v-btn
								color="success"
								class="btn-action btn-action-block"
								@click="closeCashBox"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
        </v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import VueChart from 'vuechart';
import generalFilter from '@/components/shared/general-filter';
import resultItems from '@/components/cash/result-items';

function created() {
	if (Object.keys(this.$route.query)) {
		if (this.$route.query.subsidiaryId) {
			this.getData({ model: 'subsidiaryId', value: Number(this.$route.query.subsidiaryId) });
		}
		if (this.$route.query.currency) {
			this.params.currency = this.$route.query.currency;
		} else {
			this.params.currency = this.$userInfo.company.currency;
		}
	} else {
		this.params.subsidiaryId = this.subsidiaryId || null;
		this.params.cashId = this.cashIds || null;
		this.params.currency = this.$userInfo.company.currency;
	}
	if (!this.isAdmin) {
		this.params.cashIds = this.$userInfo.cashId;
	}
}

function openDialog() {
	this.closeCash = true;
}

function changeKeepMoney(value) {
	this.transferMoney = !value;
}

function changeTransferMoney(value) {
	this.keepMoney = !value;
}

function cancelClose() {
	this.closeCash = false;
}

function dataGraphic(value) {
	this.barData = value;
}

function getData({ model, value }) {
	this.params[model] = value.id || value;
	if (model === 'cashIds') {
		this.$emit('change-cash', value);
	} else if (model === 'subsidiaryId') {
		this.$emit('change-subsidiary', value);
	}
}

function filterCash() {
	this.disabledSearch = false;
	this.$emit('filter-cash', this.params, this.bankAccount);
}

function clearFilter() {
	this.disabledSearch = true;
	this.$emit('clear-filter');
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function bankAccounts(values) {
	if (values.length) {
		this.bankAccount = this.bankAccounts[0].id;
	}
}

function getDataBank(item) {
	this.bankAccount = item.value;
}

function getDataSubsidiary({ model, value }) {
	this.params[model] = value;
}

async function closeCashBox() {
	const params = {
		currency: this.params.currency,
		cashId: this.selectCash.id,
	};
	const body = {};
	if (this.cashDestinationId) {
		params.cashDestinationId = this.cashDestinationId;
	}
	try {
		await this.$httpSales.post('cash-desk-closing/mobile', body, { params });
		this.showNotification('La caja se cerró correctamente');
		this.closeCash = false;
		this.$emit('update-cash');
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'CASH_DESK_CLOSING_NOT_FOUND') {
				this.showNotification('La caja ya esta cerrada.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function clickGraphic(context, value, item) {
	/* eslint-disable dot-notation  */
	const flag = item[0]['_model'].label;
	if (flag === 'Ingresos' || flag === 'Egresos') {
		context.goDetail(context, flag);
	}
}

function openDetail(flag) {
	this.goDetail(this, flag);
}

function goDetail(cont, flag) {
	const typeMovement = flag === 'Ingresos' ? 1 : 2;
	let cashName = null;
	let cashId = null;
	let subsidiaryId = null;
	// let bankAccount = null;
	if (cont.cashBoxes.length) {
		cashName = cont.cashBoxes.find(c => c.id === cont.params.cashIds).name;
		cashId = cont.params.cashIds;
		subsidiaryId = cont.subsidiaryId;
	} else {
		cashName = cont.bankAccounts.find(c => c.id === cont.bankAccount).name;
	}
	const query = {
		currency: cont.params.currency,
		typeMovement,
		cashName,
		cashId,
		subsidiaryId,
	};
	if (this.isCash) {
		query.warehouseName = this.selectCash.warehouse.name;
	}
	this.goTo('box-detail', { params: { id: cont.params.cashIds }, query });
}

function openDialogTransfer() {
	this.$emit('transfer-cash');
}

function flagSet() {
	this.params.subsidiaryId = this.subsidiaryId || null;
	this.params.cashIds = this.cashIds || null;
}

function data() {
	return {
		boxes: [],
		barData: {
			datasets: [{
				data: [],
				backgroundColor: [],
			}],
			labels: [],
		},
		options: {
			legend: {
				display: false,
			},
			onClick: (value, item) => this.clickGraphic(this, value, item),
		},
		closeCash: false,
		transferMoney: false,
		keepMoney: true,
		params: {
			cashIds: null,
			currency: null,
		},
		bankAccount: null,
		cashDestinationId: null,
		closeCashOne: false,
		disabledSearch: true,
	};
}
export default {
	name: 'section-box',
	data,
	components: {
		[VueChart.name]: VueChart,
		generalFilter,
		resultItems,
	},
	computed: {
		isAdmin,
	},
	created,
	methods: {
		openDialog,
		changeKeepMoney,
		changeTransferMoney,
		cancelClose,
		getData,
		getDataSubsidiary,
		filterCash,
		clearFilter,
		getDataBank,
		closeCashBox,
		clickGraphic,
		openDetail,
		goDetail,
		openDialogTransfer,
	},
	props: {
		showClose: {
			default: false,
			type: Boolean,
		},
		selectedSubsidiary: {
			default: true,
			type: Boolean,
		},
		currencies: {
			default: () => [],
			type: Array,
		},
		cashBoxesAll: {
			default: () => [],
			type: Array,
		},
		cashBoxes: {
			default: () => [],
			type: Array,
		},
		items: {
			default: () => [],
			type: Array,
		},
		dataGraphic: {
			default: () => {},
			type: Object,
		},
		total: [Number, String],
		bankAccounts: {
			default: () => [],
			type: Array,
		},
		isCash: {
			default: false,
			type: Boolean,
		},
		currentSymbol: String,
		selectCash: {
			default: () => {},
			type: Object,
		},
		modelTab: [String, Number],
		lastBalance: [String, Number],
		totalCash: [String, Number],
		detail: {
			type: Boolean,
			default: false,
		},
		otherEmployeesBalance: [String, Number],
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		subsidiaryId: [Number, String],
		cashIds: [Number, String],
		flagSet: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		dataGraphic,
		bankAccounts,
		flagSet,
	},
};
</script>
<style lang="scss" scoped>
	.legend {
	  display: inline-block;
		height: 19px;
		width: 19px;
	}

	.b-green {
		background: map-get($colors, bullet-list);
	}

	.b-red {
		background: map-get($colors, notifications);
	}

	.btn-more {
		border-radius: 5px;
		height: 33px;
		width: 33px;
	}

	.wrapper-legend {
		display: flex;
		flex-direction: column;
	}

	.label-legend {
		font-size: 12px;
	}

	.l-red {
		color: map-get($colors, notifications);
	}

	.l-green {
		color: map-get($colors, bullet-list);
	}

	.section-box {
		background: map-get($colors, white);
		border-radius: 16px;
	}

	.result-items {
		border-left: 2px solid map-get($colors, expansion-panel-header);
	}

	.btn-close {
		border-radius: 5px;
		color: map-get($colors, white);
		height: 40px;
		min-width: 236px;
	}

	.center {
		text-align: center;
	}

	.wrapper-actions {
		background: map-get($colors, stepper-content);
	}

	.wrapper-detail {
		background: map-get($colors, gray-light);
		border-radius: 4px;
		font-size: 14px;
	}

	.wrapper-green {
		background: map-get($colors, green-wrapper);
	}

	.b-blue {
		background: map-get($colors, blue-purchase);
	}


	.wrapper-yellow {
		background: map-get($colors, warning);
	}

	.absolute-text {
		bottom: -24px;
		position: absolute;
	}

	.relative {
		position: relative;
	}

	.bold {
		font-weight: bold;
		font-size: 25px;
	}
</style>
