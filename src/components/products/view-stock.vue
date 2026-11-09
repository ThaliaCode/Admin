<template>
	<div>
		<v-flex xs12 py-3>
			<v-flex pt-4 px-4 my-2>
				<v-flex xs6 v-if="$route.name !== 'suppliers-list-product'">
					<v-btn
						type="button"
						color="primary"
						class="btn-action btn-action-block"
						@click="eventWarehouse"
					>
						Asignar Nuevos Almacenes
					</v-btn>
				</v-flex>
				<v-layout align-end wrap mb-4 row v-if="showWarehouse">
					<v-flex mt-2 xs5>
						<app-select
							:items="availableWarehouses"
							item-text="name"
							item-value="id"
							label="Almacén"
							:item="warehouseSelect"
							model="warehouseSelect"
							@input="setModal"
						/>
						<span v-if="!availableWarehouses.length" class="text--error"
							>No hay almacenes disponibles en este momento</span
						>
					</v-flex>
					<v-flex xs4 ml-1 v-if="!showUseBrand">
						<app-select
							:items="brands"
							item-text="name"
							item-value="id"
							label="Marca"
							:item="brandSelect"
							model="brandSelect"
							@input="setModal"
						/>
					</v-flex>
					<v-flex xs2 ml-2>
						<v-btn
							@click="addWarehouse"
							:disabled="disabledAddWar"
							color="primary"
							type="button"
							class="btn-action btn-auto ml-1 py-2 px-4 mt-2"
						>
							Añadir
						</v-btn>
					</v-flex>
				</v-layout>
				<v-layout column wrap v-if="arrayWarehouse.length">
					<v-flex mb-2 v-for="(item, index) in arrayWarehouse" :key="index">
						<v-layout wrap row align-center>
							<v-flex xs4>
								<h6>
									Almacén
									<p class="mt-1 mb-0">
										{{ item.warehouseName }}
									</p>
								</h6>
							</v-flex>
							<v-flex xs2>
								<h6>
									Marca
									<p class="mt-1 mb-0">
										{{ item.brandName }}
									</p>
								</h6>
							</v-flex>
							<v-flex xs2>
								<app-input-text
									label="Min. Stock"
									model="minStock"
									:text="item.minStock"
									@input="setStock(index, $event)"
								/>
							</v-flex>
							<v-flex xs2 ml-1>
								<app-input-text
									label="Max. Stock"
									model="maxStock"
									:text="item.maxStock"
									@input="setStock(index, $event)"
								/>
							</v-flex>
							<v-flex class="mt-3">
								<app-tooltip-button
									class="ml-1"
									color="error"
									icon="delete"
									text="Eliminar Almacén"
									@click-icon="deleteWarehouse(index)"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<app-table
				class="mb-0"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:items-quantity="rows.length"
				:items-total-quantity="rows.length"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable width-war">
						{{ props.row.code }}
					</td>
					<td v-show="showRow(columns, 2)" class="width-war">
						{{ props.row.name }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.stockWarehouse }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.locationWwp || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.maxStock }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.minStock }}</td>
				</template>
				<template slot="footerSemi">
					<td colspan="1" class="footer-table"></td>
					<td class="footer-table--select">
						<div class="footer-table--text">Total de Stock</div>
					</td>
					<td class="footer-table--select" v-if="stock">
						{{ stock }}
					</td>
					<td class="footer-table--select" v-else>
						{{ sumStock }}
					</td>
					<td colspan="2" class="footer-table"></td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="$route.name === 'suppliers-list-product'"
				:is-loading="!arrayWarehouse.length > 0"
				success-text="Asignar Almacen"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveModal"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadView();
	this.loadBrands();
	this.loadWarehouses();
	this.showUseBrand =
		this.$userInfo.company.settings.flagUseSimpleBrand || false;
}

async function loadBrands() {
	({ data: this.brands } = await this.$httpProducts('brands'));
	if (this.showUseBrand) {
		this.brandDefault = this.brands.find((p) => p.flagDefault === 1);
	}
}

async function loadView() {
	const params = {
		...this.params,
	};
	try {
		const response = await this.$httpProducts.get(
			`products/master/${this.productId}`,
			{ params }
		);
		this.rows = response.data.warehouseProductDetails || [];
		this.idWarehouses = this.rows.map((p) => p.id);
		this.sumStock = this.rows.reduce((acum, d) => acum + d.stockWarehouse, 0);
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadWarehouses() {
	({ data: this.warehouses } = await this.$httpProducts.get('warehouses'));
}

function addWarehouse() {
	if (
		this.arrayWarehouse.find((w) => w.warehouseId === this.warehouseSelect.id)
	) {
		this.showGenericError('No se puede añadir un almacén más de una vez');
		return;
	}
	this.arrayWarehouse.push({
		warehouseName: this.warehouseSelect.name,
		warehouseId: this.warehouseSelect.id,
		minStock: 0,
		maxStock: 0,
		brandName: this.showUseBrand ? this.brandProduct : this.brandSelect.name,
		brandId: this.showUseBrand ? undefined : this.brandSelect.id,
	});
	this.clearModal();
}

function clearModal() {
	this.warehouseSelect = null;
	this.brandSelect = null;
}

function deleteWarehouse(index) {
	this.arrayWarehouse.splice(index, 1);
}

function changePage(page) {
	this.currentPage = page;
	this.params.page = page;
	this.loadView();
}

function setStock(index, { model, value }) {
	this.arrayWarehouse[index][model] = Number(value);
}

function setModal({ model, value }) {
	this[model] = value;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadView();
}

async function saveModal() {
	const body = {
		products: [this.productId],
		warehouses: this.arrayWarehouse.map((war) => {
			const newRow = {};
			newRow.brandId = war.brandId || undefined;
			newRow.warehouseId = war.warehouseId;
			newRow.minStock = war.minStock;
			newRow.maxStock = war.maxStock;
			return newRow;
		}),
	};
	try {
		await this.$httpProducts.post('products/assign-warehouses', body);
		this.showNotification('Se asignó correctamente.');
		this.$emit('save');
	} catch (error) {
		this.showGenericError();
	}
}

function eventWarehouse() {
	this.showWarehouse = !this.showWarehouse;
}

function data() {
	return {
		arraySelect: [],
		arrayWarehouse: [],
		brands: [],
		brandDefault: null,
		brandSelect: null,
		sumStock: 0,
		columns: [
			{
				id: 1,
				name: 'Cod. Almacén',
				value: 'code',
				checked: true,
				visible: true,
			},
			{ id: 2, name: 'Almacén', value: 'code', checked: true, visible: true },
			{ id: 3, name: 'Stock', value: 'code', checked: true, visible: true },
			{
				id: 4,
				name: 'Ubicación',
				value: 'locationWwp',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Stock Max.',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Stock Min.',
				value: 'code',
				checked: true,
				visible: true,
			},
		],
		currentPage: 1,
		idWarehouses: null,
		lastPage: 1,
		rows: [],
		params: {
			page: 1,
			relationAdd: 'warehouseProductDetails',
			search: null,
		},
		showUseBrand: false,
		showValue: false,
		showWarehouse: false,
		warehouses: [],
		warehouseSelect: null,
	};
}

export default {
	name: 'view-stock',
	created,
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		disabledAddWar() {
			return (
				!this.warehouseSelect ||
				(!this.showUseBrand ? !this.brandSelect : false)
			);
		},
		availableWarehouses() {
			const assignedIds = new Set([
				...(this.idWarehouses || []).map((id) => Number(id)),
				...(this.arrayWarehouse || []).map((w) => Number(w.warehouseId)),
			]);
			return this.warehouses.filter((w) => !assignedIds.has(Number(w.id)));
		},
	},
	methods: {
		addWarehouse,
		clearModal,
		deleteWarehouse,
		eventWarehouse,
		loadBrands,
		loadView,
		loadWarehouses,
		changePage,
		onSearch,
		setModal,
		saveModal,
		setStock,
		// setWarehouse,
	},
	props: {
		productId: [String, Number],
		stock: [String, Number],
		brandProduct: [String, Number],
	},
};
</script>

<style lang="scss">
.width-war {
	width: 130px;
}

.text--error {
	font-size: 11px;
	color: red;
	margin-left: 5px;
	display: block;
	height: 0;
}
</style>
