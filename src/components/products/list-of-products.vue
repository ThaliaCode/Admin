<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				toda la información listado de productos almacen`"
		/>
		<header-page
			:clean-disabled="onLoadData"
			:columns="columns"
			:excel-loading="loadingExcel"
			name="products"
			:open-on-click="!!params.warehouses"
			:options="optionsExcel"
			:rows="dataSelected"
			:show-excel="false"
			show-excel-menu
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
			@click-menu="clickMenu"
			@emit-excel="emitExcel"
			exportToPdfList
			:options-amortizations="reportsProducts"
			@download-dispatch-list="downloadProductsList"
		>
			<v-btn @click="inventoryColumns(0)" color="primary">
				{{ inventoryModeText }}
			</v-btn>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter>
			<v-layout row wrap align-end mt-3>
				<v-flex xs2 pr-2>
					<v-layout>
						<v-flex xs2>
							<v-tooltip top>
								<v-btn
									slot="activator"
									class="general-filter-button ma-0"
									:disabled="!warehouse"
									@click.native="goToMinStock"
									block
								>
									<v-icon>transfer_within_a_station</v-icon>
								</v-btn>
								<span>Solicitar productos con stock mínimo por almacén</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs10 pl-2>
							<v-select
								:items="warehouses"
								v-model="warehouse"
								label="Almacén"
								item-text="name"
								item-value="id"
								hide-details
								autocomplete
								single-line
								return-object
								class="filter-select"
								content-class="filter-select-content"
								@input="filterRows"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs2 pr-2>
					<categories-autocomplete
						:is-multiple="true"
						multiple
						:label="`Categoría`"
						:item="category"
						:items="categories"
						item-text="name"
						:slot-custom="true"
						item-value="id"
						:disabled="!params.warehouses"
						@return-data="filterRowsCategories"
					></categories-autocomplete>
				</v-flex>
				<v-flex xs2 pr-2>
					<v-select
						:items="brands"
						v-model="brand"
						label="Marca"
						item-text="name"
						single-line
						autocomplete
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						@input="filterRows"
						:disabled="!params.warehouses"
					></v-select>
				</v-flex>
				<v-flex xs2 pr-2>
					<app-select
						:item="params.flagActive"
						label="Filtrar por Estado"
						item-text="name"
						item-value="code"
						model="flagActive"
						:items="typeProducts"
						@input="setDataActive"
					></app-select>
				</v-flex>
				<v-flex xs2 pr-2>
					<v-btn
						type="button"
						class="general-filter-button"
						:disabled="valuesCategories.length > 0 || !params.warehouses"
						@click="openModal(featuresAction)"
					>
						Características
						<v-icon>add</v-icon>
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto relative mt-5">
			<div :class="{ 'opacity-warehouse': !params.warehouses }">
				<p :class="[!params.warehouses ? 'text-opacity' : 'none']">
					Escoge un almacén para visualizar la información
				</p>
			</div>
			<app-table
				name="products"
				ref="productTable"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				include-filter
				:key-value="keyValue"
				local-storage
				padding="px-4"
				selectable
				:check-all="checkAll"
				:last-page="lastPage"
				:clean-search="isClean"
				:items-quantity="data.length"
				:items-total-quantity="itemsTotalQuantity"
				:disabled-search="disabledSearch"
				@on-toggle-columns="toggleColumns"
				@on-search-event="onSearch"
				@on-page="changePage"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@table-option-event="openModal"
				@column-input="columnInput"
				@on-column-sortable="columnSortable"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.inlineAlternateCode || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">
						<v-layout>
							<v-flex text-xs-center xs10>
								{{ props.row.name }}
							</v-flex>
							<app-tooltip-button
								v-if="props.row.flagLotsEnabled"
								img="/static/img/product-lot.svg"
								text="Producto tipo lote"
								height="13"
								@click-icon="viewLot(props.row)"
							/>
							<app-tooltip-button
								v-if="props.row.flagControlSerie"
								img="/static/img/product-serie.svg"
								text="Producto con serie"
								height="13"
							/>
						</v-layout>
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.categoryName }}</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.subCategory ? props.row.subCategory.name : '' }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.inlineFeatures }}</td>
					<td v-show="showRow(columns, 9)">
						<template v-if="props.row.description">
							<template v-if="props.row.description.length > 100">
								<v-tooltip top>
									<span slot="activator">
										{{ props.row.description | limitTo(100) }}
									</span>
									<span>{{ props.row.description }}</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ props.row.description }}
							</template>
						</template>
						<template v-else>
							{{ props.row.description }}
						</template>
					</td>
					<td v-show="showRow(columns, 10)">
						<div
							@click="viewLot(props.row)"
							v-if="props.row.flagLotsEnabled"
							class="boton"
						>
							Ver Ubicaciones
						</div>
						<v-text-field
							v-else
							class="filter-select shadow-inset"
							v-model="props.row.location"
							single-line
							@click.stop="stopClick"
							hide-details
							type="text"
							@keyup.enter="updateLocation(props.row)"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 11)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 12)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 13)">
						<span v-if="$userInfo.company.settings.flagKardexValued">
							{{ props.row.cost | round }}
						</span>
						<span v-else>
							{{ props.row.lastCost | round }}
						</span>
					</td>
					<td v-show="showRow(columns, 14)">
						{{ props.row.totalCost | round }}
					</td>
					<td v-show="showRow(columns, 15)">
						<v-text-field
							label="00"
							type="number"
							v-model.number="props.row.quantity"
							single-line
							hide-details
							@click.stop="stopClick"
							class="filter-select shadow-inset-table"
							@input="updateQuantity(props.row)"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 16)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 17)">{{ props.row.stockReserved }}</td>
					<td v-show="showRow(columns, 18)">{{ props.row.minStock }}</td>
					<td v-show="showRow(columns, 19)">{{ props.row.stockVirtual }}</td>
					<td v-show="showRow(columns, 20)">{{ props.row.unitCode }}</td>
					<td v-show="showRow(columns, 21)">
						<document-state
							:color="props.row.flagActiveWarProduct === 1 ? 'success' : 'error'"
							:tooltip="statusInWord(props.row)"
							@click-state="inactiveAction(props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 22)">
						<small
							:class="[
								'table-icon',
								props.row.flagSales === 1 ? 'success-style' : 'error-style',
							]"
						>
							{{ statusInWordForSale(props.row) }}
						</small>
					</td>
					<td v-show="showRow(columns, 23)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 24)">
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
								width="195px"
								height="195px"
								:src="props.row.urlImage"
							/>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 25)">{{ props.row.weigth }}</td>
					<td v-show="showRow(columns, 26)">
						<app-tooltip-button
							v-if="$userInfo.codeTypeRol != 'MAKI_VENDOR' && $userInfo.flagAdmin !== 0"
							class="table-icon"
							height="21"
							color="primary"
							icon="mode_edit"
							text="Editar Producto"
							@click-icon="goToEditProduct(props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.type !== 2"
							class="table-icon"
							height="20"
							color="primary"
							icon="inventory"
							text="Visualizar Kardex"
							@click-icon="goToKardex(props.row)"
						></app-tooltip-button>
						<app-tooltip-button
							class="table-icon"
							text="Eliminar"
							color="pink"
							icon="delete"
							@click-icon="deleteSingleProduct(props.row)"
						></app-tooltip-button>
						<v-menu
							offset-x
							left
							:nudge-left="10"
							attach
							content-class="options-menu-content"
							class="options-menu"
						>
							<v-btn color="transparent" slot="activator">
								<v-icon size="18" color="primary" text="Ver más"> more_vert </v-icon>
							</v-btn>
							<v-list>
								<!-- <v-list-tile @click="openModalSidebar(props.row, 'VP')">
									<v-list-tile-title>
										<v-tooltip left>
											<img slot="activator" :src="`${$imageUrl}/icon-variations.svg`" class="align-img">
											<span>variaciones de producto</span>
										</v-tooltip>
									</v-list-tile-title>
								</v-list-tile> -->
								<v-list-tile @click="openModalSidebar(props.row, 'MS')">
									<v-list-tile-title>
										<v-tooltip left>
											<v-icon slot="activator" color="primary">add_circle_outline</v-icon>
											<span>agregar stock mínimo</span>
										</v-tooltip>
									</v-list-tile-title>
								</v-list-tile>
								<v-list-tile @click="openModalSidebar(props.row, 'CF')">
									<v-list-tile-title>
										<v-tooltip left>
											<v-icon slot="activator" color="primary"
												>check_circle_outline</v-icon
											>
											<span>agregar caraterísticas</span>
										</v-tooltip>
									</v-list-tile-title>
								</v-list-tile>
								<v-list-tile @click="openModalSidebar(props.row, 'product-taxes')">
									<v-list-tile-title>
										<v-tooltip left>
											<v-icon slot="activator">view_list</v-icon>
											<span>ver impuestos</span>
										</v-tooltip>
									</v-list-tile-title>
								</v-list-tile>
								<!-- <v-list-tile @click="cloneProduct(props.row)">
									<v-list-tile-title>
										<v-tooltip left>
											<v-icon slot="activator">copyright</v-icon>
											<span>clonar producto</span>
										</v-tooltip>
									</v-list-tile-title>
								</v-list-tile> -->
							</v-list>
						</v-menu>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:is-loading="loading"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="cancelModal(false)"
		>
			<fast-register
				v-if="isActionCode('product-register', 'new-services')"
				:actionCode="action.code"
				@on-register="loadData"
				@cancel-modal="cancelModal"
			/>
			<fast-products-action
				v-if="isActionCode('quick-quotation', 'quick-sale')"
				:data-selected="dataSelected"
				:page-code="action.code"
				@cancel-modal="cancelModal"
			/>
			<filter-by
				v-show="isActionCode('filter-by')"
				:types="params.types"
				:categories="categories"
				:categories-selected="params.categories"
				:clean="isClean"
				show-categories
				@filter-by-event="onFilterBy"
				@cancel-modal="cancelModal"
			/>
			<filter-features
				v-if="isActionCode('filter')"
				:sections="features"
				@cancel-modal="cancelModal"
				@filter-by-features="onFilterByFeatures"
			/>
			<products-transfer
				v-if="isActionCode('TM')"
				:columns="columnsToTransfer"
				:products="dataSelected"
				:warehouse-origin-id="params.warehouses"
				:filtered-products="filteredProducts"
				@cancel-modal="cancelModal"
				@transfer-product="clearSelectedProducts"
				@close-dialog-return="closeDialogReturn"
			/>
			<prices-list-set
				v-if="action.code === 'price-list'"
				:base-price-computed="basePriceComputed"
				:base-price-used="basePriceUsed"
				:is-loading="disabledModal"
				:prices-lists="pricesListsSlide"
				:product="productPriceListSet"
				@accept-button="onAcceptPriceList"
				@set-price-list-data="setPriceListData"
				@cancel-button="cancelModal"
				@toogle-open="toogleOpen"
			></prices-list-set>
			<!-- <price-list
				v-if="isActionCode('price-list')"
				:products="dataSelected"
				@cancel-modal="cancelModal"
				@update-product-prices="loadData(currentPage)"
			/> -->
			<minimum-stock
				v-if="isActionCode('MS')"
				:product="productSelected"
				@cancel-modal="cancelModal(false)"
				@config-minimum-stock="configMinStock"
			/>
			<features-config
				v-if="isActionCode('CF')"
				:categories="categories"
				:product="productSelected"
				@cancel-modal="cancelModal(false)"
				@config-features="configFeatures"
			/>
			<product-variations
				v-if="isActionCode('VP')"
				:product="productSelected"
				@cancel-modal="cancelModal(false)"
			/>
			<products-taxes-list
				v-if="isActionCode('product-taxes')"
				:rows="productTaxes"
				@close="cancelModal(false)"
			/>
			<products-price-cost
				v-if="isActionCode('update-price-cost')"
				:loading="loadingPrice || $v.rowSelected.priceCost.alpha"
				:price-cost="rowSelected.priceCost"
				@set-data="setPriceCost"
				@save="updatePriceCost"
				@close="cancelModal(false)"
			/>
			<edit-price-utility
				v-if="isActionCode('edit-price-utility')"
				:columns="columnsEdit"
				:rows="rowsUtility"
				:model="modelUtility"
				:types="types"
				:show-flag-kardex-valued="showFlagKardexValued"
				@column-input="columnInputTotal"
				@percentage-utility="percentageUtilityRow"
				@cancel="cancelModal"
				@edit-utility="editPriceforUtility"
				@set-price-list="setPriceList"
				@set-amount="setAmount"
			/>
		</action-sidebar>
		<v-dialog persistent v-model="dialogmodalLotes" max-width="610px">
			<modal-lotes-sales
				v-if="dialogmodalLotes"
				ref="modalLotList"
				:isProduct="$route.name === 'list-of-products'"
				:product-data="lotProduct"
				@close-modal-lotes="closeLots"
			/>
		</v-dialog>
		<v-dialog v-model="inactive" max-width="500px">
			<modal-items
				v-if="inactive"
				name-cancel="Cerrar"
				name-action="Aceptar"
				:title="`${productStatusWord} Producto Almacén`"
				show-slot
				@close-modal="cancelInactive"
				@action-modal="applyAction"
			>
				<div class="pa-3">
					¿Esta seguro que desea <b>{{ productStatusWord }}</b> este producto en el
					almacén?
					<p class="mt-2">
						Producto: {{ currentProduct.name }} ({{ currentProduct.code }}) -
						{{ currentProduct.warehouseName }} - {{ currentProduct.brandName }}
					</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialog" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center ma-0">
							¿Está seguro que desea actualizar el precio de los siguientes
							productos?
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text class="py-0">
					<v-list dense class="price-confirm-list" style="max-height: 250px; overflow-y: auto;">
						<v-list-tile v-for="product in dataSelected" :key="product.id">
							<v-list-tile-avatar>
								<v-icon color="grey darken-1" size="18">label_outline</v-icon>
							</v-list-tile-avatar>
							<v-list-tile-content>
								<v-list-tile-title>{{ product.name }}</v-list-tile-title>
							</v-list-tile-content>
						</v-list-tile>
					</v-list>
				</v-card-text>
				<v-card-actions class="px-5">
					<v-layout d-flex justify-space-between px-4 py-2>
						<v-btn
							class="btn-action mr-1"
							color="pink"
							:disabled="loading"
							type="button"
							@click="() => setValueDialog(false)"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							class="btn-action ml-1"
							color="success"
							:disabled="loading"
							type="button"
							@click="registerPrice"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<template v-if="currentProduct && currentProduct.flagActiveWarProduct">
			<!-- si esta activo -->
			<simple-modal
				:open="showModalDeleteSingle"
				@close="toggleModalDeleteSingle"
				textCancel="Eliminar"
				@cancel="onPermanentlyDelete(currentProduct.id)"
				textConfirm="Desactivar"
				@confirm="onChangeActive"
			>
				<span slot="title"
					>¿Desea <b class="warning_text">eliminar</b> permanentemente el siguiente
					producto del almacén <b>{{ currentProduct.warehouseName }}</b
					>?</span
				>
				<span slot="subtitle">{{
					currentProduct ? `"${currentProduct.name}"` : ''
				}}</span>
				<span slot="message"
					>Ten en cuenta que la <b>eliminación</b> de un producto solo es posible si no ha
					tenido ningún movimiento de stock o inventario asociado, y esto, hará que se
					elimine permanentemente el producto de todos los almacenes. Por otro lado,
					puedes <b class="success--text">DESACTIVAR</b> el producto si este ya cuenta con
					movimientos (recuerda que esta acción solo inhabilitará al producto).</span
				>
			</simple-modal>
		</template>
		<template v-else-if="currentProduct && !currentProduct.flagActiveWarProduct">
			<!-- si esta desactivado -->
			<simple-modal
				:open="showModalDeleteSingle"
				@close="toggleModalDeleteSingle"
				textCancel="Cancelar"
				@cancel="toggleModalDeleteSingle"
				textConfirm="Aceptar"
				@confirm="onPermanentlyDelete(currentProduct.id)"
			>
				<span slot="title"
					>¿Desea <b class="warning_text">eliminar</b> permanentemente el siguiente
					producto del almacén <b>{{ currentProduct.warehouseName }}</b
					>?</span
				>
				<span slot="subtitle">{{
					currentProduct ? `"${currentProduct.name}"` : ''
				}}</span>
				<span slot="message"
					>Ten en cuenta que la <b>eliminación</b> de un producto solo es posible si no ha
					tenido ningún movimiento de stock o inventario asociado, y esto, hará que se
					elimine permanentemente el producto de todos los almacenes.</span
				>
			</simple-modal>
		</template>
	</div>
</template>

<script>
import { alpha } from 'vuelidate/lib/validators';
import lib from '@/shared/lib';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import BasePrice from '@/shared/basePrice';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import documentState from '@/components/shared/document-state';
import fastProductsAction from '@/components/shared/product/fast-products-action';
import fastRegister from '@/components/shared/product/fast-register';
import featuresConfig from '@/components/shared/product/features-config';
import filterBy from '@/components/shared/product/filter-by';
import filterFeatures from '@/components/shared/product/filter-features';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import pricesListSet from '@/components/prices-list/prices-list-set';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import minimumStock from '@/components/shared/product/minimum-stock';
import PriceListClass from '@/shared/class/PriceListInstance';
import priceList from '@/components/products/price-list';
import productsMixin from '@/mixins/products-mixins';
import productsPriceCost from '@/components/products/products-price-cost';
import editPriceUtility from '@/components/products/edit-price-utility';
import productsTaxesList from '@/components/products/products-taxes-list';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import productsTransfer from '@/components/products/utils/products-transfer';
import productVariations from '@/components/shared/product/product-variations';
import modalLotesSales from '@/components/modal-lotes-sales';
import { LIST_PRODUCTS } from '../../shared/reports';

const { setNewProperty, getDeeper, compose, isEmpty } = lib;
const { round } = lib;
const twoDecimals = round(2);

async function created() {
	if (helper.getLocalData('inventory-mode-on')) {
		this.warehouse = helper.getLocalData('warehouse-selected') ?? {};
		this.params.warehouses = this.warehouse?.id;
		this.inventoryColumns(1);
	}
	this.currentPage = helper.getLocalData('current-page') ?? 1;
	this.loadSalPrice();
	this.loadUnits();
	const paramsCat = { flagMain: 1, relationAdd: 'subCategories' };
	await this.filterData(paramsCat);
	this.loadFilters();
	if (this.params.warehouses) {
		this.loadData();
	} else if (this.warehouses.length === 1) {
		this.warehouse = { ...this.warehouses[0] };
		this.params.warehouses = this.warehouses[0].id;
		this.showModalInit = false;
		this.loadData();
	} else {
		this.showModalInit = true;
	}
	this.$bus.$on('new-quotation', () => {
		this.goTo('new-quotation');
	});
	this.$bus.$on('new-sale', () => {
		this.goTo('new-sale');
	});
	const localSelections = helper.getLocalData('products-selected') || [];
	const indexWarehouse = this.columns.findIndex((p) => p.value === 'warehouseName');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	const indexWarehouseTrasnfer = this.columnsToTransfer.findIndex(
		(i) => i.value === 'warehouseName'
	);
	this.columnsToTransfer[indexWarehouseTrasnfer].name = this.labelWarehouse();
	if (localSelections.length > 0) {
		this.dataSelected = localSelections.map(setNewProperty('isSelected', true));
	}
	this.columns[12].visible = this.$userInfo.roleCode === 'ADMIN' && !this.$userInfo.flagNotShowCostPrice;
	this.columns[12].checked = this.$userInfo.roleCode === 'ADMIN' && !this.$userInfo.flagNotShowCostPrice;
	this.columns[10].flagVisible = this.$userInfo.company.settings.flagWorkWithBatches;
	if (this.isWarehouse || this.$userInfo.flagNotShowCostPrice) {
		this.columns[12].flagVisible = true;
	}
	// Limpiar los query de la ruta
	const currentPath = this.$route.path;
	this.$router.replace({ path: currentPath });
}

function beforeDestroy() {
	this.$bus.$off('new-quotation');
	this.$bus.$off('new-sale');
}

function actionsDisabled() {
	const disabledByType = this.dataSelected.some((ds) => ds.type === 2);
	const disabledByWarehouse = !this.warehouse?.id || disabledByType;
	const disabled = !this.dataSelected.length || this.inventoryActive;
	const disabledTransfer = disabled || disabledByWarehouse;
	const disabledEntry = disabledTransfer;
	const disabledInventory = !this.inventoryActive || disabledByWarehouse;
	const disabledPriceCost = this.data.filter((d) => d.isSelected).length !== 1;
	const disabledEdit = this.dataSelected.length !== 1;
	const disabledComposition = !this.warehouse.id || this.dataSelected.length;
	const disabledActions = [
		{ code: 'TM', disabled: disabledTransfer },
		{ code: 'IM', disabled: disabledEntry },
		{ code: 'create-inventory', disabled: disabledInventory },
		{ code: 'quick-sale', disabled },
		{ code: 'quick-quotation', disabled },
		{ code: 'price-list', disabled },
		{ code: 'new-purchase', disabled },
		{
			code: 'update-price-cost',
			disabled:
				disabledPriceCost || this.$userInfo.company.settings.flagCalculateEarnings,
		},
		{ code: 'edit-product', disabled: disabledEdit },
		{ code: 'CP', disabled: disabledComposition },
		{
			code: 'edit-price-utility',
			disabled: disabled || this.$userInfo.company.settings.flagCalculateEarnings,
		},
	];
	return disabledActions;
}

async function loadSalPrice() {
	const response = await this.listPricingPromise();
	this.priceList = response.data;
}

async function loadUnits() {
	({ data: this.units } = await this.listOfUnits());
}

function allIsSelected(row) {
	this.checkAll = this.data.every((check) => check.isSelected);
	if (row.isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex((el) => el.id === row.id);
		this.dataSelected.splice(index, 1);
	}
}

async function applyAction() {
	const url = `v2/products/${this.currentProduct.id}/flag-active`;
	const body = {
		flagActive: !(this.currentProduct.flagActiveWarProduct === 1),
		warProductId: this.currentProduct.warProductId,
	};
	try {
		await this.$httpProducts.patch(url, body);
		this.showNotification('Producto actualizado de forma exitosa');
		this.inactive = false;
		this.currentProduct = {};
		this.productStatusWord = '';
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function cancelInactive() {
	this.inactive = false;
	this.currentProduct = {};
	this.productStatusWord = '';
}

function cancelModal(value, from) {
	this.action.code = null;
	this.action.open = value;
	this.action.active = value;
	this.productTaxes = [];
	this.modelUtility.amount = null;
	this.$bus.$emit('is-loading', false);
	if (from !== 'features' || from !== 'price-list') {
		this.loadData();
	}
	this.pricesListsSlide = [];
}

function clearSelectedProducts() {
	this.data = this.data.map((p) => {
		const newP = { ...p };
		newP.isSelected = false;
		return newP;
	});
	this.dataSelected = [];
	helper.removeLocalData('products-selected');
}

function clickMenu() {
	if (!this.params.warehouses) {
		this.showNotification(
			'Es necesario seleccionar un almancén para realizar la descarga.',
			'info'
		);
	}
}

async function configFeatures(featuresArray) {
	const id = this.productSelected.id;
	const modelFeatures = {
		features: featuresArray,
	};
	try {
		await this.$httpProducts.patch(`products/${id}/features`, modelFeatures);
		this.showNotification('Se actualizarion las características.');
	} catch (err) {
		this.showGenericError();
	} finally {
		this.cancelModal(false);
	}
}

async function configMinStock(stock) {
	const id = this.productSelected.id;
	const modelSend = {
		type: this.productSelected.type,
		warehouseId: this.productSelected.warehouseId,
		brandId: this.productSelected.brandId,
		minStock: stock,
	};
	try {
		await this.$httpProducts.patch(`products/${id}/min-stock`, modelSend);
		this.showNotification('El stock mínimo se actualizó correctamente.');
	} catch (err) {
		this.showGenericError();
	} finally {
		this.cancelModal(false);
	}
}

function emitExcel(code) {
	if (this.params.warehouses) {
		if (code === 'features') {
			this.loadFeatures(true, null, 1);
		} else {
			const params = {
				search: this.params.search || undefined,
				flagUseSimpleBrand: this.$userInfo?.company?.settings?.flagUseSimpleBrand ?? false,
				minStock: this.params.minStock,
				typeView: this.params.typeView || undefined,
				flagActive: this.params.flagActive,
				sortField: this.params.sortField || undefined,
				sortDirection: this.params.sortDirection || undefined,
				brands: this.params.brands ? String(this.params.brands) : undefined,
				code: this.params.code || undefined,
				features: this.featuresReport.map((feature) => {
					const newRow = {};
					newRow.id = feature.id;
					newRow.name = feature.name;
					return newRow;
				}),
				withStock: this.params.withStock || undefined,
				withOutStock: this.params.withOutStock || undefined,
				withWeight: this.params.withWeight || undefined,
				categories: this.params.categories ? String(this.params.categories) : undefined,
				priceListId: this.$userInfo?.salPriceList?.id,
				warehouses: this.params.warehouses ? String(this.params.warehouses) : '',
				types: this.params.types || undefined,
				flagNewKardexV3: this.$userInfo?.company?.settings?.flagNewKardexV3 || undefined
			};
			if (code === 'featuresInline') {
				delete params.features;
			}
			const reporteName =
				code === 'featuresInline'
					? 'listado_de_productos_'
					: 'listado_de_productos_características_separadas_';
			this.onEmitExcel(LIST_PRODUCTS, reporteName, params);
		}
	} else {
		this.showNotification(
			'Es necesario seleccionar un almancén para realizar la descarga.',
			'info'
		);
	}
}

async function downloadProductsList(code) {
	const report = this.reportsProducts.find((r) => r.code === code);
	if (!this.warehouse?.id) {
		this.showGenericError('Seleccione un almacén para exportar el pdf.');
		return;
	}
	if (report) {
		let params;
		if (code === 'list-products-pdf') {
			params = {
				search: this.params.search || undefined,
				flagActive: this.params.flagActive,
				sortField: this.params.sortField,
				sortDirection: this.params.sortDirection,
				brandId: this.params.brands ? String(this.params.brands) : undefined,
				categories: this.params.categories || undefined,
				code: this.params.code || undefined,
				priceListId: this.$userInfo.salPriceList.id,
				warehouseId: this.params.warehouses ? String(this.params.warehouses) : undefined,
				withStock: this.params.withStock || undefined,
				withOutStock: this.params.withOutStock || undefined,
				withWeight: this.params.withWeight || undefined,
			};
		} else if (code === 'products-by-category-pdf') {
			const warehouse = this.warehouses.find((w) => w.id === this.params.warehouses);
			params = {
				brandId: this.params.brands ? this.params.brands : undefined,
				documentTypeName: warehouse?.subsidiary?.sucursalName,
				minStock: this.params.minStock || undefined,
				withStock: this.params.withStock || undefined,
				withWeight: this.params.withWeight || undefined,
				withOutStock: this.params.withOutStock || undefined,
				types: this.params.types ? this.params.types.split(',') : undefined,
				flagActive: this.params.flagActive,
				flagLotsEnabled: this.params.flagLotsEnabled || undefined,
				flagControlSerie: this.params.flagControlSerie || undefined,
				warehouseId: this.params.warehouses ? this.params.warehouses : undefined,
			};
		}
		this.onProductList(report, params);
	}
}

function loadFeaturesSlide(actionData) {
	this.loadFeatures(false, actionData);
}

function goToKardex({ brandId, id, warehouseId, warProductId }) {
	const routeName = 'page-new-kardex';
	const query = { warProductId };
	const routeData = this.$router.resolve({
		name: routeName,
		params: {
			brandId: brandId || 0,
			code: null,
			productId: id,
			warehouseId: warehouseId || 0,
		},
		query,
	});
	window.open(routeData.href, '_blank');
}

function goToMinStock() {
	this.goTo('min-stock', { params: { id: this.warehouse.id } });
}

function goToNextProduct(event, { warWarehouseProductBrandId }) {
	const rowIndex = this.data.findIndex(
		(r) => r.warWarehouseProductBrandId === warWarehouseProductBrandId
	);
	const { code } = event;
	if (rowIndex > -1) {
		const nextIndex = code === 'ArrowUp' ? rowIndex - 1 : rowIndex + 1;
		this.$nextTick(() => {
			const nextProd = this.data[nextIndex];
			if (nextProd) {
				const priceCostInput = this.$refs[`pc-${nextProd.warWarehouseProductBrandId}`];
				if (priceCostInput) {
					priceCostInput.focus();
				}
			}
		});
	}
}

function filterQuerys() {
	// const filt = ['warehouse', 'category', 'brand'];
	const filt = {
		warehouseId: this.warehouse?.id ?? null,
		categoryIds: Array.isArray(this.category)
			? this.category.map((e) => e.id).join(',')
			: null,
		brandId: this.brand?.id ?? null,
	};
	const query = {};
	Object.keys(filt).forEach((key) => {
		if (filt[key] !== undefined && filt[key] !== null && filt[key] !== '') {
			query[key] = filt[key];
		}
	});
	this.$router.replace({ query });
	return query;
}

function loadFilters() {
	const query = this.$route.query;
	if (query.warehouseId) {
		this.warehouse = this.warehouses.find((w) => w.id === Number(query.warehouseId));
		this.params.warehouses = Number(query.warehouseId);
	}
	if (query.brandId) {
		this.brand = this.brands.find((w) => w.id === Number(query.brandId));
		this.params.brands = Number(query.brandId);
	}
	if (query.categoryIds) {
		const ids = query.categoryIds.split(',').map(Number);
		this.category = this.categories.filter((c) => ids.includes(c.id));
		this.filterRowsCategories(this.category);
	}
}

function goToEditProduct({ id }) {
	const url = {
		name: 'edit-master-product',
		params: { id },
		query: {
			origin: 'products',
			...this.filterQuerys(),
		},
	};

	this.$router.push(url);
	// const routeData = this.$router.resolve({ query });
	// window.open(routeData.href, '_blank');
}

function inactiveAction(product) {
	this.currentProduct = { ...product };
	this.productStatusWord = product.flagActiveWarProduct === 1 ? 'DESACTIVAR' : 'ACTIVAR';
	this.inactive = true;
}

function inventoryColumns(flag) {
	this.inventoryActive = !this.inventoryActive;
	helper.setLocalData('inventory-mode-on', this.inventoryActive);
	if (this.inventoryActive && !flag && !this.warehouse?.id) {
		this.showNotification('Seleccione el almacén', 'warning');
	}
	if (this.inventoryActive && this.warehouse?.id) {
		helper.setLocalData('warehouse-selected', this.warehouse);
	}
	this.columns = this.columns.map((c) => {
		const newC = { ...c };
		if (newC.value === 'quantity') {
			newC.visible = this.inventoryActive;
			newC.checked = this.inventoryActive;
		}
		if (
			newC.value === 'alternateCode' ||
			newC.value === 'categories' ||
			newC.value === 'priceCost' ||
			newC.value === 'price' ||
			newC.value === 'minStock'
		) {
			newC.visible = !this.inventoryActive;
			newC.checked = !this.inventoryActive;
		}
		return newC;
	});
	if (this.inventoryActive) {
		this.data = this.data.map((d) => {
			const newD = { ...d };
			newD.quantity = 0;
			return newD;
		});
	}
}

function inventoryModeText() {
	return this.inventoryActive ? 'salir modo inventario' : 'Modo inventario';
}

function isActionCode(code, anotherCode) {
	const equalToCode = this.action.code === code;
	if (anotherCode) {
		return equalToCode || this.action.code === anotherCode;
	}
	return equalToCode;
}

async function loadData(page = 1) {
	this.loadingGeneral = true;
	this.disabledSearch = true;
	this.onLoadData = true;
	const priceListId = this.$userInfo?.salPriceList?.id;
	this.params.page = page;
	this.currentPage = page;
	this.params.categories = this.params.categories;
	this.params.relationAdd = 'category,subCategory,taxes';
	try {
		this.params.limit = 20;
		if (this.params.warehouses) {
			const response = await this.$httpProducts.get('v2/products', {
				params: this.params,
			});
			this.data = response.data.map((rowData) => {
				const newData = { ...rowData };
				newData.isSelected = false;
				newData.flagUse = Number(!newData.flagActiveWarProduct);
				newData.unitCode = rowData.unitCode || newData.unitName;
				if (rowData.priceList?.[priceListId]) {
					newData.price = rowData.priceList[priceListId].price;
					// newData.priceList[priceListId].units = rowData.priceList[priceListId].units
					// 	? this.setConversionFromProduct(rowData.priceList[priceListId].units) : [];
					newData.priceList[priceListId].ranges =
						rowData.priceList[priceListId].ranges?.length > 0
							? rowData.priceList[priceListId].ranges
							: [];
				} else {
					newData.price = 0;
					newData.priceList = {
						[priceListId]: {
							ranges: [],
						},
					};
				}
				if (this.dataSelected.length > 0) {
					if (!rowData.flagActiveWarProduct) {
						const index = this.dataSelected.findIndex(
							(p) => p.warProductId === rowData.warProductId
						);
						if (index > -1) {
							this.dataSelected.splice(index, 1);
						}
					}
					this.dataSelected = this.dataSelected.map((rowSelected) => {
						let newRow = { ...rowSelected };
						if (
							rowSelected.autoBarcode === rowData.autoBarcode &&
							rowSelected.warProductId === rowData.warProductId
						) {
							newData.isSelected = rowSelected.isSelected;
							newData.quantity = rowSelected.quantity;
							newData.product = {};
							newData.product.id = rowSelected.id;
							newData.product.taxes = [...rowSelected.taxes];
							newData.product.type = rowSelected.type;
							newRow = newData;
						}
						return newRow;
					});
				}
				// newData.pricesLists = this.getAndSetPricesList(rowData.priceList);
				return newData;
			});
			this.updateProductsInLocalStorage(this.dataSelected);
			this.lastPage = Number(response.headers['x-last-page']);
			this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		} else {
			this.data = this.dataNull;
		}
	} catch (err) {
		this.showNotification('Ocurrió un error al intentar cargar la data.', 'error');
	} finally {
		this.checkAll = this.data.every((d) => d.isSelected);
		this.isClean = false;
		this.onLoadData = false;
		this.loadingGeneral = false;
		this.disabledSearch = false;
	}
}

async function loadFeatures(validEmitExcel = true, actionData, flagSeparator) {
	const params = {};
	if (!validEmitExcel && this.params.warehouses) {
		params.subsidiaryId = this.warehouse?.subsidiaryId;
	}
	if (flagSeparator) {
		params.flagSeparator = flagSeparator;
	}
	params.categories = this.params.categories || undefined;
	try {
		({ data: this.featuresReport } = await this.$httpProducts.get('features', {
			params,
		}));
		if (validEmitExcel) {
			this.emitExcel();
		} else {
			this.features = [...this.featuresReport];
			this.features = this.features.map((feat) => {
				const newFeat = { ...feat };
				newFeat.features = feat.features.map((featFeature) => {
					const newFeatFeature = { ...featFeature };
					newFeatFeature.active = false;
					return newFeatFeature;
				});
				return newFeat;
			});
			this.action = { ...actionData };
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function getAndSetPricesList(productPriceList) {
	const self = this;
	const defaultPriceListId = this.$userInfo?.salPriceList?.id;
	const defaultPriceListName = this.$userInfo?.salPriceList?.name ?? '';
	const priceListDefault = [
		{
			discount: 0,
			id: defaultPriceListId,
			name: defaultPriceListName,
			open: true,
			ranges: [],
			salePrice: 0,
			tax: 0,
			unitPrice: 0,
			units: [],
			earnings: {},
		},
	];
	if (productPriceList && Object.keys(productPriceList).length) {
		return Object.keys(productPriceList).map((k) => {
			const index = this.priceList.findIndex((pl) => pl.id === Number(k));
			const newPriceList = {};
			if (index > -1) {
				newPriceList.id = Number(k);
				newPriceList.comissions = productPriceList[k].comissions || {};
				newPriceList.tax = productPriceList[k].taxes || 0;
				newPriceList.salePrice = productPriceList[k].price || 0;
				newPriceList.discount = productPriceList[k].discount || 0;
				newPriceList.unitPrice = productPriceList[k].unitPrice || 0;
				newPriceList.ranges = [...productPriceList[k].ranges] || [];
				newPriceList.units = productPriceList[k].units
					? this.transformUnitsToArray(productPriceList[k].units) || []
					: [];
				newPriceList.name = (self.priceList.find((pl) => pl.id === Number(k)) || {}).name;
				newPriceList.earnings = productPriceList[k].earnings || {};
				newPriceList.open = this.idListPriceCommerce
					? Number(k) === Number(self.idListPriceCommerce)
					: productPriceList[k].open || index === 0;
				newPriceList.show = this.idListPriceCommerce
					? Number(k) === Number(self.idListPriceCommerce)
					: true;
			}
			return newPriceList;
		});
	}
	return priceListDefault;
}

function transformUnitsToArray(unitsObject) {
	return Object.keys(unitsObject).map((k) => {
		const newUnits = { ...unitsObject[k] };
		newUnits.id = Number(k);
		newUnits.salePrice = unitsObject[k].price;
		newUnits.discount = unitsObject[k].discount || 0;
		newUnits.name = (this.units.find((c) => c.id === Number(k)) || {}).name;
		newUnits.tax = unitsObject[k].taxes || 0;
		newUnits.earnings = unitsObject[k].earnings || {};
		return newUnits;
	});
}

function updateProductsInLocalStorage(dataSelected) {
	let productsInLocal = helper.getLocalData('products-selected');
	if (!productsInLocal) {
		productsInLocal = [];
	}
	const productsInLocalLen = lib.isEmpty(productsInLocal) ? 0 : productsInLocal.length;
	const dataSelectedLen = dataSelected.length;
	if (productsInLocalLen !== dataSelectedLen) {
		const newProducts = [...productsInLocal];
		for (let i = 0; i < productsInLocalLen; i += 1) {
			const id = productsInLocal[i].warProductId;
			const index = dataSelected.findIndex((d) => d.warProductId === id);
			if (index === -1) {
				newProducts.splice(i, 1);
			}
		}
		helper.updateLocalStorage(
			`${process.env.STORAGE_USER_KEY}::products-selected`,
			newProducts
		);
	}
}

function onFilterBy(values, valuesCategories) {
	this.valuesCategories = valuesCategories;
	const valueAll = values.find((value) => value.id === 1);
	const valueTypeView = values.filter((value) => value.code === 'typeView');
	const valueTypes = values.filter((v) => v.code === 'types');
	this.params.typeView = null;
	this.params.withStock = null;
	this.params.withWeight = null;
	this.params.withOutStock = null;
	this.params.minStock = null;
	// this.params.flagActive = 1;
	this.params.categories = null;
	this.params.types = null;
	this.params.flagLotsEnabled = null;
	this.params.flagFlowManufactured = null;
	this.params.flagControlSerie = null;
	if (valueAll) {
		values.forEach((value) => {
			if (value.code && value.code !== 'typeView') {
				this.params[value.code] = value.value;
			}
		});
	} else if (valueTypeView.length > 1) {
		if (values.length !== valueTypeView.length) {
			values.forEach((value) => {
				Object.keys(this.params).forEach((key) => {
					if (key === value.code) {
						this.params[key] = value.value;
					}
				});
			});
			this.params.typeView = null;
		}
	} else {
		values.forEach((value) => {
			Object.keys(this.params).forEach((key) => {
				if (key === value.code) {
					this.params[key] = value.value;
				}
			});
		});
	}
	if (valuesCategories.length > 0) {
		this.category = null;
		this.params.categories = valuesCategories.join(',');
	}
	if (valueTypes.length) {
		this.params.types = valueTypes.map((v) => v.send).toString();
	}
	this.currentPage = 1;
}

function onFilterByFeatures(dataSelected) {
	this.featuresSelected = !this.searchData
		? dataSelected.join(',')
		: dataSelected.join(' ');
	this.callServiceAndSearch(this.searchData);
}

function openModal(value) {
	if (value.code === 'filter') {
		this.loadFeaturesSlide(value);
	} else {
		this.action = { ...value };
		this.action.width = value.code === 'filter-by' ? 500 : value.width;
	}
}

function openModalSidebar(product, code) {
	this.loading = true;
	if (code === 'CF') {
		const categoryByProduct = this.categories.find(
			(category) => category.id === product.categoryId
		);
		if (categoryByProduct.features.length > 0) {
			this.productSelected = product;
			this.action = { ...this.productOptions.find((fa) => fa.code === code) };
		} else {
			this.showNotification(
				'La categoría del producto no cuenta con características.',
				'primary'
			);
		}
	} else if (code === 'product-taxes') {
		this.productTaxes = product.taxes
			? product.taxes.map((tax) => {
					const newTax = { ...tax };
					const generalTaxes = helper.getLocalData('general-taxes');
					const generalTax =
						generalTaxes.find((gt) => gt.code === tax.codePercentage) || {};
					newTax.percentage = generalTax.percentage;
					return newTax;
			  })
			: [];
		this.action.title = product.name;
		this.action.width = 500;
		this.action.active = true;
		this.action.code = code;
		this.action.open = true;
	} else {
		this.productSelected = product;
		this.action = { ...this.productOptions.find((fa) => fa.code === code) };
		if (code === 'VP') {
			this.action.title = product.name;
		}
	}
	this.loading = false;
}

function rowIsSelected(row) {
	if (this.inventoryActive && row.quantity) {
		const index = this.data.findIndex(
			(d) =>
				d.id === row.id &&
				d.warProductId === row.warProductId &&
				d.brandId === row.brandId
		);
		this.data[index].isSelected = true;
	} else {
		({
			products: this.data,
			productsSelected: this.dataSelected,
			checkAll: this.checkAll,
		} = this.selectedRows(row, this.data, this.dataSelected));
		this.updateDataSelected();
	}
}

function runAction({ code, codeWeb, name }) {
	// this.$ga.event({
	// 	eventCategory: 'Productos',
	// 	eventAction: 'Acción rápida',
	// 	eventLabel: name,
	// 	eventValue: code,
	// });
	if (code === 'create-inventory') {
		const simpleProducts = this.dataSelected.filter((p) => p.type !== 6);
		const complexProducts = this.dataSelected.filter((p) => p.type === 6);
		
		if (complexProducts.length > 0) {
			const names = complexProducts.map((p) => p.name).join('\n');
			this.showNotification(
				`Se eliminaron los siguientes productos compuestos, ya que no está permitido incluirlos en el inventario:\n\n${names}`,
				'error'
			);
		}

		helper.setLocalData('products-selected', simpleProducts);
		helper.setLocalData('warehouse-selected', this.warehouse);
		this.goTo(codeWeb, { params: { selectedWarehouse: this.warehouse.id } });
	} else if (code === 'IM') {
		helper.setLocalData('products-selected', this.dataSelected);
		this.goTo(codeWeb, { query: { warehouseId: this.warehouse.id } });
	} else if (code === 'price-list') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 590;
		this.priceList = this.priceList.map((priceListNew, index) => {
			const newRow = {};
			newRow.id = priceListNew.id;
			newRow.name = priceListNew.name;
			newRow.discount = 0;
			newRow.show = true;
			newRow.open = index === 0;
			newRow.salePrice = 0;
			newRow.ranges = [];
			newRow.tax = 0;
			newRow.units = [];
			newRow.unitPrice = 0;
			newRow.earnings = {};
			return newRow;
		});
		const comissions = {
			type: null,
			amount: null,
			appliedTo: false,
		};
		this.pricesListsSlide = [...this.priceList];
		if (this.dataSelected.length === 1) {
			const arrayValue = this.getAndSetPricesList(this.dataSelected[0].priceList);
			this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
				const newPl = arrayValue.find((pl) => pl.id === pls.id);
				if (newPl) {
					return { ...newPl, comissions: newPl.comissions || {} };
				}
				const newC = {
					...pls,
					discount: 0,
					name: pls.name,
					price: 0,
					id: pls.id,
					ranges: [],
					salePrice: 0,
					tax: null,
					taxes: 0,
					unitPrice: 0,
					comissions: {},
					earnings: {},
				};
				return newC;
			});
			this.productPriceListSet = this.dataSelected[0];
			this.productPriceListSet.conversions = Object.keys(
				this.productPriceListSet.conversions
			).length
				? this.setConversionFromProduct(this.productPriceListSet.conversions)
				: [];
		} else {
			this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
				const newC = {
					...pls,
					comissions,
				};
				return newC;
			});
			this.productPriceListSet = { cost: 0 };
		}
		helper.setLocalData('products-selected', this.dataSelected);
	} else if (code === 'new-purchase') {
		helper.setLocalData('products-selected', this.dataSelected);
		this.goTo('purchases-new', { params: { origin: 'products' } });
	} else if (code === 'edit-product' || code === 'edit-master-product') {
		const params = {
			id: this.dataSelected[0].id,
		};
		const query = {
			origin: 'products',
		};
		this.goTo('edit-master-product', { params, query });
	} else if (code === 'CP') {
		const { id: warehouseId, name: warehouseName } = this.warehouse;
		this.goTo('page-composite-products-new', {
			query: { warehouseId, warehouseName },
		});
	} else if (code === 'TM') {
		this.action = {
			code: 'TM',
			title: name,
			open: true,
			width: 800,
		};
	} else if (code === 'edit-price-utility') {
		this.action = {
			code: 'edit-price-utility',
			title: 'Editar precio por Utilidad',
			open: true,
			width: 680,
		};
		this.showFlagKardexValued = this.$userInfo.company.settings.flagKardexValued;
		this.rowsUtility = this.dataSelected.map((p) => {
			const newRow = { ...p };
			const findTaxes = p.taxes.find(
				(e) => e.codePercentage === '02' || e.codePercentage === '03'
			);
			newRow.originalPriceCost = p.price || 0;
			newRow.priceCost = this.modelUtility.calculate === 'ultCost' ? p.lastCost : p.cost;
			newRow.priceCostIgv = findTaxes
				? newRow.priceCost
				: twoDecimals(newRow.priceCost * Number(`1.${this.labelsByCountry.percentage}`));
			newRow.priceSale = twoDecimals(p.price) || 0;
			newRow.priceUnit = findTaxes
				? newRow.priceSale
				: twoDecimals(p.price / Number(1.18)) || 0;
			newRow.utility = newRow.priceUnit - newRow.priceCost;
			newRow.percentageUtility =
				newRow.priceCost > 0 ? twoDecimals((newRow.utility / newRow.priceCost) * 100) : 0;
			return newRow;
		});
	} else {
		this.action.code = code;
		this.action.title = name;
		this.action.width = code === 'new-services' ? 500 : 620;
		if (code === 'quick-sale') {
			this.action.width = 840;
		}
		if (code === 'update-price-cost') {
			this.rowSelected = this.dataSelected[0];
			this.action.title = this.rowSelected.name;
			this.action.width = 300;
		}
		this.action.open = true;
		helper.setLocalData('products-selected', this.dataSelected);
	}
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
	helper.setLocalData('products-selected', this.dataSelected);
}

function statusInWord({ flagActiveWarProduct }) {
	return flagActiveWarProduct === 1 ? 'ACTIVO' : 'DESACTIVADO';
}

function statusInWordForSale({ flagSales }) {
	return flagSales === 1 ? 'ACTIVO' : 'DESACTIVADO';
}

function stopClick() {
	return false;
}

function toggleColumns() {
	return true;
}

function updateQuantity(row) {
	this.dataSelected = this.dataSelected.map((d) => {
		const newD = { ...d };
		if (
			row.id === newD.id &&
			row.warProductId === newD.warProductId &&
			row.brandId === newD.brandId
		) {
			newD.quantity = row.quantity;
		}
		return newD;
	});
	if (this.inventoryActive) {
		this.data = this.data.map((d) => {
			const newData = { ...d };
			if (
				row.id === newData.id &&
				row.warProductId === newData.warProductId &&
				row.brandId === newData.brandId
			) {
				if (!newData.isSelected) {
					newData.isSelected = true;
					this.dataSelected.push(row);
				}
			}
			return newData;
		});
		this.updateDataSelected();
	}
}

async function updatePriceCost() {
	this.loadingPrice = true;
	const { code, warWarehouseProductBrandId, priceCost } = this.rowSelected;
	try {
		await this.$httpProducts.patch(`products/${warWarehouseProductBrandId}/price-cost`, {
			priceCost,
		});
		this.showNotification(`Precio de costo de ${code} actualizado correctamente`);
		this.cancelModal(false);
		helper.updateLocalStorage(`${process.env.STORAGE_USER_KEY}::products-selected`, [
			this.rowSelected,
		]);
	} catch (error) {
		if (error.status === 400) {
			this.showNotification('El precio de costo debe ser mayor a 0', 'error');
		}
	} finally {
		this.loadingPrice = false;
	}
}

function setPriceCost(price) {
	this.rowSelected.priceCost = price;
}

function validations() {
	return {
		rowSelected: {
			priceCost: { alpha },
		},
	};
}

function cloneProduct(product) {
	this.goTo('accounting-edit-product', {
		params: {
			id: product.warProductId,
			route: 'products',
		},
		query: {
			clone: true,
		},
	});
}

function columnInput({ event }) {
	this.params.customSearchField = 'inline_alternate_code';
	this.params.customSearchValue = event.target.value;
	this.loadData();
}

function columnInputTotal(value) {
	this.rowsUtility = this.rowsUtility.map((d) => {
		const newRow = { ...d };
		newRow.percentageUtility = value;
		newRow.priceSale =
			d.priceCost > 0 ? (value * Number(d.priceCost)) / 100 + Number(d.priceCost) : 0;
		newRow.utility = d.priceCost > 0 ? Number(newRow.priceSale) - d.priceCost : 0;
		return newRow;
	});
}

function onCleanData() {
	this.params = {
		page: null,
		brandId: null,
		brands: null,
		categories: [],
		code: null,
		typeView: null,
		withStock: null,
		withWeight: null,
		withOutStock: null,
		types: '6,1,3',
		sortField: null,
		sortDirection: null,
		flagActive: 1,
	};
	if (this.warehouses.length === 1) {
		this.warehouse = { ...this.warehouses[0] };
		this.params.warehouses = this.warehouses[0].id;
	} else {
		this.params.warehouses = null;
		this.warehouse = 0;
	}
	this.featuresSelected = null;
	this.valuesCategories = [];
	this.brand = 0;
	this.category = [];
	this.isClean = true;
	helper.removeLocalData('products::search');
	helper.removeLocalData('accounting-products-selected');
	helper.removeLocalData('warehouse-selected');
	this.callServiceAndSearch();
	this.clearSelectedProducts();
	const colInput = this.columns.find((c) => c.value === 'alternateCode');
	this.showModalInit = true;
	this.$set(colInput, 'showInput', false);
	// Limpiar los query de la ruta
	const currentPath = this.$route.path;
	this.$router.replace({ path: currentPath });
}

async function updateLocation({ id, brandId, warehouseId, location }) {
	const body = {
		brandId,
		warehouseId,
		location: String(location),
	};
	if (location !== '') {
		try {
			await this.$httpProducts.patch(`/products/${id}/location`, body);
			this.showNotification('Se actualizó correctamente');
			this.loadData();
		} catch (error) {
			this.showGenericError();
		}
	} else {
		this.showNotification('Ingresar locación', 'warning');
	}
}

function updateDataSelected() {
	this.dataSelected = this.dataSelected.map((product) => {
		const newProduct = { ...product };
		newProduct.product = {};
		newProduct.product.autoBarcode = product.autoBarcode;
		newProduct.product.code = product.code;
		newProduct.product.codeProductCubso = product.codeProductCubso;
		newProduct.product.description = product.description;
		newProduct.product.id = product.id;
		newProduct.product.inlineFeatures = product.inlineFeatures;
		newProduct.product.name = product.name;
		newProduct.product.price = product.price;
		newProduct.product.taxes = product.product?.taxes
			? [...product.product.taxes]
			: [...(product.taxes ?? [])];
		newProduct.product.type = product.type;
		newProduct.product.weigth = product.weigth;
		newProduct.traceability = { origin: this.$route.name };
		return newProduct;
	});
	helper.setLocalData('products-selected', this.dataSelected);
}

function closeDialogInit() {
	this.showModalInit = false;
}

function returnModal() {
	this.action = {
		open: false,
		active: false,
		title: '',
	};
}

function closeDialogReturn(productsWithStock) {
	const dataToLocalStorage = JSON.stringify(productsWithStock);
	localStorage.setItem(
		`${process.env.STORAGE_USER_KEY}::translate-product`,
		dataToLocalStorage
	);
	this.action = {
		code: null,
		open: false,
		title: '',
	};
}

async function editPriceforUtility() {
	const body = {
		salPriceListId: this.modelUtility.priceListId,
		productsPriceSale: this.rowsUtility.map((row) => {
			const newRow = {
				productId: row.id,
				unitPrice: twoDecimals(row.priceSale / Number(1.18)),
				priceSale: twoDecimals(row.priceSale),
			};
			newRow.taxes = twoDecimals(row.priceSale - newRow.unitPrice);
			return newRow;
		}),
		warehousesId: [this.params.warehouses],
		flagEditAll: false,
		flagEditModule: 2,
	};
	try {
		await this.$httpProducts.patch('products/price-sale/multiple', body);
		this.showNotification('Se acción se realizo correctamente.');
		this.cancelModal();
	} catch (error) {
		this.showGenericError();
	}
}

function percentageUtilityRow(row, value) {
	const index = this.rowsUtility.findIndex((p) => p.code === row.code);
	if (index > -1) {
		this.rowsUtility[index].percentageUtility = twoDecimals(value);
		this.rowsUtility[index].priceUnit =
			row.priceCost > 0
				? (value * Number(row.priceCost)) / 100 + Number(row.priceCost)
				: 0;
		this.rowsUtility[index].priceSale =
			Number(this.rowsUtility[index].priceUnit) *
			Number(`1.${this.labelsByCountry.percentage}`);
		this.rowsUtility[index].utility = this.rowsUtility[index].priceUnit - row.priceCost;
	}
}

function setPriceList(model, value) {
	this.modelUtility[model] = value.id;
	this.rowsUtility = this.rowsUtility.map((o) => {
		const newRow = { ...o };
		const priceListSelected = o.priceList[value.id];
		// newRow.originalPriceCost = o.price || 0;
		newRow.originalPriceCost = priceListSelected ? priceListSelected.price : o.price;
		newRow.priceSale = priceListSelected ? priceListSelected.price : 0;
		newRow.priceCost = this.modelUtility.calculate === 'ultCost' ? o.lastCost : o.cost;
		newRow.priceCostIgv = twoDecimals(
			newRow.priceCost * Number(`1.${this.labelsByCountry.percentage}`)
		);
		newRow.priceUnit = twoDecimals(newRow.priceSale / Number(1.18)) || 0;
		newRow.utility = newRow.priceUnit - Number(newRow.priceCost);
		newRow.percentageUtility = o.priceCost
			? twoDecimals((newRow.utility / o.priceCost) * 100)
			: 0;
		return newRow;
	});
}

function setAmount(type, value, model) {
	if (model === 'amount') {
		this.modelUtility.amount = Number(value);
	} else {
		this.modelUtility.percentage = Number(value);
	}
	this.rowsUtility = this.rowsUtility.map((p) => {
		const newRow = { ...p };
		newRow.priceCost =
			this.modelUtility.calculate === 'ultCost' ? p.lastCost : p.cost || 0;
		if (model === 'amount') {
			if (type === 1) {
				newRow.priceSale = newRow.originalPriceCost - Number(value);
			} else if (type === 2) {
				newRow.priceSale = newRow.originalPriceCost + Number(value);
			} else {
				newRow.priceSale = Number(value);
			}
			newRow.priceUnit =
				newRow.priceSale / Number(`1.${this.labelsByCountry.percentage}`);
		} else if (model === 'percentage') {
			const percentage = Number(value / 100);
			if (type === 1) {
				newRow.priceSale =
					p.originalPriceCost - twoDecimals(p.originalPriceCost * percentage);
			} else {
				newRow.priceSale =
					p.originalPriceCost + twoDecimals(p.originalPriceCost * percentage);
			}
			newRow.priceUnit =
				newRow.priceSale / Number(`1.${this.labelsByCountry.percentage}`);
		}
		newRow.utility = newRow.priceUnit - newRow.priceCost;
		newRow.percentageUtility =
			newRow.priceCost > 0 ? twoDecimals((newRow.utility / newRow.priceCost) * 100) : 0;
		return newRow;
	});
}

function columnSortable(col) {
	const newColumn = { ...col };
	newColumn.isSortable.down = !col.isSortable.down;
	newColumn.isSortable.up = !col.isSortable.up;
	this.columns = this.columns.map((c) => {
		const newCol = { ...c };
		if (c.isSortable) {
			newCol.isSortable.up = newColumn.isSortable.up;
			newCol.isSortable.down = newColumn.isSortable.down;
		}
		return newCol;
	});
	this.params.sortField = newColumn.isSortable.value;
	this.params.sortDirection = newColumn.isSortable.up ? 'asc' : 'desc';
	this.loadData();
}

function filterRowsCategories(value) {
	this.params.categories = value.join(',');
	this.loadData();
}

function onSearch(searchValue) {
	const searchTrim = searchValue ? searchValue.trim() : null;
	this.params.search = searchTrim;
	this.loadData();
}

function basePriceUsed() {
	return getDeeper('company', 'settings', 'flagBasePriceDefault')(this.$userInfo);
}

function basePriceComputed() {
	return BasePrice;
}

function toogleOpen(priceListIndex) {
	const openValue = !this.pricesListsSlide[priceListIndex].open;
	this.$set(this.pricesListsSlide[priceListIndex], 'open', openValue);
}

function setPriceListData(priceListUpdated, index) {
	const itemProduct = this.dataSelected[0];
	if (itemProduct && itemProduct.taxes) {
		const PriceList = new PriceListClass(
			priceListUpdated,
			this.basePriceUsed,
			this.basePriceComputed,
			itemProduct.taxes
		);
		const pricesListUpdateUpdated = compose(
			setNewProperty('salePrice', PriceList.price),
			setNewProperty('unitPrice', PriceList.unitPrice),
			setNewProperty('tax', PriceList.tax),
			setNewProperty('units', priceListUpdated.units ? PriceList.units : [])
		)(priceListUpdated);
		this.$set(this.pricesListsSlide, index, { ...pricesListUpdateUpdated });
	} else {
		this.$set(this.pricesListsSlide, index, { ...priceListUpdated });
	}
}

function formattedBody() {
	const products = this.dataSelected.map((e) => {
		const newBody = {
			brandId: e.brandId,
			id: e.id,
			warehouseId: e.warehouseId,
			priceList: this.buildPriceList(this.pricesListsSlide),
		};
		return newBody;
	});
	const objectToSend = {
		products,
	};
	return objectToSend;
}

function buildPriceList(pricesLists) {
	const filterPriceList = pricesLists.filter((p) => p.salePrice > 0);
	if (filterPriceList) {
		return filterPriceList.reduce((acum, pl) => {
			const newPl = { ...acum };
			if (pl.salePrice > 0 || pl.unitPrice > 0) {
				newPl[pl.id] = {};
				newPl[pl.id].price = pl.salePrice || 0;
				newPl[pl.id].unitPrice = pl.unitPrice || 0;
				newPl[pl.id].discount = pl.discount || 0;
				newPl[pl.id].ranges = pl.ranges ? [...pl.ranges] : [];
				newPl[pl.id].taxes = pl.tax || 0;
				newPl[pl.id].units = isEmpty(pl.units) ? {} : this.buildUnits(pl.units);
				newPl[pl.id].earnings = isEmpty(pl.earnings) ? undefined : pl.earnings;
				const comissions = isEmpty(pl.comissions) ? null : pl.comissions;
				if (comissions && comissions.type && comissions.amount) {
					newPl[pl.id].comissions = {
						...comissions,
						appliedTo: comissions.appliedTo || false,
					};
				} else {
					newPl[pl.id].comissions = undefined;
				}
			}
			return newPl;
		}, {});
	}
	return pricesLists;
}

function buildUnits(units) {
	let reduceUnits = {};
	if (units[0] && units[0].id) {
		reduceUnits = units.reduce((uAcum, unit) => {
			const newAcum = { ...uAcum };
			newAcum[unit.id] = {
				price: unit.salePrice || 0,
				unitPrice: unit.unitPrice || 0,
				discount: unit.discount || 0,
				ranges: unit.ranges ? [...unit.ranges] : [],
				taxes: unit.tax || 0,
				earnings: isEmpty(unit.earnings) ? undefined : unit.earnings,
			};
			return newAcum;
		}, {});
	}
	const newUnits = units[0] && units[0].id ? { ...reduceUnits } : { ...units } || {};
	return newUnits;
}

async function registerPrice() {
	this.disabledModal = true;
	this.dialog = false;
	const body = this.formattedBody();
	try {
		await this.$httpProducts.patch('v2/products/prices', body);
		this.cancelModal(false);
		this.showNotification('Éxito al registar los datos');
		this.loadData();
		this.isClean = true;
		this.clearSelectedProducts();
		this.params.search = '';
	} catch (error) {
		this.showGenericError();
	} finally {
		this.disabledModal = false;
	}
}

function setValueDialog(val) {
	this.dialog = val;
}

function onAcceptPriceList() {
	if (this.dataSelected.length > 1) {
		this.setValueDialog(true);
	} else {
		this.registerPrice();
	}
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 500,
		},
		arrayProducts: [],
		dialog: false,
		columns: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
				isSortable: { down: true, value: 'code', up: false },
			},
			{
				id: 3,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Otros códigos',
				value: 'alternateCode',
				visible: false,
				checked: false,
				isEditable: true,
				showInput: false,
			},
			{
				id: 5,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
				isSortable: { down: true, value: 'name', up: false },
			},
			{
				id: 6,
				name: 'Categorias',
				value: 'categories',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Subcategorias',
				value: 'subcategories',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Características',
				value: 'inlineFeatures',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Ubicación',
				value: 'location',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Marca',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 12,
				name: 'P. venta',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'P. Unit',
				value: 'price',
				visible: false,
				checked: false,
				tooltip: 'Precio Unitario',
			},
			{
				id: 14,
				name: 'P. Costo',
				value: 'cost',
				visible: !this.$userInfo.flagNotShowCostPrice,
				checked: !this.$userInfo.flagNotShowCostPrice,
				tooltip: 'Precio Unitario + IGV',
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 15,
				name: 'Conteo',
				value: 'quantity',
				visible: false,
				checked: false,
			},
			{
				id: 16,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
				isSortable: { down: true, value: 'stock', up: false },
			},
			{
				id: 17,
				name: 'Stock Reserv.',
				value: 'stockReserved',
				visible: false,
				checked: false,
				tooltip: 'Stock Reservado',
			},
			{
				id: 18,
				name: 'S. Min.',
				value: 'minStock',
				tooltip: 'Stock Mínimo',
				visible: true,
				checked: true,
			},
			{
				id: 19,
				name: 'S. Vir.',
				value: 'stockVirtual',
				tooltip: 'Stock Virtual',
				visible: false,
				checked: false,
			},
			{ id: 20, name: 'Und.', value: 'unitCode', visible: true, checked: true },
			{ id: 21, name: 'Estado', value: 'status', visible: true, checked: true },
			{
				id: 22,
				name: 'Edo. Venta',
				value: 'flagSales',
				visible: true,
				checked: true,
			},
			{
				id: 23,
				name: 'Marca',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 24,
				name: 'Imagen',
				value: 'urlImage',
				visible: false,
				checked: false,
			},
			{
				id: 25,
				name: 'Peso',
				value: 'weigth',
				visible: false,
				checked: false,
			},
			{
				id: 26,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		columnsEdit: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Costo Unit',
				value: 'name',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'P. Costo', value: 'name', visible: true, checked: true },
			{
				id: 5,
				name: 'P. Unitario',
				value: 'name',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'P. venta', value: 'name', visible: true, checked: true },
			{
				id: 7,
				name: '% Util',
				value: 'name',
				visible: true,
				checked: true,
				isEditable: true,
			},
		],
		columnsToTransfer: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Caracteristicas',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Categoria',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Kg',
				value: 'weigth',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
				isEditable: true,
				showInput: false,
			},
			{
				id: 12,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentProduct: {},
		currentProductId: null,
		data: [
			{
				id: 1,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 2,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 3,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 4,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 5,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 6,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 7,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 8,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 9,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 10,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
		],
		dataNull: [
			{
				id: 1,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 2,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 3,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 4,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 5,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 6,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 7,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 8,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 9,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
			{
				id: 10,
				warehouseName: '',
				code: '',
				autoBarcode: '',
				alternateCode: '',
			},
		],
		disabledModal: false,
		disabledSearch: false,
		filteredProducts: [],
		features: [],
		featuresAction: {
			active: true,
			code: 'filter',
			open: true,
			title: 'CARACTERÍSTICAS',
			width: 543,
		},
		featuresReport: [],
		filterFeaturesClick: false,
		idListPriceCommerce: null,
		helpActions: [],
		helpItems: [],
		itemsTotalQuantity: 0,
		inactive: false,
		inventoryActive: false,
		loadingGeneral: false,
		loading: false,
		loadingPrice: false,
		modelUtility: {
			amount: null,
			selectHeader: 'amount',
			priceListId: null,
			typeSelect: 1,
			percentage: null,
			calculate: 'ultCost',
		},
		onLoadData: false,
		optionsExcel: [
			{
				id: 1,
				code: 'featuresInline',
				name: 'Características Agrupadas',
			},
			{
				id: 2,
				code: 'features',
				name: 'Características Separadas',
			},
		],
		reportsProducts: [
			{
				id: 1,
				code: 'list-products-pdf',
				originName: 'listado_de_products_',
				name: 'Reporte de productos',
			},
			{
				id: 2,
				code: 'products-by-category-pdf',
				originName: 'listado_de_stock_',
				name: 'Reporte de stock por categoria',
			},
		],
		newProduct: {
			pricesLists: [],
		},
		params: {
			flagActive: 1,
			types: '6,1,3',
		},
		priceList: [],
		pricesListsSlide: [],
		productOptions: [
			{
				active: true,
				code: 'VP',
				open: true,
				title: 'AGREGAR VARIACIONES',
				width: 620,
			},
			{
				active: true,
				code: 'MS',
				open: true,
				title: 'STOCK MÍNIMO',
				width: 440,
			},
			{
				active: true,
				code: 'CF',
				open: true,
				title: 'AGREGAR CARACTERÍSTICAS',
				width: 500,
			},
		],
		priceListObject: {
			discount: 0,
			name: '',
			ranges: [],
			salePrice: 0,
			tax: null,
			units: [],
			unitPrice: 0,
		},
		productStatusWord: '',
		productSelected: {},
		productTaxes: [],
		types: [
			{
				id: 1,
				name: 'Disminuir',
				value: 1,
				show: true,
			},
			{
				id: 2,
				name: 'Aumentar',
				show: true,
				value: 2,
			},
			{
				id: 3,
				name: 'Reemplazar',
				show: true,
				value: 3,
			},
		],
		rowsUtility: [],
		rowSelected: {},
		showModalInit: true,
		showFeatures: false,
		showFlagKardexValued: false,
		valuesCategories: [],
		showModalDeleteSingle: false,
		dialogmodalLotes: false,
		lotProduct: {},
		productPriceListSet: {},
		typeProducts: [
			{
				id: 1,
				code: 0,
				name: 'No Activo',
			},
			{
				id: 2,
				code: 1,
				name: 'Activo',
			},
		],
	};
}

export default {
	name: 'list-of-products',
	beforeDestroy,
	components: {
		actionSidebar,
		appTable,
		appActions,
		documentState,
		fastProductsAction,
		fastRegister,
		featuresConfig,
		filterBy,
		filterFeatures,
		generalFilter,
		editPriceUtility,
		headerPage,
		pricesListSet,
		minimumStock,
		modalItems,
		priceList,
		productsPriceCost,
		productsTaxesList,
		productsTransfer,
		productVariations,
		simpleModal,
		modalLotesSales,
		categoriesAutocomplete,
	},
	computed: {
		actionsDisabled,
		basePriceComputed,
		basePriceUsed,
		inventoryModeText,
	},
	created,
	data,
	methods: {
		allIsSelected,
		applyAction,
		buildPriceList,
		buildUnits,
		cancelInactive,
		cancelModal,
		clearSelectedProducts,
		clickMenu,
		closeDialogInit,
		cloneProduct,
		closeDialogReturn,
		configFeatures,
		configMinStock,
		columnSortable,
		columnInputTotal: helper.debounce(columnInputTotal),
		columnInput: helper.debounce(columnInput),
		downloadProductsList,
		emitExcel,
		editPriceforUtility,
		getAndSetPricesList,
		formattedBody,
		goToKardex,
		goToEditProduct,
		goToMinStock,
		goToNextProduct,
		filterRowsCategories,
		inactiveAction,
		inventoryColumns,
		isActionCode,
		loadData,
		loadFeatures,
		loadFeaturesSlide,
		loadSalPrice,
		loadUnits,
		returnModal,
		onCleanData,
		onFilterBy,
		onFilterByFeatures,
		onSearch,
		openModal,
		openModalSidebar,
		percentageUtilityRow,
		// priceListFormatting,
		registerPrice,
		setValueDialog,
		onAcceptPriceList,
		rowIsSelected,
		runAction,
		setAmount: helper.debounce(setAmount, 1000),
		selectedAll,
		setPriceCost,
		setPriceList,
		setPriceListData,
		statusInWord,
		statusInWordForSale,
		stopClick,
		transformUnitsToArray,
		toggleColumns,
		toogleOpen,
		updatePriceCost,
		updateQuantity,
		updateLocation,
		updateDataSelected,
		updateProductsInLocalStorage,
		filterQuerys,
		loadFilters,
		setDataActive({ model, value }) {
			if (value) {
				this.params[model] = value.code;
				this.loadData();
			}
		},
		async onPermanentlyDelete(id) {
			try {
				const body = {
					productsId: [id],
				};
				try {
					await this.$httpProducts.delete('products/delete/multiple', {
						data: body,
					});
					this.showNotification('La acción se realizo correctamente');
					this.loadData();
				} catch (err) {
					if (err.status === 400) {
						if (err.data.message === 'USER_NO_ACCESS') {
							this.showGenericError('No tiene permisos para realizar esta acción.');
						} else if (err.data.message === 'USER_NO_ACCESS') {
							this.showGenericError(
								'Usted no cuenta con permisos para realizar esta acción.'
							);
						} else if (err.data.message === 'PRODUCT_CANNOT_DELETED') {
							this.showGenericError(
								'Solo se puede eliminar productos que no tengan movimientos de stock o inventario'
							);
						}
					} else {
						this.showGenericError();
					}
				}
				this.showModalDeleteSingle = false;
			} catch (error) {
				this.showGenericError();
			}
		},
		changePage(page) {
			this.currentPage = page;
			this.loadData(page);
		},
		toggleModalDeleteSingle() {
			this.showModalDeleteSingle = !this.showModalDeleteSingle;
		},
		deleteSingleProduct(product) {
			this.currentProduct = { ...product };
			this.toggleModalDeleteSingle();
		},
		onChangeActive() {
			this.applyAction();
			this.showModalDeleteFisic = false;
			this.showModalDeleteSingle = false;
		},
		viewLot(row) {
			this.lotProduct = row;
			this.dialogmodalLotes = true;
		},
		closeLots() {
			this.dialogmodalLotes = false;
		},
		setConversionFromProduct(conversions) {
			const conversionsFromProduct = conversions
				? Object.keys(conversions).map((k) => {
						const newConversions = { ...conversions[k] };
						newConversions.id = Number(k);
						return newConversions;
				  })
				: [];
			return [].concat(conversionsFromProduct);
		},
	},
	mixins: [productsMixin],
	validations,
};
</script>

<style lang="scss" scoped>
.options-menu {
	button {
		box-shadow: none;
		margin: 0px;
		min-width: auto;

		&:hover {
			background-color: transparent;
		}
	}
}

.align-img {
	vertical-align: middle;
}

.price-cost {
	background-color: white;
	text-align: right;
	width: 60px;
}

.success-style {
	color: color(success);
}

.error-style {
	color: color(error);
}

.opacity-warehouse {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 15%;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 2;
}

.text-opacity {
	background-color: white;
	border: solid 3px color(primary);
	border-style: dashed;
	color: #828282;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0 auto;
	max-width: 405px;
	padding: 28px 33px;
}
.relative {
	position: relative;
}

.none {
	display: none !important;
}
.warning_text {
	color: red;
}

.boton {
	color: color(primary);
}

.boton:hover {
	cursor: pointer;
}
</style>
