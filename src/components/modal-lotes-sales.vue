<template>
	<v-card class="modal-lotes-sales">
		<v-card-title class="modal-items-title">
			{{ isProduct ? '' : 'Seleccione' }} lote del producto
		</v-card-title>
		<v-divider></v-divider>
		<v-card-text>
			<div
				class="mx-3"
				v-if="!isProduct"
				style="min-height: 1.4rem; display: flex; justify-content: space-between"
			>
				<v-flex xs6 d-flex align-center>
					<span>Cantidad seleccionada: </span>
					<span v-if="!editQuantityLot">{{ quantity }}</span>
					<v-flex xs2 mr-1 v-else>
						<app-input-text min="0" type="number" :text="quantity" @input="setQuantity" />
					</v-flex>
					<app-tooltip-button
						color="primary"
						height="17"
						icon="edit"
						text="Editar cantidad"
						@click-icon="editQuantity"
					/>
				</v-flex>
				<button v-if="isEntry" class="button" @click="$emit('open-modal-new-lot')">
					<v-icon id="add-icon" color="teal">add</v-icon>
					<span>Crear nuevo lote</span>
				</button>
			</div>
			<div class="mx-3" v-if="!isProduct" style="min-height: 1.4rem">
				<span class="text-warning"> {{ textWarning }} </span>
			</div>
			<app-table
				class="my-2"
				name="lots-product"
				:inputSearch="true"
				:filterColumns="true"
				:rows="rows"
				:selectable="selectable"
				:columns="columns"
				:last-page="lastPage"
				@row-is-selected="rowSelected"
				@on-page="changePage"
				@on-selected-all="rowSelectedAll"
				:current-page="currentPage"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.code }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.dateDue }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.location || '-' }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 6)">
						<app-input-text
							min="0"
							:disabled="props.row.quantity <= 0 && !isEntry"
							type="number"
							:text="0"
							@input="(value) => setSelectedQuantity(value, props.index)"
						/>
					</td>
				</template>
			</app-table>
		</v-card-text>
		<v-card-actions class="modal-items-action py-3">
			<v-layout row wrap justify-center>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="primary"
						class="btn-action white--text"
						@click="sendSelectedLots"
						:disabled="disabledConfirm"
					>
						Aceptar
					</v-btn>
				</v-flex>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="error"
						class="btn-action white--text"
						@click="$emit('close-modal-lotes')"
					>
						Cancelar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-card-actions>
	</v-card>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import appTable from '@/components/shared/table/app-table';

function setSelectedQuantity({ value }, index) {
	this.selectedLots[index].selectedQuantity = Number(value);
}

function sendSelectedLots() {
	this.$emit(
		'confirm-modal-lotes',
		this.selectedLots.filter((i) => i.selectedQuantity > 0)
	);
}

export default {
	name: 'modal-lotes-egreso',
	components: {
		appDateSelect,
		appTable,
	},
	props: {
		productData: {
			type: Object,
			default: () => [],
		},
		quantity: {
			type: Number,
			default: 0,
		},
		isEntry: {
			type: Boolean,
			default: false,
		},
		isDischarge: {
			type: Boolean,
			default: false,
		},
		isProduct: {
			type: Boolean,
			default: false,
		},
		newLots: {
			type: Array,
			default: () => [],
		},
		warehouseId: {
			type: Number,
			default: undefined,
		},
		selectable: {
			default: false,
			type: Boolean,
		},
	},
	data() {
		let nameColumn = 'Cantidad a vender';
		if (this.isDischarge) {
			nameColumn = 'Cantidad a egresar';
		} else if (this.isEntry) {
			nameColumn = 'Cantidad a ingresar';
		}
		return {
			productId: this.productData.productId || this.productData.id,
			warehousesId: this.productData.warehouseId || this.warehouseId,
			columns: [
				{
					id: 1,
					name: 'N° Lote',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Fec Vencimiento',
					value: 'dateDue',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Ubicación',
					value: 'location',
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
					name: 'Cantidad disponible',
					value: 'stock',
					checked: true,
					visible: true,
				},
				{
					id: 6,
					name: nameColumn,
					value: '0',
					checked: !this.isProduct,
					visible: !this.isProduct,
					flagVisible: this.isProduct,
				},
			],
			rows: [],
			lotsSelecteds: [],
			selectedLots: [],
			currentPage: 1,
			lastPage: null,
			editQuantityLot: false,
		};
	},
	computed: {
		textWarning() {
			if (this.rows.length === 0) {
				return 'Este producto no contienen lotes disponibles';
			}
			const x = this.selectedLots.filter((l) => l.selectedQuantity > 0).length;
			const sumQuantities = this.selectedLots.reduce(
				(total, item) => total + item.selectedQuantity,
				0
			);
			if (this.selectedLots.some((l) => l.selectedQuantity < 0)) {
				return 'Ingrese solo números positivos';
			}
			if (x > 0) {
				if (
					this.selectedLots.filter(
						(l) => l.selectedQuantity && l.selectedQuantity > l.quantity
					).length > 0
				) {
					if (!this.isEntry) {
						return `La cantidad a ${
							this.isDischarge ? 'egresar' : 'vender'
						} no debe ser mayor a la cantidad disponible`;
					}
				}
				if (sumQuantities !== this.quantity) {
					if (this.isEntry) {
						return 'La suma de las cantidades seleccionadas debe ser igual a la cantidad a ingresar';
					}
					if (this.isDischarge) {
						return 'La suma de las cantidades seleccionadas debe ser igual a la cantidad a egresar';
					}
					return 'La suma de las cantidades seleccionadas debe ser igual a la cantidad a vender';
				}
				return '';
			} else if (x === 0) {
				if (
					this.selectedLots.some(
						(l) =>
							Number(l.selectedQuantity) <= 0 ||
							!Number.isInteger(Number(l.selectedQuantity))
					)
				) {
					return 'Ingrese solo números positivos';
				}
				if (this.isEntry) {
					return 'Ingrese las cantidades a ingresar por cada lote.';
				}
				if (this.isDischarge) {
					return 'Ingrese las cantidades a egresar por cada lote.';
				}

				return 'Ingrese las cantidades a vender por cada lote.';
			}
			return '';
		},
		disabledConfirm() {
			if (this.textWarning === '') return false;
			return true;
		},
	},
	created() {
		this.getDataLots();
	},
	methods: {
		formatIsoDateToDmy(isoDate) {
			const date = new Date(isoDate);
			const day = date.getUTCDate().toString().padStart(2, '0');
			const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
			const year = date.getUTCFullYear().toString();
			return `${year}-${month}-${day}`;
		},
		async getDataLots() {
			try {
				const params = {
					page: this.currentPage,
					productId: this.productId,
					state: true,
					relationAdd: 'warehouse',
					warehousesId: this.warehousesId ? String(this.warehousesId) : null,
				};
				const { data: rows, headers } = await this.$httpProducts.get('/products-lots', {
					params,
				});
				this.rows = this.mapperDataLot(rows);
				this.selectedLots = this.rows.map((row) => ({
					...row,
					selectedQuantity: 0,
				}));
				this.lastPage = Number(headers['x-last-page']);
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				}
			}
		},
		rowSelected(row) {
			const index = this.lotsSelecteds.findIndex(
				(ds) => ds.productLotId === row.productLotId
			);
			if (index > -1) {
				this.lotsSelecteds.splice(index, 1);
			} else {
				this.lotsSelecteds.push(row);
			}
		},
		rowSelectedAll(val) {
			if (val) {
				this.lotsSelecteds = [...this.rows];
				this.lotsSelecteds.splice(0);
			}
		},
		mapperDataLot(rows) {
			return rows.map((row) => ({
				productLotId: row.id,
				warehouseId: row.warehouseId,
				code: row.code,
				codeEan: row.codeEan,
				quantity: row.quantity,
				oldQuantity: row.oldQuantity,
				dateDue: this.formatIsoDateToDmy(row.dateDue),
				date: this.formatIsoDateToDmy(row.date),
				location: row.location,
				stock: row.stock,
				warehouseName: row.warehouse ? row.warehouse.name : '-',
			}));
		},
		setSelectedQuantity,
		sendSelectedLots,
		editQuantity() {
			this.editQuantityLot = !this.editQuantityLot;
		},
		setQuantity(value) {
			this.$emit('set-quantity', value);
		},
		changePage(page) {
			this.currentPage = page;
			this.getDataLots();
		},
	},
	watch: {
		newLots: {
			handler(newLots) {
				this.rows.push(...newLots);
				this.rows = this.rows.filter(
					(value, index, self) =>
						index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
				);
				this.selectedLots = this.rows.map((row) => ({
					...row,
					selectedQuantity: 0,
				}));
			},
			immediate: true,
		},
	},
};
</script>

<style>
.modal-items-title {
	background-color: rgba(195, 231, 232, 0.21);
	color: color(primary);
	font-weight: 600;
	padding: 13px 29px;
	text-transform: uppercase;
}
.width-stock {
	max-width: 185px !important;
}
.width-cprom {
	max-width: 138px !important;
}
.gray-color {
	color: #4a4a4a;
	font-family: font(open-semibold);
	font-size: 11px;
}
.ft-11 {
	font-size: 11px;
}
.item-column {
	background-color: white;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
	padding: 6px 5px;
}
.table-sale {
	border-collapse: collapse;
	width: 100%;
}
.row-table {
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	padding: 4px 6px;
	text-align: center;
}
.label-input {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
}
.ft-8 {
	font-family: font(open-semibold);
	font-size: 8px;
}
.label-util {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: 9px;
}
.link-purchase {
	color: #237bf5;
	font-family: font(open-regular);
	font-size: 12px;
}
.label-checkbox {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 11px;
}
.text-information-list {
	color: #4a4a4a;
	font-size: 12px;
}
.text-not-list {
	color: color(primary);
	font-size: 14px;
	font-weight: 600;
}
.text-alert {
	font-size: 12px;
	font-weight: 500;
}
.bg-header {
	background-color: rgba(2, 151, 155, 0.06);
}
.quantity-title {
	color: #8f8f8f;
	font-size: 13px;
}
.button {
	display: flex;
	width: 40%;
	justify-content: center;
	align-items: center;
	padding: 5px 0px;
	border-radius: 5px;
	color: color(primary);
	border: 2px solid color(primary);
	font-size: 14px;
	margin-left: 24px;
}
.text-warning {
	width: 100%;
	min-height: 1rem;
	font-size: 0.9rem;
	text-align: center;
	color: red;
}

.m--0 {
	margin: 0;
}
</style>
