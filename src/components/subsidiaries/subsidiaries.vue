<template>
	<div class="warehouse">
		<header-page :title="this.$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<div class="overflow-auto">
			<v-layout mt-5>
				<v-flex xs12>
					<app-table
						name="subsidiaries"
						v-on:on-page="changePage"
						:columns="columns"
						:current-page="currentPage"
						:inputSearch="false"
						:rows="rows"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(columns, 1)">
								{{ props.row.ruc }}
							</td>
							<td v-show="showRow(columns, 2)">{{ props.row.sucursalName }}</td>
							<td v-show="showRow(columns, 3)">{{ props.row.fullName }}</td>
							<td v-show="showRow(columns, 4)">{{ props.row.address }}</td>
							<td v-show="showRow(columns, 5)">{{ props.row.phone }}</td>
							<td v-show="showRow(columns, 6)">{{ props.row.email }}</td>
							<td v-show="showRow(columns, 7)">
								<subsidiaries-flag-taxes
									:flag-taxes="props.row.flagTaxes"
									:type-billing-agreed="props.row.typeBillingAgreed"
								>
								</subsidiaries-flag-taxes>
							</td>
							<td v-show="showRow(columns, 9)">
								<subsidiaries-ambient-tax
									:flag-taxes="props.row.flagTaxes"
									:type-ambient-tax="props.row.typeAmbientTax"
								>
								</subsidiaries-ambient-tax>
							</td>
							<td v-show="showRow(columns, 8)">
								<app-tooltip-button
									color="blue"
									icon="format_list_numbered"
									text="Series"
									@click-icon="openIt('serie', props.row)"
								>
								</app-tooltip-button>
								<app-tooltip-button
									v-if="showLoyalty"
									color="green"
									icon="settings"
									text="Configurar Puntos"
									@click-icon="openDialogPoint(props.row)"
								></app-tooltip-button>
								<app-tooltip-button
									color="green"
									icon="edit"
									text="Editar"
									@click-icon="openIt('subsidiary', props.row)"
								>
								</app-tooltip-button>
							</td>
						</template>
					</app-table>
				</v-flex>
			</v-layout>
		</div>
		<v-dialog v-model="dialogPoint" persistent max-width="365">
			<v-card>
				<v-layout
					row
					justify-space-between
					align-center
					pa-3
					px-3
					class="background-dialog"
				>
					<v-flex class="title-dialog">
						{{ nameSubsidiary }}
					</v-flex>
					<v-flex text-xs-right>
						<button @click="closeDialog">
							<v-icon color="primary">clear</v-icon>
						</button>
					</v-flex>
				</v-layout>
				<v-divider></v-divider>
				<v-card-text>
					<v-flex xs12>
						<v-layout row align-center justify-space-between>
							<v-flex>
								<app-input-text
									:label="currencyName"
									model="amount"
									type="number"
									:text="config.amount"
									@input="setDataConfig"
								></app-input-text>
							</v-flex>
							<v-flex class="text-dialog pd-point" mt-3> Gana </v-flex>
							<v-flex>
								<label class="text-dialog">
									<app-input-text
										label="Puntos"
										model="point"
										type="number"
										:text="config.point"
										@input="setDataConfig"
									></app-input-text>
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mt-4>
						<v-layout row align-center justify-space-between>
							<v-flex>
								<label class="text-dialog">
									<app-input-text
										label="Puntos"
										model="pointSoles"
										type="number"
										:text="config.pointSoles"
										@input="setDataConfig"
									></app-input-text>
								</label>
							</v-flex>
							<v-flex px-2 mt-3 class="text-dialog" text-xs-center>
								Equivale en dinero
							</v-flex>
							<v-flex>
								<app-input-text
									:label="currencyName"
									model="amountSoles"
									type="number"
									:text="config.amountSoles"
									@input="setDataConfig"
								></app-input-text>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap justify-center pa-3 px-2 class="background-dialog">
						<v-flex xs12 text-xs-center>
							<button type="button" @click="closeDialog" class="modal-items-btn--cancel">
								Cancelar
							</button>
							<button
								:disabled="$v.$invalid"
								type="button"
								class="modal-items-btn"
								@click="saveConfigPoint"
							>
								Guardar
							</button>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			v-model="action.open"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			:title="action.title"
			:width="action.width"
			@close-modal="closeModal"
		>
			<subsidiaries-form
				v-if="action.code === 'new-subsidiary'"
				:allow-product-free-model="newSubsidiaries.settings.allowProductFree"
				:flag-accounting-automatic-model="flagAccountingAutomatic"
				:flag-accounting-engine-model="flagAccountingEngine"
				:loading="loadingForm"
				:model="newSubsidiaries"
				:withholdingRimpe="newSubsidiaries.settings.withholdingAgent"
				:repeated-ruc="repeatedRuc"
				:acl-code-sub-model="newSubsidiaries.subsidiaryAclCode"
				:with-holding-model="newSubsidiaries.settings.withHolding"
				:flag-billing-cron-model="newSubsidiaries.flagBillingCron"
				:flag-default-model="newSubsidiaries.flagCompanyDefault"
				:flag-detraction-model="newSubsidiaries.settings.flagDetraction"
				:flag-send-copy-email-model="newSubsidiaries.settings.flagSendCopyEmail"
				:can-edit-ruc="canEditRuc"
				@add-additional-data="addAdditionalData"
				@change-flag="changeFlag"
				@change-free="changeFree"
				@close="closeModal"
				@get-data="setData"
				@remove-additional-data="removeAdditionalData"
				@save="saveData"
				@validation-ruc="validationRuc"
				@change-withHolding-rimpe="changeWithHoldingRimpe"
			></subsidiaries-form>
			<subsidiaries-series
				v-if="action.code === 'SE'"
				:subsidiary-id="currentSubsidiaryId"
			>
			</subsidiaries-series>
			<companies-sunat
				v-if="action.code === 'electronic-billing'"
				:subsidiaries="rows"
				@close-modal="closeModal"
				@sunat-success="sunatSuccess"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import companiesSunat from '@/pages/companies/companies-sunat';
import headerPage from '@/components/shared/header-page';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import subsidiariesForm from '@/components/subsidiaries/subsidiaries-form';
import subsidiariesFlagTaxes from '@/components/subsidiaries/subsidiaries-flag-taxes';
import subsidiariesAmbientTax from '@/components/subsidiaries/subsidiaries-ambient-tax';
import subsidiariesSeries from '@/components/subsidiaries/subsidiaries-series';
import jsonCountries from '@/i18n/constants/format-country.json';

const { getDeeper } = lib;

function created() {
	const column = this.columns.find((c) => c.id === 7);
	this.$set(column, 'name', this.labelsByCountry.taxAgency);
	this.loadData();
	this.showLoyalty = this.$userInfo.company.flagLoyalti === 1;
	const company = this.$userInfo.company;
	this.currencyName =
		(company.currencyDefault && company.currencyDefault.name) ||
		this.jsonCountries[this.$userInfo.company.country.countryCode].currencyPlural;
}

function addAdditionalData(additionalModel) {
	const indexEdit = this.newSubsidiaries.settings.additionalInformation.length;
	this.$set(this.newSubsidiaries.settings.additionalInformation, indexEdit, {
		...additionalModel,
	});
}

function changeFlag({ model, value }) {
	if (model === 'subsidiaryAclCode') {
		this[model] = value.id;
	} else if (model === 'flagBillingCron') {
		this.newSubsidiaries[model] = Number(value);
	} else if (model === 'flagDetraction' || model === 'flagSendCopyEmail') {
		this.newSubsidiaries.settings[model] = value;
	} else {
		this[model] = value;
	}
}

function changeWithHoldingRimpe({ model, value }) {
	this.newSubsidiaries.settings[model] = value;
}

function changeFree({ model, value }) {
	if (model === 'allowProductFree') {
		this.allowProductFree = value;
	}
	this.newSubsidiaries.settings[model] = value;
	this.updateConfigInLocalStorage();
}

function updateConfigInLocalStorage() {
	const adminUser = helper.getLocalData('admin-user');
	adminUser.subsidiary = { ...this.newSubsidiaries };
	helper.setLocalData('admin-user', adminUser);
}

function changePage(page) {
	this.currentPage = page;
}

function clearModal() {
	this.newSubsidiaries = Object.assign({}, this.default);
}

function closeModal() {
	this.action.code = '';
	this.action.open = false;
	this.clearModal();
}

async function loadData() {
	try {
		const response = await this.subsidiariesList();
		this.rows = response.data;
		this.rows = this.rows.map((el) => {
			const newEl = { ...el };
			const { settings } = el;
			newEl.fullName = `${newEl.contactName} ${newEl.contactLastname}`;
			if (settings) {
				if (settings.additionalInformation) {
					newEl.settings = { ...settings };
				} else {
					newEl.settings = { ...settings, additionalInformation: [] };
				}
			} else {
				newEl.settings = { allowProductFree: false, additionalInformation: [] };
			}
			return newEl;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function loadingForm() {
	const { sucursalName, ruc, rzSocial, sucursalCode } = this.newSubsidiaries;
	return (
		!sucursalName ||
		!ruc ||
		!rzSocial ||
		!sucursalCode ||
		this.isLoading ||
		this.repeatedRuc ||
		this.checkBlankCode(sucursalCode)
	);
}

function canEditRuc() {
	return (
		!this.newSubsidiaries.id ||
		this.newSubsidiaries.flagTaxes !== 1 ||
		this.$userInfo.roleCode === 'SUPPORT'
	);
}

function openIt(code, subsidiaries = {}) {
	if (code === 'subsidiary') {
		this.action.code = 'new-subsidiary';
		this.action.title = subsidiaries.sucursalName
			? `Editar Empresa: ${subsidiaries.sucursalName}`
			: 'Nueva Empresa';
		this.newSubsidiaries = subsidiaries.sucursalName
			? { ...subsidiaries }
			: { ...this.default };
		this.originalRuc = subsidiaries.ruc || null;
		this.newSubsidiaries.settings = subsidiaries.settings
			? { ...subsidiaries.settings }
			: { allowProductFree: false, additionalInformation: [] };
		if (!getDeeper('settings', 'allowProductFree')(this.newSubsidiaries)) {
			this.settings = {
				allowProductFree: false,
				additionalInformation: [],
			};
		}
		this.allowProductFree =
			getDeeper('settings', 'allowProductFree')(this.newSubsidiaries) || false;
		this.withHolding =
			getDeeper('settings', 'flagWithHolding')(this.newSubsidiaries) || false;
		this.action.open = true;
	} else if (code === 'serie') {
		this.currentSubsidiaryId = subsidiaries.id;
		this.action.code = 'SE';
		this.action.title = `${subsidiaries.sucursalName} - Series`;
		this.action.open = true;
	}
}

function removeAdditionalData({ label, value }) {
	const { settings } = this.newSubsidiaries;
	const { additionalInformation } = settings;
	const indexAdditionalData = additionalInformation.findIndex(
		(ad) => ad.label === label && ad.value === value
	);
	if (indexAdditionalData > -1) {
		this.newSubsidiaries.settings.additionalInformation.splice(indexAdditionalData, 1);
	}
}

function runAction(action) {
	this.action.code = action.code;
	this.action.title =
		action.code === 'new-subsidiary' ? 'Nueva Empresa' : 'Facturación Electrónica';
	if (this.action.code === 'new-subsidiary') {
		this.newSubsidiaries = { ...this.default };
		this.allowProductFree = false;
	}
	this.action.open = true;
}

async function saveData() {
	this.isLoading = true;
	const id = this.newSubsidiaries.id;
	const url = id ? `subsidiaries/${id}` : 'subsidiaries';
	const method = id ? 'patch' : 'post';
	const ruc = this.canEditRuc ? this.newSubsidiaries.ruc : this.originalRuc;
	const body = {
		ruc: ruc.replace(/\s/g, ''),
		rzSocial: this.newSubsidiaries.rzSocial,
		sucursalName: this.newSubsidiaries.sucursalName,
		ubigeo: this.newSubsidiaries.ubigeo,
		sucursalCode: this.newSubsidiaries.sucursalCode,
		phone: this.newSubsidiaries.phone,
		address: this.newSubsidiaries.address,
		contactName: this.newSubsidiaries.contactName,
		contactLastname: this.newSubsidiaries.contactLastname,
		email: this.newSubsidiaries.email,
		urlImage: this.newSubsidiaries.urlImage,
		latitude: -12.0460631,
		longitude: -77.0401732,
		subsidiaryAclCode: this.subsidiaryAclCode || undefined,
		urlLogo: this.newSubsidiaries.urlLogo,
		flagAccountingEngine: this.flagAccountingEngine,
		flagAccountingAutomatic: this.flagAccountingAutomatic,
		flagCompanyDefault: Boolean(this.flagCompanyDefault) || undefined,
		flagBillingCron: this.newSubsidiaries.flagBillingCron,
		districtId: this.newSubsidiaries.districtId,
		provinceId: this.newSubsidiaries.provinceId,
		departmentId: this.newSubsidiaries.departmentId,
		settings: {
			configLoyalti:
				this.newSubsidiaries.settings && this.newSubsidiaries.settings.configLoyalti
					? this.newSubsidiaries.settings.configLoyalti
					: null,
			flagWithholdingAgent: this.newSubsidiaries.settings.withHolding,
			allowProductFree: this.newSubsidiaries.settings.allowProductFree,
			withHolding: this.newSubsidiaries.settings.withHolding,
			flagDetraction: this.newSubsidiaries.settings.flagDetraction,
			flagSendCopyEmail: this.newSubsidiaries.settings.flagSendCopyEmail,
			numberMtc: this.newSubsidiaries.settings.numberMtc,
		},
	};
	if (this.newSubsidiaries.settings.additionalInformation.length > 0) {
		body.settings.additionalInformation =
			this.newSubsidiaries.settings.additionalInformation;
	}
	if (this.isEcuador) {
		body.settings.withholdingAgent =
			Number(this.newSubsidiaries.settings.withholdingAgent) || null;
		body.settings.rimpe = Boolean(this.newSubsidiaries.settings.rimpe) || null;
	}
	if (this.newSubsidiaries.departmentId) {
		if (!this.newSubsidiaries.provinceId || !this.newSubsidiaries.districtId) {
			const message = this.newSubsidiaries.provinceId
				? 'el distrito'
				: 'la provincia y el distrito';
			this.showGenericError(
				`Has seleccionado el departamento. Por favor seleccione ${message} correspondientes`
			);
			this.isLoading = false;
			return;
		}
	}
	try {
		await this.$httpSales[method](url, body);
		this.action.open = false;
		this.showNotification('Transacción exitósa');
		this.loadData();
		this.closeModal();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function setData({ model, value }) {
	if (model === 'numberMtc') {
		this.newSubsidiaries.settings[model] = value;
	} else {
		this.newSubsidiaries[model] = value;
	}
}

function sunatSuccess({ subsidiary, typeAmbientTax, typeBillingAgreed }) {
	const subsidiaryIndex = this.rows.findIndex(
		(r) => r[this.labelsByCountry.subsidiaryValue] === subsidiary
	);
	if (subsidiaryIndex > -1) {
		this.rows[subsidiaryIndex].flagTaxes = 1;
		if (typeAmbientTax !== undefined) {
			this.rows[subsidiaryIndex].typeAmbientTax = typeAmbientTax;
		}
		if (typeBillingAgreed !== undefined) {
			this.rows[subsidiaryIndex].typeBillingAgreed = typeBillingAgreed;
		}
	}
}

function validationRuc() {
	const { id, ruc } = this.newSubsidiaries;
	const index = this.rows.findIndex((r) => r.ruc === ruc && r.id !== id);
	this.repeatedRuc = index > -1;
}

function openDialogPoint(row) {
	this.dialogPoint = true;
	this.nameSubsidiary = row.sucursalName;
	this.idSubsidiary = row.id;
	if (row.settings.configLoyalti) {
		this.config = {
			pointSoles: row.settings.configLoyalti.equivalentMoney.point,
			amountSoles: row.settings.configLoyalti.equivalentMoney.cost,
			point: row.settings.configLoyalti.equivalentPoint.point,
			amount: row.settings.configLoyalti.equivalentPoint.suns,
		};
	}
}

function closeDialog() {
	this.dialogPoint = false;
	this.nameSubsidiary = '';
	this.idSubsidiary = null;
	this.config = {
		point: null,
		amount: null,
		pointSoles: null,
		amountSoles: null,
	};
}

async function saveConfigPoint() {
	const body = {
		subsidiaryId: this.idSubsidiary,
		configLoyalti: {
			equivalentPoint: {
				suns: this.config.amount,
				point: this.config.point,
			},
			equivalentMoney: {
				point: this.config.pointSoles,
				cost: this.config.amountSoles,
			},
		},
	};
	try {
		await this.$httpSales.post('subsidiaries/point', body);
		this.dialogPoint = false;
		this.showNotification('Los puntos fueron configurados correctamente.');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function setDataConfig({ model, value }) {
	this.config[model] = value;
}

function validations() {
	return {
		config: {
			point: { required },
			amount: { required },
			pointSoles: { required },
			amountSoles: { required },
		},
	};
}

function data() {
	return {
		jsonCountries,
		currencyName: null,
		action: {
			active: false,
			open: false,
			title: '',
			width: 600,
		},
		columns: [
			{ id: 1, name: 'Ruc', value: 'ruc', visible: true, checked: true },
			{
				id: 2,
				name: 'Nombre',
				value: 'sucursalName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Contacto',
				value: 'fullName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Dirección',
				value: 'address',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Teléfono', value: 'phone', visible: true, checked: true },
			{ id: 6, name: 'Correo', value: 'email', visible: true, checked: true },
			{ id: 7, name: 'Sunat', value: 'email', visible: true, checked: true },
			{
				id: 9,
				name: 'Ambiente',
				value: 'typeAmbientTax',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		config: {
			point: null,
			amount: null,
			pointSoles: null,
			amountSoles: null,
		},
		currentSubsidiaryId: 0,
		currentPage: 1,
		flagCompanyDefault: false,
		showLoyalty: false,
		dialogPoint: false,
		idSubsidiary: null,
		originalRuc: null,
		newSubsidiaries: {
			sucursalName: '',
			location: '',
			ubigeo: '',
			sucursalCode: '',
			phone: '',
			address: '',
			contactName: '',
			contactLastname: '',
			email: '',
			urlImage: '',
			urlLogo: '',
			settings: {
				additionalInformation: [],
				allowProductFree: false,
				withHolding: null,
				withholdingAgent: null,
				rimpe: false,
				flagDetraction: false,
				flagSendCopyEmail: false,
				numberMtc: null,
			},
		},
		default: {
			sucursalName: '',
			location: '',
			ubigeo: '',
			sucursalCode: '',
			phone: '',
			address: '',
			contactName: '',
			contactLastname: '',
			email: '',
			urlImage: '',
			urlLogo: '',
			flagBillingCron: 0,
			settings: {
				additionalInformation: [],
				allowProductFree: false,
				withHolding: false,
			},
		},
		subsidiaryAclCode: null,
		isLoading: false,
		repeatedRuc: false,
		rows: [],
		nameSubsidiary: '',
		subsidiaries: [],
		allowProductFree: false,
		flagAccountingEngine: false,
		flagAccountingAutomatic: false,
	};
}

export default {
	name: 'subsidiaries',
	components: {
		actionSidebar,
		appTable,
		appActions,
		companiesSunat,
		headerPage,
		subsidiariesAmbientTax,
		subsidiariesFlagTaxes,
		subsidiariesForm,
		subsidiariesSeries,
	},
	computed: {
		loadingForm,
		canEditRuc,
	},
	created,
	data,
	methods: {
		addAdditionalData,
		changeFlag,
		changeFree,
		changePage,
		clearModal,
		closeDialog,
		closeModal,
		loadData,
		openDialogPoint,
		openIt,
		removeAdditionalData,
		runAction,
		saveConfigPoint,
		saveData,
		setData,
		setDataConfig,
		sunatSuccess,
		updateConfigInLocalStorage,
		validationRuc,
		changeWithHoldingRimpe,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-dialog {
	color: map-get($colors, primary);
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, medium);
	font-weight: 900;
}

.background-dialog {
	background-color: rgba(195, 231, 232, 0.21);
}

.text-dialog {
	color: #464646;
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small);
}

.card__actions {
	margin: 0 !important;
	padding: 0 !important;
}

.modal-items {
	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		font-family: map-get($fonts, lato-bold);
		font-size: 14px;
		color: color(primary);
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			font-family: map-get($fonts, lato-bold);
			font-size: 14px;
			color: color(error);
			margin-right: 20px;
			padding: 4px 15px;
		}
	}
}

.card__text {
	padding: 38px 25px 67px 25px !important;
}

.card {
	border-radius: 12px !important;
}

.pd-point {
	padding: 0 30px;
}
</style>
