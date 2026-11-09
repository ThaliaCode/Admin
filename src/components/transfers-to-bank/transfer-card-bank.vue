<template>
	<div>
		<v-tabs
			v-model="active"
			color="primary"
			dark
			right
			slider-color="blue darken-1"
		>
			<v-tab href="#tab-data" class="caption">Datos generales</v-tab>
			<v-tab href="#tab-retentions" class="caption">Retenciones</v-tab>
			<v-tab-item id="tab-data">
				<general-data
					:amount="amount"
					:bank-account-id="model.bankAccountId"
					:document-number="model.documentNumber"
					:updated="updated"
					@set-data="getData"
				/>
			</v-tab-item>
			<v-tab-item id="tab-retentions">
			</v-tab-item>
		</v-tabs>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				:success-text="successText"
				@cancel-button-clicked="close"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
	import generalData from './general-data';
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';

	function close() {
		this.$emit('close');
	}

	function getData({ model, newValue }) {
		this.model[model] = newValue;
		this.$emit('get-data', { model, newValue });
	}

	function getRetentionData({ model, value }) {
		this.retention[model] = model === 'referenceIva' || model === 'referenceRent' ||
			model === 'secondReferenceIva' ? value.id : value;
	}

	function successText() {
		return this.active === 'tab-data' ? 'Siguiente' : 'Aceptar';
	}

	function save() {
		if (this.active === 'tab-data') {
			this.active = 'tab-retentions';
		} else {
			this.$emit('save');
		}
	}

	function data() {
		return {
			active: null,
			model: {
				bankAccountId: '',
				documentNumber: '',
			},
			retention: {
				fifthIvaAmount: 0,
				firstIvaAmount: 0,
				firstRentAmount: 0,
				firstRetentionAmount: 0,
				fourthIvaAmount: 0,
				netWorth: 0,
				referenceIva: 0,
				referenceRent: 0,
				secondIvaAmount: 0,
				secondReferenceIva: 0,
				secondRentAmount: 0,
				secondRetentionAmount: 0,
				sixthIvaAmount: 0,
				thirdIvaAmount: 0,
				thirdRentAmount: 0,
				totalCommission: 0,
				totalDeposit: 0,
				totalRetIva: 0,
				totalRetRent: 0,
			},
		};
	}

	export default {
		name: 'transfer-card-bank',
		components: {
			generalData,
			modalSidebarButton,
		},
		computed: {
			successText,
		},
		data,
		methods: {
			close,
			getData,
			getRetentionData,
			save,
		},
		props: {
			amount: [Number, String],
			bankAccountId: [Number, String],
			disabled: {
				default: false,
				type: Boolean,
			},
			documentNumber: [Number, String],
			updated: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.label-title {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
		text-transform: uppercase;
	}
</style>
