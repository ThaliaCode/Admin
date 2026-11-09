<template>
	<div>
		<header-page
			name="liquidation-list"
			:title="$route.meta.title"
			@clean-product-filter="clearFilter"
			to-show
			:show-excel="false"
		></header-page>
		<!-- AGREGAR FUNCION A LA ACCION -->
		<app-actions :resource-uri="$route.name" @run-action="runAction" />
		<general-filter>
			<v-layout mt-2 mb-3>
				<v-flex xs3 pr-3>
					<label class="caption">Nombre</label>
					<v-text-field
						bottom
						single-line
						hide-details
						type="text"
						class="filter-select shadow-inset"
						content-class="filter-select-content"
						v-model="params.name"
					></v-text-field>
				</v-flex>
				<v-flex xs2 pr-3>
					<label class="caption">Fecha Inicial</label>
					<date-component
						:date="params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'startDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs2 pr-3>
					<label class="caption">Fecha Final</label>
					<date-component
						:date="params.endDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'endDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs2>
					<label class="caption">Estado</label>
					<v-select
						v-model="params.status"
						:items="status"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					>
					</v-select>
				</v-flex>
				<v-flex mt-3 ml-5>
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						@click="loadData"
					>
						Buscar
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				selectable
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="totalItemsVisible"
				:items-total-quantity="totalItems"
				:check-all="checkAll"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.startDate }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.endDate }}</td>
					<td v-show="showRow(columns, 4)">
						<app-tooltip-button
							v-if="props.row.status === 1"
							class="mr-2"
							height="20"
							:color="getColor(props.row.status)"
							icon="radio_button_checked"
							:text="getTooltip(props.row.status)"
							@click-icon="activeLiquidation(props.row)"
						/>
						<app-tooltip-button
							v-else
							class="mr-2"
							height="20"
							:color="getColor(props.row.status)"
							icon="radio_button_checked"
							:text="getTooltip(props.row.status)"
						/>
					</td>
					<td v-show="showRow(columns, 5)">
						<app-tooltip-button
							class="mr-2"
							height="20"
							color="primary"
							icon="person"
							text="Asignar vendedores"
							@click-icon="openSidebar('vendors-assign', props.row)"
						/>
						<app-tooltip-button
							class="table-icon mr-2"
							height="20"
							color="primary"
							icon="mode_edit"
							text="Editar"
							@click-icon="openSidebar('new-liquidation', props.row, 'edit')"
						></app-tooltip-button>
						<app-tooltip-button
							class="mr-2"
							height="20"
							icon="copyright"
							text="Clonar liquidación"
							@click-icon="openSidebar('new-liquidation', props.row, 'clone')"
						></app-tooltip-button>
						<app-tooltip-button
							class="mr-2"
							text="Eliminar liquidación"
							height="20"
							color="pink"
							icon="delete"
							@click-icon="modalCloseLiquidation('delete', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							class="mr-2"
							icon="remove_red_eye"
							text="Ver detalle liquidación"
							color="primary"
							height="20"
							@click-icon="viewDetail(props.row)"
						/>
						<app-tooltip-button
							class="mr-2"
							icon="highlight_off"
							text="Cerrar liquidación"
							:disabled="props.row.status !== 2"
							color="pink"
							height="20"
							@click-icon="modalCloseLiquidation('close', props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<new-liquidation
				v-if="action.code === 'new-liquidation'"
				:subsidiaries="subsidiaries"
				:liquidation-edit="liquidationEdit"
				@close-modal="closeModal"
				@load-data="loadData"
			/>
			<vendors-assign
				v-if="action.code === 'vendors-assign'"
				:exist-employee="existEmployee"
				@load-data-ohers="loadDataOhers"
				@save-vendors="saveVendors"
				@close-modal="closeModal"
			/>
		</action-sidebar>
		<template>
			<simple-modal
				:open="showModalLiquidation"
				@close="modalCloseLiquidation"
				textCancel="Cancelar"
				@cancel="modalCloseLiquidation"
				textConfirm="Aceptar"
				@confirm="updateLiquidation(liquidation)"
			>
				<span slot="title">
					<div class="icon-text-container">
						<v-icon class="icon-error" color="success">error</v-icon>
						<span class="title--alert"
							>¿Esta seguro de
							{{ liquidation.code === 'delete' ? 'eliminar' : 'cerrar' }} la
							liquidación {{ liquidation.name }}?</span
						>
					</div>
				</span>
				<span slot="subtitle" class="subtitle--alert">
					Si {{ liquidation.code === 'delete' ? 'elimina' : 'cierra' }} la
					liquidacion, se
					{{ liquidation.code === 'delete' ? 'eliminan' : 'cierran' }} todos los
					vendedores
				</span>
			</simple-modal>
		</template>
		<template>
			<simple-modal
				:open="viewActiveLiquidation"
				@close="activeLiquidation"
				textCancel="Cancelar"
				@cancel="activeLiquidation"
				textConfirm="Aceptar"
				@confirm="updateStatus(liquidation)"
			>
				<span slot="title">
					<div class="icon-text-container">
						<v-icon class="icon-error" color="success">error</v-icon>
						<span class="title--alert"
							>¿Esta seguro que desea activar la liquidación
							{{ liquidation.name }}?</span
						>
					</div>
				</span>
			</simple-modal>
		</template>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appActions from '@/components/shared/app-actions';
import generalFilter from '@/components/shared/general-filter';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import vendorsAssign from '@/components/field-sale/vendors/vendors-assign';
import dateComponent from '@/components/shared/date-component';
import newLiquidation from '@/components/liquidation/new-liquidation';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';

function data() {
	return {
		data: [],
		params: {
			name: null,
			startDate: null,
			endDate: null,
			status: null,
			page: 1,
			limit: 30,
		},
		lastPage: 0,
		totalItems: 0,
		totalItemsVisible: 0,
		currentPage: 1,
		search: null,
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Fecha inicio', visible: true, checked: true },
			{ id: 3, name: 'Fecha final', visible: true, checked: true },
			{ id: 4, name: 'Estado', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true },
		],
		checkAll: false,
		dataSelected: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 620,
		},
		subsidiaries: [],
		vendors: [],
		viewActiveLiquidation: false,
		liquidation: {},
		existEmployee: [],
		liquidationEdit: null,
		showModalLiquidation: false,
		idAsignVendor: null,
		status: [
			{
				name: 'Inactiva',
				id: 0,
				color: '#000000',
			},
			{
				name: 'Pendiente',
				id: 1,
				color: 'baseText',
			},
			{
				name: 'Iniciada',
				id: 2,
				color: 'success',
			},
			{
				name: 'Cerrada',
				id: 3,
				color: 'pink',
			},
		],
	};
}

function clearFilter() {
	this.params = {
		page: 1,
		limit: 30,
		name: null,
		startDate: null,
		endDate: null,
		status: null,
	};
	this.loadData();
}

async function loadData() {
	try {
		const response = await this.$httpSettlement.get('/settlements', {
			params: this.params,
		});
		this.data = response.data.settlements;
		this.totalItems = this.data.length;
		this.lastPage = Number(response.headers['x-last-page']);
		// this.totalItems = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadDataOhers() {
	try {
		({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.loadData();
	this.loadDataOhers();
}

function changePage(page) {
	this.currentPage = page;
	this.loadProducts();
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function runAction({ code, name }) {
	if (code === 'new-liquidation') {
		this.action = {
			open: true,
			code,
			width: 620,
			title: name,
		};
	}
}

export default {
	name: 'liquidation-list',
	data,
	components: {
		headerPage,
		generalFilter,
		appTable,
		actionSidebar,
		dateComponent,
		newLiquidation,
		vendorsAssign,
		simpleModal,
		appActions,
	},
	created,
	methods: {
		clearFilter,
		loadData,
		runAction,
		changePage,
		loadDataOhers,
		closeModal,
		getColor(id) {
			const statusItem = this.status.find((item) => item.id === id);
			return statusItem ? statusItem.color : null;
		},
		getTooltip(id) {
			const statusItem = this.status.find((item) => item.id === id);
			return statusItem ? statusItem.name : null;
		},
		activeLiquidation(row) {
			if (row) {
				this.liquidation = row;
			}
			this.viewActiveLiquidation = !this.viewActiveLiquidation;
		},
		async updateStatus(row) {
			const { id } = row;
			const body = {
				status: 2,
			};
			try {
				await this.$httpSettlement.put(`/settlements/${id}/status`, body);
				this.activeLiquidation();
				this.loadData();
			} catch (err) {
				this.showGenericError();
			}
		},
		openSidebar(code, row, action) {
			if (code === 'new-liquidation') {
				this.liquidationEdit = row;
				this.action = {
					open: true,
					code,
					width: 620,
				};
				if (action) {
					this.action.title =
						action === 'edit' ? 'Editar liquidacion' : 'Clonar liquidacion';
					this.liquidationEdit.action = action;
				} else {
					this.action.title = 'Crear liquidacion';
				}
			} else if (code === 'vendors-assign') {
				this.action = {
					open: true,
					code,
					title: 'Asignar vendedores',
					width: 620,
				};
				this.existEmployee = row.employees;
				this.idAsignVendor = row.id;
			}
		},
		modalCloseLiquidation(code, row) {
			if (row) {
				this.liquidation = row;
				this.liquidation.code = code;
			}
			this.showModalLiquidation = !this.showModalLiquidation;
		},
		async updateLiquidation(row) {
			const { code, id } = row;
			const methods = code === 'close' ? 'put' : 'delete';
			const body = code === 'close' ? { status: 3 } : undefined;
			const url =
				code === 'close'
					? `/settlements/${id}/status`
					: `/settlements/${id}/delete`;
			try {
				await this.$httpSettlement[methods](url, body);
				this.loadData();
				this.modalCloseLiquidation();
			} catch (err) {
				if (
					err.data.message === 'MASTER_SETTLEMENT_HAS_OPEN_CHILDS_SETTLEMENTS'
				) {
					this.showGenericError(
						'No se puede cerrar la liquidación, tiene liquidaciones de vendedores abiertas'
					);
					this.showModalLiquidation = !this.showModalLiquidation;
				} else {
					this.showGenericError();
				}
			}
		},
		async viewDetail({ id }) {
			this.goTo('liquidation-detail', { params: { id } });
		},
		setDate({ model, value }) {
			this.params[model] = value;
		},
		async saveVendors(params) {
			try {
				await this.$httpSettlement.post(
					`settlements/${this.idAsignVendor}/assign-employee`,
					params
				);
				this.showNotification(
					'Se asigno correctamente los vendedores a la liquidación.'
				);
				this.loadData();
				this.closeModal();
			} catch (error) {
				if (error.data.message === 'EMPLOYEE_ALREADY_ASSIGNED_TO_SETTLEMENT') {
					this.showGenericError(
						'Los empleados seleccionados, ya fueron asignados a la liquidación'
					);
				} else {
					this.showGenericError();
				}
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.icon-text-container {
	display: flex;
	flex-direction: column;
	align-items: center;

	.icon-error {
		font-size: 80px;
	}
}

.title--alert {
	color: #31656e;
	font-size: 27px;
	margin-top: 10px;
	font-weight: bolder;
}

.subtitle--alert {
	color: color(primary);
	font-size: 16px;
}
</style>
