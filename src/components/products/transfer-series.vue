<template>
	<div class="pt-4">
		<v-layout wrap pl-4 pr-4>
			<v-flex xs5 mb-3>
				<label class="list-title">Almacen de Destino</label>
			</v-flex>
		</v-layout>
		<v-layout wrap pl-4 pr-4>
			<v-flex xs7 mb-3>
				<v-select
					:items="filteredWarehouses"
					v-model="warehouse"
					label="Destino"
					item-text="name"
					item-value="id"
					single-line
					bottom
					hide-details
					class="filter-select"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout wrap pl-4 pr-4>
			<v-flex xs12 mb-3>
				<label class="list-title">Lista de traslado</label>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-flex xs12>
				<app-table
					name="transfer-series"
					:columns="columns"
					:rows="productsWithStock"
					:input-search="false"
					class="is-not-selectable"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.warehouse.name }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.product.name }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.serie }}</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.unit ? props.row.unit.name : '-' }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{ props.row.brand && props.row.brand.name ? props.row.brand.name : '-' }}
						</td>
						<td v-show="showRow(columns, 7)">{{ props.row.quantity }}</td>
						<td v-show="showRow(columns, 8)">
							<v-tooltip top>
								<v-btn slot="activator" icon @click="deleteRow(props.row)">
									<v-icon color="red">delete</v-icon>
								</v-btn>
								<span>Eliminar</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:isLoading="!(!!productsWithStock.length && warehouse)"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="transferProducts"
			/>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function data() {
	return {
		warehouse: null,
		warehouses: [],
		columns: [
			{ id: 1, name: 'Tienda orig.', value: '', visible: true, checked: true },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Serie', value: 'serie', visible: true, checked: true },
			{ id: 5, name: 'Unidad', value: 'unity', visible: true, checked: true },
			{ id: 6, name: 'Marca', value: 'stock', visible: true, checked: true },
			{ id: 7, name: 'Peso', value: 'quantity', visible: true, checked: true },
			{
				id: 8,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		productsWithStock: [],
		filteredWarehouses: [],
	};
}

function deleteRow(rowSerie) {
	const id = rowSerie.id;
	const index = this.productsWithStock.map((row) => row.id).indexOf(id);
	this.productsWithStock.splice(index, 1);
}

function created() {
	this.loadData();
	this.onlyWithStock();
}

function filterWarehouses(warehouses) {
	this.filteredWarehouses = warehouses.filter((el) => el.id !== this.warehouseId);
	if (this.filteredWarehouses.length === 1) {
		this.warehouse = this.filteredWarehouses[0];
	}
}

async function loadData() {
	const response = await this.$httpProducts.get('warehouses?all=1');
	this.warehouses = response.data;
	this.filterWarehouses(this.warehouses);
}

function onlyWithStock() {
	const newProducts = [...this.data];
	this.productsWithStock = newProducts
		.filter((e) => e.warehouseProduct.stock > 0)
		.map((e) => {
			const newItem = { ...e };
			newItem.series = [];
			newItem.quantityProduct = 0;
			return newItem;
		});
	if (this.productsWithStock.length < this.data.length) {
		this.showNotification('Solo se muestran los productos que tienen stock', 'warning');
	}
}

async function transferProducts() {
	const result = Object.values(
		this.productsWithStock.reduce((acc, row) => {
			if (acc[row.productId]) {
				acc[row.productId].quantity += row.quantity;
				acc[row.productId].series.push(row.id);
			} else {
				acc[row.productId] = {
					...row,
					productId: row.productId,
					quantity: row.quantity,
					series: [row.id],
				};
			}
			return acc;
		}, {})
	);
	const seriesSend = this.productsWithStock.map((row) => {
		const seriesSendItem = {
			id: row.id,
			observation: row.observation,
			quantity: row.quantity,
			serie: row.serie,
		};
		return seriesSendItem;
	});
	const productSeries = result.map((e) => {
		const newR = {};
		newR.productName = e.product.name;
		newR.productId = e.productId;
		newR.quantity = e.quantity;
		newR.brandId = (e.brand && e.brand.id) || e.brandId;
		newR.seriesId = e.series;
		newR.additionalInformation = {
			seriesSend,
		};
		return newR;
	});

	const body = {
		details: productSeries,
		warehouseOriginId: this.warehouseId,
		warehouseSourceId:
			typeof this.warehouse === 'number' ? this.warehouse : this.warehouse.id,
		subsidiaryId: this.$userInfo.comSubsidiariesId,
		entryDate: helper.exactDate(this.$today(), 'YYYY-MM-DD'),
		code: 'MPA',
	};
	try {
		await this.$httpProducts.post('transfers', body);
		this.showNotification('Transacción exitosa');
		this.$emit('update-transfer');
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'TRANSFER_SERIE_IS_ACTIVE') {
				this.showNotification(
					'Ya existe una transferencia activa para esta serie. Finalízala antes de iniciar una nueva..',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

export default {
	name: 'transfer-series',
	data,
	created,
	components: {
		appTable,
		modalSidebarButton,
	},
	methods: {
		deleteRow,
		loadData,
		onlyWithStock,
		transferProducts,
		filterWarehouses,
	},
	props: {
		data: {
			type: Array,
			default: () => [],
		},
		warehouseId: {
			type: [String, Number],
		},
		nameWarehouse: String,
	},
};
</script>
