<template>
	<div>
		<v-flex ml-4 mt-3>
			<v-switch
				v-model="leapInTable"
				label="Saltar de Serie a Comentario"
				color="primary"
				inset
				hide-details
			/>
		</v-flex>
        <v-flex xs15 mt-3 mb-3 class="form-input--height">
            <v-layout row wrap pr-4>
				<span class="ml-4 mb-1 quantity-title body-1 pt-2">Cant. filas (series) a agregar:</span>
				<v-text-field
					class="filter-select shadow-inset ml-3"
					single-line
					type="number" 
					v-model="numFilas">
				</v-text-field>
				<button
					class="pl-add-container button-size ml-2 mr-4 mt-2"
					@click="addSerieRow"
				>
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>

				<div class="rectangle">
					<div class="first-container" >
						{{ this.product.unitName }} TOTAL:
					</div>
					<div class="second-container">
						<span>{{ sumValidate ? calculateSum().toFixed(2) : calculateSum() }}</span>
					</div>
				</div>
            </v-layout>
        </v-flex>
		<span class="ml-4 red--text body-1" v-if="validatedAlphanumeric">
			<b>Ingresa solo caracteres alfanuméricos en el campo de serie</b>
		</span>
		<app-table
			class="is-not-selectable mt-3"
			name="control-series"
			:columns="columns"
			:main-list="false"
			:input-search="false"
			:filter-columns="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="pa-2 is-not-selectable">{{ props.row.number }}</td>
				<td v-show="showRow(columns, 2)" class="pa-2 is-not-selectable">
					<v-text-field
						hide-details
						single-line
						label="Series"
						v-model="props.row.serie"
						class="filter-select shadow-inset"
						@input="edit('serie', props.row.number, $event)"
						:ref="`serieInput_${props.row.number}`"
						@keyup.enter="moveToNext(props.row.number, 2)"
					></v-text-field>
					<!-- <span>{{props.row.serie}}</span> -->
				</td>
				<td v-show="showRow(columns, 3)" class="pa-2">
					<v-text-field
						hide-details
						single-line
						label="Comentario"
						v-model="props.row.comments"
						class="filter-select shadow-inset"
						@input="edit('comments', props.row.number, $event)"
						:ref="`colInput_${props.row.number}`"
						@keyup.enter="moveToNextSeries(props.row.number)"
					></v-text-field>
					<!-- <span>{{props.row.observation}}</span> -->
				</td>
				<td v-show="showRow(columns, 4)" class="pa-2">
					<v-text-field
						hide-details
						single-line
						label="Comentario"
						v-model="props.row.observation"
						class="filter-select shadow-inset"
						@input="edit('observation', props.row.number, $event)"
						:ref="`colInput_${props.row.number}`"
					></v-text-field>
					<!-- <span>{{props.row.observation}}</span> -->
				</td>
				<td v-show="showRow(columns, 5)" class="pa-2 w-20">
					<v-text-field
						v-if="!validateUnit"
						type="number"
						hide-details
						single-line
						v-model="props.row.quantity"
						class="filter-select shadow-inset"
						@input="edit('quantity', props.row.number, $event)"
					></v-text-field>
					<span v-else>1</span>
				</td>
				<td v-show="showRow(columns, 6)" class="pa-2">
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							@click="deleteRow(props.row)"
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
				success-color="primary"
				:is-loading="!rows.length || flagDisabled || validatedRows || validatedAlphanumeric"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendData">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

// function columnInput(colValue) {
// 	const columnValue = colValue.column.value;
// 	const value = colValue.event.target.value;
// 	this.editColumn('localData', value, columnValue);
// 	this.editColumn('rows', value, columnValue);
// }

function created() {
	if (this.product.series ? this.product.series.length : false) {
		this.rows = this.product.series.map((p, index) => {
			const newP = { ...p };
			newP.number = index + 1;
			return newP;
		});
	} else {
		this.numFilas = this.product.quantity;
		for (let i = 0; i < this.product.quantity; i += 1) {
			this.addSerie();
		}
	}
}

function addSerie() {
	const numRowsToAdd = this.numFilas - this.rows.length;
	const startIndex = this.rows.length + 1;
	if (numRowsToAdd > 0) {
		const newRows = Array.from({ length: numRowsToAdd }, (_, index) => {
			const number = startIndex + index;
			return {
				number,
				serie: null,
				observation: null,
				comments: null,
				quantity: null,
			};
		});
		this.rows.push(...newRows);
	} else if (numRowsToAdd < 0) {
		this.rows.splice(this.numFilas);
	}
	this.numFilas = this.rows.length;
}

function addSerieRow() {
	const numRowsToAdd = this.numFilas - this.rows.length;
	const startIndex = this.rows.length + 1;
	if (numRowsToAdd > 0) {
		const newRows = Array.from({ length: numRowsToAdd }, (_, index) => {
			const number = startIndex + index;
			return {
				number,
				serie: null,
				observation: null,
				comments: null,
				quantity: null,
			};
		});
		this.rows.push(...newRows);
	} else if (numRowsToAdd < 0) {
		this.rows.splice(this.numFilas);
	}
	this.numFilas = this.rows.length;
}

// function deleteSerie(model, index) {
//  this[model].splice(index - 1, 1);
//  this[model] = this[model].map((r, indexR) => {
//      const newRow = { ...r };
//      newRow.number = indexR + 1;
//      return newRow;
//  });
// }

function deleteRow(rowSerie) {
	const id = rowSerie.number;
	const index = this.rows.map(row => row.number).indexOf(id);
	this.rows.splice(index, 1);
}

async function sendData() {
	const sendSeries = this.rows.map((row) => {
		const newRow = {};
		newRow.serie = row.serie;
		newRow.observation = row.observation;
		newRow.comments = row.comments;
		newRow.quantity = row.quantity || 1;
		return newRow;
	});
	const detailSeries = {
		productId: this.product.productId,
		warehouseProductId: this.flag === 'purchases' ? this.product.warehouseProductId || this.product.warehouseSelectId
			: this.product.warProductId,
		totalW: this.suma,
		series: sendSeries,
	};
	this.$emit('send-series', detailSeries);
}

function edit(model, index, text) {
	this.rows[index - 1][model] = text;
	if (model === 'serie') {
		const indexFlag = this.rows.map(r => r.serie).indexOf(text);
		if (indexFlag !== index - 1) {
			this.showNotification('No se puede repetir la serie', 'info');
			this.flagDisabled = true;
		} else {
			this.flagDisabled = false;
		}
	} else if (model === 'quantity') {
		const fourDecimals = parseFloat(text) === parseFloat(parseFloat(text).toFixed(4));
		this.flagDisabled = !fourDecimals;
		if (!fourDecimals) {
			this.showNotification('Se han encontrado que las cantidades exceden el límite de 4 decimales.', 'error');
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

// function changePage(page) {
//  this.currentPage = page;
//  this.loadSerie();
// }

function validatedAlphanumeric() {
	const alphanumeric = this.rows.every(ob => (ob.serie === null || ob.serie === '')
		|| /^[a-zA-Z0-9]+$/.test(ob.serie));
	return !alphanumeric;
}

function validatedRows() {
	const exiQuantity = !this.rows.every(r => r.quantity !== null);
	const validate = !this.validateUnit ? exiQuantity : null;
	const validateSerie = !this.rows.every(p => p.serie !== null);
	return validateSerie || validate;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nº', value: 'number', visible: true, checked: true },
			{ id: 2, name: 'Serie', value: 'series', visible: true, checked: true },
			{ id: 3, name: 'Comentario', value: 'comments', visible: true, checked: true },
			{ id: 4, name: 'Comentario 2', value: 'observation', visible: true, checked: true },
			{ id: 5, name: `Und. medida ${this.product.unitName}`, value: 'quantity', visible: true, checked: true },
			{ id: 6, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
		rows: [],
		// currentPage: 1,
		// lastPage: 0,
		codeReader: '',
		leapInTable: false,
		localData: [],
		flagDisabled: false,
		params: {
			page: null,
			search: null,
		},
		numFilas: null,
		suma: null,
		validateUnit: false,
		sumValidate: false,
	};
}

export default {
	name: 'control-series',
	components: {
		appTable,
		modalSidebarButton,
	},
	data,
	created,
	mounted() {
		this.calculateSum();
	},
	methods: {
		// columnInput,
		addSerie,
		addSerieRow,
		sendData,
		edit,
		editColumn,
		// loadSerie,
		// changePage,
		deleteRow,
		moveToNext(nextIndex) {
			if (this.leapInTable) {
				const nextInputRef = `colInput_${nextIndex}`;
				const nextInput = this.$refs[nextInputRef];
				if (nextInput) {
					nextInput.focus();
				}
			} else {
				const currentRowIndex = this.rows.findIndex(row => row.number === nextIndex);
				if (currentRowIndex !== -1 && currentRowIndex < this.rows.length - 1) {
					this.$refs[`serieInput_${nextIndex + 1}`].focus();
				}
			}
		},
		moveToNextSeries(rowNumber) {
			if (this.leapInTable) {
				const currentRowIndex = this.rows.findIndex(row => row.number === rowNumber);
				if (currentRowIndex !== -1 && currentRowIndex < this.rows.length - 1) {
					this.$refs[`serieInput_${rowNumber + 1}`].focus();
				}
			}
		},
		calculateSum() {
			this.validateUnit = this.product.unitName === 'UNIDAD';
			if (this.validateUnit) {
				this.suma = this.rows.length;
			} else {
				this.suma = this.rows.reduce((addition, row) => {
					const quantity = parseFloat(row.quantity);
					if (!isNaN(quantity)) {
						return addition + quantity;
					}
					return addition;
				}, 0);
			}
			this.sumValidate = this.suma.toString().includes('.');
			this.$emit('sumCalculated', this.product.nuevoCampo);
			return this.suma;
		},
	},
	computed: {
		validatedRows,
		validatedAlphanumeric,
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
		idPurchases: {
			type: Number,
		},
	},
};
</script>
<style lang="scss" scoped>
.w-20 {
	width: 20%;
}
.w-40 {
	width: 40%;
}

.w-60 {
	width: 60%;
}
.rectangle {
	padding: 5px;
	display: flex;
	border-radius: 10px;
}
.first-container {
	padding: 5px 12px;
	background-color: color(primary);
	color: white;
	font-weight: bold;
	font-size: 13px;
}
.second-container {
	border: 2px solid color(primary);;
	background-color: white;
	text-align: end;
	width: 180px;
	font-size: 13px;
	padding: 5px 5px 5px 10px;
}

.button-size {
	cursor: pointer;
	height: 30px;
	width: 40px;
	color: white;
	font-size: 10px;
}

</style>

