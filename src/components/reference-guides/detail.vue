<template>
	<div class="page-consolidation-orders">
		<div>
			<app-loading
				:show-loading="showLoading"
				label="La carga terminará en un momento y podrás ver
        toda la información del detalle de la guía de remisión"
			/>
		</div>
		<header-page
			:export-to-pdf="!!guide.sales"
			name="guide-detail"
			:show-clean="false"
			:show-excel="false"
			:title="title"
			to-show
			:limit-title="60"
			@download-dispatch="downloadSale"
		>
			<v-flex xs9>
				<span class="header-label subtitle" v-if="subsidiaryName">
					<b>P.V :</b> {{ subsidiaryName }}
				</span>
			</v-flex>

			<v-menu
				v-if="id"
				content-class="excel-menu-content"
				offset-y
				:nudge-bottom="5"
				:nudge-left="120"
				:open-on-click="true"
			>
				<v-btn
					slot="activator"
					class="btn-download-excel btn-auto py-1 px-1 mr-3"
					@click="$emit('click-menu')"
				>
					<img src="/static/img/excel.svg" height="17" class="align-img" />
				</v-btn>
				<v-list>
					<v-list-tile
						v-for="option in options"
						:key="option.id"
						@click="downloadGuide(option.code)"
					>
						<v-list-tile-title>
							{{ option.name }}
						</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</header-page>
		<app-actions
			:value-disabled="actionDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<section v-if="hasSaleDetail">
			<v-layout
				v-if="sale.typeDocument && sale.typeDocument.name"
				wrap
				px-4
				py-2
				align-center
				class="border-title"
			>
				<v-flex>
					<span class="detail-type-document"
						>#{{ sale.typeDocument ? sale.typeDocument.name : null }} {{ sale.serie }}-{{
							sale.number
						}}</span
					>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 pt-1>
				<v-flex xs6 sm6 md3 mb-1 v-if="id">
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> # DOC: </v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.documentNumberGuide }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 sm6 md3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Vendedor: </v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.employeeFullName }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 sm6 md3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label"> Peso </v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.weightTotal | round }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 pt-1 v-if="!isEditCustomer">
				<v-flex xs3 mb-1 v-if="id">
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label" :class="xs5">
							Tipo:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.type }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex
							d-flex
							align-center
							pl-2
							class="column-label"
							:class="isShowCarrier ? 'xs5' : ''"
						>
							{{ labelCustomer }}:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.customerFullName }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label">
							{{ headerGuide.documentName }}:
						</v-flex>
						<v-flex v-if="sale.payment" d-flex align-center class="column-value">
							<label class="caption">{{
								headerGuide.recipientDocument || headerGuide.documentNumber
							}}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs1>
					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4"
						:text="'Editar el cliente'"
						@click-icon="changeCustomer"
					/>
				</v-flex>
			</v-layout>
			<v-layout row wrap align-center px-4 pt-2 v-else>
				<v-flex xs3 mb-1 pl-2>
					<person-search-input
						ref="customerSearcher"
						ref-value="customerSearcher"
						id="customerSearcher"
						:search-value="selectedCustomer"
						:flagInputEvent="true"
						@search="openSearchCustomer"
					/>
				</v-flex>
				<v-flex xs1 pt-2>
					<app-tooltip-button
						color="primary"
						icon="edit"
						class="pt-4"
						:text="'Editar el cliente'"
						@click-icon="changeCustomer"
					/>
				</v-flex>
			</v-layout>
			<v-layout
				row
				wrap
				align-center
				px-4
				pt-1
				v-if="isShowCarrier && id && headerGuide.sender"
			>
				<v-flex xs3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex xs5 align-center pl-2 class="column-label">
							Cliente Remitente:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.sender.senderName }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 sm6 md3 mb-1>
					<v-layout row wrap align-center px-2>
						<v-flex d-flex align-center pl-2 class="column-label">
							{{ headerGuide.sender.documentName }}:
						</v-flex>
						<v-flex v-if="sale.payment" d-flex align-center class="column-value">
							<label class="caption">{{ headerGuide.sender.senderDocument }}</label>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</section>
		<v-layout v-if="!isShowCarrier" wrap align-center px-4 pt-3>
			<v-flex xs4>
				<v-tooltip top>
					<template slot="activator">
						<v-checkbox
							class="section-label"
							color="accent"
							label="Traslados de vehículos de la categoría M1 o L"
							hide-details
							v-model="flagUseVehicleTransfer"
							@change="onFlagUseVehicleTransfer"
						></v-checkbox>
					</template>
					<span>Traslados de vehículos de la categoría M1 o L</span>
				</v-tooltip>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center px-4 pt-3>
			<v-flex xs2 v-if="!isCarrier">
				<label class="caption">Tipo de distribución</label>
				<switch-vendor
					:disabled="flagUseVehicleTransfer"
					:false-value="1"
					reseller
					:true-value="2"
					model="typeDistributor"
					:model-value="typeDistributor"
					@on-switch-change="setDataSwitch"
				></switch-vendor>
			</v-flex>
			<v-flex xs2 v-if="typeDistributor === 1">
				<app-select
					autocomplete
					browser-autocomplete="off"
					:disabled="flagUseVehicleTransfer"
					:item="guide.courierId"
					item-text="fullname"
					item-value="id"
					:items="drivers"
					label="Repartidor"
					model="courierId"
					return-object
					@input="setData"
				/>
			</v-flex>
			<v-flex v-else xs2>
				<app-select
					autocomplete
					browser-autocomplete="off"
					:disabled="flagUseVehicleTransfer"
					:item="guide.transportAgencyId"
					item-text="name"
					item-value="id"
					:items="transports"
					label="Agencia de Transporte"
					return-object
					model="transportAgencyId"
					@input="setData"
				/>
				<span v-if="!guide.transportAgencyId && isCarrier" class="pink--text caption">
					Es necesario seleccionar una agencia de transporte
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center px-4 pt-4 v-if="!isDetail">
			<v-flex xs12>
				<v-layout wrap align-end>
					<v-flex xs2 mr-2 v-if="!saleId">
						<person-search-input
							ref="customerSearcher"
							ref-value="customerSearcher"
							id="customerSearcher"
							showCreatePerson
							:search-value="selectedCustomer"
							:flagInputEvent="true"
							:label-searching="labelCustomer"
							@search="openSearchCustomer"
							@create-person="openSliderModal('CC', 'Nuevo Cliente')"
						/>
					</v-flex>
					<v-flex xs2 mr-2 v-if="!saleId">
						<div class="content-btn">
							<app-input-text
								disabled
								:label="labelDocument"
								class="w-100"
								readonly
								:text="document"
							></app-input-text>
						</div>
					</v-flex>
					<v-flex xs2 mr-2 v-if="!saleId">
						<products-search-input
							ref="productSearcher"
							ref-value="productSearcher"
							id="productSearcher"
							:search-value="product"
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs1 mr-2 v-if="!saleId">
						<app-input-text
							id="quantity"
							label="Cantidad"
							model="quantity"
							:text="quantity"
							@input="setQuantity"
							@input-enter="addProduct"
						/>
					</v-flex>
					<v-flex xs1 mb-2 v-if="!saleId">
						<v-btn
							class="btn-auto btn-total ma-0 px-2"
							color="primary"
							:disabled="disabledButton"
							@click="addProduct"
						>
							<v-icon size="19" color="white" id="add-icon"> add </v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap row px-4 pt-4>
			<v-flex xs2 mr-2 v-if="isShowCarrier && !id">
				<person-search-input
					ref="customerSearcher"
					ref-value="customerSearcher"
					id="customerSearcher"
					showCreatePerson
					:search-value="customerDestination"
					:flagInputEvent="true"
					:label-searching="'Cliente Remitente'"
					@search="openCustomerDestination"
					@create-person="openSliderModal('CC', 'Nuevo Cliente')"
				/>
			</v-flex>
			<v-flex xs2 mr-2 v-if="isShowCarrier && !id">
				<div class="content-btn">
					<app-input-text
						disabled
						:label="'Documento de Cliente Remitente'"
						class="w-100"
						readonly
						:text="documentDestination"
					></app-input-text>
				</div>
			</v-flex>
			<v-spacer />
			<v-flex xs3 text-xs-right>
				<v-tabs color="white" slider-color="primary" v-model="activeTab">
					<v-tab v-for="tab in tabs" :key="tab.id">
						<span>{{ tab.name }}</span>
					</v-tab>
				</v-tabs>
			</v-flex>
		</v-layout>
		<app-table
			:check-all="checkAll"
			class="is-not-selectable no-main-list mt-4 px-4"
			:columns="columns"
			:input-search="false"
			:key-value="keyValue"
			:main-list="false"
			name="guide-detail"
			padding="px-0"
			:rows="guide.details"
			:selectable="hasSaleDetail"
			isResponsive
			@on-selected-all="selectedAll"
			@row-is-selected="rowIsSelected"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{
						props.row.product
							? props.row.product.warehouseName
							: props.row.saleDetail && props.row.saleDetail.warehouseName
							? props.row.saleDetail.warehouseName
							: props.row.warehouseName
					}}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.model }}</td>
				<td v-show="showRow(columns, 3)">
					{{ isResponsive ? 'COD: ' : '' }}{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.inlineFeatures }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.location }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 17)">{{ props.row.quantityOrigin }}</td>
				<td v-show="showRow(columns, 10)">
					<div class="width-auto">
						<span v-if="isResponsive" class="label">CANTIDAD: </span>
						<app-input-text
							:disabled="!!id || props.row.quantityOrigin === props.row.quantityDispatch"
							model="quantityBilling"
							:text="props.row.quantityBilling"
							type="number"
							@change="setRowQuantity($event, props.row)"
						/>
					</div>
				</td>
				<td v-show="showRow(columns, 11)">{{ props.row.quantityDispatch }}</td>
				<td v-show="showRow(columns, 12)">
					<app-select
						:disabled="Boolean(id || saleId)"
						:item="props.row.unitId"
						item-text="code"
						item-value="id"
						:items="props.row.units"
						model="unitId"
						@input="onSetData(props.index, $event)"
					/>
				</td>
				<td v-show="showRow(columns, 13)">
					{{ isResponsive ? 'STOCK: ' : '' }}{{ props.row.stock }}
				</td>
				<td v-show="showRow(columns, 14)">
					{{
						(props.row.aditionalInformation && props.row.aditionalInformation.weight) ||
						props.row.weight
					}}
				</td>
				<td v-show="showRow(columns, 15)">{{ props.row.otherCodes }}</td>
				<td v-show="showRow(columns, 16)">
					<app-tooltip-button
						v-if="id"
						class="ml-1"
						:color="props.row.flagDefault ? 'primary' : 'none'"
						icon="remove_red_eye"
						:text="
							props.row.flagDefault
								? 'Activo para la impresión'
								: 'Oculto para la impresión'
						"
						:size="19"
						@click-icon="showActiveImpresion(props.row)"
					/>
					<app-tooltip-button
						v-if="!id"
						color="error"
						icon="delete"
						text="Eliminar Producto"
						@click-icon="openConfirm(props.row)"
					/>
					<app-tooltip-button
						v-if="!id && !isResponsive"
						color="blue"
						icon="format_list_numbered"
						text="Agregar Datos Adicionales"
						@click-icon="openAdditionalData(props.row)"
					/>
				</td>
			</template>
			<template slot="footerSemi" v-if="!isResponsive">
				<td :colspan="id || $route.query.listSale ? 10 : 9" class="footer-table"></td>
				<td class="footer-table--select">
					<div class="footer-table--text">T. Cantidad</div>
					<div>{{ quantityTotal }}</div>
				</td>
				<td class="footer-table" colspan="4"></td>
			</template>
		</app-table>
		<v-flex pt-2 xs12 pb-2 ml-4>
			<v-checkbox
				color="primary"
				hide-details
				label="Despachar Productos"
				v-model="flagDispatchProduct"
			></v-checkbox>
		</v-flex>
		<v-layout wrap>
			<v-flex xs12 text-xs-center>
				<v-btn color="pink" class="btn-action" @click="backToGuide"> Cancelar </v-btn>
				<template v-if="saleGuideDisabled">
					<v-tooltip top>
						<v-btn
							color="blue"
							class="btn-action ml-3"
							:disabled="disabledNextStep"
							slot="activator"
							@click="nextStep"
						>
							{{ btnText }}
						</v-btn>
						<span>Es necesario seleccionar los productos a entregar</span>
					</v-tooltip>
				</template>
				<template v-else-if="!this.id">
					<v-btn
						color="blue"
						class="btn-action ml-3"
						:disabled="disabledNextStep"
						@click="nextStep"
					>
						{{ btnText }}
					</v-btn>
				</template>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="close"
		>
			<customers-form
				fast-form
				v-if="action.code === 'CC'"
				:is-loading="loadingCustomer"
				:model-data="customer"
				@cancel="close"
				@save="saveCustomer"
			/>
			<selling-points
				v-if="action.code === 'selling-points'"
				:type-document-id="20"
				:serie="configInfo.serie"
				:subsidiaries="subsidiaries"
				@close="close"
				@save-point="savePoint"
			/>
			<additional-data-form
				v-if="isAdditionalData"
				:additional-information="productSelected.additionalInformation"
				:id="id"
				@close="close"
				@save="saveProductData"
			/>
			<couriers-form v-if="isCouriers" @close="close" @save="saveCourier" />
			<reference-guides-form
				v-if="isForm"
				:flag-vehic-trans="flagUseVehicleTransfer"
				:vehicles="vehicles"
				:type-distribution="typeDistributor"
				:serie-id-point="serieIdPoint"
				:is-loading="isLoading"
				:courier="courier"
				:customerDestinations="customerDestinations"
				:customDestinationsSender="customDestinationsSender"
				:transport-agency="transportAgency"
				:guide-data="guide"
				:subsidiaries="subsidiaries"
				:id="id"
				:customer="customer"
				:customer-sender="customerSender"
				@close="close"
				@save="saveGuide"
			/>
			<products-search-form
				v-if="isProductSearcher"
				:search-value="searchVal"
				@add-product="setProductId"
				isResponsive
			/>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				isResponsive
				@add-person="setCustomer"
			/>
			<person-search-form
				v-if="action.code === 'customer-searcher-destination'"
				:search-value="searchValCustomer"
				isResponsive
				@add-person="setCustomerDestination"
			/>
			<app-data-quote
				v-if="action.code === 'information-quotation'"
				:data-form="dataForm"
				:data-payment="dataPayment"
				:data-fac="dataFac"
				:url-voucher="urlVoucher"
				@close-modal="close"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">
					¿Desea eliminar el producto '{{ productName }}' del listado?
				</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeDialog">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="removeProduct">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Agregar Cantidad"
			:text-content="dialog.textContent"
			:show-modal-init="dialog.open"
			max-width-dialog="571px"
			@close-dialog="closeDialogModal"
		/>
		<app-show-dialog
			:show-products="true"
			color-dialog="error"
			color-hex="#D5331A"
			:products="productsDispatch"
			:show-modal-init="showProductsDispatch"
			:text-content="textDialogDispatch"
			title-header="Crear Guía de Remisión"
			@close-dialog="closeDialogDispatch"
		/>
	</div>
</template>

<script>
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appDataQuote from '@/components/shared/sales/app-data-quote';
import appShowDialog from '@/components/shared/app-show-dialog';
import additionalDataForm from '@/components/reference-guides/additional-data/additional-data-form';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import couriersForm from '@/components/reference-guides/couriers/couriers-form';
import headerPage from '@/components/shared/header-page';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import switchVendor from '@/components/field-sale/vendors/switch-vendor';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import referenceGuidesForm from '@/components/reference-guides/reference-guides-form';
import sellingPoints from '@/components/shared/sales/selling-points';
import customersForm from '@/components/customers/customers-form';
import TypeGuides from '@/shared/type-guides';

const { getDeeper, round } = lib;
const twoDecimals = round(2);
const isResponsive = window.innerWidth < 800;

async function created() {
	await this.loadResourcesData();
	if (this.id || this.saleId) {
		await this.loadData();
	}
	if (this.$route.query.listSale) {
		this.columns[10].visible = true;
		this.columns[10].visible = true;
		this.columns[10].flagVisible = false;
	}
	if (!this.isCarrier) {
		await this.loadCustomers();
	}

	if (!this.id) {
		await this.loadConfigData();
	}
	this.typeDistributor = this.$route.params.transportId ? 2 : 1;
	// if (this.isCarrier) {
	// 	this.typeDistributor = 2;
	// }
	this.isShowCarrier = this.$route.name === 'reference-guide-carrier-detail';
	this.noShowIsCarrier = this.$route.name !== 'reference-guide-carrier-detail';
}

async function setCustomer(customer, customerLoading) {
	if (this.isEditCustomer) {
		const { data: customerAddress } = await this.$httpSales.get(
			`customers-address?customerId=${customer.id}`
		);
		this.selectedCustomer = customer.typePerson ? customer.typePerson.fullName : null;
		this.guide.rzSocialAddressee = customer.rzSocial || customer.fullName;
		this.guide.recipientDocument = customer.doc;
		this.customer = { ...customer };
		this.customerDestinations = [
			...(customerAddress || []),
			{ addressLine1: customer.address },
		].filter((obj) => obj.addressLine1);
		const firstCustomerAddress = customerAddress && customerAddress.length > 0 ? customerAddress[0].addressLine1 : null;
		this.guide.destination = customer.address || firstCustomerAddress;
	} else {
		const newCustomer =
			!customer && customerLoading ? { ...this.customers[0] } : customer;
		if (newCustomer) {
			this.customer =
				this.$route.params.saleId || this.$route.params.id
					? this.sale.customer || this.guide.customer
					: { ...newCustomer };
			if (this.$route.params.id || this.$route.params.saleId) {				
				// const findCustomer = this.customers.find(p => p.id === customer.id);
				const dataClient = this.guide.dataClient || {};
				const clientGuideData = dataClient.guideData || {};
				const deliveryAddr =
					dataClient.deliveryAddress ||
					(clientGuideData && clientGuideData.deliveryAddress);

				const initialDestination =
					deliveryAddr && deliveryAddr.value
						? deliveryAddr.value
						: this.guide.destination;

				this.customerDestinations = this.customerAddress
					? this.customerAddress
					: customer.customerAddress;

				if (initialDestination) {
					this.customerDestinations.push({
						addressLine1: initialDestination,
						id: -1,
					});
				}

				this.selectedCustomer = this.sale.customer
					? this.sale.customer.typePerson.fullName
					: null;
				this.selectedCustomer = this.sale.customer
					? this.sale.customer.typePerson.documentNumber
					: null;
			} else {
				this.selectedCustomer = newCustomer.typePerson
					? newCustomer.typePerson.fullName
					: null;
				this.document = newCustomer.typePerson
					? newCustomer.typePerson.documentNumber
					: null;
				this.customerDestinations = [
					...(newCustomer.customerAddress || []),
					{ addressLine1: newCustomer.address },
				].filter((obj) => obj.addressLine1);
				const addressDefault = newCustomer.address;
				const firstCustomerAddress = newCustomer.customerAddress?.[0]?.addressLine1;
				this.guide.destination = addressDefault || firstCustomerAddress;
			}
		}
	}

	this.close();
}

async function loadCustomers() {
	const params = {
		flagSales: true,
		flagGeneric: 1,
	};
	try {
		const response = await this.$httpSales.get('customers', { params });
		this.customers = response.data;
		this.setCustomer(
			this.customers.find((c) => c && c.flagGeneric),
			true
		);
	} catch (error) {
		console.error(error);
		this.showGenericError();
	}
}

function actionDisabled() {
	return [
		{ code: 'courier-new', disabled: !!this.id },
		{ code: 'edit-guide-remision', disabled: !this.id },
		{ code: 'edit-guide-carrier', disabled: !this.id },
		{ code: 'selling-points', disabled: !!this.id },
		{ code: 'information-quotation', disabled: this.disableQuotation },
	];
}

function addProduct() {
	if (!this.disabledButton) {
		const index = this.guide.details.findIndex((gd) => gd.id === this.productId);
		if (index < 0) {
			const newProductSelected = {
				additionalInformation: [],
				autoBarcode: this.productSelected.product.autoBarcode,
				code: this.productSelected.product.code,
				description: this.productSelected.product.description,
				id: this.productSelected.productId,
				inlineFeatures: this.productSelected.product.inlineFeatures,
				location: this.productSelected.location,
				model: this.productSelected.product.model,
				name: this.productSelected.product.name,
				quantityBilling: this.quantity,
				stock: this.productSelected.product.stock,
				warehousesId: this.productSelected.warehouseId,
				weight: this.productSelected.product.weigth,
				brandId: this.productSelected.brandId || this.productSelected.product.brandId,
				brandName:
					this.productSelected.brandName || this.productSelected.product.brandName,
				unitId: this.productSelected.product.unitId || null,
				units: this.productSelected.product.conversions
					? this.unitsByProduct(this.productSelected.product)
					: [{ ...this.productSelected.product.unit }],
				warehouseName:
					this.productSelected.warehouseName ||
					(this.productSelected.product
						? this.productSelected.product.warehouseName
						: null),
			};
			const unit = newProductSelected.units.find(
				(u) => u && u.id === newProductSelected.unitId
			);
			newProductSelected.unitName = unit && unit.name;
			newProductSelected.unitCode = unit && unit.code;
			newProductSelected.unitConversion = (unit && unit.quantity) || 1;
			this.guide.details.push(newProductSelected);
			this.arrayReplace.push(newProductSelected);
			this.oldArray.push(newProductSelected);
		} else {
			this.showNotification(
				'El producto ya se encuentra agregado en el listado.',
				'info'
			);
		}
		this.product = '';
		this.productSelected = {};
		this.quantity = 0;
	} else {
		this.showNotification(
			'Debe seleccionar un producto y la cantidad debe ser mayor a cero (0)',
			'info'
		);
	}
	setTimeout(() => {
		this.$refs.productSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
	}, 300);
}

function backToGuide() {
	const back = this.isShowCarrier ? 'reference-guides-carrier' : 'reference-guides';
	this.goTo(back);
}

function btnText() {
	return this.id ? 'Ver Datos' : 'Continuar';
}

function close() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
}

function closeDialog() {
	this.dialog = false;
	this.productId = 0;
	this.productName = '';
}

function disabledButton() {
	return !this.product || !this.quantity;
}

function hasZeroQtyProducts() {
	return this.guide.details.some(
		(p) =>
			(p.quantityOrigin === p.quantityDispatch || p.quantityBilling === 0) && p.isSelected
	);
}

function disabledNextStep() {
	return (
		this.guide.details.length === 0 ||
		this.saleGuideDisabled ||
		(this.typeDistributor === 2 && !this.guide.transportAgencyId && this.isCarrier) ||
		(this.isShowCarrier && !this.customerDestination) ||
		this.hasZeroQtyProducts
	);
}

async function downloadGuide(typeValue) {
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'remission-guides-pdf', type: typeValue };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const response = await this.$httpReportSales.post(
			`remission-guide/${this.id}/pdf`,
			model,
			{ responseType }
		);
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, this.guide.number, downloadDialog);
	} catch (err) {
		console.error(err);
		if (err.status === 400) {
			if (err.data.message === 'GUIDE_NOT_FOUND') {
				this.showNotification('La guía no existe.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function downloadSale() {
	const saleId = this.guide.salSaleDocumentsId;
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const response = await this.$httpSales.post(`sale-documents/${saleId}/pdf`, model, {
			responseType,
		});
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(
			blob,
			`${this.guide.sales.serie}-${this.guide.sales.number}`,
			downloadDialog
		);
	} catch (err) {
		console.error(err);
		if (err.status === 400) {
			if (err.data.message === 'SALE_NOT_FOUND') {
				this.showNotification('La venta no existe.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function hasSaleDetail() {
	return !!this.saleId || !!this.$route.params.id;
}

function isAdditionalData() {
	return this.action.code === 'additional-data';
}

function isCouriers() {
	return this.action.code === 'courier-new';
}

function isDetail() {
	return !!this.id;
}

function isForm() {
	return (
		this.action.code === 'edit-guide-remision' ||
		this.action.code === 'edit-guide-carrier'
	);
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

async function loadData() {
	this.showLoading = true;
	if (this.id) {
		this.params.relationAdd = this.relationAdd.join(',');
	}
	const url = this.id ? `remission-guides/${this.id}` : `sale-documents/${this.saleId}`;
	try {
		const { data: response } = await this.$httpSales.get(url, {
			params: this.params,
		});
		const responseData = this.id ? { ...response[0] } : { ...response };
		const { data: customerAddress } = await this.$httpSales.get(
			`customers-address?customerId=${responseData.customerId}`
		);
		const orderDetails =
			responseData.order &&
			responseData.order.details &&
			responseData.order.details.length > 0
				? responseData.order.details
				: null;
		this.customerAddress = customerAddress;
		const listSale = this.$route.query && this.$route.query.listSale;
		const isDetailDispatch = this.$route.name === 'reference-guide-detail-dispatch';
		const details = responseData.details.map((product, index) => {
			const newProduct = { ...product };
			const productInfo = product.productInfo;
			newProduct.flagDefault = product.flagPrintDisable === 0 || false;
			newProduct.quantityOrigin = product.quantity;
			newProduct.quantityBilling =
				product.flagDispatch === 0
					? product.quantity - product.quantityDispatch
					: product.quantity;

			if (
				(listSale || isDetailDispatch) &&
				newProduct.quantityDispatch === product.quantity
			) {
				newProduct.quantityBilling = 0;
			}
			newProduct.model = product.product.model;
			newProduct.code = product.product.code;
			newProduct.autoBarcode = product.product.autoBarcode;
			newProduct.name = product.product.name;
			newProduct.inlineFeatures = product.product.inlineFeatures;
			newProduct.description = product.product.description;
			newProduct.location = product.product.location;
			newProduct.brandId =
				(productInfo && productInfo.brandId) ||
				product.brandId ||
				product.product.brandId;
			newProduct.brandName =
				(productInfo && productInfo.brandName) ||
				product.brandName ||
				product.product.brandName;
			newProduct.weight =
				(orderDetails && orderDetails[index] && orderDetails[index].weight) ||
				product.product.weigth ||
				0;
			newProduct.otherCodes = product.product.alternateCode
				? product.product.alternateCode.join(',')
				: null;
			newProduct.stock = this.saleId ? product.stockQuantity : product.product.stock;
			newProduct.units = product.product.conversions
				? this.unitsByProduct(product.product)
				: [{ ...product.product.unit }];
			newProduct.unitId =
				(productInfo && productInfo.unitId) ||
				product.unitId ||
				product.product.unitId ||
				null;
			const unit = newProduct.units.find((u) => u && u.id === newProduct.unitId);
			newProduct.unitName = (productInfo && productInfo.unitName) || (unit && unit.name);
			newProduct.unitCode = (productInfo && productInfo.unitCode) || (unit && unit.code);
			newProduct.unitConversion =
				(productInfo && productInfo.unitConversion) || (unit && unit.quantity);

			if (this.saleId) {
				newProduct.additionalInformation = [];
				newProduct.isSelected = false;
			}
			return newProduct;
		});
		responseData.details = [...details];
		if (responseData.sales && responseData.sales.customer) {
			const { sales } = responseData;
			responseData.customerData = {
				name:
					sales.customer.flagTypePerson > 1
						? sales.customer.rzSocial
						: `${sales.customer.name} ${sales.customer.lastname}`,
				document:
					sales.customer.flagTypePerson > 1 ? sales.customer.ruc : sales.customer.dni,
			};
		} else if (responseData.customer) {
			responseData.customerData = { ...responseData.customer.typePerson };
		} else {
			responseData.customerData = {};
		}
		this.flagUseVehicleTransfer = Boolean(
			responseData.additionalData && responseData.additionalData.flagUseVehicleTransfer
		);
		if (this.saleId) {
			this.sale = { ...responseData };
			const { employee, customer, dataClient } = responseData;
			this.headerGuide.customerFullName =
				getDeeper('typePerson', 'fullName')(customer) || null;
			this.headerGuide.employeeFullName = employee ? employee.fullname : null;
			this.setCustomer(this.sale.customer, true);
			this.headerGuide.documentName =
				getDeeper('customerData', 'documentName')(responseData) || null;
			this.headerGuide.documentNumber =
				getDeeper('customerData', 'documentNumber')(responseData) || null;

			const detailsData = responseData.order
				? responseData.order.details
				: responseData.details;
			this.headerGuide.weightTotal = detailsData.reduce(
				(acum, item) => acum + (item.weight || 0) * (item.quantity || 0),
				0
			);

			this.guide.weigth = detailsData.reduce(
				(acum, item) =>
					acum +
					((item.aditionalInformation && item.aditionalInformation.weight) ||
						item.product.weigth ||
						item.weight ||
						0) *
						(item.quantity || 0),
				0
			);
			this.guide.details = [...responseData.details];
			this.oldArray = [...responseData.details];
			this.arrayReplace = [...responseData.details];
			this.guide.comSubsidiaryId = responseData.comSubsidiaryId;
			this.guide.terminalId = responseData.terminalId;
			this.guide.salSerie = responseData.salSeries;
			this.guide.typeDocument = responseData.typeDocument;
			this.guide.purchaseOrder = responseData.purchaseOrder || (responseData.externalData && responseData.externalData.purchaseOrder) || '';
			this.guide.originAddress = this.isCarrier
				? ''
				: getDeeper('subsidiary', 'address')(responseData) ||
				  getDeeper('subsidiary', 'address')(this.$userInfo);
			this.guide.destination = getDeeper('customer', 'address')(responseData);
			if (dataClient && dataClient.quotation && dataClient.quotation.guideData) {
				this.guide.dataClient =
					dataClient && dataClient.quotation ? dataClient.quotation : null;
				this.typeDistributor =
					this.guide.dataClient &&
					this.guide.dataClient.guideData &&
					this.guide.dataClient.guideData &&
					this.guide.dataClient.guideData.companyName &&
					this.guide.dataClient.guideData.companyName.value
						? 2
						: 1;
				this.transportAgencyId =
					this.guide.dataClient &&
					this.guide.dataClient.guideData &&
					this.guide.dataClient.guideData.companyName &&
					this.guide.dataClient.guideData.companyName.value
						? this.guide.dataClient.guideData.companyName.value
						: null;
				this.guide.transportAgencyId =
					this.guide.dataClient &&
					this.guide.dataClient.guideData &&
					this.guide.dataClient.guideData.companyName &&
					this.guide.dataClient.guideData.companyName.value
						? this.guide.dataClient.guideData.companyName.value
						: null;
			} else {
				this.guide.dataClient =
					dataClient && dataClient.saleData ? dataClient.saleData : null;
				this.typeDistributor =
					this.guide.dataClient &&
					this.guide.dataClient.companyName &&
					this.guide.dataClient.companyName.value
						? 2
						: 1;
				this.transportAgencyId =
					this.guide.dataClient &&
					this.guide.dataClient.companyName &&
					this.guide.dataClient.companyName.value
						? this.guide.dataClient.companyName.value
						: null;
				this.guide.transportAgencyId =
					this.guide.dataClient &&
					this.guide.dataClient.companyName &&
					this.guide.dataClient.companyName.value
						? this.guide.dataClient.companyName.value
						: null;
			}
		} else {
			const totalWeight = responseData.details.reduce(
				(acum, item) => acum + (item.weight || 0 * item.quantity || 0),
				0
			);
			this.headerGuide.type = responseData?.flagGroup ? 'Agrupada' : 'Individual';
			this.headerGuide.weightTotal =
				responseData.additionalData && responseData.additionalData.weight
					? responseData.additionalData.weight
					: totalWeight;
			this.guide = responseData;
			const { additionalData: inforData, dataClient } = responseData;
			const validPhone =
				dataClient && dataClient.quotation && dataClient.quotation.guideData
					? dataClient.quotation.guideData.attentionPhone.value
					: null;
			const validName =
				dataClient && dataClient.quotation && dataClient.quotation.guideData
					? dataClient.quotation.guideData.attentionDni.value
					: null;
			const validDoc =
				dataClient && dataClient.quotation && dataClient.quotation.guideData
					? dataClient.quotation.guideData.attentionDni.value
					: null;
			this.setCustomer(this.guide.customer, true);
			if (inforData || validPhone) {
				this.guide.phoneAttention = inforData.phoneAttention || validPhone || null;
				this.guide.numberBoxs = inforData.numberBoxs;
				const receiverData = inforData.receiver || inforData;
				this.guide.departmentId = receiverData.department || receiverData.departmentId;
				this.guide.departmentName = receiverData.departmentName;
				this.guide.provinceId = receiverData.province || receiverData.provinceId;
				this.guide.provinceName = receiverData.provinceName;
				this.guide.districtId = receiverData.district || receiverData.districtId;
				this.guide.districtName = receiverData.districtName;

				this.guide.numberMtc = inforData.numberMtc;
				this.guide.groupUbigeoName = inforData.groupUbigeoName;
			}
			const validNameR = inforData && inforData.attentionName;
			this.guide.nameAttention = validNameR || validName || null;
			const documentAtte = inforData && inforData.documentAttention;
			this.guide.documentAttention = documentAtte || validDoc || null;
			this.oldArray = responseData.details;
			this.arrayReplace = responseData.details;
			const weightTotal = responseData.details.reduce(
				(acum, item) => acum + (item.weight || 0) * (item.quantity || 0),
				0
			);
			this.headerGuide.sender = responseData.additionalData.sender;
			this.headerGuide.weightTotal =
				inforData && inforData.weigth ? inforData.weigth : weightTotal;
			this.guide.transportAgency = responseData.transportAgency;
			this.guide.transportAgencyId = responseData.transportAgency
				? responseData.transportAgency.id
				: null;
			this.guide.courierId = responseData.deliveryId || responseData.courierId;
			// const validFullName =
			// 	responseData.dataClient && responseData.dataClient.sales
			// 		? responseData.dataClient.sales.customer.fullName
			// 		: this.guide.customer.typePerson.fullName;
			this.headerGuide.customerFullName =
				this.guide.customer.typePerson.fullName ||
				responseData.rzSocialAddressee ||
				' - ';
			this.headerGuide.documentNumberGuide = responseData.documentNumber;
			this.headerGuide.employeeFullName =
				responseData.dataClient && responseData.dataClient.sales
					? (responseData.dataClient.sales.employee &&
							responseData.dataClient.sales.employee.fullname) ||
					  responseData.employee.fullname
					: responseData.employee.fullname || '';
			this.headerGuide.documentName =
				responseData.dataClient && responseData.dataClient.sales
					? responseData.dataClient.sales.customer.documentName
					: this.guide.customer.typePerson.documentName;
			const documentNumberCustomer =
				this.guide.customer && this.guide.customer.typePerson
					? this.guide.customer.typePerson.documentNumber
					: null;
			this.headerGuide.documentNumber =
				responseData.dataClient &&
				responseData.dataClient.sales &&
				responseData.dataClient.sales.customer.documentNumber
					? responseData.dataClient.sales.customer.documentNumber
					: documentNumberCustomer;
			this.headerGuide.recipientDocument = responseData.recipientDocument;
		}
		if (this.guide.deliveryId) {
			const delivery = this.guide.delivery || null;
			const deliveryTwo = this.drivers.find((p) => p && p.id === this.guide.deliveryId);
			this.courier = delivery || deliveryTwo;
			this.transportAgency = null;
			// if (!this.transportAgency.couriers && delivery.couriers) {
			// 	this.transportAgency.couriers = delivery.couriers;
			// }
		} else if (this.guide.transportAgencyId) {
			const transportAgency = this.guide.transportAgency || null;
			const transportAgencyTwo = this.transports.find(
				(p) => p && p.id === this.guide.transportAgencyId
			);
			this.transportAgency = transportAgency || transportAgencyTwo;
			if (!this.transportAgency.couriers) {
				this.transportAgency.couriers =
					transportAgency.couriers || transportAgencyTwo.couriers;
			}
			this.courier = null;
		}
		const subsidiary = this.subsidiaries.find(
			(p) =>
				p &&
				(p.id === responseData.subsidiaryId ||
					(responseData.subsidiary && p.id === responseData.subsidiary.id))
		);
		this.subsidiaryName = subsidiary.rucName;
	} catch (err) {
		console.error(err);
		this.showLoading = false;
		this.showGenericError();
	} finally {
		this.showLoading = false;
	}
}

function nextStep() {
	this.guide.weigth = this.guide.details.reduce((acum, item) => {
		const weight = (item.additionalInformation && item.additionalInformation.weight) || item.weight || 0;
		const quantity = item.quantityBilling || item.quantity || 0;
		return acum + (weight * quantity);
	}, 0);
	this.action.code = 'edit-guide-remision';
	this.action.title = 'Detalle de Guía';
	this.action.width = 650;
	this.action.open = true;
}

function openAdditionalData(product) {
	const { name } = product;
	this.productSelected = { ...product };
	this.action.width = 550;
	this.action.code = 'additional-data';
	this.action.title = name;
	this.action.open = true;
}

function openConfirm({ id, name }) {
	this.productId = id;
	this.productName = name;
	this.dialog = true;
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 739;
	this.action.open = true;
}

function removeProduct() {
	const index = this.guide.details.findIndex((gd) => gd.id === this.productId);
	const indexSelect = this.guide.details.findIndex((gd) => gd.id === this.productId);
	if (index > -1) {
		this.details.splice(index, 1);
		this.guide.details.splice(indexSelect, 1);
		this.closeDialog();
	}
}

function rowIsSelected() {
	this.details = [...this.guide.details.filter((gd) => gd.isSelected)];
	this.checkAll = this.guide.details.every((gd) => gd.isSelected);
}
function runAction({ code }) {
	if (code === 'courier-new') {
		this.action.title = 'Nuevo Transportista';
	} else if (code === 'edit-guide-remision') {
		this.action.title = 'Editar Guia de Remisión';
		this.action.width = 570;
	} else if (code === 'edit-guide-carrier') {
		this.action.title = 'Editar Guia de Remisión de Transportista';
		this.action.width = 590;
	} else if (code === 'information-quotation') {
		this.action.title = 'Información Adicional Cotización';
		if (this.sale.dataClient && this.sale.dataClient.quotation.guideData) {
			const template = { ...this.sale.dataClient.quotation.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.dataForm = objectOrder;
			const templatePayment = { ...this.sale.dataClient.quotation.payment };
			const arrayPayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayPaymentReverse = arrayPayment.reverse();
			const objectPayment = Object.fromEntries(arrayPaymentReverse);
			this.dataPayment = objectPayment;
			const templateFac = { ...this.sale.dataClient.quotation.dataFac };
			const arrayFac = Object.entries(templateFac).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayFacReverse = arrayFac.reverse();
			const objectFac = Object.fromEntries(arrayFacReverse);
			this.dataFac = objectFac;
			this.urlVoucher = this.sale.dataClient
				? this.sale.dataClient.quotation.urlVoucher
				: null;
		} else if (this.guide.dataClient.quotation.guideData) {
			const template = { ...this.guide.dataClient.quotation.guideData };
			const arrayTemplate = Object.entries(template).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayTemplateReverse = arrayTemplate.reverse();
			const objectOrder = Object.fromEntries(arrayTemplateReverse);
			this.dataForm = objectOrder;
			const templatePayment = { ...this.guide.dataClient.quotation.payment };
			const arrayPayment = Object.entries(templatePayment).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayPaymentReverse = arrayPayment.reverse();
			const objectPayment = Object.fromEntries(arrayPaymentReverse);
			this.dataPayment = objectPayment;
			const templateFac = { ...this.guide.dataClient.quotation.dataFac };
			const arrayFac = Object.entries(templateFac).sort(
				([, a], [, b]) => b.order - a.order
			);
			const arrayFacReverse = arrayFac.reverse();
			const objectFac = Object.fromEntries(arrayFacReverse);
			this.dataFac = objectFac;
			this.urlVoucher = this.guide.dataClient
				? this.guide.dataClient.quotation.urlVoucher
				: null;
		}
	} else if (code === 'selling-points') {
		this.action.title = 'SELECCIONE UN PUNTO DE VENTA';
		this.loadSubsidiaries();
	}
	this.action.code = code;
	this.action.open = true;
}

async function loadConfigData() {
	const code = this.isCarrier ? 'GTR' : 'GRM';
	try {
		({ data: this.configInfo } = await this.$httpSales.get(`terminals/${code}/user`));
		const { typeBilling } = this.configInfo.serie;
		this.configInfo.serie.typeBillingTooltip =
			typeBilling === 1 ? 'Electrónica' : 'Física';
		const serieExist = this.configInfo.serie
			? this.configInfo.serie.comSubsidiariesId
			: null;
		const subsidiary = this.subsidiaries.find((p) => p && p.id === serieExist);
		this.subsidiaryName = subsidiary && subsidiary.rucName;
		this.configInfo.serie.typeBillingName = typeBilling === 1 ? 'Elec.' : 'Fís.';
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SERIE_EXIST') {
				this.showGenericError(error.data.messageError);
				return;
			}
		}
		this.showGenericError();
	}
}

function saleGuideDisabled() {
	return this.saleId && this.details.length === 0;
}

async function saveCourier(courierData) {
	try {
		await this.$httpSales.post('courier', courierData);
		this.showNotification('El transportista ha sido creado correctamente.');
		this.close();
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function saveGuide(guideData, isReasonPurchase) {
	this.isLoading = true;
	const method = this.id ? 'patch' : 'post';
	let url = '';
	if (this.id) {
		url = `remission-guides/${this.id}`;
	} else {
		url = this.saleId ? 'remission-guides' : 'remission-guides-free';
	}
	const body = {
		customerId: this.customer.id,
		driverName:
			this.typeDistributor === 1 && !this.flagUseVehicleTransfer
				? this.guide.driverName || guideData.driverName
				: null,
		driverLicense: this.flagUseVehicleTransfer
			? null
			: (this.typeDistributor === 1 ? (guideData.driverLicense || this.guide.driverLicense) : null),
		transportAgencyId: this.guide.transportAgencyId || undefined,
		additionalInformation: guideData.additionalInformation.length
			? guideData.additionalInformation
			: undefined,
		arrivalDate: guideData.arrivalDate,
		deliveryId: this.guide.courierId || undefined,
		departureDate: guideData.departureDate,
		destination: guideData.destination,
		establishmentCode: guideData.establishmentCode || undefined,
		flagDispatchedSale: this.saleId ? this.flagDispatchProduct : undefined,
		number: this.id ? undefined : guideData.number,
		observation: guideData.observation || undefined,
		originAddress: guideData.originAddress,
		reason: guideData.reason || undefined,
		recipientDocument: this.isEditCustomer
			? this.customer.doc
			: guideData.recipientDocument,
		route: guideData.route || undefined,
		rzSocialAddressee: this.isEditCustomer
			? this.customer.rzSocial || this.customer.fullName
			: guideData.rzSocialAddressee,
		terminalId: this.id ? undefined : this.terminalIdPoint || undefined,
		serieId: this.id ? undefined : this.serieIdPoint || undefined,
		additionalData: {
			purchaseDocument: guideData.purchaseOrder || undefined,
			groupUbigeoName: guideData?.groupUbigeoName || null,
			phoneAttention: guideData.phoneAttention || undefined,
			nameAttention: guideData.nameAttention || undefined,
			documentAttention: guideData.documentAttention || undefined,
			departmentId: guideData.departmentId || undefined,
			departmentName: guideData.departmentName || undefined,
			provinceId: guideData.provinceId || undefined,
			provinceName: guideData.provinceName || undefined,
			districtId: guideData.districtId || undefined,
			districtName: guideData.districtName || undefined,
			numberBoxs: Number(guideData.numberBoxs) || undefined,
			weight: guideData.weight || undefined,
			transferModality: String(guideData.typeTransport) || undefined,
			transferModalityName: String(guideData.typeTransportName) || undefined,
			reasonsTransfer: String(guideData.reasonTran) || undefined,
			reasonsTransferName: String(guideData.reasonTranName) || undefined,
			ubigeoStart: guideData.ubigeoStart || undefined,
			ubigeoEnd: guideData.ubigeoEnd || undefined,
			sender:
				this.noShowIsCarrier || isReasonPurchase || this.isShowCarrier
					? guideData.sender
					: undefined,
			descriptionTransfer: guideData.descriptionTransfer || undefined,
			numberMtc: this.isShowCarrier ? guideData.numberMtc || undefined : undefined,
			driverLicensePlateSecondary:
				String(guideData.driverLicensePlateSecondary) || undefined,
			freight:
				this.isShowCarrier && guideData.freight && guideData.freight.customerId
					? guideData.freight
					: undefined,
			flagUseVehicleTransfer: this.flagUseVehicleTransfer,
		},
	};

	if (this.flagUseVehicleTransfer) {
		body.driverLicensePlate =
			guideData.driverLicensePlate || this.guide.driverLicensePlate || 'NO TIENE';
	} else if (this.typeDistributor === 1) {
		body.driverLicensePlate =
			guideData.driverLicensePlate ||
			this.guide.driverLicensePlate ||
			guideData.numberLicenceAgency;
	} else {
		body.driverLicensePlate = null;
	}
	if (method === 'post') {
		if (this.saleId) {
			body.dataClient = this.sale.dataClient;
			body.details = this.details.map((gd) => {
				const newGd = {
					additionalInformation: gd.additionalInformation,
					id: gd.id,
					brandId: gd.brandId,
					quantity: gd.quantityBilling,
					warehousesId: gd.warWarehousesId,
					warProductsId: gd.warProductsId,
					productInfo: {
						// Unidad
						unitId: gd.unitId,
						unitName: gd.unitName,
						unitCode: gd.unitCode,
						unitConversion: gd.unitConversion,
						unitQuantity: gd.unitConversion * gd.quantityBilling,
						// Marca
						brandId: gd.brandId,
						brandName: gd.brandName,
					},
				};
				return newGd;
			});
			body.salSaleDocumentsId = this.saleId;
		} else {
			const createDataClient = {
				sales: {
					customer: {
						customerId: this.customer.id,
						fullName: this.customer.typePerson ? this.customer.typePerson.fullName : '',
						documentName: this.customer.msTypePerson
							? this.customer.msTypePerson.name
							: '',
						documentCode: this.customer.msTypePerson
							? this.customer.msTypePerson.code
							: '',
						documentNumber: this.customer.msTypePerson
							? this.customer.msTypePerson.documentNumber
							: '',
					},
					employee: {
						fullname: this.$userInfo.fullname,
						employeeId: this.$userInfo.id,
					},
				},
			};
			if (guideData.typeTransport || guideData.reasonTran) {
				body.additionalData = {
					...body.additionalData,
					weight: guideData.weight,
					transferModality: String(guideData.typeTransport),
					transferModalityName: String(guideData.typeTransportName) || undefined,
					reasonsTransfer: String(guideData.reasonTran),
					reasonsTransferName: String(guideData.reasonTranName) || undefined,
				};
			}
			body.type = this.isCarrier ? TypeGuides.Carrier : TypeGuides.Sender;
			body.flagDispatch = this.flagDispatchProduct;
			body.dataClient = createDataClient;
			body.details = this.guide.details.map((gd) => {
				const newGd = {
					additionalInformation: gd.additionalInformation,
					brandId: gd.brandId,
					quantity: gd.quantityBilling,
					warehousesId: gd.warehousesId || gd.warWarehousesId,
					warProductsId: gd.id,
					productInfo: {
						// Unidad
						unitId: gd.unitId,
						unitName: gd.unitName,
						unitCode: gd.unitCode,
						unitConversion: gd.unitConversion,
						unitQuantity: gd.unitConversion * gd.quantityBilling,
						// Marca
						brandId: gd.brandId,
						brandName: gd.brandName,
					},
				};
				return newGd;
			});
		}
	}
	if (this.$route.query.listSale) {
		body.flagDispatchedSale = this.flagDispatchProduct;
	}
	if (
		this.$userInfo.company.settings.flagRelateVehicleFloat &&
		this.typeDistributor === 2
	) {
		body.courierId = guideData.courierId;
		body.driverLicense = guideData.driverLicense;
		body.driverLicensePlate = guideData.driverLicensePlate;
		body.driverName = guideData.driverName;
		delete body.deliveryId; // Cuando es externo ya no es necesario
	}

	// if (this.isCarrier) {
	// 	delete body.reason;
	// 	delete body.additionalInformation;
	// }
	try {
		await this.$httpSales[method](url, body);
		this.showNotification('La guía ha sido creada correctamente.');
		this.goTo(this.isCarrier ? 'reference-guides-carrier' : 'reference-guides');
	} catch (err) {
		console.error(err);
		this.isLoading = false;
		if (err.status === 400) {
			if (err.data.message === 'SALE_DETAIL_REMISION_GUIDE_EXIST') {
				this.showNotification(
					'No se puede generar la guía de factura que se encuentran asociado en otros documentos.',
					'error'
				);
			} else if (err.data.message === 'FLAG_DISPATCH_TRUE_ERROR') {
				this.close();
				this.showProductsDispatch = true;
				this.productsDispatch = err.data.details;
				this.textDialogDispatch = err.data.messageError;
			} else if (err.data && err.data.messageError) {
				this.showGenericError(err.data.messageError);
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function closeDialogDispatch() {
	this.showProductsDispatch = false;
}

function saveProductData(dataAdded) {
	if (dataAdded.length > 0) {
		const indexProd = this.guide.details.findIndex(
			(d) => d.id === this.productSelected.id
		);
		if (indexProd > -1) {
			this.guide.details[indexProd].additionalInformation = [...dataAdded];
			this.showNotification(
				`Los datos adicionales para el producto "${this.productSelected.name}" se agregaron correctamente.`
			);
		}
	} else {
		this.showNotification(
			`No se agregó ningún dato adicional para el producto "${this.productSelected.name}".`,
			'info'
		);
	}
}

function selectedAll(checked) {
	this.checkAll = checked;
	this.guide.details = this.guide.details.map((gd) => {
		const newGd = { ...gd };
		newGd.isSelected = checked;
		return newGd;
	});
	this.details = [...this.guide.details.filter((gd) => gd.isSelected)];
}

function setData({ model, value }) {
	if (!value) return;
	if (model === 'courierId') {
		this.courier = { ...value };
		this.guide[model] = value.id;
		this.transportAgency = null;
		this.guide.transportAgencyId = null;
	} else if (model === 'transportAgencyId') {
		this.transportAgency = { ...value };
		this.guide[model] = value.id;
		this.courier = null;
		this.guide.courierId = null;
	} else {
		this.guide[model] = value;
	}
}

function setNumber({ value }) {
	this.guide.number = value;
}

function setProductId(product) {
	if (product) {
		this.productSelected = { ...product };
		this.product = product.autocomplete;
		setTimeout(() => {
			const inputQuantity = document.querySelector('#quantity');
			inputQuantity.focus();
		}, 1);
	}
	this.close();
}

function setQuantity({ value }) {
	this.quantity = Number(value);
}

function setRowQuantity(value, { id }) {
	const index = this.guide.details.findIndex((p) => p.id === id);
	if (index > -1) {
		this.$set(this.guide.details[index], 'quantityBilling', Number(value));
		this.$set(this.guide.details[index], 'quantity', Number(value));
	}
}

function title() {
	return this.id && !this.hasSaleDetail
		? `${this.$route.meta.title} - Nro ${this.guide.number}`
		: this.$route.meta.title;
}

function setDataSwitch({ model, value }) {
	this[model] = value;
	this.transportAgency = null;
	this.courier = null;
	this.guide.courierId = null;
	this.guide.transportAgencyId = null;
}

function closeDialogModal() {
	const index = this.guide.details.findIndex((p) => p.id === this.idRow);
	if (index > -1) {
		this.$set(this.guide.details[index], 'quantityBilling', Number(this.quantityRow));
	}
	this.showModalQuantity = false;
}

function openSearchCustomer(value) {
	this.searchValCustomer = value ? value.trim() : '';
	this.action.code = 'customer-searcher';
	this.action.title = 'Clientes';
	this.action.width = 739;
	this.action.value = true;
	this.action.open = true;
}

function savePoint(point) {
	this.guide.serie = point.serie.serie;
	this.guide.number = point.serie.number;
	this.serieIdPoint = point.serie.id;
	this.terminalIdPoint = point.id;
	this.terminalNamePoint = point.name;
	this.configInfo.serie.salTerminalsId = point.id;
	this.configInfo.terminal.name = point.name;
	this.configInfo.terminal.id = point.id;
	this.configInfo.serie.terminal.id = point.id;
	this.configInfo.serie.terminal.name = point.name;
	this.configInfo.serie.typeBilling = point.serie.typeBilling;
	this.configInfo.serie.comSubsidiariesId = point.comSubsidiariesId;
	const serieExist = this.configInfo.serie
		? this.configInfo.serie.comSubsidiariesId
		: null;
	const subsidiary = this.subsidiaries.find((p) => p && p.id === serieExist);
	this.subsidiaryName = subsidiary.rucName;
	this.close();
}

async function showActiveImpresion({ id, flagDefault, product }) {
	const idReplace = this.oldArray.filter((p) => p.product.id === product.id);
	const body = {
		flagPrintDisable: flagDefault,
		idDetails: idReplace.map((p) => p.id),
	};
	try {
		await this.$httpSales.patch(`remission-guides/${this.id}/print-disable`, body);
		const index = this.guide.details.findIndex((p) => p.id === id);
		this.guide.details[index].flagDefault = !this.guide.details[index].flagDefault;
		this.showNotification('Se actualizó el producto correctamente');
	} catch (error) {
		console.error(error);
		this.showGenericError();
	}
}

function activeTab(value) {
	if (value === '1') {
		const grouped = {};
		this.arrayReplace.forEach((item) => {
			const productId = item.warProductsId || item.id;
			const warehouseId = item.warWarehousesId || item.warehousesId;
			const unitId = item.unitId;
			const key = `${productId}_${warehouseId}_${unitId}`;
			if (!grouped[key]) {
				grouped[key] = {
					...item,
					quantityBilling: item.quantity || item.quantityBilling || 0,
				};
			} else {
				grouped[key].quantityBilling += item.quantity || item.quantityBilling || 0;
			}
		});
		this.guide.details = Object.values(grouped);
		this.show = true;
	} else if (value && this.show) {
		this.show = false;
		this.guide.details = this.oldArray;
	}
}

function quantityTotal() {
	return twoDecimals(
		this.guide.details.reduce((total, item) => total + Number(item.quantityBilling), 0)
	);
}

function data() {
	const isDetailDispatch = this.$route.name === 'reference-guide-detail-dispatch';
	const listSale = this.$route.query && this.$route.query.listSale;
	const showQuantityPending = isDetailDispatch || listSale;

	return {
		oldArray: [],
		show: false,
		action: {
			code: '',
			open: false,
			title: '',
			width: 434,
		},
		activeTab: null,
		arrayReplace: [],
		checkAll: false,
		isResponsive,
		columns: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Modelo',
				value: 'model',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{ id: 3, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 4,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{ id: 5, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 6,
				name: 'Características',
				value: 'inlineFeatures',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 7,
				name: 'Descripción',
				value: 'description',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 8,
				name: 'Ubicación',
				value: 'location',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 9,
				name: 'Marca',
				value: 'brandName',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 17,
				name: 'Cantidad',
				value: 'quantityOrigin',
				visible: showQuantityPending,
				checked: true,
			},
			{
				id: 10,
				name: showQuantityPending ? 'Cant. Pendiente' : 'Cantidad',
				tooltip: 'Cantidad pendiente a despachar',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Cant. Desp.',
				tooltip: 'Cantidad Despachada',
				value: 'quantityDispatch',
				visible: showQuantityPending,
				checked: !isResponsive,
				flagVisible: true,
			},
			{
				id: 12,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{ id: 13, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 14,
				name: 'Peso',
				value: 'weigth',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 15,
				name: 'Otros Códigos',
				value: 'weigth',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 16,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		configInfo: {},
		customer: {},
		customers: [],
		customerDestinations: [],
		customDestinationsSender: [],
		courier: null,
		deliveryId: null,
		details: [],
		drivers: [],
		dialog: false,
		disableQuotation: false,
		document: null,
		flagDispatchProduct: true,
		keyValue: 'warProductId',
		isLoading: false,
		idRow: null,
		idTypeDocumentSelect: null,
		flagGenericCustomer: true,
		headerGuide: {
			customerFullName: null,
			employeeFullName: null,
			documentName: null,
			documentNumber: null,
			weightTotal: 0,
			type: '',
		},
		guide: {
			additionalData: {
				phoneAttention: null,
				nameAttention: null,
				documentAttention: null,
			},
			additionalInformation: [],
			arrivalDate: null,
			courierId: 0,
			customer: null,
			comSubsidiaryId: null,
			departureDate: null,
			destination: '',
			details: [],
			driverCelphone: '',
			driverLicensePlate: null,
			driverName: '',
			establishmentCode: '',
			number: null,
			observation: '',
			originAddress: '',
			route: '',
			salSerie: {},
			terminalId: null,
			transportAgencyId: 0,
			typeDocument: null,
			typeTransport: null,
			weigth: 0,
		},
		number: null,
		serieIdPoint: null,
		relationAdd: [
			'transportAgency',
			'delivery',
			'details',
			'salSerie',
			'customer',
			'employee',
		],
		objectSerie: {},
		params: {
			relationAdd: null,
		},
		product: '',
		productsDispatch: [],
		showProductsDispatch: false,
		productId: 0,
		productName: '',
		productSelected: {},
		subsidiaryIdModal: null,
		properties: ['name', 'documentNumber'],
		terminalIdPoint: null,
		subsidiaries: [],
		textDialogDispatch: '',
		transports: [],
		transportAgencyId: null,
		transportAgency: null,
		typeDistributor: null,
		quantity: 0,
		quantityRow: 0,
		sale: {
			customerData: {},
			employee: {},
			payment: {},
			typeDocument: {},
		},
		selectedCustomer: null,
		searchValCustomer: null,
		searchVal: null,
		showLoading: false,
		showModalQuantity: false,
		courierId: null,
		options: [
			{
				id: 1,
				code: 'simple',
				name: 'Reporte Guia de Remisión',
			},
			{
				id: 2,
				code: 'categories',
				name: 'Reporte Guía Categorias',
			},
			{
				id: 3,
				code: 'group',
				name: 'Reporte Guía Agrupados',
			},
		],
		tabs: [
			{
				id: 1,
				name: 'Detalle de Productos',
			},
			{
				id: 2,
				name: 'Productos Agrupados',
			},
		],
		customerAddress: {},
		isCarrier: this.$route.meta.isCarrier || false,
		subsidiaryName: null,
		vehicles: [],
		loadingCustomer: false,
		units: [],
		customerSender: null,
		customerDestination: null,
		isShowCarrier: false,
		noShowIsCarrier: false,
		documentDestination: null,
		labelCustomer:
			this.$route.name === 'reference-guide-carrier-detail'
				? 'Cliente Destino'
				: 'Cliente',
		labelDocument:
			this.$route.name === 'reference-guide-carrier-detail'
				? 'Documento de Cliente Destino'
				: 'Documento de Cliente',
		isEditCustomer: false,
		flagUseVehicleTransfer: false,
	};
}

export default {
	name: 'reference-guide-detail',
	components: {
		actionSidebar,
		appActions,
		appDataQuote,
		additionalDataForm,
		appTable,
		appTooltipButton,
		appShowDialog,
		autocompleteComponent,
		couriersForm,
		headerPage,
		switchVendor,
		personSearchInput,
		personSearchForm,
		productsSearchForm,
		productsSearchInput,
		referenceGuidesForm,
		sellingPoints,
		customersForm,
	},
	computed: {
		actionDisabled,
		btnText,
		disabledButton,
		disabledNextStep,
		hasZeroQtyProducts,
		hasSaleDetail,
		isAdditionalData,
		isCouriers,
		isDetail,
		isForm,
		isProductSearcher,
		saleGuideDisabled,
		title,
		quantityTotal,
	},
	created,
	data,
	methods: {
		addProduct,
		backToGuide,
		close,
		closeDialog,
		closeDialogDispatch,
		closeDialogModal,
		downloadGuide,
		downloadSale,
		loadData,
		loadConfigData,
		loadCustomers,
		nextStep,
		openAdditionalData,
		openConfirm,
		openSearch,
		openSearchCustomer,
		removeProduct,
		rowIsSelected,
		runAction,
		saveCourier,
		saveGuide,
		savePoint,
		saveProductData,
		showActiveImpresion,
		selectedAll,
		setCustomer,
		setData,
		setDataSwitch,
		setNumber,
		setProductId,
		setQuantity,
		setRowQuantity,
		onFlagUseVehicleTransfer(val) {
			this.flagUseVehicleTransfer = val;
			this.courier = null;
			this.guide.courierId = null;
			this.transportAgency = null;
			this.guide.transportAgencyId = null;
		},
		changeCustomer() {
			this.isEditCustomer = !this.isEditCustomer;
		},
		setCustomerDestination(customer) {
			this.customerSender = customer;
			this.customerDestination = customer.typePerson
				? customer.typePerson.fullName
				: null;
			this.documentDestination = customer.typePerson
				? customer.typePerson.documentNumber
				: null;
			this.customDestinationsSender = [
				...(customer.customerAddress || []),
				{ addressLine1: customer.address },
			].filter((obj) => obj.addressLine1);
			this.close();
		},
		openCustomerDestination(value) {
			this.searchValCustomer = value ? value.trim() : '';
			this.action.code = 'customer-searcher-destination';
			this.action.title = 'Clientes';
			this.action.width = 739;
			this.action.value = true;
			this.action.open = true;
		},
		openSliderModal(code, head = '', width = 550) {
			this.action = {
				active: true,
				code,
				open: true,
				title: head,
				width,
			};
		},
		async saveCustomer(customer) {
			this.loadingCustomer = true;
			const url = 'customers';
			const method = 'post';
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
			if (customer.ruc) {
				body.rzSocial = rzSocial;
				body.ruc = ruc;
			} else {
				body.name = name;
				body.lastname = lastname;
				body.dni = dni;
			}
			try {
				const { data: response } = await this.$httpSales[method](url, body);
				this.showNotification('El cliente ha sido creado correctamente');
				this.selectThisCustomer(response);
			} catch (err) {
				if (err.data && err.data.message === 'CUSTOMER_EXIST_ERROR') {
					this.showNotification('El cliente ya está registrado', 'warning');
				} else {
					this.showGenericError();
				}
			} finally {
				this.loadingCustomer = false;
			}
		},
		selectThisCustomer(customer) {
			this.close();
			this.setCustomer(customer, true);
		},
		onSetData(index, { model, value }) {
			if (model === 'unitId') {
				this.guide.details[index].unitId = value.id;
				this.guide.details[index].unitName = value.name;
				this.guide.details[index].unitCode = value.code;
				this.guide.details[index].unitConversion = value.quantity;
			}
		},
		unitsByProduct(item) {
			if (item.conversions) {
				const keys = Object.keys(item.conversions);
				const newUnits = this.units.reduce((acum, unt) => {
					const index = keys.findIndex((k) => Number(k) === unt.id);
					if (index > -1) {
						const conversionQuantity =
							item.conversions[unt.id] && item.conversions[unt.id].quantity
								? item.conversions[unt.id].quantity
								: 0;
						acum.push({
							...unt,
							quantity: conversionQuantity,
						});
					}
					return acum;
				}, []);
				if (item.unit) {
					newUnits.push({ ...item.unit, quantity: item.unitConversion || 1 });
				} else {
					const unit = {
						id: item.unitId,
						code: item.unitCode,
						name: item.unitName,
						quantity: item.unitConversion || 1,
					};
					newUnits.push(unit);
				}
				return newUnits;
			}
			return [];
		},
		async loadResourcesData() {
			try {
				const requests = [
					this.listOfUnits(),
					this.$httpSales.get('transport-agency'),
					this.$httpSales.get('subsidiaries'),
					this.$httpSales.get('delivery'),
					this.$httpSales.get('vehicles'),
				];

				const [
					{ data: units },
					{ data: transports },
					{ data: subsidiaries },
					{ data: drivers },
					{ data: vehicles },
				] = await Promise.all(requests);
				this.units = units;
				this.transports = transports;
				this.subsidiaries = subsidiaries;
				this.drivers = drivers;

				this.vehicles = vehicles.map((l) => {
					const newData = { ...l };
					newData.autocomplete = l.typeTransport
						? `${l.typeTransport.name} - ${l.plate}`
						: l.plate;
					return newData;
				});
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		id: [Number, String],
		saleId: [Number, String],
	},
	watch: {
		activeTab,
	},
};
</script>

<style lang="scss" scoped>
.card {
	border-radius: 0px;
	box-shadow: none;

	&-blue {
		background-color: map-get($colors, primary);
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

h3,
h5 {
	display: inline-block;
	font-family: map-get($fonts, open-semibold);
}

h5 {
	color: map-get($colors, paginationText);
}

.dispatch-form-label {
	color: map-get($colors, blue-card);
	font-family: map-get($fonts, bold);
	font-size: 14px;
}

.btn-total {
	height: 30px;
}

.width-auto {
	align-items: center;
	margin: auto;
	max-width: 130px;
	display: inline-flex;
	align-items: center;
}

.label {
	margin-right: 5px;
}

.detail {
	&-type-document {
		color: color(paginationText);
		font-family: map-get($fonts, open-bold);
		font-size: 16px;
	}
}

.border-title {
	border-bottom: 1px solid rgba(2, 151, 155, 0.19);
}

.header-label {
	font-size: 14px;
	text-transform: uppercase;

	&.subtitle {
		color: map-get($colors, background-card-black);
		font-family: map-get($fonts, open-regular);
	}
}
</style>
