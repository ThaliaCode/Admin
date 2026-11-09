<template>
	<div>
		<div class="loading" v-if="loadingGeneral">
			<div class="loading-message">
				La carga terminará en un momento y podrás ver toda la información para
				{{ actionProduct }} tu producto.
			</div>
		</div>
		<header-page
			caption-navigation="Productos"
			:number-bill="editName"
			:title="titleForm"
		/>
		<app-actions :resource-uri="$route.name" @run-action="runAction" />
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
									<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
									<button
										class="product-image-container"
										:disabled="isLoadingImage"
										type="button"
										@click="actionUploadImage"
									>
										<template v-if="newProduct.urlImage">
											<img
												:src="newProduct.urlImage"
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
									<v-flex xs12 v-if="typeProducts">
										<app-select
											:disabled="!!id"
											for-label="typeProduct"
											:item="newProduct.type"
											:items="types"
											item-text="name"
											item-value="id"
											label="Tipo de producto"
											model="type"
											required
											return-object
											@input="setProductData"
										></app-select>
									</v-flex>
								</v-layout>
								<v-layout row wrap class="product-input-group">
									<v-flex xs12 class="position-relative">
										<app-input-text
											ref="inputCodeRef"
											label="Código(*)"
											model="code"
											:text="newProduct.code"
											:disabled="id ? !flagCodeProductAuto : false"
											@blur="checkingAbailability"
											@input="setProductData"
										></app-input-text>
										<div
											v-if="checking && newProduct.code"
											:class="[
												'checking-abailability',
												availableCode ? 'available' : 'not-available',
											]"
											:style="$v.newProduct.code.$invalid ? 'top: -5px' : 'top: 19px'"
										>
											<v-icon id="add-icon" color="white">{{ availableIcon }}</v-icon>
										</div>
									</v-flex>
									<span
										class="text-not-code-blank pink--text"
										v-if="checkBlankCode(newProduct.code)"
										style="font-size: 12px"
									>
										No se permite espacios en blanco
									</span>
								</v-layout>
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-input-text
											label="Nombre(*)"
											model="name"
											:text="newProduct.name"
											@input="setProductData"
										></app-input-text>
									</v-flex>
								</v-layout>
								<v-layout row wrap class="product-input-group">
									<v-flex xs5 pr-2 v-if="!isServices">
										<app-input-text
											label="Peso (Kg)"
											model="weight"
											:text="newProduct.weight"
											type="number"
											@input="setProductData"
										></app-input-text>
									</v-flex>
									<v-flex xs7>
										<autocomplete-component
											append-icon="arrow_drop_down"
											clearable
											http-code="$httpProducts"
											:item="newProduct.unitId"
											item-text="name"
											item-value="id"
											:items="units"
											label-value="Unidad"
											model="unitId"
											new-register-text="Nueva unidad"
											:on-clean="cleanData"
											placeholder="Seleccionar"
											prop="name"
											resource-url="units"
											:return-object="false"
											select-create
											@new-register="openSlideModal('UND', 'Nueva Unidad')"
											@return-data="setProductData"
										></autocomplete-component>
									</v-flex>
								</v-layout>
								<v-layout row wrap class="product-input-group">
									<v-flex xs12>
										<app-input-text
											label="Registro Sanitario"
											model="healthRegister"
											:text="
												newProduct.additionalInformation
													? newProduct.additionalInformation.healthRegister
													: null
											"
											@input="setAdditionalInformation"
										></app-input-text>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12>
								<v-layout row wrap align-center class="title-section">
									<v-flex xs10>
										<label for="product-description">¿DESEA AGREGAR DESCRIPCIÓN?</label>
									</v-flex>
									<v-flex xs2>
										<label
											class="product-checkbox-label justify-end"
											for="product-description"
										>
											<span class="product-checkbox product-checkbox-subtitle">
												<img
													v-if="showDescription"
													src="/static/img/checked.svg"
													height="9"
												/>
												<input
													hidden
													id="product-description"
													name="product-description"
													type="checkbox"
													:value="showDescription"
													@change="setShowDescription($event.target.checked)"
												/>
											</span>
										</label>
									</v-flex>
								</v-layout>
								<app-input-text
									v-if="showDescription"
									label="Descripción"
									model="description"
									no-resize
									:text="newProduct.description"
									textarea
									@input="setProductData"
								></app-input-text>
							</v-flex>
						</v-layout>
						<v-layout row wrap class="product-general-last">
							<template v-if="commerceId">
								<v-flex xs12 mb2 class="title-section">
									<v-layout row wrap align-center>
										<v-flex xs11>
											<span>¿DESEA ASIGNAR CATEGORÍAS?</span>
										</v-flex>
										<v-flex xs1>
											<app-tooltip-button
												color="primary"
												icon="add_circle"
												height="30"
												text="Crear Categoría"
												@click-icon="openSlideModal('NCE', 'Nueva Categoría', 500)"
											></app-tooltip-button>
										</v-flex>
									</v-layout>
								</v-flex>
								<template v-if="categoriesSelected.length === 0">
									<v-flex xs6 pr-2>
										<button
											class="product-add-btn mt-1"
											:disabled="categories.length === 0"
											type="button"
											@click="openModal('categories', 'Categorías', true)"
										>
											<span>Asignar Categorías</span>
											<v-icon class="product-add-btn-icon" color="primary" size="17">
												add_circle
											</v-icon>
										</button>
									</v-flex>
								</template>
								<template v-else>
									<v-flex xs12>
										<v-layout row wrap mb-3>
											<v-flex xs1>
												<app-tooltip-button
													color="primary"
													icon="add_circle"
													height="30"
													text="Agregar Categorías"
													@click-icon="openModal('categories', 'Categorías', true)"
												></app-tooltip-button>
											</v-flex>
											<v-flex xs11>
												<v-layout row wrap align-center>
													<span
														class="inventory-selected-item"
														v-for="eCategory in categoriesSelected"
														:key="eCategory.id"
													>
														<template v-if="eCategory.title.length > 10">
															<v-tooltip top>
																<span slot="activator">{{
																	eCategory.title | limitTo(9)
																}}</span>
																<span>{{ eCategory.title }}</span>
															</v-tooltip>
														</template>
														<template v-else>{{ eCategory.title }}</template>
														<v-btn
															class="btn-auto my-0 mr-0 btn-delete-warehouse-selected"
															depressed
															flat
															icon
															@click="deleteCategorySelected(eCategory)"
														>
															<v-icon color="primary" size="13">close</v-icon>
														</v-btn>
													</span>
												</v-layout>
											</v-flex>
										</v-layout>
									</v-flex>
								</template>
							</template>
							<template v-else>
								<v-flex xs12 mb2 class="title-section">
									<span> ASIGNAR CATEGORÍAS </span>
								</v-flex>
								<v-layout row wrap>
									<v-flex xs7 mr-3>
										<categories-autocomplete
											:item="newProduct.categoryId"
											:items="categories"
											item-text="name"
											:slot-custom="true"
											item-value="id"
											label-value="Categoría(*)"
											:return-object="false"
											@return-data="
												setProductData({ model: 'categoryId', value: $event })
											"
										></categories-autocomplete>
									</v-flex>
									<!-- tod se emvia con el category.id -->
									<v-flex pt-3>
										<v-btn
											block
											type="button"
											color="primary"
											class="btn-action"
											@click="openSlideModal('NC', 'Nueva Categoría', 500)"
										>
											Nueva categoría
										</v-btn>
									</v-flex>
								</v-layout>
								<v-flex xs6>
									<!-- <autocomplete-component
										append-icon="arrow_drop_down"
										clearable
										http-code="$httpProducts"
										:item="newProduct.categoryId"
										item-text="name"
										item-value="id"
										:items="categories"
										label-value="Categoría(*)"
										model="categoryId"
										new-register-text="Nueva categoría"
										:on-clean="cleanData"
										placeholder="Seleccionar"
										prop="name"
										resource-url="categories"
										:return-object="false"
										select-create
										@new-register="openSlideModal('NC', 'Nueva Categoría', 500)"
										@return-data="setProductData"
									></autocomplete-component> -->
									<!-- <span class="form-group__message" v-if="$v.newProduct.categoryId.$invalid">
										La categoría del producto es requerida.
									</span> -->
								</v-flex>
							</template>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout v-if="!commerceId" row wrap text-xs-left>
					<v-flex xs12 mb2 class="title-section">
						<span>COMERCIOS</span>
					</v-flex>
					<template v-if="commercesSelected.length === 0">
						<v-flex xs6 pr-2>
							<button
								class="product-add-btn mt-1"
								:disabled="commerces.length === 0 || newProduct.flagControlSerie"
								type="button"
								@click="openModal('commerces', 'Comercios', true)"
							>
								<span>Seleccionar Comercios</span>
								<v-icon class="product-add-btn-icon" color="primary" size="17">
									add_circle
								</v-icon>
							</button>
						</v-flex>
					</template>
					<template v-else>
						<v-flex xs12>
							<v-layout row wrap mb-3>
								<v-flex xs1>
									<app-tooltip-button
										color="primary"
										icon="add_circle"
										height="30"
										text="Agregar Comercios"
										@click-icon="openModal('commerces', 'Comercios', true)"
									></app-tooltip-button>
								</v-flex>
								<v-flex xs11>
									<v-layout row wrap align-center>
										<span
											class="inventory-selected-item"
											v-for="commerce in commercesSelected"
											:key="commerce.id"
										>
											<template v-if="commerce.name.length > 10">
												<v-tooltip top>
													<span slot="activator">{{ commerce.name | limitTo(9) }}</span>
													<span>{{ commerce.name }}</span>
												</v-tooltip>
											</template>
											<template v-else>{{ commerce.name }}</template>
											<v-btn
												class="btn-auto my-0 mr-0 btn-delete-warehouse-selected"
												depressed
												flat
												icon
												@click="deleteCommerceSelected(commerce)"
											>
												<v-icon color="primary" size="13">close</v-icon>
											</v-btn>
										</span>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</template>
				</v-layout>
				<v-layout
					v-if="finishProductSelected || composedProductSelected || newProduct.type === 3"
					row
					wrap
					text-xs-left
				>
					<v-flex xs12 mb2 class="title-section">
						<div>
							<div class="d-flex justify-between align-center">
								<div class="w-100">{{ warehousesLabel }}</div>
								<div class="d-flex">
									<v-btn
										v-if="this.$userInfo.roleCode === 'SUPPORT' && id"
										block
										type="button"
										color="primary"
										:loading="isLoading"
										@click="fixBrands"
									>
										Corregir Marcas
									</v-btn>
								</div>
							</div>

							<div>
								<span
									class="title-section-caption"
									v-if="warehousesSelected.length === 0"
								>
									Debe tener al menos una tienda seleccionada para poder continuar con la
									creacion del producto
								</span>
							</div>
						</div>
					</v-flex>
					<template v-if="warehousesSelected.length === 0">
						<v-flex xs6 pr-2>
							<button
								class="product-add-btn mt-1"
								:disabled="warehouses.length === 0"
								type="button"
								@click="openModal('warehouses', labelWarehouse(true), true)"
							>
								<span>Seleccionar {{ labelWarehouse(true).toLowerCase() }}</span>
								<v-icon class="product-add-btn-icon" color="primary" size="17">
									add_circle
								</v-icon>
							</button>
						</v-flex>
					</template>
					<template v-else>
						<v-flex xs12>
							<v-layout row wrap mb-3>
								<v-flex xs1 v-if="!id">
									<app-tooltip-button
										color="primary"
										icon="add_circle"
										height="30"
										:text="`Agregar ${labelWarehouse(true).toLowerCase()}`"
										@click-icon="openModal('warehouses', labelWarehouse(true), true)"
									></app-tooltip-button>
								</v-flex>
								<v-flex :class="id ? 'xs12' : 'xs11'">
									<v-layout row wrap align-center>
										<span
											class="inventory-selected-item"
											v-for="warehouse in warehousesSelected"
											:key="warehouse.id"
										>
											<template v-if="warehouse.name.length > 10">
												<v-tooltip top>
													<span slot="activator">{{ warehouse.name | limitTo(9) }}</span>
													<span>{{ warehouse.name }}</span>
												</v-tooltip>
											</template>
											<template v-else>{{ warehouse.name }}</template>
											<v-btn
												v-if="!id"
												class="btn-auto my-0 mr-0 btn-delete-warehouse-selected"
												depressed
												flat
												icon
												@click="deleteWarehouseSelected(warehouse)"
											>
												<v-icon color="primary" size="13">close</v-icon>
											</v-btn>
										</span>
									</v-layout>
								</v-flex>
							</v-layout>
							<!-- <v-flex xs4 mb-2 mt-2 v-if="!id">
								<app-input-text
								label="Costo Unitario sin IGV"
								model="cost"
								type="number"
								@input="setCostProduct"
							></app-input-text>
							</v-flex> -->
							<div v-if="!isComposed">
								<v-layout
									row
									wrap
									align-center
									mb-2
									pb-1
									v-for="warehouse in warehousesSelected"
									:key="warehouse.id"
								>
									<v-flex xs4 class="inventory-selected-item-name" pt-3 mt-1>
										<template v-if="warehouse.name.length > 18">
											<v-tooltip top>
												<span slot="activator">{{ warehouse.name | limitTo(18) }}</span>
												<span>{{ warehouse.name }}</span>
											</v-tooltip>
										</template>
										<template v-else>
											{{ warehouse.name }}
										</template>
									</v-flex>
									<v-flex xs8 v-if="!newProduct.flagControlSerie">
										<v-layout row wrap justify-end>
											<v-flex :class="id ? 'xs10' : 'xs12'">
												<v-layout row wrap justify-end>
													<v-flex xs4 pl-2 v-if="!id">
														<app-input-text
															label="Cant. inicial"
															model="initQuantity"
															:text="
																newProduct.flagLotsEnabled ? 0 : warehouse.initQuantity
															"
															type="number"
															:disabled="newProduct.flagLotsEnabled"
															@input="setItemData(warehouse, $event)"
														></app-input-text>
													</v-flex>
													<v-flex xs4 pl-2 v-else>
														<v-layout column>
															<v-flex xs2 class="primary--text detail-title-row mb-1">
																Stock Actual
															</v-flex>
															<v-flex class="detail-description-row">
																{{ warehouse.initQuantity }}
															</v-flex>
														</v-layout>
													</v-flex>
													<v-flex xs4 pl-2>
														<app-input-text
															label="Stock max."
															model="maxStock"
															:text="warehouse.maxStock"
															type="number"
															@input="setItemData(warehouse, $event)"
														></app-input-text>
													</v-flex>
													<v-flex xs4 pl-2>
														<app-input-text
															label="Stock min."
															model="minStock"
															:text="warehouse.minStock"
															type="number"
															@input="setItemData(warehouse, $event)"
														></app-input-text>
													</v-flex>
												</v-layout>
											</v-flex>
											<v-flex v-if="id" xs2>
												<v-layout row wrap pt-3>
													<v-flex xs6 text-xs-center>
														<app-tooltip-button
															color="primary"
															icon="arrow_circle_up"
															text="Aumentar stock"
															@click-icon="goToIncome(warehouse)"
														></app-tooltip-button>
													</v-flex>
													<v-flex xs6 text-xs-center>
														<app-tooltip-button
															color="primary"
															icon="arrow_circle_down"
															text="Reducir stock"
															@click-icon="goToExpense(warehouse)"
														></app-tooltip-button>
													</v-flex>
												</v-layout>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</div>
						</v-flex>
					</template>
				</v-layout>
				<v-layout
					v-if="!id || (id && !productDataComplete.productParentId)"
					row
					wrap
					text-xs-left
				>
					<v-flex xs12 mb2 class="title-section">
						<v-layout row wrap align-center>
							<v-flex xs11>
								<span>
									<template v-if="showFeaturesSelect"> VARIACIONES </template>
									<template v-else> ¿DESEA AGREGAR CARACTERÍSTICAS? </template>
								</span>
								<p v-if="showFeaturesSelect" class="subtitle-section">
									Selecciona las características con las que podrás crear variaciones a
									partir de este producto
								</p>
							</v-flex>
							<v-flex xs1>
								<app-tooltip-button
									color="primary"
									icon="add_circle"
									height="30"
									text="Crear Característica"
									@click-icon="
										openSlideModal('new-features', 'Nueva Característica', 500)
									"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
					<template v-if="featuresSelected.length === 0">
						<v-flex xs6 pr-2>
							<button
								class="product-add-btn mt-1"
								:disabled="features.length === 0"
								type="button"
								@click="openModal('features', 'Características', true)"
							>
								<span>Agregar Características</span>
								<v-icon class="product-add-btn-icon" color="primary" size="17">
									add_circle
								</v-icon>
							</button>
						</v-flex>
					</template>
					<template v-else>
						<v-flex xs12>
							<v-layout row wrap mb-3>
								<v-flex xs1>
									<app-tooltip-button
										color="primary"
										icon="add_circle"
										height="30"
										text="Agregar Características"
										@click-icon="openModal('features', 'Características', true)"
									></app-tooltip-button>
								</v-flex>
								<v-flex xs11>
									<v-layout row wrap align-center>
										<span
											class="inventory-selected-item"
											v-for="feature in featuresSelected"
											:key="feature.id"
										>
											<template v-if="feature.name.length > 10">
												<v-tooltip top>
													<span slot="activator">{{ feature.name | limitTo(9) }}</span>
													<span>{{ feature.name }}</span>
												</v-tooltip>
											</template>
											<template v-else>{{ feature.name }}</template>
											<v-btn
												class="btn-auto my-0 mr-0 btn-delete-warehouse-selected"
												depressed
												flat
												icon
												@click="deleteFeatureSelected(feature)"
											>
												<v-icon color="primary" size="13">close</v-icon>
											</v-btn>
										</span>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</template>
				</v-layout>
			</v-flex>
			<v-flex xs6 px-5>
				<v-layout
					row
					wrap
					v-if="flagConvers && (finishProductSelected || isSupply || isServices)"
					text-xs-left
				>
					<v-flex xs12 mb2 class="title-section">
						<span>CONVERSIONES </span>
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
						v-for="(conversion, indexConversion) in newProduct.conversions"
						:key="indexConversion"
					>
						<unit-conversion
							class="unit-conversion"
							:units="filteredUnits"
							:conversion="conversion"
							:selected-unit="currentUnit"
							@set-conversion="setConversion($event, indexConversion)"
							@change-show-max-min="changeShowMaxMin($event, indexConversion)"
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
						<span>Marcas</span>
					</v-flex>
					<v-flex xs6 pr-2>
						<autocomplete-component
							append-icon="arrow_drop_down"
							clearable
							http-code="$httpProducts"
							:item="newProduct.brandId"
							item-text="name"
							item-value="id"
							:disabled="!showBrandConfig && !!id"
							:readonly="!showBrandConfig && !!id"
							:items="brands"
							model="brandId"
							new-register-text="Nueva Marca"
							:on-clean="cleanData"
							placeholder="Seleccionar"
							prop="name"
							resource-url="brands"
							:return-object="false"
							select-create
							@new-register="openSlideModal('NB', 'Nueva Marca', 500)"
							@return-data="setProductData"
						></autocomplete-component>
						<!-- <app-select
							:class="{ 'opacity-input' : id }"
							:disabled="!!id"
							:readonly="!!id"
							:items="brands"
							item-text="name"
							item-value="id"
							model="brandId"
							:item="newProduct.brandId"
							@input="setDataBrand"
						></app-select> -->
					</v-flex>
				</v-layout>
				<v-layout row wrap v-if="$userInfo.company.settings.flagShowAccountingEngine">
					<v-flex xs12 mb2 class="title-section">
						<span>CUENTAS CONTABLES</span>
					</v-flex>
					<v-layout>
						<v-flex xs4>
							<app-input-text
								label="Codigo de la cuenta"
								:text="
									newProduct.accountingAccount[0]
										? newProduct.accountingAccount[0].code
										: ''
								"
								@input="setProductData({ model: 'accountingAccountCode', value: $event })"
							></app-input-text>
						</v-flex>
						<v-flex ml-2 xs4>
							<app-input-text
								label="Nombre"
								:text="
									newProduct.accountingAccount[0]
										? newProduct.accountingAccount[0].name
										: ''
								"
								@input="setProductData({ model: 'accountingAccountName', value: $event })"
							></app-input-text>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex
							xs12
							v-if="
								newProduct.accountingAccount[0] &&
								((newProduct.accountingAccount[0].code &&
									!newProduct.accountingAccount[0].name) ||
									(!newProduct.accountingAccount[0].code &&
										newProduct.accountingAccount[0].name))
							"
						>
							<span class="form-group__message">
								El código y nombre de la cuenta contable son obligatorios.
							</span>
						</v-flex>
					</v-layout>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>IMPUESTO GENERAL</span>
					</v-flex>
					<v-layout>
						<v-flex xs7 pr-2>
							<app-select
								:disabled="disabledTaxUnit"
								model="taxUnit"
								:item="newProduct.taxUnit"
								:items="arrayTaxesGeneral"
								item-text="description"
								item-value="idCodeReference"
								@input="setTaxSelectedUnd"
							/>
						</v-flex>
						<v-flex mt-1>
							<app-tooltip-button
								color="primary"
								:icon="disabledTaxUnit ? 'lock' : 'lock_open'"
								height="19"
								:text="(disabledTaxUnit ? 'Habilitar' : 'Deshabilitar') + ' edición'"
								@click-icon="onChange('disabledTaxUnit')"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>IMPUESTOS COMPLEMENTO</span>
					</v-flex>
					<v-flex xs8 pr-2>
						<app-select
							chips
							multiple
							model="taxMultiple"
							:item="newProduct.taxMultiple"
							:items="arrayTaxesComplement"
							append-icon="keyboard_arrow_down"
							item-text="description"
							item-value="idCodeReference"
							@input="setTaxSelected"
						/>
					</v-flex>
				</v-layout>
				<v-layout row wrap text-xs-left v-show="showCostPrice">
					<v-flex xs12 mb2 class="title-section">
						<span>PRECIO DE Costo</span>
					</v-flex>
					<v-flex xs3>
						<app-input-text
							:label="newProduct.flagTaxCost ? 'Precio de Costo' : 'Costo Unitario'"
							model="cost"
							:text="newProduct.cost"
							type="number"
							@input="setCostProduct"
						></app-input-text>
					</v-flex>
					<v-flex xs4 ml-2 mt-3>
						<v-checkbox
							class="checkbox-customers"
							color="primary"
							hide-details
							label="Incluir IGV"
							v-model="newProduct.flagTaxCost"
							@change="changeTaxCost"
						></v-checkbox>
					</v-flex>
				</v-layout>
				<v-layout row wrap text-xs-left>
					<v-flex xs12 mb2 class="title-section">
						<span>PRECIO DE VENTA</span>
					</v-flex>
					<v-flex xs12>
						<v-layout row wrap align-end>
							<v-flex xs3>
								<app-input-text
									:readonly="
										$userInfo.company.settings.flagCalculateEarnings &&
										newProduct.type !== 6
									"
									:label="priceLabel"
									model="priceToShow"
									:text="priceToShow"
									type="number"
									@input="setProductData"
								></app-input-text>
							</v-flex>
							<v-flex xs1 text-xs-center mt-3>
								<app-tooltip-button
									:img="
										showHelp.price
											? '/static/img/new-icons/icon-help-fill.svg'
											: '/static/img/new-icons/icon-help-outline.svg'
									"
									text="Ayuda"
									@click-icon="setShowHelp('price')"
								></app-tooltip-button>
							</v-flex>
							<!-- <v-flex v-if="id" ml-3>
								<v-flex class="label--text">
									Precio de Costo
								</v-flex>
								<v-flex v-if="$userInfo.company.settings.flagKardexValued">
									{{ newProduct.cost | round }}
								</v-flex>
								<v-flex v-else>
									{{ newProduct.lastCost | round }}
								</v-flex>
							</v-flex> -->
						</v-layout>
						<v-flex xs8 class="help-message" v-if="showHelp.price">
							Este es el precio que se ha configurado en la lista por defecto
						</v-flex>
						<template v-if="priceLabel === 'Precio de venta'">
							<v-flex
								xs12
								v-if="
									!commerceId &&
									Number(newProduct.priceSaleMin) > Number(newProduct.priceSale)
								"
							>
								<span class="form-group__message">
									El precio de venta no puede ser menor al precio mínimo establecido.
								</span>
							</v-flex>
						</template>
						<v-layout mt-2 row wrap v-if="showFlagReplicate">
							<label class="product-checkbox-label" for="product-price-replicated">
								<span class="product-checkbox product-checkbox-form">
									<img
										v-if="flagPriceListReplicate"
										src="/static/img/checked.svg"
										height="12"
									/>
									<input
										hidden
										id="product-price-replicated"
										name="product-price-replicated"
										type="checkbox"
										:value="flagPriceListReplicate"
										@change="
											setFlagData({
												model: 'flagPriceListReplicate',
												value: $event.target.checked,
											})
										"
									/>
								</span>
								<v-tooltip top class="pl-0">
									<span slot="activator" class="product-checkbox-text">
										Aplicar actualización de precios en el producto por almacén/es
									</span>
									<span>
										Esta opción replica la actualización de precios para el producto en
										todos los almacenes a los que se haya asignado.
									</span>
								</v-tooltip>
							</label>
						</v-layout>
						<v-layout row wrap mt-3 align-center>
							<v-flex
								xs6
								pr-2
								:class="pricesListsConfigured.length > 0 ? 'mb-2' : 'mb-3'"
							>
								<button
									class="product-add-btn mt-1"
									:class="{ 'product-add-btn-active': configuredPriceList }"
									type="button"
									@click="
										openSlideModal(
											'price-list',
											'LISTA DE PRECIOS',
											$userInfo.company.settings.flagCalculateEarnings ? 750 : 600
										)
									"
								>
									<label class="product-add-btn-icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="15"
											height="15"
											viewBox="0 0 15 15"
										>
											<g fill="none" fill-rule="evenodd">
												<g fill="currentColor" fill-rule="nonzero">
													<g>
														<g>
															<path
																d="M14.687 5.732c-.179-.178-.411-.286-.679-.286h-.946c-.036-.089-.072-.16-.09-.25-.035-.089-.071-.16-.107-.25l.679-.678c.178-.179.286-.429.286-.679 0-.25-.09-.482-.286-.678l-1.5-1.5c-.179-.179-.429-.286-.679-.286-.232 0-.464.09-.643.25l-.035.036-.679.696c-.09-.036-.16-.071-.25-.107-.09-.036-.16-.071-.25-.09V.965c0-.25-.09-.464-.25-.643L9.222.286C9.044.107 8.812 0 8.544 0H6.437c-.25 0-.465.09-.643.25l-.036.036c-.178.178-.286.41-.286.678v.947c-.089.035-.16.071-.25.089-.089.036-.16.071-.25.107l-.678-.678c-.179-.179-.429-.286-.679-.286-.25 0-.482.09-.678.286l-1.5 1.5c-.179.178-.286.428-.286.678 0 .232.09.464.25.643l.036.036.678.678c-.035.09-.071.161-.107.25-.036.09-.071.161-.09.25H.973c-.267 0-.5.107-.678.286-.179.179-.286.41-.286.679v2.107c0 .25.09.464.25.643l.036.035c.178.179.41.286.678.286h.947c.036.09.071.16.09.25.035.09.07.16.106.25l-.678.679c-.179.178-.286.428-.286.678 0 .25.09.482.286.679l1.5 1.5c.178.178.428.285.678.285.25 0 .482-.089.679-.285l.678-.679c.072.036.161.072.25.107.09.036.161.072.25.09V14c0 .268.108.5.286.679.179.178.41.285.679.285h2.107c.268 0 .5-.107.678-.285.179-.179.286-.411.286-.679v-.946c.09-.036.16-.072.25-.09.09-.035.16-.071.25-.107l.679.679c.178.178.428.285.678.285.232 0 .465-.089.643-.25l.036-.035 1.5-1.5c.178-.179.286-.429.286-.679 0-.25-.09-.482-.286-.678l-.697-.697c.036-.09.072-.16.108-.25.035-.09.07-.16.089-.25h.946c.268 0 .5-.107.679-.286.178-.178.286-.41.286-.678V6.41c.017-.268-.108-.5-.268-.679zm-.625 2.786h-.018c0 .018 0 .018-.018.036 0 0-.018.017-.036.017h-1.285c-.215 0-.411.161-.447.358-.053.16-.107.303-.16.464-.072.16-.143.321-.215.464-.107.179-.053.41.072.536l.91.91s.018.018.018.036 0 .018-.018.036l-1.5 1.5h-.018c-.017 0-.017 0-.035-.018l-.911-.91c-.16-.161-.393-.18-.571-.054-.143.071-.286.143-.43.196-.16.072-.32.125-.481.179-.197.053-.322.232-.322.446V14c0 .018 0 .018-.017.036 0 0-.018.018-.036.018H6.437c-.018 0-.018 0-.036-.018 0 0-.018-.018-.018-.036v-1.286c0-.214-.16-.41-.357-.446-.16-.054-.304-.107-.464-.16-.161-.072-.322-.144-.465-.233-.178-.107-.41-.054-.553.09l-.91.91s-.019.018-.037.018c-.017 0-.017 0-.035-.018l-1.5-1.5s-.018-.018-.018-.036 0-.018.018-.035l.91-.911c.161-.16.179-.393.054-.572-.071-.142-.143-.285-.196-.428-.072-.16-.125-.322-.18-.482-.053-.197-.231-.322-.445-.322H.919c-.018 0-.018 0-.036-.018V6.411c0-.018 0-.018.018-.036 0 0 .018-.018.036-.018h1.285c.215 0 .411-.16.447-.357.053-.16.107-.304.16-.464.072-.161.143-.322.215-.465.107-.178.053-.41-.072-.535l-.91-.911v-.018c0-.018 0-.018.018-.036l1.5-1.5s.017-.017.035-.017c.018 0 .018 0 .036.017l.91.911c.144.143.376.179.554.072.16-.09.304-.161.465-.215.16-.071.32-.125.482-.178.196-.054.321-.232.321-.447V.93c0-.018 0-.018.018-.036h2.125c.018 0 .018 0 .036.018v1.303c0 .215.16.411.357.447.16.053.303.107.464.16.16.072.322.143.464.233.179.107.411.053.554-.09l.91-.91h.019c.017 0 .017 0 .035.017l1.5 1.5s.018.018.018.036 0 .018-.018.036l-.91.91c-.161.161-.18.393-.054.572.071.143.143.286.196.429.072.16.125.321.179.482.054.196.232.321.446.321h1.286c.018 0 .018 0 .036.018 0 0 .018.018.018.036v2.107z"
																transform="translate(-739 -439) translate(709 433) translate(30 6)"
															/>
															<path
																d="M10.294 4.66C9.58 3.947 8.58 3.5 7.49 3.5c-1.09 0-2.09.446-2.803 1.16-.715.715-1.161 1.715-1.161 2.804 0 1.09.446 2.09 1.16 2.804.715.714 1.715 1.16 2.804 1.16 1.09 0 2.09-.446 2.804-1.16s1.16-1.714 1.16-2.804c0-1.089-.446-2.089-1.16-2.803zM9.65 9.626c-.554.554-1.321.893-2.16.893-.84 0-1.608-.34-2.161-.893-.554-.554-.893-1.321-.893-2.16 0-.84.339-1.608.893-2.161.553-.554 1.32-.893 2.16-.893.84 0 1.607.339 2.16.893.555.553.894 1.321.894 2.16 0 .84-.34 1.607-.893 2.161z"
																transform="translate(-739 -439) translate(709 433) translate(30 6)"
															/>
														</g>
													</g>
												</g>
											</g>
										</svg>
									</label>
									<span>
										<template v-if="configuredPriceList">Editar</template>
										<template v-else>Configurar</template>
										lista de precios
									</span>
								</button>
							</v-flex>
							<v-flex
								xs1
								v-if="configuredPriceList"
								:class="pricesListsConfigured.length > 0 ? 'mb-2' : 'mb-3'"
							>
								<v-icon color="success">check_circle</v-icon>
							</v-flex>
							<template
								v-for="(priceListItem, priceListItemIndex) in pricesListsConfigured"
							>
								<v-flex xs12 mt-1 :key="priceListItemIndex" v-if="priceListItem.show">
									<v-layout row wrap align-center class="price-list-configured-container">
										<v-flex xs6 class="price-list-configured-name">
											{{ priceListItem.name }}
										</v-flex>
										<v-flex xs6>
											<v-layout row wrap align-center text-xs-center>
												<v-flex xs3>
													<v-tooltip top class="price-list-tooltip">
														<label slot="activator" class="price-list-configured-label"
															>P.Vent.</label
														>
														<span class="bold">Precio de Venta</span>
													</v-tooltip>
													<span class="price-list-configured-value">
														<template v-if="priceListItem.salePrice">
															{{ priceListItem.salePrice | round }}
														</template>
														<template v-else> - </template>
													</span>
												</v-flex>
												<v-flex xs3>
													<v-tooltip top class="price-list-tooltip">
														<label slot="activator" class="price-list-configured-label"
															>P.Unit.</label
														>
														<span>Precio Unitario</span>
													</v-tooltip>
													<span class="price-list-configured-value">
														<template v-if="priceListItem.unitPrice">
															{{ priceListItem.unitPrice | round }}
														</template>
														<template v-else> - </template>
													</span>
												</v-flex>
												<v-flex xs3>
													<label class="price-list-configured-label">{{
														labelsByCountry.taxName
													}}</label>
													<span class="price-list-configured-value">
														<template v-if="priceListItem.tax">
															{{ priceListItem.tax | round }}
														</template>
														<template v-else> - </template>
													</span>
												</v-flex>
												<v-flex xs3>
													<v-tooltip top class="price-list-tooltip">
														<label slot="activator" class="price-list-configured-label"
															>Dscto.(%)</label
														>
														<span>Descuento</span>
													</v-tooltip>
													<span class="price-list-configured-value">
														<template v-if="priceListItem.discount">
															{{ priceListItem.discount }}
														</template>
														<template v-else> - </template>
													</span>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
									<v-layout
										row
										wrap
										v-if="priceListItemIndex === 0 && priceLabel === 'Precio unitario'"
									>
										<v-flex
											xs12
											v-if="
												!commerceId &&
												Number(newProduct.priceSaleMin) > Number(newProduct.priceSale)
											"
										>
											<span class="form-group__message">
												El precio de venta no puede ser menor al precio mínimo
												establecido.
											</span>
										</v-flex>
									</v-layout>
								</v-flex>
							</template>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout row wrap px-3 v-if="!commerceId">
					<v-flex xs12 class="subtitle-section">
						<v-layout row wrap align-center>
							<v-flex xs10>
								<label>PRECIO MÍNIMO DE VENTA</label>
							</v-flex>
							<v-flex xs2>
								<label
									class="product-checkbox-label justify-end"
									for="product-sale-price-min"
								>
									<span class="product-checkbox product-checkbox-subtitle">
										<img
											v-if="minimumSalePriceFlag"
											src="/static/img/checked.svg"
											height="13"
										/>
										<input
											hidden
											id="product-sale-price-min"
											name="product-sale-price-min"
											type="checkbox"
											:value="minimumSalePriceFlag"
											@change="setMinSalePrice($event.target.checked)"
										/>
									</span>
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-layout row wrap align-end v-if="minimumSalePriceFlag">
							<v-flex xs3>
								<app-input-text
									label="Precio"
									model="priceSaleMin"
									:text="newProduct.priceSaleMin"
									type="number"
									@input="setProductData"
								></app-input-text>
							</v-flex>
							<v-flex xs1 mb-1 text-xs-center>
								<app-tooltip-button
									:img="
										showHelp.price
											? '/static/img/new-icons/icon-help-fill.svg'
											: '/static/img/new-icons/icon-help-outline.svg'
									"
									text="Ayuda"
									@click-icon="setShowHelp('minPrice')"
								></app-tooltip-button>
							</v-flex>
							<v-flex xs8 class="help-message" v-if="showHelp.minPrice">
								No se podrá vender este producto por debajo del precio minímo establecido.
							</v-flex>
							<v-flex
								xs12
								v-if="Number(newProduct.priceSaleMin) > Number(newProduct.priceSale)"
							>
								<span class="form-group__message">
									El precio de venta no puede ser menor al precio mínimo establecido.
								</span>
							</v-flex>
						</v-layout>
					</transition>
				</v-layout>
				<v-layout row wrap px-3>
					<v-flex xs12 class="subtitle-section">
						<v-layout row wrap align-center>
							<v-flex xs10>
								<label>PRECIO MÁXIMO DE VENTA</label>
							</v-flex>
							<v-flex xs2>
								<label class="product-checkbox-label justify-end">
									<span class="product-checkbox product-checkbox-subtitle">
										<img
											v-if="maximumSalePriceFlag"
											src="/static/img/checked.svg"
											height="13"
										/>
										<input
											hidden
											id="product-sale-price-min"
											name="product-sale-price-min"
											type="checkbox"
											:value="maximumSalePriceFlag"
											@change="setMaxSalePrice($event.target.checked)"
										/>
									</span>
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-layout row wrap align-end v-if="maximumSalePriceFlag">
							<v-flex xs3>
								<app-input-text
									label="Precio"
									type="number"
									model="priceSaleMax"
									:text="newProduct.priceSaleMax"
									@input="setProductData"
								/>
							</v-flex>
							<v-flex xs1 mb-1 text-xs-center>
								<app-tooltip-button
									:img="
										showHelp.price
											? '/static/img/new-icons/icon-help-fill.svg'
											: '/static/img/new-icons/icon-help-outline.svg'
									"
									text="Ayuda"
									@click-icon="setShowHelp('maxPrice')"
								></app-tooltip-button>
							</v-flex>
							<v-flex xs8 class="help-message" v-if="showHelp.maxPrice">
								No se podrá vender este producto por debajo del precio máximo establecido.
							</v-flex>
							<!-- <v-flex xs12 v-if="Number(newProduct.priceSaleMax) > Number(newProduct.priceSale)">
								<span class="form-group__message">
									El precio de venta no puede ser menor al precio maximo establecido.
								</span>
							</v-flex> -->
						</v-layout>
					</transition>
				</v-layout>
				<v-layout row wrap v-if="$userInfo.company.settings.flagCodes">
					<v-flex xs12 mb2 class="title-section">
						<span>Otros códigos</span>
					</v-flex>
					<v-flex xs10 mb-1 class="content-other-code">
						<v-select
							chips
							tags
							clearable
							solo
							class="select-chips_code"
							v-model="newProduct.alternateCode"
						>
							<template slot="selection" slot-scope="data">
								<v-chip close @input="removeAlternateCode(data.item)">
									<strong>{{ data.item }}</strong
									>&nbsp;
								</v-chip>
							</template>
						</v-select>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>CONFIGURACIÓN</span>
					</v-flex>
					<v-flex xs12 mb-1>
						<label class="product-checkbox-label" for="product-flag-sales">
							<span class="product-checkbox product-checkbox-form">
								<img
									v-if="newProduct.flagSales"
									src="/static/img/checked.svg"
									height="9"
								/>
								<input
									hidden
									id="product-flag-sales"
									name="product-flag-sales"
									type="checkbox"
									:value="newProduct.flagSales"
									@change="
										setFlagData({
											model: 'flagSales',
											value: $event.target.checked,
										})
									"
								/>
							</span>
							<span class="product-checkbox-text--sales"> Activo para la venta </span>
						</label>
					</v-flex>
					<v-flex xs12 v-if="!commerceId">
						<v-switch
							hide-details
							class="master-product-flag"
							color="success"
							label="Mostrar en ecommerce"
							v-model="newProduct.flagEcommerce"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="!commerceId">
						<v-switch
							hide-details
							class="master-product-flag"
							color="success"
							label="Editar la cantidad de un pedido"
							v-model="newProduct.flagWeighable"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="!commerceId && !newProduct.flagLotsEnabled">
						<v-switch
							hide-details
							class="master-product-flag"
							color="success"
							label="Agregar Serie"
							v-model="newProduct.flagControlSerie"
						></v-switch>
					</v-flex>
					<v-flex xs12>
						<v-switch
							class="master-product-flag"
							hide-details
							color="success"
							label="Activar o desactivar producto"
							v-model="newProduct.flagActive"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="flagAccumPoint">
						<v-switch
							class="master-product-flag"
							hide-details
							color="success"
							label="Acumular Puntos"
							v-model="newProduct.flagLoyalti"
						></v-switch>
						<v-flex xs5 mt-3 v-if="newProduct.flagLoyalti">
							<v-text-field
								label="Puntos"
								class="filter-select"
								v-model="newProduct.score"
								type="number"
							></v-text-field>
							<span class="form-group__message" v-if="!newProduct.score">
								Este campo es requerido.
							</span>
						</v-flex>
					</v-flex>
					<v-flex xs12 v-if="showIOT">
						<v-switch
							class="master-product-flag"
							hide-details
							color="success"
							label="Desea trabajar con IOT"
							v-model="newProduct.flagActiveIot"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="newProduct.type === 1 && arrayDomains">
						<v-switch
							class="master-product-flag"
							hide-details
							color="success"
							:label="`Trabajar ${labelControlInventory} control de inventario (Registro en Kardex)`"
							v-model="newProduct.flagNotControlInventory"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="newProduct.type === 1 && arrayDomains">
						<v-switch
							class="master-product-flag"
							hide-details
							color="success"
							label="Permitir stock negativo"
							v-model="newProduct.flagStockNegative"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="newProduct.type === 1">
						<v-switch
							:disabled="!!id"
							class="master-product-flag"
							hide-details
							color="success"
							label="Producto manufacturado (fabricado)"
							v-model="newProduct.flagFlowManufactured"
						></v-switch>
					</v-flex>
					<v-flex xs12 v-if="!newProduct.flagControlSerie">
						<v-switch
							:disabled="!!id"
							class="master-product-flag"
							hide-details
							color="success"
							label="Controlar lotes y fecha de vencimiento"
							v-model="newProduct.flagLotsEnabled"
						></v-switch>
					</v-flex>
				</v-layout>
				<v-layout wrap mt-3 v-if="false">
					<v-flex xs6>
						<v-text-field
							class="filter-select"
							name="new-product-model"
							label="Código Cubso"
							v-model="newProduct.codeProductCubso"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<!-- TABLA PARA PRODUCTOS COMPUESTOS  -->
			<v-flex xs12 mt-4 px-5 v-if="isManufactured || isComposed">
				<!-- Titulo de la seccion -->
				<v-flex xs12 mb2 class="title-section">
					<span>PRODUCTOS</span>
				</v-flex>

				<!-- Campos buscadores de productos -->
				<v-layout class="layout wrap mb-4 align-end">
					<v-flex xs12 sm6 md3 mr-3>
						<products-search-input
							:autocomplete="'off'"
							ref="productSearcher"
							ref-value="productSearcher"
							id="productSearcher"
							:clean-input="cleanInput"
							:search-value="selectedProductName"
							:flagInputEvent="true"
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs12 sm6 md3 ml-3 v-if="selectedProduct.pricesListArray.length > 1">
						<app-select
							:items="selectedProduct.pricesListArray"
							item-text="name"
							item-value="id"
							:item="selectedProduct.selectedPriceListId"
						></app-select>
					</v-flex>
					<span v-else class="price-list-name">{{
						selectedProduct.pricesListArray[0] && selectedProduct.pricesListArray[0].name
					}}</span>
					<v-flex xs1 ml-2>
						<button
							class="pl-add-container size min-width"
							:class="{
								opacyble:
									(selectedProduct.product && !selectedProduct.product.name) ||
									!selectedProduct.selectedPriceListId,
							}"
							@click="addProduct"
						>
							<v-icon id="add-icon" color="white">add</v-icon>
						</button>
					</v-flex>
					<v-flex xs3>
						<button class="product-add-btn m-1" type="button" @click="calculateCost">
							<span
								>Calcular
								{{ newProduct.flagTaxCost ? 'Precio de Costo' : 'Costo Unitario' }}</span
							>
							<v-icon color="primary" size="17"> sync </v-icon>
						</button>
					</v-flex>
				</v-layout>
				<!-- Tabla de productos -->
				<composing-product-list
					:id-product="id"
					:rows="composingProducts"
					@removed-product-from-rows="updateComposingProducts"
					@changed-unit="updateProductUnit"
					@uddate-quantity="updateQuantity"
					@composing-total-updated="updateCostFromComposingTotal"
					@composing-total-with-tax-updated="updateCostFromComposingTotalWithTax"
				/>
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
				v-if="isProductSearcher"
				:search-value="searchVal"
				:show-free="allowProductFree"
				@add-product="setProduct"
				:initial-type-select="isManufactured ? 3 : 1"
				:showFilter="!isManufactured"
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
			<image-component v-if="action.code === 'VI'" :url="newProduct.urlImage" />
			<select-warehouse
				v-if="action.code === 'WS'"
				:warehouses="newProduct.warehousesId"
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
				:code-retention="newProduct.codeRetention"
				:taxes="newProduct.taxes"
				@close-modal="cancelModal"
				@send-data="getTaxes"
			/>
			<assign-categories
				v-if="action.code === 'assign-categories'"
				:categories-selected="newProduct.eCategories"
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
			<prices-list-set
				v-if="action.code === 'price-list'"
				:base-price-computed="basePriceComputed"
				:base-price-used="basePriceUsed"
				:is-loading="disabled"
				:prices-lists="pricesListsSlide"
				:product="newProduct"
				@accept-button="acceptPricesLists(false)"
				@cancel-button="cancelModal"
				@set-price-list-data="setPriceListData"
				@toogle-open="toogleOpen"
			></prices-list-set>
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
				:code-retention="newProduct.codeRetention"
				:is-loading="isLoading"
				:loading-add-account="loadingAddAccount"
				:product-id="id"
				:show-accounting-data="showAccountingData"
				:taxes="newProduct.taxes"
				@accept-button="saveAccountingData"
				@add-row="addRow"
				@cancel-button="cancelModal"
				@delete-account="deleteAccount"
				@set-data="setData"
			></product-accounting-data>
		</action-sidebar>
		<v-layout wrap justify-center align-center class="modal-filter-footer page-buttons">
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					:color="id ? 'secondary' : 'pink'"
					class="btn-action mr-1"
					@click="goToMasterProductList"
					:disabled="isLoading"
				>
					{{ cancelBtnName }}
					<img :src="`${$imageUrl}/icon-cancel.svg`" alt="" v-if="!id" />
				</v-btn>
				<v-btn
					type="button"
					color="primary"
					class="btn-action ml-1"
					:disabled="validating || validatingForSave"
					@click="showModalCreateProduct"
				>
					{{ successBtnName }}
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
				<v-btn
					v-if="false"
					type="button"
					color="primary"
					class="btn-action ml-1 ecommerce-btn"
					@click="ecommerceRoute"
				>
					Producto Ecommerce
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
								<v-btn class="product-modal-close" depressed icon @click="closeModal">
									<v-icon color="primary" size="16">close</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
						<v-layout row wrap v-if="modal.multiple" class="modal-card-subheading">
							<label
								class="product-checkbox-label primary--text"
								for="product-select-all"
							>
								<span class="product-checkbox product-checkbox-modal">
									<img v-if="allSelected" src="/static/img/checked.svg" height="11" />
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
					<v-flex
						xs12
						v-for="(item, index) in modal.items"
						:key="index"
						class="modal-card-body-item"
					>
						<label class="product-checkbox-label" :for="`product-select-item-${item.id}`">
							<span
								class="product-checkbox product-checkbox-modal-item"
								:class="{ 'product-checkbox-active': item.isSelected }"
							>
								<img v-if="item.isSelected" src="/static/img/checked.svg" height="11" />
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
							:loading="isLoading"
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
				<v-card-text class="subtext"> Desea eliminar la imagen del producto </v-card-text>
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
						<router-link :to="{ name: 'brands' }"> Por favor, ingrese aquí </router-link>
					</v-flex>
				</v-layout>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import h from '@/shared/helper';
import l from '@/shared/lib';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import assignCategories from '@/components/ecommerce/assign-categories';
import assignCommerces from '@/components/master-product/assign-commerces';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
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
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productAccountingData from '@/components/master-product/product-accounting-data';
import productTaxesConfig from '@/components/products/product-taxes-config';
import selectWarehouse from '@/components/accounting/utils/selecting-warehouse';
import unitsForm from '@/components/units/units-form';
import productAditionalInformation from '@/components/products/product-aditional-information';
import upLoadImageMixin from '@/mixins/upLoadImage';
import VueSixFour from 'vue-six-four';
import unitConversion from '@/components/master-product/unit-conversion';
import Modules from '@/shared/modules';
import TableCode from '@/shared/table-code';
import TypeProduct from '@/shared/type-product';
import composingProductList from './composing-products-list';

const { compose, getDeeper, isEmpty, setNewProperty, matchBetweenArrays } = l;
const fourDecimals = l.round(4);
const { getLocalData, setLocalData, removeLocalData } = h;

async function created() {
	const urls = h.getLocalData('domains');
	this.arrayDomains = urls && urls.length > 0;
	this.actionProduct = this.id ? 'editar' : 'crear';
	this.cloneProduct = this.$route.params.cloneProduct;
	this.idProductClone = this.$route.params.idProductClone;
	this.loadingGeneral = true;
	this.productSubsidiaryId = this.subsidiaryId || this.$userInfo.comSubsidiariesId;
	this.flagAccumPoint = this.$userInfo.company.flagLoyalti === 1;
	this.showBrandConfig = this.$userInfo.company.settings.flagUseSimpleBrand || false;
	this.show10Percentage = this.$userInfo.company.settings.flagTaxesIgvTemporary || false;
	this.showStockNegative = this.$userInfo.company.settings.stockNegative || false;
	this.showCodeGenerate = this.$userInfo.company.settings.flagCodeAutoGenerate || false;
	this.availableCode = !!this.id;
	if (this.showCodeGenerate && !this.$route.params.id) {
		const newDate = new Date();
		this.newProduct.code = newDate.getTime().toString();
		this.availableCode = true;
	}
	await this.loadCommerces();
	await this.loadResources();
	this.showIOT = this.$userInfo.company.settings.flagShowIot || false;
	if (this.$refs.inputCodeRef) this.$refs.inputCodeRef.focus();
}

function acceptPricesLists(onlyDefault) {
	this.newProduct.pricesLists =
		onlyDefault && !this.configuredPriceList
			? [this.pricesListsSlide.find((pls) => pls.id === onlyDefault)]
			: this.pricesListsSlide;
	if (this.newProduct.taxes) {
		this.setTaxIntoPricesLists(this.newProduct.taxes);
	}
	this.cancelModal();
	this.pricesListsConfigured = this.newProduct.pricesLists.filter(
		(pl) => pl.salePrice > 0 || pl.unitPrice > 0
	);
	this.configuredPriceList = this.pricesListsConfigured.length > 0;
	const userPriceList = this.$userInfo.salPriceList
		? this.$userInfo.salPriceList.id
		: null;
	const priceListIdDefault = this.idListPriceCommerce
		? Number(this.idListPriceCommerce)
		: userPriceList;
	if (priceListIdDefault) {
		const priceL = this.newProduct.pricesLists.find((pl) => pl.id === priceListIdDefault);
		if (priceL) {
			this.newProduct.priceSale = priceL.salePrice;
			this.priceToShow =
				this.priceLabel === 'Precio de venta' ? priceL.salePrice : priceL.unitPrice;
		}
	}
}

async function actionFeature(featureModel) {
	this.loadingFeature = true;
	try {
		await this.$httpProducts.post('features', featureModel);
		this.showNotification('La característica se creó correctamente');
		this.cancelModal();
		this.loadFeaturesBySubsidiary();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingFeature = false;
	}
}

function addAccount() {
	this.accountingAccountsAdded.push(this.accountingAccount);
	this.accountingAccount = {};
	this.cleanData = true;
}

function addConversion(index) {
	this.disabledConversion = true;
	const { name, id } = this.newProduct.conversions[index];
	this.addUnitIntoPriceList(name, id);
}

function addFeatures(features) {
	this.loading = true;
	this.newProduct.features = [...features] || [];
	this.cleanActionObject();
	this.loading = false;
}

function addItems() {
	this[`${this.modal.code}Selected`] = this.modal.items.filter((i) => i.isSelected);
	this.closeModal();
}

function addRow(code) {
	this.loadingAddAccount = code === 'accounting-accounts';
	this.loadingAddConversion = code === 'conversions';
	this.loadingAddVariations = code === 'variations';
	if (code === 'conversions') {
		this.newProduct.conversions.push({
			id: null,
			name: null,
			quantity: null,
			quantityTo: 1,
			unitFrom: null,
			barcode: null,
			priceSaleMin: null,
			priceSaleMax: null,
			showMaxMin: false,
		});
		this.loadingAddConversion = false;
	} else if (code === 'accounting-accounts') {
		this.accountingAccountsAdded.push({ account: null, name: null });
		this.loadingAddAccount = false;
	}
}

function addUnitIntoPriceList(name, id) {
	this.newProduct.pricesLists = this.newProduct.pricesLists.map((pl) => {
		const newPl = { ...pl };
		const unitObj = { ...this.unitPriceListObject };
		const unitIndex = pl.units.findIndex((u) => u.id === id && u.name === name);
		if (unitIndex < 0) {
			unitObj.ranges = unitObj.ranges.concat({ ...this.defaultRange });
			unitObj.name = name;
			unitObj.id = id;
			newPl.units = pl.units.concat({ ...unitObj });
		}
		return newPl;
	});
	this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
		if (this.newProduct.conversions) {
			if (this.newProduct.conversions.length) {
				const newPls = { ...pls };
				const conver = this.newProduct.conversions.map((u) => {
					const existUnit = pls.units.find((c) => c.id === u.id);
					if (existUnit) {
						return existUnit;
					}
					return {
						discount: 0,
						name: u.name,
						price: 0,
						id: u.id,
						ranges: [],
						salePrice: 0,
						tax: null,
						taxes: 0,
						unitPrice: 0,
						earnings: {},
					};
				});
				newPls.units = [...conver];
				return newPls;
			}
		}
		return pls;
	});
	const unitsConversion = this.newProduct.pricesLists[0].units.filter((obj1) =>
		this.pricesListsSlide[0].units.some((obj2) => obj1.id === obj2.id)
	);
	this.newProduct.pricesLists = this.newProduct.pricesLists.map((obj) => {
		const newObj = { ...obj };
		newObj.units = unitsConversion;
		return newObj;
	});
}

function articleWarehouse(plural) {
	if (plural) {
		return this.labelWarehouse() === 'Tienda' ? 'las' : 'los';
	}
	return this.labelWarehouse() === 'Tienda' ? 'la' : 'el';
}

function assignCommerce(commerce) {
	this.newProduct.commerce = commerce.map((t) => {
		const newCommerce = {};
		newCommerce.code = t.code;
		newCommerce.commerceId = t.commerceId || t.id;
		return newCommerce;
	});
	this.cancelModal();
}

function basePriceComputed() {
	return BasePrice;
}

function basePriceUsed() {
	return getDeeper('company', 'settings', 'flagBasePriceDefault')(this.$userInfo);
}

function buildBody(id, newProduct) {
	const product = { ...newProduct };
	const priceUserListId = this.$userInfo.salPriceList
		? this.$userInfo.salPriceList.id
		: null;
	const priceListDefaultSelected = this.idListPriceCommerce || priceUserListId;
	const priceFind = this.newProduct.pricesLists.find(
		(pls) => pls.id === priceListDefaultSelected
	);
	const priceDefault =
		this.$userInfo.salPriceList && priceFind
			? priceFind.salePrice
			: product.priceSale || 0;
	const commerce = product.commerce;
	const arrayTaxesConcat = [{ ...product.taxUnit }, ...product.arrayTaxesConcat];
	const newObject = {
		priceList: this.buildPriceList(this.newProduct.pricesLists),
		brandSpId: !this.id && this.showBrandConfig ? product.brandId : undefined,
		brandId: this.id || this.showBrandConfig ? undefined : product.brandId || undefined,
		product: {
			alternateCode: product.alternateCode,
			brandSpId:
				this.id && this.showBrandConfig ? product.brandId || undefined : undefined,
			categoryId: product.categoryId,
			code: product.code,
			commerce:
				!this.newProduct.flagControlSerie && this.commercesSelected.length > 0
					? this.commercesSelected.map((c) => {
							const currentCommerce = commerce.find(
								(t) => t.commerceId === c.id || c.commerceId
							);
							const newCommerce = {
								code: c.code,
								flagShowCatalog: currentCommerce
									? Boolean(currentCommerce.flagShowCatalog) || false
									: false,
								commerceId: c.id || c.commerceId,
							};
							return newCommerce;
					  })
					: [],
			flagTaxCost: this.newProduct.flagTaxCost,
			conversions: this.formattingConversions(product.conversions),
			cost: product.cost,
			description: product.description || '',
			features:
				id && this.finishProductSelected && this.productDataComplete.productParentId
					? product.features
					: this.featuresSelected.map((f) => ({ id: f.id, name: f.name })),
			flagActive: Boolean(product.flagActive),
			flagControlSerie: Boolean(product.flagControlSerie),
			flagFlowManufactured: Boolean(product.flagFlowManufactured),
			flagLotsEnabled: Boolean(product.flagLotsEnabled),
			flagWeighable: Boolean(product.flagWeighable),
			flagEcommerce: Boolean(product.flagEcommerce),
			flagLoyalti: Boolean(product.flagLoyalti),
			flagActiveIot: Boolean(product.flagActiveIot),
			flagNotControlInventory: this.arrayDomains
				? Boolean(product.flagNotControlInventory)
				: undefined,
			flagStockNegative: this.arrayDomains
				? Boolean(product.flagStockNegative)
				: undefined,
			score: product.score,
			flagSales: Boolean(product.flagSales),
			name: product.name,
			additionalInformation: product.additionalInformation,
			price: priceDefault,
			priceSaleMax: this.maximumSalePriceFlag
				? Number(product?.priceSaleMax || 0)
				: undefined,
			priceSaleMin: this.minimumSalePriceFlag
				? Number(product?.priceSaleMin || 0)
				: undefined,
			unitId: product.unitId,
			urlImage: product.urlImage,
			taxes: this.eliminatePercentageFromTaxes(arrayTaxesConcat),
			weigth: product.weight,
			accountingAccount:
				product.accountingAccount[0] &&
				product.accountingAccount[0].code &&
				product.accountingAccount[0].name
					? product.accountingAccount
					: [],
			taxCostPercentage: this.newProduct.flagTaxCost
				? this.newProduct.taxUnit.percentage
				: 0,
		},
	};
	if (this.newProduct.codeRetention) {
		newObject.product.codeRetention = this.newProduct.codeRetention;
	}

	// Verificar si el tipo de producto
	if (this.newProduct.type === TypeProduct.Composed || this.isManufactured) {
		// actualizar todas las unitQuantity que se hicieron mal (Anthony)
		this.composingProducts.forEach((p) => {
			this.updateQuantity(p);
		});
		newObject.product.groups = this.buildProductGroups(this.composingProducts);
	}
	if (id) {
		newObject.product.flagModule = Modules.Ecommerce;
		if (product.images && product.images.length > 0) {
			newObject.product.images = product.images.map((i) => ({
				flagActive: Boolean(i.flagActive),
				flagPrincipal: Boolean(i.flagPrincipal),
				fromApp: Boolean(i.fromApp),
				name: i.name,
				order: i.order,
				unitId: i.unitId,
				urlImage: i.urlImage,
			}));
		}
		// const filterWarehouse = this.warehousesSelected.filter(
		// 	(p) => p.minStock || p.maxStock
		// );
		newObject.warehouses = this.warehouseFormatId(this.warehousesSelected);
	} else {
		newObject.product.type = product.type;
		newObject.warehouses = this.warehouseFormat(this.warehousesSelected);
		if (this.commerceId) {
			newObject.product.commerce = this.newProduct.commerce;
		}
	}
	if (this.newProduct.eCategories !== this.eCategoriesOrigin) {
		if (this.$route.name === 'edit-master-product') {
			newObject.product.eCategories = this.newProduct.eCategories;
		} else if (this.$route.name === 'new-master-product') {
			newObject.product.eCategories = [];
		} else {
			newObject.product.eCategories = this.categoriesSelected.map((c) => c.id);
			if (this.id) {
				newObject.product.flagModule = 2;
			}
		}
	}

	if (this.commerceId) {
		delete newObject.product.flagActive;
		newObject.product.isPublic = Boolean(product.flagActive);
	}
	return newObject;
}

function buildProductGroups(composingProducts) {
	return composingProducts.map((product) => {
		const unit = product.units.find(
			(u) => u.id === (product.selectedUnitId || product.unitId)
		);
		const obj = {
			price: product.price,
			productId: product.product.id,
			quantity: Number(product.quantity),
			type: this.isManufactured ? 4 : 2,
			unitId: product.selectedUnitId || product.unitId,
			unitQuantity: product.unitQuantity || 1,
			unitName: (unit && unit.name) || product.unitName || 'UNIDAD',
		};
		return obj;
	});
}

function buildPriceList(pricesLists) {
	if (pricesLists) {
		return pricesLists.reduce((acum, pl) => {
			const newPl = { ...acum };
			newPl[pl.id] = {};
			newPl[pl.id].price = pl.salePrice || 0;
			newPl[pl.id].unitPrice = pl.unitPrice || 0;
			newPl[pl.id].discount = pl.discount || 0;
			newPl[pl.id].ranges = pl.ranges ? [...pl.ranges] : [];
			newPl[pl.id].taxes = pl.tax || 0;
			newPl[pl.id].units = isEmpty(pl.units) ? {} : this.buildUnits(pl.units);
			newPl[pl.id].earnings = isEmpty(pl.earnings) ? undefined : pl.earnings;
			const comissions = isEmpty(pl.comissions) ? null : pl.comissions;
			if (comissions) {
				newPl[pl.id].comissions = {
					...comissions,
					appliedTo: comissions.appliedTo || false,
				};
			} else {
				newPl[pl.id].comissions = undefined;
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
			const unitComissions = isEmpty(unit.comissions) ? null : unit.comissions;
			if (unitComissions) {
				newAcum[unit.id].comissions = {
					...unitComissions,
					appliedTo: unitComissions.appliedTo || false,
				};
			}
			return newAcum;
		}, {});
	}
	const newUnits = units[0] && units[0].id ? { ...reduceUnits } : { ...units } || {};
	return newUnits;
}

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
	this.newProduct.urlImage = urlImage;
}

async function checkingAbailability() {
	this.newProduct.code = this.newProduct.code.replaceAll(' ', '');
	const isSame =
		this.newProduct.code && this.originalCodeProduct === this.newProduct.code;
	if (this.id && isSame) {
		this.availableCode = true;
		this.checking = true;
		return;
	}
	if (this.newProduct.code) {
		try {
			await this.$httpProducts.post('slug', {
				entityId: 1,
				code: this.newProduct.code,
			});
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
	this.newProduct.warehousesId = this.newProduct.warehousesId.map(
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
		const { data: eCatCreated } = await this.$httpProducts.post('e-categories', body);
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

async function createFeature(model) {
	const method = this.feature.id ? 'patch' : 'post';
	const url = this.feature.id ? `features/${this.feature.id}` : 'features';
	const message = this.feature.id ? 'actualizó' : 'creó';
	try {
		await this.$httpProducts[method](url, model);
		this.showNotification(`La característica se ${message} correctamente`);
		this.cancelModal();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function createNewProduct() {
	if (this.newProduct.taxes.length === 0) {
		this.showNotification(
			'Es necesario configurar impuestos, hacer clic en la acción',
			'info'
		);
	} else {
		this.isLoading = true;
		const url = this.getUrl();
		const body = this.buildBody(this.id, this.newProduct);
		const methods = this.getMethod();
		const action = this.getAction();
		const params = {};
		if (this.id) {
			params.flagMaster = true;
			if (this.commerceId) {
				params.fromEcommerceId = Number(this.commerceId);
			}
		}
		if (this.showFlagReplicate) {
			params.flagPriceListReplicate = this.flagPriceListReplicate;
		}
		try {
			await this.$httpProducts[methods](url, body, { params });
			this.dialog = false;
			this.showNotification(`Producto ${action} con éxito.`);
			if (this.id) {
				localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::products-selected`);
			}
			// const validProductObj = response.product && response.product.id ?
			// response.product.id : null;
			// const productId = this.id || response.productId || validProductObj
			// || response[0].productId;
			const newMaster = this.$route.name === 'new-master-product';
			const { previous } = this.$route.meta;
			if (newMaster) {
				const filters = this.$route.query.filters || this.$route.query.data;
				if (filters) {
					this.$router.push({
						path: '/products/master-product',
						query: { data: filters },
					});
				} else {
					this.$router.push('/products/master-product');
				}
				// Redirecciona al listado
				// Evitar la redireccion a nuevo ingreso y nuevo egreso
			} else if (previous === 'new-entry' || previous === 'new-discharge') {
				this.$router.push('/products/master-product');
			} else {
				this.$router.go(-1); // Redirecciona a la página anterior
			}

			// this.redirecting(productId);
			// if (this.id) {
			// 	this.loadProductInfo();
			// }
		} catch (err) {
			this.isLoading = false;
			if (err.status === 400) {
				if (err.data.message === 'PRODUCT_DUPLICATE_CODE') {
					this.showGenericError('El código ya está asignado a otro producto.');
				} else if (err.data.message === 'LIMIT_PRICE_ERROR') {
					this.showGenericError(
						'El precio mínimo de venta debe ser menor al precio de venta'
					);
				} else if (err.data.message === 'ERROR_CHECK_STOCK') {
					this.showGenericError('El stock mínimo debe ser menor al stock maximo.');
				} else {
					this.showGenericError(err.data.message);
				}
			} else {
				this.showGenericError();
			}
		} finally {
			this.isLoading = false;
			this.cancelDialog();
		}
	}
}

function defaultTaxes() {
	const taxIcb = h.getLocalData('tax-icb');
	const taxesSelect = {
		code: taxIcb.catalogTax.code,
		codePercentage: this.isEcuador
			? this.generalTaxes[1].code
			: this.generalTaxes[0].code,
		codeTable: taxIcb.code,
		flagSales: true,
		id: taxIcb.catalogTax.id,
		name: taxIcb.catalogTax.description,
		percentage:
			(this.isEcuador
				? this.generalTaxes[1].percentage
				: this.generalTaxes[0].percentage) || 0,
	};
	this.newProduct.taxes.push({ ...taxesSelect });
	this.taxSelected = this.newProduct.taxes[0];
	this.setTaxIntoPricesLists(this.newProduct.taxes);
}

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
	this.newProduct.urlImage = '';
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
	return this.id ? ` - ${this.newProduct.name}` : '';
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
	return this.units.filter((u) => u.id !== this.newProduct.unitId && !u.btn);
}

function flagCodeProductAuto() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagCodeProductAutoKey = settingsKeys.find((k) => k === 'flagCodeProductAuto');
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
	const flagShowVariationsKey = settingsKeys.find((k) => k === 'flagShowVariations');
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
				priceSaleMax: p.priceSaleMax ? p.priceSaleMax : undefined,
				priceSaleMin: p.priceSaleMin ? p.priceSaleMin : undefined,
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
			const index = self.newProduct.pricesLists.findIndex((pl) => pl.id === Number(k));
			const newPriceList = {};
			if (index > -1) {
				newPriceList.id = Number(k);
				newPriceList.salePrice = productPriceList[k].price || 0;
				newPriceList.discount = productPriceList[k].discount || 0;
				newPriceList.unitPrice = productPriceList[k].unitPrice || 0;
				newPriceList.ranges = [...productPriceList[k].ranges] || [];
				newPriceList.units = productPriceList[k].units
					? self.transformUnitsToArray.call(self, productPriceList[k].units) || []
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
				newPriceList.comissions = productPriceList[k].comissions || {};
				newPriceList.earnings = productPriceList[k].earnings || {};
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
	this.newProduct.codeRetention = codeRetention;
	this.newProduct.taxes = [...taxes];
	this.showNotification(
		'La configuración ha sido guardada correctamente para el producto a crear'
	);
	this.cancelModal();
	this.setTaxIntoPricesLists(taxes);
}

function getUrl() {
	let url = 'e-products';
	if (this.id) {
		url = `products/${this.id}`;
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
	removeLocalData('products-selected-out');
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
	removeLocalData('products-selected-entry');
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
	const newMaster = this.$route.name === 'new-master-product';
	const { previous } = this.$route.meta;
	if (newMaster) {
		const filters = this.$route.query.filters || this.$route.query.data;
		if (filters) {
			this.$router.push({
				path: '/products/master-product',
				query: { data: filters },
			});
		} else {
			this.$router.push('/products/master-product'); // Redirecciona al listado
		}
		// Evitar la redireccion a nuevo ingreso y nuevo egreso
	} else if (previous === 'new-entry' || previous === 'new-discharge') {
		this.$router.push('/products/master-product');
	} else {
		this.$router.go(-1); // Redirecciona a la página anterior
	}
	// const goToProductByWarehouse = this.$route.query.origin === 'products';
	// const nameRoute = this.$route.name === 'edit-master-product'
	//  || this.$route.name === 'new-master-product'
	// 	? 'master-product' : 'master-product-ecommerce';
	// const name = goToProductByWarehouse ? 'list-of-products' : nameRoute;
	// const origin = this.$route.query.origin !== 'products' ? this.$route.query.origin || '' : '';
	// const nameQuery = this.$route.query.name || '';
	// const query = this.$route.query;
	// if (origin) {
	// 	query.origin = origin;
	// }
	// if (nameQuery) {
	// 	query.name = nameQuery;
	// }
	// const url = {
	// 	name,
	// 	params: {
	// 		commerceId: this.commerceId,
	// 		commerceCode: this.commerceCode,
	// 		subsidiaryId: this.productSubsidiaryId,
	// 	},
	// 	query,
	// };

	// this.$router.push(url);
	// this.goTo(name,
	// 	{
	// 		params: {
	// 			commerceId: this.commerceId,
	// 			commerceCode: this.commerceCode,
	// 			subsidiaryId: this.productSubsidiaryId,
	// 		},
	// 		query,
	// 	},
	// );
}

function isGetWarehousesStock() {
	if (this.warehousesSelected.length > 0) {
		return this.warehousesSelected.some((w) => w.initQuantity);
	}
	return false;
}

function isPriceListPrice() {
	if (this.newProduct.pricesLists.length) {
		let commercePriceList = [];
		if (this.idListPriceCommerce) {
			commercePriceList = this.newProduct.pricesLists.filter((pl) => pl.show);
		} else {
			commercePriceList = [...this.newProduct.pricesLists];
		}
		return commercePriceList.some((p) => p.unitPrice > 0 || p.salePrice > 0);
	}
	return false;
}

function isServices() {
	const typeSelected = this.types.find((t) => t.id === this.newProduct.type) || {};
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

async function loadCategories(setCat) {
	if (this.commerceId) {
		const params = { commerceId: this.commerceId };
		({ data: this.categories } = await this.$httpProducts.get('e-categories', {
			params,
		}));
	} else {
		({ data: this.categories } = await this.categoriesList());
		const categoriesNames = this.categories.reduce((a, u) => a.concat(`${u.name} `), '');
		const categoryBtn = { id: 0, name: categoriesNames, btn: true };
		this.categories.push({ ...categoryBtn });
	}
	if (setCat) {
		const catSelected = this.categories.find((c) => c.id === setCat.id);
		this.openModal('categories', 'Categorías', true, catSelected);
	}
}

async function loadCommerces() {
	({ data: this.commerces } = await this.$httpSales.get('com-ecommerce-companies'));
	this.commerces = this.commerces.map((p) => {
		const newRow = { ...p };
		const cIndex = this.commercesSelected.findIndex((cs) => cs.id === p.id);
		newRow.isSelected = cIndex > -1 || this.commerces.length === 1;
		return newRow;
	});
	if (this.commerceId) {
		const index = this.commerces.findIndex(
			(r) => Number(r.id) === Number(this.commerceId)
		);
		if (index > -1) {
			this.idListPriceCommerce = this.commerces[index].settings.salPriceListId;
		}
	}
}

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
	const url = `products/master/${idProduct}`;
	const response = await this.$httpProducts.get(url);
	const productData = response.data;
	productData.taxes = productData.taxes.map((p) => {
		const newRow = { ...p };
		newRow.idProduct = p.product ? p.product.id : null;
		newRow.flagSales = p.flagSales === 1;
		newRow.idCodeReference = `${p.code}${p.percentage || 0}`;
		return newRow;
	});
	this.productDataComplete = { ...productData };
	this.setProductInfo({ ...productData });
	this.disabledConversion = false;
	if (this.cloneProduct) {
		await this.clearInformationProduct();
	}
}

async function loadRateTaxes() {
	try {
		this.typeTaxes = h.getCompanyTaxesFlat();
		if (this.show10Percentage) {
			this.typeTaxes = h.getCompanyTaxesFlat();
			this.arrayTaxesGeneral = this.typeTaxes;
		}
		this.typeTaxes = this.typeTaxes.map((t, tIndex) => {
			const newT = { ...t };
			const taxSelected = this.typeTaxes.find((tax) => tax.code === t.code);
			if (t.code === '01') {
				newT.description = `${newT.description} - Porcentaje: ${newT.percentage}`;
			}
			newT.flagTypeTaxes = l.getPath(t, 'additionalInformation.flagTypeTaxes') || null;
			newT.idCodeReference = `${t.code}${t.percentage || 0}`;
			newT.idTax = t.id;
			newT.flagSales = true;
			newT.codeTable = TableCode.Taxes;
			newT.isSelected = this.typeTaxes.length > 0 ? !!taxSelected : tIndex === 0;
			if (t.description === 'GRATUITO') newT.codeTable = TableCode.free;
			if (t.description === 'EXONERADO') newT.percentage = t.percentage || 0;
			return newT;
		});

		// WHEN IS CREATE
		if (!this.id) {
			const codeTaxDef = this.$userInfo.company.settings.codeTaxesDefault;
			let taxIGVDefault = this.typeTaxes.find((tax) => {
				if (!this.show10Percentage) return tax.code === codeTaxDef;
				return tax.code === '01' && tax.percentage !== 18;
			});
			if (!taxIGVDefault) {
				taxIGVDefault = this.typeTaxes.find((t) => t.flagTaxes);
			}
			const taxDefault = {
				id: taxIGVDefault.id,
				code: taxIGVDefault.code,
				codePercentage: taxIGVDefault.code,
				codeTable: taxIGVDefault.codeTable,
				flagSales: !!taxIGVDefault.flagTaxes,
				name: taxIGVDefault.description,
				percentage: taxIGVDefault.percentage,
			};
			this.newProduct.taxes = [taxDefault];
			this.newProduct.taxUnit = taxIGVDefault;
		}
		this.arrayTaxesGeneral = this.typeTaxes.filter((p) => p.flagTypeTaxes === 1);
		this.arrayTaxesComplement = this.typeTaxes.filter((o) => o.flagTypeTaxes === 2);

		this.setTypeTaxes();
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadResources() {
	const params = { subsidiaryId: this.productSubsidiaryId };
	let categoriesRequest = null;
	if (this.commerceId) {
		const paramsCat = { commerceId: this.commerceId };
		categoriesRequest = this.$httpProducts.get('e-categories', {
			params: paramsCat,
		});
	} else {
		const paramsCat = { flagMain: 1, relationAdd: 'subCategories' };
		categoriesRequest = this.categoriesList(paramsCat);
	}
	const requests = [
		this.listOfUnits(),
		categoriesRequest,
		this.$httpProducts.get('products-types'),
		this.listPricingPromise(),
		this.$httpProducts.get('features', { params }),
		this.brandsList(),
	];
	[
		{ data: this.units },
		{ data: this.categories },
		{ data: this.types },
		{ data: this.pricesLists },
		{ data: this.features },
		{ data: this.brands },
	] = await Promise.all(requests);
	this.units = this.units.filter((u) => u.flagActive);
	this.warehouses = this.globalList();
	const flagBatches = this.$userInfo.company.settings.flagWorkWithBatches || false;
	this.types = this.types.reduce((a, t) => {
		const newT = this.typeProductsCreationPermission.findIndex((tpcp) => tpcp === t.id);
		if (newT > -1) {
			if (t.code === 'variantes') {
				if (this.flagShowVariations) {
					a.push({ ...t });
				}
			} else {
				a.push({ ...t });
			}
		} else if (t.code === 'variantes' && this.flagShowVariations) {
			a.push({ ...t });
		} else if (t.code === 'lotes' && flagBatches) {
			a.push({ ...t });
		} else if (t.code === 'insumos' && this.flagFlowManufacturedProduct) {
			a.push({ ...t });
		}
		return a;
	}, []);
	this.types = this.types.filter((n) => n.name !== 'Lotes');
	if (!this.commerceId) {
		const categoriesNames = this.categories.reduce((a, u) => a.concat(`${u.name} `), '');
		const categoryBtn = { id: 0, name: categoriesNames, btn: true };
		this.categories.push({ ...categoryBtn });
	}
	await this.loadRateTaxes();
	await this.setDefaultUnit();
	await this.setDefaultProductType();
	await this.priceListFormatting();

	if (this.id) {
		this.generalTaxes = h.getCompanyTaxesFlat();
		await this.loadProductInfo();
	} else if (this.cloneProduct) {
		await this.loadProductInfo();
	}
	if (this.brands.length === 1) {
		this.newProduct.brandId = this.brands[0].id;
	}
	const defaultBrand = this.brands.find((p) => p.flagDefault === 1);
	if (defaultBrand && !this.newProduct.brandId) {
		this.newProduct.brandId = defaultBrand.id;
	}
	if (this.brands && this.brands.length === 0 && this.showBrandConfig) {
		this.showModalBrand = true;
	}
}

async function loadUnits(setUnit) {
	({ data: this.units } = await this.listOfUnits());
	if (setUnit) {
		const unitSelected = this.units.find((u) => u.id === setUnit.id);
		this.setProductData({ model: 'unitId', value: unitSelected.id });
	}
}

async function loadBrands(setBrand) {
	({ data: this.brands } = await this.brandsList());
	if (setBrand) {
		const brandSelected = this.brands.find((u) => u.id === setBrand.id);
		this.setProductData({ model: 'brandId', value: brandSelected.id });
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
	return this.newProduct.type === TypeProduct.Composed;
}

function isManufactured() {
	return (
		this.newProduct.type === TypeProduct.Products && this.newProduct.flagFlowManufactured
	);
}

function onSelectType({ code, id }) {
	if (code && id) {
		this.newProduct.type = id;
		this.showLotSelected = code === 'lotes';
		this.showFeaturesSelect = code === 'variantes';
		this.finishProductSelected = code === 'productos-terminados';
		this.composedProductSelected = code === 'composed';
		this.isSupply = id === 3;
		// this.newProduct.flagLotsEnabled = this.showLotSelected;
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
		const codeItem = this[`${code}Selected`].findIndex((cs) => cs.id === item.id);
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
		this.priceCurrent !== this.newProduct.priceSale ||
		this.pricesListsConfiguredCurrent.length !== this.pricesListsConfigured.length
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

function priceListFormatting() {
	const self = this;
	this.pricesLists.forEach((pl, ind) => {
		self.$set(
			self.newProduct.pricesLists,
			ind,
			compose(
				setNewProperty('name', pl.name),
				setNewProperty('id', pl.id),
				setNewProperty('ranges', []),
				setNewProperty('tax', null),
				setNewProperty(
					'show',
					self.idListPriceCommerce ? pl.id === self.idListPriceCommerce : true
				),
				setNewProperty(
					'open',
					self.idListPriceCommerce ? pl.id === self.idListPriceCommerce : ind === 0
				)
			)(self.priceListObject)
		);
	});
	this.pricesListsSlide = [...this.newProduct.pricesLists];
}

function redirecting(productId) {
	if (!this.newProduct.flagEcommerce || this.cloneProduct) {
		this.goToMasterProductList();
	} else if (productId) {
		this.goToMasterProductEditing(productId);
	} else {
		this.goTo('master-product');
	}
}

function removeAlternateCode(item) {
	const index = this.newProduct.alternateCode.indexOf(item);
	if (index > -1) {
		this.newProduct.alternateCode.splice(index, 1);
	}
}

function removeConversion(conver, converIndex) {
	if (conver.id) {
		this.newProduct.conversions = this.newProduct.conversions.filter(
			(c) => c.id !== conver.id
		);
		this.removeUnitFromPriceList(conver);
	} else {
		this.newProduct.conversions.splice(converIndex, 1);
	}
}

function removeUnitFromPriceList(conver) {
	this.newProduct.pricesLists = this.newProduct.pricesLists.map((pl) => {
		const newPl = { ...pl };
		newPl.units = pl.units.filter((u) => u.id !== conver.id);
		return newPl;
	});
	this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
		const newPl = this.newProduct.pricesLists.find((pl) => pl.id === pls.id);
		if (newPl) {
			return this.getNewPriceList(newPl);
		} else if (this.newProduct.conversions) {
			if (this.newProduct.conversions.length) {
				const newPls = { ...pls };
				const convert = this.newProduct.conversions.map((c) => {
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
				newPls.units = [...convert];
				return newPls;
			}
		}
		return pls;
	});
}

function routeChange() {
	if (this.id) {
		this.generalTaxes = h.getCompanyTaxesFlat();
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
		this.newProduct.accountingAccount = this.accountingAccountsAdded.map((aaa) => ({
			code: aaa.code,
		}));
	}
	if (body) {
		if (body.codeRetention) {
			this.newProduct.codeRetention = body.codeRetention;
		}
		if (body.taxes.length > 0) {
			this.newProduct.taxes = this.newProduct.taxes.concat(body.taxes);
		}
	}
	this.showNotification('La información contable ha sido guardada con éxito');
	this.cancelModal();
}

function saveCategories(body) {
	this.$set(this.newProduct, 'eCategories', body);
	this.showNotification('Las categorías de ecommerce han sido asignadas correctamente.');
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
	if (conversion.id) {
		const { code, name } = this.units.find((u) => u.id === conversion.id);
		newConversion.name = name;
		newConversion.code = code;
		this.disabledConversion = false;
	}
	this.$set(this.newProduct.conversions, index, newConversion);
	if (this.newProduct.conversions[index]) {
		const newConv = { ...this.newProduct.conversions[index] };
		delete newConv.barcode;
		delete newConv.unitFrom;
		delete newConv.priceSaleMin;
		delete newConv.priceSaleMax;
		delete newConv.showMaxMin;
		const convKeys = Object.keys(newConv);
		const convKeysIdx = convKeys.findIndex((ck) => ck === 'code');
		if (convKeysIdx > -1 && !newConv.code) {
			convKeys.splice(convKeysIdx, 1);
		}
		if (convKeys.every((ck) => newConv[ck])) {
			this.addConversion(index);
		}
	}
}

function setConversionFromProduct(conversions) {
	const conversionsFromProduct = conversions
		? Object.keys(conversions).map((k) => {
				const newConversions = { ...conversions[k] };
				newConversions.id = Number(k);
				newConversions.showMaxMin = Boolean(
					newConversions.priceSaleMin || newConversions.priceSaleMax
				);
				return newConversions;
		  })
		: [];
	return [].concat(conversionsFromProduct);
}

function setData(accIndex, value) {
	this.$set(this.accountingAccountsAdded, accIndex, { ...value });
}

function setDefaultProductType() {
	const typeProductsCreation =
		this.$userInfo.company.settings.typeProductsCreationPermission;
	if (typeProductsCreation) {
		if (typeProductsCreation.length) {
			if (typeProductsCreation.length === 1 && !this.flagShowVariations) {
				const productTypeSelected = this.types.find(
					(t) => t.id === typeProductsCreation[0]
				);
				this.setProductData({ model: 'type', value: productTypeSelected });
			} else {
				this.setFinishedProducts();
			}
		} else {
			this.setFinishedProducts();
		}
	} else {
		this.setFinishedProducts();
	}
}

function setDefaultUnit() {
	const unitsNames = this.units.reduce((a, u) => a.concat(`${u.name} `), '');
	const newUnit = { id: 0, name: unitsNames, btn: true };
	this.units.push({ ...newUnit });
	const defaultUnit = this.units.find((u) => u.flagDefault);
	this.newProduct.unitId = isEmpty(defaultUnit) ? {} : defaultUnit.id;
	this.validUnit();
}

function setFinishedProducts() {
	const productFinished = this.types.find((p) => p.code === 'productos-terminados');
	this.newProduct.type = productFinished ? productFinished.id : this.types[0].id;
	this.finishProductSelected = !!productFinished;
}

function setFlagData({ model, value }) {
	if (model === 'flagPriceListReplicate') {
		this[model] = value;
	} else {
		this.newProduct[model] = value;
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
	if (this.newProduct.taxes) {
		const PriceList = new PriceListClass(
			priceListUpdated,
			this.basePriceUsed,
			this.basePriceComputed,
			this.newProduct.taxes
		);
		const pricesListUpdateUpdated = compose(
			setNewProperty('salePrice', PriceList.price),
			setNewProperty('unitPrice', PriceList.unitPrice),
			setNewProperty('tax', PriceList.tax),
			setNewProperty('units', priceListUpdated.units ? PriceList.units : [])
		)(priceListUpdated);
		this.$set(this.pricesListsSlide, index, l.cloneData(pricesListUpdateUpdated));
	} else {
		this.$set(this.pricesListsSlide, index, { ...priceListUpdated });
	}
}

function setProductData({ model, value }) {
	if (model === 'eCategories') {
		if (value) {
			if (!value.btn) {
				this.eCategorySelected = value.id;
				const eCategoryIdx = this.eCategoriesSelected.findIndex((c) => c.id === value.id);
				if (eCategoryIdx < 0) {
					this.eCategoriesSelected.push({ ...value });
					this.newProduct.eCategories = this.eCategoriesSelected.map((ec) => ec.id);
				}
			}
		}
	} else if (model === 'priceToShow') {
		const { salPriceList } = this.$userInfo;
		const pricesListDefaultId = salPriceList ? salPriceList.id : null;
		const priceListIdSelected = this.idListPriceCommerce || pricesListDefaultId;
		const priceListToEdit = this.pricesListsSlide.find(
			(pls) => pls.id === priceListIdSelected
		);
		const prop = this.priceLabel === 'Precio de venta' ? 'salePrice' : 'unitPrice';
		this.$set(priceListToEdit, prop, Number(value));
		this.acceptPricesLists(priceListIdSelected);
	} else if (model === 'accountingAccountCode') {
		if (this.newProduct.accountingAccount.length === 0) {
			this.newProduct.accountingAccount.push({ code: value.value, name: '' });
		} else {
			this.$set(this.newProduct.accountingAccount[0], 'code', value.value);
		}
	} else if (model === 'accountingAccountName') {
		if (this.newProduct.accountingAccount.length === 0) {
			this.newProduct.accountingAccount.push({ code: '', name: value.value });
		} else {
			this.$set(this.newProduct.accountingAccount[0], 'name', value.value);
		}
	} else {
		this.newProduct[model] = model === 'type' ? value.id : value;
	}
	if (model === 'type') {
		this.onSelectType(value);
	}
	if (model === 'code') {
		this.availableCode = false;
		this.checking = false;
	}
	if (model === 'unitId') {
		this.validUnit();
	}
}

function setProductFeatures({ value }) {
	this.newProduct.features = [...value] || [];
}

function setAdditionalInformation({ model, value }) {
	this.newProduct.additionalInformation[model] = value;
}

function setProductInfo(pro) {
	const productData = l.cloneData(pro);

	if (this.$userInfo.company.settings.flagCalculateEarnings) {
		const { cost, lastCost, flagTaxCost = false, taxCostPercentage = 0 } = productData;
		let totalCost = cost || lastCost || 0;
		if (flagTaxCost) {
			totalCost *= Number(`1.${taxCostPercentage}`);
		}
		this.newProduct.cost = Number(totalCost.toFixed(4));
	} else {
		this.newProduct.cost = productData.totalCost;
	}

	this.newProduct.accountingAccount = productData.accountingAccount || [];
	this.newProduct.alternateCode = productData.alternateCode || [];
	this.newProduct.categoryId = productData.subCategoryId
		? productData.subCategoryId
		: productData.categoryId;
	this.newProduct.code = productData.code;
	this.newProduct.flagTaxCost = Boolean(productData.flagTaxCost);
	this.newProduct.taxCostPercentage = productData.taxCostPercentage;
	this.newProduct.brandId = this.showBrandConfig
		? productData.brandSpId
		: productData.warehouseProduct.brandId;
	this.newProduct.conversions =
		this.setConversionFromProduct(productData.conversions) || this.newProduct.conversions;
	this.newProduct.totalCost = productData.totalCost;
	this.newProduct.lastCost = productData.cost;
	this.newProduct.description = productData.description;
	this.newProduct.features = productData.features || [];
	this.newProduct.flagActive =
		this.commerceId && this.isMibodega ? productData.isPublic : productData.flagActive;
	this.newProduct.flagActiveIot =
		productData.additionalInformation && productData.additionalInformation.flagActiveIot
			? productData.additionalInformation.flagActiveIot
			: null;
	if (this.arrayDomains) {
		this.newProduct.flagNotControlInventory = Boolean(
			productData.flagNotControlInventory
		);
		this.newProduct.flagStockNegative =
			this.showStockNegative || productData.flagStockNegative
				? Boolean(productData.flagStockNegative)
				: null;
	}
	this.newProduct.flagControlSerie = Boolean(productData.flagControlSerie);
	this.newProduct.flagFlowManufactured = Boolean(productData.flagFlowManufactured);
	this.newProduct.flagLotsEnabled = Boolean(productData.flagLotsEnabled);
	this.newProduct.flagWeighable = Boolean(productData.flagWeighable);
	this.newProduct.flagEcommerce = Boolean(productData.flagEcommerce);
	this.newProduct.flagLoyalti = Boolean(productData.flagLoyalti);
	this.newProduct.score = productData.score;
	this.newProduct.flagSales = productData.flagSales;
	this.newProduct.name = productData.name;
	this.newProduct.priceSaleMin = productData.priceSaleMin;
	this.newProduct.priceSaleMax = productData.priceSaleMax;
	this.newProduct.pricesLists = this.getAndSetPricesList(productData.priceList);

	const newTaxes = productData.taxes.map((p) => {
		const newRow = { ...p };
		const findTax = this.typeTaxes.find((o) => o.idCodeReference === p.idCodeReference);
		const flagTypeTaxes = l.getPath(findTax, 'additionalInformation.flagTypeTaxes');
		newRow.flagTypeTaxes = flagTypeTaxes || null;
		return newRow;
	});
	this.newProduct.taxes = newTaxes;
	const existTaxUnid = this.newProduct.taxes.find((p) => p.flagTypeTaxes === 1);
	const existTaxMult = this.newProduct.taxes.filter((p) => p.flagTypeTaxes === 2);
	this.newProduct.taxUnit = existTaxUnid;
	this.newProduct.taxMultiple = existTaxMult || null;
	this.newProduct.arrayTaxesConcat = existTaxMult;
	this.newProduct.unitId = productData.unitId;
	this.newProduct.urlImage = productData.urlImage;
	this.newProduct.weight = productData.weigth;
	this.newProduct.commerce = productData.commerce;
	this.newProduct.additionalInformation = productData.additionalInformation;
	this.personalInformationFeatureAdd =
		productData.additionalInformation && productData.additionalInformation.features
			? productData.additionalInformation.features
			: null;
	this.newProduct.eCategories = productData.comCategories
		? productData.comCategories.map((p) => p.id) || undefined
		: productData.eCategories;
	this.eCategoriesOrigin = [...this.newProduct.eCategories] || undefined;
	this.newProduct.accountingAccount = productData.accountingAccount || [];
	this.newProduct.accountingAccount.forEach((paa) => {
		const aaa = this.accountingAccounts.find((aa) => aa.code === paa.code);
		this.accountingAccountsAdded.push(aaa);
	});
	this.newProduct.warehousesId =
		productData.warehousesId || productData.warehouseProductDetails;
	const typeSelected = this.types.find((t) => t.id === productData.type);
	this.originalCodeProduct = productData.code;
	if (typeSelected) {
		this.onSelectType(typeSelected);
	}
	this.commerces = this.commerces.map((p) => {
		const newRow = { ...p };
		const index = this.newProduct.commerce.findIndex((c) => c.commerceId === p.id);
		newRow.isSelected = index > -1;
		return newRow;
	});
	this.commercesSelected = this.commerces.filter((c) => c.isSelected);
	if (this.newProduct.description) {
		this.setShowDescription(true);
	}
	if (this.newProduct.warehousesId.length > 0) {
		this.warehousesSelected = this.newProduct.warehousesId.reduce((a, wi) => {
			const wItem = this.warehouses.find((w) => wi.id === w.id);
			if (wItem) {
				const newW = { ...wItem };
				newW.initQuantity = wi.stockWarehouse || null;
				newW.maxStock = wi.maxStock || null;
				newW.minStock = wi.minStock || null;
				a.push({ ...newW });
			}
			return a;
		}, []);
	}
	if (this.newProduct.pricesLists.length > 0) {
		this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
			const newPl = this.newProduct.pricesLists.find((pl) => pl.id === pls.id);
			if (newPl) {
				return this.getNewPriceList(newPl);
			} else if (this.newProduct.conversions) {
				if (this.newProduct.conversions.length) {
					const newPls = { ...pls };
					const conver = this.newProduct.conversions.map((c) => {
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
					return newPls;
				}
			}
			return pls;
		});
		this.pricesListsConfigured = this.newProduct.pricesLists;
		this.configuredPriceList = this.pricesListsConfigured.length > 0;
	}
	const comPriceDefault = this.$userInfo.salPriceList
		? this.$userInfo.salPriceList.id
		: null;
	const ecomPriceDefault = this.idListPriceCommerce;
	const defSelected = ecomPriceDefault || comPriceDefault;
	const findPrice = this.newProduct.pricesLists.find(
		(p) => p.id === defSelected && p.salePrice
	);
	this.newProduct.priceSale = findPrice
		? findPrice.salePrice || productData.price || 0
		: productData.price || 0;
	this.priceToShow = this.newProduct.priceSale;
	this.dataSelected = this.newProduct.commerce;
	this.dataSelectedCancel = this.newProduct.commerce;
	this.setFeaturesSelectedAndActive(this.newProduct.features, this.features);
	this.getWarehouses = this.newProduct.warehousesId
		? Boolean(this.newProduct.warehousesId.length)
		: false;
	if (this.newProduct.eCategories) {
		this.categoriesSelected = this.categories.reduce((acum, c) => {
			const newAcum = [...acum];
			const index = this.newProduct.eCategories.findIndex((p) => p === c.id);
			if (index > -1) {
				newAcum.push({ ...c });
			}
			return newAcum;
		}, []);
	}

	if (this.newProduct.priceSaleMin) {
		this.minimumSalePriceFlag = true;
	}
	if (this.newProduct.priceSaleMax) {
		this.maximumSalePriceFlag = true;
	}

	this.priceCurrent = productData.price;
	this.pricesListsConfiguredCurrent = [...this.pricesListsConfigured];
	this.warehousesCurrent = [...this.warehousesSelected];
	this.setTypeTaxes();
	const filterTaxes = this.newProduct.taxes.filter((p) => p.flagTypeTaxes === 1);
	this.formattingTaxes(filterTaxes);
	this.setComposingProducts(productData);
}

function setComposingProducts({ groups }) {
	if (this.isComposed || this.isManufactured) {
		const selectedPriceList = this.pricesLists.find((p) => p.flagDefault === 1).id;
		this.composingProducts = groups.map((product) =>
			compose(
				setNewProperty('taxes', this.setProductTaxes(product)),
				setNewProperty(
					'salePrice',
					product.product.priceList[selectedPriceList]
						? product.product.priceList[selectedPriceList].price
						: product.product.price
				),
				setNewProperty(
					'price',
					product.product.priceList[selectedPriceList]
						? product.product.priceList[selectedPriceList].price
						: product.product.price
				),
				setNewProperty(
					'unitPrice',
					product.product.priceList[selectedPriceList]
						? product.product.priceList[selectedPriceList].unitPrice
						: product.product.unitPrice
				),
				setNewProperty('code', product.product.code),
				setNewProperty('name', product.product.name),
				setNewProperty('stock', product.product.stock),
				setNewProperty('priceCost', product.product.cost),
				setNewProperty('unitsProduct', this.unitsByProduct(product)),
				setNewProperty('pricesListArray', this.pricesListByProduct(product.product)),
				setNewProperty('units', this.buildUnitsByProduct(product, this.units)),
				setNewProperty('unitQuantity', product.unitQuantity)
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

function setShowDescription(value) {
	this.showDescription = value;
}

function setShowHelp(code) {
	this.showHelp[code] = !this.showHelp[code];
}

function setShowPriceList() {
	this.showPriceList = !this.showPriceList;
}

function setTaxIntoPricesLists(taxes) {
	if (this.newProduct.pricesLists) {
		this.newProduct.pricesLists = this.newProduct.pricesLists.map((pl) => {
			const PriceList = new PriceListClass(
				pl,
				this.basePriceUsed,
				this.basePriceComputed,
				taxes
			);
			const newPl = compose(
				setNewProperty('salePrice', PriceList.price),
				setNewProperty('unitPrice', PriceList.unitPrice),
				setNewProperty('tax', PriceList.tax),
				setNewProperty('units', pl.units ? PriceList.units : [])
			)(pl);
			return l.cloneData(newPl);
		});
		this.pricesListsSlide = this.pricesListsSlide.map((pls) => {
			const newPl = this.newProduct.pricesLists.find((pl) => pl.id === pls.id);
			if (newPl) {
				return this.getNewPriceList(newPl);
			} else if (this.newProduct.conversions) {
				const newPls = { ...pls };
				if (this.newProduct.conversions.length) {
					const conver = this.newProduct.conversions.map((c) => {
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
							earnings: {},
						};
						return newC;
					});
					newPls.units = [...conver];
				}
				return newPls;
			}
			return pls;
		});
		this.pricesListsConfigured = this.newProduct.pricesLists;
		this.configuredPriceList = this.pricesListsConfigured.length > 0;
	}
	if (!this.id) {
		this.loadingGeneral = false;
	}
}

function setTaxSelectedUnd({ model, value }) {
	if (value) {
		const objIva = this.typeTaxes.find((t) => t.flagTaxes === 1);
		const newTax = {
			...value,
			flagTypeTaxes: value.flagTypeTaxes,
			name: value.description,
			codePercentage: value.code,
			codeTable: objIva.codeTable,
			flagSales: !!objIva.flagTaxes,
			percentage: value.percentage || 0,
		};
		this.newProduct[model] = newTax;
		this.newProduct.taxes = [newTax];
		this.setTaxIntoPricesLists([this.newProduct.taxUnit]);
	} else if (!this.id) {
		this.loadingGeneral = false;
	}
}

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
		this.newProduct[model] = arr;
		this.newProduct.arrayTaxesConcat = arr;
		// this.newProduct.taxes.push({ ...arr });
	} else if (!this.id) {
		this.loadingGeneral = false;
	}
}

function setTypeTaxes() {
	if (this.commerceId && !this.id) {
		this.newProduct.commerce[0] = {
			code: this.commerceCode,
			commerceId: this.commerceId,
		};
		this.commerceData = { ...getLocalData('commerce-selected') };
		const generalTaxes = h.getCompanyTaxesFlat();

		this.generalTaxes = this.show10Percentage
			? this.flatTaxes(generalTaxes)
			: generalTaxes;
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
		this.valuesFeatures.length > 0 ? this.valuesFeatures.length * val.length : val.length;
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
		this.newProduct.warehousesId = this.warehouses.reduce((list, w) => {
			if (w.id) {
				return list.concat(w.id);
			}
			return list;
		}, []);
	} else {
		this.newProduct.warehousesId = value;
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
	h.setLocalData('master-products', []);
	const validationStock =
		this.id ||
		this.showFeaturesSelect ||
		this.showLotSelected ||
		this.isServices ||
		this.isComposed
			? true
			: this.isGetWarehousesStock;
	if (this.isPriceListPrice && validationStock) {
		this.createNewProduct();
	} else if (
		!this.isPriceListPrice &&
		!validationStock &&
		this.warehousesSelected.length === 0
	) {
		this.dialog = true;
		this.message = '¿Desea guardar el producto sin almacén y sin precio?';
	} else if (!this.isPriceListPrice && !validationStock && !this.isComposed) {
		this.dialog = true;
		this.message = '¿Desea guardar el producto sin stock y sin precio?';
	} else if (!this.isPriceListPrice) {
		this.dialog = true;
		this.message = '¿Desea guardar el producto sin precio?';
	} else if (this.warehousesSelected.length === 0) {
		this.dialog = true;
		this.message = '¿Desea guardar el producto sin almacén?';
	} else if (!validationStock && !this.isComposed) {
		this.dialog = true;
		this.message = '¿Desea guardar el producto sin stock?';
	}
}

function stockByWarehouse(warehouses) {
	this.newProduct.warehousesId = warehouses;
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
		newUnits.earnings = unitsObject[k].earnings || {};
		return newUnits;
	});
}

function typeProducts() {
	if (this.$userInfo.company.settings.typeProductsCreationPermission) {
		return (
			this.$userInfo.company.settings.typeProductsCreationPermission.length !== 1 ||
			this.flagShowVariations
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
		const { data: unitCreated } = await this.$httpProducts.post('units', this.newUnit);
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
		const { data: brandCreated } = await this.$httpProducts.post('brands', this.newBrand);
		this.showNotification('La marca ha sido creada correctamente.');
		this.cancelModal();
		this.loadBrands(brandCreated);
	} catch (error) {
		this.showGenericError();
	}
}

function validating() {
	if (this.finishProductSelected) {
		if (!this.warehousesSelected.length > 0) {
			return true;
		}
	}
	return false;
}

function validatingForSave() {
	const typeSelectedData = this.types.find((t) => t.id === this.newProduct.type) || {};
	const variantSelected = typeSelectedData.code === 'variantes';
	const invalidComposedProducts = isEmpty(this.composingProducts);
	const invalidComposedWarehouse = isEmpty(this.warehousesSelected);
	const flagShowAccountingEngine =
		this.$userInfo.company.settings.flagShowAccountingEngine;
	const acc = this.newProduct.accountingAccount[0];
	const hasCode = acc && !!acc.code;
	const hasName = acc && !!acc.name;
	const invalidAcc =
		flagShowAccountingEngine && ((hasCode && !hasName) || (!hasCode && hasName));

	const invalid = [
		this.$v.$invalid,
		variantSelected && this.featuresSelected.length === 0,
		this.isComposed ? invalidComposedProducts || invalidComposedWarehouse : false,
		invalidAcc,
	].some((el) => el === true);

	if (this.id) {
		return [!this.availableCode, invalid, this.isLoadingImage, this.isLoading].some(
			(el) => el === true
		);
	}

	return [!this.availableCode, invalid, this.isLoadingImage, this.isLoading].some(
		(el) => el === true
	);
}

function validatingPriceSaleMin(val) {
	if (this.minimumSalePriceFlag) {
		const { pricesLists } = this.newProduct;
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
		newProduct: {
			categoryId: { required: requiredIf(() => !this.commerceId) },
			code: { required },
			name: { required },
			type: { required },
			unitId: { required },
			priceSaleMin: {
				validatingPriceSaleMin: this.validatingPriceSaleMin,
			},
			// score: { required },
		},
	};
}

function validUnit() {
	this.currentUnit = this.units.find((u) => u.id === this.newProduct.unitId) || {};
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
	const flagControlSerie = this.newProduct.flagControlSerie;
	return warehouses.map((w) =>
		compose(
			setNewProperty('id', w.id),
			setNewProperty(
				'stock',
				flagControlSerie || this.newProduct.flagLotsEnabled ? 0 : w.initQuantity || 0
			),
			setNewProperty('minStock', flagControlSerie ? 0 : w.minStock || 0),
			setNewProperty('maxStock', flagControlSerie ? 0 : w.maxStock || 0)
		)({})
	);
}

function warehousesEdited() {
	return this.warehousesSelected.length !== this.warehousesCurrent.length;
}

function watchPricesListsSlide(val) {
	if (val && val.length > 0) {
		const hasInvalidDiscount = val.some(
			(item) =>
				item.discount < 0 ||
				item.discount > 100 ||
				item.units.some((unit) => unit.discount < 0 || unit.discount > 100)
		);
		if (this.$userInfo.company.settings.flagCalculateEarnings) {
			const result = val.some(
				(item) =>
					(!isEmpty(item.earnings) && item.salePrice === 0 && item.unitPrice === 0) ||
					(item.units &&
						item.units.some(
							(u) => !isEmpty(u.earnings) && u.salePrice === 0 && u.unitPrice === 0
						))
			);
			this.disabled = result || hasInvalidDiscount;
		} else {
			this.disabled =
				val.every((v) => !v.salePrice && !v.unitPrice) || hasInvalidDiscount;
		}
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
					item.product.conversions[unt.id] && item.product.conversions[unt.id].quantity;
				acum.push({ ...unt, quantity: quantityUnit });
			}
			return acum;
		}, []);
		if (item.product.unit) {
			newUnits.push(item.product.unit);
		} else {
			const unit = {
				id: item.unitId,
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
	const unitsByProducts = [unit || this.findUnitByUnitIdForEveryProduct(product, units)];

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

function updateComposingProducts(rows) {
	this.composingProducts = [...rows];
}

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
	this.composingProducts = [].concat(this.composingProducts, this.selectedProduct);
}

function updateProductUnit({ value, product }) {
	// obtener la lista precios del objeto product
	const { priceList: plLocal } = product.product;
	const selectedPlProduct = plLocal[product.selectedPriceListId];
	// Obtener el arreglo de unidades de la lista de precios seleccionada
	// buscar el precio correcto de acuerdo a la unidad entrante
	const newProd =
		selectedPlProduct ||
		product.product.priceList[Object.keys(product.product.priceList)[0]] ||
		product;
	const selectedUnit = newProd.units[value.id];
	this.composingProducts = this.composingProducts.map((c) => {
		const newC = { ...c };

		if (c.id === product.id) {
			const unit = c.unitsProduct || c.product.unit;
			const unitQuantity = unit.find((p) => p.id === value.id);
			newC.unitConversion = Number(unitQuantity.quantity ? unitQuantity.quantity : 1);
			newC.unitQuantity = Number(c.quantity * newC.unitConversion);
			newC.selectedUnitId = value.id;
			newC.unitName = unitQuantity.name ? unitQuantity.name : 'UNIDAD';
			if (selectedUnit) {
				newC.unitPrice =
					selectedUnit && selectedUnit.unitPrice
						? selectedUnit.unitPrice
						: selectedPlProduct.unitPrice;
				newC.price =
					selectedUnit && selectedUnit.price
						? selectedUnit.price
						: selectedPlProduct.price;
			} else {
				newC.unitPrice = newProd.unitPrice || product.unitPrice;
				newC.price = newProd.price || product.price;
			}
		}

		return newC;
	});
}

function updateQuantity(product) {
	this.composingProducts = this.composingProducts.map((c) => {
		const newC = { ...c };
		if (c.id === product.id && product.quantity !== '') {
			const unitConv = c.unitsProduct.find(
				(p) => p.id === (c.selectedUnitId || product.unitId)
			);
			newC.unitConversion = Number(unitConv && unitConv.quantity ? unitConv.quantity : 1);
			newC.unitQuantity = Number(newC.unitConversion * c.quantity);
		}
		return newC;
	});
}

function warehousesLabel() {
	return this.isComposed ? 'ALMACENES' : '¿DESEA AGREGAR STOCK?';
}

function setDataBrand({ model, value }) {
	this.newProduct[model] = value.id;
}

function setCostProduct({ model, value }) {
	if (value) {
		this.newProduct[model] = Number(value);
	}
	if (this.$userInfo.company.settings.flagCalculateEarnings) {
		this.updatePriceList(Number(value));
		this.acceptPricesLists(false);
	}
}

async function clearInformationProduct() {
	this.newProduct.taxUnit = {};
	this.newProduct.arrayTaxesConcat = [];
	this.arrayTaxesGeneral = [];
	this.newProduct.code = null;
	this.newProduct.taxMultiple = [];
	this.arrayTaxesComplement = null;
	if (this.cloneProduct) {
		this.newProduct.warehousesId = [];
		this.warehousesCurrent = [];
		this.warehousesSelected = [];
	}
	await this.loadRateTaxes();
}

async function watchRoute(value) {
	if (value.name === 'new-master-product') {
		await this.clearInformationProduct();
	}
}

function labelControlInventory() {
	return this.newProduct.flagNotControlInventory ? 'sin' : 'con';
}

function changeTaxCost(value) {
	this.newProduct.cost = value
		? fourDecimals(this.newProduct.cost * (1 + this.newProduct.taxCostPercentage / 100))
		: (this.newProduct.cost = fourDecimals(
				this.newProduct.cost / (1 + this.newProduct.taxCostPercentage / 100)
		  ));
}

function updateCostFromComposingTotal(value) {
	this.composingTotalValue = Number(value.toFixed(2));
}

function updateCostFromComposingTotalWithTax(value) {
	this.composingTotalValueWithTax = Number(value.toFixed(2));
}

function calculateCost() {
	// Llama a setCostProduct con el valor almacenado
	this.setCostProduct({
		model: 'cost',
		value: this.newProduct.flagTaxCost
			? this.composingTotalValueWithTax
			: this.composingTotalValue,
	});
}

function changeShowMaxMin(value, indexConversion) {
	this.newProduct.conversions[indexConversion].showMaxMin = value;
	this.newProduct.conversions[indexConversion].priceSaleMin = null;
	this.newProduct.conversions[indexConversion].priceSaleMax = null;
}

function data() {
	return {
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
		composingTotalValue: 0,
		composingTotalValueWithTax: 0,
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
		newProduct: {
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
			flagFlowManufactured: false,
			flagLotsEnabled: false,
			flagWeighable: false,
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
		newUnit: {
			code: '',
			color: '#000000',
			flagActive: true,
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
			comissions: {},
			earnings: {},
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
		showDescription: false,
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
		showCostPrice: !this.$userInfo.flagNotShowCostPrice,
		flagFlowManufacturedProduct:
			this.$userInfo.company.settings.flagFlowManufacturedProduct,
		isSupply: false,
		disabledTaxUnit: true,
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
		unitConversion,
		unitsForm,
		selectWarehouse,
		VueSixFour,
		categoriesAutocomplete,
	},
	computed: {
		allowProductFree,
		basePriceComputed,
		basePriceUsed,
		cancelBtnName,
		editName,
		filteredUnits,
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
		validating,
		validatingForSave,
		warehousesEdited,
		warehousesLabel,
		isManufactured,
	},
	created,
	data,
	methods: {
		acceptPricesLists,
		actionFeature,
		addAccount,
		addConversion,
		addFeatures,
		addItems,
		addProduct,
		addRow,
		addUnitIntoPriceList,
		articleWarehouse,
		assignCommerce,
		buildBody,
		buildPriceList,
		buildProductGroups,
		buildUnits,
		buildUnitsByProduct,
		setDataBrand,
		calculateCost,
		cancelDialog,
		cancelDialogImage,
		cancelModal,
		changeTaxCost,
		changeShowMaxMin,
		checkingAbailability,
		cleanActionObject,
		cleanSelectedProduct,
		clearInformationProduct,
		clearWarehousesStock,
		closeAssignCommerce,
		closeModal,
		createCategories,
		createFeature,
		createNewProduct,
		defaultTaxes,
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
		loadBrands,
		loadCategories,
		loadCommerces,
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
		priceListFormatting,
		pricesListByProduct,
		redirecting,
		removeAlternateCode,
		removeConversion,
		removeUnitFromPriceList,
		routeChange,
		runAction,
		saveAccountingData,
		saveCategories,
		selectedAll,
		selectedRow,
		setAdditionalInformation,
		setBrandData,
		setCostProduct,
		setComposingProducts,
		setConversion,
		setConversionFromProduct,
		setData,
		setDefaultProductType,
		setDefaultUnit,
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
		setProductFeatures,
		setProductInfo,
		setProductTaxes,
		setShowConversions,
		setShowDescription,
		setShowHelp,
		setShowPriceList,
		setTaxIntoPricesLists,
		setTaxSelected,
		setTaxSelectedUnd,
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
		updateComposingProducts,
		updateCostFromComposingTotal,
		updateCostFromComposingTotalWithTax,
		updateProductUnit,
		updateQuantity,
		updateUnity,
		validatingPriceSaleMin,
		validUnit,
		warehouseFormat,
		warehouseFormatId,
		async fixBrands() {
			try {
				this.isLoading = true;
				await this.$httpProducts.delete(`products/${this.id}/brands`);
				this.showNotification('Marcas corregidas correctamente');
			} catch (error) {
				if (error && error.status) {
					this.showGenericError(error.data.messageError);
				} else {
					this.showGenericError();
				}
			} finally {
				this.isLoading = false;
			}
		},
		getNewPriceList(newPl) {
			const unitIds = newPl.units.map((u) => u.id);
			const units = this.newProduct.conversions.map((c) => {
				if (!unitIds.includes(c.id)) {
					return {
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
				}
				return newPl.units.find((u) => u.id === c.id);
			});
			return {
				...newPl,
				units,
			};
		},
		updatePriceList(cost) {
			this.pricesListsSlide = this.pricesListsSlide.map((item) => {
				const updatedItem = { ...item };

				// Actualizar los rangos en el producto principal
				if (updatedItem.ranges && updatedItem.ranges.length) {
					updatedItem.ranges = updatedItem.ranges.map((range) => {
						const updatedRange = { ...range };

						if (updatedRange.amount) {
							const price =
								updatedRange.type === 'fixed'
									? cost + updatedRange.amount
									: cost + (cost * updatedRange.amount) / 100;
							updatedRange.price = Number(price.toFixed(5));
						}
						return updatedRange;
					});
				}

				// Si el producto tiene earnings, actualizamos el salePrice
				if (updatedItem.earnings && !isEmpty(updatedItem.earnings)) {
					const salePrice =
						updatedItem.earnings.type === 'fixed'
							? updatedItem.earnings.amount + cost
							: cost + (cost * updatedItem.earnings.amount) / 100;
					updatedItem.salePrice = Number(salePrice.toFixed(1));
				}

				// Actualizar las unidades
				updatedItem.units = updatedItem.units.map((unit) => {
					const updatedUnit = { ...unit };
					const unitConv = this.newProduct.conversions.find(
						(p) => p.name === updatedUnit.name
					);

					// Actualizar rangos dentro de la unidad
					if (updatedUnit.ranges && updatedUnit.ranges.length) {
						updatedUnit.ranges = updatedUnit.ranges.map((range) => {
							const updatedRange = { ...range };

							if (updatedRange.amount) {
								const price =
									updatedRange.type === 'fixed'
										? (cost + updatedRange.amount) * unitConv.quantity
										: (cost + (cost * updatedRange.amount) / 100) * unitConv.quantity;
								updatedRange.price = Number(price.toFixed(5));
							}
							return updatedRange;
						});
					}

					// Actualizar el precio de la unidad basado en earnings
					if (updatedUnit.earnings && !isEmpty(updatedUnit.earnings)) {
						const salePrice =
							updatedUnit.earnings.type === 'fixed'
								? (cost + updatedUnit.earnings.amount) * unitConv.quantity
								: (cost + (cost * updatedUnit.earnings.amount) / 100) * unitConv.quantity;

						updatedUnit.price = Number(salePrice.toFixed(5));
						updatedUnit.salePrice = Number(salePrice.toFixed(5));
					}

					return updatedUnit;
				});

				return updatedItem;
			});
		},
		onChange(model) {
			this[model] = !this[model];
		},
	},
	mixins: [upLoadImageMixin],
	props: {
		commerceCode: [String, Number],
		commerceId: [Number, String],
		id: [Number, String],
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

.product-checkbox-text--sales {
	font-size: 14px;
	font-weight: 600;
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
		font-size: 12px;
		text-transform: none;
		color: red;
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

.unit-conversion-btn {
	align-self: start;
	display: flex;
	padding-top: 10px;
}
</style>
