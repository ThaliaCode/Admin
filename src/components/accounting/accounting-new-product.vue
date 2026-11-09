<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<v-btn
				color="pink"
				class="mr-0"
				v-if="id"
				@click="openConfirmation"
			>
				Eliminar Producto
			</v-btn>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<div class="new-product_accounting pb-5">
			<v-layout wrap pt-4 px-5>
				<v-flex xs12>
					<v-alert type="error" :value="disabledByPriceList">
						Uno o más campos de la lista de precios se
						encuentra vacío o con valor menor a cero (0).
						Si no desea agregar un precio puede mantenerlo en cero (0).
					</v-alert>
				</v-flex>
			</v-layout>
			<v-layout wrap justify-space-around mb-5 pt-4>
				<v-flex xs5>
					<v-layout wrap>
						<v-flex xs12 mb-3 class="title-section">
							<span>DATOS GENERALES</span>
						</v-flex>
						<v-flex xs12 mb-3 v-if="typeProducts.length > 1">
							<v-select
								required
								:disabled="!!id"
								class="filter-select mt-3"
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
								class="filter-select"
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
								class="filter-select"
								name="new-product-name"
								label="Nombre"
								v-model="newProduct.product.name"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newProduct.product.name.required">
								El nombre del producto es requerido
							</span>
						</v-flex>
						<v-flex xs12>
							<v-text-field
								no-resize
								multi-line
								class="textarea-content filter-select mt-3"
								name="new-product-description"
								label="Descripción"
								v-model="newProduct.product.description"
							></v-text-field>
						</v-flex>
						<v-flex xs12>
							<v-layout wrap mt-3>
								<v-flex xs6 pr-3>
									<v-text-field
										class="filter-select"
										name="new-product-model"
										label="Modelo"
										v-model="newProduct.product.model"
									></v-text-field>
								</v-flex>
								<v-flex xs6>
									<v-flex xs12 d-flex align-center>
										<v-select
											autocomplete
											single-line
											hide-details
											class="filter-select"
											content-class="filter-select-content"
											item-text="name"
											item-value="id"
											label="Categoría"
											v-model="newProduct.product.categoryId"
											:items="categories"
										></v-select>
										<button
											@click="openSlideModal('NC', 'Nueva Categoría', 500)"
											class="pl-add-container size mr-adjust">
												<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message" v-if="!$v.newProduct.product.categoryId.required">
										La categoría del producto es requerida.
									</span>
								</v-flex>
								<v-flex xs12 text-xs-right mt-2
									v-show="newProduct.product.categoryId">
									<label class="vertical-center body-1">Agregar Características</label>
									<button
										@click="openSlideModal('CF', 'Agregar Características', 500)"
										class="pl-add-container size mr-adjust vertical-center">
										<v-icon id="add-icon" color="white">add</v-icon>
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12>
							<v-layout mt-3>
								<v-flex xs6 mr-3>
									<v-flex xs12 d-flex align-center>
										<v-select
											v-model="newProduct.product.unitId"
											class="filter-select"
											item-text="name"
											item-value="id"
											:items="units"
											label="Unidad"
											@input="validUnit"
										></v-select>
										<button
											@click="openSlideModal('UND', 'Nueva Unidad')"
											class="pl-add-container size mr-adjust">
											<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message" v-if="!$v.newProduct.product.unitId.required">
										La unidad del producto es requerida.
									</span>
								</v-flex>
								<v-flex xs6 v-if="isNotServices && isFlagImport">
									<v-flex xs12 d-flex align-center>
										<v-select
											autocomplete
											single-line
											hide-details
											class="filter-select"
											content-class="filter-select-content"
											item-text="name"
											item-value="id"
											label="Marca"
											v-model="newProduct.brandId"
											:items="brands"
										></v-select>
										<button
											@click="openSlideModal('NB', 'Nueva Marca')"
											class="pl-add-container size mr-adjust">
											<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message" v-if="!$v.newProduct.brandId.required">
										La marca del producto es requerida.
									</span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12
							v-if="showWarehouses">
							<v-flex xs12 d-flex align-end>
								<app-select
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
								<button
									@click="openSlideModal('WS', `Selecciona ${labelWarehouse()}`)"
									class="pl-add-container size mr-adjust btn-width">
									<v-icon id="add-icon" color="white">search</v-icon>
								</button>
							</v-flex>
							<span class="form-group__message" v-if="!$v.newProduct.warehouseId.required">
								La {{labelWarehouse()}} del producto es requerida.
							</span>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-flex xs12 d-flex align-center>
								<v-text-field
									class="filter-select"
									name="new-product-model"
									label="Subir imagen"
									disabled
									readonly
									v-model="newProduct.product.urlImage"
								></v-text-field>
								<v-flex xs12 d-flex align-center ml-3>
									<label ref="up" for="upload-image">
										<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
										<v-btn
											type="button"
											@click="actionUploadImage"
											:disabled="isLoadingImage"
											class="btn-action pl-add-container">
											Adjuntar
										</v-btn>
									</label>
									<v-btn
										@click="openSlideModal('VI', 'Imagen', 300)"
										type="button"
										class="btn-action pl-add-container image-button text-xs-center mr-0">
										<img src="/static/img/view-image.svg" alt="" class="view-image">
									</v-btn>
								</v-flex>
							</v-flex>
							<v-flex xs12 md12>
								<span class="message-image"> máximo de imagen permitido es 1024Kb</span>
							</v-flex>
						</v-flex>
						<v-flex xs12>
							<span class="form-group__message" v-if="isLoadingImage">
								Cargando...
							</span>
						</v-flex>
						<v-flex xs12>
							<v-select
								chips
								tags
								clearable
								solo
								class="select-chips_code my-3"
								label="Otros códigos"
								v-model="newProduct.product.alternateCode">
								<template slot="selection" slot-scope="data">
									<v-chip
										close
										@input="removeAlternateCode(data.item)">
										<strong>{{ data.item }}</strong>&nbsp;
									</v-chip>
								</template>
							</v-select>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-checkbox
								color="success"
								hide-details
								label="Activo para la venta"
								v-model="newProduct.product.flagSales"
							></v-checkbox>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-switch
								hide-details
								class="body-1"
								color="success"
								label="Mostrar en ecommerce"
								v-model="newProduct.product.flagEcommerce"
							></v-switch>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-switch
								hide-details
								class="body-1"
								color="success"
								label="Agregar Serie"
								v-model="newProduct.product.flagControlSerie"
							></v-switch>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-switch
								class="body-1"
								hide-details
								color="success"
								label="Activar o desactivar producto"
								v-model="newProduct.product.flagActive"
							></v-switch>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-layout row wrap>
								<v-flex xs4 v-if="!isPeru">
									<v-switch
										class="body-1"
										hide-details
										color="success"
										label="Subsidio"
										v-model="newProduct.product.additionalInformation.flagSubsidy"
									></v-switch>
								</v-flex>
								<v-flex xs4 v-if="newProduct.product.additionalInformation.flagSubsidy">
									<app-input-text
										model="subsidy"
										placeholder="Valor de Subsidio"
										:text="newProduct.product.additionalInformation.subsidy"
										type="number"
										@input="setAdditionalInformation"
									></app-input-text>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs5>
					<v-layout wrap mb-5 pb-5
						v-if="isNotServices">
						<v-flex xs12>
							<v-btn
								class="title-section due-btn ma-0 pl-3"
								:disabled="!newProduct.product.unitId"
								flat
								:ripple="false"
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
												model="unityCode"
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
												@click="removeConversion(conver, indexConver)">
												<v-icon>remove</v-icon>
											</v-btn>
										</v-flex>
									</v-layout>
								</transition-group>
							</v-flex>
						</transition>
					</v-layout>
					<v-layout wrap>
						<v-flex xs12 px-2 mb-4
							class="new-product-price-list"
							v-if="!isLoading">
							<div class="new-product-main-container"
								:style="biggerHeight">
								<div class="price-list-container"
									v-for="(list, listIndex) in priceList"
									:key="list.id">
									<p class="price-list-name mb-0">{{ list.name }}</p>
									<v-layout wrap align-center>
										<v-flex xs8>
											<v-layout wrap align-center>
												<v-flex xs5>
													<v-subheader v-if="unityName">Precio x {{ unityName | lowerCase }}</v-subheader>
												</v-flex>
												<v-flex xs3>
													<v-text-field
														class="filter-select show-error"
														name="accounting-new-product-price"
														hide-details
														single-line
														type="number"
														v-model.number="list.price"
														:rules="[list.price < maxNumber || errorMessage]"
														@update:error="captureError($event, 'price')"
													></v-text-field>
												</v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs4 text-xs-right>
											<v-checkbox
												class="pt-4"
												label="Precio x mayor"
												v-model="list.showRanges"
											></v-checkbox>
										</v-flex>
									</v-layout>
									<v-layout wrap align-center v-if="list.showRanges">
										<v-flex xs12 v-for="(range, rangeIndex) in list.ranges" :key="rangeIndex">
											<v-layout wrap align-center>
												<v-flex xs4>
													<v-subheader>Precio x mayor</v-subheader>
												</v-flex>
												<v-flex xs2>
													<v-text-field
														class="filter-select show-error"
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
														class="filter-select show-error"
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
														class="filter-select show-error"
														name="new-product-to"
														type="number"
														single-line
														hide-details
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
																class="filter-select show-error"
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
																class="filter-select show-error"
																name="new-product-ranges"
																type="number"
																single-line
																hide-details
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
																class="filter-select show-error"
																name="new-product-from"
																type="number"
																single-line
																hide-details
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
																class="filter-select show-error"
																name="new-product-to"
																type="number"
																single-line
																hide-details
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
							</div>
							<p class="price-list-see-all"
								@click="showAllPriceList"
								v-if="moorePriceList">Ver otras listas</p>
							<p class="price-list-see-all"
								@click="showAllPriceList"
								v-else>Ver menos listas</p>
						</v-flex>
					</v-layout>
					<v-layout row wrap pb-3 align-center mb-3>
						<v-flex xs12 pb-3>
							<v-layout row wrap class="price-list-name mb-0">
								<v-flex xs11>
									Precio mínimo de venta	
								</v-flex>
								<v-flex xs1>
									<template v-if="disabledFlagSalePriceMin">
										<v-tooltip top>
											<v-checkbox
												slot="activator"
												color="success"
												disabled
												hide-details
												v-model="flagSalePriceMin"
											></v-checkbox>
											<span>Es necesario configurar un precio en la lista de precios por defecto.</span>
										</v-tooltip>
									</template>
									<v-checkbox
										v-else
										color="success"
										hide-details
										v-model="flagSalePriceMin"
									></v-checkbox>
								</v-flex>
							</v-layout>
						</v-flex>
						<template v-if="flagSalePriceMin">
							<v-flex xs3 px-3>
								<v-text-field
									class="filter-select"
									name="new-product-price"
									hide-details
									type="number"
									v-model.number="newProduct.product.priceSaleMin"
								></v-text-field>
							</v-flex>
							<v-flex xs2 text-xs-left>
								<app-tooltip-button
									color="baseText"
									icon="help"
									text="No se puede vender este producto por debajo del precio mínimo establecido."
								></app-tooltip-button>
							</v-flex>
						</template>
					</v-layout>
					<v-layout wrap>
						<v-flex xs6>
							<v-text-field
								class="filter-select"
								name="new-product-model"
								label="Código Cubso"
								v-model="newProduct.product.codeProductCubso"
							></v-text-field>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<v-layout wrap justify-center align-center py-2>
					<v-flex xs12 text-xs-center>
						<v-btn
							type="button"
							color="pink"
							class="btn-action mr-1"
							:disabled="isLoading"
							@click="cancel"
						>
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
							:disabled="disabledNewProduct || checkBlankCode(newProduct.product.code)"
							@click="createNewProduct"
						>
							Aceptar
							<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</section>
		</div>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
		>
			<new-category
				v-if="action.code === 'NC'"
				@update-category="loadData"
				@cancel-modal="cancelModal"
			/>
			<new-brand
				v-if="action.code === 'NB'"
				@update-brand="loadData"
				@cancel-modal="cancelModal"
			/>
			<units-form
				v-if="action.code === 'UND'"
				:code="newUnit.code"
				:color="newUnit.color"
				:name="newUnit.name"
				@close-modal="cancelModal"
				@save="updateUnity"
				@set-data="getData"
			/>
			<select-warehouse
				v-if="action.code === 'WS'"
				@warehouse-selected="warehouseSelected($event, key)"
				@cancel-modal="cancelModal"
			/>
			<help-component
				v-if="action.code === 'H'"
				:helps="helps"
				@cancel-modal="cancelModal"
			/>
			<image-component
				v-if="action.code === 'VI'"
				:url="newProduct.product.urlImage"
			/>
			<product-taxes-config
				v-if="isTaxesConfig"
				@close-modal="cancelModal"
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
				@cancel-modal="cancelModal"
				@config-features="addFeatures"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline">
					¿Deseas eliminar el producto {{ newProduct.product.name }} {{ newProduct.product.code }}?
				</v-card-title>
				<v-card-text class="subtext">
					Recuerda que al hacer clic en el botón con texto 'Aceptar',
					se procederá a realizar la eliminación en todos los almacenes
					en los que se haya ingresado el producto.
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="deleteProduct">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import { required, requiredIf } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import featuresConfig from '@/components/shared/product/features-config';
import helpAction from '@/components/shared/help-action';
import helpComponent from '@/components/accounting/utils/help-component';
import headerPage from '@/components/shared/header-page';
import imageComponent from '@/components/accounting/utils/image-component';
import Modules from '@/shared/modules';
import newBrand from '@/components/products/utils/new-brand';
import newCategory from '@/components/products/utils/new-category';
import productTaxesConfig from '@/components/products/product-taxes-config';
import selectWarehouse from '@/components/accounting/utils/selecting-warehouse';
import upLoadImageMixin from '@/mixins/upLoadImage';
import unitsForm from '@/components/units/units-form';
import lib from '@/shared/lib';
import typeProduct from '@/shared/type-product';

const { decimals } = lib;

function created() {
	({ clone: this.isCloneProduct } = this.$route.query);
	this.loadUnits();
	if (this.typeProducts.length === 1) {
		this.newProduct.product.type = this.typeProducts[0];
	}
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
		requests.push(this.$httpProducts.get(`products/${this.id}`));
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
		const currentTypeProduct = this.types.find(t => t.code === 'productos-terminados');
		const unitFlagSelected = this.units.filter(p => p.flagDefault);
		this.newProduct.product.type = this.newProduct.product.type || currentTypeProduct.id;
		this.newProduct.product.categoryId = this.newProduct.product.categoryId ||
			this.categories[0].id;
		this.newProduct.product.brandId = this.newProduct.brandId ||
			this.newProduct.product.brandId || this.brands[0].id;
		if (!this.newProduct.brandId) {
			this.newProduct.brandId = this.brands.length === 1 ? this.brands[0].id : null;
		}
		this.newProduct.product.alternateCode = this.newProduct.product.alternateCode || [];
		this.newProduct.product.conversions = this.newProduct.product.conversions || {};
		this.newProduct.product.flagEcommerce = !!this.newProduct.product.flagEcommerce;
		this.newProduct.product.flagControlSerie = !!this.newProduct.product.flagControlSerie;
		this.newProduct.product.priceSaleMin = this.newProduct.product.priceSaleMin || null;
		this.newProduct.product.codeProductCubso = this.newProduct.product.codeProductCubso;
		this.newProduct.product.additionalInformation =
			this.newProduct.product.additionalInformation || {};
		this.flagSalePriceMin = !!this.newProduct.product.priceSaleMin;
		const unitLength = this.units.length;
		if (!this.id) {
			this.newProduct.product.unitId = unitFlagSelected.length ?
				unitFlagSelected[0].id : this.units[unitLength - 1].id;
			this.newProduct.warehouseId = this.warehouses.length === 1 ? [this.warehouses[0].id] : [];
		}
		if (this.isCloneProduct) {
			this.newProduct.product.code = '';
			this.newProduct.warehouseId = typeof this.newProduct.warehouseId === 'number'
				? [this.newProduct.warehouseId] : this.newProduct.warehouseId;
		}
		this.formattingData();
		this.addingAllWarehousesInWarehouses();
	} catch (err) {
		this.showGenericError();
	}
	this.isLoading = false;
}

function addingAllWarehousesInWarehouses() {
	this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
}

async function loadUnits() {
	({ data: this.units } = await this.listOfUnits());
	this.loadData();
}

function formattingData() {
	const productConversions = Object.keys(this.newProduct.product.conversions);
	if (productConversions && productConversions.length > 0) {
		this.setConversions(productConversions);
		this.conversions.push(
			{ id: null, quantity: null, quantityTo: 1, unitFrom: null, code: null, name: null });
	} else if (this.newProduct.unitId || this.newProduct.product.unitId) {
		this.firstConversion();
		const keyConversion = Object.keys(this.newProduct.product.conversions);
		this.setConversions(keyConversion);
		this.showConversions = true;
	} else {
		const listKeys = this.newProduct.priceList ? Object.keys(this.newProduct.priceList) :
			{};
		this.priceList = this.newProduct.id ? this.priceListFormatted(listKeys) :
			this.priceListFormatted();
		this.listRanges = (this.priceList[0].ranges.length - 1);
	}
}

function biggerHeight() {
	const minHeight = 48 * this.listRanges;
	return this.moorePriceList ? `height: ${135 + minHeight}px` : 'height: 380px; overflow: auto';
}

function addConversion() {
	this.conversions.push(
		{ id: null, quantity: null, quantityTo: 1, unitFrom: null, code: null, name: null });
	this.addPriceByUnits(this.unitFilteredId);
}

function addFeatures(features) {
	this.loading = true;
	this.newProduct.product.features = features;
	this.action.active = false;
	this.action.code = '';
	this.action.open = false;
	this.loading = false;
}

function removeConversion(conver, index) {
	this.conversions.splice(index, 1);
	this.priceList = this.priceList.map((p) => {
		const newPrice = { ...p };
		const indexUnit = newPrice.units.findIndex(u => u.id === conver.id);
		if (indexUnit > -1) {
			newPrice.units.splice(indexUnit, 1);
		}
		return newPrice;
	});
}

function runAction(item) {
	if (item.code === 'product-taxes') {
		this.openSlideModal(item.code, 'Impuestos', 600);
	} else {
		this.goTo(item.codeWeb);
	}
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

function captureLocation(value) {
	this.newProduct.product.urlImage = value;
}

function cancel() {
	this.newProduct = {
		alternateCode: [],
		brandId: 0,
		categoryId: 0,
		code: '',
		description: '',
		model: '',
		name: '',
		type: '',
		unitId: 0,
		urlImage: '',
		warehouseId: 0,
	};
	const name = this.route === 'products' ? 'list-of-products' : 'accounting';
	this.goTo(name);
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

function unityCode() {
	const unitId = this.newProduct.product.unitId;
	const unit = this.units.find(u => u.id === unitId);
	const code = unit ? unit.code || unit.name : '';
	return code;
}

function unityName() {
	const unitId = this.newProduct.product.unitId;
	const unit = this.units.find(u => u.id === unitId) || {};
	const name = unit ? unit.name : 'Unidad';
	return name;
}

function filteredUnits() {
	return this.units.length > 0 ? this.units.filter(u => u.id !== this.newProduct.product.unitId)
		: [];
}

function buildBody(id, product) {
	let newObject = {};
	if (id && !this.isCloneProduct) {
		const productTaxes = product.taxes || product.product.taxes;
		newObject = {
			priceList: this.buildPriceList(),
			product: {
				additionalInformation: { ...product.product.additionalInformation },
				alternateCode: product.product.alternateCode,
				categoryId: product.product.categoryId,
				code: product.product.code,
				codeRetention: product.codeRetention,
				conversions: this.formattingConversions(this.conversions),
				description: product.product.description || '',
				flagEcommerce: product.product.flagEcommerce,
				flagModule: Modules.Japi,
				features: product.product.features,
				name: product.product.name,
				model: product.product.model || '',
				unitId: product.product.unitId,
				urlImage: product.product.urlImage,
				taxes: productTaxes.map((t) => {
					const newT = { ...t };
					newT.flagSales = !!t.flagSales;
					newT.flagPurchases = !!t.flagPurchases;
					delete newT.productId;
					delete newT.companyId;
					delete newT.createdAt;
					delete newT.updatedAt;
					return newT;
				}),
				flagControlSerie: product.product.flagControlSerie,
				flagActive: Boolean(product.product.flagActive),
				flagSales: Boolean(product.product.flagSales),
				priceSaleMin: product.product.priceSaleMin ? Number(product.product.priceSaleMin) : null,
				codeProductCubso: product.product.codeProductCubso,
			},
		};
	} else {
		newObject = {
			brandId: product.brandId,
			priceList: this.buildPriceList(),
			product: {
				additionalInformation: { ...product.product.additionalInformation },
				alternateCode: product.product.alternateCode,
				categoryId: product.product.categoryId,
				code: product.product.code,
				codeRetention: product.codeRetention,
				conversions: this.formattingConversions(this.conversions),
				description: product.product.description || '',
				flagEcommerce: product.product.flagEcommerce,
				features: product.product.features,
				name: product.product.name,
				model: product.product.model || '',
				type: product.product.type,
				unitId: product.product.unitId,
				urlImage: product.product.urlImage,
				taxes: product.taxes,
				flagControlSerie: product.product.flagControlSerie,
				flagActive: Boolean(product.product.flagActive),
				flagSales: Boolean(product.product.flagSales),
				priceSaleMin: product.product.priceSaleMin ? Number(product.product.priceSaleMin) : null,
				codeProductCubso: product.product.codeProductCubso,
			},
			warehouseId: product.warehouseId || [],
		};
	}
	return newObject;
}

function getUrl() {
	let url = 'products';
	if (this.id && !this.isCloneProduct) {
		url = `products/${this.id}`;
	}
	return url;
}

function getMethod() {
	let method = 'post';
	if (this.id && !this.isCloneProduct) {
		method = 'patch';
	}
	return method;
}

function getAction() {
	let action = 'creado';
	if (this.id && !this.isCloneProduct) {
		action = 'actualizado';
	}
	return action;
}

async function createNewProduct() {
	this.isLoading = true;
	if ((this.newProduct.taxes && this.newProduct.taxes.length > 0) ||
		this.newProduct.product.taxes) {
		const name = this.route === 'products' ? 'list-of-products' : 'accounting';
		const url = this.getUrl();
		const body = this.buildBody(this.id, this.newProduct);
		const methods = this.getMethod();
		const action = this.getAction();
		try {
			await this.$httpProducts[methods](url, body);
			this.showNotification(`producto ${action} con éxito`);
			if (this.id) {
				localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::products-selected`);
			}
			this.goTo(name);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'PRODUCT_DUPLICATE_CODE') {
					this.showGenericError('El código ya está asignado a otro producto.');
				} else if (err.data.message === 'LIMIT_PRICE_ERROR') {
					this.showGenericError('El precio mínimo de venta debe ser menor al precio de venta');
				}
			}
		} finally {
			this.isLoading = false;
		}
	} else {
		this.showGenericError('Es necesario configurar impuestos para crear el producto.');
		this.openSlideModal('product-taxes', 'Impuestos', 600);
		this.isLoading = false;
	}
}

function captureError(value, flag) {
	this.errors[flag] = value;
	const keys = Object.keys(this.errors);
	const el = keys.find(e => this.errors[e]);
	this.disabledByError = !!el;
}

function showAllPriceList() {
	this.moorePriceList = !this.moorePriceList;
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

function cancelModal() {
	this.action = { ...this.actionDefault };
	this.newUnit = {
		code: '',
		color: '#000000',
		flagActive: true,
		name: '',
	};
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

function validations() {
	return {
		newProduct: {
			brandId: {
				required: requiredIf(() => this.isNotServices),
			},
			product: {
				categoryId: { required },
				code: { required },
				name: { required },
				type: { required },
				unitId: { required },
			},
			warehouseId: {
				required: requiredIf(() => this.isNotServices),
			},
		},
	};
}

function isNotServices() {
	return this.newProduct.product.type !== 2;
}

function validUnit(id) {
	this.conversions[0].unitFrom = this.unityCode;
	this.showConversions = !!id;
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

function setConversions(converKeys) {
	converKeys.forEach((key, index) => {
		this.conversions[index] = {};
		this.conversions[index].id = Number(key);
		this.conversions[index].quantity = this.newProduct.product.conversions[key].quantity || null;
		this.conversions[index].quantityTo = this.newProduct.product.conversions[key].quantityTo
			|| null;
		this.conversions[index].code = this.newProduct.product.conversions[key].code || null;
		this.conversions[index].name = this.newProduct.product.conversions[key].name || null;
	});
	const listKeys = this.newProduct.priceList ? Object.keys(this.newProduct.priceList) : [];
	this.priceList = this.priceListFormatted(listKeys);
	this.listRanges = (this.priceList[0].ranges.length - 1);
}

function setShowConversions() {
	this.showConversions = !this.showConversions;
}

function addPriceByUnits(id) {
	this.priceList = this.priceList.map((pl) => {
		const newList = { ...pl };
		newList.units.push({
			id,
			name: this.filteredUnits.find(fu => fu.id === id).name,
			price: 0,
			ranges: [{ price: 0, from: 0, to: 0 }],
			showRanges: false,
		});
		return newList;
	});
	this.disabledConver = true;
}

function priceListFormatted(keys) {
	if (keys && keys.length > 0) {
		return this.editListFormatted(keys);
	}
	return this.priceList.map((price) => {
		const newPrice = { ...price };
		newPrice.price = 0;
		newPrice.ranges = [{ from: 0, price: 0, to: 0 }];
		newPrice.showRanges = false;
		newPrice.units = [];
		return newPrice;
	});
}

function addRange(indexList, indexUnit) {
	const newRange = { price: 0, from: 0, to: 0 };
	if (indexUnit >= 0) {
		this.priceList[indexList].units[indexUnit].ranges.push(newRange);
	} else {
		this.priceList[indexList].ranges.push(newRange);
	}
}

function removeRange(indexList, indexRange, indexUnit) {
	if (indexUnit >= 0) {
		this.priceList[indexList].units[indexUnit].ranges.splice(indexRange, 1);
	} else {
		this.priceList[indexList].ranges.splice(indexRange, 1);
	}
}

function buildPriceList() {
	return this.priceList.reduce((acum, pl) => {
		const newPl = { ...acum };
		newPl[pl.id] = {};
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

function editListFormatted(keys) {
	return this.priceList.map((price) => {
		const newPrice = { ...price };
		const key = keys.find(k => Number(k) === price.id);
		if (key) {
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
			newPrice.ranges = [{ from: 0, price: 0, to: 0 }];
			newPrice.showRanges = false;
			newPrice.units = [];
		}
		return newPrice;
	});
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

function showWarehouses() {
	return this.isNotServices && (!this.id || this.isCloneProduct);
}

function isTaxesConfig() {
	return this.action.code === 'product-taxes';
}

function getTaxes(taxesModel) {
	const { codeRetention, taxes } = taxesModel;
	this.newProduct.codeRetention = codeRetention;
	this.newProduct.taxes = [...taxes];
	this.showNotification('La configuración ha sido guardada correctamente para el producto a crear');
	this.cancelModal();
}

function getData({ model, value }) {
	this.newUnit[model] = value;
}

function removeAlternateCode(item) {
	const index = this.newProduct.product.alternateCode.indexOf(item);
	if (index > -1) {
		this.newProduct.product.alternateCode.splice(index, 1);
	}
}

function disabledByConver(converData) {
	this.disabledConver = this.newProduct.product.unitId === converData.id || !converData.quantity;
}

function disabledNewProduct() {
	return this.$v.$invalid || this.isLoadingImage || this.disabledByPriceList || this.isLoading ||
		(this.flagSalePriceMin && !this.newProduct.product.priceSaleMin) ||
		this.newProduct.product.priceSaleMin > this.priceList.find(pl => pl.flagDefault).price;
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
	if (Number(this.newProduct.product.priceSaleMin) > values[0].price) {
		this.showGenericError('El precio debe ser menor al precio de venta');
	}
}

function firstConversion() {
	this.newProduct.product.conversions[this.newProduct.product.unitId] = {};
	this.newProduct.product.conversions[this.newProduct.product.unitId].quantity = 0;
	this.newProduct.product.conversions[this.newProduct.product.unitId].quantityTo = 1;
	this.newProduct.product.conversions[this.newProduct.product.unitId].code = null;
	this.newProduct.product.conversions[this.newProduct.product.unitId].name = null;
}

function priceSaleMin(item) {
	if (Number(item) > this.priceList[0].price) {
		this.showGenericError('El precio debe ser menor al precio de venta');
	}
}

function disabledFlagSalePriceMin() {
	const listPriceValid = this.priceList.findIndex(pl => pl.flagDefault === 1 && pl.price > 0);
	return this.$userInfo.company.flagIgv !== 1 || listPriceValid === -1;
}

function setAdditionalInformation({ model, value }) {
	const sixDecimals = decimals(6);
	const newValue = sixDecimals(value);
	this.newProduct.product.additionalInformation[model] = newValue;
}

async function deleteProduct() {
	this.isLoading = true;
	try {
		await this.$httpProducts.delete(`products/${this.newProduct.productId}/delete`);
		this.dialog = false;
		this.showNotification('El producto ha sido eliminado correctamente.');
		localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::products-selected`);
		this.goTo('products');
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'PRODUCT_NOT_FOUND') {
				this.showGenericError('El producto no existe');
			} else if (err.data.message === 'PRODUCT_CANNOT_DELETED_SINCE_KARDEX') {
				this.showGenericError('El producto no puede ser eliminado por tener movimientos en el kardex.');
			} else if (err.data.message === 'PRODUCT_CANNOT_DELETED_SINCE_TRANSACTIONS') {
				this.showGenericError('El producto no puede ser eliminado porque ya ha sido usado para ciertas transacciones.');
			} else if (err.data.message === 'WAREHOUSE_PRODUCT_NOT_FOUND') {
				this.showGenericError('El almacén del producto no ha sido encontrado.');
			} else if (err.data.message === 'PRODUCT_CANNOT_DELETED') {
				this.showGenericError('El producto no puede ser eliminado porque tiene transacciones asociadas.');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function cancelDelete() {
	this.dialog = false;
}

function openConfirmation() {
	this.dialog = true;
}

function typeProducts() {
	const type = [typeProduct.Products, typeProduct.Services];
	return this.$userInfo.company.settings.typeProductsCreationPermission || type;
}

function isFlagImport() {
	return this.$userInfo.company.settings.flagImport;
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actions: [],
		brands: [],
		categories: [],
		conversions: [
			{
				id: null,
				quantity: null,
				quantityTo: 1,
				unitFrom: null,
			},
		],
		dialog: false,
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
		isCloneProduct: false,
		isLoading: false,
		jailai: {
			brand: 0,
			category: 0,
			unit: 0,
		},
		key: 'newProduct',
		loading: false,
		maxNumber: 99999999,
		moorePriceList: true,
		newProduct: {
			brandId: null,
			product: {
				additionalInformation: {
					flagSubsidy: false,
					subsidy: 0,
				},
				alternateCode: [],
				categoryId: null,
				code: '',
				conversions: {},
				description: null,
				features: [],
				flagActive: true,
				flagControlSerie: false,
				flagEcommerce: false,
				flagSales: true,
				model: '',
				name: '',
				type: '',
				unitId: null,
				urlImage: '',
				priceSaleMin: null,
				codeProductCubso: null,
			},
			taxes: [],
			warehouseId: null,
		},
		newUnit: {
			code: '',
			color: '#000000',
			flagActive: true,
			name: '',
		},
		priceList: [{ units: {} }],
		showConversions: false,
		taxes: [],
		types: [],
		unitFilteredId: 0,
		units: [],
		warehouses: [],
		flagSalePriceMin: false,
	};
}

export default {
	name: 'accounting-new-product',
	components: {
		actionSidebar,
		appActions,
		featuresConfig,
		helpAction,
		helpComponent,
		headerPage,
		imageComponent,
		newBrand,
		newCategory,
		productTaxesConfig,
		selectWarehouse,
		unitsForm,
		VueSixFour,
	},
	computed: {
		biggerHeight,
		disabledFlagSalePriceMin,
		disabledNewProduct,
		filteredUnits,
		isFlagImport,
		isNotServices,
		isTaxesConfig,
		showWarehouses,
		unityCode,
		unityName,
		typeProducts,
	},
	created,
	data,
	methods: {
		addConversion,
		addingAllWarehousesInWarehouses,
		addFeatures,
		addPriceByUnits,
		addRange,
		buildBody,
		buildPriceList,
		buildUnits,
		cancel,
		cancelDelete,
		cancelModal,
		captureError,
		createNewProduct,
		deleteProduct,
		disabledByConver,
		editListFormatted,
		firstConversion,
		formattingConversions,
		formattingData,
		getAction,
		getData,
		getMethod,
		getTaxes,
		getUrl,
		jsonPriceList,
		loadData,
		loadUnits,
		openConfirmation,
		openSlideModal,
		priceListFormatted,
		removeAlternateCode,
		removeConversion,
		removeRange,
		runAction,
		setAdditionalInformation,
		setConversions,
		setData,
		setShowConversions,
		setWarehouseId,
		showAllPriceList,
		unitsFormatted,
		unitsFormattedByConversions,
		updateUnity,
		validUnit,
	},
	mixins: [upLoadImageMixin],
	props: {
		id: [Number, String],
		route: {
			default: 'accounting',
			type: String,
		},
	},
	validations,
	watch: {
		captureLocation,
		priceList: {
			deep: true,
			handler: priceListValues,
		},
		'newProduct.product.priceSaleMin': priceSaleMin,
	},
};
</script>

<style lang="scss" scoped>
.price-list-name {
	border-bottom: 1px solid color(blue-grey);
	color: map-get($colors, paginationText);
	font-family: font(open-bold);
	font-size: size(medium);
	text-transform: uppercase;
}

.new-product-main-container {
	@include vertical-displacement;
	max-height: 300px;
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

.message-image {
	color: map-get($colors, subheaderText);
	font-size: 11px;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}
</style>
