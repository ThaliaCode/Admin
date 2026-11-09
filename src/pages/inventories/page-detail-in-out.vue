<template>
	<div>
		<header-page
			caption-navigation="Productos"
			:title="title"
		></header-page>
		<v-layout row wrap pt-3 px-4>
			<filters-in-ex
				:clean-data="cleanData"
				:end-date="params.endDate"
				:start-date="params.startDate"
				:supplier-id="params.supplierId"
				:suppliers="suppliers"
				:warehouse-id="params.warehouseId"
				:warehouses="warehouses"
				@clean-filters="cleanFilters"
				@new-register="openForm"
				@on-focus="loadResources('warehouses')"
				@set-data="setData"
			></filters-in-ex>
			<v-flex xs12>
				<list-in-ex
					:check-all="checkAll"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					:main-list="mainList"
					:registers="registers"
					:selectable="selectable"
					@go-to-detail="goToDetail"
					@on-page="loadData"
					@on-search="onSearch"
					@on-selected-all="onSelectedAll"
					@row-is-selected="rowIsSelected"
				></list-in-ex>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="close"
		>
			<suppliers-form-short
				v-if="action.code === 'supplierId'"
				:readonly="false"
				@save="saveSupplier"
				@close="close"
			></suppliers-form-short>
		</action-sidebar>
	</div>
</template>

<script>
	import { differenceInDays } from 'date-fns';
	import actionSidebar from '@/components/shared/action-sidebar';
	import filtersInEx from '@/components/inventories/income-expenses/filters-in-ex';
	import listInEx from '@/components/inventories/income-expenses/list-in-ex';
	import suppliersFormShort from '@/components/sri/suppliers-form-short';

	function created() {
		this.loadResources();
		this.loadData();
	}

	function cleanFilters() {
		this.params = {
			endDate: null,
			limit: 15,
			page: 1,
			search: null,
			startDate: null,
			supplierId: null,
			warehouseId: null,
		};
		this.cleanData = true;
		this.loadResources();
		this.loadData();
	}

	function close() {
		this.action.value = false;
		this.action.code = null;
		this.action.title = '';
	}

	function goToDetail({ documentId, moduleName }) {
		let name = '';
		if (moduleName === 'VENTAS') {
			name = 'convert';
		} else if (moduleName === 'COMPRAS') {
			name = 'purchases-edit';
		} else if (moduleName === 'TRANSFERENCIA') {
			name = 'pages-transfers-detail';
		} else if (moduleName === 'INVENTARIO') {
			name = 'detail-master-inventory';
		}
		if (moduleName !== 'INGRESO' && moduleName !== 'EGRESO') {
			const routeData = this.$router.resolve({ name, params: { id: documentId } });
			window.open(routeData.href, '_blank');
		}
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = this.currentPage;
		const operation = this.$route.name === 'detail-income' ? 1 : 0;
		const params = {
			endDate: this.params.endDate,
			limit: this.params.limit,
			page: this.params.page,
			search: this.params.search,
			sortDirection: 'desc',
			sortField: this.$route.name === 'detail-income' ? 'created_at' : 'updated_at',
			startDate: this.params.startDate,
			supplierId: this.params.supplierId,
		};
		const body = { operation, warehouseIds: [] };
		if (this.params.supplierId) {
			body.supplierId = this.params.supplierId;
		}
		if (this.params.warehouseId) {
			body.warehouseId = this.params.warehouseId;
		}
		const { data: registers, headers } = await this.$httpProducts.post('kardex/list', body,
			{ params });
		const newRegistersRows = registers.map((r) => {
			const newRegister = { ...r };
			newRegister.isSelected = false;
			newRegister.movementCode = r.documentTypeData ? r.documentTypeData.code : '--';
			newRegister.movementName = r.documentTypeData ? r.documentTypeData.name : '--';
			newRegister.productCode = r.product ? r.product.code : '--';
			newRegister.productName = r.product ? r.product.name : '--';
			newRegister.quantity = this.$route.name === 'detail-expenses' ? r.quantityOut || 0 :
				r.quantityIn || 0;
			newRegister.warehouseName = r.warehouse ? r.warehouse.name : '--';
			return newRegister;
		});
		const dateProp = this.$route.name === 'detail-income' ? 'createdAt' : 'updatedAt';
		this.registers = newRegistersRows.sort((a, b) => {
			if (a[dateProp] < b[dateProp]) {
				return 1;
			}
			if (a[dateProp] > b[dateProp]) {
				return -1;
			}
			return 0;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.cleanData = false;
	}

	async function loadResources(code) {
		if (code) {
			const uri = code === 'suppliers' ? '$httpSales' : '$httpProducts';
			const prop = code === 'suppliers' ? 'autocomplete' : 'name';
			let autocompleteItems = '';
			[{ data: this[code] }] = await this[uri].get(code);
			this[code].forEach((s) => {
				autocompleteItems = autocompleteItems.concat(s[prop]);
			});
			const newRow = { id: 0, [prop]: autocompleteItems, btn: true };
			this[code].push(newRow);
		} else {
			let suppliersAutocomplete = '';
			let warehousesAutocomplete = '';
			const requests = [
				this.$httpSales.get('suppliers'),
				this.$httpProducts.get('warehouses'),
			];
			[{ data: this.suppliers }, { data: this.warehouses }] = await Promise.all(requests);
			this.suppliers.forEach((s) => {
				suppliersAutocomplete = suppliersAutocomplete.concat(s.autocomplete);
			});
			this.warehouses.forEach((w) => {
				warehousesAutocomplete = warehousesAutocomplete.concat(w.name);
			});
			const newSupplier = { id: 0, autocomplete: suppliersAutocomplete, btn: true };
			const newWarehouse = { id: 0, name: warehousesAutocomplete, btn: true };
			this.suppliers.push(newSupplier);
			this.warehouses.push(newWarehouse);
		}
	}

	function onSearch(search) {
		const searchTrim = search ? search.trim() : null;
		this.params.search = searchTrim;
		this.loadData();
	}

	function onSelectedAll(checked) {
		this.checkAll = checked;
		this.registers = this.registers.map((r) => {
			const newRegister = { ...r };
			newRegister.isSelected = checked;
			return newRegister;
		});
		this.dataSelected = this.registers.filter(r => r.isSelected);
	}

	function openForm(model) {
		if (model === 'supplierId') {
			this.action.code = model;
			this.action.title = 'NUEVO PROVEEDOR';
			this.action.value = true;
		} else {
			const newRouter = this.$router.resolve({ name: 'page-warehouses-new' });
			window.open(newRouter.href, '_blank');
		}
	}

	function rowIsSelected() {
		this.dataSelected = this.registers.filter(r => r.isSelected);
		this.checkAll = this.registers.every(r => r.isSelected);
	}

	async function saveSupplier(supplierModel) {
		try {
			await this.$httpSales.post('suppliers', supplierModel);
			this.showNotification('El proveedor ha sido creado correctamente.');
			this.loadResources('suppliers');
			this.close();
		} catch (err) {
			if (err.status === 400) {
				if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
					this.showNotification('El número de documento ingresado ya existe. Es probable que el proveedor que intenta registrar ya exista.',
						'error');
				} else if (err.data.message === 'PAYMENT_METHOD_NOT_EXIST') {
					this.showNotification('La forma de pago seleccionada no se encuentra registrada.',
						'error');
				} else if (err.data.message === 'SUPPLIER_TYPE_NOT_EXIST') {
					this.showNotification('El tipo de proveedor seleccionado no se encuentra registrado.',
						'error');
				} else if (err.data.message === 'TYPE_EXPENSE_NOT_EXIST') {
					this.showNotification('El origen seleccionado no se encuentra registrado.',
						'error');
				} else if (err.data.message === 'AUTO_CODE_SUPPLIER_NOT_EXIST') {
					this.showNotification('El código autogenerado de proveedor no ha sido configurado.',
						'error');
				}
			} else if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function setData(autocompleteData) {
		if (autocompleteData) {
			const { model, value } = autocompleteData;
			if (value) {
				if (!value.btn) {
					this.params[model] = model === 'supplierId' || model === 'warehouseId' ? value.id : value;
					if (this.params.startDate && !this.params.endDate) {
						this.showNotification(
							'Es necesario elegir la fecha final para realizar el filtro por fechas.',
							'warning',
						);
					} else if (this.params.startDate && this.params.endDate) {
						const validDate = differenceInDays(this.params.endDate, this.params.startDate) < 0;
						if (validDate) {
							this.showNotification('La fecha final no puede ser menor a la inicial.', 'warning');
						} else {
							this.loadData();
						}
					} else {
						this.loadData();
					}
				} else {
					this.openForm(model);
				}
			}
		}
	}

	function title() {
		return this.$route.name === 'detail-income' ? 'DETALLE DE INGRESOS' : 'DETALLE DE EGRESOS';
	}

	function watchRoute(value) {
		if (value) {
			this.loadResources();
			this.loadData();
		}
	}

	function data() {
		return {
			action: {
				code: null,
				title: '',
				value: false,
				width: 552,
			},
			checkAll: false,
			cleanData: false,
			columns: [
				{
					id: 1,
					name: 'Mov.',
					tooltip: 'Movimiento',
					value: 'documentTypeDataCode',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Cód. Prod.',
					tooltip: 'Código de Producto',
					value: 'productCode',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Nombre de Producto',
					value: 'productName',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Tienda',
					value: 'warehouseName',
					checked: true,
					visible: true,
				},
				{
					id: 5,
					name: 'Cantidad',
					value: 'quantity',
					checked: true,
					visible: true,
				},
				{
					id: 6,
					name: 'No. Doc.',
					tooltip: 'Número de Documento',
					value: 'documentNumber',
					checked: true,
					visible: true,
				},
				{
					id: 7,
					name: 'Fecha',
					value: 'createdAt',
					checked: true,
					visible: true,
				},
			],
			currentPage: 1,
			dataSelected: [],
			dialog: {
				supplier: {
					open: false,
				},
				warehouse: {
					open: false,
				},
			},
			lastPage: 0,
			mainList: true,
			params: {
				endDate: null,
				limit: 15,
				page: 1,
				search: null,
				startDate: null,
				supplierId: null,
				warehouseId: null,
			},
			selectable: false,
			suppliers: [],
			registers: [],
			warehouses: [],
		};
	}

	export default {
		name: 'page-detail-in-out',
		components: {
			actionSidebar,
			filtersInEx,
			listInEx,
			suppliersFormShort,
		},
		computed: {
			title,
		},
		created,
		data,
		methods: {
			cleanFilters,
			close,
			goToDetail,
			loadData,
			loadResources,
			onSearch,
			onSelectedAll,
			openForm,
			rowIsSelected,
			saveSupplier,
			setData,
		},
		watch: {
			$route: {
				deep: true,
				handler: watchRoute,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>