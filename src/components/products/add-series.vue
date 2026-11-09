<template>
    <div>
		<v-flex xs15 mt-3 class="form-input--height">
            <v-layout row wrap pr-4>
				<div class="product-name">
					<v-layout>
					<span class="body-1">Producto:</span>
					</v-layout>
					<v-layout mt-1>
						<span class="body-2"><b>{{ this.data.warehouse.name }} - {{ this.data.product.name }}</b></span>
					</v-layout>
				</div>
				<span class="ml-4 mb-1 quantity-title body-1 pt-2">Cant. filas (series) a agregar:</span>
				<v-text-field
					class="filter-select shadow-inset ml-3"
					single-line
					type="number" 
					v-model="numRows">
				</v-text-field>
				<button
					class="pl-add-container button-size ml-2 mr-4 mt-2"
					@click="addSerieRow"
				>
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
            </v-layout>
        </v-flex>
        <app-table
			class="is-not-selectable mt-4"
			name="add-series"
			:columns="columns"
			:main-list="false"
			:input-search="false"
			:filter-columns="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="pa-2 is-not-selectable">
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
				</td>
				<td v-show="showRow(columns, 2)" class="pa-2">
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
				</td>
				<td v-show="showRow(columns, 3)" class="pa-2">
					<v-text-field
						hide-details
						single-line
						label="Comentario"
						v-model="props.row.observation"
						class="filter-select shadow-inset"
						@input="edit('observation', props.row.number, $event)"
						:ref="`colInput_${props.row.number}`"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 4)" class="pa-2 w-20">
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
				<td v-show="showRow(columns, 5)" class="pa-2">
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
				:is-loading="!rows.length || flagDisabled || validatedRows"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendData">
			</modal-sidebar-button>
		</section>
    </div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Serie', value: 'series', visible: true, checked: true },
			{ id: 2, name: 'Comentario', value: 'comments', visible: true, checked: true },
			{ id: 3, name: 'Comentario 2', value: 'observation', visible: true, checked: true },
			{ id: 4, name: `Und. medida ${this.data.unit.name}`, value: 'quantity', visible: true, checked: true },
			{ id: 5, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
		rows: [],
		numRows: 0,
		validateUnit: false,
		flagDisabled: false,
	};
}

function created() {
	this.validateUnit = this.data.unit.name === 'UNIDAD';
}

export default {
	name: 'add-series',
	components: {
		appTable,
		modalSidebarButton,
	},
	data,
	created,
	props: {
		data: {
			type: Object,
			default: () => {},
		},
	},
	methods: {
		addSerieRow() {
			const numRowsToAdd = this.numRows - this.rows.length;
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
				this.rows.splice(this.numRows);
			}
			this.numRows = this.rows.length;
		},
		deleteRow(rowSerie) {
			const id = rowSerie.number;
			const index = this.rows.map(row => row.number).indexOf(id);
			this.rows.splice(index, 1);
		},
		edit(model, index, text) {
			this.rows[index - 1][model] = text;
			if (model === 'serie') {
				const indexFlag = this.rows.map(r => r.serie).indexOf(text);
				if (indexFlag !== index - 1) {
					this.showNotification('No se puede repetir la serie', 'info');
					this.flagDisabled = true;
				} else {
					this.flagDisabled = false;
				}
			}
		},
	},
	computed: {
		validatedRows() {
			const exiQuantity = !this.rows.every(r => r.quantity !== null);
			const validate = !this.validateUnit ? exiQuantity : null;
			const validateSerie = !this.rows.every(p => p.serie !== null);
			return validateSerie || validate;
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

.button-size {
	cursor: pointer;
	height: 30px;
	width: 40px;
	color: white;
	font-size: 10px;
}

.product-name {
	margin-left: 40px;
	width: 250px;
}
</style>