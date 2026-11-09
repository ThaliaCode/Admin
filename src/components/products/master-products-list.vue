<template>
	<div class="mt-4">
		<app-table
			name="master-products"
			class="is-not-selectable"
			auto-focus
			:check-all="checkAll"
			:clean-search="isClean"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			include-filter
			:items-quantity="totalItemsVisible"
			:items-total-quantity="totalItems"
			:disabled-search="disabledSearch"
			input-width="250px"
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
				<td v-show="showRow(columns, 2)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.inlineAlternateCode || '-' }}
				</td>
				<td v-show="showRow(columns, 4)">
					<v-tooltip top>
						<span slot="activator">
							{{ productTypeVariant(props.row).typeSiglas }}
						</span>
						<span>
							{{ productTypeVariant(props.row).typeName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 5)">
					<span v-if="$route.params.commerceId">
						{{ getAttributes(props.row) || '-' }}
					</span>
					<span v-else>
						{{ getSales(props.row) }}
					</span>
				</td>
				<td v-show="showRow(columns, 6)">
					<v-layout>
						<v-flex text-xs-center xs10>
							{{ props.row.name }}
						</v-flex>
						<v-flex text-xs-right v-if="props.row.flagLoyalti === 1">
							<v-tooltip top>
								<button
									type="button"
									slot="activator"
									@click="$emit('open-dialog', props.row)"
								>
									<img
										src="/static/icon/icon-acum-point.svg"
										alt="icono-acumular-puntos"
									/>
								</button>
								<span>Acumula Puntos</span>
							</v-tooltip>
						</v-flex>
						<document-state
							v-if="props.row.flagControlSerie"
							img="/static/img/product-serie.svg"
							:tooltip="'Producto con serie'"
							height="13"
						/>
						<app-tooltip-button
							v-if="props.row.flagLotsEnabled"
							img="/static/img/product-lot.svg"
							text="Producto tipo lote"
							height="13"
							@click-icon="$emit('view-lot', props.row)"
						/>
					</v-layout>
				</td>
				<td v-show="showRow(columns, 7)">
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
				<td v-show="showRow(columns, 8)">
					<span v-if="props.row.category">
						{{ props.row.category.name }}
					</span>
				</td>
				<td v-show="showRow(columns, 9)">
					<span v-if="props.row.subCategory">
						{{ props.row.subCategory.name }}
					</span>
				</td>
				<td v-show="showRow(columns, 10)">
					<span v-if="props.row.categoriesEcommerce">
						{{ props.row.categoriesEcommerce }}
					</span>
				</td>
				<td v-show="showRow(columns, 11)">
					{{ props.row.weigth }}
				</td>
				<td v-show="showRow(columns, 12)">
					<span>{{ (props.row.unit && props.row.unit.name) || '-' }}</span>
				</td>
				<td v-show="showRow(columns, 13)" class="pl-3">
					<span v-html="props.row.description"> </span>
				</td>
				<td v-show="showRow(columns, 14)">{{ props.row.order }}</td>
				<td v-show="showRow(columns, 15)">
					{{ getAmountWithDiscount(props.row) }}
				</td>
				<td v-show="showRow(columns, 16)">{{ getPrice(props.row) }}</td>
				<td v-show="showRow(columns, 17)">{{ getStock(props.row) }}</td>
				<td v-show="showRow(columns, 18)">{{ props.row.stockReserved }}</td>
				<td v-show="showRow(columns, 19)">{{ props.row.lastCost }}</td>
				<td v-show="showRow(columns, 20)">{{ props.row.totalCost }}</td>
				<td v-show="showRow(columns, 21)" class="pl-3">
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
				</td>
				<td v-show="showRow(columns, 22)">
					<document-state
						:color="getColorStatus(props.row)"
						icon="radio_button_checked"
						:tooltip="getTextStatus(props.row)"
						@click-state="$emit('change-state', props.row)"
					/>
					<document-state
						:img="
							props.row.flagSales === 1
								? '/static/img/sale-state-active.svg'
								: '/static/img/sale-state-inactive.svg'
						"
						:tooltip="`${statusInWord(props.row.flagSales)} para la venta`"
						height="16"
					/>
				</td>
				<td
					v-show="showRow(columns, 23)"
					:style="props.row.flagAvgCost === 1 ? 'color: #2abca4' : 'color: #f40029'"
				>
					{{ props.row.flagAvgCost === 1 ? 'Sí' : 'No' }}
				</td>
				<td v-show="showRow(columns, 24)">
					{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
				</td>
				<td v-show="showRow(columns, 25)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 26)">
					{{ calculateUtilityPercentage(props.row) }}
				</td>
				<td v-show="showRow(columns, 27)">
					<v-layout row wrap align-center justify-center>
						<app-tooltip-button
							v-if="$userInfo.codeTypeRol != 'MAKI_VENDOR' && $userInfo.flagAdmin !== 0"
							class="table-icon mr-2"
							height="21"
							color="primary"
							icon="mode_edit"
							text="Editar Producto"
							@click-icon="$emit('edit-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							class="mr-2"
							text="Eliminar"
							color="pink"
							icon="delete"
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
							class="mr-2"
							icon="dashboard_customize"
							:text="textButtonProduct(props.row)"
							@click-icon="$emit('variants-product', props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							height="17"
							class="mr-2"
							img="/static/img/icon-features.svg"
							text="Agregar Caraterísticas"
							@click-icon="$emit('table-action', { item: props.row, code: 'CF' })"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.type === 1 || props.row.type === 6"
							height="22"
							class="mr-2"
							icon="manage_search"
							text="Visualizar Stock"
							@click-icon="$emit('view-stock', { item: props.row, code: 'VS' })"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="showPriceHistory"
							height="22"
							class="mr-2"
							icon="currency_exchange"
							text="Historial de cambios de precio"
							@click-icon="
								$emit('price-change', {
									id: props.row.id,
									priceSelected: getPrice(props.row),
									code: 'HSP',
								})
							"
						></app-tooltip-button>
						<app-tooltip-button
							class="mr-2"
							text="Ver listas de precio"
							color="green"
							icon="price_change"
							@click-icon="$emit('view-price-list', props.row)"
						/>
						<app-tooltip-button
							icon="history"
							text="Historial de compras"
							class="mr-2"
							@click-icon="$emit('open-history-products', props.row)"
						></app-tooltip-button>
					</v-layout>
				</td>
				<td v-if="showActions" v-show="showRow(columns, 20)">
					<app-tooltip-button
						v-if="props.row.type !== 2"
						class="table-icon"
						:img="`${$imageUrl}/kardex.svg`"
						text="Kardex"
						@click-icon="$emit('go-to-kardex', props.row)"
					></app-tooltip-button>
					<v-menu
						offset-x
						left
						:nudge-left="10"
						attach
						content-class="options-menu-content"
						class="options-menu"
					>
						<v-btn
							class="ma-0"
							color="transparent"
							depressed
							icon
							:ripple="false"
							slot="activator"
						>
							<v-icon size="18" color="primary" text="Ver más"> more_vert </v-icon>
						</v-btn>
						<v-list>
							<v-list-tile
								@click="$emit('table-action', { item: props.row, code: 'VP' })"
							>
								<v-list-tile-title>
									<v-tooltip left>
										<img
											slot="activator"
											src="/static/img/icon-variations.svg"
											class="align-img"
										/>
										<span>variaciones de producto</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
							<v-list-tile
								@click="$emit('table-action', { item: props.row, code: 'CF' })"
							>
								<v-list-tile-title>
									<v-tooltip left>
										<img
											slot="activator"
											src="/static/img/icon-features.svg"
											class="align-img"
											height="15"
										/>
										<span>agregar caraterísticas</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
							<v-list-tile
								@click="
									$emit('table-action', {
										item: props.row,
										code: 'product-taxes',
									})
								"
							>
								<v-list-tile-title>
									<v-tooltip left>
										<img
											slot="activator"
											src="/static/img/icon-taxes.svg"
											class="align-img"
										/>
										<span>ver impuestos</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
						</v-list>
					</v-menu>
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

async function created() {
	this.showPriceHistory = this.$userInfo.company.settings.flagAuditService;
}

function statusInWord(value) {
	return value ? 'Activo' : 'Inactivo';
}

function showActions() {
	const columnActionsIndex = this.columns.findIndex((c) => c.name === 'Acciones-extras');
	return columnActionsIndex > -1 && this.showColumnActions;
}

function getAttributes({ attributes }) {
	if (attributes && attributes.length > 0) {
		return attributes.reduce((a, { name }, index) => {
			const newName = index < attributes.length - 1 ? `${name}, ` : name;
			return a.concat(newName);
		}, '');
	}
	return '';
}

function getSales({ additionalInformation }) {
	if (
		additionalInformation &&
		additionalInformation.attributes &&
		additionalInformation.attributes.length > 0
	) {
		return additionalInformation.attributes.reduce(
			(a, { name, attributeDetail }, index) => {
				const nameAttribute = attributeDetail.map((p) => p.name).join(',');
				const newName =
					index < additionalInformation.attributes.length - 1 ? `${name} ` : name;
				return a.concat(`${newName}: (${nameAttribute})`);
			},
			''
		);
	}
	return '';
}

function getPrice(product) {
	const { priceList } = product;
	const user = helper.getLocalData('admin-user');
	const idPriceList = user.salPriceList.id;
	if (this.idCommerce) {
		return priceList && priceList[this.selectedPriceList]
			? priceList[this.selectedPriceList].price
			: 0;
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
		const price =
			priceList && priceList[this.selectedPriceList]
				? priceList[this.selectedPriceList].price
				: 0;
		const discount =
			priceList && priceList[this.selectedPriceList]
				? priceList[this.selectedPriceList].discount
				: 0;
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
		const varSiglas =
			varNameSplit.length > 1
				? varNameSplit.reduce((a, vn) => a.concat(vn.split('')[0]), '')
				: varNameSplit[0].split('')[0];
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
			return 'Publico';
		}
		return 'No Publico';
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
	name: 'master-products-list',
	created,
	components: {
		appTable,
		documentState,
	},
	computed: {
		showActions,
	},
	methods: {
		getAmountWithDiscount,
		getAttributes,
		getSales,
		getPrice,
		getStock,
		calculateUtilityPercentage(product) {
			let salePrice = this.getPrice(product) || 0;
			if (isNaN(salePrice)) salePrice = 0;
			const totalCost = product.totalCost || 0;
			if (!totalCost) return '-';
			const profitUlt = salePrice - totalCost;
			const percentageProfitUlt = (profitUlt / totalCost) * 100 || 0;
			return `${percentageProfitUlt.toFixed(2)} %`;
		},
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
