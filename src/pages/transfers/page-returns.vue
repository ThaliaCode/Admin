<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:exportToPdfList="true"
			:open-on-click="true"
			:options-amortizations="listReports"
			@download-dispatch-list="downloadDispatch"
			@clean-product-filter="cleanForm"
		/>
		<v-layout px-4 pt-3 pb-2 row wrap align-end>
			<v-flex xs2>
				<app-select
					label="Tienda Origen"
					item-text="name"
					item-value="id"
					:item="params.warehouseOriginId"
					model="warehouseOriginId"
					:return-object="false"
					:items="warehouses"
					@input="setFilters"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					label="Tienda Destino"
					item-text="name"
					item-value="id"
					:item="params.warehouseSourceId"
					model="warehouseSourceId"
					:return-object="false"
					:items="warehouses"
					@input="setFilters"
				/>
			</v-flex>
		</v-layout>
		<app-table
			name="returns"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="data"
			:items-quantity="data.length"
			:items-total-quantity="itemsTotalQuantity"
			@on-page="changePage"
			class="is-not-selectable mt-2"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.number }}
				</td>
				<td v-show="showRow(columns, 2)">
					<template>
						<v-tooltip top>
							<span>
								{{ props.row.name }}
							</span>
							<span slot="activator">
								{{ props.row.code }}
							</span>
						</v-tooltip>
					</template>
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.warehouseOriginName }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.warehouseSourceName }}
				</td>
				<td v-show="showRow(columns, 5)">{{ props.row.statusName }}</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.totalDetails.totalDevolution }}
				</td>
				<td v-show="showRow(columns, 7)">SI</td>
				<td v-show="showRow(columns, 8)">
					{{ props.row.observations || '-' }}
				</td>
				<td v-show="showRow(columns, 9)">
					{{ props.row.createdAt | formatDate }}
				</td>
				<td v-show="showRow(columns, 10)">
					{{ props.row.updatedAt | formatDate }}
				</td>
				<td v-show="showRow(columns, 11)">
					<app-tooltip-button
						color="success"
						icon="person_pin"
						text="Ver Usuarios"
						:size="18"
						@click-icon="openSlide('user', props.row)"
					/>
					<app-tooltip-button
						color="primary"
						icon="settings"
						text="Ajustar"
						:disabled="!!props.row.flagAdjust"
						:size="18"
						@click-icon="openSlide('adjust', props.row)"
					/>
					<v-tooltip top>
						<v-btn
							slot="activator"
							class="table-icon create-sale"
							@click="goToDetail(props.row)"
						>
							<v-icon color="primary">visibility</v-icon>
						</v-btn>
						<span>Ver Detalle</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeSidebar"
		>
			<returns-products
				v-if="action.code === 'adjust'"
				:type-documents="typeDocuments"
				:data-select="dataSelect"
				@close-modal="closeSidebar"
				@update="updateDate"
			/>
			<users-transfer
				v-if="action.code === 'user'"
				@close="closeSidebar"
				:delivery-user-info="dataSelect.deliveryUserInfo"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import returnsProducts from '@/components/transfers/returns-products';
import usersTransfer from '@/components/transfers/users-transfer';
import helper from '@/shared/helper';

function changePage(page) {
	this.params.page = page;
	this.currentPage = page;
	this.loadData(page);
}

function closeSidebar() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.action.width = 700;
	this.dataSelect = {};
}

function openSlide(code, dataSelect) {
	const idWarehouse = helper.getLocalData('admin-user').warWarehousesId;
	this.action.code = code;
	this.dataSelect = dataSelect;
	if (code === 'adjust') {
		this.action.title = 'PRODUCTOS DEVUELTOS';
		if (
			idWarehouse === dataSelect.warehouseOriginId ||
			Boolean(this.$userInfo.flagAdmin)
		) {
			this.action.open = true;
		} else {
			this.showGenericError(
				`Usuario no permitido para anular transferencia, solo usuarios del almacen ${dataSelect.warehouseOriginName} puede incializar la transferencia`
			);
		}
	} else if (code === 'user') {
		this.action.title = 'MOVIMIENTOS DE USUARIOS';
		this.action.width = 431;
		this.action.open = true;
	}
}

function goToDetail({ id }) {
	this.goTo('pages-returns-detail', { params: { id } });
}

function created() {
	this.loadData();
	this.loadTypeDocuments();
	this.loadWarehouses();
}

async function loadWarehouses() {
	try {
		({ data: this.warehouses } = await this.warehousesList());
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadData(page = 1) {
	this.params.page = page;
	try {
		const response = await this.$httpProducts.get('transfers/list', {
			params: this.params,
		});
		this.data = response.data.results.map((r) => {
			const newResult = { ...r };
			newResult.details = r.details.map((d) => {
				const newDetail = { ...d };
				newDetail.typeDocumentCode = 'RT';
				return newDetail;
			});
			return newResult;
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTypeDocuments() {
	try {
		const { data: response } = await this.$httpProducts.get('type-documents');
		this.typeDocuments = response;
	} catch (error) {
		this.showGenericError();
	}
}

function updateDate() {
	this.closeSidebar();
	this.loadData(this.currentPage);
}

function setFilters({ model, value }) {
	this.params[model] = value;
	this.loadData();
}

function cleanForm() {
	this.params = {
		...this.params,
		warehouseSourceId: null,
		warehouseOriginId: null,
	};
	this.loadData();
}

function data() {
	return {
		data: [],
		columns: [
			{ id: 1, name: '#', visible: true, checked: true },
			{ id: 2, name: 'Tipo doc.', visible: true, checked: true },
			{ id: 3, name: 'Tienda Origen', visible: true, checked: true },
			{ id: 4, name: 'Tienda Destino', visible: true, checked: true },
			{ id: 5, name: 'Estado', visible: true, checked: true },
			{ id: 6, name: 'Cant', visible: true, checked: true },
			{ id: 7, name: 'Rechazados', visible: true, checked: true },
			{ id: 8, name: 'Observación', visible: true, checked: true },
			{ id: 9, name: 'Fecha Devolución', visible: true, checked: true },
			{ id: 10, name: 'Fecha Ajuste', visible: true, checked: true },
			{ id: 11, name: 'Acciones', visible: true, checked: true },
		],
		lastPage: 0,
		itemsTotalQuantity: 0,
		currentPage: 1,
		params: {
			page: 1,
			limit: 20,
			flagReturned: 1,
		},
		action: {
			code: '',
			open: false,
			title: '',
			width: 700,
		},
		typeDocuments: [],
		dataSelect: {},
		warehouses: [],
		listReports: [
			{
				id: 1,
				code: 'products-return-pdf',
				originName: 'reporte_lista_devoluciones',
				name: 'Reporte de Lista de Devoluciones',
			},
			{
				id: 2,
				code: 'products-return-details-pdf',
				originName: 'reporte_detallado_devoluciones_productos',
				name: 'Reporte Detallado de Devoluciones de Productos',
			},
		],
	};
}
export default {
	name: 'page-returns',
	created,
	components: {
		headerPage,
		appTable,
		actionSidebar,
		returnsProducts,
		usersTransfer,
	},
	methods: {
		changePage,
		cleanForm,
		closeSidebar,
		openSlide,
		goToDetail,
		loadData,
		loadTypeDocuments,
		loadWarehouses,
		setFilters,
		updateDate,
		async downloadDispatch(code) {
			const report = this.listReports.find((r) => r.code === code);
			const body = { ...this.params };
			body.isDetailReturn = code === 'products-return-details-pdf';
			delete body.limit;
			delete body.page;
			if (!report) return;
			try {
				this.generateReportGlobalPdf(report, body);
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	data,
};
</script>
<style lang="scss" scoped>
.create-sale {
	background-color: transparent !important;
	box-shadow: none;
	margin: 0px;
	min-width: auto;

	.icon {
		font-size: 20px;
	}
}
</style>
