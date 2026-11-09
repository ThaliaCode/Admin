<template>
	<div>
		<header-page 
			:title="this.$route.meta.title" 
			@clean-product-filter="clearFilter"
			to-show
			:show-excel="false"/>
		<general-filter>
			<v-layout mt-4>
				<v-flex xs12 sm6 md3 pr-3 class="align-col">
					<v-select
						v-model="warehouse"
						:items="warehouses"
						:label="labelWarehouse()"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'warehouseId')"
					>
					</v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 pr-3 class="align-col">
					<v-select
						v-model="terminal"
						label="Punto de Venta"
						:items="terminals"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'terminalId')"
					>
					</v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 pr-3 class="align-col">
					<v-select
						v-model="state"
						label="Estado"
						:items="status"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'status')"
					>
					</v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="table-and-details mt-3 px-4">
			<div :class="['item-table', toShow ? 'active' : null]">
				<app-table name="device"
					:columns="columns"
					:current-page="currentPage"
					:rows="rows"
					:last-page="lastPage"
					class="is-not-selectable px-0"
					:class="[toShow ? 'px-0' : 'px-4']"
					@on-page="changePage"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td
							class="is-not-selectable"
							v-show="showRow(columns, 1)">
							{{ getEmail(props.row) }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.brandName }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.licence }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.inDate | formatDate('DD-MM-YYYY HH:mm:ss') }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.stateConexionName }}</td>
						<td v-show="showRow(columns, 5)">{{ getFullName(props.row) }}</td>
						<td v-show="showRow(columns, 6)">{{ props.row.warehouseName }}</td>
						<td v-show="showRow(columns, 7)">{{ props.row.terminal ? props.row.terminal.name : null }}</td>
						<td v-show="showRow(columns, 8)">{{ props.row.typeConexionName }}</td>
						<td v-show="showRow(columns, 9)">
							<app-tooltip-button
								text="Cerrar Sesión"
								icon="power_settings_new"
								color="error"
								@click-icon="logout(props.row)"
							/>
							<app-tooltip-button
								text="Detalle"
								:icon="props.row.iconArrow"
								color="success"
								@click-icon="viewDetail(props.row)"
							/>
						</td>	
					</template>
				</app-table>
			</div>
			<div
				id="details-device"
				:class="['item-details pr-4', toShow ? 'active' : null]"
				v-if="toShow">
				<device-details 
					@close="closeModal"
					:terminal="deviceSelect"/>
				</div>
		</div>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="360">
			<v-card>
				<v-card-title class="headline">
					<v-icon color="error">
						warning
					</v-icon>
					<span class="title-message ml-2">ADVERTENCIA</span>
				</v-card-title>	
				<v-card-text class="label--text">
					El deslogear a un usuario puede generar la perdida de las ventas sin sincronizar.
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2
							text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2
							text-xs-left>
							<v-btn
								color="primary"
								class="btn-action white--text"
								@click.native="deleteDevice">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import deviceDetails from '@/components/device/device-details';
import generalFilter from '@/components/shared/general-filter';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function created() {
	this.loadData();
	this.loadResource();
}

function viewDetail({ id, iconArrow, terminal }) {
	this.toShow = iconArrow === 'arrow_forward';
	this.rows = this.rows.map((d) => {
		const newData = { ...d };
		newData.iconArrow = d.id === id && iconArrow === 'arrow_forward' ? 'arrow_back' : 'arrow_forward';
		return newData;
	});
	this.deviceSelect = terminal;
}

function closeModal() {
	this.toShow = false;
	this.deviceSelect = null;
	this.rows = this.rows.map((d) => {
		const newData = { ...d };
		newData.iconArrow = 'arrow_forward';
		return newData;
	});
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('devices', { params: this.params });
		this.rows = response.data.map((r) => {
			const newRow = { ...r };
			newRow.iconArrow = 'arrow_forward';
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

async function loadResource() {
	const requests = [
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('terminals'),
	];
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.warehouses },
			{ data: this.terminals },
		] = responses;
	} catch (error) {
		this.showGenericError();
	}
}

function filterRows(filter, value) {
	if (value === 'warehouseId') {
		this.params.warehouseId = filter;
	} else if (value === 'terminalId') {
		this.params.terminalId = filter;
	} else {
		this.params.stateConexion = filter;
	}
	this.currentPage = 1;
	this.loadData();
}

function clearFilter() {
	this.params.warehouseId = null;
	this.params.terminalId = null;
	this.params.stateConexion = null;
	this.warehouse = null;
	this.terminal = null;
	this.state = null;
	this.loadData();
}

function getEmail(row) {
	return getDeeper('employee', 'email')(row);
}

function getFullName(row) {
	return getDeeper('employee', 'fullname')(row);
}

function logout(item) {
	this.dialog = true;
	this.deviceDelete = item;
}

function cancelDelete() {
	this.dialog = false;
	this.deviceDelete = null;
}

async function deleteDevice() {
	try {
		await this.$httpSales.patch(`/disconnect-devices/${this.deviceDelete.id}`);
		this.showNotification('El usuario acaba de cerrar sesión');
		this.loadData();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'DEVICE_NOT_FOUND') {
				this.showNotification('El dispositivo no existe', 'error');
			} else if (err.data.message === 'DEVICE_DISCONNECT_INVALID') {
				this.showNotification('El dispositivo ya se encuentra desconectado', 'error');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.cancelDelete();
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Email', value: 'email', checked: true, visible: true },
			{ id: 2, name: 'Marca', value: 'brand', checked: true, visible: true },
			{ id: 3, name: 'Licencia', value: 'licence', checked: true, visible: true },
			{ id: 4, name: 'Fecha de ingreso', value: 'dateStart', checked: true, visible: true },
			{ id: 5, name: 'Estado de conexión', value: 'status', checked: true, visible: true },
			{ id: 6, name: 'Usuario', value: 'user', checked: true, visible: true },
			{ id: 7, name: 'Local', value: 'local', checked: true, visible: true },
			{ id: 8, name: 'Punto de venta', value: 'point', checked: true, visible: true },
			{ id: 9, name: 'Tipo de Conexión', value: 'action', checked: true, visible: true },
			{ id: 10, name: 'Acciones', value: 'action', checked: true, visible: true },
		],
		currentPage: 1,
		lastPage: 0,
		rows: [],
		toShow: false,
		deviceSelect: null,
		params: {
			page: null,
			ortDirection: 'desc',
			sortField: 'in_date',
		},
		warehouses: [],
		terminals: [],
		warehouse: null,
		terminal: null,
		status: [
			{ id: 1, name: 'Conectado' },
			{ id: 2, name: 'Desconectado' },
		],
		state: null,
		deviceDelete: null,
		dialog: false,
	};
}
export default {
	name: 'page-device',
	components: {
		headerPage,
		appTable,
		deviceDetails,
		generalFilter,
	},
	data,
	created,
	methods: {
		closeModal,
		viewDetail,
		loadData,
		changePage,
		onSearch,
		loadResource,
		filterRows,
		clearFilter,
		getEmail,
		getFullName,
		logout,
		cancelDelete,
		deleteDevice,
	},
};
</script>
<style lang="scss" scoped>
	.table-and-details {
		align-items: flex-start;
		display: flex;
	}

	.item-table {
		flex: 1 1 100%;
	}

	.item-table.active {
		flex: 1 1 70%;
	}

	.item-details.active {
		flex: 1 1 30%;
	}

	.px-0 {
		padding: 0px !important;
	}

	.title-message {
		color: map-get($colors, orange-btn);
		font-family: map-get($fonts, lato-bold);
		font-size: 18px;
	}
</style>