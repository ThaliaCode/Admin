<template>
	<div class="warehouse">
		<header-page
			:show-excel="false"
			to-show
			:title="$route.meta.title"
			@clean-product-filter="onCleanData"
		/>
		<app-actions
			:value-disabled="actionDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap align-center mt-3">
			<v-flex xs12 sm3 pr-4>
				<app-select
					:items="subsidiaries"
					item-text="rzSocial"
					item-value="id"
					:item="subsidiaryId"
					:label="labelSucursal()"
					model="subsidiaryId"
					:return-object="false"
					@input="setSubsidiaryId"
				/>
			</v-flex>
			<v-flex xs12 sm6 md1 mt-4>
				<v-btn type="button" color="primary" class="btn-action" @click="loadData(1)">
					Buscar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<v-layout mt-4>
			<v-flex xs12>
				<app-table
					name="warehouse"
					:check-all="checkAll"
					:columns="columns"
					:current-page="currentPage"
					:inputSearch="false"
					:last-page="lastPage"
					:rows="rows"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					selectable
					@on-page="loadData"
					@on-selected-all="selectedAll"
					@row-is-selected="rowIsSelected"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.subsidiary ? props.row.subsidiary.rzSocial : null }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.updatedAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 6)">
							<template v-if="isSupport">
								<v-tooltip top>
									<v-switch
										slot="activator"
										color="success"
										class="switch-inline switch-image"
										hide-details
										v-model="props.row.flagActive"
										@change="changeActive($event, props.row)"
									></v-switch>
									<span>{{ props.row.flagActive ? 'Activo' : 'Inactivo' }}</span>
								</v-tooltip>
							</template>
							<app-tooltip-button
								color="green"
								icon="edit"
								:text="`Editar ${labelWarehouse()}`"
								@click-icon="runAction({ code: 'TNDD' }, props.row)"
							></app-tooltip-button>
							<app-tooltip-button
								color="primary"
								icon="settings"
								text="Configuración"
								@click-icon="runAction({ code: 'SETT' }, props.row)"
							></app-tooltip-button>
							<app-tooltip-button
								color="error"
								icon="delete"
								text="Eliminar"
								@click-icon="openDialogDelete(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:width="action.width"
			:title="action.title"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<sale-points-form
				v-if="isSalePoints"
				:is-loading="isLoading"
				:sale-points="salePoints"
				:type-documents="typeDocuments"
				:war-code-taxes="warehouse.codeTaxes"
				:war-subsidiary-id="warehouse.subsidiaryId"
				:war-warehouses-id="warehouse.id"
				:subsidiaryIdSale="subsidiaryIdSale"
				@cancel="cancelSalePoints"
				@save="saveSalePoints"
			/>
			<warehouse-settings
				v-if="action.code === 'SETT'"
				:warehouse="newWarehouse"
				@close="closeModal"
			/>
		</action-sidebar>
		<v-dialog v-model="dialogDelete" persistent max-width="425">
			<modal-items
				title="Eliminar Almacén"
				name-action="Eliminar"
				name-cancel="Cerrar"
				v-if="dialogDelete"
				show-slot
				@close-modal="closeDialog"
				@action-modal="deleteWarehouse"
			>
				<v-flex class="py-2 px-4">
					<label class="bold"
						>¿Deseas eliminar la {{ labelWarehouse().toLowerCase() }}
						{{ warehouseSelect.name }}?</label
					>
				</v-flex>
			</modal-items>
		</v-dialog>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import salePointsForm from '@/components/warehouses/sale-points-form';
import lib from '@/shared/lib';
import warehouseSettings from '@/components/warehouses/warehouse-settings';

function created() {
	const sucursalIndex = this.columns.findIndex((r) => r.value === 'subsidiary');
	this.columns[sucursalIndex].name = this.labelSucursal();
	this.loadSubsidiaries();
	this.loadData();
}

function cancelSalePoints() {
	this.closeModal();
}

async function loadData(page = 1) {
	this.params.subsidiaryId = this.subsidiaryId;
	this.currentPage = page;
	this.params.page = page;
	try {
		const warehouses = await this.warehousesList(this.params);
		this.rows = warehouses.data;
		this.lastPage = Number(warehouses.headers['x-last-page']);
		this.itemsTotalQuantity = Number(warehouses.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.subsidiariesList());
	if (this.subsidiaries.length === 1) {
		this.subsidiaryId = this.subsidiaries[0].id;
		this.loadData(1);
	}
}

function onCleanData() {
	this.subsidiaryId = [];
	this.params = {
		page: 1,
		subsidiaryId: null,
	};
	this.loadData();
}

function openIt(warehouse) {
	let newWarehouse = null;
	if (warehouse) {
		newWarehouse = warehouse;
		newWarehouse.lat = 0;
		newWarehouse.long = 0;
		if (warehouse.location && (warehouse.location.x || warehouse.location.y)) {
			const { x, y } = warehouse.location;
			newWarehouse.lat = x;
			newWarehouse.long = y;
		}
		this.verifiedTerminals(warehouse);
	}
	this.action.title = warehouse
		? `Editar ${this.labelWarehouse()}: ${warehouse.name}`
		: `Nueva ${this.labelWarehouse()}`;
	this.newWarehouse = newWarehouse || { ...this.default };
	if (!warehouse) {
		this.newWarehouse.isMain = false;
	}
	this.action.open = true;
}

async function saveData() {
	const id = this.newWarehouse.id;
	const url = id ? `warehouses/${id}` : 'warehouses';
	const method = id ? 'patch' : 'post';
	const message = id ? 'editada' : 'creada';
	const body = {
		address: this.newWarehouse.address,
		code: this.newWarehouse.code,
		isMain: id ? this.newWarehouse.isMain : Number(this.newWarehouse.isMain),
		name: this.newWarehouse.name,
		subsidiaryId: this.newWarehouse.subsidiaryId,
		latitude: this.newWarehouse.lat,
		longitude: this.newWarehouse.long,
	};
	if (this.isEcuador) {
		body.codeTaxes = this.newWarehouse.codeTaxes;
	}
	const params = {
		existingWarehouseId: this.existingWarehouseId,
	};
	try {
		await this.$httpProducts[method](url, body, { params });
		this.hasTerminals = false;
		this.action.open = false;
		this.showNotification(
			`${this.labelWarehouse(false, true)} ha sido ${message} correctamente.`
		);
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

async function saveSalePoints(newSalePoints) {
	this.isLoading = true;
	const message = this.salePoints.length > 0 ? 'edición' : 'creación';
	const body = newSalePoints.map((sp) => {
		const newSalePoint = {
			cashId: sp.cashId,
			codeTaxes: null,
			comSubsidiariesId: sp.comSubsidiariesId,
			employeesId: sp.employeesId,
			flagActive: sp.flagActive,
			name: sp.name,
			// flagEcommerce: sp.flagEcommerce ? sp.flagEcommerce === 1 : false,
			typeDevice: sp.typeDevice || null,
			series: sp.documents.reduce((acum, spd) => {
				let acumRet = [...acum];
				const newDocument = {};
				if (spd.isSelected) {
					if (spd.billing) {
						const newBill = spd.billing.reduce((ac, bill) => {
							if (bill.serie !== '' && bill.number !== '') {
								const newRe = {
									codeTaxes: this.isEcuador ? bill.codeTaxes : null,
									companyTemplateId: bill.companyTemplateId,
									description: bill.description,
									details: bill.details.map((d) => {
										const newDetail = {
											codeTaxes: this.isEcuador ? d.codeTaxes : null,
											companyTemplateId: d.companyTemplateId,
											description: d.description,
											serie: d.serie,
											number: d.number,
											salTypeDocumentsId: d.salTypeDocumentsId,
										};
										if (d.id) {
											newDetail.id = d.id;
										}
										return newDetail;
									}),
									serie: bill.serie,
									number: bill.number,
									salTypeDocumentsId: bill.salTypeDocumentsId,
									comSubsidiariesId: bill.comSubsidiariesId,
									typeBilling: bill.typeBilling || 2,
									flagSendBilling: bill.flagSendBilling,
								};
								if (bill.id) {
									newRe.id = bill.id;
								}
								ac.push({ ...newRe });
							}
							return ac;
						}, []);
						acumRet = acumRet.concat(newBill);
					} else {
						newDocument.codeTaxes = this.isEcuador ? spd.codeTaxes : null;
						newDocument.companyTemplateId = spd.companyTemplateId;
						newDocument.description = spd.description;
						newDocument.details = spd.details.map((d) => {
							const newDetail = {
								codeTaxes: this.isEcuador ? d.codeTaxes : null,
								companyTemplateId: d.companyTemplateId,
								description: d.description,
								serie: d.serie,
								number: d.number,
								salTypeDocumentsId: d.salTypeDocumentsId,
							};
							if (d.id) {
								newDetail.id = d.id;
							}
							return newDetail;
						});
						newDocument.serie = spd.serie;
						newDocument.number = spd.number;
						newDocument.salTypeDocumentsId = spd.salTypeDocumentsId;
						newDocument.comSubsidiariesId = spd.comSubsidiariesId;
						newDocument.typeBilling = spd.typeBilling || 2;
						newDocument.flagSendBilling = spd.flagSendBilling;
						if (spd.id) {
							newDocument.id = spd.id;
						}
						acumRet.push({ ...newDocument });
					}
				}
				return acumRet;
			}, []),
			warWarehousesId: sp.warWarehousesId,
			warWarehousesName: this.warehouse.name,
		};
		if (this.salePoints.length && sp.id) {
			newSalePoint.id = sp.id;
		}
		return newSalePoint;
	});
	try {
		await this.$httpSales.post('terminals-series', body);
		this.showNotification(`La ${message} de puntos de venta se realizó correctamente.`);
		this.closeModal();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'CORRELATIVE_EXISTS') {
				this.showGenericError('Los correlativos se repiten');
			} else if (err.data.message === 'CASH_WITH_ACTIVE_OPENING_STATUS') {
				this.showGenericError(err.data.messageError);
			} else if (err.data.message === 'CASH_NOT_FOUND') {
				this.showGenericError(
					'Seleccione una caja, asegúrese de seleccionar una caja diferente para cada punto de venta.'
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function toggleValue() {
	if (this.existingWarehouseId) {
		this.existingWarehouseId = null;
	}
}

function closeModal() {
	this.action.code = '';
	this.action.open = false;
	this.salePoints = [];
	this.hasTerminals = false;
	this.clearModal();
}

function clearModal() {
	this.newWarehouse = { ...this.default };
	this.dataSelected = [];
	this.loadData();
}

function runAction(item, row) {
	this.action.code = item.code;
	if (item.code === 'TNDD') {
		const params = row ? { id: row.id } : {};
		const route = row ? 'page-warehouses-edit' : 'page-warehouses-new';
		this.goTo(route, { params });
	} else if (item.code === 'sale-points') {
		this.action.title = `${this.dataSelected[0].name} - PUNTOS DE VENTA`;
		this.subsidiaryIdSale = this.warehouse.subsidiaryId;
		this.loadTypeDocuments();
		this.action.width = 595;
	} else if (item.code === 'SETT') {
		this.newWarehouse = { ...row };
		this.action.title = `Configuración-${row.name}`;
		this.action.open = true;
		this.action.width = 470;
	}
}

function setSubsidiaryId({ model, value }) {
	if (value) {
		this[model] = value;
	}
}

function isWarehouse() {
	return this.action.code === 'TNDD';
}

function actionDisabled() {
	const disabled = this.dataSelected.length !== 1;
	return [{ code: 'sale-points', disabled }];
}

function rowIsSelected(row) {
	this.checkAll = this.rows.every((r) => r.isSelected);
	const { id, isSelected } = row;
	const index = this.dataSelected.findIndex((ds) => ds.id === id);
	if (!isSelected) {
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	} else {
		this.dataSelected.push({ ...row });
	}
	this.warehouse = this.dataSelected.length === 1 ? this.dataSelected[0] : {};
}

function selectedAll(checked) {
	this.checkAll = checked;
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = checked;
		return newRow;
	});
	this.dataSelected = [...this.rows.filter((r) => r.isSelected)];
}

function isSalePoints() {
	return this.action.code === 'sale-points';
}

async function loadTypeDocuments() {
	const params = { includeInList: 1, flagTemplate: 1, flagSerie: 1 };
	({ data: this.typeDocuments } = await this.$httpSales.get('type-documents-all', {
		params,
	}));
	this.loadSalePoints();
}

async function loadSalePoints() {
	const params = { warWarehousesId: this.warehouse.id };
	({ data: this.salePoints } = await this.$httpSales.get('terminals', {
		params,
	}));
	this.salePoints = this.salePoints.map((salePoint) => {
		const { employees } = salePoint;
		const newSalePoint = { ...salePoint };
		newSalePoint.employeesId = lib.map(lib.getPropertysValue('id'), employees);
		return newSalePoint;
	});
	this.action.open = true;
}

async function verifiedTerminals({ id }) {
	try {
		const { data: response } = await this.$httpSales.get(`terminals/${id}/warehouse`);
		this.hasTerminals = response.terminal;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function validations() {
	return {
		newWarehouse: {
			name: {
				required,
			},
			code: {
				required,
			},
			subsidiaryId: {
				required,
			},
			address: {
				required,
			},
		},
	};
}

function openDialogDelete(warehouse) {
	this.warehouseSelect = { ...warehouse };
	this.dialogDelete = true;
}

function closeDialog() {
	this.dialogDelete = false;
	this.warehouseSelect = {};
}

async function deleteWarehouse() {
	const { id } = this.warehouseSelect;
	try {
		await this.$httpProducts.delete(`warehouses/${id}`);
		this.showNotification('Se eliminó correctamente');
		this.loadData();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'INVENTORY_EXIST_NOT_DELETE') {
				this.showGenericError(
					`${this.labelWarehouse(false, true)} tiene inventarios relacionados`
				);
			} else if (err.data.message === 'TRANSFER_EXIST_NOT_DELETE') {
				this.showGenericError(
					`${this.labelWarehouse(false, true)} tiene transferencias relacionados`
				);
			} else if (err.data.message === 'KARDEX_EXIST_NOT_DELETE') {
				this.showGenericError(
					`${this.labelWarehouse(false, true)} tiene registros en el kardex relacionados`
				);
			} else if (err.data.message === 'ASSIGNED_EMPLOYEE_NOT_DELETE') {
				this.showGenericError(
					`${this.labelWarehouse(false, true)} está asignada a un empleado`
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.closeDialog();
	}
}

function data() {
	return {
		isSupport: this.$userInfo.roleCode === 'SUPPORT',
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		checkAll: false,
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Empresa',
				value: 'subsidiary',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Última actualización',
				value: 'updatedAt',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Fecha Creación',
				value: 'createdAt',
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dataSelected: [],
		default: {
			address: '',
			code: '',
			codeTaxes: '',
			isMain: false,
			lat: 0,
			long: 0,
			name: '',
			subsidiaryId: '',
		},
		existingWarehouseId: null,
		hasTerminals: false,
		isLoading: false,
		itemsTotalQuantity: 0,
		lastPage: 0,
		newWarehouse: {
			address: '',
			code: '',
			codeTaxes: '',
			isMain: false,
			lat: 0,
			long: 0,
			name: '',
			subsidiaryId: '',
		},
		params: {
			page: 1,
			subsidiaryId: null,
		},
		rows: [
			{
				subsidiary: {},
			},
		],
		salePoints: [],
		subsidiaries: [],
		subsidiaryId: [],
		typeDocuments: [],
		warehouse: {},
		warehouseSelect: {},
		dialogDelete: false,
	};
}

export default {
	name: 'warehouses',
	components: {
		actionSidebar,
		appActions,
		appTable,
		autocompleteComponent,
		generalFilter,
		headerPage,
		modalItems,
		modalSidebarButton,
		salePointsForm,
		warehouseSettings,
	},
	computed: {
		actionDisabled,
		isSalePoints,
		isWarehouse,
	},
	created,
	data,
	methods: {
		cancelSalePoints,
		clearModal,
		closeModal,
		loadData,
		loadSalePoints,
		loadSubsidiaries,
		loadTypeDocuments,
		onCleanData,
		openIt,
		rowIsSelected,
		runAction,
		saveData,
		saveSalePoints,
		selectedAll,
		setSubsidiaryId,
		toggleValue,
		verifiedTerminals,
		openDialogDelete,
		closeDialog,
		deleteWarehouse,
		async changeActive(event, row) {
			const body = { flagActive: event ? 1 : 0 };
			try {
				await this.$httpProducts.patch(`warehouses/${row.id}/flag-active`, body);
				this.showNotification(
					`El estado del ${this.labelWarehouse(
						false,
						true
					)} ha sido modificado correctamente.`
				);
				this.loadData(1);
			} catch (err) {
				this.showGenericError();
			}
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.fonts {
	@include txt-config(lato-bold, medium);
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	justify-content: center;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}
</style>
