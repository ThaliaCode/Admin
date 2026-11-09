<template>
	<div class="new-sale">
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
			toda la información para ${actionSale}`"
		/>
		<header-page
			column-class="xs12"
			justify-class="justify-start"
			:show-clean="false"
			:show-excel="false"
			:title="saleTitle"
			btns-column="xs10"
			to-show
		>
			<v-flex xs9>
				<header-summary
					class="justify-end"
					:document-name="typePerson && typePerson.documentName"
					:document-number="typePerson && typePerson.documentNumber"
					:name="typePerson && typePerson.fullName"
					:subsidiary="subsidiary && subsidiary.rucName"
				/>
			</v-flex>
			<v-flex xs10>
				<v-layout justify-end align-center class="lh-regular">
					<span v-if="flagPoint">
						<v-layout column align-center>
							<v-flex>
								<label class="caption">Puntos</label>
							</v-flex>
							<v-flex>
								<v-flex class="text-point">{{ pointClient }}</v-flex>
							</v-flex>
						</v-layout>
					</span>
					<span class="px-2 separator-min"> | </span>
					<span v-if="customer && customer.creditLimitationBalance">
						<v-layout column align-center>
							<v-flex>
								<label class="caption">Deuda</label>
							</v-flex>
							<v-flex>
								<p class="body-2 ma-0 mt-1">
									{{ salesCurrencySymbol }}{{ customer.creditLimitationBalance | round }}
								</p>
							</v-flex>
						</v-layout>
					</span>
					<span class="px-2 separator-min"> | </span>
					<span class="ml-2 mr-2">
						<label class="caption">Caja</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text mt-1">
								{{ configInfo.cash.name | limitTo(20) }}
							</p>
							<span>{{ configInfo.cash.name }}</span>
						</v-tooltip>
					</span>
					<!-- <span class="px-2 separator-min"> | </span>
				<span class="mr-2">
					<label class="caption">Saldo</label>
					<p class="body-2 ma-0 mt-1">{{ salesCurrencySymbol }}{{ cashInfo.totalCash | round }}</p>
				</span> -->
					<span class="separator-max"></span>
					<span class="ml-2 mr-2">
						<label class="caption">Vendedor</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text mt-1">
								{{ employee.fullName | limitTo(20) }}
							</p>
							<span>{{ employee.fullName }}</span>
						</v-tooltip>
					</span>
					<span class="separator-max"></span>
					<span class="ml-2">
						<label class="caption">Punto de venta</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text mt-1">
								{{ configInfo.terminal.name | limitTo(20) }}
							</p>
							<span>{{ configInfo.terminal.name }}</span>
						</v-tooltip>
					</span>
					<span class="px-2 separator-min"> | </span>
					<span>
						<label class="caption">Serie</label>
						<p class="body-2 ma-0 mt-1">{{ configInfo.serie.serie }}</p>
					</span>
					<span class="pl-2">
						<label class="caption">Nro</label>
						<p class="body-2 ma-0 mt-1">
							{{ number || configInfo.serie.number }}
						</p>
					</span>
					<span class="px-2 separator-min"> | </span>
					<span>
						<label class="caption">Tipo</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text mt-1">
								{{ configInfo.serie.typeBillingName }}
							</p>
							<span>{{ configInfo.serie.typeBillingTooltip }}</span>
						</v-tooltip>
					</span>
					<span class="px-2 separator-min" v-if="isPeru"> | </span>
					<span v-if="false" class="px-2"> | </span>
					<app-date-select
						v-if="false"
						:date-formatted="startDateFormat"
						model="startDateFormat"
						@input="setDate"
					/>
				</v-layout>
			</v-flex>
		</header-page>
		<app-actions
			:value-disabled="disabledActionBar"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout row wrap pb-5 mb-5>
			<v-flex xs12>
				<general-filter class="back-summary px-0">
					<v-layout>
						<v-flex xs12 pt-2 pb-3>
							<v-layout row align-end>
								<v-flex xs2>
									<div class="content-btn">
										<person-search-input
											ref="customerSearcher"
											ref-value="customerSearcher"
											id="customerSearcher"
											:search-value="selectedCustomer"
											:flagInputEvent="true"
											@search="openSearchCustomer"
										/>
										<button
											:disabled="
												!(typePerson && typePerson.fullName) || customer.flagGeneric === 1
											"
											:class="{
												opacyble:
													!(typePerson && typePerson.fullName) ||
													customer.flagGeneric === 1,
											}"
											class="client_button client_button--info"
											@click="openCustomerModal('customer-details', customer)"
										>
											<v-icon color="white">person</v-icon>
										</button>
									</div>
								</v-flex>
								<v-flex xs2 pl-2 d-flex>
									<div class="content-btn">
										<app-input-text
											disabled
											label="Documento de cliente"
											class="w-100"
											readonly
											:text="document"
										></app-input-text>
										<button
											class="client_button"
											@click="openCustomerModal('customers-new')"
											v-shortkey="['ctrl', 'shift', 'c']"
											@shortkey="openCustomerModal('customers-new')"
										>
											<v-icon id="add-icon" color="white" size="18">add</v-icon>
										</button>
									</div>
								</v-flex>
								<v-flex xs2 px-2 v-if="isPeru" style="max-width: 160px">
									<v-select
										bottom
										single-line
										hide-details
										:items="typeCoin"
										label="Tipo de moneda"
										item-text="code"
										item-value="code"
										class="filter-select"
										content-class="filter-select-content"
										v-model="salesCurrency"
									></v-select>
								</v-flex>
								<v-flex
									v-if="salesCurrency === 'USD' && isPeru"
									xs1
									pr-1
									style="max-width: 120px"
								>
									<div>
										<label class="caption">Tipo de cambio</label>
										<v-text-field
											single-line
											hide-details
											label="00.00"
											type="number"
											v-model.number="exchangeRate"
											@change="validateExchangeRate"
											class="filter-select input-right"
										></v-text-field>
									</div>
								</v-flex>

								<v-flex v-if="salesCurrency === 'USD' && isPeru" xs1 pr-1>
									<button type="button" class="btn-sunat" @click="openSlideTypeChange">
										Ver TC SUNAT
									</button>
								</v-flex>
								<v-flex xs1>
									<v-layout row wrap align-end justify-space-between>
										<template v-for="t in typeDocuments">
											<template>
												<div :key="t.id">
													<template
														v-if="historicalSalesActive && t.documentType.settings"
													>
														<template v-if="t.documentType.settings.subTypes">
															<v-tooltip top>
																<button
																	class="link-document pb-1"
																	:disabled="
																		typeDocumentsSelected !== t.documentType.code
																	"
																	slot="activator"
																	@click="validSubTypes(t.documentType)"
																>
																	Tipos
																</button>
																<span
																	>Haz clic para ver los tipos de
																	{{ t.documentType.name }}</span
																>
															</v-tooltip>
														</template>
													</template>
													<button
														class="btn-document"
														:disabled="
															$route.query.convert === 'ntv' &&
															t.documentType.code === 'NTV'
														"
														:class="{
															active: typeDocumentsSelected === t.documentType.code,
														}"
														@click="selectDocument(t.documentType)"
													>
														{{ t.documentType.code }}
													</button>
												</div>
											</template>
										</template>
									</v-layout>
								</v-flex>
								<v-flex
									xs1
									v-if="
										!customer.flagGeneric &&
										subsidiary.settings.flagDetraction &&
										(typeDocumentsSelected === 'FAC' || typeDocumentsSelected === 'BOL')
									"
								>
									<v-btn
										class="btn-action hu-tw-width mr-2"
										color="primary"
										@click="changeValue"
									>
										Seleccionar detracción
									</v-btn>
								</v-flex>
								<v-flex xs1 class="subtotal-container" v-if="createDetraction.percentage">
									<div>
										<v-icon
											color="info"
											@mouseenter="showInfoDetrac"
											@mouseleave="showInfoDetrac"
											>info</v-icon
										>
										<transition name="fade" mode="out-in">
											<div v-if="showInfo" class="subtotal-menu">
												<div class="subtotal-menu-content">
													<p>
														<span class="taxes-title weight--bold"
															>Información Detracción:</span
														>
													</p>
													<p>
														<span class="taxes-title">Monto Detracción:</span>
														<span>{{ createDetraction.amount | round }}</span>
													</p>
													<p>
														<span class="taxes-title">Porcentaje Detracción:</span>
														<span>{{ createDetraction.percentage }} %</span>
													</p>
													<p>
														<span class="taxes-title">Tipo de Detracción:</span>
														<span>{{ detractionSelect.description }}</span>
													</p>
												</div>
											</div>
										</transition>
									</div>
								</v-flex>
								<v-flex xs1 ml-3 v-if="showTypeOriginOrder">
									<app-select
										label="Origen"
										item-text="name"
										item-value="code"
										model="referenceExternal"
										:item="referenceExternal"
										:items="typeOrigins"
										@input="setOrigin"
									></app-select>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex
							xs1
							pt-2
							pb-3
							v-if="$route.query ? $route.query.convert === 'cot' : false"
						>
							<p class="label-cot mb-0">Nro de Cotización</p>
							<p class="mb-0 text-cot">{{ sale.documentNumber }}</p>
						</v-flex>
						<v-flex
							xs2
							pt-2
							pb-3
							v-else-if="$route.query ? $route.query.convert === 'ntv' : false"
						>
							<p class="label-cot mb-0">Nro de Nota de Venta</p>
							<p class="mb-0 text-cot">{{ sale.documentNumber }}</p>
						</v-flex>
						<v-flex v-if="historicalSalesActive" class="history-back" xs4 px-2 pt-3 pb-3>
							<v-layout wrap row align-end>
								<v-flex xs2 mr-1>
									<app-input-text
										disabled
										label="Serie"
										readonly
										:text="configInfo.serie.serie"
									></app-input-text>
								</v-flex>
								<v-flex xs2 mr-1>
									<app-input-text
										label="Número"
										model="number"
										:text="number"
										@input="setSerieData"
									></app-input-text>
								</v-flex>
								<v-flex xs3>
									<label class="caption">Fecha</label>
									<date-picker
										:disabled-date="disabledHistoricalDate"
										:value="sale.createdAt"
										placeholder="dd/mm/aaaa"
										format="DD/MM/YYYY"
										value-type="YYYY-MM-DD"
										@input="setHistoricalData({ model: 'createdAt', value: $event })"
									>
										<v-icon slot="icon-calendar" size="20" class="success--text"
											>calendar_month</v-icon
										>
									</date-picker>
								</v-flex>
								<v-flex xs3 pl-2>
									<v-btn
										class="btn-action btn-auto pa-2"
										color="primary"
										type="button"
										@click="cancelHistoricalSale"
									>
										Volver a nueva venta
									</v-btn>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</general-filter>
				<!-- <v-layout wrap align-center px-4>
				<transition name="fade" mode="out-in">
					<v-flex
						xs12 sm6 md2 pr-1 mr-5
						class="position"
						v-if="ntvSelected"
					>
						<v-menu
							lazy
							v-model="menu"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								slot="activator"
								label="Fecha de inicio"
								v-model="entryDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="entryDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
				</transition>
			</v-layout> -->
				<v-layout row wrap align-center pr-4 ml-3>
					<v-flex xs2 pb-2 ml-2 v-if="assignedEmployed">
						<app-select
							label="Asignar Empleado"
							item-text="fullname"
							item-value="id"
							:item="employee"
							:items="employees"
							@input="getEmployee"
						/>
					</v-flex>
					<!-- <v-flex xs2 pl-2 pb-2 v-if="flagEditBlockedAcl && $route.query.cloneId">
						<app-select
							label="Origenes"
							item-text="name"
							item-value="code"
							model="referenceExternal"
							:item="referenceExternal"
							:items="typeOrigins"
							@input="setOrigin"
						/>
					</v-flex> -->
					<v-flex
						xs2
						text-xs-right
						ml-2
						pt-2
						v-if="$route.query.convert === 'cot' && showProductsParcials"
					>
						<v-btn
							type="button"
							color="error"
							class="btn-action px-2 white--text btn-full py-2"
							@click.native="deleteProducts"
						>
							Eliminar Productos
						</v-btn>
					</v-flex>
				</v-layout>
				<general-filter class="layout wrap mb-2">
					<v-flex xs2>
						<products-search-input
							ref="productSearcher"
							ref-value="productSearcher"
							id="productSearcher"
							:clean-input="cleanInput"
							:search-value="selectedProduct"
							:flagInputEvent="true"
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs2 ml-2>
						<label class="caption">Lista de Precios</label>
						<v-select
							autocomplete
							bottom
							single-line
							hide-details
							:disabled="!selectedProduct"
							item-text="name"
							item-value="id"
							:items="newProduct.product.pricesListArray"
							v-model="newProduct.selectedPriceListId"
							label="Lista de Precios"
							class="filter-select"
							content-class="filter-select-content"
						>
							<template slot="item" slot-scope="data">
								{{ data.item.name }}
								<span v-if="data.item.price"
									>- Precio: {{ salesCurrency }}{{ data.item.price | round }}</span
								>
							</template>
							<template slot="selection" slot-scope="data">
								<p class="mb-0 text-selection">
									{{ data.item.name }}
									<span v-if="data.item.price" class="price-selection">
										{{ salesCurrency }}{{ data.item.price | round }}
									</span>
								</p>
							</template>
						</v-select>
					</v-flex>
					<v-flex xs3>
						<v-layout row justify-space-between align-end>
							<div class="px-1 w-100">
								<label class="caption">Cantidad</label>
								<v-text-field
									bottom
									single-line
									hide-details
									type="number"
									ref="productQuantity"
									v-model.number="newProduct.quantity"
									label="Cantidad:"
									class="filter-select shadow-inset"
									content-class="filter-select-content"
									@keypress.stop.enter="addProduct"
								></v-text-field>
							</div>
							<div
								class="px-1"
								v-if="
									newProduct.product.product &&
									newProduct.product.product.flagLotsEnabled !== 1
								"
							>
								<button
									class="pl-add-container size min-width w100"
									:disabled="disableAddProduct || !disabledAddLot"
									:class="{
										opacyble:
											(newProduct.product && !newProduct.product.name) ||
											!newProduct.quantity ||
											!newProduct.selectedPriceListId,
									}"
									@click="addProduct"
								>
									<v-icon id="add-icon" color="white">add</v-icon>
								</button>
							</div>
							<div
								class="px-1 w-100"
								v-if="
									newProduct.product.product &&
									newProduct.product.product.flagLotsEnabled === 1
								"
							>
								<button
									type="button"
									class="pl-add-container size min-width w100 caption primary btnAddLote"
									@click="toogleModalLots"
									:disabled="disabledAddLot"
								>
									Seleccionar lote
								</button>
							</div>
						</v-layout>
					</v-flex>
					<v-flex xs3 align-end>
						<v-layout justify-space-around align-end>
							<span class="base-price">Calcular {{ labelsByCountry.taxName }} por: </span>
							<button
								class="btn-document mr-2"
								:class="{ active: basePrice === basePriceComputed.PV }"
								@click="selectBasePrice(basePriceComputed.PV, basePriceComputed.PU)"
							>
								PV
							</button>
							<button
								class="btn-document"
								:class="{ active: basePrice === basePriceComputed.PU }"
								@click="selectBasePrice(basePriceComputed.PU, basePriceComputed.PV)"
							>
								PU
							</button>
						</v-layout>
					</v-flex>
					<v-flex xs1 text-xs-right class="caption">
						<span class="primary--text bold-open">TOTAL:</span>
						{{ salesCurrency }} {{ priceAmounts.total | round }}
					</v-flex>
				</general-filter>
				<v-flex
					xs12
					sm6
					md2
					ml-4
					pt-2
					mb-4
					v-if="flagUseGun && isSaleRole && selectedWarehouse"
				>
					<products-search-input
						ref="productSearcherByGun"
						ref-value="productSearcherByGun"
						id="productSearcherByGun"
						labelSearching="Busqueda por codigo (lector de barras)"
						:clean-input="cleanInput"
						:search-value="selectedProduct"
						:flagInputEvent="true"
						:used-gun="flagUseGun"
						@input="gettingCode"
					/>
				</v-flex>
				<div v-if="totalAdvanceInvoice > 0" class="carrillo-advance-invoice px-5">
					<div>
						<h5>Total anticipado:</h5>
						<output class="mx-2"
							>{{ salesCurrency }} {{ totalAdvanceInvoice | round }}</output
						>
					</div>
				</div>
				<app-table
					class="mb-0"
					name="new-sale"
					selectable
					local-storage
					:total-quantity="quantityTotal"
					:input-search="false"
					:columns="computedColumns"
					:current-page="currentPage"
					:rows="data"
					:check-all="checkAll"
					:key-value="keyValue"
					:last-page="lastPage"
					:items-quantity="data.length"
					:items-total-quantity="data.length"
					@show-list="showList"
					@on-toggle-columns="toggleColumns"
					@on-page="changePage"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					@column-input="changeDiscountAllRows"
				>
					<template slot="rows" slot-scope="props">
						<td tabindex="-1" v-show="showRow(columns, 1)">
							{{ props.row.autoBarcode }}
						</td>
						<td tabindex="-1" v-show="showRow(columns, 2)">
							{{ props.row.warehouseName }}
						</td>
						<td tabindex="-1" v-show="showRow(columns, 3)">
							{{ props.row.code }}
						</td>
						<td tabindex="-1" v-show="showRow(columns, 4)">
							{{ props.row.name }}
						</td>
						<td tabindex="-1" v-show="showRow(columns, 5)">
							{{ props.row.description }}
						</td>
						<td v-show="showRow(columns, 6)">
							<div style="padding: 5px">
								<v-select
									autocomplete
									bottom
									single-line
									hide-details
									:items="props.row.pricesListArray"
									v-model="props.row.selectedPriceListId"
									label="Lista de Precios"
									item-text="name"
									item-value="id"
									class="filter-select"
									content-class="filter-select-content"
									@click.stop="stopClick"
									@input="updatePriceList(props.row)"
								></v-select>
							</div>
						</td>
						<td tabindex="-1" v-show="showRow(columns, 7)">
							<v-text-field
								hide-details
								single-line
								type="number"
								v-model.number="props.row.parts"
								class="filter-select input-max-width"
								@click.stop="stopClick"
								v-on:input="setDynamic(props.row, $event, props.index, 'parts')"
							></v-text-field>
						</td>
						<td tabindex="-1" v-show="showRow(columns, 8)">
							<v-text-field
								hide-details
								single-line
								type="number"
								v-model.number="props.row.meterage"
								class="filter-select input-max-width"
								@click.stop="stopClick"
								v-on:input="setDynamic(props.row, $event, props.index, 'meterage')"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 9)">
							<template v-if="!showColumnsDocuments">
								<v-text-field
									hide-details
									single-line
									type="number"
									class="filter-select shadow-inset input-max-width"
									:ref="`quantity${props.index}`"
									:readonly="!!orderId"
									:id="`input-quantity-sale-${props.index}`"
									v-model.number="props.row.quantity"
									:disabled="
										!!props.row.flagFree ||
										showConvertDocument ||
										Boolean(props.row.sumSeries)
									"
									@input="quantityValidation(props.row, $event, props.index)"
									@click.stop="stopClick"
									@keyup.enter="nextInputFocused('quantity', props.index)"
								></v-text-field>
							</template>
							<template v-else>
								{{ props.row.quantity }}
							</template>
						</td>
						<td v-show="showRow(columns, 10)" class="weight-width">
							<app-input-text
								:disabled="false"
								type="number"
								model="weightProduct"
								:text="props.row.weightProduct"
								@input="weightProduct(props.index, $event)"
							/>
						</td>
						<td v-show="showRow(columns, 11)">{{ props.row.quantitySend }}</td>
						<td class="prices-width" v-show="showRow(columns, 12)">
							<template v-if="flagUpdatePrice">
								<v-text-field
									hide-details
									single-line
									type="number"
									class="filter-select shadow-inset input-max-width"
									:ref="`unitaryPrice${props.index}`"
									v-model.number="props.row.priceUnitary"
									:disabled="!flagUpdatePrice || showConvertDocument"
									@click.stop="stopClick"
									@change="editPriceUnitary(props.row, props.index, $event)"
									@keyup.enter="nextInputFocused('unitaryPrice', props.index)"
								></v-text-field>
							</template>
							<template v-else>
								{{ props.row.priceUnitary }}
							</template>
						</td>
						<td class="prices-width-sale" v-show="showRow(columns, 13)">
							<template v-if="flagUpdatePrice">
								<v-tooltip top :disabled="!validateInput(props.row)">
									<app-input-text
										slot="activator"
										@click.stop="stopClick"
										:readonly="!!orderId"
										:ref="`salePrice${props.index}`"
										type="number"
										model="pricePerSale"
										:text="props.row.pricePerSale"
										@change="editPricePerSale(props.row, props.index, $event, isPeru)"
									/>
									<span>Precio minimo {{ props.row.priceSaleMin }}</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ props.row.pricePerSale | round(4) }}
							</template>
						</td>
						<td v-show="showRow(columns, 14)" @click.stop="stopClick">
							{{ props.row.cost | round }}
						</td>
						<td v-show="showRow(columns, 15)" @click.stop="stopClick">
							<v-select
								bottom
								single-line
								hide-details
								:items="props.row.units"
								item-value="id"
								item-text="name"
								:key="props.row.units.id"
								v-model.number="props.row.unitId"
								class="filter-select"
								content-class="filter-select-content"
								return-object
								@input="setData('unitId', $event, props.row, true, props.index)"
							>
								<template slot="item" slot-scope="data">
									<div class="d-flex flex-row justify-space-between" style="width: 100%">
										<span> {{ data.item.name }} {{ ' - ' }}</span>
										<span>
											{{ salesCurrency }}
											{{ getPriceConfiguratedByUnit(props.row, data.item) }}
										</span>
									</div>
								</template>
								<template slot="selection" slot-scope="data">
									<p class="mb-0 text-selection d-flex flex-row justify-space-between">
										<span> {{ data.item.name }} {{ ' - ' }} </span>
										<span class="price-selection ml-1">
											{{ salesCurrency }}
											{{ getPriceConfiguratedByUnit(props.row, data.item) }}
										</span>
									</p>
								</template>
							</v-select>
						</td>
						<td v-show="showRow(columns, 16)">
							{{ props.row.inlineFeatures }}
						</td>
						<td v-show="showRow(columns, 17)">
							{{ props.row.brandName }}
						</td>
						<td v-show="showRow(columns, 18)" class="width-attributes">
							{{ getAttributes(props.row) }}
						</td>
						<td tabindex="-1" v-show="showRow(columns, 19)">
							{{ getStockDinamic(props.row) }}
						</td>
						<td
							v-show="showRow(columns, 20)"
							:class="{
								'style-min-stock':
									props.row.stock <= props.row.minStock && !negativeStockAllowed,
							}"
						>
							<v-tooltip
								top
								v-if="props.row.stock <= props.row.minStock && !negativeStockAllowed"
							>
								<span slot="activator">
									{{ props.row.minStock }}
								</span>
								<span>Debajo del stock mínimo</span>
							</v-tooltip>
							<span v-else>
								{{ props.row.minStock }}
							</span>
						</td>
						<td v-show="showRow(columns, 21)" class="width-percentage">
							<v-text-field
								class="filter-select"
								type="number"
								:ref="`discount${props.index}`"
								:readonly="showConvertDocument"
								:disabled="
									!!props.row.flagFree || !!props.row.productPoint || !singleDiscount
								"
								:value="props.row.discountPercentage"
								:maxlength="7"
								step="0.0001"
								inputmode="decimal"
								@input="editDiscount(props.row, props.index, $event)"
							>
							</v-text-field>
						</td>
						<td v-show="showRow(columns, 22)">{{ props.row.taxes }}</td>
						<td v-show="showRow(columns, 23)">
							{{ getTaxesAmount(props.row) }}
						</td>
						<!-- <td v-show="showRow(columns, 24)">
							{{ (props.row.unitQuantity * props.row.totalCost) | round }}
						</td> -->
						<td v-show="showRow(columns, 25)">{{ props.row.total | round }}</td>
						<td v-show="showRow(columns, 26)">{{ props.row.location }}</td>
						<td v-show="showRow(columns, 27)">
							<app-tooltip-button
								v-if="productError(props.row)"
								height="22"
								color="pink"
								icon="error"
								:text="productError(props.row)"
							/>
							<app-tooltip-button
								:disabled="!props.row.attributeList || props.row.quantity < 0"
								height="18"
								color="secondary"
								icon="task_alt"
								:text="labelAttributes(props.row)"
								@click-icon="openModalAssign(props.row, props.index)"
							/>
							<span v-if="props.row.isComposed">
								<app-tooltip-button
									v-if="props.row.isSalable"
									height="14"
									color="primary"
									icon="warning"
									text="Producto Compuesto"
								/>
								<app-tooltip-button
									v-else
									height="14"
									color="error"
									icon="error"
									text="Producto Compuesto"
									@click-icon="openComposedModal"
								/>
							</span>
							<app-tooltip-button
								v-if="
									props.row.product
										? props.row.product.flagControlSerie
										: props.row.flagControlSerie
								"
								img="/static/img/icons/barcode.svg"
								:height="25"
								text="Control de series"
								@click-icon="openSeries(props.row)"
							/>
							<app-tooltip-button
								height="18"
								color="primary"
								icon="comment"
								text="Agregar comentario"
								@click-icon="makeProductCommentary(props.row, props.index)"
							/>
							<v-tooltip top>
								<button
									v-if="showBtnLoyalti && showFlagLoyalti"
									:disabled="pointClient === null || props.row.disabledExchange"
									@click="openDialogPoint(props.row)"
									type="button"
									slot="activator"
									class="table-icon"
								>
									<img src="/static/img/exchange.svg" alt="icono-puntos" />
								</button>
								<span>Canjear Puntos</span>
							</v-tooltip>
							<app-tooltip-button
								class="mr-2"
								text="Eliminar"
								color="pink"
								icon="delete"
								@click-icon="warningModal(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>

				<v-layout row wrap px-4 py-1>
					<v-flex xs12 class="totals-section d-flex text-xs-center">
						<!-- <v-flex class="subtotal-container">
						<div class="subtotal">
							<span>Otros cargos: </span>
							<span>{{salesCurrency}} {{valueCharge}}</span>
							<button
								type="button"
								class="btn-totals-sale"
								@click="toggleSelect('charge')"
							>
								<v-icon v-if="selectsTotal[0].select" color="info">remove</v-icon>
								<v-icon v-else color="info">add</v-icon>
							</button>
						</div>
						<transition name="fade" mode="out-in">
							<div class="container-total" v-if="selectsTotal[0].select">
								<div class="subtotal-menu-content">
									<v-radio-group v-model="selectCharges">
										<v-radio
											v-for="(charge, index) in otherCharges"
											:key="index"
											:label="charge.name"
											:value="charge.value"
										></v-radio>
									</v-radio-group>
									<v-text-field
										hide-details
										single-line
										type="number"
										:prefix="selectCharges === 'currency' ? countryCurrencySymbol : null"
										:suffix="selectCharges === 'percent' ? '%' : null"
										v-model.number="quantityCharge"
										class="filter-select shadow-inset"
									></v-text-field>
								</div>
							</div>
						</transition>
					</v-flex> -->
						<v-flex class="subtotal">
							<span>Desc.: </span>
							<span>{{ salesCurrency }} {{ priceAmounts.totalDiscount | round }}</span>
						</v-flex>
						<v-flex class="subtotal" v-if="totalAmountCoupon">
							<span>Desct. Global: </span>
							<span>{{ defaultCurrency }} {{ priceAmounts.coupons | round }}</span>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>Total Cant: </span>
								<span>{{ quantityTotal }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('total')"
								>
									<v-icon v-if="selectsTotal[1].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="container-charges" v-if="selectsTotal[1].select">
									<div class="subtotal-menu-content">
										<p v-for="(value, name, index) in resumeTotalUnits" :key="index">
											<span class="taxes-title">{{ name }}</span>
											<span>{{ value }}</span>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal-container" v-if="isPeru">
							<div class="subtotal">
								<span>IMP.: </span>
								<span>{{ salesCurrency }} {{ priceAmounts.icbper | round }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('imp')"
								>
									<v-icon v-if="selectsTotal[2].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="container-other-taxes" v-if="selectsTotal[2].select">
									<div class="subtotal-menu-content">
										<p>
											<span class="taxes-title">Imp. Bolsa plástica: </span>
											<span>{{ salesCurrency }} {{ priceAmounts.icbper | round }}</span>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal" v-if="isPeru && allowProductFree">
							<span>Gratuito: </span>
							<span>{{ salesCurrency }} {{ priceAmounts.free | round }}</span>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>SubT.: </span>
								<span>{{ salesCurrency }} {{ priceAmounts.subtotal | round }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('sub')"
								>
									<v-icon v-if="selectsTotal[3].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="subtotal-menu" v-if="selectsTotal[3].select">
									<div class="subtotal-menu-content">
										<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
											<span class="taxes-title">{{ tax.description }}</span>
											<span>{{ salesCurrency }} {{ resumeTaxes[tax.code] }}</span>
										</p>
										<small>Nota: Montos incluyen descuentos</small>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>{{ labelsByCountry.taxName }}: </span>
								<span>{{ salesCurrency }} {{ priceAmounts.tax | round }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('igv')"
								>
									<v-icon v-if="selectsTotal[4].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="container-taxes" v-if="selectsTotal[4].select">
									<div class="subtotal-menu-content">
										<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
											<span class="taxes-title">{{ tax.description }}</span>
											<span
												>{{ salesCurrency }} {{ resumeTaxesList[tax.code] | round }}</span
											>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex>
							<span>Total: </span>
							<span>{{ salesCurrency }} {{ priceAmounts.total | round }}</span>
						</v-flex>
					</v-flex>
				</v-layout>
				<v-layout row py-2 pl-4>
					<v-flex align-center>
						<v-btn
							flat
							depressed
							small
							@click="openSliderModal('AC', 'Consideraciones', 550)"
						>
							<span>Consideraciones</span>
						</v-btn>
						<span>|</span>
						<v-btn flat @click="openSliderModal('AI', 'Tareas')">
							<span>Tareas</span>
						</v-btn>
						<span v-if="sale.dataClient">|</span>
						<v-btn
							v-if="sale.dataClient"
							flat
							@click="openSliderModal('DC', 'Datos de Cotización')"
						>
							<span>Datos de Cotización</span>
						</v-btn>
						<span v-if="showAdditionalInfomatioSales">|</span>
						<v-btn
							flat
							v-if="showAdditionalInfomatioSales"
							@click="openSliderModal('DG', 'Datos de Guía')"
						>
							<span>Datos de Guía</span>
						</v-btn>
						<span>|</span>
						<v-btn flat @click="openSliderModal('DA', 'Datos Adicionales')">
							<span>Adicionales</span>
						</v-btn>
					</v-flex>
				</v-layout>
				<v-layout wrap justify-center px-4>
					<v-flex xs12>
						<v-text-field
							no-resize
							multi-line
							single-line
							class="textarea-content filter-select shadow-inset"
							name="new-product-description"
							label="Comentario"
							v-model="commentary"
						></v-text-field>
					</v-flex>
				</v-layout>
				<v-layout class="section-options" mt-4 py-2 px-4>
					<v-flex xs2 v-if="isPeru && this.$userInfo.company.settings.flagAdvanceOnSale">
						<v-checkbox
							color="primary"
							hide-details
							label="Factura por anticipo"
							:disabled="!paymentInvoiceSelect"
							v-model="paymentInvoice"
						></v-checkbox>
					</v-flex>
					<v-flex xs2 v-if="!orderId && showAutoDispatch">
						<v-checkbox
							color="primary"
							hide-details
							label="Despachar Producto"
							v-model="shipProduct"
						></v-checkbox>
					</v-flex>
				</v-layout>
				<v-layout class="section-options" mt-4 py-2 px-4>
					<v-flex xs12>
						<button class="keyboard-button-activator" @click="openkeyBoardShorcut">
							Atajos de teclado
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<button
				class="hidden-button-to-open-payment-modal"
				type="button"
				v-shortkey="['ctrl', 'shift', 'p']"
				@shortkey="openPaymentModalByKeyBoard"
			>
				Abrir modal de pago
			</button>
			<modal-sidebar-button
				:img="false"
				:is-loading="
					$v.$invalid ||
					negative ||
					blockedCustomer ||
					isLoading ||
					valueTotalData ||
					disabledMaxProduct ||
					exceededPorcentage ||
					showDuplicateUnit ||
					isDisabledPrice ||
					detailsSaleHasError
				"
				success-color="primary"
				success-text="Cobrar"
				@cancel-button-clicked="cancelSale"
				@accept-button-clicked="collectSale"
			>
				<btn-average-cost
					v-if="isFlagKardexValued && false"
					slot="btn-end"
					class="ml-1"
					:disabled-btn="data.length === 0"
					:products="data"
					:code-module="codeSale"
				/>
			</modal-sidebar-button>
		</section>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<type-change-form
				v-if="action.code === 'TC'"
				:year="filtersChange.year"
				:month="filtersChange.month"
				:day="filtersChange.day"
				:rows="rowsTypeChange"
				@close-modal="closeModal"
				@set-date="setDateType"
				@add-type="addType"
			/>
			<modal-attributes-assign
				:show-atributte="showAtribute"
				:quantity="quantityDetail"
				:quantity-product="quantityProduct"
				:list-sections="arrayNew"
				:name-product="nameProduct"
				@close-modal="closeModal"
				@save-modal="saveModalAttributes"
				v-if="action.code === 'AA'"
			/>
			<guide-data
				v-if="action.code === 'DG'"
				:show-notification="showNotificationQ"
				:additional-information="additionalGuide"
				@close="closeModal"
				@save-data-form="saveDataForm"
			/>
			<customers-form
				v-if="customerRegisterSelected"
				v-shortkey="['ctrl', 'space']"
				@shortkey.native="closeModal"
				fast-form
				:is-loading="loadingCustomer"
				:model-data="customer"
				@cancel="closeModal"
				@save="saveCustomer"
				@response="responseCustomer"
			/>
			<pay-products-point
				:columns="columnsProductsPoint"
				:rows="rowsProductsPoint"
				:last-page="lastPagePoint"
				:current-page="currentPagePoint"
				:total-items="totalItemsPoint"
				:check-all="checkAllPoint"
				v-if="productsPoint"
				:is-loading="!this.dataSelectedPoint.length"
				@change-page="changePagePoint"
				@row-is-selected="rowIsSelectedPoint"
				@search-event="searchEventPoint"
				@all-selected="allSelectedProductsPoint"
				@close-modal="closeModal"
				@save-products-point="addProduct"
			/>
			<customer-resume
				v-if="customerDetailsSelected"
				:select-address="customer.addressLine1"
				:customer="currentCustomer"
				@select-address="updateCustomerResumeAddress"
				@close-modal="closeModal"
			/>
			<payment-mode
				v-if="paymentModeSelected"
				v-shortkey="['ctrl', 'space']"
				@shortkey.native="closeModal"
				:loading-img="loadingImg"
				:cost-shipping="sale.costShipping"
				:merchant-id="hasCostShippingProp"
				:get-sale="saleInAction"
				:amount-sale="roundTotalPrice"
				:customer="customer"
				:sales-currency="salesCurrency"
				:customer-generic="!!customer.flagGeneric && isEcuador"
				:show-cash="showCash"
				:flag-subsidiary="flagWithholdingSubsidiary"
				:withholding-sale="withholdingSaleFlag"
				:percentage-with="percentageWithholding"
				:show-emit-alert="showEmitAlert"
				:total-advance="totalAdvanceInvoice"
				:detraction="createDetraction"
				@disabled-limit="disabledLimit"
				@disabled-button="disabledPay"
				@make-sale="checkAverageCost"
				@fee-error="feeErrors"
				@not-sale="disabledBtnSale"
				@set-payment="setPayment"
				@add-percentage="addPercentage"
				@remove-percentage="removePercentage"
				@valid-withholding="validWithholding"
				@update-loading="updateLoading"
			/>
			<fast-register
				action-code="product-register"
				v-if="action.code === 'product-register'"
				@cancel-modal="productSaved"
			/>
			<products-search-form
				v-if="isProductSearcher"
				:search-value="searchVal"
				:show-free="allowProductFree"
				@add-product="setProduct"
				is-sale
			/>
			<app-commentaries-lotes
				show-additional
				v-if="isCommentary && currentProduct.product.flagLotsEnabled"
				:product="currentProduct"
				:disabledEdit="true"
				:disabledEditCommentary="false"
				@set-add="setComentaryLot"
				@close-modal="closeModal"
			/>
			<app-commentaries
				show-additional
				v-if="isCommentary && !currentProduct.product.flagLotsEnabled"
				:product="currentProduct"
				@set-add="setComentary"
				@close-modal="closeModal"
			/>
			<app-considerations
				v-if="action.code === 'AC'"
				:new-consideration="newConsideration"
				:data="considerations"
				@add-considerations="addConsiderations"
			/>
			<app-issues
				v-if="action.code === 'AI'"
				:new-issue="newIssue"
				:data="workToDo"
				@add-issues="addIssues"
			/>
			<sales-series
				v-if="action.code === 'sales-series'"
				:quantity="quantitySeries"
				:product="productSelectedSerie"
				@close-modal="closeModal"
				@send-series="sendSeries"
			/>
			<selling-points
				v-if="isAction('selling-points', 'historical-sales')"
				:subsidiary-id="subsidiaryIdModal"
				:type-document-id="idTypeDocumentSelect"
				:serie="configInfo.serie"
				:subsidiaries="subsidiaries"
				@close="closeModal"
				@save-point="savePoint"
			/>
			<change-box v-if="action.code === 'CB'" :cash="cash" @close="changeCash" />
			<assign-seller
				v-if="action.code === 'assign-seller'"
				@change-employee="changeEmployee"
			/>
			<app-data-quote
				v-if="action.code === 'DC'"
				:data-form="dataForm"
				:data-payment="dataPayment"
				:data-fac="dataFac"
				:url-voucher="urlVoucher"
				@close-modal="closeModal"
			/>
			<app-information-additional
				v-if="action.code === 'DA'"
				:show-invalid="showInvalid"
				:amount-sale="priceAmounts.total"
				:show-loading="isLoadingAdi"
				:information-data="informationSale"
				:show-guide-option="typeDocumentsSelected === 'FAC'"
				show
				@set-input="setInputAdditional"
				@cancel="closeModal"
				@save-modal="saveModalAdditional"
			/>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					v-if="
						action.code !== 'product-register' &&
						action.code !== 'DA' &&
						action.code !== 'products-point' &&
						action.code !== 'product-searcher' &&
						action.code !== 'customers-new' &&
						action.code !== 'COMME' &&
						action.code !== 'selling-points' &&
						action.code !== 'relate-advance-documents' &&
						action.code !== 'sales-series' &&
						action.code !== 'CB' &&
						action.code !== 'historical-sales' &&
						action.code !== 'DC' &&
						action.code !== 'DG' &&
						action.code !== 'AA' &&
						action.code !== 'customer-details' &&
						action.code !== 'customer-searcher'
					"
					:is-loading="disabledBtnPaySale"
					success-color="primary"
					v-shortkey="['ctrl', 'shift', 'v']"
					@shortkey.native="generateSaleByKeyBoard"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveData"
				/>
			</section>
			<advance-invoice
				v-if="action.code === 'relate-advance-documents'"
				:customer-id="customer.id"
				:units="units"
				@close="closeModal"
				@save="updateData"
			/>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				@add-person="(p) => setCustomer(p, false, true)"
			/>
		</action-sidebar>
		<v-dialog persistent v-model="viewModalLots" max-width="600px">
			<modal-lotes-sales
				v-if="viewModalLots"
				:product-data="newProduct.product"
				:quantity="newProduct.quantity"
				@set-quantity="setQuantity"
				@close-modal-lotes="toogleModalLots"
				@confirm-modal-lotes="addProductWithLot"
			/>
		</v-dialog>
		<v-dialog v-model="removeProduct" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">
							¿Está seguro que desea <b>ELIMINAR</b> este producto?:
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h4 class="text-xs-center">Producto:</h4>
						<h3 class="text-xs-center">
							{{ productToRemove.name }} ({{ productToRemove.code }})
						</h3>
					</v-layout>
				</v-card-text>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">
							Esta acción eliminará este producto del documento de venta y no se podrá
							deshacer
						</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions class="footer-dialog-point">
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="removeProduct = false"
							color="pink"
							class="btn-action mr-1"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="primary"
							@click="removeItem"
							class="btn-action ml-1"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog persistent max-width="600" v-model="dialogPoint">
			<v-card>
				<v-card-title class="header-c">
					<v-layout>
						<v-flex xs11> CANJE DE PUNTOS </v-flex>
						<v-flex xs1>
							<button class="boton-x" type="button" @click="closeDialogPoint">x</button>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-title class="header-dialog-sale"> </v-card-title>
				<v-card-text class="content-dialog">
					<v-layout>
						<v-flex> Puntos totales acumulados: {{ pointClientDialog }} </v-flex>
					</v-layout>
					<v-layout>
						<v-flex>
							<v-layout column>
								<v-flex>
									<label class="label-dialog">Nombre del producto:</label>
								</v-flex>
								<v-flex class="text-dialog">
									{{ nameProduct }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex>
							<v-layout column>
								<v-flex>
									<label class="label-dialog">Precio de venta:</label>
								</v-flex>
								<v-flex class="ft-14">
									{{ countryCurrencySymbol }} {{ totalProduct | round }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex class="sign">
							<v-layout column> = </v-layout>
						</v-flex>
						<v-flex>
							<v-layout column>
								<v-flex>
									<label class="label-dialog">Equivalente a:</label>
								</v-flex>
								<v-flex class="ft-14"> {{ scoreProduct || 0 }} puntos </v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-text class="a-p"> Aplicar puntos: </v-card-text>
				<v-card-text>
					<v-layout row justify-start>
						<v-flex xs5 class="content-dialog-green">
							<v-layout align-start column>
								<label class="fs-cant">Cantidad de Puntos</label>
								<v-flex>
									<app-input-text
										model="point"
										type="number"
										:text="loyalty.point"
										@input="setPoint"
									></app-input-text>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex class="sign"> > </v-flex>
						<v-flex ml-3>
							<v-layout column>
								<v-flex class="fs-small">Dscto. a aplicar</v-flex>
								<v-flex class="bold-open">
									{{ countryCurrencySymbol }} {{ discountPoint }}
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex class="messagePoints py-3 px-4">
							<span class="mt-1">
								{{ messageErrorPoints }}
							</span>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions class="justify-center footer-dialog">
					<v-btn class="modal-items-btn--cancel" @click="closeDialogPoint">
						CANCELAR
					</v-btn>
					<v-btn
						:disabled="disabledSavePoints"
						class="modal-items-btn"
						@click="saveDialogPoint"
					>
						ACEPTAR
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showSubTypes" max-width="425" persistent>
			<v-card>
				<v-card-title class="headline justify-center">
					Tipos de {{ documentSelected.name }}:
				</v-card-title>
				<v-card-text class="py-0">
					<v-layout v-for="(type, keyType) in subTypes" :key="keyType" row wrap>
						<v-checkbox
							class="subtext subtype-checkbox"
							color="success"
							hide-details
							:label="type.name"
							v-model="subTypes[keyType].isSelected"
						></v-checkbox>
					</v-layout>
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-action white--text"
							type="button"
							@click.native="subTypesSelection('cancel')"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="success"
							class="btn-action white--text"
							type="button"
							@click.native="subTypesSelection('save')"
						>
							Aceptar
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showErrorAverage" persistent max-width="400px">
			<modal-items
				v-if="showErrorAverage"
				name-action="Seguir con la venta"
				name-cancel="Cerrar"
				show-slot
				title="Costo Promedio"
				@close-modal="closeModalAverage"
				@action-modal="loadMakeSale"
			>
				<div class="pa-3">
					<p>Los siguientes productos tienen un precio por debajo del costo promedio:</p>
					<p class="pl-1 mb-1" v-for="item in sendProducts" :key="item.productId">
						- {{ item.productName }}
					</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="modal.open" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ modal.message }}
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							{{ modal.btnText }}
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="openKeyMap" max-width="400px">
			<v-card>
				<v-card-text>
					<ul class="px-5">
						<li class="py-2"><b>ctrl + shift + p</b>: Abrir modal para pago</li>
						<li class="py-2"><b>ctrl + space</b>: Cerrar modal lateral</li>
						<li class="py-2"><b>ctrl + shift + c</b>: Abrir modal Nuevo cliente</li>
						<li class="py-2"><b>ctrl + shift + v</b>: Generar venta</li>
					</ul>
				</v-card-text>
				<v-card-actions class="footer-dialog-point">
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							color="pink"
							class="btn-action mr-1"
							@click="openKeyMap = false"
						>
							Cerrar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog persistent max-width="550" v-model="modalCondicion">
			<v-card class="delete-dialog">
				<v-card-text class="card-head">
					<span class="center-modal"
						>¿Está seguro(a) que desea registrar a este cliente?</span
					>
				</v-card-text>
				<v-card-text class="center-modal">
					Este cliente es <b>NO HABIDO</b>.
				</v-card-text>
				<v-card-actions class="justify-center footer-dialog">
					<v-btn class="modal-items-btn--cancel" @click="closeModalCondicion">
						CANCELAR
					</v-btn>
					<v-btn class="modal-items-btn--cancel" @click="saveCustomer(objectCustomer)">
						ACEPTAR
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showNotifySaleModal" persistent max-width="400px">
			<modal-items
				v-if="showNotifySaleModal"
				name-action="Seguir con la nueva venta"
				name-cancel="Cancelar"
				show-slot
				title="Precio de Venta es mayor al Precio de Costo"
				@close-modal="closeModalNotify"
				@action-modal="validToCreate"
			>
				<div class="pa-3">
					<p>
						Los siguientes productos tienen un precio venta por debajo del precio de
						costo, desea continuar con la venta:
					</p>
					<p class="pl-1 mb-1" v-for="(item, index) in productsAddCost" :key="index">
						- {{ item.name }}
					</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showPriceList" persistent max-width="430px">
			<modal-items
				v-if="showPriceList"
				name-action="Asignar"
				name-cancel="Cancelar"
				show-slot
				title="Asignar Lista de Precio"
				@close-modal="closeModalList"
				@action-modal="assignPriceList"
			>
				<div class="pa-3">
					<p>* Se cambiara la lista de precio, a los productos que estan relacionado.</p>
					<app-select
						:item="priceListGlobal"
						label="Seleccione Lista de Precio"
						item-text="name"
						item-value="id"
						:items="pricesList"
						model="priceListGlobal"
						@input="setPriceListGlobal"
					/>
				</div>
			</modal-items>
		</v-dialog>
		<modal-detraction
			v-model="showDetraction"
			:detraction="createDetraction"
			:total-amount="priceAmounts.total"
			@accept="saveDetraction"
			@cancel="clearDetraction"
		/>
		<v-dialog v-model="modalStockError" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">Productos que no cuentan con stock suficiente</span>
				</v-card-title>
				<span class="mesage-error ml-4">{{ modalMessage }}</span>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="products-witchout-stock"
					:inputSearch="false"
					:filterColumns="false"
					:rows="detailsErrorStock"
					:selectable="false"
					:show-pagination="true"
					:columns="columnsStock"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name || '-' }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.stock }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.warehouseName || '-' }}
						</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="modalStockError = false"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<app-show-dialog
			:color-dialog="notification.colorDialog"
			:color-hex="notification.colorHex"
			:show-modal-init="notification.show"
			:text-content="notification.text"
			:title-header="notification.title"
			@close-dialog="closeNotification"
		></app-show-dialog>
		<app-show-dialog
			:price-min="true"
			:valid-warehouse="false"
			:show-products="true"
			:products="productsValid"
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Realizar Venta"
			:show-modal-init="dialogNotStock"
			:text-content="textValid"
			@close-dialog="closeNotification"
		/>
		<app-dialog-products
			title-dialog="Crear Venta"
			:show-dialog="showUnits"
			:products="productDuplicateUnit"
			text-dialog="Se encuentra repetidos con la mismas unidades:"
			@close-modal="closeModalUnit"
		/>
	</div>
</template>

<script>
import { format, isAfter, isBefore, startOfDay, subDays, subMonths } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import Sales from '@/shared/sale';
import appDialogProducts from '@/components/shared/app-dialog-products';
import applyDiscountCoupon from '@/components/sales/apply-discount-coupon';
import actionSidebar from '@/components/shared/action-sidebar';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import appShowDialog from '@/components/shared/app-show-dialog';
import appDataQuote from '@/components/shared/sales/app-data-quote';
import appInformationAdditional from '@/components/shared/sales/app-information-additional';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import customersForm from '@/components/customers/customers-form';
import customerResume from '@/components/shared/sales/customer-resume';
import dateComponent from '@/components/shared/date-component';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import 'vue2-datepicker/locale/es';
import fastRegister from '@/components/shared/product/fast-register';
import generalFilter from '@/components/shared/general-filter';
import guideData from '@/components/quotation/additional-information';
import headerPage from '@/components/shared/header-page';
import headerSummary from '@/components/shared/header-summary';
import modalAttributesAssign from '@/components/sales/modal-attributes-assign';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import paymentMode from '@/components/shared/sales/payment-mode';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import appConsiderations from '@/components/shared/sales/app-considerations';
import appIssues from '@/components/shared/sales/app-issues';
import modalDetraction from '@/components/shared/modal-detraction';
import typeChangeForm from '@/components/purchases/type-change-form';
import salesSeries from '@/components/sales/sales-series';
import headerInformation from '@/components/shared/sales/header-information';
import sellingPoints from '@/components/shared/sales/selling-points';
import advanceInvoice from '@/components/sales/subcomponents/advance-invoice';
import changeBox from '@/components/sales/subcomponents/change-box';
import typeProduct from '@/shared/type-product';
import BasePrice from '@/shared/basePrice';
import assignSeller from '@/components/sales/assign-seller';
import payProductsPoint from '@/components/shared/sales/pay-products-point';
import btnAverageCost from '@/components/shared/sales/btn-average-cost';
import flagTypes from '@/shared/flag-type';
import modalItems from '@/components/shared/modal-items';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import modalLotesSales from '@/components/modal-lotes-sales';
import es from 'date-fns/locale/es';

const Sale = new Sales();
const {
	compose,
	createPropertyByOtherOne,
	equality,
	find,
	getDeeper,
	isEmpty,
	map,
	setNewProperty,
	setNewPropertyByFunction,
	round,
	updateItemInCollectionByIndex,
	updateItemInCollection,
} = lib;

const twoDecimals = round(2);
const threeDecimals = round(3);
const fourDecimals = round(4);

async function created() {
	const rubroId =
		this.$userInfo.company && this.$userInfo.company.item
			? this.$userInfo.company.item.id
			: null;
	this.showAtribute = rubroId === 1447;
	this.flagEditBlockedAcl = this.$userInfo.company.settings.flagEditBlockedAcl;
	if (this.showAtribute) {
		this.disabledWeight = true;
	}
	this.codeSale = flagTypes.Sales;
	({ orderId: this.orderId } = this.$route.query);
	const { cloneId: saleCloneId, convert: saleConvert } = this.$route.query;
	this.showConvertDocument =
		saleCloneId &&
		saleConvert === 'ntv' &&
		(this.$userInfo.company.settings.flagChangeNtvFlow || false);
	this.actionSale =
		saleCloneId && saleConvert === 'cot'
			? 'convertir la cotización a venta'
			: 'la nueva venta';
	this.showBrandConfig = this.$userInfo.company.settings.flagUseSimpleBrand || false;
	this.show10Percentage = this.$userInfo.company.settings.flagTaxesIgvTemporary || false;
	this.loadingGeneral = true;
	const newDate = new Date();
	const userCompanyData = this.$userInfo.company;
	const userCompanySettingsData = this.$userInfo.company.settings;
	const userCompanyKeys = Object.keys(userCompanyData);
	const userCompanySettingsKeys = Object.keys(userCompanySettingsData);
	const existFlagUpdatePrice = userCompanyKeys.find((k) => k === 'flagUpdatePrice');
	const existShowCash = userCompanySettingsKeys.find((k) => k === 'showCash');
	const flagUpdatePriceUser =
		this.$userInfo.additionalInformation &&
		this.$userInfo.additionalInformation.flagUpdatePrice
			? this.$userInfo.additionalInformation.flagUpdatePrice
			: false;
	const flagUpdatePriceCompany = existFlagUpdatePrice
		? userCompanyData.flagUpdatePrice
		: true;
	this.flagUpdatePrice = flagUpdatePriceUser;
	if (flagUpdatePriceUser) {
		this.flagUpdatePrice = flagUpdatePriceCompany;
	}
	this.showCash = existShowCash ? userCompanySettingsData.showCash : false;
	this.dateOnline = newDate.getTime().toString();
	this.entryDate = helper.formatDate(new Date(), 'YYYY-MM-DD');
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	Sale.user = this.$userInfo;
	Sale.flagTransfer = this.$route.query.flagTransfer;
	this.salesCurrency = getDeeper('company', 'currency')(this.$userInfo);
	this.salesCurrencyInitial = getDeeper('company', 'currency')(this.$userInfo);
	this.flagUseGun = getDeeper('company', 'flagBarcodeReader')(this.$userInfo) === 1;
	this.isSaleRole = getDeeper('roleCode')(this.$userInfo) === 'MAKI_VENDOR';
	this.selectedWarehouse = getDeeper('warWarehousesId')(this.$userInfo);
	this.negativeStockAllowed = getDeeper(
		'company',
		'settings',
		'stockNegative'
	)(this.$userInfo);
	this.basePrice = getDeeper(
		'company',
		'settings',
		'flagBasePriceDefault'
	)(this.$userInfo);
	this.priceToHide =
		this.basePrice === this.basePriceComputed.PV
			? this.basePriceComputed.PU
			: this.basePriceComputed.PV;
	this.defaultCurrency = this.$userInfo.company.currency;
	const generalTaxes = helper.getCompanyTaxesFlat();
	this.generalTaxes = generalTaxes.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});

	this.shipProduct = this.$userInfo.company.settings.autoDispatch;
	this.showAutoDispatch = this.$userInfo.company.settings.flagTransferDisplay;
	this.assignedEmployed = this.$userInfo.company.settings.assignEmployee;
	await this.loadEmployees();
	if (!helper.getLocalData('type-payments')) {
		await this.loadTypePayments();
	}
	if (!helper.getLocalData('payments-methods')) {
		await this.loadPaymentMethods();
	}
	if (!helper.getLocalData('banks-account')) {
		await this.loadBanksAccount();
	}
	await this.loadTypeChange();
	await this.loadAttributes();
	await this.loadData();
	this.showTypeOriginOrder = this.$userInfo.company.settings.flagTypeOriginOrder;
	this.columns[5].isEditable = !!this.$route.query.cloneSale;
	this.columns[20].isEditable = !!this.$userInfo.company.settings.singleDiscount || false;
	this.showNotifySale = this.$userInfo.company.settings
		? this.$userInfo.company.settings.showNotifySale
		: false;
	this.columns[13].flagVisible = !this.showNotifySale;
	this.columns[9].flagVisible = !this.showAtribute;
	if (this.showColumnsDocuments) {
		this.columns[6].flagVisible = !this.showColumnsDocuments;
		this.columns[6].visible = this.showColumnsDocuments;
		this.columns[7].flagVisible = !this.showColumnsDocuments;
		this.columns[7].visible = this.showColumnsDocuments;
	}
}

async function loadAttributes() {
	try {
		const response = await this.$httpProducts.get('attribute', {
			params: { mode: 2 },
		});
		this.listAttributes = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function weightProduct(index, { value }) {
	if (value) {
		this.data[index].weightProduct = Number(value);
		this.disabledWeight = false;
	}
}

function labelAttributes({ attributeList }) {
	if (this.showAtribute) {
		return 'Asignar Precio';
	} else if (!attributeList) {
		return 'No cuenta con atributos';
	}
	return 'Asignar atributos';
}

async function loadBanksAccount() {
	const response = await this.getBankAccount();
	helper.setLocalData('banks-account', response.data);
}

async function loadPaymentMethods() {
	const response = await this.$httpSales.get('payments-methods');
	helper.setLocalData('payments-methods', response.data);
}

async function loadTypePayments() {
	const params = { flagType: 1 };
	if (this.customer.id) {
		params.customerId = this.customer.id;
	}
	try {
		const response = await this.$httpSales.get('type-payments', { params });
		helper.setLocalData('type-payments', response.data);
	} catch (error) {
		this.showGenericError();
	}
}

function showList() {
	this.showPriceList = true;
}

function setPriceListGlobal({ model, value }) {
	this[model] = value;
}

async function loadEmployees() {
	const params = {
		flagActive: 1,
	};
	try {
		({ data: this.employees } = await this.$httpSales.get('employees', {
			params,
		}));
	} catch (error) {
		this.showGenericError();
	}
}

function getEmployee({ value }) {
	if (value) {
		this.employeeId = value.id;
		this.employee = value;
		this.params = setNewProperty('employeeId', value.id)(this.params);
	}
}

function customerFocused() {
	this.$refs.customerSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
}

function updateColumns(user, columns) {
	const taxLabel = getDeeper('company', 'country', 'taxName')(user);
	if (taxLabel) {
		const item = find(equality('value', 'taxes'), columns);
		return map(updateItemInCollection(item, 'value', 'name', `${taxLabel}`), columns);
	}
	return columns;
}

function setDynamic(product, value, index, model) {
	if (model === 'parts') {
		this.data[index].parts = value;
	} else {
		this.data[index].meterage = value;
	}
	const quantityResult = twoDecimals(this.data[index].parts * this.data[index].meterage);
	this.quantityValidation(product, quantityResult, index);
}

function beforeDestroy() {
	this.data = this.data.filter((p) => !p.flagAdvanceInvoice);
	this.data = this.data.map((product) => {
		const newProduct = { ...product };
		newProduct.flagSales = product.product ? product.product.flagSales : 0;
		newProduct.typeDocumentSelected = this.typeDocumentSelected;
		return newProduct;
	});
	helper.setLocalData('products-selected', this.data);
}

async function addProduct() {
	if (
		this.newProduct.product.product &&
		this.newProduct.product.product.flagLotsEnabled === 1 &&
		!this.newProduct.product.productLots
	) {
		this.showGenericError(
			'Debe ingresar la configuración de Fecha de Vencimiento y Lote'
		);
		return;
	}
	if (this.newProduct.quantity > 0) {
		const { company } = this.$userInfo;
		const { settings } = company || {};
		const { stockNegative } = settings;
		const { flagStockNegative } = this.newProduct;
		if (
			(!stockNegative || (!flagStockNegative && this.$domainsUser)) &&
			this.newProduct.product.type === typeProduct.Products
		) {
			if (this.newProduct.quantity > this.newProduct.product.stock && !stockNegative) {
				this.modal.message = `El producto ha sido agregado con la cantidad ${this.newProduct.product.stock} porque no se puede vender con una cantidad mayor al stock.`;
				this.modal.open = true;
				this.newProduct.quantity = this.newProduct.product.stock;
			}
		}
		const flagLotsEnabled =
			this.newProduct.product && this.newProduct.product.product
				? this.newProduct.product.product.flagLotsEnabled === 1
				: false;
		const validateLotProduct = (lot) =>
			flagLotsEnabled ? this.newProduct.product.lot === lot : true;
		const index = this.data.findIndex(
			(prod) =>
				prod.productId === this.newProduct.product.productId &&
				prod.flagFree === this.newProduct.product.flagFree &&
				this.newProduct.product.unitId === prod.unitId &&
				validateLotProduct(prod.lot)
		);
		if (index < 0) {
			this.newProduct.showBrand =
				this.$userInfo.company.settings.flagUseSimpleBrand || false;
			const transformedProduct = await Sales.addProductsSale(
				this.newProduct,
				this.generalTaxes,
				this.$userInfo,
				false,
				null,
				false,
				this.customer,
				this.isPeru,
				this.typeDocumentsSelected,
				this.defaultCurrency,
				this.salesCurrency,
				this.exchangeRate
			);
			transformedProduct.traceability = { origin: this.$route.name };
			// new property for fix change currency whitout decimals
			transformedProduct.pricePerSaleOriginSOL = transformedProduct.pricePerSaleOrigin;
			this.data.push(transformedProduct);
			const { priceSaleMax, pricePerSale } = transformedProduct;
			if (priceSaleMax) {
				this.disabledFunMaxProduct(priceSaleMax, pricePerSale);
			}
			if (this.salesCurrencyInitial !== this.salesCurrency) {
				const conversion =
					this.salesCurrency === 'PEN' ? this.exchangeRate : 1 / this.exchangeRate;
				const indexProd = this.data.findIndex((p) => p.id === this.newProduct.product.id);
				if (indexProd > -1) {
					const item = this.data[indexProd];
					item.price *= conversion;
					item.pricePerSale = fourDecimals(item.pricePerSale * conversion);
					item.pricePerSaleOrigin = fourDecimals(item.pricePerSaleOrigin * conversion);
					item.subtotalWithoutTax = fourDecimals(item.subtotalWithoutTax * conversion);
					item.priceUnitary = twoDecimals(item.priceUnitary * conversion);
					item.priceUnitaryReal *= conversion;
					item.total = twoDecimals(item.total * conversion);
				}
			}
		} else {
			let msg = `El producto ya se encuentra agregado con la unidad: ${this.newProduct.product.unitName}`;
			msg += flagLotsEnabled ? ` y con el lote ${this.newProduct.product.lot}.` : '';
			this.showNotification(msg, 'info');
		}
		helper.setLocalData('products-selected', this.data);
		this.newProduct.product = {
			pricesListArray: [...this.pricesList],
		};
		this.getPriceListId(this.customer);
		const defaultListPrice = this.pricesList.find((p) => p.flagDefault === 1);
		this.newProduct.selectedPriceListId =
			this.customer.salPriceListId || defaultListPrice.id;
		this.newProduct.points = this.customer.points;
		this.newProduct.quantity = 0;
		this.selectedProduct = '';
		this.cleanInput = true;
		setTimeout(() => {
			this.$refs.productSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
		}, 300);
	} else {
		this.showGenericError(
			'Ingresar una cantidad mayor a cero (0) para agregar el producto.'
		);
	}
}

function cancelSale() {
	this.data = {};
	this.search = '';
	this.searchProduct = '';
	if (this.$route.query.orderId) {
		this.goTo('orders');
	} else {
		this.goTo('list-of-products');
	}
}

function changePage(page) {
	this.currentPage = page;
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.feeError = false;
	this.searchVal = null;
	this.indexProduct = null;
	this.showDetraction = false;
	this.arrayNew = [];
	this.saleLoading = false;
	if (this.action.code === 'AI') {
		this.newIssue = false;
	} else if (this.action.code === 'AC') {
		this.newConsideration = false;
	}
	this.removePercentage(this.percentage);
}

function openPaymentModalByKeyBoard() {
	const valid = !(this.$v.$invalid || this.negative || this.blockedCustomer);
	if (valid) {
		this.collectSale();
	}
}

function collectSale() {
	const itemsInvalidsQuantity = this.data.filter((d) => d.quantity <= 0);
	if (itemsInvalidsQuantity.length > 0) {
		const names = itemsInvalidsQuantity.map((d) => d.name).join(', ');
		this.showGenericError(
			`Los siguientes productos cuentan con una cantidad no valida: ${names}`
		);
		return;
	}

	this.notification.colorDialog = 'error';
	this.notification.colorHex = '#D5331A';
	this.productsAddCost = [];
	this.data.forEach((row) => {
		const totalCost = row.totalCost;
		const cost = row.unitConversion * totalCost;
		const existingIndex = this.productsAddCost.findIndex(
			(item) => item.productId === row.productId
		);
		if (existingIndex !== -1) {
			this.productsAddCost[existingIndex].cost = cost;
			return;
		}
		if (row.pricePerSale < cost) {
			this.productsAddCost.push({ ...row, cost });
		}
	});
	const detraction = this.typesDetraction.find((d) => d.id === this.detraction);
	const priceAmount = detraction && detraction.code === '027' ? 400 : 700;
	const validDiscount = this.data.some(
		(d) => d.discountPercentage === 100 && !d.flagFree
	);
	const amount =
		this.salesCurrency === 'USD'
			? twoDecimals(priceAmount / this.exchangeRate)
			: priceAmount;
	const validPrice = this.data.some((d) => d.pricePerSale === 0);
	const flagMovKardex = this.$userInfo.company.settings.COTMoveKardex;
	if (this.validateSeries()) {
		this.showGenericError(this.message);
		return;
	}

	if (this.notSale) {
		this.notification.title = 'EXCEDE EL MONTO MÁXIMO PARA EL CONSUMIDOR FINAL';
		this.notification.text = `Para realizar una venta del cliente "Consumidor Final" el monto no debe exceder los ${this.$userInfo.company.currency}${this.maximumAmount}`;
		this.notification.show = true;
	} else if (this.notBolSale) {
		this.notification.title = 'EXCEDE EL MONTO MÁXIMO PARA BOLETA SIN CLIENTE';
		this.notification.text = `Para realizar una boleta sin ingresar los datos del cliente el monto no debe exceder los ${this.$userInfo.company.currency}${this.maximumAmountBol}`;
		this.notification.show = true;
	} else if (this.notFacSale) {
		this.notification.title = 'SELECCIONE UN CLIENTE';
		this.notification.text =
			'Para poder realizar una factura es necesario seleccionar un cliente';
		this.notification.show = true;
	} else if (this.existCustomer) {
		this.notification.title = 'SELECCIONE UN CLIENTE';
		this.notification.text =
			'Para poder realizar una venta es necesario seleccionar un cliente';
		this.notification.show = true;
	} else if (this.notFacRuc) {
		this.notification.title = 'SELECCIONE UN CLIENTE CON RUC';
		this.notification.text = 'Para poder realizar una factura el cliente debe tener RUC';
		this.notification.show = true;
	} else if (validDiscount && this.isPeru) {
		this.notification.title = 'Descuento 100%';
		this.notification.text =
			'Uno o más productos tienen descuento de 100%, deben ser considerados como gratuito.';
		this.notification.show = true;
	} else if (this.sale.flagUse === 1 && this.$route.query.convert === 'ntv') {
		this.notification.title = 'NO SE PUEDE CONVERTIR EL DOCUMENTO';
		this.notification.text = 'El documento ya fue convertido';
		this.notification.show = true;
	} else if (this.showNotifySale && this.productsAddCost.length > 0) {
		this.showNotifySaleModal = true;
	} else if (validPrice) {
		this.notification.title =
			'No puede realizar una venta con uno o mas producto con precio en 0';
		this.notification.text =
			'Para poder realizar la venta con uno o mas productos con precio en 0, debe añadirlo como producto gratuito. Para mayor información comunicarse con el área de soporte.';
		this.notification.show = true;
	} else if (this.createDetraction.percentage && this.priceAmounts.total < amount) {
		this.notification.title = 'Importante: Límite de Monto para Ventas con Detracción';
		this.notification.text = `Si la venta está sujeta a una detracción, el monto total debe ser mayor a ${amount} ${
			this.salesCurrency === 'USD' ? 'dolares' : 'soles'
		}.`;
		this.notification.show = true;
	} else if (
		helper.validatedOrder(this.sale) && !flagMovKardex ? !this.checkNegativeStock() : true
	) {
		this.feeError = true;
		this.action.code = 'payment-mode';
		this.action.title = 'COBRAR';
		this.action.open = true;
		this.action.width = 607;
	}
}

function validToCreate() {
	this.showNotifySaleModal = false;
	this.action.code = 'payment-mode';
	this.action.title = 'COBRAR';
	this.action.open = true;
	this.action.width = 607;
}

function closeModalNotify() {
	this.showNotifySaleModal = false;
}

function closeModalList() {
	this.showPriceList = false;
	this.priceListGlobal = null;
}

function assignPriceList() {
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		const selectedPriceList = row.pricesListArray.find(
			(p) => p.id === this.priceListGlobal.id
		);
		if (selectedPriceList) {
			newRow.selectedPriceListId = selectedPriceList.id;
			newRow.pricePerSale = row.priceList[selectedPriceList.id].price;
			newRow.discountPercentage = row.priceList[selectedPriceList.id].discount;
			newRow.priceEdited = false;
		}
		return newRow;
	});
	this.closeModalList();
}

function customerDetailsSelected() {
	return this.action.code === 'customer-details';
}

function productsPoint() {
	return this.action.code === 'products-point';
}

function customerRegisterSelected() {
	return this.action.code === 'customers-new';
}

function disabledPay(val) {
	const value = this.data.some((p) => p.flagFree);
	this.disabledPayBtn = value ? false : val;
	this.showEmitAlert = value ? false : val;
}

function disabledLimit(val) {
	this.showLimit = val;
}

function document() {
	return (this.typePerson && this.typePerson.documentNumber) || 'Cliente sin documentos';
}

function viewShowError() {
	this.notification = {
		title: 'EXCEDE LA CANTIDAD DE DECIMALES',
		text: 'Para poder crear la venta , se debe reducir los decimales a un maximo de 4 decimales.',
		show: true,
		colorDialog: 'error',
		colorHex: '#D5331A',
	};
}

function editDiscount(product, index, value) {
	const range = Number(value) >= 0 && Number(value) < 100;
	if (value === '' || !range) {
		this.notification = {
			title: 'Descuento incorrecto',
			text: 'Por favor introduzca un descuento correcto o ingrese 0 para no aplicar una descuento',
			show: true,
			colorDialog: 'error',
			colorHex: '#D5331A',
		};
		this.data[index].discountPercentage = 0;
		this.data = Sales.editDiscount(
			product,
			0,
			this.data,
			index,
			false,
			this.salesCurrency,
			this.exchangeRate
		);
		this.disabledFunMaxProduct(
			this.data[index].priceSaleMax,
			this.data[index].pricePerSale
		);
		return;
	}

	const valueDecimal = value.toString().split('.')[1];
	this.isDisabledPrice = valueDecimal && valueDecimal.length > 4;
	if (valueDecimal && valueDecimal.length > 4) {
		this.viewShowError();
	}
	const newValue = Number(value);
	this.data[index].discountPercentage = newValue;
	this.data = Sales.editDiscount(
		product,
		value,
		this.data,
		index,
		false,
		this.salesCurrency,
		this.exchangeRate
	);
	this.disabledFunMaxProduct(
		this.data[index].priceSaleMax,
		this.data[index].pricePerSale
	);
}

function editPriceUnitary(product, index, newPrice) {
	const valueDecimal = newPrice.toString().split('.')[1];
	this.isDisabledPrice = valueDecimal && valueDecimal.length > 4;
	if (valueDecimal && valueDecimal.length > 4) {
		this.viewShowError();
	}
	this.data = Sales.editPriceUnitary(product, newPrice, this.data, index);
	if (this.data[index].priceUnitary < this.data[index].priceSaleMin) {
		const priceMinSale = this.data[index].priceSaleMin;
		this.notification = {
			colorDialog: 'error',
			colorHex: '#D5331A',
			show: true,
			text: `Para poder continuar el precio de venta
			del producto debe tener como minimo de ${priceMinSale}`,
			title: 'IMPORTANTE',
		};
		this.idRow = this.data[index].id;
		this.showMaxProduct = false;
	}
	if (index) {
		this.disabledFunMaxProduct(this.data[index].priceSaleMax, newPrice, product);
	} else {
		this.disabledFunMaxProduct(product.priceSaleMax, newPrice, product);
	}
}

function feeErrors(value) {
	this.feeError = value;
}

function getPriceListId({ id, salPriceListId }) {
	const customerPriceList = salPriceListId;
	const priceListProduct = this.newProduct.selectedPriceListId;
	const pricesListArray = this.newProduct.product.pricesListArray;
	const listByCustomer =
		id && pricesListArray
			? pricesListArray.find((pl) => pl.comCustomersId === id) || {}
			: {};
	const listByEmployee = pricesListArray
		? pricesListArray.find((pl) => pl.comEmployeeId === this.$userInfo.id) || {}
		: {};
	const listByWarhouse = pricesListArray
		? pricesListArray.find(
				(pl) => pl.warWarehousesId === this.$userInfo.warWarehousesId
		  ) || {}
		: {};
	const listDefault =
		Sale.defaultPriceList && Sale.defaultPriceList.id
			? Sale.defaultPriceList.id
			: this.$userInfo.salPriceList.id;
	const priceListId =
		customerPriceList ||
		priceListProduct ||
		listDefault ||
		listByCustomer.id ||
		listByEmployee.id ||
		listByWarhouse.id;
	if (!this.$route.query.cloneId || this.$route.query.cloneId) {
		this.setPriceList({ id: priceListId });
	}
}

async function loadData() {
	const saleId = this.$route.query.cloneId;
	Sale.isEditing = !!saleId;
	const { convert: convertSale } = this.$route.query;
	const params = {
		flagActive: 1,
		sortDirection: 'desc',
		sortField: 'flag_default',
	};
	const requests = [
		this.listPricingPromise(params),
		this.exchangeByDate(),
		this.getTypeDocuments('sales'),
		this.getCurrencies(),
		this.listOfUnits(),
		this.$httpSales.get('subsidiaries'),
		this.$httpSales.get('cost-center'),
	];
	if (!this.notFacSale && !this.notFacRuc && !saleId && !this.$route.query.convert) {
		requests.push(
			this.$httpSales.get('customers', {
				params: { flagSales: true, flagGeneric: 1 },
			})
		);
	}
	if (saleId) {
		requests.push(
			this.$httpSales.get(`sale-documents/${saleId}`, {
				params: { flagDeleteCache: true },
			})
		);
	}
	if (this.orderId) {
		requests.push(
			this.$httpSales.get(`orders/${this.orderId}`, {
				params: { flagStructureDetails: 1 },
			})
		);
	}
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.pricesList },
			{ data: this.exchangeRate },
			{ data: this.typeDocuments },
			{ data: this.typeCoin },
			{ data: this.units },
			{ data: this.subsidiaries },
			{ data: this.costsCenter },
		] = responses;
		let newData = this.validateLocalStorage();
		const paramsOrigins = {
			typeOrigin: 'typeOriginOrder',
		};
		const typeOrigins = await this.$httpSales.get('type-origins', {
			paramsOrigins,
		});
		this.typeOrigins = typeOrigins.data;
		if (!this.notFacSale && !this.notFacRuc && !saleId && !this.$route.query.convert) {
			[, , , , , , , { data: this.customers }] = responses;
		}
		if (saleId || this.orderId) {
			if (!this.notFacSale && !this.notFacRuc && !saleId && !this.$route.query.convert) {
				[, , , , , , , , { data: this.sale }] = responses;
			} else {
				[, , , , , , , { data: this.sale }] = responses;
			}
		}
		if (this.orderId) {
			this.resetEmployee();
		}
		if (saleId && this.sale.details && this.sale.details.length > 0) {
			if (this.$route.query.convert) {
				this.salesCurrency = this.sale.currency;
				const findEmployee = this.assignedEmployed
					? this.employees.find(
							(employee) => employee.id === (this.sale.employee && this.sale.employee.id)
					  )
					: this.employees.find((employee) => employee.id === this.$userInfo.id);
				this.employee = findEmployee || this.sale.employee;
				this.employee.fullName = this.sale.employee && this.sale.employee.fullname;
				this.employeeId =
					(findEmployee && findEmployee.id) ||
					(this.sale.employee && this.sale.employee.id);
				this.params = setNewProperty('employeeId', this.employeeId)(this.params);
			}
			this.commentary = this.sale.commentary || '';
			newData = this.sale.details.map((sd) => {
				const newSd = { ...sd };
				const product = sd.product || {
					unitId: sd.unitId,
					unitCode: sd.unitCode,
					unitName: sd.unitName,
					code: sd.productCode,
				};
				const taxCost = sd.tax || sd.taxCostPercentage;
				const totalCost =
					sd.product.flagIgv && taxCost
						? sd.product.cost * (1 + taxCost / 100)
						: sd.product.cost;
				const unit = this.units.find((u) => u.id === product.unitId) || {};
				const unitByProd = {
					id: product.unitId || unit.id,
					code: product.unitCode || unit.code,
					name: product.unitName || unit.name,
				};
				newSd.aditionalInformation = {
					...sd.aditionalInformation,
					referenceDetailId: sd.id,
				};
				newSd.product.taxes = sd.taxes
					.map((tax) => {
						const newRowTax = { ...tax };
						newRowTax.idCodeReference = `${tax.code}${tax.percentage}`;
						newRowTax.flagSales = 1;
						return newRowTax;
					})
					.filter((tax) => {
						if (!sd.flagFree && (tax.code === '05' || tax.taxSchemeName === 'GRATUITO')) {
							return false;
						}
						return true;
					});
				newSd.totalCost = totalCost;
				newSd.taxCostPercentage = taxCost;
				newSd.productId = sd.product.id;
				newSd.priceBaseToCalculate = this.basePrice;
				newSd.quantityOld = sd.quantity;
				newSd.priceEdited = false;
				newSd.flagFree = sd.flagFree;
				newSd.parts =
					sd.aditionalInformation && sd.aditionalInformation.dynamicFields
						? sd.aditionalInformation.dynamicFields.parts
						: 0;
				newSd.meterage =
					sd.aditionalInformation && sd.aditionalInformation.dynamicFields
						? sd.aditionalInformation.dynamicFields.meterage
						: 0;
				newSd.validClone = this.$route.query.cloneId || null;
				newSd.autoBarcode = sd.product ? sd.product.autoBarcode : '';
				newSd.code = sd.product ? sd.product.code : sd.productCode || '';
				newSd.name = sd.product ? sd.product.name : '';
				newSd.description = sd.product ? sd.product.description : '';
				newSd.stock = sd.product ? sd.product.warBrandStock : 0;
				newSd.pricesListArray = this.setPricesListByProduct(
					this.pricesList,
					sd.product.priceList
				);
				newSd.priceList = sd.product ? sd.product.priceList : {};
				newSd.priceCost = sd.priceCost ? sd.priceCost : 0;
				newSd.salePrice = Sales.getPriceWithOutDiscount(newSd);
				newSd.units =
					sd.product && sd.product.conversions
						? this.unitsByProduct(sd.product, sd)
						: [{ ...unitByProd }];
				const validUnitConversion = newSd.units.find((p) => sd.unitId === p.id);
				newSd.unitConversion = (validUnitConversion && validUnitConversion.quantity) || 1;
				newSd.unitQuantity = newSd.unitConversion * sd.quantity;
				newSd.type = sd.product ? sd.product.type : '';
				newSd.typeCode = sd.product ? sd.product.typeCode : '';
				const pricePerSaleOrigin =
					sd.discountPercentage > 0 ? Number(sd.unitPrice * `1.${sd.tax}`) : sd.salePrice;
				newSd.pricePerSaleOrigin = fourDecimals(pricePerSaleOrigin);
				newSd.priceUnitary = sd.unitPrice;
				newSd.priceSaleMax = sd.product ? sd.product.priceSaleMax : 0;
				newSd.priceSaleMin = sd.product ? sd.product.priceSaleMin : 0;
				return newSd;
			});
			this.totalAmountCoupon = this.sale.discountGlobal;
		}
		if (this.sale.referenceExternal) {
			this.referenceExternal = this.sale.referenceExternal;
		}
		if (this.sale.externalData) {
			this.informationSale = this.sale.externalData;
		}
		const exchangeRates = helper.getLocalData('ms-exchange-rates');
		if (exchangeRates && exchangeRates.length) {
			this.exchangeRate = exchangeRates && exchangeRates[0].amount;
		}
		this.exchangeRatePrimary = this.exchangeRate;
		this.typeDocuments = this.filterTypeDocuments(1, 'BOL', 'FAC', 'NTV');
		if (this.$route.query.convert === 'ntv') {
			this.typeDocuments = this.typeDocuments.filter((p) => p.comTypeDocumentId !== 3);
		}
		if (this.orderId) {
			// CARGAR INFORMACION DEL PEDIDO PARA CONVERTIR A VENTA
			await this.setOrderData(this.sale);
		} else {
			const defaultList = this.pricesList.find((el) => el.flagDefault === 1);
			if (!defaultList) {
				this.notListDefault = true;
				this.notification.colorDialog = 'warning';
				this.notification.colorHex = '#FFC606';
				this.notification.title = 'LISTA DE PRECIOS POR DEFECTO';
				this.notification.text =
					'No se ha encontrado ninguna lista de precios por defecto activa.';
				this.notification.show = true;
			}

			this.data = await Sale.formattedProducts(
				newData,
				this.pricesList,
				this.generalTaxes,
				!!saleId
			);
			this.showProductsParcials = this.data.some((product) => product.flagUse === 1);
			this.onClean = false;
			this.getPriceListId(this.sale.customer);
			const flagMovKardex = this.$userInfo.company.settings.COTMoveKardex;
			if (helper.validatedOrder(this.sale) && !flagMovKardex) {
				this.checkNegativeStock();
			}
		}
		this.newProduct.product.pricesListArray = [...this.pricesList];
		this.typeDocumentsSelected = this.typeDocumentSelected();
		this.typeDocumentsName = this.typeDocumentName();
		this.hasCostShippingProp = Object.keys(this.sale).some((k) => k === 'costShipping');
		if (this.hasCostShippingProp && !this.$userInfo.company.settings.flagTip) {
			this.showNotification(
				`Si desea incluir costo de envió
				active la opción Mostrar Opción Recargo al Consumo en Nueva Venta en configuración.`,
				'info'
			);
		}
		this.documentSelected =
			this.sale && this.sale.typeDocument
				? this.sale.typeDocument
				: this.typeDocuments[0].documentType;
		if (
			this.$userInfo.company.settings.flagGenericSalesCustomer === undefined ||
			this.$userInfo.company.settings.flagGenericSalesCustomer === null
		) {
			this.flagGenericCustomer = true;
		} else {
			this.flagGenericCustomer = this.$userInfo.company.settings.flagGenericSalesCustomer;
		}
		if (saleId || this.$route.query.convert) {
			this.loadCustomerFilter(this.sale.customerId);
		} else if (
			!this.notFacSale &&
			!this.notFacRuc &&
			!saleId &&
			!this.$route.query.convert &&
			this.flagGenericCustomer
		) {
			this.setCustomer(
				this.customers.find((c) => c.flagGeneric),
				true
			);
		}
		if (this.$route.query.cloneId) {
			this.data.forEach((d, index) => {
				if (d.productPoint) {
					this.editPricePerSale(d, index, d.pricePerSaleOrigin.toFixed(4));
				}
			});
			this.data = this.data.map((d) => ({ ...d, productPoint: 0 }));
		}
		if (convertSale === 'cot') {
			this.data = this.data.map((s) => {
				const newD = { ...s };
				newD.traceability =
					s.aditionalInformation && s.aditionalInformation.traceability
						? s.aditionalInformation.traceability
						: { origin: 'quotation-convert-sale' };
				return newD;
			});
		}
		if (this.orderId) {
			this.data = this.data.map((s) => {
				const newD = { ...s };
				newD.pricePerSaleOrigin = s.pricePerSale / (1 - s.discountPercentage / 100);
				newD.traceability =
					s.aditionalInformation && s.aditionalInformation.traceability
						? s.aditionalInformation.traceability
						: { origin: 'orders-convert-sale' };
				return newD;
			});
		}
	} catch (err) {
		this.loadingGeneral = false;
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingGeneral = false;
	}
}

function typeDocumentSelected() {
	if (!this.typeDocuments || !this.typeDocuments.length) return 'NTV';

	// Priorizar this.customer SI tiene ID. Si no, usar this.sale.customer como fallback
	const customerToCheck =
		this.customer && this.customer.id
			? this.customer
			: this.sale && this.sale.customer
			? this.sale.customer
			: this.customer;

	const isRuc =
		customerToCheck &&
		customerToCheck.typePerson &&
		customerToCheck.typePerson.documentName === 'RUC';

	// 1. Si es RUC: Prioridad absoluta FAC (Factura)
	if (isRuc) {
		const fac = this.typeDocuments.find((t) => t.documentType.code === 'FAC');
		if (fac) return fac.documentType.code;
	}

	// 2. Si NO es RUC: Buscamos el primero que NO sea Factura
	const anyNotFac = this.typeDocuments.find((t) => t.documentType.code !== 'FAC');
	if (anyNotFac) return anyNotFac.documentType.code;

	// 3. Respaldo definitivo (si todo lo demás falla)
	return this.typeDocuments[0].documentType.code;
}

function typeDocumentName() {
	if (!this.typeDocuments || !this.typeDocuments.length) return '';
	const idealCode = this.typeDocumentSelected();
	const doc =
		this.typeDocuments.find((t) => t.documentType.code === idealCode) ||
		this.typeDocuments[0];
	return doc.documentType.name;
}

function filterTypeDocuments(...args) {
	const [flag, ...rest] = args;
	return this.typeDocuments.reduce((list, item) => {
		const { documentType } = item;
		const { code, flagType } = documentType;
		const documentExist = find(equality(code), rest);
		if (flagType === flag && documentExist) {
			return list.concat(item);
		}
		return list;
	}, []);
}

function checkNegativeStock() {
	const someNegativeStock = this.data.some(
		(p) =>
			p.stock <= 0 &&
			(p.type
				? Number(p.type) === typeProduct.Products
				: Number(p.product.type) === typeProduct.Products)
	);
	if (!this.negativeStockAllowed && someNegativeStock && this.shipProduct) {
		this.showNotification(
			'Algunos productos tienen stock Negativo y no se pueden vender. Deben ser eliminados para realizar la venta',
			'warning'
		);
		return true;
	}
	return false;
}

function getDownPaymentDocumentsIds() {
	const dataSelected = helper.getLocalData('advance-invoice-selected') || [];
	let products = [];
	Object.keys(dataSelected).forEach((k) => {
		const store = dataSelected[k];
		let parcialProducts = [];
		parcialProducts = store.reduce((list, bill) => {
			const { id } = bill;
			return list.concat(id);
		}, []);
		products = products.concat(parcialProducts);
	});
	return products;
}

async function makeSale(sale) {
	this.saleLoading = true;
	this.showErrorAverage = false;
	const url = `sale-documents/${this.typeDocumentsSelected}/type-document`;
	const saleId = !!this.$route.query.cloneId;
	const downPaymentDocumentsIds = this.getDownPaymentDocumentsIds();
	const exchangeRate =
		this.exchangeRate && typeof this.exchangeRate === 'object'
			? this.exchangeRate.amount
			: this.exchangeRate;
	const body = Sale.data({
		totalAdvance: this.totalAdvanceInvoice,
		totalAmountCoupon: this.totalAmountCoupon,
		amountCash: sale.amountCash,
		amountCredit: sale.amountCredit,
		basePrice: this.basePrice,
		card: sale.card,
		cardsUsedToPay: sale.cardsUsedToPay,
		change: sale.change,
		check: sale.check,
		commentary: this.commentary || undefined,
		currency: this.salesCurrency,
		customer: this.customer,
		discountGlobal: this.totalAmountCoupon || undefined,
		dateOnline: this.dateOnline,
		defaultCurrency: this.defaultCurrency,
		deposit: sale.deposit,
		downPaymentDocumentsIds,
		entryDate: this.entryDate,
		exchangeRate,
		fees: sale.quotes,
		flagAdvance: this.paymentInvoice,
		flagFree: true,
		isPeru: this.isPeru,
		paymentMethodId: sale.paymentMethodId,
		paymentsMethods: sale.paymentsMethods,
		products: this.data,
		salTypePayment: this.typeDocuments,
		saleId,
		tip: this.$route.query.orderId ? this.sale.costShipping : sale.tip,
		typeDocumentsSelected: this.typeDocumentsSelected,
		urlImages: sale.urlImages,
	});
	if (this.createDetraction.amount) {
		const { amount, detractionTypeId, percentage, bankAccount, detractionTypeName } =
			this.createDetraction;
		body.taxesAmount.detraction = amount;
		body.totalTaxesAmount.detraction = {
			amount,
			percentage,
			bankAccount,
			detractionTypeName,
			exchangeRate,
			amountCurrency: amount,
			totalPendingPaymentCurrency: body.amount - amount,
			totalPendingPayment: body.amount - amount,
			detractionTypeId,
		};
		if (this.salesCurrency === 'USD') {
			const detraction = body.totalTaxesAmount.detraction;

			body.totalTaxesAmount.detraction.amount = twoDecimals(
				this.exchangeRate * detraction.amount
			);
			body.totalTaxesAmount.detraction.totalPendingPayment = twoDecimals(
				this.exchangeRate * detraction.totalPendingPayment
			);
		}
	}

	body.totalWithoutWithholding = sale.totalWithholding || undefined;
	body.statusWithholding = sale.statusWithholding || undefined;
	if (body.statusWithholding) {
		body.withholdingTaxes = {
			base: body.amount,
			code: sale.codeWithholding,
			label: sale.labelWithholding,
			amount: threeDecimals(sale.amountWithholding),
			percentage: sale.percentageWithholding / 100,
		};
	}
	body.discountGlobal = this.totalAmountCoupon || 0;
	body.flagBasePrice = this.basePrice;
	body.considerations = this.considerations;
	body.workToDo = this.workToDo;
	body.flagDispatch = this.shipProduct;
	if (this.orderId) {
		body.orderId = this.orderId;
	}
	body.totalPoints =
		Number(
			this.data.reduce((total, currentValue) => total + currentValue.productPoint, 0)
		) || undefined;
	// const paramsGlobal = this.$userInfo.company.settings.flagChangeNtvFlow || false;
	if (this.configInfo.serie.terminal) {
		body.terminalId = this.configInfo.serie.terminal.id;
	}
	body.serieId = this.configInfo.serie.id;
	if (this.configInfo.cash) {
		body.cashId = this.configInfo.cash.id;
	}
	body.warehouseCodeTaxes = this.currentWarehouseData.warehouseCodeTaxes;
	body.warehouseName = this.currentWarehouseData.warehouseName;
	body.employeeId = this.assignedEmployed ? this.params.employeeId : this.employee.id;

	const isTax = ['FAC', 'BOL'].includes(this.typeDocumentsSelected);
	const invalidPricesProducts = body.details.filter(
		(detail) => detail.codeTaxes === '01' && detail.unitPrice === detail.salePrice
	);

	if (isTax && invalidPricesProducts.length > 0) {
		this.notification = {
			show: true,
			colorDialog: 'error',
			colorHex: '#D5331A',
			title: 'Error al generar la venta para Boletas o Facturas',
			text: 'No se pueden crear ventas para boletas o facturas con el precio unitario igual al precio de venta. Por favor, revise los productos seleccionados o contacte con soporte.',
		};
	}

	body.details = body.details.map((bd, inx) => {
		const newBd = { ...bd };
		newBd.quantity = fourDecimals(bd.quantity);
		newBd.unitQuantity = fourDecimals(bd.unitQuantity);
		newBd.brandSpId = this.showBrandConfig ? bd.brandSpId : undefined;
		const newVal = this.data.find((d) => bd.warProductsId === (d.warProductsId || d.id));
		if (newVal && newVal.product && newVal.product.additionalInformation) {
			newBd.subsidyAmount = newVal.product.additionalInformation.flagSubsidy
				? newVal.product.additionalInformation.subsidy * newVal.quantity
				: 0;
		} else if (newVal && newVal.additionalInformation) {
			newBd.subsidyAmount = newVal.additionalInformation.flagSubsidy
				? newVal.additionalInformation.subsidy * newVal.quantity
				: 0;
		} else {
			newBd.subsidyAmount = 0;
		}
		if (sale.totalSurchage) {
			const productPer = this.percentageDetails.find(
				(p) => bd.warWarehousesId === p.id || bd.warProductsId === p.id
			);
			if (productPer) {
				newBd.aditionalInformation = {
					surcharge: productPer.surcharge,
				};
			}
		}

		if (newBd.discountPercentage > 0 && newBd.discount <= 0) {
			// Si el porcentaje es mayor a 0 y el monoto no
			this.showNotSale = true;
			this.notification = {
				show: true,
				colorDialog: 'error',
				colorHex: '#D5331A',
				title: 'Generar Venta',
				text:
					'Para poder generar la venta , comuniquese con soporte.' +
					`Ocurrió un error con el descuento campo descuento ${newBd.discount} y porcentaje de descuento ${newBd.discountPercentage}.` +
					`Producto ${newBd.description}`,
			};
		}

		// Validaciones 4 decimales precio de costo y unitQuantity
		// additionalInformation
		const ad = {};
		const regexPattern = /^-?\d+\.\d{4}$/;
		if (!regexPattern.test(newBd.priceCost)) {
			ad.problemPriceCost = {
				description: `El detalle ${newBd.description} no tiene un priceCost redondeado a 4 digitos`,
			};

			const p = this.data[inx] ? this.data[inx].product : null;
			if (p) {
				ad.problemPriceCost.priceCostOriginProduct = p.cost || null;
			}
		}
		if (newBd.unitConversion) {
			if (newBd.unitQuantity !== newBd.unitConversion * newBd.quantity) {
				ad.problemUnitConversion = {
					description: `El detalle ${newBd.description} no tiene unitQuantity igual a su unitConversion por quantity `,
				};
			}
		}
		newBd.additionalInformation = ad;
		// delete newBd.priceCostOriginProduct;
		return newBd;
	});
	body.subsidyAmount = body.details.reduce((acum, d) => acum + d.subsidyAmount, 0);
	if (sale.totalSurchage) {
		body.externalData = {
			totalSurcharge: sale.totalSurchage,
		};
	}
	const guidesRemission =
		this.typeDocumentsSelected === 'FAC' &&
		this.informationSale &&
		this.informationSale.guides
			? this.informationSale.guides
					.filter((guide) => guide.serie && guide.number)
					.map((guide) => ({
						type: guide.type,
						number: `${guide.serie}-${guide.number}`,
					}))
			: [];
	body.externalData = {
		purchaseOrder:
			(this.informationSale && this.informationSale.amountOrder) || undefined,
		extCompanyCode:
			(this.informationSale && this.informationSale.extCompanyCode) || undefined,
		guidesRemission: guidesRemission.length ? guidesRemission : undefined,
	};
	body.referenceExternal = this.referenceExternal;
	if (this.historicalSalesActive) {
		const hourDefault = '10:00:00';
		const newNumber = this.number || this.configInfo.serie.number;
		body.createdAt = `${this.sale.createdAt} ${hourDefault}`;
		body.dateEmission = `${this.sale.createdAt} ${hourDefault}`;
		body.number = newNumber.toString();
		body.serie = this.configInfo.serie.serie;
		if (this.flagOldSale) {
			body.flagOldSale = Number(this.flagOldSale);
		}
		body.transactions = body.transactions.map((transaction) => {
			const newTransaction = { ...transaction };
			const { additionalInformation } = transaction;
			const { dateReference } = additionalInformation || {};
			newTransaction.paymentDate = dateReference
				? `${format(dateReference, 'YYYY-MM-DD')} ${hourDefault}`
				: body.createdAt;
			return newTransaction;
		});
	}
	if (this.settingsSale) {
		const settingsKeys = Object.keys(this.settingsSale) || [];
		if (settingsKeys.length > 0) {
			body.subTypeDocuments = settingsKeys.reduce((a, sk) => {
				const newA = { ...a };
				newA[sk] = this.settingsSale[sk].value;
				return newA;
			}, {});
		}
	}
	if (this.sale.dataClient) {
		body.dataClient = this.sale.dataClient;
	}
	if (this.quantityCharge) {
		if (body.externalData) {
			body.externalData.anotherCharge = this.quantityCharge;
		} else {
			body.externalData = { anotherCharge: this.quantityCharge };
		}
	}
	if (this.$route.query) {
		if (this.$route.query.convert === 'ntv' && this.sale.orderId) {
			body.flagOldSale = 1;
		}
		if (this.$route.query.convert === 'cot' || this.$route.query.convert === 'ntv') {
			body.salDocumentsId = this.sale.id;
		} else {
			delete body.salDocumentsId;
		}
	}
	const hourDefault = '10:00:00';
	const serieExist = this.configInfo.serie
		? this.configInfo.serie.comSubsidiariesId
		: null;
	const subsidiary = this.subsidiaries.find((p) => p.id === serieExist);
	let newAdditionalInformation = {};
	if (Object.keys(this.additionalGuide).length) {
		newAdditionalInformation = { ...this.additionalGuide };
		Object.keys(newAdditionalInformation).forEach((k) => {
			if (newAdditionalInformation[k].type === 'select') {
				delete newAdditionalInformation[k].items;
			}
		});
	}
	const quotationDataClient = this.sale.dataClient || {};
	delete quotationDataClient.settlementId;
	delete quotationDataClient.settlementStatus;
	const warehouse = this.$userInfo.warehouse;
	body.dataClient = {
		saleData: { ...newAdditionalInformation },
		quotation: this.$route.query.cloneSale ? undefined : quotationDataClient,
		sales: {
			payment: {
				transactions: {
					data: body.transactions.map((transaction) => {
						const newTransaction = { ...transaction };
						const { additionalInformation } = transaction;
						const { dateReference } = additionalInformation || {};
						newTransaction.paymentDate = dateReference
							? `${format(dateReference, 'YYYY-MM-DD')} ${hourDefault}`
							: body.createdAt;
						return newTransaction;
					}),
				},
			},
			customer: {
				addressId: this.customer.selectAddressId || undefined,
				address: this.customer.selectAddress || this.customer.address,
				alias: this.customer.alias,
				customerId: this.customer.id,
				fullName: this.customer.typePerson ? this.customer.typePerson.fullName : '',
				documentName: this.customer.msTypePerson ? this.customer.msTypePerson.name : '',
				documentCode: this.customer.msTypePerson ? this.customer.msTypePerson.code : '',
				documentNumber: this.customer.msTypePerson
					? this.customer.msTypePerson.documentNumber
					: '',
			},
			employee: {
				fullname: this.employee.fullName || this.employee.fullname,
				employeeId: this.employee.id,
				comEmployeeRegisteredId: this.$userInfo.id,
				comEmployeeRegisteredName: `${this.$userInfo.name}${this.$userInfo.lastname}`,
			},
			terminal: {
				id:
					this.configInfo && this.configInfo.serie && this.configInfo.serie.terminal
						? this.configInfo.serie.terminal.id
						: null,
				name:
					this.configInfo && this.configInfo.serie && this.configInfo.serie.terminal
						? this.configInfo.serie.terminal.name
						: null,
			},
			subsidiary: {
				sucursalName: subsidiary && subsidiary.sucursalName,
			},
			typeDocument: {
				code: this.typeDocumentsSelected,
				name: this.typeDocumentsName,
			},
		},
		warehouse: {
			ubigeo: warehouse.ubigeo,
			id: warehouse.id,
			name: warehouse.name,
			code: warehouse.code,
			codeTaxes: warehouse.codeTaxes,
			address: warehouse.address,
			phone: warehouse.phone,
			urlLogo: warehouse.urlLogo,
		},
	};
	try {
		if (this.showNotSale) {
			if (!this.notification.show) {
				// Si no existe uno previo
				this.notification = {
					show: true,
					colorDialog: 'error',
					colorHex: '#D5331A',
					title: 'Generar Venta',
					text: 'Para poder generar la venta , comuniquese con soporte.',
				};
			}
		} else {
			const { data: response } = await this.$httpSales.post(url, body);
			helper.removeLocalData('products-selected');
			this.showNotification('Venta realizada con éxito');
			if (this.exchangeRatePrimary !== this.exchangeRate) {
				this.changeExchangeRate();
			}
			this.data = [];
			this.goTo('convert', { params: { id: response.id } });
		}
	} catch (error) {
		const reg = /expirationDate/;
		if (error && reg.test(error.data.message)) {
			this.showNotification('Las cuotas deben tener fecha', 'error');
		} else if (error && error.status === 400) {
			if (error.data.message === 'TRANSACTION_FLAG_USE_INVALID') {
				this.showGenericError('La nota de crédito ya fue canjeada.');
			} else if (error.data.message === 'SERIES_QUANTITY_NOT_EQUAL_PRODUCT_QUANTITY') {
				this.showGenericError(
					'La cantidad de un producto no es igual a la cantidad de su serie'
				);
			} else if (error.data.message === 'MUST_SEND_SERIES') {
				this.showGenericError(
					'Uno o más de los productos requieren series para ser vendidos'
				);
			} else if (error.data.message === 'SEND_SERIES_NOT_ALLOWED') {
				this.showGenericError('Series inválidas para uno o más productos');
			} else if (error.data.message === 'SALE_DUPLICATE_ERROR') {
				this.showGenericError('La venta ya ha sido registrada');
			} else if (error.data.message === 'LIMIT_PRICE_ERROR') {
				this.textValid = error.data.messageError;
				this.productsValid = error.data.details;
				this.dialogNotStock = true;
			} else if (error.data.message === 'CASH_INACTIVE_ERROR') {
				this.showGenericError('La caja seleccionada no esta activa');
			} else if (error.data.message === 'MUST_BRING_BANK_ACCOUNT') {
				this.showGenericError('Seleccionar cuenta bancaria');
			} else if (error.data.message === 'SALES_NTC_FLAG_USE_INVALID') {
				this.showGenericError(
					'No se puede proceder con la venta porque la Nota de Crédito ya fue utilizada.'
				);
			} else if (error.data.message === 'CORRELATIVE_EXISTS') {
				this.showGenericError('Ya existe una venta con el correlativo ingresado.');
			} else if (error.data.message === 'STOCK_NO_AVAILABLE') {
				this.modalMessage =
					error.data.messageError ||
					'No se puede realizar la venta porque se excede la cantidad en uno o más productos.';
				this.modalStockError = true;
				this.detailsErrorStock = error.data.details;
			} else if (error.data.message === 'CASH_CLOSING_USER_EXIST') {
				this.showGenericError(
					'La caja aperturada se encuentra en otro usuario, asegurese que la caja se encuentre cerrada para generar la venta.'
				);
			} else if (error.data.message === 'SERIE_EXIST') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'HAS_BEEN_RETURNED_IN_FULL') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'HAS_BEEN_RETURNED_IN_FULL_COT') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'CREDIT_LIMIT_EXCEEDED_ERROR') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'HASH_ONLINE_SALES_DUPLICATE') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'TYPE_PAYMENT_INVALID') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
		this.saleLoading = false;
		this.saleInAction = false;
	} finally {
		this.saleLoading = false;
	}
}

function negative() {
	const isNegative = this.data.some(
		(d) =>
			d.quantityNegative || d.priceNegative || d.discount < 0 || d.discountPercentage < 0
	);
	if (isNegative) {
		this.showNotification('No debe haber valores negativos', 'error');
	}
	return isNegative;
}

function exceededPorcentage() {
	const isExcededPorcentage = this.data.some((p) => p.discountPercentage > 100);
	if (isExcededPorcentage) {
		this.notification = {
			text: 'El producto no puede tener un porcentaje mayor al 100%',
			title: 'El porcentaje no debe superar el 100%',
			colorDialog: 'error',
			colorHex: '#D5331A',
			colorText: 'error',
			show: true,
		};
	}
	return isExcededPorcentage;
}

function ntvSelected() {
	return this.typeDocumentsSelected === 'NTV';
}

function openCustomerModal(val, customer) {
	this.action.code = val;
	this.action.open = true;
	this.action.title = val === 'customer-details' ? customer.autocomplete : '';
	this.currentCustomer = customer;
	if (val === 'customers-new') {
		this.action.title = 'Nuevo Cliente';
	}
}

function paymentModeSelected() {
	return this.action.code === 'payment-mode';
}

function deleteProducts() {
	this.data = this.data.filter((p) => p.flagUse !== 1);
	helper.setLocalData('products-selected', this.data);
	this.priceAmounts();
}

function priceAmounts() {
	if (!this.orderId) {
		const saleId = !!this.$route.query.cloneId;
		this.data = this.data.map((d) => {
			const newD = { ...d };
			newD.price = Sales.getProductPrice(
				d,
				this.defaultCurrency,
				this.salesCurrency,
				this.exchangeRate,
				saleId
			);
			newD.salePrice = newD.price;
			return newD;
		});

		this.data = Sale.priceAmounts(
			this.data,
			this.defaultCurrency,
			this.salesCurrency,
			this.exchangeRate,
			saleId
		);

		const amounts = Sale.getAmounts(this.data, this.isPeru, this.totalAmountCoupon);
		this.originalTotal = this.data.length === 0 ? 0 : amounts.total;
		this.createDetraction.amount = twoDecimals(
			(amounts.total * this.createDetraction.percentage) / 100
		);
		amounts.coupons = this.totalAmountCoupon;
		amounts.total += this.valueCharge;
		return amounts;
	}
	return this.orderPriceAmount();
}

function productSaved() {
	this.action.code = '';
	this.action.title = '';
	this.action.open = false;
}

function quantityValidation(product, quantity, idx) {
	const productLotId = product.productLotId;
	const stockProduct = product.stock;
	this.temporalProduct = { ...product };
	this.temporalProductIndex = idx;
	this.temporalProductStock = stockProduct;
	const { company } = this.$userInfo;
	const { settings } = company || {};
	const { stockNegative, COTMoveKardex } = settings;
	const isConvertCot = this.$route.query.convert === 'cot';
	const { warBrandStock } = product.product;
	const stockWar = product.quantityOld + warBrandStock - product.quantityDispatch;
	this.data[idx].productPoint = 0;
	this.loyalty.point = 0;
	this.discountPoint = 0;
	if (!stockNegative && product.type === typeProduct.Products) {
		if (isConvertCot && COTMoveKardex && !productLotId) {
			if (
				(Number(quantity) > product.stock || Number(quantity) <= 0) &&
				COTMoveKardex &&
				product.addProduct
			) {
				this.modal.open = true;
				this.objProduct = product;
				this.temporalProductStock = product.stock;
				this.modal.message = `La cantidad máxima que se puede vender del producto es ${product.stock}`;
				this.data[this.temporalProductIndex].quantity = 0;
			} else if (
				(Number(quantity) <= 0 || Number(quantity) > stockWar) &&
				COTMoveKardex &&
				product.id
			) {
				this.modal.open = true;
				this.objProduct = product;
				this.temporalProductStock = stockWar > 0 ? stockWar : product.quantity;
				this.modal.message =
					stockWar > 0
						? `La cantidad máxima que se puede vender del producto es ${stockWar}`
						: `La cantidad máxima que se puede vender del producto es ${this.temporalProductStock}`;
			} else {
				this.data[idx].idProductUnit = `${idx}${product.id}`;
				this.data = Sale.quantityValidation(product, quantity, this.data);
			}
		} else if (Number(quantity) > Number(stockProduct)) {
			this.modal.message = `La cantidad máxima que se puede vender del producto es ${stockProduct}`;
			this.modal.open = true;
		} else {
			this.data[idx].idProductUnit = `${idx}${product.id}`;
			// const filterData = this.data.filter(p => p.id);
			this.data = Sale.quantityValidation(
				product,
				quantity,
				this.data,
				this.exchangeRate,
				this.salesCurrency
			);
			this.disabledFunMaxProduct(
				this.data[idx].priceSaleMax,
				this.data[idx].pricePerSale
			);
		}
	} else {
		this.data[idx].idProductUnit = `${idx}${product.id}`;
		this.data = Sale.quantityValidation(product, quantity, this.data);
	}
}

function disabledFunMaxProduct(maxPrice, pricePerSale, product) {
	if (maxPrice > 0) {
		if (maxPrice < pricePerSale || 0) {
			this.idRow = product.id;
			this.showMaxProduct = true;
			this.notification = {
				colorDialog: 'error',
				colorHex: '#D5331A',
				show: true,
				text: `El precio de venta maximo por producto para continuar es de ${maxPrice}`,
				title: 'IMPORTANTE',
			};
		} else {
			this.disabledMaxProduct = false;
		}
	}
}

async function removeItem() {
	const index = this.data.findIndex((e) => {
		const prop = e.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
		return (
			e[prop] === this.productToRemove[prop] &&
			e.flagFree === this.productToRemove.flagFree
		);
	});
	if (index > -1) {
		this.data.splice(index, 1);
	}
	helper.setLocalData('products-selected', this.data);
	this.removeProduct = false;
}

function rowIsSelected(row) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.data, this.dataSelected));
}

function runAction({ code }) {
	if (code === 'product-register') {
		this.action.title = 'NUEVO PRODUCTO';
		this.action.code = code;
		this.action.open = true;
	} else if (code === 'selling-points' || code === 'historical-sales') {
		this.action.title =
			code === 'historical-sales'
				? 'SELECCIONE UNA SUCURSAL Y TERMINAL'
				: 'SELECCIONE UN PUNTO DE VENTA';
		this.action.code = code;
		this.action.open = true;
		this.action.width = 488;
	} else if (code === 'relate-advance-documents') {
		this.action.title = `${this.customer.typePerson.fullName} - FACTURAS`;
		this.action.code = code;
		this.action.open = true;
		this.action.width = 520;
	} else if (code === 'CB') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = 'CAJAS';
		this.action.width = 450;
	} else if (code === 'assign-seller') {
		if (!this.validateAssignEmployee) {
			this.action.code = code;
			this.action.open = true;
			this.action.title = 'Asignar Vendedor';
			this.action.width = 503;
		}
	}
}

function salesCurrency(newValue, oldValue) {
	const exchange = Sales.getExchange(this.exchangeRate);
	const conversion = oldValue === 'PEN' ? 1 / exchange : exchange;

	this.setConversion(conversion);
}

function salesCurrencySymbol() {
	if (this.typeCoin.length > 0) {
		return this.typeCoin.find((c) => c.code === this.salesCurrency).symbol;
	}
	return false;
}

function closeModalCondicion() {
	this.modalCondicion = false;
	this.closeModal();
}

async function saveCustomer(customer) {
	if (!this.modalCondicion) {
		if (
			this.dataResponseCustomer.condicion !== undefined &&
			this.dataResponseCustomer.condicion !== 'HABIDO'
		) {
			this.modalCondicion = true;
			this.objectCustomer = customer;
			this.dataResponseCustomer = {};
			return;
		}
	}
	this.loadingCustomer = true;
	const url = this.id ? `customers/${this.id}` : 'customers';
	const method = this.id ? 'patch' : 'post';
	let phoneNumbersList = [];
	if (customer.phoneNumbers.length > 0) {
		phoneNumbersList = customer.phoneNumbers;
	} else if (customer.phone) {
		phoneNumbersList = [customer.phone];
	}
	const body = {
		accountAdvanceAccount: null,
		accountingCode: null,
		address: customer.address,
		cityId: null,
		civilStatus: customer.civilStatus,
		contact: customer.contact,
		countryId: null,
		creditLimitDays: null,
		customerType: null,
		dateBirth: null,
		email: customer.email,
		flagAccounting: null,
		flagDetraction: null,
		flagExemptTaxes: null,
		flagItemsWithoutRetainer: null,
		flagPostDatedCredit: null,
		flagRelatedCustomer: null,
		flagRetentionAgent: null,
		flagSpecialContributor: null,
		flagTypePerson: customer.flagTypePerson,
		gender: customer.gender,
		geoPosition: null,
		latitude: null,
		limitAmountCredit: null,
		longitude: null,
		originIncomeId: null,
		parishId: null,
		paymentMethodId: null,
		phone: customer.phone,
		phoneNumbers: phoneNumbersList,
		postalCode: null,
		provinceId: null,
		typeDestinationId: null,
		zone: null,
	};
	if (customer.ruc) {
		body.rzSocial =
			customer.rzSocial || customer.rzSocial.length > 0
				? customer.rzSocial
				: `${customer.name} ${customer.lastname}`;
		body.ruc = customer.ruc;
	} else {
		body.name = customer.name;
		body.lastname = customer.lastname;
		body.dni = customer.dni;
	}
	try {
		const { data: response } = await this.$httpSales[method](url, body);
		this.showNotification('El cliente ha sido creado correctamente');
		this.selectThisCustomer(response, true);
		if (this.modalCondicion) {
			this.modalCondicion = false;
		}
	} catch (err) {
		if (err.data.message === 'CUSTOMER_EXIST_ERROR') {
			this.showNotification('El cliente ya está registrado', 'warning');
			if (this.modalCondicion) {
				this.modalCondicion = false;
				this.closeModal();
			}
		} else {
			this.showGenericError(err.status === 400 ? err.data : err);
		}
	} finally {
		this.loadingCustomer = false;
	}
}

function saveData() {
	if (this.action.code === 'AC') {
		this.newConsideration = false;
	} else if (this.action.code === 'AI') {
		this.newIssue = false;
	} else {
		this.saleInAction = !this.saleInAction;
	}
}

function searching(val) {
	return this.searchValue(val, 1);
}

function searchingProducts(val) {
	return this.searchValue(val, 0);
}

async function searchValue(value, flag) {
	const searchTrim = value ? value.trim() : '';
	const customerExist =
		this.customer && this.customer.autocomplete
			? this.customer.autocomplete.toLowerCase().trim()
			: null;
	const productExist =
		this.newProduct.product && this.newProduct.product.autocomplete
			? this.newProduct.product.autocomplete.toLowerCase().trim()
			: null;
	const itemExist =
		searchTrim && (customerExist || productExist)
			? searchTrim.toLowerCase() === customerExist ||
			  searchTrim.toLowerCase() === productExist
			: null;
	if (searchTrim && !itemExist) {
		this.loading = true;
		const flagSales = true;
		const service = flag
			? this.customerSelections(searchTrim, flagSales)
			: this.productsSelections(searchTrim);
		try {
			const response = await service;
			if (flag) {
				this.customers = [...response.data];
				if (this.customers.length === 1) {
					this.customer = this.customers[0];
					this.selectedCustomer = this.customer.person
						? this.customer.person.fullname
						: null;
					Sale.customer = this.customer;
				} else if (this.customers.length > 1) {
					this.customer = this.customers.find((c) => c.name === this.search);
					this.selectedCustomer = this.customer.person
						? this.customer.person.fullname
						: null;
					Sale.customer = this.customer;
				} else {
					this.customer = {
						autocomplete: '',
						typePerson: {},
					};
					this.selectedCustomer = null;
				}
			} else {
				this.products = response.data.map((prod) => {
					const newProd = { ...prod };
					newProd.autoBarcode = prod.product.autoBarcode;
					newProd.productCubsoCode = prod.product.productCubsoCode;
					newProd.categoryName = prod.product.category.name;
					newProd.code = prod.product.code;
					newProd.description = prod.product.description;
					newProd.name = prod.product.name;
					newProd.priceCost = prod.product ? prod.product.cost : 0;
					newProd.units = prod.product.conversions
						? this.unitsByProduct(prod.product)
						: [{ ...prod.product.unit }];
					newProd.unitConversion = 1;
					newProd.unitId = prod.product.unitId;
					newProd.unitName = prod.product.unit.name;
					newProd.unitQuantity = prod.quantity;
					newProd.warehouseName = prod.warehouse.name;
					newProd.warWarehouseProductBrandId = prod.warWarehouseProductBrandId || prod.id;
					return newProd;
				});
			}
		} catch (err) {
			this.showGenericError();
		} finally {
			this.loading = false;
		}
	}
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

async function selectThisCustomer({ id }, flag) {
	try {
		const { data: customerFiltered } = await this.$httpSalesRead.get(`customers/${id}`);
		this.customers = [{ ...customerFiltered }];
		this.setCustomer(customerFiltered, null, flag);
		this.closeModal();
	} catch (error) {
		this.showGenericError();
	}
}

function setPriceList(list) {
	if (list && list.id) {
		this.newProduct.selectedPriceListId = list.id;
		if (this.data.length > 0) {
			this.changePriceByList(list.id);
		}
	}
}

function getConversionQuantity(product, value, conversion, unitBaseFlag) {
	if (!unitBaseFlag) {
		return (
			getDeeper('conversions', value.id, 'quantity')(product) || conversion.quantity || 1
		);
	}
	return 1;
}
function setData(model, value, row, flagUnitChanged, index) {
	const findRow = this.data.some(
		(p) =>
			p.unitId === value.id &&
			p.product.id === row.product.id &&
			Boolean(p.flagFree) === Boolean(row.flagFree)
	);
	this.unitObject = value;
	if (findRow) {
		this.productDuplicateUnit =
			this.data.filter(
				(p) =>
					p.unitId === value.id &&
					p.product.id === row.product.id &&
					Boolean(p.flagFree) === Boolean(row.flagFree)
			) || [];
	}
	this.showUnits = findRow;
	this.showDuplicateUnit = findRow;
	const newRow = Sale.updateByUnitChange(
		model,
		value,
		row,
		flagUnitChanged,
		this.exchangeRate,
		this.salesCurrency
	);
	if (row.productPoint) {
		newRow.flagFree = false;
		newRow.productPoint = 0;
		this.loyalty.point = 0;
		this.discountPoint = 0;
	}
	if (flagUnitChanged) {
		this.data = updateItemInCollectionByIndex(index, newRow, this.data);
	}
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
}

function stopClick() {
	return false;
}

function toggleColumns() {
	return true;
}

function typePerson() {
	return this.customer ? this.customer.typePerson : {};
}

function unitsByProduct(item, itemSale) {
	if (!item.conversions) return [];
	const conversionsId = Object.keys(item.conversions || {});

	const newUnits = conversionsId.reduce((acum, converId) => {
		const unitOfConversion = this.units.find((u) => u.id === Number(converId));
		if (unitOfConversion) {
			const quantity = item.conversions[converId].quantity;
			acum.push({ ...unitOfConversion, quantity });
		}
		return acum;
	}, []);

	const unitBase = item.unit || {
		id: item.unitId,
		code: item.unitCode,
		name: item.unitName,
	};

	newUnits.unshift(unitBase);

	if (itemSale) {
		const unitNotFound = newUnits.find((u) => u.id === itemSale.unitId);
		if (!unitNotFound) {
			const unitFound = {
				id: itemSale.unitId,
				code: itemSale.unitCode,
				name: itemSale.unitName,
			};
			newUnits.unshift(unitFound);
		}
	}

	return newUnits;
}

function updateNewProduct() {
	this.newProduct.product.pricesListArray = Sale.pricesListByProduct(
		this.newProduct.product
	);
	this.getPriceListId(this.customer);
}

function updatePriceList(product) {
	this.data = this.data.map((p) => {
		const newP = { ...p };
		const prop = p.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
		if (product[prop] === p[prop]) {
			newP.discountPercentage = p.priceList[p.selectedPriceListId].discount;
			newP.pricePerSale = p.priceList[p.selectedPriceListId].price;
			newP.priceEdited = false;
		}
		return newP;
	});
}

function validateExchangeRate(value) {
	let newValue = Number(value);
	if (newValue < 1) {
		newValue = 1;
	}
	this.setConversion(1 / newValue, true);
	this.exchangeRate = newValue;
}

// Trae data del local storge, como  un borrador de la la tabla de ventas
function validateLocalStorage() {
	let newData = [];
	if (helper.getLocalData('products-selected') && !this.$route.query.cloneId) {
		const localProducts = [...helper.getLocalData('products-selected')];
		newData = localProducts.reduce((list, lp) => {
			if (lp.flagSales) {
				const newProd = { ...lp };
				const unit = this.units.find((u) => u.id === lp.unitId) || {};
				const unitByProd = {
					id: lp.unitId,
					code: lp.unitCode || unit.code,
					name: lp.unitName,
				};
				const quantity = lp.quantity || 1;
				newProd.priceCost = lp.product ? lp.product.cost : lp.cost;
				newProd.discountPercentage =
					lp.flagFree && this.isEcuador ? 100 : lp.discountPercentage || 0;
				newProd.discount = lp.discountPercentage
					? this.roundInNumber(
							lp.price * quantity * (Number(lp.discountPercentage) / 100)
					  )
					: 0;
				newProd.units =
					lp.units || (lp.conversions ? this.unitsByProduct(lp) : [{ ...unitByProd }]);
				newProd.unitConversion = lp.unitConversion || 1;
				newProd.flagFree = false;
				newProd.parts = 0;
				newProd.meterage = 0;
				newProd.id = lp.warProductId || lp.id;
				newProd.unitQuantity = quantity;
				newProd.priceBaseToCalculate = this.basePrice;

				const pricePerSaleOrigin =
					newProd.discountPercentage > 0
						? Number(newProd.unitPrice * `1.${newProd.tax}`)
						: newProd.price;
				newProd.pricePerSaleOrigin = fourDecimals(pricePerSaleOrigin);
				if (newProd.warehouseProduct) {
					const priceListProduct = newProd.warehouseProduct.priceList || {};
					const keys = Object.keys(priceListProduct);
					const selectedPriceListId = keys.length > 0 ? keys[0] : null;
					if (selectedPriceListId) {
						newProd.selectedPriceListId = selectedPriceListId;
						newProd.product.priceList = priceListProduct;
					}
				}
				newProd.product.taxes = newProd.product.taxes.map((p) => {
					const newRow = { ...p };
					newRow.idCodeReference = `${p.code}${p.percentage}`;
					return newRow;
				});
				if (!newProd.flagFree) {
					const canFreeTax = newProd.product.taxes.some(
						(t) => t.code === '05' || t.name === 'GRATUITO'
					);
					newProd.canFreeTax = canFreeTax;
					// newProd.product.taxes = this.deleteTaxeFree(newProd.product.taxes);
				} else {
					newProd.pricePerSale = 0;
				}
				return list.concat(newProd);
			}
			return list;
		}, []);
		if (localProducts.length !== newData.length) {
			this.showNotification(
				'Algunos productos no están activos para la venta',
				'warning'
			);
		}
	}
	return newData;
}

function warningModal(item) {
	this.productToRemove = item;
	this.removeProduct = true;
	this.disabledMaxProduct = !this.data.some((p) => p.priceSaleMax < p.pricePerSale);
}

function validations() {
	return {
		data: {
			required,
		},
		entryDate: {
			type: required,
		},
		exchangeRate: {
			type: required,
		},
		typeDocumentsSelected: {
			type: required,
		},
	};
}

function changeDiscountAllRows(props) {
	const { event } = props;
	const newPercentage = Number(event.target.value);
	for (let i = 0; i < this.data.length; i += 1) {
		const item = this.data[i];
		if (!item.flagFree) {
			this.data = Sales.editDiscount(item, newPercentage, this.data, i);
			this.disabledFunMaxProduct(item.priceSaleMax, item.pricePerSale);
		}
	}
}

function recalculateTaxesAndDiscounts() {
	if (!this.data || !this.data.length) return;
	this.data = this.data.map((p) => {
		const newP = { ...p };
		newP.taxes = this.isNTV
			? 0
			: Sales.getTaxesByProductIdReference(this.generalTaxes, newP);
		newP.typeDocumentSelected = this.typeDocumentsSelected;
		if (newP.flagFree) return newP;
		// El precio de venta (con IGV incluido) no cambia; recalcula el P. Unitario,
		// el descuento, el precio y el total con el IGV ya actualizado.
		newP.priceUnitary = fourDecimals(newP.pricePerSaleOrigin / (1 + newP.taxes / 100));
		newP.discount = Sales.getDiscountAmount(
			newP,
			true,
			false,
			this.salesCurrency,
			this.exchangeRate
		);
		newP.pricePerSale = Sales.getPricePerSale(
			newP,
			true,
			false,
			this.salesCurrency,
			this.exchangeRate
		);
		newP.subtotalWithoutTax = Sales.getSubtotalWithoutTax(newP);
		newP.total = Sales.getTotal(newP, true);
		return newP;
	});
}

function getTaxByCountry(user) {
	return user.company && user.company.country ? user.company.country.taxName : null;
}

function resumeTaxes() {
	const amounts = this.priceAmounts;
	return Sale.getTotalTaxesAmounts(amounts, this.data);
}

function changePriceByList(listId) {
	this.data = this.data.map((d) => {
		const newD = { ...d };
		if (this.newProduct.product.id === d.id) {
			newD.selectedPriceListId = listId;
		}
		// // newD.selectedPriceListId = listId;
		return newD;
	});
}
function typeDocumentsSelected(documentValue) {
	if (!documentValue || !this.typeDocuments || !this.typeDocuments.length) return;

	// Priorizar this.customer SI tiene ID. Si no, usar this.sale.customer como fallback
	const customerToCheck =
		this.customer && this.customer.id
			? this.customer
			: this.sale && this.sale.customer
			? this.sale.customer
			: this.customer;

	const isRuc =
		customerToCheck &&
		customerToCheck.typePerson &&
		customerToCheck.typePerson.documentName === 'RUC';

	let documentFinded = this.typeDocuments.find(
		(t) => t.documentType.code === documentValue
	);

	// VALIDACIÓN ESTRICTA: Si es Factura y no es RUC, forzamos el cambio al ideal
	const isInvoiceForNonRuc =
		documentFinded && documentFinded.documentType.code === 'FAC' && !isRuc;

	if (!documentFinded || isInvoiceForNonRuc) {
		const idealCode = this.typeDocumentSelected();
		documentFinded =
			this.typeDocuments.find((t) => t.documentType.code === idealCode) ||
			this.typeDocuments[0];
	}
	if (documentFinded) {
		this.idTypeDocumentSelect = documentFinded.comTypeDocumentId;
		this.loadConfigData(documentFinded.documentType.code);
		this.recalculateTaxesAndDiscounts();

		// Si tuvimos que corregir la selección (ej: seleccionó FAC siendo DNI), disparamos selectDocument
		if (isInvoiceForNonRuc) {
			this.showGenericError(
				'Solo se pueden emitir Facturas a clientes con un RUC válido.'
			);
			this.selectDocument(documentFinded.documentType);
		}
	}
}

function setCustomer(customer, customerLoading, fromSearchForm) {
	const newCustomer = !customer && customerLoading ? { ...this.customers[0] } : customer;
	if (newCustomer) {
		const flagGeneric = this.$userInfo.company.settings.flagGenericSalesCustomer || true;
		if (newCustomer.flagGeneric === 1 && !flagGeneric) {
			this.notification.colorDialog = 'error';
			this.notification.colorHex = '#D5331A';
			this.notification.title = 'CREAR VENTA';
			this.notification.text = `No se podra realizar una venta con ${newCustomer.fullName}`;
			this.notification.show = true;
		} else {
			const isCustomerAddress =
				newCustomer.customerAddress && newCustomer.customerAddress.length > 1;
			this.customer = {
				...newCustomer,
				selectAddress: isCustomerAddress
					? newCustomer.customerAddress[0].addressLine1
					: null,
				selectAddressId: isCustomerAddress ? newCustomer.customerAddress[0].id : null,
				alias: isCustomerAddress ? newCustomer.customerAddress[0]?.name : null,
			};
			this.selectedCustomer = newCustomer.typePerson
				? newCustomer.typePerson.fullName
				: null;
			if (this.$userInfo.company.flagLoyalti === 1) {
				if (newCustomer.point === null) {
					this.flagPoint = false;
				} else {
					this.flagPoint = true;
					this.pointClient = newCustomer.point;
				}
			}
			this.getPriceListId(newCustomer);
			if (newCustomer.flagActive === 0) {
				this.showNotification(
					'El cliente se encuentra bloqueado, no se pude continuar con la venta.',
					'warning'
				);
			}
			this.closeModal();
			const inputRef =
				this.flagUseGun && this.isSaleRole && this.selectedWarehouse
					? 'productSearcherByGun'
					: 'productSearcher';
			setTimeout(() => {
				const el = this.$refs[inputRef].$el || this.$refs[inputRef];
				const input = el && el.querySelector('input');
				input.focus();
			}, 0);
			setTimeout(() => {
				this.loadingGeneral = false;
			}, 1000);
		}
		const { dataClient = {} } = this.sale;
		const { quotation } = dataClient;
		const quotationDataClient = JSON.parse(
			JSON.stringify(
				quotation ? (quotation.quotation ? quotation.quotation : quotation) : {}
			)
		);
		const existAddress =
			quotationDataClient &&
			quotationDataClient.customer &&
			quotationDataClient.customer.customerId === newCustomer.id;

		if (this.$route.query.cloneId && existAddress) {
			this.customer = {
				...this.customer,
				...quotationDataClient.customer,
				selectAddress: quotationDataClient.customer.address,
			};
		}

		// Forzamos la selección del documento ideal basado en el cliente SOLO si viene del buscador
		if (fromSearchForm) {
			const isRucNew =
				newCustomer.typePerson && newCustomer.typePerson.documentName === 'RUC';

			if (isRucNew) {
				// Si es RUC, forzamos Factura (FAC)
				const fac = this.typeDocuments.find((t) => t.documentType.code === 'FAC');
				if (fac) this.selectDocument(fac.documentType);
			} else {
				// Si NO es RUC, nos aseguramos de no estar en Factura
				const idealCode = this.typeDocumentSelected();
				const docObj = this.typeDocuments.find((t) => t.documentType.code === idealCode);
				if (docObj) {
					this.selectDocument(docObj.documentType);
				}
			}
		}
	}
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	if (this.searchVal) {
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 930;
		this.action.open = true;
	}
}

function settingNewProduct(prod, flag) {
	const newProd = { ...prod };
	if (this.$domainsUser) {
		newProd.showNegative = prod.product ? prod.product.flagStockNegative : null;
		newProd.flagStockNegative = prod.product
			? Boolean(prod.product.flagStockNegative)
			: false;
	}
	if (flag === 'free') {
		newProd.priceList = this.priceListProdFree(prod.priceList);
		newProd.product.priceList = this.priceListProdFree(prod.product.priceList);
	}
	newProd.groupsProduct =
		prod.product && prod.product.groups ? prod.product.groups : null;
	newProd.groupsProduct =
		newProd.groupsProduct &&
		newProd.groupsProduct.map((row) => {
			const newRow = {};
			newRow.productId = row.productId;
			newRow.quantity = row.quantity;
			newRow.unitQuantity = row.unitQuantity;
			newRow.price = row.price;
			newRow.name = row.product.name;
			return newRow;
		});
	newProd.attributeList =
		prod.product.additionalInformation && prod.product.additionalInformation.attributes
			? prod.product.additionalInformation.attributes
			: null;
	newProd.units = prod.product.conversions
		? this.unitsByProduct(prod.product)
		: [{ ...prod.product.unit }];
	newProd.priceBaseToCalculate = this.basePrice;
	newProd.flagFree = flag === 'free';
	if (flag === 'not-free') {
		const canFreeTax = newProd.product.taxes.some(
			(t) => t.code === '05' || t.name === 'GRATUITO'
		);
		newProd.canFreeTax = canFreeTax;
		// newProd.product.taxes = this.deleteTaxeFree(newProd.product.taxes);
	}
	newProd.product.taxes = prod.product.taxes.map((tax) => {
		const newRowTax = { ...tax };
		newRowTax.idCodeReference = `${tax.code}${tax.percentage}`;
		return newRowTax;
	});
	newProd.typeDocumentSelected = this.typeDocumentsSelected;
	newProd.pricesListArray = this.setPricesListByProduct(
		this.pricesList,
		newProd.priceList,
		flag
	);
	this.newProduct.product = { ...newProd };
	const defaultListPrice = this.pricesList.find((p) => p.flagDefault === 1);
	const priceListFind = newProd.pricesListArray.find(
		(p) => p.id === this.newProduct.selectedPriceListId
	);
	const validPriceList = priceListFind ? priceListFind.id : null;
	const listDefault =
		Sale.defaultPriceList && Sale.defaultPriceList.id
			? Sale.defaultPriceList.id
			: this.$userInfo.salPriceList.id;
	const priceListId = validPriceList || defaultListPrice.id || listDefault;
	this.setPriceList({ id: priceListId });
	if (this.flagUseGun && this.isSaleRole && this.selectedWarehouse) {
		this.cleanInput = true;
		setTimeout(() => {
			this.$refs.productSearcherByGun.$el.children[0].children[0].children[0].children[0].children[0].focus();
		}, 0);
	}
}

function setPricesListByProduct(pricesList, productPricesList) {
	const pricesListArray = [];
	const ids = Object.keys(productPricesList);
	ids.forEach((plId) => {
		const currentPriceList = find(equality('id', Number(plId)), pricesList);
		if (!isEmpty(currentPriceList)) {
			const priceListObject = {
				id: currentPriceList.id,
				name: currentPriceList.name,
				...productPricesList[plId],
			};
			pricesListArray.push(priceListObject);
		}
	});
	return pricesListArray;
}

function setProduct(prod, flag) {
	this.settingNewProduct(prod, flag);
	this.selectedProduct = prod.product.name;
	this.closeModal();
	setTimeout(() => {
		const firstInput = this.$refs.productQuantity.$el.querySelector('input');
		if (firstInput) {
			firstInput.value = '';
			firstInput.focus();
		}
	});
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function roundTotalPrice() {
	const { total } = this.priceAmounts;
	return Number(total.toFixed(2));
}

function makeProductCommentary(row, index) {
	this.currentProduct = { ...row, index };
	if (!row.commentary) {
		this.currentProduct.commentary = '';
	}
	this.action = {
		active: true,
		code: 'COMME',
		open: true,
		title: row.name,
		width: 450,
	};
}

function setComentary(value) {
	this.currentProduct.commentary = value.commentary;
	this.currentProduct.expirationDate = value.expirationDate;
	this.currentProduct.lot = value.lot;
	this.currentProduct.location = value.location;
	this.data = updateItemInCollectionByIndex(
		this.currentProduct.index,
		this.currentProduct,
		this.data
	);
	this.closeModal();
}

function setComentaryLot(newDataProduct, commentary) {
	this.currentProduct.commentary = commentary;
	this.data = updateItemInCollectionByIndex(
		this.currentProduct.index,
		this.currentProduct,
		this.data
	);
	this.closeModal();
}

function isCommentary() {
	return this.action.code === 'COMME';
}

function blockedCustomer() {
	return this.customer.flagActive === 0;
}

function openSliderModal(code, title = '', width = 500) {
	this.action = {
		active: true,
		code,
		open: true,
		title,
		width,
	};
	if (code === 'AC') {
		this.newConsideration = true;
	} else if (code === 'AI') {
		this.newIssue = true;
	} else if (code === 'DC') {
		if (this.sale.dataClient) {
			const template = { ...this.sale.dataClient.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.dataForm = objectOrder;
			const templatePayment = { ...this.sale.dataClient.payment };
			const arrayPayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayPaymentReverse = arrayPayment.reverse();
			const objectPayment = Object.fromEntries(arrayPaymentReverse);
			this.dataPayment = objectPayment;
			const templateFac = { ...this.sale.dataClient.dataFac };
			const arrayFac = Object.entries(templateFac).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayFacReverse = arrayFac.reverse();
			const objectFac = Object.fromEntries(arrayFacReverse);
			this.dataFac = objectFac;
			this.urlVoucher = this.sale.dataClient ? this.sale.dataClient.urlVoucher : null;
		}
	} else if (code === 'DA') {
		this.showAditional = true;
	}
}

function addConsiderations(considerations) {
	this.considerations = [...considerations];
	this.closeModal();
}

function addIssues(issues) {
	this.workToDo = [...issues];
	this.closeModal();
}

function setTaxes(item) {
	const { taxes: taxesProduct } = item;
	const taxes = taxesProduct.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});
	if (taxes.length) {
		taxes[0].flagSales = taxes[0].flagSales ? 1 : 0;
	}
	const newItem = setNewProperty('product', { taxes })(item);
	return Sales.getTaxesByProductIdReference(this.generalTaxes, newItem);
}

function setSubtotal(item) {
	const { priceUnitaryReal, quantity } = item;
	const subTotal = priceUnitaryReal * quantity;
	return Number(subTotal.toFixed(2));
}

function setPriceUnitary(item) {
	const { priceUnitaryReal } = item;
	return Number(priceUnitaryReal.toFixed(4));
}

function setPriceUnitaryReal(item) {
	const { taxes, salePrice } = item;
	const priceUnitary = salePrice / (1 + taxes / 100);
	return priceUnitary;
}

function updateTaxes(item) {
	const taxes = item.product ? item.product.taxes : item.taxes || [] || [];
	if (taxes.length) {
		const flagSales = taxes[0].flagSales;
		taxes[0].flagSales = flagSales ? 1 : 0;
	}
	const newTaxes = taxes.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});
	return setNewProperty('taxes', newTaxes)(item.product);
}

async function setOrderData(order) {
	Sale.generalTaxes = this.generalTaxes;
	const { customer, details, priceSaleMax, priceSaleMin } = order;
	await this.selectThisCustomer(customer);
	this.commentary = order.comments;
	this.data = details.map((det) => {
		const { additionalInformation } = det;
		let parts = 0;
		let meterage = 0;
		if (additionalInformation && additionalInformation.dynamicFields) {
			parts = additionalInformation.dynamicFields.parts || 0;
			meterage = additionalInformation.dynamicFields.meterage || 0;
		}
		const defaultListPrice = this.pricesList.find((p) => p.flagDefault === 1);
		const priceListId = this.customer.salPriceListId || defaultListPrice.id;
		const units = det.product.conversions ? this.unitsByProduct(det.product) : this.units;
		const cost = det?.product?.cost;
		const totalCost =
			det.product.flagIgv && det.tax
				? det.product.cost * (1 + det.tax / 100)
				: det.product.cost;

		return compose(
			setNewPropertyByFunction('product', this.updateTaxes, false),
			setNewProperty('units', [...units]),
			createPropertyByOtherOne('name', 'productName'),
			setNewPropertyByFunction('tax', this.getTaxesAmount, false),
			setNewPropertyByFunction('total', Sales.getTotal, false),
			setNewPropertyByFunction('subtotal', this.setSubtotal, false),
			setNewPropertyByFunction('pricePerSale', Sales.getPricePerSale),
			setNewPropertyByFunction('price', Sales.getPricePerSale),
			setNewPropertyByFunction('discount', Sales.getDiscountAmount),
			setNewPropertyByFunction('priceUnitary', this.setPriceUnitary, false),
			setNewPropertyByFunction('priceUnitaryReal', this.setPriceUnitaryReal, false),
			setNewPropertyByFunction('taxes', this.setTaxes, false),
			createPropertyByOtherOne('code', 'productCode'),
			// setNewProperty('warehouseName', warehouseName),
			createPropertyByOtherOne('discountPercentage', 'discountPercentage'),
			setNewProperty('priceBaseToCalculate', this.basePrice),
			setNewProperty('customer', this.customer),
			setNewProperty('priceSaleMax', priceSaleMax || 0),
			setNewProperty('priceSaleMin', priceSaleMin || 0),
			setNewProperty('parts', parts || 0),
			setNewProperty('meterage', meterage || 0),
			setNewProperty('weightProduct', det.weight || 0),
			setNewProperty('priceList', det.product.priceList),
			setNewProperty('selectedPriceListId', priceListId),
			setNewProperty('taxCostPercentage', det.tax),
			setNewProperty('cost', cost),
			setNewProperty('totalCost', Number(totalCost.toFixed(4)))
		)(det);
	});
}

function orderPriceAmount() {
	const amounts = Sale.getAmounts(this.data, this.isPeru, this.totalAmountCoupon);
	return amounts;
}

function openSeries(row) {
	this.action = {
		active: true,
		code: 'sales-series',
		open: true,
		title: row.name,
		width: 680,
	};
	this.quantitySeries = row.quantity;
	this.productSelectedSerie = row;
}

function sendSeries(rows, id, sumSeries) {
	this.sumSeries = Boolean(sumSeries);
	if (rows.length) {
		const array = rows.map((r) => r.id);
		this.data = this.data.map((row) => {
			const newRow = { ...row };
			if (row.id === id || row.productId === id) {
				newRow.quantity = sumSeries;
				newRow.series = array;
				newRow.sumSeries = sumSeries;
			}
			return newRow;
		});
	}
	const index = this.data.findIndex((p) => p.product.id === id);
	if (index > -1) {
		this.data[index].total = this.data[index].quantity * this.data[index].price;
	}
	this.closeModal();
}

function quantityTotal() {
	return twoDecimals(this.data.reduce((total, item) => total + Number(item.quantity), 0));
}

function validateCustomerLimitAmountCredit() {
	const { limitAmountCredit } = this.customer;
	return !!(limitAmountCredit && this.priceAmounts.total > limitAmountCredit);
}

function resumeTaxesList() {
	const amounts = this.priceAmounts;
	return Sale.getTaxeslist(amounts, this.data);
}

function resumeTotalUnits() {
	const totalUnits = this.data.reduce((accum, p) => {
		const flagUnit = this.units.filter((u) => u.id === p.unitId);
		const nameUnit = flagUnit.length ? flagUnit[0].name : 'Otros';
		const newAccum = { ...accum };
		if (newAccum[nameUnit]) {
			newAccum[nameUnit] += p.quantity;
		} else {
			newAccum[nameUnit] = 0;
			newAccum[nameUnit] += p.quantity;
		}
		return newAccum;
	}, {});
	return totalUnits;
}

function validateTaxesBag() {
	const isTaxesBag = this.data.reduce((accum, row) => {
		if (row.product.taxes.filter((t) => t.name === 'ICBPER').length) {
			return true;
		}
		return accum;
	}, false);
	return isTaxesBag;
}

function notSale() {
	const flagCustomer = this.customer.id ? this.customer.flagGeneric : true;
	return this.priceAmounts.total > 200 && !!flagCustomer && this.isEcuador;
}

function disabledBtnSale(flag) {
	this.validateDateLimit = flag;
}

function valueCharge() {
	let value = 0;
	if (this.quantityCharge) {
		value =
			this.selectCharges === 'currency'
				? this.quantityCharge
				: (this.originalTotal * (this.quantityCharge / 100)).toFixed(2);
	}
	return Number(value);
}

function changeTotal(value) {
	this.priceAmounts.total = this.originalTotal + value;
}

function toggleSelect(code) {
	this.selectsTotal = this.selectsTotal.map((s) => {
		const newSelect = { ...s };
		newSelect.select = s.code === code ? !s.select : false;
		return newSelect;
	});
}

function paymentInvoiceSelect() {
	const productFromAdvanceInvoice = this.data.some((p) => p.flagAdvanceInvoice);
	if (productFromAdvanceInvoice) {
		return !productFromAdvanceInvoice;
	}
	return this.typeDocumentsSelected === 'FAC';
}

function changePaymentSelect(value) {
	if (!value) {
		this.paymentInvoice = value;
	}
}

async function loadConfigData(documentCode) {
	try {
		this.isLoading = true;
		({ data: this.configInfo } = await this.$httpSales.get(
			`terminals/${documentCode}/user`
		));
		if (this.historicalSalesActive && this.configInfo.serie) {
			this.number = Number(this.configInfo.serie.number) + 1;
		}
		const {
			typeBilling,
			subsidiary: { settings },
		} = this.configInfo.serie;
		this.configInfo.cash = this.configInfo.terminal.cash || {};
		this.configInfo.cash.balance = this.configInfo.terminal.cash.balance || {};
		this.configInfo.serie.typeBillingTooltip =
			typeBilling === 1 ? 'Electrónica' : 'Física';
		this.configInfo.serie.typeBillingName = typeBilling === 1 ? 'Elec.' : 'Fís.';
		this.flagWithholdingSubsidiary = settings.flagWithholdingAgent;
		// this.loadBalance(this.configInfo.cash.id);
		if (!this.customer.id) {
			setTimeout(() => this.customerFocused(), 0);
		}
		const serieExist = this.configInfo.serie
			? this.configInfo.serie.comSubsidiariesId
			: null;
		const subsidiary = this.subsidiaries.find((p) => p.id === serieExist);
		this.subsidiary = subsidiary;
		if (
			this.subsidiary &&
			this.subsidiary.settings &&
			this.subsidiary.settings.flagDetraction
		) {
			await this.loadSunat();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SERIE_EXIST') {
				this.showGenericError(
					'El documento seleccionado no cuenta con una serie para crear ventas.'
				);
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function disabledBtnPaySale() {
	const isPayCredit = this.paymentSelected === 'CREDITO';
	return (
		(this.valueWithholding && !this.amountWithholding) ||
		this.feeError ||
		this.disabledPayBtn ||
		(this.validateCustomerLimitAmountCredit && isPayCredit) ||
		(this.customer.flagGeneric && isPayCredit) ||
		this.validateDateLimit ||
		this.saleLoading ||
		this.showLimit ||
		this.loadingImg
	);
}

function nextInputFocused(field, index) {
	const total = this.data.length - 1;
	const nextIndex = total === index ? 0 : index + 1;
	this.$refs[`${field}${nextIndex}`].$el.children[0].children[0].focus();
}

function disabledActionBar() {
	const advanceDisabled =
		isEmpty(this.customer.id) ||
		this.typeDocumentsSelected !== 'FAC' ||
		this.paymentInvoice;
	const assignSellerDisabled = this.data.length > 0;
	const message = `<p>Para poder Asignar un vendedor
		es necesario activar la opción <br> mostrar
		lista de vendedores en la configuración de la tienda.</p>`;
	return [
		{ code: 'relate-advance-documents', disabled: advanceDisabled },
		{
			code: 'assign-seller',
			disabled: !assignSellerDisabled,
			showMessage: this.validateAssignEmployee,
			message,
		},
		{ code: 'generate-coupon', disabled: !this.customer },
	];
}

async function updateData(products) {
	this.totalAdvanceInvoice = products.reduce(this.calculateTotalInvoice, 0);
}

function calculateTotalInvoice(acc, product) {
	const { salePrice, quantity } = product;
	const subTotal = salePrice * quantity;
	const total = acc + subTotal;
	return Number(total.toFixed(2));
}

function beforeRouteLeave(to, from, next) {
	if (from.name !== to.name) {
		helper.removeLocalData('advance-invoice-selected');
	}
	next();
}

function selectDocument(doc) {
	const { code: codeDocument, name: nameDocument } = doc;
	this.typeDocumentsSelected = codeDocument;
	this.typeDocumentsName = nameDocument;
	this.documentSelected = { ...doc };
	if (codeDocument === 'FAC' && (this.notFacSale || this.notFacRuc)) {
		this.customer = {
			autocomplete: '',
			typePerson: {},
		};
		this.selectedCustomer = null;
	} else if (!this.customer.autocomplete) {
		this.setCustomer(this.customers.find((c) => c.flagGeneric));
	}
	if (
		this.historicalSalesActive &&
		['FAC', 'BOL'].includes(codeDocument) &&
		this.sale.createdAt
	) {
		const dateVal = new Date(this.sale.createdAt.replace(/-/g, '/'));
		const today = startOfDay(new Date());
		const minDate = codeDocument === 'FAC' ? subDays(today, 3) : subMonths(today, 1);
		const minDateMsg =
			codeDocument === 'FAC'
				? 'La fecha se actualizó a la actual porque para Factura no puede ser anterior a los últimos 3 días'
				: 'La fecha se actualizó a la actual porque para Boleta no puede ser anterior a 1 mes previo';
		if (isBefore(startOfDay(dateVal), minDate)) {
			this.sale.createdAt = format(today, 'YYYY-MM-DD');
			this.showNotification(minDateMsg, 'warning');
		}
	}
}

function savePoint(point) {
	this.configInfo.serie.salTerminalsId = point.id;
	this.configInfo.cash.id = point.cash.id;
	this.configInfo.cash.name = point.cash.name;
	this.configInfo.cash.balance = point.cash.balance;
	this.configInfo.terminal.name = point.name;
	this.configInfo.terminal.id = point.id;
	this.configInfo.serie.terminal.id = point.id;
	this.configInfo.serie.terminal.name = point.name;
	this.configInfo.serie.typeBilling = point.serie.typeBilling;
	this.configInfo.serie.typeBillingTooltip =
		point.serie.typeBilling === 1 ? 'Electrónica' : 'Física';
	this.configInfo.serie.typeBillingName =
		point.serie.typeBilling === 1 ? 'Elec.' : 'Fís.';
	this.configInfo.serie.id = point.serie.id;
	this.configInfo.serie.serie = point.serie.serie;
	this.configInfo.serie.number = point.serie.number;
	this.configInfo.serie.comSubsidiariesId = point.comSubsidiariesId;
	this.historicalSalesActive = this.action.code === 'historical-sales';
	this.number = this.historicalSalesActive ? Number(point.serie.number) + 1 : null;
	this.flagOldSale = this.historicalSalesActive;
	this.sale.createdAt = format(this.$today(), 'YYYY-MM-DD');
	this.closeModal();
	const serieExist = this.configInfo.serie
		? this.configInfo.serie.comSubsidiariesId
		: null;
	const subsidiary = this.subsidiaries.find((p) => p.id === serieExist);
	this.subsidiary = subsidiary;
}

function selectBasePrice(basePrice, priceToHide) {
	this.basePrice = basePrice;
	this.priceToHide = priceToHide;
	this.data = Sales.updateBasePriceToCalculateTotal(basePrice, this.data);
}

function getTaxesAmount(product) {
	const { discount, quantity, subtotalWithoutTax, total, taxes } = product;
	if (this.basePrice === BasePrice.PU) {
		const totalDicount = discount * quantity;
		const taxAmount = total - (subtotalWithoutTax - totalDicount);
		return Number(taxAmount.toFixed(4));
	}
	let valueTaxes = null;
	if (!this.isNTV) {
		const index = this.data.findIndex((p) => p.id === product.id);
		valueTaxes = Sales.getTaxesByProductIdReference(this.generalTaxes, product);
		if (index > -1) {
			this.data[index].taxes = valueTaxes;
			this.data[index].typeDocumentSelected = this.typeDocumentsSelected;
		}
	}
	let taxPercentage = 0;
	taxPercentage = this.isNTV ? taxes : valueTaxes;
	if (this.isNTV) {
		taxPercentage = 0;
		const index = this.data.findIndex((p) => p.id === product.id);
		if (index > -1) {
			this.data[index].taxes = 0;
			this.data[index].typeDocumentSelected = this.typeDocumentsSelected;
		}
	}
	const taxAmount = lib.calculateTaxAmountFromTotal(total, taxPercentage);
	return fourDecimals(taxAmount);
}

function computedColumns() {
	const indexToHide = this.columns.findIndex((col) => col.basePrice === this.priceToHide);
	const indexToShow = this.columns.findIndex((col) => col.basePrice === this.basePrice);
	this.$set(this.columns[indexToHide], 'visible', false);
	this.$set(this.columns[indexToShow], 'visible', true);
	return this.columns;
}

function notBolSale() {
	const flagCustomer = this.customer.id ? this.customer.flagGeneric : true;
	return (
		this.priceAmounts.total > this.maximumAmountBol &&
		!!flagCustomer &&
		this.isPeru &&
		this.typeDocumentsSelected === 'BOL'
	);
}

function notFacSale() {
	const flagCustomer = this.customer.id ? this.customer.flagGeneric : true;
	return !!flagCustomer && this.isPeru && this.typeDocumentsSelected === 'FAC';
}

function existCustomer() {
	return !this.selectedCustomer;
}

function notFacRuc() {
	const flagRuc =
		this.customer.id && this.isPeru
			? this.customer.typePerson.documentName !== 'RUC' &&
			  !this.customer.flagGeneric &&
			  this.typeDocumentsSelected === 'FAC'
			: false;
	return flagRuc;
}

function setPayment(value) {
	this.paymentSelected = value;
}

// function checkPriceMin() {
// 	const somePriceMin = this.data.some(p => Number(p.pricePerSale) < Number(p.priceSaleMin));
// 	if (somePriceMin) {
// 		this.showNotification(
// 			'Algunos productos tienen el precio de venta menor a su
// configuración. Debe editar el producto o cambiar el precio',
// 			'warning',
// 		);
// 		return true;
// 	}
// 	return false;
// }

function validateInput({ pricePerSale, priceSaleMin }) {
	return pricePerSale < priceSaleMin;
}

function changeCash(cash) {
	this.configInfo.cash.id = cash.id;
	this.configInfo.cash.name = cash.name;
	this.configInfo.cash.balance[this.$userInfo.company.currency] = cash.balance;
	// this.loadBalance(cash.id);
	this.closeModal();
}

function deleteTaxeFree(taxes) {
	return taxes.filter((t) => t.code !== '05' || t.name !== 'GRATUITO');
}

function allowProductFree() {
	const adminUser = helper.getLocalData('admin-user');
	return getDeeper('subsidiary', 'settings', 'allowProductFree')(adminUser);
}

function basePriceComputed() {
	return BasePrice;
}

function changeExchangeRate() {
	const body = {
		amount: this.exchangeRate,
	};
	this.$httpSales.post('exchange-rates', body);
}

function maximumAmountBol() {
	return this.salesCurrency === 'PEN' ? 700 : 180;
}

function validateAssignEmployee() {
	const settings = getDeeper('warehouse', 'settings')(this.$userInfo);
	if (settings) {
		if (settings.assignEmployee) {
			if (settings.showByServiceProduct && settings.showByFinishedProduct) {
				return false;
			} else if (settings.showByServiceProduct) {
				const numService = this.data.filter((d) => d.type === typeProduct.Services);
				return !(numService.length > 0);
			} else if (settings.showByFinishedProduct) {
				const numProduct = this.data.filter((d) => d.type === typeProduct.Products);
				return !(numProduct.length > 0);
			}
			return false;
		}
		return true;
	}
	return true;
}

function resetEmployee() {
	if (this.orderId && this.assignedEmployed && this.sale.employeeId) {
		const findEmployee = this.employees.find(
			(employee) => employee.id === this.sale.employeeId
		);
		this.employee = findEmployee;
		this.employeeId = findEmployee.id;
		this.params = setNewProperty('employeeId', findEmployee.id)(this.params);
	} else {
		this.employee.id = getDeeper('id')(this.$userInfo);
		this.employee.fullName = `${this.$userInfo.name} ${this.$userInfo.lastname}`;
	}
}

function changeEmployee(employee) {
	this.employee.id = employee.id;
	this.employee.fullName = employee.fullname;
	this.closeModal();
}

function changeAssignEmployee(value) {
	if (value) {
		this.resetEmployee();
	}
}

function addPercentage(value) {
	this.percentage = value;
	this.percentageDetails = this.data.map((p) => {
		const prop = p.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
		const newPrice = p.pricePerSale * (value / 100);
		const newData = {
			id: p[prop],
			surcharge: newPrice,
		};
		this.editPricePerSale(p, null, twoDecimals(p.pricePerSale + newPrice));
		return newData;
	});
}

function editPricePerSale(product, index, newPrice, isPeru) {
	const valueDecimal = newPrice.toString().split('.')[1];
	this.isDisabledPrice = valueDecimal && valueDecimal.length > 4;
	if (valueDecimal && valueDecimal.length > 4) {
		this.viewShowError();
	}
	this.data[index].productPoint = 0;
	this.loyalty.point = 0;
	this.discountPoint = 0;
	this.data = Sales.editPricePerSale(product, newPrice, this.data, index, isPeru);
	if (Number(newPrice) < product.priceSaleMin) {
		this.notification = {
			colorDialog: 'error',
			colorHex: '#D5331A',
			show: true,
			text: `Para poder continuar el precio de venta
			del producto debe tener como minimo de ${product.priceSaleMin}`,
			title: 'IMPORTANTE',
		};
		this.idRow = product.id;
		this.showMaxProduct = false;
	}
	if (index) {
		this.disabledFunMaxProduct(this.data[index].priceSaleMax, newPrice, product);
	} else {
		this.disabledFunMaxProduct(product.priceSaleMax, newPrice, product);
	}
}

function removePercentage(value) {
	if (value) {
		this.percentageDetails = {};
		this.data.forEach((p) => {
			const newPrice = twoDecimals((p.pricePerSale * 100) / (100 + value));
			this.editPricePerSale(p, newPrice);
		});
		this.percentage = 0;
	}
}

function isAction(code, anotherCode) {
	return this.action.code === code || this.action.code === anotherCode;
}

function setSerieData({ model, value }) {
	this[model] = value;
}

function disabledHistoricalDate(date) {
	const docType = this.typeDocumentsSelected;
	if (!['FAC', 'BOL'].includes(docType)) {
		return false;
	}
	const today = startOfDay(new Date());
	const minDate = docType === 'FAC' ? subDays(today, 3) : subMonths(today, 1);
	const target = startOfDay(date);
	return isBefore(target, minDate) || isAfter(target, today);
}

function setHistoricalData({ model, value }) {
	if (!value) {
		this.sale[model] = null;
		return;
	}
	const docType = this.typeDocumentsSelected;
	const isTaxDocument = ['FAC', 'BOL'].includes(docType);
	if (isTaxDocument) {
		const dateVal = new Date(value.replace(/-/g, '/'));
		const today = startOfDay(new Date());
		const minDate = docType === 'FAC' ? subDays(today, 3) : subMonths(today, 1);
		const minDateMsg =
			docType === 'FAC'
				? 'La fecha no puede ser anterior a los últimos 3 días'
				: 'La fecha no puede ser anterior a 1 mes previo';

		if (isAfter(startOfDay(dateVal), today)) {
			this.showNotification('La fecha no puede ser mayor a la actual', 'warning');
		} else if (isBefore(startOfDay(dateVal), minDate)) {
			this.showNotification(minDateMsg, 'warning');
		} else {
			this.sale[model] = value;
		}
	} else if (isAfter(value, this.$today())) {
		this.showNotification('La fecha no puede ser mayor a la actual', 'warning');
	} else {
		this.sale[model] = value;
	}
}

// async function loadBalance(cashId) {
//	const params = {
//		cashIds: cashId,
//	};
//	try {
//		({ data: this.cashInfo } = await this.$httpSales.get(
//			`cash-balance-total/${this.salesCurrency}`, { params }));
//	} catch (err) {
//		if (err.status === 500) {
//			this.showGenericError();
//		}
//	}
// }

async function loadProductsPoint(page = 1) {
	this.currentPagePoint = page;
	this.paramsPoint.page = this.currentPagePoint;
	const params = { ...this.paramsPoint };
	try {
		const { data: response, headers } = await this.$httpProducts.get('products/master', {
			params,
		});
		this.rowsProductsPoint = response.map((r) => {
			const newRow = { ...r };
			newRow.isSelected = false;
			return newRow;
		});
		this.lastPagePoint = Number(headers['x-last-page']);
		this.totalItemsPoint = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function rowIsSelectedPoint(row) {
	this.rowsProductsPoint = this.rowsProductsPoint.map((r) => {
		const newR = { ...r };
		if (newR.id === row.id) {
			newR.isSelected = row.isSelected;
		}
		return newR;
	});
	this.checkAllPoint = this.rowsProductsPoint.every((r) => r.isSelected);
	this.dataSelectedPoint = this.rowsProductsPoint.filter((r) => r.isSelected);
}

function searchEventPoint(search) {
	this.params.search = search ? search.trim() : '';
	this.loadProductsPoint();
}

function allSelectedProductsPoint(checked) {
	this.rowsProductsPoint = this.rowsProductsPoint.map((r) => {
		const newRow = { ...r };
		newRow.isSelected = checked;
		return newRow;
	});
	this.checkAllPoint = this.rowsProductsPoint.every((r) => r.isSelected);
	this.dataSelectedPoint = this.rowsProductsPoint.filter((r) => r.isSelected);
}

function changePagePoint(page) {
	this.loadProductsPoint(page);
}

async function saveProductsPoint() {
	const index = this.data.findIndex(
		(prod) =>
			prod.id === this.newProduct.product.id &&
			prod.flagFree === this.newProduct.product.flagFree
	);
	if (index < 0) {
		const dataTransformed = await Sales.addProductsSale(this.dataSelectedPoint);
		this.data.push(dataTransformed);
		this.closeModal();
	} else {
		this.showNotification('El producto ya ha sido agregado.', 'info');
	}
}

function setPoint({ value }) {
	this.messageErrorPoints = '';
	const points = Number(value);
	const valueMoney =
		this.$userInfo.subsidiary.settings.configLoyalti.equivalentMoney.cost;
	const pointMoney =
		this.$userInfo.subsidiary.settings.configLoyalti.equivalentMoney.point;
	this.loyalty.point = points;
	this.discountPoint = twoDecimals(Number((points / pointMoney) * valueMoney || 0));
}

function openDialogPoint(row) {
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { settings: settingsSubsidiary } = subsidiaryUser || {};
	const { configLoyalti: configLoyaltiSettingsSubsidiary } = settingsSubsidiary || {};
	const { equivalentMoney } = configLoyaltiSettingsSubsidiary || {};
	const { cost: costEquivalentMoney } = equivalentMoney || {};
	const valueDiscount = costEquivalentMoney;
	this.scoreProduct = valueDiscount ? Math.round(row.totalOrigin / valueDiscount) : 0;
	this.dialogPoint = true;
	this.nameProduct = row.name;
	this.totalProduct = row.totalOrigin || 0;
	this.loyalty.point = row.productPoint || 0;
	if (row.productPoint) {
		this.discountPoint = row.totalOrigin - row.total;
	}
	// this.discountPoint = (this.pointClient * this.totalProduct) / (this.score || 0);
	this.idProductPoint = row.id;
	this.pointClientDialog = this.pointClient;
}

function closeDialogPoint() {
	this.dialogPoint = false;
	this.nameProduct = null;
	this.totalProduct = null;
	this.discountPoint = null;
	this.loyalty = {
		point: null,
	};
	this.idProductPoint = null;
}

function saveDialogPoint() {
	const index = this.data.findIndex((p) => p.id === this.idProductPoint);
	let discountPercentage = Number((this.discountPoint * 100) / this.totalProduct);

	if (discountPercentage === 100) {
		if (!this.data[index].canFreeTax) {
			this.messageErrorPoints =
				'Este producto no tiene tiene la configuracion de impuestos adecuados para hacer un descuento total';
			return;
		}
		discountPercentage = 0;
		this.data[index].flagFree = true;
	}
	this.data[index].productPoint = this.loyalty.point;
	// this.data[index].disabledExchange = true;
	this.data[index].flagFree = Number(this.discountPoint) === this.totalProduct;
	this.data = Sales.editDiscount(this.data[index], discountPercentage, this.data, index);
	this.rowIsSelected(this.data[index]);
	this.closeDialogPoint();
	this.showNotification('El descuento se agrego correctamente.');
}

function saleTitle() {
	return this.historicalSalesActive
		? `${this.$route.meta.title} Histórica`
		: this.$route.meta.title;
}

function validSubTypes(docSelected) {
	const { settings } = docSelected;
	if (settings) {
		const { subTypes } = settings;
		if (subTypes) {
			const subTypesKeys = Object.keys(subTypes) || [];
			this.subTypes = subTypesKeys.reduce((a, st) => {
				const newA = { ...a };
				newA[st] = { ...subTypes[st], isSelected: false };
				return newA;
			}, {});
			this.showSubTypes = subTypesKeys.length > 0;
		}
	}
}

function saveModalAttributes(rows) {
	// this.showAtribute = false;
	if (this.showAtribute) {
		this.flagUpdatePrice = false;
		const value =
			rows[0] && rows[0].attributeDetail[0] ? Number(rows[0].attributeDetail[0].name) : 0;
		const valueTotal = this.data[this.indexProduct].weightProduct * value;
		const newPrice = valueTotal / this.rowAssign.quantity;
		this.data = Sales.editPricePerSale(
			this.rowAssign,
			newPrice,
			this.data,
			this.indexProduct,
			true
		);
	}
	this.data[this.indexProduct].atributtesRow = rows;
	const dataAttribute = this.getAttributes(this.data[this.indexProduct]);
	this.data[this.indexProduct].attributesString = dataAttribute;
	this.closeModal();
}

function subTypesSelection(action) {
	if (action === 'save') {
		const subTypeskeys = Object.keys(this.subTypes);
		const newSubTypes = subTypeskeys.reduce((a, st) => {
			const newA = { ...a };
			if (this.subTypes[st].isSelected) {
				const newSubType = {
					code: this.subTypes[st].code,
					name: this.subTypes[st].name,
					value: this.subTypes[st].value,
				};
				newA[st] = { ...newSubType };
			}
			return newA;
		}, {});
		this.settingsSale = { ...newSubTypes };
	} else {
		this.subTypes = {};
	}
	this.showSubTypes = false;
}

function cancelHistoricalSale() {
	this.sale.createdAt = null;
	this.number = null;
	this.historicalSalesActive = false;
}

function closeModalAverage() {
	this.saleLoading = false;
	this.showErrorAverage = false;
	this.isLoadingAdi = false;
	this.sendProducts = [];
	this.arrayNew = [];
	this.atributtesList = [];
}

async function getProduct(par) {
	const { data: response } = await this.$httpProducts.get('products', {
		params: par,
	});
	return response.map((product) => {
		const newProduct = { ...product };
		const productItem = product.product || product;
		const warehouseName = product.warehouse ? product.warehouse.name : '';
		newProduct.autoBarcode = productItem.autoBarcode;
		newProduct.brandName = productItem.brand ? productItem.brand.name : '';
		newProduct.categoryName = productItem.category ? productItem.category.name : '';
		newProduct.code = productItem.code;
		newProduct.description = productItem.description;
		newProduct.inlineAlternateCode = productItem.inlineAlternateCode;
		newProduct.inlineFeatures = productItem.inlineFeatures;
		newProduct.name = productItem.name;
		newProduct.price = productItem.price;
		newProduct.priceCost = productItem.cost
			? productItem.cost || 0
			: product.priceCost || 0;
		newProduct.unitCode = productItem.unit ? productItem.unit.code : '';
		newProduct.unitConversion = 1;
		newProduct.unitId = productItem.unitId;
		newProduct.unitName = productItem.unit ? productItem.unit.name : '';
		newProduct.unitQuantity = productItem.quantity;
		newProduct.warehouseName = productItem.warehouse
			? productItem.warehouse.name
			: warehouseName;
		newProduct.warWarehouseProductBrandId =
			productItem.warWarehouseProductBrandId || productItem.id;
		newProduct.groupType = productItem.groupType;
		newProduct.type = productItem.type || 1;
		return newProduct;
	})[0];
}

async function gettingCode(code) {
	if (code.replace(/ /g, '') !== '*') {
		this.cleanInput = false;
		// crear parametro para el servicio
		const params = {
			code,
			warehouseId: this.selectedWarehouse,
		};

		// lista de precios por defecto
		const defaultList = this.pricesList.find((el) => el.flagDefault === 1);
		this.newProduct.selectedPriceListId = defaultList.id;

		let productCode = code.replace(/ /g, '');
		let weight = 1;

		if (productCode[0] === '*' && productCode.length === 14) {
			productCode = code.replace(/ /g, '').substring(3, 8);
			const weightCode = code.replace(/ /g, '').substring(8, 13);
			weight = `${weightCode.substring(0, 2)}.${weightCode.substring(2, 5)}`;
		}

		// actualizo params
		params.code = productCode;
		params.flagActive = 1;
		params.flagSales = 1;
		const productToInsert = await this.getProduct(params);
		if (productToInsert) {
			const rowExist = this.data.find((p) => p.id === productToInsert.id);
			const indexRow = this.data.findIndex((p) => p.id === productToInsert.id);
			const index = this.data.findIndex((prod) => prod.unitId === productToInsert.unitId);
			if (rowExist && index >= 0) {
				this.showNotification(
					`El producto: ${rowExist.name} ya se encuentra agregado con la unidad: ${rowExist.unitName}, se le aumento la cantidad.`,
					'info'
				);
				this.data[indexRow].quantity = this.data[indexRow].quantity + 1;
				this.data[indexRow].unitQuantity = this.data[indexRow].unitQuantity + 1;
				this.data[indexRow].total =
					this.data[indexRow].pricePerSale * this.data[indexRow].quantity;
				this.selectedProduct = null;
				this.cleanInput = true;
			} else {
				this.settingNewProduct(productToInsert);
				this.newProduct.quantity = weight;
				this.newProduct.showBrand =
					this.$userInfo.company.settings.flagUseSimpleBrand || false;
				const dataTransformed = await Sales.addProductsSale(
					this.newProduct,
					this.generalTaxes,
					this.$userInfo,
					false,
					null,
					false,
					this.customer
				);
				this.data.push(dataTransformed);
				this.newProduct.quantity = 0;
			}
		} else {
			this.showNotification('Producto no encontrado.', 'info');
		}
	}
}

async function loadCustomerFilter(customerIdFilter) {
	try {
		const { data: customerFiltered } = await this.$httpSalesRead.get(
			`customers/${customerIdFilter}`
		);
		this.customers = [{ ...customerFiltered }];
		this.setCustomer(customerFiltered);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function closeModalError() {
	if (this.$route.query.convert === 'cot' && this.temporalProductStock) {
		this.data = Sale.quantityValidation(
			this.objProduct,
			this.temporalProductStock,
			this.data
		);
		if (this.temporalProductIndex > -1) {
			this.data[this.temporalProductIndex].quantity = this.temporalProductStock;
			const iqs = window.document.getElementById(
				`input-quantity-sale-${this.temporalProductIndex}`
			);
			iqs.value = this.temporalProductStock;
		}
	}
	// else if (this.temporalProduct) {
	// 	this.data = Sale.quantityValidation(
	// 		this.temporalProduct,
	// 		this.temporalProductStock,
	// 		this.data
	// 	);
	// 	if (this.temporalProductIndex > -1) {
	// 		this.data[this.temporalProductIndex].quantity = this.temporalProductStock;
	// 		// const iqs = window.document.getElementById(`input-
	// 		// quantity-sale-${this.temporalProductIndex}`);
	// 		// iqs.value = this.temporalProductStock;
	// 	}
	// }
	this.objProduct = {};
	this.temporalProduct = {};
	this.temporalProductStock = 0;
	this.temporalProductIndex = -1;
	this.modal.open = false;
	this.modal.message = '';
}

function checkAverageCost(sale) {
	this.sendSale = { ...sale };
	this.makeSale(sale);
	// if (this.isFlagKardexValued) {
	// 	this.loadAverageCost(sale);
	// } else {
	// 	this.makeSale(sale);
	// }
}

async function loadAverageCost(sale) {
	this.saleLoading = true;
	const body = {
		costValidation: this.data.map((p) => {
			const newV = {
				productId: p.productId || p.id,
				price: p.pricePerSale,
			};
			return newV;
		}),
	};
	try {
		const { data: response } = await this.$httpProducts.patch(
			`products/average-cost-validation/${this.codeSale}`,
			body
		);
		this.noSuccess = response.some((r) => r.exceeded);
		if (this.noSuccess) {
			this.sendProducts = response.reduce((acum, r) => {
				if (r.exceeded) {
					const newAcum = { ...r };
					newAcum.productName =
						this.data.find((p) => p.productId === r.productId).name ||
						this.data.find((p) => p.productId === r.productId).product.name ||
						'';
					acum.push(newAcum);
				}
				return acum;
			}, []);
			this.showErrorAverage = true;
		} else {
			this.makeSale(sale);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.saleLoading = false;
		this.saleInAction = !this.saleInAction;
	}
}

function loadMakeSale() {
	this.makeSale(this.sendSale);
}

function showBtnLoyalti() {
	if (this.$userInfo.subsidiary.settings) {
		return this.$userInfo.subsidiary.settings.configLoyalti;
	}
	return false;
}

function showFlagLoyalti() {
	if (this.$userInfo.company) {
		return this.$userInfo.company.flagLoyalti === 1;
	}
	return false;
}

function closeNotification() {
	const index = this.data.findIndex((p) => p.id === this.idRow);
	const rowProduct = this.data.find((p) => p.id === this.idRow);
	if (rowProduct) {
		if (this.showMaxProduct) {
			this.data = Sales.editPricePerSale(
				rowProduct,
				rowProduct.priceSaleMax,
				this.data,
				index
			);
		} else {
			this.data = Sales.editPricePerSale(
				rowProduct,
				rowProduct.priceSaleMin,
				this.data,
				index
			);
		}
	}
	this.notification.show = false;
	this.notification.colorDialog = '';
	this.notification.colorText = '';
	this.notification.text = '';
	this.notification.title = '';
	this.dialogNotStock = false;
}

function openComposedModal() {
	this.notification.title = 'Uno de los productos no tiene stock suficiente.';
	this.notification.text = '¿ Desea vender de todas formas ?';
	this.notification.show = true;
	this.notification.colorDialog = 'error';
	this.notification.colorHex = '#D5331A';
}

function openModalAssign(row, index) {
	this.action = {
		code: 'AA',
		title: 'Asignar Atributos',
		open: true,
		width: 550,
	};
	this.nameProduct = row.name;
	this.quantityProduct = row.quantity;
	this.rowAssign = row;
	this.indexProduct = index;
	this.atributtesList = row.attributeList.map((p) => {
		const newRow = { ...p };
		newRow.checkAll = false;
		newRow.uId = `${p.id}`;
		const findRow = this.listAttributes.find((l) => l.id === p.id);
		newRow.type = findRow.type;
		newRow.detailsComplete = [...newRow.attributeDetail];
		newRow.isSelected = false;
		newRow.open = true;
		newRow.search = '';
		return newRow;
	});
	const validAtributte = this.showAtribute ? 1 : this.quantityProduct;
	for (let i = 0; i < validAtributte; i += 1) {
		this.arrayNew.push({
			arrayAtributes: this.atributtesList.map((idItem) => ({
				...idItem,
				idSection: i + 1,
				nameSection: `Seleccion ${i + 1}`,
				attributeDetail: idItem.attributeDetail.map((p, indexDetail) => {
					const newRow = { ...p };
					newRow.code = p.code;
					newRow.uId = `${i + 1}${idItem.uId}${indexDetail + 1}`;
					newRow.isSelected = false;
					newRow.valueRadio = null;
					return newRow;
				}),
				uId: `${i + 1}${idItem.id}`,
			})),
			name: `Seleccion ${i + 1}`,
			id: i + 1,
		});
	}
}

function openSearchCustomer(value) {
	this.searchValCustomer = value ? value.trim() : '';
	this.action.code = 'customer-searcher';
	this.action.title = 'Clientes';
	this.action.width = 739;
	this.action.value = true;
	this.action.open = true;
}

function openCustomerModalByKeyBoard() {
	this.openCustomerModal('customers-new');
}

function generateSaleByKeyBoard() {
	if (!this.disabledBtnPaySale) {
		this.saveData();
	}
}

function openkeyBoardShorcut() {
	this.openKeyMap = true;
}

function singleDiscount() {
	if (this.$userInfo.company.settings.singleDiscount) {
		return this.$userInfo.company.settings.singleDiscount;
	}
	return false;
}

function saveApplyCoupon(rows) {
	this.selectedsCoupon = rows;
}

function saveDataForm(dataForm) {
	this.closeModal();
	this.additionalGuide = { ...dataForm };
}

function getAttributes({ atributtesRow }) {
	if (atributtesRow && atributtesRow.length > 0) {
		const a = {};
		atributtesRow.map((item) => {
			const newData = {};
			const { idSection, nameSection, attributeDetail, name } = item;
			if (!a[`${idSection}`]) {
				newData.nameSection = nameSection;
				newData.idSection = idSection;
				const attributeDetailString = `${name}: (${attributeDetail
					.map((p) => p.name)
					.join(',')})`;
				newData.attribute = attributeDetailString;
				a[`${idSection}`] = newData;
			} else {
				const attributeDetailString = `${name}: (${attributeDetail
					.map((p) => p.name)
					.join(',')})`;
				a[`${idSection}`].attribute = `${
					a[`${idSection}`].attribute
				}, ${attributeDetailString}`;
			}
			return item;
		});
		const newArray = Object.keys(a);
		return newArray.map((p) => `${a[p].nameSection}: (${a[p].attribute})`).join(',  ');
	}
	return '';
}

function closeModalUnit() {
	this.showUnits = false;
}

function setInputAdditional({ model, value }) {
	if (model === 'discountGlobal') {
		if (this.priceAmounts.total <= Number(value)) {
			this.showInvalid = true;
			this.isLoadingAdi = true;
		} else {
			this.informationSale[model] = value;
			this.showInvalid = false;
			// this.totalAmountCoupon = Number(value);
			this.isLoadingAdi = false;
		}
	} else if (model === 'extCompanyCode') {
		this.informationSale[model] = value;
	} else {
		this.informationSale[model] = value;
	}
}

function saveModalAdditional() {
	this.totalAmountCoupon = Number(this.informationSale.discountGlobal);
	this.closeModal();
}

function data() {
	return {
		amountWithholding: null,
		valueWithholding: 0,
		loadingImg: false,
		assignedEmployed: false,
		createDetraction: {
			amount: null,
			percentage: null,
			bankAccount: null,
			detractionTypeId: null,
			detractionTypeName: null,
		},
		showInfo: false,
		showDetraction: false,
		isDisabledPrice: false,
		disabledWeight: false,
		showUnits: false,
		percentageWithholding: 0,
		withholdingSaleFlag: false,
		arrayNew: [],
		additionalGuide: {},
		atributtesList: [],
		typePayments: [],
		totalAmountCoupon: 0,
		routeNewSale: true,
		disabledMaxProduct: false,
		isSaleRole: false,
		selectedWarehouse: 0,
		flagUseGun: false,
		totalAdvanceInvoice: 0,
		isLoading: false,
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		showNotSale: false,
		active: false,
		basePrice: 0,
		cashInfo: {},
		checkAllPoint: false,
		checkAll: false,
		cleanCustomerInfo: false,
		cleanInput: false,
		clientDetails:
			'https://s3.amazonaws.com/apprunn-acl/icons/kVkuszmF8fXHl4lCZmqlVcI0J2sHtz.svg',
		columns: [
			{
				id: 1,
				name: '#',
				value: 'autoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Almacén',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Código',
				value: 'code',
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
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'L. de Precios',
				code: 'list-price-sl',
				value: 'priceList',
				tooltip: 'Lista de Precios',
				visible: false,
				checked: false,
				isEditable: true,
			},
			{
				id: 7,
				name: 'Pieza',
				value: 'parts',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Medida',
				value: 'meterage',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Peso',
				value: 'weight',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Cant. Enviar',
				tooltip: 'Cantidad por Enviar',
				value: 'quantitySend',
				visible: false,
				checked: false,
			},
			{
				id: 12,
				name: 'P. Unitario',
				value: 'priceUnitary',
				tooltip: 'Precio Unitarios',
				visible: true,
				checked: true,
				basePrice: BasePrice.PU,
			},
			{
				id: 13,
				name: 'PVP',
				value: 'pricePerSale',
				visible: true,
				checked: true,
				basePrice: BasePrice.PV,
			},
			{
				id: 14,
				name: 'P. Costo',
				value: 'unitName',
				tooltip: 'Precio Costo',
				visible: false,
				checked: false,
				flagVisible: true,
			},
			{
				id: 15,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Caracteristicas',
				value: 'inlineFeatures',
				visible: false,
				checked: false,
			},
			{
				id: 17,
				name: 'Marca',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 18,
				name: 'Atributos',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 19,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 20,
				name: 'Min. Stock',
				value: 'minStock',
				visible: false,
				checked: false,
			},
			{
				id: 21,
				name: 'Desc. (%)',
				value: 'discountPercentage',
				visible: true,
				checked: true,
				tooltip: 'Descuento',
				showInput: false,
				isEditable: true,
			},
			{
				id: 22,
				name: 'Impuesto %',
				value: 'taxProduct',
				visible: true,
				checked: true,
			},
			{
				id: 23,
				name: '',
				value: 'taxes',
				visible: true,
				checked: true,
			},
			// {
			// 	id: 24,
			// 	name: 'Costo Total',
			// 	value: 'price',
			// 	visible: Boolean(this.$userInfo.flagAdmin) && this.$userInfo.roleCode === 'ADMIN',
			// 	checked: Boolean(this.$userInfo.flagAdmin) && this.$userInfo.roleCode === 'ADMIN',
			// 	flagVisible: !(
			// 		Boolean(this.$userInfo.flagAdmin) && this.$userInfo.roleCode === 'ADMIN'
			// 	),
			// },
			{
				id: 25,
				name: 'Total',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 26,
				name: 'Ubicación',
				value: 'location',
				visible: false,
				checked: false,
			},
			{
				id: 27,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		rowAssign: {},
		columnsProductsPoint: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre de Producto',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Puntos',
				value: 'point',
				visible: true,
				checked: true,
			},
		],
		commentary: '',
		costsCenter: [],
		currentCustomer: {},
		currentPage: 1,
		currentPagePoint: 1,
		currentProduct: {},
		customer: {
			autocomplete: '',
			selectAddress: null,
			selectAddressId: null,
			typePerson: {
				documentName: null,
				documentNumber: null,
				fullName: null,
			},
		},
		objectCustomer: {},
		customers: [],
		data: [],
		dataFac: {},
		detraction: null,
		urlVoucher: '',
		dataForm: {},
		dataPayment: {},
		dataSelected: [],
		dataSelectedPoint: [],
		dateOnline: '',
		defaultCurrency: '',
		defaultPriceList: [],
		dialogNotStock: false,
		discountPoint: 0,
		disabledPayBtn: false,
		entryDate: '',
		informationSale: {
			showDiscount: false,
			discountGlobal: null,
			showOrder: false,
			amountOrder: null,
			guides: [],
		},
		exchangeRate: 0,
		flagGenericCustomer: true,
		flagPoint: false,
		flagWithholdingSubsidiary: false,
		feeError: false,
		isDetraction: false,
		indexProduct: null,
		idRow: null,
		hasCostShippingProp: false,
		historicalSalesActive: false,
		idProductPoint: null,
		idTypeDocumentSelect: null,
		isLoadingAdi: false,
		keyValue: 'warWarehouseProductBrandId-unitId',
		listAttributes: [],
		lastPage: 0,
		lastPagePoint: 0,
		loyalty: {
			point: null,
		},
		loading: false,
		loadingSunat: false,
		loadingCustomer: false,
		menu: false,
		modalGeneric: {
			userGeneric: '',
		},
		nameProduct: null,
		negativeStockAllowed: false,
		newProduct: {
			customer: {},
			product: {},
			quantity: 0,
			selectedPriceListId: 0,
		},
		number: null,
		onClean: false,
		orderId: 0,
		openKeyMap: false,
		params: {},
		paymentsMode: [],
		priceToHide: 0,
		pointClientDialog: null,
		pointClient: null,
		pricesList: [],
		typeOrigins: [],
		priceListGlobal: null,
		products: [],
		productsValid: [],
		productsAddCost: [],
		productToRemove: {},
		productDuplicateUnit: [],
		textValid: '',
		totalItemsPoint: 0,
		removeProduct: false,
		rowsProductsPoint: [],
		showConvertDocument: false,
		showBrandConfig: false,
		showAtribute: false,
		showDuplicateUnit: false,
		showPriceList: false,
		show10Percentage: false,
		showProductsParcials: false,
		showAditional: false,
		showInvalid: false,
		sale: {
			createdAt: null,
			customer: {
				typePerson: {},
			},
			typeDocument: {},
		},
		saleInAction: false,
		salesCurrency: '',
		salTypePaymentId: 0,
		search: null,
		selectedsCoupon: [],
		searchProduct: null,
		searchVal: null,
		selectedPriceList: {},
		selectedProduct: '',
		showMaxProduct: null,
		showNotifySale: false,
		showNotifySaleModal: false,
		showNotificationQ: false,
		scoreProduct: 0,
		subsidiaryIdModal: 0,
		subsidiary: {
			settings: {
				flagDetraction: false,
			},
		},
		sumTotal: 0,
		typeCoin: [],
		typeDocuments: [],
		typeDocumentsName: '',
		typeDocumentsSelected: '',
		units: [],
		newConsideration: false,
		newIssue: false,
		workToDo: [],
		quantityProduct: null,
		considerations: [],
		quantitySeries: 0,
		quantityDetail: 0,
		productSelectedSerie: null,
		dialogPoint: false,
		activeTaxes: false,
		activeTotal: false,
		charges: 0,
		otherCharges: [
			{
				name: 'Porcentaje',
				value: 'percent',
			},
			{
				name: 'Moneda',
				value: 'currency',
			},
		],
		maximumAmount: 200,
		validateDateLimit: false,
		activeCharges: false,
		selectCharges: 'currency',
		quantityCharge: null,
		originalTotal: 0,
		selectsTotal: [
			{ code: 'charge', select: false },
			{ code: 'total', select: false },
			{ code: 'imp', select: false },
			{ code: 'sub', select: false },
			{ code: 'igv', select: false },
		],
		shipProduct: false,
		showAutoDispatch: false,
		paymentInvoice: false,
		configInfo: {
			cash: {
				balance: {},
			},
			serie: {},
			terminal: {},
		},
		saleLoading: false,
		startDateFormat: format(this.$today(), 'YYYY-MM-DD'),
		startDate: null,
		subsidiaries: [],
		paramsPoint: {
			page: null,
			search: null,
		},
		paymentSelected: null,
		totalProduct: null,
		cash: [],
		exchangeRatePrimary: 0,
		salesCurrencyInitial: '',
		employee: {
			id: null,
			fullName: null,
		},
		percentageDetails: [],
		totalSubtract: 0,
		percentage: 0,
		notListDefault: false,
		showSubTypes: false,
		subTypes: {},
		documentSelected: {},
		settingsSale: {},
		labelCustomer: 'Busca un cliente',
		flagUpdatePrice: true,
		showCash: false,
		codeSale: null,
		showErrorAverage: false,
		itemsProductsCost: [],
		modal: {
			btnText: 'Entendido',
			message: '',
			open: false,
		},
		temporalProduct: {},
		temporalProductStock: 0,
		temporalProductIndex: -1,
		loadingGeneral: false,
		actionSale: '',
		noSuccess: false,
		sendProducts: [],
		selectedCards: [],
		showEmitAlert: false,
		showLimit: false,
		notification: {
			colorDialog: 'error',
			colorHex: '#D5331A',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
		selectedCustomer: null,
		searchValCustomer: null,
		employeeId: null,
		employees: [],
		messageErrorPoints: '',
		modalCondicion: false,
		dataResponseCustomer: {},
		viewModalLots: false,
		sumSeries: null,
		unitObject: {},
		message: '',
		typesDetraction: [],
		detractionSelect: {},
		flagEditBlockedAcl: false,
		referenceExternal: null,
		modalStockError: false,
		modalMessage: null,
		detailsErrorStock: [],
		columnsStock: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 3,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 4,
				name: 'Tienda',
				value: 'warehouseName',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		filtersChange: {
			month: null,
			year: null,
		},
		rowsTypeChange: [],
		showTypeOriginOrder: false,
	};
}

export default {
	name: 'new-sale',
	beforeDestroy,
	beforeRouteLeave,
	components: {
		appDialogProducts,
		applyDiscountCoupon,
		appInformationAdditional,
		actionSidebar,
		advanceInvoice,
		appActions,
		appCommentariesLotes,
		appCommentaries,
		appDataQuote,
		appSelect,
		appShowDialog,
		appTable,
		autocompleteComponent,
		customersForm,
		customerResume,
		dateComponent,
		DatePicker,
		fastRegister,
		generalFilter,
		guideData,
		headerPage,
		headerSummary,
		modalAttributesAssign,
		modalSidebarButton,
		paymentMode,
		payProductsPoint,
		productsSearchForm,
		productsSearchInput,
		appConsiderations,
		appIssues,
		salesSeries,
		headerInformation,
		sellingPoints,
		changeBox,
		assignSeller,
		btnAverageCost,
		modalItems,
		personSearchForm,
		personSearchInput,
		modalLotesSales,
		typeChangeForm,
		modalDetraction,
	},
	computed: {
		allowProductFree,
		basePriceComputed,
		blockedCustomer,
		computedColumns,
		customerDetailsSelected,
		productsPoint,
		customerRegisterSelected,
		disabledActionBar,
		disabledBtnPaySale,
		document,
		existCustomer,
		exceededPorcentage,
		isCommentary,
		isProductSearcher,
		maximumAmountBol,
		negative,
		notBolSale,
		notFacRuc,
		notFacSale,
		notSale,
		ntvSelected,
		paymentInvoiceSelect,
		paymentModeSelected,
		priceAmounts,
		quantityTotal,
		resumeTaxes,
		resumeTaxesList,
		resumeTotalUnits,
		roundTotalPrice,
		salesCurrencySymbol,
		saleTitle,
		singleDiscount,
		showBtnLoyalti,
		showFlagLoyalti,
		typePerson,
		validateAssignEmployee,
		validateCustomerLimitAmountCredit,
		validateTaxesBag,
		valueCharge,
		disabledSavePoints() {
			const existError = Boolean(this.messageErrorPoints);
			const pointNumber =
				this.loyalty.point !== null && !Number.isInteger(this.loyalty.point);
			// const poitsZero = !this.loyalty.point;
			const excess = this.discountPoint > this.totalProduct;
			const insufficient = this.loyalty.point > this.pointClientDialog;
			if (pointNumber) {
				this.messageErrorPoints = 'No se aceptan numeros decimales ';
			} else if (excess) {
				this.messageErrorPoints =
					'Los puntos a canjear no pueden exceder el valor del producto';
			} else if (insufficient) {
				this.messageErrorPoints = 'No tiene fucientes puntos para utilizar';
			}
			return excess || insufficient || existError || pointNumber;
		},
		disabledAddLot() {
			const flagLotsEnabled =
				this.newProduct.product && this.newProduct.product.product
					? this.newProduct.product.product.flagLotsEnabled === 1
					: false;
			return (
				!flagLotsEnabled ||
				this.newProduct.typeProduct === 7 ||
				this.newProduct.quantity === 0 ||
				this.newProduct.quantity === ''
			);
		},
		disableAddProduct() {
			const a = this.newProduct.product && !this.newProduct.product.name;
			const b = !this.newProduct.quantity || !this.newProduct.selectedPriceListId;
			return a || b;
		},
		valueTotalData() {
			const noFreeProduct = this.data.filter((n) => !n.flagFree);
			const arrayTotal = noFreeProduct.map((d) => d.total);
			this.sumTotal = arrayTotal.reduce((accumulator, value) => accumulator + value, 0);
			if (this.priceAmounts.coupons) {
				this.sumTotal = this.sumTotal - this.priceAmounts.coupons;
			}
			const total = this.priceAmounts.total - this.priceAmounts.icbper;
			const validateTotal = this.sumTotal.toFixed(4) !== total.toFixed(4);
			if (validateTotal) {
				this.showGenericError('No se pudo completar la venta, contactar a soporte');
			}
			return validateTotal;
		},
		detailsSaleHasError() {
			return this.data.some(this.productError);
		},
		isNTV() {
			return this.typeDocumentsSelected === 'NTV';
		},
	},
	created,
	data,
	methods: {
		closeModalUnit,
		closeModalNotify,
		disabledFunMaxProduct,
		addConsiderations,
		addIssues,
		addPercentage,
		addProduct,
		allSelectedProductsPoint,
		assignPriceList,
		calculateTotalInvoice,
		cancelHistoricalSale,
		cancelSale,
		changeCash,
		changeEmployee,
		changeExchangeRate,
		changePage,
		changePagePoint,
		changePriceByList,
		checkAverageCost,
		checkNegativeStock,
		// checkPriceMin,
		closeModalList,
		closeDialogPoint,
		closeModal,
		closeModalAverage,
		closeModalError,
		closeNotification,
		collectSale,
		changeDiscountAllRows,
		customerFocused,
		deleteProducts,
		deleteTaxeFree,
		disabledBtnSale,
		disabledPay,
		disabledLimit,
		editDiscount,
		editPricePerSale,
		editPriceUnitary,
		feeErrors,
		filterTypeDocuments,
		generateSaleByKeyBoard,
		getAttributes,
		getConversionQuantity,
		getDownPaymentDocumentsIds,
		getEmployee,
		getPriceListId,
		getProduct,
		getTaxByCountry,
		getTaxesAmount,
		gettingCode: helper.debounce(gettingCode, 700),
		isAction,
		labelAttributes,
		loadAttributes,
		loadAverageCost,
		loadBanksAccount,
		loadConfigData,
		loadCustomerFilter,
		loadData,
		loadEmployees,
		loadMakeSale,
		loadPaymentMethods,
		loadProductsPoint,
		loadTypePayments,
		makeProductCommentary,
		makeSale,
		nextInputFocused,
		openComposedModal,
		openCustomerModal,
		updateCustomerResumeAddress({ selectAddress, selectAddressId, alias }) {
			if (this.currentCustomer) {
				this.currentCustomer = {
					...this.currentCustomer,
					selectAddress,
					selectAddressId,
					alias,
				};
			}
			if (
				this.customer &&
				this.currentCustomer &&
				this.customer.id === this.currentCustomer.id
			) {
				this.customer = {
					...this.customer,
					selectAddress,
					selectAddressId,
					alias,
				};
			}
		},
		openCustomerModalByKeyBoard,
		openDialogPoint,
		openModalAssign,
		openPaymentModalByKeyBoard,
		openSearch,
		openSearchCustomer,
		openSeries,
		openSliderModal,
		openkeyBoardShorcut,
		orderPriceAmount,
		productSaved,
		quantityValidation,
		recalculateTaxesAndDiscounts,
		removeItem,
		removePercentage,
		resetEmployee,
		rowIsSelected,
		rowIsSelectedPoint,
		runAction,
		saveApplyCoupon,
		saveCustomer,
		saveData,
		saveDataForm,
		saveDialogPoint,
		saveModalAttributes,
		saveModalAdditional,
		savePoint,
		saveProductsPoint,
		searchEventPoint,
		searchValue: helper.debounce(searchValue),
		searching,
		searchingProducts: helper.debounce(searchingProducts),
		selectBasePrice,
		selectDocument,
		selectThisCustomer,
		selectedAll,
		sendSeries,
		setComentary,
		setComentaryLot,
		setCustomer,
		setData,
		setDate,
		disabledHistoricalDate,
		setDynamic,
		setHistoricalData,
		setOrderData,
		setPayment,
		setPriceListGlobal,
		setPoint,
		setInputAdditional,
		setPriceList,
		setPriceUnitary,
		setPriceUnitaryReal,
		setPricesListByProduct,
		setProduct,
		setSerieData,
		setSubtotal,
		setTaxes,
		settingNewProduct,
		showList,
		stopClick,
		subTypesSelection,
		typeDocumentName,
		typeDocumentSelected,
		toggleColumns,
		toggleSelect,
		unitsByProduct,
		updateColumns,
		updateData,
		updateNewProduct,
		updatePriceList,
		updateTaxes,
		validToCreate,
		validSubTypes,
		validateExchangeRate,
		validateInput,
		validateLocalStorage,
		warningModal,
		viewShowError,
		weightProduct,
		closeModalCondicion,
		validWithholding(value, amount) {
			this.valueWithholding = value;
			this.amountWithholding = amount;
		},
		getPriceConfiguratedByUnit(row, unitSelect) {
			const { priceList, selectedPriceListId, quantity } = row;
			const priceListSelected = priceList && priceList[selectedPriceListId];

			if (!priceListSelected) return 0;

			const dataPriceList =
				(priceListSelected.units &&
					unitSelect &&
					priceListSelected.units[unitSelect.id]) ||
				priceListSelected;

			if (!dataPriceList) {
				return priceListSelected.price || 0;
			}
			const range =
				dataPriceList.ranges &&
				dataPriceList.ranges.find((r) => r.from <= quantity && r.to >= quantity);
			const price = range ? range.price : dataPriceList.price;
			if (this.salesCurrency === 'USD') {
				const exchange = Sales.getExchange(this.exchangeRate);
				return Sales.getExchange(price / exchange);
			}
			return Number((price || 0).toFixed(2));
		},
		showInfoDetrac() {
			this.showInfo = !this.showInfo;
		},
		clearDetraction() {
			this.createDetraction = {
				amount: null,
				percentage: null,
				bankAccount: null,
				detractionTypeId: null,
				detractionTypeName: null,
			};
			this.detraction = null;
			this.closeModal();
		},
		saveDetraction(dataObj) {
			const { detractionId, detractionSelect, ...detractionData } = dataObj;
			this.detractionSelect = detractionSelect;
			this.detraction = detractionId;
			this.createDetraction = { ...detractionData };
			this.closeModal();
		},
		async loadSunat() {
			if (this.typesDetraction.length > 0 || this.loadingSunat) return;
			const code = 'TABLA23';
			this.loadingSunat = true;
			try {
				({ data: this.typesDetraction } = await this.$httpSales.get(
					`catalog-sunat-details-list/${code}`
				));
			} catch (err) {
				this.showGenericError();
			} finally {
				this.loadingSunat = false;
			}
		},
		responseCustomer(dataResponse) {
			this.dataResponseCustomer = dataResponse;
		},
		toogleModalLots() {
			this.viewModalLots = !this.viewModalLots;
		},
		async addProductWithLot(dataLot) {
			// const newProductCopy = { ...this.newProduct };
			dataLot.forEach(async (lot) => {
				if (lot.quantity > 0) {
					const { code, dateDue, selectedQuantity } = lot;
					this.newProduct = JSON.parse(JSON.stringify(this.newProduct));
					this.newProduct.quantity = selectedQuantity;
					this.newProduct.product.productLots = {
						productLotId: lot.productLotId,
						location: lot.location,
						lot: code,
						codeEan: lot.codeEan,
						date: lot.date,
						expirationDate: dateDue,
					};
					await this.addProduct();
				}
			});
			this.toogleModalLots();
		},
		updateLoading(value) {
			this.loadingImg = value;
		},
		validateSeries() {
			const productSeries = this.data.filter((d) => d.product.flagControlSerie);
			const productLots = this.data.filter((d) => d.product.flagLotsEnabled);
			// ---------
			const findNoSerie = productSeries.find((e) => !e.series);
			const findNoLot = productLots.find((e) => !e.productLots);
			// ---------
			const series = productSeries.every((e) => e.series);
			const lots = productLots.every((e) => e.productLots);
			// ---------
			if (!lots) {
				this.message = `Debe configurar el lote del producto ${findNoLot.name}`;
				const index = this.data.findIndex((d) => d.id === findNoLot.id);
				if (index > -1) {
					this.data.splice(index, 1);
				}
				helper.setLocalData('products-selected', this.data);
			} else if (!series) {
				this.message = `Debe configurar la serie del producto ${findNoSerie.name}`;
			}
			return !lots || !series;
		},
		setQuantity({ value }) {
			this.$set(this.newProduct, 'quantity', Number(value));
		},
		getStockDinamic({ stock, unitId, units }) {
			if (!unitId || !units) {
				return stock;
			}
			const unitSelected = units.find((u) => u.id === unitId);
			if (unitSelected && unitSelected.quantity) {
				return fourDecimals(stock / unitSelected.quantity);
			}
			return stock;
		},
		productError(row) {
			if (this.salesCurrency === 'USD') return '';
			if (fourDecimals(row.total) !== fourDecimals(Sales.getTotal(row))) {
				return 'ESTE PRODUCTO TIENE ERRORES, PROBAR QUITARLO Y VOLVERLO A AÑADIR O CONTACTAR A SOPORTE';
			} else if (twoDecimals(row.total) === 0) {
				return 'ESTE PRODUCTO TIENE UN PRECIO DE VENTA O TOTAL DEMASIADO CERCANO A 0.00, POR FAVOR VUELVALO A AGREGAR COMO GRATUITO';
			}
			return '';
		},
		changeValue() {
			if (
				this.subsidiary.settings.flagDetraction &&
				this.subsidiary.settings.detraction
			) {
				this.createDetraction.bankAccount =
					this.subsidiary.settings.detraction.bankAccount;
				this.showDetraction = !this.showDetraction;
			} else {
				this.notification.title = 'Configuración Requerida para Ventas con Detracción';
				this.notification.text =
					'Para procesar una venta con detracción, es indispensable configurar una cuenta bancaria con detracción.';
				this.notification.show = true;
			}
		},
		setOrigin({ value }) {
			this.referenceExternal = value.code;
		},
		priceListProdFree(priceList) {
			return Object.entries(priceList).reduce((acc, [key, item]) => {
				const updatedItem = { ...item, discount: 0 };
				if (updatedItem.units) {
					updatedItem.units = Object.fromEntries(
						Object.entries(updatedItem.units).map(([unitKey, unit]) => [
							unitKey,
							{ ...unit, discount: 0 },
						])
					);
				}
				acc[key] = updatedItem;
				return acc;
			}, {});
		},
		openSlideTypeChange() {
			this.action = {
				active: true,
				code: 'TC',
				open: true,
				title: 'TIPO DE CAMBIO SUNAT',
				width: 480,
			};
			this.filtersChange.year = new Date().getFullYear().toString();
			this.filtersChange.month = format(new Date(), 'MMMM', { locale: es });
			this.filtersChange.day = format(new Date(), 'DD');
			this.rowsTypeChange = helper.getLocalData('ms-exchange-rates');
		},
		async loadTypeChange(params) {
			const exchangeRates = helper.getLocalData('ms-exchange-rates');
			const lastUpdated = helper.getLocalData('ms-exchange-rates-last-updated');
			const today = new Date().toISOString().split('T')[0];

			if (exchangeRates && lastUpdated === today && !params) return;

			try {
				const response = await this.$httpSales.get('ms-exchange-rates', {
					params,
				});
				this.rowsTypeChange = response.data;
				if (!params) {
					helper.setLocalData('ms-exchange-rates', response.data);
					helper.setLocalData('ms-exchange-rates-last-updated', today);
				}
			} catch (error) {
				console.error('No se puedo obtener el tipo de cambio actual', error);
			}
		},
		setDateType({ model, value }) {
			if (value && (model === 'year' || model === 'month')) {
				this.filtersChange[model] = value;
			}

			const params = {
				month: this.filtersChange.month,
				year: this.filtersChange.year,
				currency: 'USD',
			};
			this.loadTypeChange(params);
		},
		addType(row) {
			const exchange = Sales.getExchange(row.amount);
			this.validateExchangeRate(exchange);
			this.closeModal();
		},
		setConversion(conversion, isTotalOrigin) {
			const changeToPEN = this.salesCurrency === 'PEN';
			this.data = this.data.map((d) => {
				const newD = { ...d };
				const { priceList, selectedPriceListId } = d;

				const unitSelect = d.units.find((u) => u.code === d.unitCode);
				const priceListSelected = priceList[selectedPriceListId];
				const dataPriceList =
					(priceListSelected && unitSelect && priceListSelected.units[unitSelect.id]) ||
					priceListSelected;

				if (isTotalOrigin) {
					const price = dataPriceList.price * conversion;
					newD.price = fourDecimals(price);
					newD.priceUnitary = fourDecimals(price / `1.${d.taxes}`);
					newD.pricePerSale = fourDecimals(price);
					newD.total = fourDecimals(d.quantity * price);
				} else {
					newD.discountPercentage = 0;
					newD.discount = 0;
					let newPrice = newD.pricePerSaleOrigin * conversion;
					if (changeToPEN) {
						const pricePerSaleOriginSOL = d.pricePerSaleOriginSOL;
						if (
							pricePerSaleOriginSOL - 0.0005 < newPrice &&
							newPrice < pricePerSaleOriginSOL + 0.0005
						) {
							// Si se perdió la presicion por temas de decimales
							// utilizar el precio original
							newPrice = pricePerSaleOriginSOL;
						}
					}
					newD.price = fourDecimals(newPrice);
					newD.pricePerSale = fourDecimals(newPrice);
					newD.pricePerSaleOrigin = fourDecimals(newPrice);
					newD.priceUnitary = fourDecimals(newPrice / `1.${d.taxes}`);
					newD.total = Sales.getTotal(newD);
					newD.subtotalWithoutTax = Sales.getSubtotalWithoutTax(newD);
				}
				newD.priceUnitaryReal = d.priceUnitaryReal * conversion;
				newD.priceSaleMin = fourDecimals(d.priceSaleMin * conversion);
				newD.priceSaleMax = fourDecimals(d.priceSaleMax * conversion);
				return newD;
			});
			const filterProduct = this.data.filter((p) => p.pricePerSale < p.priceSaleMin);
			this.isLoading = filterProduct && filterProduct.length > 0;
			if (filterProduct && filterProduct.length > 0) {
				this.textValid = 'Uno o mas productos cuentan con un precio menor al minimo.';
				this.productsValid = filterProduct;
				this.dialogNotStock = true;
			}
		},
	},
	validations,
	watch: {
		search: searching,
		searchProduct: searchingProducts,
		salesCurrency,
		valueCharge: changeTotal,
		paymentInvoiceSelect: changePaymentSelect,
		typeDocumentsSelected,
		typeDocumentName,
		validateAssignEmployee: changeAssignEmployee,
	},
};
</script>

<style lang="scss" scoped>
.chip-exchange {
	border-radius: 5px;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	height: 30px;
	margin: 1px 28px 1px 0px;
	text-align: left;
	width: 84px;
	z-index: 1;

	span:not(.chip__content) {
		align-self: flex-end;
		display: flex;
		font-size: map-get($sizes, medium);
	}

	& + .filter-select.input-group input {
		padding-right: 6px !important;
	}
}

.card {
	border-radius: 0px;
	box-shadow: none;

	&-blue {
		background-color: map-get($colors, blue-card);
	}

	&-grey {
		background-color: map-get($colors, background-card);
	}

	&-pink {
		background-color: map-get($colors, orange-btn);
	}

	.row-text {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, medium);

		&-title {
			font-family: map-get($fonts, open-bold);
		}

		&-price {
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, medium16);
		}
	}
}

.position {
	position: relative;
}

.quotation {
	left: 4px !important;
	top: 0px !important;
}

.radio-group.sale-radio {
	height: 19px;
	padding: 0px;
}

.spacer {
	border: 1px solid map-get($colors, blue-grey);
}

.weight-width {
	width: 110px;
}

.hu-tw-width {
	width: 120px !important;
}

.client {
	align-items: center;
	display: flex;
	justify-content: space-between;
}

.client_button {
	align-items: center;
	background: map-get($colors, primary);
	border-radius: 0 5px 5px 0;
	display: flex;
	height: 31px;
	padding-left: 3px;
	width: 31px;

	&--info {
		border-radius: 5px;
	}
}

.center-modal {
	text-align: center;
}

.new-client_button {
	background-color: white;
	border: solid 1px map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, primary);
	font-size: map-get($sizes, small10);
	height: 30px;
	width: 97px;
}

.input-max-width {
	margin: 0 auto;
	max-width: 60px;
}

.container-taxes,
.container-total,
.container-charges,
.container-other-taxes {
	align-items: center;
	background-color: color(summary);
	display: flex;
	font-size: 12px;
	justify-content: center;
	min-width: 100%;
	padding: 10px 15px;
	position: absolute;
	right: 0;
	top: 115%;
	z-index: 3;
}

.section-options {
	background-color: color(summary);
}

.lh-regular {
	line-height: 1;
}

.btn-document {
	background: color(white);
	border-radius: 3px;
	font-size: 12px;
	height: 31px;
	width: 31px;

	&.active {
		background: color(secondary);
		color: color(white);
	}
}

.right {
	text-align: right;
}

.input-right {
	left: auto !important;
	right: 0 !important;
}

.pr-60 {
	padding-right: 60px;
}

.back-summary {
	background: color(green-extra-l) !important;
}

.btn-totals-sale {
	align-items: center;
	background: color(blue-grey);
	border-radius: 2px;
	display: flex;
	height: 14px;
	justify-content: center;
	width: 14px;
}

.w-80 {
	width: calc(100% - 30px) !important;
}

.quantity-title,
.base-price {
	font-size: size(medium);
}

.min-width {
	min-width: 30px;
}

.exchange-width {
	max-width: 131px !important;
}

.separator-min {
	color: color(title-green);
}

.separator-max {
	position: relative;

	&::before {
		content: '';
		position: absolute;
		width: 1px;
		height: 31px;
		background: color(background-sidebar);
		top: -15px;
		bottom: 0;
	}
}

.chip-sales {
	background-color: color(red-error);
	border-radius: 5px 0 0 5px;
	color: color(white);
	font-size: 10px;
	padding: 6px;
}

.content-btn {
	align-items: flex-end;
	display: flex;
}

.w-100 {
	width: 100%;
}

.history-back {
	background-color: color(title-green);
	border-left: 2px solid color(item-select);
}

.prices-width-sale {
	width: 86px !important;

	@media (max-width: 1100px) {
		min-width: 90px !important;
	}
}

.carrillo-advance-invoice {
	align-items: center;
	display: flex;
	font-size: size(medium);
	justify-content: flex-end;

	div {
		align-items: center;
		display: flex;

		output {
			font-family: font(bold);
		}
	}
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 17px !important;
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
	padding-top: 18px !important;
}

.link-document {
	background-color: transparent !important;
	box-shadow: none !important;
	color: color(accent) !important;
	display: block;
	font-size: size(small13);
	text-decoration: underline;

	&[disabled] {
		opacity: 0.5;
	}
}

.carrillo-advance-invoice {
	align-items: center;
	display: flex;
	font-size: size(medium);
	justify-content: flex-end;

	div {
		align-items: center;
		display: flex;

		output {
			font-family: font(bold);
		}
	}
}

.text-point {
	background-color: map-get($colors, primary);
	border-radius: 3px;
	color: map-get($colors, white);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium16);
	height: 19px;
	margin-top: 3px;
	padding-top: 1px;
	text-align: center;
	width: 46px;
}

.header-dialog-sale {
	color: color(primary);
	font-size: 15px;
	font-family: map-get($fonts, lato-regular);
	font-weight: 900;
	padding-left: 50px;
}

.modal-items {
	&-btn {
		background: transparent !important;
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;
		width: 190px;
		height: 40px;
		text-transform: capitalize;

		&--cancel {
			background: transparent !important;
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
			text-transform: capitalize;
			height: 40px;
			width: 190px;
		}
	}

	&-action {
		background-color: rgba(195, 231, 232, 0.21);
		padding: 15px 0;
	}
}

.label-dialog {
	background-color: white;
	color: #464646;
	font-size: 15px;
}

.footer-dialog-point {
	background-color: rgba(195, 231, 232, 0.21) !important;
	padding: 16px 0;
}

.text-dialog {
	color: #535353;
	font-size: 15px;
	width: 200px;
	font-family: map-get($fonts, open-bold);
}

.ft-14 {
	color: #535353;
	font-size: 15px;
	font-family: map-get($fonts, open-bold);
}

.content-dialog {
	padding-left: 50px;
	background-color: white;
	margin-top: -30px;
}

.content-dialog-green {
	width: 272px;
	height: 114px;
	padding: 10px;
	border-radius: 15px;
	background-color: color(primary);
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 30px;
	margin-left: 50px;
	margin-top: -20px;
}

.card {
	border-radius: 12px;
}

.bold-open {
	font-family: map-get($fonts, open-bold);
}

.fs-cant {
	color: white;
	font-size: 16px;
	border-radius: 10px;
	padding: 5px;
	transform: skew(-10deg);
}

.fs-small {
	color: color(primary);
	font-size: 16px;
	transform: skew(-10deg);
	border-radius: 10px;
	padding: 5px;
}

.fs-m {
	text-align: center;
	color: white;
	font-size: 8px;
	border-radius: 10px;
	padding: 5px;
}

.width-attributes {
	width: 220px;
}

.footer-dialog {
	background-color: white;
	padding: 16px 0 !important;
}

.label {
	color: white !important;
}

.keyboard-button-activator {
	font-size: 12px;
	width: 100%;
}

.hidden-button-to-open-payment-modal {
	display: none;
	position: absolute;
}

.text-selection {
	color: color(paginationText);
	font-size: 12px;
	padding-left: 9px;
}

.price-selection {
	color: color(background-sidebar);
	font-weight: bold;
}

.label-cot {
	color: color(brown-grey);
	font-size: 13px;
}

.text-cot {
	font-size: 13px;
	margin-top: 7px;
}

.content-apply {
	background-color: #f4f4f4;
	font-family: map-get($fonts, open-regular);
}

.title-coupon {
	color: color(primary);
	font-size: 12px;
}

.content-coupon {
	border-radius: 4px;
	border: solid 0.5px color(primary);
	color: #8f8f8f;
	font-size: 14px;
	padding: 5px 8px;
	max-width: 190px;
}

.weight--bold {
	font-weight: bold;
}

.style-min-stock {
	background-color: rgba(254, 107, 125, 0.29);
	font-weight: bold;
}

.width-percentage {
	max-width: 59px;
}

.header-c {
	font-size: 24px;
	background-color: rgba(195, 231, 232, 0.21);
	text-align: center;
	font-family: map-get($fonts, open-bold);
	color: color(primary);
}

.boton-x {
	color: color(primary);
	font-size: 30px;
	padding-left: 3px 6px;
}

.fondo {
	background-color: rgba(195, 231, 232, 0.21);
}

.sign {
	color: color(primary);
	font-size: 20px;
	margin-top: 20px;
}
.messagePoints {
	text-align: center;
	color: red;
	font-size: 0.8rem;
}

.a-p {
	font-weight: bold;
	color: #535353;
	font-size: 15px;
	padding-left: 50px;
	background-color: white;
	margin-top: -20px;
}

.btnAddLote {
	color: white;
	width: 100%;
}

.title-card {
	background-color: #f8f8f8;
	border-bottom: 1px solid #e0e0e0;
	padding: 16px;
	font-weight: bold;
}
.title-text {
	font-size: 1rem;
	color: #333;
}
.modal {
	border-radius: 8px;
}
.mesage-error {
	color: red;
	font-size: 0.8rem;
}

.btn-sunat {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-semibold);
	font-size: 10px;
	height: 30px;
	width: 83px;
	margin-bottom: 2px;
}
</style>
