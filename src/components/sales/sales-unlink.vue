<template>
	<v-layout px-4 wrap>
		<v-flex pb-2 xs12>
			<v-text-field
				id="comment"
				class="textarea-content filter-select mt-3"
				label="Comentario"
				multi-line
				v-model="commentary"
			></v-text-field>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@accept-button-clicked="unLinkDocuments"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</v-layout>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

async function unLinkDocuments() {
	try {
		const body = {
			documentsRelatedIds: this.documents.map(d => d.id),
			commentary: this.commentary,
		};
		await this.$httpSales.patch(`ballot-summary/${this.id}/details`, body);
		this.showNotification('La acción se realizó con éxito');
		this.$emit('update');
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		commentary: '',
	};
}

export default {
	name: 'sales-unlink',
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		unLinkDocuments,
	},
	props: {
		documents: {
			type: Array,
			default: () => [],
		},
		id: [String, Number],
	},
};
</script>