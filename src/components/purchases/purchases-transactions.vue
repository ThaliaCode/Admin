<template>
	<layouts-slide-container>
		<app-table
			name="purchase-transactions"
			:columns="columns"
			:input-search="false"
			:local-storage="true"
			:main-list="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.paymentName }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.currencySymbol }} {{ props.row.amount | round }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.currencySymbol }} {{ props.row.balance | round }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.typeMovementName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.concept }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.paymentName }}</td>
				<td>
					<app-tooltip-button
						icon="remove_red_eye"
						text="Detalle de Pago"
						@click-icon="clickIcon(props.row)"
					>
					</app-tooltip-button>
				</td>
			</template>
		</app-table>
		<purchases-payment-form
			:bank-account-id="selectedTx.bankAccountId"
			:date-reference="selectedTx.dateReference"
			disabled
			:document-number="selectedTx.documentNumber"
			:flag-form="selectedTx.flagForm"
			:reference="selectedTx.reference"
			:url-image="selectedTx.urlImage"
		/>
	</layouts-slide-container>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';

function data() {
	return {
		columns: [
			{
				checked: true,
				id: 1,
				name: 'Tipo de Pago',
				value: 'paymentName',
				visible: true,
			},
			{
				checked: true,
				id: 2,
				name: 'Monto',
				value: 'amount',
				visible: true,
			},
			{
				checked: true,
				id: 3,
				name: 'Saldo',
				value: 'balance',
				visible: true,
			},
			{
				checked: true,
				id: 4,
				name: 'Tipo Mov.',
				value: 'typeMovementName',
				visible: true,
			},
			{
				checked: true,
				id: 5,
				name: 'Concepto',
				value: 'concept',
				visible: true,
			},
			{
				checked: true,
				id: 6,
				name: 'Fec. Pago',
				value: 'paymentDate',
				visible: true,
			},
			{
				checked: true,
				id: 7,
				name: 'Acciones',
				visible: true,
			},
		],
		selectedTx: {
			bankAccountId: null,
			dateReference: null,
			documentNumber: null,
			flagForm: 0,
			reference: null,
			urlImage: null,
		},
	};
}

function rows() {
	return this.transactions.map((row) => {
		const tp = this.paymentTypes.find(t => t.comTypePaymentId === row.typePaymentId);
		const newRow = {
			amount: row.amount,
			balance: row.balance,
			bankAccountId: row.bankAccountId,
			id: row.id,
			concept: row.concept,
			currencySymbol: row.currencySymbol,
			dateReference: row.additionalInformation ? row.additionalInformation.dateReference : '',
			documentNumber: row.documentNumber,
			flagForm: tp.paymentType.flagForm,
			paymentDate: row.paymentDate,
			paymentName: tp ? tp.paymentType.name : '',
			reference: row.reference,
			typeMovementName: row.typeMovementName,
			urlImage: row.urlImage,
		};
		return newRow;
	});
}

function clickIcon(tx) {
	this.selectedTx.dateReference = tx.dateReference;
	this.selectedTx.bankAccountId = tx.bankAccountId;
	this.selectedTx.documentNumber = tx.documentNumber;
	this.selectedTx.flagForm = tx.flagForm;
	this.selectedTx.reference = tx.reference;
	this.selectedTx.urlImage = tx.urlImage;
}

export default {
	name: 'purchases-transactions',
	components: {
		appTable,
		purchasesPaymentForm,
	},
	computed: {
		rows,
	},
	data,
	methods: {
		clickIcon,
	},
	props: {
		transactions: {
			default: () => [],
			type: Array,
		},
		paymentTypes: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
