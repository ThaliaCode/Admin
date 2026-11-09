<template>
	<section class="overflow-auto">
		<app-table
			class="is-not-selectable"
			name="withholding-list"
			selectable
			:check-all="checkAll"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			v-on:row-is-selected="$emit('is-selected', $event)"
			v-on:on-selected-all="$emit('all-selected', $event)"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td
					class="is-not-selectable"
					v-show="showRow(columns, 1)"
				>
					{{ props.row.purchaseDate | formatDate('YYYY-MM-DD') }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.purchaseNumber }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.supplierNumber }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.supplierName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.currencySymbol }}{{ props.row.purchaseAmount }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.withholdingNumber }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.currencySymbol }}{{ props.row.retIvaTotal | round }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.currencySymbol }}{{ props.row.retRentaTotal | round }} </td>
				<td v-show="showRow(columns, 9)">{{ props.row.currencySymbol }}{{ props.row.total | round }} </td>
				<td v-show="showRow(columns, 10)">
					<document-state
						:color="props.row.statusTaxName.color"
						:tooltip="props.row.statusTaxName.name"
						@click-state="openSunatDetails(props.row)"
					/>
				</td>
				<td v-show="showRow(columns, 11)">
					<app-tooltip-button
						color="blue"
						icon="cloud_download"
						text="Descargar Retención"
						@click-icon="$emit('click-icon', props.row)"
					>
					</app-tooltip-button>
					<app-tooltip-button
						color="primary"
						icon="remove_red_eye"
						text="Ver Detalle"
						@click-icon="$emit('see-detail', props.row)"
					>
					</app-tooltip-button>
					<app-tooltip-button
						v-if="props.row.stateDocumentTax === 7 || props.row.stateDocumentTax === 3"
						color="error"
						icon="cancel_presentation"
						text="Anular Retención"
						@click-icon="$emit('cancel-retention', props.row)"
					></app-tooltip-button>
				</td>
			</template>
		</app-table>
	</section>
</template>

<script>

import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';

function created() {
	this.columns[9].name = this.isEcuador ? 'SRI' : 'E.Sunat';
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Fec. Compra',
				tooltip: 'Fecha de Compra',
				value: 'purchaseDate',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: '# Compra',
				tooltip: 'Número de documento de compra',
				value: 'purchaseNumber',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'RUC/CI',
				value: 'supplierNumber',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Proveedor',
				value: 'supplierName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Valor Compra',
				value: 'purchaseAmount',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: '# Ret',
				tooltip: 'Número de documento de retención',
				value: 'withholdingNumber',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Ret. IVA',
				tooltip: 'Total de valor retenido IVA',
				value: 'retIvaTotal',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Ret. Fuente',
				tooltip: 'Total de valor retenido Renta',
				value: 'retRentaTotal',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Total Ret.',
				tooltip: 'Total de Retención',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'E.Sunat',
				value: 'status',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
	};
}

function openSunatDetails(withholding) {
	this.$emit('slide-modal', withholding);
}

export default {
	name: 'withholding-list',
	components: {
		appTable,
		documentState,
	},
	methods: {
		openSunatDetails,
	},
	data,
	created,
	props: {
		currentPage: {
			type: Number,
			default: 0,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
		rows: {
			type: Array,
			default: () => [],
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style scoped>

</style>