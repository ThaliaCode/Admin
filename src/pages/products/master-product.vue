<template>
	<div class="master-product">
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
				el listado de próductos maestros."
		/>
		<header-page
			btns-column="xs3"
			:limit-title="28"
			:number-bill="titlePage"
			:title="titleHeader"
			to-show
			:options="optionsExcel"
			:show-excel="false"
			show-excel-menu
			:open-on-click="true"
			@emit-excel="downloadProductMaster"
			@clean-product-filter="cleanFilter"
		>
		</header-page>
		<app-actions
			:value-disabled="disabledComputed"
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout row wrap align-end my-3 px-5>
			<v-flex xs3 v-if="isMibodega && commerceId">
				<app-select
					autocomplete
					chips
					multiple
					:items="categories"
					item-text="title"
					item-value="id"
					label="Categoria"
					:item="eCategories"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex v-else xs3>
				<label class="caption">Categorías</label>
				<!-- <v-select
					autocomplete
					clearable
					chips
					multiple
					single-line
					hide-details
					:items="categories"
					v-model="category"
					label="Categoría"
					item-value="id"
					item-text="name"
					class="filter-select"
					content-class="filter-select-content"
					@input="setDataCategorie"
				>
				</v-select> -->
				<categories-autocomplete
					:is-multiple="true"
					multiple
					:label="`Categoría`"
					:item="category"
					:items="categories"
					item-text="name"
					:slot-custom="true"
					item-value="id"
					@return-data="setDataCategorie"
				></categories-autocomplete>
			</v-flex>
			<v-flex xs2 ml-2>
				<label class="caption">Lista de Precios</label>
				<v-select
					autocomplete
					clearable
					solo
					hide-details
					:items="priceLists"
					v-model="priceListIdTable"
					label="Lista de Precio"
					item-value="id"
					item-text="name"
					class="filter-select"
					content-class="filter-select-content"
					@input="setDataPriceList"
				>
				</v-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<v-select
					autocomplete
					solo
					hide-details
					:items="brands"
					v-model="params.brandIds"
					label="Marca"
					item-value="id"
					item-text="name"
					class="filter-select"
					content-class="filter-select-content"
					@input="setDataBrand"
				></v-select>
			</v-flex>
			<v-flex xs2 ml-2>
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
			<v-flex xs2 ml-2 v-if="$route.name === 'master-product-ecommerce'">
				<app-select
					:item="params.flagProductNotInEcommerce"
					label="Asignados a comercio"
					item-text="name"
					item-value="code"
					model="flagProductNotInEcommerce"
					:items="optionsEcommerce"
					@input="setDataActive"
				></app-select>
			</v-flex>
		</v-layout>
		<master-products-list
			:value-type="params.typeId"
			:check-all="checkAll"
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
			@view-price-list="viewPriceList"
			@view-lot="viewLot"
			@all-selected="allSelected"
			@clone-product="cloneProduct"
			@edit-product="editProduct"
			@change-show-catalog="changeShowCatalog"
			@change-state="onChangeState"
			@column-input="onColumnInput"
			@delete-product="deleteSingleProduct"
			@go-to-kardex="goToKardex"
			@on-page="loadData"
			@row-selected="rowSelected"
			@search-event="searchEvent"
			@table-action="tableAction"
			@table-option-event="tableOptionEvent"
			@variants-product="loadChildren"
			@open-dialog="openDialogCancel"
			@on-column-sortable="columnSortable"
			@lot-product="addLotProduct"
			@view-stock="viewStockSlide"
			@price-change="viewPriceChange"
			@open-history-products="openHistoryProducts"
		></master-products-list>
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:value="action.open"
			@close-modal="closeModal"
		>
			<features-config
				v-if="action.code === 'CF'"
				:categories="categories"
				:product="productSelected"
				@cancel-modal="closeModal(false)"
				@config-features="configFeatures"
			/>
			<view-stock
				v-if="action.code === 'VS'"
				:stock="stockProduct"
				:product-id="productIdSlide"
				:brand-product="brandNameProduct"
				@close-modal="closeModal"
				@save="closeModal"
			/>
			<price-change
				v-if="action.code === 'HSP'"
				:id="productIdSlide"
				:price-list-id-table="priceListId"
				:price-selected="priceSelected"
			>
			</price-change>
			<assign-filters-form
				v-if="action.code === 'assign-filters'"
				:data-selected="dataSelected"
				@on-assign="assignFilter"
				@on-close="closeModal"
			/>
			<assign-product
				v-if="action.code === 'AP'"
				:fairs="fairs"
				:id-fair="idFair"
				:products-selected="dataSelected"
				@close-modal="closeModal"
				@save-modal="assingProduct"
				@set-fair="setFair"
			/>
			<attributes-assign-slide
				v-if="action.code === 'assign-attributes'"
				:products-selected="dataSelected"
				:subsidiary-id="subsidiaryId"
				@assign-attributes="assignAttributes"
				@cancel-action="closeModal"
			></attributes-assign-slide>
			<change-price
				v-if="action.code === 'change-price'"
				:products="dataSelected"
				:id-commerce="commerceId"
				:selected-price-list="selectedPriceList"
				@close="closeModal"
				@update-price="updatePrice"
			/>
			<status-catalog
				v-if="action.code === 'activate-catalog'"
				@close="closeModal"
				@change-status-catalog="changeStatusCatalog"
			/>
			<assign-categories
				v-if="action.code === 'assign-categories'"
				:categories-selected="categoriesSelected"
				@close="closeModal"
				@save="saveCategories"
			/>
			<filter-by-master
				v-if="action.code === 'filter-by'"
				:is-loading="disabledFilter"
				:show-image="false"
				success-text="Filtrar"
				@accept-button="applyFilter"
				@cancel-button="cancelFilter"
			>
				<v-flex xs12>
					<app-select
						:item="params.typeId"
						:items="types"
						item-text="name"
						item-value="id"
						label="Tipo de Producto"
						model="typeId"
						:return-object="false"
						@input="setParamsData"
					></app-select>
				</v-flex>
				<v-flex xs12 mt-3>
					<app-select
						:item="params.flagLoyalti"
						label="Fidelización"
						item-text="name"
						item-value="id"
						model="flagLoyalti"
						:return-object="false"
						:items="loyaltys"
						@input="setParamsData"
					></app-select>
				</v-flex>
				<v-flex xs12 mt-3>
					<app-select
						:item="params.flagAvgCost"
						label="Calculo de Costo Promedio (Status CP)"
						item-text="name"
						item-value="code"
						model="flagAvgCost"
						:items="calculateCostProm"
						@input="setParamsData"
					></app-select>
				</v-flex>
				<v-flex xs12 mt-3 v-show="$route.name === 'master-product-ecommerce'">
					<app-select
						:item="params.isPublic"
						label="Privacidad del Producto"
						item-text="name"
						item-value="isPublic"
						model="isPublic"
						:items="optionsPublic"
						@input="setParamsData"
					></app-select>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-checkbox
						label="Con stock"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.withStock"
						hide-details
					>
					</v-checkbox>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-checkbox
						label="Sin stock"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.withOutStock"
						hide-details
					>
					</v-checkbox>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-checkbox
						label="Lotes"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.flagLotsEnabled"
						hide-details
					>
					</v-checkbox>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-checkbox
						label="Productos con serie"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.flagControlSerie"
						hide-details
					>
					</v-checkbox>
				</v-flex>
				<v-flex xs12 mt-3 v-if="params.typeId === 1">
					<v-checkbox
						label="Fabricado"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.flagFlowManufactured"
						hide-details
					>
					</v-checkbox>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-checkbox
						label="Con peso"
						color="primary"
						size="small"
						:true-value="1"
						:false-value="0"
						v-model="params.withWeight"
						hide-details
					>
					</v-checkbox>
				</v-flex>
			</filter-by-master>
			<assign-trades
				v-if="action.code === 'assign-trades'"
				:products="dataSelected"
				:loadingAssignTrades="loadingAssignTrades"
				@save="saveTrades"
				@close="closeModal"
			/>
			<product-limit-catalog
				v-if="action.code === 'product-limit-catalog'"
				:commerce="selectCommerce"
				@change-limit-product="changeLimitProduct"
				@close="closeModal"
			/>
			<accum-points
				v-if="action.code === 'accumulate-points'"
				:columns="columnsAccum"
				:rows="rowsAccum"
				@cancel-modal-accum="closeModalAccum"
				@save-accum="saveAccum"
				@search-point="searchTableAccum"
			/>
			<ordering-products
				v-if="action.code === 'product-ordering'"
				:products="dataSelected"
				:commerce-id="commerceId"
				@close-modal="closeModal"
				@reload="loadData"
			/>
			<price-list-detail
				v-if="action.code === 'price-list-detail'"
				:formattedPriceLists="formattedPriceLists"
				@close="closeModal"
			/>
			<loading-products
				v-if="action.code === 'loading-products'"
				:type="2"
				@reload-products="loadData"
				@close-modal="closeModal"
			/>
			<history-products
				v-if="action.code === 'history-products'"
				:rows="rowsHistory"
				@close-modal="closeModal"
			/>
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
							¿Está seguro que desea hacer <b>{{ productStatusWord }}</b> el producto?:
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
							@click="onChangeActive"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDelete" max-width="500px">
			<v-card class="pa-4">
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center ma-0 title"></p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<p v-if="modalDeleteOne" class="text-xs-center ma-0">
							<b>"{{ selectProductDelete.name }}"</b>
						</p>
						<p class="text-xs-center ma-0" v-else>
							<span v-for="(product, index) in dataSelected" :key="product.id">
								<span v-if="index === dataSelected.length - 1">{{ product.name }}</span>
								<span v-else>{{ product.name }}, </span>
							</span>
						</p>
					</v-layout>
				</v-card-text>
				{{ currentProduct }}
				<div v-if="currentProduct.flagActive">
					<v-card-text class="py-0">
						<h2 class="text-xs-center ma-0 subheading">
							Ten en cuenta que la <b>eliminación</b> de un producto solo es posible si no
							ha tenido ningún movimiento de stock o inventario asociado, y esto, hará que
							se elimine permanentemente el producto de todos los almacenes. Por otro
							lado, puedes <b>DESACTIVAR</b> el producto si este ya cuenta con movimientos
							(recuerda que esta acción solo inhabilitará al producto).
						</h2>
					</v-card-text>
					<v-card-actions class="px-5">
						<v-layout d-flex justify-space-between px-4 py-2>
							<v-btn
								class="btn-action ml-1"
								color="pink"
								:disabled="loadingDelete"
								type="button"
								@click="deleteProducts"
							>
								Eliminar
							</v-btn>
							<v-btn
								class="btn-action mr-1"
								color="success"
								:disabled="loading"
								type="button"
								@click="applyAction"
							>
								Desactivar
							</v-btn>
						</v-layout>
					</v-card-actions>
				</div>
				<div v-else>
					<v-card-text class="py-0">
						<h2 class="text-xs-center ma-0 subheading">
							Ten en cuenta que la <b>eliminación</b> de un producto solo es posible si no
							ha tenido ningún movimiento de stock o inventario asociado, y esto, hará que
							se elimine permanentemente el producto de todos los almacenes.
						</h2>
					</v-card-text>
					<v-card-actions class="px-5">
						<v-layout d-flex justify-space-between px-4 py-2>
							<v-btn
								class="btn-action ml-1"
								color="pink"
								:disabled="loadingDelete"
								type="button"
								@click="cancelDelete"
							>
								Cancelar
							</v-btn>
							<v-btn
								class="btn-action mr-1"
								color="success"
								:disabled="loading"
								type="button"
								@click="deleteProducts"
							>
								Aceptar
							</v-btn>
						</v-layout>
					</v-card-actions>
				</div>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="dialogVariations"
			content-class="product-modal"
			height="580px"
			max-height="580px"
			max-width="590px"
			persistent
		>
			<v-card class="modal-card-container">
				<v-card-title class="modal-card-heading">
					<v-flex xs12>
						<v-layout row wrap class="modal-card-title">
							<v-flex xs10 class="modal-card-title-row">
								{{ productSelected.name }}
							</v-flex>
							<v-flex xs2 text-xs-right class="modal-card-title-row">
								<v-btn class="product-modal-close" depressed icon @click="closeDialog">
									<v-icon color="primary" size="16">close</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-card-title>
				<v-card-text class="modal-card-body">
					<v-layout row wrap class="modal-card-body-top">
						<v-flex
							mb-1
							v-for="(feature, featureIndex) in productSelected.features"
							xs12
							:key="feature.id"
						>
							<v-layout row align-end>
								<v-flex xs10>
									<app-select
										return-object
										autocomplete
										item-text="value"
										item-value="value"
										:item="variationModel.features[featureIndex]"
										:items="feature.features"
										:label="feature.name"
										model="value"
										@input="setVariationModel($event, featureIndex)"
									></app-select>
								</v-flex>
								<v-flex xs2>
									<app-tooltip-button
										color="accent"
										icon="add"
										:text="`Agregar Nuevo ${feature.name}`"
										@click-icon="openCreateCharacteristic(featureIndex)"
									/>
								</v-flex>
							</v-layout>
							<v-layout mt-2 align-start v-if="feature.open">
								<v-flex xs5>
									<app-input-text
										label="Nombre del Identificador"
										model="name"
										:text="createCharacteristic.name"
										@input="setDataCharacteristic"
									></app-input-text>
								</v-flex>
								<v-flex xs4 ml-1>
									<app-input-text
										label="Codigo del Identificador"
										model="code"
										:text="createCharacteristic.code"
										@input="setDataCharacteristic"
									></app-input-text>
									<span class="text-small">Máximo 3 caracteres</span>
								</v-flex>
								<v-flex mt-3>
									<v-btn
										class="btn-action caption white--text"
										color="success"
										@click="createCharacteristicAccept(feature)"
									>
										Aceptar
									</v-btn>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-flex xs12 mt-3>
						<v-layout row wrap>
							<v-flex xs4 pr-2>
								<app-select
									:disabled="warehouses.length === 1"
									:item="variationModel.warehouseId"
									:items="warehouses"
									item-text="name"
									item-value="id"
									:label="labelWarehouse()"
									model="warehouseId"
									:return-object="false"
									@input="setVariationModel($event)"
								></app-select>
							</v-flex>
							<v-flex xs6>
								<v-layout row wrap>
									<v-flex xs4 pr-1>
										<app-input-text
											label="Stock"
											model="stock"
											:text="variationModel.stock"
											type="number"
											@input="setVariationModel($event)"
										></app-input-text>
									</v-flex>
									<v-flex xs4 pl-1>
										<app-input-text
											label="Stock min."
											model="minStock"
											:text="variationModel.minStock"
											type="number"
											@input="setVariationModel($event)"
										></app-input-text>
									</v-flex>
									<v-flex xs4 pl-1>
										<app-input-text
											label="Costo"
											model="cost"
											:text="variationModel.cost"
											type="number"
											@input="setVariationModel($event)"
										></app-input-text>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs2 text-xs-center>
								<v-tooltip top>
									<button
										class="button-modal-add"
										:disabled="disabledModalAdd"
										slot="activator"
										type="button"
										@click="addVariant"
									>
										<v-icon color="primary" size="17">add</v-icon>
									</button>
									<span>
										<template v-if="disabledModalAdd">
											Es necesario seleccionar al menos un valor de las características y
											completar los datos.
										</template>
										<template v-else>Agregar Variación</template>
									</span>
								</v-tooltip>
							</v-flex>
							<v-flex
								class="caption error--text"
								xs12
								v-if="variationModel.minStock > variationModel.stock"
							>
								El stock no puede ser menor que el stock mínimo
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mt-3>
						<label class="modal-label">Variaciones agregadas</label>
					</v-flex>
					<template v-if="loadingChildren">
						<v-layout row wrap align-center justify-center class="loading-map">
							<v-flex xs7 px-4 py-2 class="loading-map-container">
								<p class="loading-map-text mb-0">
									Espere un momento mientras finaliza la carga de información.
								</p>
							</v-flex>
						</v-layout>
					</template>
					<template v-else-if="childs.length > 0">
						<v-flex xs12 mt-2>
							<v-layout row wrap>
								<v-flex xs3 pr-1>
									<span class="modal-table-label">
										{{ labelWarehouse(true) }}
									</span>
								</v-flex>
								<v-flex xs3 pr-1>
									<span class="modal-table-label"> Características </span>
								</v-flex>
								<v-flex xs3 pr-1>
									<span class="modal-table-label"> Códigos </span>
								</v-flex>
								<v-flex xs3 pr-1>
									<span class="modal-table-label"> Costo </span>
								</v-flex>
								<v-flex xs1></v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 class="modal-card-body-bottom">
							<v-layout v-for="(child, childIndex) in childs" row wrap :key="childIndex">
								<v-flex xs3 pr-1>
									<div class="modal-table-column">
										<template
											v-if="
												child.warehouseId &&
												warehouses.find((w) => w.id === child.warehouseId)
											"
										>
											<template
												v-if="
													warehouses.find((w) => w.id === child.warehouseId).name.length >
													16
												"
											>
												<v-tooltip top>
													<span slot="activator">
														{{
															warehouses.find((w) => w.id === child.warehouseId).name
																| limitTo(16)
														}}
													</span>
													<span>{{
														warehouses.find((w) => w.id === child.warehouseId).name
													}}</span>
												</v-tooltip>
											</template>
											<template v-else>
												{{ warehouses.find((w) => w.id === child.warehouseId).name }}
											</template>
										</template>
										<template v-else> - </template>
									</div>
								</v-flex>
								<v-flex xs3 pr-1>
									<div class="modal-table-column" v-if="child.description">
										<template v-if="child.description.length > 18">
											<v-tooltip top>
												<span slot="activator">
													{{ child.description | limitTo(18) }}
												</span>
												<span>{{ child.description }}</span>
											</v-tooltip>
										</template>
										<template v-else>
											{{ child.description }}
										</template>
									</div>
								</v-flex>
								<v-flex xs3 pr-1>
									<div class="modal-table-column">
										<template v-if="child.code.length > 10">
											<v-tooltip top>
												<span slot="activator">
													{{ child.code | limitTo(12) }}
												</span>
												<span>{{ child.code }}</span>
											</v-tooltip>
										</template>
										<template v-else>
											{{ child.code }}
										</template>
									</div>
								</v-flex>
								<v-flex xs2 pr-1>
									<div class="modal-table-column">
										<template v-if="child.cost">
											{{ child.cost || '' }}
										</template>
									</div>
								</v-flex>
								<v-flex xs1 text-xs-center>
									<v-menu
										attach
										content-class="modal-table-action"
										:disabled="!!child.productParentId"
										left
										:nudge-left="10"
										offset-x
									>
										<button
											class="modal-table-button"
											:disabled="!!child.productParentId"
											slot="activator"
											type="button"
										>
											<v-icon class="menu-action-icon" size="16">more_vert</v-icon>
										</button>
										<v-list>
											<v-list-tile @click="editVariations(child, childIndex)">
												<v-list-tile-title class="primary--text menu-action-text">
													Editar
												</v-list-tile-title>
											</v-list-tile>
											<v-list-tile @click="deleteVariations(child, childIndex)">
												<v-list-tile-title class="error--text menu-action-text">
													Eliminar
												</v-list-tile-title>
											</v-list-tile>
										</v-list>
									</v-menu>
								</v-flex>
							</v-layout>
						</v-flex>
					</template>
				</v-card-text>
				<v-card-actions class="product-modal-actions">
					<v-btn
						class="btn-action btn-auto product-modal-btn"
						color="primary"
						:disabled="disabledAdd"
						outline
						@click="saveVariations"
					>
						<span class="product-modal-btn-text">Guardar</span>
					</v-btn>
					<v-btn
						class="btn-action btn-auto product-modal-btn"
						color="primary"
						outline
						@click="closeDialog"
					>
						<span class="product-modal-btn-text">Cancelar</span>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showDialogLot" persistent max-width="400px">
			<modal-items
				v-if="showDialogLot"
				show-slot
				name-action="Añadir"
				name-cancel="Cerrar"
				:title="titleAddLot"
				@close-modal="closeModalLot"
				@action-modal="createdLotProduct"
			>
				<v-flex xs12 pt-3 pb-3 px-3>
					<v-layout row wrap>
						<v-flex
							mb-2
							v-for="(feature, featureIndex) in productSelected.features"
							xs12
							:key="feature.id"
						>
							<app-select
								return-object
								autocomplete
								item-text="value"
								item-value="value"
								:item="variationModel.features[featureIndex]"
								:items="feature.features"
								:label="feature.name"
								model="value"
								@input="setVariationModelLot($event, featureIndex)"
							></app-select>
						</v-flex>
						<v-flex xs4 pr-1 mt-1>
							<app-input-text
								label="Stock"
								model="stock"
								type="number"
								@input="setVariationModelLot($event)"
							></app-input-text>
						</v-flex>
						<v-flex xs8 pr-1 mt-1>
							<app-input-text
								label="Nro de Lote"
								model="lot"
								type="text"
								@input="setVariationModelLot($event)"
							></app-input-text>
						</v-flex>
						<v-flex xs6 pr-2 mt-1>
							<app-select
								autocomplete
								:item="variationModel.warehouseId"
								:items="warehouses"
								item-text="name"
								item-value="id"
								:label="labelWarehouse()"
								model="warehouseId"
								:return-object="false"
								@input="setVariationModelLot($event)"
							></app-select>
						</v-flex>
						<v-flex xs6 pr-2 mt-1>
							<app-select
								autocomplete
								:items="brands"
								item-text="name"
								item-value="id"
								label="Marca"
								model="brandId"
								:return-object="false"
								:item="variationModel.brandId"
								@input="setVariationModelLot($event)"
							></app-select>
						</v-flex>
					</v-layout>
				</v-flex>
			</modal-items>
		</v-dialog>
		<v-dialog persistent v-model="dialogmodalLotes" max-width="585px">
			<modal-lotes-sales
				v-if="dialogmodalLotes"
				ref="modalLotList"
				:isProduct="$route.name === 'master-product'"
				:product-data="lotProduct"
				@close-modal-lotes="closeLots"
			/>
		</v-dialog>

		<!-- MODAL ELIMINAR TODOS LOS PRODUCTOS -->
		<simple-modal
			:open="showModalDeleteFisic"
			@cancel="toggleModalDeleteFisic"
			@confirm="onPermanentlyDelete(null, true)"
			@close="toggleModalDeleteFisic"
		>
			tem
			<span slot="title"
				>¿Está seguro(a) que desea
				<span class="warning_text">eliminar</span> permanentemente todos los productos
				registrados en el sistema?</span
			>
			<span slot="message"
				>Recuerda solo se eliminarán aquellos productos que no cuenten con algún
				movimiento previo, y que, al eliminar los productos, serán
				<b>borrados permanentemente</b> del sistema.</span
			>
		</simple-modal>

		<!-- MODAL ELIMINAR/DESACTIVAR UN SOLO PRODUCTO -->

		<template v-if="currentProduct && currentProduct.flagActive">
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
					producto?</span
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
		<template v-else-if="currentProduct && !currentProduct.flagActive">
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
					producto?</span
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

		<action-sidebar
			title="ESTADOS DE PRODUCTO"
			:width="action.width"
			v-model="showSidebar"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<v-form>
				<v-container class="grid-list-lg">
					<v-layout wrap>
						<v-flex xs8>
							<v-layout row wrap align-center>
								<v-flex xs12>
									<b>Estado actual del producto</b>
									<v-icon :color="getColorStatus()"> radio_button_checked </v-icon>
								</v-flex>

								<v-flex xs12>
									<b>Leyenda</b>
								</v-flex>
								<v-flex xs12>
									<v-icon color="success"> radio_button_checked </v-icon>
									= Producto activo y habilitado
								</v-flex>
								<v-flex xs12>
									<v-icon color="error"> radio_button_checked </v-icon>
									= Producto inactivo y deshabilitado
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex xs8 v-if="!currentProduct.flagActive">
							<span class="primary--text modal-active" @click="openDialog">
								¿Desea habilitar el producto?
							</span>
						</v-flex>
						<v-flex xs8 v-else>
							<span class="error--text modal-active" @click="openDialog">
								¿Desea deshabilitar el producto?
							</span>
						</v-flex>
					</v-layout>
				</v-container>
			</v-form>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
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
import simpleModal from '@/components/field-sale/shared/simple-modal';
import masterProductsList from '@/components/products/master-products-list';
import orderingProducts from '@/components/products/ordering-products';
import loadingProducts from '@/components/products/loading-products';
import productLimitCatalog from '@/components/ecommerce/product-limit-catalog';
import productVariations from '@/components/shared/product/product-variations';
import statusCatalog from '@/components/ecommerce/status-catalog';
import accumPoints from '@/components/products/accum-points';
import viewStock from '@/components/products/view-stock';
import priceChange from '@/components/products/price-change';
import modal from '@/components/field-sale/shared/modal';
import modalLotesSales from '@/components/modal-lotes-sales';
import priceListDetail from '@/components/products/price-list-detail';
import historyProducts from '@/components/products/history-products';

const { removeLocalData } = helper;

async function created() {
	this.params.commerceId = this.commerceId;
	await this.loadCategories();
	await this.loadResources();
	await this.loadFairs();
	await this.loadBrands();
	await this.loadPriceList();
	if (this.commerceId) {
		this.loadCommerceData();
		this.commerceIdP = this.commerceId;
		helper.setLocalData('master-products', []);
	} else {
		removeLocalData('commerce-selected');
	}
	if (this.isWarehouse) {
		this.columns[14].flagVisible = true;
		this.columns[14].visible = false;
		this.columns[14].checked = false;
	}
	this.columns[15].tooltip = this.$userInfo.company.settings.flagKardexValued
		? 'Costo Promedio'
		: 'Ultimo Costo';
	await this.loadFilters();
	await this.loadData();
	this.isCreated = true;
}

function editProduct({ id }) {
	const name =
		this.$route.name === 'master-product'
			? 'edit-master-product'
			: 'edit-master-product-ecommerce-primary';
	const url = {
		name,
		params: {
			id,
			commerceCode: this.commerceCode,
			commerceId: this.commerceId,
			subsidiaryId: this.subsidiaryId,
		},
		query: {
			origin: this.$route.query.origin,
			name: this.$route.query.name,
			filters: JSON.stringify(this.filters),
		},
	};

	// Añadir filtros
	const filt = [
		'categories',
		'brandIds',
		'flagActive',
		'flagAvgCost',
		'flagLotsEnabled',
		'flagFlowManufactured',
		'flagLoyalti',
		'typeId',
		'withStock',
		'withWeight',
		'withOutStock',
		'flagControlSerie',
	];

	filt.forEach((prop) => {
		if (this.params[prop] !== undefined && this.params[prop] !== null) {
			url.query[prop] = this.params[prop];
		}
	});

	if (this.priceListIdTable) {
		url.query.priceListIdTable = this.priceListIdTable;
	}

	this.$router.replace({ query: url.query });
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
		this.showNotification('Los productos fueron asignados a la feria correctamente.');
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
	({
		products: this.masterProducts,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(checked, this.masterProducts, this.dataSelected));
	this.updateDataSelected();
}

function filterQuerys() {
	const filt = [
		'categories',
		'brandIds',
		'flagActive',
		'flagAvgCost',
		'flagLotsEnabled',
		'flagFlowManufactured',
		'flagLoyalti',
		'typeId',
		'withStock',
		'withWeight',
		'withOutStock',
		'flagControlSerie',
	];

	const query = {};

	filt.forEach((prop) => {
		if (this.params[prop] !== undefined && this.params[prop] !== null) {
			query[prop] = this.params[prop];
		}
	});

	if (this.priceListIdTable) {
		query.priceListIdTable = this.priceListIdTable;
	}
	// this.$router.replace({ query });
	return query;
}

function loadFilters() {
	const query = this.$route.query;
	this.priceListIdTable = Number(query.priceListIdTable) || null;

	const filt = [
		'brandIds',
		'flagActive',
		'flagAvgCost',
		'flagLotsEnabled',
		'flagFlowManufactured',
		'flagLoyalti',
		'typeId',
		'withStock',
		'withWeight',
		'withOutStock',
		'flagControlSerie',
	];

	filt.forEach((prop) => {
		if (query[prop] !== undefined && query[prop] !== null) {
			this.params[prop] = Number(query[prop]);
			if (prop === 'flagLoyalti') {
				this.params.flagLoyalti = Boolean(query.flagLoyalti);
			}
		}
	});

	if (query.categories && query.categories.length) {
		this.params.categories = query.categories;
		this.category = query.categories.split(',').map(Number);
	} else {
		this.category = null;
	}
}

// actualizar estado
async function applyAction() {
	this.loading = true;
	const url =
		this.isMibodega && this.commerceId
			? `e-products/${this.currentProduct.id}/active`
			: `v2/products/${this.currentProduct.id}/flag-active`;
	const body =
		this.isMibodega && this.commerceId
			? { isPublic: !this.currentProduct.isPublic }
			: { flagActive: !this.currentProduct.flagActive };
	try {
		await this.$httpProducts.patch(url, body);
		this.showNotification(
			`El estado del producto ${this.currentProduct.name} ha sido actualizado correctamente.`
		);
		this.cancelAction();
		this.loadData(this.currentPage);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function cancelAction() {
	this.currentProduct = {};
	this.dialog = false;
	this.showSidebar = false;
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
	if (this.$route.name !== 'master-product-ecommerce') {
		this.params.relationAdd =
			'category,subCategory,typeInfo,taxes,attributes,brands,brandSimple,unit';
	}
	const filters = this.$route.query.filters || this.$route.query.data;
	if (filters) {
		const filt = JSON.parse(filters);
		this.currentPage = filt.page;
		this.params = filt;
	}
	const params = { ...this.params };
	if (typeof params.flagProductNotInEcommerce === 'number') {
		params.flagProductNotInEcommerce = Boolean(params.flagProductNotInEcommerce);
	} else {
		delete params.flagProductNotInEcommerce;
	}
	[
		'withWeight',
		'withStock',
		'withOutStock',
		'flagControlSerie',
		'flagLotsEnabled',
		'categories',
	].forEach((key) => {
		if (!params[key]) delete params[key];
	});
	delete params.priceListIdTable;
	delete params.priceListId;

	this.filters = params;
	try {
		const { data: masterProducts, headers } = await this.$httpProducts.get(
			'products/master',
			{ params }
		);
		this.lastPage = Number(headers['x-last-page']);
		this.totalItems = Number(headers['x-quantity']);
		this.setMasterProducts(masterProducts);
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
	this.$router.replace({ query: {} });
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
	const status = this.isMibodega && this.commerceId ? item.isPublic : item.flagActive;
	if (this.$route.name === 'master-product-ecommerce') {
		this.productStatusWord = status ? 'No Publico' : 'Publico';
		this.showSidebar = true;
		this.dialogDelete = false;
	} else {
		this.productStatusWord = status ? 'Inactivo' : 'Activo';
		this.showSidebar = true;
	}
	this.dialog = false;
}

function openDialog() {
	this.dialog = true;
}

function getColorStatus() {
	return this.currentProduct.flagActive ? 'success' : 'error';
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
	if (this.isCreated) {
		this.loadData();
	}
}

function tableAction({ item, code }) {
	if (code === 'CF') {
		const categoryByProduct = this.categories.find(
			(category) => category.id === item.categoryId
		);
		if (categoryByProduct.features.length > 0) {
			this.productSelected = item;
			this.action = { ...this.productOptions.find((fa) => fa.code === code) };
		} else {
			this.showNotification(
				'La categoría del producto no cuenta con características.',
				'primary'
			);
		}
	}
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
		newProduct.product.taxes = product.product
			? [...product.product.taxes]
			: [...product.taxes];
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
		this.goTo('new-master-product', {
			query: { data: JSON.stringify(this.filters) },
		});
	}
}

function runAction(item) {
	if (item.code === 'edit-master-product') {
		const id = this.dataSelected[0].id;
		this.editProduct({ id });
		// const name = this.$route.name === 'master-product'
		// ? 'edit-master-product' : 'edit-master-product-ecommerce-primary';
		// const url = {
		// 	name,
		// 	params: {
		// 		id: this.dataSelected[0].id,
		// 		commerceCode: this.commerceCode,
		// 		commerceId: this.commerceId,
		// 		subsidiaryId: this.subsidiaryId,
		// 	},
		// 	query: {
		// 		origin: this.$route.query.origin,
		// 		name: this.$route.query.name,
		// 	},
		// };
		// const routeData = this.$router.resolve(url);
		// window.open(routeData.href, '_blank');
	} else if (item.code === 'delete-all-products') {
		this.toggleModalDeleteFisic();
	} else if (item.codeWeb === 'assign-filters') {
		this.action.code = item.codeWeb;
		this.action.title = 'Asignar Filtros';
		this.action.open = true;
	} else if (item.code === 'change-price') {
		this.action.code = item.code;
		this.action.title = 'Cambiar Precio';
		this.action.open = true;
	} else if (item.code === 'remove-products') {
		this.dialogDelete = true;
	} else if (item.code === 'assign-attributes') {
		this.action.code = item.code;
		this.action.title = item.name;
		this.action.open = true;
	} else if (item.code === 'activate-catalog') {
		this.action.code = item.code;
		this.action.title = 'Activar/Desactivar Productos en Catálogo';
		this.action.open = true;
	} else if (item.code === 'AP') {
		this.action.code = item.code;
		this.action.title = 'Agregar Producto a la Feria';
		if (this.fairs.length > 0) {
			this.idFair = this.fairs[0].id;
		}
		this.action.open = true;
	} else if (
		item.code === 'master-product-create' ||
		item.code === 'master-product-ecommerce-new'
	) {
		this.newMasterProductAction();
	} else if (item.code === 'assign-categories') {
		this.action.code = item.code;
		this.action.title = item.name;
		this.action.open = true;
		this.categoriesSelected = this.dataSelected.reduce((acum, p) => {
			let newAcum = [...acum];
			const ids = p.comCategories.map((c) => c.id);
			const validIds =
				acum.length > 0 ? ids.filter((i) => !acum.find((a) => a === i)) : ids;
			newAcum = newAcum.concat(validIds);
			return newAcum;
		}, []);
	} else if (item.code === 'assign-trades') {
		this.action.code = item.code;
		this.action.title = item.name;
		this.action.open = true;
		this.action.width = 550;
	} else if (item.code === 'product-limit-catalog') {
		this.action.code = item.code;
		this.action.title = 'Cantidad de Productos en Catálogo';
		this.action.open = true;
		this.action.width = 400;
	} else if (item.code === 'accumulate-points') {
		this.action.code = item.code;
		this.action.title = 'ACUMULAR PUNTOS';
		this.action.open = true;
		this.rowsAccum = this.dataSelected;
	} else if (item.code === 'product-ordering') {
		this.action.code = item.code;
		this.action.title = 'Asignar orden a productos';
		this.action.open = true;
		this.action.width = 400;
	} else if (item.code === 'CTS') {
		this.sendConvertToSimple();
	} else if (item.code === 'loading-products') {
		this.action.code = item.code;
		this.action.title = 'Carga de Productos';
		this.action.open = true;
		this.action.width = 600;
	}
}

function closeModalDeleteFisic() {
	this.showModalDeleteFisic = false;
}

function disabledComputed() {
	return [
		{ code: 'edit-master-product', disabled: this.dataSelected.length !== 1 },
		{ code: 'Assign Filters', disabled: this.dataSelected.length < 1 },
		{
			code: 'change-price',
			disabled:
				this.dataSelected.length < 1 ||
				this.$userInfo.company.settings.flagCalculateEarnings,
		},
		{ code: 'remove-products', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-attributes', disabled: this.dataSelected.length === 0 },
		{ code: 'activate-catalog', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-categories', disabled: this.dataSelected.length < 1 },
		{ code: 'AP', disabled: this.dataSelected.length < 1 },
		{ code: 'assign-trades', disabled: this.dataSelected.length < 1 },
		{ code: 'accumulate-points', disabled: this.dataSelected.length < 1 },
		{ code: 'product-ordering', disabled: this.dataSelected.length < 1 },
		{ code: 'delete-all-products', disabled: this.dataSelected.length > 0 },
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
	this.action.code = '';
	this.action.title = '';
	if (this.fairs.length > 1) {
		this.idFair = null;
	}
}

async function loadCategories() {
	const url = this.isMibodega && this.commerceId ? 'e-categories' : 'categories';
	const params =
		this.isMibodega && this.commerceId
			? { commerceId: this.commerceId }
			: { ...this.paramsCategories, flagMain: 1, relationAdd: 'subCategories' };
	const response = await this.$httpProducts.get(url, { params });
	this.categories = response.data;
}

async function loadBrands() {
	const response = await this.$httpProducts.get('brands');
	this.brands = response.data;
}

function setData({ value }) {
	if (typeof value === 'object' && value !== null) {
		const text = this.isMibodega && this.commerceId ? 'eCategories' : 'categoryId';
		this.params[text] = value ? value.id || value.join() || null : null;
		this.loadData();
	}
}

function setDataPriceList(value) {
	if (value) {
		this.priceListIdTable = value;
	}
	this.loadData();
}

function setDataCategorie(value) {
	if (value) {
		this.params.categories = value.join(',');
	}
	this.loadData();
}

function cleanFilter() {
	// Limpiar los inputs
	this.category = [];
	this.params.brandIds = null;
	this.params.categories = [];
	this.params.sortField = null;
	this.params.sortDirection = null;
	this.params.eCategories = null;
	this.params.search = null;
	this.params.typeId = null;
	this.params.flagLoyalti = null;
	this.params.flagActive = 1;
	this.params.priceListIdTable = null;
	this.params.flagProductNotInEcommerce = null;
	this.priceListIdTable = null;
	this.keepParamType = false;
	this.eCategories = [];
	this.isClean = true;
	this.dataSelected = [];
	helper.removeLocalData('master-products');
	helper.removeLocalData('master-products::search');
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

async function deleteAllProducts() {
	this.loadingDelete = true;
	try {
		await this.$httpProducts.delete('products/delete-all');
		this.showNotification('La acción de forma correcta');
		this.dataSelected = [];
		this.loadData();
	} catch (err) {
		console.error(err);
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
				this.showGenericError('Usted no cuenta con permisos para realizar esta acción.');
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
		const validBrand = this.$userInfo.company.settings.flagUseSimpleBrand || false;
		newData.brandNameSimple = m.brandSimple ? m.brandSimple.name : null;
		newData.brandNameGlob = m.brands && m.brands.length > 1 ? m.brands[0].name : '';
		newData.brandName = validBrand ? newData.brandNameSimple : newData.brandNameGlob;
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
			newData.categoriesEcommerce =
				m.comCategories && m.comCategories.length
					? m.comCategories.map((c) => c.title).join()
					: '-';
		}
		if (this.commerceId) {
			const commerceId = Number(this.commerceId);
			const commerce =
				m.commerce &&
				m.commerce.length > 0 &&
				m.commerce.find((c) => c.commerceId === commerceId);
			newData.order = commerce ? commerce.order : null;
		}
		return newData;
	});
	this.matchDataSelected();
}

function commerceIdP(value) {
	if (value) {
		this.columns[12].visible = true;
		this.columns[12].checked = true;
		this.columns[8].visible = true;
		this.columns[8].checked = true;
		this.columns[7].visible = false;
		this.columns[7].checked = false;
		this.columns[13].visible = true;
		this.columns[13].checked = true;
		this.columns[16].visible = true;
		this.columns[16].checked = true;
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
		await this.$httpProducts.patch(`products-parent/${this.productSelected.id}`, body);
		this.showNotification('Las variaciones han sido guardadas correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DUPLICATE_CODE') {
				this.showGenericError('Los códigos esta duplicados en una misma tienda.');
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
		this.variationModel[model] = model !== 'warehouseId' ? Number(value) : value;
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
			this.variationModel[model] = model !== 'warehouseId' ? Number(value) : value;
		}
	}
}

function addVariant() {
	const codeVar = this.variationModel.features.reduce((a, f) => a.concat(f.code), '');
	const descVar = this.variationModel.features.reduce((a, f) => {
		const fIdx = this.variationModel.features.findIndex((vf) => {
			if (vf) {
				return (
					vf.code === f.code && vf.value === f.value && vf.warehouseId === f.warehouseId
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
		[{ data: this.types }, { data: this.warehouses }] = await Promise.all(requests);
		this.variationModel.warehouseId =
			this.warehouses.length === 1 ? this.warehouses[0].id : null;
		this.types = this.types.filter((t) => t.name !== 'Lotes');
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
	if (model === 'flagActive') {
		this.params[model] = value.code;
	} else if (model === 'flagLoyalti') {
		this.params[model] = value === 1;
	} else if (model === 'flagAvgCost') {
		this.params[model] = value.code;
	} else if (model === 'isPublic') {
		this.params[model] = value.isPublic;
	} else if (value) {
		this.params[model] = value;
	}
}

function disabledFilter() {
	return this.filterLoading;
}
// funcion que aplica los filtros
function applyFilter() {
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
	const codeVar = this.variationModel.features.reduce((a, f) => a.concat(f.code), '');
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
		await this.$httpProducts.patch(`products-parent/${this.productSelected.id}`, body);
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
		({ data: this.productsFeatures } = await this.$httpProducts.get('features', {
			params,
		}));
		this.showVariantsSlideLot(row);
	} catch (error) {
		this.showGenericError();
	}
}

function childs(values) {
	this.disabledAdd = values.length === this.oldChilds.length;
}

async function saveTrades(flagActiveEcom, body) {
	this.loadingAssignTrades = true;
	const url = flagActiveEcom ? 'products/active-ecommerce' : 'commerce-company';
	const method = flagActiveEcom ? 'patch' : 'post';

	try {
		await this.$httpProducts[method](url, body);
		this.closeModal();
		this.loadData();
		this.rowsUnSelected();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingAssignTrades = false;
	}
}

async function changeLimitProduct(quantity, id) {
	const body = {
		limitCatalog: Number(quantity),
	};
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/update-catalog`, body);
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
	console.log(row);
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
		({ data: this.productsFeatures } = await this.$httpProducts.get('features', {
			params,
		}));
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
		flagActive: this.params.flagActive === null ? undefined : this.params.flagActive,
		flagLastCost: this.$userInfo.company.settings.flagKardexValued || false,
		commerceId: this.params.commerceId || undefined,
		categories:
			this.params.categories && this.params.categories.length > 0
				? this.params.categories.split(',').map(Number)
				: undefined,
		typeId: this.params.typeId || undefined,
		search: this.params.search || undefined,
		flagLoyalti: this.params.flagLoyalti || undefined,
		withOutStock: this.params.withOutStock || undefined,
		withWeight: this.params.withWeight || undefined,
		withStock: this.params.withStock || undefined,
		flagAvgCost: this.params.flagAvgCost || undefined,
		priceListId: this.priceListIdTable
			? this.priceListIdTable
			: this.$userInfo.company.salPriceListDefault.id,
	};
	this.onEmitExcel(option, originName, params);
}

function downloadProducts(option) {
	const originName = 'listado_products_maestros_detalle_';
	const params = {
		brandIds: this.params.brandIds || undefined,
		flagActive: this.params.flagActive || undefined,
		flagLastCost: this.$userInfo.company.settings.flagKardexValued || false,
		categories:
			this.params.categories && this.params.categories.length > 0
				? this.params.categories.split(',').map(Number)
				: undefined,
		commerceId: this.params.commerceId || undefined,
		typeId: this.params.typeId || undefined,
		search: this.params.search || undefined,
		flagLoyalti: this.params.flagLoyalti || undefined,
		withOutStock: this.params.withOutStock || undefined,
		withWeight: this.params.withWeight || undefined,
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

async function loadHistoryProducts(row) {
	const params = {
		flagRecord: true,
		productId: row.id,
		notStateIn: 3,
	};
	try {
		const response = await this.$httpSales.get('purchase-article-price', {
			params,
		});
		this.rowsHistory = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function openHistoryProducts(row) {
	this.action = {
		open: true,
		code: 'history-products',
		title: `Historial de Compra - ${row.name}`,
		width: 850,
	};
	this.loadHistoryProducts(row);
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
		this.showGenericError('Ya existe un identificador con este código o nombre.');
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
	this.productSelected.features[index].open = !this.productSelected.features[index].open;
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
		this.params.brandIds = value;
	}
	this.loadData();
}

function setDataActive({ model, value }) {
	if (value) {
		this.params[model] = value.code;
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
		width: 640,
	};
	this.productIdSlide = item.id;
	this.stockProduct = item.stock;
	this.brandNameProduct = item.brandSimple ? item.brandSimple.name : '';
}

function viewPriceChange({ id, priceSelected, code }) {
	this.action = {
		open: true,
		code,
		title: 'Cambios de Precio',
		width: 750,
	};
	this.productIdSlide = id;
	this.priceListId = this.priceListIdTable
		? this.priceListIdTable
		: this.$userInfo.company.salPriceListDefault.id;
	this.priceSelected = priceSelected;
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			width: 450,
		},
		priceSelected: 0,
		productIdSlide: null,
		brandNameProduct: '',
		brands: [],
		category: null,
		categories: [],
		categoriesSelected: [],
		checkAll: false,
		childIdx: null,
		childs: [],
		childsNew: [],
		dialogmodalLotes: false,
		lotProduct: {},
		optionsPublic: [
			{
				name: 'Publico',
				isPublic: true,
			},
			{
				name: 'No Publico',
				isPublic: false,
			},
		],
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
				isSortable: { down: true, value: 'code', up: false },
			},
			{
				id: 2,
				name: 'Cod. interno',
				value: 'autoBarcode',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Otros códigos',
				value: 'alternateCode',
				visible: false,
				checked: false,
				// isEditable: true,
				// showInput: false,
			},
			{
				id: 4,
				name: 'T. Prod.',
				tooltip: 'Tipo de Producto',
				value: 'typeInfo',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Atributos',
				value: 'attributes',
				checked: false,
				visible: false,
			},
			{
				id: 6,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
				isSortable: { down: true, value: 'name', up: false },
			},
			{
				id: 7,
				name: 'Imagen',
				value: 'name',
				checked: false,
				visible: false,
			},
			{
				id: 8,
				name: 'Categoría',
				value: 'category.name',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Subcategoría',
				value: 'subcategory',
				checked: false,
				visible: false,
			},
			{
				id: 10,
				name: 'Categoría Ecommerce',
				value: 'category.name',
				checked: false,
				visible: false,
			},
			{
				id: 11,
				name: 'Peso',
				value: 'weigth',
				checked: false,
				visible: false,
			},
			{
				id: 12,
				name: 'Unidad',
				checked: false,
				visible: false,
			},
			{
				id: 13,
				name: 'Descripción',
				value: 'description',
				checked: false,
				visible: false,
			},
			{
				id: 14,
				name: 'Orden',
				value: 'order',
				checked: true,
				visible: true,
			},
			{
				id: 15,
				name: 'P. Dscto.',
				tooltip: 'Precio con Descuento',
				value: 'discount',
				checked: true,
				visible: true,
			},
			{
				id: 16,
				name: 'P. Venta',
				value: 'price',
				tooltip: 'Precio de venta',
				checked: true,
				visible: true,
			},
			{
				id: 17,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
				isSortable: { down: true, value: 'stock', up: false },
			},
			{
				id: 18,
				name: 'Stock Reser.',
				value: 'stockReserved',
				tooltip: 'Stock Reservado',
				checked: false,
				visible: false,
				isSortable: { down: true, value: 'stock_reserved', up: false },
			},
			{
				id: 19,
				name: 'Costo Unitario',
				value: 'lastCost',
				tooltip: '',
				checked: false,
				visible: false,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 20,
				name: 'Precio Costo',
				value: 'lastCost',
				tooltip: 'Precio Unitario + IGV',
				checked: !this.$userInfo.flagNotShowCostPrice,
				visible: !this.$userInfo.flagNotShowCostPrice,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 21,
				name: 'Catálogo',
				value: 'flagShowCatalog',
				checked: false,
				visible: false,
			},
			{
				id: 22,
				name: 'Estados',
				value: 'status',
				checked: true,
				visible: true,
			},
			{
				id: 23,
				name: 'Status CP',
				tooltip: 'Status de Costo Promedio',
				value: 'flagAvgCost',
				checked: false,
				visible: false,
			},
			{
				id: 24,
				name: 'Fecha Crea.',
				tooltip: 'Fecha de Creación',
				value: 'createdAt',
				checked: false,
				visible: false,
			},
			{
				id: 25,
				name: 'Marca',
				value: 'brandName',
				checked: false,
				visible: false,
			},
			{
				id: 26,
				name: 'Util %',
				visible: false,
				checked: false,
				flagVisible:
					this.$userInfo.roleCode !== 'ADMIN' || this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 27,
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
		isCreated: false,
		loading: false,
		loadingChildren: false,
		loadingDelete: false,
		loadingAssignTrades: false,
		loyaltys: [
			{
				id: 1,
				name: 'Acumular Puntos',
			},
		],
		masterProducts: [],
		modalDeleteOne: false,
		params: {
			brandIds: null,
			sortField: null,
			sortDirection: null,
			flagActive: 1,
			categories: null,
			commerceId: 0,
			limit: 20,
			page: 1,
			typeId: null,
			flagLoyalti: null,
			priceListId: null,
			withOutStock: null,
			withStock: null,
			withWeight: null,
			isPublic: null,
			flagProductNotInEcommerce: null,
		},
		optionsEcommerce: [
			{
				code: 0,
				name: 'Productos asignados al comercio',
			},
			{
				code: 1,
				name: 'Productos no asignados al comercio',
			},
		],
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
		showModalDeleteFisic: false,
		showModalDeleteSingle: false,
		showSidebar: false,
		filters: null,
		formattedPriceLists: [],
		rowsHistory: [],
	};
}

export default {
	name: 'master-product',
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
		masterProductsList,
		modalItems,
		orderingProducts,
		productLimitCatalog,
		productVariations,
		statusCatalog,
		viewStock,
		priceChange,
		modal,
		simpleModal,
		modalLotesSales,
		categoriesAutocomplete,
		priceListDetail,
		loadingProducts,
		historyProducts,
	},
	computed: {
		disabledComputed,
		disabledFilter,
		disabledModalAdd,
		totalItemsVisible,
		titleHeader,
		titlePage,
	},
	created,
	data,
	methods: {
		addLotProduct,
		addVariant,
		allSelected,
		applyAction,
		applyFilter,
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
		deleteProducts,
		deleteAllProducts,
		deleteVariations,
		downloadProducts,
		downloadProductMaster,
		editProduct,
		editVariations,
		goToKardex,
		loadBrands,
		loadCategories,
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
		loadHistoryProducts,
		onChangeState,
		onColumnInput,
		openDialogCancel,
		openHistoryProducts,
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
		viewPriceChange,
		filterQuerys,
		loadFilters,
		setDataActive,
		closeModalDeleteFisic,
		openDialog,
		getColorStatus,
		async sendConvertToSimple() {
			const body = {
				state: true,
			};
			try {
				await this.$httpProducts.post('brands/migrate-simple-brand', body);
				this.showNotification(
					'Las marcas compuestas han sido convertidas correctamente a simple.'
				);
				this.loadData();
			} catch (err) {
				this.showGenericError();
			}
		},
		toggleModalDeleteFisic() {
			this.showModalDeleteFisic = !this.showModalDeleteFisic;
		},
		async onPermanentlyDelete(id, all) {
			// WARNING!!!!
			if (!id && all === true) {
				// ELIMINAR FISICO TODOS
				try {
					this.showModalDeleteFisic = false;
					const dataDeleteAll = await this.$httpProducts.delete('/products/delete-all');
					const cantTotalDelete = dataDeleteAll.data.totalDelete;
					this.showNotification(
						`La acción se realizo correctamente, se eliminaron ${cantTotalDelete} producto(s) `
					);
					this.loadData();
				} catch (error) {
					this.showGenericError();
				}
				this.currentProduct = {};
			} else {
				// ELIMINAR SOLO UNO LOGICO
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
				} catch (error) {
					this.showGenericError();
				}
			}
			this.showModalDeleteFisic = false;
			this.showModalDeleteSingle = false;
		},
		toggleModalDeleteSingle() {
			this.showModalDeleteSingle = !this.showModalDeleteSingle;
		},
		deleteSingleProduct(product) {
			this.currentProduct = { ...product };
			// this.modalDeleteOne = true;
			// this.dialogDelete = true;
			this.toggleModalDeleteSingle();
			removeLocalData('master-products');
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
		viewPriceList(row) {
			const { priceList: priceListProduct, conversions } = row;

			this.formattedPriceLists = this.priceLists.map((list) => {
				const details = priceListProduct[list.id] || {};
				return {
					id: list.id,
					name: list.name,
					price: details.price || 0,
					unitPrice: details.unitPrice || 0,
					taxes: details.taxes || 0,
					discount: details.discount || 0,
					ranges: details.ranges || [],
					units: Object.entries(details.units || {}).map(([unitId, unitData]) => ({
						id: unitId,
						name: (conversions[unitId] && conversions[unitId].name) || 'Unidad',
						price: unitData.price || 0,
						unitPrice: unitData.unitPrice || 0,
						taxes: unitData.taxes || 0,
						discount: unitData.discount || 0,
						ranges: unitData.ranges || [],
					})),
				};
			});
			this.action = {
				open: true,
				code: 'price-list-detail',
				title: 'Listas de precio',
				width: 450,
			};
		},
		closeLots() {
			this.dialogmodalLotes = false;
		},
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

.delete-dialog {
	padding: 20px;
}

.card-head {
	padding: 0;
}

.text-small {
	font-size: 11px;
}

.text_delete {
	font-weight: bold;
	font-size: 22px;
}

.warning_text {
	color: red;
}

.footer-dialog {
	background-color: white;
	padding: 16px 0 !important;
}

.modal-active {
	cursor: pointer;
	text-decoration: underline;
}
</style>
