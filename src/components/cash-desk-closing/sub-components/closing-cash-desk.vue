<template>
	<div>
		<v-layout wrap justify-center pa-4>
			<v-flex xs6 pr-2 mb-3>
				<app-date-select
					:date-formatted="closedAt"
					label="Fecha de Cierre"
					readonly
				/>
			</v-flex>
			<v-flex xs6 pl-2 mb-3>
				<app-select
					:items="currencies"
					item-text="code"
					item-value="code"
					label="Tipo de Moneda"
					:item="currency"
					model="currency"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					label="Saldo Final"
					readonly
					:text="endAmount"
				/>
			</v-flex>
			<v-flex xs12>
				<app-select
					label="Empleado de Cierre"
					item-text="name"
					item-value="id"
					:items="employees"
					@input="setValue"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-text="Cerrar"
				@cancel-button-clicked="close"
				@accept-button-clicked="accept"
			/>
		</section>
	</div>
</template>

<script>
	import appDateSelect from './../../shared/app-date-select';
	import appInputText from './../../shared/app-input-text';
	import appSelect from './../../shared/app-select';
	import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

	function created() {
		this.currency = this.$userInfo.company.currency;
		this.loadData();
	}

	function accept() {
		this.$emit('accept', { employeeId: this.closedEmployeeId, currency: this.currency });
	}

	function close() {
		this.$emit('close');
	}

	async function loadData() {
		try {
			({ data: this.employees } = await this.globalEmployees());
		} catch (error) {
			this.showGenericError();
		}
	}

	function setValue({ model, value }) {
		this[model] = model === 'currency' ? value.code : value.id;
	}

	function data() {
		return {
			currency: '',
			employees: [],
			closedEmployeeId: 0,
		};
	}

	export default {
		name: 'closing-cash-desk',
		components: {
			appDateSelect,
			appInputText,
			appSelect,
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			accept,
			close,
			loadData,
			setValue,
		},
		props: {
			closedAt: [Date, String, Number],
			currencies: {
				default: () => [],
				type: Array,
			},
			endAmount: [Number, String],
		},
	};
</script>
