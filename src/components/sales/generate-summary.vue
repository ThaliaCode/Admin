<template>
	<section class="my-2 mx-2">
		<div class="py-2 px-4">
			<h4 class="primary--text">Ventas a enviar: {{ infoSales.count }}</h4>
			<h4 class="primary--text">Total Monto: {{ infoSales.total }}</h4>
		</div>
		<app-table
			class="is-not-selectable no-main-list"
			name="sales-sunat"
			:columns="columns"
			:filter-columns="false"
			:input-search="false"
			:main-list="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<template>
					<td class="is-not-selectable">{{ props.row.customerData }}</td>
					<td>{{ props.row.docNumber }}</td>
					<td>{{ props.row.amount | round }}</td>
					<td>{{ props.row.subsidiary.rzSocial }}</td>
				</template>
				<td>
					<app-tooltip-button
						color="red"
						icon="delete"
						text="Eliminar del listado de registros a enviar"
						@click-icon="removeSale(props.row)"
					>
					</app-tooltip-button>
				</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="loading"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="$emit('send-documents', rows)"
			/>
		</section>
	</section>
</template>

<script>
import appTable from '../shared/table/app-table';
import modalSidebarButton from '../shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Cliente',
				value: 'customerData',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: '# DOC',
				value: 'docNumber',
				visible: true,
				checked: true,
			},
			{ id: 3, name: 'Monto', value: 'total', visible: true, checked: true },
			{
				id: 4,
				name: this.labelSucursal(),
				value: 'subsidiary',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
	};
}

function infoSales() {
	const info = {
		count: this.rows.length,
		total: 0,
	};
	info.total = this.rows.reduce((acum, s) => s.amount + acum, 0);
	return info;
}

function removeSale(document) {
	this.$emit('remove-document', document);
}

export default {
	name: 'generate-summary',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		infoSales,
	},
	data,
	methods: {
		removeSale,
	},
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
