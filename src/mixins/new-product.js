function removeAlternateCode(item) {
	this.alternateCode = this.alternateCode.splice(this.alternateCode.indexOf(item), 1);
}

function captureError(value, flag) {
	this.errors[flag] = value;
	const keys = Object.keys(this.errors);
	const el = keys.find(e => this.errors[e]);
	this.disabledByError = !!el;
}

function showAllPriceList() {
	this.moorePriceList = !this.moorePriceList;
}

function addPriceRange(id) {
	this.priceList = this.priceList.map((list) => {
		const newList = Object.assign({}, list);
		if (list.id === id) {
			newList[id].ranges.push({ from: 0, to: 0, price: 0 });
			this.listRanges = (newList[id].ranges.length - 1);
		}
		return newList;
	});
	this.jsonPriceList();
}

function jsonPriceList() {
	const priceList = {};
	this.priceList.forEach((list) => {
		const newList = Object.assign({}, list);
		newList[list.id].price = list[list.id].price || 0;
		newList[list.id].ranges = list[list.id].ranges.map((r) => {
			const newR = Object.assign({}, r);
			newR.to = r.to || 0;
			newR.price = r.price || 0;
			newR.from = r.from || 0;
			return newR;
		});
		priceList[list.id] = newList[list.id];
	});
	return priceList;
}

function removePriceRange(id, index) {
	this.priceList = this.priceList.map((list) => {
		const newList = Object.assign({}, list);
		if (list.id === id) {
			newList[id].ranges.splice(index, 1);
			this.listRanges = (newList[id].ranges.length - 1);
		}
		return newList;
	});
}

function openHelp({ code, actions }) {
	this.helpItems = [...actions];
	this.action = {
		open: true,
		code,
		title: '',
		width: 553,
	};
}

function openSlideModal(code, title, width = 400) {
	this.action = {
		active: true,
		open: true,
		code,
		title,
		width,
	};
	if (code === 'SP') {
		this.selectProducts = true;
	}
}

function cancelModal() {
	if (this.action.code === 'SP') {
		this.selectProducts = false;
	}
	this.action = { ...this.actionDefault };
}

function warehouseSelected(warehouse, key) {
	this[key].warehouseId = warehouse.id;
	this.cancelModal();
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actions: [],
		alternateCode: [],
		brands: [],
		categories: [],
		disabledByError: false,
		errors: {
			price: false,
			rangePrice: false,
			to: false,
			from: false,
		},
		errorMessage: 'máximo 8 dígitos',
		helpItems: [],
		isLoading: false,
		listRanges: 0,
		maxNumber: 99999999,
		moorePriceList: true,
		priceList: [],
		types: [],
		units: [],
		warehouses: [],
	};
}

const mixin = {
	data,
	methods: {
		addPriceRange,
		cancelModal,
		captureError,
		jsonPriceList,
		openHelp,
		openSlideModal,
		removeAlternateCode,
		removePriceRange,
		showAllPriceList,
		warehouseSelected,
	},
};

export default mixin;
