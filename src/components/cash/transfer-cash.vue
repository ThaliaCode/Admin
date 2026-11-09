<template>
	<div class="transfer-cash">
		<v-layout wrap>
			<section class="contend-table">
				<v-flex xs12>
					<v-divider class="background-divider"></v-divider>
					<v-layout row align-center px-4 py-3 class="back-gray">
						<v-flex>
							<v-flex xs8 class="label-title">
								TOTAL:
								<span class="open-bold ml-2"
									>{{ countryCurrencySymbol }} {{ totalTransferCash }}</span
								>
							</v-flex>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-layout row align-center px-4 py-3>
					<v-divider class="background-divider"></v-divider>
					<v-flex xs8 class="label-title"> CAJA ORIGEN: </v-flex>
					<v-flex xs4 text-xs-right class="label-total">
						{{ cashOrigen }}
					</v-flex>
				</v-layout>
				<v-flex xs12>
					<v-divider class="background-divider"></v-divider>
					<v-layout px-4 py-3>
						<v-flex xs8>
							<span class="label-title">SALDO ANTERIORrrrrrr:</span>
						</v-flex>
						<v-flex xs4 text-xs-right class="label-total open-bold"
							>{{ countryCurrencySymbol }} {{ lastBalance }}</v-flex
						>
					</v-layout>
					<v-divider class="background-divider"></v-divider>
				</v-flex>
				<v-flex xs12>
					<v-divider class="background-divider"></v-divider>
					<v-layout px-4 py-3>
						<v-flex xs8>
							<span class="label-title">SALDO ACTUAL:</span>
						</v-flex>
						<v-flex xs4 text-xs-right class="label-total open-bold"
							>{{ countryCurrencySymbol }} {{ totalIncome + totalExpense }}</v-flex
						>
					</v-layout>
					<v-divider class="background-divider"></v-divider>
				</v-flex>
			</section>

			<v-flex xs12 v-if="!isAdmin">
				<v-divider class="background-divider"></v-divider>
				<v-layout px-4 py-3>
					<v-flex xs8>
						<span class="label-title">SALDO ACTUAL OTROS EMPLEADOS:</span>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total open-bold"
						>{{ countryCurrencySymbol }} {{ otherEmployeesBalance }}</v-flex
					>
				</v-layout>
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="cashAmount">
				<v-layout px-4 py-3>
					<v-flex xs8>
						<v-checkbox
							color="primary"
							label="EFECTIVO:"
							v-model="cashFlag"
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total"
						>{{ countryCurrencySymbol }} {{ cashAmount }}</v-flex
					>
				</v-layout>
				<v-layout v-if="cashFlag" py-3 px-4 class="back-gray">
					<v-flex xs8>
						<span class="label-cash">Monto a transferir</span>
					</v-flex>
					<v-flex xs4 text-xs-right
						>{{ countryCurrencySymbol }}.{{ cashAmount - model.cashAmountKept }}</v-flex
					>
				</v-layout>
				<v-layout v-if="cashFlag" py-3 px-4 class="back-gray">
					<v-flex xs8>
						<span class="label-cash">Mantener en caja</span>
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
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="creditAmount">
				<v-layout px-4 py-3>
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
						>{{ countryCurrencySymbol }} {{ creditAmount }}</v-flex
					>
				</v-layout>
				<v-divider class="background-divider"></v-divider>
			</v-flex>
			<v-flex xs12 v-if="checkAmount">
				<v-layout px-4 py-3>
					<v-flex xs8>
						<v-checkbox
							label="MONTO CHEQUE"
							v-model="checkFlag"
							disabled
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs4 text-xs-right class="label-total"
						>{{ countryCurrencySymbol }} {{ checkAmount }}</v-flex
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
import { required, minValue, maxValue } from 'vuelidate/lib/validators';

const { round } = lib;
const twoDecimals = round(2);

function created() {
	this.loadCash();
}

async function loadCash() {
	const body = {
		cashIds: [this.params.cashIds],
		warehouseId: this.flagOutbox ? undefined : this.params.warehouseId,
	};
	const url =
		this.isAdmin || this.flagOutbox
			? `cash/${this.params.currency}/report?report=true`
			: `cash/${this.params.currency}/report?report=true&employeeId=${this.$userInfo.id}`;
	try {
		const { data: response } = await this.$httpSales.post(url, body);
		this.lastBalance = twoDecimals(response.lastBalance);
		this.totalIncome = twoDecimals(response.totalIncome);
		this.totalExpense = twoDecimals(response.totalExpense);
		this.items = response.detail;
		this.otherEmployeesBalance = twoDecimals(response.otherEmployeesBalance) || 0;
		this.items = response.detail.reduce((acum, r) => {
			const newAcum = [...acum];
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
				newAcum.push(r);
			}
			return newAcum;
		}, []);
		const indexCash = this.items.findIndex((i) => i.code === 'efectivo');
		const indexCredit = this.items.findIndex((i) => i.code === 'mount-tarj');
		const indexCheck = this.items.findIndex((i) => i.code === 'cheque');
		if (indexCash > -1) {
			this.cashAmount = this.items[indexCash].amount;
		}
		if (indexCredit > -1) {
			this.creditAmount = this.items[indexCredit].amount;
		}
		if (indexCheck > -1) {
			this.checkAmount = this.items[indexCheck].amount;
		}
		this.totalTransferCash = twoDecimals(
			this.lastBalance + this.totalIncome + this.otherEmployeesBalance + this.totalExpense
		);
	} catch (error) {
		this.showGenericError();
	}
}

async function transferCash() {
	const params = {
		currency: this.params.currency,
		cashId: this.params.cashIds,
	};
	if (this.flagOutbox) {
		delete params.closedAlready;
		delete params.stateId;
		delete params.notPaymentMethodId;
	}
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

function validations() {
	return {
		model: {
			cashIdToTransfer: { required },
			cashAmountKept: {
				required,
				minValue: minValue(0),
				maxValue: maxValue(this.cashAmount),
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
	};
}
export default {
	name: 'transfer-cash',
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
	},
	validations,
};
</script>
<style lang="scss" scoped>
.back-gray {
	background: #e2f1f1;
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
	background-color: #e2f1f1;
}

.open-bold {
	font-family: map-get($fonts, open-bold);
}

.label-title {
	color: color(paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, small);
}
.contend-table {
	border: 1px solid color(primary);
	background-color: #173737;
}
</style>
