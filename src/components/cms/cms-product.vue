<template>
	<div>
		<div class="loading" v-if="loadingGeneral">
			<div class="loading-message">
				La carga terminará en un momento y podrás ver toda la información para
				{{ actionProduct }} tu producto.
			</div>
		</div>
		<header-page title="Nuevo producto" />
		<!-- <app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/> -->
		<v-layout row wrap justify-center class="main-form">
			<v-flex xs6 px-5 text-xs-center>
				<v-layout row wrap text-xs-left>
					<v-flex xs12 mb2 class="title-section">
						<span>DATOS GENERALES</span>
					</v-flex>
					<v-flex xs12 class="product-general-block">
						<v-layout row wrap>
							<v-flex class="product-general-column image">
								<label ref="up" for="upload-image">
									<vue-six-four
										id="upload-image"
										hidden
										@vue-six-four="getFile"
									/>
									<button
										class="product-image-container"
										:disabled="isLoadingImage"
										type="button"
										@click="actionUploadImage"
									>
										<template v-if="product.urlImage">
											<img
												:src="product.urlImage"
												class="product-image"
												alt="sube una imagen"
											/>
											<span class="product-image-hover">Cambiar foto</span>
											<button
												@click.stop="openDialogImagen"
												class="product-image-hover-delete"
											>
												<v-icon color="white">clear</v-icon>
											</button>
										</template>
										<template v-else>
											<template v-if="isLoadingImage">
												<span class="product-image-loading"> CARGANDO... </span>
											</template>
											<template v-else>
												<img
													src="/static/img/image-default.svg"
													height="85"
													alt="sube una imagen"
												/>
												<p class="product-image-title mb-0">SUBIR FOTO</p>
												<p class="product-image-size mb-0">HASTA 500KB</p>
											</template>
										</template>
									</button>
								</label>
							</v-flex>
							<v-flex class="product-general-column data">
								<v-layout row wrap class="product-input-group">
									<!-- <v-flex xs12 v-if="typeProducts">
										<app-select
											:disabled="!!id"
											for-label="typeProduct"
											:item="product.type"
											:items="types"
											item-text="name"
											item-value="id"
											label="Tipo de producto"
											model="type"
											required
											return-object
											@input="setProductData"
										></app-select>
									</v-flex> -->
								</v-layout>
								<!-- CODIGO -->
								<v-layout row wrap class="product-input-group">
									<v-flex xs12 class="position-relative">
										<app-input-text
											label="Código(*)"
											model="code"
											:text="product.code"
											:disabled="id ? !flagCodeProductAuto : false"
											@input="setProductData"
										></app-input-text>
										<div
											v-if="checking && product.code"
											:class="[
												'checking-abailability',
												availableCode ? 'available' : 'not-available',
											]"
											:style="
												$v.product.code.$invalid ? 'top: -5px' : 'top: 19px'
											"
										>
											<v-icon id="add-icon" color="white">{{
												availableIcon
											}}</v-icon>
										</div>
									</v-flex>
									<span
										class="text-not-code-blank"
										v-if="checkBlankCode(product.code)"
									>
										No se permite espacios en blanco
									</span>
								</v-layout>
								<!-- NOMBRE -->
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-input-text
											label="Nombre(*)"
											model="name"
											:text="product.name"
											@input="setProductData"
										></app-input-text>
									</v-flex>
								</v-layout>
								<!-- SLUG -->
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-input-text
											label="Slug"
											model="slug"
											:text="product.slug"
											@input="setProductData"
										></app-input-text>
									</v-flex>
								</v-layout>
								<!-- UNIDAD -->
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-select
											:item="product.cmsUnitId"
											item-text="name"
											item-value="id"
											:items="fundamentalUnits"
											label="Unidad fundamental"
											model="cmsUnitId"
											@input="setProductData"
											showAutocomplete
										>
										</app-select>
										<!-- <autocomplete-component append-icon="arrow_drop_down" clearable http-code="$httpProducts"
											:item="product.cmsUnitId" item-text="name" item-value="id" :items="fundamentalUnits"
											label-value="Unidad fundamental" model="cmsUnitId" new-register-text="Nueva unidad"
											:on-clean="cleanData" placeholder="Seleccionar" prop="name" resource-url="units"
											:return-object="false" select-create @new-register="openSlideModal('UND', 'Nueva Unidad')"
											@return-data="setProductData"></autocomplete-component> -->
									</v-flex>
								</v-layout>
								<!-- MARCA -->
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<!-- <autocomplete-component append-icon="arrow_drop_down" clearable http-code="$httpProducts"
											:item="product.cmsBrandId" item-text="name" item-value="id" :disabled="!showBrandConfig && !!id"
											:readonly="!showBrandConfig && !!id" :items="brands" model="cmsBrandId"
											new-register-text="Nueva Marca" :on-clean="cleanData" placeholder="Seleccionar" label-value="Marca"
											prop="name" resource-url="brands" :return-object="false" select-create
											@new-register="openSlideModal('NB', 'Nueva Marca', 500)"
											@return-data="setProductData"></autocomplete-component> -->
										<app-select
											:item="product.cmsBrandId"
											item-text="name"
											item-value="id"
											:items="brands"
											model="cmsBrandId"
											label="Marca"
											@input="setProductData"
											showAutocomplete
										>
										</app-select>
									</v-flex>
								</v-layout>
								<!-- <v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-input-text
											label="Registro Sanitario"
											model="healthRegister"
											:text="product.additionalInformation ? product.additionalInformation.healthRegister : null"
											@input="setAdditionalInformation"
										></app-input-text>
									</v-flex>
								</v-layout> -->
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12>
								<v-layout row wrap align-center class="title-section">
									<v-flex xs10>
										<label for="product-description"
											>¿DESEA AGREGAR DESCRIPCIÓN?</label
										>
									</v-flex>
									<!-- <v-flex xs2>
										<label
											class="product-checkbox-label justify-end"
											for="product-description"
										>
											<span class="product-checkbox product-checkbox-subtitle">
												<img v-if="true" src="/static/img/checked.svg" height="9">
												<input
													hidden
													id="product-description"
													name="product-description"
													type="checkbox"
													:value="true"
													@change="setShowDescription($event.target.checked)"
												/>
											</span>
										</label>
									</v-flex> -->
								</v-layout>
								<app-input-text
									label="Descripción"
									model="description"
									no-resize
									:text="product.description"
									textarea
									@input="setProductData"
								></app-input-text>
							</v-flex>
						</v-layout>
						<v-layout row wrap class="product-general-last">
							<template>
								<v-flex xs12 mb2 class="title-section">
									<span> ASIGNAR CATEGORÍAS </span>
								</v-flex>
								<v-flex xs6>
									<!-- <autocomplete-component
										:item="product.cmsCategoryId"
										:items="categories"
										item-text="name"
										item-value="id"
										label-value="Categoría(*)"
										:slot-custom="true"
										return-object
										@return-data="setProductData({ value: $event, model: 'cmsCategoryId'})"
									></autocomplete-component> -->
									<categories-autocomplete
										:item="product.cmsCategoryId"
										:items="normalCategories"
										item-text="name"
										item-value="id"
										label-value="Categoría(*)"
										:slot-custom="true"
										return-object
										@return-data="
											setProductData({ value: $event, model: 'cmsCategoryId' })
										"
									></categories-autocomplete>

									<!-- <v-select
										:item="product.cmsCategoryId" item-text="name" item-value="id" :items="categories"
										label="Categoría(*)" model="cmsCategoryId" class="text-field filter-select"
										@input="setProductData" autocomplete solo
									>
										<template slot="item" slot-scope="data">
											<span v-html="data.item.flagMain? '' : `&nbsp;&nbsp;&nbsp;`"></span>
											<v-icon v-html="data.item.flagMain? 'expand_more' : 'arrow_right'">
											</v-icon>
											<span :class="`${data.item.flagMain ? 'font-weight-bold text-uppercase' : 'text-capitalize'}`">
												{{data.item.name }}
											</span>
										</template>
									</v-select> -->

									<!-- <autocomplete-component append-icon="arrow_drop_down" clearable http-code="$httpProducts"
										:item="product.cmsCategoryId" item-text="name" item-value="id" :items="categories"
										label-value="Categoría(*)" model="cmsCategoryId" new-register-text="Nueva categoría"
										:on-clean="cleanData" placeholder="Seleccionar" prop="name" resource-url="categories"
										:return-object="false" select-create @new-register="openSlideModal('NC', 'Nueva Categoría', 500)"
										@return-data="setProductData"></autocomplete-component> -->
									<!-- <span class="form-group__message" v-if="$v.product.categoryId.$invalid">
										La categoría del producto es requerida.
									</span> -->
								</v-flex>
							</template>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 px-5>
				<v-layout row wrap text-xs-left>
					<v-flex xs12 mb2 class="title-section">
						<span>CONVERSIONES</span>
					</v-flex>
					<v-flex xs6 pr-2 mb-3>
						<button
							class="product-add-btn mt-1"
							:disabled="loadingAddConversion"
							type="button"
							@click="addRow('conversions')"
						>
							<span>Agregar conversiones</span>
							<v-icon class="product-add-btn-icon" color="primary" size="17">
								add_circle
							</v-icon>
						</button>
					</v-flex>
					<v-flex
						xs12
						mb-2
						pb-1
						class="conversions-container"
						text-xs-center
						v-for="(conversion, indexConversion) in product.conversions"
						:key="indexConversion"
					>
						<cms-unit-conversion
							class="unit-conversion"
							:units="filteredUnits"
							:conversion="conversion"
							:selected-unit="currentUnit"
							@set-image="setImageConversion($event, indexConversion)"
							@set-conversion="setConversion($event, indexConversion)"
						/>

						<div class="unit-conversion-btn ml-1">
							<app-tooltip-button
								color="error"
								height="30"
								icon="remove_circle"
								text="Eliminar conversión"
								@click-icon="removeConversion(conversion, indexConversion)"
							></app-tooltip-button>
						</div>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>IMPUESTOS GENERAL</span>
					</v-flex>
					<!-- <v-flex xs10 pr-2>
						<app-select model="taxCostPercentage" :items="arrayTaxesGeneral" item-text="description"
							item-value="idCodeReference" @input="setTaxSelectedUnd" />
					</v-flex> -->
					<v-flex xs10 pr-2>
						<app-input-text
							label="Porcentaje de impuesto"
							model="taxCostPercentage"
							:text="product.taxCostPercentage"
							type="number"
							@input="setProductDataNumber"
							step="0.01"
							min="0"
							max="100"
						>
						</app-input-text>
					</v-flex>
				</v-layout>
				<v-layout row wrap text-xs-left>
					<v-flex xs12 mb2 class="title-section">
						<span>PRECIO DE COSTO</span>
					</v-flex>
					<v-flex xs3>
						<app-input-text
							label="Precio de costo"
							model="cost"
							:text="product.cost"
							type="number"
							@input="setProductDataNumber"
						>
						</app-input-text>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>Estado de revisión</span>
					</v-flex>
					<v-flex xs8 pr-2>
						<app-select
							:item="product.reviewStatus"
							:items="listReviewStatus"
							item-text="desc"
							item-value="id"
							model="reviewStatus"
							@input="setProductData"
						/>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>Estado del producto</span>
					</v-flex>
					<v-flex xs8 pr-2>
						<app-select
							:item="Number(product.flagActive)"
							:items="listStatus"
							item-text="desc"
							item-value="id"
							:return-object="false"
							model="flagActive"
							@input="setProductData"
						/>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>Tipo del producto</span>
					</v-flex>
					<v-flex xs8 pr-2>
						<app-select
							:item="Number(product.typeCategory)"
							:items="typesCategory"
							item-text="desc"
							item-value="id"
							:return-object="false"
							model="typeCategory"
							@input="setProductData"
						/>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 pr-2>
						<v-btn v-if="false" @click="printProduct">
							Imprimir producto
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="cancelModal"
			v-model="action.open"
		>
			<products-search-form
				v-if="true"
				:search-value="searchVal"
				:show-free="allowProductFree"
				@add-product="setProduct"
				is-sale
			/>
			<units-form
				v-if="action.code === 'UND'"
				:code="newUnit.code"
				:color="newUnit.color"
				:name="newUnit.name"
				@close-modal="cancelModal"
				@save="updateUnity"
				@set-data="setUnitData"
			/>
			<brand-form
				v-if="action.code === 'NB'"
				@set-data="setBrandData"
				@close-modal="cancelModal"
				@save="updateBrand"
				:code="newBrand.code"
				:name="newBrand.name"
			/>
			<new-category
				v-if="action.code === 'NC'"
				:commerce-id="commerceId"
				@update-category="loadCategories"
				@cancel-modal="cancelModal"
			/>
			<create-category
				v-if="action.code === 'NCE'"
				:loading="loadingCat"
				:commerce-id="commerceId"
				@close="cancelModal"
				@save="createCategories"
			/>
			<features-config
				v-if="action.code === 'CF'"
				:categories="categories"
				:product="newProduct"
				@cancel-modal="cancelModal"
				@config-features="addFeatures"
			/>
			<image-component v-if="action.code === 'VI'" :url="product.urlImage" />
			<select-warehouse
				v-if="action.code === 'WS'"
				:warehouses="product.warehousesId"
				@product-stock-by-warehouse="stockByWarehouse"
				@cancel-modal="clearWarehousesStock"
			/>
			<assign-commerces
				v-if="action.code === 'AC'"
				:data-selected="dataSelected"
				:rows="commerces"
				:check-all="checkAll"
				@selected-all="selectedAll"
				@selected-row="selectedRow"
				@close-modal="closeAssignCommerce"
				@assign-commerce="assignCommerce"
			/>
			<product-taxes-config
				v-if="isTaxesConfig"
				:product-id="id"
				:code-retention="product.codeRetention"
				:taxes="product.taxes"
				@close-modal="cancelModal"
				@send-data="getTaxes"
			/>
			<assign-categories
				v-if="action.code === 'assign-categories'"
				:categories-selected="product.eCategories"
				@close="cancelModal"
				@save="saveCategories"
			/>
			<features-action
				v-if="action.code === 'new-features'"
				:feature="{}"
				:isLoading="loadingFeature"
				@call-to-action="actionFeature"
				@cancel-to-action="cancelModal"
			/>
			<product-aditional-information
				v-if="action.code === 'AD'"
				@set-additional-information="setAdditionalInformation"
				:personalInformationFeature="personalInformationFeatureAdd"
			/>
			<product-accounting-data
				v-if="action.code === 'CONTA'"
				:accounting-accounts="accountingAccounts"
				:accounting-accounts-added="accountingAccountsAdded"
				:clean-data="cleanData"
				:code-retention="product.codeRetention"
				:is-loading="isLoading"
				:loading-add-account="loadingAddAccount"
				:product-id="id"
				:show-accounting-data="showAccountingData"
				:taxes="product.taxes"
				@accept-button="saveAccountingData"
				@add-row="addRow"
				@cancel-button="cancelModal"
				@delete-account="deleteAccount"
				@set-data="setData"
			></product-accounting-data>
		</action-sidebar>
		<v-layout
			wrap
			justify-center
			align-center
			class="modal-filter-footer page-buttons"
		>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					:color="id ? 'secondary' : 'pink'"
					class="btn-action mr-1"
					@click="goBack"
					:disabled="isLoading"
				>
					{{ cancelBtnName }}
					<img :src="`${$imageUrl}/icon-cancel.svg`" alt="" v-if="!id" />
				</v-btn>

				<v-btn
					type="button"
					color="primary"
					class="btn-action ml-1"
					:disabled="validatingForSave || checkBlankCode(product.code)"
					@click="createNewProduct"
				>
					{{ successBtnName }}
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-dialog
			v-model="modal.open"
			content-class="product-modal"
			height="427px"
			max-height="427px"
			max-width="403px"
			persistent
		>
			<v-card class="modal-card-container">
				<v-card-title class="modal-card-heading">
					<v-flex xs12>
						<v-layout row wrap class="modal-card-title">
							<v-flex xs10 class="modal-card-title-row">
								{{ modal.title }}
							</v-flex>
							<v-flex xs2 text-xs-right class="modal-card-title-row">
								<v-btn
									class="product-modal-close"
									depressed
									icon
									@click="closeModal"
								>
									<v-icon color="primary" size="16">close</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
						<v-layout
							row
							wrap
							v-if="modal.multiple"
							class="modal-card-subheading"
						>
							<label
								class="product-checkbox-label primary--text"
								for="product-select-all"
							>
								<span class="product-checkbox product-checkbox-modal">
									<img
										v-if="allSelected"
										src="/static/img/checked.svg"
										height="11"
									/>
									<input
										hidden
										id="product-select-all"
										name="product-select-all"
										type="checkbox"
										:value="allSelected"
										@change="onAllSelected"
									/>
								</span>
								<span>Seleccionar todo</span>
							</label>
						</v-layout>
					</v-flex>
				</v-card-title>
				<v-card-text class="modal-card-body">
					<template v-for="(item, index) in modal.items">
						<v-flex xs12 :key="index" class="modal-card-body-item">
							<label
								class="product-checkbox-label"
								:for="`product-select-item-${item.id}`"
							>
								<span
									class="product-checkbox product-checkbox-modal-item"
									:class="{ 'product-checkbox-active': item.isSelected }"
								>
									<img
										v-if="item.isSelected"
										src="/static/img/checked.svg"
										height="11"
									/>
									<input
										hidden
										:id="`product-select-item-${item.id}`"
										name="product-select-item"
										type="checkbox"
										:value="item.isSelected"
										@change="itemSelected(item, $event.target.checked)"
									/>
								</span>
								<span>{{ item.name || item.title }}</span>
							</label>
						</v-flex>
					</template>
				</v-card-text>
				<v-card-actions class="product-modal-actions">
					<v-btn
						class="btn-action btn-auto product-modal-btn"
						color="primary"
						outline
						@click="addItems"
					>
						<span class="product-modal-btn-text">Agregar</span>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-text class="subtext">
					{{ message }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="cancelDialog"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="createNewProduct"
						>
							Aceptar
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogImage" persistent max-width="425">
			<v-card>
				<v-card-text class="subtext">
					Desea eliminar la imagen del producto
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="cancelDialogImage"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="deleteImagenProduct"
						>
							Aceptar
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog persistent v-model="showModalBrand" max-width="360px">
			<modal-items
				v-if="showModalBrand"
				title="Crear Producto"
				show-slot
				:show-close="false"
				:show-regular="false"
				:show-btn-cancel="false"
				:show-buttons="false"
				@close-modal="closeModal"
			>
				<v-layout column px-2 pa-2>
					<v-flex text-xs-center class="caption">
						¡Alerta de Creación del Producto! <br />

						Se debe crear una marca para poder continuar.
					</v-flex>
					<v-flex mt-3 text-xs-center>
						<router-link :to="{ name: 'brands' }">
							Por favor, ingrese aquí
						</router-link>
					</v-flex>
				</v-layout>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import h from '@/shared/helper';
import l from '@/shared/lib';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import assignCategories from '@/components/ecommerce/assign-categories';
import assignCommerces from '@/components/master-product/assign-commerces';
import BasePrice from '@/shared/basePrice';
import brandForm from '@/components/brand/brand-form';
import createCategory from '@/components/ecommerce/create-category';
import featuresAction from '@/components/products/utils/features-action';
import featuresConfig from '@/components/shared/product/features-config';
import imageComponent from '@/components/accounting/utils/image-component';
import modalItems from '@/components/shared/modal-items';
import headerPage from '@/components/shared/header-page';
import newCategory from '@/components/products/utils/new-category';
import priceList from '@/components/master-product/price-list';
import pricesListSet from '@/components/prices-list/prices-list-set';
import PriceListClass from '@/shared/class/PriceListInstance';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productAccountingData from '@/components/master-product/product-accounting-data';
import productTaxesConfig from '@/components/products/product-taxes-config';
import selectWarehouse from '@/components/accounting/utils/selecting-warehouse';
import unitsForm from '@/components/units/units-form';
import productAditionalInformation from '@/components/products/product-aditional-information';
import upLoadImageMixin from '@/mixins/upLoadImage';
import VueSixFour from 'vue-six-four';
// import Modules from '@/shared/modules';
import TableCode from '@/shared/table-code';
import TypeProduct from '@/shared/type-product';
import cmsUnitConversion from './cms-unit-conversion';
import composingProductList from './cms-products-list';

const { compose, getDeeper, setNewProperty, matchBetweenArrays } = l;
const fourDecimals = l.round(4);
const { getLocalData, setLocalData } = h;

async function created() {
	// const urls = h.getLocalData('domains');
	// this.arrayDomains = urls && urls.length > 0;
	this.actionProduct = this.id ? 'editar' : 'crear';
	// this.cloneProduct = this.$route.params.cloneProduct;
	// this.idProductClone = this.$route.params.idProductClone;
	this.loadingGeneral = true;
	this.productSubsidiaryId =
		this.subsidiaryId || this.$userInfo.comSubsidiariesId;
	// this.flagAccumPoint = this.$userInfo.company.flagLoyalti === 1;
	this.showBrandConfig =
		this.$userInfo.company.settings.flagUseSimpleBrand || false;
	this.show10Percentage =
		this.$userInfo.company.settings.flagTaxesIgvTemporary || false;
	this.showStockNegative =
		this.$userInfo.company.settings.stockNegative || false;
	this.showCodeGenerate =
		this.$userInfo.company.settings.flagCodeAutoGenerate || false;
	if (this.showCodeGenerate && !this.$route.params.id) {
		const newDate = new Date();
		this.product.code = newDate.getTime().toString();
		this.availableCode = true;
	}
	// await this.loadCommerces();
	await this.loadResources();
	this.loadingGeneral = false;
	// this.showIOT = this.$userInfo.company.settings.flagShowIot || false;
}

// async function actionFeature(featureModel) {
// 	this.loadingFeature = true;
// 	try {
// 		await this.$httpProducts.post('features', featureModel);
// 		this.showNotification('La característica se creó correctamente');
// 		this.cancelModal();
// 		this.loadFeaturesBySubsidiary();
// 	} catch (err) {
// 		if (err.status === 500) {
// 			this.showGenericError();
// 		}
// 	} finally {
// 		this.loadingFeature = false;
// 	}
// }

// function addAccount() {
// 	this.accountingAccountsAdded.push(this.accountingAccount);
// 	this.accountingAccount = {};
// 	this.cleanData = true;
// }

// function addConversion(index) {
// 	this.disabledConversion = true;
// 	const { name, id } = this.product.conversions[index];
// 	this.addUnitIntoPriceList(name, id);
// }

// function addFeatures(features) {
// 	this.loading = true;
// 	this.product.features = [...features] || [];
// 	this.cleanActionObject();
// 	this.loading = false;
// }

function addItems() {
	this[`${this.modal.code}Selected`] = this.modal.items.filter(
		(i) => i.isSelected
	);
	this.closeModal();
}

function addRow(code) {
	// this.loadingAddAccount = code === 'accounting-accounts';
	this.loadingAddConversion = code === 'conversions';
	// this.loadingAddVariations = code === 'variations';
	if (code === 'conversions') {
		const unitCode = this.currentUnit ? this.currentUnit.code : null;
		this.product.conversions.push({
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
	// } else if (code === 'accounting-accounts') {
	// 	this.accountingAccountsAdded.push({ account: null, name: null });
	// 	this.loadingAddAccount = false;
	// }
}

// function addUnitIntoPriceList(name, id) {
// 	this.product.pricesLists = this.product.pricesLists.map((pl) => {
// 		const newPl = { ...pl };
// 		const unitObj = { ...this.unitPriceListObject };
// 		const unitIndex = pl.units.findIndex(u => u.id === id && u.name === name);
// 		if (unitIndex < 0) {
// 			unitObj.ranges = unitObj.ranges.concat({ ...this.defaultRange });
// 			unitObj.name = name;
// 			unitObj.id = id;
// 			newPl.units = pl.units.concat({ ...unitObj });
// 		}
// 		return newPl;
// 	});
// 	this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
// 		const newPl = this.product.pricesLists.find(pl => pl.id === pls.id);
// 		if (newPl) {
// 			return newPl;
// 		} else if (this.product.conversions) {
// 			if (this.product.conversions.length) {
// 				const newPls = { ...pls };
// 				const conver = this.product.conversions.map((c) => {
// 					const newC = {
// 						discount: 0,
// 						name: c.name,
// 						price: 0,
// 						id: c.id,
// 						ranges: [],
// 						salePrice: 0,
// 						tax: null,
// 						taxes: 0,
// 						unitPrice: 0,
// 					};
// 					return newC;
// 				});
// 				newPls.units = [...conver];
// 				return newPls;
// 			}
// 		}
// 		return pls;
// 	});
// }

// function articleWarehouse(plural) {
// 	if (plural) {
// 		return this.labelWarehouse() === 'Tienda' ? 'las' : 'los';
// 	}
// 	return this.labelWarehouse() === 'Tienda' ? 'la' : 'el';
// }

// function assignCommerce(commerce) {
// 	this.product.commerce = commerce.map((t) => {
// 		const newCommerce = {};
// 		newCommerce.code = t.code;
// 		newCommerce.commerceId = t.commerceId || t.id;
// 		return newCommerce;
// 	});
// 	this.cancelModal();
// }

function basePriceComputed() {
	return BasePrice;
}

// function basePriceUsed() {
// 	return getDeeper('company', 'settings', 'flagBasePriceDefault')(this.$userInfo);
// }

// function buildBody(id, product) {
// 	const priceUserListId = this.$userInfo.salPriceList ? this.$userInfo.salPriceList.id : null;
// 	const priceListDefaultSelected = this.idListPriceCommerce || priceUserListId;
// 	const priceFind = this.product.pricesLists.find(pls => pls.id === priceListDefaultSelected);
// 	const priceDefault = this.$userInfo.salPriceList && priceFind ?
// 		priceFind.salePrice : product.priceSale || 0;
// 	const commerce = product.commerce;
// 	product.arrayTaxesConcat.unshift({ ...product.taxUnit });
// 	const newObject = {
// 		priceList: this.buildPriceList(this.product.pricesLists),
// 		brandId: this.id ? undefined : product.brandId || undefined,
// 		product: {
// 			alternateCode: product.alternateCode,
// 			categoryId: product.categoryId,
// 			code: product.code,
// 			commerce: this.commercesSelected.length > 0 ?
// 				this.commercesSelected.map((c) => {
// 					const currentCommerce = commerce.find(t => t.commerceId === c.id || c.commerceId);
// 					const newCommerce = {
// 						code: c.code,
// 						flagShowCatalog: currentCommerce ?
// 							Boolean(currentCommerce.flagShowCatalog) || false : false,
// 						commerceId: c.id || c.commerceId,
// 					};
// 					return newCommerce;
// 				}) : [],
// 			flagTaxCost: this.product.flagTaxCost,
// 			brandSpId: this.showBrandConfig && this.id ? product.brandId : undefined,
// 			conversions: this.formattingConversions(product.conversions),
// 			cost: product.cost,
// 			description: product.description || '',
// 			features: id && this.finishProductSelected &&
// 				this.productDataComplete.productParentId ? product.features :
// 				this.featuresSelected.map(f => ({ id: f.id, name: f.name })),
// 			flagActive: Boolean(product.flagActive),
// 			flagControlSerie: Boolean(product.flagControlSerie),
// 			flagEcommerce: Boolean(product.flagEcommerce),
// 			flagLoyalti: Boolean(product.flagLoyalti),
// 			flagActiveIot: Boolean(product.flagActiveIot),
// 			flagNotControlInventory: this.arrayDomains ?
// 				Boolean(product.flagNotControlInventory) : undefined,
// 			flagStockNegative: this.arrayDomains ?
// 				Boolean(product.flagStockNegative) : undefined,
// 			score: product.score,
// 			flagSales: Boolean(product.flagSales),
// 			name: product.name,
// 			additionalInformation: product.additionalInformation,
// 			price: priceDefault,
// 			priceSaleMax: product.priceSaleMax ? Number(product.priceSaleMax) : 0,
// 			priceSaleMin: product.priceSaleMin ? Number(product.priceSaleMin) : 0,
// 			cmsUnitId: product.cmsUnitId,
// 			urlImage: product.urlImage,
// 			taxes: this.eliminatePercentageFromTaxes(product.arrayTaxesConcat),
// 			weigth: product.weight,
// 		},
// 	};
// 	if (this.product.codeRetention) {
// 		newObject.product.codeRetention = this.product.codeRetention;
// 	}

// 	// Verificar si el tipo de producto es compuesto
// 	if (this.product.type === TypeProduct.Composed) {
// 		newObject.product.groups = this.buildProductGroups(this.composingProducts);
// 	}
// 	if (id) {
// 		newObject.product.flagModule = Modules.Ecommerce;
// 		if (product.images && product.images.length > 0) {
// 			newObject.product.images = product.images.map(i => ({
// 				flagActive: Boolean(i.flagActive),
// 				flagPrincipal: Boolean(i.flagPrincipal),
// 				fromApp: Boolean(i.fromApp),
// 				name: i.name,
// 				order: i.order,
// 				cmsUnitId: i.cmsUnitId,
// 				urlImage: i.urlImage,
// 			}));
// 		}
// 		const filterWarehouse = this.warehousesSelected.filter(p => p.minStock || p.maxStock);
// 		newObject.warehouses = this.warehouseFormatId(filterWarehouse);
// 	} else {
// 		newObject.product.type = product.type;
// 		newObject.warehouses = this.warehouseFormat(this.warehousesSelected);
// 		if (this.commerceId) {
// 			newObject.product.commerce = this.product.commerce;
// 		}
// 	}
// 	if (this.product.eCategories !== this.eCategoriesOrigin) {
// 		if (this.$route.name === 'edit-master-product') {
// 			newObject.product.eCategories = this.product.eCategories;
// 		} else if (this.$route.name === 'new-master-product') {
// 			newObject.product.eCategories = [];
// 		} else {
// 			newObject.product.eCategories = this.categoriesSelected.map(c => c.id);
// 			if (this.id) {
// 				newObject.product.flagModule = 2;
// 			}
// 		}
// 	}
// 	if (this.commerceId) {
// 		delete newObject.product.flagActive;
// 		newObject.product.isPublic = Boolean(product.flagActive);
// 	}
// 	if (this.showAccountingData && this.product.accountingAccount.length > 0) {
// 		newObject.product.accountingAccount = [...this.product.accountingAccount];
// 	}
// 	return newObject;
// }

// function buildProductGroups(composingProducts) {
// 	return composingProducts.map((product) => {
// 		const obj = {
// 			price: product.unitPrice,
// 			productId: product.product.id,
// 			quantity: Number(product.quantity),
// 			type: 2,
// 			unitId: product.selectedUnitId || product.unitId,
// 			unitQuantity: product.unitQuantity || 1,
// 		};

// 		return obj;
// 	});
// }

// function buildPriceList(pricesLists) {
// 	if (pricesLists) {
// 		return pricesLists.reduce((acum, pl) => {
// 			const newPl = { ...acum };
// 			if (pl.salePrice > 0 || pl.unitPrice > 0) {
// 				newPl[pl.id] = {};
// 				newPl[pl.id].price = pl.salePrice || 0;
// 				newPl[pl.id].unitPrice = pl.unitPrice || 0;
// 				newPl[pl.id].discount = pl.discount || 0;
// 				newPl[pl.id].ranges = pl.ranges ? [...pl.ranges] : [];
// 				newPl[pl.id].taxes = pl.tax || 0;
// 				newPl[pl.id].units = isEmpty(pl.units) ? {} : this.buildUnits(pl.units);
// 			}
// 			return newPl;
// 		}, {});
// 	}
// 	return pricesLists;
// }

// function buildUnits(units) {
// 	let reduceUnits = {};
// 	if (units[0] && units[0].id) {
// 		reduceUnits = units.reduce((uAcum, unit) => {
// 			const newAcum = { ...uAcum };
// 			newAcum[unit.id] = {
// 				price: unit.salePrice || 0,
// 				unitPrice: unit.unitPrice || 0,
// 				discount: unit.discount || 0,
// 				ranges: unit.ranges ? [...unit.ranges] : [],
// 				taxes: unit.tax || 0,
// 			};
// 			return newAcum;
// 		}, {});
// 	}
// 	const newUnits = units[0] && units[0].id ? { ...reduceUnits } : { ...units } || {};
// 	return newUnits;
// }

function cancelBtnName() {
	return this.id ? 'Regresar' : 'Cancelar';
}

function cancelDialog() {
	this.dialog = false;
}

function cancelDialogImage() {
	this.dialogImage = false;
}

function cancelModal() {
	this.cleanActionObject();
	this.newUnit = {
		code: '',
		color: '#000000',
		flagActive: true,
		name: '',
	};
	this.newBrand = {
		code: '',
		name: '',
	};
}

function captureLocation(urlImage) {
	this.product.urlImage = urlImage;
}

async function checkingAbailability() {
	if (
		this.id ? this.originalCodeProduct !== this.product.code : this.product.code
	) {
		const url = 'slug';
		const body = {
			entityId: 1,
			code: this.product.code,
		};
		try {
			await this.$httpProducts.post(url, body);
			this.availableCode = true;
			this.availableIcon = 'check';
			this.showNotification('Código Disponible');
		} catch (error) {
			this.availableCode = false;
			this.availableIcon = 'clear';
			this.showNotification('Código Duplicado', 'error');
		} finally {
			this.checking = true;
		}
	}
}

function cleanActionObject() {
	this.action = {
		active: false,
		open: false,
		code: '',
		title: '',
		width: 0,
	};
}

function clearWarehousesStock() {
	this.product.warehousesId = this.product.warehousesId.map(
		setNewProperty('productStock', 0)
	);
	this.cancelModal();
}

function closeAssignCommerce() {
	this.dataSelected = this.dataSelectedCancel;
	this.cancelModal();
}

function closeModal() {
	this.modal = {
		code: '',
		items: [],
		multiple: false,
		open: false,
		title: '',
	};
	this.allSelected = false;
}

async function createCategories(model) {
	this.loadingCat = true;
	const body = {
		commerceId: Number(this.commerceId),
		categoryId: model.categoryId,
		description: model.description,
		endDate: model.endDate,
		slug: model.slug,
		flagAutomatic: !!model.flagAutomatic,
		mobileImage: model.mobileImage,
		order: model.order,
		startDate: model.startDate,
		title: model.title,
		urlImage: model.urlImage,
		webImage: model.webImage,
	};
	try {
		const { data: eCatCreated } = await this.$httpProducts.post(
			'e-categories',
			body
		);
		this.showNotification('La categoría ha sido creada correctamente.');
		this.cancelModal();
		this.loadCategories(eCatCreated);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingCat = false;
	}
}

// async function createFeature(model) {
// 	const method = this.feature.id ? 'patch' : 'post';
// 	const url = this.feature.id ? `features/${this.feature.id}` : 'features';
// 	const message = this.feature.id ? 'actualizó' : 'creó';
// 	try {
// 		await this.$httpProducts[method](url, model);
// 		this.showNotification(`La característica se ${message} correctamente`);
// 		this.cancelModal();
// 	} catch (err) {
// 		if (err.status === 500) {
// 			this.showGenericError();
// 		}
// 	}
// }

async function createNewProduct() {
	// if (this.product.taxes.length === 0) {
	// 	this.showNotification('Es necesario configurar impuestos, hacer clic en la acción', 'info');
	// } else {
	this.isLoading = true;

	// const newBody = {
	// 	id: this.id,
	// 	code: this.product.code,
	// 	name: this.product.name,
	// 	slug: this.product.slug,
	// 	description: this.product.description,
	// 	urlImage: this.product.urlImage,
	// 	alternateCode: null,
	// 	codeCategory: null,
	// 	slugCategory: null,
	// 	nameCategory: null,
	// 	codeUnit: null,
	// 	nameUnit: null,
	// 	dataImage: null,
	// 	cost: this.product.cost,
	// 	price: this.product.price,
	// 	codeBrand: null,
	// 	slugBrand: null,
	// 	nameBrand: null,
	// };
	// console.log(newBody);

	const methods = this.getMethod();
	const action = this.getAction();
	const params = {};
	const url = this.getUrl();
	let body;
	if (methods === 'post') {
		body = {
			...this.product,
			flagActive: Boolean(this.product.flagActive),
			typeCategory: this.product.typeCategory,
		};
	} else if (methods === 'patch') {
		body = {
			codeBrand: this.product.codeBrand,
			codeCategory: this.product.codeCategory,
			codeUnit: this.product.codeUnit,
			cost: this.product.cost,
			flagActive: Boolean(this.product.flagActive),
			typeCategory: this.product.typeCategory,
			name: this.product.name,
			nameBrand: this.product.nameBrand,
			nameCategory: this.product.nameCategory,
			// nameUnit: this.product.nameUnit,
			price: this.product.price,
			reviewStatus: this.product.reviewStatus,
			slugBrand: this.product.slugBrand,
			slugCategory: this.product.slugCategory,
			taxCostPercentage: this.product.taxCostPercentage,
			conversions: this.product.conversions || [],
			urlImage: this.product.urlImage || '',
			cmsCategoryId: this.product.cmsCategoryId,
			cmsBrandId: this.product.cmsBrandId,
			cmsUnitId: this.product.cmsUnitId,
			slug: this.product.slug,
		};
	}

	if (!body.conversions.length) {
		body.conversions = null;
	}
	// if (this.id) {
	// 	params.flagMaster = true;
	// 	if (this.commerceId) {
	// 		params.fromEcommerceId = Number(this.commerceId);
	// 	}
	// }
	// if (this.showFlagReplicate) {
	// 	params.flagPriceListReplicate = this.flagPriceListReplicate;
	// }
	try {
		await this.$httpCMS[methods](url, body, { params });
		this.dialog = false;

		this.showNotification(`producto ${action} con éxito`);
		this.goBack();

		// if (this.id) {
		// 	localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::products-selected`);
		// }
		// const validProductObj = response.product && response.product.id ? response.product.id : null;
		// const productId = this.id || response.productId || validProductObj || response[0].productId;
		// this.redirecting(productId);
		// if (this.id) {
		// 	this.loadProductInfo();
		// }
	} catch (err) {
		this.isLoading = false;
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PRODUCT_DUPLICATE_CODE') {
				this.showGenericError('El código ya está asignado a otro producto.');
			} else if (err.data.message === 'LIMIT_PRICE_ERROR') {
				this.showGenericError(
					'El precio mínimo de venta debe ser menor al precio de venta'
				);
			} else if (err.data.message === 'ERROR_CHECK_STOCK') {
				this.showGenericError(
					'El stock mínimo debe ser menor al stock maximo.'
				);
			}
		}
	} finally {
		this.isLoading = false;
	}
	// }
}

// function defaultTaxes() {
// 	const taxIcb = h.getLocalData('tax-icb');
// 	const taxesSelect = {
// 		code: taxIcb.catalogTax.code,
// 		codePercentage: this.isEcuador ? this.generalTaxes[1].code
// : this.generalTaxes[0].code,
// 		codeTable: taxIcb.code,
// 		flagSales: true,
// 		id: taxIcb.catalogTax.id,
// 		name: taxIcb.catalogTax.description,
// 		percentage: this.isEcuador ? this.generalTaxes[1].percentage
//  : this.generalTaxes[0].percentage,
// 	};
// 	this.product.taxes.push({ ...taxesSelect });
// 	this.taxSelected = this.product.taxes[0];
// 	this.setTaxIntoPricesLists(this.product.taxes);
// }

function deleteAccount({ id }) {
	const index = this.accountingAccountsAdded.findIndex((aaa) => aaa.id === id);
	if (index > -1) {
		this.accountingAccountsAdded.splice(index, 1);
	}
}

function deleteCategorySelected({ id }) {
	const cIndex = this.categoriesSelected.findIndex((cs) => cs.id === id);
	if (cIndex > -1) {
		this.categoriesSelected.splice(cIndex, 1);
	}
}

function deleteCommerceSelected({ id }) {
	const cIndex = this.commercesSelected.findIndex((cs) => cs.id === id);
	if (cIndex > -1) {
		this.commercesSelected.splice(cIndex, 1);
	}
}

function deleteFeatureSelected({ id }) {
	const fIndex = this.featuresSelected.findIndex((fs) => fs.id === id);
	if (fIndex > -1) {
		this.featuresSelected.splice(fIndex, 1);
	}
}

function deleteImagenProduct() {
	this.product.urlImage = '';
	this.cancelDialogImage();
}

function deleteWarehouseSelected({ id }) {
	const wIndex = this.warehousesSelected.findIndex((ws) => ws.id === id);
	if (wIndex > -1) {
		this.warehousesSelected.splice(wIndex, 1);
	}
}

function ecommerceRoute() {
	this.goTo('edit-master-product-ecommerce', {
		params: {
			commerceId: this.commerceId,
			commerceCode: this.commerceCode,
			subsidiaryId: this.productSubsidiaryId,
			id: this.id,
		},
		query: {
			origin: this.$route.query.origin,
			name: this.$route.query.name,
		},
	});
}

function editName() {
	return this.id ? ` - ${this.product.name}` : '';
}

function eliminatePercentageFromTaxes(taxes) {
	return taxes.map((t) => {
		const newT = {};
		newT.codeTable = t.codeTable;
		newT.code = t.code;
		newT.codePercentage = this.isEcuador ? t.codePercentage : t.code;
		newT.name = t.name || t.description;
		newT.flagSales = Boolean(t.flagSales);
		newT.flagPurchases = Boolean(t.flagPurchases);
		const valid18 = this.arrayTaxesGeneral.find(
			(tax) => tax.idCodeReference === t.idCodeReference
		);
		const validPercetange = valid18 ? valid18.percentage : null;
		newT.percentage = validPercetange || t.percentage;
		if (this.id && t.idTax) {
			newT.id = t.idTax;
		}
		return newT;
	});
}

function filteredUnits() {
	return this.units.filter((u) => u.id !== this.product.unitId && !u.btn);
}

function fundamentalUnits() {
	return this.units.filter((u) => u.type === 1);
}

function flagCodeProductAuto() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagCodeProductAutoKey = settingsKeys.find(
		(k) => k === 'flagCodeProductAuto'
	);
	return !!flagCodeProductAutoKey && companySettings[flagCodeProductAutoKey];
}

function flagConvers() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagConversKey = settingsKeys.find((k) => k === 'flagConvers');
	if (!flagConversKey) {
		return true;
	}
	return companySettings[flagConversKey];
}

function flagShowVariations() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagShowVariationsKey = settingsKeys.find(
		(k) => k === 'flagShowVariations'
	);
	if (!flagShowVariationsKey) {
		return true;
	}
	return companySettings[flagShowVariationsKey];
}

function formattingConversions(collection) {
	const newObj = {};
	collection.forEach((p) => {
		if (p.id && p.quantity) {
			newObj[p.id] = {
				barcode: p.barcode,
				quantity: p.quantity,
				quantityTo: 1,
				code: p.code,
				name: p.name,
			};
		}
	});
	return newObj;
}

function formattingTaxes(taxes) {
	if (taxes.length) {
		const productTaxes = taxes.find((t) => t.flagSales);
		if (productTaxes) {
			const rightTaxes = this.generalTaxes.find(
				(g) => g.idCodeReference === productTaxes.idCodeReference
			);
			productTaxes.percentage = rightTaxes ? rightTaxes.percentage : null;
			this.setTaxIntoPricesLists(productTaxes);
		}
	}
	if (this.id) {
		this.validUnit();
	}
}

function getAction() {
	let action = 'creado';
	if (this.id) {
		action = 'actualizado';
	}
	return action;
}

function getAndSetPricesList(productPriceList) {
	const self = this;
	const priceListDefault = [
		{
			discount: 0,
			id: this.$userInfo.salPriceList.id,
			name: this.$userInfo.salPriceList.name,
			open: true,
			ranges: [],
			salePrice: 0,
			tax: 0,
			unitPrice: 0,
			units: [],
		},
	];
	if (productPriceList && Object.keys(productPriceList).length) {
		return Object.keys(productPriceList).map((k) => {
			const index = self.product.pricesLists.findIndex(
				(pl) => pl.id === Number(k)
			);
			const newPriceList = {};
			if (index > -1) {
				newPriceList.id = Number(k);
				newPriceList.salePrice = productPriceList[k].price || 0;
				newPriceList.discount = productPriceList[k].discount || 0;
				newPriceList.unitPrice = productPriceList[k].unitPrice || 0;
				newPriceList.ranges = [...productPriceList[k].ranges] || [];
				newPriceList.units = productPriceList[k].units
					? self.transformUnitsToArray.call(self, productPriceList[k].units) ||
					  []
					: [];
				newPriceList.name = (
					self.pricesLists.find((pl) => pl.id === Number(k)) || {}
				).name;
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

function getMethod() {
	let method = 'post';
	if (this.id) {
		method = 'patch';
	}
	return method;
}

function getTaxes(taxesModel) {
	const { codeRetention, taxes } = taxesModel;
	this.product.codeRetention = codeRetention;
	// this.product.taxes = [...taxes];
	this.showNotification(
		'La configuración ha sido guardada correctamente para el producto a crear'
	);
	this.cancelModal();
	this.setTaxIntoPricesLists(taxes);
}

function getUrl() {
	let url = 'cms-products';
	if (this.id) {
		url = `cms-products/${this.id}`;
	}
	return url;
}

function goToExpense(war) {
	setLocalData('product-selected', this.productDataComplete);
	const params = {
		productIdEdit: this.id,
		warehouseId: war.id,
	};
	const query = {
		origin:
			this.$route.query.origin === 'products'
				? this.$route.query.origin
				: 'edit-master-product',
	};
	if (this.commerceCode && this.commerceId && this.subsidiaryId) {
		params.commerceCode = this.commerceCode;
		params.commerceId = this.commerceId;
		params.subsidiaryId = this.subsidiaryId;
	}
	if (this.$route.query.name) {
		query.name = this.$route.query.name;
	}
	this.goTo('new-discharge', { params, query });
}

function goToIncome(war) {
	setLocalData('product-selected', this.productDataComplete);
	const params = {
		productIdEdit: this.id,
		warehouseId: war.id,
	};
	const query = {
		origin:
			this.$route.query.origin === 'products'
				? this.$route.query.origin
				: 'edit-master-product',
	};
	if (this.commerceCode && this.commerceId && this.subsidiaryId) {
		params.commerceCode = this.commerceCode;
		params.commerceId = this.commerceId;
		params.subsidiaryId = this.subsidiaryId;
	}
	if (this.$route.query.name) {
		query.name = this.$route.query.name;
	}
	this.goTo('new-entry', { params, query });
}

function goToMasterProductEditing(productId) {
	const name =
		this.$route.name === 'edit-master-product' ||
		this.$route.name === 'new-master-product'
			? 'edit-master-product'
			: 'edit-master-product-ecommerce-primary';
	const { origin: originQuery, name: nameQuery } = this.$route.query;
	const query = {};
	if (originQuery) {
		query.origin = originQuery;
	}
	if (nameQuery) {
		query.name = nameQuery;
	}
	this.goTo(name, {
		params: {
			commerceId: this.commerceId,
			commerceCode: this.commerceCode,
			subsidiaryId: this.productSubsidiaryId,
			id: productId,
		},
		query,
	});
}

function goToMasterProductList() {
	const goToProductByWarehouse = this.$route.query.origin === 'products';
	const nameRoute =
		this.$route.name === 'edit-master-product' ||
		this.$route.name === 'new-master-product'
			? 'master-product'
			: 'master-product-ecommerce';
	const name = goToProductByWarehouse ? 'list-of-products' : nameRoute;
	const origin =
		this.$route.query.origin !== 'products'
			? this.$route.query.origin || ''
			: '';
	const nameQuery = this.$route.query.name || '';
	const query = {};
	if (origin) {
		query.origin = origin;
	}
	if (nameQuery) {
		query.name = nameQuery;
	}
	this.goTo(name, {
		params: {
			commerceId: this.commerceId,
			commerceCode: this.commerceCode,
			subsidiaryId: this.productSubsidiaryId,
		},
		query,
	});
}

function isGetWarehousesStock() {
	if (this.warehousesSelected.length > 0) {
		return this.warehousesSelected.some((w) => w.initQuantity);
	}
	return false;
}

function isPriceListPrice() {
	if (this.product.pricesLists.length) {
		let commercePriceList = [];
		if (this.idListPriceCommerce) {
			commercePriceList = this.product.pricesLists.filter((pl) => pl.show);
		} else {
			commercePriceList = [...this.product.pricesLists];
		}
		return commercePriceList.some((p) => p.unitPrice > 0 || p.salePrice > 0);
	}
	return false;
}

function isServices() {
	const typeSelected = this.types.find((t) => t.id === this.product.type) || {};
	return typeSelected.code === 'servicios';
}

function isTaxesConfig() {
	return this.action.code === 'product-taxes';
}

function itemSelected(item, value, setDefault) {
	const iDefault = this.modal.items.find((i) => i.id === item.id);
	const newItem = setDefault ? iDefault : item;
	this.$set(newItem, 'isSelected', value);
	this.allSelected = this.modal.items.every((i) => i.isSelected);
	if (setDefault) {
		this.addItems();
	}
}

async function loadAccountingAccounts() {
	const { company, subsidiary } = this.$userInfo;
	const { country } = company;
	const { ruc } = subsidiary;
	try {
		({ data: this.accountingAccounts } = await this.$httpQuipu.get(
			`accounting-accounts/${country.countryCode}/${ruc}/fb`
		));
		if (this.id) {
			this.generalTaxes = this.generalTaxes.map((p) => {
				const newRow = { ...p };
				newRow.idCodeReference = `${p.code}${p.percentage || 0}`;
				return newRow;
			});
			this.generalTaxes = h.getLocalData('general-taxes');
			if (this.show10Percentage) {
				const newIgvTeen = {
					name: 'IGV IMPUESTO GENERAL A LAS VENTAS',
					description: 'IGV IMPUESTO GENERAL A LAS VENTAS - Porcentaje: 10',
					code: '01',
					id: 33,
					flagTypeTaxes: 1,
					isSelected: false,
					value: '01',
					catalogSunatId: 6,
					percentage: 10,
				};
				newIgvTeen.idCodeReference = `${newIgvTeen.code}${newIgvTeen.percentage}`;
				this.generalTaxes.push(newIgvTeen);
			}
			this.loadProductInfo();
		} else if (this.commerceId) {
			this.product.commerce[0] = {
				code: this.commerceCode,
				commerceId: this.commerceId,
			};
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
				this.showGenericError(
					'No se encontró información de cuentas contables para la sucursal.'
				);
			}
		}
	}
}

async function loadCategories(setCat) {
	if (this.commerceId) {
		const params = { commerceId: this.commerceId };
		({ data: this.categories } = await this.$httpProducts.get('e-categories', {
			params,
		}));
	} else {
		({ data: this.categories } = await this.categoriesList());
		const categoriesNames = this.categories.reduce(
			(a, u) => a.concat(`${u.name} `),
			''
		);
		const categoryBtn = { id: 0, name: categoriesNames, btn: true };
		this.categories.push({ ...categoryBtn });
	}
	if (setCat) {
		const catSelected = this.categories.find((c) => c.id === setCat.id);
		this.openModal('categories', 'Categorías', true, catSelected);
	}
}

// async function loadCommerces() {
// 	({ data: this.commerces } = await this.$httpSales.get('com-ecommerce-companies'));
// 	this.commerces = this.commerces.map((p) => {
// 		const newRow = { ...p };
// 		const cIndex = this.commercesSelected.findIndex(cs => cs.id === p.id);
// 		newRow.isSelected = cIndex > -1 || this.commerces.length === 1;
// 		return newRow;
// 	});
// 	if (this.commerceId) {
// 		const index = this.commerces.findIndex(r => Number(r.id) === Number(this.commerceId));
// 		if (index > -1) {
// 			this.idListPriceCommerce = this.commerces[index].settings.salPriceListId;
// 		}
// 	}
// }

async function loadFeaturesBySubsidiary() {
	const params = { subsidiaryId: this.productSubsidiaryId };
	try {
		({ data: this.features } = await this.$httpProducts.get('features', {
			params,
		}));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadProductInfo() {
	const idProduct = this.id || this.idProductClone;
	const url = `cms-products/${idProduct}`;
	const { data: response } = await this.$httpCMS.get(url);
	// response.taxes = response.taxes.map((p) => {
	// 	const newRow = { ...p };
	// 	newRow.idProduct = p.product ? p.product.id : null;
	// 	newRow.flagSales = p.flagSales === 1;
	// 	newRow.idCodeReference = `${p.code}${p.percentage || 0}`;
	// 	return newRow;
	// });
	this.productDataComplete = { ...response };
	this.setProductInfo(response);
	this.disabledConversion = false;
	if (this.cloneProduct) {
		this.clearInformationProduct();
	}
}

async function loadRateTaxes() {
	try {
		const taxCountry = this.isPeru ? TableCode.Taxes : TableCode.IvaRate;
		const response = await this.$httpSales.get(
			`catalog-sunat-details-list/${taxCountry}`
		);
		if (this.isPeru) {
			this.typeTaxes = response.data.map((t, tIndex) => {
				const newT = { ...t };
				const taxSelected = this.typeTaxes.find((tax) => tax.code === t.code);
				newT.description =
					t.code === '01'
						? `${t.description} - Porcentaje: ${t.percentage}`
						: t.description;
				newT.flagTypeTaxes = t.additionalInformation
					? t.additionalInformation.flagTypeTaxes
					: null;
				newT.idCodeReference = `${t.code}${t.percentage || 0}`;
				newT.idTax = t.id;
				newT.flagSales = !!t.flagTaxes;
				newT.isSelected =
					this.typeTaxes.length > 0 ? !!taxSelected : tIndex === 0;
				newT.codeTable = TableCode.Taxes;
				if (t.description === 'GRATUITO') {
					newT.codeTable = TableCode.free;
				}
				return newT;
			});
			if (this.show10Percentage) {
				const newIgvTeen = {
					name: 'IGV IMPUESTO GENERAL A LAS VENTAS',
					description: 'IGV IMPUESTO GENERAL A LAS VENTAS - Porcentaje: 10',
					code: '01',
					id: 33,
					flagTypeTaxes: 1,
					isSelected: false,
					value: '01',
					catalogSunatId: 6,
					percentage: 10,
					flagSales: true,
				};
				newIgvTeen.idCodeReference = `${newIgvTeen.code}${newIgvTeen.percentage}`;
				this.arrayTaxesGeneral.push(newIgvTeen);
				this.typeTaxes.push(newIgvTeen);
			}
			if (!this.id) {
				// const objIgv = this.typeTaxes.find(t => t.flagTaxes === 1);
				// const taxDefault = {
				// 	id: objIgv.id,
				// 	code: objIgv.code,
				// 	codePercentage: objIgv.code,
				// 	codeTable: objIgv.codeTable,
				// 	flagSales: !!objIgv.flagTaxes,
				// 	name: `${objIgv.description}`,
				// 	percentage: objIgv.percentage,
				// };
				// this.product.taxes = [taxDefault];
				// this.product.taxUnit = objIgv;
			}
			this.arrayTaxesGeneral = this.typeTaxes.filter(
				(p) => p.flagTypeTaxes === 1
			);
			this.arrayTaxesComplement = this.typeTaxes.filter(
				(o) => o.flagTypeTaxes === 2
			);
		} else {
			const objIva = response.data.find((t) => t.flagTaxes === 1);
			this.taxes = response.data.map((mt, mtIndex) => {
				const newMt = { ...mt };
				const taxItem = this.product.taxes.find((tax) => tax.code === mt.code);
				const indexItem = taxItem
					? this.product.taxes.findIndex((tax) => tax.code === mt.code)
					: mtIndex;
				const taxTaxes = taxItem
					? this.taxes.find((t) => t.code === taxItem.codePercentage)
					: this.taxes.find(
							(t) => t.percentage === this.labelsByCountry.percentage
					  );
				if (this.id) {
					if (taxItem) {
						const taxDefault = {
							id: taxTaxes.id,
							idTax: taxItem.id,
							code: mt.code,
							codePercentage: taxTaxes.code,
							codeTable: mt.codeTable || objIva.codeTable,
							flagSales: !!mt.flagTaxes || !!objIva.flagTaxes,
							name: `${mt.description}`,
							percentage: taxTaxes.percentage,
						};
						this.$set(this.product.taxes, indexItem, taxDefault);
						this.setTaxSelected({ value: this.product.taxes });
					}
				} else if (taxTaxes && this.product.taxes.length === 0) {
					const taxDefault = {
						id: taxTaxes.id,
						code: taxTaxes.code,
						codePercentage: taxTaxes.code,
						codeTable: mt.codeTable || objIva.codeTable,
						flagSales: !!mt.flagTaxes || !!objIva.flagTaxes,
						name: `${taxTaxes.description}`,
						percentage: taxTaxes.percentage,
					};
					if (!this.product.taxes[mtIndex]) {
						this.$set(this.product.taxes, mtIndex, taxDefault);
						this.setTaxSelected({ value: this.product.taxes });
					}
				} else if (mtIndex === 0) {
					const taxDefault = {
						id: this.taxes[mtIndex].id,
						code: mt.code,
						codePercentage: this.taxes[mtIndex].code,
						codeTable: mt.codeTable || objIva.codeTable,
						flagSales: !!mt.flagTaxes || !!objIva.flagTaxes,
						name: `${mt.description}`,
						percentage: this.taxes[mtIndex].percentage,
					};
					if (!this.product.taxes[mtIndex]) {
						this.$set(this.product.taxes, mtIndex, taxDefault);
						this.setTaxSelected({ value: this.product.taxes });
					}
				}
				return newMt;
			});
		}
		this.setTypeTaxes();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadResources() {
	// const params = { subsidiaryId: this.productSubsidiaryId };
	// let categoriesRequest = this.categoriesList();
	// if (this.commerceId) {
	// 	const paramsCat = { commerceId: this.commerceId };
	// 	categoriesRequest = this.$httpProducts.get('e-categories', { params: paramsCat });
	// } else {
	// 	categoriesRequest = this.categoriesList();
	// }
	const requests = [
		this.$httpCMS.get('cms-units'),
		this.$httpCMS.get('cms-categories'),
		this.$httpCMS.get('cms-brands'),
		// this.$httpProducts.get('products-types'),
		// this.listPricingPromise(),
		// this.$httpProducts.get('features', { params }),
	];
	const [
		{ data: units },
		{ data: categories },
		{ data: brands },
		// { data: this.types },
		// { data: this.pricesLists },
		// { data: this.features },
	] = await Promise.all(requests);

	this.units = units;
	this.normalCategories = categories;
	this.brands = brands;

	// Supongamos que 'categories' es tu arreglo original de categorías
	// const categoriesPrimary = categories.filter((item) => item.flagMain);

	const allCategoriesOrdered = categories.reduce((result, category) => {
		if (category.flagMain) {
			// Agrega la categoría principal
			result.push(category);
			// Luego, agrega sus subcategorías (si existen)
			if (category.subCategories && category.subCategories.length) {
				result.push(...category.subCategories);
			}
		}
		return result;
	}, []);

	this.categories = [...allCategoriesOrdered];

	// this.categories = [...allCategoriesOrdenaded];

	this.warehouses = this.globalList();
	// const flagBatches = this.$userInfo.company.settings.flagWorkWithBatches || false;
	// this.types = this.types.reduce((a, t) => {
	// 	const newT = this.typeProductsCreationPermission.findIndex(tpcp => tpcp === t.id);
	// 	if (newT > -1) {
	// 		if (t.code === 'variantes') {
	// 			if (this.flagShowVariations) {
	// 				a.push({ ...t });
	// 			}
	// 		} else {
	// 			a.push({ ...t });
	// 		}
	// 	} else if (t.code === 'variantes' && this.flagShowVariations) {
	// 		a.push({ ...t });
	// 	} else if (t.code === 'lotes' && flagBatches) {
	// 		a.push({ ...t });
	// 	}
	// 	return a;
	// }, []);
	// if (!this.commerceId) {
	// 	const categoriesNames = this.categories.reduce((a, u) => a.concat(`${u.name} `), '');
	// 	const categoryBtn = { id: 0, name: categoriesNames, btn: true };
	// 	this.categories.push({ ...categoryBtn });
	// }
	this.loadRateTaxes();
	// this.setDefaultUnit();
	// this.setDefaultProductType();
	// this.priceListFormatting();
	if (this.showAccountingData) {
		this.loadAccountingAccounts();
	} else if (this.id) {
		this.generalTaxes = h.getLocalData('general-taxes');
		this.generalTaxes = this.generalTaxes.map((p) => {
			const newRow = { ...p };
			newRow.idCodeReference = `${p.code}${p.percentage || 0}`;
			return newRow;
		});
		if (this.show10Percentage) {
			const newIgvTeen = {
				name: 'IGV IMPUESTO GENERAL A LAS VENTAS',
				description: 'IGV IMPUESTO GENERAL A LAS VENTAS - Porcentaje: 10',
				code: '01',
				id: 33,
				flagTypeTaxes: 1,
				isSelected: false,
				value: '01',
				catalogSunatId: 6,
				percentage: 10,
			};
			newIgvTeen.idCodeReference = `${newIgvTeen.code}${newIgvTeen.percentage}`;
			this.generalTaxes.push(newIgvTeen);
		}
		await this.loadProductInfo();
	}
	// if (this.brands.length === 1) {
	// 	this.product.brandId = this.brands[0].id;
	// }
	// const defaultBrand = this.brands.find(p => p.flagDefault === 1);
	// if (defaultBrand) {
	// 	this.product.brandId = defaultBrand.id;
	// }
	// if ((this.brands && this.brands.length === 0) && this.showBrandConfig) {
	// 	this.showModalBrand = true;
	// }
}

async function loadUnits() {
	// setUnit
	({ data: this.units } = await this.$httpCMS.get('cms-units'));
	// if (setUnit) {
	// 	// const unitSelected = this.units.find(u => u.id === setUnit.id);
	// 	// this.setProductData({ model: 'unitId', value: unitSelected.id });
	// }
}

async function loadBrands(setBrand) {
	({ data: this.brands } = await this.$httpCMS.get('cms-brands'));
	if (setBrand) {
		const brandSelected = this.brands.find((u) => u.id === setBrand.id);
		this.setProductData({ model: 'cmsBrandId', value: brandSelected.id });
	}
}

function onAllSelected({ target }) {
	const { checked } = target;
	this.allSelected = checked;
	this.modal.items = this.modal.items.map((i) => {
		const newItem = { ...i };
		newItem.isSelected = checked;
		return newItem;
	});
}

function isComposed() {
	return this.product.type === TypeProduct.Composed;
}

function onSelectType({ code, id }) {
	if (code && id) {
		this.product.type = id;
		this.showLotSelected = code === 'lotes';
		this.showFeaturesSelect = code === 'variantes';
		this.finishProductSelected = code === 'productos-terminados';
		this.composedProductSelected = code === 'composed';
	}

	if (id === TypeProduct.Composed) {
		this.cleanSelectedProduct();
	}
}

function cleanSelectedProduct() {
	this.selectedProduct = { pricesListArray: [] };
	this.selectedProductName = '';
	this.onClean = true;
	this.cleanInput = true;
	this.composingProducts = [];
}

function openDialogImagen() {
	this.dialogImage = true;
}

function openModal(code, title, multiple = false, itemToSelect) {
	this.modal.code = code;
	this.modal.items = this[code].map((item) => {
		const codeItem = this[`${code}Selected`].findIndex(
			(cs) => cs.id === item.id
		);
		const newItem = { ...item };
		newItem.initQuantity = null;
		newItem.maxStock = null;
		newItem.minStock = null;
		newItem.isSelected = codeItem > -1 || this[code].length === 1;
		return newItem;
	});
	this.allSelected = this.modal.items.every((i) => i.isSelected);
	if (itemToSelect) {
		this.itemSelected(itemToSelect, true, true);
	} else if (this.modal.items.length > 1) {
		this.modal.multiple = multiple;
		this.modal.title = title;
		this.modal.open = true;
	} else {
		this.addItems();
	}
}

function openSlideModal(code, title, width = 450, dataToEdit) {
	if (code === 'FEATURE' && !!dataToEdit) {
		this.feature = { ...dataToEdit };
	}
	this.action = {
		active: true,
		open: true,
		code,
		title,
		width,
	};
}

function priceEdited() {
	return (
		this.priceCurrent !== this.product.priceSale ||
		this.pricesListsConfiguredCurrent.length !==
			this.pricesListsConfigured.length
	);
}

function priceLabel() {
	if (this.basePriceComputed.PV === this.basePriceUsed) {
		return 'Precio de venta';
	} else if (this.basePriceComputed.PU === this.basePriceUsed) {
		return 'Precio unitario';
	}
	return '';
}

// function priceListFormatting() {
// 	const self = this;
// 	this.pricesLists.forEach((pl, ind) => {
// 		self.$set(
// 			self.product.pricesLists,
// 			ind,
// 			compose(
// 				setNewProperty('name', pl.name),
// 				setNewProperty('id', pl.id),
// 				setNewProperty('ranges', []),
// 				setNewProperty('tax', null),
// 				setNewProperty('show', self.idListPriceCommerce ? pl.id ===
//  self.idListPriceCommerce : true),
// 				setNewProperty('open', self.idListPriceCommerce ? pl.id ===
// self.idListPriceCommerce : ind === 0),
// 			)(self.priceListObject),
// 		);
// 	});
// 	this.pricesListsSlide = [...this.product.pricesLists];
// }

function redirecting(productId) {
	if (!this.product.flagEcommerce || this.cloneProduct) {
		this.goToMasterProductList();
	} else if (productId) {
		this.goToMasterProductEditing(productId);
	} else {
		this.goTo('master-product');
	}
}

function removeAlternateCode(item) {
	const index = this.product.alternateCode.indexOf(item);
	if (index > -1) {
		this.product.alternateCode.splice(index, 1);
	}
}

function removeConversion(conver, converIndex) {
	if (conver.id) {
		this.product.conversions = this.product.conversions.filter(
			(c) => c.id !== conver.id
		);
		// this.removeUnitFromPriceList(conver);
	} else {
		this.product.conversions.splice(converIndex, 1);
	}
}

// function removeUnitFromPriceList(conver) {
// 	this.product.pricesLists = this.product.pricesLists.map((pl) => {
// 		const newPl = { ...pl };
// 		newPl.units = pl.units.filter(u => u.id !== conver.id);
// 		return newPl;
// 	});
// 	this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
// 		const newPl = this.product.pricesLists.find(pl => pl.id === pls.id);
// 		if (newPl) {
// 			return newPl;
// 		} else if (this.product.conversions) {
// 			if (this.product.conversions.length) {
// 				const newPls = { ...pls };
// 				const convert = this.product.conversions.map((c) => {
// 					const newC = {
// 						discount: 0,
// 						name: c.name,
// 						price: 0,
// 						id: c.id,
// 						ranges: [],
// 						salePrice: 0,
// 						tax: null,
// 						taxes: 0,
// 						unitPrice: 0,
// 					};
// 					return newC;
// 				});
// 				newPls.units = [...convert];
// 				return newPls;
// 			}
// 		}
// 		return pls;
// 	});
// }

function routeChange() {
	if (this.id) {
		this.generalTaxes = h.getLocalData('general-taxes');
		this.loadProductInfo();
	}
}

function runAction(item) {
	if (item.code === 'AD') {
		this.openSlideModal(item.code, 'Información adicional');
	} else if (item.code === 'CONTA') {
		this.openSlideModal(item.code, 'Contabilidad');
	} else if (item.code === 'product-taxes') {
		this.openSlideModal(item.code, 'Impuestos', 600);
	} else if (item.code === 'assign-categories') {
		this.openSlideModal(item.code, 'ASIGNAR CATEGORÍAS ECOMMERCE', 500);
	} else if (item.code === 'ecommerce-config') {
		this.ecommerceRoute();
	} else {
		this.goTo(item.codeWeb);
	}
}

function saveAccountingData(body) {
	if (this.showAccountingData && this.accountingAccountsAdded.length > 0) {
		this.product.accountingAccount = this.accountingAccountsAdded.map(
			(aaa) => ({ code: aaa.code })
		);
	}
	if (body) {
		if (body.codeRetention) {
			this.product.codeRetention = body.codeRetention;
		}
		if (body.taxes.length > 0) {
			this.product.taxes = this.product.taxes.concat(body.taxes);
		}
	}
	this.showNotification('La información contable ha sido guardada con éxito');
	this.cancelModal();
}

function saveCategories(body) {
	this.$set(this.product, 'eCategories', body);
	this.showNotification(
		'Las categorías de ecommerce han sido asignadas correctamente.'
	);
	this.cancelModal();
}

function selectedAll(checked) {
	this.checkAll = checked;
	this.commerces = this.commerces.map((r) => {
		const newRow = { ...r };
		newRow.isSelected = checked;
		return newRow;
	});
	this.dataSelected = [...this.commerces.filter((d) => d.isSelected)];
}

function selectedRow(row) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0) {
			const dataToAdd = this.dataSelected.find(
				(rowSelected) => rowSelected.commerceId === row.id
			);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex((d) => d.commerceId === row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.commerces.every((d) => d.isSelected);
}

function setConversion(conversion, index) {
	const newConversion = { ...conversion };
	this.$set(this.product.conversions, index, newConversion);

	// const newConversion = { ...conversion };
	// if (conversion.id) {
	// 	const { code, name } = this.units.find(u => u.id === conversion.id);
	// 	newConversion.name = name;
	// 	newConversion.code = code;
	// 	this.disabledConversion = false;
	// }
	// this.$set(this.newProduct.conversions, index, newConversion);
	// if (this.newProduct.conversions[index]) {
	// 	const newConv = { ...this.newProduct.conversions[index] };
	// 	delete newConv.barcode;
	// 	delete newConv.unitFrom;
	// 	const convKeys = Object.keys(newConv);
	// 	const convKeysIdx = convKeys.findIndex(ck => ck === 'code');
	// 	if (convKeysIdx > -1 && !newConv.code) {
	// 		convKeys.splice(convKeysIdx, 1);
	// 	}
	// 	if (convKeys.every(ck => newConv[ck])) {
	// 		this.addConversion(index);
	// 	}
	// }

	// if (conversion.id) {
	// 	const { code, name } = this.units.find(u => u.id === conversion.id);
	// 	newConversion.name = name;
	// 	newConversion.code = code;
	// 	this.disabledConversion = false;
	// }
	// this.$set(this.product.conversions, index, newConversion);
	// if (this.product.conversions[index]) {
	// 	const newConv = { ...this.product.conversions[index] };
	// 	delete newConv.barcode;
	// 	delete newConv.unitFrom;
	// 	const convKeys = Object.keys(newConv);
	// 	const convKeysIdx = convKeys.findIndex(ck => ck === 'code');
	// 	if (convKeysIdx > -1 && !newConv.code) {
	// 		convKeys.splice(convKeysIdx, 1);
	// 	}
	// 	if (convKeys.every(ck => newConv[ck])) {
	// 		this.addConversion(index);
	// 	}
	// }
}

function setConversionFromProduct(conversions) {
	const conversionsFromProduct = conversions
		? Object.keys(conversions).map((k) => {
				const newConversions = { ...conversions[k] };
				newConversions.id = Number(k);
				return newConversions;
		  })
		: [];
	return [].concat(conversionsFromProduct);
}

function setData(accIndex, value) {
	this.$set(this.accountingAccountsAdded, accIndex, { ...value });
}

// function setDefaultProductType() {
// 	const typeProductsCreation = this.$userInfo.company.settings.typeProductsCreationPermission;
// 	if (typeProductsCreation) {
// 		if (typeProductsCreation.length) {
// 			if (typeProductsCreation.length === 1 && !this.flagShowVariations) {
// 				const productTypeSelected = this.types.find(t => t.id === typeProductsCreation[0]);
// 				this.setProductData({ model: 'type', value: productTypeSelected });
// 			} else {
// 				this.setFinishedProducts();
// 			}
// 		} else {
// 			this.setFinishedProducts();
// 		}
// 	} else {
// 		this.setFinishedProducts();
// 	}
// }

// function setDefaultUnit() {
// 	const unitsNames = this.units.reduce((a, u) => a.concat(`${u.name} `), '');
// 	const newUnit = { id: 0, name: unitsNames, btn: true };
// 	this.units.push({ ...newUnit });
// 	// const defaultUnit = this.units.find(u => u.flagDefault);
// 	// this.product.unitId = isEmpty(defaultUnit) ? {} : defaultUnit.id;
// 	this.validUnit();
// }

function setFinishedProducts() {
	const productFinished = this.types.find(
		(p) => p.code === 'productos-terminados'
	);
	this.product.type = productFinished ? productFinished.id : this.types[0].id;
	this.finishProductSelected = !!productFinished;
}

function setFlagData({ model, value }) {
	if (model === 'flagPriceListReplicate') {
		this[model] = value;
	} else {
		this.product[model] = value;
	}
}

function setFlagVariant(vIdx, { model, value }) {
	this.$set(this.valuesFeatures[vIdx], model, value);
}

function setItemData(item, { model, value }) {
	this.$set(item, model, Number(value));
}

function setMinSalePrice(value) {
	this.minimumSalePriceFlag = value;
}

function setMaxSalePrice(value) {
	this.maximumSalePriceFlag = value || 0;
}

function setPriceListData(priceListUpdated, index) {
	if (this.product.taxes) {
		const PriceList = new PriceListClass(
			priceListUpdated,
			this.basePriceUsed,
			this.basePriceComputed,
			this.product.taxes
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

function setProductData({ model, value }) {
	this.product[model] = value;

	if (model === 'code') {
		this.checking = true;
		this.availableCode = true;
		this.availableIcon = 'check';
	}
	if (model === 'cmsBrandId') {
		this.product.cmsBrandId = value.id;
		this.product.codeBrand = value.code;
		this.product.nameBrand = value.name;
		this.product.slugBrand = value.slug;
	}
	if (model === 'cmsUnitId') {
		this.product.cmsUnitId = value.id;
		this.product.codeUnit = value.code;
		this.product.nameUnit = value.name;
		this.validUnit();
	}
	if (model === 'cmsCategoryId') {
		this.product.cmsCategoryId = value.id;
		this.product.codeCategory = value.code;
		this.product.slugCategory = value.slug;
		this.product.nameCategory = value.name;
	}
	if (model === 'reviewStatus') {
		this.product.reviewStatus = value.id;
	}
	// if (model === 'type') {
	// 	this.onSelectType(value);
	// }
}

// function setProductFeatures({ value }) {
// 	this.product.features = [...value] || [];
// }

function setAdditionalInformation({ model, value }) {
	this.product.additionalInformation[model] = value;
}

function setProductInfo(productData) {
	// Pruebas
	this.product = {
		...this.product,
		...productData,
	};
	this.validUnit();
	const similarItems = this.product.conversions
		.filter((con) => this.units.some((unit) => unit.code === con.code))
		.map((con) => {
			const matchingUnit = this.units.find((unit) => unit.code === con.code);
			return {
				...con,
				image:
					matchingUnit && matchingUnit.dataImage.length
						? matchingUnit.dataImage[0].urlImage
						: null,
			};
		});
	this.product.conversions = similarItems;
	// this.minimumSalePriceFlag = (productData.priceSaleMin);
	// this.maximumSalePriceFlag = (productData.priceSaleMax);
	// this.product.accountingAccount = productData.accountingAccount || [];
	// this.product.alternateCode = productData.alternateCode || [];
	// this.product.categoryId = productData.categoryId;
	// this.product.code = productData.code;
	// this.product.flagTaxCost = Boolean(productData.flagTaxCost);
	// this.product.taxCostPercentage = productData.taxCostPercentage;
	// this.product.cmsBrandId = this.showBrandConfig ? productData.brandSpId :
	// 	productData.warehouseProduct.cmsBrandId;
	// this.product.conversions = this.setConversionFromProduct(productData.conversions) ||
	// 	this.product.conversions;
	// this.product.cost = productData.totalCost;
	// this.product.totalCost = productData.totalCost;
	// this.product.lastCost = productData.cost;
	// this.product.description = productData.description;
	// this.product.features = productData.features || [];
	// this.product.flagActive = this.commerceId && this.isMibodega
	// 	? productData.isPublic : productData.flagActive;
	// this.product.flagActiveIot = productData.additionalInformation &&
	// 	productData.additionalInformation.flagActiveIot ?
	// 	productData.additionalInformation.flagActiveIot : null;
	// if (this.arrayDomains) {
	// 	this.product.flagNotControlInventory = Boolean(productData.flagNotControlInventory);
	// 	this.product.flagStockNegative = this.showStockNegative || productData.flagStockNegative ?
	// 		Boolean(productData.flagStockNegative) : null;
	// }
	// this.product.flagControlSerie = Boolean(productData.flagControlSerie);
	// this.product.flagEcommerce = Boolean(productData.flagEcommerce);
	// this.product.flagLoyalti = Boolean(productData.flagLoyalti);
	// this.product.score = productData.score;
	// this.product.flagSales = productData.flagSales;
	// this.product.name = productData.name;
	// this.product.priceSaleMin = productData.priceSaleMin;
	// this.product.priceSaleMax = productData.priceSaleMax;
	// this.product.pricesLists = this.getAndSetPricesList(productData.priceList);
	// this.product.taxes = productData.taxes.map((p) => {
	// 	const newRow = { ...p };
	// 	const findTax = this.typeTaxes.find(o => o.idCodeReference === p.idCodeReference);
	// 	newRow.flagTypeTaxes = findTax && findTax.flagTypeTaxes
	// 		? findTax.flagTypeTaxes : null;
	// 	return newRow;
	// });
	// // const existTaxUnid = this.product.taxes.find(p => p.flagTypeTaxes === 1);
	// const existTaxMult = this.product.taxes.filter(p => p.flagTypeTaxes === 2);
	// // this.product.taxUnit = existTaxUnid;
	// this.product.taxMultiple = existTaxMult || null;
	// this.product.arrayTaxesConcat = existTaxMult;
	// // this.product.unitId = productData.unitId;
	// this.product.urlImage = productData.urlImage;
	// this.product.weight = productData.weigth;
	// this.product.commerce = productData.commerce;
	// this.product.additionalInformation = productData.additionalInformation;
	// this.personalInformationFeatureAdd = productData.additionalInformation &&
	// 	productData.additionalInformation.features ? productData.additionalInformation.features
	// 	: null;
	// this.product.eCategories = productData.comCategories ?
	// 	productData.comCategories.map(p => p.id) || undefined : productData.eCategories;
	// this.eCategoriesOrigin = [...this.product.eCategories] || undefined;
	// this.product.accountingAccount = productData.accountingAccount || [];
	// this.product.accountingAccount.forEach((paa) => {
	// 	const aaa = this.accountingAccounts.find(aa => aa.code === paa.code);
	// 	this.accountingAccountsAdded.push(aaa);
	// });
	// this.product.warehousesId = productData.warehousesId || productData.warehouseProductDetails;
	// const typeSelected = this.types.find(t => t.id === productData.type);
	// this.originalCodeProduct = productData.code;
	// if (typeSelected) {
	// 	this.onSelectType(typeSelected);
	// }
	// this.commerces = this.commerces.map((p) => {
	// 	const newRow = { ...p };
	// 	const index = this.product.commerce.findIndex(c => c.commerceId === p.id);
	// 	newRow.isSelected = index > -1;
	// 	return newRow;
	// });
	// this.commercesSelected = this.commerces.filter(c => c.isSelected);
	// if (this.product.warehousesId.length > 0) {
	// 	this.warehousesSelected = this.product.warehousesId.reduce((a, wi) => {
	// 		const wItem = this.warehouses.find(w => wi.id === w.id);
	// 		if (wItem) {
	// 			const newW = { ...wItem };
	// 			newW.initQuantity = wi.stockWarehouse || null;
	// 			newW.maxStock = wi.maxStock || null;
	// 			newW.minStock = wi.minStock || null;
	// 			a.push({ ...newW });
	// 		}
	// 		return a;
	// 	}, []);
	// }
	// if (this.product.pricesLists.length > 0) {
	// 	this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
	// 		const newPl = this.product.pricesLists.find(pl => pl.id === pls.id);
	// 		if (newPl) {
	// 			return newPl;
	// 		} else if (this.product.conversions) {
	// 			if (this.product.conversions.length) {
	// 				const newPls = { ...pls };
	// 				const conver = this.product.conversions.map((c) => {
	// 					const newC = {
	// 						discount: 0,
	// 						name: c.name,
	// 						price: 0,
	// 						id: c.id,
	// 						ranges: [],
	// 						salePrice: 0,
	// 						tax: null,
	// 						taxes: 0,
	// 						unitPrice: 0,
	// 					};
	// 					return newC;
	// 				});
	// 				newPls.units = [...conver];
	// 				return newPls;
	// 			}
	// 		}
	// 		return pls;
	// 	});
	// 	this.pricesListsConfigured = this.product.pricesLists.filter(p => p.salePrice > 0 ||
	// 		p.unitPrice > 0);
	// 	this.configuredPriceList = this.pricesListsConfigured.length > 0;
	// }
	// const comPriceDefault = this.$userInfo.salPriceList ? this.$userInfo.salPriceList.id : null;
	// const ecomPriceDefault = this.idListPriceCommerce;
	// const defSelected = ecomPriceDefault || comPriceDefault;
	// const findPrice = this.product.pricesLists.find(p => p.id === defSelected && p.salePrice);
	// this.product.priceSale = findPrice ? findPrice.salePrice || productData.price || 0 :
	// 	productData.price || 0;
	// this.priceToShow = this.product.priceSale;
	// this.dataSelected = this.product.commerce;
	// this.dataSelectedCancel = this.product.commerce;
	// this.setFeaturesSelectedAndActive(this.product.features, this.features);
	// this.getWarehouses = this.product.warehousesId ?
	// 	Boolean(this.product.warehousesId.length) : false;
	// if (this.product.eCategories) {
	// 	this.categoriesSelected = this.categories.reduce((acum, c) => {
	// 		const newAcum = [...acum];
	// 		const index = this.product.eCategories.findIndex(p => p === c.id);
	// 		if (index > -1) {
	// 			newAcum.push({ ...c });
	// 		}
	// 		return newAcum;
	// 	}, []);
	// }
	// this.priceCurrent = productData.price;
	// this.pricesListsConfiguredCurrent = [...this.pricesListsConfigured];
	// this.warehousesCurrent = [...this.warehousesSelected];
	// this.setTypeTaxes();
	// const filterTaxes = this.product.taxes.filter(p => p.flagTypeTaxes === 1);
	// this.formattingTaxes(filterTaxes);
	// this.setComposingProducts(productData);
}

function setComposingProducts({ groups }) {
	if (this.isComposed) {
		const selectedPriceList = this.pricesLists.find(
			(p) => p.flagDefault === 1
		).id;
		this.composingProducts = groups.map((product) =>
			compose(
				setNewProperty('taxes', this.setProductTaxes(product)),
				setNewProperty(
					'salePrice',
					product.product.priceList[selectedPriceList].price
				),
				setNewProperty(
					'price',
					product.product.priceList[selectedPriceList].price
				),
				setNewProperty(
					'unitPrice',
					product.product.priceList[selectedPriceList].unitPrice
				),
				setNewProperty('code', product.product.code),
				setNewProperty('name', product.product.name),
				setNewProperty('stock', product.product.stock),
				setNewProperty('priceCost', product.product.cost),
				setNewProperty('unitsProduct', this.unitsByProduct(product)),
				setNewProperty(
					'pricesListArray',
					this.pricesListByProduct(product.product)
				),
				setNewProperty('units', this.buildUnitsByProduct(product, this.units))
			)(product)
		);
	}
}

function findUnitByUnitIdForEveryProduct({ unitId }, units) {
	const unit = units.find((u) => u.id === unitId);
	return unit || {};
}

function setShowConversions() {
	this.showConversions = !this.showConversions;
}

function setShowHelp(code) {
	this.showHelp[code] = !this.showHelp[code];
}

function setShowPriceList() {
	this.showPriceList = !this.showPriceList;
}

function setTaxIntoPricesLists(taxes) {
	if (this.product.pricesLists) {
		this.product.pricesLists = this.product.pricesLists.map((pl) => {
			const PriceList = new PriceListClass(
				pl,
				this.basePriceUsed,
				this.basePriceComputed,
				taxes
			);
			return compose(
				setNewProperty('salePrice', PriceList.price),
				setNewProperty('unitPrice', PriceList.unitPrice),
				setNewProperty('tax', PriceList.tax),
				setNewProperty('units', pl.units ? PriceList.units : [])
			)(pl);
		});
		this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
			const newPl = this.product.pricesLists.find((pl) => pl.id === pls.id);
			if (newPl) {
				return newPl;
			} else if (this.product.conversions) {
				const newPls = { ...pls };
				if (this.product.conversions.length) {
					const conver = this.product.conversions.map((c) => {
						const newC = {
							discount: 0,
							name: c.name,
							price: 0,
							id: c.id,
							ranges: [],
							salePrice: 0,
							tax: null,
							taxes: 0,
							unitPrice: 0,
						};
						return newC;
					});
					newPls.units = [...conver];
				}
				return newPls;
			}
			return pls;
		});
		this.pricesListsConfigured = this.product.pricesLists.filter(
			(p) => p.salePrice || p.unitPrice
		);
		this.configuredPriceList = this.pricesListsConfigured.length > 0;
	}
	if (!this.id) {
		this.loadingGeneral = false;
	}
}

// function setTaxSelectedUnd({ model, value }) {
// 	if (value) {
// 		this.product.taxCostPercentage = value.percentage || 0;
// 		// const objIva = this.typeTaxes.find(t => t.flagTaxes === 1);
// 		// const newTax = {
// 		// 	...value,
// 		// 	flagTypeTaxes: value.flagTypeTaxes,
// 		// 	name: value.description,
// 		// 	codePercentage: value.code,
// 		// 	codeTable: objIva.codeTable,
// 		// 	flagSales: !!objIva.flagTaxes,
// 		// 	percentage: value.percentage || 0,
// 		// };
// 		// console.log({ newTax });
// 		// this.product[model] = newTax;
// 		// this.product.taxes = [newTax];
// 		// this.setTaxIntoPricesLists([this.product.taxUnit]);
// 	} else if (!this.id) {
// 		this.loadingGeneral = false;
// 	}
// }

// function setState({ model, value }) {
// 	if (value) {
// 		this.product[model] = value;
// 	} else if (!this.id) {
// 		this.loadingGeneral = false;
// 	}
// }

function setTaxSelected({ model, value }) {
	if (value) {
		const objIva = this.typeTaxes.find((t) => t.flagTaxes === 1);
		const arr = value.reduce((accum, i) => {
			const newAcum = [...accum];
			const newTax = {
				code: this.isEcuador && objIva ? objIva.code || i.code : i.code,
				codePercentage: this.isEcuador ? i.codePercentage || i.value : i.code,
				codeTable: objIva.codeTable,
				id: i.id,
				flagTypeTaxes: value.flagTypeTaxes || 0,
				name: i.description || i.name,
				flagSales: !!objIva.flagTaxes,
				percentage: i.percentage || 0,
			};
			newTax.idCodeReference = `${newTax.code}${newTax.percentage || 0}`;
			newAcum.push(newTax);
			return newAcum;
		}, []);
		this.product[model] = arr;
		this.product.arrayTaxesConcat = arr;
		// this.product.taxes.push({ ...arr });
	} else if (!this.id) {
		this.loadingGeneral = false;
	}
}

function setTypeTaxes() {
	if (this.commerceId && !this.id) {
		this.product.commerce[0] = {
			code: this.commerceCode,
			commerceId: this.commerceId,
		};
		this.commerceData = { ...getLocalData('commerce-selected') };
		this.generalTaxes = h.getLocalData('general-taxes');
	}
}

function setUnitData({ model, value }) {
	this.newUnit[model] = value;
}

function setBrandData({ model, value }) {
	this.newBrand[model] = value;
}

function setValueFeatureData(valFeat, { model, value }) {
	this.$set(valFeat, model, value);
}

function setValuesFeatures(idx, val) {
	const arrayLength =
		this.valuesFeatures.length > 0
			? this.valuesFeatures.length * val.length
			: val.length;
	if (idx === 0) {
		for (let index = 0; index < arrayLength; index += 1) {
			this.$set(this.valuesFeatures, index, {
				id: index + 1,
				name: `/ ${val[index].name}`,
				warehouseId: 0,
				initQuantity: 0,
				minQuantity: 0,
				maxQuantity: 0,
			});
		}
	}
}

function setWarehouseId({ value }) {
	if (value.some((id) => id === 0)) {
		this.product.warehousesId = this.warehouses.reduce((list, w) => {
			if (w.id) {
				return list.concat(w.id);
			}
			return list;
		}, []);
	} else {
		this.product.warehousesId = value;
	}
}

function showAccountingData() {
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	const subsidiaryConfigIntegrations =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	return subsidiaryConfigIntegrations;
}

function showFlagReplicate() {
	return (
		this.id &&
		(!this.finishProductSelected ||
			(this.finishProductSelected && this.warehousesSelected.length > 0))
	);
}

function showModalCreateProduct() {
	this.createNewProduct();
}

function stockByWarehouse(warehouses) {
	this.product.warehousesId = warehouses;
	this.cancelModal();
}

function successBtnName() {
	// if (this.cloneProduct) {
	// 	return 'Aceptar';
	// }
	return this.id ? 'Actualizar' : 'Aceptar';
}

function switchHelp() {
	this.showHelpNote = !this.showHelpNote;
}

function titleForm() {
	if (this.$route.params.cloneProduct) {
		return 'CLONAR PRODUCTO';
	}
	return this.id ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO';
}

function toogleOpen(priceListIndex) {
	const openValue = !this.pricesListsSlide[priceListIndex].open;
	this.$set(this.pricesListsSlide[priceListIndex], 'open', openValue);
}

function transformUnitsToArray(unitsObject) {
	const self = this;
	return Object.keys(unitsObject).map((k) => {
		const newUnits = { ...unitsObject[k] };
		newUnits.id = Number(k);
		newUnits.salePrice = unitsObject[k].price;
		newUnits.discount = unitsObject[k].discount || 0;
		newUnits.name = (self.units.find((c) => c.id === Number(k)) || {}).name;
		newUnits.tax = null;
		return newUnits;
	});
}

function typeProducts() {
	if (this.$userInfo.company.settings.typeProductsCreationPermission) {
		return (
			this.$userInfo.company.settings.typeProductsCreationPermission.length !==
				1 || this.flagShowVariations
		);
	}
	return true;
}

function typeProductsCreationPermission() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const typeProductsCreationPermissionKey = settingsKeys.find(
		(k) => k === 'typeProductsCreationPermission'
	);
	if (!typeProductsCreationPermissionKey) {
		if (this.types.length > 0) {
			return this.types.map((t) => t.id);
		}
		return [];
	}
	return [].concat(companySettings[typeProductsCreationPermissionKey]);
}

async function updateUnity() {
	try {
		const { data: unitCreated } = await this.$httpProducts.post(
			'units',
			this.newUnit
		);
		this.showNotification('La unidad ha sido creada correctamente.');
		this.cancelModal();
		this.loadUnits(unitCreated);
		this.jailai.unit += 1;
	} catch (error) {
		this.showGenericError();
	}
}

async function updateBrand() {
	try {
		const { data: brandCreated } = await this.$httpProducts.post(
			'brands',
			this.newBrand
		);
		this.showNotification('La marca ha sido creada correctamente.');
		this.cancelModal();
		this.loadBrands(brandCreated);
	} catch (error) {
		this.showGenericError();
	}
}

function validatingForSave() {
	// const typeSelectedData = this.types.find(t => t.id === this.product.type) || {};
	// const variantSelected = typeSelectedData.code === 'variantes';
	// const invalidComposedProducts = isEmpty(this.composingProducts);
	// const invalidComposedWarehouse = isEmpty(this.warehousesSelected);
	// const invalid = [
	// 	this.$v.$invalid,
	// 	(variantSelected && this.featuresSelected.length === 0),
	// 	this.isComposed ? invalidComposedProducts || invalidComposedWarehouse : false,
	// ].some(el => el === true);

	if (this.id) {
		return [this.isLoadingImage, this.isLoading].some((el) => el === true);
	}

	const invalid = this.$v.$invalid;

	return [
		!this.availableCode,
		invalid,
		this.isLoadingImage,
		this.isLoading,
	].some((el) => el === true);
}

function validatingPriceSaleMin(val) {
	if (this.minimumSalePriceFlag) {
		const { pricesLists } = this.product;
		const filteredPricesLists = pricesLists.filter((p) => p.salePrice > 0);
		const validatorArray = filteredPricesLists.map((pl) => val > pl.salePrice);
		const result = validatorArray.every((v) => !v);
		if (!result) {
			this.showNotification(
				'Uno de los precios de venta es menor al precio minimo de venta',
				'error'
			);
		}
		return result;
	}
	return true;
}

function validations() {
	return {
		product: {
			cmsCategoryId: { required },
			code: { required },
			name: { required },
			cmsUnitId: { required },
			// score: { required },
		},
	};
}

function validUnit() {
	this.currentUnit =
		this.units.find((u) => u.id === this.product.cmsUnitId) || {};
	setTimeout(() => {
		this.loadingGeneral = false;
	}, 2000);
}

function warehouseFormatId(warehouses) {
	return warehouses.map((w) =>
		compose(
			setNewProperty('id', w.id),
			setNewProperty('minStock', w.minStock || 0),
			setNewProperty('maxStock', w.maxStock || 0)
		)({})
	);
}

function warehouseFormat(warehouses) {
	return warehouses.map((w) =>
		compose(
			setNewProperty('id', w.id),
			setNewProperty('stock', w.initQuantity || 0),
			setNewProperty('minStock', w.minStock || 0),
			setNewProperty('maxStock', w.maxStock || 0)
		)({})
	);
}

function warehousesEdited() {
	return this.warehousesSelected.length !== this.warehousesCurrent.length;
}

function watchPricesListsSlide(val) {
	if (val && val.length > 0) {
		this.disabled = val.every((v) => !v.salePrice && !v.unitPrice);
	} else {
		this.disabled = true;
	}
}

function setFeaturesSelectedAndActive(productFeatures, allFeatures) {
	this.featuresSelected = matchBetweenArrays(
		[productFeatures, 'id'],
		[allFeatures, 'id']
	);
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	if (this.searchVal) {
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 739;
		this.action.open = true;
	}
}

function allowProductFree() {
	const adminUser = h.getLocalData('admin-user');
	return getDeeper('subsidiary', 'settings', 'allowProductFree')(adminUser);
}

function setProduct(prod) {
	this.selectedProduct = this.setNewComposingProduct(prod);
	this.selectedProductName = prod.name;

	// Seleccionar automaticamente la primera lista de precios
	this.setPriceList(this.selectedProduct.pricesListArray[0]);
	this.cancelModal();
}

function setNewComposingProduct(product) {
	return compose(
		setNewProperty('taxes', this.setProductTaxes(product)),
		setNewProperty('unitsProduct', this.unitsByProduct(product)),
		setNewProperty('units', this.buildUnitsByProduct(product, this.units)),
		setNewProperty('pricesListArray', this.pricesListByProduct(product)),
		setNewProperty('quantity', 1)
	)(product);
}

function unitsByProduct(item) {
	if (item.product.conversions) {
		const keys = Object.keys(item.product.conversions);
		const newUnits = this.units.reduce((acum, unt) => {
			const index = keys.findIndex((k) => Number(k) === unt.id);
			if (index > -1) {
				const quantityUnit =
					item.product.conversions[unt.id] &&
					item.product.conversions[unt.id].quantity;
				acum.push({ ...unt, quantity: quantityUnit });
			}
			return acum;
		}, []);
		if (item.unit) {
			newUnits.push(item.unit);
		} else {
			const unit = {
				// id: item.unitId,
				code: item.unitCode,
				name: item.unitName,
			};
			newUnits.push(unit);
		}
		return newUnits;
	}
	return [];
}

function setProductTaxes(product) {
	const {
		product: { taxes },
	} = product;
	const activeTaxes = taxes.find((t) => t.flagSales);
	return activeTaxes.percentage;
}

function pricesListByProduct(product) {
	const pricesListIds = Object.keys(product.priceList);
	const commonPricesList = [];

	pricesListIds.forEach((id) => {
		const foundIt = this.pricesLists.find((pl) => pl.id === Number(id));
		if (foundIt) {
			commonPricesList.push(foundIt);
		}
	});

	return commonPricesList;
}

function buildUnitsByProduct(product, units) {
	const { unit, conversions } = product.product;
	const unitsByProducts = [
		unit || this.findUnitByUnitIdForEveryProduct(product, units),
	];

	// recorrer conversions y agregar las unidades al producto
	if (conversions) {
		Object.keys(conversions || {}).forEach((key) => {
			const foundIt = units.find((u) => u.id === Number(key));
			if (foundIt) {
				unitsByProducts.push(foundIt);
			}
		});
	}

	return unitsByProducts;
}

// function updateComposingProducts(rows) {
// 	this.composingProducts = [...rows];
// }

function setPriceList(list) {
	if (list && list.id) {
		this.selectedProduct.selectedPriceListId = list.id;

		// actualizar priceCost con la lista de precios seleccionada
		const selectedPlProduct = this.selectedProduct.product.priceList[list.id];
		this.selectedProduct.unitPrice = selectedPlProduct.unitPrice;
	}
}

function addProduct() {
	this.cleanInput = true;
	this.onClean = true;
	this.composingProducts = [].concat(
		this.composingProducts,
		this.selectedProduct
	);
}

// function updateProductUnit({ value, product }) {
// 	// obtener la lista precios del objeto product
// 	const { priceList: plLocal } = product.product;
// 	const selectedPlProduct = plLocal[product.selectedPriceListId];
// 	// Obtener el arreglo de unidades de la lista de precios seleccionada
// 	// buscar el precio correcto de acuerdo a la unidad entrante
// 	const { units } = selectedPlProduct || product;
// 	const selectedUnit = units[value.id];

// 	this.composingProducts = this.composingProducts.map((c) => {
// 		const newC = { ...c };

// 		if (c.id === product.id) {
// 			const unitQuantity = c.unitsProduct.find(p => p.id === value.id);
// 			newC.unitConversion = Number(unitQuantity.quantity);
// 			newC.unitQuantity = Number(c.quantity * unitQuantity.quantity);
// 			newC.selectedUnitId = value.id;
// 			if (selectedUnit) {
// 				newC.unitPrice = selectedUnit && selectedUnit.unitPrice ?
// 					selectedUnit.unitPrice : selectedPlProduct.unitPrice;
// 			} else {
// 				newC.unitPrice = product.unitPrice;
// 			}
// 		}

// 		return newC;
// 	});
// }

function updateQuantity(product) {
	this.composingProducts = this.composingProducts.map((c) => {
		const newC = { ...c };
		if (c.id === product.id) {
			newC.unitConversion = Number(c.unitConversion);
			newC.unitQuantity = Number(c.unitConversion * c.quantity);
		}
		return newC;
	});
}

function warehousesLabel() {
	return this.isComposed ? 'ALMACENES' : '¿DESEA AGREGAR STOCK?';
}

function setDataBrand({ model, value }) {
	this.product[model] = value.id;
}

function setProductDataNumber({ model, value }) {
	if (value) {
		this.product[model] = Number(value);
	}
}

function clearInformationProduct() {
	this.product.taxUnit = {};
	this.product.arrayTaxesConcat = [];
	this.arrayTaxesGeneral = [];
	this.product.code = null;
	this.product.taxMultiple = [];
	this.arrayTaxesComplement = null;
	if (this.cloneProduct) {
		this.product.warehousesId = [];
		this.warehousesCurrent = [];
		this.warehousesSelected = [];
	}
	this.loadRateTaxes();
}

function watchRoute(value) {
	if (value.name === 'new-master-product') {
		this.clearInformationProduct();
	}
}

function labelControlInventory() {
	return this.product.flagNotControlInventory ? 'sin' : 'con';
}

function changeTaxCost(value) {
	this.product.cost = value
		? fourDecimals(
				this.product.cost * (1 + this.product.taxCostPercentage / 100)
		  )
		: (this.product.cost = fourDecimals(
				this.product.cost / (1 + this.product.taxCostPercentage / 100)
		  ));
}
// Para volver a la página anterior
function goBack() {
	this.$router.go(-1);
}

function data() {
	return {
		id: this.$route.params.id || null,
		arrayDomains: false,
		accountingAccount: {},
		accountingAccounts: [],
		accountingAccountsAdded: [],
		arrayTaxesComplement: [],
		arrayTaxesGeneral: [],
		personalInformationFeatureAdd: [],
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actionProduct: '',
		allSelected: false,
		availableCode: false,
		availableIcon: 'clear',
		brands: [],
		categories: [],
		normalCategories: [],
		featuresInformation: [],
		categoriesSelected: [],
		checking: false,
		checkAll: false,
		cleanData: false,
		cleanInput: false,
		cloneProduct: false,
		commerceData: {},
		commerces: [],
		commercesSelected: [],
		composedProductSelected: false,
		composingProducts: [],
		configuredPriceList: false,
		currentUnit: {},
		dataSelected: [],
		dataSelectedCancel: [],
		defaultConversion: {
			barcode: null,
			id: null,
			quantity: null,
			quantityTo: 1,
			unitFrom: null,
			code: null,
			name: null,
		},
		defaultRange: { price: 0, from: 0, to: 0 },
		dialog: false,
		dialogImage: false,
		disabled: false,
		disabledConversion: true,
		eCategoriesSelected: [],
		eCategorySelected: null,
		eCategoriesOrigin: [],
		generalTaxes: [],
		feature: {},
		features: [],
		featuresSelected: [],
		finishProductSelected: false,
		flagAccumPoint: false,
		flagPriceListReplicate: true,
		getWarehouses: false,
		idListPriceCommerce: null,
		isLoading: false,
		idProductClone: null,
		jailai: {
			brand: 0,
			category: 0,
			unit: 0,
		},
		loadingAddAccount: false,
		loadingAddConversion: false,
		loadingAddVariations: false,
		loadingCat: false,
		loadingFeature: false,
		loadingGeneral: false,
		message: null,
		maximumSalePriceFlag: false,
		minimumSalePriceFlag: false,
		modal: {
			code: '',
			items: [],
			multiple: false,
			open: false,
			title: '',
		},
		newBrand: {
			code: '',
			name: '',
		},
		newCommerces: {},
		product: {
			code: null,
			name: null,
			description: null,
			urlImage: null,
			dataImage: null,
			slug: null,
			alternateCode: [],
			cmsCategoryId: null,
			codeCategory: null,
			slugCategory: null,
			nameCategory: null,
			cmsBrandId: null,
			nameBrand: '',
			codeBrand: '',
			slugBrand: '',
			cmsUnitId: null,
			codeUnit: null,
			nameUnit: null,
			cost: 0,
			taxCostPercentage: null,
			price: 0,
			conversions: [],
			reviewStatus: 1,
			jsonReport: null,
			jsonAudit: null,
			flagActive: 1,
			typeCategory: 1,
		},
		newUnit: {
			code: '',
			color: '#000000',
			flagActive: 1,
			name: '',
		},
		onClean: false,
		priceCurrent: null,
		priceListObject: {
			discount: 0,
			name: '',
			ranges: [],
			salePrice: 0,
			tax: null,
			units: [],
			unitPrice: 0,
		},
		pricesListsConfigured: [],
		pricesListsConfiguredCurrent: [],
		pricesLists: [],
		pricesListsSlide: [],
		priceToShow: 0,
		productDataComplete: {},
		productSubsidiaryId: null,
		searchVal: null,
		selectedProduct: {
			pricesListArray: [],
		},
		selectedProductName: '',
		showConversions: true,
		showFeaturesSelect: false,
		showCodeGenerate: true,
		showLotSelected: false,
		show10Percentage: false,
		showStockNegative: false,
		showIOT: false,
		showBrandConfig: false,
		showHelp: {
			maxPrice: false,
			minPrice: false,
			price: false,
		},
		showHelpNote: false,
		showModalBrand: false,
		showPriceList: true,
		taxes: [],
		taxSelected: {},
		types: [],
		typeTaxes: [],
		units: [],
		unitPriceListObject: {
			discount: 0,
			name: '',
			ranges: [],
			salePrice: 0,
			showUnits: false,
			tax: null,
			unitPrice: 0,
		},
		valuesFeatures: [],
		warehouses: [],
		warehousesCurrent: [],
		warehousesSelected: [],
		originalCodeProduct: null,
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
		listStatus: [
			{
				id: 1,
				desc: 'Activo',
			},
			{
				id: 0,
				desc: 'Inactivo',
			},
		],
		typesCategory: [
			{
				id: 1,
				desc: 'A código',
			},
			{
				id: 2,
				desc: 'A granel',
			},
		],
	};
}

export default {
	name: 'page-new-master-product',
	components: {
		actionSidebar,
		appActions,
		assignCategories,
		assignCommerces,
		autocompleteComponent,
		categoriesAutocomplete,
		brandForm,
		composingProductList,
		createCategory,
		featuresAction,
		featuresConfig,
		headerPage,
		modalItems,
		imageComponent,
		newCategory,
		priceList,
		pricesListSet,
		productAccountingData,
		productAditionalInformation,
		productsSearchForm,
		productsSearchInput,
		productTaxesConfig,
		cmsUnitConversion,
		unitsForm,
		selectWarehouse,
		VueSixFour,
	},
	computed: {
		allowProductFree,
		basePriceComputed,
		// basePriceUsed,
		cancelBtnName,
		editName,
		filteredUnits,
		fundamentalUnits,
		flagCodeProductAuto,
		flagConvers,
		flagShowVariations,
		isComposed,
		isGetWarehousesStock,
		isPriceListPrice,
		isProductSearcher,
		isServices,
		isTaxesConfig,
		labelControlInventory,
		priceEdited,
		priceLabel,
		showAccountingData,
		showFlagReplicate,
		successBtnName,
		titleForm,
		typeProducts,
		typeProductsCreationPermission,
		validatingForSave,
		warehousesEdited,
		warehousesLabel,
	},
	created,
	data,
	methods: {
		// acceptPricesLists,
		// actionFeature,
		// addAccount,
		// addConversion,
		// addFeatures,
		addItems,
		addProduct,
		addRow,
		// addUnitIntoPriceList,
		// articleWarehouse,
		// assignCommerce,
		// buildBody,
		// buildPriceList,
		// buildProductGroups,
		// buildUnits,
		buildUnitsByProduct,
		setDataBrand,
		cancelDialog,
		cancelDialogImage,
		cancelModal,
		changeTaxCost,
		checkingAbailability,
		cleanActionObject,
		cleanSelectedProduct,
		clearInformationProduct,
		clearWarehousesStock,
		closeAssignCommerce,
		closeModal,
		createCategories,
		// createFeature,
		createNewProduct,
		// defaultTaxes,
		deleteAccount,
		deleteCategorySelected,
		deleteCommerceSelected,
		deleteFeatureSelected,
		deleteImagenProduct,
		deleteWarehouseSelected,
		ecommerceRoute,
		eliminatePercentageFromTaxes,
		findUnitByUnitIdForEveryProduct,
		formattingConversions,
		formattingTaxes,
		getAction,
		getAndSetPricesList,
		getMethod,
		getTaxes,
		getUrl,
		goToExpense,
		goToIncome,
		goToMasterProductEditing,
		goToMasterProductList,
		itemSelected,
		loadAccountingAccounts,
		loadBrands,
		loadCategories,
		// loadCommerces,
		loadFeaturesBySubsidiary,
		loadProductInfo,
		loadRateTaxes,
		loadResources,
		loadUnits,
		onAllSelected,
		onSelectType,
		openDialogImagen,
		openModal,
		openSearch,
		openSlideModal,
		// priceListFormatting,
		pricesListByProduct,
		redirecting,
		removeAlternateCode,
		removeConversion,
		// removeUnitFromPriceList,
		routeChange,
		runAction,
		saveAccountingData,
		saveCategories,
		selectedAll,
		selectedRow,
		setAdditionalInformation,
		setBrandData,
		setProductDataNumber,
		setComposingProducts,
		setConversion,
		setConversionFromProduct,
		setData,
		// setDefaultProductType,
		// setDefaultUnit,
		setFeaturesSelectedAndActive,
		setFinishedProducts,
		setFlagData,
		setFlagVariant,
		setItemData,
		setMinSalePrice,
		setMaxSalePrice,
		setNewComposingProduct,
		setPriceList,
		setPriceListData,
		setProduct,
		setProductData,
		// setProductFeatures,
		setProductInfo,
		setProductTaxes,
		setShowConversions,
		setShowHelp,
		setShowPriceList,
		setTaxIntoPricesLists,
		setTaxSelected,
		// setTaxSelectedUnd,
		// setState,
		setTypeTaxes,
		setUnitData,
		setValueFeatureData,
		setValuesFeatures,
		setWarehouseId,
		showModalCreateProduct,
		stockByWarehouse,
		switchHelp,
		toogleOpen,
		transformUnitsToArray,
		unitsByProduct,
		updateBrand,
		// updateComposingProducts,
		// updateProductUnit,
		updateQuantity,
		updateUnity,
		validatingPriceSaleMin,
		validUnit,
		warehouseFormat,
		warehouseFormatId,
		goBack,
		printProduct() {
			console.log(this.product);
		},
		setImageConversion(conversions, index) {
			const { model, value } = conversions;
			const conversion = this.product.conversions[index];
			conversion[model] = value;
			this.$set(this.product.conversions, index, conversion);
		},
	},
	mixins: [upLoadImageMixin],
	props: {
		commerceCode: [String, Number],
		commerceId: [Number, String],
		// id: [Number, String],
		subsidiaryId: [Number, String],
	},
	validations,
	watch: {
		captureLocation,
		'$route.name': routeChange,
		$route: {
			deep: true,
			handler: watchRoute,
		},
		pricesListsSlide: {
			deep: true,
			handler: watchPricesListsSlide,
		},
	},
};
</script>
<style lang="scss" scoped>
.checking-abailability {
	align-items: center;
	border-radius: 50%;
	bottom: 0px;
	color: white;
	display: flex;
	height: 15px;
	justify-content: center;
	margin: auto;
	position: absolute;
	right: 7px;
	width: 15px;

	.material-icons {
		font-size: size(small);
		font-weight: bold;
	}
}

.available {
	background-color: color(success);
}

.not-available {
	background-color: color(error);
}

.message-image {
	color: map-get($colors, subheaderText);
	font-size: 11px;
}

label {
	font-size: 12px;
}

.add-stock {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: font(lato-bold);
	font-size: size(small);
	padding: 6px 8px;
	width: 100%;
}

.conversion-btn {
	width: 100%;
}

.conversions-container {
	align-items: flex-end;
	display: flex;
	justify-content: flex-start;
	margin-bottom: 15px;
}

.base-price {
	align-items: center;
	background-color: white;
	border-radius: 3px;
	display: flex;
	font-family: font(lato-bold);
	height: 32px;
	justify-content: center;
	margin: 0 8px;
	width: 32px;
}

.base-price-active {
	background-color: color(primary);
	color: color(white);
}

.base-price:last-child {
	margin-right: 30px;
}

.price-list-alternate {
	margin: 0 20px;
}

.price-list-alternate:nth-child(even) {
	background-color: color(blue-grey);
}

.page-buttons {
	height: 78px;
}

.main-form {
	background-color: color(maki-white);
	min-height: calc(100vh - 100px);
	padding-bottom: 100px;
	padding-top: 5px;
}

.minimum-price-title-container {
	align-items: center;
	border-bottom: 1px solid color(blue-grey);
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	padding-left: 24px;

	label {
		font-size: size(medium);
		font-weight: bold;
	}

	.master-product-flag {
		flex: 0 0 10%;
	}
}

.minimum-price-container {
	align-items: center;
	display: flex;
	padding-left: 24px;

	.minimum-price-input {
		flex: 0 0 17%;
		margin-right: 10px;
	}

	.minimum-price-note-wrapper {
		align-items: center;
		display: flex;
		flex: 0 0 55%;
		justify-content: space-between;

		.material-icons {
			margin: 0 20px;
		}

		.minimum-price-note {
			font-size: size(small);
			margin: 0;
			text-align: left;
		}
	}
}

.price-list-container {
	max-height: 290px;
	overflow-y: auto;
}

.content-unit {
	margin-top: -6px;
}

.title-section,
.subtitle-section {
	border-bottom: 1px solid color(border-green-light);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(small13);
	letter-spacing: normal;
	margin-bottom: 14px;
	margin-top: 20px;
	padding-bottom: 8px;
	text-transform: uppercase;

	&-caption {
		font-family: font(open-regular);
		font-size: size(small10);
		text-transform: none;
	}
}

.subtitle-section {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(small);
}

.title-section {
	.subtitle-section {
		border-bottom: 0px;
		font-size: size(small10);
		margin: 0px !important;
		padding-bottom: 0px !important;
		text-transform: none !important;
	}
}

.product-image {
	border-radius: 4px;
	max-height: 90%;
	max-width: 90%;

	&-hover {
		align-content: center;
		background-color: rgba(0, 0, 0, 0.35);
		border-radius: 4px;
		bottom: 0px;
		color: color(white);
		display: none;
		flex-direction: row;
		flex-wrap: wrap;
		font-family: font(open-bold);
		font-size: size(small13);
		height: 100%;
		justify-content: center;
		left: 0px;
		margin: auto;
		max-height: 90%;
		max-width: 90%;
		position: absolute;
		right: 0px;
		top: 0px;
		width: 100%;
	}

	&-hover-delete {
		display: none;
		position: absolute;
		top: 13px;
		right: 10px;
	}
}

.product-image-container {
	align-items: center;
	background-color: rgba(156, 166, 176, 0.07);
	border: 1px dashed #9ca6b0;
	border-radius: 5px;
	color: rgba(156, 166, 176, 0.4);
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	font-family: font(open-bold);
	font-size: size(medium15);
	height: 206px;
	justify-content: center;
	max-width: 232px;
	position: relative;
	width: 100%;

	&:hover > .product-image-hover {
		display: flex;
	}

	&:hover > .product-image-hover-delete {
		display: block;
	}
}

.product-image-loading {
	color: color(black);
}

.position-relative {
	position: relative;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.product-general-column {
	flex-grow: 0;

	&.image {
		flex-basis: 50%;
		max-width: 50%;
		padding-right: 20px;

		@media (min-width: 1200px) {
			flex-basis: 252px;
			max-width: 252px;
			padding-right: 0px;
		}
	}

	&.data {
		flex-basis: 50%;
		max-width: 50%;

		@media (min-width: 1200px) {
			flex-basis: calc(100% - 252px);
			max-width: calc(100% - 252px);
		}
	}
}

.product-input-group {
	margin-bottom: 8px;
}

.product-description {
	color: color(brown-grey);
	display: flex;
	font-family: font(open-regular);
	font-size: size(small);
	justify-content: space-between;
	position: relative;

	&-check {
		min-height: 15px;
		min-width: 15px;
		position: absolute;
		right: 0px;
		width: 15px;
	}

	&-absolute {
		position: absolute;
		right: 0px;
		top: 4px;
	}
}

.product-general-block {
	margin-top: 14px;
}

.product-general-last {
	margin-top: 7px;
}

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
		height: 53px;
		justify-content: space-between;
		padding: 0px 17px 0px 29px;

		&-row {
			font-family: font(lato-bold);
			font-size: size(medium);
			text-transform: uppercase;
		}
	}

	&-body {
		height: 276px;
		overflow-y: scroll;
		padding: 0px;

		&-item {
			padding: 7px 29px;
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

.product-checkbox {
	align-items: center;
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	display: flex;
	justify-content: center;

	&-label {
		align-items: center;
		color: color(paginationText);
		display: flex;
		font-family: font(lato-regular);
		font-size: size(medium);

		& > span:not(.product-checkbox) {
			// max-width: calc(100% - 16px);
			padding-left: 13px;
		}
	}

	&.product-checkbox-modal {
		border-color: color(primary);
		height: 15px;
		width: 15px;

		&-item {
			border-color: #e4e4e4;
			height: 15px;
			width: 15px;

			&.product-checkbox-active {
				border-color: color(primary) !important;
			}
		}
	}

	&-text {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small);
		padding-left: 6px !important;
	}

	&.product-checkbox-form {
		height: 12px;
		width: 12px;
	}

	&.product-checkbox-subtitle {
		height: 15px;
		width: 15px;
	}
}

.product-modal-close {
	height: auto !important;
	margin: 0px !important;
	width: auto !important;
}

.inventory-selected-item {
	align-items: center;
	background-color: rgba(195, 231, 232, 0.56);
	border: 1px solid color(primary);
	border-radius: 4px;
	color: color(primary);
	display: flex;
	font-family: font(open-regular);
	font-size: size(small);
	height: 17px;
	margin-right: 5px;
	margin-bottom: 5px;
	max-width: 120px;
	padding: 0px 1px 0px 8px;

	&-name {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small10);
		text-transform: uppercase;
	}
}

.btn-delete-warehouse-selected {
	margin-left: 10px !important;
	width: 13px !important;
}

label.product-add-btn-icon {
	display: flex;
}

.help-message {
	align-items: center;
	color: color(paginationText);
	display: flex;
	font-family: font(open-light);
	font-size: size(small10);
	min-height: 25px;
}

.title-warehouses {
	border-bottom: 1px solid #d9e8e9;
	color: color(subheaderText);
	font-size: 14px;
	margin-bottom: 8px;
	padding-bottom: 8px;
}

.name-warehouses {
	color: color(color-input);
	font-size: 14px;
}

.price-list-configured {
	&-container {
		background-color: color(top-background);
		height: 41px;
		padding: 0px 12px;
	}

	&-name {
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small10);
		text-transform: uppercase;
	}

	&-label {
		color: color(paginationText);
		display: block;
		font-family: font(open-regular);
		font-size: size(small10);
		height: 10px;
		line-height: 7px;
	}

	&-value {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small);
	}
}

.dialog {
	margin: 0px !important;
}

.headline {
	color: color(grey-border) !important;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
	justify-content: center !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto !important;
	max-width: 340px !important;
	padding-top: 37px !important;
	text-align: center !important;
}

.subtext {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto !important;
	max-width: 340px !important;
	padding: 34px 0px 0px !important;
	text-align: center !important;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.btn-dialog {
	position: absolute;
	right: 10px;
	top: 9px;
}

.loading {
	background-color: rgba(0, 0, 0, 0.5);
	height: 100vh;
	left: 0px;
	position: fixed;
	top: 0px;
	width: 100%;
	z-index: 10;

	&-message {
		background-color: color(white);
		border: 2px solid color(primary);
		border-radius: 6px;
		bottom: 0px;
		font-family: font(open-semibold);
		height: fit-content;
		height: -moz-fit-content;
		left: 0px;
		margin: auto;
		max-width: 520px;
		padding: 15px 20px;
		position: absolute;
		right: 0px;
		text-align: center;
		top: 0px;
		width: fit-content;
		width: -moz-fit-content;
	}
}

.price-list-name {
	color: color(primary);
	font-size: 11px;
	margin-bottom: 0.5rem;
}

.opacity-input {
	opacity: 0.5;
}

.price-list-name {
	color: color(primary);
	font-size: 11px;
	margin-bottom: 0.5rem;
}

.bold {
	font-family: map-get($fonts, lato-bold);
}

.label--text {
	color: #8f8f8f !important;
	font-size: 13px;
}
</style>
