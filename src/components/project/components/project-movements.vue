<template>
	<section>
		<header-page
			name="projects"
			:title="title"
			selectable
		/>
		<general-filter>
			<v-layout align-center>
				<v-flex xs3 px-1 class="align-col">
					<v-select
						single-line
						bottom
						hide-details
						v-model="selectedMovementType"
						class="filter-select shadow-inset"
						content-class="filter-select-content"
						:items="movementsTypes"
						@input="filterTransfers"
						label="Tipo Movimiento">
					</v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table name="movement-projects"
				:columns="columns"
				:rows="rows"
				:input-search="false"
				:include-filter="false"
				:filter-columns="false"
				:main-list="false"
				class="is-not-selectable no-main-list"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable">
						{{ props.row.warehouse.name }}
					</td>
					<td>{{ props.row.type }}</td>
					<td>{{ props.row.serie }}-{{ props.row.number }}</td>
					<td>{{ props.row.entryDate | formatDate }}</td>
					<td>{{ props.row.totalProducts }}</td>
					<td>
						<v-tooltip top>
							<v-btn slot="activator" icon small @click.prevent="showDetails(props.row)">
								<v-icon>list</v-icon>
							</v-btn>
							<span>Ver Productos</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn icon
								slot="activator"
								@click="downloadMaterials(props.row)"
								class="table-icon">
								<img :src="`${$imageUrl}/download.svg`" alt="" class="align-img">
							</v-btn>
							<span>Descargar pedido de materiales</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<quick-actions :actions="actions" @open-modal="goToTransfer">
		</quick-actions>
		<v-dialog
			v-model="transferModal"
			transition="dialog-bottom-transition"
			scrollable
			max-width="800"
		>
		<v-card>
			<v-card-title>
				Productos incluídos en movimiento {{ selectedTransfer.serie }} - {{ selectedTransfer.number }}
			</v-card-title>
			<v-card-text>
				<app-table name="movement-projects"
					:columns="detailColumns"
					:rows="selectedTransfer.details"
					:input-search="false"
					:filter-columns="false"
					class="is-not-selectable no-main-list"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">
							{{ props.row.product.name }}
						</td>
						<td>{{ props.row.product.code }}</td>
						<td>{{ props.row.brand.name }}</td>
						<td>{{ props.row.quantity }}</td>
					</template>
				</app-table>
			</v-card-text>
			<v-card-actions left>
				<v-btn @click="closeModal" color="error">
					Cerrar
				</v-btn>
			</v-card-actions>
		</v-card>
		</v-dialog>
	</section>
</template>

<script>
import appTable from '../../shared/table/app-table';
import generalFilter from '../../shared/general-filter';
import headerPage from '../../shared/header-page';
import quickActions from '../../shared/quick-actions';
import helper from '../../../shared/helper';

function data() {
	return {
		actions: [
			{
				id: 1,
				active: true,
				code: 1,
				img: `${this.$imageUrl}/icon-commodity-enter.svg`,
				text: 'Entrada de productos',
			},
			{
				id: 2,
				active: true,
				code: 2,
				img: `${this.$imageUrl}/icon-commodity-enter.svg`,
				text: 'Salida de productos',
			},
		],
		columns: [
			{ id: 1, name: 'Almacén', visible: true, checked: true },
			{ id: 2, name: 'Tipo de Mov.', visible: true, checked: true },
			{ id: 3, name: '# DOC', visible: true, checked: true },
			{ id: 4, name: 'Fecha', visible: true, checked: true },
			{ id: 5, name: '# Productos', visible: true, checked: true },
			{ id: 8, name: 'Acciones', visible: true, checked: true },
		],
		dataSelected: [],
		detailColumns: [
			{ id: 1, name: 'Nombre', visible: true },
			{ id: 2, name: 'Código', visible: true },
			{ id: 3, name: 'Marca', visible: true },
			{ id: 4, name: 'Cantidad', visible: true },
		],
		params: {
			movementType: null,
		},
		rows: [],
		selectedMovementType: {},
		selectedTransfer: {
			details: [
				{
					product: {},
					brand: {},
				},
			],
		},
		transferModal: false,
		movementsTypes: [
			{
				id: null, text: 'Todos',
			},
			{
				id: 1, text: 'Entradas',
			},
			{
				id: 2, text: 'Salidas',
			},
		],
	};
}

async function created() {
	this.loadData();
}

function closeModal() {
	this.transferModal = false;
}

function filterTransfers({ id }) {
	this.params = {
		movementType: id,
	};
	this.loadData();
}

function goToTransfer(action) {
	const params = { type: action.code, saleId: this.saleId };
	this.goTo('project-transfer', { params });
}

async function loadData() {
	const { data: transfers }
		= await this.$httpProduction.get(`/transfer/${this.id}`, { params: this.params });
	this.rows = transfers.map((transfer) => {
		const newTransfer = { ...transfer };
		newTransfer.type = newTransfer.movementType === 1 ? 'Entrada' : 'Salida';
		newTransfer.totalProducts = newTransfer.details.length;
		newTransfer.warehouse = newTransfer.movementType === 1
			? newTransfer.warehouse : newTransfer.warehouseOrigin;
		return newTransfer;
	});
}

function showDetails(row) {
	this.selectedTransfer = row;
	this.transferModal = true;
}

function title() {
	return `${this.$route.meta.title} del proyecto ${this.autoCode}`;
}

async function downloadMaterials({ id }) {
	try {
		const model = { projectId: this.id, transferId: id };
		const responseType = 'blob';
		const url = 'report-transfer/controlPedido';
		const { data: response } = await this.$httpProduction.post(url, model, { responseType });
		const blob = helper.generateBlob(response);
		helper.showDownloadDialog(blob, `Pedido-${id}`, 'pdf');
	} catch (error) {
		this.showGenericError();
	}
}

export default {
	name: 'project-movements',
	computed: {
		title,
	},
	created,
	components: {
		appTable,
		generalFilter,
		headerPage,
		quickActions,
	},
	data,
	props: ['id', 'autoCode', 'saleId'],
	methods: {
		closeModal,
		filterTransfers,
		goToTransfer,
		loadData,
		showDetails,
		downloadMaterials,
	},
};
</script>

<style lang="scss" scoped>

</style>