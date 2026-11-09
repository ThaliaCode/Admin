import helper from './../shared/helper';

async function filterData(params) {
	const request = [
		this.$httpProducts.get('categories', { params }),
		this.$httpProducts.get('brands'),
	];
	try {
		const responses = await Promise.all(request);
		const warehousesList = this.globalList();
		this.warehouses = warehousesList.map((warehouse) => {
			const newWarehouse = { ...warehouse };
			newWarehouse.type = 'warehouses';
			return newWarehouse;
		});
		this.categories = responses[0].data.map((category) => {
			const newCategory = { ...category };
			newCategory.type = 'categories';
			return newCategory;
		});
		this.brands = responses[1].data.map((brand) => {
			const newBrand = { ...brand };
			newBrand.type = 'brands';
			return newBrand;
		});
	} catch (err) {
		this.showNotification('Ocurrió un error interno del servidor', 'error');
	}
}

function callServiceAndSearch(search) {
	if (search) this.searchData = search.replace(/\?/g, '_');
	if (search && this.featuresSelected) {
		this.params.featureCode	= this.featuresSelected;
	} else if (this.featuresSelected) {
		this.params.code = this.featuresSelected;
	} else if (search) {
		this.params.code = this.searchData;
	} else {
		this.params.code = null;
		this.searchData = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	helper.setLocalData('current-page', page);
	this.currentPage = page;
	this.loadData();
}

function onCleanData() {
	this.params = {
		page: null,
		brands: null,
		categories: [],
		code: null,
		typeView: null,
		warehouses: null,
		withStock: null,
		withOutStock: null,
	};
	this.featuresSelected = null;
	this.brand = 0;
	this.category = [];
	this.warehouse = 0;
	this.isClean = true;
	helper.removeLocalData('products::search');
	helper.removeLocalData('accounting-products-selected');
	helper.removeLocalData('warehouse-selected');
	this.callServiceAndSearch();
	this.clearSelectedProducts();
}

function filterRows(filter) {
	this.params[filter.type] = filter.id;
	this.currentPage = 1;
	if (filter.type === 'warehouses' && this.dataSelected.length > 0) {
		this.cleanDataByWarehouseChange();
	} else if (filter.type === 'warehouses' && this.inventoryActive) {
		helper.setLocalData('warehouse-selected', filter);
	}
	this.loadData();
}

function cleanDataByWarehouseChange() {
	this.dataSelected = [];
	this.checkAll = false;
}

function data() {
	return {
		brand: 0,
		brands: [],
		category: 0,
		categories: [],
		checkAll: false,
		currentPage: 1,
		data: [],
		dataSelected: [],
		featuresSelected: null,
		isClean: false,
		keyValue: 'warProductId',
		lastPage: 0,
		params: {
			brands: null,
			customSearchField: null,
			customSearchValue: null,
			categories: null,
			code: null,
			page: null,
			typeView: null,
			warehouses: null,
			withOutStock: null,
			withStock: null,
			flagActive: null,
		},
		searchData: '',
		warehouse: 0,
		warehouses: [],
	};
}

const productMixin = {
	data,
	methods: {
		callServiceAndSearch,
		cleanDataByWarehouseChange,
		changePage,
		filterData,
		filterRows,
		onCleanData,
	},
};

export default productMixin;
