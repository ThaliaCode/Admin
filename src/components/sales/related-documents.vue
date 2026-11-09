<template>
	<div>
		<v-container v-if="documents && documents.length > 0">
			<section>
				<h2 class="mb-4">Monto de la venta: {{sale.amount}}</h2>
				<ul>
					<li class="documents">
						<span><b>Tipo de documento</b></span>
						<span><b>Número de documento</b></span>
						<span><b>Monto</b></span>
					</li>
					<li
						v-for="(doc, indexDoc) in documents"
						:key="indexDoc"
						class="documents"
					>
						<span>{{doc.typeDocument.description}}</span>
						<span><b>{{doc.documentNumber}}</b></span>
						<span>{{doc.amount}}</span>
					</li>
				</ul>
			</section>
		</v-container>
		<v-container v-if="showDocumets">
			<h4>No tiene documentos relacionados.</h4>
		</v-container>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				is-loading
				:hiddenSaveBtn="true"
				@cancel-button-clicked="close"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

async function loadData() {
	const { id } = this.sale;
	const url = `/sale-documents/${id}/related-sales`;
	({ data: this.documents } = await this.$httpSales(url));
	this.showDocumets = this.documents && this.documents.length === 0;
}

function close() {
	this.$emit('close');
}

function data() {
	return {
		documents: [],
		showDocumets: false,
	};
}

export default {
	name: 'related-documents',
	components: {
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		close,
		loadData,
	},
	props: {
		sale: {
			default: () => {},
			type: Object,
		},
	},
};
</script>
<style lang="scss" scoped>
	.documents {
		align-items: center;
		display: flex;
		justify-content: space-between;
 	}
</style>
