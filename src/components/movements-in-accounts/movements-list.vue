<template>
	<!-- <div>{{ movements }}</div> -->
	<registers-list
		heading
		btn-add-text="Crear un movimiento"
		table-height="426px"
		:btn-add="btnAdd"
		:btn-add-disabled="btnAddDisabled"
		:btn-filter="false"
		:btn-retention-disabled="btnRetentionDisabled"
		:columns="movementColumns"
		:footer-label="footerLabel"
		:footer-show="footerShow"
		:footer-value="footerValue"
		:load-message="loadMessage"
		:rows="movements"
		:search="search"
		:show-cxc="showCxc"
		:show-cxp="showCxp"
		:show-search="showSearch"
		:show-detail="showDetail"
		:details="details"
		@on-click-icon="$emit('on-click-icon', $event)"
		@on-row-clicked="$emit('on-row-clicked', $event)"
		@set-search="$emit('set-search', $event)"
		@search-registers="$emit('search-movement', $event)"
	>
		<template slot="actions" slot-scope="props">
			<v-tooltip top v-if="showEntity">
				<span
					slot="activator"
					class="state-entity"
					:style="
						props.row.stateEntityId === 4
							? 'background-color: #2abca4'
							: 'background-color: #f40029'
					"
				>
					{{ props.row.stateEntityId === 4 ? 'C' : 'SC' }}
				</span>
				<span>{{
					props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizar'
				}}</span>
			</v-tooltip>
			<template v-if="showActions(props.row)">
				<app-tooltip-button
					v-if="$route.name === 'accounts-receivable'"
					color="primary"
					icon="print"
					size="18"
					text="Imprimir pago CxC"
					@click-icon="$emit('print-movement', props.row)"
				></app-tooltip-button>
				<app-tooltip-button
					:disabled="props.row.flagActive === 0"
					color="primary"
					icon="edit"
					size="18"
					text="Editar Movimiento"
					@click-icon="$emit('edit-movement', props.row)"
				></app-tooltip-button>
				<app-tooltip-button
					:disabled="props.row.flagActive === 0"
					color="error"
					icon="cancel"
					size="18"
					text="Eliminar Movimiento"
					@click-icon="$emit('open-delete-confirmation', props.row, 'movement')"
				></app-tooltip-button>
			</template>
		</template>
	</registers-list>
</template>

<script>
import registersList from '@/components/movements-in-accounts/registers-list';

// function created() {
// 	this.validRoleAdmin = this.isRoleAdmin();
// }

function showActions({ module }) {
	return module ? module.code === 'CTAXCOB' || module.code === 'CTAXPAG' : true;
}

function data() {
	return {
		movementColumns: [
			{
				id: 1,
				class: this.$route.name === 'accounts-receivable' ? 'xs1' : 'xs2',
				name: 'Tipo',
				tooltip: 'typeTooltip',
				value: 'type',
				visible: true,
			},
			{
				id: 2,
				class: this.$route.name === 'accounts-receivable' ? 'xs1' : 'xs2',
				name: 'Importe',
				value: 'amount',
				visible: true,
			},
			{
				id: 3,
				class: 'xs2',
				name: 'Origen',
				tooltip: 'moduleTooltip',
				value: 'moduleName',
				visible: true,
			},
			{
				id: 4,
				class: 'xs2',
				name: 'Tipo de Doc.',
				value: 'documentNumber',
				visible: this.$route.name === 'accounts-receivable',
			},
			{
				id: 5,
				class: 'xs2',
				name: 'Nro. Operación',
				value: 'operationNumber',
				visible: true,
			},
			{
				id: 6,
				class: 'xs2',
				name: 'Fecha de Pago',
				value: 'paymentDate',
				visible: true,
			},
			{
				id: 7,
				class: 'xs2',
				name: 'Acciones',
				value: 'actions',
				visible: true,
			},
		],
		// validRoleAdmin: false,
	};
}

export default {
	name: 'movements-list',
	components: {
		registersList,
	},
	// created,
	data,
	methods: {
		showActions,
	},
	props: {
		btnAddDisabled: {
			default: false,
			type: Boolean,
		},
		btnRetentionDisabled: {
			default: true,
			type: Boolean,
		},
		footerLabel: [String, Number],
		footerShow: {
			default: false,
			type: Boolean,
		},
		footerValue: [String, Number],
		loadMessage: String,
		movements: {
			default: () => [],
			type: Array,
		},
		search: String,
		showCxc: {
			type: Boolean,
			default: false,
		},
		showCxp: {
			type: Boolean,
			default: false,
		},
		showSearch: {
			type: Boolean,
			default: true,
		},
		btnAdd: {
			type: Boolean,
			default: true,
		},
		showDetail: {
			default: false,
			type: Boolean,
		},
		details: {
			type: Array,
			default: () => [],
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
