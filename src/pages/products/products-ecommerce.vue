<template>
	<div class="products-ecommerce">
		<header-page
			class="px-5"
			name="create-product"
			:title="$route.meta.title"
		/>
		<app-actions
			class="actions-products-ecommerce"
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<!-- <v-layout row v-if="validatingEcommerceProduct">
			<v-flex xs12>
				<v-layout>
					<v-flex>
						<v-alert :value="invalidCategories" type="info">
							Es necesario agregar categorias, click en el botón acciones y Asignar Categorías Ecommerce
						</v-alert>
						<v-alert :value="invalidSections" type="info">
							Es necesario agregar secciones, click en el botón acciones y Asignar Secciones
						</v-alert>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout> -->
		<v-layout wrap justify-space-around mb-5 pt-4>
			<v-flex xs5>
				<v-layout wrap>
					<v-flex xs12 mb3>
						<v-subheader class="px-0 py-1 block-title"> Imágenes </v-subheader>
						<v-divider></v-divider>
						<v-flex xs12 mt-4>
							<v-flex xs12>
								<v-layout wrap align-center>
									<v-tabs
										align-with-title
										color="grey lighten-3"
										right
										slider-color="primary"
										class="br-8"
										v-model="active"
									>
										<v-tab
											v-for="tab in tabs"
											:key="tab.id"
											active-class="blue--text"
										>
											<span>{{ tab.name }}</span>
										</v-tab>
										<v-tabs-items>
											<div class="background-gray">
												<v-layout
													wrap
													justify-center
													align-end
													class="mb-3 px-4"
												>
													<v-flex xs3 pr-2>
														<app-input-text
															label="Orden"
															model="order"
															type="number"
															:text="imageModel.order"
															@input="setImageModel"
														/>
													</v-flex>
													<v-flex xs6>
														<label
															ref="labelEcommerceProduct"
															for="upload-file"
														>
															<vue-six-four
																id="upload-file"
																hidden
																@vue-six-four="getFile"
																ref="vueSixFour"
															/>
															<v-layout wrap align-end>
																<v-flex xs10>
																	<app-input-text
																		label="Seleccionar Imagen"
																		readonly
																		:text="imageModel.urlImage"
																	/>
																</v-flex>
																<v-flex xs2 mt-4 text-xs-left>
																	<v-btn
																		@click="showDialog"
																		class="ma-0 pl-0 btn-auto btn-upload-image"
																		small
																		color="info"
																	>
																		<img
																			src="/static/img/upload-image.svg"
																			alt="Subir Imagen"
																			height="16"
																			width="24"
																		/>
																	</v-btn>
																</v-flex>
															</v-layout>
														</label>
													</v-flex>
													<v-flex xs3 pl-3>
														<v-btn
															:disabled="disabledAddImage"
															color="success"
															class="btn-action btn-product"
															@click="addImage"
														>
															Agregar Imagen
														</v-btn>
													</v-flex>
												</v-layout>
											</div>
											<div class="white">
												<app-table
													class="mb-0 is-not-selectable"
													padding="pa-2"
													:columns="columns"
													:filter-columns="false"
													:input-search="false"
													:caption-quantity="false"
													:rows="rowsImages"
												>
													<template slot="rows" slot-scope="props">
														<td
															class="is-not-selectable"
															v-show="showRow(columns, 1)"
														>
															{{ props.row.order }}
														</td>
														<td v-show="showRow(columns, 2)">
															{{ props.row.name }}
														</td>
														<td v-show="showRow(columns, 3)">
															<img
																class="table-image"
																:src="props.row.urlImage"
																:alt="props.row.name"
															/>
														</td>
														<td v-show="showRow(columns, 4)">
															<app-select
																:disabled="unitsFiltered.length === 1"
																:item="props.row.unitId"
																item-text="name"
																item-value="id"
																:items="unitsFiltered"
																model="unitId"
																@input="setUnitId(props.row, $event)"
															></app-select>
														</td>
														<td class="td-action" v-show="showRow(columns, 5)">
															<app-tooltip-button
																color="warning"
																:icon="
																	props.row.flagPrincipal
																		? 'star'
																		: 'star_border'
																"
																text="Imagen Principal"
																:size="17"
																@click-icon="setFlagPrincipal(props.row)"
															/>
															<v-tooltip top>
																<v-switch
																	slot="activator"
																	class="switch-inline switch-image"
																	hide-details
																	color="success"
																	v-model="props.row.flagActive"
																></v-switch>
																<span>{{ stateName(props.row) }}</span>
															</v-tooltip>
															<v-menu
																offset-x
																left
																:nudge-top="-26"
																:nudge-left="-11"
																attach
																content-class="options-menu-content menu-content-actions"
																class="options-menu"
															>
																<v-btn
																	icon
																	color="gray"
																	slot="activator"
																	class="ma-0 width-btn-table"
																>
																	<v-icon>more_vert</v-icon>
																</v-btn>
																<v-list class="layout column">
																	<v-list-tile @click.stop="edit(props.row)">
																		<v-list-tile-title>
																			<v-icon color="success" :size="16"
																				>edit</v-icon
																			>
																			<span class="menu-table-title"
																				>Editar</span
																			>
																		</v-list-tile-title>
																	</v-list-tile>
																	<v-list-tile
																		@click.stop="deleteRow(props.row)"
																	>
																		<v-list-tile-title>
																			<v-icon color="error" :size="16"
																				>delete</v-icon
																			>
																			<span class="menu-table-title"
																				>Eliminar</span
																			>
																		</v-list-tile-title>
																	</v-list-tile>
																</v-list>
															</v-menu>
														</td>
													</template>
												</app-table>
											</div>
										</v-tabs-items>
									</v-tabs>
								</v-layout>
							</v-flex>
						</v-flex>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5 v-if="flagShowSlugProduct">
				<v-layout wrap>
					<v-flex xs12 mb3>
						<v-subheader class="px-0 py-1 block-title">
							Datos Generales
						</v-subheader>
						<v-divider></v-divider>
						<v-flex xs12 mt-4>
							<slug-input
								:loading="slugLoading"
								:slug="newProduct.product.slug"
								:validated="slugValidated"
								@on-input="setSlug"
							></slug-input>
						</v-flex>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center align-center mb-5 class="wrapper-buttons">
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action mr-1"
					@click="cancel"
				>
					Cancelar
					<v-icon color="white" size="16"> highlight_off </v-icon>
				</v-btn>
				<v-btn
					color="success"
					class="btn-action ml-1"
					:disabled="validatingEcommerceProduct"
					type="button"
					@click="createNewProduct"
				>
					Aceptar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="close"
		>
			<related-products
				v-if="action.code === 'PS'"
				@cancel-modal="close"
				:check-all="checkAll"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="relatedRows"
				@close="close"
				@on-page="onPage"
				@on-search="onSearch"
				@on-selected-all="onSelectedAll"
				@on-row-selected="onRowSelected"
				@save="saveRelatedProducts"
			/>
			<assign-sections
				v-if="action.code === 'AS'"
				:sections="sections"
				:section-selected="sectionSelected"
				:rows="sectionsRows"
				@close="close"
				@on-add-section="onAddSection"
				@on-click-icon="onClickIcon"
				@on-local-search="onSearchSections"
				@save="saveSectionsProducts"
			/>
			<assign-categories
				v-if="action.code === 'assign-categories'"
				:categories-selected="newProduct.product.eCategories"
				@close="close"
				@save="saveCategories"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import slugInput from '@/components/ecommerce/slug-input';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import relatedProducts from '@/components/ecommerce/related-products';
import assignCategories from '@/components/ecommerce/assign-categories';
import assignSections from '@/components/ecommerce/assign-sections';
import helper from '@/shared/helper';
import typeEntityEcommerce from '@/shared/type-entity-ecommerce';
// import upLoadImageMixin from '@/mixins/upLoadImage';
import lib from '@/shared/lib';
import Modules from '@/shared/modules';

const { debounce } = helper;
const { compose, setNewProperty } = lib;

function showDialog() {
	this.$refs.labelEcommerceProduct.click();
}

function runAction({ code, name }) {
	if (code === 'PS' || code === 'AS' || code === 'assign-categories') {
		this.action.code = code;
		this.action.title = name;
		this.action.width = code === 'PS' ? 600 : 500;
		this.action.open = true;
	}
}

function close() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
}

function created() {
	this.loadResources();
}

function loadResources() {
	this.loadSections();
}

async function loadUnits() {
	({ data: this.units } = await this.listOfUnits());
	this.loadProduct();
}

async function loadProduct() {
	try {
		const { data: response } = await this.$httpProducts.get(
			`e-products/${this.id}`
		);
		this.newProduct = response;
		this.setNewProduct();
	} catch (error) {
		this.showGenericError();
	}
}

/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
function setSlug(value) {
	const valueNormalize = value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[0-9]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
	this.newProduct.product.slug = valueNormalize.toLowerCase();
	this.validateSlug(this.newProduct.product.slug);
}

async function validateSlug(value) {
	if (value) {
		this.slugLoading = true;
		const entityId = typeEntityEcommerce.Product;
		const body = {
			entityId,
			slug: value || null,
		};
		this.newProduct.product.slug = value || null;
		try {
			await this.$httpProducts.post('slug', body);
			this.slugValidated = true;
		} catch (err) {
			this.slugValidated = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.slugLoading = false;
		}
	}
}

function setNewProduct() {
	this.newProduct.product = {
		alternateCode: this.newProduct.alternateCode || [],
		categoryId: this.newProduct.categoryId,
		code: this.newProduct.code,
		conversions: this.newProduct.conversions || {},
		description: this.newProduct.description,
		commerce: (this.newProduct.commerce || []).map((c) => ({
			code: c.code,
			commerceId: c.commerceId,
		})),
		eCategories: this.newProduct.eCategories || [],
		features: this.newProduct.features || [],
		flagEcommerce: true,
		images: this.newProduct.images || [],
		name: this.newProduct.name,
		model: this.newProduct.model,
		price: this.newProduct.price || 0,
		priceDiscount: this.newProduct.priceDiscount || 0,
		productsRelated: this.newProduct.productsRelated || [],
		rating: this.newProduct.rating || 0,
		sections: this.newProduct.sections || [],
		slug: this.newProduct.slug || null,
		type: this.newProduct.type,
		unitId: this.newProduct.unitId || this.units[0].id,
		urlImage: this.newProduct.urlImage,
		weigth: this.newProduct.weigth || null,
	};
	this.sectionsRows = this.setSectionsRows(this.newProduct.product.sections);
	this.sectionsRowsComplete = [...this.sectionsRows] || [];
	if (this.newProduct.product.images.length > 0) {
		this.webImages = this.newProduct.product.images.filter((i) => i.fromApp);
		this.appImages = this.newProduct.product.images.filter((i) => !i.fromApp);
		this.rowsImages = Number(this.active)
			? [...this.webImages]
			: [...this.appImages];
	}
	if (this.newProduct.product.productsRelated.length > 0) {
		this.setRelatedProductsSelected();
	}
	this.setUnitsAndConversions();
	this.validationOnEcategoriesAndSections();
	if (this.dataSelected.length === 0) {
		this.dataSelected = this.newProduct.productsRelated || [];
	}
}

function setUnitsAndConversions() {
	const getConversions = Object.keys(this.newProduct.product.conversions).map(
		(c) => {
			const newUnit = { ...this.newProduct.conversions[c] };
			newUnit.id = Number(c);
			return newUnit;
		}
	);
	this.unitsFiltered = [].concat(this.newProduct.unit, getConversions);
	this.formattingData();
}

function stateName({ flagActive }) {
	return flagActive ? 'Activa' : 'Inactiva';
}

function active(value) {
	this.rowsImages = !Number(value) ? [...this.appImages] : [...this.webImages];
}

function setImageModel({ model, value }) {
	this.imageModel[model] = model === 'order' ? Number(value) : value;
}

function captureLocation(value) {
	const imgVal = value.split('/');
	this.imageModel.urlImage = value;
	this.imageModel.name = imgVal.pop();
}

function disabledAddImage() {
	return (
		!this.imageModel.order || !this.imageModel.name || !this.imageModel.urlImage
	);
}

function addImage() {
	const newImageModel = { ...this.imageModel };
	newImageModel.fromApp = !!Number(this.active);
	const propName = newImageModel.fromApp ? 'webImages' : 'appImages';
	if (this[propName].length > 0) {
		const index = this[propName].findIndex(
			(image) => image.id === newImageModel.id
		);
		if (index > -1) {
			this[propName][index] = { ...newImageModel };
		} else {
			newImageModel.id = this[propName].length + 1;
			this[propName].push(newImageModel);
		}
	} else {
		newImageModel.id = this[propName].length + 1;
		this[propName].push(newImageModel);
		this.setFlagPrincipal(newImageModel);
	}
	this.rowsImages = [...this[propName]];
	this.imageModel = {
		flagActive: true,
		flagPrincipal: false,
		fromApp: false,
		name: '',
		order: null,
		urlImage: '',
	};
}

function setFlagPrincipal({ id }) {
	if (Number(this.active)) {
		this.webImages = this.webImages.map((wi) => {
			const newWi = { ...wi };
			newWi.flagPrincipal = wi.id === id;
			return newWi;
		});
	} else {
		this.appImages = this.appImages.map((wi) => {
			const newWi = { ...wi };
			newWi.flagPrincipal = wi.id === id;
			return newWi;
		});
	}
}

function setUnitId(image, { model, value }) {
	this.$set(image, model, value.id);
}

function edit(row) {
	this.imageModel = { ...row };
}

function deleteRow({ id }) {
	if (Number(this.active)) {
		const index = this.webImages.findIndex((i) => i.id === id);
		if (index > -1) {
			this.webImages.splice(index, 1);
		}
	} else {
		const index = this.appImages.findIndex((i) => i.id === id);
		if (index > -1) {
			this.appImages.splice(index, 1);
		}
	}
}

function watchAppImages(values) {
	if (!Number(this.active)) {
		this.rowsImages = [...values];
	}
}

function watchWebImages(values) {
	if (Number(this.active)) {
		this.rowsImages = [...values];
	}
}

async function loadSections() {
	({ data: this.sections } = await this.$httpProducts.get('sections'));
	this.loadRelatedProducs();
}

function addSections(subSections) {
	this.newProduct.product.sections = this.newProduct.product.sections.concat({
		id: subSections.sectionId,
		name: subSections.sectionName,
		subSections: [subSections],
	});
	this.sectionsRows.push(subSections);
	this.sectionsRowsComplete.push(subSections);
}

function updateSections(subSections, index) {
	const subSectionsSelected =
		this.newProduct.product.sections[index].subSections;
	const existIndex = subSectionsSelected.findIndex(
		(s) => s.id === subSections.id
	);
	if (existIndex > -1) {
		this.newProduct.product.sections[index].subSections[existIndex] = {
			...subSections,
		};
	} else {
		const newSubSections = subSections;
		newSubSections.id = this.sectionsRowsComplete.length + 1;
		this.newProduct.product.sections[index].subSections.push(newSubSections);
	}
	this.sectionsRows = this.setSectionsRows(this.newProduct.product.sections);
	this.sectionsRowsComplete = [...this.sectionsRows] || [];
}

function onClickIcon({ code, row }) {
	if (code === 'edit') {
		this.sectionSelected = { ...row };
	} else {
		this.onDeleteSection(row);
	}
}

function onDeleteSection(row) {
	const { id, sectionId } = row;
	const index = this.sectionsRows.findIndex((sr) => sr.id === id);
	if (index > -1) {
		this.sectionsRows.splice(index, 1);
		this.sectionsRowsComplete.splice(index, 1);
	}
	const sectionIndex = this.newProduct.product.sections.findIndex(
		(s) => s.id === sectionId
	);
	const subSectionIndex = this.newProduct.product.sections[
		sectionIndex
	].subSections.findIndex((su) => su.id === id);
	this.newProduct.product.sections[sectionIndex].subSections.splice(
		subSectionIndex,
		1
	);
}

function onSearchSections(search) {
	if (search && search.trim()) {
		this.sectionsRows = this.sectionsRowsComplete.reduce((acum, src) => {
			const newTitle = src.title.toLowerCase();
			const newName = src.name.toLowerCase();
			if (
				newTitle.indexOf(search.trim()) > -1 ||
				newName.indexOf(search.trim()) > -1
			) {
				acum.push({ ...src });
			}
			return acum;
		}, []);
	} else {
		this.sectionsRows = [...this.sectionsRowsComplete];
	}
}

function onAddSection(section) {
	const subSections = { ...section };
	const index = this.newProduct.product.sections.findIndex(
		(s) => s.id === section.sectionId
	);
	if (index > -1) {
		this.updateSections(subSections, index);
	} else {
		subSections.id = 1;
		this.addSections(subSections);
	}
}

function saveSectionsProducts() {
	this.showNotification('Los secciones han sido asignadas correctamente.');
	this.close();
}

function setSectionsRows(sections = []) {
	let subSectionsArr = [];
	sections.forEach((s) => {
		const { subSections, id, name } = s;
		subSectionsArr = subSectionsArr.concat(
			subSections.map(
				compose(
					setNewProperty('sectionId', id),
					setNewProperty('sectionName', name || '')
				)
			)
		);
	});
	return subSectionsArr;
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.relatedRows = this.relatedRows.map((relRow) => {
		const newRelRow = { ...relRow };
		newRelRow.isSelected = checked;
		return newRelRow;
	});
	this.dataSelected = this.relatedRows.filter((relRow) => relRow.isSelected);
	this.dataSelected = this.dataSelected.map((p) => p.id);
}

function onRowSelected(product) {
	if (product.isSelected) {
		this.dataSelected.push(product.id);
	} else {
		const index = this.dataSelected.findIndex((d) => d === product.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.relatedRows.every((relRow) => relRow.isSelected);
}

async function loadRelatedProducs(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.dismiss = this.id || null;
	try {
		const { data: rows, headers } = await this.$httpProducts.get('e-products', {
			params: this.params,
		});
		this.relatedRows = rows.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = this.dataSelected.length
				? this.dataSelected.findIndex((d) => d === row.id) > -1
				: false;
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.loadUnits();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.checkAll = this.relatedRows.every((relRow) => relRow.isSelected);
	}
}

function setRelatedProductsSelected() {
	this.relatedRows = this.relatedRows.map((relRow) => {
		const newRelRow = { ...relRow };
		const index = this.newProduct.product.productsRelated.findIndex(
			(relP) => relP === relRow.id
		);
		const indexS = this.dataSelected.findIndex((d) => d === relRow.id);
		newRelRow.isSelected = index > -1 || indexS > -1;
		return newRelRow;
	});
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadRelatedProducs();
}

function onPage(page) {
	this.loadRelatedProducs(page);
}

function saveRelatedProducts() {
	this.$set(this.newProduct.product, 'productsRelated', this.dataSelected);
	this.showNotification('Los productos han sido relacionados correctamente.');
	this.close();
}

function saveCategories(body) {
	this.$set(this.newProduct.product, 'eCategories', body);
	this.invalidCategories = this.newProduct.product.eCategories.length === 0;
	this.showNotification(
		'Las categorías de ecommerce han sido asignadas correctamente.'
	);
	this.close();
}

function cancel() {
	this.goBack();
}

async function createNewProduct() {
	const url = `products/${this.id}`;
	const body = this.buildBody(this.id, this.newProduct);
	try {
		await this.$httpProducts.patch(url, body);
		this.showNotification('Producto actualizado con éxito');
		const { origin: originQuery, name: nameQuery } = this.$route.query;
		this.goTo('master-product-ecommerce', {
			params: {
				commerceId: this.commerceId,
				commerceCode: this.commerceCode,
			},
			query: {
				origin: originQuery,
				name: nameQuery,
			},
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PRODUCT_DUPLICATE_CODE') {
				this.showGenericError('El código ya está asignado a otro producto.');
			}
		}
	}
}

function buildBody(id, product) {
	let newObject = {};
	const images = this.appImages.concat(this.webImages);
	const sections = this.setSections(product.product.sections);
	newObject = {
		priceList: this.newProduct.priceList,
		product: {
			alternateCode: product.product.alternateCode,
			categoryId: product.product.categoryId,
			commerce: this.newProduct.commerce.map((p) => {
				const newRow = {};
				newRow.commerceId = p.commerceId;
				newRow.flagShowCatalog = p.flagShowCatalog
					? Boolean(p.flagShowCatalog)
					: false;
				newRow.code = p.code;
				return newRow;
			}),
			code: product.product.code,
			description: product.product.description,
			eCategories: product.product.eCategories,
			features: product.product.features,
			flagEcommerce: true,
			flagModule: Modules.Ecommerce,
			images: images.map((i) => {
				const newI = {
					fromApp: !!i.fromApp,
					order: i.order,
					name: i.name,
					urlImage: i.urlImage,
					flagPrincipal: !!i.flagPrincipal,
					flagActive: !!i.flagActive,
					unitId: i.unitId,
				};
				return newI;
			}),
			name: product.product.name,
			model: product.product.model || '',
			price: product.product.price,
			priceDiscount: product.product.priceDiscount,
			productsRelated: product.product.productsRelated,
			rating: product.product.rating,
			sections,
			slug: product.product.slug || null,
			unitId: product.product.unitId,
			urlImage: product.product.urlImage,
			weigth: product.product.weigth ? Number(product.product.weigth) : null,
		},
	};
	return newObject;
}

function setSections(sections) {
	return sections.reduce((list, section) => {
		const newSection = {
			id: section.id,
			name: section.name || this.getSectionName(section.subSections),
			subSections: section.subSections.map((su) => {
				const newSu = {
					id: su.id,
					name: su.name,
					order: su.order,
					title: su.title,
					description: su.description,
					urlImage: su.urlImage,
				};
				return newSu;
			}),
		};
		return list.concat(newSection);
	}, []);
}

function formattingData() {
	const productConversions = Object.keys(this.newProduct.product.conversions);
	if (productConversions && productConversions.length > 0) {
		this.setConversions(productConversions);
	} else if (this.newProduct.unitId || this.newProduct.product.unitId) {
		this.newProduct.product.conversions[this.newProduct.product.unitId] = {};
		this.newProduct.product.conversions[
			this.newProduct.product.unitId
		].quantity = 0;
		this.newProduct.product.conversions[
			this.newProduct.product.unitId
		].quantityTo = 1;
		this.newProduct.product.conversions[this.newProduct.product.unitId].code =
			null;
		this.newProduct.product.conversions[this.newProduct.product.unitId].name =
			null;
		const keyConversion = Object.keys(this.newProduct.product.conversions);
		this.setConversions(keyConversion);
	}
}

function setConversions(converKeys) {
	const indexLastUnitFiltered = this.unitsFiltered.length - 1;
	if (!this.unitsFiltered[indexLastUnitFiltered]) {
		this.unitsFiltered.pop();
	}
	converKeys.forEach((key) => {
		this.unitsFiltered.push(this.units.find((u) => u.id === Number(key)));
	});
	this.unitsFiltered.push(this.newProduct.unit);
}

function clear() {
	this.file = {};
	this.$refs.vueSixFour.$el.value = '';
}

async function getFile(fileInfo) {
	this.file = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = this.file.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: response } = await this.$httpProduction.post(
				'upload-files',
				this.file
			);
			this.imageModel.urlImage = response.Location;
			this.imageModel.name = response.Location.split('/').pop();
			this.showNotification('La imagen se subió correctamente.');
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		if (error.data.statusCode === 413) {
			this.showGenericError('Tamaño máximo de imagen permitido es 1024Kb');
		} else {
			this.showGenericError();
		}
	} finally {
		this.clear();
	}
}

function mounted() {
	this.clear();
}

function validatingEcommerceProduct() {
	// return (this.invalidCategories || this.invalidSections);
	return false;
}

function validationOnEcategoriesAndSections() {
	this.invalidSections = this.newProduct.product.sections.length === 0;
	this.invalidCategories = this.newProduct.product.eCategories.length === 0;
}

function flagShowSlugProduct() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagShowSlugProductKey = settingsKeys.find(
		(k) => k === 'flagShowSlugProduct'
	);
	if (!flagShowSlugProductKey) {
		return true;
	}
	return companySettings[flagShowSlugProductKey];
}

function data() {
	return {
		active: 0,
		tabs: [
			{ id: 1, name: 'WEB' },
			{ id: 2, name: 'APP' },
		],
		columns: [
			{ id: 1, name: 'Orden', visible: true },
			{ id: 2, name: 'Nombre', visible: true },
			{ id: 3, name: 'Imagen', visible: true },
			{ id: 4, name: 'Conversión', visible: true },
			{ id: 5, name: 'Acciones', visible: true, flagVisible: true },
		],
		rowsImages: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		newProduct: {
			brandId: null,
			priceList: null,
			product: {
				alternateCode: [],
				categoryId: null,
				code: '',
				commerce: [],
				conversions: {},
				description: '',
				eCategories: [],
				features: [],
				flagEcommerce: true,
				images: [],
				name: '',
				model: '',
				price: 0,
				priceDiscount: 0,
				productsRelated: [],
				ecommerce: [],
				rating: 0,
				sections: [],
				slug: null,
				type: '',
				unitId: null,
				urlImage: '',
				weigth: null,
			},
			warehouseId: null,
		},
		units: [],
		slugLoading: false,
		slugValidated: true,
		appImages: [],
		webImages: [],
		unitsFiltered: [],
		imageModel: {
			flagActive: true,
			flagPrincipal: false,
			fromApp: false,
			name: '',
			order: null,
			urlImage: '',
		},
		sections: [],
		sectionSelected: {},
		sectionsRows: [],
		sectionsRowsComplete: [],
		checkAll: false,
		currentPage: 1,
		lastPage: 0,
		relatedRows: [],
		params: {
			dismiss: null,
			limit: 20,
			page: 1,
		},
		priceList: [],
		allowedFiles: ['jpg', 'jpeg', 'png'],
		file: {},
		invalidCategories: true,
		invalidSections: true,
		dataSelected: [],
	};
}

export default {
	name: 'products-ecommerce',
	data,
	created,
	components: {
		appActions,
		headerPage,
		slugInput,
		VueSixFour,
		appTable,
		actionSidebar,
		relatedProducts,
		assignCategories,
		assignSections,
	},
	computed: {
		disabledAddImage,
		flagShowSlugProduct,
		validatingEcommerceProduct,
	},
	mounted,
	methods: {
		showDialog,
		runAction,
		close,
		loadProduct,
		setNewProduct,
		loadUnits,
		setSlug,
		validateSlug: debounce(validateSlug),
		stateName,
		setImageModel,
		addImage,
		setFlagPrincipal,
		setUnitId,
		edit,
		deleteRow,
		loadResources,
		loadSections,
		addSections,
		updateSections,
		onClickIcon,
		onDeleteSection,
		onAddSection,
		onSearchSections,
		saveSectionsProducts,
		setUnitsAndConversions,
		setSectionsRows,
		onSelectedAll,
		onRowSelected,
		loadRelatedProducs,
		setRelatedProductsSelected,
		onSearch,
		onPage,
		saveRelatedProducts,
		saveCategories,
		createNewProduct,
		buildBody,
		cancel,
		setSections,
		formattingData,
		setConversions,
		clear,
		getFile,
		validationOnEcategoriesAndSections,
		getSectionName(subSections) {
			const itemWithName = subSections.find((s) => s.sectionName || s.name);
			return itemWithName.sectionName || itemWithName.name;
		},
	},
	props: {
		id: [Number, String],
		commerceId: [Number, String],
		commerceCode: [String, Number],
	},
	watch: {
		active,
		captureLocation,
		appImages: {
			deep: true,
			handler: watchAppImages,
		},
		webImages: {
			deep: true,
			handler: watchWebImages,
		},
	},
};
</script>

<style lang="scss" scoped>
.block-title {
	color: map-get($colors, paginationText) !important;
	font-family: map-get($fonts, open-semibold) !important;
	font-size: 13px !important;
	height: auto !important;
	text-transform: uppercase;
}

.btn-upload-image {
	padding-bottom: 6px;
	padding-top: 6px;
}

.products-ecommerce {
	height: calc(100vh - 80px);
	position: relative;
}

.wrapper-buttons {
	position: absolute;
	bottom: 0;
	width: 100%;
}

.table-image {
	max-width: 50px;
}

.switch-image {
	margin-right: 0px !important;
}

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
</style>
