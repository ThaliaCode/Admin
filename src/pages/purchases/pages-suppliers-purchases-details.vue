<template>
	<div>
		<action-sidebar
			:title="title"
			:value="action.value"
			:width="action.width"
			@close-modal="close"
		>
			<suppliers-purchases-details-form
				:id="id"
				@close="close"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import suppliersPurchasesDetailsForm from '@/components/purchases/suppliers-purchases-details-form';

	function close() {
		this.action.value = false;
		this.goTo('suppliers');
	}

	function title() {
		return `DETALLE DE COMPRAS - ${this.name}`;
	}

	function data() {
		return {
			action: {
				value: true,
				width: 655,
			},
		};
	}

	export default {
		name: 'suppliers-purchases-details',
		components: {
			actionSidebar,
			suppliersPurchasesDetailsForm,
		},
		computed: {
			title,
		},
		data,
		methods: {
			close,
		},
		props: {
			id: {
				type: [Number, String],
			},
			name: {
				type: String,
			},
		},
	};
</script>
