<template>
	<div>
		<v-tabs
			v-model="active"
			color="primary"
			right
			slider-color="blue darken-1"
		>
			<v-tab href="#tab-payments" class="caption white--text">
				Pagos realizados
			</v-tab>
			<v-tab
				href="#tab-quotes"
				class="caption white--text"
				:disabled="cashPayment">
				Cuotas por pagar
			</v-tab>
			<v-tab-item id="tab-payments">
				<purchases-payments-list
					:check-all="checkAll"
					:columns="columns"
					:rows="rows"
					:selected-id="selectedId"
					@all-is-selected="allIsSelected"
					@row-is-selected="rowIsSelected"
					@close-payments="close"
				/>
			</v-tab-item>
			<v-tab-item id="tab-quotes">
				<fees-per-purchase
					v-if="selectedId"
					:id="selectedId"
					@close="close"
					@save="save"
				/>
			</v-tab-item>
		</v-tabs>
	</div>
</template>

<script>
	import feesPerPurchase from '@/components/purchases/fees-per-purchase';
	import purchasesPaymentsList from '@/components/purchases/purchases-payments-list';

	function created() {
		this.transactions = [...this.rows];
	}

	function allIsSelected(isSelected) {
		this.$emit('all-is-selected', isSelected);
	}

	function cashPayment() {
		return this.paymentMethod === 'CONTADO';
	}

	function close() {
		this.$emit('close');
		this.active = 'tab-payments';
	}

	function rowIsSelected({ id, isSelected }) {
		this.hideDetails = true;
		this.$emit('row-is-selected', { id, isSelected });
	}

	function save({ body, paymentType }) {
		this.$emit('save', { body, paymentType });
	}

	function data() {
		return {
			active: null,
			columns: [
				{ id: 1, name: '# Num', visible: true, checked: true },
				{ id: 2, name: 'Origen', visible: true, checked: true },
				{ id: 3, name: 'Tipo', visible: true, checked: true },
				{ id: 4, name: '# Doc', visible: true, checked: true },
				{ id: 5, name: 'Importe', visible: true, checked: true },
				{ id: 6, name: 'Concepto', visible: true, checked: true },
			],
			hideDetails: false,
		};
	}

	export default {
		name: 'purchases-details-form',
		components: {
			feesPerPurchase,
			purchasesPaymentsList,
		},
		computed: {
			cashPayment,
		},
		created,
		data,
		methods: {
			allIsSelected,
			close,
			rowIsSelected,
			save,
		},
		props: {
			checkAll: {
				default: false,
				type: Boolean,
			},
			dataSelected: {
				default: () => [],
				type: Array,
			},
			paymentMethod: String,
			rows: {
				default: () => [],
				type: Array,
			},
			selectedId: [Number, String],
		},
	};
</script>
