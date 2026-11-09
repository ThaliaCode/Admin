
<template>
	<div class="mt-4">
		<app-table
			name="master-products"
			class="is-not-selectable"
			:check-all="checkAll"
			:clean-search="isClean"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:items-quantity="totalItemsVisible"
			:items-total-quantity="totalItems"
			:disabled-search="disabledSearch"
			local-storage
			padding="px-5"
			:rows="masterProducts"
			selectable
			@column-input="$emit('column-input', $event)"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('search-event', $event)"
			@on-selected-all="$emit('all-selected', $event)"
			@row-is-selected="$emit('row-selected', $event)"
			@table-option-event="$emit('table-option-event', $event)"
			@on-column-sortable="$emit('on-column-sortable', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ props.row.code }}
				</td>
				<!-- <td v-show="showRow(columns, 2)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 3)">
					<v-tooltip top>
						<span slot="activator">
							{{ productTypeVariant(props.row).typeSiglas }}
						</span>
						<span>
							{{ productTypeVariant(props.row).typeName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 4)">
					<span v-if="$route.params.commerceId">
						{{ getAttributes(props.row) }}
					</span>
					<span v-else>
						{{ getSales(props.row) }}
					</span>
				</td> -->
				<td v-show="showRow(columns, 2)">
					<v-layout>
						<v-flex text-xs-center xs10>
							{{ props.row.name }}
						</v-flex>
						<!-- <v-flex text-xs-right v-if="props.row.flagLoyalti === 1">
							<v-tooltip top>
								<button
									type="button"
									slot="activator"
									@click="$emit('open-dialog', props.row)"
								>
									<img src="/static/icon/icon-acum-point.svg" alt="icono-acumular-puntos">
								</button>
								<span>Acumula Puntos</span>
							</v-tooltip>
						</v-flex> -->
					</v-layout>
				</td>
				<td v-show="showRow(columns, 3)">{{ props.row.nameBrand }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.slug }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.codeUnit }}</td>
				<td
					v-show="showRow(columns, 6)">
					<v-tooltip top>
						<template slot="activator">
							<img
								v-if="props.row.urlImage"
								class="pt-2 pb-2 px-1"
								width="55px"
								height="55px"
								:src="props.row.urlImage"
							/>
						</template>
						<img
							class="pt-2 pb-2 px-1"
							width="190px"
							height="195px"
							:src="props.row.urlImage"
						/>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 7)">{{ props.row.conversions ? props.row.conversions.length : 0 }}</td>

				<!-- <td v-show="showRow(columns, 5)">{{ props.row.converd }}</td> -->
				<td v-show="showRow(columns, 8)">
					<!-- <document-state
						:color="getColorStatus(props.row)"
						icon="radio_button_checked"
						:tooltip="getTextStatus(props.row)"
						@click-state="$emit('change-state', props.row)"
					/> -->
					<document-state
						:color="getColorStatus(props.row)"
						icon="radio_button_checked"
						:tooltip="getTextStatus(props.row)"
					/>
					<!-- <document-state
						:img="props.row.flagSales === 1 ? '/static/img/sale-state-active.svg' : '/static/img/sale-state-inactive.svg'"
						:tooltip="`${statusInWord(props.row.flagSales)} para la venta`"
						height="16"
					/> -->
				</td>

				<td v-show="showRow(columns, 9)">
					<app-tooltip-button
						class="table-icon mr-2"
						height="21"
						:color="reviewStatusData[props.row.reviewStatus].color"
						icon="radio_button_checked"
						:text="reviewStatusData[props.row.reviewStatus].text"
						@click-icon="$emit('table-action', { item: props.row, code: 'RS' })">
					</app-tooltip-button>
					<!-- <document-state
						:img="props.row.flagSales === 1 ? '/static/img/sale-state-active.svg' : '/static/img/sale-state-inactive.svg'"
						:tooltip="`${statusInWord(props.row.flagSales)} para la venta`"
						height="16"
					/> -->
				</td>
				<!-- <td v-show="showRow(columns, 7)">
					<span v-if="props.row.category">
						{{ props.row.category.name }}
					</span>
				</td>
				<td v-show="showRow(columns, 8)">
					<span v-if="props.row.categoriesEcommerce">
						{{ props.row.categoriesEcommerce }}
					</span>
				</td>
				<td v-show="showRow(columns, 9)">
					<span v-html="props.row.description">
					</span>
				</td>
				<td v-show="showRow(columns, 10)">{{ props.row.order }}</td>
				<td v-show="showRow(columns, 11)">{{ getAmountWithDiscount(props.row) }}</td>
				<td v-show="showRow(columns, 12)">{{ getPrice(props.row) }}</td>
				<td v-show="showRow(columns, 13)">{{ getStock(props.row) }} </td>
				<td v-show="showRow(columns, 14)">{{ props.row.stockReserved }} </td>
				<td v-show="showRow(columns, 15)">{{ props.row.lastCost }}</td>
				<td v-show="showRow(columns, 16)">{{ props.row.totalCost }}</td>
				<td v-show="showRow(columns, 17)" class="pl-3">
					<v-tooltip top>
						<v-switch
							slot="activator"
							color="success"
							hide-details
							v-model="props.row.flagShowCatalog"
							@click.stop="stopClick"
							@change="$emit('change-show-catalog', $event, props.row)"
						></v-switch>
						<span>{{ props.row.flagShowCatalog ? 'Activo' : 'Inactivo' }}</span>
					</v-tooltip>
				</td> -->

				<!-- <td v-show="showRow(columns, 4)">
					<document-state
						:color="getColorStatus(props.row)"
						icon="radio_button_checked"
						:tooltip="getTextStatus(props.row)"
						@click-state="$emit('change-state', props.row)"
					/>
					<document-state
						:img="props.row.flagSales === 1 ? '/static/img/sale-state-active.svg' : '/static/img/sale-state-inactive.svg'"
						:tooltip="`${statusInWord(props.row.flagSales)} para la venta`"
						height="16"
					/>
				</td> -->
				<!-- <td v-show="showRow(columns, 19)"
				:style="props.row.flagAvgCost === 1 ? 'color: #2abca4' : 'color: #f40029'">
					{{ props.row.flagAvgCost === 1 ? 'Sí' : 'No' }}
				</td>
				<td v-show="showRow(columns, 20)">{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}</td>
				<td v-show="showRow(columns, 21)">{{ props.row.brandName }}</td> -->
				<td v-show="showRow(columns, 10)">
					<v-layout row wrap align-center justify-center>
						<app-tooltip-button
							class="table-icon mr-2"
							height="21"
							color="primary"
							icon="copyright"
							text="Conversión"
							@click-icon="$emit('table-action', { item: props.row, code: 'CU' })">
						</app-tooltip-button>
							<!-- @click-icon="$emit('table-action', { item: props.row, code: 'CF' })" -->

						<!-- v-if="($userInfo.codeTypeRol != 'MAKI_VENDOR' && $userInfo.flagAdmin !== 0)" -->
						<app-tooltip-button
							class="table-icon mr-2"
							height="21"
							color="primary"
							icon="mode_edit"
							text="Editar producto"
							@click-icon="$emit('edit-product', props.row)"
						></app-tooltip-button>
						<!-- <app-tooltip-button
							class="mr-2"
							height="17"
							img="/static/img/new-icons/icon-action-delete.svg"
							text="Eliminar"
							@click-icon="$emit('delete-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.type === 1"
							class="mr-2"
							height="17"
							icon="copyright"
							text="Clonar Producto"
							@click-icon="$emit('clone-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.type === 7"
							class="mr-2"
							height="23"
							icon="add_circle"
							text="Agregar Producto Lotes"
							@click-icon="$emit('lot-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="productTypeVariant(props.row).validVariations"
							:disabled="!!props.row.productParentId"
							height="17"
							img="/static/img/new-icons/icon-action-variants.svg"
							:text="textButtonProduct(props.row)"
							@click-icon="$emit('variants-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							height="17"
							img="/static/img/icon-features.svg"
							text="Agregar Caraterísticas"
							@click-icon="$emit('table-action', { item: props.row, code: 'CF' })"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.type === 1"
							height="22"
							class="ml-1"
							icon="manage_search"
							text="Visualizar Stock"
							@click-icon="$emit('view-stock', { item: props.row, code: 'VS' })"
						></app-tooltip-button> -->
					</v-layout>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import documentState from '@/components/shared/document-state';
	import helper from '@/shared/helper';
	import lib from '@/shared/lib';

	const { round } = lib;
	const twoDecimals = round(2);

	function statusInWord(value) {
		return value ? 'Activo' : 'Inactivo';
	}

	function showActions() {
		const columnActionsIndex = this.columns.findIndex(c => c.name === 'Acciones-extras');
		return columnActionsIndex > -1 && this.showColumnActions;
	}

	function getAttributes({ attributes }) {
		if (attributes && attributes.length > 0) {
			return attributes.reduce((a, { name }, index) => {
				const newName = index < (attributes.length - 1) ? `${name}, ` : name;
				return a.concat(newName);
			}, '');
		}
		return '';
	}

	function getSales({ additionalInformation }) {
		if (additionalInformation && additionalInformation.attributes
			&& additionalInformation.attributes.length > 0) {
			return additionalInformation.attributes.reduce((a, { name, attributeDetail }, index) => {
				const nameAttribute = attributeDetail.map(p => p.name).join(',');
				const newName = index < (additionalInformation.attributes.length - 1) ? `${name} ` : name;
				return a.concat(`${newName}: (${nameAttribute})`);
			}, '');
		}
		return '';
	}

	function getPrice(product) {
		const { priceList } = product;
		const user = helper.getLocalData('admin-user');
		const idPriceList = user.salPriceList.id;
		if (this.idCommerce) {
			return priceList && priceList[this.selectedPriceList] ?
				priceList[this.selectedPriceList].price : 0;
		} else if (this.priceListId) {
			const l = priceList[this.priceListId] ? priceList[this.priceListId].price : 'S/P';
			return priceList ? l : null;
		} else if (priceList) {
			const l = priceList[idPriceList] ? priceList[idPriceList].price : 0;
			return priceList ? l : 0;
		}
		return 0;
	}

	function getAmountWithDiscount(product) {
		const { priceList } = product;
		const { salPriceList } = this.$userInfo;
		if (this.idCommerce) {
			const price = priceList && priceList[this.selectedPriceList] ?
				priceList[this.selectedPriceList].price : 0;
			const discount = priceList && priceList[this.selectedPriceList] ?
				priceList[this.selectedPriceList].discount : 0;
			const percentageDiscount = discount / 100;
			return twoDecimals(price * percentageDiscount) || 0;
		} else if (priceList) {
			const price = priceList[salPriceList.id] ? priceList[salPriceList.id].price : 0;
			const discount = priceList[salPriceList.id] ? priceList[salPriceList.id].discount : 0;
			const percentageDiscount = discount / 100;
			return twoDecimals(price * percentageDiscount) || 0;
		}
		return 0;
	}

	function getStock({ typeInfo, stock, stockVirtual, type }) {
		const { code: typeCode } = typeInfo || {};
		if (type === 5) {
			return stockVirtual;
		}
		return typeCode !== 'servicios' ? stock : '-';
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

	function getColorStatus(product) {
		if (this.isMibodega && this.idCommerce) {
			if (product.isPublic && !product.flagActive) {
				return 'warning';
			} else if (product.isPublic) {
				return 'success';
			}
			return 'error';
		}
		return product.flagActive ? 'success' : 'error';
	}

	function getTextStatus(product) {
		if (this.isMibodega && this.idCommerce) {
			if (product.isPublic && !product.flagActive) {
				return 'Inactivo en producto maestro';
			} else if (product.isPublic) {
				return 'Activo';
			}
			return 'Inactivo';
		}
		return product.flagActive ? 'Activo' : 'Inactivo';
	}

	function textButtonProduct({ productParentId }) {
		if (productParentId) {
			return 'No es posible crear variaciones desde un producto hijo';
		}
		return 'Agregar Variaciones';
	}

	export default {
		name: 'cms-table-products',
		components: {
			appTable,
			documentState,
		},
		computed: {
			showActions,
		},
		data() {
			return {
				reviewStatusData: {
					// 1. Revision, 2. Reportado, 3. Aprobado, 4. Rechazado
					1: {
						color: 'warning',
						text: 'Revision',
					},
					2: {
						color: 'orange',
						text: 'Reportado',
					},
					3: {
						color: 'primary',
						text: 'Aprobado',
					},
					4: {
						color: 'error',
						text: 'Rechazado',
					},
				},
			};
		},
		methods: {
			getAmountWithDiscount,
			getAttributes,
			getSales,
			getPrice,
			getStock,
			productTypeVariant,
			statusInWord,
			getColorStatus,
			getTextStatus,
			textButtonProduct,
		},
		props: {
			idCommerce: {
				type: [Number, String],
			},
			checkAll: {
				default: false,
				type: Boolean,
			},
			columns: {
				default: () => [],
				type: Array,
			},
			currentPage: [Number, String],
			isClean: {
				default: false,
				type: Boolean,
			},
			lastPage: [Number, String],
			masterProducts: {
				default: () => [],
				type: Array,
			},
			priceListId: [Number, String],
			selectedPriceList: {
				default: 0,
				type: Number,
			},
			showColumnActions: {
				default: false,
				type: Boolean,
			},
			valueType: [Number, String],
			totalItems: [Number, String],
			totalItemsVisible: [Number, String],
			disabledSearch: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.options-menu {
		width: 20px;

		button {
			width: 20px;
		}
	}
</style>
