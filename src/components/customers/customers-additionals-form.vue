<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 md6 px-2 mb-1>
				<app-select
					:items="groups"
					:item="model.groupId"
					item-text="name"
					item-value="id"
					label="Grupo"
					model="groupId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-input-text
					label="Tipo de Cliente"
					model="customerType"
					:text="model.customerType"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-input-text
					label="Límite de Crédito"
					model="limitAmountCredit"
					:text="model.limitAmountCredit"
					type="number"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-date-mask
					id="birth-date"
					label="Fecha de Nacimiento"
					v-model="valueDateBirth"
					@format-date="setData({ model: 'dateBirth', value: $event })"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-select
					:item="model.paymentMethodId"
					item-text="name"
					item-value="id"
					:items="paymentMethods"
					label="Forma de Pago"
					model="paymentMethodId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-input-text
					label="Máx. Días de Crédito"
					model="creditLimitDays"
					:text="model.creditLimitDays"
					type="number"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-select
					:item="model.purchaseFrequency"
					item-text="name"
					item-value="code"
					:items="purchasesFrequencys"
					label="Frecuencia de Compra"
					model="purchaseFrequency"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1 mt-3 v-if="!isCredit">
				<v-select
					chips
					clearable
					solo
					multiple
					color="primary"
					item-text="name"
					item-value="id"
					hide-details
					label="Tipos de pago"
					:items="typePayments"
					v-model="model.typePaymentIds"
				/>
			</v-flex>
			<v-flex xs12 mt-5 px-2 mb-1>
				<v-checkbox
					color="success"
					hide-details
					label="Cred. Inc. Pos."
					:true-value="1"
					:false-value="0"
					v-model="model.flagPostDatedCredit"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<v-checkbox
					color="success"
					hide-details
					label="Cliente relacionado"
					:true-value="1"
					:false-value="0"
					v-model="model.flagRelatedCustomer"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="cancel"
				@accept-button-clicked="$emit('save', model)"
			/>
		</section>
	</div>
</template>

<script>
	import { format } from 'date-fns';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import typeEntityId from '@/shared/type-entity';

	function created() {
		this.loadResources();
	}

	function cancel() {
		this.model = {
			creditLimitDays: null,
			customerType: '',
			dateBirth: '',
			flagRelatedCustomer: null,
			flagPostDatedCredit: null,
			groupId: null,
			limitAmountCredit: null,
			paymentMethodId: null,
		};
		this.$emit('cancel');
	}

	function loadData() {
		this.model = { ...this.modelData };
		this.model.purchaseFrequency = this.modelData.purchaseFrequency;
		this.model.dateBirth = this.modelData.dateBirth || '';
		if (this.model.dateBirth) {
			this.valueDateBirth = format(this.model.dateBirth, 'DD/MM/YYYY');
		}
	}

	async function loadResources() {
		const request = [
			this.getPaymentsMethods(),
			this.$httpSales.get('group', { params: { typeEntityId: typeEntityId.Customer } }),
			this.$httpSales.get('type-payments?flagType=1'),
		];
		[
			{ data: this.paymentMethods },
			{ data: this.groups },
			{ data: this.typePayments }] = await Promise.all(request);
		this.paymentMethods.unshift({ name: 'TODOS', id: null });
		const modelValues = Object.keys(this.modelData);
		const modelValid = modelValues.some(mv => !!this.modelData[mv]);
		this.typePayments = this.typePayments.map(t => t.paymentType);
		if (modelValid) {
			this.loadData();
		}
	}

	function setData({ model, value }) {
		this.model[model] = value;
	}

	function isCredit() {
		return this.model.paymentMethodId === 2;
	}

	function data() {
		return {
			groups: [],
			model: {
				creditLimitDays: null,
				customerType: '',
				dateBirth: '',
				flagPostDatedCredit: null,
				flagRelatedCustomer: null,
				groupId: null,
				limitAmountCredit: null,
				paymentMethodId: null,
				typePaymentIds: [],
			},
			paymentMethods: [],
			valueDateBirth: '',
			typePayments: [],
		};
	}

	export default {
		name: 'customers-additionals-form',
		components: {
			modalSidebarButton,
		},
		computed: {
			isCredit,
		},
		created,
		data,
		methods: {
			cancel,
			loadData,
			loadResources,
			setData,
		},
		props: {
			modelData: {
				default: () => {},
				type: Object,
			},
			purchasesFrequencys: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
