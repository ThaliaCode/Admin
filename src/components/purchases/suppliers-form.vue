<template>
	<div>
		<v-form method="post" @click.prevent="save">
			<v-layout wrap>
				<v-tabs
					v-model="active"
					color="primary"
					dark
					right
					slider-color="success darken-1"
					class="tabs-form"
				>
					<v-tab href="#main" class="caption"> Datos Generales </v-tab>
					<v-tab href="#additional" class="caption"> Datos Adicionales </v-tab>
					<v-tab v-if="isEcuador" href="#ubigeo" class="caption"> Ubicación </v-tab>
					<v-tab href="#banks" class="caption"> Bancos </v-tab>
					<v-tab-item id="main">
						<v-layout wrap px-4 my-3>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Documento"
									model="documentNumber"
									:text="model.documentNumber"
									@input="getData"
									type="number"
								/>
								<span v-if="$v.model.documentNumber.$invalid">
									<span
										class="form-group__message"
										v-if="!$v.model.documentNumber.required"
									>
										El número de documento es requerido
									</span>
									<span
										class="form-group__message form-group__message--full"
										v-if="
											!$v.model.documentNumber.minLength ||
											!$v.model.documentNumber.maxLength
										"
									>
										{{ documentMessage }}
									</span>
								</span>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="typeDocuments"
									:item="model.flagTypePerson"
									item-text="name"
									item-value="id"
									:label="labelsByCountry.idLabel"
									model="flagTypePerson"
									@input="changeTypePerson"
								/>
								<span class="form-group__message" v-if="$v.model.flagTypePerson.$invalid">
									El tipo de documento es requerido
								</span>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="Nombre Proveedor"
									model="name"
									:text="model.name"
									@input="getData"
								/>
								<span class="form-group__message" v-if="$v.model.name.$invalid">
									El nombre es requerido
								</span>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="Nombre Comercial"
									model="commercialName"
									:text="model.commercialName"
									@input="getData"
								/>
								<span class="form-group__message" v-if="$v.model.commercialName.$invalid">
									El nombre comercial es requerido
								</span>
							</v-flex >
								<v-layout row wrap  mb-2 v-if="$userInfo.company.settings.flagShowAccountingEngine">
									<v-flex xs12  md12 px-2 mb-2 class="title-form">
										<span>CUENTAS CONTABLES</span>
									</v-flex>
									<v-layout>
										<v-flex px-2>
											<app-input-text
												label="Codigo de la cuenta"
												:text="
													model.accountingAccount[0]
														? model.accountingAccount[0].code
														: ''
												"
												@input="setAccounting({ model: 'accountingAccountCode', value: $event })"
											></app-input-text>
										</v-flex>
										<v-flex ml-2 xs4>
											<app-input-text
												label="Nombre"
												:text="
													model.accountingAccount[0]
														? model.accountingAccount[0].name
														: ''
												"
												@input="setAccounting({ model: 'accountingAccountName', value: $event })"
											></app-input-text>
										</v-flex>
									</v-layout>
									<v-layout>
										<v-flex
											xs12
											v-if="isAccountingIncomplete"
										>
											<span class="form-group__message">
												El código y nombre de la cuenta contable son obligatorios.
											</span>
										</v-flex>
									</v-layout>
								</v-layout>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="Dirección"
									model="address"
									:text="model.address"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<label class="caption">Teléfonos</label>
								<v-select
									v-model="model.phone"
									class="filter-select"
									placeholder="Teléfonos"
									chips
									tags
									append-icon=""
									type="number"
								>
									<template slot="selection" slot-scope="data">
										<v-chip
											:selected="data.selected"
											class="tags-form"
											close
											color="info"
											label
											outline
											small
											@input="remove(data.item)"
										>
											{{ data.item }}
										</v-chip>
									</template>
								</v-select>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="E-mail"
									model="email"
									:text="model.email"
									@input="getData"
								/>
								<span class="form-group__message" v-if="$v.model.email.$invalid">
									El email ingresado no es válido. Recuerde que email no es requerido
								</span>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="groups"
									:item="model.groupId"
									item-text="fullName"
									item-value="id"
									label="Grupo"
									model="groupId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="typeExpenses"
									:item="model.typeExpenseId"
									item-text="name"
									item-value="id"
									label="Origen"
									model="typeExpenseId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="Contacto"
									model="contactName"
									:text="model.contactName"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-3>
								<app-input-text
									label="Observaciones"
									model="observation"
									:text="model.observation"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<v-checkbox
									label="Activo"
									hide-details
									v-model="model.flagActive"
								></v-checkbox>
							</v-flex>
							<v-layout v-if="$userInfo.company.settings.flagPerception">
								<v-flex xs4 px-1 pt-3>
									<label class="caption">Agente de Percepción</label>
								</v-flex>
								<v-flex xs2 pt-3>
									<v-switch
										color="success"
										hide-details
										v-model="model.flagPerceptionAgent"
									></v-switch>
								</v-flex>
								<v-flex v-if="model.flagPerceptionAgent" xs4 mb-2>
									<app-input-text
										label="Porcentaje de Percepción"
										type="number"
										:text="model.percentagePerception"
										model="percentagePerception"
										@input="setData"
									/>
								</v-flex>
							</v-layout>
						</v-layout>
					</v-tab-item>
					<v-tab-item id="additional">
						<v-layout wrap px-4 my-3 align-center>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="paymentsMethods"
									:item="model.paymentMethod"
									item-text="name"
									item-value="id"
									label="Forma de Pago"
									model="paymentMethod"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Días Crédito"
									model="creditDays"
									:text="model.creditDays"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 v-if="!isCredit" px-2 my-2>
								<v-select
									chips
									clearable
									solo
									multiple
									color="primary"
									item-text="name"
									item-value="id"
									hide-details
									label="Tipos de pago"
									:items="typePayments"
									v-model="model.additionalInformation.typePaymentIds"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Límite de Crédito"
									model="creditLimitation"
									:text="model.creditLimitation"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Cod. Beneficiario"
									model="beneficiaryCode"
									:text="model.additionalInformation.beneficiaryCode"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-2>
								<app-input-text
									label="Persona Autorizada"
									model="person"
									:text="model.additionalInformation.person"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<autocomplete-component
									label-value="Ret. Bienes"
									item-text="description"
									item-value="code"
									:items="retentions"
									local-search
									:resource-url="`/catalog-sunat-details-list/${tableCodeRetentions}`"
									:return-object="false"
									:http-code="'$httpSales'"
									:item="model.codeTaxesGoods"
									@return-data="getSelectData({ model: 'codeTaxesGoods', value: $event })"
								></autocomplete-component>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<autocomplete-component
									label-value="Ret. Servicios"
									item-text="description"
									item-value="code"
									:items="retentions"
									local-search
									:resource-url="`/catalog-sunat-details-list/${tableCodeRetentions}`"
									:return-object="false"
									:http-code="'$httpSales'"
									:item="model.codeTaxes"
									@return-data="getSelectData({ model: 'codeTaxes', value: $event })"
								></autocomplete-component>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="suppliersTypes"
									:item="model.supplierTypeId"
									item-text="name"
									item-value="id"
									label="Tipo de Proveedor"
									model="supplierTypeId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2 v-if="isEcuador">
								<autocomplete-component
									label-value="Sustento tributario"
									item-text="autocomplete"
									item-value="id"
									:items="taxesSupports"
									local-search
									resource-url="catalog-sunat-details-list/04"
									:return-object="false"
									:http-code="'$httpSales'"
									:item="model.additionalInformation.taxSupportId"
									@return-data="
										getAdditionalData({ model: 'taxSupportId', value: $event })
									"
								></autocomplete-component>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="transactionsTypes"
									:item="model.additionalInformation.transactionTypeId"
									item-text="name"
									item-value="id"
									label="Tipo de Transacción"
									model="transactionTypeId"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Identificación Fiscal"
									model="taxIdentification"
									:text="model.additionalInformation.taxIdentification"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Nro Aut. Imprenta"
									model="printAuthNumber"
									:text="model.additionalInformation.printAuthNumber"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Nro Aut. SRI"
									model="sriAuthNumber"
									:text="model.additionalInformation.sriAuthNumber"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Nro de Serie"
									model="serie"
									:text="model.additionalInformation.serie"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Rango Desde"
									model="rangeFrom"
									:text="model.additionalInformation.rangeFrom"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									label="Rango Hasta"
									model="rangeUp"
									:text="model.additionalInformation.rangeUp"
									@input="getAdditionalData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-date-mask
									label="Fecha Desde"
									:picker="dateWithOutFormatInit"
									@format-date="onDate($event, 'initDate')"
									@input="setDate($event, 'dateWithOutFormatInit')"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-date-mask
									label="Fecha Hasta"
									:picker="dateWithOutFormatEnd"
									@format-date="onDate($event, 'endDate')"
									@input="setDate($event, 'dateWithOutFormatEnd')"
								/>
							</v-flex>
						</v-layout>
					</v-tab-item>
					<v-tab-item v-if="isEcuador" id="ubigeo">
						<v-layout wrap pa-4 mb-5>
							<v-flex xs12 px-2 mb-1>
								<app-select
									:item="model.provinceId"
									item-text="name"
									item-value="id"
									:items="provinces"
									label="Provincia"
									model="provinceId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-1>
								<app-select
									:item="model.cityId"
									item-text="name"
									item-value="id"
									:items="cities"
									:disable="!model.provinceId"
									:readonly="!model.provinceId"
									label="Ciudad"
									model="cityId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-1>
								<app-select
									:item="model.parishId"
									item-text="name"
									item-value="id"
									:items="parishes"
									:disable="!model.cityId"
									:readonly="!model.cityId"
									label="Parroquia"
									model="parishId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-1>
								<app-select
									:items="zones"
									:item="model.zoneId"
									item-text="name"
									item-value="id"
									label="Zona"
									model="zoneId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 px-2 mb-1>
								<app-input-text
									label="Cod. Postal"
									model="postalCode"
									:text="model.postalCode"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs12 mt-5 px-2 mb-1>
								<app-input-text
									class="input-address-custom"
									google-map
									append-icon="location_on"
									:append-icon-cb="toogleMap"
									id="supplier-ubigeo-map"
									label="Geoposición"
									model="geoPosition"
									:text="model.geoPosition"
									@input="getData"
									@input-map="getGeoPosition"
								/>
								<div v-if="showMap" class="static-map">
									<static-map
										:google-api-key="apiKey"
										:markers="markers"
										:center="model.address"
										:zoom="18"
									></static-map>
								</div>
							</v-flex>
						</v-layout>
					</v-tab-item>
					<v-tab-item id="banks">
						<v-layout wrap px-4 my-3 align-center>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="banks"
									:item="model.bankId"
									item-text="name"
									item-value="id"
									label="Banco"
									model="bankId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-select
									:items="accountTypes"
									:item="model.accountingTypeId"
									item-text="name"
									item-value="id"
									label="Tipo de Cuenta"
									model="accountingTypeId"
									@input="getSelectData"
								/>
							</v-flex>
							<v-flex xs12 md6 px-2 mb-2>
								<app-input-text
									type="number"
									label="Nro Cuenta"
									model="accountingBank"
									:text="model.accountingBank"
									@input="getData"
								/>
							</v-flex>
						</v-layout>
					</v-tab-item>
				</v-tabs>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import { format } from 'date-fns';
import {
	email,
	maxLength,
	minLength,
	minValue,
	required,
} from 'vuelidate/lib/validators';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import StaticMap from 'vue-static-map';
import tableCode from '@/shared/table-code';
import typeEntityId from '@/shared/type-entity';

const { IvaRetention } = tableCode;

function created() {
	this.companyId = this.$userInfo.companyId;
	this.loadResources();
}

function close() {
	this.address = '';
	this.markers = [];
	this.$emit('close');
}

function getAdditionalData({ model, value }) {
	if (value) {
		this.model.additionalInformation[model] = this.modelValidate(model)
			? value.id
			: value;
	}
}

function getData({ model, value }) {
	if (model !== 'geoPosition') {
		this.model[model] = value;
		if (model === 'provinceId') {
			this.loadCitiesByProvince(value);
		}
		if (model === 'cityId') {
			this.loadParishByCity(value);
		}
	} else {
		this[model] = value;
	}
	if (model === 'documentNumber') {
		this.searchDocument(value);
	}
}

/* eslint-disable camelcase */
function getGeoPosition({ geometry, formatted_address }) {
	if (geometry) {
		const { location } = geometry;
		this.model.geoPosition = formatted_address;
		this.model.latitude = location.lat();
		this.model.longitude = location.lng();
		this.markersCustom({ lat: location.lat(), lng: location.lng() });
	} else {
		this.model.geoPosition = this.geoPosition;
	}
	this.showMap = true;
}

function getSelectData({ model, value }) {
	if (value) {
		if (model !== 'geoPosition') {
			this.model[model] =
				model === 'codeTaxes' || model === 'codeTaxesGoods' ? value : value.id;
			if (model === 'provinceId') {
				this.loadCitiesByProvince(value.id);
			}
			if (model === 'cityId') {
				this.loadParishByCity(value.id);
			}
		} else {
			this[model] = value;
		}
	}
}

async function loadAccounting() {
	const { company, subsidiary } = this.$userInfo;
	const { country } = company;
	const { ruc } = subsidiary;
	({ data: this.listAccou } = await this.$httpQuipu.get(
		`accounting-accounts/${country.countryCode}/${ruc}/fb`
	));
}

async function loadCitiesByProvince(id) {
	({ data: this.cities } = await this.$httpSales.get(`cities/${id}`));
	this.model.cityId = this.modelData.cityId || null;
	if (this.model.cityId) {
		this.loadParishByCity(this.model.cityId);
	} else {
		this.model.parishId = null;
	}
}

async function loadData() {
	({ data: this.modelData } = await this.$httpSales.get(`suppliers/${this.id}`));
	this.model = {
		accountingBank: this.modelData.accountingBank,
		accountingAccount: Array.isArray(this.modelData.accountingAccount)
		? this.modelData.accountingAccount
		: [],
		// accountingCode: this.modelData.accountingCode,
		accountingTypeId: this.modelData.accountingTypeId,
		additionalInformation: this.modelData.additionalInformation || {},
		address: this.modelData.address,
		bankId: this.modelData.bankId,
		codeTaxes: this.modelData.codeTaxes,
		codeTaxesGoods: this.modelData.codeTaxesGoods,
		commercialName: this.modelData.commercialName,
		contactName: this.modelData.contactName,
		creditDays: this.modelData.creditDays,
		creditLimitation: this.modelData.creditLimitation,
		documentNumber: this.modelData.documentNumber,
		email: this.modelData.email,
		flagActive: Boolean(this.modelData.flagActive),
		flagTypePerson: this.modelData.flagTypePerson,
		geoPosition: this.modelData.geoPosition,
		groupId: this.modelData.groupId,
		id: this.modelData.id,
		latitude: this.modelData.latitude,
		longitude: this.modelData.longitude,
		name: this.modelData.name,
		observation: this.modelData.observation,
		paymentMethod: this.modelData.paymentMethod,
		phone: this.modelData.phone || [],
		postalCode: this.modelData.postalCode,
		typeExpenseId: this.modelData.typeExpenseId,
		zoneId: this.modelData.zoneId,
		flagPerceptionAgent: Boolean(this.modelData.flagPerceptionAgent),
		percentagePerception: this.modelData.percentagePerception,
	};
	if (this.modelData.additionalInformation.typePaymentIds) {
		this.model.additionalInformation.typePaymentIds =
			this.modelData.additionalInformation.typePaymentIds;
	} else {
		this.model.additionalInformation.typePaymentIds = [];
	}
	const indexSupplierType = this.suppliersTypes.findIndex(
		(s) => s.id === this.modelData.supplierTypeId
	);
	this.model.supplierTypeId =
		indexSupplierType > -1 ? this.modelData.supplierTypeId : null;
	this.loadProvinces();
	const dateFormatEnd = format(this.model.additionalInformation.endDate, 'DD/MM/YYYY');
	const dateFormatInit = format(this.model.additionalInformation.initDate, 'DD/MM/YYYY');
	this.onDate(this.model.additionalInformation.endDate, 'endDate');
	this.onDate(this.model.additionalInformation.initDate, 'initDate');
	this.setDate(dateFormatEnd, 'dateWithOutFormatEnd');
	this.setDate(dateFormatInit, 'dateWithOutFormatInit');
	this.markersCustom({
		lat: this.model.latitude,
		lng: this.model.longitude,
	});
}

async function loadParishByCity(id) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
	this.model.parishId = this.modelData.parishId || null;
}

async function loadProvinces() {
	({ data: this.provinces } = await this.$httpSales.get('province'));
	this.model.provinceId = this.modelData.provinceId || null;
	if (this.model.provinceId) {
		this.loadCitiesByProvince(this.model.provinceId);
	} else {
		this.model.cityId = null;
		this.model.parishId = null;
	}
}

async function loadResources() {
	const request = [
		this.$httpSales.get('group', {
			params: { typeEntityId: typeEntityId.Supplier },
		}),
		this.$httpSales.get('type-person'),
		this.typeExpensesList(),
		this.$httpSales.get('zone'),
		this.getTypePayments('purchases'),
		this.getBanks(),
		this.getAccountType(),
		this.$httpSales.get('supplier-type'),
		this.$httpSales.get('type-transaction-supplier'),
		this.getPaymentsMethods(),
	];
	[
		{ data: this.groups },
		{ data: this.typeDocuments },
		{ data: this.typeExpenses },
		{ data: this.zones },
		{ data: this.typePayments },
		{ data: this.banks },
		{ data: this.accountTypes },
		{ data: this.suppliersTypes },
		{ data: this.transactionsTypes },
		{ data: this.paymentsMethods },
	] = await Promise.all(request);
	if (this.$userInfo.subsidiary.settings.flagWithholdingAgent && this.isEcuador) {
		this.retentions = this.$httpSales.get(`catalog-sunat-details-list/${IvaRetention}`);
		this.taxesSupports = this.$httpSales.get('catalog-sunat-details-list/04');
	}
	this.groups = this.groups.map((g) => {
		const newGroup = { ...g };
		newGroup.fullName = `${g.name} - ${g.description}`;
		return newGroup;
	});
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
	this.taxesSupports = this.taxesSupports.map((ts) => {
		const newTs = { ...ts };
		newTs.autocomplete = `${ts.code} - ${ts.description}`;
		return newTs;
	});
	this.paymentsMethods.unshift({ name: 'TODOS', id: null });
	const personsLegal = this.typeDocuments.filter((person) => person.flagLegal === 1);
	const personsNotLegal = this.typeDocuments.filter(
		(person) => person.code !== 'ruc' && person.flagLegal === null
	);
	this.typeDocuments = personsLegal.concat(personsNotLegal);
	this.ecuadorDefaultValues();
	if (this.id) {
		this.loadData();
	} else {
		this.loadProvinces();
	}
}

function ecuadorDefaultValues() {
	if (this.isEcuador) {
		if (this.suppliersTypes && this.suppliersTypes.length > 0) {
			({ id: this.model.supplierTypeId } = this.suppliersTypes.find(
				(s) => s.code === 'CBE'
			));
		}
		({ id: this.model.additionalInformation.transactionTypeId } =
			this.transactionsTypes.find((s) => s.code === 'LOC'));
	}
}

function markersCustom({ lat, lng }) {
	this.markers.push({ color: 'red', lat, lng, size: 'normal' });
}

function modelValidate(mod) {
	return mod === 'transactionTypeId';
}

function onDate(value, model) {
	this.getAdditionalData({ model, value });
}

function remove(item) {
	const index = this.model.phone.findIndex((number) => number === item);
	if (index > -1) {
		this.model.phone.splice(index, 1);
	}
}

function save() {
	if (this.isAccountingIncomplete) {
		this.showNotification(
			'Debe ingresar el código y el nombre de la cuenta contable, o dejar ambos vacíos.',
			'warning'
		);
		return;
	}
	if (
		this.model.accountingAccount &&
		this.model.accountingAccount[0] &&
		!this.model.accountingAccount[0].code &&
		!this.model.accountingAccount[0].name
	) {
		this.model.accountingAccount = [];
	}
	delete this.model.id;
	this.$emit('save', this.model);
}

function setDate(input, model) {
	this[model] = input;
}

function toogleMap() {
	const show = !this.showMap;
	this.showMap = show && this.markers.length > 0;
}

function validations() {
	const typePerson = this.typeDocuments.find((td) => td.id === this.model.flagTypePerson);
	const newDocument = {
		required,
	};
	if (typePerson && typePerson.configuration) {
		if (typePerson.configuration.validations) {
			this.maxDocument = typePerson.configuration.validations.maxLength || 0;
			this.minDocument = typePerson.configuration.validations.minLength || 0;
			if (typePerson.configuration.validations.maxLength) {
				newDocument.maxLength = maxLength(this.maxDocument);
			}
			if (typePerson.configuration.validations.minLength) {
				newDocument.minLength = minLength(this.minDocument);
			}
			if (this.maxDocument && this.minDocument) {
				if (this.maxDocument === this.minDocument) {
					this.documentMessage = `Es necesario ingresar ${this.minDocument} dígitos`;
				} else {
					this.documentMessage = `Es necesario ingresar entre ${this.minDocument} y ${this.maxDocument} dígitos`;
				}
			} else if (this.minDocument) {
				this.documentMessage = `Ingrese un mínimo de ${this.minDocument} dígitos`;
			} else if (this.maxDocument) {
				this.documentMessage = `Ingrese un máximo de ${this.maxDocument} dígitos`;
			}
		}
	}
	return {
		model: {
			commercialName: {
				required,
			},
			documentNumber: newDocument,
			email: {
				email,
			},
			flagTypePerson: {
				minValue: minValue(1),
				required,
			},
			name: {
				required,
			},
		},
	};
}

async function peruDatosRequest(typePerson, num) {
	const url = `${typePerson}/${num}`;
	const params = { codeCountry: this.labelsByCountry.code };
	try {
		const response = await this.$httpSunat.get(url, { params });
		if (
			String(this.model.documentNumber || '') !== num ||
			this.currentDocumentType !== typePerson
		) {
			return;
		}
		this.model.name = response.data.data.Nombre_completo
			? response.data.data.Nombre_completo
			: response.data.data.nombre || '';
		this.model.commercialName = response.data.data.Nombre_completo
			? response.data.data.Nombre_completo
			: response.data.data.nombre || '';
		this.model.address = response.data.data.domicilio || '';
		if (response.data.data.telefono) {
			this.model.phone.push(response.data.data.telefono);
		}
	} catch (error) {
		if (
			String(this.model.documentNumber || '') === num &&
			this.currentDocumentType === typePerson
		) {
			this.showNotification(
				'Los datos no se consiguieron. Verifique la información o complete el formulario manualmente',
				'info'
			);
			this.clearSearch();
		}
	}
}

function clearSearch() {
	this.model.name = '';
	this.model.commercialName = '';
	this.model.address = '';
	this.model.phone = [];
}

function searchDocument(val) {
	this.model.name = '';
	this.model.commercialName = '';
	const documentNumber = String(val || '');
	let model;
	if (this.isEcuador) {
		model = this.setTypePersonEcu(documentNumber);
	} else if (this.isChile) {
		model = this.setTypePersonChi(documentNumber);
	} else {
		model = this.setTypePersonPer(documentNumber);
	}
	this.currentDocumentType = model;
	if (model && (this.isEcuador || (this.isPeru && (model === 'ruc' || model === 'dni')))) {
		this.peruDatosRequest(model, documentNumber);
	}
	this.model.additionalInformation.taxIdentification = documentNumber;
}

function setTypePersonPer(num) {
	const len = num.length;
	const opts = {
		11: [2, 'ruc'],
		8: [1, 'dni'],
	};
	this.model.flagTypePerson = opts[len] ? opts[len][0] : null;
	return opts[len] ? opts[len][1] : null;
}

function setTypePersonChi(num) {
	const len = num.length;
	let type = null;

	if (len === 10) {
		type = [20, 'cedula'];
	} else if (len === 13) {
		type = [19, 'rut'];
	} else if (len >= 4 && len <= 13) {
		type = [21, 'pasaporte'];
	}

	this.model.flagTypePerson = type ? type[0] : null;
	return type ? type[1] : null;
}

function setTypePersonEcu(num) {
	const len = num.length;
	this.model.flagTypePerson = 7;
	if (len === 13) {
		return 'ruc';
	} else if (len === 10) {
		this.model.flagTypePerson = 8;
		return 'dni';
	}
	this.model.flagTypePerson = null;
	return null;
}

function changeTypePerson({ value }) {
	({ id: this.model.flagTypePerson } = value);
}

function isCredit() {
	return this.model.paymentMethod === 2;
}

function setAccounting({ model, value }) {
	if (model === 'accountingAccountCode') {
		if (this.model.accountingAccount.length === 0) {
			this.model.accountingAccount.push({ code: value.value, name: '' });
		} else {
			this.$set(this.model.accountingAccount[0], 'code', value.value);
		}
	} else if (model === 'accountingAccountName') {
		if (this.model.accountingAccount.length === 0) {
			this.model.accountingAccount.push({ code: '', name: value.value });
		} else {
			this.$set(this.model.accountingAccount[0], 'name', value.value);
		}
	}
}

function data() {
	return {
		account: null,
		accountingCodeName: '',
		accountingName: '',
		accountingCodes: [],
		accountingProperties: ['code'],
		accountTypes: [],
		active: null,
		apiKey: process.env.GOOGLE_MAP_KEY,
		autocompleteItems: [],
		address: '',
		banks: [],
		cities: [],
		companyId: 0,
		dateWithOutFormatEnd: null,
		dateWithOutFormatInit: null,
		documentMessage: '',
		geoPosition: null,
		groups: [],
		currentDocumentType: null,
		showAccounting: false,
		listAccou: [],
		map: '',
		markers: [],
		maxDocument: 0,
		minDocument: 0,
		model: {
			accountingAccount: [],
			accountingBank: '',
			accountingTypeId: null,
			additionalInformation: {
				beneficiaryCode: '',
				endDate: '',
				initDate: '',
				person: '',
				printAuthNumber: '',
				rangeFrom: '',
				rangeUp: '',
				serie: '',
				sriAuthNumber: '',
				taxIdentification: '',
				taxSupportId: null,
				transactionTypeId: null,
				typePaymentIds: [],
			},
			address: '',
			bankId: null,
			cityId: null,
			codeTaxes: null,
			codeTaxesGoods: null,
			commercialName: '',
			contactName: '',
			creditDays: null,
			creditLimitation: null,
			documentNumber: '',
			email: '',
			flagActive: true,
			flagTypePerson: null,
			geoPosition: null,
			groupId: null,
			latitude: null,
			longitude: null,
			name: '',
			observation: '',
			parishId: null,
			paymentMethod: null,
			phone: [],
			postalCode: '',
			provinceId: null,
			supplierTypeId: null,
			typeExpenseId: null,
			zoneId: null,
			flagPerceptionAgent: false,
			percentagePerception: null,
		},
		modelData: {},
		paymentsMethods: [],
		parishes: [],
		provinces: [],
		retentions: [],
		retentionsProperties: ['description'],
		showAddress: false,
		showMap: false,
		suppliersTypes: [],
		tableCodeRetentions: IvaRetention,
		taxesSupports: [],
		transactionsTypes: [],
		typeDocuments: [],
		typeExpenses: [],
		typePayments: [],
		zones: [],
	};
}

export default {
	name: 'suppliers-form',
	components: {
		appDateSelect,
		appSelect,
		autocompleteComponent,
		modalSidebarButton,
		StaticMap,
	},
	computed: {
		isCredit,
		isAccountingIncomplete() {
		if (!this.$userInfo.company.settings.flagShowAccountingEngine) {
			return false;
		}

		const account =
			this.model.accountingAccount && this.model.accountingAccount[0]
				? this.model.accountingAccount[0]
				: {};

		const hasCode = account.code && String(account.code).trim();
		const hasName = account.name && String(account.name).trim();

		return (hasCode && !hasName) || (!hasCode && hasName);
	},
	},
	created,
	data,
	methods: {
		changeTypePerson,
		close,
		ecuadorDefaultValues,
		getAdditionalData,
		getData,
		getGeoPosition: helper.debounce(getGeoPosition),
		getSelectData,
		loadAccounting,
		loadCitiesByProvince,
		loadData,
		loadParishByCity,
		loadProvinces,
		loadResources,
		onDate,
		markersCustom,
		modelValidate,
		remove,
		save,
		setAccounting,
		setDate,
		setTypePersonEcu,
		setTypePersonPer,
		setTypePersonChi,
		toogleMap,
		peruDatosRequest,
		clearSearch,
		searchDocument: helper.debounce(searchDocument),
		setData(value) {
			this.model[value.model] = Number(value.value);
		},
	},
	props: {
		id: {
			type: [Number, String],
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.tabs-form {
	width: 100%;
}

.static-map {
	background-color: map-get($colors, white);
	margin-top: 6px;
	text-align: center;

	img {
		height: 377px;
		margin: 7px auto;
	}
}
</style>
