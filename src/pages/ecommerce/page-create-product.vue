<template>
<div class="new-create" @click="dirtyFunction">
	<header-page
		class="px-5"
 		name="create-product"
 		:title="$route.meta.title"
	/>
	<app-actions
		:resource-uri="$route.name"
		@open-help="openHelp"
		@run-action="runAction"
	/>
	<div class="px-2">
		<v-layout wrap pt-4 px-5>
			<v-flex xs12 md3 :key="4" v-if="invalidSections && formDirty">
				<v-alert type="warning" :value="invalidSections && formDirty">
					Debe asignar secciones.
				</v-alert>
			</v-flex>
			<v-flex xs12 md4 :key="3" v-if="invalidCategories && formDirty">
				<v-alert type="warning" :value="invalidCategories && formDirty">
					Debe asignar categorías ecommerce.
				</v-alert>
			</v-flex>
			<v-flex xs12 md5 :key="2" v-if="($v.appImages.$invalid || $v.webImages.$invalid) && formDirty">
				<v-alert type="warning" :value="($v.appImages.$invalid || $v.webImages.$invalid) && formDirty">
					Debe asignar imágenes para la app y para la web.
				</v-alert>
			</v-flex>
			<v-flex xs12 :key="1">
				<v-alert type="error" :value="disabledByPriceList">
					Solo se permiten datos numéricos en la lista de precios.
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-space-around mb-5 pt-4>
			<v-flex xs5>
				<v-layout wrap>
					<v-flex xs12 mb3>
						<v-subheader class="px-0 py-1 block-title">
							Datos Generales
						</v-subheader>
						<v-divider></v-divider>
					</v-flex>
					<v-flex xs12 mb-4>
						<v-select
							required
							:disabled="!!id"
							class="filter-select shadow-inset mt-3"
							item-text="name"
							item-value="id"
							label="Tipo de producto"
							v-model="newProduct.product.type"
							:items="types"
						></v-select>
						<span class="form-group__message" v-if="!$v.newProduct.product.type.required">
							El tipo de producto es requerido
						</span>
					</v-flex>
					<v-flex xs6 pr-2>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-product-code"
							label="Código"
							v-model="newProduct.product.code"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newProduct.product.code.required">
							El código del producto es requerido
						</span>
						<span
							class="text-not-code-blank"
							v-if="checkBlankCode(newProduct.product.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs6 pl-2>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-product-name"
							label="Nombre"
							v-model="newProduct.product.name"
							@input="setSlug"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newProduct.product.name.required">
							El nombre del producto es requerido
						</span>
					</v-flex>
					<v-flex xs12>
						<slug-input
							:loading="slugLoading"
							:slug="newProduct.product.slug"
							:validated="slugValidated"
							@on-input="setSlug"
						></slug-input>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							no-resize
							multi-line
							class="textarea-content filter-select shadow-inset mt-3"
							name="new-product-description"
							label="Descripción"
							v-model="newProduct.product.description"
						></v-text-field>
					</v-flex>
					<v-flex xs12 v-if="isEcommerce">
						<v-layout wrap mt-3 justify-center>
							<v-flex xs-6 pr-3>
								<v-text-field
									class="filter-select shadow-inset"
									name="new-product-price"
									readonly
									:label="`Precio de ${$userInfo.salPriceList.name}`"
									v-model="newProduct.product.price"
								></v-text-field>
							</v-flex>
							<v-flex xs-6 pr-3>
								<v-text-field
									class="filter-select shadow-inset"
									name="new-product-priceDiscount"
									label="Precio con descuento"
									v-model="newProduct.product.priceDiscount"
								></v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout wrap mt-3>
							<v-flex xs6 pr-3>
								<v-text-field
									class="filter-select shadow-inset"
									name="new-product-model"
									label="Modelo"
									v-model="newProduct.product.model"
								></v-text-field>
							</v-flex>
							<v-flex xs6>
								<v-flex xs12 d-flex align-center>
									<v-select
										class="filter-select shadow-inset"
										item-text="name"
										item-value="id"
										label="Categoría"
										v-model="newProduct.product.categoryId"
										:items="categories"
									></v-select>
									<v-btn
										class="ma-0 btn-new-product"
										color="primary darken-1"
										@click="openSlideModal('NC', 'Nueva Categoría', 500)"
									>
										<v-icon color="white">add</v-icon>
									</v-btn>
								</v-flex>
								<span class="form-group__message" v-if="!$v.newProduct.product.categoryId.required">
									La categoría del producto es requerida.
								</span>
							</v-flex>
							<v-flex xs12 text-xs-right mt-2
								v-show="newProduct.product.categoryId">
								<label class="vertical-center body-1">Agregar Características</label>
								<v-btn
									class="ma-0 btn-new-product"
									color="primary darken-1"
									@click="openSlideModal('CF', 'Agregar Características', 500)"
								>
									<v-icon color="white">add</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout mt-3>
							<v-flex xs6>
								<v-flex xs12 pr-3 d-flex align-center>
									<v-select
										v-model="newProduct.product.unitId"
										class="filter-select shadow-inset"
										item-text="name"
										item-value="id"
										:items="units"
										label="Unidad"
										@input="validUnit"
									></v-select>
									<v-btn
										class="ma-0 btn-new-product"
										color="primary darken-1"
										@click="openSlideModal('UND', 'Nueva Unidad')"
									>
										<v-icon color="white">add</v-icon>
									</v-btn>
								</v-flex>
								<span class="form-group__message" v-if="!$v.newProduct.product.unitId.required">
									La unidad del producto es requerida.
								</span>
							</v-flex>
							<v-flex xs6 v-if="showWarehouses">
								<v-flex xs12 d-flex align-center>
									<v-select
										class="filter-select shadow-inset"
										item-text="name"
										item-value="id"
										label="Marca"
										v-model="newProduct.brandId"
										:items="brands"
									></v-select>
									<v-btn
										class="ma-0 btn-new-product"
										color="primary darken-1"
										@click="openSlideModal('NB', 'Nueva Marca')"
									>
										<v-icon color="white">add</v-icon>
									</v-btn>
								</v-flex>
								<span class="form-group__message" v-if="$v.newProduct.brandId.$invalid">
									La marca del producto es requerida.
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12
						v-if="showWarehouses">
						<v-flex xs12 d-flex align-end>
							<app-select
								v-show="warehouses.length > 1"
								chips
								:items="warehouses"
								item-text="name"
								item-value="id"
								:label="labelWarehouse(true)"
								multiple
								:item="newProduct.warehouseId"
								:return-object="false"
								@input="setWarehouseId"
							/>
							<app-input-text
								v-if="warehouses.length === 1"
								:label="labelWarehouse()"
								:text="warehouses[0].name"
								readonly
								model="setWarehouseId"
								@input="setWarehouseId({ model: 'setWarehouseId', value: warehouses[0].id })"
							/>
						</v-flex>
						<span class="form-group__message" v-if="!$v.newProduct.warehouseId.required">
							La Tienda del producto es requerida.
						</span>
					</v-flex>
						<v-flex xs12 pr-3 mt-3>
							<v-select
								chips
								multiple
								autocomplete
								return-object
								class="filter-select shadow-inset"
								label="Comercios"
								item-text="name"
								item-value="code"
								:items="commerceList"
								:value="newProduct.product.commerce"
								@input="setDataCommerce"
							>
								<template slot="selection" slot-scope="data">
									<v-chip
									:selected="data.selected"
									:key="data.item.id"
									close
									class="chip--select-multi"
									@input="data.parent.selectItem(data.item)"
									>
									{{ data.item.name }}
									</v-chip>
								</template>
							</v-select>
						</v-flex>
					<v-flex xs6 pr-3 mt-3>
						<v-text-field
							class="filter-select shadow-inset"
							label="Peso"
							suffix="Kg"
							type="number"
							v-model="newProduct.product.weigth"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5>
				<v-layout wrap mb-4
					v-if="isNotServices">
					<v-flex xs12>
						<v-btn
							class="block-title collapse-btn px-0 ma-0"
							color="transparent"
							:disabled="!newProduct.product.unitId"
							block
							flat
							@click="setShowConversions"
						>
							Conversiones
							<v-icon color="primary">
								<template v-if="showConversions">
									arrow_drop_up
								</template>
								<template v-else>
									arrow_drop_down
								</template>
							</v-icon>
						</v-btn>
						<v-divider></v-divider>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-flex xs12 mt-3 pl-2
							v-if="showConversions">
							<transition-group name="fade" mode="out-in">
								<v-layout wrap align-center pl-4
									v-for="(conver, indexConver) in conversions"
									:key="indexConver">
									<v-flex xs2 pr-2>
										<app-input-text
											label="Cant."
											model="quantity"
											:text="conver.quantity"
											type="number"
											@input="setData($event, indexConver)"
										/>
									</v-flex>
									<v-flex xs2 pr-2>
										<app-input-text
											label="Unidad"
											readonly
											:text="unityCode"
										/>
									</v-flex>
									<v-flex xs2 pt-4 text-xs-center>
										<v-subheader class="justify-center px-0">Equivale a</v-subheader>
									</v-flex>
									<v-flex xs2 px-2>
										<app-input-text
											label="Cant."
											readonly
											:text="conver.quantityTo"
											type="number"
										/>
									</v-flex>
									<v-flex xs3>
										<app-select
											:item="conver.id"
											item-text="name"
											item-value="id"
											:items="filteredUnits"
											label="Unidades"
											model="id"
											@input="setData($event, indexConver, 'units')"
										/>
									</v-flex>
									<v-flex xs1 pt-4>
										<v-btn
											type="button"
											class="btn-list btn-list-add"
											v-if="indexConver === conversions.length - 1"
											:disabled="disabledConver"
											@click="addConversion(indexConver)">
											<v-icon>add</v-icon>
										</v-btn>
										<v-btn
											v-else
											type="button"
											class="btn-list btn-list-remove"
											@click="removeConversion(indexConver)">
											<v-icon>remove</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</transition-group>
						</v-flex>
					</transition>
				</v-layout>
				<v-layout wrap>
					<v-flex xs12 mb-4>
						<v-btn
							class="block-title collapse-btn px-0 ma-0"
							color="transparent"
							block
							flat
							@click="setShowPriceList"
						>
							Listas de Precios
							<v-flex text-xs-right mb-2 mr-3>
								<template v-for="(item, index) in typePrices">
									<v-tooltip top v-if="typePriceSelected !== item.id" :key="index">
										<button
											:disabled="flagTypePrice"
											slot="activator"
											class="btn-type-price ml-3"
											:class="{active: typePriceSelected === item.id}"
										>
											{{ item.code }}
										</button>
										<span>Para poder configurar el Precio de Venta (PU) o Unitario (PV) es necesario <br> 
										activar la opción incluye {{ labelsByCountry.taxName }} en la configuración de compañía.</span>
									</v-tooltip>
									<button
										v-else
										:key="index"
										class="btn-type-price ml-3"
										:class="{active: typePriceSelected === item.id}">
										{{ item.code }}
									</button>
								</template>
							</v-flex>
							<v-icon color="primary">
								<template v-if="showPriceList">
									arrow_drop_up
								</template>
								<template v-else>
									arrow_drop_down
								</template>
							</v-icon>
						</v-btn>
						<v-divider></v-divider>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-flex xs12 v-if="showPriceList">
							<v-layout wrap align-center>
								<v-flex xs12 px-2 mb-4
									class="new-product-price-list"
									v-if="!isLoading">
									<div class="new-product-main-container"
										:style="biggerHeight">
										<transition-group name="fade" mode="out-in">
											<div class="vprice-list-container"
												v-for="(list, listIndex) in priceList"
												:key="listIndex">
												<v-layout row wrap align-center justify-space-between>
													<v-flex>{{ list.name }}</v-flex>

												</v-layout>
												<v-flex class="layout wrap px-2 mt-3">
													<v-flex xs12 sm2 pr-2>
														<v-flex text-xs-center class="title-price-list">
															Precio Unit.
														</v-flex>
														<v-flex v-if="flagTypePrice === 0" mt-2>
															<v-text-field
															class="filter-select shadow-inset show-error ml-2"
															name="accounting-new-product-price"
															single-line
															hide-details
															type="number"
															v-model.number="list.unitPrice"
															></v-text-field>
														</v-flex>
														<v-flex v-else mt-2 class="value-list-price">
															{{ list.unitPrice }}
														</v-flex>
													</v-flex>
													<v-flex xs12 sm2 pr-2 ml-3>
														<v-flex text-xs-center>
															<span class="title-price-list">{{ labelsByCountry.taxName }}</span>
														</v-flex>
														<v-flex text-xs-center mt-2 class="value-list-price">
															{{ list.taxes }}
														</v-flex>
													</v-flex>
													<v-flex xs12 sm2 ml-3>
														<v-flex text-xs-center v-if="unityName" class="title-price-list">
															Precio Venta
														</v-flex>
														<v-flex v-if="flagTypePrice === 1" mt-2>
															<v-text-field
															class="filter-select shadow-inset show-error"
															single-line
															hide-details
															type="number"
															v-model.number="list.price"
															:rules="[list.price < maxNumber || errorMessage]"
															@input="setPrice($event, list)"
															@update:error="captureError($event, 'price')"
															></v-text-field>
														</v-flex>
														<v-flex v-else text-xs-center mt-2 class="value-list-price">
															{{ list.price }}
														</v-flex>
													</v-flex>
													<v-flex xs12 sm4 ml-5>
														<v-checkbox
														class="pt-4"
														label="Precio x mayor"
														v-model="list.showRanges"
														></v-checkbox>
													</v-flex>
												</v-flex>
												<v-layout wrap align-center v-if="list.showRanges">
													<v-flex xs12 v-for="(range, rangeIndex) in list.ranges" :key="rangeIndex">
														<v-layout wrap align-center>
															<v-flex xs4>
																<v-subheader>Precio x mayor</v-subheader>
															</v-flex>
															<v-flex xs2>
																<v-text-field
																	class="filter-select shadow-inset show-error"
																	name="new-product-ranges"
																	type="number"
																	single-line
																	hide-details
																	v-model.number="range.price"
																	:rules="[range.price < maxNumber || errorMessage]"
																	@update:error="captureError($event, 'rangePrice')"
																></v-text-field>
															</v-flex>
															<v-flex xs1>
																<v-subheader>de</v-subheader>
															</v-flex>
															<v-flex xs1>
																<v-text-field
																	class="filter-select shadow-inset show-error"
																	name="new-product-from"
																	type="number"
																	single-line
																	hide-details
																	v-model.number="range.from"
																	:rules="[range.from < maxNumber || errorMessage]"
																	@update:error="captureError($event, 'from')"
																></v-text-field>
															</v-flex>
															<v-flex xs1>
																<v-subheader>a</v-subheader>
															</v-flex>
															<v-flex xs1>
																<v-text-field
																	class="filter-select shadow-inset show-error"
																	name="new-product-to"
																	type="number"
																	hide-details
																	single-line
																	v-model.number="range.to"
																	:rules="[range.to < maxNumber || errorMessage]"
																	@update:error="captureError($event, 'to')"
																></v-text-field>
															</v-flex>
															<v-flex xs1>
																<v-subheader>unid.</v-subheader>
															</v-flex>
															<v-flex xs1>
																<v-btn
																	type="button"
																	class="btn-list btn-list-remove"
																	v-if="rangeIndex !== (list.ranges.length - 1)"
																	@click="removeRange(listIndex, rangeIndex)">
																	<v-icon>remove</v-icon>
																</v-btn>
																<v-btn
																	type="button"
																	class="btn-list btn-list-add"
																	v-if="rangeIndex === (list.ranges.length - 1)"
																	@click="addRange(listIndex)">
																	<v-icon>add</v-icon>
																</v-btn>
															</v-flex>
														</v-layout>
													</v-flex>
												</v-layout>
												<v-layout wrap
													v-for="(unit, unitIndex) in list.units"
													:key="unit.id">
													<v-flex xs12>
														<v-divider></v-divider>
													</v-flex>
													<v-flex xs12>
														<v-layout wrap align-center>
															<v-flex xs8>
																<v-layout wrap align-center>
																	<v-flex xs5>
																		<v-subheader v-if="unit.name">Precio x {{ unit.name | lowerCase }}</v-subheader>
																	</v-flex>
																	<v-flex xs3>
																		<v-text-field
																			class="filter-select shadow-inset show-error"
																			name="accounting-new-product-price"
																			single-line
																			hide-details
																			type="number"
																			v-model.number="unit.price"
																			:rules="[unit.price < maxNumber || errorMessage]"
																			@update:error="captureError($event, 'price')"
																		></v-text-field>
																	</v-flex>
																</v-layout>
															</v-flex>
															<v-flex xs4 text-xs-right>
																<v-checkbox
																	class="pt-4"
																	label="Precio x mayor"
																	v-model="unit.showRanges"
																></v-checkbox>
															</v-flex>
														</v-layout>
														<v-layout wrap align-center v-if="unit.showRanges">
															<v-flex xs12 v-for="(unitRange, unitRangeIndex) in unit.ranges" :key="unitRangeIndex">
																<v-layout wrap align-center>
																	<v-flex xs4>
																		<v-subheader>Precio x mayor</v-subheader>
																	</v-flex>
																	<v-flex xs2>
																		<v-text-field
																			class="filter-select shadow-inset show-error"
																			name="new-product-ranges"
																			type="number"
																			hide-details
																			single-line
																			v-model.number="unitRange.price"
																			:rules="[unitRange.price < maxNumber || errorMessage]"
																			@update:error="captureError($event, 'rangePrice')"
																		></v-text-field>
																	</v-flex>
																	<v-flex xs1>
																		<v-subheader>de</v-subheader>
																	</v-flex>
																	<v-flex xs1>
																		<v-text-field
																			class="filter-select shadow-inset show-error"
																			name="new-product-from"
																			type="number"
																			hide-details
																			single-line
																			v-model.number="unitRange.from"
																			:rules="[unitRange.from < maxNumber || errorMessage]"
																			@update:error="captureError($event, 'from')"
																		></v-text-field>
																	</v-flex>
																	<v-flex xs1>
																		<v-subheader>a</v-subheader>
																	</v-flex>
																	<v-flex xs1>
																		<v-text-field
																			class="filter-select shadow-inset show-error"
																			name="new-product-to"
																			type="number"
																			hide-details
																			single-line
																			v-model.number="unitRange.to"
																			:rules="[unitRange.to < maxNumber || errorMessage]"
																			@update:error="captureError($event, 'to')"
																		></v-text-field>
																	</v-flex>
																	<v-flex xs1>
																		<v-subheader>unid.</v-subheader>
																	</v-flex>
																	<v-flex xs1>
																		<v-btn
																			type="button"
																			class="btn-list btn-list-remove"
																			v-if="unitRangeIndex !== (unit.ranges.length - 1)"
																			@click="removeRange(listIndex, unitRangeIndex, unitIndex)">
																			<v-icon>remove</v-icon>
																		</v-btn>
																		<v-btn
																			type="button"
																			class="btn-list btn-list-add"
																			v-if="unitRangeIndex === (unit.ranges.length - 1)"
																			@click="addRange(listIndex, unitIndex)">
																			<v-icon>add</v-icon>
																		</v-btn>
																	</v-flex>
																</v-layout>
															</v-flex>
														</v-layout>
													</v-flex>
												</v-layout>
											</div>
										</transition-group>
									</div>
									<p class="price-list-see-all"
										@click="showAllPriceList"
										v-if="moorePriceList"
									>
										Ver otras listas
									</p>
									<p class="price-list-see-all"
										@click="showAllPriceList"
										v-else
									>
										Ver menos listas
									</p>
								</v-flex>
							</v-layout>
						</v-flex>
					</transition>
				</v-layout>
				<v-layout wrap>
					<v-flex xs12>
						<v-btn
							class="block-title collapse-btn px-0 ma-0"
							color="transparent"
							block
							flat
							@click="setShowImages"
						>
							Imágenes
							<v-icon color="primary">
								<template v-if="showImages">
									arrow_drop_up
								</template>
								<template v-else>
									arrow_drop_down
								</template>
							</v-icon>
						</v-btn>
						<v-divider></v-divider>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-flex xs12 mt-3 v-if="showImages">
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
											<v-layout wrap justify-center align-end class="mb-3 px-4">
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
													<label ref="labelEcommerceProduct" for="upload-file">
														<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
														<v-layout wrap>
															<v-flex xs10>
																<app-input-text
																	label="Seleccionar Imagen"
																	readonly
																	:text="imageModel.urlImage"
																/>
															</v-flex>
															<v-flex xs2 mt-4 text-xs-left>
																<v-btn @click="showDialog"
																	class="ma-0 pl-0 btn-auto btn-upload-image"
																	small
																	color="info">
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
												:columns="imagesColumns"
												:filter-columns="false"
												:input-search="false"
												:rows="rowsImages"
											>
												<template slot="rows" slot-scope="props">
													<td
														class="is-not-selectable"
														v-show="showRow(columns, 1)"
													>
														{{ props.row.order }}
													</td>
													<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
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
															:icon="props.row.flagPrincipal ? 'star' : 'star_border'"
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
																@change="changeActive(props.row.id, $event)"
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
															class="options-menu">
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
																		<v-icon color="success" :size="16">edit</v-icon>
																		<span class="menu-table-title">Editar</span>
																	</v-list-tile-title>
																</v-list-tile>
																<v-list-tile @click.stop="deleteRow(props.row)">
																	<v-list-tile-title>
																		<v-icon color="error" :size="16">delete</v-icon>
																		<span class="menu-table-title">Eliminar</span>
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
					</transition>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center align-center mb-5>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action mr-1"
					:disabled="isLoading"
					@click="cancel">
					Cancelar
					<v-icon
						color="white"
						size="16">
						highlight_off
					</v-icon>
				</v-btn>
				<v-btn
					type="button"
					color="success"
					class="btn-action ml-1"
					:disabled="disabledNewProduct || checkBlankCode(newProduct.product.code)"
					@click="createNewProduct">
					Aceptar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
	<action-sidebar
		:active="action.active"
		:code-action="action.code"
		:header-color="action.color"
		:title="action.title"
		:width="action.width"
		v-model="action.open"
		@close-modal="close"
	>
		<new-category
			v-if="action.code === 'NC'"
			@update-category="loadData"
			@cancel-modal="close"
		/>
		<new-brand
			v-if="action.code === 'NB'"
			@update-brand="loadData"
			@cancel-modal="close"
		/>
		<units-form
			v-if="action.code === 'UND'"
			:code="newUnit.code"
			:color="newUnit.color"
			:name="newUnit.name"
			@close-modal="close"
			@save="updateUnity"
			@set-data="getData"
		/>
		<select-warehouse
			v-if="action.code === 'WS'"
			@warehouse-selected="warehouseSelected($event, key)"
			@cancel-modal="close"
		/>
		<help-component
			v-if="action.code === 'H'"
			:helps="helps"
			@cancel-modal="close"
		/>
		<image-component
			v-if="action.code === 'VI'"
			:url="newProduct.product.image"
		/>
		<product-taxes-config
			v-if="isTaxesConfig"
			@close-modal="close"
			@send-data="getTaxes"
			:product-id="id"
			:code-retention="newProduct.product.codeRetention"
			:taxes="newProduct.product.taxes"
		/>
		<features-config
			v-if="action.code === 'CF'"
			:categories="categories"
			:loading="loading"
			:product="newProduct.product"
			@cancel-modal="close"
			@config-features="addFeatures"
		/>
		<related-products
			v-if="action.code === 'PS'"
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
import { minLength, required, requiredIf } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import assignCategories from '@/components/ecommerce/assign-categories';
import assignSections from '@/components/ecommerce/assign-sections';
import featuresConfig from '@/components/shared/product/features-config';
import headerPage from '@/components/shared/header-page';
import helpAction from '@/components/shared/help-action';
import helpComponent from '@/components/accounting/utils/help-component';
import imageComponent from '@/components/accounting/utils/image-component';
import Modules from '@/shared/modules';
import newBrand from '@/components/products/utils/new-brand';
import newCategory from '@/components/products/utils/new-category';
import productTaxesConfig from '@/components/products/product-taxes-config';
import relatedProducts from '@/components/ecommerce/related-products';
import selectWarehouse from '@/components/accounting/utils/selecting-warehouse';
import slugInput from '@/components/ecommerce/slug-input';
import upLoadImageMixin from '@/mixins/upLoadImage';
import unitsForm from '@/components/units/units-form';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import typeEntityEcommerce from '@/shared/type-entity-ecommerce';

const { debounce } = helper;
const { compose, setNewProperty } = lib;
function created() {
	this.flagTypePrice = this.$userInfo.company.flagIgv;
	if (this.flagTypePrice === 0) {
		this.typePriceSelected = 0;
	} else {
		this.typePriceSelected = 1;
	}
	this.loadSections();
	this.loadCommerce();
}

function setDataCommerce(value) {
	if (value) {
		this.newProduct.product.commerce = value.map(p => ({ code: p.code, commerceId: p.id }));
	}
}

function active(value) {
	this.rowsImages = !Number(value) ? [...this.appImages] : [...this.webImages];
}

function addConversion() {
	this.conversions.push(
		{ id: null, quantity: null, quantityTo: 1, unitFrom: null, code: null, name: null });
	const numberLastConversion = this.conversions.length - 2;
	if (!this.unitsFiltered[this.unitsFiltered.length - 1]) {
		this.unitsFiltered.pop();
	}
	this.unitsFiltered.push(this.units.find(u => u.id === this.conversions[numberLastConversion].id));
	this.addPriceByUnits(this.unitFilteredId);
}

function addFeatures(features) {
	this.loading = true;
	this.newProduct.product.features = features;
	this.newProduct.product.code = features.map(i => i.code.substr(0, 3)).join('');
	this.action.active = false;
	this.action.code = '';
	this.action.open = false;
	this.loading = false;
}

function addImage() {
	if (!this.unitsFiltered[this.unitsFiltered.length - 1]) {
		this.unitsFiltered.pop();
	}
	const newImageModel = { ...this.imageModel };
	newImageModel.fromApp = !Number(this.active);
	const propName = newImageModel.fromApp ? 'appImages' : 'webImages';
	if (!this.id) {
		newImageModel.unitId = this.newProduct.unitId || this.newProduct.product.unitId;
	}
	if (this[propName].length > 0) {
		const index = this[propName].findIndex(image => image.id === newImageModel.id);
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
		fromApp: true,
		name: '',
		order: null,
		urlImage: '',
	};
}

function addPriceByUnits(id) {
	this.priceList = this.priceList.map((pl) => {
		const newList = { ...pl };
		newList.units.push({
			id,
			flagTypePrice: null,
			taxes: pl.taxes,
			unitPrice: pl.unitPrice,
			name: this.filteredUnits.find(fu => fu.id === id).name,
			price: 0,
			ranges: [{ price: 0, from: 0, to: 0 }],
			showRanges: false,
		});
		return newList;
	});
	this.disabledConver = true;
}

function addRange(indexList, indexUnit) {
	const newRange = { price: 0, from: 0, to: 0 };
	if (indexUnit >= 0) {
		this.priceList[indexList].units[indexUnit].ranges.push(newRange);
	} else {
		this.priceList[indexList].ranges.push(newRange);
	}
}

function biggerHeight() {
	const minHeight = 48 * this.listRanges;
	return this.moorePriceList ? `height: ${135 + minHeight}px` : 'height: 380px; overflow: auto';
}

function getSectionName(subSections) {
	const itemWithName = subSections.find(s => (s.sectionName || s.name));
	return itemWithName.sectionName || itemWithName.name;
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

function buildBody(id, product) {
	let newObject = {};
	const images = this.appImages.concat(this.webImages);
	const sections = this.setSections(product.product.sections);
	if (id) {
		newObject = {
			priceList: this.buildPriceList(),
			product: {
				alternateCode: product.product.alternateCode,
				categoryId: product.product.categoryId,
				commerce: product.product.commerce.map((l) => {
					const newCommerce = {
						code: l.code,
						commerceId: l.id,
					};
					return newCommerce;
				}),
				code: product.product.code,
				conversions: this.formattingConversions(this.conversions),
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
				urlImage: product.product.image,
				weigth: product.product.weigth ? Number(product.product.weigth) : null,
			},
		};
	} else {
		newObject = {
			brandId: product.brandId,
			priceList: this.buildPriceList(),
			product: {
				alternateCode: product.product.alternateCode,
				categoryId: product.product.categoryId,
				code: product.product.code,
				commerce: product.product.commerce,
				conversions: this.formattingConversions(this.conversions),
				description: product.product.description,
				eCategories: product.product.eCategories,
				features: product.product.features,
				flagEcommerce: true,
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
				urlImage: product.product.image,
				type: product.product.type,
				weigth: product.product.weigth ? Number(product.product.weigth) : null,
			},
			warehouseId: product.warehouseId || [],
		};
	}
	return newObject;
}

function buildPriceList() {
	return this.priceList.reduce((acum, pl) => {
		const newPl = { ...acum };
		newPl[pl.id] = {};
		newPl[pl.id].flagTypePrice = pl.flagTypePrice;
		newPl[pl.id].taxes = pl.taxes;
		newPl[pl.id].unitPrice = pl.unitPrice;
		newPl[pl.id].price = pl.price;
		newPl[pl.id].ranges = pl.ranges ? [...pl.ranges] : [];
		newPl[pl.id].units = pl.units ? this.buildUnits(pl.units) : {};
		return newPl;
	}, {});
}

function buildUnits(units) {
	let reduceUnits = {};
	if (units[0] && units[0].id) {
		reduceUnits = units.reduce((uAcum, unit) => {
			const newAcum = { ...uAcum };
			newAcum[unit.id] = {
				price: unit.price ? unit.price : 0,
				ranges: unit.ranges ? [...unit.ranges] : [],
			};
			return newAcum;
		}, {});
	}
	const newUnits = units[0] && units[0].id ? { ...reduceUnits } : { ...units } || {};
	return newUnits;
}

function cancel() {
	this.goTo('products-ecommerce');
}

function captureError(value, flag) {
	this.errors[flag] = value;
	const keys = Object.keys(this.errors);
	const el = keys.find(e => this.errors[e]);
	this.disabledByError = !!el;
}

function captureLocation(value) {
	const imgVal = value.split('/');
	this.imageModel.urlImage = value;
	this.imageModel.name = imgVal.pop();
}

function changeActive() {}

function close() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.newUnit = {
		code: '',
		color: '#000000',
		flagActive: true,
		name: '',
	};
}

function closePageProduct() {
	this.goTo('products-ecommerce');
}

async function createNewProduct() {
	const url = this.getUrl();
	const body = this.buildBody(this.id, this.newProduct);
	const methods = this.getMethod();
	const action = this.getAction();
	try {
		await this.$httpProducts[methods](url, body);
		this.showNotification(`Producto ${action} con éxito`);
		this.goTo('products-ecommerce');
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

function deleteRow({ id }) {
	if (Number(this.active)) {
		const index = this.webImages.findIndex(i => i.id === id);
		if (index > -1) {
			this.webImages.splice(index, 1);
		}
	} else {
		const index = this.appImages.findIndex(i => i.id === id);
		if (index > -1) {
			this.appImages.splice(index, 1);
		}
	}
}

function disabledAddImage() {
	return !this.imageModel.order || !this.imageModel.name || !this.imageModel.urlImage;
}

function disabledByConver(converData) {
	this.disabledConver = this.newProduct.product.unitId === converData.id || !converData.quantity;
}

function disabledNewProduct() {
	const invalid = this.$v.$invalid;
	const isLoadingImage = this.isLoadingImage;
	const priceList = this.disabledByPriceList;
	return invalid || isLoadingImage || priceList || this.invalidSections ||
		(this.newProduct.product.slug && !this.slugValidated);
}

function edit(row) {
	this.imageModel = { ...row };
}

function editingProduct(product) {
	return {
		alternateCode: product.product.alternateCode,
		brandId: product.brandId,
		categoryId: product.product.categoryId,
		code: product.product.code,
		commerce: product.product.commerce,
		description: product.product.description,
		image: product.image,
		model: product.product.model,
		name: product.product.name,
		type: product.product.type,
		unitId: product.product.unitId,
		warehouseId: product.warehouseId,
	};
}

function editListFormatted(keys) {
	return this.priceList.map((price) => {
		const newPrice = { ...price };
		const key = keys.find(k => Number(k) === price.id);
		if (key) {
			newPrice.flagTypePrice = this.newProduct.priceList[key].flagTypePrice;
			newPrice.taxes = this.newProduct.priceList[key].taxes;
			newPrice.unitPrice = this.newProduct.priceList[key].unitPrice;
			newPrice.price = this.newProduct.priceList[key].price;
			newPrice.ranges = this.newProduct.priceList[key].ranges ?
				[...this.newProduct.priceList[key].ranges] : [{ from: 0, price: 0, to: 0 }];
			newPrice.units = this.newProduct.priceList[key].units ?
				this.unitsFormatted(this.newProduct.priceList[key].units) :
				this.unitsFormattedByConversions(this.newProduct.product.conversions);
			newPrice.showRanges = this.newProduct.priceList[key].ranges.some(r =>
				r.price && r.from && r.to);
		} else {
			newPrice.price = 0;
			newPrice.flagTypePrice = null;
			newPrice.taxes = null;
			newPrice.unitPrice = null;
			newPrice.ranges = [{ from: 0, price: 0, to: 0 }];
			newPrice.showRanges = false;
			newPrice.units = [];
		}
		return newPrice;
	});
}

function filteredUnits() {
	return this.units.length > 0 ? this.units.filter(u => u.id !== this.newProduct.product.unitId)
		: [];
}

function formattingConversions(collection) {
	const newObj = {};
	collection.forEach((p) => {
		if (p.id && p.quantity) {
			newObj[p.id] = {
				quantity: p.quantity,
				quantityTo: 1,
				code: p.code,
				name: p.name,
			};
		}
	});
	return newObj;
}

function formattingData() {
	const productConversions = Object.keys(this.newProduct.product.conversions);
	if (productConversions && productConversions.length > 0) {
		this.setConversions(productConversions);
	} else if (this.newProduct.unitId || this.newProduct.product.unitId) {
		this.newProduct.product.conversions[this.newProduct.product.unitId] = {};
		this.newProduct.product.conversions[this.newProduct.product.unitId].quantity = 0;
		this.newProduct.product.conversions[this.newProduct.product.unitId].quantityTo = 1;
		this.newProduct.product.conversions[this.newProduct.product.unitId].code = null;
		this.newProduct.product.conversions[this.newProduct.product.unitId].name = null;
		const keyConversion = Object.keys(this.newProduct.product.conversions);
		this.setConversions(keyConversion);
	} else {
		const listKeys = this.newProduct.priceList ? Object.keys(this.newProduct.priceList) :
			{};
		this.priceList = this.newProduct.id ? this.priceListFormatted(listKeys) :
			this.priceListFormatted();
		this.listRanges = (this.priceList[0].ranges.length - 1);
	}
}

function getAction() {
	let action = 'creado';
	if (this.id) {
		action = 'actualizado';
	}
	return action;
}

function getData({ model, value }) {
	this.newUnit[model] = value;
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
	this.showNotification('La configuración ha sido guardada correctamente para el producto a crear');
	this.cancelModal();
}

function getUrl() {
	let url = 'products';
	if (this.id) {
		url = `products/${this.id}`;
	}
	return url;
}

function isNotServices() {
	return this.newProduct.product.type !== 2;
}

function isTaxesConfig() {
	return this.action.code === 'product-taxes';
}

function jsonPriceList(priceListCollection) {
	const priceList = {};
	priceListCollection.forEach((list) => {
		const newList = Object.assign({}, list);
		newList[list.id].price = list[list.id].price || 0;
		newList[list.id].ranges = list[list.id].ranges.map((r) => {
			const newR = Object.assign({}, r);
			newR.to = r.to || 0;
			newR.price = r.price || 0;
			newR.from = r.from || 0;
			return newR;
		});
		priceList[list.id] = newList[list.id];
	});
	return priceList;
}

async function loadCommerce() {
	({ data: this.commerceList } = await this.$httpSales.get('com-ecommerce-companies'));
}

async function loadData() {
	this.isLoading = true;
	const requests = [
		this.categoriesList(),
		this.$httpProducts.get('brands'),
		this.$httpProducts.get('warehouses'),
		this.listPricingPromise(),
		this.$httpProducts.get('products-types'),
	];
	if (this.id) {
		requests.push(this.$httpProducts.get(`e-products/${this.id}`));
	}
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.categories },
			{ data: this.brands },
			{ data: this.warehouses },
			{ data: this.priceList },
			{ data: this.types },
		] = responses;
		if (this.id) {
			[,,,,, { data: this.newProduct }] = responses;
		}
		this.newProduct.brandId = this.newProduct.brandId || null;
		this.newProduct.priceList = null;
		this.newProduct.warehouseId = this.newProduct.warehouseId || null;
		if (this.id) {
			const array = Object.keys(this.newProduct.warehouseProduct.priceList);
			array.forEach((element) => {
				const id = this.newProduct.warehouseProduct.priceList[element].id;
				const index = this.priceList.findIndex(r => r.id === id);
				if (index > -1) {
					this.newProduct.warehouseProduct.priceList[element].name = this.priceList[index].name;
				}
			});
		}
		this.newProduct.brandId = this.newProduct.brandId || null;
		this.newProduct.priceList = null;
		this.newProduct.warehouseId = this.newProduct.warehouseId || null;
		this.setNewProduct();
	} catch (err) {
		this.showGenericError();
	}
	this.addingAllWarehousesInWarehouses();
	this.isLoading = false;
}

function addingAllWarehousesInWarehouses() {
	this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
}

async function loadRelatedProducs(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.dismiss = this.id || null;
	try {
		const { data: rows, headers } = await this.$httpProducts.get('e-products',
			{ params: this.params });
		this.relatedRows = rows.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = false;
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.loadUnits();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadSections() {
	({ data: this.sections } = await this.$httpProducts.get('sections'));
	this.loadRelatedProducs();
}

async function loadUnits() {
	({ data: this.units } = await this.listOfUnits());
	this.loadData();
}

function onAddSection(section) {
	const subSections = { ...section };
	const index = this.newProduct.product.sections.findIndex(s => s.id === section.sectionId);
	if (index > -1) {
		this.updateSections(subSections, index);
	} else {
		subSections.id = 1;
		this.addSections(subSections);
	}
}

function addSections(subSections) {
	this.newProduct.product.sections.push({
		id: subSections.sectionId,
		name: subSections.sectionName,
		subSections: [subSections],
	});
	this.sectionsRows.push(subSections);
	this.sectionsRowsComplete.push(subSections);
}

function updateSections(subSections, index) {
	const subSectionsSelected = this.newProduct.product.sections[index].subSections;
	const existIndex = subSectionsSelected.findIndex(s => s.id === subSections.id);
	if (existIndex > -1) {
		this.newProduct.product.sections[index].subSections[existIndex] = { ...subSections };
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
	const index = this.sectionsRows.findIndex(sr => sr.id === id);
	if (index > -1) {
		this.sectionsRows.splice(index, 1);
		this.sectionsRowsComplete.splice(index, 1);
	}
	const sectionIndex = this.newProduct.product.sections.findIndex(s => s.id === sectionId);
	const subSectionIndex
		= this.newProduct.product.sections[sectionIndex].subSections.findIndex(su => su.id === id);
	this.newProduct.product.sections[sectionIndex].subSections.splice(subSectionIndex, 1);
}

function onPage(page) {
	this.loadRelatedProducs(page);
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadRelatedProducs();
}

function onSearchSections(search) {
	if (search && search.trim()) {
		this.sectionsRows = this.sectionsRowsComplete.reduce((acum, src) => {
			const newTitle = src.title.toLowerCase();
			const newName = src.name.toLowerCase();
			if (newTitle.indexOf(search.trim()) > -1 || newName.indexOf(search.trim()) > -1) {
				acum.push({ ...src });
			}
			return acum;
		}, []);
	} else {
		this.sectionsRows = [...this.sectionsRowsComplete];
	}
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.relatedRows = this.relatedRows.map((relRow) => {
		const newRelRow = { ...relRow };
		newRelRow.isSelected = checked;
		return newRelRow;
	});
	this.dataSelected = this.relatedRows.filter(relRow => relRow.isSelected);
}

function onRowSelected() {
	this.dataSelected = this.relatedRows.filter(relRow => relRow.isSelected);
	this.checkAll = this.relatedRows.every(relRow => relRow.isSelected);
}

function openSlideModal(code, title, width = 400) {
	this.action = {
		active: true,
		open: true,
		code,
		title,
		width,
	};
}

function priceListFormatted(keys) {
	if (keys && keys.length > 0) {
		return this.editListFormatted(keys);
	}
	return this.priceList.map((price) => {
		const newPrice = { ...price };
		newPrice.price = 0;
		newPrice.taxes = null;
		newPrice.unitPrice = null;
		newPrice.flagTypePrice = null;
		newPrice.ranges = [{ from: 0, price: 0, to: 0 }];
		newPrice.showRanges = false;
		newPrice.units = [];
		return newPrice;
	});
}

function priceListValues(values) {
	const invalid = values.reduce((acum, list) => {
		if (list.price !== '' && list.price >= 0) {
			const rangesInvalid = list.ranges.find(r => (r.price !== 0 && !r.price) ||
				(r.from !== 0 && !r.from) || (r.to !== 0 && !r.to));
			if (!rangesInvalid) {
				if (list.units.length > 0) {
					list.units.forEach((lu) => {
						if (lu.price >= 0) {
							const rangesUnistInvalid = lu.ranges.find(r =>
								(r.price !== 0 && !r.price) || (r.from !== 0 && !r.from) ||
								(r.to !== 0 && !r.to));
							acum.push(!!rangesUnistInvalid);
						} else {
							acum.push(false);
						}
					});
				} else {
					acum.push(rangesInvalid);
				}
			} else {
				acum.push(rangesInvalid);
			}
		} else {
			acum.push(true);
		}
		return acum;
	}, []);
	this.disabledByPriceList = invalid.some(i => i);
}

function removeAlternateCode(item) {
	const index = this.newProduct.product.alternateCode.indexOf(item);
	if (index > -1) {
		this.newProduct.product.alternateCode.splice(index, 1);
	}
}

function removeConversion(index) {
	this.conversions.splice(index, 1);
}

function removeRange(indexList, indexRange, indexUnit) {
	if (indexUnit >= 0) {
		this.priceList[indexList].units[indexUnit].ranges.splice(indexRange, 1);
	} else {
		this.priceList[indexList].ranges.splice(indexRange, 1);
	}
}

function runAction({ code, name, codeWeb }) {
	if (code === 'PS' || code === 'AS' || code === 'assign-categories') {
		this.action.code = code;
		this.action.title = name;
		this.action.width = code === 'PS' ? 600 : 500;
		this.action.open = true;
	} else if (code === 'product-taxes') {
		this.openSlideModal(code, 'Impuestos', 600);
	} else {
		this.goTo(codeWeb);
	}
}

function saveCategories(body) {
	this.newProduct.product.eCategories = [...body];
	this.invalidCategories = this.newProduct.product.eCategories.length === 0;
	this.showNotification('Las categorías de ecommerce han sido asignadas correctamente.');
	this.close();
}

function saveRelatedProducts() {
	this.newProduct.product.productsRelated = this.dataSelected.map(ds => ds.id);
	this.showNotification('Los productos han sido relacionados correctamente.');
	this.close();
}

function saveSectionsProducts() {
	this.invalidSections = this.newProduct.product.sections.length === 0;
	this.showNotification('Los secciones han sido asignadas correctamente.');
	this.close();
}

function stateName({ flagActive }) {
	return flagActive ? 'Activa' : 'Inactiva';
}

function setConversions(converKeys) {
	const indexLastUnitFiltered = this.unitsFiltered.length - 1;
	if (!this.unitsFiltered[indexLastUnitFiltered]) {
		this.unitsFiltered.pop();
	}
	converKeys.forEach((key, index) => {
		this.conversions[index] = {};
		this.conversions[index].id = Number(key);
		this.conversions[index].quantity = this.newProduct.product.conversions[key].quantity;
		this.conversions[index].quantityTo = 1;
		this.conversions[index].code = this.newProduct.product.conversions[key].code || null;
		this.conversions[index].name = this.newProduct.product.conversions[key].name || null;
		this.unitsFiltered.push(this.units.find(u => u.id === Number(key)));
	});
	this.unitsFiltered.push(this.newProduct.unit);
	this.unityCode = this.newProduct.unit ? this.newProduct.unit.code || this.newProduct.unit.name
		: this.units.find(u => u.id === this.newProduct.product.unitId).code;
	const imagesMap = this.newProduct.images || this.newProduct.product.images;
	this.newProduct.images = imagesMap.map((i) => {
		const newImg = { ...i };
		newImg.unitId = i.unitId || this.newProduct.unit.id;
		return newImg;
	});
	this.newProduct.product.images = imagesMap.map((i) => {
		const newImg = { ...i };
		newImg.unitId = i.unitId || this.newProduct.unit.id;
		return newImg;
	});
	this.appImages = this.appImages.map((i) => {
		const newAppImg = { ...i };
		newAppImg.unitId = i.unitId || this.newProduct.unit.id;
		return newAppImg;
	});
	this.webImages = this.webImages.map((i) => {
		const newWebImg = { ...i };
		newWebImg.unitId = i.unitId || this.newProduct.unit.id;
		return newWebImg;
	});
	if (this.id) {
		const lastIndex = this.conversions.length;
		this.conversions[lastIndex] = {};
		this.conversions[lastIndex].id = null;
		this.conversions[lastIndex].quantity = null;
		this.conversions[lastIndex].quantityTo = 1;
	}
	const listKeys = this.newProduct.priceList ? Object.keys(this.newProduct.priceList) : [];
	this.priceList = this.priceListFormatted(listKeys);
	this.listRanges = (this.priceList[0].ranges.length - 1);
}

function setData({ model, value }, index, label) {
	const newValue = model === 'id' ? value.id : Number(value);
	this.$set(this.conversions[index], model, newValue);
	if (model === 'id') {
		this.unitFilteredId = newValue;
	}
	if (label) {
		this.$set(this.conversions[index], 'code', value.code);
		this.$set(this.conversions[index], 'name', value.name);
	}
	this.disabledByConver(this.conversions[index]);
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

function setImageModel({ model, value }) {
	this.imageModel[model] = model === 'order' ? Number(value) : value;
}

function setNewProduct() {
	this.newProduct.product = {
		alternateCode: this.newProduct.alternateCode || [],
		categoryId: this.newProduct.categoryId,
		code: this.newProduct.code,
		conversions: this.newProduct.conversions || {},
		description: this.newProduct.description,
		commerce: (this.newProduct.commerce || []).map(c => ({ code: c.code, commerceId: c.id })),
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
	this.invalidSections = this.newProduct.product.sections.length === 0;
	this.invalidCategories = this.newProduct.product.eCategories.length === 0;
	if (this.newProduct.product.images.length > 0) {
		this.appImages = this.newProduct.product.images.filter(i => i.fromApp);
		this.webImages = this.newProduct.product.images.filter(i => !i.fromApp);
		this.rowsImages = !Number(this.active) ? [...this.appImages] : [...this.webImages];
	}
	if (this.newProduct.product.productsRelated.length > 0) {
		this.setRelatedProductsSelected();
	}
	this.formattingData();
}

function setSectionsRows(sections = []) {
	let subSectionsArr = [];
	sections.forEach((s) => {
		const { subSections, id, name } = s;
		subSectionsArr = subSectionsArr.concat(
			subSections.map(
				compose(
					setNewProperty('sectionId', id),
					setNewProperty('sectionName', name || ''),
				),
			),
		);
	});
	return subSectionsArr;
}

function setRelatedProductsSelected() {
	this.relatedRows = this.relatedRows.map((relRow) => {
		const newRelRow = { ...relRow };
		const index = this.newProduct.product.productsRelated.findIndex(relP =>
			relP === relRow.id);
		newRelRow.isSelected = index > -1;
		return newRelRow;
	});
}

function setShowConversions() {
	this.showConversions = !this.showConversions;
}

function setShowImages() {
	this.showImages = !this.showImages;
}

function setShowPriceList() {
	this.showPriceList = !this.showPriceList;
}

function setValue({ model, value }) {
	this.newProduct.product[model] = value;
}

function setWarehouseId({ value }) {
	if (value.some(id => id === 0)) {
		this.newProduct.warehouseId = this.warehouses.reduce((list, w) => {
			if (w.id) {
				return list.concat(w.id);
			}
			return list;
		}, []);
	} else {
		this.newProduct.warehouseId = value;
	}
}

function showAllPriceList() {
	this.moorePriceList = !this.moorePriceList;
}

function showDialog() {
	this.$refs.labelEcommerceProduct.click();
}

function showWarehouses() {
	return this.isNotServices && !this.id;
}

function unityName() {
	const unitId = this.newProduct.product.unitId;
	const unit = this.units.find(u => u.id === unitId) || {};
	const name = unit ? unit.name : 'Unit.';
	return name;
}

function unitsFormatted(units) {
	const newUnits = [];
	const unitsKeys = Object.keys(units);
	unitsKeys.forEach((key) => {
		const unitFiltered = this.units.find(fu => fu.id === Number(key)) || {};
		newUnits.push({
			id: Number(key),
			name: unitFiltered.name || '',
			price: units[key].price,
			ranges: [...units[key].ranges],
			showRanges: units[key].ranges.some(ur => ur.from && ur.price && ur.to),
		});
	});
	return newUnits;
}

function unitsFormattedByConversions(conversions) {
	const newUnits = [];
	if (conversions) {
		const conversionsKeys = Object.keys(conversions);
		conversionsKeys.forEach((converK) => {
			if (conversions[converK] && (conversions[converK].quantity > 0)) {
				const unitFilterByConverK = this.units.find(u => u.id === Number(converK)) || {};
				newUnits.push({ ...unitFilterByConverK });
			}
		});
	}
	return newUnits;
}

async function updateUnity() {
	try {
		await this.$httpProducts.post('units', this.newUnit);
		this.showNotification('La unidad ha sido creada correctamente.');
		this.loadUnits();
		this.cancelModal();
		this.jailai.unit += 1;
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		newProduct: {
			brandId: {
				required: requiredIf(() => this.showWarehouses),
			},
			product: {
				categoryId: { required },
				code: { required },
				name: { required },
				type: { required },
				unitId: { required },
			},
			warehouseId: {
				required: requiredIf(() => this.showWarehouses),
			},
		},
		appImages: {
			minLength: minLength(1),
			required,
		},
		webImages: {
			minLength: minLength(1),
			required,
		},
	};
}

function validUnit() {
	this.unityCode = this.units.find(u => u.id === this.newProduct.product.unitId).code ||
		this.units.find(u => u.id === this.newProduct.product.unitId).name;
	if (this.conversions.length === 1) {
		this.unitsFiltered = [{ ...this.units.find(u => u.id === this.newProduct.product.unitId) }];
	} else {
		this.unitsFiltered = this.conversions.reduce((acum, conver) => {
			const unitFound = this.units.find(u => u.id === conver.id);
			if (unitFound) {
				acum.push(unitFound);
			} else {
				acum.push({ ...this.units.find(u => u.id === this.newProduct.product.unitId) });
			}
			return acum;
		}, []);
	}
	if (this.unitsFiltered.length === 1) {
		if (this.appImages.length > 0) {
			this.appImages = this.appImages.map((ai) => {
				const newAi = { ...ai };
				newAi.unitId = this.unitsFiltered[0].id;
				return newAi;
			});
		}
		if (this.webImages.length > 0) {
			this.webImages = this.webImages.map((wi) => {
				const newWi = { ...wi };
				newWi.unitId = this.unitsFiltered[0].id;
				return newWi;
			});
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

function isEcommerce() {
	return this.$route.path.includes('ecommerce');
}

function dirtyFunction() {
	this.formDirty = true;
}

/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
function setSlug(value) {
	const valueNormalize = value.normalize('NFD')
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

function setUnitId(image, { model, value }) {
	this.$set(image, model, value.id);
}

function setPrice(value, { id }) {
	if (id === this.$userInfo.salPriceList.id) {
		this.newProduct.product.price = Number(value);
	}
}

function data() {
	return {
		newObjectPrice: {
			unitSales: 0,
		},
		flagTypePrice: null,
		commerce: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		actions: [],
		active: 0,
		appImages: [],
		brands: [],
		categories: [],
		checkAll: false,
		columns: [
			{ id: 1, name: 'Orden', value: 'order', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Imagen', value: 'image', visible: true, checked: true },
			{ id: 4, name: 'Conversión', value: 'unitId', visible: true, checked: true },
			{ id: 5, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
		commerceList: [],
		conversions: [
			{
				id: null,
				quantity: null,
				quantityTo: 1,
				unitFrom: null,
			},
		],
		currentPage: 1,
		dataSelected: [],
		disabledByError: false,
		disabledByPriceList: false,
		disabledConver: true,
		errors: {
			price: false,
			rangePrice: false,
			to: false,
			from: false,
		},
		errorMessage: 'máximo 8 dígitos',
		formDirty: true,
		helpButton: { title: '¿ NECESITAS AYUDA?', img: '/static/img/help.svg', width: 30 },
		helps: [
			{
				title: 'CATEGORÍA',
				description: 'Descripción de lo que es categoría para un producto',
				href: '',
			},
			{
				title: 'UNIDADES',
				description: 'Descripción de lo que es unidad para un producto',
				href: '',
			},
			{
				title: 'MARCA',
				description: 'Descripción de lo que es marca para un producto',
				href: '',
			},
		],
		imageModel: {
			flagActive: true,
			flagPrincipal: false,
			fromApp: true,
			name: '',
			order: null,
			urlImage: '',
		},
		imagesColumns: [
			{ id: 1, name: 'Orden', visible: true },
			{ id: 2, name: 'Nombre', visible: true },
			{ id: 3, name: 'Imagen', visible: true },
			{ id: 4, name: 'Conversión', visible: true },
			{ id: 5, name: 'Acciones', visible: true, flagVisible: true },
		],
		invalidCategories: true,
		invalidSections: true,
		isLoading: false,
		jailai: {
			brand: 0,
			category: 0,
			unit: 0,
		},
		key: 'newProduct',
		lastPage: 0,
		loading: false,
		maxNumber: 99999999,
		filtersItem: [],
		moorePriceList: true,
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
		newUnit: {
			code: '',
			color: '#000000',
			flagActive: true,
			name: '',
		},
		params: {
			dismiss: null,
			limit: 20,
			page: 1,
		},
		priceList: [{ units: {} }],
		relatedRows: [],
		rows: [],
		rowsImages: [],
		sections: [],
		sectionsRows: [],
		sectionsRowsComplete: [],
		sectionSelected: {},
		showConversions: false,
		showImages: true,
		showPriceList: false,
		slugLoading: false,
		slugValidated: true,
		tabs: [
			{ id: 1, name: 'APP' },
			{ id: 2, name: 'WEB' },
		],
		taxes: [],
		typePrices: [
			{
				id: 0,
				name: 'Precio Unitario',
				code: 'PU',
			},
			{
				id: 1,
				name: 'Precio de Venta',
				code: 'PV',
			},
		],
		typePriceSelected: 1,
		types: [],
		unitFilteredId: 0,
		units: [],
		unitsFiltered: [],
		unityCode: '',
		warehouses: [],
		webImages: [],
	};
}

export default {
	name: 'page-create-product',
	components: {
		actionSidebar,
		appActions,
		appTable,
		assignCategories,
		assignSections,
		featuresConfig,
		headerPage,
		helpAction,
		helpComponent,
		imageComponent,
		newBrand,
		newCategory,
		productTaxesConfig,
		relatedProducts,
		selectWarehouse,
		slugInput,
		unitsForm,
		VueSixFour,
	},
	computed: {
		biggerHeight,
		disabledAddImage,
		disabledNewProduct,
		filteredUnits,
		isEcommerce,
		isNotServices,
		isTaxesConfig,
		showWarehouses,
		unityName,
	},
	created,
	data,
	methods: {
		addConversion,
		addFeatures,
		addImage,
		addingAllWarehousesInWarehouses,
		addPriceByUnits,
		addRange,
		addSections,
		buildBody,
		buildPriceList,
		buildUnits,
		cancel,
		captureError,
		changeActive,
		close,
		closePageProduct,
		createNewProduct,
		deleteRow,
		dirtyFunction,
		disabledByConver,
		edit,
		editListFormatted,
		editingProduct,
		formattingConversions,
		formattingData,
		getAction,
		getData,
		getMethod,
		getSectionName,
		getTaxes,
		getUrl,
		jsonPriceList,
		loadCommerce,
		loadData,
		loadRelatedProducs,
		loadSections,
		loadUnits,
		onAddSection,
		onClickIcon,
		onDeleteSection,
		onPage,
		onSearch,
		onSearchSections,
		onSelectedAll,
		onRowSelected,
		openSlideModal,
		priceListFormatted,
		removeAlternateCode,
		removeConversion,
		removeRange,
		runAction,
		saveCategories,
		saveRelatedProducts,
		saveSectionsProducts,
		stateName,
		setConversions,
		setData,
		setDataCommerce,
		setFlagPrincipal,
		setImageModel,
		setNewProduct,
		setRelatedProductsSelected,
		setSections,
		setSectionsRows,
		setShowConversions,
		setShowImages,
		setShowPriceList,
		setSlug,
		setValue,
		setWarehouseId,
		showAllPriceList,
		showDialog,
		unitsFormatted,
		unitsFormattedByConversions,
		updateSections,
		updateUnity,
		validateSlug: debounce(validateSlug),
		validUnit,
		setUnitId,
		setPrice,
	},
	mixins: [upLoadImageMixin],
	props: {
		id: [Number, String],
	},
	validations,
	watch: {
		active,
		appImages: {
			deep: true,
			handler: watchAppImages,
		},
		captureLocation,
		priceList: {
			deep: true,
			handler: priceListValues,
		},
		webImages: {
			deep: true,
			handler: watchWebImages,
		},
	},
};
</script>
<style lang="scss" scoped>
.background-white {
	height: 200px;
	padding-top: 15px;
	background-color: #ffffff;
}

.container-web {
	border: 1px solid #f6f6f6;
}

.wrapper-buttons {
	align-items: center;
	display: flex;
	justify-content: center;
	margin-top: 150px;
	width: 100%;

	.btn-action {
		&:nth-child(1) {
			margin-right: 9px;
		}
	}
}

.price-list-name {
	border-bottom: 1px solid color(blue-grey);
	color: map-get($colors, paginationText);
	font-family: font(open-bold);
	font-size: size(medium);
	text-transform: uppercase;
}

.new-product-main-container {
	@include vertical-displacement;
	max-height: 330px;
	overflow: hidden;
}

.price-list-see-all {
	color: map-get($colors, blue-price);
	cursor: pointer;
	text-align: right;
}

.size-adjust {
	flex: none !important;
	margin-top: 18px;
}

.title-section {
	width: 100%;
}

.vertical-center {
	vertical-align: middle;
}

.btn-width {
	max-width: 30px;
}

.block-title {
	color: map-get($colors, paginationText) !important;
	font-family: map-get($fonts, open-semibold) !important;
	font-size: 13px !important;
	height: auto !important;
	text-transform: uppercase;
}

.table-image {
	max-width: 50px;
}

.btn-product {
	min-width: auto !important;
	width: 100% !important;
}

.btn-upload-image {
	padding-bottom: 6px;
	padding-top: 6px;
}

.td-action {
	width: 110px;

	.width-btn-table {
		width: 18px;
	}
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

.menu-table-title {
	color: color(inactive-text);
	font-family: font(open-regular);
	font-size: size(small11);
}

.btn-type-price {
	background-color: color(white);
	border-radius: 3px;
	color: color(opacity-list-price);
	font-family: font(open-bold);
	font-size: 16px;
	height: 31px;
	width: 31px;

	&.active {
		background-color: color(background-sidebar);
		color: color(white);
	}
}

.value-list-price {
	color: map-get($colors, color-input);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($fonts, small13);
}

.title-price-list {
	color: map-get($colors, paginationText);
	font-size: map-get($fonts, small11);
}
</style>