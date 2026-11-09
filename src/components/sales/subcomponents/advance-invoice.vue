<template>
	<div class="table-component">
		<app-table
			name="advanceInvoice"
			selectable
			:columns="columns"
			:rows="rows"
			:current-page="params.page"
			:check-all="checkAll"
			@on-selected-all="selectedAll"
			:last-page="lastPage"
			:items-quantity="rows.length"
			:items-total-quantity="itemsTotalQuantity"
			@row-is-selected="rowSelected"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="{ row }">
				<td v-show="showRow(columns, 1)">{{ row.number }}</td>
				<td v-show="showRow(columns, 2)">{{ row.quantity }}</td>
				<td v-show="showRow(columns, 3)">{{ row.amount }}</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="compileProducts"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.params.customerId = this.customerId;
	this.loadData();
}

async function loadData() {
	this.checkAll = false;
	const url = 'sale-documents';
	try {
		const { data: rows, headers } = await this.$httpSales.get(url, {
			params: this.params,
		});
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
		if (rows.length) {
			this.dataSelected = helper.getLocalData('advance-invoice-selected') || {};
			this.rows = this.updateRows(rows, this.dataSelected, this.params.page);
			this.updateCheckAll(this.rows);
		}
	} catch (err) {
		this.showGenericError();
	}
}

function updateRows(rows, dataSelected, page) {
	const newRows = lib.map(
		lib.setNewProperty('quantity', ({ details }) => details.length),
		rows
	);
	if (!lib.isEmpty(dataSelected)) {
		const currentBills = dataSelected[page];
		if (currentBills) {
			currentBills.forEach((c) => {
				this.$set(newRows, c.index, c.item);
			});
		}
	}
	return newRows;
}

function rowSelected(selected) {
	const index = this.rows.findIndex((r) => r.id === selected.id);
	this.$set(this.rows, index, selected);
	this.tamperingDataSelected(selected, this.params.page, index, selected.id);
	this.updateCheckAll(this.rows);
}

function tamperingDataSelected(item, page, index, id) {
	if (item.isSelected) {
		const arr = this.dataSelected[page];
		this.dataSelected[page] = lib.isEmpty(arr)
			? [].concat({ index, item, id })
			: this.dataSelected[page].concat({ index, item, id });
	} else {
		const elementIndex = this.dataSelected[page].findIndex((d) => d.index === index);
		if (elementIndex !== -1) {
			this.dataSelected[page].splice(elementIndex, 1);
		}

		if (this.dataSelected[page].length === 0) {
			delete this.dataSelected[page];
		}
	}
}

function selectedAll(val) {
	this.checkAll = val;
	delete this.dataSelected[this.params.page];
	this.rows = this.rows.map((item, index) => {
		const newItem = { ...item };
		newItem.isSelected = val;
		if (val) {
			this.tamperingDataSelected(newItem, this.params.page, index, newItem.id);
		}
		return newItem;
	});
}

function changePage(page) {
	this.params.page = page;
	this.loadData();
}

function updateCheckAll(rows) {
	this.checkAll = rows.every((r) => r.isSelected);
}

function closeModal() {
	this.$emit('close');
}

function compileProducts() {
	let products = this.extractProducts(this.dataSelected);
	products = this.unifyProducts(products);
	this.$emit('save', products);
	helper.setLocalData('advance-invoice-selected', this.dataSelected);
	this.closeModal();
}

function unifyProducts(products) {
	const newProducts = [];
	const self = this;
	products.forEach((p) => {
		const newP = { ...p };
		newP.priceList = p.product.priceList;
		newP.flagAdvanceInvoice = true;
		newP.units = self.unitsByProduct(p);
		const index = newProducts.findIndex((n) => n.warProductsId === newP.warProductsId);
		if (index === -1) {
			newProducts.push(newP);
		} else {
			const currentProducts = newProducts[index];
			if (
				currentProducts.warProductsId === newP.warProductsId &&
				currentProducts.salePrice === newP.salePrice &&
				currentProducts.flagDispatch === newP.flagDispatch
			) {
				newProducts[index].quantity += newP.quantity;
			} else {
				newProducts.push(newP);
			}
		}
	});
	return newProducts;
}

function unitsByProduct(item) {
	const conversions = lib.getDeeper('product', 'conversions')(item);
	if (conversions) {
		const keys = Object.keys(conversions);
		const newUnits = this.units.reduce((acum, unt) => {
			const index = keys.findIndex((k) => Number(k) === unt.id);
			if (index > -1) {
				acum.push(unt);
			}
			return acum;
		}, []);
		if (item.unit) {
			newUnits.push(item.unit);
		} else {
			const unit = {
				id: item.unitId,
				code: item.unitCode,
				name: item.unitName,
			};
			newUnits.push(unit);
		}
		return newUnits;
	}
	return [];
}

function extractProducts(dataSelected) {
	let products = [];
	Object.keys(dataSelected).forEach((k) => {
		const store = dataSelected[k];
		let parcialProducts = [];
		parcialProducts = store.reduce((list, bill) => {
			const { details } = bill.item;
			return list.concat(...details);
		}, []);
		products = products.concat(parcialProducts);
	});
	return products;
}

function data() {
	return {
		checkAll: false,
		columns: [
			{ id: 1, name: 'Número', value: 'number', visible: true, checked: true },
			{ id: 2, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			{ id: 3, name: 'Total', value: 'amount', visible: true, checked: true },
		],
		dataSelected: {},
		lastPage: 0,
		itemsTotalQuantity: 0,
		params: {
			customerId: null,
			flagAdvance: 1,
			limit: 10,
			page: 1,
		},
		rows: [],
	};
}

export default {
	name: 'advance-invoice',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		changePage,
		compileProducts,
		closeModal,
		extractProducts,
		loadData,
		rowSelected,
		selectedAll,
		tamperingDataSelected,
		unifyProducts,
		unitsByProduct,
		updateCheckAll,
		updateRows,
	},
	props: {
		customerId: {
			default: null,
			type: Number,
		},
		units: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped>
.table-component {
	margin-top: 50px;
}
</style>
