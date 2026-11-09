<template>
	<section class="page-purchases-new">
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				toda la información de la compra`"
		/>
		<header-page
			btns-column="xs9"
			column-class="xs12"
			justify-class="justify-start"
			name="purchases-new"
			:show-clean="false"
			:show-excel="false"
			:title="$route.query.cloneId ? 'Convertir Compra' : $route.meta.title"
			:to-show="true"
		>
			<v-flex>
				<header-summary
					class="justify-end"
					:document-name="selectedSupplier.typeDocumentName"
					:document-number="selectedSupplier.documentNumber"
					:name="selectedSupplier.commercialName"
					:show-total="false"
				/>
			</v-flex>
			<v-flex>
				<v-layout wrap justify-end align-center class="lh-regular">
					<span class="px-1">
						<label class="orange--text bold caption ft-10">TOTAL</label>
						<p class="orange--text ma-0 extra-bold">
							{{ currencySymbol }} {{ model.amount | round }}
						</p>
					</span>
					<span class="px-2 separator-pur"></span>
					<span class="px-1">
						<label class="caption input--text">Caja</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text bold">
								{{
									configInfo.cash
										? configInfo.cash.name
										: null || model.cash
										? model.cash.name
										: null
								}}
							</p>
							<span>{{
								configInfo.cash
									? configInfo.cash.name
									: null || model.cash
									? model.cash.name
									: null
							}}</span>
						</v-tooltip>
					</span>
					<span
						class="px-2 separator-pur"
						v-if="isEcuador && isIdLDC === model.typeDocumentId"
					></span>
					<span class="px-1" v-if="isEcuador && isIdLDC === model.typeDocumentId">
						<label class="input--text caption">Punto de venta</label>
						<p class="primary--text ma-0 bold body-2">
							{{ this.$userInfo.terminal.name }}
						</p>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption input--text">Tipo</label>
						<v-tooltip left>
							<button
								class="btn-currency"
								slot="activator"
								@click="toggleBtn('indexBilling', 'typeBilling', 'typeBillingSelect')"
							>
								{{ typeBillingSelect.short }}
							</button>
							<span>{{ typeBillingSelect.name }}</span>
						</v-tooltip>
					</span>
					<span class="px-2"> | </span>
					<span class="pl-2" v-if="isEcuador">
						<label class="caption input--tex">Moneda</label>
						<p class="body-2 ma-0 text-xs-center">
							{{ countryCurrencySymbol }}
						</p>
					</span>
					<span class="pl-2" v-else>
						<label class="caption input--text">Moneda</label>
						<template v-if="currencies.length > 2">
							<v-menu offset-y class="menu-purchase">
								<button class="btn-currency" slot="activator" type="button">
									{{ currencySelect.symbol }}
								</button>
								<v-list>
									<v-list-tile
										v-for="item in currencies"
										:key="item.id"
										@click="onInput({ value: item })"
									>
										<v-list-tile-title>{{ item.name }}</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
						</template>
						<template v-else-if="currencies.length === 2">
							<button
								class="btn-currency"
								type="button"
								@click="
									onInput({
										value:
											currencies.findIndex((c) => c.id === model.currency) === 0
												? currencies[1]
												: currencies[0],
									})
								"
							>
								{{ currencySelect.symbol }}
							</button>
						</template>
						<template v-else>
							<button class="btn-currency" type="button">
								{{ currencySelect.symbol }}
							</button>
						</template>
					</span>
				</v-layout>
			</v-flex>
		</header-page>
		<app-actions
			:value-disabled="valuesDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap align-end pt-4">
			<v-flex xs12>
				<v-alert type="warning" icon="priority_high" :value="isDangerousToEdit">
					Esta compra ya tiene cuotas canceladas, modificarla afectará los pagos ya
					realizados.
				</v-alert>
				<v-alert :value="cannotBeEdited" type="info">
					Esta compra ya ha sido contabilizada, no puede ser editada.
				</v-alert>
				<v-alert :value="showNewSupplier" type="info">
					Esta compra se registrará con el proveedor
					{{ selectedSupplier.commercialName }}.
				</v-alert>
				<v-alert
					:value="$v.model.supplierId.$dirty && $v.model.supplierId.$invalid"
					type="error"
				>
					Debe buscar y seleccionar un proveedor.
				</v-alert>
				<v-alert
					:value="$v.model.dateDocument.$dirty && $v.model.dateDocument.$invalid"
					type="error"
				>
					Fecha inválida. (Día/Mes/Año)
				</v-alert>
				<v-alert
					:value="$v.model.serie.$dirty && $v.model.serie.$invalid && showNotSerie"
					type="error"
				>
					Ingrese la serie del documento
				</v-alert>
				<v-alert
					:value="$v.model.number.$dirty && $v.model.number.$invalid && showNotSerie"
					type="error"
				>
					Ingrese el correlativo del documento
				</v-alert>
				<v-alert
					:value="$v.model.details.$dirty && $v.model.details.$invalid"
					type="error"
				>
					Debe agregar por lo menos un producto.
				</v-alert>
				<v-alert :value="!validErrorTotal && flagPurchases" type="error">
					El Total debe ser mayor a 0
				</v-alert>
			</v-flex>
			<v-flex xs2 px-1 mb-2 mr-2>
				<v-layout>
					<v-flex xs11>
						<person-search-input
							autocomplete="off"
							ref="supplierSearcher"
							ref-value="supplierSearcher"
							id="supplierSearcher"
							label-searching="Proveedor"
							:search-value="selectedSupplier.name"
							:flagInputEvent="true"
							@search="openSearchSupplier"
						/>
					</v-flex>
					<v-flex xs1>
						<v-tooltip top>
							<button
								class="client_button"
								slot="activator"
								@click="runAction({ code: 'NS' })"
							>
								<v-icon color="white">person</v-icon>
							</button>
							<span>Crear proveedor</span>
						</v-tooltip>
					</v-flex>
				</v-layout>
				<span v-if="selectedSupplier.flagPerceptionAgent" class="text--alert">
					Es agente de percepción
				</span>
				<span v-if="!selectedSupplier.flagActive" class="text--alert">
					Proveedor desactivado
				</span>
			</v-flex>
			<v-flex xs2 ml-2 pr-2>
				<app-date-select
					:date-formatted="model.dateDocument"
					label="Fec. Compra (*)"
					model="dateDocument"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs1 md2 px-1>
				<app-select
					:item="subsidiaryId"
					model="subsidiaryId"
					label="Sucursal"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:return-object="false"
					@input="getSubsidiaryId"
				/>
			</v-flex>
			<v-flex xs1 md2 pl-2>
				<template v-if="isEditing">
					<div
						class="btn-price-sale autogenerate-message"
						style="text-align: center"
						v-if="accountingPeriodSelected && accountingPeriodSelected.code"
					>
						Periodo contable: {{ accountingPeriodSelected.code }}
					</div>
				</template>
				<template v-else>
					<button
						v-if="accountingPeriodSelected && accountingPeriodSelected.code"
						class="btn-price-sale size"
						@click="onSelectAccountingPeriod(null)"
					>
						<v-icon size="16" color="white">delete</v-icon>
						Deseleccionar: {{ accountingPeriodSelected.code }}
					</button>
					<button
						v-else
						class="btn-price-sale size"
						@click="openModalAccountingPeriod = true"
					>
						Seleccionar Perido contable
					</button>
				</template>
			</v-flex>
			<v-flex xs2 v-if="isPeru && currencies.length === 2 && currencySymbol === '$'">
				<v-layout align-center>
					<v-flex xs5 pr-1>
						<div>
							<p class="label-sales">Tipo de Cambio</p>
							<v-text-field
								single-line
								hide-details
								:disabled="disableExchangeRate"
								label="00.00"
								type="number"
								v-model.number="exchangeRate"
								@input="validateExchangeRate"
								class="filter-select input-right input-chip"
							></v-text-field>
						</div>
					</v-flex>
					<v-flex xs1 pt-3>
						<button
							type="button"
							class="btn-totals-sale"
							@click="disableExchangeRate = !disableExchangeRate"
						>
							<v-icon color="primary">edit</v-icon>
						</button>
					</v-flex>

					<v-flex xs5 pt-3 pl-1>
						<button
							type="button"
							class="btn-sunat"
							v-if="isPeru && currencies.length === 2 && currencySymbol === '$'"
							@click="openSlideTypeChange"
						>
							Ver TC SUNAT
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<v-layout pl-4>
			<v-flex xs2 px-1 mb-2>
				<app-select
					label="Tipo de Doc. (*)"
					item-disabled="documentType.disabled"
					item-text="documentType.name"
					item-value="comTypeDocumentId"
					model="typeDocumentId"
					:item="model.typeDocumentId"
					:items="typeDocuments"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 px-1 mb-2 v-if="flagDueDate">
				<app-date-select
					:date-formatted="model.dueDate"
					label="Fecha de vencimiento"
					model="dueDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex
				xs1
				md2
				ml-1
				v-if="model.typeDocumentId === 30 || model.typeDocumentId === 10"
			>
				<app-select
					label="Almacen"
					item-text="name"
					item-value="id"
					model="warehouseId"
					:item="model.warehouseId"
					:items="warehouses"
					@input="onInput"
				>
				</app-select>
				<span class="form-group__message" v-if="!$v.model.warehouseId.required">
					El almacen es requerida.
				</span>
			</v-flex>

			<template v-if="isEditing || !flagAutoSerieNumber">
				<v-flex xs2 md1 px-1 mb-2>
					<app-input-text
						label="Serie (*)"
						model="serie"
						:text="model.serie"
						:readonly="serieReadonly || flagAutoSerieNumber"
						:max-length="maxLengthSerie"
						@input="onInput"
					>
					</app-input-text>
					<span
						class="message-error form-group__message"
						v-if="isEcuador && model.serie.length !== 6"
					>
						Ingresar 6 dígitos en la serie
					</span>
				</v-flex>
				<v-flex xs2 md2 px-1 mb-2>
					<div style="display: flex; flex-direction: column">
						<label class="label-input-group" for="number">Correlativo (*)</label>
						<div class="input-group">
							<input
								name="alphanumeric"
								type="text"
								v-model="model.number"
								:readonly="numberReadonly || flagAutoSerieNumber"
								@input="model.number = model.number.replace(/[^a-zA-Z0-9]/g, '')"
								placeholder="Correlativo (*)"
								class="input-alphanumeric"
							/>
						</div>
					</div>
					<!-- <app-input-text
						type="number"
						:step="1"
						label="Número (*)"
						model="number"
						:text="model.number"
						:readonly="numberReadonly || flagAutoSerieNumber"
						@input="onInput"
					>
					</app-input-text> -->
				</v-flex>
				<v-flex xs2 md1 px-1 mb-2 style="display: flex; align-items: flex-end">
					<button
						type="button"
						class="pl-add-container size btn-free ml-1"
						@click="validateDocumentNumber"
					>
						Validar
					</button>
				</v-flex>
				<v-flex xs2 ml-2 v-if="$userInfo.company.settings.flagTypeOriginOrder">
					<app-select
						item-text="name"
						item-value="code"
						:items="origensPurchases"
						label="Tipos de Origen de Compra"
						:item="model.referenceExternal"
						model="typeOrigin"
						@input="onInput"
					/>
				</v-flex>
			</template>
			<template v-if="flagAutoSerieNumber">
				<v-flex xs1 md2 ml-1>
					<div style="display: flex; align-items: center">
						<span class="autogenerate-message"
							>La serie y correlativo se
							{{ isEditing ? 'conservará' : 'autogenerará' }} para este tipo de
							documento</span
						>
					</div>
				</v-flex>
			</template>
		</v-layout>
		<v-layout px-4 align-end mb-2>
			<v-flex xs3 px-1>
				<!-- INPUT PRODUCTO GENERAL -->
				<products-search-input
					label-searching="Buscar Producto"
					autocomplete="off"
					ref="productSearcher"
					ref-value="productSearcher"
					id="productSearcher"
					:clean-input="cleanInput"
					:search-value="product"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs1 px-1>
				<v-flex>
					<span class="mr-2 quantity-title">Cantidad:</span>
				</v-flex>
				<v-text-field
					bottom
					single-line
					hide-details
					type="number"
					v-model.number="quantity"
					label="0"
					id="quantity"
					class="filter-select shadow-inset"
					content-class="filter-select-content"
				></v-text-field>
			</v-flex>
			<v-flex xs1 px-1>
				<v-flex>
					<span class="mr-2 quantity-title">Total:</span>
				</v-flex>
				<v-text-field
					bottom
					single-line
					hide-details
					type="number"
					v-model.number="total"
					id="total"
					:disabled="selectedProduct.typeProduct === 7"
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					@keypress.stop.enter="addProduct"
				></v-text-field>
			</v-flex>
			<v-flex xs5 px-1>
				<v-layout row>
					<button
						type="button"
						class="btn-price-sale size ml-1"
						@click="openDialogLotes"
						:disabled="
							disableAddProduct ||
							selectedProduct.typeProduct === 7 ||
							!selectedProduct.product.flagLotsEnabled
						"
						v-if="!!selectedProduct.product.flagLotsEnabled"
					>
						<span class="ml-2">Info. del Lote</span>
					</button>

					<template>
						<div>
							<v-layout row>
								<button
									class="pl-add-container size btn-free ml-1"
									type="button"
									:disabled="
										!product ||
										total > 0 ||
										!quantity ||
										(!!selectedProduct.product.flagLotsEnabled
											? newLotInfo === null
											: false)
									"
									@click="addProduct('free')"
								>
									Gratis
									<!-- <v-icon id="add-icon" color="white"> counter_0</v-icon> -->
								</button>
							</v-layout>
						</div>
					</template>
					<button
						class="pl-add-container size ml-1"
						type="button"
						:disabled="
							!product ||
							selectedProduct.typeProduct === 7 ||
							!total ||
							!quantity ||
							(!!selectedProduct.product.flagLotsEnabled ? newLotInfo === null : false)
						"
						@click="addProduct"
						style="width: 30px"
					>
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
					<button
						type="button"
						class="btn-price-sale size ml-1"
						@click="openDialogPriceSale"
						:disabled="
							disableAddProduct ||
							selectedProduct.typeProduct === 7 ||
							$userInfo.company.settings.flagCalculateEarnings
						"
					>
						<img src="/static/icon/etiqueta-de-dolar.svg" alt="icono-cambio-precio" />
						<span class="ml-2">Edit. P. de Venta</span>
					</button>
				</v-layout>
			</v-flex>
			<v-flex xs2 pb-2 text-xs-right v-if="!isEditing">
				<span class="base-price">Calcular {{ labelsByCountry.taxName }} por: </span>
				<v-tooltip top>
					<button
						slot="activator"
						class="btn-document mr-2"
						:class="{ active: basePrice === basePriceComputed.PC }"
						@click="selectBasePrice(basePriceComputed.PC, basePriceComputed.PT)"
					>
						C
					</button>
					<span>Costo</span>
				</v-tooltip>
				<v-tooltip top>
					<button
						slot="activator"
						class="btn-document"
						:class="{ active: basePrice === basePriceComputed.PT }"
						@click="selectBasePrice(basePriceComputed.PT, basePriceComputed.PC)"
					>
						T
					</button>
					<span>Total</span>
				</v-tooltip>
			</v-flex>
		</v-layout>
		<v-flex xs3 px-4 mb-3 v-if="flagUseGun && selectedWarehouse">
			<!-- INPUT PRODUCTO PISTOLA DE BARRA -->
			<products-search-input
				ref="productSearcherByGun"
				ref-value="productSearcherByGun"
				id="productSearcherByGun"
				labelSearching="Busqueda por codigo (lector de barras)"
				:clean-input="cleanInput"
				:flagInputEvent="true"
				:used-gun="flagUseGun"
				:search-value="searchVal"
				@input="gettingCode"
			/>
		</v-flex>
		<v-flex xs12>
			<purchases-details
				:sum="sum"
				:columns="columns"
				:currency="currencySymbol"
				:flag-includes-taxes="flagIntegrationCtCost"
				:rows="model.details"
				:detail="!!id"
				:footer="false"
				:retention-amount="retentionAmount"
				:retention-tax-amount="retentionTaxAmount"
				:costs-center="centersCosts"
				:show-cost-center="true"
				:id-purchases="id"
				:show-brand-config="showBrandConfig"
				:price-lists="priceLists"
				:exchange-rate="exchangeRate"
				:purchase-currency="model.currency"
				@column-input="columnInput"
				@delete-product="deleteProduct"
				@summary-data="summaryData"
				@update-amounts="updateAmounts"
				@update-total="updateTotal"
				@commentaries="makeCommentary"
				@open-series="openSeries"
				@update-brand="updateBrand"
				@update-center-cost="updateCenterCost"
				@history-products="openHistoryProducts"
				@update-price-sale="updatePriceSale"
				@set-unit="setUnit"
				@update-price-list="updatePriceList"
			>
			</purchases-details>

			<v-layout row wrap px-4>
				<v-flex xs12 py-1 class="totals-section d-flex text-xs-center">
					<v-flex class="subtotal">
						<span>Desc.: </span>
						<span
							>{{ currencySymbol
							}}{{ model.discountAmount || model.discountPercentage || 0 | round }}</span
						>
					</v-flex>
					<v-flex class="subtotal-container">
						<div class="subtotal">
							<span>Total Cant: </span>
							<span v-if="model.details">{{ totalQuantity }}</span>
						</div>
					</v-flex>
					<v-flex class="subtotal-container" v-if="isPeru">
						<div class="subtotal">
							<span>IMP.: </span>
							<span>{{ currencySymbol }}{{ priceAmounts.icbper | round }}</span>
							<button type="button" class="btn-totals-sale" @click="toggleSelect('imp')">
								<v-icon v-if="selectsTotal[2].select" color="info">remove</v-icon>
								<v-icon v-else color="info">add</v-icon>
							</button>
						</div>
						<transition name="fade" mode="out-in">
							<div class="container-other-taxes" v-if="selectsTotal[2].select">
								<div class="subtotal-menu-content">
									<p>
										<span class="taxes-title">Imp. Bolsa plástica: </span>
										<span>{{ currencySymbol }}{{ priceAmounts.icbper | round }}</span>
									</p>
								</div>
							</div>
						</transition>
					</v-flex>
					<v-flex class="subtotal-container">
						<div class="subtotal">
							<span>SubT.: </span>
							<span>{{ currencySymbol }}{{ model.subTotal | round }}</span>
							<button type="button" class="btn-totals-sale" @click="toggleSelect('sub')">
								<v-icon v-if="selectsTotal[3].select" color="info">remove</v-icon>
								<v-icon v-else color="info">add</v-icon>
							</button>
						</div>
						<transition name="fade" mode="out-in">
							<div class="subtotal-menu" v-if="selectsTotal[3].select">
								<div class="subtotal-menu-content">
									<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
										<span class="taxes-title">{{ tax.description }}</span>
										<template v-if="model.details.length > 0">
											<span v-if="tax.percentage === 0">{{ currencySymbol }} 0.00</span>
											<span v-else>
												{{ currencySymbol
												}}{{
													model.details.reduce((a, p) => a + p.price * p.quantity, 0)
														| round
												}}
											</span>
										</template>
									</p>
									<small>Nota: Montos incluyen descuentos</small>
								</div>
							</div>
						</transition>
					</v-flex>
					<v-flex class="subtotal-container">
						<div class="subtotal">
							<span>{{ labelsByCountry.taxName }}: </span>
							<span>{{ currencySymbol }}{{ model.taxes | round }}</span>
							<button type="button" class="btn-totals-sale" @click="toggleSelect('igv')">
								<v-icon v-if="selectsTotal[4].select" color="info">remove</v-icon>
								<v-icon v-else color="info">add</v-icon>
							</button>
						</div>
						<transition name="fade" mode="out-in">
							<div class="subtotal-menu" v-if="selectsTotal[4].select">
								<div class="subtotal-menu-content">
									<p>
										<span class="taxes-title"
											>Retención {{ labelsByCountry.taxName }}</span
										>
										<span
											>{{ currencySymbol
											}}{{
												withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) | round
											}}</span
										>
									</p>
									<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
										<span class="taxes-title">{{ tax.description }}</span>
										<template v-if="withholdingTaxTaxes.length > 0">
											<span v-if="tax.percentage === 0">{{ currencySymbol }} 0.00</span>
											<span v-else>
												{{ currencySymbol
												}}{{
													(model.taxes +
														withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0))
														| round
												}}
											</span>
										</template>
									</p>
								</div>
							</div>
						</transition>
					</v-flex>
					<v-flex class="subtotal-container">
						<div class="subtotal">
							<span>Total: </span>
							<span>
								{{ currencySymbol }}
								{{ model.amount | round }}
							</span>
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
							<div class="subtotal-menu" v-if="selectsTotal[1].select">
								<div class="subtotal-menu-content">
									<p>
										<span class="taxes-title">Retención Renta</span>
										<template v-if="withholdingTaxRent.length > 0">
											{{ currencySymbol
											}}{{
												withholdingTaxRent.reduce((a, w) => a + w.amountTax, 0) | round
											}}
										</template>
									</p>
									<p>
										<span class="taxes-title"
											>Retención {{ labelsByCountry.taxName }}</span
										>
										<span
											>{{ currencySymbol
											}}{{
												withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) | round
											}}</span
										>
									</p>
									<p>
										<span class="taxes-title">Total</span>
										<template v-if="withholdingTaxRent.length > 0">
											{{ currencySymbol
											}}{{
												(model.amount +
													withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) +
													withholdingTaxRent.reduce((a, w) => a + w.amountTax, 0))
													| round
											}}
										</template>
									</p>
								</div>
							</div>
						</transition>
					</v-flex>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-layout wrap justify-center px-4 mt-5 v-if="hasDynamicsForms">
			<v-flex d-flex align-center>
				<v-btn
					flat
					depressed
					small
					v-show="dynamicFormPurchase && dynamicFormPurchase.guideData"
					@click="openSliderModal('ADI', 'Datos de Guia')"
				>
					<span class="px-2 pt-2 pb-2">DATOS DE GUIA</span>
				</v-btn>

				<v-btn
					flat
					depressed
					small
					v-show="dynamicFormPurchase && dynamicFormPurchase.payment"
					@click="openSliderModal('TP', 'Tipos de Pago')"
				>
					<span class="px-2 pt-2 pb-2">Tipo de Pago</span>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center px-4 mt-5>
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
		<section class="pt-5">
			<v-layout>
				<v-flex xs12 text-xs-center>
					<v-btn class="btn-action" color="error" type="button" @click="cancelPurchase">
						Regresar
						<!-- <img :src="`${$imageUrl}/icon-cancel.svg`" /> -->
					</v-btn>

					<v-btn
						v-if="isVisibleBtnPurchase"
						class="btn-action"
						color="primary"
						type="button"
						:disabled="disabledPurchase"
						@click="processPurchase"
					>
						{{ labelButton }}
					</v-btn>
					<v-btn
						v-if="isVisibleBtnOrder"
						:disabled="disableORD"
						class="btn-action"
						color="primary"
						type="button"
						@click="savePurchase"
					>
						Ordenar
					</v-btn>
					<btn-average-cost
						:products="model.details"
						:disabled-btn="model.details.length === 0"
						:code-module="codePurchases"
						:warehouse-general="model.warehouseId"
						v-if="isFlagKardexValued && false"
						class="ml-1"
						big
						@average-cost-error="openDialoErrorAverage"
					/>
				</v-flex>
			</v-layout>
		</section>
		<action-sidebar
			:limit-text="55"
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="closeSidebar"
		>
			<history-products
				v-if="historyProductsModal"
				:rows="rowsHistory"
				@close-modal="closeModalHistory"
			/>
			<suppliers-form
				v-if="showSupplier"
				@cancel-button-clicked="cancelButtonClicked('showSupplier')"
				@save="saveSupplier"
				@close="cancelButtonClicked('showSupplier')"
			>
			</suppliers-form>
			<purchases-payments
				:show-detraction="showDetraction"
				:types-detraction="typesDetraction"
				:subsidiary="subsidiary"
				:disabled-flag-income="disabledFlagIncome"
				:id-purchase="id"
				v-if="showPayments"
				:cashs="cashs"
				:dateIncome="model.dateIncome"
				:cash-id="model.cashId"
				:details-payments="model.detailsPayments"
				:is-loading="isLoading"
				:is-valid="summaryTransactions.isValid"
				:number-quotes="numberQuotes"
				:payment-methods="paymentMethods"
				:payment-method-id="model.paymentMethodId"
				:payment-type-ids="model.paymentTypeIds"
				:payment-types="paymentTypesSupplier"
				:summary-data="model"
				:documents="typeDocuments"
				:terminal-name="configInfo.terminal.name"
				:transactions="model.transactions"
				:supplier="selectedSupplier"
				:retention-amount="retentionAmount"
				:retention-tax-amount="retentionTaxAmount"
				:warehouses="warehousesSales"
				:warehouseId="model.warehouseId"
				:flag-income-status="model.flagIncomeStatus"
				:total="model.total"
				:perception="model.perception"
				:currency-select="currencySelect"
				@accept-button-clicked="checkTypeTransactions"
				@cancel-button-clicked="cancelButtonClicked('showPayments')"
				@set-cash-purchase="setCashPurchase"
				@update-transaction="updateTransaction"
				@update-transactions="updateTransactions"
				@update-detail-payment="updateDetailPayment"
				@update-details-payments="updateDetailsPayments"
				@update-details-perception="updateDetailsPerception"
				@input="onInput"
				@change-flag="changeFlagIncome"
				@set-date="setDate"
			>
			</purchases-payments>
			<purchases-transactions
				v-if="showTransactions"
				:payment-types="paymentTypes"
				:transactions="rawTransactions"
			>
			</purchases-transactions>
			<purchases-quotes
				v-if="showQuotes"
				:currency-symbol="model.currencySymbol"
				:payment-types="paymentTypes"
				:checking-accounts="model.detailsPayments"
			>
			</purchases-quotes>
			<fast-register
				action-code="product-register"
				v-if="showNewProduct"
				@cancel-modal="productSaved"
			>
			</fast-register>
			<products-search-form
				quotation
				v-if="isProductSearcher"
				master
				show-lote
				purchase
				show-filter
				not-valid-negative-stock
				:search-value="searchVal"
				@add-product="setProduct"
			/>
			<retentions-form
				v-if="isWithholdingTaxes"
				:bases="typeTaxes"
				:date-formatted="false"
				:is-loading="retentionLoading"
				:purchase="model"
				:purchase-details="details"
				:purchase-disabled="!retentionExist"
				:retention-data="retentionData"
				:supplier="selectedSupplier"
				:type-document-code="typeDocumentCode"
				:flag-includes-taxes="flagIncludesTaxes"
				@close="closeSidebar(true)"
				@save="saveRetention"
				@retention-amount="getRetentionAmount"
				@retention-iva-amount="getRetentionIvaAmount"
			></retentions-form>
			<template v-if="isCommentary">
				<template v-if="currentProduct.productLots">
					<app-commentaries-lotes
						show-additional
						:product="currentProduct"
						@set-add="setCommentaryLotes"
						@close-modal="closeSidebar"
					/>
				</template>
				<template v-else>
					<app-commentaries
						show-additional
						:product="currentProduct"
						@set-add="setCommentary"
						@close-modal="closeSidebar"
					/>
				</template>
			</template>
			<control-series
				v-if="action.code === 'control-series'"
				:detail="detailSeries"
				:product="productSerie"
				@sumCalculated="handleSumCalculated"
				@send-series="sendSeries"
				@close-modal="closeSidebar(true)"
			/>
			<person-search-form
				v-if="action.code === 'supplier-searcher'"
				:search-value="searchValSupplier"
				url="suppliers"
				@add-person="setSupplier"
			/>
			<type-change-form
				v-if="action.code === 'TC'"
				:year="filtersChange.year"
				:month="filtersChange.month"
				:day="filtersChange.day"
				:rows="rowsTypeChange"
				@close-modal="closeSidebar"
				@set-date="setDateType"
				@add-type="addType"
			/>

			<additionalInformation
				v-if="action.code === 'ADI'"
				:additional-information="additionalInformation"
				@close="closeModal"
				:isPurchase="true"
				:id="id"
				@save-data-form="saveDataForm"
			/>

			<paymentInformation
				v-if="action.code === 'TP'"
				:value="urlVoucher"
				:isPurchase="true"
				:id="id"
				:additional-information="paymentInformation"
				@close="closeModal"
				@save-data-form="saveDataPayment"
			/>
		</action-sidebar>
		<v-dialog v-model="showDialogLot" persistent max-width="400px">
			<modal-items
				v-if="showDialogLot"
				show-slot
				name-action="Añadir"
				name-cancel="Cerrar"
				:title="titleAddLot"
				@close-modal="closeModalLot"
				@action-modal="addLotProduct"
			>
				<v-flex xs12 pt-3 pb-3 px-3>
					<v-layout row wrap>
						<v-flex
							mb-2
							v-for="(feature, featureIndex) in selectedProduct.features"
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
								@input="setVariationModel($event, featureIndex)"
							></app-select>
						</v-flex>
						<v-flex xs4 pr-1 mt-1>
							<app-input-text
								:disabled="true"
								label="Stock"
								model="stock"
								:text="variationModel.stock"
								type="number"
								@input="setVariationModel($event)"
							></app-input-text>
						</v-flex>
						<v-flex xs8 pr-1 mt-1>
							<app-input-text
								label="Nro de Lote"
								model="lot"
								type="text"
								:text="variationModel.lot"
								@input="setVariationModel($event)"
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
								@input="setVariationModel($event)"
							></app-select>
						</v-flex>
						<v-flex xs6 pr-2 mt-1>
							<app-select
								autocomplete
								:item="variationModel.brandId"
								:items="brands"
								item-text="name"
								item-value="id"
								label="Marca"
								model="brandId"
								:return-object="false"
								@input="setVariationModel($event)"
							></app-select>
						</v-flex>
					</v-layout>
				</v-flex>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showErrorAverage" persistent max-width="400px">
			<modal-items
				v-if="showErrorAverage"
				name-action="Seguir con la compra"
				name-cancel="Cerrar"
				show-slot
				title="Costo Promedio"
				:disabled="isLoadingCProm"
				@close-modal="closeModalAverage"
				@action-modal="loadMakePurchases"
			>
				<div class="pa-3">
					<p>Los siguientes productos tienen un precio por debajo del costo promedio:</p>
					<p class="pl-1 mb-1" v-for="item in sendProducts" :key="item.productId">
						- {{ item.productName }}
					</p>
					<p class="mb-0 mt-3">
						<v-icon color="info" mr-1>info</v-icon>
						Las comparaciones se están realizando con la lista de precio por defecto
					</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog persistent v-model="dialogCalculateSale" max-width="515px">
			<v-card class="modal-items">
				<v-card-title class="modal-items-title">
					{{ titleDialog }}
				</v-card-title>
				<v-divider></v-divider>
				<v-layout v-if="!showListPrice" align-center row class="bg-header py-2 px-5 mt-1">
					<v-flex>
						<img src="/static/icon/exclamacion.svg" />
					</v-flex>
					<v-flex class="ml-2 primary--text text-alert">
						Para editar el precio de venta, elimine el producto del listado de compra y
						modifique el precio al agregar el producto
					</v-flex>
				</v-layout>
				<v-card-text>
					<v-flex class="title-header pb-1">Información del Producto</v-flex>
					<v-layout mt-2>
						<v-layout row wrap align-center>
							<v-flex d-flex align-center pl-2 class="column-label"> Nombre: </v-flex>
							<v-flex d-flex align-center class="column-value">
								{{ objPricesale.nameProduct }}
							</v-flex>
						</v-layout>
						<v-layout row wrap align-center ml-1>
							<v-flex d-flex align-center pl-2 class="column-label width-stock">
								Código:
							</v-flex>
							<v-flex d-flex align-center class="column-value">
								{{ objPricesale.codeProduct }}
							</v-flex>
						</v-layout>
					</v-layout>
					<v-layout mt-1>
						<v-layout row wrap align-center>
							<v-flex d-flex align-center pl-2 class="column-label width-stock">
								Stock Total:
							</v-flex>
							<v-flex d-flex align-center class="column-value">
								{{ objPricesale.stockProduct }}
							</v-flex>
						</v-layout>
						<v-layout row wrap align-center ml-1>
							<v-flex d-flex align-center pl-2 class="column-label width-cprom">
								Costo Promedio:
							</v-flex>
							<v-flex d-flex align-center class="column-value">
								{{ objPricesale.costPromProducto | round }}
							</v-flex>
						</v-layout>
					</v-layout>
					<v-flex class="title-header mt-3 pb-1">
						<v-layout row justify-space-between wrap>
							<v-flex>Última Compra</v-flex>
							<v-flex text-xs-right class="ft-11"
								>Fecha:
								<span class="gray-color">{{ ultProductInfo.createdAt }}</span></v-flex
							>
						</v-layout>
					</v-flex>
					<v-flex v-if="showNotPurchase">
						<table class="table-sale mt-2">
							<tr>
								<th v-for="(item, index) in columnsSale" :key="index" class="item-column">
									{{ item.name }}
								</th>
							</tr>
							<tr>
								<td class="row-table">{{ ultProductInfo.name }}</td>
								<td class="row-table">{{ ultProductInfo.price }}</td>
								<td class="row-table">{{ ultProductInfo.quantity }}</td>
								<td class="row-table">{{ ultProductInfo.tax }}</td>
								<td class="row-table">{{ ultProductInfo.total | round }}</td>
								<td class="row-table">{{ ultProductInfo.number }}</td>
								<td class="row-table">
									<button
										@click="goToDetailPurchase(ultProductInfo)"
										class="link-purchase"
									>
										{{ ultProductInfo.serie }}
									</button>
								</td>
								<td class="row-table">{{ ultProductInfo.percentageUtil }}</td>
								<td class="row-table">{{ ultProductInfo.utilImp }}</td>
							</tr>
						</table>
					</v-flex>
					<v-flex v-else mt-2>
						El producto seleccionado no tiene registros de compra.
					</v-flex>
					<v-flex class="title-header" mt-4>
						<v-layout row wrap justify-space-between>
							<v-flex xs7 pb-1>Detalle de Compra</v-flex>
							<v-flex xs4 ml-1>
								<v-layout row align-center>
									<v-flex class="label-util">Total</v-flex>
									<v-flex ml-2>
										<v-switch
											hide-details
											color="success"
											:false-value="0"
											:true-value="1"
											v-model="changeTotal"
											@change="changeSwitchTotalArr"
										></v-switch>
									</v-flex>
									<v-flex class="label-util"> SubTotal </v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-3>
						<v-layout row wrap>
							<v-flex xs2>
								<v-layout column>
									<v-flex class="label-input" text-xs-center> Cant </v-flex>
									<v-flex xs1>
										<app-input-text
											:disabled="disabledEdit"
											type="number"
											model="quantity"
											:text="objPricesale.quantity"
											@input="setDetailPurchase"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs2 ml-2>
								<v-layout column>
									<v-flex class="label-input" text-xs-center> C.Unit </v-flex>
									<v-flex xs1>
										<app-input-text
											:disabled="disabledEdit"
											model="costUnit"
											:text="objPricesale.costUnit | formatNumber"
											@input="setDetailCostUnitArr"
											type="number"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs2 ml-2>
								<v-layout column>
									<v-flex class="label-input" text-xs-center> Sub Total </v-flex>
									<v-flex
										xs1
										v-if="showTotal"
										pt-1
										text-xs-center
										class="text-information-list"
									>
										<app-input-text
											:disabled="disabledEdit"
											model="total"
											:text="objPricesale.subtotal | formatNumber"
											type="number"
											@input="setDetailSubtotal"
										/>
									</v-flex>
									<v-flex v-else xs1 pt-2 text-xs-center class="text-information-list">
										{{ objPricesale.subtotal | formatNumber }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs2 ml-2>
								<v-layout column>
									<v-flex class="label-input" text-xs-center>
										{{ labelsByCountry.taxName }}
									</v-flex>
									<v-flex xs1 pt-2 text-xs-center class="text-information-list">
										{{ objPricesale.tax | formatNumber }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs2 ml-2>
								<v-layout column>
									<v-flex class="label-input" text-xs-center> Total </v-flex>
									<v-flex xs1>
										<app-input-text
											v-if="!showTotal"
											:disabled="disabledEdit"
											model="total"
											:text="objPricesale.total"
											type="number"
											@input="setDetailTotalArr"
										/>
										<v-flex text-xs-center pt-2 class="text-information-list" v-else>{{
											objPricesale.total | formatNumber
										}}</v-flex>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
					<div v-if="showListPrice">
						<v-flex mt-4 class="title-header">
							<v-layout row align-center>
								<v-flex xs6>Precio</v-flex>
								<v-flex xs6>
									<v-layout row align-center justify-end>
										<v-flex xs1 class="primary--text ft-8" v-if="!utilPrevious"
											>Editar:</v-flex
										>
										<v-flex xs6 ml-1 v-if="!utilPrevious">
											<v-layout row align-center>
												<v-flex class="label-util ml-2">%Util</v-flex>
												<v-flex ml-2>
													<v-switch
														hide-details
														color="success"
														:false-value="0"
														:true-value="1"
														v-model="changeUtility"
														@change="changeSwitchUtility"
													></v-switch>
												</v-flex>
												<v-flex class="label-util"> Util </v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs4 text-xs-right>
											<v-layout row align-center>
												<v-flex ml-2>
													<v-checkbox
														hide-details
														color="primary"
														v-model="includeTax"
														:true-value="1"
														:false-value="0"
													></v-checkbox>
												</v-flex>
												<v-flex class="label-checkbox ml-1">
													{{ labelTax }}
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex mt-2>
							<app-select
								item-text="name"
								item-value="id"
								label="Lista de Precios"
								model="priceListArrValue"
								:item="priceListArrValue"
								:items="priceListsFilter"
								@input="setPriceListArr"
								multiple
								chips
							/>
						</v-flex>
						<v-flex mt-3 v-for="(item, index) in priceListArr" :key="index">
							<v-layout row>
								<v-flex xs2>
									<v-layout column v-if="includeTax">
										<v-flex class="label-input" text-xs-center> P. Compra </v-flex>
										<v-flex pt-2 text-xs-center class="text-information-list">
											{{ priceListObj.pricePurchase | formatNumber }}
										</v-flex>
									</v-layout>
									<v-layout column v-else>
										<v-flex class="label-input" text-xs-center> Costo. Unit </v-flex>
										<v-flex pt-2 text-xs-center class="text-information-list">
											{{ priceListObj.unitCost | formatNumber }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs2 ml-2>
									<v-layout column v-if="includeTax">
										<v-flex class="label-input" text-xs-center> P. Vent </v-flex>
										<v-flex mt-1 text-xs-center>
											<v-text-field
												class="filter-select shadow-inset input-max-width"
												v-if="!utilPrevious"
												hide-details
												:disabled="disabledEdit"
												:value="item.priceSale | formatNumber"
												type="number"
												@input="(value) => setPriceSaleArr(item.priceListId, value)"
											/>
											<span v-else class="text-information-list">
												{{ item.priceSale | formatNumber }}
											</span>
										</v-flex>
									</v-layout>
									<v-layout column v-else>
										<v-flex class="label-input" text-xs-center> P. Unit </v-flex>
										<v-flex mt-1 text-xs-center>
											<v-text-field
												class="filter-select shadow-inset input-max-width"
												hide-details
												v-if="!utilPrevious"
												type="number"
												model="priceUnit"
												:value="item.priceUnit"
												:disabled="disabledEdit"
												@click.stop="stopClick"
												@input="(value) => setPriceUnitArr(item.priceListId, value)"
											/>
											<span v-else class="text-information-list">{{
												item.priceUnit | formatNumber
											}}</span>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs2 ml-2>
									<v-layout column v-if="includeTax">
										<v-flex class="label-input" text-xs-center>
											% Utilidad
											<v-tooltip top>
												<v-icon slot="activator" small class="ml-1">help</v-icon>
												<span>Porcentaje que le agregas al costo para fijar el precio de venta. Ej: costo S/ 25 + 100% de utilidad = precio S/ 50.</span>
											</v-tooltip>
										</v-flex>
										<v-flex mt-1 text-xs-center>
											<v-text-field
												:disabled="disabledEdit"
												class="filter-select shadow-inset input-max-width"
												hide-details
												v-if="!showUtility && !utilPrevious"
												type="number"
												:value="item.markupPercentage | formatNumber"
												@click.stop="stopClick"
												@input="(value) => setPercentageUtilArr(item.priceListId, value)"
											/>
											<span v-else pt-2 class="text-information-list">{{
												item.markupPercentage | formatNumber
											}}</span>
										</v-flex>
									</v-layout>
									<v-layout column v-else>
										<v-flex class="label-input" text-xs-center> % Utilidad </v-flex>
										<v-flex mt-1 text-xs-center>
											<v-text-field
												:disabled="disabledEdit"
												class="filter-select shadow-inset input-max-width"
												hide-details
												v-if="!showUtility && !utilPrevious"
												type="number"
												:value="item.percentageUtilUlt | formatNumber"
												@click.stop="stopClick"
												@input="
													(value) => setPercentageUtilUltArr(item.priceListId, value)
												"
											/>
											<span v-else pt-2 class="text-information-list">{{
												item.percentageUtilUlt | formatNumber
											}}</span>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs2 ml-2>
									<v-layout column v-if="includeTax">
										<v-flex class="label-input" text-xs-center> Utilidad </v-flex>
										<v-flex pt-2 text-xs-center>
											<v-text-field
												:disabled="disabledEdit"
												class="filter-select shadow-inset input-max-width"
												hide-details
												v-if="showUtility && !utilPrevious"
												type="number"
												:value="item.profitAmount"
												@click.stop="stopClick"
												@input="(value) => setUtilityImpArr(item.priceListId, value)"
											/>
											<v-flex v-else text-xs-center class="text-information-list">{{
												item.profitAmount
											}}</v-flex>
										</v-flex>
									</v-layout>
									<v-layout column v-else>
										<v-flex class="label-input" text-xs-center> Utilidad </v-flex>
										<v-flex mt-1>
											<app-input-text
												:disabled="disabledEdit"
												v-if="showUtility && !utilPrevious"
												type="number"
												model="utilityUlt"
												:text="item.utilityUlt"
												@input="(value) => setUtilityImpUltArr(item.priceListId, value)"
											/>
											<v-flex v-else text-xs-center class="text-information-list">{{
												item.utilityUlt
											}}</v-flex>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-layout row class="title-header mt-3" pb-2>
							<v-flex xs5 mr-3>Actualizar precio de venta en:</v-flex>
							<v-flex>
								<app-tooltip-button
									:img="'/static/img/new-icons/icon-help-fill.svg'"
									text="Si en caso no selecciona una tienda, se actualizara en todas sus tiendas con el nuevo precio
								de venta"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
						<v-flex mt-2>
							<app-select
								:disabled="disabledEdit"
								deletable-chips
								label="Tiendas"
								model="warehouseId"
								:item="priceListObj.warehouseId"
								chips
								multiple
								item-text="name"
								item-value="id"
								:items="warehousesSales"
								@input="setParamsWarehouse"
								:return-object="false"
							/>
						</v-flex>
					</div>
				</v-card-text>
				<v-card-actions class="modal-items-action">
					<v-layout row wrap justify-center>
						<v-flex xs3 text-xs-center>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click="closeDialogChangeSale"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3 v-if="showAddModal" text-xs-center>
							<v-btn
								color="primary"
								class="btn-action white--text"
								@click="addProductModal"
							>
								Guardar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- dialogCalculateSale -->
		<v-dialog persistent v-model="dialogmodalLotes" max-width="515px">
			<modalLotes
				ref="modalLotes"
				:lotInfo="newLotInfo"
				:newObject="selectedProduct.product"
				:disabledEdit="disabledEdit"
				:showAddModal="showAddModal"
				@closeModalLotes="handlecloseModalLotes"
				@addProductModal="addProductModalLot"
			/>
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
			title-header="TIPO DE DOCUMENTO"
			text-content="No esta configurado para este tipo de documento"
			:show-modal-init="showModalInit"
			max-width-dialog="571px"
			@close-dialog="closeDialogInit"
		/>
		<app-show-dialog
			title-header="CUENTA BANCARIA"
			text-content="El tipo de moneda de la cuenta bancaria debe ser igual a la moneda que se realizará la compra"
			:show-modal-init="showModalBank"
			max-width-dialog="571px"
			@close-dialog="closeDialogBank"
		/>
		<app-show-dialog
			color-dialog="info"
			title-header="TIPO DE CAMBIO"
			:show-modal-init="showModalChange"
			text-content="No se puede grabar una compra en dólares sin tipo de cambio, se sugiere usar el T. Cambio SUNAT"
			max-width-dialog="571px"
			@close-dialog="closeDialogChange"
		/>
		<app-show-dialog
			color-dialog="info"
			title-header="Nueva Compra"
			text-content="Para poder realizar la compra, verificar que los productos agregados tengan un total mayor a 0."
			:show-modal-init="showModalValidatedPurchase"
			@close-dialog="closeDialogValidatedPurchase"
		/>
		<v-dialog v-model="showConfirmNewPurchaseDialog" persistent max-width="600px">
			<v-card class="modal-items rounded-lg">
				<v-card-title class="modal-items-title headline" style="font-weight: bold; background-color: #ffebee; color: #c62828;">
					¿Iniciar nueva compra?
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text class="pa-4 text-xs-center body-1" style="font-size: 18px !important; line-height: 1.5;">
					Al iniciar una nueva compra, <span style="color: #d32f2f; font-weight: bold;">se limpiara toda la información de la compra actual.</span>
					<br><br>
					<span style="font-size: 18px !important; font-weight: bold; display: block; margin-top: 10px;">¿Deseas continuar?</span>
				</v-card-text>
				<v-card-actions class="modal-items-action">
					<v-layout row wrap justify-center>
						<v-flex xs5 text-xs-center>
							<v-btn
								outline
								color="primary"
								class="ma-1"
								style="border-radius: 5px !important; box-shadow: none !important; height: 35px !important; text-transform: none !important; width: 140px !important; font-size: 13px !important;"
								@click="onCancelNewPurchase"
							>
								No, seguir editando 
							</v-btn>
						</v-flex>
						<v-flex xs7 text-xs-center>
							<v-btn
								color="primary"
								class="btn-action white--text ma-1"
								style="width: 140px !important; height: 35px !important; font-size: 18px !important;"
								@click="onConfirmNewPurchase"
							>
								Sí, iniciar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<modal-accounting-period
			:open="openModalAccountingPeriod"
			@confirm="onSelectAccountingPeriod"
			@close="openModalAccountingPeriod = false"
			@clean="onSelectAccountingPeriod(null)"
		/>
	</section>
</template>

<script>
import { minLength, required, requiredIf } from 'vuelidate/lib/validators';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import addDays from 'date-fns/add_days';
import autoCompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import fastRegister from '@/components/shared/product/fast-register';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import headerSummary from '@/components/shared/header-summary';
import historyProducts from '@/components/products/history-products';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import purchasesDetails from '@/components/purchases/purchases-details';
import purchasesPayments from '@/components/purchases/purchases-payments';
import purchasesQuotes from '@/components/purchases/purchases-quotes';
import purchasesTransactions from '@/components/purchases/purchases-transactions';
import retentionsForm from '@/components/purchases/retentions-form';
import suppliersForm from '@/components/purchases/suppliers-form';
import tableCode from '@/shared/table-code';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import controlSeries from '@/components/purchases/control-series';
import lib from '@/shared/lib';
import BasePrice from '@/shared/basePrice';
import btnAverageCost from '@/components/shared/sales/btn-average-cost';
import flagType from '@/shared/flag-type';
import modalItems from '@/components/shared/modal-items';
import Sales from '@/shared/sale';
import appShowDialog from '@/components/shared/app-show-dialog';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import typeChangeForm from '@/components/purchases/type-change-form';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import typePaymentForm from '@/shared/type-payment-form';
import helper from '@/shared/helper';
import modalLotes from '@/components/modal-lotes';
import ModalAccountingPeriod from '@/components/purchases/modal-accounting-period';
import additionalInformation from '@/components/quotation/additional-information';
import paymentInformation from '@/components/quotation/payment-information';

const { equality, setNewProperty, round, compose, isEmpty, find, getDeeper } = lib;

const twoDecimals = round(2);
const sevenDecimals = round(7);
const Sale = new Sales();

const emptyProduct = {
	price: 0,
	id: null,
	nameProduct: '',
	priceProduct: 0,
	product: {
		name: '',
		code: '',
		unitName: '',
	},
};

function getDynamicFormPurchase() {
	// DOCUMENTOS DEL LOCAL STORAGE
	const documents = helper.getLocalData('documents') || [];
	const orderPurchase = documents.find((d) => d.comTypeDocumentId === 10);
	if (orderPurchase) {
		return (
			orderPurchase.additionalInformation &&
			orderPurchase.additionalInformation.aditionalInfo
		);
	}
	return null;
}

function makeCommentary(product) {
	this.currentProduct = { ...product };
	this.action = {
		active: true,
		code: 'COMME',
		open: true,
		title: product.description,
		width: 450,
	};
}

function isCommentary() {
	return this.action.code === 'COMME';
}

function historyProductsModal() {
	return this.action.code === 'history-products';
}

// eslint-disable-next-line max-len
function setCommentaryLotes({ dateDue, date, code, location, codeEan }, commentary) {
	const { id, productId, warWarehousesId } = this.currentProduct;
	this.model.details = this.model.details.map((p) => {
		const newP = { ...p };
		if (
			newP.productId === productId &&
			newP.warWarehousesId === warWarehousesId &&
			newP.id === id
		) {
			newP.commentary = commentary;
			newP.productLots.dateDue = dateDue;
			newP.productLots.date = date;
			newP.productLots.code = code;
			newP.productLots.location = location;
			newP.productLots.codeEan = codeEan;
		}
		return newP;
	});
	this.closeSidebar();
}

function setCommentary(value) {
	const { commentary, expirationDate, location } = value;
	const { id, productId, warWarehousesId } = this.currentProduct;
	this.model.details = this.model.details.map((p) => {
		const newP = { ...p };
		if (
			newP.productId === productId &&
			newP.warWarehousesId === warWarehousesId &&
			newP.id === id
		) {
			newP.commentary = commentary;
			newP.expirationDate = expirationDate;
			newP.location = location;
		}
		return newP;
	});
}

function getRetentionAmount(ret) {
	this.retentionAmount = ret;
}

function getRetentionIvaAmount(ret) {
	this.retentionTaxAmount = ret;
}

function maxLengthSerie() {
	return this.isEcuador ? 6 : null;
}

function updateColumns({ settings }) {
	const { flagImport } = settings;
	this.columns = this.columns.reduce((list, item) => {
		if (item.value === 'tax') {
			const updatedColumnTax = setNewProperty(
				'name',
				`${this.labelsByCountry.taxName} %`
			)(item);
			return [].concat(list, updatedColumnTax);
		}

		if (item.value === 'productBrands') {
			const updatedBrandColumn = compose(
				setNewProperty('checked', flagImport),
				setNewProperty('visible', flagImport)
			)(item);
			return [].concat(list, updatedBrandColumn);
		}

		return [].concat(list, item);
	}, []);
}

function openDialogLotes() {
	this.dialogmodalLotes = true;
}

function handlecloseModalLotes() {
	this.dialogmodalLotes = false;
}

function openSlideTypeChange() {
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
}

async function loadTypeChange(params) {
	const exchangeRates = helper.getLocalData('ms-exchange-rates');
	const lastUpdated = helper.getLocalData('ms-exchange-rates-last-updated');
	const today = new Date().toISOString().split('T')[0];

	if (exchangeRates && lastUpdated === today && !params) return;

	try {
		const response = await this.$httpSales.get('ms-exchange-rates', { params });
		this.rowsTypeChange = response.data;

		if (!params) {
			helper.setLocalData('ms-exchange-rates', response.data);
			helper.setLocalData('ms-exchange-rates-last-updated', today);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function setDateType({ model, value }) {
	if (value && (model === 'year' || model === 'month')) {
		this.filtersChange[model] = value;
	}

	const params = {
		month: this.filtersChange.month,
		year: this.filtersChange.year,
		currency: 'USD',
	};
	this.loadTypeChange(params);
}

function addType(row) {
	this.exchangeRate = row.amount;
	this.closeSidebar();
	this.changeTypeCurrency('USD');
}

function openHistoryProducts(row) {
	this.historyProducts = true;
	this.action = {
		open: true,
		code: 'history-products',
		title: `Historial de Compra - ${row.productName}`,
		width: 850,
	};
	this.loadHistoryProducts(row);
}

async function loadHistoryProducts(row) {
	const params = {
		flagRecord: true,
		productId: row.productId,
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

function goToDetailPurchase({ documentId }) {
	const routeData = this.$router.resolve({
		name: 'purchase-detail',
		params: { id: documentId },
	});
	window.open(routeData.href, '_blank');
}

function labelTax() {
	if (this.includeTax) {
		return `Con ${this.labelsByCountry.taxName}`;
	}
	return `Sin ${this.labelsByCountry.taxName}`;
}

function changeSwitchUtility(value) {
	this.showUtility = value === 1;
}

function setParamsWarehouse({ model, value }) {
	this.priceListObj[model] = [...value];
}

function setPercentageUtil(value) {
	const { pricePurchase, priceUnit } = this.priceListObj;
	const priceSaleOrigin = this.priceListObj.priceSale;
	this.priceListObj.percentageUtil = Number(value);
	this.priceListObj.priceSale =
		(value * Number(pricePurchase)) / 100 + Number(pricePurchase);
	this.priceListObj.flagEdit = !!(
		Number(this.priceListObj.priceSale) !== priceSaleOrigin
	);
	this.priceListObj.utility = this.priceListObj.priceSale - Number(pricePurchase);
	this.priceListObj.priceUnit =
		this.priceListObj.priceSale / (1 + this.labelsByCountry.percentage / 100);
	this.priceListObj.utilityUlt = this.priceListObj.priceUnit - Number(priceUnit);
	this.priceListObj.percentageUtilUlt =
		(this.priceListObj.utilityUlt - Number(priceUnit)) * 100;
}

function setPercentageUtilArr(id, value) {
	const { pricePurchase } = this.priceListObj;
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceSaleOrigin = pl.priceSale;
		const markupPercentage = Number(value);
		const priceSale = (value * Number(pricePurchase)) / 100 + Number(pricePurchase);
		const flagEdit = !!(Number(priceSale) !== priceSaleOrigin);
		const profitAmount = priceSale - Number(pricePurchase);
		const priceUnit = priceSale / (1 + this.labelsByCountry.percentage / 100);
		const utilityUlt = priceUnit - Number(priceUnit);
		const percentageUtilUlt = (utilityUlt - Number(priceUnit)) * 100;

		return {
			...pl,
			markupPercentage,
			priceSale,
			flagEdit,
			profitAmount,
			priceUnit,
			utilityUlt,
			percentageUtilUlt,
		};
	});
}

function setUtilityImp(value) {
	const { pricePurchase, priceUnit } = this.priceListObj;
	const priceSaleOrigin = this.priceListObj.priceSale;
	this.priceListObj.utility = Number(value);
	this.priceListObj.priceSale = Number(value) + Number(pricePurchase);
	this.priceListObj.flagEdit = !!(
		Number(this.priceListObj.priceSale) !== priceSaleOrigin
	);
	this.priceListObj.percentageUtil = (Number(value) / pricePurchase) * 100;
	this.priceListObj.priceUnit =
		Number(this.priceListObj.priceSale) / (1 + this.labelsByCountry.percentage / 100);
	this.priceListObj.utilityUlt = Number(this.priceListObj.priceUnit) - Number(priceUnit);
	this.priceListObj.percentageUtilUlt = twoDecimals(
		(this.priceListObj.utilityUlt - Number(priceUnit)) * 100
	);
}

function setUtilityImpArr(id, value) {
	const { pricePurchase } = this.priceListObj;
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceSaleOrigin = pl.priceSale;
		const profitAmount = Number(value);
		const priceSale = Number(value) + Number(pricePurchase);
		const flagEdit = !!(Number(priceSale) !== priceSaleOrigin);
		const markupPercentage = (Number(value) / pricePurchase) * 100;
		const priceUnit = Number(priceSale) / (1 + this.labelsByCountry.percentage / 100);
		const utilityUlt = Number(priceUnit) - Number(priceUnit);
		const percentageUtilUlt = twoDecimals((utilityUlt - Number(priceUnit)) * 100);

		return {
			...pl,
			profitAmount,
			priceSale,
			flagEdit,
			markupPercentage,
			priceUnit,
			utilityUlt,
			percentageUtilUlt,
		};
	});
}

function setPriceSale(value) {
	this.priceListObj.flagEdit = !!(Number(value) !== this.priceListObj.priceSale);
	const { pricePurchase, unitCost } = this.priceListObj;
	this.priceListObj.priceSale = Number(value);
	this.priceListObj.utility = twoDecimals(Number(value) - Number(pricePurchase));
	this.priceListObj.percentageUtil = twoDecimals(
		(this.priceListObj.utility / pricePurchase) * 100
	);
	this.priceListObj.priceUnit =
		Number(value) / (1 + this.labelsByCountry.percentage / 100);
	this.objPricesale.utilityUlt = Number(this.priceListObj.priceUnit) - Number(unitCost);
	this.objPricesale.percentageUtilUlt = twoDecimals(
		(this.objPricesale.utilityUlt - unitCost) * 100
	);
}

function setPriceSaleArr(id, value) {
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceSale = Number(value);
		const profitAmount = twoDecimals(
			Number(value) - Number(this.priceListObj.pricePurchase)
		);
		const markupPercentage = twoDecimals(
			(profitAmount / this.priceListObj.pricePurchase) * 100
		);
		const priceUnit = Number(value) / (1 + this.labelsByCountry.percentage / 100);
		const utilityUlt = Number(priceUnit) - Number(this.priceListObj.unitCost);
		const percentageUtilUlt = twoDecimals(
			(utilityUlt - this.priceListObj.unitCost) * 100
		);
		return {
			...pl,
			flagEdit: !!(Number(value) !== pl.priceSaleOrigin),
			priceSale,
			profitAmount,
			markupPercentage,
			priceUnit,
			utilityUlt,
			percentageUtilUlt,
		};
	});
}

function setUtilityImpUlt({ model, value }) {
	const { pricePurchase } = this.priceListObj;
	const priceSaleOrigin = this.priceListObj.priceSale;
	this.priceListObj[model] = Number(value);
	this.priceListObj.priceUnit = Number(value) + Number(this.priceListObj.priceUnit);
	this.priceListObj.percentageUtilUlt = twoDecimals(
		(Number(value) - this.priceListObj.priceUnit) * 100
	);
	this.priceListObj.priceSale =
		this.priceListObj.priceUnit * (1 + this.labelsByCountry.percentage / 100);
	this.priceListObj.flagEdit = !!(
		Number(this.priceListObj.priceSale) !== priceSaleOrigin
	);
	this.priceListObj.utility = twoDecimals(
		Number(this.priceListObj.priceSale) - Number(this.priceListObj.pricePurchase)
	);
	this.priceListObj.percentageUtility = (Number(value) / pricePurchase) * 100;
}

function setUtilityImpUltArr(id, value) {
	const { pricePurchase } = this.priceListObj;
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceSaleOrigin = pl.priceSale;
		const utilityUlt = Number(value);
		const priceUnit = Number(value) + Number(pl.priceUnit);
		const percentageUtilUlt = twoDecimals((Number(value) - priceUnit) * 100);
		const priceSale = priceUnit * (1 + this.labelsByCountry.percentage / 100);
		const flagEdit = !!(Number(priceSale) !== priceSaleOrigin);
		const profitAmount = twoDecimals(Number(priceSale) - Number(pricePurchase));
		const markupPercentage = twoDecimals((profitAmount / pricePurchase) * 100);

		return {
			...pl,
			utilityUlt,
			priceUnit,
			percentageUtilUlt,
			priceSale,
			flagEdit,
			profitAmount,
			markupPercentage,
		};
	});
}

function setDetailPurchase({ model, value }) {
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = value;
	this.objPricesale.subtotal = Number(value) * Number(this.objPricesale.costUnit);
	this.objPricesale.total = this.objPricesale.subtotal * (1 + percentage / 100);
	this.objPricesale.tax = this.objPricesale.total - this.objPricesale.subtotal;
	this.total = this.objPricesale.total;
	this.priceListObj.pricePurchase =
		this.objPricesale.total / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);
	this.priceListObj.utility = Number(
		this.priceListObj.priceSale - this.priceListObj.pricePurchase
	).toFixed(2);
	this.priceListObj.percentageUtil =
		(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
}

function setDetailTotal({ model, value }) {
	this.total = Number(value);
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.costUnit =
		Number(value) / Number(this.objPricesale.quantity) / (1 + percentage / 100);
	this.objPricesale.subtotal = Number(value) / (1 + percentage / 100);
	this.objPricesale.tax = Number(this.objPricesale.subtotal) * (percentage / 100);
	this.priceListObj.pricePurchase = Number(value) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);
	this.priceListObj.utility = Number(
		this.priceListObj.priceSale - this.priceListObj.pricePurchase
	).toFixed(2);
	this.priceListObj.percentageUtil =
		(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
}

function setDetailTotalArr({ model, value }) {
	this.total = Number(value);
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.costUnit =
		Number(value) / Number(this.objPricesale.quantity) / (1 + percentage / 100);
	this.objPricesale.subtotal = Number(value) / (1 + percentage / 100);
	this.objPricesale.tax = Number(this.objPricesale.subtotal) * (percentage / 100);

	this.priceListObj.pricePurchase = Number(value) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);

	this.priceListArr = this.priceListArr.map((pl) => {
		const profitAmount = Number(pl.priceSale - this.priceListObj.pricePurchase).toFixed(2);

		return {
			...pl,
			profitAmount,
			markupPercentage: (profitAmount / this.priceListObj.pricePurchase) * 100,
		};
	});
}

function changeSwitchTotal(value) {
	const percentage = this.labelsByCountry.percentage;
	this.showTotal = value === 1;
	if (value === 1) {
		this.objPricesale.subtotal = this.objPricesale.total;
		this.objPricesale.total =
			this.objPricesale.subtotal * (1 + this.objPricesale.percentage / 100);
		this.total = this.objPricesale.total;
		this.objPricesale.tax = this.objPricesale.total - this.objPricesale.subtotal;
		this.objPricesale.costUnit =
			this.objPricesale.total /
			(this.quantity * (1 + this.objPricesale.percentage / 100));
		this.priceListObj.pricePurchase =
			Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
		this.priceListObj.unitCost =
			this.priceListObj.pricePurchase / (1 + (percentage || 0) / 100);
		this.priceListObj.utility = Number(
			this.priceListObj.priceSale - this.priceListObj.pricePurchase
		).toFixed(2);
		this.priceListObj.percentageUtil =
			(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
	} else {
		this.objPricesale.total = this.objPricesale.subtotal;
		this.total = this.objPricesale.total;
		this.objPricesale.subtotal =
			Number(this.objPricesale.total) / (1 + this.objPricesale.percentage / 100);
		this.objPricesale.tax =
			Number(this.objPricesale.subtotal) * (this.objPricesale.percentage / 100);
		this.objPricesale.costUnit =
			this.objPricesale.total /
			(this.quantity * (1 + this.objPricesale.percentage / 100));
		this.priceListObj.pricePurchase =
			Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
		this.priceListObj.unitCost =
			this.priceListObj.pricePurchase / (1 + (percentage || 0) / 100);
		this.priceListObj.utility = Number(
			this.priceListObj.priceSale - this.priceListObj.pricePurchase
		).toFixed(2);
		this.priceListObj.percentageUtil =
			(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
	}
}

function changeSwitchTotalArr(value) {
	const percentage = this.labelsByCountry.percentage;
	this.showTotal = value === 1;
	if (value === 1) {
		this.objPricesale.subtotal = this.objPricesale.total;
		this.objPricesale.total =
			this.objPricesale.subtotal * (1 + this.objPricesale.percentage / 100);
		this.total = this.objPricesale.total;
		this.objPricesale.tax = this.objPricesale.total - this.objPricesale.subtotal;
		this.objPricesale.costUnit =
			this.objPricesale.total /
			(this.quantity * (1 + this.objPricesale.percentage / 100));
		this.priceListObj.pricePurchase =
			Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
		this.priceListObj.unitCost =
			this.priceListObj.pricePurchase / (1 + (percentage || 0) / 100);
	} else {
		this.objPricesale.total = this.objPricesale.subtotal;
		this.total = this.objPricesale.total;
		this.objPricesale.subtotal =
			Number(this.objPricesale.total) / (1 + this.objPricesale.percentage / 100);
		this.objPricesale.tax =
			Number(this.objPricesale.subtotal) * (this.objPricesale.percentage / 100);
		this.objPricesale.costUnit =
			this.objPricesale.total /
			(this.quantity * (1 + this.objPricesale.percentage / 100));
		this.priceListObj.pricePurchase =
			Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
		this.priceListObj.unitCost =
			this.priceListObj.pricePurchase / (1 + (percentage || 0) / 100);
	}

	this.priceListArr = this.priceListArr.map((pl) => {
		const profitAmount = Number(pl.priceSale - this.priceListObj.pricePurchase).toFixed(2);

		return {
			...pl,
			profitAmount,
			markupPercentage: (profitAmount / this.priceListObj.pricePurchase) * 100,
		};
	});
}

function setDetailCostUnit({ model, value }) {
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.subtotal = Number(value) * Number(this.objPricesale.quantity);
	this.objPricesale.tax = twoDecimals(this.objPricesale.subtotal * (percentage / 100));
	this.objPricesale.total = twoDecimals(
		Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
	);
	this.total = this.objPricesale.total;
	this.priceListObj.pricePurchase =
		Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);
	this.priceListObj.utility = Number(
		this.priceListObj.priceSale - this.priceListObj.pricePurchase
	).toFixed(2);
	this.priceListObj.percentageUtil =
		(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
}

function setDetailCostUnitArr({ model, value }) {
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.subtotal = Number(value) * Number(this.objPricesale.quantity);
	this.objPricesale.tax = twoDecimals(this.objPricesale.subtotal * (percentage / 100));
	this.objPricesale.total = twoDecimals(
		Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
	);
	this.total = this.objPricesale.total;
	this.priceListObj.pricePurchase =
		Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);

	this.priceListObj.profitAmount = Number(
		this.priceListObj.priceSale - this.priceListObj.pricePurchase
	).toFixed(2);
	this.priceListObj.markupPercentage =
		(this.priceListObj.profitAmount / this.priceListObj.pricePurchase) * 100;

	this.priceListArr = this.priceListArr.map((pl) => {
		const profitAmount = Number(pl.priceSale - this.priceListObj.pricePurchase).toFixed(2);

		return {
			...pl,
			profitAmount,
			markupPercentage: (profitAmount / this.priceListObj.pricePurchase) * 100,
		};
	});
}

function setDetailSubtotal({ model, value }) {
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.tax = twoDecimals(this.objPricesale.subtotal * (percentage / 100));
	this.objPricesale.costUnit =
		this.objPricesale.total / (this.quantity * (1 + percentage / 100));
	this.objPricesale.total = twoDecimals(
		Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
	);
	this.total = this.objPricesale.total;
	this.priceListObj.pricePurchase =
		Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);
	this.priceListObj.utility = Number(
		this.priceListObj.priceSale - this.priceListObj.pricePurchase
	).toFixed(2);
	this.priceListObj.percentageUtil =
		(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
}

function setDetailSubtotalArr({ model, value }) {
	const { taxes } = this.selectedProduct && this.selectedProduct.product;
	const validTax = taxes.find(
		(p) => p.codePercentage === '02' || p.codePercentage === '03'
	);
	const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	this.objPricesale[model] = Number(value);
	this.objPricesale.tax = twoDecimals(this.objPricesale.subtotal * (percentage / 100));
	this.objPricesale.costUnit =
		this.objPricesale.total / (this.quantity * (1 + percentage / 100));
	this.objPricesale.total = twoDecimals(
		Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
	);
	this.total = this.objPricesale.total;
	this.priceListObj.pricePurchase =
		Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
	this.priceListObj.unitCost = this.priceListObj.pricePurchase / (1 + percentage / 100);

	this.priceListArr = this.priceListArr.map((pl) => {
		const utility = Number(pl.priceSale - this.priceListObj.pricePurchase).toFixed(2);

		return {
			...pl,
			utility,
			percentageUtil: (utility / this.priceListObj.pricePurchase) * 100,
		};
	});
}

function setPriceUnit(value) {
	const { unitCost, pricePurchase } = this.priceListObj;
	this.priceListObj.priceUnit = Number(value);
	this.priceListObj.utilityUlt = Number(value) - Number(unitCost);
	this.priceListObj.percentageUtilUlt = twoDecimals(
		(this.priceListObj.utilityUlt / Number(unitCost)) * 100
	);
	this.priceListObj.priceSale =
		Number(value) * (1 + this.labelsByCountry.percentage / 100);
	this.priceListObj.utility = this.objPricesale.priceSale - Number(pricePurchase);
	this.priceListObj.percentageUtil = twoDecimals(
		(this.objPricesale.utility / pricePurchase) * 100
	);
}

function setPriceUnitArr(id, value) {
	const { unitCost, pricePurchase } = this.priceListObj;
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceUnit = Number(value);
		const utilityUlt = Number(value) - Number(unitCost);
		const percentageUtilUlt = twoDecimals((utilityUlt / Number(unitCost)) * 100);

		const priceSale = Number(value) * (1 + this.labelsByCountry.percentage / 100);

		const profitAmount = priceSale - Number(pricePurchase);
		const markupPercentage = twoDecimals((profitAmount / pricePurchase) * 100);
		return {
			...pl,
			priceUnit,
			utilityUlt,
			percentageUtilUlt,
			priceSale,
			profitAmount,
			markupPercentage,
		};
	});
}

function setPercentageUtilUlt(value) {
	const { pricePurchase } = this.priceListObj;
	const priceSaleOrigin = this.priceListObj.priceSale;
	this.priceListObj.percentageUtilUlt = Number(value);
	this.priceListObj.priceUnit = twoDecimals(
		(value * Number(this.priceListObj.unitCost)) / 100 + this.priceListObj.unitCost
	);
	this.priceListObj.utilityUlt = twoDecimals(
		Number(this.priceListObj.priceUnit) - Number(this.priceListObj.unitCost)
	);
	this.priceListObj.priceSale =
		this.priceListObj.priceUnit * (1 + this.labelsByCountry.percentage / 100);
	this.priceListObj.flagEdit = !!(
		Number(this.priceListObj.priceSale) !== priceSaleOrigin
	);
	this.priceListObj.utility = twoDecimals(
		this.priceListObj.priceSale - Number(pricePurchase)
	);
	this.priceListObj.percentageUtil = twoDecimals(
		(this.priceListObj.utility / Number(pricePurchase)) * 100
	);
}

function setPercentageUtilUltArr(id, value) {
	const { pricePurchase } = this.priceListObj;
	this.priceListArr = this.priceListArr.map((pl) => {
		if (pl.priceListId !== id) {
			return pl;
		}
		const priceSaleOrigin = pl.priceSale;
		const percentageUtilUlt = Number(value);
		const priceUnit = twoDecimals(
			(value * Number(this.priceListObj.unitCost)) / 100 + this.priceListObj.unitCost
		);
		const utilityUlt = twoDecimals(
			Number(priceUnit) - Number(this.priceListObj.unitCost)
		);
		const priceSale = priceUnit * (1 + this.labelsByCountry.percentage / 100);
		const flagEdit = !!(Number(priceSale) !== priceSaleOrigin);
		const profitAmount = twoDecimals(priceSale - Number(pricePurchase));

		return {
			...pl,
			percentageUtilUlt,
			priceUnit,
			utilityUlt,
			priceSale,
			flagEdit,
			profitAmount,
		};
	});
}

function getSubsidiaryId({ model, value }) {
	this[model] = value;
	this.subsidiary = this.subsidiaries.find((s) => s.id === value);
	this.allowProductFree = this.subsidiary.settings.allowProductFree ? 1 : 0;
}

async function getProduct(params) {
	const { data: response } = await this.$httpProducts.get('products/master', {
		params,
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
		};

		// lista de precios por defecto
		const defaultList = this.priceLists.find((el) => el.flagDefault === 1);
		this.selectedProduct.selectedPriceListId = defaultList.id;
		let productCode = code.replace(/ /g, '');
		let weight = 1;
		if (productCode[0] === '*' && productCode.length === 14) {
			productCode = code.replace(/ /g, '').substring(3, 8);
			const weightCode = code.replace(/ /g, '').substring(8, 13);
			weight = `${weightCode.substring(0, 2)}.${weightCode.substring(2, 5)}`;
		}
		// actualizo params
		params.code = productCode;
		const productToInsert = await this.getProduct(params);
		if (productToInsert) {
			if (productToInsert.typeInfo.id === 6) {
				this.showGenericError(
					'No esta permitido agregar un producto compuesto a compras'
				);
				return;
			}
			const rowExist = this.model.details.find((p) => p.id === productToInsert.id);
			const indexRow = this.model.details.findIndex((p) => p.id === productToInsert.id);
			if (rowExist) {
				this.showNotification(
					`El producto: ${productToInsert.name} ya existe, se le aumento la cantidad.`,
					'info'
				);
				this.model.details[indexRow].quantity = this.model.details[indexRow].quantity + 1;
				this.model.details[indexRow].unitQuantity =
					this.model.details[indexRow].unitQuantity + 1;
				this.selectedProduct = null;
				this.searchVal = null;
				this.cleanInput = true;
			} else {
				this.quantity = weight;
				this.setProductId(productToInsert);
				this.addProduct('productSearcherByGun');
			}
		} else {
			this.showNotification('Producto no encontrado.', 'info');
		}
	}
}

function data() {
	return {
		showConfirmNewPurchaseDialog: false,
		pendingRouteNext: null,
		originalTypeDocuments: [],
		// formatedDate: null ,
		flagDueDate: false,
		notification: {
			colorDialog: 'error',
			colorHex: '#D5331A',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
		origensPurchases: [],
		brands: [],
		codeDocuments: ['BOL', 'FAC', 'ORC'],
		convertDetail: {},
		commentary: null,
		titleDialog: 'CAMBIA TU PRECIO DE VENTA',
		dateOnline: '',
		entityState: null,
		dialogCalculateSale: false,
		dialogmodalLotes: false,
		disabledEdit: false,
		flagUseGun: false,
		showNotSerie: true,
		showListPrice: true,
		productEdit: false,
		showNotPurchase: true,
		objPricesale: {
			subtotal: 0,
			costUnit: 0,
			tax: null,
			quantity: null,
			total: null,
			warehouseId: null,
		},
		priceListObj: {
			flagEdit: false,
			percentageUtil: null,
			percentageUtilUlt: null,
			priceSaleOrigin: null,
			priceListId: null,
			pricePurchase: null,
			priceSale: null,
			priceUnit: null,
			unitCost: null,
			utility: null,
			utilityUlt: null,
			warehouseId: [],
		},
		priceListArr: [],
		priceListArrValue: [],
		changeUtility: false,
		priceListId: null,
		priceLists: [],
		priceListsFilter: [],
		titleAddLot: '',
		columnsSale: [
			{
				id: 1,
				name: 'Proovedor',
			},
			{
				id: 2,
				name: 'C.Unit',
			},
			{
				id: 3,
				name: 'Cant',
			},
			{
				id: 4,
				name: '',
			},
			{
				id: 5,
				name: 'Total',
			},
			{
				id: 6,
				name: '#Doc',
			},
			{
				id: 7,
				name: 'Serie',
			},
			{
				id: 8,
				name: '% Util. Ant',
			},
			{
				id: 9,
				name: 'Util. Ant',
			},
		],
		disabledFlagIncome: null,
		action: {
			code: '',
			title: 'Métodos de Pago',
			open: false,
			width: 607,
		},
		basePrice: 0,
		cashs: [],
		centersCosts: [],
		cannotBeEdited: false,
		centerCost: [],
		distributionDates: 0,
		picker: null,
		cleanInput: false,
		cleanProducts: false,
		configInfo: {
			cash: {},
			serie: {},
			terminal: {},
		},
		columns: [
			{
				id: 1,
				name: 'Cod.',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cant.',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cant. disponible',
				tooltip: 'Cant. disponible a convertir',
				visible: true,
				checked: true,
				flagVisible: !this.$route.query.cloneId,
			},
			{
				id: 5,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Stock actualizado',
				value: 'product.stock',
				visible: false,
				checked: false,
				flagVisible: true, // Ocultar para nueva compra
			},
			{
				id: 7,
				name: 'Unidad',
				value: 'productUnitName',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Marca',
				value: 'productBrands',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Caract.',
				tooltip: 'Caracteristicas',
				value: 'inlineFeatures',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Categoria',
				value: 'categoryName',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Centro de Costos',
				value: 'costCenter',
				visible: false,
				checked: false,
			},
			{
				id: 12,
				name: 'Costo',
				tooltip: 'Costo',
				value: 'cost',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Costo Unit.',
				tooltip: 'Costo Unitario',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Desc. %',
				isEditable: true,
				showInput: false,
				value: 'discountPercentage',
				visible: true,
				checked: true,
			},
			{
				id: 15,
				name: '',
				isEditable: false,
				showInput: false,
				value: 'tax',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Subtotal',
				value: 'subtotal',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Impuesto',
				value: 'taxAmount',
				visible: true,
				checked: true,
			},
			{
				id: 18,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 19,
				name: 'PV',
				tooltip: 'Precio de Venta - Lista de Precio por defecto',
				value: 'priceSale',
				visible: true,
				checked: true,
			},
				{
				id: 20,
				name: 'Util',
				visible: true,
				checked: true,
			},
			{
				id: 21,
				name: '% Utilidad',
				tooltip: 'Porcentaje de utilidad',
				visible: true,
				checked: true,
			},
			{
				id: 22,
				name: 'Marg. gan',
				tooltip: 'Margen de ganancia',
				visible: false,
				checked: false,
			},
			{
				id: 23,
				name: 'Acciones',
				value: 'amount',
				visible: true,
				checked: true,
			},
		],
		currencies: [],
		currencySymbol: '',
		currentProduct: {},
		details: [],
		flagDisplayTransfer: false,
		flagIncludesTaxes: false,
		typeDocumentCode: '',
		isLoading: false,
		isLoadingCProm: false,
		filtersChange: {
			month: null,
			year: null,
		},
		loadingGeneral: false,
		ultProductInfo: {},
		model: {
			amount: 0,
			commentary: '',
			currency: 'PEN',
			dateDocument: helper.formatDate(new Date(), 'DD/MM/YYYY'),
			dueDate: helper.formatDate(new Date(), 'DD/MM/YYYY'),
			dateIncome: helper.formatDate(new Date(), 'DD/MM/YYYY'),
			details: [],
			detailsPayments: [],
			documentNumber: '',
			flagIncomeStatus: true,
			number: '',
			paymentMethodId: 1,
			serie: '',
			serieId: '',
			subTotal: 0,
			supplierId: null,
			taxes: 0,
			terminalId: null,
			total: 0,
			transactions: [],
			typeDocumentId: null,
			paymentTypeIds: [],
			warehouseId: null,
			referenceExternal: null,
		},
		numberQuotes: 0,
		paymentTypes: [],
		paymentTypesSupplier: [],
		paymentMethods: [],
		priceAmounts: {},
		product: '',
		products: [],
		productsStorage: [],
		quantity: 0,
		total: 0,
		subsidiaryId: null,
		rawTransactions: [],
		retentionAmount: 0,
		retentionData: {},
		retentionExist: false,
		retentionLoading: false,
		retentionTaxAmount: 0,
		rows: [],
		rowsTypeChange: [],
		rowsHistory: [],
		selectsTotal: [
			{ code: 'charge', select: false },
			{ code: 'total', select: false },
			{ code: 'imp', select: false },
			{ code: 'sub', select: false },
			{ code: 'igv', select: false },
		],
		showAddModal: true,
		showUtility: false,
		showTotal: false,
		changeTotal: false,
		suppliers: [],
		searchVal: null,
		selectedProduct: emptyProduct,
		selectedSupplier: {
			commercialName: '',
			typeDocumentName: '',
			documentNumber: '',
			flagActive: 1,
		},
		selectedWarehouse: 0,
		serieReadonly: false,
		showBrandConfig: false,
		showModalChange: false,
		showNewSupplier: false,
		showModalValidatedPurchase: false,
		showPayments: false,
		showSupplier: false,
		showTransactions: false,
		showNewProduct: false,
		showQuotes: false,
		units: [],
		utilPrevious: null,
		typeDocuments: [],
		typeTaxes: [],
		warehouses: [],
		detailSeries: false,
		productSerie: {},
		subsidiaries: [],
		seriesObject: null,
		validTotal: true,
		flagPurchases: false,
		currencySelect: {},
		typeBilling: [
			{
				name: 'Electrónica',
				short: 'E',
				value: 1,
			},
			{
				name: 'Física',
				short: 'F',
				value: 2,
			},
		],
		typeBillingSelect: {},
		indexBilling: 0,
		mountSupplier: null,
		flagIntegrationCtCost: false,
		showErrorAverage: false,
		itemsProductsCost: [],
		codePurchases: null,
		withholdingTaxExist: false,
		withholdingTaxActive: {},
		noSuccess: false,
		showDialogLot: false,
		sendProducts: [],
		numberReadonly: false,
		showModalInit: false,
		searchValSupplier: null,
		// clientDetails: 'https://s3.amazonaws.com/apprunn-acl/icons/kVkuszmF8fXHl4lCZmqlVcI0J2sHtz.svg',
		isIdLDC: null,
		exchangeRate: 0,
		additionalInformationPurchase: null,
		bankAccounts: [],
		showModalBank: false,
		showLot: false,
		variationModel: {
			features: [],
			stock: 0,
			lot: null,
			warehouseId: null,
			brandId: null,
			price: null,
			name: '',
		},
		includeTax: true,
		warehousesSales: [],
		isVisibleBtnPurchase: true,
		isVisibleBtnOrder: false,
		allowProductFree: null,
		newLotInfo: null,
		sum: null,
		openModalAccountingPeriod: false,
		accountingPeriodSelected: null,
		urlVoucher: null,
		paymentInformation: {},
		additionalInformation: {},
		dynamicFormPurchase: getDynamicFormPurchase(),
		showDetraction: false,
		typesDetraction: [],
		disableExchangeRate: true,
	};
}

function closeModalSale() {
	this.objPricesale = {
		quantity: 0,
		tax: 0,
		total: 0,
		warehouseId: [],
	};
	this.priceListObj = {
		priceListId: null,
		percentageUtil: 0,
		percentageUtilUlt: 0,
		pricePurchase: 0,
		priceSale: 0,
		priceUnit: 0,
		utility: 0,
		utilityUlt: 0,
		warehouseId: [],
	};
	this.priceListArr = [];
}

function addProductModal(newObject) {
	this.dialogCalculateSale = false;
	// this.newLotInfo = newObject;
	this.addProduct(null, { ...newObject, quantity: 1 });
	this.closeModalSale();
}

function addProduct(mode) {
	if (this.selectedProduct.product.flagLotsEnabled && !this.newLotInfo) {
		this.showNotification(
			'Debe ingresar la configuración de Fecha de Vencimiento y Lote',
			'error'
		);
		return;
	}
	const flagFree = mode === 'free' ? 1 : 0;
	if (!this.selectedProduct.id) {
		this.showNotification('Seleccionar un producto');
		return;
	}

	if (this.quantity > 0) {
		const product = this.selectedProduct.product || {};
		const defaultBrand = product.brands && product.brands.length && product.brands[0];
		if (!defaultBrand) {
			this.showGenericError(
				'El producto seleccionado no tiene un almacén asociado, por favor asociar el almacén o tienda al productos antes de agregarlo a la compra.'
			);
			return;
		}

		const brandId = product.brandId || defaultBrand.id;
		const brandName = product.brandName || defaultBrand.brandName;
		const taxes = this.selectedProduct.taxes || this.selectedProduct.product.taxes;

		const { code: codeTaxes, percentage: taxPercentage } = this.getTaxesDataToUse(taxes);
		const cost = this.selectedProduct.product.cProm;
		const newPro = {
			brandId,
			brandName,
			features: this.selectedProduct.features,
			brandSimple: this.selectedProduct.brandSimple,
			brandSpId: this.selectedProduct.brandSpId,
			unitCode: this.selectedProduct.unitCode,
			unitName: this.selectedProduct.unitName,
			unitQuantity: this.quantity,
			unitId: this.selectedProduct.unitId,
			unitConversion: this.selectedProduct.unitConversion,
			conversions: this.selectedProduct.conversions,
			units: this.selectedProduct.product.units,
			local: this.selectedProduct.local || false,
			brands: this.selectedProduct.brands,
			costCenterCode: this.selectedProduct.costCenterCode,
			costCenterId: this.selectedProduct.costCenterId,
			discountAmount: 0,
			id: this.model.details.length + 1,
			productType: this.selectedProduct.product.type || this.selectedProduct.typeProduct,
			stockQuantity: this.selectedProduct.product.stock,
			productId: this.selectedProduct.id,
			warWarehousesId: this.selectedProduct.product.warehouseId,
			description: '',
			inlineFeatures: this.selectedProduct.inlineFeatures,
			descriptionProduct: this.selectedProduct.descriptionProduct,
			discountPercentage: 0,
			quantity: this.quantity,
			total: Number(this.total),
			tax: taxPercentage,
			codeTaxes,
			subtotal:
				Number(this.total) || flagFree
					? Number(this.total) / Number(`1.${taxPercentage}`)
					: cost,
			cost:
				Number(this.total) || flagFree
					? Number(this.total) / (this.quantity * Number(`1.${taxPercentage}`))
					: cost,
			price: Number(this.total) / (this.quantity * Number(`1.${taxPercentage}`)),
			priceWithAllDecimals: this.total / (this.quantity * Number(`1.${taxPercentage}`)),
			product: this.selectedProduct.product,
			priceList: this.selectedProduct.product.priceList,
			location: this.selectedProduct.product.location,
			codePercentage: codeTaxes,
			warehouseProductId: this.selectedProduct.warehouseProductId,
			categoryId: this.selectedProduct.categoryId,
			flagControlSerie: this.selectedProduct.flagControlSerie,
			priceOriginal: this.selectedProduct.price,
			additionalForm: this.objPricesale,
			additionInformationPriceList: { ...this.priceListObj },
			additionInformationPriceListArr: this.priceListArr,
			priceListId: this.$userInfo.salPriceList.id,
			categoryName: this.selectedProduct.categoryName,
			flagFree,
			priceListAll: this.selectedProduct.product.priceListAll,
		};

		if (this.priceListArr.length > 0) {
			const firtPriceList = this.priceListArr[0];
			newPro.additionInformationPriceList = {
				flagEdit: firtPriceList.flagEdit,
				priceSaleOrigin: firtPriceList.priceSaleOrigin,
				priceListId: firtPriceList.priceListId,
				priceUnit: firtPriceList.priceUnit,
				priceSale: firtPriceList.priceSale,
				profitAmount: firtPriceList.profitAmount,
				utilityUlt: firtPriceList.utilityUlt,
				markupPercentage: firtPriceList.markupPercentage,
				percentageUtilUlt: firtPriceList.percentageUtilUlt,
				pricePurchase: this.priceListObj.pricePurchase,
				unitCost: this.priceListObj.unitCost,
				warehouseId: this.priceListObj.warehouseId,
			};
		} else {
			newPro.additionInformationPriceList = { ...this.priceListObj };
		}

		newPro.costOrigin = newPro.cost;
		if (this.selectedProduct.product.flagLotsEnabled) {
			newPro.productLots = {
				...this.newLotInfo,
				quantity: 1,
			};
		}
		newPro.taxAmount = newPro.total
			? newPro.total - newPro.subtotal
			: newPro.subtotal * (taxPercentage / 100);
		this.model.details.push(newPro);
		this.selectedProduct = {
			price: 0,
			id: null,
			product: {
				name: '',
				code: '',
				unitName: '',
			},
		};
		this.priceListObj = {
			flagEdit: false,
			priceSaleOrigin: null,
			percentageUtil: null,
			percentageUtilUlt: null,
			priceListId: null,
			pricePurchase: null,
			priceSale: null,
			priceUnit: null,
			unitCost: null,
			utility: null,
			utilityUlt: null,
			warehouseId: [],
		};
		this.priceListArr = [];
		this.product = '';
		this.quantity = 0;
		this.total = 0;
		this.cleanProducts = true;
		this.cleanInput = true;
		if (this.isEcuador && this.model.typeDocumentId !== 25) {
			this.alertRetention();
		}
		// setTimeout(() => {
		// 	const prop = ref || 'productSearcher';
		// 	// ESTA FUNCIÓN HARÁ UN EFOQUE AL INPUT DEL ELEMENTO CON
		// 	// CON SU ATRIBUTO REF CORRESPONDIENTE
		// 	const inputElement = this.$refs[prop].$el.querySelector('input');
		// 	if (inputElement) {
		// 		inputElement.focus();
		// 	}
		// }, 300);
		this.$v.model.details.$touch();
		this.priceAmountsMethod();
		this.newLotInfo = null;
		this.$refs.modalLotes.clearFields();
		const refName = mode === 'productSearcherByGun' ? mode : 'productSearcher';
		this.$nextTick(() => {
			this.$refs[refName].focus();
		});
	}
}

/**
 * @param {array} - taxes
 */
function getTaxesToUse(taxes) {
	const { codePercentage } = taxes.find((t) => t.flagSales === 1);
	const { percentage } = this.generalTaxes.find(equality('code', codePercentage));
	return percentage;
}

function getTaxesDataToUse(taxes) {
	const { codePercentage } = taxes.find((t) => t.flagSales === 1);
	const tax = this.generalTaxes.find(equality('code', codePercentage));
	return tax;
}

function alertRetention() {
	this.setTypeTaxes();
	this.retentionExist = false;
	this.showNotification(
		'Es necesario configurar las retenciones antes de continuar con la compra',
		'info'
	);
}

function cancelButtonClicked(fieldName) {
	this.action.open = false;
	// this.model.transactions = [];
	this[fieldName] = false;
}

function cancelPurchase() {
	this.goTo('purchases');
}

function closeSidebar(formClosed) {
	this.action.code = '';
	this.action.open = false;
	this.showSupplier = false;
	this.showPayments = false;
	this.showTransactions = false;
	this.showQuotes = false;
	this.showNewProduct = false;
	if (!this.retentionExist && formClosed && this.isEcuador) {
		this.alertRetention();
	}
	this.currentProduct.commentary = '';
	this.currentProduct.expirationDate = null;
	this.currentProduct.lot = '';
	this.filtersChange = {
		year: null,
		month: null,
	};
}

function closeModalHistory() {
	this.action = {
		code: null,
		title: null,
		open: false,
	};
}

function columnInput(colValue) {
	const columnValue = colValue.column.value;
	// const value = Number(colValue.event.target.value);
	this.model.details.forEach((row, idx) => {
		this.updateAmounts(row, idx, columnValue);
	});
}

function deleteProduct(row, rowIndex) {
	if (rowIndex > -1) {
		this.model.details.splice(rowIndex, 1);
		if (this.isEcuador) {
			this.alertRetention();
		}
	}
}
function disabledPurchase() {
	const providerIsBlocked = !this.selectedSupplier.flagActive;
	const objSeries = this.details.filter((obj) => obj.flagControlSerie === 1);
	const validateSeries = objSeries.every((d) => d.series !== null);
	const oc = this.model.typeDocumentId !== 25 && this.model.typeDocumentId !== 51;
	return (
		providerIsBlocked ||
		this.cannotBeEdited ||
		!validateSeries ||
		(!this.retentionExist && this.isEcuador && oc) ||
		(this.isEcuador && this.model.serie.length !== 6)
	);
}
async function created() {
	const newDate = new Date();
	this.showBrandConfig = this.$userInfo.company.settings.flagUseSimpleBrand || false;
	this.subsidiaryId = this.$userInfo.subsidiary ? this.$userInfo.subsidiary.id : null;
	this.flagUseGun = getDeeper('company', 'flagBarcodeReader')(this.$userInfo) === 1;
	this.selectedWarehouse = getDeeper('warWarehousesId')(this.$userInfo);
	this.dateOnline = newDate.getTime().toString();
	this.codePurchases = flagType.Purchases;
	const { subsidiary, company } = this.$userInfo;
	this.updateColumns(company);
	this.basePrice = BasePrice.PC;
	this.flagIntegrations = subsidiary.flagIntegrations;
	this.allowProductFree = subsidiary.settings.allowProductFree ? 1 : 0;
	this.generalTaxes = helper.getLocalData('general-taxes');
	this.flagIntegrationCtCost = this.$userInfo.subsidiary.configIntegrations
		? this.$userInfo.subsidiary.configIntegrations.flagConfig
		: false;
	const { cloneId: idDocument } = this.$route.query;
	const costCenterPromise = this.loadCenterOfCost();
	const params = {
		typeOrigin: 'typeOriginPurchase',
	};
	const requests = [
		this.listOfUnits(),
		this.$httpProducts.get('warehouses'),
		this.getCurrencies(),
		this.getTypeDocuments('purchases'),
		this.getPaymentsMethods(),
		this.getTypePayments('purchases'),
		this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRate}`),
		this.$httpSales.get('suppliers'),
		this.getBankAccount(),
		this.listPricingPromise(),
		this.subsidiariesList(),
		this.$httpProducts.get('brands'),
		this.$httpSales.get('type-origins', { params }),
	];
	if (this.id) {
		this.loadingGeneral = true;
		requests.push(
			this.$httpSales.get(`purchase-documents/${this.id}`, {
				params: { flagDeleteCache: true },
			})
		);
		this.detailSeries = true;
	} else if (idDocument) {
		this.loadingGeneral = true;
	}
	const [
		units,
		warehouses,
		currencies,
		typeDocuments,
		paymentMethods,
		paymentTypes,
		typeTaxes,
		{ data: suppliers },
		{ data: bankAccounts },
		salePrice,
		subsidiarie,
		brand,
		typeOrigins,
		purchase,
	] = await Promise.all(requests);
	await costCenterPromise;
	this.priceLists = salePrice.data;
	this.bankAccounts = [...bankAccounts];
	this.suppliers = [...suppliers];
	const suppliersNames = this.suppliers.reduce((a, s) => a.concat(`${s.name} `), '');
	this.origensPurchases = typeOrigins.data;
	const newSupplier = { id: 0, name: suppliersNames, btn: true };
	this.suppliers.push({ ...newSupplier });
	this.brands = brand.data;
	this.warehouses = warehouses.data;
	this.currencies = this.currencyByCountry(currencies.data);
	this.units = units.data;
	this.subsidiaries = subsidiarie.data;
	let sourceDoc = null;
	if (idDocument) {
		sourceDoc = await this.loadDataConvert(idDocument);
		await this.loadTypeSuppliers(this.model.supplierId);
		if (!this.id) {
			this.loadingGeneral = false;
		}
	}
	const isFacClone =
		idDocument &&
		sourceDoc &&
		sourceDoc.typeDocument &&
		sourceDoc.typeDocument.code === 'FAC';
	this.typeDocuments = typeDocuments.data.map((td) => {
		const newTd = { ...td };
		newTd.documentType.disabled = false;
		if (this.$route.query.type === 'transform' && td.documentType.code === 'ORC') {
			newTd.documentType.disabled = true;
		}
		return newTd;
	});
	this.originalTypeDocuments = [...this.typeDocuments];
	const indexLDC = this.typeDocuments.findIndex((t) => t.documentType.code === 'LDC');
	this.isIdLDC = indexLDC > -1 ? this.typeDocuments[indexLDC].comTypeDocumentId : '';
	if (idDocument) {
		const codesToFilter = isFacClone ? this.codeDocuments : ['BOL', 'FAC', 'ORC'];
		this.typeDocuments = this.typeDocuments.reduce((acum, document) => {
			if (codesToFilter && codesToFilter.indexOf(document.documentType.code) > -1) {
				acum.push({ ...document });
			}
			return acum;
		}, []);
	}
	this.setBillingAsDefaultTypeDocument();
	const user = helper.getLocalData('admin-user');
	const companyCurrency = user.company.currency;
	const defaultCurrency = this.currencies.find((c) => c.code === companyCurrency);
	this.model.currency = defaultCurrency.id;
	if (defaultCurrency.id === 'USD') {
		const lastUpdatedExcRate = this.getLastExchangeRate();
		if (lastUpdatedExcRate) {
			this.exchangeRate = lastUpdatedExcRate;
		}
	}

	this.currencySymbol = defaultCurrency.symbol;
	if (this.warehouses.length > 0) {
		const selectedWarehouse =
			this.warehouses.find((w) => w.id === user.warWarehousesId) || this.warehouses[0];

		this.model.warehouseId = selectedWarehouse.id;
		this.model.warehouseName = selectedWarehouse.name;
	}
	this.paymentMethods = paymentMethods.data;
	this.paymentTypes = paymentTypes.data;
	this.typeTaxes = typeTaxes.data;
	this.setTypeTaxes();
	const exchangeRatePurchase = helper.getLocalData('exchange-rate-purchase');
	if (exchangeRatePurchase) {
		this.exchangeRate = exchangeRatePurchase;
	}
	if (this.isEditing) {
		// MAPEO DE DATA EDITAR COMPRA
		if (purchase.data.documentRelated && purchase.data.documentRelated.typeDocument) {
			const { settings } = purchase.data.documentRelated.typeDocument;
			this.codeDocuments = settings.typeConvertValid;
			this.typeDocuments = this.typeDocuments.reduce((acum, document) => {
				if (
					this.codeDocuments &&
					this.codeDocuments.indexOf(document.documentType.code) > -1
				) {
					acum.push({ ...document });
				}
				return acum;
			}, []);
		}
		this.setBillingAsDefaultTypeDocument(purchase.data.typeDocument.code);
		this.subsidiaryId = purchase.data.subsidiaryId;
		this.rawTransactions = [
			...(purchase.data.transactions || []),
			...(purchase.data.transactionBank || []),
		];
		this.cannotBeEdited = purchase.data.accounted === 'Sí';
		const model = this.convertModel(purchase.data);
		this.model = model;

		if (purchase.data.additionalInformation.dueDate) {
			this.model = {
				...model,
				dueDate: purchase.data.additionalInformation.dueDate,
			};
		}

		this.accountingPeriodSelected = purchase.data.period || null;
		this.persistData = {
			serie: model.serie,
			number: model.number,
			documentNumber: model.documentNumber,
		};
		this.additionalInformationPurchase = purchase.data.additionalInformation;
		this.priceAmountsMethod();
		this.allowProductFree = 0;
		if (this.exchangeRate) {
			console.log(this.exchangeRate);
		}

		const addInfo = purchase.data && purchase.data.additionalInformation;
		if (addInfo ? addInfo.allowProductFree : false) {
			this.allowProductFree = additionalInformation.allowProductFree ? 1 : 0;
		}
		if (addInfo ? addInfo.exchangeRate : false) {
			this.exchangeRate = addInfo.exchangeRate.value;
		}
		if (this.model.supplierId) {
			this.loadTypeSuppliers(this.model.supplierId);
		}
		if (addInfo) {
			const template = { ...addInfo.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.additionalInformation = { ...objectOrder };
			Object.keys(this.additionalInformation).forEach((k) => {
				this.additionalInformation[k].value = addInfo.guideData[k].value;
				if (this.additionalInformation[k].type === 'select') {
					this.additionalInformation[k].items = [];
				}
			});
			const templatePayment = { ...addInfo.payment };
			const arrayTemplatePayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReversePayment = arrayTemplatePayment.reverse();
			const objectOrderPay = Object.fromEntries(arrayTemplateReversePayment);
			this.paymentInformation = { ...objectOrderPay };
			Object.keys(this.paymentInformation).forEach((k) => {
				this.paymentInformation[k].value = addInfo.payment[k].value;
				if (this.paymentInformation[k].type === 'select') {
					this.paymentInformation[k].items = [];
				}
			});
		}
		this.loadingGeneral = false;
	}
	this.productsStorage = helper.getLocalData('products-selected') || [];
	if (this.productsStorage.length > 0 && this.$route.query.origin === 'products') {
		this.setSelectedProducts();
	}
	if (!this.isEcuador) {
		this.currencySelect = this.currencies.find((c) => c.code === this.model.currency);
	}
	this.typeBillingSelect = this.typeBilling[this.indexBilling];
	setTimeout(() => {
		this.focusOnSupplier();
	}, 200);
	const flagShowAccountingEngine =
		this.$userInfo.company.settings.flagShowAccountingEngine || false;
	this.columnsSale[3].name = this.labelsByCountry.taxName;
	this.columns[10].visible = flagShowAccountingEngine;
	this.columns[10].checked = flagShowAccountingEngine;
	this.columns[10].flagVisible = !flagShowAccountingEngine;
	this.showLot = this.$userInfo.company.settings.flagWorkWithBatches || false;
	this.columns[7].visible = this.showLot;
	this.columns[7].checked = this.showLot;
	this.columns[4].visible = !this.showLot;
	this.columns[4].checked = !this.showLot;
	this.columns[3].visible = this.$route.query.cloneId;
	this.columns[3].checked = this.$route.query.cloneId;
	if (this.model.dateIncome === '31/12/1969') {
		this.model.dateIncome = new Date().toLocaleDateString('es-ES');
	}
	this.subsidiary = this.subsidiaries.find((s) => s.id === this.subsidiaryId);
	this.loadTypeChange();
	if (this.subsidiary && this.subsidiary.settings.flagDetraction) {
		await this.loadSunat();
	}
	const tempProducts = helper.getLocalData('temp-purchase-products');
	if (tempProducts) {
		this.model.details = tempProducts;
		helper.removeLocalData('temp-purchase-products');
		if (this.originalTypeDocuments && this.originalTypeDocuments.length) {
			this.typeDocuments = [...this.originalTypeDocuments];
		}
		this.codeDocuments = ['BOL', 'FAC', 'ORC'];
		this.allowProductFree = this.subsidiary && this.subsidiary.settings.allowProductFree ? 1 : 0;
		this.cannotBeEdited = false;
		this.detailSeries = false;
		this.setBillingAsDefaultTypeDocument();
		if (this.model.typeDocumentId) {
			this.loadConfigData(this.model.typeDocumentId);
		}
		this.priceAmountsMethod();
	}
}

async function loadDataConvert(idDocument) {
	try {
		const response = await this.$httpSales.get(`purchase-documents/${idDocument}`, {
			params: { flagDeleteCache: true },
		});
		this.model.cashId = response.data?.cashId;
		const { details, typeDocument, supplier } = response.data;
		this.convertDetail = response.data;
		this.selectedSupplier = supplier;
		this.model.supplierId = supplier.id;
		this.selectedSupplier.name = supplier.name;
		this.codeDocuments =
			(typeDocument.settings && typeDocument.settings.typeConvertValid) || [];
		this.model.details = details.map((row) => {
			const newRow = { ...row };
			const product = row.product || {
				unitId: row.unitId,
				unitCode: row.unitCode,
				unitName: row.unitName,
				code: row.productCode,
			};
			const unit = this.units.find((u) => u.id === product.unitId) || {};
			const unitByProd = {
				id: product.unitId || unit.id,
				code: product.unitCode || unit.code,
				name: product.unitName || unit.name,
			};
			newRow.costCenterId = this.centersCosts.length
				? this.centersCosts[0].id
				: undefined;
			newRow.costCenterCode = this.centersCosts.length
				? this.centersCosts[0].code
				: undefined;
			newRow.quantity = row.quantity - row.quantityRefund;
			newRow.units =
				row.product && row.product.conversions
					? this.unitsByProduct(row.product)
					: [{ ...unitByProd }];
			// newRow.cost = newRow.additionalInformation.cost || newRow.price;
			const sourceSubtotal = row.subtotalWithoutTax || row.price * newRow.quantity;
			newRow.costOrigin =
				(Number(sourceSubtotal) + (row.discountAmount || 0)) / newRow.quantity;
			newRow.cost = newRow.costOrigin * (1 - (row.discountPercentage || 0) / 100);
			newRow.price = newRow.cost / (row.unitConversion || 1);
			newRow.priceWithAllDecimals = newRow.cost / (row.unitConversion || 1);
			newRow.subtotal = newRow.cost * newRow.quantity;
			newRow.taxAmount =
				Number((newRow.subtotal * Number(`1.${row.tax}`)).toFixed(4)) - newRow.subtotal;
			newRow.discountAmount =
				(newRow.costOrigin * newRow.quantity * (row.discountPercentage || 0)) / 100;
			newRow.series = newRow.additionalInformation.series;
			newRow.quantityConvert = row.quantity - row.quantityRefund;
			newRow.flagUse = row.flagUse;
			newRow.flagUseConvert = !newRow.quantityConvert;
			if (row.product) {
				newRow.warehouseProductId = row.product.warehouseProductId;
			}
			newRow.priceListAll = row.product.priceListAll || row.product.priceList;
			return newRow;
		});
		this.model.additionalInformation = response.data.additionalInformation;
		return response.data;
	} catch (error) {
		this.showGenericError();
		return null;
	}
}

function focusOnSupplier() {
	const inputSupplier = document.getElementById('supplierSearcher');
	inputSupplier.focus();
}

async function loadCenterOfCost() {
	try {
		({ data: this.centersCosts } = await this.$httpSales.get('cost-center'));
	} catch (error) {
		this.showGenericError();
	}
}

function convertModel(purchaseFromWs) {
	const typeDocumentsValid = this.typeTransform
		? this.typeDocuments.filter(
				(td) => td.comTypeDocumentId !== purchaseFromWs.typeDocumentId
		  )
		: [...this.typeDocuments];
	const cashMethod = this.paymentMethods.find((pm) => pm.code === 'CONTADO');
	const creditMethod = this.paymentMethods.find((pm) => pm.code === 'CREDITO');
	const hasCheckingAccounts =
		Array.isArray(purchaseFromWs.checkingAccounts) &&
		purchaseFromWs.checkingAccounts.length > 0;
	const cashMethodId = cashMethod && cashMethod.id ? cashMethod.id : 1;
	const fallbackPaymentMethodId = hasCheckingAccounts
		? creditMethod && creditMethod.id
			? creditMethod.id
			: 2
		: cashMethodId;
	const typeDocumentSelected =
		typeDocumentsValid.find(
			(tdv) => tdv.comTypeDocumentId === purchaseFromWs.typeDocumentId
		) || {};
	this.typeDocumentCode = this.typeTransform
		? typeDocumentsValid[0].documentType.code
		: typeDocumentSelected.code;
	console.log('purchaseFromWs', purchaseFromWs.cashId, purchaseFromWs);
	const modelToEdit = {
		additionalInformation: purchaseFromWs.additionalInformation,
		flagEditPriceSale: purchaseFromWs.additionalInformation
			? purchaseFromWs.additionalInformation.flagEditPriceSale
			: null,
		amount: purchaseFromWs.amount,
		commentary: '',
		cash: purchaseFromWs.cash,
		cashId: purchaseFromWs.cashId,
		currency: purchaseFromWs.currency,
		dateIncome: helper.formatDate(purchaseFromWs.dateIncome, 'DD/MM/YYYY'),
		dateDocument: helper.formatDate(purchaseFromWs.dateDocument, 'DD/MM/YYYY'),
		details: purchaseFromWs.details,
		detailsPayments: [],
		flagIncomeStatus: purchaseFromWs.flagIncomeStatus === 1,
		documentNumber: purchaseFromWs.documentNumber,
		number: purchaseFromWs.number,
		paymentMethodId: purchaseFromWs.paymentMethodId || fallbackPaymentMethodId,
		serie: purchaseFromWs.serie,
		subTotal: purchaseFromWs.subTotal,
		supplierId: purchaseFromWs.supplierId,
		taxes: purchaseFromWs.taxes,
		typeDocumentId: this.typeTransform
			? typeDocumentsValid[0].comTypeDocumentId
			: purchaseFromWs.typeDocumentId,
		paymentTypeIds: [],
		warehouseId: purchaseFromWs.warehouseId,
		transactions: this.flagDisplayTransfer === 1 ? [] : undefined,
		perception: purchaseFromWs.perception,
		referenceExternal: purchaseFromWs.referenceExternal,
		urlImages: purchaseFromWs.urlImages,
	};
	this.disabledFlagIncome = this.disabledDispatchMovement({
		...purchaseFromWs,
		flagIncomeStatus: this.isEditing ? purchaseFromWs.flagIncomeStatus : 0,
	});
	if (modelToEdit.paymentMethodId === cashMethodId) {
		const mergeTxs = (purchaseFromWs.transactions || []).concat(
			purchaseFromWs.transactionBank || []
		);
		const txResult = mergeTxs.reduce(
			(acum, tx) => {
				const tp = this.paymentTypes.find(
					(pt) => pt.comTypePaymentId === tx.typePaymentId
				);
				const newTx = {
					additionalInformation: tx.additionalInformation || {
						dateReference: undefined,
					},
					amount: Math.abs(tx.amount),
					bankAccountId: tx.bankAccountId,
					documentNumber: tx.documentNumber,
					id: tx.id,
					tp,
					reference: tx.reference,
				};
				acum.rows.push(this.generateTransaction(newTx));
				acum.paymentTypeIds.push(tp);
				return acum;
			},
			{ rows: [], paymentTypeIds: [] }
		);
		modelToEdit.transactions = txResult.rows;
		modelToEdit.paymentTypeIds = txResult.paymentTypeIds;
	} else if (purchaseFromWs.checkingAccounts.length) {
		modelToEdit.detailsPayments = purchaseFromWs.checkingAccounts[0].details.map((pd) => {
			const newPd = { ...pd };
			newPd.expirationDate = helper.formatDate(pd.expirationDate, 'DD/MM/YYYY');
			return newPd;
		});
		this.numberQuotes = modelToEdit.detailsPayments.length;
	}
	const user = helper.getLocalData('admin-user');
	const defaultPriceList = {
		[user.salPriceList.id]: {
			price: 0,
			ranges: [{ to: 0, from: 0, price: 0 }],
		},
	};
	modelToEdit.details = modelToEdit.details.map((d) => {
		const newD = { ...d };
		const unitByProd = {
			id: d.unitId || d.product.unitId,
			code: d.unitCode || d.product.unitCode,
			name: d.unitName || d.product.unitName,
		};
		newD.productDeleted = d.productDeleted || false;
		newD.priceListAll = d.product.priceList;
		newD.editPriceSale =
			d.additionalInformation && d.additionalInformation.editPriceSale
				? d.additionalInformation.editPriceSale
				: null;
		newD.priceListNew =
			d.additionalInformation && d.additionalInformation.priceList
				? d.additionalInformation.priceList
				: null;
		if (modelToEdit.flagEditPriceSale !== 2) {
			if (newD.priceListNew) {
				newD.priceList = newD.priceListNew;
			} else if (d.product && d.product.priceList) {
				newD.priceList = d.product.priceList[user.salPriceList.id];
			} else {
				newD.priceList = defaultPriceList;
			}
		} else {
			newD.priceList =
				newD.editPriceSale || newD.priceListNew || d.product.priceList
					? d.product.priceList && d.product.priceList[user.salPriceList.id]
					: defaultPriceList;
		}

		// newD.priceList = d.product.priceList ?
		// 	d.product.priceList[user.salPriceList.id] : defaultPriceList;
		newD.units =
			d.product && d.product.conversions && Object.keys(d.product.conversions).length
				? this.unitsByProduct(d.product)
				: [{ ...unitByProd }];
		newD.priceOriginal = d.price;
		newD.expirationDate = d.additionalInformation
			? d.additionalInformation.expirationDate
			: null;
		// newD.lot = d.additionalInformation ?
		// 	d.additionalInformation.lot || '' : '';
		newD.costOrigin =
			(Number(d.subtotalWithoutTax) + (d.discountAmount || 0)) / d.quantity;
		newD.cost = newD.costOrigin * (1 - (d.discountPercentage || 0) / 100);
		newD.price = newD.cost / (d.unitConversion || 1);
		newD.priceWithAllDecimals = newD.cost / (d.unitConversion || 1);
		newD.subtotal = d.subtotalWithoutTax;
		newD.taxAmount =
			Number((newD.subtotal * Number(`1.${d.tax}`)).toFixed(4)) - newD.subtotal;
		newD.discountAmount =
			(newD.costOrigin * d.quantity * (d.discountPercentage || 0)) / 100;
		newD.series = d.additionalInformation.series;
		if (d.additionalInformation && d.additionalInformation.productLots) {
			newD.productLots = d.additionalInformation.productLots;
			newD.productLots.date = helper.formatDate(
				d.additionalInformation.productLots.date,
				'YYYY-MM-DD'
			);
			newD.productLots.dateDue = helper.formatDate(
				d.additionalInformation.productLots.dateDue,
				'YYYY-MM-DD'
			);
		}
		newD.location =
			d.additionalInformation && d.additionalInformation.location
				? d.additionalInformation.location
				: undefined;
		newD.quantityConvert = d.quantity - d.quantityRefund;
		newD.commentary = d.commentary ? d.commentary : '';
		return newD;
	});
	// this.suppliers = [purchaseFromWs.supplier];
	const supplierSelected = this.suppliers.find(
		(s) => s.id === purchaseFromWs.supplier.id
	);
	this.selectedSupplier = supplierSelected;
	this.selectedSupplier.typeDocumentName = supplierSelected.msTypePerson.name;
	this.retentionData = { ...purchaseFromWs.withholdingTaxActive };
	this.retentionExist = !!this.retentionData.id;
	this.withholdingTaxExist = this.retentionExist;
	this.withholdingTaxActive = { ...this.retentionData };
	this.commentary = purchaseFromWs.commentary;
	const defaultCurrency = this.currencies.find((c) => c.code === modelToEdit.currency);
	this.currencySymbol = defaultCurrency.symbol;
	this.flagDisplayTransfer =
		typeDocumentSelected.documentType.flagDisplayTransfer || null;
	this.isVisibleBtnOrder = this.flagDisplayTransfer !== 1 || false;
	this.isVisibleBtnPurchase = this.flagDisplayTransfer === 1;
	return modelToEdit;
}

function dateDocumentFormatted() {
	return helper.convertDate(this.model.dateDocument);
}

function disableAddProduct() {
	return this.quantity === 0 || !this.selectedProduct.id || !this.total;
}

function flagTaxName() {
	const modelTax = this.labelsByCountry.taxName;
	return this.flagIncludesTaxes ? `Con ${modelTax}` : `Sin ${modelTax}`;
}

function generateTransaction({
	amount,
	bankAccountId,
	dateReference = undefined,
	additionalInformation: txAdditionalInformation,
	documentNumber,
	id,
	reference,
	tp,
	code,
}) {
	const flagForm = tp.paymentType ? tp.paymentType.flagForm : 0;
	const hasForm = tp.paymentType ? tp.paymentType.flagForm !== 1 : 0;
	return {
		additionalInformation:
			{
				dateReference:
					dateReference ||
					txAdditionalInformation?.dateReference ||
					txAdditionalInformation?.paymentDate,
			} || undefined,
		amount,
		bankAccountId,
		documentNumber,
		flagForm,
		hasForm,
		id,
		label: tp.paymentType.name,
		reference,
		code,
		typePaymentId: tp.paymentType.id,
	};
}

function isDangerousToEdit() {
	return this.rawTransactions.length > 0 && this.model.paymentMethodId === 2;
}

function isEditing() {
	return Boolean(this.id);
}

function isWithholdingTaxes() {
	return this.action.code === 'withholding-taxes';
}

function labelButton() {
	const typeLabel = this.typeTransform ? 'Convertir' : 'Editar';
	return this.isEditing ? typeLabel : 'Comprar';
}

function onInput(input) {
	if (input.model === 'typeOrigin') {
		this.model.referenceExternal = input.value.code;
	} else if (!input.value && this.action.open) {
		this.model.warehouseId = null;
	} else if (input.model === 'quantity') {
		this[input.model] = Number(input.value);
	} else if (input.model === 'total') {
		this[input.model] = Number(input.value);
	} else if (!input.model) {
		this.model.currency = input.value.id;
		this.currencySymbol = input.value.symbol;
		this.$v.model.currency.$touch();
		if (this.exchangeRate) {
			this.changeTypeCurrency(input.value.id);
		} else if (
			input.value.id === 'USD' &&
			!this.exchangeRate &&
			this.currencies.length === 2
		) {
			const lastUpdatedExcRate = this.getLastExchangeRate();

			if (lastUpdatedExcRate) {
				this.exchangeRate = lastUpdatedExcRate;
			} else {
				this.showNotification('Debe agregar el tipo de cambio', 'info');
			}
		}
	} else if (input.model === 'typeDocumentId') {
		this.model[input.model] = input.value.comTypeDocumentId;
		this.flagDisplayTransfer = input.value.documentType.flagDisplayTransfer;
		this.typeDocumentCode = input.value.documentType.code;
		this.showNotSerie = input.value.documentType.settings
			? input.value.documentType.settings.flagSerieRequired
			: false;
		if (
			this.isEcuador &&
			input.value.comTypeDocumentId !== 25 &&
			Object.keys(this.retentionData).length === 0
		) {
			this.alertRetention();
		}
		if (this.$v.model[input.model]) {
			this.$v.model[input.model].$touch();
		}
		this.numberReadonly =
			input.value.documentType.code === 'LDC' || this.flagAutoSerieNumber;
		this.serieReadonly =
			input.value.documentType.code === 'LDC' || this.flagAutoSerieNumber;
		this.model.flagIncomeStatus = !(
			this.model.typeDocumentId === 30 || this.model.typeDocumentId === 10
		);
		if (input.value.documentType.code === 'ORC') {
			this.entityStateId = 3;
			this.isVisibleBtnOrder = true;
			this.isVisibleBtnPurchase = false;
		} else {
			this.isVisibleBtnOrder =
				input.value.documentType.flagDisplayTransfer !== 1 || false;
			this.isVisibleBtnPurchase = input.value.documentType.flagDisplayTransfer === 1;
		}
	} else {
		this.model[input.model] =
			input.model === 'warehouseId' ? input.value.id : input.value;
		if (this.$v.model[input.model]) {
			this.$v.model[input.model].$touch();
		}
	}
}

function closeDialogValidatedPurchase() {
	this.showModalValidatedPurchase = false;
}

function processPurchase() {
	if (this.model.details.some((d) => d.productDeleted)) {
		this.showNotification('Debe eliminar los productos eliminados de la compra', 'error');
		return;
	}
	const row = this.details.find((d) => d.quantity > d.quantityConvert);
	if (this.$route.query.cloneId && row) {
		this.notification = {
			colorDialog: 'error',
			colorHex: '#D5331A',
			show: true,
			text: `El producto ${row.productName}(${row.unitCode}) ha superado la cantidad máxima (${row.quantityConvert}) permitida para convertir.`,
			title: 'Se ha excedido la cantidad permitida para convertir.',
		};
		return;
	}
	const filterProducts = this.model.details.filter((d) => d.product.flagLotsEnabled);
	const productsWithoutLots = filterProducts.find(
		(d) => d.productLots && Object.keys(d.productLots).length < 6
	);
	if (productsWithoutLots) {
		this.showGenericError(
			`Se debe configurar los lotes del producto ${productsWithoutLots.product.name}`
		);
		return;
	}
	// const rowsCompleteTotal = this.details.every(p => p.total === null || '');
	// else if (rowsCompleteTotal) {
	// 	this.showModalValidatedPurchase = true;
	// }
	if (
		this.currencies.length === 2 &&
		this.currencySelect.code === 'USD' &&
		!this.exchangeRate
	) {
		this.showModalChange = true;
	} else {
		this.flagPurchases = true;
		if (!this.$v.model.$invalid && this.validErrorTotal) {
			this.action.open = true;
			this.action.title = 'PAGAR';
			this.action.width = 800;
			this.showPayments = true;
			this.loadWarehouse(false);
			this.loadCash();
			const amountDetraction =
				this.countryCurrencySymbol === 'USD' ? twoDecimals(700 / this.exchangeRate) : 700;
			this.showDetraction =
				this.subsidiary &&
				this.subsidiary.settings.flagDetraction &&
				this.model.total >= amountDetraction &&
				this.typeDocumentCode === 'FAC';
			if (!this.isEditing && !(this.model.transactions || []).length) {
				const cashPaymentType = this.paymentTypes.find(
					(pt) => pt.paymentType.code === 'efectivo'
				);
				if (cashPaymentType) {
					// this.model.paymentTypeIds = [cashPaymentType.comTypePaymentId];
					this.model.paymentTypeIds = [cashPaymentType];
				}
				const currentPt = this.model.paymentTypeIds[0];
				const paymentType = this.paymentTypes.find(
					(pt) => pt.comTypePaymentId === currentPt.comTypePaymentId
				);
				const newTx = {
					id: `${currentPt.comTypePaymentId}-0`,
					amount:
						Number(this.model.amount || 0) +
						Number(this.model.additionalInformation?.tip || 0),
					tp: paymentType,
				};
				this.model.transactions = (this.model.transactions || []).concat(
					this.generateTransaction(newTx)
				);
			} else if (
				!this.isEditing &&
				(this.model.transactions || []).length &&
				!this.model.perception
			) {
				const currentPt = this.model.paymentTypeIds[0];
				const paymentType = this.paymentTypes.find(
					(pt) => pt.comTypePaymentId === currentPt.comTypePaymentId
				);
				const newTx = {
					id: `${currentPt.comTypePaymentId}-0`,
					amount:
						Number(this.model.amount || 0) +
						Number(this.model.additionalInformation?.tip || 0),
					tp: paymentType,
				};
				this.model.transactions = [this.generateTransaction(newTx)];
			} else if (this.isEditing && (this.model.transactions || []).length) {
				const perception = this.model.perception && this.model.perception.totalPerception;
				const amount = Number(
					(
						Number(this.model.amount || 0) +
						Number(this.model.additionalInformation?.tip || 0)
					).toFixed(2)
				);
				const totalAmount = perception ? amount + perception : amount;
				const amountPerTypePayment = Math.floor(
					totalAmount / this.model.transactions.length
				);
				const amountRest = Number(
					(totalAmount - amountPerTypePayment * this.model.transactions.length).toFixed(2)
				);
				this.model.transactions = this.model.transactions.map((t, index) => ({
					...t,
					amount: index === 0 ? amountPerTypePayment + amountRest : amountPerTypePayment,
				}));
			}
		} else {
			this.$v.model.$touch();
		}
	}
}

async function loadCash() {
	try {
		const response = await this.$httpSales.get('cash', {
			params: { flagActive: 1, subsidiaryId: this.subsidiaryId },
		});
		this.cashs = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function productSaved(cancelStatus, newProduct) {
	if (newProduct.code) {
		const params = {
			search: newProduct.code,
		};
		const { data: products } = await this.$httpProducts.get('products', {
			params,
		});
		this.products = products;
	}
	this.showNewProduct = false;
	this.action.open = false;
}

function resourceProductsUrl() {
	return '/products';
}

function runAction({ code }) {
	const title = `COMPRA #${this.model.serie}-${this.model.number} - Total ${this.model.amount}`;
	if (code === 'purchase-transactions') {
		this.showTransactions = true;
		this.action.title = title;
		this.action.width = 800;
	} else if (code === 'NS') {
		this.action.title = 'Crear Proveedor';
		this.showSupplier = true;
	} else if (code === 'purchase-quotes') {
		this.action.title = title;
		this.showQuotes = true;
	} else if (code === 'product-register') {
		this.action.title = 'Nuevo Producto';
		this.showNewProduct = true;
	} else if (code === 'withholding-taxes') {
		this.action.title = `RETENCIONES - ${this.selectedSupplier.name}`;
		this.action.code = code;
		this.action.width = 902;
		this.action.value = true;
	}
	this.action.open = true;
}

async function savePurchase(paymentInfo) {
	if (this.model.details.some((d) => d.productDeleted)) {
		this.showNotification('Debe eliminar los productos eliminados de la compra', 'error');
		return;
	}
	this.isLoadingCProm = true;
	this.isLoading = true;
	const newPurchase = { ...this.model };
	const { cloneId: idDocument } = this.$route.query;
	const { perception, detraction, transactions, urlImages, detailsPayments } =
		paymentInfo;
	newPurchase.referenceExternal = this.model.referenceExternal;
	newPurchase.amount =
		perception && perception.totalPerception
			? newPurchase.amount + perception.totalPerception
			: newPurchase.amount + (this.model.additionalInformation?.tip || 0);
	newPurchase.serie = this.model.serie ? this.model.serie.split(' ').join('') : null;
	newPurchase.number = this.model.number ? this.model.number.split(' ').join('') : null;
	newPurchase.number = newPurchase.number ? newPurchase.number.padStart(8, '0') : newPurchase.number;
	newPurchase.documentNumber = `${newPurchase.serie}-${newPurchase.number}`;

	newPurchase.purDocumentsId = Number(idDocument) || undefined;
	newPurchase.dateOnline = this.dateOnline;
	newPurchase.entityStateId = this.entityStateId;
	newPurchase.subsidiaryId = this.subsidiaryId;
	newPurchase.commentary = this.commentary;
	newPurchase.serieId = this.configInfo.serie ? this.configInfo.serie.id : null;
	newPurchase.terminalId = this.configInfo.terminal ? this.configInfo.terminal.id : null;

	delete newPurchase.paymentTypeIds;
	newPurchase.warehouseName = this.warehouses.find(
		(w) => w.id === newPurchase.warehouseId
	).name;
	if (
		this.selectedSupplier.flagPerceptionAgent &&
		this.$userInfo.company.settings.flagPerception &&
		perception
	) {
		newPurchase.statusPerception = perception.statusPerception;
		newPurchase.perception = perception.perception;
		newPurchase.totalPerception = perception.totalPerception;
	}
	const isConvert = !!this.$route.query.cloneId;
	const products = isConvert ? this.details.filter((d) => !d.flagUse) : this.details;
	newPurchase.details = products.map((detail) => {
		let brandId;
		let brandName;
		let brandSpId;

		let brandMatch;

		if (this.model.warehouseId && detail.brands && detail.brands.length) {
			brandMatch =
				detail.brands.find(
					(d) =>
						d.warehouseId === this.model.warehouseId &&
						(!this.showBrandConfig ? d.id === detail.brandId : true)
				) || detail.brands[0];
		}
		if (this.showBrandConfig) {
			// MARCA SIMPLE
			if (this.isEditing) {
				brandSpId = detail.brandSpId;
				brandName = detail.brandName;
				brandId = detail.brandId;
			} else {
				const brandSimple = detail.brandSimple;
				brandSpId = brandSimple ? brandSimple.id : detail.brandSpId;
				brandName = brandSimple ? brandSimple.name : detail.brandName;
				brandId = brandMatch ? brandMatch.id : detail.brandId;
			}
		} else {
			// MARCA COMPUESTA
			// SI EDITA Y NO ES SIMPLE SOLO REENVIAR LOS DATOS DE
			brandId = this.isEditing
				? detail.brandId
				: (brandMatch && brandMatch.id) || detail.brandId;
			brandName = this.isEditing
				? detail.brandName
				: (brandMatch && brandMatch.name) || detail.brandName;
			brandSpId = undefined;
		}

		const newDetail = {
			productDescripcion: detail.descriptionProduct || undefined,
			categoryName: detail.categoryName || undefined,
			features:
				detail.features && detail.features.length
					? detail.features.map((feature) => {
							const newFeature = {};
							newFeature.id = feature.id;
							newFeature.name = feature.name;
							newFeature.value = feature.value;
							return newFeature;
					  })
					: undefined,
			brandId,
			brandName,
			brandSpId,
			commentary: detail.commentary,
			// lot: detail.lot, se remplazo por productlots
			expirationDate: detail.expirationDate,
			description: detail.description,
			flagFree: detail.flagFree,
			discountAmount: detail.discountAmount,
			discountPercentage: detail.discountPercentage || 0,
			location: detail.location,
			price: detail.price,
			priceList: detail.priceList,
			productId: detail.productId,
			productType:
				detail.productType ||
				(detail.product && (detail.product.typeId || detail.product.type)),
			quantity:
				detail.totalW !== undefined
					? parseFloat(detail.totalW.toFixed(2))
					: detail.quantity,
			stockQuantity: detail.stockQuantity,
			tax: detail.tax || 0,
			codeTaxes: detail.codeTaxes,
			taxAmount: Number(detail.taxAmount.toFixed(2)),
			subtotalWithoutTax: Number(detail.subtotal.toFixed(4)),
			unitId: detail.unitId || (detail.product && detail.product.unitId),
			unitCode: detail.unitCode || (detail.product && detail.product.unitCode),
			unitName: detail.unitName || (detail.product && detail.product.unitName),
			unitQuantity:
				!(
					detail.flagControlSerie ||
					(detail.product && detail.product.flagControlSerie)
				) || detail.totalW === undefined
					? detail.unitQuantity
					: parseFloat(detail.totalW.toFixed(2)),
			// unitQuantity: (detail.series && Object.keys(detail.series.series).length)
			// 	|| detail.unitQuantity,
			unitConversion: detail.unitConversion,
			warWarehousesId: this.model.warehouseId,
			series: detail.series,
			costCenterId: detail.costCenterId || undefined,
			costCenterCode: detail.costCenterCode || '',
			productLots: detail.productLots
				? {
						...detail.productLots,
						quantity: detail.quantity,
				  }
				: undefined,
			cost: detail.cost || detail.price,
		};
		if (!Array.isArray(detail.series) && detail.series && detail.series.series) {
			newDetail.series = detail.series.series;
		}
		if (this.typeTransform) {
			newDetail.id = detail.id;
		}
		return newDetail;
	});

	const productsPriceSaleArr = this.model.details
		.reduce((accum, detail) => {
			if (
				detail.additionInformationPriceListArr &&
				detail.additionInformationPriceListArr.length > 0
			) {
				const priceList = detail.additionInformationPriceListArr.reduce((acc, pl) => {
					const newSales = {
						productId: detail.productId,
						taxes: detail.tax || 0,
					};
					if (pl.flagEdit) {
						newSales.priceSale = pl.priceSale || 0;
						newSales.warehousesId = detail.additionInformationPriceList.warehouseId.length
							? detail.additionInformationPriceList.warehouseId
							: this.warehousesSales.map((w) => w.id);
						newSales.unitPrice = Number(pl.priceUnit || 0);
						newSales.salPriceListId = pl.priceListId || null;
						acc.push(newSales);
					}
					return acc;
				}, []);
				accum.push(priceList);
			}
			return accum;
		}, [])
		.flat();

	if (productsPriceSaleArr.length > 0) {
		newPurchase.priceSaleMultiple = {
			productsPriceSale: productsPriceSaleArr,
		};
	}

	if (this.$userInfo.company.settings.flagCalculateEarnings) {
		const productsPriceListAll = this.buildPriceListAll(this.details);
		if (productsPriceListAll.length) {
			newPurchase.priceSaleMultiple = {
				productsPriceListAll,
			};
		}
	}

	if (urlImages) {
		newPurchase.urlImages = [...urlImages];
	}
	const typeDocument = this.typeDocuments.find(
		(td) => td.comTypeDocumentId === newPurchase.typeDocumentId
	);
	const currentDate = new Date();
	const hours = currentDate.getHours();
	const minutes = currentDate.getMinutes();

	const transactionDate = helper.formattedToLocalDate(currentDate);
	newPurchase.dateDocument = format(
		new Date(`${helper.convertDate(this.model.dateDocument)} ${hours}:${minutes}`),
		'YYYY-MM-DD HH:mm'
	);
	newPurchase.dateIncome = this.model.flagIncomeStatus
		? format(
				new Date(`${helper.convertDate(this.model.dateIncome)} ${hours}:${minutes}`),
				'YYYY-MM-DD HH:mm'
		  )
		: undefined;
	if (transactions) {
		newPurchase.transactions = transactions.map((tx) => {
			const newTx = {
				additionalInformation: tx.additionalInformation || undefined,
				amount: tx.amount * -1,
				bankAccountId: tx.bankAccountId
					? tx.bankAccountId.id || tx.bankAccountId
					: undefined,
				bankId: tx.bankId,
				currency: this.model.currency,
				documentReference: tx.documentReference || tx.documentNumber,
				paymentAmount: tx.amount * -1,
				paymentDate:
					(tx.additionalInformation && tx.additionalInformation.dateReference) ||
					transactionDate ||
					newPurchase.dateDocument,
				reference: tx.reference,
				typePaymentId: tx.typePaymentId,
				urlImage: tx.urlImage,
				ntcDocumentId: tx.ntcDocumentId,
			};
			return newTx;
		});
	}
	newPurchase.transactions =
		this.flagDisplayTransfer === 1 ? newPurchase.transactions : [];
	const isEcuadorValidation =
		this.isEcuador &&
		this.model.typeDocumentId !== 25 &&
		this.model.typeDocumentId !== 51;
	if (this.model.typeDocumentId !== 38) {
		newPurchase.withholdingTaxActive = isEcuadorValidation
			? { ...this.retentionData }
			: null;
	}
	if (detailsPayments && detailsPayments.length) {
		newPurchase.detailsPayments = detailsPayments.map((payment) => {
			const newPayment = {
				amount: payment.amount,
			};
			newPayment.expirationDate = new Date(
				`${helper.convertDate(payment.expirationDate)} 05:00:00`
			);
			return newPayment;
		});
	}

	let detractionBody;
	if (detraction && detraction.typeDetraction) {
		detractionBody = {
			totalAmount: this.model.total,
			flagDetraction: Boolean(detraction.typeDetraction),
			detractionAmount: detraction.amount,
			sunatCode: detraction.sunatCode,
			sunatName: detraction.sunatName,
			percentage: detraction.percentage,
			detractionPaid: detraction.detractionPaid,
			receiptNumber: detraction.receiptNumber,
			paymentDate: detraction.paymentDate,
			paySupplier: this.model.total - detraction.amount,
		};
	}

	newPurchase.additionalInformation = {
		detraction: detractionBody || undefined,
		tip: this.model.additionalInformation?.tip || 0,
	};
	try {
		const typeUrl = this.typeTransform
			? `${this.typeDocumentCode}/convert`
			: `${this.id}/update`;
		const typeMessage = this.typeTransform
			? 'Documento de compra convertido correctamente.'
			: 'Compra editada correctamente.';
		const url = this.isEditing
			? typeUrl
			: `${typeDocument.documentType.code}/type-document`;
		const message = this.isEditing ? typeMessage : 'Compra registrada correctamente.';
		if (!this.isEditing) {
			delete newPurchase.typeDocumentId;
		} else if (this.typeTransform) {
			newPurchase.purDocumentsId = this.id;
			delete newPurchase.typeDocumentId;
		}
		newPurchase.typeBilling = this.typeBillingSelect.value;
		delete newPurchase.total;
		delete newPurchase.cash;
		delete newPurchase.flagEditPriceSale;
		newPurchase.totalWithoutWithholding = this.model.total;
		newPurchase.exchangeRate = this.exchangeRate || 0;
		if (this.isShowExchangeRate && this.currencies.length === 2) {
			helper.setLocalData('exchange-rate-purchase', this.exchangeRate);
			newPurchase.additionalInformation = {
				exchangeRate: {
					name: this.currencySelect.code,
					value: this.exchangeRate,
				},
			};
		}
		newPurchase.cashId = this.model.cashId;

		if (this.accountingPeriodSelected && !this.id) {
			newPurchase.periodId = this.accountingPeriodSelected.id;
		}

		const newAdditionalInformation = { ...this.additionalInformation };
		const newPaymentInformation = { ...this.paymentInformation };
		const newAdditionalInformationKeys = Object.keys(newAdditionalInformation);
		const newPaymentInformationKeys = Object.keys(newPaymentInformation);

		newAdditionalInformationKeys.forEach((k) => {
			if (newAdditionalInformation[k].type === 'select') {
				delete newAdditionalInformation[k].items;
			}
		});
		newPaymentInformationKeys.forEach((k) => {
			if (newPaymentInformation[k].type === 'select') {
				delete newPaymentInformation[k].items;
			}
		});

		const dataClient = {};
		if (newAdditionalInformationKeys.length) {
			dataClient.guideData = newAdditionalInformation;
		}
		if (newPaymentInformationKeys.length) {
			dataClient.payment = newPaymentInformation;
		}

		if (Object.keys(dataClient).length && this.hasDynamicsForms) {
			newPurchase.additionalInformation = dataClient;
		}
		if (this.flagDueDate) {
			newPurchase.additionalInformation = {
				...newPurchase.additionalInformation,
				dueDate: this.model.dueDate,
			};
		}
		delete newPurchase.dueDate;
		await this.$httpSales.post(`purchase-documents/${url}`, newPurchase);
		this.goTo('purchases');
		this.showNotification(message);
	} catch (error) {
		console.error(error);
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'PURCHASE_NOT_FOUND') {
				this.showGenericError('El documento de compra no existe.');
			} else if (error.data.message === 'PURCHASE_DOCUMENT_NOT_ORC_BOL') {
				this.showGenericError(
					'El tipo de documento no debe ser distinto a ORC (Orden de Compra), BOL (Boleta) o FAC (Factura)'
				);
			} else if (error.data.message === 'METHOD_PAYMENT_NOT_FOUND') {
				this.showGenericError('El método de pago no existe');
			} else if (error.data.message === 'TYPE_DOCUMENT_NOT_FOUND') {
				this.showGenericError('El tipo de documento no existe');
			} else if (error.data.message === 'TYPE_DOCUMENT_PURCHASE_INVALID') {
				this.showGenericError(
					'El proveedor debe tener una cedula o carnet de extranjeria'
				);
			} else if (error.data.message === 'PURCHASE_WITHHOLDING_TAX_REQUIRED') {
				this.showGenericError('Es necesario configurar retenciones en la compra');
			} else if (error.data.message === 'SERIE_EXIST') {
				this.showGenericError(
					'La serie para comprobante de retención no existe o no ha sido configurada'
				);
			} else if (error.data.message === 'SUPPLIER_NOT_EXIST') {
				this.showGenericError('El proveedor no existe');
			} else if (error.data.message === 'RANGE_SECUENCIAL_SUPPLIER_ERROR') {
				this.showGenericError('El secuencial de serie se encuentre fuera de rango');
			} else if (error.data.message === 'DATE_DOCUMENT_OUT_OF_RANGE') {
				this.showGenericError(
					'No se puede generar el documento fuera de rango de fechas válidas de la serie'
				);
			} else if (error.data.message === 'TRANSACTION_INVALID') {
				this.showGenericError('Es necesario elegir una cuenta bancaria');
			} else if (error.data.message === 'SERIES_QUANTITY_NOT_EQUAL_PRODUCT_QUANTITY') {
				this.showNotification(
					'La cantidad de un producto no es igual a la cantidad de series',
					'error'
				);
			} else if (error.data.message === 'BALANCE_CASH_INVALID') {
				this.showGenericError(
					'No puede realizar la compra porque el monto excede el saldo disponible de su caja'
				);
			} else if (error.data.message === 'SUPPLIER_CREDIT_LIMIT_ERROR') {
				this.showGenericError(
					`El crédito máximo para este proveedor es de ${this.countryCurrencySymbol}${this.mountSupplier}.`
				);
			} else if (error.data.message === 'CASH_CLOSING_USER_EXIST') {
				this.showGenericError(
					'La caja aperturada se encuentra en otro usuario / vendedor, asegurese que la caja se encuentre cerrada para generar la compra.'
				);
			} else if (error.data.message === 'SERIE_DOCUMENT_SUPPLIER_REPEATED_ERROR') {
				this.showGenericError(
					error.data.messageError ||
						'El correlativo de serie y el documento fueron registrados previamente.'
				);
			} else if (error.data.message === 'HASH_ONLINE_PURCHASES_DUPLICATE') {
				this.showGenericError('EL hash ya se encuentra generado para la compra.');
			} else if (error.data.message === 'TRANSACTION_INVALID') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'EDIT_BLOCKED_BY_SUBMISSION_PROCESS_ERROR') {
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'RANGE_SECUENCIAL_SUPPLIER_ERROR') {
				this.showGenericError(
					'El número del documento está fuera del rango autorizado del proveedor.'
				);
			} else if (error.data && error.data.message && error.data.messageError) {
				this.showGenericError(error.data.messageError);
			}
		}
		this.isLoading = false;
		this.isLoadingCProm = false;
	} finally {
		this.isLoading = false;
		this.isLoadingCProm = false;
	}
}

function saveRetention(body) {
	this.retentionLoading = true;
	this.retentionData = body;
	this.showNotification(
		'La información de la retención ha sido guardada correctamente. Se enviará al crear la compra.'
	);
	this.retentionExist = true;
	this.withholdingTaxExist = true;
	this.withholdingTaxActive = { ...this.retentionData };
	this.retentionLoading = false;
	this.setTypeTaxes();
	this.closeSidebar();
}

async function saveSupplier(model) {
	try {
		let { data: newSupplier } = await this.$httpSales.post('suppliers', model);
		this.showNotification('El proveedor ha sido creado correctamente.');
		newSupplier = setNewProperty('msTypePerson', ' ')(newSupplier);
		this.model.supplierId = newSupplier.id;
		this.suppliers.push(newSupplier);
		this.selectedSupplier = newSupplier;
		this.selectedSupplier.typeDocumentName = ' ';
		this.action.open = false;
		this.showSupplier = false;
		this.showNewSupplier = true;
		setTimeout(() => {
			this.showNewSupplier = false;
		}, 5000);
		this.$v.model.supplierId.$touch();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
				this.showNotification(
					'El correlativo de documento ingresado ya existe. Es probable que el proveedor que intenta registrar ya exista.',
					'error'
				);
			} else if (err.data.message === 'PAYMENT_METHOD_NOT_EXIST') {
				this.showNotification(
					'La forma de pago seleccionada no se encuentra registrada.',
					'error'
				);
			} else if (err.data.message === 'SUPPLIER_TYPE_NOT_EXIST') {
				this.showNotification(
					'El tipo de proveedor seleccionado no se encuentra registrado.',
					'error'
				);
			} else if (err.data.message === 'TYPE_EXPENSE_NOT_EXIST') {
				this.showNotification(
					'El origen seleccionado no se encuentra registrado.',
					'error'
				);
			} else if (err.data.message === 'AUTO_CODE_SUPPLIER_NOT_EXIST') {
				this.showNotification(
					'El código autogenerado de proveedor no ha sido configurado.',
					'error'
				);
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function setProductId(product) {
	const user = helper.getLocalData('admin-user');
	const defaultPriceList = {
		[user.salPriceList.id]: {
			price: 0,
			ranges: [{ to: 0, from: 0, price: 0 }],
		},
	};
	if (product) {
		const itemProduct = product.product || product;
		this.selectedProduct.costCenterId = product.costCenterId;
		this.selectedProduct.brands = product.brands || [product.brand];
		this.selectedProduct.id = itemProduct.id;
		this.selectedProduct.price = product.priceCost;
		this.selectedProduct.priceWithAllDecimals = product.priceCost;
		this.selectedProduct.productType = itemProduct.type || itemProduct.typeInfo.id;
		this.selectedProduct.warehouseProductId = product.warWarehouseProductBrandId;
		this.selectedProduct.categoryId = itemProduct.categoryId;
		this.selectedProduct.flagControlSerie =
			product.flagControlSerie || itemProduct.flagControlSerie;
		this.selectedProduct.conversions = itemProduct.conversions;
		this.selectedProduct.unitQuantity = this.quantity;
		this.selectedProduct.unitConversion = 1;
		this.selectedProduct.brandSpId = itemProduct.brandSpId;
		this.selectedProduct.brandSimple = itemProduct.brandSimple;
		this.selectedProduct.unitName = itemProduct.unit.name;
		this.selectedProduct.unitId = itemProduct.unit.id;
		this.selectedProduct.unitCode = itemProduct.unit.code;
		this.selectedProduct.inlineFeatures = itemProduct.inlineFeatures;
		this.selectedProduct.descriptionProduct = itemProduct.description;
		this.selectedProduct.categoryName = itemProduct.category
			? itemProduct.category.name
			: null;
		this.selectedProduct.nameProduct = itemProduct.name;
		this.selectedProduct.priceProduct = itemProduct.price;
		this.selectedProduct.features = itemProduct.features || [];
		this.selectedProduct.code = itemProduct.code;
		this.selectedProduct.typeProduct = product.typeInfo.id;
		this.selectedProduct.product = {
			brands: itemProduct.brands,
			conversions: itemProduct.conversions,
			name: itemProduct.name,
			code: itemProduct.code,
			cProm: itemProduct.cost,
			flagTypeUnit: itemProduct.flagTypeUnit,
			flagLotsEnabled: itemProduct.flagLotsEnabled,
			type: itemProduct.type,
			productType: itemProduct.type,
			taxes: itemProduct.taxes,
			stock: product.stock,
			warehouseId: product.warehouseId,
			price: product.priceCost,
			location: product.location || '',
			expirationDate: null,
			alertBeforeOf: null,
			priceListAll: product.priceList,
			priceListId: user.salPriceList.id,
			priceList: product.priceList
				? product.priceList[user.salPriceList.id]
				: defaultPriceList,
			flagControlSerie: product.flagControlSerie || itemProduct.flagControlSerie,
			units: itemProduct.conversions
				? this.unitsByProduct(itemProduct)
				: [{ ...product.unit }],
		};
		// this.selectedProduct.product.brandId = product.brandId;
		// this.selectedProduct.product.brandName = product.brandName;
		if (this.showBrandConfig && product.brandSimple) {
			// MARCA SIMPLE
			const brandSimple = product.brandSimple;
			this.selectedProduct.brandSimple = brandSimple;
			this.selectedProduct.product.brandSpId = brandSimple.id;
			this.selectedProduct.product.brandName = brandSimple.name;
		} else {
			// MARCA COMPUESTA
			const defaultBrand = product.brands[0];
			this.selectedProduct.product.brandId = defaultBrand.id;
			this.selectedProduct.product.brandName = defaultBrand.name;
		}
		// } else  {
		// 	this.showGenericError('El producto debe tener marca');
		// }
		this.product = itemProduct.name;
		// setTimeout(() => {
		// 	const inputQuantity = document.querySelector('#quantity');
		// 	inputQuantity.focus();
		// }, 1);
	}
	this.closeSidebar();
}

function unitsByProduct(item) {
	if (item.conversions) {
		const keys = Object.keys(item.conversions);
		const newUnits = this.units.reduce((acum, unt) => {
			const index = keys.findIndex((k) => Number(k) === unt.id);
			if (index > -1) {
				acum.push(unt);
			}
			return acum;
		}, []);
		if (item.unit) {
			newUnits.push(item.unit);
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

function setDate({ model, value }) {
	this.model[model] = format(value, 'DD/MM/YYYY');
}

function setSelectedProducts() {
	const defaultPriceList = {
		price: 0,
		ranges: [{ to: 0, from: 0, price: 0 }],
	};
	this.productsStorage.forEach((ps) => {
		const taxes = Array.isArray(ps.taxes) ? ps.taxes : ps.product.taxes;
		const unit = this.units.find((u) => u.id === ps.unitId) || {};
		const unitByProd = {
			id: ps.unitId,
			code: ps.unitCode || unit.code,
			name: ps.unitName,
		};
		const brands = [{ name: ps.brandName, id: ps.brandId }];
		this.selectedProduct = {
			id: ps.id,
			price: ps.priceCost,
			brands,
			local: true,
			product: {
				brands,
				alertBeforeOf: ps.alertBeforeOf || null,
				brandId: ps.brandId,
				costUnit: ps.cost,
				cProm: ps.cost,
				code: ps.code,
				expirationDate: ps.expirationDate || null,
				location: ps.location || '',
				name: ps.name,
				price: ps.priceCost,
				priceList: ps.priceList
					? ps.priceList[this.$userInfo.salPriceList.id]
					: defaultPriceList,
				stock: ps.stock,
				taxes,
				type: ps.type || ps.product.type,
				productType: ps.type || ps.product.type,
				unitId: ps.unitId,
				unitName: unitByProd.name,
				unitCode: unitByProd.code,
				units: ps.conversions ? this.unitsByProduct(ps) : [{ ...unitByProd }],
				warehouseId: ps.warehouseId,
			},
			total: 0,
			priceWithAllDecimals: 0,
			productType: ps.type || ps.product.type,
			taxes,
			conversions: ps.conversions,
			unitConversion: 1,
			type: ps.type || ps.product.type,
			warehouseProductId: ps.warWarehouseProductBrandId,
			categoryId: ps.categoryId,
			flagControlSerie: ps.flagControlSerie,
			priceListId: this.$userInfo.salPriceList.id,
		};
		this.quantity = 1;
		this.total = 0;
		this.addProduct();
	});
}

function setSupplier(value) {
	this.closeSidebar();
	const typeDocSelect = this.model.typeDocumentId
		? this.typeDocuments.find((t) => t.comTypeDocumentId === this.model.typeDocumentId)
		: null;
	const flag = typeDocSelect ? typeDocSelect.documentType.code === 'LDC' : false;
	if (value) {
		this.model.supplierId = value.id;
		this.serieReadonly =
			!!value.additionalInformation && !!value.additionalInformation.serie;
		this.selectedSupplier = value;
		this.selectedSupplier.typeDocumentName = value.msTypePerson
			? value.msTypePerson.name
			: '';
		this.$v.model.supplierId.$touch();
		const index = this.paymentMethods.findIndex((p) => p.id === value.paymentMethod);
		this.model.paymentMethodId = index > -1 ? value.paymentMethod : 1;
		this.loadTypeSuppliers(value.id);
		this.mountSupplier = value.creditLimitation;
		if (!flag) {
			this.model.serie =
				value.additionalInformation && value.additionalInformation.serie
					? value.additionalInformation.serie || this.model.serie
					: this.model.serie || '';
		}
	} else {
		this.model.supplierId = null;
		this.model.serie = '';
		this.model.paymentMethodId = 1;
		this.serieReadonly = false;
		this.selectedSupplier = {
			commercialName: '',
			typeDocumentName: '',
			documentNumber: '',
			flagActive: 1,
		};
		this.paymentTypesSupplier = [];
		this.mountSupplier = null;
		if (!flag) {
			this.model.serie = '';
		}
	}
}

function setTypeTaxes() {
	this.typeTaxes = this.typeTaxes.map((type) => {
		const newType = {
			id: type.id,
			code: type.code,
			description: type.description,
			percentage: type.percentage,
			value: 0,
		};
		return newType;
	});
}

// SummaryData
function summaryData({ discount, rows, total, taxes, subtotal }) {
	this.model.amount =
		twoDecimals(total - this.retentionAmount - this.retentionTaxAmount) || 0;
	this.model.taxes = taxes - this.retentionTaxAmount;
	this.model.total = total;
	this.model.subTotal = subtotal;
	this.model.discountAmount = discount || 0;
	this.details = rows;
	if (this.seriesObject) {
		this.details = this.details.map((row) => {
			const newRow = { ...row };
			if (row.warehouseProductId === this.seriesObject.warehouseProductId) {
				newRow.series = this.seriesObject;
			}
			return newRow;
		});
		this.seriesObject = null;
	}
}

function summaryTransactions() {
	const detailsName =
		this.model.paymentMethodId === 1 ? 'transactions' : 'detailsPayments';
	const result = this.model[detailsName].reduce(
		(acum, tx) => {
			const newAcum = acum;
			newAcum.total += Number(tx.amount);
			if (detailsName === 'detailsPayments') {
				newAcum.validDates +=
					helper.isValidDate(tx.expirationDate) && tx.expirationDate.length === 10
						? 1
						: 0;
			}
			return newAcum;
		},
		{ total: 0, validDates: 0 }
	);
	const tipAmount = Number(this.model.additionalInformation?.tip || 0);
	const perceptionAmount = Number(this.model.perception?.totalPerception || 0);
	const totalToValidate = Number(this.model.amount || 0) + tipAmount + perceptionAmount;
	result.isValid =
		result.total.toFixed(2) === totalToValidate.toFixed(2) &&
		result.validDates === this.model.detailsPayments.length;
	return result;
}

function updateAmounts(row, index, model) {
	if (index !== -1) {
		const discountPercentage = Number(row.discountPercentage);
		let [cost, costOrigin] = [row.cost, row.costOrigin];
		if (model === 'cost') {
			costOrigin = cost / (1 - discountPercentage / 100);
		} else if (model === 'discountPercentage') {
			costOrigin = costOrigin || cost;
			cost = costOrigin * (1 - discountPercentage / 100);
		}
		// const newDiscountTax = model === 'tax' ? undefined : row.tax;
		const detail = this.model.details[index];
		detail.quantity = row.totalW || row.quantity;
		detail.unitQuantity = row.quantity * row.unitConversion;
		detail.costOrigin = costOrigin;
		detail.cost = cost;
		detail.priceWithAllDecimals = cost;
		detail.price = cost / row.unitConversion;
		detail.flagFree = detail.price === 0 ? 1 : 0;
		detail.discountPercentage = discountPercentage;
		detail.tax = row.tax || 0;
		detail.priceOriginal = row.price;
		detail.discountAmount = (costOrigin * row.quantity * discountPercentage) / 100;
		detail.subtotal = costOrigin * row.quantity - detail.discountAmount;
		detail.taxAmount = detail.subtotal * (row.tax / 100);

		detail.total = detail.subtotal + detail.taxAmount;
		if (this.retentionExist && this.isEcuador) {
			this.alertRetention();
		}
	}
	if (model === 'quantity') {
		if (this.$route.query.cloneId && row.quantity > row.quantityConvert) {
			this.notification = {
				colorDialog: 'error',
				colorHex: '#D5331A',
				show: true,
				text: `La cantidad máxima permitida es ${row.quantityConvert}. Ha excedido este límite`,
				title: 'La cantidad a convertir excede el límite permitido',
			};
		}
		if (row.series ? row.series.length : false) {
			this.sendSeries({
				warehouseProductId: row.warehouseProductId,
				series: [],
			});
			this.showNotification(
				'Al modificar la cantidad del producto se eliminarón las series',
				'info'
			);
		}
	}
}

function updateTotal(row, index) {
	const { tax, total, quantity } = row;
	// Si se toca el total, el descuento debe ser 0
	// const discountAmount = 1 - discountPercentage / 100 || 0;
	const taxFactor = 1 + tax / 100;
	const price = Number(total) / (taxFactor * quantity);
	const cost = Number(total) / (taxFactor * quantity);
	const detail = this.model.details[index];
	detail.quantity = quantity;
	detail.flagFree = total === 0 ? 1 : 0;
	detail.priceWithAllDecimals = price;
	detail.price = sevenDecimals(price);
	detail.cost = cost;
	detail.costOrigin = cost;
	detail.priceOriginal = sevenDecimals(price);
	detail.discountPercentage = 0;
	detail.discountAmount = 0;
	detail.subtotal = detail.cost * detail.quantity;
	detail.taxAmount = detail.subtotal * Number(`0.${row.tax}`);
	detail.tax = tax;
	detail.total = total || 0;
	detail.totalRow = total || 0;
}

function updateDetailPayment({ fee, fieldName }) {
	if (fee.id) {
		this.$set(fee, fieldName, fee[fieldName]);
	} else {
		const rightDate = fee.expirationDate.split('/').reverse().join('/');
		this.model.detailsPayments = this.model.detailsPayments.map((item, index) => {
			const expirationDate =
				index === 0
					? helper.formatDate(rightDate, 'DD/MM/YYYY')
					: helper.formatDate(
							addDays(rightDate, index * this.distributionDates),
							'DD/MM/YYYY'
					  );
			return {
				id: item.id,
				amount: item.amount,
				expirationDate,
			};
		});
	}
}

function updateDetailsPayments(val, dis, perception) {
	this.distributionDates = dis ? dis.value : null;
	const numberFees = Number(val.value || val) || 0;
	const totalFees = numberFees > 0 ? numberFees : 0;
	this.numberQuotes = totalFees;
	const feesArray = [...Array(totalFees).keys()];
	const tipAmount = Number(this.model.additionalInformation?.tip || 0);
	const baseAmount = Number(this.model.amount || 0) + tipAmount;
	const amount = perception ? baseAmount + perception : baseAmount;
	const quotesArray = helper.quotesDistribution(amount, this.numberQuotes);
	this.model.detailsPayments = feesArray.map((item, index) => {
		const expirationDate = helper.formatDate(
			addDays(new Date(), (index + 1) * this.distributionDates),
			'DD/MM/YYYY'
		);
		return {
			id: index + item,
			amount: quotesArray[index],
			expirationDate,
		};
	});
}

function updateTransaction(tx) {
	this.$set(tx, 'amount', tx.amount);
}

function updateTransactions(paymentType, perception) {
	const { value } = paymentType;
	let payTypeIds = [];
	if (value.length && value[0].paymentType) {
		payTypeIds = value.map((tp) => tp.paymentType.id);
	} else if (value.length && value[0].typePaymentId) {
		payTypeIds = value.map((tp) => tp.typePaymentId);
	}
	this.model.paymentTypeIds = value;
	const totalPayments = payTypeIds.length;
	const tipAmount = Number(this.model.additionalInformation?.tip || 0);
	const amount = Number((Number(this.model.amount || 0) + tipAmount).toFixed(2));
	const totalAmount = perception ? amount + perception : amount;
	const amountPerTypePayment = Math.floor(totalAmount / totalPayments);
	const amountRest = Number(
		(totalAmount - amountPerTypePayment * totalPayments).toFixed(2)
	);
	const accountPrimary = this.bankAccounts.find((p) => p.primaryBankAccount === 1);
	this.model.transactions = payTypeIds.map((typePaymentId, index) => {
		const typePayment = this.paymentTypes.find(
			(tp) => tp.paymentType.id === typePaymentId
		);
		const newTx = {
			code: typePayment.paymentType.code,
			amount: index === 0 ? amountPerTypePayment + amountRest : amountPerTypePayment,
			id: `${index}-${typePaymentId}`,
			tp: typePayment,
			bankAccountId:
				typePaymentId === 19 && accountPrimary ? accountPrimary.id : undefined,
		};
		if (this.isEditing) {
			const currentTx = this.model.transactions.find(
				(t) => t.typePaymentId === typePaymentId
			);
			if (currentTx) {
				newTx.additionalInformation = currentTx.additionalInformation;
				newTx.dateReference = currentTx.additionalInformation
					? currentTx.additionalInformation.dateReference
					: undefined;
				newTx.bankAccountId = currentTx.bankAccountId;
				newTx.bankId = currentTx.bankId;
				newTx.reference = currentTx.reference;
				newTx.documentNumber = currentTx.documentReference || currentTx.documentNumber;
				newTx.urlImage = currentTx.urlImage;
			}
		}
		newTx.amount = typePayment.paymentType.code === 'cntc' ? null : newTx.amount;
		const r = this.generateTransaction(newTx);
		return r;
	});
}

function valuesDisabled() {
	const disabled =
		!this.selectedSupplier.id ||
		this.model.details.length === 0 ||
		this.model.typeDocumentId === 25 ||
		this.model.typeDocumentId === 51;
	return [{ code: 'withholding-taxes', disabled }];
}

const isValidDate = helper.isValidDate;

function validations() {
	const rules = {
		model: {
			warehouseId: { required },
			currency: { required },
			dateDocument: { required, isValidDate, minLength: minLength(10) },
			number: { required: requiredIf(() => this.showNotSerie) },
			serie: { required: requiredIf(() => this.showNotSerie) },
			supplierId: { required },
			details: { required },
		},
		priceListObj: {
			warehouseId: { required },
		},
	};
	return rules;
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	if (this.searchVal) {
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 739;
		this.action.open = true;
	} else {
		setTimeout(() => {
			const inputQuantity = document.querySelector('#quantity');
			inputQuantity.focus();
		}, 1);
	}
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function typeTransform() {
	return this.$route.query.type && this.$route.query.type === 'transform';
}

function openSeries(row) {
	this.action.code = 'control-series';
	this.action.open = true;
	this.action.title = `${row.code || row.productCode} - ${row.productName}`;
	this.action.width = 820;
	this.productSerie = row;
}

function sendSeries({ warehouseProductId, totalW, series, productId }) {
	this.seriesObject = {
		warehouseProductId,
		series,
	};
	this.closeSidebar(true);
	this.model.details = this.model.details.map((row) => {
		const newRow = { ...row };
		if (row.productId === productId) {
			newRow.series = series;
			newRow.totalW = totalW;
		}
		return newRow;
	});
}

function validErrorTotal() {
	let flag = true;
	if (this.model.details.length) {
		flag = this.model.details.some((d) => d.price >= 0);
		return flag;
	}
	return flag;
}

async function loadTypeSuppliers(id) {
	const params = { supplierId: id, flagType: 2 };
	try {
		const { data: response } = await this.$httpSales.get('type-payments', {
			params,
		});
		this.paymentTypesSupplier = response;
	} catch (error) {
		this.showGenericError();
	}
}

function changeFlagIncome(value) {
	this.model.flagIncomeStatus = value;
}

async function loadConfigData(documentCode) {
	const type = this.typeDocuments.find((t) => t.comTypeDocumentId === documentCode);
	try {
		if (type && type.documentType) {
			({ data: this.configInfo } = await this.$httpSales.get(
				`terminals/${type.documentType.code}/user?type=2`
			));
			if (type.documentType.code === 'LDC') {
				if (this.configInfo.serie) {
					if (this.configInfo.serie.serie && this.configInfo.serie.number) {
						this.model.serie = this.configInfo.serie.serie;
						this.model.number = this.configInfo.serie.number;
					} else {
						this.showModalInit = true;
					}
				}
			} else if (!this.isEditing) {
				this.model.serie = '';
				this.model.number = '';
			}
		}
	} catch (err) {
		this.showGenericError();
	}
}

function changeTypeDocument(value) {
	if (value) {
		const selectedType = this.typeDocuments.find((t) => t.comTypeDocumentId === value);
		if (selectedType) {
			this.typeDocumentCode = selectedType.documentType.code;
			this.flagDueDate =
				selectedType.documentType &&
				Boolean(selectedType.documentType.settings.flagDueDate);
		}
		this.loadConfigData(value);
	}
}

function toggleBtn(index, values, select) {
	this[index] = this[index] === this[values].length - 1 ? 0 : (this[index] += 1);
	this[select] = this[values][this[index]];
}

function changeCurrency(value) {
	this.currencySelect = this.currencies.find((c) => c.code === value);
}

function updateBrand(value, row, index) {
	if (index > -1) {
		const brands = row.brands || [];
		const brandSelected = brands.find((e) => e.id === value);
		this.$set(this.model.details[index], 'brandId', brandSelected.id);
		this.$set(this.model.details[index], 'brandName', brandSelected.name);
	}
}

function updateCenterCost(item, row, index) {
	if (index > -1) {
		this.$set(this.model.details[index], 'costCenterId', item.id);
		this.$set(this.model.details[index], 'costCenterCode', item.code);
	}
}

function basePriceComputed() {
	return BasePrice;
}

function selectBasePrice(basePrice) {
	this.basePrice = basePrice;
	const details = this.model.details.map((detail) => {
		const newDetail = { ...detail };
		const taxValue = `1.${detail.tax}`;
		newDetail.priceWithAllDecimals =
			this.basePrice === BasePrice.PC
				? detail.priceWithAllDecimals * taxValue
				: detail.priceWithAllDecimals / taxValue;
		newDetail.price = Number(newDetail.priceWithAllDecimals.toFixed(4));
		newDetail.priceOriginal = Number(newDetail.priceWithAllDecimals.toFixed(4));
		newDetail.cost = newDetail.price * newDetail.unitConversion;
		newDetail.total =
			this.basePrice === BasePrice.PC ? detail.total * taxValue : detail.total / taxValue;
		newDetail.subtotal = newDetail.total / Number(taxValue);
		newDetail.taxAmount = newDetail.total - newDetail.subtotal;
		return newDetail;
	});
	this.$set(this.model, 'details', details);
}

function openDialoErrorAverage(items) {
	this.showErrorAverage = true;
	this.itemsProductsCost = [...items];
}

function closeModalAverage() {
	this.isLoading = false;
	this.showErrorAverage = false;
	this.sendProducts = [];
}

function priceAmountsMethod() {
	const amounts = Sale.getAmounts(
		this.model.details,
		this.model.currency
		// this.model.currency,
		// this.model.exchangeRate,
		// this.model.id,
	);
	this.priceAmounts = amounts;
}

function toggleSelect(code) {
	this.selectsTotal = this.selectsTotal.map((s) => {
		const newSelect = { ...s };
		newSelect.select = s.code === code ? !s.select : false;
		return newSelect;
	});
}

function withholdingTaxRent() {
	return this.withholdingTaxExist
		? this.withholdingTaxActive.details.filter((d) => d.nameTax === 'RENTA')
		: [];
}

function withholdingTaxTaxes() {
	return this.withholdingTaxExist
		? this.withholdingTaxActive.details.filter((d) => d.nameTax === 'IVA')
		: [];
}

function checkAverageCost(paymentInfo) {
	this.sendPurchases = { ...paymentInfo };
	this.savePurchase(paymentInfo);
}

async function loadAverageCost(paymentInfo) {
	this.isLoading = true;
	const body = {
		costValidation: this.model.details.map((p) => {
			const newV = {
				productId: p.productId || p.id,
				price: p.priceCost || p.price,
				quantity: p.quantity,
				warehouseId: this.model.warehouseId || p.warehouseSelectId,
			};
			return newV;
		}),
	};
	try {
		const { data: response } = await this.$httpProducts.patch(
			`products/average-cost-validation/${this.codePurchases}`,
			body
		);
		this.noSuccess = response.some((r) => r.exceeded);
		if (this.noSuccess) {
			this.sendProducts = response.reduce((acum, r) => {
				if (r.exceeded) {
					const newAcum = { ...r };
					newAcum.productName =
						this.model.details.find((p) => p.productId === r.productId).name ||
						this.model.details.find((p) => p.productId === r.productId).product.name ||
						'';
					acum.push(newAcum);
				}
				return acum;
			}, []);
			this.showErrorAverage = true;
		} else {
			this.savePurchase(paymentInfo);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function loadMakePurchases() {
	this.savePurchase(this.sendPurchases);
}

function closeDialogInit() {
	this.showModalInit = false;
}

function openSearchSupplier(value) {
	this.searchValSupplier = value ? value.trim() : '';
	this.action.code = 'supplier-searcher';
	this.action.title = 'Proveedor';
	this.action.width = 739;
	this.action.value = true;
	this.action.open = true;
}

function changeTypeCurrency(newValue) {
	// const conversion = newValue === 'USD' ? 1 / this.exchangeRate : this.exchangeRate;
	this.model.details = this.model.details.map((d) => {
		const newD = { ...d };
		let priceChange = newValue === 'USD' ? newD.priceOriginal : newD.price;
		if (this.isEditing && this.additionalInformationPurchase) {
			priceChange = newValue === 'PEN' ? newD.priceOriginal : newD.price;
		}
		newD.price = twoDecimals(priceChange);
		newD.priceWithAllDecimals = twoDecimals(priceChange);
		return newD;
	});
}

function validateExchangeRate(value) {
	let newValue = Number(value);
	if (newValue < 1) {
		newValue = 1;
	}
	this.exchangeRate = newValue;
	this.changeTypeCurrency('USD');
}

function isShowExchangeRate() {
	return this.currencySelect.code === 'USD';
}

function checkTypeTransactions(paymentInfo) {
	const indexDeposit = paymentInfo.transactions.findIndex(
		(t) => t.flagForm === typePaymentForm.Deposit
	);
	if (indexDeposit > -1) {
		const bankAccountId = paymentInfo.transactions[indexDeposit].bankAccountId;
		if (bankAccountId) {
			const bankAccountSelect = this.bankAccounts.find((b) => b.id === bankAccountId);
			if (bankAccountSelect) {
				if (bankAccountSelect.currency === this.currencySelect.code) {
					this.checkAverageCost(paymentInfo);
				} else {
					this.showModalBank = true;
				}
			} else {
				this.checkAverageCost(paymentInfo);
			}
		} else {
			this.checkAverageCost(paymentInfo);
		}
	} else {
		this.checkAverageCost(paymentInfo);
	}
}

function closeDialogBank() {
	this.showModalBank = false;
}

function closeDialogChange() {
	this.showModalChange = false;
}

function setCashPurchase({ value }) {
	console.log('value', value);
	this.model.cashId = value.id;
	this.configInfo.cash.id = value.id;
	this.configInfo.cash.name = value.name || '';
	this.configInfo.cash.balance[this.$userInfo.company.currency] = value.balance;
	this.configInfo.cash.description = value.description;
	this.configInfo.terminal.name = value.cashTerminal ? value.cashTerminal.name : null;
	this.configInfo.terminal.id = value.cashTerminal ? value.cashTerminal.id : null;
}

function closeDialogChangeSale() {
	this.showNotPurchase = true;
	this.dialogCalculateSale = false;
	this.closeModalSale();
	this.showListPrice = true;
}

function setPriceList({ model, value }) {
	// const percentage = this.labelsByCountry.percentage;
	this.priceListObj[model] = value.id;
	const objPrice = this.priceListsFilter.find((p) => p.id === value.id);
	// const { cProm } = this.selectedProduct.product;
	// const cost = twoDecimals(Number(cProm) * Number(`1.${percentage}`));
	this.priceListObj = {
		// pricePurchase: cost,
		// unitCost: twoDecimals(cost / Number(`1.${percentage}`)),
		...this.priceListObj,
		priceSale: Number(objPrice.price),
		priceUnit: objPrice.unitPrice,
		priceListId: value.id,
		warehouseId: [],
	};
	this.priceListObj.utility = twoDecimals(
		Number(this.priceListObj.priceSale - this.priceListObj.pricePurchase)
	);
	this.priceListObj.utilityUlt = twoDecimals(
		Number(this.priceListObj.priceUnit - this.priceListObj.unitCost)
	);
	this.priceListObj.percentageUtil =
		this.priceListObj.pricePurchase !== 0
			? twoDecimals((this.priceListObj.utility / this.priceListObj.pricePurchase) * 100)
			: 0;
	this.priceListObj.percentageUtilUlt = this.priceListObj.unitCost
		? twoDecimals((this.priceListObj.utilityUlt / this.priceListObj.unitCost) * 100)
		: 0;
}

function setPriceListArr({ value }) {
	this.priceListArrValue = value;
	const ids = this.priceListArr.map((p) => p.priceListId);

	this.priceListArr = value.map((pl) => {
		if (ids.includes(pl.id)) {
			return this.priceListArr.find((p) => p.priceListId === pl.id);
		}
		const profitAmount = twoDecimals(Number(pl.price - this.priceListObj.pricePurchase));
		const utilityUlt = twoDecimals(Number(pl.unitPrice - this.priceListObj.unitCost));
		const markupPercentage =
			this.priceListObj.pricePurchase !== 0
				? twoDecimals((profitAmount / this.priceListObj.pricePurchase) * 100)
				: 0;
		const percentageUtilUlt = this.priceListObj.unitCost
			? twoDecimals((utilityUlt / this.priceListObj.unitCost) * 100)
			: 0;

		return {
			flagEdit: false,
			markupPercentage,
			percentageUtilUlt,
			priceSaleOrigin: pl.price,
			priceListId: pl.id,
			priceSale: pl.price,
			priceUnit: pl.unitPrice,
			profitAmount,
			utilityUlt,
		};
	});
}

function openDialogLot() {
	this.showDialogLot = true;
	this.titleAddLot = `Añadir Producto Lote -
		${this.selectedProduct.nameProduct}`;
	this.loadProductsFeatures(this.selectedProduct);
}

function handleCloseModalTest() {
	this.dialogmodalLotes = false;
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
		({ data: this.productsFeatures } = await this.$httpProducts.get('features', {
			params,
		}));
		this.showVariantsSlide(row);
	} catch (error) {
		this.showGenericError();
	}
}

function showVariantsSlide(row) {
	const newRow = { ...row };
	newRow.features = this.productsFeatures.map((feature) => {
		const newFeature = { ...feature };
		newFeature.features = feature.features.map((ff) => ({
			id: ff.id,
			name: ff.name,
			value: ff.name,
		}));
		return newFeature;
	});
	this.selectedProduct = { ...newRow };
}

function openDialogPriceSale() {
	this.titleDialog = 'CAMBIA TU PRECIO DE VENTA';
	this.disabledEdit = false;
	this.showAddModal = true;
	this.showListPrice = true;
	this.priceListsFilter = this.setPricesListByProduct(
		this.priceLists,
		this.selectedProduct.product.priceListAll
	);
	this.priceListObj.priceListId = this.$userInfo.salPriceList.id;
	this.dialogCalculateSale = true;
	// const { taxes } = this.selectedProduct && this.selectedProduct.product;
	// const validTax = taxes.find(
	// 	(p) => p.codePercentage === '02' || p.codePercentage === '03'
	// );
	// const percentage = validTax ? 0 : this.labelsByCountry.percentage;
	const percentage = this.labelsByCountry.percentage;
	this.objPricesale = {
		nameProduct: this.selectedProduct.product.name,
		codeProduct: this.selectedProduct.product.code,
		stockProduct: this.selectedProduct.product.stock,
		costPromProducto: this.selectedProduct.product.cProm,
		percentage,
		quantity: this.quantity,
		total: this.total,
		costUnit: this.total / (this.quantity * Number(`1.${percentage}`)),
	};
	this.objPricesale.subtotal = Number(this.total) / Number(`1.${percentage}`);
	this.objPricesale.tax = Number(this.objPricesale.subtotal) * Number(`0.${percentage}`);
	// this.objPricesale.tax = validTax
	// 	? 0
	// 	: Number(this.objPricesale.subtotal) * Number(`0.${percentage}`);
	const { unitPrice, price } = this.selectedProduct.product.priceList;
	this.priceListObj.pricePurchase = twoDecimals(
		this.objPricesale.total / this.objPricesale.quantity
	);
	this.priceListObj.unitCost = twoDecimals(
		Number(this.priceListObj.pricePurchase) / Number(`1.${percentage}`)
	);
	this.priceListObj.priceUnit = Number(unitPrice || 0);
	this.priceListObj.priceSale = twoDecimals(Number(price || 0));
	this.priceListObj.profitAmount = twoDecimals(
		Number(price - this.priceListObj.pricePurchase)
	);
	this.priceListObj.utilityUlt = twoDecimals(
		Number(this.priceListObj.priceUnit - this.priceListObj.unitCost)
	);
	this.priceListObj.markupPercentage =
		this.priceListObj.pricePurchase !== 0
			? twoDecimals((this.priceListObj.profitAmount / this.priceListObj.pricePurchase) * 100)
			: 0;
	this.priceListObj.percentageUtilUlt = this.priceListObj.unitCost
		? twoDecimals((this.priceListObj.profitAmount / this.priceListObj.unitCost) * 100)
		: 0;
	this.priceListObj.marginPercentage = this.priceListObj.unitCost
		? twoDecimals((this.priceListObj.profitAmount / this.priceListObj.priceSale) * 100)
		: 0;

	this.priceListArr.push({
		flagEdit: false,
		percentageUtilUlt: this.priceListObj.percentageUtilUlt,
		priceSaleOrigin: this.priceListObj.priceSale,
		priceListId: this.priceListObj.priceListId,
		priceSale: this.priceListObj.priceSale,
		priceUnit: this.priceListObj.priceUnit,
		profitAmount: this.priceListObj.profitAmount,
		utilityUlt: this.priceListObj.utilityUlt,
		markupPercentage: this.priceListObj.markupPercentage,
		marginPercentage: this.priceListObj.marginPercentage,
	});
	this.priceListArrValue = [
		{
			...this.selectedProduct.product.priceList,
			id: this.$userInfo.salPriceList.id,
			name: this.$userInfo.salPriceList.name,
		},
	];
	this.loadProductUlt();
	this.loadWarehouse(true);
}

async function loadWarehouse(valueRequired) {
	const params = {
		subsidiariesId: this.subsidiaryId,
	};
	if (valueRequired) {
		params.productId = this.selectedProduct.id || this.productEdit;
	}
	try {
		const response = await this.$httpProducts.get('warehouses', { params });
		this.warehousesSales = response.data;
		if (this.warehousesSales.length === 1) {
			this.objPricesale.warehouseId = this.warehousesSales.map((p) => p.id);
		}
	} catch (error) {
		this.showGenericError();
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

async function loadProductUlt() {
	const params = {
		productId: this.selectedProduct.id || this.productEdit,
	};
	try {
		const { data: ultProductInfo } = await this.$httpSales.get('purchase-article-price', {
			params,
		});
		this.ultProductInfo = ultProductInfo;
		this.ultProductInfo.price = Math.floor(ultProductInfo.price * 100) / 100;
		const { price } = this.ultProductInfo;
		this.ultProductInfo.utilImp =
			Number(twoDecimals(this.priceListObj.priceUnit - price)) || 0;
		this.ultProductInfo.percentageUtil =
			twoDecimals(
				(Number(this.ultProductInfo.utilImp) / this.ultProductInfo.price) * 100
			) || 0;
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'PRODUCT_WITHOUT_PURCHASE') {
				this.showNotPurchase = false;
				this.showNotification(error.data.messageError, 'warning');
				this.ultProductInfo = {};
			}
		} else {
			this.showGenericError();
		}
	}
}

function updatePriceSale(row) {
	this.titleDialog = 'VISUALIZAR TU PRECIO DE VENTA';
	this.disabledEdit = true;
	this.showAddModal = false;
	this.dialogCalculateSale = true;
	this.priceSaleId = row.priceListId;
	this.productEdit = row.productId;
	const {
		subtotal,
		nameProduct,
		stockProduct,
		quantity,
		total,
		costUnit,
		tax,
		warehouseId,
		costPromProducto,
		codeProduct,
	} = row.additionalForm || {};
	const { flagEdit } = row.additionInformationPriceList || {};
	this.objPricesale = {
		subtotal: subtotal || row.subtotal,
		nameProduct: nameProduct || row.productName,
		codeProduct: codeProduct || row.productCode,
		costPromProducto: costPromProducto || null,
		stockProduct: stockProduct || row.stockProduct,
		quantity: quantity || row.quantity,
		total: total || row.total,
		costUnit: costUnit || row.price,
		tax: tax || row.taxAmount,
		warehouseId: warehouseId || row.warehouseProductId,
	};
	const { additionInformationPriceList } = row;
	this.priceListObj = {
		priceListId: additionInformationPriceList
			? additionInformationPriceList.priceListId
			: row.priceListI,
		markupPercentage: additionInformationPriceList
			? additionInformationPriceList.markupPercentage ||
			  additionInformationPriceList.percentageUtil
			: row.utilityPercentage,
		percentageUtilUlt: additionInformationPriceList
			? additionInformationPriceList.percentageUtilUlt
			: null,
		pricePurchase: additionInformationPriceList
			? additionInformationPriceList.pricePurchase
			: null,
		priceSale: additionInformationPriceList
			? additionInformationPriceList.priceSale
			: null,
		priceUnit: additionInformationPriceList
			? additionInformationPriceList.priceUnit
			: null,
		profitAmount: additionInformationPriceList
			? additionInformationPriceList.profitAmount || additionInformationPriceList.utility
			: null || row.utilityRow,
		utilityUlt: additionInformationPriceList
			? additionInformationPriceList.utilityUlt
			: null,
	};
	this.priceListObj.priceOrigin = this.priceListObj.priceSale;
	this.showListPrice = flagEdit || false;
	this.loadProductUlt();
}

function changeUltPrevious(value) {
	if (value) {
		const percentage = this.labelsByCountry.percentage;
		this.priceListObj.utilityUlt = this.ultProductInfo.utilImp;
		this.priceListObj.percentageUtilUlt = this.ultProductInfo.percentageUtil;
		this.priceListObj.unitCost = this.ultProductInfo.price;
		this.priceListObj.priceUnit = twoDecimals(
			this.ultProductInfo.utilImp + this.priceListObj.unitCost
		);
		this.priceListObj.pricePurchase =
			this.priceListObj.unitCost * Number(`1.${percentage}`);
		this.priceListObj.priceSale = this.priceListObj.priceUnit * Number(`1.${percentage}`);
		this.priceListObj.utility = twoDecimals(
			Number(this.priceListObj.priceSale - this.priceListObj.pricePurchase)
		);
		this.priceListObj.percentageUtil =
			this.priceListObj.pricePurchase !== 0
				? twoDecimals((this.priceListObj.utility / this.priceListObj.pricePurchase) * 100)
				: 0;
	} else {
		const percentage = this.labelsByCountry.percentage;
		const { unitPrice, price } = this.selectedProduct.product.priceList;
		this.priceListObj.pricePurchase =
			twoDecimals(this.objPricesale.costUnit) * Number(`1.${percentage}`);
		this.priceListObj.unitCost = twoDecimals(
			Number(this.priceListObj.pricePurchase) / Number(`1.${percentage}`)
		);
		this.priceListObj.priceUnit = Number(unitPrice || 0);
		this.priceListObj.priceSale = twoDecimals(Number(price || 0));
		this.priceListObj.utility = twoDecimals(
			Number(this.priceListObj.priceSale - this.priceListObj.pricePurchase)
		);
		this.priceListObj.utilityUlt = twoDecimals(
			Number(this.priceListObj.priceUnit - this.priceListObj.unitCost)
		);
		this.priceListObj.percentageUtil =
			this.priceListObj.pricePurchase !== 0
				? twoDecimals((this.priceListObj.utility / this.priceListObj.pricePurchase) * 100)
				: 0;
		this.priceListObj.percentageUtilUlt = this.priceListObj.unitCost
			? twoDecimals((this.priceListObj.utilityUlt / this.priceListObj.unitCost) * 100)
			: 0;
		this.loadProductUlt();
	}
}

function setUnit({ model, value }, row, index) {
	const newRow = this.updateByUnitChangePurchase(model, value, row, index);
	return newRow;
}

function updateByUnitChangePurchase(model, value, row, index) {
	const { quantity, conversions } = row;
	const isUnitBase = conversions ? !conversions[value.id] : true;
	const conversionsValue = (conversions && conversions[value.id]) || {
		quantity,
	};
	const conversionQuantity = this.getConversionQuantity(
		row,
		value,
		conversionsValue,
		isUnitBase
	);
	const unitQuantity = quantity * conversionQuantity;
	const detail = this.model.details[index];
	detail[model] = value.id;
	detail.unitConversion = conversionQuantity;
	detail.unitName = value.name;
	detail.unitQuantity = unitQuantity;
	detail.unitCode = value.code;
	return detail;
}

function getConversionQuantity(product, value, conversion, unitBaseFlag) {
	if (!unitBaseFlag) {
		return (
			getDeeper('conversions', value.id, 'quantity')(product) || conversion.quantity || 1
		);
	}
	return 1;
}

function closeModalLot() {
	this.showDialogLot = false;
	this.variationModel = {
		stock: 0,
		lot: null,
		warehouseId: null,
		brandId: null,
		features: [],
	};
}

async function addLotProduct() {
	const codeVar = this.variationModel.features.reduce((a, f) => a.concat(f.code), '');
	const objectProduct = {
		brandId: this.variationModel.brandId,
		lot: this.variationModel.lot,
		stock: this.variationModel.stock,
		warehouseId: this.variationModel.warehouseId,
		features: this.variationModel.features || [],
		name: this.selectedProduct.nameProduct,
		code: this.selectedProduct.code.concat(codeVar),
		price: this.selectedProduct.priceProduct,
	};
	const body = {
		typeProduct: 7,
		childs: [objectProduct],
	};
	try {
		const response = await this.$httpProducts.patch(
			`products-parent/${this.selectedProduct.id}`,
			body
		);
		this.showNotification(
			'El producto lote fue creado correctamente y fue reemplazado por el producto seleccionado anteriormente.'
		);
		this.closeModalLot();
		this.setProductId(response.data.product[0]);
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SELECTED_PRODUCT_NOT_PARENT_PRODUCT') {
				this.showGenericError(
					'Para crear un producto lotes , debe seleccionar el producto padre.'
				);
			} else if (error.data.message === 'DUPLICATE_CODE') {
				this.showGenericError('Los códigos esta duplicados en una misma tienda.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setVariationModel({ model, value }, featIdx) {
	if (value) {
		if (featIdx >= 0) {
			const feat = this.selectedProduct.features[featIdx];
			const child = {
				id: feat.id,
				code: String(value.id),
				name: feat.name,
				value: value.name,
				includeInCode: true,
				filterable: true,
				flagSeparator: false,
			};
			this.$set(this.variationModel.features, featIdx, child);
		} else if (model === 'lot') {
			this.variationModel[model] = value;
		} else {
			this.variationModel[model] = model !== 'warehouseId' ? Number(value) : value;
		}
	}
}

async function validateDocumentNumber() {
	try {
		const newPurchase = { ...this.model };
		const typeDocument = this.typeDocuments.find(
			(td) => td.comTypeDocumentId === newPurchase.typeDocumentId
		);
		const payload = {
			serie: newPurchase.serie,
			number: newPurchase.number,
			supplierId: newPurchase.supplierId,
		};
		if (payload.supplierId === undefined || payload.supplierId === null) {
			this.showGenericError(
				'Debe seleccionar un proveedor para validar la serie y el correlativo.'
			);
			return;
		}
		const url = `${typeDocument.documentType.code}/validate-serie-number`;
		const response = await this.$httpSales.post(`purchase-documents/${url}`, payload);
		const message = response.data.message;
		if (message === 'No envia serie y numero') {
			this.showGenericError('Completar Serie y correlativo.');
			return;
		}
		if (message === 'Serie y numero son validos') {
			this.showNotification('Serie y correlativo disponibles para el documento.');
			return;
		}
	} catch (error) {
		const messageError =
			error.data.message || 'Ocurrió un error al validar la serie y el correlativo.';
		if (messageError === 'SERIE_DOCUMENT_SUPPLIER_REPEATED_ERROR') {
			this.showGenericError(
				'La serie y el correlativo ya se encuentran registrados para el proveedor seleccionado.'
			);
		} else {
			this.showGenericError(messageError);
		}
	}
}

function beforeRouteUpdate(to, from, next) {
	if (from.name === 'purchases-edit' && to.name === 'purchases-new') {
		this.pendingRouteNext = next;
		this.showConfirmNewPurchaseDialog = true;
	} else {
		next();
	}
}

function beforeRouteLeave(to, from, next) {
	if (from.name === 'purchases-edit' && to.name === 'purchases-new') {
		this.pendingRouteNext = next;
		this.showConfirmNewPurchaseDialog = true;
	} else {
		next();
	}
}

function onCancelNewPurchase() {
	this.showConfirmNewPurchaseDialog = false;
	if (this.pendingRouteNext) {
		this.pendingRouteNext(false);
		this.pendingRouteNext = null;
	}
}

function onConfirmNewPurchase() {
	this.showConfirmNewPurchaseDialog = false;
	
	helper.removeLocalData('temp-purchase-products');
	
	if (this.pendingRouteNext) {
		this.pendingRouteNext();
		this.pendingRouteNext = null;
	}
	
	this.cleanupHeaderForNewPurchase([]);
}

function cleanupHeaderForNewPurchase(details) {
	this.model.serie = '';
	this.model.number = '';
	this.model.documentNumber = '';
	this.model.supplierId = null;
	this.selectedSupplier = {
		commercialName: '',
		typeDocumentName: '',
		documentNumber: '',
		flagActive: 1,
	};
	this.model.commentary = '';
	this.commentary = null;
	this.model.referenceExternal = null;
	this.model.paymentMethodId = 1;
	this.model.transactions = [];
	this.model.detailsPayments = [];
	const todayStr = helper.formatDate(new Date(), 'DD/MM/YYYY');
	this.model.dateDocument = todayStr;
	this.model.dueDate = todayStr;
	this.model.dateIncome = todayStr;
	this.model.details = details;
	
	// Limpiar datos de totales, subtotales y productos de la tabla
	this.model.amount = 0;
	this.model.taxes = 0;
	this.model.total = 0;
	this.model.subTotal = 0;
	this.model.discountAmount = 0;
	this.details = [];

	if (this.originalTypeDocuments && this.originalTypeDocuments.length) {
		this.typeDocuments = [...this.originalTypeDocuments];
	}
	this.codeDocuments = ['BOL', 'FAC', 'ORC'];
	this.allowProductFree = this.subsidiary && this.subsidiary.settings.allowProductFree ? 1 : 0;
	this.cannotBeEdited = false;
	this.detailSeries = false;
	this.setBillingAsDefaultTypeDocument();
	if (this.model.typeDocumentId) {
		this.loadConfigData(this.model.typeDocumentId);
	}
	this.priceAmountsMethod();
}

export default {
	name: 'pages-purchases-new',
	created,
	data,
	components: {
		modalLotes,
		actionSidebar,
		appActions,
		appCommentariesLotes,
		appCommentaries,
		autoCompleteComponent,
		headerPage,
		headerSummary,
		generalFilter,
		historyProducts,
		fastRegister,
		productsSearchForm,
		productsSearchInput,
		purchasesDetails,
		purchasesPayments,
		purchasesQuotes,
		purchasesTransactions,
		retentionsForm,
		suppliersForm,
		controlSeries,
		btnAverageCost,
		modalItems,
		appShowDialog,
		personSearchForm,
		personSearchInput,
		typeChangeForm,
		ModalAccountingPeriod,
		additionalInformation,
		paymentInformation,
	},
	computed: {
		labelTax,
		basePriceComputed,
		dateDocumentFormatted,
		disableAddProduct,
		disabledPurchase,
		flagTaxName,
		historyProductsModal,
		isCommentary,
		isEditing,
		isDangerousToEdit,
		isProductSearcher,
		isWithholdingTaxes,
		labelButton,
		maxLengthSerie,
		resourceProductsUrl,
		summaryTransactions,
		typeTransform,
		valuesDisabled,
		validErrorTotal,
		withholdingTaxRent,
		withholdingTaxTaxes,
		isShowExchangeRate,
		totalQuantity() {
			const total = this.model.details.reduce(
				(a, p) => a + p.totalW || a + p.quantity,
				0
			);
			return total;
		},
		flagAutoSerieNumber() {
			if (this.typeDocuments.length) {
				const td = this.typeDocuments.find(
					(type) => type.comTypeDocumentId === this.model.typeDocumentId
				);
				if (td) {
					const flag =
						td.documentType.settings &&
						td.documentType.settings.flagGenerateSerie &&
						this.$userInfo.company.settings.flagPurAutoGenerateSerie;
					if (flag && this.isEditing) {
						const { serie, number, documentNumber } = this.persistData;
						this.model.serie = serie;
						this.model.number = number;
						this.model.documentNumber = documentNumber;
						this.numberReadonly = true;
						this.serieReadonly = true;
					}
					return flag;
				}
			}
			return false;
		},
		hasDynamicsForms() {
			return !!getDynamicFormPurchase() && this.model.typeDocumentId === 10;
		},
		disableORD() {
			const providerIsBlocked = !this.selectedSupplier.flagActive;
			return providerIsBlocked;
		},
	},
	methods: {
		addLotProduct,
		changeUltPrevious,
		closeDialogValidatedPurchase,
		addProduct,
		addProductModal,
		addType,
		alertRetention,
		cancelButtonClicked,
		cancelPurchase,
		changeSwitchUtility,
		changeSwitchTotal,
		changeSwitchTotalArr,
		closeModalSale,
		closeModalHistory,
		closeModalLot,
		closeSidebar,
		closeDialogChangeSale,
		columnInput,
		convertModel,
		focusOnSupplier,
		deleteProduct,
		generateTransaction,
		getConversionQuantity,
		gettingCode: helper.debounce(gettingCode, 700),
		getSubsidiaryId,
		getProduct,
		getRetentionAmount,
		getRetentionIvaAmount,
		getTaxesToUse,
		goToDetailPurchase,
		loadCash,
		loadCenterOfCost,
		loadConfigData,
		loadDataConvert,
		loadHistoryProducts,
		loadProductsFeatures,
		loadProductUlt,
		loadTypeChange,
		loadWarehouse,
		makeCommentary,
		openHistoryProducts,
		onInput,
		openDialogLotes,
		handlecloseModalLotes,
		openSearch,
		priceAmountsMethod,
		processPurchase,
		productSaved,
		runAction,
		savePurchase,
		saveRetention,
		saveSupplier,
		setDetailTotal,
		setDetailTotalArr,
		setDetailPurchase,
		setPercentageUtilUlt,
		setPercentageUtilUltArr,
		setPricesListByProduct,
		setUtilityImpUlt,
		setUtilityImpUltArr,
		setPriceUnit,
		setPriceUnitArr,
		setPriceSale,
		setPriceSaleArr,
		setDetailSubtotal,
		setDetailSubtotalArr,
		setDetailCostUnit,
		setDetailCostUnitArr,
		setPriceList,
		setPriceListArr,
		setVariationModel,
		setUnit,
		setUtilityImp,
		setUtilityImpArr,
		setPercentageUtil,
		setPercentageUtilArr,
		setDateType,
		setCashPurchase,
		setParamsWarehouse,
		setBillingAsDefaultTypeDocument(documentCode) {
			let billing;
			if (documentCode) {
				billing = this.typeDocuments.find(
					(typeDoc) => typeDoc.documentType.code === documentCode
				);
			} else {
				// Buscar primero 'FAC', si no existe usar el primero
				billing = this.typeDocuments.find(
					(typeDoc) => typeDoc.documentType.code === 'FAC'
				);
				if (!billing && this.typeDocuments.length > 0) {
					billing = this.typeDocuments[0];
				}
			}
			this.isVisibleBtnOrder = billing
				? billing.documentType.flagDisplayTransfer !== 1
				: false;
			this.model.typeDocumentId = billing ? billing.comTypeDocumentId : 0;
			if (billing) {
				this.showNotSerie =
					billing.documentType.settings &&
					billing.documentType.settings.flagSerieRequired;
			}
			this.typeDocumentCode = billing ? billing.documentType.code : '';
			this.flagDisplayTransfer = billing
				? billing.documentType.flagDisplayTransfer
				: false;
		},
		setCommentary,
		setCommentaryLotes,
		setDate,
		setProductId,
		setSelectedProducts,
		setSupplier,
		setTypeTaxes,
		showVariantsSlide,
		summaryData,
		toggleSelect,
		unitsByProduct,
		updateAmounts,
		updateByUnitChangePurchase,
		updateCenterCost,
		updateDetailPayment,
		updateDetailsPayments,
		updatePriceSale,
		updateTotal,
		updateTransaction,
		updateTransactions,
		openSeries,
		openDialogLot,
		handleCloseModalTest,
		openDialogPriceSale,
		sendSeries,
		loadTypeSuppliers,
		changeFlagIncome,
		toggleBtn,
		updateBrand,
		updateColumns,
		selectBasePrice,
		openDialoErrorAverage,
		closeModalAverage,
		checkAverageCost,
		loadAverageCost,
		loadMakePurchases,
		closeDialogInit,
		openSearchSupplier,
		changeTypeCurrency,
		openSlideTypeChange,
		validateExchangeRate: helper.debounce(validateExchangeRate, 1500),
		checkTypeTransactions,
		closeDialogBank,
		closeDialogChange,
		async loadSunat() {
			const code = 'TABLA23';
			try {
				({ data: this.typesDetraction } = await this.$httpSales.get(
					`catalog-sunat-details-list/${code}`
				));
				this.typesDetraction = this.typesDetraction.map((type) => {
					const newRow = {
						...type,
						description: `${type.code} ${type.description} - ${type.percentage}%`,
					};
					return newRow;
				});
			} catch (err) {
				this.showGenericError();
			}
		},
		calculatePrice(cost, earnings) {
			if (earnings.type === 'fixed') {
				return cost + earnings.amount;
			}
			return cost + (cost * earnings.amount) / 100;
		},
		roundPrice(price, decimals = 2) {
			return Number(price.toFixed(decimals));
		},
		updatePriceListSet(priceList, cost, tax, detail) {
			const updatedPriceList = { ...priceList };

			if (updatedPriceList.earnings) {
				const salePrice = this.calculatePrice(cost, updatedPriceList.earnings);
				updatedPriceList.price = this.roundPrice(salePrice, 1);
				updatedPriceList.taxes = this.roundPrice(detail.tax);
				updatedPriceList.unitPrice = Number((updatedPriceList.price / tax).toFixed(2));
			}

			if (updatedPriceList.ranges && updatedPriceList.ranges.length) {
				updatedPriceList.ranges = updatedPriceList.ranges.map((item) => {
					if (item.type && item.amount) {
						const priceRange = this.calculatePrice(cost, item);
						return { ...item, price: this.roundPrice(priceRange, 5) };
					}
					return item;
				});
			}

			updatedPriceList.units = Object.entries(updatedPriceList.units).reduce(
				(innerUpdatedUnits, [unitId, unit]) => {
					const unitConv = detail.conversions[unitId];
					const updatedUnit = { ...unit };

					if (unit.earnings) {
						const priceCalc =
							this.calculatePrice(cost, unit.earnings) * unitConv.quantity;
						updatedUnit.price = this.roundPrice(priceCalc, 5);
						updatedUnit.unitPrice = Number((priceCalc / tax).toFixed(5));
						updatedUnit.taxes = this.roundPrice(
							updatedUnit.price - updatedUnit.unitPrice
						);
					}

					if (unit.ranges && unit.ranges.length) {
						updatedUnit.ranges = unit.ranges.map((item) => {
							if (item.type && item.amount) {
								const priceUnitRange =
									this.calculatePrice(cost, item) * unitConv.quantity;
								return { ...item, price: this.roundPrice(priceUnitRange, 5) };
							}
							return item;
						});
					}

					return { ...innerUpdatedUnits, [unitId]: updatedUnit };
				},
				{}
			);

			return updatedPriceList;
		},
		buildPriceListAll(details) {
			return details.reduce((accum, detail) => {
				if (detail.flagFree) return accum;
				if (!detail.priceList.earnings) return accum;
				const tax = 1 + (detail.tax || 0) / 100;
				const cost = this.roundPrice(detail.price * tax);
				const price = detail.priceList.earnings
					? this.calculatePrice(cost, detail.priceList.earnings)
					: (detail.additionInformationPriceList &&
							detail.additionInformationPriceList.priceSale) ||
					  0;
				const newSales = {
					productId: detail.productId,
					price: this.roundPrice(price, 1),
					priceList: Object.entries(detail.priceListAll).reduce(
						(updatedListAcc, [priceListId, priceList]) => {
							const updatedList = { ...updatedListAcc };
							updatedList[priceListId] = this.updatePriceListSet(
								priceList,
								cost,
								tax,
								detail
							);
							return updatedList;
						},
						{}
					),
				};
				if (JSON.stringify(detail.priceListAll) === JSON.stringify(newSales.priceList))
					return accum;
				accum.push(newSales);
				return accum;
			}, []);
		},
		updatePriceList({ value }, index, product) {
			this.model.details[index].priceList = product.priceListAll[value.id];
			this.model.details[index].priceListId = value.id;
		},
		normalizeDate(dateInput, hours = '00', minutes = '00') {
			const fecha = new Date();
			const formattedDate = `${String(fecha.getDate()).padStart(2, '0')}-${String(
				fecha.getMonth() + 1
			).padStart(2, '0')}-${fecha.getFullYear()}`;
			try {
				const dateNow = dateInput || formattedDate;
				const formattedInput = dateNow.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
				const fullDateString = `${formattedInput}T${hours}:${minutes}:00`;
				const parsedDate = new Date(fullDateString);
				const userAgent = navigator.userAgent || navigator.vendor || window.opera;
				const isIos = /iPhone|iPad/.test(userAgent);

				if (isIos) return parsedDate;

				if (isNaN(parsedDate.getTime())) {
					const h = String(fecha.getHours()).padStart(2, '0');
					const m = String(fecha.getMinutes()).padStart(2, '0');
					return `${formattedInput} ${h}:${m}`;
				}
				const date = new Date(parsedDate);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hou = String(date.getHours()).padStart(2, '0');
				const min = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day} ${hou}:${min}`;
			} catch (error) {
				const h = String(fecha.getHours()).padStart(2, '0');
				const m = String(fecha.getMinutes()).padStart(2, '0');
				return `${formattedDate} ${h}:${m}`;
			}
		},
		getTaxesDataToUse,
		handleSumCalculated(sum) {
			this.sum = sum;
		},
		addProductModalLot(newObject) {
			this.dialogCalculateSale = false;
			this.newLotInfo = newObject;
			this.closeModalSale();
		},
		updateDetailsPerception(value) {
			const quotesArray = helper.quotesDistribution(
				value,
				this.model.detailsPayments.length
			);
			this.model.detailsPayments = this.model.detailsPayments.map((c, index) => {
				const newRow = { ...c };
				newRow.amount = quotesArray[index];
				return newRow;
			});
		},
		onSelectAccountingPeriod(value) {
			this.accountingPeriodSelected = value || null;
			this.openModalAccountingPeriod = false;
		},
		openSliderModal(code, title = '', width = 500) {
			this.action = {
				active: true,
				code,
				open: true,
				title,
				width,
			};
		},
		closeModal() {
			this.action = {
				active: false,
				code: '',
				open: false,
				width: 0,
				title: '',
			};
		},
		saveDataPayment(dataPayment, urlImage) {
			this.closeModal();
			this.paymentInformation = { ...dataPayment };
			this.urlVoucher = urlImage;
		},
		saveDataForm(dataForm) {
			this.closeModal();
			this.additionalInformation = { ...dataForm };
		},
		setProduct(product) {
			const inputQuantity = document.querySelector('#quantity');
			inputQuantity.focus();
			this.setProductId(product);
		},
		closeNotification() {
			this.notification.show = false;
			this.notification.colorDialog = '';
			this.notification.colorText = '';
			this.notification.text = '';
			this.notification.title = '';
		},
		validateDocumentNumber,
		getLastExchangeRate() {
			const localExchangeRateList = helper.getLocalData('ms-exchange-rates');
			const first = localExchangeRateList?.[0];
			const value = first?.amount;
			return value;
		},
		onCancelNewPurchase,
		onConfirmNewPurchase,
		cleanupHeaderForNewPurchase,
	},
	props: {
		id: [Number, String],
	},
	validations,
	beforeRouteUpdate,
	beforeRouteLeave,
	watch: {
		'model.typeDocumentId': changeTypeDocument,
		'model.currency': changeCurrency,
	},
};
</script>
<style lang="scss" scoped>
.label-input-group {
	color: #8f8f8f;
	font-size: 13px;
	margin-bottom: 1px;
}
.input-group {
	background-color: #ffffff;
	border: 0.5px solid #e4e4e4;
	border-radius: 5px;
	-webkit-box-shadow: none;
	box-shadow: none;
	min-height: 0;
	padding: 0px;

	.input-alphanumeric {
		color: #4a4a4a;
		// font-family: "Opens_regular";
		font-size: 12px;
		height: auto;
		min-height: 29px;
		padding-left: 9px;
		padding-right: 9px;
	}
}
.btn-currency {
	background: map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, white);
	display: block;
	height: 28px;
	margin: 0 auto 5px auto;
	width: 28px;
}

.menu-purchase {
	display: block !important;
}

.base-price {
	color: color(paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: size(small);
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

.message-error {
	position: absolute;
}

.client_button {
	align-items: center;
	background: map-get($colors, primary);
	border-radius: 5px;
	display: flex;
	height: 31px;
	margin-top: 19px;
	padding: 6px 7px 6px 4px;
	width: 31px;
}

.bold {
	font-family: map-get($fonts, open-bold);
}

.extra-bold {
	font-weight: 800;
}

.ft-10 {
	font-size: 10px;
}

.separator-pur {
	position: relative;

	&::before {
		content: '';
		position: absolute;
		width: 1px;
		height: 38px;
		background: color(background-sidebar);
		top: -15px;
		bottom: 0;
	}
}

.input-right {
	left: auto !important;
	right: 0 !important;
}

.input-chip {
	border-radius: 0px 5px 5px 0 !important;
}

.btn-sunat {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-semibold);
	font-size: 10px;
	height: 31px;
	width: 83px;
}

.label-sales {
	font-size: 13px;
	color: color(brown-grey);
	margin-bottom: 1px;
}

.btn-price-sale {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	padding: 4px 1px;
	width: 190px;
}

.btn-free {
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	padding: 4px 1px;
	width: 40px;
}

.btn-price-sale-dolar {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	padding: 4px 6px;
	width: 130px;
}

.title-header {
	border-bottom: solid 0.5px rgba(8, 95, 101, 0.25);
	color: color(sidebar);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
}

.modal-items {
	background: color(white);
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	color: color(paginationText);
	font-size: 14px;

	&-title {
		background-color: rgba(195, 231, 232, 0.21);
		color: color(primary);
		font-weight: 600;
		padding: 13px 29px;
		text-transform: uppercase;
	}

	&-all {
		background-color: rgba(195, 231, 232, 0.5);
		padding: 9px 0;
	}

	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}
	}

	&-action {
		background-color: rgba(195, 231, 232, 0.21);
		padding: 15px 0;
	}
}

.width-stock {
	max-width: 185px !important;
}

.width-cprom {
	max-width: 138px !important;
}

.gray-color {
	color: #4a4a4a;
	font-family: font(open-semibold);
	font-size: 11px;
}

.ft-11 {
	font-size: 11px;
}

.item-column {
	background-color: white;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
	padding: 6px 5px;
}

.table-sale {
	border-collapse: collapse;
	width: 100%;
}

.row-table {
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	padding: 4px 6px;
	text-align: center;
}

.label-input {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
}

.ft-8 {
	font-family: font(open-semibold);
	font-size: 8px;
}

.label-util {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: 9px;
}

.link-purchase {
	color: #237bf5;
	font-family: font(open-regular);
	font-size: 12px;
}

.label-checkbox {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 11px;
}

.text-information-list {
	color: #4a4a4a;
	font-size: 12px;
}

.text-not-list {
	color: color(primary);
	font-size: 14px;
	font-weight: 600;
}

.text-alert {
	font-size: 12px;
	font-weight: 500;
}

.bg-header {
	background-color: rgba(2, 151, 155, 0.06);
}

.quantity-title {
	color: #8f8f8f;
	font-size: 13px;
}

.autogenerate-message {
	font-size: 12px;
	padding-top: 5px;
	padding-left: 5px;
}

.text--alert {
	font-size: 11px;
	color: red;
}

.product-list {
	font-size: size(medium);
}
</style>
