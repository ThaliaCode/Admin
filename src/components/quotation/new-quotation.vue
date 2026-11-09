<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
			toda la información para ${actionSale}`"
		/>
		<header-page
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		>
			<header-summary class="justify-end" />
			<v-flex>
				<v-layout wrap justify-end align-center class="lh-regular">
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Número de Cotización</label>
						<p slot="activator" class="body-2 ma-0 primary--text">
							{{ quotation.documentNumber }}
						</p>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Cliente</label>
						<p class="body-2 ma-0 primary--text">
							{{ customer.typePerson.fullName }}
						</p>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">
							{{ customer.typePerson.documentName }}
						</label>
						<p slot="activator" class="body-2 ma-0 primary--text">
							{{ customer.typePerson.documentNumber }}
						</p>
					</span>
				</v-layout>
			</v-flex>
		</header-page>
		<app-actions
			:value-disabled="disabledActions"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout my-3 px-4 wrap justify-start align-end>
			<v-flex xs12 sm6 md5 pr-2>
				<label class="label">Cliente</label>
				<div class="d-flex align-center">
					<autocomplete-component
						customer
						return-object
						custom-search
						append-icon="search"
						class="custom-autocomplete custom-autocomplete-search"
						http-code="$httpSales"
						id="search-supplier"
						:item="customer"
						item-text="autocomplete"
						item-value="id"
						:items="customers"
						placeholder-value="Cliente"
						resource-url="customers"
						@return-data="setCustomer"
					/>
					<button
						style="flex: none !important"
						:disabled="customer ? customer.flagGeneric || !customer.id : true"
						class="pl-add-container size"
						@click="
							action.code = 'CD';
							action.open = true;
							action.title = 'Resumen de Cliente';
							action.width = 500;
						"
					>
						<v-icon color="white">person</v-icon>
					</button>
				</div>
			</v-flex>
			<v-flex xs12 sm6 md3 pl-2>
				<span class="label"> Registrar nuevo cliente </span>
				<div class="d-flex">
					<v-text-field
						hide-details
						readonly
						single-line
						label="Documento de cliente"
						v-model="document"
						class="filter-select"
					></v-text-field>
					<button
						@click="openSliderModal('NC', 'Nuevo Cliente')"
						class="pl-add-container size"
					>
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
				</div>
			</v-flex>
			<v-flex grow="1"></v-flex>
			<v-flex xs12 sm3 md3 pl-2>
				<v-switch
					class="mt-2"
					color="success"
					hide-details
					label="Validar stock"
					v-model="indicateExcessQuantity"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap align-end mb-2 px-4>
			<v-flex xs12 sm6 md2 pr-2>
				<label class="caption">Fecha de Vencimiento</label>
				<v-menu lazy v-model="menu" transition="scale-transition" offset-y full-width>
					<v-text-field
						slot="activator"
						label="Fecha de inicio"
						v-model="entryDate"
						single-line
						append-icon="event"
						class="filter-select shadow-inset-calendar shadow-inset-calendar-end"
						readonly
					></v-text-field>
					<v-date-picker v-model="entryDate" no-title scrollable></v-date-picker>
				</v-menu>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2>
				<label class="caption">Tipo de moneda</label>
				<v-select
					bottom
					single-line
					hide-details
					:items="currencies"
					item-text="code"
					item-value="code"
					class="filter-select"
					content-class="filter-select-content"
					v-model="salesCurrency"
					@change="changeCurrency($event)"
				></v-select>
			</v-flex>
			<v-flex v-if="isPeru" xs12 sm6 md2 px-2 class="col-exchange">
				<v-chip label color="pink" text-color="white" class="chip-exchange">
					Cambio Maki: <span>S/.</span>
				</v-chip>
				<v-text-field
					single-line
					hide-details
					label="00.00"
					type="number"
					v-model.number="exchangeRate"
					@change="validateExchangeRate"
					class="filter-select shadow-inset-chip"
				></v-text-field>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2 v-if="showImportFields">
				<label class="caption">Plazo de entrega</label>
				<v-text-field
					class="filter-select"
					hide-details
					label="Plazo de entrega"
					single-line
					type="number"
					v-model.number="dayImportTerm"
					@input="validateOnInput"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-flex class="content-apply" pt-2 pb-2 px-4 mb-3 mt-3 v-if="selectedsCoupon.length">
			<v-layout row align-center>
				<v-flex xs10>
					<v-flex class="title-coupon" xs3>Cupones Aplicados:</v-flex>
					<v-layout row>
						<v-flex
							class="item-coupons ml-2 mt-2"
							v-for="(item, index) in selectedsCoupon"
							:key="index"
							xs10
						>
							<v-layout align-center>
								<v-flex> #{{ item.numbDocuments }} | S/{{ item.quantityCoupon }} </v-flex>
								<v-flex>
									<button class="icon-delete" @click="deleteRow(item)">X</button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs2>
					<span class="ft-10">Total de Dscto:</span>
					<span class="amount-total ml-2">S/ {{ totalAMountCouponHeader }}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 sm6 md2 px-4 v-if="isEditing">
			<label class="caption">Estado de Cotización</label>
			<v-select
				autocomplete
				bottom
				single-line
				hide-details
				:items="status"
				v-model="state"
				label="Estado de Cotización"
				item-text="name"
				item-value="id"
				class="filter-select"
				content-class="filter-select-content"
			></v-select>
		</v-flex>
		<v-layout my-2 wrap justify-start align-end px-4>
			<v-flex xs12 sm6 md4 pr-2 class="align-col">
				<products-search-input
					ref="productSearcher"
					ref-value="productSearcher"
					id="productSearcher"
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs12 sm6 md4 class="align-col">
				<label class="label">Lista de Precios</label>
				<div class="d-flex align-end">
					<v-select
						autocomplete
						solo
						clearable
						hide-details
						item-text="name"
						item-value="id"
						:items="newProduct.product.pricesListArray"
						v-model="newProduct.selectedPriceListId"
						class="filter-select"
						content-class="filter-select-content"
						@input="setPriceList"
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
					<button
						:disabled="!newProduct.selectedPriceListId || this.data.length === 0"
						@click="updateAllPriceListOfProduct(newProduct.selectedPriceListId)"
						class="btn-common ml-2"
						style="width: 120px"
					>
						Actualizar precios
						<!-- <v-icon id="add-icon" color="white">add</v-icon> -->
					</button>
				</div>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2 class="align-col">
				<v-layout column justify-space-between align-center>
					<v-flex mx-2>
						<label mr-2 class="title-select">Cantidad:</label>
						<v-text-field
							single-line
							hide-details
							type="number"
							ref="productQuantity"
							v-model.number="newProduct.quantity"
							label="0"
							class="filter-select"
							content-class="filter-select-content"
							@keypress.stop.enter="addProduct"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<button
				:disabled="
					!newProduct.product || !newProduct.quantity || !newProduct.selectedPriceListId
				"
				class="pl-add-container size"
				:class="{
					opacyble:
						!newProduct.product ||
						!newProduct.quantity ||
						!newProduct.selectedPriceListId,
				}"
				@click="addProduct"
			>
				<v-icon id="add-icon" color="white">add</v-icon>
			</button>
		</v-layout>
		<app-table
			class="mb-0 mt-2"
			name="quotations"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			local-storage
			include-filter
			selectable
			:check-all="checkAll"
			:last-page="lastPage"
			:key-value="keyValue"
			@on-toggle-columns="toogleColumns"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			@row-is-selected="rowIsSelected"
			@column-input="changeDiscountAllRows"
			@on-selected-all="selectedAll"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" tabindex="-1">
					{{ props.row.order }}
				</td>
				<td v-show="showRow(columns, 2)" tabindex="-1">
					{{ getWarehouseName(props.row) }}
				</td>
				<td v-show="showRow(columns, 3)" tabindex="-1">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 4)" tabindex="-1">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 5)" tabindex="-1">
					{{ props.row.description }}
				</td>
				<td v-show="showRow(columns, 6)" tabindex="-1">
					{{ props.row.brandName }}
				</td>
				<td v-show="showRow(columns, 7)" tabindex="-1">
					{{ props.row.inlineFeatures }}
				</td>
				<td v-show="showRow(columns, 8)" tabindex="-1">
					{{ props.row.categoryName }}
				</td>
				<td v-show="showRow(columns, 9)">
					<div style="padding: 5px">
						<v-select
							autocomplete
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
							@input="updatePriceList(props.index)"
						>
							<template slot="item" slot-scope="data">
								<div class="d-flex flex-row justify-space-between" style="width: 100%">
									<span> {{ data.item.name }}. {{ ' ' }}</span>
									<span v-if="data.item.price">
										{{ salesCurrency }}
										{{ getPriceConfiguratedByPriceList(props.row, data.item) }}
									</span>
								</div>
							</template>
							<template slot="selection" slot-scope="data">
								<p class="mb-0 text-selection d-flex flex-row justify-space-between">
									<span> {{ data.item.name }} - {{ ' ' }} </span>
									<span v-if="data.item.price" class="price-selection">
										{{ salesCurrency }}
										{{ getPriceConfiguratedByPriceList(props.row, data.item) }}
									</span>
								</p>
							</template>
						</v-select>
					</div>
				</td>
				<td v-show="showRow(columns, 10)" tabindex="-1" class="width-column">
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
				<td v-show="showRow(columns, 11)" tabindex="-1" class="width-column">
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
				<td
					v-show="showRow(columns, 12)"
					:class="{
						'cell-rose': isExcessQuantity(props.row) && indicateExcessQuantity,
					}"
				>
					<template v-if="!showColumnsDocuments">
						<v-text-field
							hide-details
							single-line
							type="number"
							:ref="`quantity${props.index}`"
							v-model.number="props.row.quantity"
							class="filter-select input-max-width"
							@click.stop="stopClick"
							v-on:input="quantityValidation(props.row, $event, props.index)"
						></v-text-field>
					</template>
					<template v-else>
						{{ props.row.quantity }}
					</template>
				</td>
				<td v-show="showRow(columns, 13)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model="props.row.quantityImport"
						class="filter-select input-max-width"
						@click.stop="stopClick"
						@input="quantityImportValidation(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 14)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model="props.row.quantityAvailable"
						class="filter-select input-max-width"
						@click.stop="stopClick"
						@input="quantityAvailableValidation(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 15)">
					<template v-if="flagUpdatePrice">
						<app-input-text
							@click.stop="stopClick"
							:ref="`discount${props.index}`"
							type="number"
							model="priceUnitary"
							:text="props.row.priceUnitary"
							@input="editPriceUnitary(props.row, props.index, $event)"
						/>
					</template>
					<template v-else>
						{{ props.row.priceUnitary | round }}
					</template>
				</td>
				<td v-show="showRow(columns, 16)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.pricePerSale"
						class="filter-select"
						:disabled="!flagUpdatePrice"
						@click.stop="stopClick"
						v-on:change="editPricePerSale(props.row, props.index, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 17)" @click.stop="stopClick">
					<v-select
						bottom
						single-line
						hide-details
						:items="props.row.units"
						v-model.number="props.row.unitId"
						:key="props.row.units.id"
						label="Lista de Precios"
						item-text="code"
						item-value="id"
						class="filter-select"
						content-class="filter-select-content"
						return-object
						@input="setData('unitId', $event, props.row, true, props.index)"
					>
						<template slot="item" slot-scope="data">
							<div class="d-flex flex-row justify-space-between" style="width: 100%">
								<span> {{ data.item.name }}. {{ ' ' }}</span>
								<span>
									{{ salesCurrency }}
									{{ getPriceConfiguratedByUnit(props.row, data.item) }}
								</span>
							</div>
						</template>
						<template slot="selection" slot-scope="data">
							<p class="mb-0 text-selection d-flex flex-row justify-space-between">
								<span> {{ data.item.name }} {{ '- ' }} </span>
								<span class="price-selection">
									{{ salesCurrency }}
									{{ getPriceConfiguratedByUnit(props.row, data.item) }}
								</span>
							</p>
						</template>
					</v-select>
				</td>
				<td
					v-show="showRow(columns, 18)"
					:class="{
						'cell-rose': isExcessQuantity(props.row) && indicateExcessQuantity,
					}"
				>
					{{ getStockDinamic(props.row) }}
				</td>
				<td v-show="showRow(columns, 19)">
					<v-text-field
						hide-details
						single-line
						type="number"
						:disabled="!singleDiscount || !!props.row.flagFree"
						v-model.number="props.row.discountPercentage"
						class="filter-select input-max-width"
						@click.stop="stopClick"
						@change="editDiscount(props.row, props.index, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 20)">{{ props.row.taxes }}</td>
				<td v-show="showRow(columns, 21)">
					{{ props.row.total | round | abs }}
				</td>
				<td v-show="showRow(columns, 22)">{{ props.row.location }}</td>
				<td v-show="showRow(columns, 23)">
					<app-tooltip-button
						size="18"
						color="secondary"
						icon="task_alt"
						text="Atributos"
						@click-icon="openAttributesSlides(props.row, props.index)"
					></app-tooltip-button>
					<app-tooltip-button
						size="18"
						color="primary"
						icon="comment"
						text="Agregar comentario"
						@click-icon="makeQuotationCommentary(props.row, props.index)"
					/>
					<app-tooltip-button
						text="Eliminar"
						color="pink"
						icon="delete"
						@click-icon="warningModal(props.row, props.index)"
					></app-tooltip-button>
				</td>
			</template>
		</app-table>
		<v-layout row wrap px-4>
			<v-flex xs12 class="totales-section d-flex text-xs-center">
				<v-flex class="content-discount" py-2>
					<span>Desc.: </span>
					<span>{{ salesCurrency }} {{ priceAmounts.totalDiscount | round }}</span>
				</v-flex>
				<v-flex class="content-coupon" py-2 v-if="totalAMountCouponHeader > 0">
					<span>Desc. Global: </span>
					<span>{{ salesCurrency }} {{ totalAMountCouponHeader | round }}</span>
				</v-flex>
				<v-flex class="content-green" py-2>
					<span class="title-content">{{ getTaxByCountry($userInfo) }}: </span>
					<span class="item-content"
						>{{ salesCurrency }} {{ priceAmounts.tax | round }}</span
					>
				</v-flex>
				<v-flex class="content-green" py-2>
					<span class="title-content">Gratuito: </span>
					<span class="item-content"
						>{{ salesCurrency }} {{ priceAmounts.free | round }}</span
					>
				</v-flex>
				<v-flex class="subtotal-container content-green" py-2>
					<div class="subtotal">
						<span class="title-content">SubT.: </span>
						<span class="item-content"
							>{{ salesCurrency }} {{ priceAmounts.subtotal | round }}</span
						>
						<button type="button" class="btn-totales" @click="active = !active">
							<v-icon v-if="active" color="info">remove</v-icon>
							<v-icon v-else color="info">add</v-icon>
						</button>
					</div>
					<transition name="fade" mode="out-in">
						<div class="subtotal-menu" v-if="active">
							<div class="subtotal-menu-content">
								<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
									<span class="taxes-title">{{ tax.description }}</span>
									<span>{{ salesCurrency }} {{ resumeTaxes[tax.code] | round }}</span>
								</p>
							</div>
						</div>
					</transition>
				</v-flex>
				<v-flex class="content-total" py-2>
					<span class="title-content">Total: </span>
					<span class="item-content"
						>{{ salesCurrency }} {{ priceAmounts.total | round }}</span
					>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout row py-2 pl-4>
			<v-flex
				d-flex
				align-center
				:class="
					!!showAdditionalInfomatioQuotation ||
					!!showAdditionalInfomatioTypePayment ||
					!!showAdditionalInfomationFac
						? 'xs8'
						: 'xs5'
				"
			>
				<v-btn flat @click="openSliderModal('AC', 'Consideraciones', 550)">
					<span>Consideraciones</span>
				</v-btn>
				<span class="px-2">|</span>
				<v-btn flat @click="openSliderModal('AI', 'Tareas')">
					<span>Tareas</span>
				</v-btn>
				<span class="px-2">|</span>
				<v-btn flat @click="openSliderModal('AD', 'Observaciones')">
					<span>Observaciones</span>
				</v-btn>
				<span
					v-if="!!showAdditionalInfomatioQuotation && showConfigurationQuotation"
					class="px-3"
					>|</span
				>
				<v-btn flat @click="openSliderModal('DA', 'Datos Adicionales')">
					<span>Adicionales</span>
				</v-btn>
				<v-btn
					flat
					depressed
					small
					@click="openSliderModal('ADI', 'Datos de Guia')"
					v-if="!!showAdditionalInfomatioQuotation && showConfigurationQuotation"
					class="btn-additional btn-auto"
				>
					<span class="px-2 pt-2 pb-2">DATOS DE GUIA</span>
				</v-btn>
				<span v-if="showConfigurationQuotation && !!showAdditionalInfomatioTypePayment"
					>|</span
				>
				<v-btn
					flat
					depressed
					small
					@click="openSliderModal('TP', 'Tipos de Pago')"
					v-if="showConfigurationQuotation && !!showAdditionalInfomatioTypePayment"
					class="btn-additional btn-auto"
				>
					<span class="px-2 pt-2 pb-2">Tipo de Pago</span>
				</v-btn>
				<span v-if="showConfigurationQuotation && !!showAdditionalInfomationFac">|</span>
				<v-btn
					flat
					depressed
					small
					v-if="showConfigurationQuotation && !!showAdditionalInfomationFac"
					class="btn-additional btn-auto"
					@click="openSliderModal('FC', 'Facturación')"
				>
					<span class="px-2 pt-2 pb-2">Facturación</span>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout
			class="section-options"
			mt-4
			py-2
			px-4
			v-if="$userInfo.company.settings.COTMoveKardex && !isEditing"
		>
			<v-flex xs2>
				<v-checkbox
					color="primary"
					hide-details
					label="Reservar Stock"
					v-model="reserveStock"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex xs12 mt-3 text-xs-center>
				<v-btn
					v-if="isEditing"
					type="button"
					class="btn-action mr-2"
					color="error"
					:disabled="disabledDelete"
					@click="openConfirmDelete"
				>
					Anular
				</v-btn>
				<v-btn
					type="button"
					class="btn-action mr-2"
					:color="isEditing ? 'info' : 'primary'"
					@click="cancelQuotation"
				>
					Regresar
				</v-btn>
				<v-btn
					:disabled="
						$v.$invalid ||
						negative ||
						blockedCustomer ||
						invalidValue ||
						isLoading ||
						showDuplicateUnit ||
						zeroQuantity
					"
					type="button"
					class="btn-action"
					color="success"
					@click="sendQuotation"
					>Guardar</v-btn
				>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:help-actions="actionsToHelp"
			:active="action.active"
			@close-modal="closeModal"
		>
			<app-commentaries
				show-additional
				v-if="action.code === 'COMME'"
				:product="currentProduct"
				@set-add="setComentary"
				@close-modal="closeModal"
				:onlyCommentary="true"
			>
			</app-commentaries>
			<customer-resume
				v-if="action.code === 'CD'"
				:select-address="customer.addressLine1"
				:customer="customer"
				@select-address="updateCustomerResumeAddress"
				@close-modal="closeModal"
			/>
			<v-flex
				v-if="action.code === 'generate-coupon'"
				xs6
				text-xs-right
				pr-1
				slot="right"
			>
				<span class="ft-10">Total de Cupón: </span>
				<span class="amount-total ml-2">S/ {{ totalAMountCoupon }}</span>
			</v-flex>
			<apply-discount-coupon
				v-if="action.code === 'generate-coupon'"
				:customer="customer"
				:data="rowsCoupons"
				:disabled="!dataSelectedCoupons.length"
				:check-all="checkAllCoupon"
				:last-page="lastPageCoupon"
				:current-page="currentPageCoupon"
				@row-is-select="rowIsSelectedCoupon"
				@selected-all="selectedAllCoupon"
				@on-search="onSearch"
				@set-quantity="setQuantityCoupon"
				@close-modal="closeModal"
				@save-apply-coupon="saveApplyCoupon"
			/>
			<attributes-assign-slide-quotation
				v-if="assigningAttributesAction"
				:subsidiaryId="subsidiaryId"
				:product="productToAssingAttrs"
				@assign-attributes="addAttributesTo"
				@cancel-action="closeModal"
			/>
			<customers-form
				fast-form
				v-if="customerRegisterSelected"
				:is-loading="loadingCustomer"
				:model-data="customer"
				@cancel="closeModal"
				@save="saveCustomer"
			/>
			<app-comments
				v-if="action.code === 'AD'"
				:data="commentary"
				:new-comments="newComments"
				@set-comments="setComments"
				@comments-event="addComments"
			/>
			<app-considerations
				v-if="action.code === 'AC'"
				:data="considerations"
				:new-consideration="newConsideration"
				@add-considerations="addConsiderations"
			/>
			<app-issues
				v-if="action.code === 'AI'"
				:data="workToDo"
				:new-issue="newIssue"
				@add-issues="addIssues"
			/>
			<products-search-form
				:not-valid-negative-stock="$route.name === 'edit-quotation'"
				v-if="isProductSearcher"
				:show-lote="false"
				:search-value="searchVal"
				@add-product="setProduct"
				:show-free="allowProductFree"
				is-sale
			/>
			<additionalInformation
				v-if="action.code === 'ADI'"
				:show-notification="showNotificationQ"
				:additional-information="additionalInformation"
				:id="quotationId"
				@close="closeModal"
				@save-data-form="saveDataForm"
			/>
			<paymentInformation
				v-if="action.code === 'TP'"
				:value="urlVoucher"
				:additional-information="paymentInformation"
				:id="quotationId"
				@close="closeModal"
				@save-data-form="saveDataPayment"
			/>
			<billingInformation
				v-if="action.code === 'FC'"
				:additional-information="billingInformation"
				:id="quotationId"
				@close="closeModal"
				@save-data-form="saveDataBilling"
			/>
			<app-information-additional
				v-if="action.code === 'DA'"
				:show-invalid="showInvalid"
				:amount-sale="priceAmounts.total"
				:show-loading="isLoadingAdi"
				:information-data="informationSale"
				@set-input="setInputAdditional"
				@cancel="closeModal"
				@save-modal="saveModalAdditional"
			/>
			<section class="modal-filter-footer" v-if="!customerRegisterSelected">
				<modal-sidebar-button
					v-if="
						action.code !== 'assigning-attrs' &&
						action.code !== 'ADI' &&
						action.code !== 'DA' &&
						action.code !== 'TP' &&
						action.code !== 'FC' &&
						action.code !== 'COMME' &&
						action.code !== 'generate-coupon' &&
						action.code !== 'CD'
					"
					:is-loading="disableButton"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveData"
				/>
			</section>
		</action-sidebar>
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
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Actualizar Cotización"
			:text-content="showDialogCouponText"
			:show-modal-init="showDialogCoupon"
			@close-dialog="closeDialogCouponError"
		/>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Monto a Aplicar"
			:text-content="textContent"
			:show-modal-init="showDialog"
			@close-dialog="closeDialogCoupon"
		/>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Actualizar Cotización"
			:text-content="textContentCot"
			:show-modal-init="showValidatedCot"
			@close-dialog="closeDialogState"
		/>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			:title-header="titleHeaderDialog"
			:text-content="textDialogStock"
			:show-modal-init="dialogStock"
			@close-dialog="closeDialogStock"
		/>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			:title-header="titleHeaderDialogRow"
			:text-content="textDialogStockRow"
			:show-modal-init="dialogStockRow"
			@close-dialog="closeDialogStockRow"
		/>
		<app-show-dialog
			:show-products="showProducts"
			:products="productsStockNegative"
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Crear Cotización"
			:show-modal-init="dialogStockNegative"
			:text-content="textDialogStockNegative"
			@close-dialog="closeDialogStockNegative"
		/>
		<v-dialog v-model="showConfirmDelete" persistent max-width="400px">
			<modal-items
				v-if="showConfirmDelete"
				name-action="Anular"
				name-cancel="Cerrar"
				title="Anular Cotización"
				show-slot
				:disabled="disabledModal"
				@close-modal="closeModalQuation"
				@action-modal="deleteQuotation"
			>
				<div class="pa-3">
					<p>¿Esta seguro que desea <b>ANULAR</b> la cotización?</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="removeProduct" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">
							¿Esta seguro que desea <b>ELIMINAR</b> este producto?:
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
							Esta acción eliminará este producto de la cotización y no se podrá deshacer
						</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
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
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="IMPORTANTE"
			:text-content="textModal"
			:show-modal-init="showPriceSale"
			max-width-dialog="571px"
			@close-dialog="closeDialogModal"
		/>
		<app-dialog-products
			title-dialog="Crear Cotización "
			:show-dialog="showUnits"
			:products="productDuplicateUnit"
			text-dialog="Se encuentra repetidos con la mismas unidades:"
			@close-modal="closeModalUnit"
		/>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import appShowDialog from '@/components/shared/app-show-dialog';
import appDialogProducts from '@/components/shared/app-dialog-products';
import applyDiscountCoupon from '@/components/sales/apply-discount-coupon';
import appActions from '@/components/shared/app-actions';
import appInformationAdditional from '@/components/shared/sales/app-information-additional';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import customersForm from '@/components/customers/customers-form';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import Sales from '@/shared/sale';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import attributesAssignSlideQuotation from '@/components/attributes/attributes-assign-slide-quotation';
import additionalInformation from '@/components/quotation/additional-information';
import paymentInformation from '@/components/quotation/payment-information';
import billingInformation from '@/components/quotation/billing-information';
import modalItems from '@/components/shared/modal-items';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import customerResume from '@/components/shared/sales/customer-resume';
import headerPage from './../shared/header-page';
import headerSummary from './../shared/header-summary';
import generalFilter from './../shared/general-filter';
import appTable from './../shared/table/app-table';
import actionSidebar from './../shared/action-sidebar';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';
import appComments from './../shared/sales/app-coments';
import appConsiderations from './../shared/sales/app-considerations';
import appIssues from './../shared/sales/app-issues';

const Quotation = new Sales();
const { getDeeper, equality, round, updateItemInCollectionByIndex, isEmpty, find } = lib;
const Sale = new Sales();

const twoDecimals = round(2);
const fourDecimals = round(4);

function disableButton() {
	let state = false;
	if (this.action.code === 'NC') {
		state = this.customerError;
	}
	return state;
}

async function created() {
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	// const { cloneId } = this.$route.query;
	// const editId = this.$route.params.id;
	this.quotationId = this.cloneId || this.editId;
	Quotation.isEditing = !!this.quotationId;
	this.entryDate = helper.formatDate(new Date(), 'YYYY-MM-DD');
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	Quotation.user = this.$userInfo;
	this.salesCurrency = this.$userInfo.company.currency;
	this.defaultCurrency = this.$userInfo.company.currency;
	this.generalTaxes = helper.getLocalData('general-taxes') || [];
	this.generalTaxes = this.generalTaxes.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});
	const userCompanyData = this.$userInfo.company;
	const userCompanyKeys = Object.keys(userCompanyData);
	this.showProducts = this.$userInfo.company.settings.COTMoveKardex;
	const existFlagUpdatePrice = userCompanyKeys.find((k) => k === 'flagUpdatePrice');
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

	if (this.showColumnsDocuments) {
		this.columns[9].flagVisible = !this.showColumnsDocuments;
		this.columns[9].visible = this.showColumnsDocuments;
		this.columns[10].flagVisible = !this.showColumnsDocuments;
		this.columns[10].visible = this.showColumnsDocuments;
	}
	await this.loadData();
	this.basePrice = getDeeper(
		'company',
		'settings',
		'flagBasePriceDefault'
	)(this.$userInfo);
	this.actionSale = this.editId ? 'editar cotización' : 'nueva cotización';
	if (!helper.getLocalData('type-payments-global')) {
		await this.loadTypePayments();
	}
	if (!helper.getLocalData('type-document-global')) {
		await this.loadTypeDocuments();
	}

	const lstDocuments = helper.getLocalData('documents');
	const results = lstDocuments.find(({ comTypeDocumentId }) => comTypeDocumentId === 4);
	const op = results.additionalInformation
		? results.additionalInformation.aditionalInfo.salesTable.columns.meterage.operation
		: null;
	this.operationSign = op;
}

async function loadTypeDocuments() {
	try {
		const response = await this.$httpSales.get('type-documents-all', {
			params: { flagType: 1 },
		});
		this.typeDocuments = response.data;
		helper.setLocalData('type-document-global', this.typeDocuments);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTypePayments() {
	const params = { flagType: 1 };
	try {
		const response = await this.$httpSales.get('type-payments', { params });
		this.typePayment = response.data;
		this.typePayment = this.typePayment.map((p) => p.paymentType);
		helper.setLocalData('type-payments-global', this.typePayment);
	} catch (error) {
		this.showGenericError();
	}
}

function isEditing() {
	return !!this.editId;
}

function singleDiscount() {
	if (this.$userInfo.company.settings.singleDiscount) {
		return this.$userInfo.company.settings.singleDiscount;
	}
	return false;
}

function updateColumns(user, columns) {
	const taxLabel =
		user.company && user.company.country ? user.company.country.taxName : null;
	const flagImport = user.company.settings.flagImport;
	if (taxLabel) {
		return columns.map((c) => {
			const newCol = { ...c };
			if (c.value === 'quantityImport' || c.value === 'quantityAvailable') {
				newCol.checked = flagImport;
				newCol.visible = flagImport;
				newCol.flagVisible = !flagImport;
			}
			if (c.value === 'taxes') {
				newCol.name = `% ${taxLabel}`;
			}
			return newCol;
		});
	}
	return columns.map((c) => {
		const newCol = { ...c };
		if (c.value === 'quantityImport' || c.value === 'quantityAvailable') {
			newCol.checked = flagImport;
			newCol.visible = flagImport;
			newCol.flagVisible = !flagImport;
		}
		return newCol;
	});
}

function makeQuotationCommentary(row) {
	this.currentProduct = row;
	this.action = {
		active: true,
		code: 'COMME',
		open: true,
		title: row.name,
		width: 450,
	};
}

function setComentary(values) {
	const { commentary } = values;
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

async function loadData() {
	this.loadingGeneral = true;
	const params = {
		flagActive: 1,
		sortDirection: 'desc',
		sortField: 'flag_default',
	};
	const requests = [
		this.listPricingPromise(params),
		this.getCurrencies(),
		this.listOfUnits(),
	];
	if (this.quotationId) {
		requests.push(this.$httpSales.get(`sale-documents/${this.quotationId}`));
		requests.push(this.$httpSales.get('sales/states'));
	}
	try {
		const responses = await Promise.all(requests);
		[{ data: this.pricesList }, { data: this.currencies }, { data: this.units }] =
			responses;
		await this.loadTypeChange();
		this.currencies = this.currencyByCountry(this.currencies);
		let newData = this.validateLocalStorage();
		if (this.quotationId) {
			[, , , { data: this.quotation }] = responses;
			this.entryDate =
				helper.exactDate(this.quotation.expiratedAt, 'YYYY-MM-DD') ||
				helper.formatDate(new Date(), 'YYYY-MM-DD');
			this.state = this.quotation.state.id;
			if (this.quotation.details.length >= this.data.length) {
				newData = this.quotation.details.map((sd) => {
					const newSd = { ...sd };
					const unitIdRow = sd.product ? sd.product.unitId : sd.unitId;
					const unit = this.units.find((u) => u.id === unitIdRow) || {};
					const unitByProd = {
						id: sd.product ? sd.product.unitId : sd.unitId,
						code: sd.product ? sd.product.unitCode : unit.code,
						name: sd.product ? sd.product.unitName : sd.unitName,
					};
					newSd.aditionalInformation = {
						...sd.aditionalInformation,
						traceability:
							sd.aditionalInformation && sd.aditionalInformation.traceability
								? sd.aditionalInformation.traceability
								: { origin: this.$route.name },
					};
					newSd.parts =
						sd.aditionalInformation && sd.aditionalInformation.dynamicFields
							? sd.aditionalInformation.dynamicFields.parts
							: null;
					newSd.meterage =
						sd.aditionalInformation && sd.aditionalInformation.dynamicFields
							? sd.aditionalInformation.dynamicFields.meterage
							: null;
					// newSd.priceBaseToCalculate = this.basePrice;
					newSd.quantityOld = sd.product ? sd.product.stock : 0;
					const flagFree = newSd.flagFree;
					newSd.product.taxes = sd.product.taxes
						.map((tax) => {
							const newRowTax = { ...tax };
							newRowTax.idCodeReference = `${tax.code}${tax.percentage}`;
							return newRowTax;
						})
						.filter((tax) =>
							flagFree ? true : tax.code !== '05' || tax.name !== 'GRATUITO'
						);
					newSd.addProduct = true;
					newSd.location = sd.aditionalInformation
						? sd.aditionalInformation.location
						: '';
					newSd.autoBarcode = sd.product ? sd.product.autoBarcode : '';
					newSd.priceEdited = false;
					newSd.code = sd.product ? sd.product.code : '';
					newSd.name = sd.product ? sd.product.name : '';
					if (newSd.aditionalInformation?.descriptionProducts && sd.product.type === 8) {
						newSd.name = newSd.aditionalInformation.descriptionProducts;
					}
					newSd.description = sd.product ? sd.product.description : '';
					newSd.stock =
						sd.product && this.quotationId ? sd.product.warBrandStock : sd.product.stock;
					newSd.pricesListArray = this.setPricesListByProduct(
						this.pricesList,
						sd.product.priceList
					);
					newSd.priceList = sd.product ? sd.product.priceList : {};
					newSd.priceCost = sd.priceCost ? sd.priceCost : 0;
					newSd.product.price = sd.price || 0;
					newSd.salePrice = Sales.getPriceWithOutDiscount(newSd) || newSd.salePrice;
					newSd.units =
						sd.product && sd.product.conversions
							? this.unitsByProduct(sd.product)
							: [{ ...unitByProd }];
					newSd.unitConversion = sd.unitConversion;
					newSd.pricePerSaleOrigin =
						sd.discountPercentage > 0
							? Number(sd.unitPrice * `1.${sd.tax}`)
							: sd.salePrice;
					newSd.conversions =
						sd.product && sd.product.conversions
							? sd.product.conversions
							: [{ ...unitByProd }];
					newSd.pricePerSaleOrigin = newSd.salePrice;
					newSd.unitQuantity = sd.unitQuantity;
					// newSd.priceUnitary = sd.unitPrice;
					newSd.warehouseName = sd.warehouseName;
					newSd.priceSaleMin = sd.product ? sd.product.priceSaleMin : 0;
					newSd.priceSaleMax = sd.product ? sd.product.priceSaleMax : 0;
					return newSd;
				});
			}
			if (this.quotation.externalData && this.quotation.externalData.coupons) {
				this.selectedsCoupon = this.quotation.externalData.coupons.map((l) => {
					const newRow = { ...l };
					newRow.quantityCoupon = l.amount;
					newRow.numbDocuments = l.code;
					return newRow;
				});
				this.totalAMountCouponHeader = this.quotation.discountGlobal;
				this.informationSale.discountGlobal = this.quotation.discountGlobal;
				this.informationSale.showDiscount = !!this.quotation.discountGlobal;
			}
			this.status = responses[4].data.filter((s) => s.code === 'INI' || s.code === 'FIN');
			this.salTypeDocumentId = this.quotation.salTypeDocumentId;
			this.commentary = this.quotation.commentary;
			this.commentaryTemporal = this.quotation.commentary;
			this.dayImportTerm = this.quotation.dayImportTerm;
			this.considerations = this.quotation.considerations;
			this.workToDo = this.quotation.workToDo;
			this.salesCurrency = this.quotation.currency;
			this.customer = this.quotation.customer;
			this.customers = [this.quotation.customer];
			this.search = this.quotation.customer.autocomplete;
			this.documentNumber = this.quotation.customer.typePerson.documentNumber;
			this.onClean = false;
			if (this.quotation.dataClient) {
				const template = { ...this.quotation.dataClient.guideData };
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				this.additionalInformation = { ...objectOrder };
				Object.keys(this.additionalInformation).forEach((k) => {
					this.additionalInformation[k].value =
						this.quotation.dataClient.guideData[k].value;
					if (this.additionalInformation[k].type === 'select') {
						this.additionalInformation[k].items = [];
					}
				});
				const templatePayment = { ...this.quotation.dataClient.payment };
				const arrayTemplatePayment = Object.entries(templatePayment).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReversePayment = arrayTemplatePayment.reverse();
				const objectOrderPay = Object.fromEntries(arrayTemplateReversePayment);
				this.paymentInformation = { ...objectOrderPay };
				Object.keys(this.paymentInformation).forEach((k) => {
					this.paymentInformation[k].value = this.quotation.dataClient.payment[k].value;
					if (this.paymentInformation[k].type === 'select') {
						this.paymentInformation[k].items = [];
					}
				});
				this.urlVoucher = this.quotation.dataClient.urlVoucher;
				const templateFac = { ...this.quotation.dataClient.dataFac };
				const arrayTemplateFac = Object.entries(templateFac).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverseFac = arrayTemplateFac.reverse();
				const objectOrderFac = Object.fromEntries(arrayTemplateReverseFac);
				this.billingInformation = { ...objectOrderFac };
				Object.keys(this.billingInformation).forEach((k) => {
					this.billingInformation[k].value = this.quotation.dataClient.dataFac[k].value;
					if (this.billingInformation[k].type === 'select') {
						this.billingInformation[k].items = [];
					}
				});
			}
		}
		this.data = await Quotation.formattedProductsQuatation(
			newData,
			this.pricesList,
			this.generalTaxes,
			this.showImportFields,
			!!this.quotationId
		);
		this.columns[16].isEditable =
			!!this.$userInfo.company.settings.singleDiscount || false;
		this.actionSale = this.editId ? 'editar cotización' : 'nueva cotización';
		this.newProduct.product.pricesListArray = [...this.pricesList];
		this.exchangeRate = this.quotationId
			? this.quotation.exchangeRate
			: this.exchangeRate;
	} catch (error) {
		console.error(error);
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
	// this.newProduct.selectedPriceListId = Quotation.defaultPriceList.id;
}

function updatePriceList(index) {
	this.data = this.data.map((p, idx) => {
		const newP = { ...p };
		if (index === idx) {
			newP.discountPercentage = p.priceList[p.selectedPriceListId].discount;
			newP.pricePerSale = p.priceList[p.selectedPriceListId].price;
			newP.priceEdited = false;
		}
		return newP;
	});
}

function searching(val) {
	return this.searchValue(val, 1);
}

function searchingProducts(val) {
	return this.searchValue(val, 0);
}

async function searchValue(value, flag) {
	const searchTrim = value ? value.trim() : '';
	const autocomplete = flag
		? this.customer.autocomplete.trim()
		: this.newProduct.product.autocomplete.trim();
	const alreadySelected = searchTrim.toLowerCase() === autocomplete.toLowerCase();
	if (searchTrim && !alreadySelected) {
		this.loading = true;
		try {
			const service = flag
				? this.customerSelections(searchTrim)
				: this.productsSelections(searchTrim);
			const response = await service;
			const defaultCustomer = {
				autocomplete: '',
				typePerson: {},
			};
			if (flag) {
				this.customers = [...response.data];
				if (this.customers.length === 1) {
					this.customer = this.customers[0];
					this.search = null;
				} else if (this.customers.length > 1) {
					this.customer = this.customers.find(
						(c) => c.autocomplete.trim().toLowerCase() === searchTrim.toLowerCase()
					) || { ...defaultCustomer };
					this.search = null;
				} else {
					this.customer = { ...defaultCustomer };
				}
			} else {
				this.products = response.data.map((prod) => {
					const newProd = { ...prod };
					newProd.autoBarcode = prod.product.autoBarcode;
					newProd.categoryName = prod.product.category.name;
					newProd.code = prod.product.code;
					newProd.description = prod.product.description;
					newProd.name = prod.product.name;
					newProd.priceCost = prod.priceCost || 0;
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

function callServiceAndSearch(value) {
	this.searchData = value;
	if (value) {
		this.params.search = value;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
}

function document() {
	if (this.quotationId && this.customer.typePerson) {
		return this.customer.typePerson.documentNumber;
	}
	let customerDocument = null;
	if (this.customer) {
		customerDocument = this.customer.dni || this.customer.ruc;
	}
	return customerDocument;
}

async function addProduct() {
	// const showStockNegative = this.$userInfo.company.settings.stockNegative;
	// const flagTaxesIgvTemporary = this.$userInfo.company.settings.flagTaxesIgvTemporary;
	// if (
	// 	this.newProduct.quantity > this.newProduct.product.stock &&
	// 	this.newProduct.product.type !== 2 &&
	// 	this.newProduct.product.type !== 6 &&
	// 	!showStockNegative
	// ) {
	// 	this.dialogStock = true;
	// 	this.titleHeaderDialog = 'AGREGAR PRODUCTO';
	// 	this.textDialogStock = `El producto no cuenta con suficiente STOCK para agregar ${this.newProduct.quantity}, su stock ACTUAL es: ${this.newProduct.product.stock}`;
	const validProduct = this.data.find(
		(p) => p.warProductsId === this.newProduct.product.productId
	);

	// ---Comparacion de ids para que no se repita el producto en la tabla---
	// - En cada fila en el editar y crear tienen estructuras diferentes
	// pero pero ambas tienen en comun la ubicacion del id a comparar
	// data[0].product.id

	// - Para el producto que se vaya añadir la ubicacion del id a comparar es:
	// this.newProduct.product.productId

	const sameConfigProduct = this.data.some((prod) => {
		const warehouseIdDetail = this.isEditing ? prod.warWarehousesId : prod.warehouseId;
		const sameId = prod.product.id === this.newProduct.product.productId;
		const sameUnit = prod.unitId === this.newProduct.product.unitId;
		const sameFlagFree = Boolean(prod.flagFree) === Boolean(this.newProduct.flagFree);
		const sameWarehouse = warehouseIdDetail === this.newProduct.product.warehouseId;
		// mismo producto, el mismo almacen con la misma unidad con mismo valor del flag free
		return sameId && sameUnit && sameFlagFree && sameWarehouse;
	});
	const validAddProduct =
		this.showColumnsDocuments &&
		validProduct &&
		validProduct.parts > 0 &&
		validProduct.meterage > 0
			? true
			: !sameConfigProduct;
	if (validAddProduct) {
		this.newProduct.showBrand =
			this.$userInfo.company.settings.flagUseSimpleBrand || false;
		const transformedProduct = await Sales.addProducts(
			this.newProduct,
			this.generalTaxes,
			this.$userInfo,
			this.showImportFields,
			true,
			Quotation.isEditing,
			this.customer,
			this.isPeru,
			this.defaultCurrency,
			this.salesCurrency,
			this.exchangeRate
		);
		transformedProduct.traceability = { origin: this.$route.name };
		this.data.push(transformedProduct);
		this.data = this.data.map((d, indexData) => {
			const newData = { ...d };
			newData.pricePerSale = d.pricePerSale;
			newData.order = indexData + 1;
			return newData;
		});
	} else {
		const validNotification = this.showColumnsDocuments
			? 'El producto ya se encuentra agregado, debe configurar PIEZA y MEDIDA.'
			: `El producto ya se encuentra agregado con la unidad: ${this.newProduct.product.unitName}`;
		this.showNotification(validNotification, 'success');
	}
	helper.setLocalData('products-selected', this.data);
	this.newProduct.product = {
		autocomplete: '',
		pricesListArray: [...this.pricesList],
	};
	this.newProduct.quantity = 0;
	// this.getPriceListId(this.customer);
	this.products = [];
	this.selectedProduct = '';
	setTimeout(() => {
		this.$refs.productSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
	}, 300);
}

function changePage(page) {
	this.currentPage = page;
}

function rowIsSelected(row) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.data, this.dataSelected));
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

function negative() {
	const isNegative = this.data.some((d) => d.quantityNegative || d.priceNegative);
	if (isNegative) {
		this.showNotification('No debe haber valores negativos', 'error');
	}
	return isNegative;
}

function calcular(x, y, operationSign) {
	if (operationSign === '+') {
		return Number(x) + Number(y);
	} else if (operationSign === '-') {
		return x - y;
	} else if (operationSign === '*') {
		return x * y;
	} else if (operationSign === '/') {
		return x / y;
	}
	return x * y;
}

function setDynamic(product, value, index, model) {
	const type = product.type;
	const showStockConfigure = this.$userInfo.company.settings.COTMoveKardex;
	if (model === 'parts') {
		this.data[index].parts = value;
	} else {
		this.data[index].meterage = value;
	}
	if (this.data[index].meterage === 0 && this.operationSign === '/') {
		this.dialogStockRow = true;
		this.titleHeaderDialogRow = 'ERROR EN EL CÁLCULO';
		this.textDialogStockRow = 'Los campos de pieza y medida no deben ser divido por 0';
		this.data[index].meterage = 1;
	}
	const resultado = calcular(
		this.data[index].parts,
		this.data[index].meterage,
		this.operationSign
	);
	const quantityResult = twoDecimals(resultado);
	this.quantityValidation(product, quantityResult, index);
	if (quantityResult > this.data[index].stock && showStockConfigure && type === 1) {
		// Las piesas y medidas se actualizan a 0 si su producto da una cantidad mayor al stock
		setTimeout(() => {
			this.data[index].parts = 0;
			this.data[index].meterage = 0;
		}, 100);
	}
}

function quantityValidation(product, quantity, index) {
	const showStockConfigure = this.$userInfo.company.settings.COTMoveKardex;
	const { warBrandStock } = product.product;
	const stockWar = product.quantityOld + (warBrandStock || 0) - product.quantityDispatch;

	// if (quantity > product.stock && showStockConfigure && product.addProduct) {
	// 	this.objProduct = product;
	// 	this.indexRow = index;
	// 	this.quantityRow = product.stock;
	// 	this.dialogStockRow = true;
	// 	this.titleHeaderDialogRow = 'AGREGAR STOCK';
	// 	this.textDialogStockRow = `El producto no cuenta con suficiente STOCK para agregar ${quantity}, su stock ACTUAL es: ${product.stock}`;
	if (this.isEditing && quantity <= 0 && showStockConfigure && product.id) {
		this.objProduct = product;
		this.indexRow = index;
		this.quantityRow = stockWar || 0;
		this.dialogStockRow = true;
		this.titleHeaderDialogRow = 'AGREGAR STOCK';
		this.textDialogStockRow = `El producto no cuenta con suficiente STOCK para agregar ${quantity}, su stock ACTUAL es: ${stockWar}`;
	} else {
		// this.data[index].idProductUnit = `${index}${product.id}`;
		this.data = Quotation.quantityValidationQuatation(
			product,
			quantity,
			this.data,
			index,
			true
		);
	}
}

function priceAmounts() {
	const exist = this.isEditing || this.isCloning;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.price = Sales.getProductPrice(
			d,
			this.defaultCurrency,
			this.salesCurrency,
			this.exchangeRate,
			exist
		);
		newD.salePrice = newD.price;
		return newD;
	});
	this.data = Quotation.priceAmountsQuatation(
		this.data,
		this.salesCurrency,
		this.exchangeRate
	);
	return Quotation.getAmountsQuoation(
		this.data,
		this.defaultCurrency,
		this.totalAMountCouponHeader
	);
}

function cancelQuotation() {
	this.data = {};
	this.goTo('quotations-list');
	helper.removeLocalData('products-selected');
}

async function deleteQuotation() {
	try {
		this.disabledModal = true;
		this.isLoading = true;
		this.disabledDelete = true;
		await this.$httpSales.delete(`sale-documents/${this.quotationId}`);
		this.showNotification('Se anulo la cotización correctamente.');
		this.goTo('quotations-list');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'CUSTOMER_GENERIC_NOT_FOUND') {
				this.showNotification(
					'No se puede agregar un cupon con un cliente generico',
					'error'
				);
			} else if (error.data.message === 'SALE_CONVERT_ERROR') {
				this.showNotification(
					'La cotizacion fue convertida a venta con un cupon relacionado, no se puede generar otra venta con descuento de cupón',
					'error'
				);
			} else if (error.data.message === 'AMOUNT_EXCEEDS_COUPON') {
				this.showNotification(
					'El monto aplicado en los cupones supera al total de la cotización',
					'error'
				);
			} else if (error.data.message === 'SALES_RELATED_NOT_DELETE') {
				this.showNotification(
					'La cotización no puede ser anulada porque cuenta con ventas relacionadas',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
		this.disabledDelete = false;
		this.isLoading = false;
		this.disabledModal = false;
	} finally {
		this.disabledDelete = false;
		this.isLoading = false;
		this.disabledModal = false;
	}
}

async function sendQuotation() {
	this.disabledDelete = true;
	const validateZero = this.data.some((e) => e.quantity === 0);
	if (validateZero) {
		this.showGenericError(
			'No se puede generar una cotización, con la cantidad de los productos en 0'
		);
		return;
	}
	if (this.isEditing && this.quotation.convertStatus.id !== 1) {
		this.textContentCot =
			'No se puede editar la cotización, si se encuentra parcialmente convertida o convertida totalmente.';
		this.showValidatedCot = true;
	} else {
		this.isLoading = true;
		const urlPatch = `/sale-documents-quotation/${this.quotationId}`;
		const urlPost = '/sale-documents/COT/type-document';
		const url = this.isEditing ? urlPatch : urlPost;
		const message = this.isEditing ? 'Cotización actualizada' : 'Cotización creada';
		const method = this.isEditing ? 'patch' : 'post';
		const productsQuotation = this.data.map((product) => {
			const newProduct = { ...product };
			if (product.product) {
				newProduct.taxCostPercentage = this.quotationId
					? product.taxCostPercentage
					: product.product.taxCostPercentage;
				newProduct.totalCost = this.quotationId
					? product.totalCost || product.priceCost
					: product.product.totalCost || product.priceCost;
			}
			delete newProduct.flagControlSerie;
			return newProduct;
		});
		const flagTaxesIgvTemporary = this.$userInfo.company.settings.flagTaxesIgvTemporary;
		const warehouse = this.$userInfo.warehouse;
		const body = Quotation.data({
			flagFree: true,
			isPeru: this.isPeru,
			totalAmountCoupon: this.totalAMountCouponHeader,
			products: [...productsQuotation],
			customer: this.customer,
			dayImportTerm: this.dayImportTerm,
			exchangeRate: this.exchangeRate,
			quotationId: this.editId,
			typeSale: 'quotation',
			commentary: this.commentary,
			salTypeDocumentId: this.salTypeDocumentId,
			workToDo: this.workToDo,
			considerations: this.considerations,
			discount: 0,
			state: this.state,
			currency: this.salesCurrency,
			defaultCurrency: this.defaultCurrency,
			showImportFields: this.showImportFields,
			notPoint: true,
			show10: flagTaxesIgvTemporary,
		});
		body.expiratedAt = this.entryDate;
		body.flagDispatch = this.reserveStock;
		if (this.isEditing) {
			// PARA EDICION, SI EL ESTADO DE KARDEX ES IGUAL A 4 SE MANDA COMO FALSE, EN EL RESTO DE CASOS COMO TRUE
			body.flagDispatch = this.quotation.sendKardexStatus !== 4;
		}
		body.discountGlobal = this.totalAMountCouponHeader;
		body.externalData = {
			purchaseOrder: this.informationSale.amountOrder || undefined,
			extCompanyCode: this.informationSale.extCompanyCode || undefined,
			coupons:
				this.selectedsCoupon.map((coupon) => {
					const newRow = {};
					newRow.id = coupon.id;
					newRow.code = coupon.numbDocuments;
					newRow.amount = coupon.quantityCoupon;
					return newRow;
				}) || undefined,
		};
		if (!this.isEditing) {
			body.dateOnline = this.dateOnline;
		}
		body.dataClient = {
			quotation: {
				customer: {
					addressId: this.customer.selectAddressId || undefined,
					address: this.customer.selectAddress || this.customer.address,
					customerId: this.customer.id,
					fullName: this.customer.typePerson ? this.customer.typePerson.fullName : '',
					documentName: this.customer.msTypePerson ? this.customer.msTypePerson.name : '',
					documentCode: this.customer.msTypePerson ? this.customer.msTypePerson.code : '',
					documentNumber: this.customer.msTypePerson
						? this.customer.msTypePerson.documentNumber
						: '',
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
		if (Object.keys(this.additionalInformation).length) {
			const newAdditionalInformation = { ...this.additionalInformation };
			Object.keys(newAdditionalInformation).forEach((k) => {
				if (newAdditionalInformation[k].type === 'select') {
					delete newAdditionalInformation[k].items;
				}
			});
			const newPaymentInformation = { ...this.paymentInformation };
			Object.keys(newPaymentInformation).forEach((k) => {
				if (newPaymentInformation[k].type === 'select') {
					delete newPaymentInformation[k].items;
				}
			});
			const newBillingInformation = { ...this.billingInformation };
			Object.keys(newBillingInformation).forEach((k) => {
				if (newBillingInformation[k].type === 'select') {
					delete newBillingInformation[k].items;
				}
			});
			body.dataClient = {
				urlVoucher: this.urlVoucher,
				guideData: { ...newAdditionalInformation },
				payment: { ...newPaymentInformation },
				dataFac: { ...newBillingInformation },
			};
		}
		delete body.change;
		try {
			await this.$httpSales[method](url, body);
			this.showNotification(message);
			this.selectedsCoupon = [];
			if (this.exchangeRatePrimary !== this.exchangeRate) {
				this.changeExchangeRate();
			}
			helper.removeLocalData('products-selected');
			this.goTo('quotations-list');
		} catch (error) {
			if (error.status === 500) {
				this.showGenericError();
			} else if (error.status === 400) {
				if (error.data.message === 'SALE_DUPLICATE_ERROR') {
					this.showGenericError('La venta ya ha sido registrada');
				} else if (error.data.message === 'MUST_SEND_SERIES') {
					this.showGenericError(
						'Uno de los productos tiene habilitada el uso  de SERIES pero no está definida'
					);
				} else if (error.data.message === 'STOCK_NO_AVAILABLE') {
					this.dialogStockNegative = true;
					this.productsStockNegative = error.data.details;
					this.textDialogStockNegative =
						error.data.messageError ||
						'No se puede realizar la venta porque se excede la cantidad en uno o más productos.';
				} else if (error.data.message === 'SALE_CONVERT_ERROR') {
					this.showDialogCoupon = true;
					this.showDialogCouponText = error.data.messageError;
				} else if (error.data.message === 'CUSTOMER_GENERIC_NOT_FOUND') {
					this.showDialogCoupon = true;
					this.showDialogCouponText =
						'No se puede realizar una cotización y agregar un cupón sobre un cliente generico';
				} else if (error.data.message === 'COUPONS_NOT_FOUND') {
					this.showDialogCoupon = true;
					this.showDialogCouponText =
						'El cupón que se esta aplicando ya fue realizado o no tiene relación con el cliente';
				} else if (error.data.message === 'COUPONS_NOT_FOUND') {
					this.showDialogCoupon = true;
					this.showDialogCouponText =
						'No se puede generar una cotización, ya que el monto del cupón supera al total de la cotización';
				} else if (error.data.message === 'LIMIT_PRICE_ERROR') {
					this.textValid = error.data.messageError;
					this.productsValid = error.data.details;
					this.dialogNotStock = true;
				} else {
					this.showGenericError(error.data.messageError);
				}
			}
			this.disabledDelete = false;
		} finally {
			this.isLoading = false;
			this.disabledDelete = false;
		}
	}
}

function warningModal(item, index) {
	this.productToRemove = item;
	this.indexToRemove = index;
	this.removeProduct = true;
}

async function removeItem() {
	// const product = this.productToRemove;
	const index = this.indexToRemove;
	if (index === -1) return;
	this.data.splice(index, 1);
	this.data = this.data.map((d, indexData) => {
		const newData = { ...d };
		newData.order = indexData + 1;
		return newData;
	});
	helper.setLocalData('products-selected', this.data);
	this.showNotification('Producto eliminado de la cotización');
	this.removeProduct = false;
	this.indexToRemove = -1;
}

function validations() {
	return {
		customer: {
			required,
		},
		data: {
			required,
		},
		entryDate: {
			type: required,
		},
		exchangeRate: {
			type: required,
		},
	};
}

function updateNewProduct() {
	this.newProduct.selectedPriceListId = Quotation.defaultPriceList.id;
	this.newProduct.product.pricesListArray = Quotation.pricesListByProduct(
		this.newProduct.product
	);
}

function saveData() {
	if (this.action.code === 'NC') {
		this.newCustomerRegister = false;
	} else if (this.action.code === 'AC') {
		this.newConsideration = false;
	} else if (this.action.code === 'AI') {
		this.newIssue = false;
	} else if (this.action.code === 'AD') {
		this.newComments = false;
		this.commentary = this.commentaryTemporal;
		this.closeModal();
	}
}

function closeModal() {
	if (this.action.code === 'AI') {
		this.newIssue = false;
	} else if (this.action.code === 'AC') {
		this.newConsideration = false;
	} else if (this.action.code === 'AD') {
		if (!this.commentary) {
			this.commentaryTemporal = '';
		}
		this.newComments = false;
	} else if (this.action.code === 'product-search') {
		this.searchVal = null;
	} else if (this.action.code === 'generate-coupon') {
		this.totalAMountCoupon = 0;
	}
	this.action = { ...this.actionDefault };
}

function openSliderModal(code, title = '', width = 500) {
	this.action = {
		active: true,
		code,
		open: true,
		title,
		width,
	};
	if (code === 'NC') {
		this.newCustomerRegister = true;
		this.action.width = 600;
	} else if (code === 'AC') {
		this.newConsideration = true;
	} else if (code === 'AI') {
		this.newIssue = true;
	} else if (code === 'AD') {
		this.newComments = true;
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

function stopClick() {
	return false;
}

function toogleColumns() {
	return true;
}

function setComments({ value }) {
	this.commentaryTemporal = value;
}

function addComments(value) {
	this.commentaryTemporal = value;
}

function salesCurrencySymbol() {
	if (this.currencies.length > 0) {
		return this.currencies.find((c) => c.code === this.salesCurrency).symbol;
	}
	return false;
}

function validateExchangeRate(value) {
	const oldExchangeRate = this.exchangeRate;
	let newValue = Number(value);
	if (newValue < 1) {
		newValue = 1;
	}
	this.exchangeRate = newValue;
	this.recalculatePrices(this.salesCurrency, oldExchangeRate);
}

function editPriceUnitary(product, index, { value }) {
	this.data = Sales.editPriceUnitary(product, Number(value), this.data, index);
	if (this.data[index].pricePerSale < this.data[index].priceSaleMin) {
		this.showPriceSale = true;
		this.showMaxProduct = false;
		this.idRow = this.data[index].id;
		const priceMinSale = this.data[index].priceSaleMin;
		this.textModal = `Para poder realizar la cotización el precio de venta debe tener como minimo de ${priceMinSale}`;
	}
	if (index) {
		this.disabledFunMaxProduct(this.data[index].priceSaleMax, Number(value), product);
	} else {
		this.disabledFunMaxProduct(
			product.priceSaleMax,
			this.data[index].pricePerSale,
			product
		);
	}
}

function editPricePerSale(product, index, newPrice) {
	this.data = Sales.editPricePerSale(product, newPrice, this.data, index, true);
	if (Number(newPrice) < product.priceSaleMin) {
		this.showPriceSale = true;
		this.idRow = product.id;
		this.showMaxProduct = false;
		this.textModal = `Para poder realizar la cotización el precio de venta debe tener como minimo de ${product.priceSaleMin}`;
	}
	if (index) {
		this.disabledFunMaxProduct(this.data[index].priceSaleMax, newPrice, product);
	} else {
		this.disabledFunMaxProduct(product.priceSaleMax, newPrice, product);
	}
}

function closeDialogModal() {
	const index = this.data.findIndex((p) => p.id === this.idRow);
	const rowProduct = this.data.find((p) => p.id === this.idRow);
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
	this.showPriceSale = false;
}

function disabledFunMaxProduct(maxPrice, pricePerSale, product) {
	if (maxPrice > 0) {
		if (maxPrice < pricePerSale || 0) {
			this.idRow = product.id;
			this.showMaxProduct = true;
			this.showPriceSale = true;
			this.textModal = `La precio maximo por producto para realizar una cotización es ${maxPrice}`;
		}
	}
}

function setData(model, value, row, flagUnitChanged, index) {
	const findRow = this.data.some(
		(p) =>
			p.unitId === value.id &&
			p.warProductsId === row.warProductsId &&
			Boolean(p.flagFree) === Boolean(row.flagFree)
	);
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
	const newRow = Quotation.updateByUnitChangeQuotation(
		model,
		value,
		row,
		flagUnitChanged
	);
	// const matchProperty = newRow.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
	if (flagUnitChanged) {
		this.data = updateItemInCollectionByIndex(index, newRow, this.data);
		return false;
	}
	return newRow;
}

function editDiscount(product, index, value) {
	const range = Number(value) >= 0 && Number(value) < 100;
	if (value === '' || !range) {
		this.data[index].discountPercentage = 0;

		this.showGenericError(
			'Descuento incorrecto: El valor ingresado no es correcto. El rango del descuento debe estar entre 0 y 100.',
			'editDiscount'
		);
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

	const valueDecimal = value.toString()?.split('.')?.[1];
	this.isDisabledPrice = valueDecimal && valueDecimal.length > 4;
	if (valueDecimal && valueDecimal.length > 4) {
		this.showGenericError(
			'Descuento incorrecto: Excede la cantidad de decimales, debe ser como máximo 4 decimales'
		);
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

	if (this.data[index].pricePerSale < this.data[index].priceSaleMin) {
		this.showPriceSale = true;
		this.showMaxProduct = false;
		this.idRow = this.data[index].id;
		const priceMinSale = this.data[index].priceSaleMin;
		this.textModal = `Para poder realizar la cotización el precio de venta debe tener como minimo de ${priceMinSale}`;
	}
	this.disabledFunMaxProduct(
		this.data[index].priceSaleMax,
		this.data[index].pricePerSale
	);
}

function getTaxByCountry(user) {
	return user.company && user.company.country ? user.company.country.taxName : null;
}

function resumeTaxes() {
	const amounts = this.priceAmounts;
	return Quotation.getTotalTaxesAmounts(amounts, this.data);
}

function getPriceListId({ id, salPriceListId }) {
	const priceListCustomer = salPriceListId;
	const listByCustomer = id
		? this.newProduct.product.pricesListArray.find((pl) => pl.comCustomersId === id) || {}
		: {};
	const listByEmployee =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.comEmployeeId === this.$userInfo.id
		) || {};
	const listByWarhouse =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.warWarehousesId === this.$userInfo.warWarehousesId
		) || {};
	const listDefault = Quotation.defaultPriceList.id;
	const priceListId =
		priceListCustomer ||
		listByCustomer.id ||
		listByEmployee.id ||
		listByWarhouse.id ||
		listDefault;
	this.setPriceList({ id: priceListId });
}

function setPriceList(list) {
	if (list && list.id) {
		this.newProduct.selectedPriceListId = list.id;
		if (this.data.length > 0) {
			this.changePriceByList(list.id);
		}
	}
}

function changePriceByList(listId) {
	this.data = this.data.map((d) => {
		const newD = { ...d };
		if (this.newProduct.product.id === d.id) {
			newD.selectedPriceListId = listId;
		}
		// newD.priceEdited = true;
		return newD;
	});
}

function validateLocalStorage() {
	let newData = [];

	if (helper.getLocalData('products-selected')) {
		const localProducts = [...helper.getLocalData('products-selected')];
		newData = localProducts.map((lp) => {
			const newProd = { ...lp };
			const unit = this.units.find((u) => u.id === lp.unitId) || {};
			const unitByProd = {
				id: lp.unitId,
				code: lp.unitCode || unit.code,
				name: lp.unitName,
			};
			const quantity = lp.quantity || 1;
			newProd.isQuotation = true;
			newProd.priceBaseToCalculate = this.basePrice;
			newProd.addProduct = true;
			newProd.priceCost = lp.priceCost ? lp.priceCost : 0;
			newProd.discountPercentage = lp.discountPercentage || 0;
			newProd.discount = lp.discountPercentage
				? this.roundInNumber(lp.price * quantity * (Number(lp.discountPercentage) / 100))
				: 0;
			newProd.units = lp.conversions ? this.unitsByProduct(lp) : [{ ...unitByProd }];
			newProd.salePrice = Sales.getPriceWithOutDiscount(lp);
			newProd.unitConversion = 1;
			newProd.product.taxes = lp.product.taxes.map((tax) => {
				const newRow = { ...tax };
				newRow.idCodeReference = `${tax.code}${tax.percentage}`;
				return newRow;
			});
			newProd.pricePerSaleOrigin =
				lp.discountPercentage > 0 ? Number(lp.unitPrice * `1.${lp.tax}`) : lp.salePrice;
			newProd.unitQuantity = quantity;
			if (this.showImportFields) {
				if (newProd.stock <= 0) {
					newProd.quantityAvailable = 0;
					newProd.quantityImport = quantity;
				} else if (newProd.stock > 0 && newProd.stock <= quantity) {
					newProd.quantityAvailable = newProd.stock;
					newProd.quantityImport = quantity - newProd.stock;
				} else {
					newProd.quantityAvailable = quantity;
					newProd.quantityImport = 0;
				}
			}
			return newProd;
		});
	}
	return newData;
}

function unitsByProduct(item) {
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

	return newUnits;
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	if (this.searchVal) {
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 930;
		this.action.open = true;
	}
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function setProduct(prod, flag) {
	const newProd = { ...prod };

	// Asignando un valor a la propiedad 'units' de manera reactiva
	newProd.units = prod.product.conversions
		? this.unitsByProduct(prod.product)
		: [{ ...prod.product.unit }];

	// Reemplazar 'newProduct.product' con una nueva copia del objeto
	if (flag === 'free') {
		newProd.priceList = this.priceListProdFree(prod.priceList);
		newProd.product.priceList = this.priceListProdFree(prod.product.priceList);
	}
	this.newProduct.product = { ...newProd };

	// Usando $set para asegurar la reactividad al modificar 'taxes'
	this.$set(
		this.newProduct.product.product,
		'taxes',
		newProd.product.taxes
			.map((tax) => {
				const newRowTax = { ...tax };
				newRowTax.idCodeReference = `${tax.code}${tax.percentage}`;
				return newRowTax;
			})
			.filter((tax) => flag === 'free' || tax.code !== '05' || tax.name !== 'GRATUITO')
	);

	// Modificando la lista de precios de manera reactiva
	this.newProduct.product.pricesListArray = this.setPricesListByProduct(
		this.pricesList,
		newProd.priceList
	);

	this.newProduct.flagFree = flag === 'free';
	const defaultListPrice = this.pricesList.find((p) => p.flagDefault === 1);
	const priceListFind = this.newProduct.product.pricesListArray.find(
		(p) => p.id === this.newProduct.selectedPriceListId
	);
	const listDefault =
		Sale.defaultPriceList && Sale.defaultPriceList.id
			? Sale.defaultPriceList.id
			: this.$userInfo.salPriceList.id;
	const priceListId =
		(priceListFind && priceListFind.id) || defaultListPrice.id || listDefault;
	this.setPriceList({ id: priceListId });

	// Actualizando el valor de 'selectedProduct'
	this.selectedProduct = `${newProd.name} - Stock: ${newProd.stock}`;

	// Cerrar el modal (suponiendo que esta función existe en tu contexto)
	this.closeModal();

	// Focando en el campo de cantidad con un pequeño retraso
	setTimeout(() => {
		this.$refs.productQuantity.$el.children[1].children[0].focus();
	}, 1);
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

function getWarehouseName(row) {
	return getDeeper('warehouseName')(row);
}

function customerRegisterSelected() {
	return this.action.code === 'NC';
}

async function saveCustomer(customer) {
	this.loadingCustomer = true;
	const url = this.id ? `customers/${this.id}` : 'customers';
	const method = this.id ? 'patch' : 'post';
	const {
		address,
		civilStatus,
		contact,
		email,
		flagTypePerson,
		gender,
		phone,
		phoneNumbers,
		name,
		lastname,
		dni,
		ruc,
		rzSocial,
	} = customer;
	const body = {
		accountAdvanceAccount: null,
		accountingCode: null,
		address,
		cityId: null,
		civilStatus,
		contact,
		countryId: null,
		creditLimitDays: null,
		customerType: null,
		dateBirth: null,
		email,
		flagAccounting: null,
		flagDetraction: null,
		flagExemptTaxes: null,
		flagItemsWithoutRetainer: null,
		flagPostDatedCredit: null,
		flagRelatedCustomer: null,
		flagRetentionAgent: null,
		flagSpecialContributor: null,
		flagTypePerson,
		gender,
		geoPosition: null,
		latitude: null,
		limitAmountCredit: null,
		longitude: null,
		originIncomeId: null,
		parishId: null,
		paymentMethodId: null,
		phone,
		phoneNumbers,
		postalCode: null,
		provinceId: null,
		typeDestinationId: null,
		zone: null,
	};
	if (customer.dni) {
		body.name = name;
		body.lastname = lastname;
		body.dni = dni;
	} else {
		body.rzSocial = rzSocial;
		body.ruc = ruc;
	}
	try {
		const { data: response } = await this.$httpSales[method](url, body);
		this.showNotification('El cliente ha sido creado correctamente');
		this.selectThisCustomer(response);
	} catch (err) {
		if (err.data.message === 'CUSTOMER_EXIST_ERROR') {
			this.showNotification('El cliente ya está registrado', 'warning');
		} else {
			this.showGenericError();
		}
	} finally {
		this.loadingCustomer = false;
	}
}

function selectThisCustomer(customer) {
	this.closeModal();
	this.customers = [{ ...customer }];
	this.customer = { ...customer };
	this.search = customer.autocomplete;
}

function blockedCustomer() {
	return this.customer.flagActive === 0;
}

function validatedProductPriceSale() {
	return this.data.every((p) => p.price > p.priceSaleMax || 0);
}

function validatedMinProduct() {
	return this.data.every((p) => p.price < p.priceSaleMin || 0);
}

function setCustomer(customer) {
	if (customer) {
		this.customer = { ...customer };
		this.getPriceListId(customer);
		if (customer.flagActive === 0) {
			this.showNotification(
				'El cliente se encuentra bloqueado, no se pude continuar con la venta.',
				'warning'
			);
		}
	}
}

function validateOnInput(val) {
	const valid = /^[0-9]+$/;
	if (!valid.test(val)) {
		this.invalidValue = true;
		this.showGenericError('Debe ingresar un número igual o mayor a cero (0)');
	}
	this.invalidValue = !valid.test(val);
}

function quantityAvailableValidation(row, value) {
	const { quantity } = row;
	const newValue =
		Number(quantity) >= Number(value) ? Number(quantity) - Number(value) : 0;
	const newAvailable = Number(value) > 0 ? Number(value) : 0;
	this.$set(row, 'quantityAvailable', newAvailable);
	this.$set(row, 'quantityImport', newValue);
	if (Number(value) < 0) {
		this.showGenericError('No se permiten valores negativos.');
	}
}

function quantityImportValidation(row, value) {
	const newVal = Number(value) > 0 ? Number(value) : 0;
	this.$set(row, 'quantityImport', newVal);
	if (Number(value) < 0) {
		this.showGenericError('No se permiten valores negativos.');
	}
}

function showImportFields() {
	return this.$userInfo.company.settings.flagImport;
}

async function changeExchangeRate() {
	const body = { amount: this.exchangeRate };
	await this.$httpSales.post('exchange-rates', body);
}

function changeCurrency(value) {
	const oldCurrency = this.salesCurrency;
	this.salesCurrency = value;
	this.recalculatePrices(oldCurrency, this.exchangeRate);
}

function openAttributesSlides(product, index) {
	this.subsidiaryId = this.$userInfo.comSubsidiariesId;
	this.productToAssingAttrs = { ...product };
	this.productToAssingAttrsIndex = index;
	this.action = {
		active: true,
		code: 'assigning-attrs',
		open: true,
		width: 500,
		title: 'Asignar atributos',
	};
}

function assigningAttributesAction() {
	return this.action.code === 'assigning-attrs';
}

function addAttributesTo(attrs) {
	const attributes = {
		attributes: attrs,
	};
	this.$set(
		this.data[this.productToAssingAttrsIndex],
		'additionalInformation',
		attributes
	);
	this.$set(this.data[this.productToAssingAttrsIndex], 'isEditingAttrs', true);
	this.productToAssingAttrsIndex = null;
	this.productToAssingAttrs = null;
	this.closeModal();
}

function saveDataForm(dataForm) {
	this.closeModal();
	this.additionalInformation = { ...dataForm };
}

function saveDataBilling(dataForm) {
	this.closeModal();
	this.billingInformation = { ...dataForm };
}

function saveDataPayment(dataPayment, urlImage) {
	this.closeModal();
	this.paymentInformation = { ...dataPayment };
	this.urlVoucher = urlImage;
}

function closeDialogStock() {
	this.dialogStock = false;
	if (this.newProduct.product.stock < 0) {
		this.newProduct.quantity = 0;
	} else {
		this.newProduct.quantity = this.newProduct.product.stock;
	}
	// this.newProduct.quantity = this.newProduct.product.stock;
}

function closeDialogStockRow() {
	this.dialogStockRow = false;
	this.data = Quotation.quantityValidation(this.objProduct, this.quantityRow, this.data);
	this.data[this.indexRow].quantity = this.quantityRow;
}

function closeDialogStockNegative() {
	this.dialogStockNegative = false;
}

function runAction({ code }) {
	if (code === 'generate-coupon') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = `CUPÓN - ${this.customer.rzSocial || this.customer.name}`;
		this.action.width = 650;
		this.loadDiscount();
	}
}

async function loadDiscount() {
	const params = {
		customerId: this.customer.id,
		status: 1,
		code: this.paramsApply.search || undefined,
		limit: 20,
		flagActive: this.paramsApply.search ? undefined : 1,
	};
	try {
		const response = await this.$httpSales.get('customers-benefit/1', {
			params,
		});
		this.rowsCoupons = response.data.map((p) => {
			const newRow = { ...p };
			newRow.isSelected = false;
			newRow.quantityCoupon = null;
			newRow.amountAvaible = p.amount - p.dueAmount;
			newRow.disabled = !(newRow.amountAvaible > 0);
			newRow.disabledRowApply = !(newRow.amountAvaible > 0);
			return newRow;
		});
		if (this.selectedsCoupon.length) {
			this.totalAMountCoupon = this.totalAMountCouponHeader;
			this.rowsCoupons = this.rowsCoupons.map((l) => {
				const newRow = { ...l };
				const rowExist = this.selectedsCoupon.find((p) => p.id === l.id);
				if (rowExist) {
					newRow.quantityCoupon = rowExist.quantityCoupon;
					newRow.isSelected = true;
					newRow.disabled = false;
				}
				return newRow;
			});
			this.dataSelectedCoupons = this.rowsCoupons;
		}
		this.lastPageCoupon = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(search) {
	this.paramsApply.search = search;
	this.loadDiscount();
}

function saveApplyCoupon() {
	this.selectedsCoupon = this.rowsCoupons.filter((p) => p.isSelected);
	this.totalAMountCouponHeader = this.totalAMountCoupon;
	this.closeModal();
}

function setQuantityCoupon(value, row) {
	if (Number(value) > row.amountPending) {
		this.showDialog = true;
		this.textContent = `La cantidad ingresada supera al monto utilizada del cupón, Monto por Usar: ${row.amountPending}`;
		const index = this.rowsCoupons.findIndex((r) => r.id === row.id);
		if (index > -1) {
			this.rowsCoupons[index].quantityCoupon = Number(row.amountPending);
			this.rowsCoupons[index].disabled = false;
			this.totalAMountCoupon = this.rowsCoupons.reduce(
				(acum, item) => acum + ((item && item.quantityCoupon) || 0),
				0
			);
		}
	} else {
		const index = this.rowsCoupons.findIndex((r) => r.id === row.id);
		if (index > -1) {
			if (value) {
				this.rowsCoupons[index].quantityCoupon = Number(value);
				this.rowsCoupons[index].disabled = false;
				this.totalAMountCoupon = this.rowsCoupons.reduce(
					(acum, item) => acum + ((item && item.quantityCoupon) || 0),
					0
				);
				if (this.totalAMountCoupon > this.priceAmounts.total) {
					this.showDialog = true;
					this.textContent = `El total de los cupones no puede superar al total de la cotizacion. Total Cotizacion: ${this.priceAmounts.total}`;
				}
			} else {
				this.rowsCoupons[index].quantityCoupon = value || 0;
				this.rowsCoupons[index].disabled = true;
				this.totalAMountCoupon = this.rowsCoupons.reduce(
					(acum, item) => acum + ((item && item.quantityCoupon) || 0),
					0
				);
			}
		}
	}
}

function rowIsDisabled({ id }) {
	this.rowsCoupons = this.rowsCoupons.map((row) => {
		const newRow = { ...row };
		if (row.id === id) {
			newRow.isSelected = false;
		}
		return newRow;
	});
}

function disabledActions() {
	const disabledFinalize =
		this.data.length > 0 &&
		(this.customer.flagGeneric || this.customer.personId
			? this.customer.flagGeneric !== 1
			: false);
	const disabled = [{ code: 'generate-coupon', disabled: !disabledFinalize }];
	return disabled;
}

function closeDialogCoupon() {
	this.showDialog = false;
}

function closeDialogState() {
	this.showValidatedCot = false;
}

function closeNotification() {
	this.dialogNotStock = false;
}

function closeDialogCouponError() {
	this.showDialogCoupon = false;
}

function rowIsSelectedCoupon(row) {
	({
		products: this.rowsCoupons,
		productsSelected: this.dataSelectedCoupons,
		checkAll: this.checkAllCoupon,
	} = this.selectedRows(row, this.rowsCoupons, this.dataSelectedCoupons));
}

function selectedAllCoupon(value) {
	({
		products: this.rowsCoupons,
		productsSelected: this.dataSelectedCoupons,
		checkAll: this.checkAllCoupon,
	} = this.selecteAll(value, this.rowsCoupons, this.dataSelectedCoupons));
}

function deleteRow(row) {
	const findIndex = this.selectedsCoupon.findIndex((ds) => ds.id === row.id);
	this.selectedsCoupon.splice(findIndex, 1);
	this.totalAMountCouponHeader = this.selectedsCoupon.reduce(
		(acum, item) => acum + ((item && item.quantityCoupon) || 0),
		0
	);
	if (this.selectedsCoupon.length === 0) {
		this.rowsCoupons = this.rowsCoupons.map((p) => {
			const newRow = { ...p };
			newRow.quantityCoupon = 0;
			newRow.isSelected = false;
			newRow.disabled = true;
			return newRow;
		});
	}
}

function closeModalQuation() {
	this.showConfirmDelete = false;
}

function openConfirmDelete() {
	this.showConfirmDelete = true;
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

function closeModalUnit() {
	this.showUnits = false;
}

function saveModalAdditional() {
	this.totalAMountCouponHeader = Number(this.informationSale.discountGlobal);
	this.closeModal();
}

function setInputAdditional({ model, value }) {
	if (model === 'discountGlobal') {
		if (this.priceAmounts.total <= Number(value)) {
			this.showInvalid = true;
			this.isLoadingAdi = true;
		} else {
			this.informationSale[model] = value;
			this.showInvalid = false;
			// this.totalAmountCoupon = value;
		}
	} else if (model === 'extCompanyCode') {
		this.informationSale[model] = value;
	} else {
		this.informationSale[model] = value;
	}
}

function data() {
	return {
		basePrice: 0,
		cloneId: this.$route.query ? this.$route.query.cloneId : null,
		editId: this.$route.params ? this.$route.params.id : null,
		textContentCot: '',
		showValidatedCot: false,
		actionSale: '',
		disabledDelete: false,
		showNotificationQ: false,
		urlVoucher: null,
		showConfirmDelete: false,
		showProducts: false,
		reserveStock: false,
		titleHeaderDialog: null,
		indexRow: null,
		quantityRow: 0,
		action: {
			active: false,
			code: '',
			open: false,
			width: 500,
			title: '',
		},
		actionDefault: {
			active: false,
			code: '',
			open: false,
			width: 0,
			title: '',
		},
		active: false,
		billingInformation: {},
		checkAll: false,
		checkAllCoupon: false,
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
				name: 'Marca',
				value: 'brand',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Caracteristicas',
				value: 'brand',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Categoria',
				value: 'categoryName',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				name: 'L. de Precios',
				value: 'priceList',
				tooltip: 'Lista de Precios',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Pieza',
				value: 'quantity',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Medida',
				value: 'quantity',
				visible: false,
				checked: false,
			},
			{
				id: 12,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Por Importar',
				value: 'quantityImport',
				visible: false,
				checked: false,
			},
			{
				id: 14,
				name: 'Disponible',
				value: 'quantityAvailable',
				visible: false,
				checked: false,
			},
			{
				id: 15,
				name: 'P. Unitario',
				value: 'priceUnitary',
				tooltip: 'Precio Unitarios',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'PVP',
				value: 'pricePerSale',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 18,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 19,
				name: 'Desc. (%)',
				value: 'discountPercentage',
				visible: true,
				checked: true,
				tooltip: 'Descuento',
				showInput: false,
				isEditable: true,
			},
			{
				id: 20,
				name: '',
				value: 'taxes',
				visible: true,
				checked: true,
			},
			{
				id: 21,
				name: 'Total',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 22,
				name: 'Ubicación',
				value: 'total',
				visible: false,
				checked: false,
			},
			{
				id: 23,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		commentary: '',
		commentaryTemporal: '',
		considerations: [],
		currencies: [],
		currency: 'PEN',
		currentPage: 1,
		currentProduct: {},
		currentPageCoupon: 1,
		customer: {
			autocomplete: '',
			typePerson: {},
		},
		customers: [],
		customerError: true,
		data: [],
		dataSelected: [],
		dataSelectedCoupons: [],
		dayImportTerm: null,
		dateOnline: '',
		defaultCurrency: '',
		defaultPriceList: {},
		dialogNotStock: false,
		dialogStockRow: false,
		idRow: null,
		keyValue: 'warWarehouseProductBrandId-unitId',
		loadingGeneral: false,
		productsStockNegative: [],
		textDialogStockNegative:
			'No se puede realizar la venta porque se excede la cantidad en uno o más productos.',
		dialogStockNegative: false,
		dialogStock: false,
		documentNumber: '',
		entryDate: '',
		errColor: 'error',
		exchangeRate: 0,
		flagIgv: 0,
		isLoadingAdi: false,
		informationSale: {
			showDiscount: false,
			discountGlobal: null,
			showOrder: false,
			amountOrder: null,
		},
		generalTaxes: [],
		invalidValue: false,
		lastPageCoupon: 1,
		lastPage: 1,
		loading: false,
		loadingCustomer: false,
		menu: false,
		model: {},
		newComments: false,
		newConsideration: false,
		newCustomer: {},
		newCustomerRegister: false,
		newIssue: false,
		newProduct: {
			product: {
				autocomplete: '',
			},
			quantity: 0,
			selectedPriceListId: 0,
		},
		objProduct: {},
		onClean: false,
		params: {},
		paramsApply: {
			search: null,
		},
		pricesList: [],
		productToAssingAttrs: null,
		productToAssingAttrsIndex: null,
		productToRemove: {},
		indexToRemove: -1,
		productDuplicateUnit: [],
		productsValid: [],
		products: [],
		showMaxProduct: null,
		typeDocuments: [],
		typePayment: [],
		textContent: '',
		textModal: '',
		totalAMountCoupon: 0,
		totalAMountCouponHeader: 0,
		quotation: {},
		quotationId: 0,
		removeProduct: false,
		rowsCoupons: [],
		salTypeDocumentId: 0,
		salesCurrency: '',
		search: null,
		showPriceSale: null,
		searchData: '',
		searchProduct: null,
		searchVal: null,
		selectedsCoupon: [],
		selectedProduct: '',
		showAditional: false,
		showDuplicateUnit: false,
		showUnits: false,
		showDialogCoupon: false,
		showDialogCouponText: '',
		showDialog: false,
		showInvalid: false,
		state: null,
		status: [],
		subsidiaryId: 0,
		textDialogStock: '',
		textDialogStockRow: null,
		textValid: '',
		titleHeaderDialogRow: null,
		units: [],
		workToDo: [],
		isLoading: false,
		exchangeRatePrimary: 0,
		additionalInformation: {},
		paymentInformation: {},
		operationSign: '*',
		indicateExcessQuantity: false,
	};
}

export default {
	name: 'new-quotation',
	components: {
		appCommentaries,
		actionSidebar,
		appComments,
		appConsiderations,
		appIssues,
		appTable,
		attributesAssignSlideQuotation,
		autocompleteComponent,
		appDialogProducts,
		appShowDialog,
		applyDiscountCoupon,
		appActions,
		appInformationAdditional,
		billingInformation,
		customersForm,
		generalFilter,
		headerPage,
		headerSummary,
		modalItems,
		modalSidebarButton,
		productsSearchForm,
		productsSearchInput,
		additionalInformation,
		paymentInformation,
		customerResume,
	},
	computed: {
		isCommentary,
		assigningAttributesAction,
		blockedCustomer,
		customerRegisterSelected,
		disabledActions,
		disableButton,
		document,
		isEditing,
		isCloning() {
			return !!this.cloneId;
		},
		isProductSearcher,
		negative,
		priceAmounts,
		resumeTaxes,
		salesCurrencySymbol,
		singleDiscount,
		showImportFields,
		validatedMinProduct,
		validatedProductPriceSale,
		allowProductFree() {
			const adminUser = helper.getLocalData('admin-user');
			return getDeeper('subsidiary', 'settings', 'allowProductFree')(adminUser);
		},
		zeroQuantity() {
			const zeroQuantity = this.data.some((d) => d.quantity === 0);
			if (zeroQuantity) {
				this.showGenericError(
					'La cantidad no puede ser cero. Por favor, ingresa una cantidad válida mayor que cero.'
				);
			}
			return zeroQuantity;
		},
	},
	created,
	data,
	methods: {
		makeQuotationCommentary,
		addAttributesTo,
		addComments,
		setComments,
		addConsiderations,
		addIssues,
		addProduct,
		callServiceAndSearch,
		cancelQuotation,
		changeCurrency,
		changeExchangeRate,
		changePage,
		changePriceByList,
		closeModalUnit,
		closeDialogCoupon,
		closeDialogCouponError,
		closeDialogModal,
		closeModalQuation,
		closeDialogStock,
		closeDialogStockNegative,
		closeDialogStockRow,
		closeDialogState,
		closeModal,
		closeNotification,
		changeDiscountAllRows,
		deleteRow,
		deleteQuotation,
		disabledFunMaxProduct,
		editDiscount,
		editPricePerSale,
		editPriceUnitary,
		getPriceListId,
		getTaxByCountry,
		getWarehouseName,
		loadData,
		loadDiscount,
		loadTypeDocuments,
		loadTypePayments,
		openAttributesSlides,
		openSearch,
		openConfirmDelete,
		openSliderModal,
		onSearch,
		quantityAvailableValidation,
		quantityImportValidation,
		quantityValidation,
		removeItem,
		runAction,
		rowIsDisabled,
		rowIsSelected,
		rowIsSelectedCoupon,
		saveApplyCoupon,
		saveCustomer,
		saveData,
		saveModalAdditional,
		setComentary,
		searchValue: helper.debounce(searchValue),
		searching,
		searchingProducts: helper.debounce(searchingProducts),
		selectThisCustomer,
		selectedAll,
		selectedAllCoupon,
		sendQuotation,
		setDynamic,
		setQuantityCoupon,
		setCustomer,
		setData,
		setInputAdditional,
		setPriceList,
		setPricesListByProduct,
		setProduct,
		stopClick,
		toogleColumns,
		unitsByProduct,
		updateColumns,
		updateNewProduct,
		updatePriceList,
		updateCustomerResumeAddress({ selectAddress, selectAddressId }) {
			this.customer = {
				...this.customer,
				selectAddress,
				selectAddressId,
			};
		},
		validateExchangeRate,
		validateLocalStorage,
		validateOnInput,
		warningModal,
		saveDataBilling,
		saveDataForm,
		saveDataPayment,
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
		isFree({ product }) {
			if (this.isPeru) {
				const index = product.product.taxes.findIndex((t) => t.name === 'GRATUITO');
				return index > -1;
			}
			return true;
		},
		isExcessQuantity(row) {
			const stockConverted = this.getStockDinamic(row);
			return stockConverted < row.quantity;
		},
		getPriceConfiguratedByPriceList(row, priceList) {
			const { id: priceListId, price } = priceList;
			const { priceList: priceListProduct, unitConversion, unitId } = row;

			const hasConversionApplied = unitConversion !== 1;
			const newPriceListProduct = priceListProduct[priceListId];
			let finalPrice = price;
			if (newPriceListProduct && newPriceListProduct.price) {
				const dataPriceList = hasConversionApplied
					? newPriceListProduct.units[unitId]
					: newPriceListProduct;

				const range = dataPriceList.ranges.find(
					(r) => r.from <= row.quantity && r.to >= row.quantity
				);
				finalPrice = range ? range.price : dataPriceList.price;
			}
			const conversion = Sales.getConversion(
				this.defaultCurrency,
				this.salesCurrency,
				this.exchangeRate
			);
			return fourDecimals(finalPrice * conversion);
		},
		getPriceConfiguratedByUnit(row, unitSelect) {
			const { priceList, selectedPriceListId, quantity } = row;
			const priceListSelected = priceList[selectedPriceListId];
			const dataPriceList =
				(priceListSelected && priceListSelected.units[unitSelect.id]) ||
				priceListSelected;
			if (!dataPriceList) {
				const conversion = Sales.getConversion(
					this.defaultCurrency,
					this.salesCurrency,
					this.exchangeRate
				);
				return fourDecimals(priceListSelected.price * conversion);
			}
			const range = dataPriceList.ranges.find(
				(r) => r.from <= quantity && r.to >= quantity
			);
			const finalPrice = range ? range.price : dataPriceList.price;
			const conversion = Sales.getConversion(
				this.defaultCurrency,
				this.salesCurrency,
				this.exchangeRate
			);
			return fourDecimals(finalPrice * conversion);
		},
		updateAllPriceListOfProduct(selectedPriceListId) {
			const priceListSeleted = this.pricesList.find(
				(pl) => pl.id === selectedPriceListId
			);

			this.data = this.data.map((p) => {
				const { priceList, unitConversion, unitId, quantity } = p;
				const hasConversionApplied = unitConversion !== 1;
				const newPriceListProduct = priceList[selectedPriceListId];
				if (newPriceListProduct && newPriceListProduct.price) {
					const dataPriceList = hasConversionApplied
						? newPriceListProduct.units[unitId]
						: newPriceListProduct;

					const range = dataPriceList.ranges.find(
						(r) => r.from <= quantity && r.to >= quantity
					);
					const pricePerSaleRaw = range ? range.price : dataPriceList.price;
					const conversion = Sales.getConversion(
						this.defaultCurrency,
						this.salesCurrency,
						this.exchangeRate
					);
					const pricePerSale = fourDecimals(pricePerSaleRaw * conversion);
					return {
						...p,
						selectedPriceListId,
						pricePerSale,
						discountPercentage: newPriceListProduct.discount,
						priceEdited: false,
					};
				}
				return p;
			});
			this.newProduct.selectedPriceListId = null;
			this.showNotification(
				`Los precios de los productos seleccionados fueron actualizados a la lista de precio: ${
					priceListSeleted && priceListSeleted.name
				}`
			);
		},
		recalculatePrices(oldCurrency, oldExchangeRate) {
			const prevCurrency = oldCurrency || this.salesCurrency;
			const prevExchangeRate = oldExchangeRate || this.exchangeRate;
			this.data = this.data.map((p) => {
				const { priceList, selectedPriceListId, unitConversion, unitId, quantity } = p;
				const hasConversionApplied = unitConversion !== 1;
				const currentPriceList = priceList[selectedPriceListId];

				if (currentPriceList && currentPriceList.price) {
					const dataPriceList = hasConversionApplied
						? currentPriceList.units[unitId]
						: currentPriceList;

					const range = dataPriceList.ranges.find(
						(r) => r.from <= quantity && r.to >= quantity
					);
					const pricePerSaleRaw = range ? range.price : dataPriceList.price;
					const conversion = Sales.getConversion(
						this.defaultCurrency,
						this.salesCurrency,
						this.exchangeRate
					);

					let priceToUse;
					if (p.priceEdited) {
						const priceToConvert = p.pricePerSale;
						const conversionFromOldToDefault = Sales.getConversion(
							prevCurrency,
							this.defaultCurrency,
							prevExchangeRate
						);
						const priceInDefault = priceToConvert * conversionFromOldToDefault;
						priceToUse = fourDecimals(priceInDefault * conversion);
					} else {
						priceToUse = fourDecimals(pricePerSaleRaw * conversion);
					}

					const newProduct = {
						...p,
						price: priceToUse,
						salePrice: priceToUse,
						priceEdited: p.priceEdited || false,
					};

					const priceObject = Sales.isPricesWithTaxes(
						Quotation.isEditing,
						newProduct,
						this.$userInfo.company.flagIgv
					);

					newProduct.priceUnitary = fourDecimals(priceObject.priceUnitary);
					newProduct.pricePerSale = priceObject.pricePerSale;
					newProduct.discount = Sales.getDiscountAmount(newProduct);
					newProduct.subtotalWithoutTax = Sales.getSubtotalWithoutTax(newProduct);
					newProduct.total = Sales.getTotal(newProduct);

					return newProduct;
				}
				return p;
			});
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
		async loadTypeChange() {
			const exchangeRates = helper.getLocalData('ms-exchange-rates');
			const lastUpdated = helper.getLocalData('ms-exchange-rates-last-updated');
			const today = new Date().toISOString().split('T')[0];

			if (exchangeRates && lastUpdated === today) {
				this.exchangeRate = this.roundFixedToNumber(exchangeRates[0].amount);
				return;
			}

			try {
				const response = await this.$httpSales.get('ms-exchange-rates');
				this.exchangeRate = this.roundFixedToNumber(response.data[0].amount);

				helper.setLocalData('ms-exchange-rates', response.data);
				helper.setLocalData('ms-exchange-rates-last-updated', today);
			} catch (error) {
				console.error(error);
				this.showGenericError();
			}
		},
	},
	validations,
	watch: {
		search: searching,
		searchProduct: searchingProducts,
	},
};
</script>

<style lang="scss" scoped>
.chip-exchange {
	border-radius: 5px;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	height: 30px;
	margin: 0px;
	text-align: left;
	width: 84px;
	z-index: 1;

	span:not(.chip__content) {
		align-self: flex-end;
		display: flex;
		font-size: map-get($sizes, medium);
		white-space: normal;
	}
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

.col-exchange {
	padding-top: 1.5px;
	position: relative;
}
.cell-rose {
	background: #ffaba3;
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

.opacyble {
	opacity: 0.3;
}

.discount {
	border: 2px solid color(grey-border);
	border-radius: 5px !important;
	box-shadow: none !important;
}

.btn-additional {
	background-color: rgba(195, 231, 232, 0.34) !important;
}

.amount-total {
	background-color: #addbdc;
	border-radius: 3px;
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 16px;
	padding: 4px 15px;
}

.ft-10 {
	font-size: 10px;
}

.content-apply {
	background-color: #f4f4f4;
	font-family: map-get($fonts, open-regular);
}

.title-coupon {
	color: color(primary);
	font-size: 12px;
}

.ft-10 {
	font-size: 10px;
}

.content-discount {
	background-color: color(sidebar);
	color: white;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
}

.content-green {
	background-color: #eaf5f6;
	font-size: 12px;
}

.title-content {
	color: color(sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
}

.content-total {
	background-color: #d9e8e9;
	font-size: 12px;
}

.content-coupon {
	background-color: #1578d1;
	color: white;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
}

.item-content {
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
}

.item-coupons {
	border-radius: 4px;
	border: solid 0.5px color(primary);
	color: #8f8f8f;
	font-size: 14px;
	padding: 5px 8px;
	text-align: center;
	max-width: 190px;
}

.icon-delete {
	color: color(primary);
	font-size: 15px;
	font-weight: bold;
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

.label {
	color: color(brown-grey) !important;
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.width-column {
	width: 93px !important;
}

.btn-free {
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	padding: 4px 1px;
	width: 40px;
}
</style>
