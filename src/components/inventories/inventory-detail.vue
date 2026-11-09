<template>
	<div>
		<header-page
			name="inventario"
			show-excel
			to-show
			:columns="columns"
			:rows="inventory.details"
			:title="`${$route.meta.title} #${inventoryId}`"
			:showClean="false"
		/>
		<general-filter class="filter-inventory">
			<v-layout row wrap justify-center>
				<v-flex xs12>
					<v-layout row wrap justify-center>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label>Creado:</label>
							<span>{{ inventory.inventoryDate | formatDate('DD/MM/YYYY, HH:MM:SS a') }}</span>
						</v-flex>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label>Tipo:</label>
							<span>{{ inventory.typeName }}</span>
						</v-flex>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label>Responsable:</label>
							<span>{{ inventory.inlineResponsibles }}</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12>
					<v-layout row wrap justify-center>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label>Almacén:</label>
							<span v-if="inventory.warehouse">{{ inventory.warehouse.name }}</span>
						</v-flex>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label>Estado:</label>
							<span>
								{{ inventory.stateName }}
								<span v-show="inventory.status === 2">
									{{ inventory.closedAt | formatDate('DD/MM/YYYY, HH:MM:SS a') }}
								</span>
							</span>
						</v-flex>
						<v-flex xs12 sm4 px-1 class="align-col">
							<label for="zone">Zona:</label>
							<span>
								{{ inventory.zone }}
							</span>
						</v-flex>
						<v-flex xs12 sm12 px-1 class="align-col">
							<v-btn
								v-if="openInventoryStatus"
								type="button"
								color="success"
								class="btn-action btn-update-inventory mr-5"
								@click="updateInventory">
								Actualizar Inventario
							</v-btn>
							<v-btn
								v-if="openInventoryStatus"
								type="button"
								class="btn-action mr-0"
								color="primary"
								@click="closeInventory">
								Cerrar inventario
							</v-btn>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto overflow-background mt-0">
			<app-table
				:name="`inventory-${inventoryId}`"
				:columns="columns"
				:rows="inventory.details"
				local-storage
				:input-search="false"
				:main-list="false"
				@on-toggle-columns="toggleColumns"
				class="is-not-selectable no-main-list">
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable"
						v-show="showRow(columns, 1)">{{ props.row.productName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.productCode }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.productAutoBarcode }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.productFeatures }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 7)">
						<v-text-field
							label="00"
							type="number"
							:disabled="closedInventoryStatus"
							v-model.number="props.row.computed"
							single-line
							hide-details
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.diff }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.documentType }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 11)">
						<app-tooltip-button
							text="Eliminar"
							color="pink"
							icon="delete"
							@click-icon="deleteItem(props.row.id)"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
	import appTable from './../shared/table/app-table';
	import generalFilter from './../shared/general-filter';
	import headerPage from './../shared/header-page';
	import helper from './../../shared/helper';

	const { setLocalData, getLocalData, removeLocalData } = helper;

	function created() {
		if (this.statusInventory) {
			setLocalData('status-inventory', this.status);
		} else {
			this.statusInventory = getLocalData('status-inventory');
		}
		this.loadData();
	}

	async function closeInventory() {
		const closeDate = {
			closedAt: new Date().toISOString(),
		};
		try {
			await this.$httpProducts.patch(`inventory/${this.inventoryId}/closed`, closeDate);
			this.showNotification(`El inventario #${this.inventoryId} fue cerrado correctamente`);
			this.inventory.status = 2;
			this.inventory.stateName = 'Cerrado';
			this.goTo('list-of-inventories');
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadData() {
		this.columns = this.columns.map((c) => {
			const newC = { ...c };
			if (newC.value === 'actions') {
				newC.visible = this.statusInventory === 1;
				newC.checked = this.statusInventory === 1;
			}
			return newC;
		});
		const urlOpen = `v2/inventories/${this.inventoryId}/with-stock`;
		const urlClosed = `inventories/${this.inventoryId}`;
		const url = this.statusInventory === 1 ? urlOpen : urlClosed;
		try {
			const response = await this.$httpProducts.get(url);
			const inventoryData = response.data;
			inventoryData.typeName = response.data.type && response.data.type === 1
				? 'Parcial' : 'Completo';
			inventoryData.inlineResponsibles = response.data.responsible
				&& response.data.responsible.length > 0
				? response.data.responsible.join(', ') : '';
			inventoryData.stateName = response.data.status && response.data.status === 1
				? 'Inventariado' : 'Cerrado';
			inventoryData.details = response.data.details.map((detail) => {
				const newDetail = { ...detail };
				newDetail.productName = detail.product ? detail.product.name : '';
				newDetail.productCode = detail.product ? detail.product.code : '';
				newDetail.productAutoBarcode = detail.product ? detail.product.autoBarcode : '';
				newDetail.brandName = detail.brand ? detail.brand.name : '';
				newDetail.productFeatures = detail.product ? detail.product.inlineFeatures : '';
				newDetail.documentType = detail.document && detail.document.serie
					&& detail.document.serie.typeDocument
					? detail.document.serie.typeDocument.name : '';
				newDetail.documentNumber = detail.document && detail.document.serie ?
					`${detail.document.serie.serie}-${detail.document.number}` : '';
				return newDetail;
			});
			this.inventory = inventoryData;
		} catch (err) {
			this.showGenericError();
		}
	}

	function toggleColumns() {
		return true;
	}

	async function deleteItem(id) {
		const index = this.inventory.details.findIndex(i => i.id === id);
		this.inventory.details.splice(index, 1);
		const url = `inventories-details/${id}`;
		try {
			await this.$httpProducts.delete(url);
			this.showNotification('Producto eliminado con éxito');
		} catch (error) {
			this.showGenericError();
		}
	}

	async function updateInventory() {
		const url = `/v2/inventories/${this.inventoryId}`;
		const details = this.inventory.details.map((i) => {
			const newI = {
				id: i.id,
				productId: i.productId,
				computed: i.computed,
				brandId: i.brandId,
			};
			return newI;
		});
		const body = { details };
		try {
			await this.$httpProducts.patch(url, body);
			this.loadData();
		} catch (error) {
			this.showGenericError();
		}
	}

	function openInventoryStatus() {
		return this.statusInventory === 1;
	}

	function closedInventoryStatus() {
		return this.statusInventory === 2;
	}

	function beforeDestroy() {
		removeLocalData('status-inventory');
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Nombre', value: 'productName', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'productCode', visible: true, checked: true },
				{ id: 3, name: 'Cod. interno', value: 'productAutoBarcode', visible: true, checked: true },
				{ id: 4, name: 'Marca', value: 'brandName', visible: true, checked: true },
				{ id: 5, name: 'Características', value: 'productFeatures', visible: true, checked: true },
				{ id: 6, name: 'Stock', value: 'stock', visible: true, checked: true },
				{ id: 7, name: 'Conteo', value: 'computed', visible: true, checked: true },
				{ id: 8, name: 'Diferencia', value: 'diff', visible: true, checked: true },
				{ id: 9, name: 'Tipo de documento', value: 'documentType', visible: true, checked: true },
				{ id: 10, name: 'Número', value: 'documentNumber', visible: true, checked: true },
				{ id: 11, name: 'Acciones', value: 'actions', visible: true, checked: true },
			],
			inventory: {
				details: [],
			},
			statusInventory: this.status,
		};
	}

	export default {
		name: 'inventory-detail',
		beforeDestroy,
		components: {
			appTable,
			generalFilter,
			headerPage,
		},
		computed: {
			openInventoryStatus,
			closedInventoryStatus,
		},
		created,
		data,
		methods: {
			closeInventory,
			deleteItem,
			loadData,
			toggleColumns,
			updateInventory,
		},
		props: ['inventoryId', 'status'],
	};
</script>

<style lang="scss" scoped>
	.filter-inventory {
		label {
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, medium);
		}

		span {
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, medium);
		}
	}
	.close-action {
		cursor: pointer;
	}
	.btn-update-inventory {
		width: 115px !important;
	}
</style>