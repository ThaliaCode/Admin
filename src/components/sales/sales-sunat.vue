<template>
	<section class="my-2 mx-2">
		<div class="py-2 px-4">
			<h4 class="primary--text">Ventas a enviar: {{ infoSales.count }}</h4>
			<h4 class="primary--text" v-if="!referenceGuides && !referenceWithholding">
				Total Monto: {{ infoSales.total }}
			</h4>
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
				<template v-if="referenceGuides">
					<td class="is-not-selectable">{{ props.row.number }}</td>
					<td>{{ props.row.destination }}</td>
					<td>{{ props.row.driverName }}</td>
					<td>{{ props.row.driverLicensePlate }}</td>
				</template>
				<template v-else-if="referenceWithholding">
					<td class="is-not-selectable">{{ props.row.purchaseNumber }}</td>
					<td>{{ props.row.supplierNumber }}</td>
					<td>{{ props.row.purchaseAmount }}</td>
					<td>{{ props.row.withholdingNumber }}</td>
					<td>{{ props.row.total }}</td>
				</template>
				<template v-else>
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
				:is-loading="applyDisabled || infoSales.count === 0"
				v-on:cancel-button-clicked="closeModal"
				v-on:accept-button-clicked="sendSales" />
		</section>
	</section>
</template>

<script>

import appTable from '../shared/table/app-table';
import modalSidebarButton from '../shared/utils/modal-sidebar-button';

function data() {
	return {
		applyDisabled: false,
	};
}

function closeModal() {
	this.$emit('cancel-modal', false);
}

function columns() {
	if (this.referenceGuides) {
		return [
			{ id: 1, name: '# DOC', value: 'number', visible: true, checked: true },
			{ id: 2, name: 'Destino', value: 'destination', visible: true, checked: true },
			{ id: 3, name: 'Conductor', value: 'driverName', visible: true, checked: true },
			{ id: 4, name: '# Placa', value: 'driverLicensePlate', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		];
	}
	if (this.referenceWithholding) {
		return [
			{ id: 1, name: '# Compra', value: 'purchaseNumber', visible: true, checked: true },
			{ id: 2, name: 'RUC/CI', value: 'supplierNumber', visible: true, checked: true },
			{ id: 4, name: 'Valor Compra', value: 'purchaseAmount', visible: true, checked: true },
			{ id: 5, name: '# Ret', value: 'withholdingNumber', visible: true, checked: true },
			{ id: 6, name: 'Total Ret.', value: 'total', visible: true, checked: true },
			{ id: 7, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		];
	}
	return [
		{ id: 1, name: 'Cliente', value: 'customerData', visible: true, checked: true },
		{ id: 2, name: '# DOC', value: 'docNumber', visible: true, checked: true },
		{ id: 3, name: 'Monto', value: 'total', visible: true, checked: true },
		{ id: 4, name: this.labelSucursal(), value: 'subsidiary', visible: true, checked: true },
		{ id: 5, name: 'Acciones', visible: true, checked: true, flagVisible: true },
	];
}

function infoSales() {
	const info = {
		count: this.rows.length,
		total: 0,
	};
	if (!this.referenceGuides) {
		info.total = this.rows.reduce((acum, s) => s.amount + acum, 0);
	}
	return info;
}

function removeSale(sale) {
	this.$emit('remove-sales-sunat', sale);
}

async function sendSales() {
	this.applyDisabled = true;
	const ids = this.referenceWithholding ? this.rows.map(r => r.purchaseId) :
		this.rows.map(r => r.id);
	const codeGuide = this.referenceGuides ? 'GUIDE' : undefined;
	const code = this.referenceWithholding ? 'COMPRA' : codeGuide;
	const body = {
		ids,
		moduleCode: code,
	};
	try {
		await this.$httpSales.post('facturacion-sunat', body);
		this.showNotification(`Las ventas han sido enviadas a ${this.labelsByCountry.taxAgency}`);
		this.$emit('reload-sales-sunat');
	} catch (error) {
		if (error.data.message === 'SUBSIDIARY_TAXES_ERROR') {
			if (this.isEcuador) {
				this.showNotification('Credenciales de SRI no configuradas.', 'error');
			} else {
				this.showNotification('Credenciales de sunat no configuradas.', 'error');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.applyDisabled = false;
	}
}

export default {
	name: 'sales-sunat',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		columns,
		infoSales,
	},
	data,
	methods: {
		closeModal,
		removeSale,
		sendSales,
	},
	props: {
		referenceGuides: {
			default: false,
			type: Boolean,
		},
		referenceWithholding: {
			default: false,
			type: Boolean,
		},
		rows: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
