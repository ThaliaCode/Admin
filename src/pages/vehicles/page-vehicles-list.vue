<template>
	<div>
		<header-page :title="$route.meta.title" />
		<!-- El v-if es para que no se consuma el servicio de acciones cuando se enruta al slide de nuevo vehiculo -->
		<app-actions
			v-if="$route.name === 'vehicle-list'"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<app-table
			name="couriers"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="onPage"
			@on-search-event="onSearch"
			class="is-not-selectable mt-5"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.typeTransport ? props.row.typeTransport.name : null }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.plate }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.brandName || '-' }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.model || '-' }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.color || '-' }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.capacity }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.payloadTons || 0 }}</td>
				<td v-show="showRow(columns, 8)">
					{{ props.row.observations || '-' | limitTo(50) }}
				</td>
				<td v-show="showRow(columns, 9)">
					<app-tooltip-button
						text="Editar"
						icon="edit"
						color="success"
						@click-icon="onEdit(props.row)"
					/>
					<app-tooltip-button
						text="Eliminar"
						icon="delete"
						color="error"
						@click-icon="onDelete(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<v-dialog v-model="dialog" persistent max-width="360">
			<modal-items
				title="Eliminar Vehiculo"
				name-action="Eliminar"
				name-cancel="Cerrar"
				v-if="dialog"
				show-slot
				@close-modal="cancelDelete"
				@action-modal="deleteVehicle"
			>
				<v-flex class="py-2 px-4">
					<label class="bold"
						>¿ Desea eliminar el vehiculo, con la marca {{ this.nameVehicule }} ?</label
					>
				</v-flex>
			</modal-items>
		</v-dialog>
		<router-view></router-view>
		<!-- <action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
		>
			<page-new-vehicles
				v-if="action.code === 'new-vehicle'"
			/>
		</action-sidebar> -->
	</div>
</template>
<script>
import pageNewVehicles from '@/pages/vehicles/page-new-vehicles';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function onEdit({ id }) {
	this.goTo('edit-vehicle', { params: { id } });
}

function onDelete({ id, brandName }) {
	this.vehicleId = id;
	this.nameVehicule = brandName;
	this.dialog = true;
}

function runAction({ code }) {
	if (code === 'new-vehicle') {
		this.goTo('new-vehicle');
	}
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales('vehicles', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.loadData();
}

function $route(value) {
	if (value.name === 'vehicle-list') {
		this.loadData();
	}
}

function cancelDelete() {
	this.vehicleId = null;
	this.dialog = false;
	this.nameVehicule = '';
}

async function deleteVehicle() {
	try {
		await this.$httpSales.delete(`vehicles/${this.vehicleId}`);
		this.showNotification('Se eliminó correctamente');
		this.cancelDelete();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		action: {
			open: false,
			width: 550,
			title: '',
			code: null,
		},
		columns: [
			{
				id: 1,
				name: 'Tipo de Vehículo',
				value: 'plate',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Placa',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Modelo',
				value: 'model',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Color',
				value: 'color',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Capacidad',
				value: 'capacity',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Peso de vehiculos (toneladas)',
				value: 'payloadTons',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Observaciones',
				value: 'observations',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		lastPage: 0,
		nameVehicule: '',
		rows: [],
		params: {
			page: 1,
			limit: 20,
		},
		vehicleId: null,
		dialog: false,
	};
}
export default {
	name: 'page-vehicles-list',
	data,
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
		modalItems,
		pageNewVehicles,
	},
	methods: {
		cancelDelete,
		deleteVehicle,
		onDelete,
		onEdit,
		onPage,
		onSearch,
		runAction,
		loadData,
	},
	watch: {
		$route,
	},
};
</script>
