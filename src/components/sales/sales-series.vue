<template>
	<div>
		<app-table
			class="mt-4"
			name="sales-series"
			selectable
			:columns="columns"
			:rows="rows"
			:check-all="checkAll"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			@on-search-event="onSearch"
			dispatch-detail
			disabled-value="disabled"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{props.row.number}}</td>
				<td v-show="showRow(columns, 1)">{{props.row.serie}}</td>
				<td v-show="showRow(columns, 1)">{{props.row.comments}}</td>
				<td v-show="showRow(columns, 1)">{{props.row.observation}}</td>
				<td v-show="showRow(columns, 1)">{{props.row.quantity}}</td>
				<td v-show="showRow(columns, 1)">{{props.row.warehouse.name}}</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="dataSelected.length === 0"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendSeries(dataSelected, sendId)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';
import helper from '@/shared/helper';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nº', value: 'number', visible: true, checked: true },
			{ id: 2, name: 'Serie', value: 'serie', visible: true, checked: true },
			{ id: 3, name: 'Comentario 1', value: 'comments', visible: true, checked: true },
			{ id: 4, name: 'Comentario 2', value: 'observation', visible: true, checked: true },
			{ id: 5, name: 'Peso', value: 'quantity', visible: true, checked: true },
			{ id: 6, name: 'Almacén', value: 'warehouse', visible: true, checked: true },
		],
		rows: [],
		checkAll: false,
		dataSelected: [],
		sendId: null,
		search: null,
		sumSeries: 0,
	};
}

function rowIsSelected({ number, isSelected }) {
	this.checkAll = this.rows.every(row => row.isSelected);
	if (isSelected) {
		this.dataSelected.push(this.rows.find(row => row.number === number));
	} else {
		const index = this.dataSelected.findIndex(row => row.number === number);
		this.dataSelected.splice(index, 1);
		// if (this.dataSelected.length < this.quantity) {
		// 	this.checkAll = false;
		// }
	}
}

function selectedAll(isSelected) {
	this.checkAll = isSelected;
	// if (isSelected) {
	// 	this.selectedAllValid();
	// }else {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = isSelected;
		return newRow;
	});
	this.dataSelected = isSelected ? [...this.rows] : [];
	// }
}

function selectedAllValid() {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = false;
		return newRow;
	});
}

function created() {
	this.loadData();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.search = searchTrim || null;
	this.loadData();
}

async function loadData() {
	this.sendId = this.product.productId || this.product.id;
	const params = {
		productId: this.sendId,
		flagDispatch: false,
		search: this.search || undefined,
		warehousesId: this.product.warehouseId,
	};
	try {
		const response = await this.$httpProducts.get('/products-detail', { params });
		this.rows = response.data.map((row, index) => {
			const newRow = { ...row };
			newRow.number = index + 1;
			newRow.isSelected = false;
			newRow.disabled = 0;
			newRow.dateFormat = helper.exactDate(row.date, 'DD/MM/YYYY');
			return newRow;
		});
		if (this.rows.length) {
			if (this.product.series) {
				this.selectAllExistent();
			} else {
				this.selectedAllValid();
			}
		} else if (!this.rows.length) {
			this.showNotification('El producto no tiene series registradas', 'info');
		}
	} catch (error) {
		this.showGenericError('Error');
	}
}

function selectAllExistent() {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		const flag = this.product.series.filter(r => r === row.id);
		newRow.isSelected = !!flag.length;
		if (flag.length) {
			this.dataSelected.push(row);
		}
		return newRow;
	});
}

export default {
	name: 'sales-series',
	data,
	components: {
		modalSidebarButton,
		appTable,
	},
	created,
	methods: {
		rowIsSelected,
		selectedAll,
		selectedAllValid,
		loadData,
		selectAllExistent,
		onSearch,
		sendSeries(dataSelected, sendId) {
			this.sumSeries = this.dataSelected.reduce((total, obj) => total + obj.quantity, 0);
			this.$emit('send-series', dataSelected, sendId, this.sumSeries);
		},
	},
	props: {
		quantity: {
			type: [String, Number],
		},
		product: {
			type: Object,
		},
	},
};
</script>

