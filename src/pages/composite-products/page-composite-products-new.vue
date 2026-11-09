<template>
	<div class="page-composite-products-new">
		<header-page
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		>
			<v-flex xs-12 text-xs-right>
				<span class="body-2 bold">{{labelWarehouse()}}: </span>
				<span class="body-1">{{ warehouse.name }}</span>
			</v-flex>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout wrap px-4 pt-3 pb-5 mb-5>
			<v-flex xs12 class="title-section">
				<span class="black--text">DATOS GENERALES</span>
			</v-flex>
			<v-flex xs6 pt-3 pr-2>
				<v-layout wrap>
					<v-flex xs6 pr-2>
						<app-input-text
							:text="product.code"
							label="Código"
							model="code"
							@input="setData"
						></app-input-text>
						<span class="caption error--text" v-if="$v.product.code.$invalid">
							El código es requerido
						</span>
						<span
							class="text-not-code-blank"
							v-if="checkBlankCode(product.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs6 pl-2>
						<app-input-text
							:text="product.name"
							label="Nombre"
							model="name"
							@input="setData"
						></app-input-text>
						<span class="caption error--text" v-if="$v.product.name.$invalid">
							El nombre es requerido
						</span>
					</v-flex>
					<v-flex xs12>
						<app-input-text
							:text="product.description"
							label="Descripción"
							model="description"
							textarea
							@input="setData"
						></app-input-text>
						<span class="caption error--text" v-if="$v.product.description.$invalid">
							La descripción es requerida
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 pt-3 pl-2>
				<v-layout wrap>
					<v-flex xs6 pr-2>
						<app-input-text
							:text="product.model"
							label="Modelo"
							model="model"
							@input="setData"
						></app-input-text>
					</v-flex>
					<v-flex xs6 pl-2>
						<v-layout wrap align-end>
							<v-flex class="input-col">
								<app-select
									:item="product.categoryId"
									item-text="name"
									item-value="id"
									:items="categories"
									label="Categoría"
									model="categoryId"
									:return-object="false"
									@input="setData"
								></app-select>
							</v-flex>
							<v-flex text-xs-right class="col-height">
								<button
									type="button"
									class="pl-add-container size mr-adjust"
									@click.stop="openSlideModal('NC', 'Nueva Categoría')"
								>
									<v-icon color="white">add</v-icon>
								</button>
							</v-flex>
							<v-flex xs12>
								<span
									class="caption error--text"
									v-if="$v.product.categoryId.$invalid"
								>
									La categoría es requerida
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 pr-2>
						<v-layout wrap align-end>
							<v-flex class="input-col">
								<app-select
									:item="product.unitId"
									item-text="name"
									item-value="id"
									:items="units"
									label="Unidad"
									model="unitId"
									:return-object="false"
									@input="setData"
								></app-select>
							</v-flex>
							<v-flex text-xs-right class="col-height">
								<button
									type="button"
									class="pl-add-container size mr-adjust"
									@click.stop="openSlideModal('UND', 'Nueva Unidad')"
								>
									<v-icon color="white">add</v-icon>
								</button>
							</v-flex>
							<v-flex xs12>
								<span
									class="caption error--text"
									v-if="$v.product.unitId.$invalid"
								>
									La unidad es requerida
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 pl-2>
						<v-layout wrap align-end>
							<v-flex class="input-col">
								<app-select
									:item="brandId"
									item-text="name"
									item-value="id"
									:items="brands"
									label="Marca"
									model="brandId"
									:return-object="false"
									@input="setData"
								></app-select>
							</v-flex>
							<v-flex text-xs-right class="col-height">
								<button
									type="button"
									class="pl-add-container size mr-adjust"
									@click.stop="openSlideModal('NB', 'Nueva Marca')"
								>
									<v-icon color="white">add</v-icon>
								</button>
							</v-flex>
							<v-flex xs12>
								<span
									class="caption error--text"
									v-if="$v.brandId.$invalid"
								>
									La marca es requerida
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout wrap align-end>
							<v-flex class="col-image">
								<app-input-text
									disabled
									label="Subir imagen"
									readonly
									:text="product.urlImage"
								></app-input-text>	
							</v-flex>
							<v-flex text-xs-right class="col-btn-image">
								<label ref="up" for="product-upload-image">
									<vue-six-four id="product-upload-image" hidden @vue-six-four="getFile" />
									<v-btn
										type="button"
										@click="actionUploadImage"
										:disabled="isLoadingImage"
										class="btn-action pl-add-container"
									>
										Adjuntar
									</v-btn>
								</label>
							</v-flex>
							<v-flex text-xs-right class="col-height">
								<v-btn
									@click="openSlideModal('VI', 'Imagen')"
									type="button"
									class="btn-action pl-add-container image-button text-xs-center mr-0">
									<img src="/static/img/view-image.svg" alt="" class="view-image">
								</v-btn>
							</v-flex>
							<v-flex xs12>
								<span class="caption info--text">
									Tamaño máximo de imagen permitido es 1024Kb
								</span>
							</v-flex>
							<v-flex xs12>
								<span class="form-group__message" v-if="isLoadingImage">
									Cargando...
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-select
							chips
							tags
							clearable
							solo
							class="select-chips_code mt-3"
							label="Otros códigos"
							v-model="product.alternateCode"
						>
							<template slot="selection" slot-scope="data">
								<v-chip
									close
									@input="removeAlternateCode(data.item)">
									<strong>{{ data.item }}</strong>&nbsp;
								</v-chip>
							</template>
						</v-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 my-3 class="title-section">
				<span class="black--text">Productos</span>
			</v-flex>
			<v-flex xs12>
				<v-layout wrap align-end>
					<v-flex xs4 pr-2>
						<app-select
							:disabled="id"
							:item="selectedPriceListId"
							item-text="name"
							item-value="id"
							:items="priceList"
							label="Lista de Precios"
							model="selectedPriceListId"
							:readonly="id"
							@input="updatePriceOrQuantity"
						></app-select>
					</v-flex>
					<v-flex xs3 px-1 v-if="isEcuador">
						<products-search-input
							id="search-sale-accounts"
							alert-message="de la cuenta"
							label-searching="Cuenta de Venta"
							:search-value="searchAccount"
							@search="openSearchAccount"
						/>
					</v-flex>
					<v-flex xs4 pl-2>
						<products-search-input
							id="search-products-composite"
							:search-value="searchValue"
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs1 pl-3 class="col-height">
						<button
							class="pl-add-container size mr-adjust"
							@click="addProduct"
							:disabled="disabledAddProduct"
							type="button"
						>
							<v-icon color="white">add</v-icon>
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<app-table
					name="products-composite"
					:columns="columns"
					:input-search="false"
					:filter-columns="false"
					:main-list="false"
					padding="px-0"
					:rows="product.groups"
					class="is-not-selectable no-main-list pt-3"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">{{ props.row.code }}</td>
						<td>{{ props.row.name }}</td>
						<td v-if="isEcuador">{{ props.row.account }}</td>
						<td class="col-max-width">
							<app-input-text
								type="number"
								:text="props.row.quantity"
								model="quantity"
								@input="setValueProp($event, props.row)"
							></app-input-text>
						</td>
						<td class="col-max-width">
							<app-input-text
								type="number"
								:text="props.row.price"
								model="price"
								@input="setValueProp($event, props.row)"
							></app-input-text>
						</td>
						<td>
							<app-tooltip-button
								class="table-icon"
								color="error"
								icon="delete"
								text="Eliminar de la tabla"
								@click-icon="openConfirmDelete(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs12 class="price-resume">
				<v-layout row v-for="tax in taxes" :key="tax.id">
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>
						Base {{ tax.percentage }}% {{ tax.description }}:
					</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>
						{{ countryCurrencySymbol }} {{ base[tax.code] }}
					</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>
						PVP del producto compuesto:
					</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>
						{{ countryCurrencySymbol }} {{ totalSalePrice }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled || checkBlankCode(product.code)"
				@cancel-button-clicked="goTo('products')"
				@accept-button-clicked="saveProduct"
			/>
		</section>
		<action-sidebar
			:help-actions="actionsToHelp"
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="cancelModal"
		>
			<new-brand
				v-if="isActionCode('NB')"
				@update-brand="updateOneService('brands')"
				@cancel-modal="cancelModal"
			/>
			<new-category
				v-if="isActionCode('NC')"
				@update-category="updateOneService('categories')"
				@cancel-modal="cancelModal"
			/>
			<new-unit
				v-if="isActionCode('UND')"
				@update-units="updateOneService('units')"
				@cancel-modal="cancelModal"
			/>
			<help-component
				v-if="isActionCode('H')"
				:helps="helps"
				@cancel-modal="cancelModal"
			/>
			<image-component
				v-if="isActionCode('VI')"
				:url="imageUpdated"
			/>
			<products-search-form
				v-if="isActionCode('product-searcher')"
				:search-value="searchVal"
				@add-product="setProductId"
			/>
			<accounts-search-form
				v-if="isActionCode('accounts-searcher')"
				:search-value="searchAcc"
				@add-product="setAccountId"
			/>
			<product-taxes-config
				v-if="isActionCode('product-taxes')"
				:product-id="id"
				:code-retention="codeRetention"
				:taxes="taxes"
				@close-modal="cancelModal"
				@send-data="getTaxes"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="360"
		>
			<v-card>
				<v-card-title class="headline">Eliminar Producto</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					{{ deleteMessage }}
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2
							text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteRegister">
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import { minValue, numeric, required } from 'vuelidate/lib/validators';
	import VueSixFour from 'vue-six-four';
	import accountsSearchForm from '@/components/shared/searcher/accounts-search-form';
	import actionSidebar from '@/components/shared/action-sidebar';
	import appTable from '@/components/shared/table/app-table';
	import appActions from '@/components/shared/app-actions';
	import headerPage from '@/components/shared/header-page';
	import helper from '@/shared/helper';
	import imageComponent from '@/components/accounting/utils/image-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import newBrand from '@/components/products/utils/new-brand';
	import newCategory from '@/components/products/utils/new-category';
	import newUnit from '@/components/products/utils/new-units';
	import productsSearchForm from '@/components/shared/searcher/products-search-form';
	import productsSearchInput from '@/components/shared/searcher/products-search-input';
	import productTaxesConfig from '@/components/products/product-taxes-config';
	import upLoadImageMixin from '@/mixins/upLoadImage';
	import lib from '@/shared/lib';
	
	const { updatePrice, getDeeper } = lib;
	const { getLocalData } = helper;

	function created() {
		({
			warehouseId: this.warehouse.id,
			warehouseName: this.warehouse.name,
		} = this.$route.query);
		this.columns = this.isPeru ? [...this.columnsPeru] : [...this.columnsEcuador];
		this.taxes = getLocalData('general-taxes') || [];
		this.loadResources();
	}

	function addProduct() {
		const newProductSelected = { ...this.productSelected };
		newProductSelected.account = this.accountSelected.account || null;
		newProductSelected.quantity = 1;
		newProductSelected.type = newProductSelected.product ? newProductSelected.product.type : 1;
		newProductSelected.taxes = newProductSelected.product ? newProductSelected.product.taxes :
			[];
		this.product.groups.push(newProductSelected);
		this.searchValue = '';
		this.accountSelected = {};
		this.productSelected = {};
		this.setBases();
		this.updateTotalSalePrice();
	}

	function buildPriceList() {
		const plSelected = this.priceList.find(pl => pl.id === this.selectedPriceListId);
		return {
			[plSelected.id]: {
				ranges: [],
				price: this.totalSalePrice,
			},
		};
	}

	function cancelDelete() {
		this.dialog = false;
		this.deleteMessage = '';
		this.productId = null;
	}

	function cancelModal() {
		this.action = { value: false, code: null, title: '', width: 500 };
	}

	function deleteRegister() {
		const index = this.product.groups.findIndex(r => r.id === this.productId);
		if (index > -1) {
			this.product.groups.splice(index, 1);
			this.cancelDelete();
			this.updateTotalSalePrice();
			this.setBases();
		} else {
			this.showGenericError('El producto ya ha sido eliminado de la tabla.');
		}
	}

	function disabled() {
		return this.loading || this.product.groups.length === 0 || this.$v.$invalid ||
			this.product.groups.some(r => !r.price || !r.quantity) || this.quantityInvalid ||
			this.priceInvalid;
	}

	function disabledAddProduct() {
		return (this.isEcuador && !this.accountSelected.account) || !this.productSelected.id;
	}

	function openConfirmDelete({ id, name }) {
		this.productId = id;
		this.deleteMessage = `¿Desea eliminar el producto ${name} de la tabla?`;
		this.dialog = true;
	}

	function imageUpdated() {
		this.product.urlImage = this.captureLocation;
		return this.product.urlImage || `${this.$imageUrl}/place-holder.svg`;
	}

	function isActionCode(code) {
		return this.action.code === code;
	}

	async function loadData() {
		try {
			({ data: this.product } = await this.$httpProducts.get(`products/${this.id}`));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadResources() {
		this.loading = true;
		const requests = [
			this.categoriesList(),
			this.listOfUnits(),
			this.listPricingPromise(),
			this.brandsList(),
		];
		try {
			[
				{ data: this.categories },
				{ data: this.units },
				{ data: this.priceList },
				{ data: this.brands },
			] = await Promise.all(requests);
			const priceListDefault = this.priceList.find(p => p.flagDefault === 1) || {};
			this.selectedPriceListId = priceListDefault.id || null;
			if (this.id) {
				this.loadData();
			} else {
				this.loading = false;
				this.setProducts();
			}
		} catch (err) {
			this.loading = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function openSearch(value) {
		this.searchVal = value ? value.trim() : '';
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 739;
		this.action.value = true;
	}

	function openSearchAccount(value) {
		this.searchVal = value ? value.trim() : '';
		this.action.code = 'accounts-searcher';
		this.action.title = 'Cuentas de Venta';
		this.action.width = 739;
		this.action.value = true;
	}

	function openSlideModal(code, title, width = 500) {
		this.action = { code, title, width, value: true };
	}

	function removeAlternateCode(item) {
		const index = this.product.alternateCode.indexOf(item);
		if (index > -1) {
			this.product.alternateCode.splice(index, 1);
		}
	}

	function runAction(item) {
		if (item.code === 'product-taxes') {
			this.openSlideModal(item.code, 'Impuestos', 600);
		}
	}

	async function saveProduct() {
		this.loading = true;
		const product = { ...this.product };
		product.groups = this.product.groups.map(g =>
			({ productId: g.id, price: g.price, quantity: g.quantity, type: g.type }));
		if (!product.model) {
			delete product.model;
		}
		const body = {
			brandId: this.brandId,
			priceList: this.buildPriceList(),
			product: { ...product, type: this.productType, taxes: this.taxesCustom },
			warehouseId: Number(this.$route.query.warehouseId),
		};
		const lengthTaxes = getDeeper('product', 'taxes', 'length')(body);
		if (lengthTaxes) {
			try {
				await this.$httpProducts.post(`products/groups/${this.productType}`, body);
				this.showNotification('El producto compuesto ha sido creado correctamente.');
				this.goTo('products');
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			} finally {
				this.loading = false;
			}
		} else {
			this.showNotification('Debe configurar impuestos', 'warning');
			this.loading = false;
		}
	}

	function setAccountId(accountItem) {
		if (accountItem) {
			this.accountSelected = { ...accountItem };
			this.searchAccount = accountItem.name;
		}
		this.cancelModal();
	}

	function setBases() {
		this.base = this.product.groups.reduce((acum, group) => {
			const groupTax = group.taxes.find(tax => tax.flagSales) || {};
			const taxItem = this.taxes.find(t => t.code === groupTax.codePercentage) || {};
			const newAcum = { ...acum };
			if (newAcum[taxItem.code]) {
				newAcum[taxItem.code] += (group.quantity * group.price);
			} else if (taxItem.code) {
				newAcum[taxItem.code] = group.quantity * group.price || 0;
			} else {
				this.taxes.forEach((t) => {
					if (!newAcum[t.code]) {
						newAcum[t.code] = 0;
					}
				});
			}
			return newAcum;
		}, {});
	}

	function setData({ model, value }) {
		if (model === 'brandId') {
			this[model] = value;
		} else {
			this.product[model] = value;
		}
	}

	function setProductId(productItem) {
		if (productItem) {
			this.productSelected = { ...productItem };
			this.searchValue = productItem.autocomplete;
		}
		this.cancelModal();
	}

	function setProducts() {
		const localProducts = getLocalData('products-selected');
		if (localProducts && localProducts.length > 0) {
			this.product.groups = localProducts.map((lp) => {
				const newLp = { ...lp };
				const { code, name } = lp.product;
				newLp.code = code;
				newLp.name = name;
				newLp.quantity = 1;
				if (this.isEcuador) {
					newLp.account = this.searchAccount;
				}
				return newLp;
			});
			this.setBases();
			this.updateTotalSalePrice();
		}
	}

	function setValueProp({ model, value }, row) {
		this.$set(row, model, value);
		this.quantityInvalid = this.product.groups.some(p => p.quantity < 1);
		this.priceInvalid = this.product.groups.some(p => p.price < 0);
		if (this.quantityInvalid) {
			this.showGenericError('La cantidad de los productos no puede ser menor a 1');
		}
		if (this.priceInvalid) {
			this.showGenericError('El precio de los productos no puede ser menor a 0');
		}
		this.setBases();
		this.updateTotalSalePrice();
	}

	function showImageUploaded() {
		this.openSlideModal('VI', 'Imagen');
	}

	async function updateOneService(key) {
		try {
			({ data: this[key] } = await this.$httpProducts.get(key));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function updatePriceOrQuantity({ model, value }) {
		this[model] = value.id;
		this.product.groups = this.product.groups.map(updatePrice(value.id));
		this.setBases();
		this.updateTotalSalePrice();
	}

	function updateTotalSalePrice() {
		this.totalSalePrice = this.product.groups.reduce((acc, r) =>
			acc + (r.quantity * r.price), 0);
	}

	function validations() {
		return {
			brandId: {
				minValue: minValue(1),
				numeric,
				required,
			},
			product: {
				categoryId: {
					minValue: minValue(1),
					numeric,
					required,
				},
				code: { required },
				description: { required },
				name: { required },
				unitId: {
					minValue: minValue(1),
					numeric,
					required,
				},
			},
		};
	}

	function getTaxes(taxesModel) {
		const { codeRetention, taxes } = taxesModel;
		this.codeRetention = codeRetention;
		this.taxesCustom = [...taxes];
		this.showNotification('La configuración ha sido guardada correctamente para el producto a crear');
		this.cancelModal();
	}

	function data() {
		return {
			accountSelected: {},
			action: {
				value: false,
				code: null,
				title: '',
				width: 500,
			},
			base: {},
			brandId: null,
			brands: [],
			categories: [],
			columns: [],
			columnsEcuador: [
				{
					id: 1,
					name: 'Código',
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					visible: true,
				},
				{
					id: 3,
					name: 'Cuenta de Venta',
					visible: true,
				},
				{
					id: 4,
					name: 'Cantidad',
					visible: true,
				},
				{
					id: 5,
					name: 'P. Venta',
					tooltip: 'Precio de Venta',
					visible: true,
				},
				{
					id: 6,
					name: 'Acciones',
					visible: true,
				},
			],
			columnsPeru: [
				{
					id: 1,
					name: 'Código',
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					visible: true,
				},
				{
					id: 3,
					name: 'Cantidad',
					visible: true,
				},
				{
					id: 4,
					name: 'P. Venta',
					tooltip: 'Precio de Venta',
					visible: true,
				},
				{
					id: 5,
					name: 'Acciones',
					visible: true,
				},
			],
			deleteMessage: '',
			dialog: false,
			isLoadingImage: false,
			loading: false,
			priceInvalid: false,
			priceList: [],
			product: {
				alternateCode: [],
				categoryId: null,
				code: null,
				description: null,
				groups: [],
				model: '',
				name: null,
				unitId: null,
				urlImage: null,
			},
			productId: null,
			productSelected: {},
			productType: 1,
			quantityInvalid: false,
			searchAcc: null,
			searchAccount: '',
			searchVal: null,
			searchValue: '',
			selectedPriceListId: null,
			taxes: [],
			taxesCustom: [],
			totalSalePrice: 0,
			units: [],
			warehouse: {
				id: null,
				name: '',
			},
		};
	}

	export default {
		name: 'page-composite-products-new',
		components: {
			VueSixFour,
			accountsSearchForm,
			actionSidebar,
			appActions,
			appTable,
			headerPage,
			imageComponent,
			modalSidebarButton,
			newBrand,
			newCategory,
			newUnit,
			productsSearchForm,
			productsSearchInput,
			productTaxesConfig,
		},
		computed: {
			disabled,
			disabledAddProduct,
			imageUpdated,
		},
		created,
		data,
		methods: {
			addProduct,
			cancelDelete,
			cancelModal,
			buildPriceList,
			deleteRegister,
			getTaxes,
			isActionCode,
			loadData,
			loadResources,
			openConfirmDelete,
			openSearch,
			openSearchAccount,
			openSlideModal,
			removeAlternateCode,
			runAction,
			saveProduct,
			setAccountId,
			setBases,
			setData,
			setProductId,
			setProducts,
			setValueProp,
			updateOneService,
			updatePriceOrQuantity,
			updateTotalSalePrice,
		},
		mixins: [upLoadImageMixin],
		props: {
			id: Number,
		},
		validations,
		watch: {
			captureLocation: showImageUploaded,
		},
	};
</script>

<style lang="scss" scoped>
	.bold {
		font-family: font(open-bold);
	}

	.price-resume {
		background-color: white;
	}
	
	.price-resume-border {
		border: 1px solid color(blue-grey);
	}

	.col-max-width {
		max-width: 58px;
	}

	.col-height {
		height: 30px;
		width: 30px;
	}

	.input-col {
		width: calc(100% - 55px);
	}

	.col-image {
		width: calc(100% - 155px);
	}

	.col-btn-image {
		height: 30px;
		width: 97px;
	}
</style>