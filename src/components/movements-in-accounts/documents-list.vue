<template>
	<registers-list
	    @click-document-link="$emit('click-document-link', $event)"
		:all-checked="allDocumentsChecked"
		btn-add
		:btn-add-disabled="btnAddDisabled"
		:btn-add-text="btnAddText"
		:btn-filter="false"
		:columns="documentColumns"
		:current-page="currentPage"
		disabled-prop="disabled"
		:entity="entity"
		:footer-label="footerLabel"
		:footer-show="footerShow"
		:footer-value="footerValue"
		heading
		:last-page="lastPage"
		pagination
		:rows="documents"
		:search="search"
		:selectable="selectable"
		selectable-prop="isChecked"
		table-height="430px"
		@on-click-icon="$emit('add-document', $event)"
		@change-page="$emit('change-page', $event)"
		@on-row-clicked="$emit('on-row-clicked', $event)"
		@row-selected="$emit('document-selected', $event)"
		@selected-all="$emit('all-documents-selected', $event)"
		@set-search="$emit('set-search', $event)"
		@search-registers="$emit('search-document', $event)"
	>
		<template slot="actions" slot-scope="props">
			<v-tooltip top v-if="showEntity">
				<span
					slot="activator"
					class="state-entity"
					:style="
						props.row.entityStateId === 4
							? 'background-color: #2abca4'
							: 'background-color: #f40029'
					"
				>
					{{ props.row.entityStateId === 4 ? 'C' : 'SC' }}
				</span>
				<span>{{
					props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizar'
				}}</span>
			</v-tooltip>
			<template
				v-if="props.row.module.code === 'CTAXCOB' || props.row.module.code === 'CTAXPAG'"
			>
				<app-tooltip-button
					v-if="props.row.module.code !== 'CTAXPAG'"
					color="primary"
					icon="edit"
					size="18"
					text="Editar Documento"
					@click-icon="$emit('edit-document', props.row)"
				></app-tooltip-button>
				<app-tooltip-button
					v-if="!props.row.saleDocumentId && !props.row.purDocumentId"
					color="error"
					icon="cancel"
					size="18"
					text="Eliminar Documento"
					@click-icon="onDeleteClick(props.row)"
				></app-tooltip-button>
			</template>
		</template>
	</registers-list>
</template>

<script>
import registersList from '@/components/movements-in-accounts/registers-list';

function data() {
	return {
		documentColumns: [
			{
				id: 1,
				class: 'col2',
				name: 'Tienda.',
				value: 'warName',
				visible: true,
			},
			{
				id: 2,
				class: 'col2',
				name: 'Doc.',
				value: 'documentNumberType',
				visible: true,
			},
			{
				id: 3,
				class: 'col2',
				name: 'Fecha',
				value: 'receptionDate',
				visible: true,
			},
			{
				id: 4,
				class: 'col2',
				name: 'Referencia',
				value: 'documentNumberComplete',
				visible: true,
			},
			{
				id: 5,
				class: 'col1',
				name: 'Total',
				value: 'amount',
				visible: true,
			},
			{
				id: 6,
				class: 'col1',
				name: 'Saldo',
				value: 'debtAmount',
				visible: true,
			},
			{
				id: 7,
				class: 'col1',
				name: 'Acciones',
				value: 'actions',
				visible: true,
			},
		],
	};
}

function canDeleteDocument(row) {
	return !row.dueAmount;
}

function onDeleteClick(row) {
	if (this.canDeleteDocument(row)) {
		this.$emit('open-delete-confirmation', row, 'document');
	} else {
		this.showNotification('Esta deuda ya tiene pagos registrados, no se puede eliminar.', 'error');
	}
}

export default {
	name: 'documents-list',
	components: {
		registersList,
	},
	data,
	methods: {
		canDeleteDocument,
		onDeleteClick,
	},
	props: {
		allDocumentsChecked: {
			default: false,
			type: Boolean,
		},
		btnAddDisabled: {
			default: false,
			type: Boolean,
		},
		btnAddText: String,
		currentPage: Number,
		documents: {
			default: () => [],
			type: Array,
		},
		entity: String,
		footerLabel: [String, Number],
		footerShow: {
			default: false,
			type: Boolean,
		},
		footerValue: [String, Number],
		lastPage: Number,
		search: String,
		selectable: {
			default: true,
			type: Boolean,
		},
		showEntity: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}
</style>
