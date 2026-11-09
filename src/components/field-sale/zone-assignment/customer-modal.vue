<template>
	<modal
		:dialog="dialog"
		max-width="500"
		persistent
		:title="customer.customerFullName"
		@close-modal="$emit('close-modal')"
	>
		<customer-detail
			:customer="customer"
		></customer-detail>
	</modal>
</template>

<script>
	import customerDetail from '@/components/field-sale/shared/customer-detail';
	import modal from '@/components/field-sale/shared/modal';

	export default {
		name: 'customer-modal',
		components: {
			customerDetail,
			modal,
		},
		props: {
			customer: {
				default: () => {},
				type: Object,
			},
			dialog: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>
