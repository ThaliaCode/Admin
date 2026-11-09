<template>
	<div class="cms-category-detail">
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
				el listado de próductos maestros."
		/>
		<header-page
			btns-column="xs3"
			:title="category.name ? category.name : 'Lista de products'"
			:showExcel="false"
			:showClean="false"
			to-show
			:open-on-click="true"
		>
			<router-link :to="`/cms/product`">
				<v-btn color="primary" class="btn-auto my-0 mr-0 pa-1" rounded>
					Crear producto
				</v-btn>
			</router-link>
			<router-link :to="`/cms/units`">
				<v-btn color="primary" class="btn-auto my-0 mr-0 pa-1" rounded>
					Lista de unidades
				</v-btn>
			</router-link>
			<router-link :to="`/cms/brands`">
				<v-btn color="primary" class="btn-auto my-0 mr-0 pa-1" rounded>
					Lista de marcas
				</v-btn>
			</router-link>
		</header-page>
		<v-layout row wrap align-end my-3 px-5>
			<v-flex xs2 ml-2>
				<app-select
					:item="params.cmsBrandId"
					:items="brands"
					item-text="name"
					item-value="id"
					label="Marca"
					model="cmsBrandId"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					:item="params.cmsUnitId"
					:items="units"
					item-text="name"
					item-value="id"
					label="Unidades"
					model="cmsUnitId"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					:item="params.reviewStatus"
					:items="listReviewStatus"
					item-text="desc"
					item-value="id"
					label="Estado de revision"
					model="reviewStatus"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2> </v-flex>
			<v-flex xs2 ml-2>
				<v-btn
					color="primary"
					class="btn-auto my-0 mr-0 pa-1"
					rounded
					@click="openChangeCategory"
				>
					Cambiar categoria
				</v-btn>
			</v-flex>
		</v-layout>

		<cms-table-products
			:check-all="checkAll"
			:value-type="params.typeId"
			:columns="columns"
			:current-page="currentPage"
			:is-clean="isClean"
			:id-commerce="commerceId"
			:disabled-search="disabledSearch"
			:last-page="lastPage"
			:master-products="masterProducts"
			:total-items="totalItems"
			:total-items-visible="totalItemsVisible"
			:selected-price-list="selectedPriceList"
			:price-list-id="priceListIdTable"
			@clone-product="cloneProduct"
			@edit-product="editProduct"
			@change-show-catalog="changeShowCatalog"
			@change-state="onChangeState"
			@column-input="onColumnInput"
			@delete-product="deleteProductOne"
			@go-to-kardex="goToKardex"
			@on-page="loadData"
			@search-event="searchEvent"
			@table-action="tableAction"
			@table-option-event="tableOptionEvent"
			@variants-product="loadChildren"
			@open-dialog="openDialogCancel"
			@on-column-sortable="columnSortable"
			@lot-product="addLotProduct"
			@view-stock="viewStockSlide"
			@all-selected="allSelected"
			@row-selected="rowSelected"
		></cms-table-products>
		<!-- {{ dataSelected.map(({ code }) => code) }} -->
		<!-- {{ selectedPriceList }} -->
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:value="action.open"
			@close-modal="closeModal"
		>
			<v-layout row wrap class="pa-4" v-if="action.code === 'CU'">
				<v-flex xs12 mb2 class="title-section">
					<span>CONVERSIONES</span>
				</v-flex>
				<v-flex xs6 pr-2 mb-3>
					<v-btn
						class="primary px-2 py-1 mt-1"
						small
						type="button"
						@click="addRow('conversions')"
					>
						<span>Agregar conversiones</span>
						<v-icon class="ml-2 product-add-btn-icon" color="" size="17">
							add_circle
						</v-icon>
					</v-btn>
				</v-flex>
				<v-flex xs6 pr-2 mb-3>
					<v-btn
						class="primary px-2 py-1 mt-1"
						small
						type="button"
						@click="loadDefaultsConversions"
					>
						<span>Convers. de unidad</span>
						<v-icon class="ml-2 product-add-btn-icon" color="" size="17">
							import_export
						</v-icon>
					</v-btn>
				</v-flex>
				<v-flex> </v-flex>
				<v-flex
					xs12
					mb-2
					pb-1
					class="conversions-container"
					text-xs-center
					v-for="(conversion, indexConversion) in conversionsProduct"
					:key="indexConversion"
				>
					<v-layout align-center>
						<v-flex xs11>
							<cms-unit-conversion
								class="unit-conversion"
								:units="filteredUnits"
								:conversion="conversion"
								:selected-unit="currentUnit"
								@set-conversion="setConversion($event, indexConversion)"
							/>
						</v-flex>
						<v-flex xs1 align-center>
							<app-tooltip-button
								color="pink"
								height="30"
								icon="delete"
								text="Eliminar conversión"
								@click-icon="removeConversion(conversion, indexConversion)"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<section class="modal-filter-footer">
						<modal-sidebar-button
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="confirAction"
						/>
					</section>
				</v-flex>
			</v-layout>
			<v-layout row wrap class="pa-4" v-if="action.code === 'RS'">
				<v-flex xs12 mb2 class="title-section">
					<h3>REPORTES</h3>
				</v-flex>
				<v-flex mt-3 xs12 v-if="!reportsProduct || !reportsProduct.length">
					<span> No hay reportes </span>
				</v-flex>
				<v-flex mt-3 xs12>
					<accordion
						v-for="(report, idx) in reportsProduct"
						:key="idx"
						:title="report.name"
					>
						<cms-reporter
							class="reporter"
							:report="report"
							@set-report="setReport($event, idx)"
						>
							<app-tooltip-button
								color="pink"
								height="30"
								icon="delete"
								text="Eliminar reporte"
								@click-icon="removeReport(report, idx)"
							></app-tooltip-button>
						</cms-reporter>
					</accordion>
					<!-- <v-layout
						style="border: 1px red solid"
						mb-3
						v-for="(report, idx) in reportsProduct"
						:key="idx"
					>

						<v-flex xs12>
							<cms-reporter
								class="reporter"
								:report="report"
								@set-report="setReport($event, idx)"
							>
								<app-tooltip-button
									color="primary"
									height="30"
									icon="delete"
									text="Eliminar reporte"
									@click-icon="removeReport(report, idx)"
								></app-tooltip-button>
							</cms-reporter>
						</v-flex>
					</v-layout> -->
				</v-flex>
				<v-flex>
					<section class="modal-filter-footer">
						<modal-sidebar-button
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="confirAction"
						/>
					</section>
				</v-flex>
			</v-layout>
			<v-layout row wrap class="pa-4" v-if="action.code === 'CC'">
				<!-- <v-flex xs12 mb2 class="title-section">
					<h3>CAMBIAR CATEGORIAS</h3>
				</v-flex> -->
				<v-flex mt-3 xs12> </v-flex>
				<v-flex mt-6 xs12 class="title-section">
					<span>Escoja la nueva categoria</span>
				</v-flex>
				<v-flex mt-3 xs12 v-if="!newCategoryToChange">
					<label class="caption red--text">
						Seleccione la nueva categoria
					</label>
				</v-flex>
				<v-flex xs7 mt-3>
					<app-select
						item-text="name"
						item-value="id"
						:items="allCategories"
						label="Categorías"
						model="cmsCategoryId"
						:slotFormat="true"
						@input="setNewCategoryToChange"
					>
					</app-select>
				</v-flex>
				<v-flex mt-4 xs12 class="title-section">
					<span>Elija los productos actualizar</span>
				</v-flex>
				<v-flex mt-4 xs6 px-2>
					<label class="caption">¿Desea actualizar todos los productos?</label>
				</v-flex>

				<v-flex xs5 mt-4 px-2>
					<v-switch
						color="primary"
						disable
						v-model="changeAllCategories"
					></v-switch>
				</v-flex>
				<v-flex mt-4 xs12 px-2 v-if="!changeAllCategories">
					<label class="">
						Tienen {{ dataSelected.length }} productos seleccionados</label
					>
				</v-flex>
				<v-flex mt-5 pt-5 xs12>
					<label class="caption red--text">
						Usted esta a punto de moficar la categoria de
						{{
							changeAllCategories
								? 'todos los productos'
								: 'solo los productos seleccionados'
						}}
					</label>
				</v-flex>
				<v-flex mt-5>
					<section class="modal-filter-footer">
						<modal-sidebar-button
							:isLoading="
								(!this.changeAllCategories && !dataSelected.length) ||
								!newCategoryToChange
							"
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="confirAction"
						/>
					</section>
				</v-flex>
			</v-layout>
		</action-sidebar>
		<v-dialog v-model="dialogCancelAccum" persistent max-width="333px">
			<modal-items
				title="No acumular puntos"
				name-action="SI"
				name-cancel="NO"
				v-if="dialogCancelAccum"
				show-slot
				@close-modal="closeDialogCancelAccum"
				@action-modal="dialogDeleteProduct"
			>
				<v-flex class="py-2 px-4">
					<label class="bold">{{ dialogMessagePoint }}</label>
				</v-flex>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialog" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center ma-0">
							¿Está seguro que desea <b>{{ productStatusWord }}</b> el
							producto?:
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text class="py-0">
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center ma-0">
							{{ currentProduct.name }} ({{ currentProduct.code }})
						</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions class="px-5">
					<v-layout d-flex justify-space-between px-4 py-2>
						<v-btn
							class="btn-action mr-1"
							color="pink"
							:disabled="loading"
							type="button"
							@click="cancelAction"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							class="btn-action ml-1"
							color="success"
							:disabled="loading"
							type="button"
							@click="applyAction"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDelete" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center ma-0">
							¿Está seguro que desea <b>Elimnar</b> los siguiente(s)
							producto(s)?
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text class="py-0">
					<v-layout d-flex justify-center>
						<p v-if="modalDeleteOne" class="text-xs-center">
							{{ selectProductDelete.name }}
						</p>
						<p class="text-xs-center ma-0" v-else>
							<span v-for="(product, index) in dataSelected" :key="index">
								<span v-if="index === dataSelected.length - 1">{{
									product.name
								}}</span>
								<span v-else>{{ product.name }}, </span>
							</span>
						</p>
					</v-layout>
					<h2 class="text-xs-center ma-0">
						Se recuerda que se eliminará de todo el sistema
					</h2>
				</v-card-text>
				<v-card-actions class="px-5">
					<v-layout d-flex justify-space-between px-4 py-2>
						<v-btn
							class="btn-action mr-1"
							color="pink"
							:disabled="loadingDelete"
							type="button"
							@click="cancelDelete"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							class="btn-action ml-1"
							color="success"
							:disabled="loadingDelete"
							type="button"
							@click="deleteProducts"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import actionSidebar from '@/components/shared/action-sidebar';
import accordion from '@/components/shared/utils/accordion';
import appActions from '@/components/shared/app-actions';
import assignCategories from '@/components/ecommerce/assign-categories';
import assignFiltersForm from '@/components/ecommerce/assign-filters-form';
import assignProduct from '@/components/ecommerce/assign-product';
import assignTrades from '@/components/ecommerce/assign-trades';
import attributesAssignSlide from '@/components/attributes/attributes-assign-slide';
import changePrice from '@/components/ecommerce/change-price';
import filterByMaster from '@/components/shared/filter-by-master';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import featuresConfig from '@/components/shared/product/features-config';
import modalItems from '@/components/shared/modal-items';
import cmsTableProducts from '@/components/cms/cms-table-products';
import orderingProducts from '@/components/products/ordering-products';
import productLimitCatalog from '@/components/ecommerce/product-limit-catalog';
import productVariations from '@/components/shared/product/product-variations';
import statusCatalog from '@/components/ecommerce/status-catalog';
import accumPoints from '@/components/products/accum-points';
import viewStock from '@/components/products/view-stock';
import cmsUnitConversion from './cms-unit-conversion';
import cmsReporter from './cms-reporter';

const { removeLocalData } = helper;

function created() {
	// this.params.commerceId = this.commerceId || null;
	// this.loadCategories();
	this.loadCategory();
	this.loadResources();
	this.loadFairs();
	this.loadBrands();
	this.loadPriceList();
	if (this.commerceId) {
		this.loadCommerceData();
		this.commerceIdP = this.commerceId;
		helper.setLocalData('master-products', []);
	} else {
		removeLocalData('commerce-selected');
	}
	if (this.isWarehouse) {
		this.columns[13].flagVisible = true;
		this.columns[13].visible = false;
		this.columns[13].checked = false;
	}

	this.loadData();
	this.loadUnits();
}

function addRow(code) {
	this.loadingAddAccount = code === 'accounting-accounts';
	this.loadingAddConversion = code === 'conversions';
	this.loadingAddVariations = code === 'variations';
	if (code === 'conversions') {
		const unitCode = this.product.codeUnit || null;
		this.conversionsProduct.push({
			name: null,
			quantity: 1,
			quantityTo: 1,
			code: null,
			unitCode,
			cost: 0,
			barcode: null,
		});
		this.loadingAddConversion = false;
	}
}

async function loadDefaultsConversions() {
	const unitCode = this.product.codeUnit || null;
	const { data: unit } = await this.$httpCMS.get(`cms-units/${unitCode}`);
	unit.conversions.forEach((con) => {
		this.conversionsProduct.push({
			name: con.name,
			quantity: con.quantity,
			quantityTo: con.quantityTo,
			code: con.code,
			unitCode,
			cost: 0,
			barcode: null,
		});
	});
	this.loadingAddConversion = false;
}

function setConversion(conversion, index) {
	const newConversion = { ...conversion };
	this.$set(this.conversionsProduct, index, newConversion);
}

function removeConversion(conver, converIndex) {
	if (conver.id) {
		this.conversionsProduct = this.conversionsProduct.filter(
			(c) => c.id !== conver.id
		);
		// this.removeUnitFromPriceList(conver);
	} else {
		this.conversionsProduct.splice(converIndex, 1);
	}
}

function setReport(report, index) {
	const newReport = { ...report };
	this.$set(this.reportsProduct, index, newReport);
}

function removeReport(report, index) {
	this.reportsProduct.splice(index, 1);
}

// function editProduct({ id }) {
// 	// const name = this.$route.name
// 	const url = {
// 		path: `/cms/product/edit/${id}`,
// 		params: {
// 			id,
// 			commerceCode: this.commerceCode,
// 			commerceId: this.commerceId,
// 			subsidiaryId: this.subsidiaryId,
// 		},
// 		query: {
// 			origin: this.$route.query.origin,
// 			name: this.$route.query.name,
// 		},
// 	};
// 	this.$router.push(url);
// 	// const routeData = this.$router.resolve(url);
// 	// window.open(routeData.href, '_blank');
// }

function editProduct({ code }) {
	// const name = this.$route.name ===
	//  'master-product' ? 'edit-master-product' : 'edit-master-product-ecommerce-primary';
	// const url = {
	// 	name,
	// 	params: {
	// 		id,
	// 		commerceCode: this.commerceCode,
	// 		commerceId: this.commerceId,
	// 		subsidiaryId: this.subsidiaryId,
	// 	},
	// 	query: {
	// 		origin: this.$route.query.origin,
	// 		name: this.$route.query.name,
	// 	},
	// };
	const url = `/cms/product/edit/${code}`;
	this.$router.push(url);

	// const routeData = this.$router.resolve(url);
	// window.open(routeData.href, '_blank');
}

async function loadPriceList() {
	try {
		const response = await this.listPricingPromise();
		this.priceLists = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function setColumns() {
	const isMasterProductPage = this.$route.name === 'master-product';

	this.columns = this.columns.map((col) => {
		const newCol = { ...col };
		if (col.value === 'order') {
			newCol.checked = !isMasterProductPage;
			newCol.visible = !isMasterProductPage;
		}

		return newCol;
	});
}

async function assingProduct() {
	const commerceId = this.$route.params.commerceId;
	const fairId = this.idFair;
	const body = {
		flagSync: 0,
		jsonInformation: {
			products: this.dataSelected.map((p) => p.id),
		},
	};
	try {
		await this.$httpSales.patch(`fairs/${fairId}/commerce/${commerceId}`, body);
		this.showNotification(
			'Los productos fueron asignados a la feria correctamente.'
		);
		this.masterProducts = this.masterProducts.map((r) => {
			const newR = { ...r };
			newR.isSelected = false;
			return newR;
		});
		this.action.open = false;
		this.action.code = '';
		this.action.title = '';
		this.idFair = null;
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	}
}

function setFair(id) {
	this.idFair = id;
}

async function loadFairs() {
	try {
		({ data: this.fairs } = await this.$httpSales.get('fairs'));
		if (this.fairs.length > 0) {
			this.idFair = this.fairs[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function assignAttributes(selected) {
	const showCommerce = this.$route.params.commerceId;
	const body = {
		attributes: [...selected],
		commerceId: showCommerce ? Number(this.commerceId) : undefined,
		productIds: this.dataSelected.map((ds) => ds.id),
		subsidiaryId: showCommerce ? Number(this.subsidiaryId) : undefined,
		mode: showCommerce ? 1 : 2,
	};
	try {
		await this.$httpProducts.post('attribute/assign-attributes', body);
		this.showNotification(
			'Los atributos han sido asignados correctmanete a los productos seleccionados.'
		);
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function assignFilter(body) {
	try {
		await this.$httpProducts.patch('e-products/filters', body);
		this.showNotification('Los filtros han sido asignados correctamente.');
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function allSelected(checked) {
	this.checked = checked;
	({
		products: this.masterProducts,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(checked, this.masterProducts, this.dataSelected));
	this.updateDataSelected();
}

async function applyAction() {
	this.loading = true;

	// const { data: response } = await this.$httpProducts.get(url);

	// const url = `cms-products/${item.id}`;
	// const body = {};
	// await this.$httpProducts.patch()

	// const url = this.isMibodega && this.commerceId ?
	// `e-products/${this.currentProduct.id}/active` :
	// `v2/products/${this.currentProduct.id}/flag-active`;
	// const body = this.isMibodega && this.commerceId ?
	// 	{ isPublic: !this.currentProduct.isPublic } : {
	//  flagActive: !this.currentProduct.flagActive };
	// try {
	// 	await this.$httpProducts.patch(url, body);
	// 	this.showNotification(`El estado del producto ${this.currentProduct.name} h
	// a sido actualizado correctamente.`);
	// 	this.cancelAction();
	// 	this.loadData(this.currentPage);
	// } catch (err) {
	// 	if (err.status === 500) {
	// 		this.showGenericError();
	// 	}
	// } finally {
	// 	this.loading = false;
	// }
}

function cancelAction() {
	this.currentProduct = {};
	this.dialog = false;
	this.productStatusWord = '';
}

function cancelFilter() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	if (!this.keepParamType) {
		this.params.typeId = null;
	}
}

function goToKardex({ brandId, id, warehouseId, warProductId }) {
	const params = {
		brandId: brandId || 0,
		code: null,
		productId: id,
		warehouseId: warehouseId || 0,
	};
	const query = { warProductId };
	this.goTo('page-new-kardex', { params, query });
}

async function loadData(page = 1) {
	this.disabledSearch = true;
	this.loadingGeneral = true;
	this.filterLoading = true;
	this.currentPage = page;
	this.params.page = this.currentPage;
	// const params = { ...this.params };
	// if (!params.withStock) {
	// 	delete params.withStock;
	// }
	// if (!params.withOutStock) {
	// 	delete params.withOutStock;
	// }
	// params.brandIds = this.params.brandIds;
	// params.categories = this.params.categories || undefined;
	// params.categories = this.params.categories.join(',');
	// params.flagAvgCost = this.params.flagAvgCost === 1;
	try {
		const params = { ...this.params };

		if (this.idCategory) {
			params.cmsCategoryId = this.idCategory;
		}
		const { data: masterProducts, headers } = await this.$httpCMS.get(
			'cms-products',
			{ params }
		);
		// const { data: masterProducts, headers } = await this.$httpProducts.get(
		// 	'cms-products', { params: { page } });
		this.lastPage = Number(headers['x-last-page']);
		this.totalItems = Number(headers['x-quantity']);
		this.masterProducts = masterProducts;
		// this.setMasterProducts(masterProducts);
	} catch (err) {
		this.loadingGeneral = false;
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.disabledSearch = false;
		this.loadingGeneral = false;
		this.isClean = false;
		this.filterLoading = false;
	}
	this.setColumns();
}

async function loadCommerceData() {
	const { data: response } = await this.$httpSales.get(
		`com-ecommerce-companies/${this.commerceId}`
	);
	this.selectedPriceList = response.settings.salPriceListId;
	this.idWarehouseEcommerce = response.settings.defaultWarehouse
		? response.settings.defaultWarehouse.id
		: null;
	this.limitCatalog = response.settings.limitCatalog || null;
	this.selectCommerce = response;
}

function onChangeState(item) {
	this.currentProduct = { ...item };
	const status =
		this.isMibodega && this.commerceId ? item.isPublic : item.flagActive;
	this.productStatusWord = status ? 'Desactivar' : 'Activar';
	this.dialog = true;
}

function onColumnInput({ event }) {
	this.params.customSearchField = 'inline_alternate_code';
	this.params.customSearchValue = event.target.value;
	this.loadData();
}

function rowsUnSelected() {
	({
		products: this.masterProducts,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.unSelectedRows(this.masterProducts));
}

function rowSelected(item) {
	({
		products: this.masterProducts,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(item, this.masterProducts, this.dataSelected));
	this.updateDataSelected();
}

function searchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

async function tableAction({ item, code }) {
	// Abrir sidebar para la conversion
	if (code === 'CU') {
		this.action = {
			active: true,
			code: 'CU',
			open: true,
			title: item.name,
			width: 520,
		};
		this.product = { ...item };
		console.log({ item });
		this.validUnit();
		this.conversionsProduct = item.conversions ? [...item.conversions] : [];
	}
	if (code === 'RS') {
		this.action = {
			active: true,
			code: 'RS',
			open: true,
			title: item.name,
			width: 520,
		};
		this.product = { ...item };
		this.reportsProduct = item.jsonReport ? [...item.jsonReport] : [];
		// this.reportsProduct = [
		// 	{ name: 'Jose/Tienda', report: 'Error imagenes', status: false },
		// 	{ name: 'Maria/Prueba', report: 'Error Precio', status: true },
		// ];
	}
	// if (code === 'CF') {
	// 	const categoryByProduct = this.categories.find(category =>
	// 		category.id === item.categoryId);
	// 	if (categoryByProduct.features.length > 0) {
	// 		this.productSelected = item;
	// 		this.action = { ...this.productOptions.find(fa => fa.code === code) };
	// 	} else {
	// 		this.showNotification('La categoría del cas.', 'primary');
	// 	}
	// }
}

function totalItemsVisible() {
	return this.masterProducts.length;
}

function updateDataSelected() {
	this.dataSelected = this.dataSelected.map((product) => {
		const newProduct = { ...product };
		newProduct.product = {};
		newProduct.product.autoBarcode = product.autoBarcode;
		newProduct.product.code = product.code;
		newProduct.product.description = product.description;
		newProduct.product.id = product.id;
		newProduct.product.inlineFeatures = product.inlineFeatures;
		newProduct.product.name = product.name;
		newProduct.product.price = product.price;
		// newProduct.product.taxes = product.product ? [...product.product.taxes] :
		// 	[...product.taxes];
		newProduct.product.type = product.type;
		newProduct.product.weigth = product.weigth;
		return newProduct;
	});
	helper.setLocalData('master-products', this.dataSelected);
}

function newMasterProductAction() {
	if (this.$route.name === 'master-product-ecommerce') {
		this.goTo('new-master-product-ecommerce', {
			params: {
				commerceId: this.commerceId,
				commerceCode: this.commerceCode,
				subsidiaryId: this.subsidiaryId,
			},
			query: {
				origin: this.$route.query.origin,
				name: this.$route.query.name,
			},
		});
	} else {
		this.goTo('new-master-product');
	}
}

function runAction(item) {
	this.action.code = item.code;
	this.action.title = 'Cambiar Precio';
	this.action.open = true;
}

function disabledComputed() {
	return [
		{ code: 'edit-master-product', disabled: this.dataSelected.length !== 1 },
		{ code: 'Assign Filters', disabled: this.dataSelected.length < 1 },
		{ code: 'change-price', disabled: this.dataSelected.length < 1 },
		{ code: 'remove-products', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-attributes', disabled: this.dataSelected.length === 0 },
		{ code: 'activate-catalog', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-categories', disabled: this.dataSelected.length < 1 },
		{ code: 'AP', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-trades', disabled: this.dataSelected.length < 1 },
		{ code: 'accumulate-points', disabled: this.dataSelected.length < 1 },
		{ code: 'product-ordering', disabled: this.dataSelected.length < 1 },
	];
}

function closeModal() {
	if (
		this.action.code !== 'AP' &&
		this.action.code !== 'accumulate-points' &&
		this.action.code !== 'change-price'
	) {
		this.masterProducts = this.masterProducts.map((r) => {
			const newR = { ...r };
			newR.isSelected = false;
			return newR;
		});
		this.dataSelected = [];
	}
	this.action.open = false;
	this.conversionsProduct.splice(0);
	this.reportsProduct.splice(0);
	this.product = {};
	this.action.code = '';
	this.action.title = '';
	if (this.fairs.length > 1) {
		this.idFair = null;
	}
}

// async function loadCategories() {
// 	const url = this.isMibodega && this.commerceId ? 'e-categories' : 'categories';
// 	const params = this.isMibodega && this.commerceId ?
// 		{ commerceId: this.commerceId } : { ...this.paramsCategories };
// 	const response = await this.$httpProducts.get(url, { params });
// 	this.categories = response.data;
// }

async function loadCategory() {
	const url = `cms-categories/${this.codeCategory || ''}`;
	try {
		const response = await this.$httpCMS.get(url);
		this.category = response.data;
	} catch (err) {
		this.category = {};
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadBrands() {
	// const response = await this.$httpProducts.get(`cms-brands/${this.idCategory}`);
	const response = await this.$httpCMS.get('cms-brands');
	this.brands = response.data;
}

function setData({ value }) {
	if (typeof value === 'object' && value !== null) {
		const text =
			this.isMibodega && this.commerceId ? 'eCategories' : 'categoryId';
		this.params[text] = value ? value.id || value.join() || null : null;
		this.loadData();
	}
}

function setDataPriceList(value) {
	this.priceListIdTable = value;
}

function setDataCategorie(value) {
	if (value) {
		this.params.categories = value.map((p) => p.id).join(',');
	}
	this.loadData();
}

function cleanFilter() {
	this.params.categories = [];
	this.params.sortField = null;
	this.params.sortDirection = null;
	this.params.eCategories = null;
	this.params.search = null;
	this.params.typeId = null;
	this.params.flagLoyalti = null;
	this.params.flagActive = null;
	this.keepParamType = false;
	this.eCategories = [];
	this.isClean = true;
	this.dataSelected = [];
	helper.removeLocalData('master-products');
	this.loadData();
}

function titleHeader() {
	const { name: routeName } = this.$route.query;
	const resourceName = 'LISTA DE PRODUCTOS';
	return routeName || resourceName;
}

function titlePage() {
	const { name: routeName } = this.$route.query;
	const resourceName = 'LISTA DE PRODUCTOS';
	return routeName ? `- ${resourceName}` : '';
}

async function updatePrice(id, products, flag) {
	const user = helper.getLocalData('admin-user');
	const warehousesId = this.commerceId
		? this.idWarehouseEcommerce || user.warWarehousesId
		: user.warWarehousesId;
	const body = {
		salPriceListId: id,
		productsPriceSale: products.map((p) => {
			const unitPrice = Number(
				(p.changePrice / Number(`1.${this.taxForSale(p)}`)).toFixed(2)
			);
			const newProduct = {
				productId: p.id,
				priceSale: Number(p.changePrice),
				unitPrice,
				taxes: Number((p.changePrice - unitPrice).toFixed(2)),
			};
			return newProduct;
		}),
		warehousesId: flag ? [] : [warehousesId],
		flagEditAll: flag,
	};
	try {
		await this.$httpProducts.patch('products/price-sale/multiple', body);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	}
}

async function deleteProducts() {
	this.loadingDelete = true;
	const body = {
		productsId: this.modalDeleteOne
			? [this.selectProductDelete.id]
			: this.dataSelected.map((p) => p.id),
	};
	try {
		await this.$httpProducts.delete('products/delete/multiple', { data: body });
		this.showNotification('La acción se realizo correctamente');
		this.cancelDelete();
		this.dataSelected = [];
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
	} finally {
		this.loadingDelete = false;
		this.modalDeleteOne = false;
	}
}

function cancelDelete() {
	this.dialogDelete = false;
}

function taxForSale(p) {
	if (Array.isArray(p.taxes)) {
		const currentTaxes = p.taxes.find((t) => t.flagSales);
		return currentTaxes ? currentTaxes.percentage : 0;
	}
	const { percentage } = p.taxes;
	return percentage;
}

async function changeShowCatalog(value, { id }) {
	const body = {
		productId: id,
		commerceId: Number(this.commerceId),
		flagShowCatalog: value,
	};
	if (this.limitCatalog) {
		body.limitCatalog = this.limitCatalog;
	}
	const message = value
		? 'Se actualizó correctamente, el producto se mostrará en el catálogo si esta activo en el producto maestro'
		: 'Se actualizó correctamente';
	try {
		await this.$httpProducts.patch('commerce-company/update-catalog', body);
		this.showNotification(message);
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'LIMIT_CATALOG_EXCEEDED') {
				this.showNotification(
					'Ya ha excedido el límite de productos para el catálogo permitido.',
					'error'
				);
				const index = this.masterProducts.findIndex((m) => m.id === id);
				if (index > -1) {
					this.masterProducts[index].flagShowCatalog = false;
				}
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function saveCategories(ids) {
	const body = {
		productsId: this.dataSelected.map((d) => d.id),
		eCategories: Array.from(new Set(ids)),
	};
	const query = {
		fromEcommerceId: this.commerceId,
	};
	try {
		await this.$httpProducts.post('products-commerce/assign-categories', body, {
			query,
		});
		this.showNotification('Se realizó la acción correctamente');
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	}
}

async function changeStatusCatalog(value) {
	const body = {
		productsId: this.dataSelected.map((d) => d.id),
		commerceId: Number(this.commerceId),
		flagShowCatalog: value,
	};
	if (this.limitCatalog) {
		body.limitCatalog = this.limitCatalog;
	}
	try {
		await this.$httpProducts.patch('commerce-company/update-catalog', body);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadData(this.currentPage);
		this.rowsUnSelected();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'LIMIT_CATALOG_EXCEEDED') {
				this.showNotification(
					'Ya ha excedido el límite de productos para el catálogo permitido.',
					'error'
				);
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function deleteProductOne({ id, name }) {
	this.selectProductDelete = { id, name };
	this.modalDeleteOne = true;
	this.dialogDelete = true;
	removeLocalData('master-products');
}

function matchDataSelected() {
	const localSelected = helper.getLocalData('master-products');
	if (localSelected.length > 0) {
		localSelected.forEach((ls) => {
			const index = this.dataSelected.findIndex((ds) => ds.id === ls.id);
			if (index === -1) {
				this.dataSelected.push(ls);
			}
		});
		if (this.dataSelected.length > 0) {
			this.masterProducts = this.masterProducts.map((mp) => {
				const newProduct = { ...mp };
				const indexP = this.dataSelected.findIndex((ds) => ds.id === mp.id);
				newProduct.isSelected = indexP > -1;
				return newProduct;
			});
			this.checkAll = this.masterProducts.every((mp) => mp.isSelected);
			this.updateDataSelected();
		}
	}
}

function setMasterProducts(registers) {
	this.masterProducts = registers.map((m) => {
		const newData = { ...m };
		const validBrand =
			this.$userInfo.company.settings.flagUseSimpleBrand || false;
		newData.brandNameSimple = m.brandSimple ? m.brandSimple.name : null;
		newData.brandNameGlob =
			m.brands && m.brands.length > 1 ? m.brands[0].name : '';
		newData.brandName = validBrand
			? newData.brandNameSimple
			: newData.brandNameGlob;
		newData.flagShowCatalog = false;
		if (m.commerce && m.commerce.length) {
			const index = m.commerce.findIndex(
				(c) => Number(c.commerceId) === Number(this.commerceId)
			);
			newData.flagShowCatalog =
				index > -1 ? Boolean(m.commerce[index].flagShowCatalog) : false;
		}
		if (
			(this.isMibodega && this.commerceId) ||
			(this.commerceId && m.comCategories.length > 0)
		) {
			newData.categoriesEcommerce = m.comCategories.length
				? m.comCategories.map((c) => c.title).join()
				: '';
		}
		if (this.commerceId) {
			const commerceId = Number(this.commerceId);
			newData.order = m.commerce.find((c) => c.commerceId === commerceId).order;
		}
		return newData;
	});
	this.matchDataSelected();
}

function commerceIdP(value) {
	if (value) {
		this.columns[11].visible = true;
		this.columns[11].checked = true;
		this.columns[7].visible = true;
		this.columns[7].checked = true;
		this.columns[6].visible = false;
		this.columns[6].checked = false;
		this.columns[12].visible = true;
		this.columns[12].checked = true;
		this.columns[15].visible = true;
		this.columns[15].checked = true;
	}
}

function showVariantsSlide(row) {
	const newRow = { ...row };
	newRow.open = false;
	newRow.features = this.productsFeatures.map((feature) => {
		const newFeature = { ...feature };
		newFeature.open = false;
		newFeature.features = feature.features.map((ff) => ({
			id: ff.id,
			name: ff.name,
			value: ff.name,
		}));
		return newFeature;
	});
	this.productSelected = { ...newRow };
	this.variationModel.code = this.productSelected.code;
	this.variationModel.name = this.productSelected.name;
	this.variationModel.price = this.productSelected.price || 0;
	this.variationModel.urlImage = this.productSelected.urlImage || '';
	this.variationModel.warehouseId =
		this.warehouses.length === 1 ? this.warehouses[0].id : null;
	this.variationModel.weigth = this.productSelected.weigth || 0;
	this.variationModel.weigthType = this.productSelected.weigthType || '';
	this.dialogVariations = true;
}

function showVariantsSlideLot(row) {
	const newRow = { ...row };
	newRow.features = this.productsFeatures.map((feature) => {
		const newFeature = { ...feature };
		newFeature.open = false;
		newFeature.features = feature.features.map((ff) => ({
			id: ff.id,
			name: ff.name,
			value: ff.name,
		}));
		return newFeature;
	});
	this.productSelected = { ...newRow };
}

function closeDialog() {
	this.dialogVariations = false;
	this.productSelected = {};
	this.variationModel = {
		code: '',
		description: '',
		cost: '',
		features: [],
		minStock: 0,
		name: '',
		price: 0,
		stock: 0,
		urlImage: '',
		warehouseId: null,
		weigth: 0,
		weigthType: '',
	};
	this.childsNew = [];
	this.childs = [];
	this.oldChilds = [];
	this.childIdx = null;
}

async function saveVariations() {
	this.disabledAdd = true;
	const arrayChilds = this.childsNew.reduce((acum, c) => {
		const newAcum = [...acum];
		const filterFeatures = c.features.filter((p) => p.id);
		const newChild = {
			cost: c.cost || 0,
			name: c.name,
			description: c.description || '',
			urlImage: c.urlImage || null,
			code: c.code || '',
			price: c.price || 0,
			setting: c.setting || false,
			weigth: c.weigth || null,
			weigthType: c.weigthType || null,
			warehouseId: c.warehouseId || null,
			minStock: c.minStock || 0,
			stock: c.stock || 0,
			features:
				filterFeatures.map((p) => {
					const newRow = { ...p };
					newRow.open = undefined;
					return newRow;
				}) || [],
		};
		newAcum.push(newChild);
		return newAcum;
	}, []);
	const body = { childs: [...arrayChilds] };
	try {
		await this.$httpProducts.patch(
			`products-parent/${this.productSelected.id}`,
			body
		);
		this.showNotification('Las variaciones han sido guardadas correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DUPLICATE_CODE') {
				this.showGenericError(
					'Los códigos esta duplicados en una misma tienda.'
				);
			}
		}
	} finally {
		this.disabledAdd = false;
	}
}

function setVariationModel({ model, value }, featIdx) {
	if (featIdx >= 0 && value) {
		const feat = this.productSelected.features[featIdx];
		const child = {
			id: feat.id,
			code: String(value.id),
			name: feat.name,
			value: value.name,
			includeInCode: true,
			filterable: true,
			flagSeparator: false,
			open: false,
		};
		this.$set(this.variationModel.features, featIdx, child);
	} else {
		this.variationModel[model] =
			model !== 'warehouseId' ? Number(value) : value;
	}
}

function setVariationModelLot({ model, value }, featIdx) {
	if (value) {
		if (featIdx >= 0) {
			const feat = this.productSelected.features[featIdx];
			const child = {
				id: feat.id,
				code: String(value.id),
				name: feat.name,
				value: value.name,
				includeInCode: true,
				filterable: true,
				flagSeparator: false,
				open: false,
			};
			this.$set(this.variationModel.features, featIdx, child);
		} else if (model === 'lot') {
			this.variationModel[model] = value;
		} else {
			this.variationModel[model] =
				model !== 'warehouseId' ? Number(value) : value;
		}
	}
}

function addVariant() {
	const codeVar = this.variationModel.features.reduce(
		(a, f) => a.concat(f.code),
		''
	);
	const descVar = this.variationModel.features.reduce((a, f) => {
		const fIdx = this.variationModel.features.findIndex((vf) => {
			if (vf) {
				return (
					vf.code === f.code &&
					vf.value === f.value &&
					vf.warehouseId === f.warehouseId
				);
			}
			return false;
		});
		if (fIdx > 0) {
			if (fIdx - 1 > 0) {
				let hasFeat = false;
				for (let index = 0; index < fIdx - 1; index += 1) {
					if (this.variationModel.features[index]) {
						hasFeat = true;
					}
				}
				if (hasFeat) {
					return a.concat(`, ${f.value}`);
				}
			} else if (this.variationModel.features[0]) {
				return a.concat(`, ${f.value}`);
			}
			return a.concat(f.value);
		}
		return a.concat(f.value);
	}, '');
	const codeVariation = this.editVar
		? this.productSelected.code.concat(codeVar)
		: this.variationModel.code.concat(codeVar);
	this.variationModel.code = codeVariation.trim();
	this.variationModel.description = descVar;
	const cIdx = this.childs.findIndex(
		(c) =>
			c.code === this.variationModel.code &&
			c.description === this.variationModel.description &&
			c.warehouseId === this.variationModel.warehouseId
	);
	if (this.childs.length > 0) {
		if (this.editVar) {
			this.$set(this.childs, this.childIdx, { ...this.variationModel });
			this.showNotification('La variación se ha actualizado correctamente.');
			this.variationModel.code = this.productSelected.code;
			this.variationModel.name = this.productSelected.name;
			this.variationModel.price = this.productSelected.price || 0;
			this.variationModel.urlImage = this.productSelected.urlImage || '';
			this.variationModel.weigth = this.productSelected.weigth || 0;
			this.variationModel.weigthType = this.productSelected.weigthType || '';
			this.variationModel.description = '';
			this.variationModel.features = [];
			this.variationModel.minStock = 0;
			this.variationModel.cost = 0;
			this.variationModel.stock = 0;
			this.variationModel.warehouseId =
				this.warehouses.length === 1 ? this.warehouses[0].id : null;
		} else if (cIdx > -1) {
			const minLabelWarehouse = this.labelWarehouse().toLowerCase();
			const article = minLabelWarehouse === 'tienda' ? 'la' : 'el';
			this.variationModel.code = this.productSelected.code;
			this.variationModel.description = '';
			this.showGenericError(
				`Ya se ha agregado esta variación para ${article} ${minLabelWarehouse} seleccionado.`
			);
		} else {
			this.childs.push({ ...this.variationModel });
			this.childsNew.push({ ...this.variationModel });
			this.variationModel.code = this.productSelected.code;
			this.variationModel.name = this.productSelected.name;
			this.variationModel.price = this.productSelected.price || 0;
			this.variationModel.urlImage = this.productSelected.urlImage || '';
			this.variationModel.weigth = this.productSelected.weigth || 0;
			this.variationModel.weigthType = this.productSelected.weigthType || '';
			this.variationModel.description = '';
			this.variationModel.features = [];
			this.variationModel.minStock = 0;
			this.variationModel.cost = 0;
			this.variationModel.stock = 0;
			this.variationModel.warehouseId =
				this.warehouses.length === 1 ? this.warehouses[0].id : null;
		}
	} else {
		this.childs.push({ ...this.variationModel });
		this.childsNew.push({ ...this.variationModel });
		this.showNotification('La variación se ha agregado correctamente.');
		this.variationModel.code = this.productSelected.code;
		this.variationModel.name = this.productSelected.name;
		this.variationModel.price = this.productSelected.price || 0;
		this.variationModel.urlImage = this.productSelected.urlImage || '';
		this.variationModel.weigth = this.productSelected.weigth || 0;
		this.variationModel.weigthType = this.productSelected.weigthType || '';
		this.variationModel.description = '';
		this.variationModel.features = [];
		this.variationModel.minStock = 0;
		this.variationModel.cost = 0;
		this.variationModel.stock = 0;
		this.variationModel.warehouseId =
			this.warehouses.length === 1 ? this.warehouses[0].id : null;
	}
	this.editVar = false;
}

async function loadResources() {
	const params = {};
	if (this.subsidiaryId) {
		params.subsidiaryId = this.subsidiaryId;
	}
	const requests = [
		this.$httpProducts.get('products-types'),
		this.$httpProducts.get('warehouses', { params }),
	];
	try {
		[{ data: this.types }, { data: this.warehouses }] = await Promise.all(
			requests
		);
		this.variationModel.warehouseId =
			this.warehouses.length === 1 ? this.warehouses[0].id : null;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function editVariations(varMod, childIndex) {
	this.variationModel = { ...varMod };
	this.childIdx = childIndex;
	this.editVar = true;
}

function deleteVariations({ code, value, warehouseId }) {
	const idxVar = this.childs.findIndex(
		(f) => f.code === code && f.value === value && f.warehouseId === warehouseId
	);
	if (idxVar > -1) {
		this.childs.splice(idxVar, 1);
	}
}

function disabledModalAdd() {
	return (
		this.variationModel.features.length === 0 ||
		!this.variationModel.warehouseId ||
		this.variationModel.minStock < 0
	);
}

function tableOptionEvent(value) {
	this.action.code = value.code;
	this.action.title = value.title;
	this.action.open = value.open;
}

function setParamsData({ model, value }) {
	if (value) {
		this.params[model] = value;
	}
	this.loadData();
}

function disabledFilter() {
	return this.filterLoading;
}

async function confirAction() {
	if (this.action.code === 'CU') {
		// Actualizar conversiones
		const url = `cms-products/${this.product.code}`;

		const body = {
			name: this.product.name,
			conversions: [...this.conversionsProduct],
		};
		if (!body.conversions.length) {
			body.conversions = null;
		}
		const { data: response } = await this.$httpCMS.patch(url, body);
		if (response === 1) {
			this.showNotification('Producto editado con éxito');
		}
	} else if (this.action.code === 'RS') {
		// Actualizar reportes
		const url = `cms-products/${this.product.code}`;
		const body = {
			name: this.product.name,
			jsonReport: [...this.reportsProduct],
		};
		if (!body.jsonReport.some((r) => !r.status)) {
			body.reviewStatus = 3;
		}
		const { data: response } = await this.$httpCMS.patch(url, body);
		if (response === 1) {
			this.showNotification('Producto editado con éxito');
		}
	} else if (this.action.code === 'CC') {
		// Actualizar reportes
		try {
			const url = 'cms-products/multiple';
			const body = {
				cmsCategoryId: this.newCategoryToChange,
			};

			if (this.changeAllCategories) {
				body.currentCategoryId = this.idCategory;
			} else {
				body.productCodes = this.dataSelected.map(({ code }) => code);
			}

			await this.$httpCMS.patch(url, body);
		} catch (err) {
			this.showGenericError();
		}
	}
	// patch para actualizar
	this.keepParamType = true;
	this.cancelFilter();
	this.loadData();
}

async function loadChildren(row) {
	this.loadingChildren = true;
	try {
		({ data: this.childs } = await this.$httpProducts.get(
			`products-parent/${row.id}/childs`
		));
		if (this.warehouses.length === 1) {
			const warehouseId = this.warehouses[0].id;
			this.childs = this.childs.map((c) => {
				const newC = { ...c };
				newC.warehouseId = warehouseId;
				return newC;
			});
		}
		this.oldChilds = [...this.childs];
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingChildren = false;
		this.loadProductsFeatures(row);
	}
}

async function addLotProduct(row) {
	this.showDialogLot = true;
	this.titleAddLot = `Añadir Producto Lote -
			${row.name}`;
	this.loadProductsFeaturesLot(row);
}

async function createdLotProduct() {
	const codeVar = this.variationModel.features.reduce(
		(a, f) => a.concat(f.code),
		''
	);
	const textRandom = (Math.floor(Math.random() * 10000) + 1).toString();
	const codeLot = textRandom.substr(1, 2);
	const objectProduct = {
		brandId: this.variationModel.brandId,
		lot: this.variationModel.lot,
		stock: this.variationModel.stock,
		warehouseId: this.variationModel.warehouseId || 0,
		features: this.variationModel.features.map((p) => {
			const newRow = { ...p };
			delete newRow.open;
			return newRow;
		}),
		name: this.productSelected.name,
		code: this.productSelected.code.concat(`${codeVar}${codeLot}`),
		price: this.productSelected.price,
	};
	const body = {
		typeProduct: 7,
		childs: [objectProduct],
	};
	try {
		await this.$httpProducts.patch(
			`products-parent/${this.productSelected.id}`,
			body
		);
		this.showNotification('El producto lote fue creado correctamente.');
		this.loadData();
		this.variationModel.features = [];
		this.closeModalLot();
	} catch (error) {
		this.showGenericError();
	}
}

async function loadProductsFeaturesLot(row) {
	const params = {
		ids: row.features.reduce((a, f, i) => {
			const size = row.features.length;
			const lastItem = i === size - 1;
			if (!lastItem && size > 1) {
				return a.concat(`${f.id},`);
			}
			return a.concat(f.id);
		}, ''),
	};
	try {
		({ data: this.productsFeatures } = await this.$httpProducts.get(
			'features',
			{ params }
		));
		this.showVariantsSlideLot(row);
	} catch (error) {
		this.showGenericError();
	}
}

function childs(values) {
	this.disabledAdd = values.length === this.oldChilds.length;
}

async function saveTrades(products, trades) {
	const body = {
		products: [...products],
		commerce: [...trades],
	};
	try {
		await this.$httpProducts.post('commerce-company', body);
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	}
}

async function changeLimitProduct(quantity, id) {
	const body = {
		limitCatalog: Number(quantity),
	};
	try {
		await this.$httpSales.patch(
			`com-ecommerce-companies/${id}/update-catalog`,
			body
		);
		this.showNotification('Se creó correctamente el comercio');
		this.loadCommerceData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ECOMMERCE_COMPANY_NOT_EXIST') {
				this.showGenericError('El comercio no existe.');
			} else if (err.data.message === 'ACTION_NOT_ALLOWED') {
				this.showGenericError('El usuario no tiene permisos para esta acción.');
			}
		}
	}
}

async function loadProductsFeatures(row) {
	const params = {
		ids: row.features.reduce((a, f, i) => {
			const size = row.features.length;
			const lastItem = i === size - 1;
			if (!lastItem && size > 1) {
				return a.concat(`${f.id},`);
			}
			return a.concat(f.id);
		}, ''),
	};
	try {
		({ data: this.productsFeatures } = await this.$httpProducts.get(
			'features',
			{ params }
		));
		this.showVariantsSlide(row);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function downloadProductMaster(option) {
	const originName = 'productos_maestros_';
	const params = {
		brandIds: this.params.brandIds || undefined,
		flagActive: this.params.flagActive || undefined,
		flagLastCost: this.$userInfo.company.settings.flagKardexValued || false,
		categories:
			this.category && this.category.length
				? this.category.map((p) => p.id)
				: undefined || undefined,
		commerceId: this.params.commerceId || undefined,
		typeId: this.params.typeId || undefined,
		search: this.params.search || undefined,
		flagLoyalti: this.params.flagLoyalti || undefined,
		withOutStock: this.params.withOutStock || undefined,
		withStock: this.params.withStock || undefined,
		flagAvgCost: this.params.flagAvgCost || undefined,
		priceListId: this.priceListIdTable
			? this.priceListIdTable
			: this.$userInfo.company.salPriceListDefault.id,
	};
	this.onEmitExcel(option, originName, params);
}

function downloadProducts(option) {
	const originName = 'listado_products_maestros_detalle';
	const params = {
		brandIds: this.params.brandIds || undefined,
		flagActive: this.params.flagActive || undefined,
		flagLastCost: this.$userInfo.company.settings.flagKardexValued || false,
		categories: this.params.categories || undefined,
		commerceId: this.params.commerceId || undefined,
		typeId: this.params.typeId || undefined,
		search: this.params.search || undefined,
		flagLoyalti: this.params.flagLoyalti || undefined,
		withOutStock: this.params.withOutStock || undefined,
		withStock: this.params.withStock || undefined,
		flagAvgCost: this.params.flagAvgCost || undefined,
		priceListId: this.$userInfo.company.salPriceListDefault.id,
	};
	this.onEmitExcel(option, originName, params);
}

function closeModalAccum() {
	this.action = {
		title: '',
		open: false,
		code: null,
	};
}

async function saveAccum() {
	const body = {
		productIds: this.dataSelected.map((p) => p.id),
		flagLoyalti: true,
	};
	try {
		await this.$httpProducts.post('products/acum-points', body);
		this.dataSelected = [];
		this.action.open = false;
		this.showNotification('Los productos seleccionados ahora acumulan puntos.');
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	}
}

function searchTableAccum(search) {
	const searchTrim = search ? search.trim() : '';
	if (searchTrim) {
		this.rowsAccum = this.rowsAccum.filter((m) => m.code === searchTrim);
	} else {
		this.rowsAccum = this.dataSelected;
	}
}

function openDialogCancel(row) {
	this.dialogCancelAccum = true;
	this.dialogMessagePoint = `¿Deseas el producto "${row.name}" ya no acumule puntos?`;
	this.idProduct = row.id;
}

function closeDialogCancelAccum() {
	this.dialogCancelAccum = false;
	this.dialogMessagePoint = null;
}

async function dialogDeleteProduct() {
	const array = [this.idProduct];
	const body = {
		productIds: array,
		flagLoyalti: false,
	};
	try {
		await this.$httpProducts.post('products/acum-points', body);
		this.showNotification('El producto fue deasignado correctamente.');
		this.closeDialogCancelAccum();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

async function reloadAndClose() {
	this.closeModal();
	await this.loadData();
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

function closeModalLot() {
	this.showDialogLot = false;
}

async function createCharacteristicAccept(characteristic) {
	const invalid = characteristic.features.some(
		(mf) =>
			mf.id.toLowerCase() === this.createCharacteristic.code.toLowerCase() ||
			mf.name.toLowerCase() === this.createCharacteristic.name.toLowerCase()
	);
	if (invalid) {
		this.showGenericError(
			'Ya existe un identificador con este código o nombre.'
		);
	} else {
		const objectNew = {
			id: this.createCharacteristic.code,
			name: this.createCharacteristic.name,
		};
		characteristic.features.push(objectNew);
		const body = {
			features: characteristic.features,
			name: characteristic.name,
			subsidiaryId: characteristic.subsidiaryId,
		};
		try {
			await this.$httpProducts.patch(`features/${characteristic.id}`, body);
			this.showNotification(
				`Se creo un nuevo identificador "${this.createCharacteristic.name}" correctamente`
			);
			this.clearCharacterist();
			this.loadProductsFeaturesLot(this.productSelected);
		} catch (error) {
			this.showGenericError();
		}
	}
}

function clearCharacterist() {
	this.createCharacteristic = {
		code: null,
		name: null,
	};
}

function openCreateCharacteristic(index) {
	this.productSelected.features[index].open =
		!this.productSelected.features[index].open;
}

function setDataCharacteristic({ model, value }) {
	this.createCharacteristic[model] = value;
}

function cloneProduct({ id }) {
	this.goTo('new-master-product', {
		params: { cloneProduct: true, idProductClone: id },
	});
}

function setDataBrand(value) {
	if (value) {
		this.params.brandIds = value.id;
		this.loadData();
	}
}

async function configFeatures(featuresArray) {
	const id = this.productSelected.id;
	const modelFeatures = {
		features: featuresArray,
	};
	try {
		await this.$httpProducts.patch(`products/${id}/features`, modelFeatures);
		this.loadData();
		this.showNotification('Se actualizarion las características.');
	} catch (err) {
		this.showGenericError();
	} finally {
		this.closeModal(false);
	}
}

function viewStockSlide({ item, code }) {
	this.action = {
		open: true,
		code,
		title: `${item.code} - ${item.name}`,
		width: 540,
	};
	this.productIdSlide = item.id;
	this.stockProduct = item.stock;
	this.brandNameProduct = item.brandSimple ? item.brandSimple.name : '';
}

async function loadUnits(setUnit) {
	({ data: this.units } = await this.$httpCMS.get('cms-units'));
	if (setUnit) {
		const unitSelected = this.units.find((u) => u.id === setUnit.id);
		this.setProductData({ model: 'unitId', value: unitSelected.id });
	}
}

function setProductData({ model }) {
	if (model === 'unitId') {
		this.validUnit();
	}
}

function validUnit() {
	this.currentUnit =
		this.units.find((u) => u.id === this.product.cmsUnitId) || {};
	setTimeout(() => {
		this.loadingGeneral = false;
	}, 2000);
}

function filteredUnits() {
	return this.units.filter((u) => u.id !== this.product.unitId && !u.btn);
}

function data() {
	return {
		idCategory: this.$route.params.id || '',
		codeCategory: this.$route.params.code || '',
		action: {
			code: '',
			open: false,
			title: '',
			width: 550,
		},
		currentUnit: {},
		brandNameProduct: '',
		brands: [],
		category: {},
		categoriesSelected: [],
		checkAll: false,
		childIdx: null,
		childs: [],
		childsNew: [],
		loadingAddAccount: false,
		loadingAddConversion: false,
		loadingAddVariations: false,
		conversionsProduct: [],
		reportsProduct: [],
		calculateCostProm: [
			{
				id: 1,
				code: 1,
				name: 'Sí',
			},
			{
				id: 1,
				code: 0,
				name: 'No',
			},
		],
		createCharacteristic: {
			name: null,
			code: null,
		},
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Marca',
				value: 'nameBrand',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Slug',
				value: 'slug',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Unid.',
				value: 'codeUnit',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Imagen',
				value: 'urlImage',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Conversión',
				value: 'conversions',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Estados',
				value: 'status',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Estados Revisión',
				value: 'reviewStatus',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		columnsAccum: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 2,
				name: 'Nombre del Producto',
				value: 'nameProduct',
				visible: true,
				checked: true,
			},
		],
		rowsAccum: [],
		commerceData: {},
		commerceIdP: null,
		currentMaster: {},
		currentPage: 1,
		currentProduct: {},
		dataSelected: [],
		dialog: false,
		dialogCancelAccum: false,
		dialogDelete: false,
		dialogMessagePoint: null,
		dialogVariations: false,
		disabledSearch: false,
		eCategories: [],
		editVar: false,
		fairs: [],
		filterLoading: false,
		idFair: null,
		isClean: false,
		idWarehouseEcommerce: null,
		keepParamType: false,
		lastPage: 0,
		limitCatalogEcommerce: null,
		loadingGeneral: false,
		loading: false,
		loadingChildren: false,
		loadingDelete: false,
		loyaltys: [
			{
				id: 1,
				name: 'Acumular Puntos',
			},
		],
		masterProducts: [],
		modalDeleteOne: false,
		params: {
			cmsBrandId: null,
			cmsUnitId: null,
			reviewStatus: null,
			limit: 15,
			page: 1,
		},
		paramsCategories: {
			sortField: 'name',
			sortDirection: 'asc',
		},
		priceListIdTable: null,
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
				code: 'CF',
				open: true,
				title: 'AGREGAR CARACTERÍSTICAS',
				width: 500,
			},
		],
		priceLists: [],
		productSelected: {},
		productsFeatures: [],
		productStatusWord: '',
		selectedPriceList: null,
		selectProductDelete: null,
		showDialogLot: false,
		totalItems: 0,
		optionsExcel: [
			{
				id: 1,
				code: 'list-master-product',
				name: 'Reporte Productos Maestros',
			},
			{
				id: 2,
				code: 'list-master-product-detail',
				name: 'Reporte de Producto Maestro con detalle por Almacen',
			},
		],
		types: [],
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
		variationModel: {
			code: '',
			description: '',
			features: [],
			minStock: 0,
			name: '',
			price: 0,
			stock: 0,
			cost: 0,
			urlImage: '',
			warehouseId: null,
			weigth: 0,
			weigthType: '',
		},
		warehouses: [],
		oldChilds: [],
		disabledAdd: true,
		selectCommerce: {},
		product: {
			accountingAccount: [],
			alternateCode: [],
			arrayTaxesConcat: [],
			brandId: null,
			categoryId: null,
			code: '',
			codeProductCubso: null,
			codeRetention: '',
			conversions: [],
			cost: 0,
			description: '',
			flagActive: true,
			flagActiveIot: false,
			flagControlSerie: false,
			flagEcommerce: false,
			flagLoyalti: false,
			flagNotControlInventory: false,
			flagStockNegative: false,
			flagTaxCost: true,
			flagSales: true,
			features: [],
			commerce: [],
			name: '',
			pricesLists: [],
			priceSale: 0,
			priceSaleMin: 0,
			priceSaleMax: 0,
			score: null,
			taxUnit: {},
			taxMultiple: null,
			taxes: [],
			type: null,
			unitId: null,
			urlImage: '',
			warehousesId: [],
			weight: 0,
			additionalInformation: {
				healthRegister: '',
				features: [],
			},
		},
		listReviewStatus: [
			{
				id: 1,
				desc: 'Revisión',
			},
			{
				id: 2,
				desc: 'Reportado',
			},
			{
				id: 3,
				desc: 'Aprobado',
			},
			{
				id: 4,
				desc: 'Rechazado',
			},
		],
		units: [],
		changeAllCategories: false,
		allCategories: [],
		newCategoryToChange: '',
	};
}

export default {
	name: 'cms-category-detail',
	components: {
		actionSidebar,
		accumPoints,
		appActions,
		assignCategories,
		assignFiltersForm,
		assignProduct,
		assignTrades,
		attributesAssignSlide,
		changePrice,
		featuresConfig,
		filterByMaster,
		headerPage,
		cmsTableProducts,
		modalItems,
		orderingProducts,
		productLimitCatalog,
		productVariations,
		statusCatalog,
		viewStock,
		cmsUnitConversion,
		cmsReporter,
		modalSidebarButton,
		accordion,
	},
	computed: {
		disabledComputed,
		disabledFilter,
		disabledModalAdd,
		totalItemsVisible,
		titleHeader,
		titlePage,
		filteredUnits,
	},
	created,
	data,
	methods: {
		addLotProduct,
		addVariant,
		allSelected,
		applyAction,
		// applyFilter,
		assignAttributes,
		assignFilter,
		assingProduct,
		cancelAction,
		cancelDelete,
		cancelFilter,
		changeLimitProduct,
		changeShowCatalog,
		changeStatusCatalog,
		cleanFilter,
		clearCharacterist,
		closeDialogCancelAccum,
		closeModalAccum,
		closeDialog,
		closeModal,
		cloneProduct,
		columnSortable,
		closeModalLot,
		configFeatures,
		createCharacteristicAccept,
		createdLotProduct,
		dialogDeleteProduct,
		deleteProductOne,
		deleteProducts,
		deleteVariations,
		downloadProducts,
		downloadProductMaster,
		editProduct,
		editVariations,
		goToKardex,
		loadBrands,
		// loadCategories,
		loadCategory,
		loadChildren,
		loadCommerceData,
		loadData,
		loadFairs,
		loadPriceList,
		loadProductsFeaturesLot,
		loadProductsFeatures,
		loadResources,
		matchDataSelected,
		newMasterProductAction,
		openCreateCharacteristic,
		onChangeState,
		onColumnInput,
		openDialogCancel,
		reloadAndClose,
		rowSelected,
		rowsUnSelected,
		runAction,
		saveAccum,
		saveCategories,
		saveTrades,
		saveVariations,
		searchEvent,
		searchTableAccum,
		setColumns,
		setDataBrand,
		setData,
		setDataCategorie,
		setDataCharacteristic,
		setDataPriceList,
		setFair,
		setMasterProducts,
		setParamsData,
		setVariationModel,
		setVariationModelLot,
		showVariantsSlide,
		showVariantsSlideLot,
		tableAction,
		tableOptionEvent,
		taxForSale,
		updateDataSelected,
		updatePrice,
		viewStockSlide,
		addRow,
		validUnit,
		setProductData,
		loadUnits,
		setConversion,
		removeConversion,
		setReport,
		removeReport,
		confirAction,
		setNewCategoryToChange({ model, value }) {
			console.log({ model, value });
			this.newCategoryToChange = value.id;
		},
		async openChangeCategory() {
			// Traer todas las categorias
			const url = 'cms-categories';
			try {
				const response = await this.$httpCMS.get(url);
				const allCategoriesOrdered = response.data.reduce(
					(result, category) => {
						if (category.flagMain) {
							// Agrega la categoría principal
							result.push(category);
							// Luego, agrega sus subcategorías (si existen)
							if (category.subCategories && category.subCategories.length) {
								result.push(...category.subCategories);
							}
						}
						return result;
					},
					[]
				);
				this.allCategories = allCategoriesOrdered;
			} catch (err) {
				this.showGenericError();
			}
			this.runAction({ code: 'CC', title: 'Cambiar categoria' });
		},
		loadDefaultsConversions,
	},
	props: {
		commerceCode: [String, Number],
		commerceId: {
			type: [String, Number],
			default: null,
		},
		subsidiaryId: [Number, String],
	},
	watch: {
		commerceIdP,
		childs,
	},
};
</script>
<style lang="scss" scoped>
.modal-card {
	&-heading {
		padding: 0px !important;
	}

	&-subheading {
		align-items: center;
		background-color: rgba(195, 231, 232, 0.5);
		height: 34px;
		padding: 0px 29px;
	}

	&-title {
		align-items: center;
		background-color: rgba(195, 231, 232, 0.21);
		border-bottom: 1px solid color(item-select);
		color: color(primary);
		height: 52px;
		justify-content: space-between;
		padding: 0px 17px 0px 29px;

		&-row {
			font-family: font(lato-bold);
			font-size: size(medium);
			text-transform: uppercase;
		}
	}

	&-body {
		height: 417px;
		padding: 18px 24px;

		&-item {
			padding: 7px 29px;
		}

		&-top {
			max-height: 180px;
			overflow-y: auto;
		}

		&-bottom {
			max-height: 162px;
			overflow-y: auto;
			padding-bottom: 15px;
		}
	}
}

.product-modal-actions {
	background-color: rgba(195, 231, 232, 0.21);
	border-top: 1px solid color(item-select);
	justify-content: center;
	padding: 15px 0px 19px;
	text-align: center;
}

.product-modal-btn {
	border-radius: 5px !important;
	height: 30px !important;
	width: 97px !important;

	&-text {
		font-family: font(open-bold) !important;
		font-size: size(medium) !important;
		line-height: 1;
	}
}

.product-modal-close {
	height: auto !important;
	margin: 0px !important;
	width: auto !important;
}

.button-modal-add {
	background-color: color(success) !important;
	border-radius: 100% !important;
	height: 32px !important;
	margin-top: 17px !important;
	width: 32px !important;
}

.modal-label {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(small13);
}

.modal-table-label {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: size(small10);
}

.modal-table-column {
	align-items: center;
	background-color: rgba(195, 231, 232, 0.29);
	color: color(paginationText);
	display: flex;
	font-family: font(open-regular);
	font-size: size(small);
	height: 25px;
	letter-spacing: 0;
	padding: 0px 10px;
	overflow: hidden;
	white-space: nowrap;
	width: 100%;
}

.modal-table-button {
	align-items: center;
	border: 1px solid color(primary);
	border-radius: 100%;
	color: color(primary);
	display: flex;
	height: 21px;
	justify-content: center;
	width: 21px;

	.material-icons {
		color: currentColor !important;
	}

	&:hover {
		background-color: color(primary);
		color: color(white);
	}
}

.loading-map {
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 10px;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 1;

	&-container {
		background-color: color(white);
		border: 2px solid color(background-sidebar);
		border-radius: 6px;
	}

	&-text {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);
	}
}

.label-dialog-cancel {
	color: map-get($colors, primary);
	font-size: map-get($sizes, medium15);
}

.actions-btns {
	background-color: #f2fafa;
}

.card {
	border-radius: 12px !important;
}

.card__text {
	padding: 16px 20px 30px 20px !important;
	text-align: center;
}

.modal-items {
	&-btn {
		background-color: transparent !important;
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			background-color: transparent !important;
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}
	}
}

.text-small {
	font-size: 11px;
}

.title-section span {
	color: color(sidebar);
}
</style>
