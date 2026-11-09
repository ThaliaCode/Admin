<template>
	<div>
		<header-page
			:caption-navigation="captionNavigation"
			:title="$route.meta.title"
		></header-page>
		<app-actions
			:value-disabled="valueDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout pt-2 row align-center pb-2 pl-4>
			<v-flex xs2>
				<app-select
					clearable
					solo
					label="Empresa"
					item-text="sucursalName"
					item-value="id"
					:item="params.subsidiaryId"
					model="subsidiaryId"
					:return-object="false"
					:items="subsidiaries"
					@input="setFilter"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					clearable
					solo
					:items="warehouses"
					item-text="name"
					item-value="id"
					model="warehouseId"
					:label="labelWarehouse(true)"
					:item="params.warehouseId"
					:return-object="false"
					@input="setFilter"
				/>
			</v-flex>
			<v-flex xs2 ml-2 pt-3>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					:disabled="loadingButton"
					@click="getListDistributor">
					Buscar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<distributor-table
			class="mt-5"
			:item-quantity="itemQuantity"
			:check-all="checkAll"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="vendors"
			@on-search="callServiceAndSearch"
			@delete-vendors="openDialogDeleteVendors"
			@edit-distributor="editDetailVendor"
			@on-page="changePage"
			@on-selected-all="onSelectedAll"
			@row-is-selected="rowIsSelected"
			@see-detail="onDetail"
		></distributor-table>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
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
				<distibutor-detail
					:currency="currency"
					:vendor-id="vendorId"
					@close-slide="closeModal"
				></distibutor-detail>
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
				is-delivery
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
			<assign-transportation 
				v-if="isActionCode('assign-transportation')"
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
		<v-dialog
			v-model="dialogDelete"
			persistent
			max-width="450px"
			>
			<v-card>
				<v-card-title class="headline ft-16">{{ dialogMessageDelete }}</v-card-title>
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
	import actionSidebar from '@/components/shared/action-sidebar';
	import assignGroup from '@/components/customers/assign-group';
	import appActions from '@/components/shared/app-actions';
	import headerPage from '@/components/shared/header-page';
	import vendorsSupervisorAssign from '@/components/field-sale/vendors/vendors-supervisor-assign';
	import TypeSeller from '@/shared/type-seller';
	import typeEntityId from '@/shared/type-entity';
	import createGroup from '@/components/customers/create-group';
	import distributorTable from '@/components/delivery/distributor-table';
	import distibutorDetail from '@/components/delivery/distributor-detail';

	function created() {
		this.loadResources();
		this.action.value = false;
		this.action.code = null;
		this.action.title = '';
	}

	async function loadResources() {
		const request = [
			this.subsidiariesList(),
		];
		[
			{ data: this.subsidiaries },
		] = await Promise.all(request);
		this.warehouses = this.globalList();
		if (this.subsidiaries.length === 1) {
			this.params.subsidiaryId = this.subsidiaries[0].id;
		}
		if (this.warehouses.length === 1) {
			this.params.warehouseId = this.warehouses[0].id;
		}
		this.getListDistributor();
	}

	async function loadGroups() {
		const params = { typeEntityId: typeEntityId.Distributor };
		({ data: this.groups } = await this.$httpSalesRead.get('group', { params }));
	}

	function openDialogDeleteVendors({ id, name }) {
		this.dialogMessageDelete = `¿Desea eliminar el repartidor ${name}?`;
		this.dialogDelete = true;
		this.idVendors = id;
	}

	async function getListDistributor() {
		this.params.page = this.currentPage;
		this.loadingButton = true;
		try {
			const { data: vendors, headers } = await this.$httpSales.get('delivery', { params: this.params });
			this.vendors = vendors.map((distributor) => {
				const newRow = { ...distributor };
				newRow.warehousesName = distributor.settings && distributor.settings.warehouses
					? distributor.settings.warehouses.map(p => p.name).join(', ') : null;
				return newRow;
			});
			this.lastPage = Number(headers['x-last-page']);
			this.captionNavigation = `${headers['x-quantity']} repartidores creados`;
			this.itemQuantity = Number(headers['x-quantity']);
		} catch (err) {
			if (err.statu === 500) {
				this.showGenericError();
			}
		} finally {
			this.loadingButton = false;
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

	function onDetail(row) {
		const { id, name } = row;
		this.vendorId = id;
		this.vendor = { ...row };
		this.action.code = 'detail';
		this.action.title = name;
		this.action.value = true;
	}

	function onSelectedAll(checked) {
		this.checkAll = checked;
		this.vendors = this.vendors.map((vendor) => {
			const newVendor = { ...vendor };
			newVendor.isSelected = this.isSupervisor(vendor) ? false : checked;
			return newVendor;
		});
		this.dataSelected = this.vendors.filter(v => v.isSelected);
	}

	function rowIsSelected() {
		this.vendors = this.vendors.map((v) => {
			const newV = { ...v };
			if (v.rowDisabled) {
				newV.isSelected = false;
			}
			return newV;
		});
		this.dataSelected = this.vendors.filter(v => v.isSelected);
		this.checkAll = this.vendors.every(v => v.isSelected);
	}

	function runAction({ code, name }) {
		this.action.code = code;
		if (this.action.code === 'new-distributor') {
			this.goTo('new-distributor');
		} else if (this.action.code === 'assign-transportation') {
			this.action.title = 'Asignar Transporte';
			this.action.value = true;
		} else {
			this.action.title = name;
			this.action.value = true;
		}
	}

	async function saveModal(vendorSelected) {
		const body = {
			employeesId: this.dataSelected.map(p => p.id),
			supervisoresId: vendorSelected.map(l => l.id),
		};
		try {
			await this.$httpSales.post('sellers/supervisor', body);
			this.showNotification('Los vendedores fueron asignados correctamente.');
			this.closeModal();
			this.getListDistributor();
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
			await this.$httpSales.delete(`delivery/${this.idVendors}`);
			this.dialogDelete = false;
			this.showNotification('El repartidor ha sido eliminado correctamente');
			this.getListDistributor();
		} catch (error) {
			this.showGenericError();
		}
	}

	function closeDialogVendors() {
		this.dialogDelete = false;
	}

	function changePage(page) {
		this.currentPage = page;
		this.getListDistributor();
	}

	function editDetailVendor({ id }) {
		this.goTo('new-distributor', { params: { id }, query: { vendorId: id, isVendor: false } });
	}

	function isSupervisor({ typeSeller }) {
		return typeSeller === TypeSeller.Supervisor;
	}

	async function createGroupSellers() {
		const body = {
			name: this.group.name,
			code: this.group.code,
			typeEntityId: typeEntityId.Distributor,
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
			ids: this.dataSelected.map(row => row.id),
		};
		try {
			await this.$httpSalesRead.patch(`delivery/${id}/group`, body);
			this.showNotification('Los repartidores fueron asignados correctamente.');
			this.dataSelected = [];
			this.checkAll = false;
			this.closeModal();
			this.getListDistributor();
		} catch (error) {
			this.showGenericError();
		}
	}

	function setFilter({ model, value }) {
		this.params[model] = value;
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
					name: 'Documento',
					value: 'documentNumber',
					checked: true,
					visible: true,
				},

				{
					id: 4,
					name: 'Usuario',
					checked: true,
					visible: true,
				},
				{
					id: 5,
					name: 'Vehículo',
					value: 'type',
					checked: true,
					visible: true,
				},
				{
					id: 6,
					name: 'Grupos',
					value: 'group',
					checked: true,
					visible: true,
				},
				{
					id: 7,
					name: 'Tienda',
					value: 'warehouses',
					checked: true,
					visible: true,
				},
				{
					id: 8,
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
			itemQuantity: 0,
			lastPage: 0,
			listsupervisor: [],
			loadingButton: false,
			params: {
				page: 1,
				limit: 20,
				sortDirection: 'desc',
				sortField: 'created_at',
				subsidiaryId: null,
				warehouseId: null,
			},
			searchValue: '',
			subsidiaries: [],
			vendor: {},
			vendorId: null,
			vendors: [],
			warehouses: [],
		};
	}

	export default {
		name: 'page-distributor',
		components: {
			assignGroup,
			createGroup,
			appActions,
			actionSidebar,
			headerPage,
			// vendorsDetail,
			vendorsSupervisorAssign,
			distributorTable,
			distibutorDetail,
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
			getListDistributor,
			isActionCode,
			isSupervisor,
			loadGroups,
			loadResources,
			onDetail,
			onSelectedAll,
			openDialogDeleteVendors,
			rowIsSelected,
			runAction,
			saveModal,
			setFilter,
			callServiceAndSearch(search) {
			this.params.search = search;
			this.params.page = 1;
			this.getListDistributor();
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