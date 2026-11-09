<template>
	<div>
		<action-sidebar
			:title="title"
			:value="true"
			@close-modal="close"
		>
			<suppliers-total-detail
				:id="id"
				:type="type"
				@close="close"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import suppliersTotalDetail from '@/components/purchases/suppliers-total-detail';

	function close() {
		this.goTo('suppliers');
	}

	function title() {
		const module = 'Total';
		return this.type === 'amount' ? `${module} Compras` : `${module} Deudas`;
	}

	export default {
		name: 'suppliers-total',
		components: {
			actionSidebar,
			suppliersTotalDetail,
		},
		computed: {
			title,
		},
		methods: {
			close,
		},
		props: {
			id: {
				type: [Number, String],
			},
			type: {
				type: String,
			},
		},
	};
</script>
