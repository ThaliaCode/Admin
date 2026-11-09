<template>
	<div>
		<header-page :work="true" :title="$route.meta.title"/>
		<general-filter>
			<v-layout row wrap >
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					
					<v-text-field
						bottom
						single-line
						hide-details
						label="cliente"
						class="filter-select"
						content-class="filter-select-content"
					></v-text-field>
					<v-icon color="primary"></v-icon>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
				
					<v-text-field
						bottom
						single-line
						hide-details
						label="Proyecto"
						class="filter-select"
						content-class="filter-select-content"
					></v-text-field>
					<v-icon color="primary"></v-icon>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="help-box">
					<v-select
						autocomplete
						bottom
						single-line
						hide-details
						v-bind:items="leaderWork"
						v-model="newProduct.leaderWork"
						label="Responsable de obra"
						item-text="name"
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			name="work"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			local-storage
			include-filter
			selectable
			:check-all="checkAll"
			:last-page="lastPage"
			@on-toggle-columns="toggleColumns"
			v-on:on-search-event="callServiceAndSearch"
			v-on:on-page="changePage"
			v-on:row-is-selected="rowIsSelected"
			v-on:on-selected-all="selectedAll">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.date }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.descriptions }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.price }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 8)"></td>
				<td v-show="showRow(columns, 8)">
					<router-link
					:to="{ name: 'download', params: { id: props.row.id } }"
							class="table-icon">
						<img :src="`${$imageUrl}/download.svg`" alt="Download">
					</router-link>
					<router-link
					:to="{ name: 'calendar', params: { id: props.row.id } }"
							class="table-icon">
						<img :src="`${$imageUrl}/calendar-line.svg`" alt="Calendar">
					</router-link>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>

import headerPage from './../shared/header-page';
import generalFilter from './../shared/general-filter';
import appTable from './../shared/table/app-table';

function toggleColumns() {
	return true;
}

function changePage(page) {
	this.currentPage = page;
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(rowSelected =>
				rowSelected.id === row.id);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(rowData => rowData.id
			=== row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every(check => check.isSelected);
}

function selectedAll(value) {
	this.checkAll = value;
	if (this.data.length > 0) {
		this.data = this.data.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(rowSelected =>
						rowSelected.id === newData.id);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(rowData => rowData.id
					=== newData.id);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

function data() {
	return {
		checkAll: false,
		clients: [],
		clientSelected: '',
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Fecha de ingreso', value: 'date', visible: true, checked: true },
			{ id: 3, name: 'Cliente', value: 'name', visible: true, checked: true },
			{ id: 4, name: '#DOC', value: 'description', visible: true, checked: true },
			{ id: 5, name: 'Tipo de proyecto', value: 'type', visible: true, checked: true },
			{ id: 6, name: 'Hrs est.', value: 'quantity', visible: true, checked: true },
			{ id: 7, name: 'Estado', value: 'stock', visible: true, checked: true },
			{ id: 8, name: 'Acción', visible: true, checked: true, flagVisible: true },
		],
		currentPage: 1,
		data: [
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
			{
				number: '',
				date: '',
				code: 'Lorem ipsun dolor',
				name: '',
				description: '',
			},
		],
		dataSelected: [],
		documentClient: '',
		entryDate: '',
		exchangeRate: 0,
		lastPage: 1,
		menu: false,
		newProduct: {},
		params: {},
		priceAmounts: {},
		leaderWork: [],
		leaderWorkSelected: '',
		searchData: '',
	};
}

export default {
	name: 'work',
	components: {
		appTable,
		generalFilter,
		headerPage,
	},
	data,
	methods: {
		callServiceAndSearch,
		changePage,
		rowIsSelected,
		selectedAll,
		toggleColumns,
	},
};
</script>

<style lang="scss" scoped>
.chip-exchange {
	border-radius: 5px;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	height: 30px;
	margin: 0px;
	text-align: left;
	width: 84px;
	z-index: 1;

	span:not(.chip__content) {
		align-self: flex-end;
		display: flex;
		font-size: map-get($sizes, medium);
	}
}
.input-group{
	height: 30px;
	margin-right: 30px;
	width: 210px;
}
.help-box{
	margin-top: 10px;
}
.card {
	border-radius: 0px;
	box-shadow: none;

	&-blue {
		background-color: map-get($colors, blue-card);
	}

	&-grey {
		background-color: map-get($colors, background-card);
	}

	&-pink {
		background-color: map-get($colors, orange-btn);
	}

	.row-text {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, medium);

		&-title {
			font-family: map-get($fonts, open-bold);
		}

		&-price {
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, medium16);
		}
	}
}
</style>

