<template>
	<div>
		<v-layout 
			wrap 
			px-4 
			py-3 
			v-if="!detail">
			<v-flex xs10 md10 pr-2 mb-3>
				<v-text-field
					label="Serie del producto"
					class="filter-select shadow-inset mt-3"
					v-model="codeReader"
					@keyup.enter="addCodeReader"
				>
				</v-text-field>
			</v-flex>
			<v-flex xs2 md2 pr-2 mb-3 pt-3>
				<button
					class="pl-add-container size"
					:disabled="!codeReader"
					@click="addCodeReader"
				>
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<app-table
			class="is-not-selectable mt-4"
			name="control-series"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			@column-input="columnInput"
			:rows="localData"
			@on-search-event="searchSeries"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{props.row.number}}
				</td>
				<td v-show="showRow(columns, 2)">
					<v-text-field
						hide-details
						single-line
						label="Series"
						v-model="props.row.serie"
						class="filter-select shadow-inset"
						@input="edit('serie', props.row.number, $event)"
						v-if="!detail"
					></v-text-field>
					<span v-else>{{props.row.serie}}</span>
				</td>
				<td v-show="showRow(columns, 3)">
					<app-date-mask
						id="date"
						v-model="props.row.dateFormat"
						single-line
						@format-date="setData('date', props.row.number, $event)"
						v-if="!detail"
					/>
					<span v-else>{{props.row.dateFormat}}</span>
				</td>
				<td v-show="showRow(columns, 4)">
					<v-text-field
						hide-details
						single-line
						label="Observación"
						v-model="props.row.observation"
						class="filter-select shadow-inset"
						@input="edit('observation', props.row.number, $event)"
						v-if="!detail"
					></v-text-field>
					<span v-else>{{props.row.observation}}</span>
				</td>
				<td v-show="showRow(columns, 5)">
					<v-text-field
						hide-details
						single-line
						label="Peso"
						v-model="props.row.weight"
						class="filter-select shadow-inset"
						@input="edit('weight', props.row.number, $event)"
						v-if="!detail"
					></v-text-field>
					<span v-else>{{props.row.weight}}</span>
				</td>
				<td v-show="showRow(columns, 6)" v-if="detail">
					<document-state
						:color="props.row.statusDispatch.color"
						:tooltip="props.row.statusDispatch.name"
					/>
				</td>
				<td v-show="showRow(columns, 7)" v-if="detail">
					<v-text-field
						hide-details
						single-line
						label="Referencia"
						v-model="props.row.reference"
						class="filter-select shadow-inset"
						v-if="!detail"
					></v-text-field>
					<span v-else>{{props.row.reference}}</span>
				</td>
				<td v-show="showRow(columns, 8)" v-if="!detail">
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							@click="deleteRow(props.row.number)"
						>
							<v-icon color="red">delete</v-icon>
						</v-btn>
						<span>Eliminar</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!localData.length || flagDisabled"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendData">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';
import documentState from '@/components/shared/document-state';

function addCodeReader() {
	if (this.rows.length) {
		const flag = this.rows.filter(row => row.serie === this.codeReader);
		if (flag.length) {
			this.showNotification('No se puede repetir la serie', 'info');
		} else {
			this.addSerie();
		}
	} else {
		this.addSerie();
	}
}

function setData(model, index, value) {
	this.rows[index - 1][model] = value;
	this.localData[index - 1][model] = value;
}

function deleteRow(index) {
	this.deleteSerie('localData', index);
	this.deleteSerie('rows', index);
}

function columnInput(colValue) {
	const columnValue = colValue.column.value;
	const value = colValue.event.target.value;
	this.editColumn('localData', value, columnValue);
	this.editColumn('rows', value, columnValue);
}

function created() {
	if (this.detail) {
		this.columns = this.columns.map((element) => {
			let newRow = { ...element };
			if (element.name === 'Estado' || element.name === 'Referencia') {
				newRow.visible = true;
			}
			if (element.name === 'Peso') {
				newRow = { id: 5, name: 'Peso', value: 'weight', visible: true, checked: true };
			}
			if (element.name === 'Acción') {
				newRow.visible = false;
			}
			return newRow;
		});
		this.loadSerie();
	}
	if (this.product.detailSeries) {
		if (this.product.detailSeries.series) {
			this.setDataCreate('rows');
			this.setDataCreate('localData');
		}
	}
}

function searchSeries(search) {
	let newData = [];
	if (search) {
		newData = this.rows.filter(row => row.serie.toLowerCase().indexOf(search) > -1);
	} else {
		newData = [...this.rows];
	}
	this.localData = [...newData];
}

function addSerie() {
	const number = this.rows.length + 1;
	const newCode = {
		number,
		dateFormat: helper.exactDate(this.$today(), 'DD/MM/YYYY'),
		date: helper.exactDate(this.$today(), 'YYYY-MM-DD'),
		serie: this.codeReader,
		observation: null,
		weight: null,
	};
	this.rows.push(newCode);
	this.localData.push(newCode);
	this.codeReader = '';
}

function deleteSerie(model, index) {
	this[model].splice(index - 1, 1);
	this[model] = this[model].map((r, indexR) => {
		const newRow = { ...r };
		newRow.number = indexR + 1;
		return newRow;
	});
}

async function sendData() {
	if (!this.detail) {
		const arraySeries = this.localData.map(r => r.serie);
		const body = [
			{
				warehouseProductId: this.flag === 'purchases' ? this.product.warehouseProductId : this.product.warProductId,
				series: arraySeries,
			},
		];
		const response = await this.$httpProducts.post('series/valid', body);
		if (response.data.length) {
			const arrayResponse = response.data;
			const seriesRepeat = arrayResponse.map(r => r.serie);
			this.showNotification(`Se repiten las siguientes series: ${seriesRepeat.join()}`, 'info');
		} else {
			const sendSeries = this.rows.map((row) => {
				const newRow = {};
				newRow.serie = row.serie;
				newRow.date = row.date;
				newRow.observation = row.observation;
				newRow.weight = row.weight;
				return newRow;
			});
			const detailSeries = {
				warehouseProductId: this.flag === 'purchases' ? this.product.warehouseProductId : this.product.warProductId,
				series: sendSeries,
				unitId: this.product.unitId,
				categoryId: this.product.categoryId,
			};
			this.$emit('send-series', detailSeries);
		}
	} else {
		this.$emit('close-modal');
	}
}

function setDataCreate(model) {
	this[model] = this.product.detailSeries.series;
	this[model] = this.product.detailSeries.series.map((product, index) => {
		const newRow = { ...product };
		newRow.number = index + 1;
		newRow.dateFormat = helper.exactDate(product.date, 'DD/MM/YYYY');
		newRow.date = helper.exactDate(product.date, 'YYYY-MM-DD');
		return newRow;
	});
}

function edit(model, index, text) {
	this.rows[index - 1][model] = text;
	if (model === 'serie') {
		const indexFlag = this.localData.map(l => l.serie).indexOf(text);
		if (indexFlag !== index - 1) {
			this.showNotification('No se puede repetir la serie', 'info');
			this.flagDisabled = true;
		} else {
			this.flagDisabled = false;
		}
	}
}

function editColumn(model, value, columnValue) {
	this[model] = this[model].map((el) => {
		const newRow = { ...el };
		newRow[columnValue] = value;
		return newRow;
	});
}

async function loadSerie() {
	this.params.page = this.currentPage;
	const response = await this.$httpProducts.get(`products-detail?productId=${this.product.productId}`, { params: this.params });
	this.lastPage = Number(response.headers['x-last-page']);
	if (response.data.length) {
		this.localData = response.data.map((row, index) => {
			const newRow = { ...row };
			newRow.number = index + 1;
			newRow.dateFormat = helper.exactDate(row.createdAt, 'DD/MM/YYYY');
			return newRow;
		});
	} else {
		this.showNotification('El producto no tiene series', 'info');
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadSerie();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nº', value: 'number', visible: true, checked: true },
			{ id: 2, name: 'Serie', value: 'series', visible: true, checked: true },
			{ id: 3, name: 'Fecha', value: 'date', visible: true, checked: true },
			{ id: 4, name: 'Observación', value: 'observation', visible: true, checked: true },
			{ id: 5, name: 'Peso', value: 'weight', visible: true, checked: true, isEditable: true, showInput: false },
			{ id: 6, name: 'Estado', value: 'state', visible: false, checked: true },
			{ id: 7, name: 'Referencia', value: 'reference', visible: false, checked: true },
			{ id: 8, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		rows: [],
		currentPage: 1,
		lastPage: 0,
		codeReader: '',
		localData: [],
		flagDisabled: false,
		params: {
			page: null,
			search: null,
		},
	};
}

export default {
	name: 'control-series',
	components: {
		appTable,
		modalSidebarButton,
		documentState,
	},
	data,
	created,
	methods: {
		addCodeReader,
		setData,
		deleteRow,
		columnInput,
		searchSeries,
		addSerie,
		deleteSerie,
		sendData,
		setDataCreate,
		edit,
		editColumn,
		loadSerie,
		changePage,
	},
	props: {
		detail: {
			type: Boolean,
			default: false,
		},
		product: {
			type: Object,
			default: () => {},
		},
		flag: {
			type: String,
			default: 'purchases',
		},
	},
};
</script>

