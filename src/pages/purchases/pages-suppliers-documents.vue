<template>
	<div>
		<action-sidebar
			title="Adjuntar Documentos"
			:value="true"
			:width="552"
			@close-modal="close"
		>
			<suppliers-document
				@cancel="close"
				:id="id"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import suppliersDocument from '@/components/purchases/suppliers-document';

function close() {
	this.goTo('suppliers');
}

export default {
	name: 'suppliers-documents',
	components: {
		actionSidebar,
		suppliersDocument,
	},
	methods: {
		close,
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>

