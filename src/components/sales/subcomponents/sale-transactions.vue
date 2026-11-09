<template>
	<div>
		<app-table
			class="transactions-table"
			:columns="columns"
			:mainList="false"
			:rows="rows"
			:inputSearch="false"
			:filterColumns="false"
		>
			<template slot="rows" slot-scope="props">
				<td
					:class="[
						'is-not-selectable',
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
				>
					{{ props.row.createdAt | formatDate }}
				</td>
				<td
					:class="[
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
				>
					{{ getOperationNumber(props.row) || '--' }}
				</td>
				<td
					:class="[
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
				>
					{{ props.row.amount }}
				</td>
				<td
					:class="[
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
				>
					{{ getTypeAmortizationName(props.row) }}
				</td>
				<td
					:class="[
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
				>
					{{ props.row.stateConciliationCode }}
				</td>
				<td
					:class="[
						'cell',
						{ 'transaction-disabled': transactionDisabled(props.row) },
					]"
					@click.stop="stopClick"
				>
					{{ props.row.stateAccountingCode }}
				</td>
				<td>
					<app-tooltip-button
						icon="remove_red_eye"
						text="Ver Detalle"
						color="primary"
						size="12"
						@click-icon="details(props.row)"
					/>
					<button
						:disabled="transactionDisabled(props.row)"
						class="table-icon"
						@click="openDialog(props.row)"
					>
						<v-icon color="pink" size="19"> highlight_off </v-icon>
					</button>
					<app-tooltip-button
						color="success"
						icon="insert_drive_file"
						:disabled="!props.row.amortization.urlImage"
						:text="
							!props.row.amortization.urlImage
								? 'No tiene voucher'
								: 'ver voucher'
						"
						@click-icon="showVoucher(props.row.amortization.urlImage)"
					/>
				</td>
			</template>
		</app-table>

		<section class="transation-additional-data-section" v-if="showTransaction">
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">Fecha</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.paymentDate }}
				</div>
			</div>
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">F. Ult. Act</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.updatedAt | formatDate }}
				</div>
			</div>
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">F. Eliminacion</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.dataAudit.dateDeleted }}
				</div>
			</div>
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">Emp. Reg</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.dataAudit.lastUserModified }}
				</div>
			</div>
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">Emp. Elim</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.dataAudit.userDeleted }}
				</div>
			</div>
			<div class="transation-additional-data-container">
				<div class="transation-additional-data-title">T. pago</div>
				<div class="transation-additional-data-content">
					{{ showingTransaction.typePayment.name }}
				</div>
			</div>
		</section>
		<v-dialog persistent max-width="470" v-model="dialogDeleteTransaction">
			<v-card>
				<v-card-title class="subheading">
					¿Desea eliminar la transacción?
				</v-card-title>
				<v-divider></v-divider>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							color="pink"
							class="btn-action mr-1"
							@click="closeModal"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="primary"
							class="btn-action ml-1"
							@click.native="removeTransaction"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import lib from '@/shared/lib';

const { getDeeper, isEmpty } = lib;

function created() {
	this.loadData();
}

async function loadData() {
	const url = `/amortizations-details/${this.saleId}/document`;

	try {
		({ data: this.rows } = await this.$httpSales(url));
	} catch (error) {
		this.showNotification('Error al cargar las transacciones');
	}
}

async function removeTransaction() {
	const url = `/amortizations-details/${this.transaction.id}/document`;
	try {
		await this.$httpSales.delete(url);
		this.$set(this.transaction, 'flagActive', 0);
		this.closeModal();
	} catch (error) {
		this.showNotification(`${error.data.message}`);
	}
}

function transactionDisabled({ flagActive }) {
	return !flagActive;
}

function getOperationNumber(transaction) {
	return getDeeper('amortization', 'operationNumber')(transaction);
}

function getTypeAmortizationName(transaction) {
	return getDeeper('amortization', 'typeAmortizationName')(transaction);
}

function details(transaction) {
	this.showingTransaction = transaction;
	this.showingTransaction.paymentDate = new Date(transaction.paymentDate)
		.toISOString()
		.split('T')[0];
}

function showTransaction() {
	return !isEmpty(this.showingTransaction);
}

function closeModal() {
	this.dialogDeleteTransaction = false;
	this.transaction = {};
}

function openDialog(row) {
	this.transaction = row;
	this.dialogDeleteTransaction = true;
}

function showVoucher(urlImage) {
	window.open(urlImage);
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Fecha / Hora',
				value: 'date',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: '# Trans',
				value: 'transactions',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Monto',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'T. Transacciones',
				value: 'transactions',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Estado',
				value: 'state',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: '',
				value: '',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		dialogDeleteTransaction: false,
		rows: [],
		showingTransaction: {},
		transaction: {},
	};
}

export default {
	name: 'sale-transactions',
	components: {
		appTable,
	},
	computed: {
		showTransaction,
	},
	created,
	data,
	methods: {
		closeModal,
		details,
		loadData,
		getOperationNumber,
		getTypeAmortizationName,
		removeTransaction,
		openDialog,
		transactionDisabled,
		showVoucher,
	},
	props: {
		saleId: {
			default: 0,
			type: Number,
		},
	},
};
</script>
<style lang="scss" scoped>
.transactions-table {
	margin-bottom: 0px;
	margin-top: 40px;
}

.transation-additional-data {
	&-section {
		background-color: #e2f1f1;
		display: flex;
		flex-wrap: wrap;
		font-size: 11px;
		margin: 0 1.5rem;
		padding: 0.5rem 0.5rem;
	}

	&-container {
		display: flex;
		margin: 0.25rem;
	}

	&-title {
		background-color: color(border-green-light);
		color: color(primary);
		padding: 0.5rem;
	}

	&-content {
		background-color: color(green-extra-l);
		padding: 0.5rem;
	}
}

.cell {
	font-size: 11px;
	white-space: nowrap;
}

.transaction-disabled {
	color: color(subheader);
	text-decoration: line-through;
}
</style>
