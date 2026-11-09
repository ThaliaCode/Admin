<template>
	<div class="transfer-cash">
		<v-layout wrap>
			<v-container class="contend-table">
				<v-flex xs12>
					<v-layout row align-center px-4 py-3 class=" ">
						<v-flex>
							<v-flex xs8 class="">
								TOTAL:
								<span class="open-bold ml-2"
									>{{ countryCurrencySymbol }} {{ totalTransferCash }}</span
								>
							</v-flex>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-layout
					row
					align-center
					px-4
					py-3
					class="border-top-green b-grace2"
					align-start
				>
					<v-flex xs8 class="label-title"> CAJA ORIGEN: </v-flex>
					<v-flex xs4 text-xs-right class="label-total label-title">
						{{ cashOrigen }}
					</v-flex>
				</v-layout>
				<v-flex xs12>
					<v-layout px-4 py-3 align-start>
						<v-flex xs8>
							<span class="label-title">SALDO ANTERIOR:</span>
						</v-flex>
						<v-flex xs4 text-xs-right class="label-total open-bold label-title"
							>{{ countryCurrencySymbol }} {{ lastBalance }}</v-flex
						>
					</v-layout>
				</v-flex>
				<v-flex xs12 class="b-grace2">
					<v-layout px-4 py-3 align-start>
						<v-flex xs8>
							<span class="label-title">SALDO ACTUAL:</span>
						</v-flex>
						<v-flex xs4 text-xs-right class="label-total open-bold label-title"
							>{{ countryCurrencySymbol }} {{ totalAmount }}</v-flex
						>
					</v-layout>
				</v-flex>
			</v-container>

			<v-flex xs12 v-if="!isAdmin">
				<v-divider class="background-divider"></v-divider>
				<v-layout px-4 py-3 align-start>
					<v-flex xs8>
						<span class="label-title">SALDO ACTUAL OTROS EMPLEADOS:</span>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total open-bold label-title"
						>{{ countryCurrencySymbol }} {{ otherEmployeesBalance }}</v-flex
					>
				</v-layout>
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="cashAmount">
				<v-layout px-4 py-3 align-start>
					<v-flex xs8>
						<v-checkbox
							color="primary"
							label="EFECTIVO:"
							v-model="cashFlag"
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total"
						>{{ countryCurrencySymbol }} {{ cashAmount | round }}</v-flex
					>
				</v-layout>
				<v-layout v-if="cashFlag" py-3 px-4 class="box-green" align-start>
					<v-flex xs8>
						<span class="label-title">Monto a transferir</span>
					</v-flex>
					<v-flex xs4 text-xs-right
						>{{ countryCurrencySymbol }}.{{
							(cashAmount - model.cashAmountKept) | round
						}}</v-flex
					>
				</v-layout>
				<v-layout v-if="cashFlag" py-3 px-4 class="box-green" align-start>
					<v-flex xs8>
						<span class="label-title">Mantener en caja</span>
					</v-flex>
					<v-flex xs4>
						<v-text-field
							class="filter-select shadow-inset"
							v-model="model.cashAmountKept"
							type="number"
						>
						</v-text-field>
					</v-flex>
				</v-layout>
				<v-layout
					v-if="cashFlag"
					px-4
					py-2
					class="box-green rigth-text"
					align-start
					justify-end
				>
					<v-flex justify-end class="ext-xs-righ">
						<span
							class="form-group__message text-xs-righ"
							v-if="!$v.model.cashAmountKept.maxMoneyValue"
						>
							El monto a mantener no puede superar el monto a transferir
						</span>
					</v-flex>
				</v-layout>

				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="creditAmount">
				<v-layout px-4 py-3 align-start>
					<v-flex xs8>
						<v-checkbox
							color="primary"
							label="MONTO TARJ. DE CRÉDITO"
							v-model="creditFlag"
							disabled
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total"
						>{{ countryCurrencySymbol }} {{ creditAmount | round }}</v-flex
					>
				</v-layout>
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="checkAmount">
				<v-layout px-4 py-3 align-start>
					<v-flex xs8>
						<v-checkbox
							label="MONTO CHEQUE"
							v-model="checkFlag"
							disabled
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total"
						>{{ countryCurrencySymbol }} {{ checkAmount | round }}</v-flex
					>
				</v-layout>
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-layout row align-center px-4 mt-3>
				<v-flex xs12 pl-2>
					<app-select
						label="Seleccionar caja:"
						item-text="name"
						item-value="id"
						:item="model.cashIdToTransfer"
						model="cashIdToTransfer"
						:items="cashBoxesAll"
						@input="getDataBox"
					></app-select>
					<span class="form-group__message" v-if="!$v.model.cashIdToTransfer.required">
						La caja es requerida
					</span>
				</v-flex>
			</v-layout>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				:on-run-service="loading"
				success-text="Cerrar Caja"
				success-color="primary"
				:img="false"
				padding-cancel="px-4 py-2"
				padding-success="px-4 py-2"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="transferCash"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import lib from '@/shared/lib';
import { required, minValue } from 'vuelidate/lib/validators';

const { round } = lib;
const twoDecimals = round(2);

function created() {
	this.loadCash();
}

async function loadCash() {
	const body = {
		cashId: this.cashId,
		cashClosingId: this.cashClosing,
	};
	try {
		const { data: response } = await this.$httpSales.post(
			`cash/${this.currency}/dashboard`,
			body,
			{ params: { report: true } }
		);
		this.lastBalance = twoDecimals(response.lastBalance);
		this.totalIncome = twoDecimals(response.totalIncome);
		this.totalExpense = twoDecimals(response.totalExpense);
		this.otherEmployeesBalance = twoDecimals(response.otherEmployeesBalance) || 0;
		const { items } = response.detail.reduce(
			(acum, r) => {
				const newAcum = [...acum.items];
				const newTotalAmount = acum.totalAmount + Number(r.amount || 0);

				if (r.code !== 'cheque' && r.code !== 'efectivo') {
					const index = newAcum.findIndex((a) => a.code === 'mount-tarj');
					if (index > -1) {
						newAcum[index].amount += r.amount;
						newAcum[index].details.push({
							id: r.id,
							code: r.code,
							amount: r.amount,
							name: r.name,
							typePaymentId: null,
						});
					} else {
						newAcum.push({
							id: 'mount-tarj',
							code: 'mount-tarj',
							amount: r.amount,
							name: 'Monto Tarj. De Crédito',
							typePaymentId: null,
							icon: 'arrow_drop_down',
							open: false,
							details: [
								{
									id: r.id,
									code: r.code,
									amount: r.amount,
									name: r.name,
									typePaymentId: null,
								},
							],
						});
					}
				} else {
					const index = newAcum.findIndex((a) => a.code === r.code);
					if (index > -1) {
						newAcum[index].amount += r.amount;
					} else {
						newAcum.push({ ...r });
					}
				}

				return {
					items: newAcum,
					totalAmount: newTotalAmount,
				};
			},
			{
				items: [],
				totalAmount: 0,
			}
		);
		this.items = items;
		// this.totalAmount = twoDecimals(totalAmount);
		this.totalAmount = twoDecimals(response.totalAmount);
		const indexCash = this.items.findIndex((i) => i.code === 'efectivo');
		const indexCredit = this.items.findIndex((i) => i.code === 'mount-tarj');
		const indexCheck = this.items.findIndex((i) => i.code === 'cheque');
		console.log('this.items', this.items);
		if (indexCash > -1) {
			this.cashAmount = this.items[indexCash].amount;
		}
		if (indexCredit > -1) {
			this.creditAmount = this.items[indexCredit].amount;
		}
		if (indexCheck > -1) {
			this.checkAmount = this.items[indexCheck].amount;
		}
		this.totalTransferCash = twoDecimals(this.totalAmount);
	} catch (error) {
		this.showGenericError();
	}
}

async function transferCash() {
	const params = {
		currency: this.currency,
		cashId: this.cashId,
	};
	const body = {
		cashIdToTransfer: this.model.cashIdToTransfer,
		cashAmountKept: Number(this.model.cashAmountKept),
	};
	this.loading = true;
	try {
		await this.$httpSales.post('cash-desk-closing/mobile', body, { params });
		this.showNotification('La caja se cerró correctamente');
		this.$emit('close');
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'CASH_DESTINY_NOT_ALLOWED') {
				this.showGenericError('La caja destino no puede ser la caja de origen');
			} else if (err.data.message === 'CASH_DESK_CLOSING_TRANSFER_NEGATIVE') {
				this.showGenericError(
					'El monto a transferir no puede ser negativo, verifique el tipo de pago y el monto a transferir'
				);
			} else if (err.data.message === 'CASH_DESK_CLOSING_NOT_FOUND') {
				this.showGenericError('No se encontro la caja a cerrar');
			} else {
				this.showGenericError();
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function getDataBox({ model, value }) {
	this.model[model] = value.id;
}

const maxMoneyValue = (max) => (value) =>
	Math.round(value * 100) <= Math.round(max * 100);

function validations() {
	return {
		model: {
			cashIdToTransfer: { required },
			cashAmountKept: {
				required,
				minValue: minValue(0),
				maxMoneyValue: maxMoneyValue(this.cashAmount),
			},
		},
	};
}

function data() {
	return {
		loading: false,
		model: {
			cashIdToTransfer: null,
			cashAmountKept: 0,
		},
		creditFlag: true,
		checkFlag: true,
		cashFlag: true,
		cashAmount: null,
		creditAmount: null,
		checkAmount: null,
		items: [],
		lastBalance: null,
		totalTransferCash: null,
		totalIncome: null,
		otherEmployeesBalance: null,
		totalExpense: null,
		totalAmount: 0,
	};
}
export default {
	name: 'transfer-cash-internal',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	computed: {
		isAdmin,
	},
	methods: {
		getDataBox,
		loadCash,
		transferCash,
	},
	props: {
		cashBoxesAll: {
			type: Array,
			default: () => [],
		},
		params: {
			type: Object,
			default: () => {},
		},
		cashOrigen: [String],
		cashBoxes: {
			type: Array,
			default: () => [],
		},
		cashClosing: [String, Number],
		cashId: [String, Number],
		currency: [String, Number],
	},
	validations,
};
</script>
<style lang="scss" scoped>
.color-green {
	font-weight: bold;
	color: color(primary);
}
.b-grace2 {
	background-color: #f5f5f5;
}
.border-top-green {
	border-top: 1px solidcolor(primary);
}

.label-cash {
	color: color(paginationText);
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, small);
}

.label-total {
	color: color(paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, medium);
}

.background-divider {
	background-color: color(primary);
}

.open-bold {
	font-family: map-get($fonts, open-bold);
}

.label-title {
	color: color(primary);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, small);
}
.contend-table {
	padding: 0;
	margin: 50px 33px 0 33px;
	overflow: hidden;
	border-radius: 10px;
	border: 1px solid color(primary);
}
.transfer-cash {
	background-color: #fbfbfb;
}
.box-green {
	background-color: #e6f7f6;
}
</style>
