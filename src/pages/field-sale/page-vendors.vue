<template>
	<div>
		<header-page
			:caption-navigation="captionNavigation"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			@clean-product-filter="onClean"
		></header-page>
		<app-actions
			:value-disabled="valueDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<vendors-filter
			:groups="groups"
			:clean="cleanFilter"
			@filter-list="onFilterList"
		></vendors-filter>
		<vendors-table
			:check-all="checkAll"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="vendors"
			:clean-search="isClean"
			:items-total-quantity="itemsTotalQuantity"
			@delete-vendors="openDialogDeleteVendors"
			@on-search="callServiceAndSearch"
			@edit-vendor="editDetailVendor"
			@on-page="changePage"
			@on-selected-all="onSelectedAll"
			@row-is-selected="rowIsSelected"
			@see-detail="onDetail"
		></vendors-table>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<template v-if="isActionCode('detail')">
				<v-icon
					v-if="isSupervisor(vendor)"
					class="icon-align"
					slot="title-icon"
					color="success"
				>
					check_circle
				</v-icon>
				<vendors-detail
					:currency="currency"
					:vendor-id="vendorId"
					:vendor="vendor"
					@close-slide="closeModal"
				></vendors-detail>
			</template>
			<template v-if="isActionCode('assign-supervisor')">
				<vendors-supervisor-assign
					:search-value="searchValue"
					@save-modal="saveModal"
					@close-modal="closeModal"
				></vendors-supervisor-assign>
			</template>
			<create-group
				:group="group"
				v-if="isActionCode('CG')"
				@cancel-modal="closeModal"
				@create-group="createGroupSellers"
			/>
			<assign-group
				:groups="groups"
				v-if="isActionCode('AG')"
				@close-modal="closeModal"
				@assign-group="assignGroupSellers"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="400">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="success"
						dark
						@click.native="assignSupervisor"
					>
						Asignar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDelete" persistent max-width="450px">
			<v-card>
				<v-card-title class="headline ft-16">{{
					dialogMessageDelete
				}}</v-card-title>
				<v-divider></v-divider>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--texr"
								@click.native="closeDialogVendors"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteVendors"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import assignGroup from '@/components/customers/assign-group';
import headerPage from '@/components/shared/header-page';
import vendorsDetail from '@/components/field-sale/vendors/vendors-detail';
import vendorsFilter from '@/components/field-sale/vendors/vendors-filter';
import vendorsSupervisorAssign from '@/components/field-sale/vendors/vendors-supervisor-assign';
import vendorsTable from '@/components/field-sale/vendors/vendors-table';
import TypeSeller from '@/shared/type-seller';
import typeEntityId from '@/shared/type-entity';
import createGroup from '@/components/customers/create-group';

function created() {
	this.action.value = false;
	this.action.code = null;
	this.action.title = '';
	this.getListVendors();
	this.loadGroups();
}

function openHelp() {
	this.action = {
		title: this.$route.meta.title,
		code: 'H',
		open: true,
		value: true,
		width: 500,
	};
	this.helps = this.actions;
}

async function loadGroups() {
	const params = { typeEntityId: typeEntityId.Sellers };
	({ data: this.groups } = await this.$httpSalesRead.get('group', { params }));
}

function openDialogDeleteVendors({ id, name }) {
	this.dialogMessageDelete = `¿Desea eliminar el vendedor ${name}?`;
	this.dialogDelete = true;
	this.idVendors = id;
}

async function getListVendors(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	try {
		const { data: vendors, headers } = await this.$httpSales.get('sellers', {
			params: this.params,
		});
		this.vendors = vendors.map((v) => {
			const newVendor = { ...v };
			newVendor.employeeCode = v.employee ? v.employee.code : null;
			newVendor.employeeName = v.employee ? v.employee.fullname : null;
			newVendor.employeeEmail = v.employee ? v.employee.email : null;
			newVendor.employeeDocNumber = v.employee
				? v.employee.documentNumber
				: null;
			newVendor.groupName = v.group ? v.group.name : null;
			newVendor.warehousesText =
				newVendor.warehousesText || v.warehouses.map((w) => w.name).join(', ');
			newVendor.rowDisabled = this.isSupervisor(v);
			return newVendor;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.captionNavigation = `${headers['x-quantity']} vendedores creados`;
		this.itemsTotalQuantity = Number(headers['x-quantity']);
	} catch (err) {
		if (err.statu === 500) {
			this.showGenericError();
		}
	} finally {
		this.cleanFilter = false;
		this.isClean = false;
	}
}

function assignSupervisor() {
	this.showNotification('Supervisor asignado correctamente.');
	this.dataSelected = [];
	this.closeDialog();
}

function closeDialog() {
	this.dialog = false;
	this.dialogMessage = '';
	this.vendorSelectedId = null;
}

function closeModal() {
	this.action.value = false;
	this.action.code = null;
	this.action.title = '';
	this.group = {
		description: '',
		name: '',
		code: null,
	};
}

function isActionCode(code) {
	return this.action.code === code;
}

function onClean() {
	this.cleanFilter = true;
	this.params.supervisorId = null;
	this.params.warehouseIds = null;
	this.params.groupId = null;
	this.params.search = null;
	this.isClean = true;
	this.getListVendors();
}

function onDetail(row) {
	const { id, fullname } = row;
	this.vendorId = id;
	this.vendor = { ...row };
	this.action.code = 'detail';
	this.action.title = fullname;
	this.action.value = true;
}

function onFilterList({ model, value }) {
	const prop = model === 'warehouse' ? `${model}Ids` : `${model}Id`;
	this.params[prop] = value.id;
	this.getListVendors();
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.vendors = this.vendors.map((vendor) => {
		const newVendor = { ...vendor };
		newVendor.isSelected = this.isSupervisor(vendor) ? false : checked;
		return newVendor;
	});
	this.dataSelected = this.vendors.filter((v) => v.isSelected);
}

function rowIsSelected() {
	this.vendors = this.vendors.map((v) => {
		const newV = { ...v };
		if (v.rowDisabled) {
			newV.isSelected = false;
		}
		return newV;
	});
	this.dataSelected = this.vendors.filter((v) => v.isSelected);
	this.checkAll = this.vendors.every((v) => v.isSelected);
}

function runAction({ code, name }) {
	this.action.code = code;
	if (this.action.code === 'new-vendor') {
		this.goTo('new-vendor');
	} else {
		this.action.title = name;
		this.action.value = true;
	}
}

async function saveModal(vendorSelected) {
	const body = {
		employeesId: this.dataSelected.map((p) => p.id),
		supervisoresId: vendorSelected.map((l) => l.id),
	};
	try {
		await this.$httpSales.post('sellers/supervisor', body);
		this.showNotification('Los vendedores fueron asignados correctamente.');
		this.closeModal();
		this.getListVendors();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SUPERVISOR_NOT_EXISTS') {
				this.showGenericError('Supervisor no existe.');
			} else {
				this.showGenericError();
			}
		}
	}
}

function valueDisabled() {
	const disabledActions = [
		{ code: 'assign-supervisor', disabled: this.dataSelected.length === 0 },
		{ code: 'AG', disabled: !this.dataSelected.length > 0 },
	];
	return disabledActions;
}

async function deleteVendors() {
	try {
		await this.$httpSales.delete(`sellers/${this.idVendors}`);
		this.dialogDelete = false;
		this.showNotification('El vendedor ha sido eliminado correctamente');
		this.getListVendors();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialogVendors() {
	this.dialogDelete = false;
}

function changePage(page) {
	this.getListVendors(page);
}

function editDetailVendor({ id }) {
	this.goTo('new-vendor', {
		params: { id },
		query: { vendorId: id, isVendor: true },
	});
}

function isSupervisor({ typeSeller }) {
	return typeSeller === TypeSeller.Supervisor;
}

async function createGroupSellers() {
	const body = {
		name: this.group.name,
		code: this.group.code,
		description: this.group.description,
		typeEntityId: typeEntityId.Sellers,
	};
	try {
		await this.$httpSales.post('group', body);
		this.showNotification('El grupo fue creado correctamente.');
		this.closeModal();
		this.loadGroups();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'GROUP_EXISTS') {
				this.showGenericError('Código ya existe.');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function assignGroupSellers(id) {
	const body = {
		sellersId: this.dataSelected.map((row) => row.id),
	};
	try {
		await this.$httpSalesRead.patch(`sellers/${id}/group`, body);
		this.showNotification('Los vendedores fueron asignados correctamente.');
		this.dataSelected = [];
		this.closeModal();
		this.getListVendors();
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		action: {
			code: null,
			title: '',
			value: false,
			width: 500,
		},
		captionNavigation: '',
		checkAll: false,
		cleanFilter: false,
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Correo',
				value: 'email',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Documento',
				value: 'documentNumber',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Tiendas',
				value: 'warehousesInline',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Supervisor',
				value: 'typeSeller',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'C. Perimét',
				tooltip: 'Cerco Perimétrico',
				value: 'perimeter',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Grupo',
				value: 'group',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currency: 'USD',
		currentPage: 1,
		dialogDelete: false,
		dataSelected: [],
		detailVendor: [],
		dialog: false,
		dialogMessage: '',
		dialogMessageDelete: '',
		idVendors: 0,
		group: {
			description: '',
			name: '',
			code: null,
		},
		groups: [],
		helps: [],
		lastPage: 0,
		listsupervisor: [],
		params: {
			page: 1,
			limit: 20,
			supervisorId: null,
			warehouseIds: null,
		},
		searchValue: '',
		vendor: {},
		vendorId: null,
		vendors: [],
		isClean: false,
		itemsTotalQuantity: 0,
	};
}

export default {
	name: 'page-vendors',
	components: {
		assignGroup,
		appActions,
		actionSidebar,
		createGroup,
		headerPage,
		vendorsDetail,
		vendorsFilter,
		vendorsSupervisorAssign,
		vendorsTable,
	},
	computed: {
		valueDisabled,
	},
	created,
	data,
	methods: {
		assignSupervisor,
		assignGroupSellers,
		changePage,
		closeDialog,
		closeDialogVendors,
		closeModal,
		createGroupSellers,
		deleteVendors,
		editDetailVendor,
		getListVendors,
		isActionCode,
		isSupervisor,
		loadGroups,
		onClean,
		onDetail,
		onFilterList,
		openHelp,
		onSelectedAll,
		openDialogDeleteVendors,
		rowIsSelected,
		runAction,
		saveModal,
		callServiceAndSearch(search) {
			this.params.search = search;
			this.params.page = 1;
			this.getListVendors();
		},
	},
};
</script>
<style lang="scss" scoped>
.icon-align {
	vertical-align: sub;
}

.ft-16 {
	font-size: 16px !important;
}
</style>
