<template>
<div class="warehouses-search-form">
	<v-layout wrap px-2 py-3>
		<v-flex xs12 px-4 v-if="showFilter">
			<v-radio-group name="typeSelect" row v-model="typeSelect">
				<v-radio
					v-for="(type, index) in types"
					:key="index"
					:label="type.name"
					:value="type.id"
					color="success"
					@change="changeType($event)"
				></v-radio>
			</v-radio-group>
		</v-flex>
		<v-flex xs12>
			<app-table
				selectByArrow
				selectable
				name="warehouses-search-form"
				class="is-not-selectable"
				:check-all="checkAll"
				:clean-search="isClean"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				local-storage
				:rows="warehouses"
				@on-search-event="search"
				@on-page="loadData"
				@enter-pressed="addWarehouse"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)"
						class="is-not-selectable">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.inlineAlternateCode }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.categoryName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.inlineFeatures }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 11)">{{ props.row.priceCost | round }}</td>
					<td v-show="showRow(columns, 12)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 13)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 14)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 15)">{{ props.row.minStock }}</td>
					<td v-show="showRow(columns, 16)">{{ props.row.unitCode }}</td>
					<td v-show="showRow(columns, 17)">{{ props.row.weigth }}</td>
					<td v-show="showRow(columns, 18)">
						<v-btn
							flat
							small
							type="button"
							class="table-icon"
							:color="props.row.flagActive === 1 ? 'success' : 'error'">
							{{ statusInWord(props.row) }}
						</v-btn>
					</td>
					<td v-show="showRow(columns, 19)">
						<v-tooltip top>
							<span slot="activator">
								{{ productTypeVariant(props.row).typeSiglas }}
							</span>
							<span>
								{{ productTypeVariant(props.row).typeName }}
							</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 20)">{{ props.row.lot }}</td>
					<td v-show="showRow(columns, 21)">
						<v-layout v-if="freeProductBtnSelecction">
							<v-flex xs4 mr-2>
								<v-btn
									class="btn-action btn-auto btn-width-auto px-2 py-1"
									color="success"
									small
									@click.stop="addWarehouse(props.row)"
								>
									<v-icon id="add-icon" color="white">add</v-icon>
								</v-btn>
							</v-flex>
							<v-flex xs7>
								<v-btn
									class="btn-action btn-auto btn-width-auto px-2 py-1"
									color="success"
									:disabled="!isFree(props.row)"
									@click.stop="$emit('add-warehouse', props.row, 'free')"
								>
									Gratis
								</v-btn>
							</v-flex>
						</v-layout>
						<template v-else>
							<template v-if="disabledAddBtn(props.row)">
								<v-tooltip left>
									<v-btn
										class="btn-action btn-auto btn-width-auto px-2 py-1"
										color="success"
										disabled
										small
										slot="activator"
									>
										{{ text }}
									</v-btn>
									<span>No se permite vender productos sin stock</span>
								</v-tooltip>
							</template>
							<template v-else>
								<v-btn
									class="btn-action btn-auto btn-width-auto px-2 py-1"
									color="success"
									small
									@click.stop="$emit('add-warehouse', props.row)"
								>
									{{ text }}
								</v-btn>
							</template>
						</template>
					</td>
				</template>
			</app-table>
		</v-flex>
	</v-layout>
</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import helper from '@/shared/helper';
	import TypeProduct from '@/shared/type-product';

	async function created() {
		const warehouseIndex = this.columns.findIndex(i => i.value === 'warehouseName');
		this.columns[warehouseIndex].name = this.labelWarehouse();
		this.params.search = null;
		this.isClean = true;
		const warehouseColumnIndex = this.columns.findIndex(c => c.value === 'warehouseName');
		const brandColumnIndex = this.columns.findIndex(c => c.value === 'brandName');
		this.columns[warehouseColumnIndex].checked = !this.master;
		this.columns[warehouseColumnIndex].visible = !this.master;
		this.columns[warehouseColumnIndex].flagVisible = this.master;
		this.columns[brandColumnIndex].checked = !this.master;
		this.columns[brandColumnIndex].visible = !this.master;
		this.columns[brandColumnIndex].flagVisible = this.master;
		helper.removeLocalData('warehouses-search-form::search');
		const showLot = this.$userInfo.company.settings.flagWorkWithBatches || false;
		this.columns[18].visible = showLot;
		this.columns[18].checked = showLot;
		this.columns[18].flagVisible = !showLot;
		this.columns[19].visible = showLot;
		this.columns[19].checked = showLot;
		this.columns[19].flagVisible = !showLot;
		this.loadData();
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = page;
		this.params.search = this.params.search || this.searchValue || null;
		this.params.warehouseId = this.params.typeId === 1 ? this.warehouseId || null : null;
		try {
			const { data: response, headers } = await this.$httpProducts.get('warehouses');
			this.warehouses = response.map((product) => {
				const newProduct = { ...product };
				return newProduct;
			});
			this.lastPage = Number(headers['x-last-page']);
			if (this.warehouses.length === 0) {
				this.showNotification('No se han encontrado coincidencias.', 'info');
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.checkAll = this.warehouses.every(product => product.isSelected);
			this.isClean = false;
		}
	}

	function search(searchData) {
		if (searchData) {
			const searchVal = searchData.replace(/\?/g, '_');
			this.params.search = searchVal || null;
		}
		this.loadData();
	}

	function statusInWord({ flagActive }) {
		return flagActive === 1 ? 'ACTIVO' : 'DESACTIVADO';
	}

	function changeType(value) {
		this.params.typeId = value;
		this.loadData();
	}

	function isFree({ product }) {
		if (this.isPeru) {
			const index = product.taxes.findIndex(t => t.name === 'GRATUITO');
			return index > -1;
		}
		return true;
	}

	function disabledAddBtn({ stock, type }) {
		if (this.$route.name !== 'new-quotation') {
			const { company } = this.$userInfo;
			const { settings } = company;
			const { stockNegative } = settings || {};
			return type === TypeProduct.Products &&
				!this.notValidNegativeStock && !stockNegative && (stock <= 0);
		}
		return false;
	}

	function addWarehouse(row) {
		this.$emit('add-warehouse', row, 'not-free');
	}

	function freeProductBtnSelecction() {
		return this.isSale && this.showFree;
	}

	function productTypeVariant({ typeInfo }) {
		if (typeInfo) {
			const varNameSplit = typeInfo.name.split(' ');
			const varSiglas = varNameSplit.length > 1 ? varNameSplit.reduce((a, vn) =>
				a.concat(vn.split('')[0]), '') : varNameSplit[0].split('')[0];
			return {
				validVariations: typeInfo.code === 'variantes',
				typeName: typeInfo.name,
				typeSiglas: varSiglas,
			};
		}
		return {};
	}

	function data() {
		return {
			checkAll: false,
			isClean: false,
			columns: [
				{ id: 1, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 3, name: 'Cod. interno', value: 'autoBarcode', visible: true, checked: true },
				{ id: 4, name: 'Otros códigos', value: 'alternateCode', visible: false, checked: false },
				{ id: 5, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 6, name: 'Categorias', value: 'categories', visible: false, checked: false },
				{ id: 7, name: 'Características', value: 'inlineFeatures', visible: true, checked: true },
				{ id: 8, name: 'Descripción', value: 'description', visible: false, checked: false },
				{ id: 10, name: 'Marca', value: 'brandName', visible: true, checked: true },
				{ id: 11, name: 'P. costo', value: 'priceCost', visible: false, checked: false },
				{ id: 12, name: 'P. venta', value: 'price', visible: true, checked: true },
				{ id: 13, name: 'Conteo', value: 'quantity', visible: false, checked: false },
				{ id: 14, name: 'Stock', value: 'stock', visible: true, checked: true },
				{ id: 15, name: 'Stock min', value: 'minStock', visible: false, checked: false },
				{ id: 16, name: 'Und.', value: 'unitCode', visible: false, checked: false },
				{ id: 17, name: 'Kg', value: 'weigth', visible: false, checked: false },
				{ id: 18, name: 'Estado', value: 'status', visible: false, checked: false },
				{ id: 19, name: 'T. Prod.', tooltip: 'Tipo de Producto', value: 'status', visible: false, checked: false },
				{ id: 20, name: 'Lote', tooltip: 'Número de Lote', value: 'lot', visible: false, checked: false },
				{ id: 21, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			lastPage: 0,
			params: {
				flagActive: 1,
				flagSales: 1,
				flagWarehouseRequired: 1,
				limit: 22,
				page: 1,
				search: null,
				warehouseId: null,
				typeId: 1,
			},
			types: [],
			warehouses: [],
			typeSelect: 1,
		};
	}

	export default {
		name: 'warehouses-search-form',
		components: {
			appTable,
		},
		computed: {
			freeProductBtnSelecction,
		},
		created,
		data,
		methods: {
			addWarehouse,
			changeType,
			disabledAddBtn,
			loadData,
			search,
			statusInWord,
			isFree,
			productTypeVariant,
		},
		props: {
			ecommerce: {
				default: false,
				type: Boolean,
			},
			master: {
				default: false,
				type: Boolean,
			},
			searchValue: String,
			warehouseId: [Number, String],
			text: {
				type: String,
				default: 'Agregar',
			},
			isSale: {
				type: Boolean,
				default: false,
			},
			showFilter: {
				default: true,
				type: Boolean,
			},
			showFree: {
				default: false,
				type: Boolean,
			},
			purchase: {
				default: false,
				type: Boolean,
			},
			notValidNegativeStock: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>
