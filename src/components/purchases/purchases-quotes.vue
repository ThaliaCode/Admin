<template>
	<layouts-slide-container>
		<app-table
			name="purchase-quotes"
			:columns="columns"
			:input-search="false"
			:local-storage="true"
			:main-list="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.expirationDate }}</td>
				<td v-show="showRow(columns, 2)"> {{ props.row.currencySymbol }} {{ props.row.amount | round }}</td>
				<td v-show="showRow(columns, 3)"> {{ props.row.currencySymbol }} {{ props.row.amountPayment | round }}</td>
				<td v-show="showRow(columns, 4)"> {{ props.row.paymentName }}</td>
				<td v-show="showRow(columns, 5)"> {{ props.row.statusName }}</td>
			</template>
		</app-table>
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
				name: 'Fecha Limite de Pago',
				value: 'expirationDate',
				visible: true,
			},
			{
				checked: true,
				id: 2,
				name: 'Deuda',
				value: 'amount',
				visible: true,
			},
			{
				checked: true,
				id: 3,
				name: 'Pagado',
				value: 'amountPayment',
				visible: true,
			},
			{
				checked: true,
				id: 4,
				name: 'Tipo de Pago',
				value: 'paymentName',
				visible: true,
			},
			{
				checked: true,
				id: 5,
				name: 'Estado',
				value: 'statusName',
				visible: true,
			},
		],
	};
}

function rows() {
	return this.checkingAccounts.map((row) => {
		const tp = this.paymentTypes.find(t => t.comTypePaymentId === row.typePaymentId);
		const newRow = {
			amount: row.amount,
			amountPayment: row.amountPayment,
			id: row.id,
			expirationDate: row.expirationDate,
			paymentName: tp ? tp.paymentType.name : 'Pago no realizado aún',
			statusName: row.statusName,
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
	name: 'purchases-quotes',
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
		checkingAccounts: {
			default: () => [],
			type: Array,
		},
		currencySymbol: {
			default: '',
			type: String,
		},
		paymentTypes: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
