<template>
	<div class="page-configuration">
		<header-page
			caption-navigation="Integración"
			:title="$route.meta.title"
			:list-subsidiaries="!flagIntegrationGroup"
			:subsidiaries="subsidiaries"
			:subsidiary-id="params.subsidiaryId"
			@selected-subsidiary="filterSubsidiary"
		></header-page>
		<div v-if="loadingScreen" class="loading-screen">
			<div class="loading-screen-content">
				Espera un momento mientras cargamos la información.
			</div>
		</div>
		<v-tabs
			v-model="active"
			color="grey lighten-3"
			slider-color="primary"
		>
			<v-tab
				v-for="category in typeIntegration.integrationCategory"
				:key="category.id"
			>
				{{ category.name }}
			</v-tab>
			<v-tab-item
				v-for="category in typeIntegration.integrationCategory"
				:key="category.id"
			>
				<section-tab
					:category="category"
					:configuration-template="configurationTemplate"
					:errors-quantity="errors.length"
					:form-messenger="formMessenger"
					:warning-message="warningMessage"
					@check-additional-information="checkAdditionalInformation"
					@check-integration="checkIntegration($event, 'switch')"
					@get-data="setMessengerData"
					@open-slide="openConfiguration"
					@show-errors="showErrors"
				></section-tab>
			</v-tab-item>
		</v-tabs>
		<section class="buttons-configuration">
			<v-layout wrap align-center justify-center class="wrapper-btns">
				<v-flex xs1 mr-4>
					<v-btn
						class="btn-action ml-1"
						color="pink"
						:disabled="loading"
						small
						@click="loadData"
					>
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs1>
					<v-btn
						class="btn-action ml-4"
						color="primary"
						:disabled="disabledSave"
						small
						@click="checkIntegration(dataDialog, 'save')"
					>
						Guardar
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<form-configuration
				v-show="action.code === 'configuration'"
				:code="configurationCode"
				:configuration-template="flagAdditionalInfo ? configurationAdditional : configurationTemplate"
				:disabled="disabled"
				:errors-quantity="errors.length"
				:form="form"
				:readonly="readonlyForm"
				@accept-action="acceptAction"
				@close-modal="closeModal"
				@get-data="setData($event, flagAdditionalInfo)"
			/>
			<form-errors
				v-if="action.code === 'errors'"
				:errors="errors"
			></form-errors>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title v-if="dialogTitle" class="headline">{{ dialogTitle }}</v-card-title>
				<v-card-text :style="!dialogTitle ? 'padding-top: 37px !important' : ''" class="subtext">
					{{ dialogMessage }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-auto btn-action py-2 px-4 white--text"
							@click.native="actionLeft">
							{{ dialogBtnLeft }}
						</v-btn>
						<template v-if="dialogBtnLeftLink.active">
							<a class="href-decoration-none" :href="dialogBtnLeftLink.href" target="_blank">
								<v-btn
									color="primary"
									class="btn-auto btn-action py-2 px-4 white--text"
									@click.native="actionRight"
								>
									{{ dialogBtnRight }}
								</v-btn>
							</a>
						</template>
						<template v-else>
							<v-btn
								color="primary"
								class="btn-auto btn-action py-2 px-4 white--text"
								@click.native="actionRight">
								{{ dialogBtnRight }}
							</v-btn>
						</template>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import formConfiguration from '@/components/integration/form-configuration';
import formErrors from '@/components/integration/form-errors';
import headerPage from '@/components/shared/header-page';
import sectionTab from '@/components/integration/section-tab';
import TypeEntity from '@/shared/type-entity';
import DataFastConfigurationForm from '@/components/integration/datafast/datafast-configuration-form';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function created() {
	this.flagIntegrationGroup = this.$userInfo.company.settings.flagTypeIntegrationGrouper;
	if (!this.flagIntegrationGroup) {
		this.loadSubsidiaries();
	} else {
		this.loadData();
	}
}

function acceptAction(readonlyAction) {
	if (!readonlyAction) {
		this.typeIntegration.integrationCategory = this.typeIntegration.integrationCategory
			.map((pc) => {
				const newPc = { ...pc };
				newPc.integrations = pc.integrations.map((integration) => {
					const newIntegration = { ...integration };
					if (integration.code === this.configurationCode ||
						integration.code === this.configurationCode.toLowerCase()) {
						const newForm = this.form[this.configurationCode];
						const configProp = this.flagAdditionalInfo ? 'configAdditional' : 'config';
						newIntegration[configProp] = { ...newForm };
						newIntegration.flagCustomizer = true;
					}
					return newIntegration;
				});
				return newPc;
			});
		this.typeIntegration.integrations = this.typeIntegration.integrationCategory.reduce((a, ic) =>
			a.concat(ic.integrations), []);
		this.disabledValue = this.typeIntegration.integrations ?
			this.typeIntegration.integrations.every(ph => !ph.flagCustomizer) : true;
	}
	this.closeModal();
}

function actionLeft() {
	if (this.dialogBtnLeft === 'NO') {
		this.dialog = false;
		this.dialogCode = false;
		this.dataSlide = {};
		this.dialogTitle = '';
		this.dialogMessage = '';
		this.dialogBtnLeft = '';
		this.dialogBtnRight = '';
	} else if (this.dialogCode === 'link-activate') {
		this.closeDialog();
	}
}

function actionRight() {
	if (this.dialogBtnRight === 'SÍ') {
		if (this.dialogCode === 'configuration') {
			const { item } = this.dataSlide;
			this.openConfiguration(
				{ category: item.category, integration: item.integration }, true,
			);
		} else if (this.dialogCode === 'switch') {
			this.checkIntegration(this.dataDialog);
		} else if (this.dialogCode === 'finish') {
			this.checkIntegration(this.dataDialog, this.dialogCode);
		}
	} else if (this.dialogCode === 'link-activate') {
		this.mercadoPagoClicks = this.mercadoPagoClicked;
		this.closeDialog();
	}
}

function active(value) {
	if (value === '0') {
		this.warningMessage = 'Integra tu pasarela de pago para que aparezca en tu ecommerce.';
	} else if (value === '1') {
		this.warningMessage = 'Integra tu pasarela de pago para que aparezca en tu ecommerce.';
	} else if (value === '2') {
		this.warningMessage = 'Integra tu pasarela de pago para que aparezca en tu ecommerce.';
	}
}

function checkAdditionalInformation({ category, integration }) {
	this.flagAdditionalInfo = true;
	this.configurationCode = integration.code;
	this.configurationAdditional = this.getAdditionalInformationIfExist(
		integration, category, this.configurationCode,
	);
	this.$set(this.form, this.configurationCode, {});
	Object.keys(this.configurationAdditional).forEach((k) => {
		this.$set(this.form[this.configurationCode], k, this.configurationAdditional[k]);
	});
	this.openModal('configuration', this.configurationCode);
}

function getAdditionalInformationIfExist(integration, category, code) {
	const { configAdditional } = category;
	const fields = configAdditional[code];
	const findAdditionalInformation = getDeeper('integrationSubsidiary', 'additionalInformation');
	const additionalInformation = findAdditionalInformation(integration);
	if (additionalInformation) {
		Object.keys(additionalInformation).forEach((key) => {
			if (fields[key]) {
				fields[key].options = additionalInformation[key].options || fields[key].options;
			}
		});
	}
	this.readonlyForm = false;
	return fields;
}

function openModal(code, title) {
	this.action.code = code;
	this.action.title = `Configurar - ${title}`;
	this.action.open = true;
}

function checkIntegration({ category, integration }, type) {
	const newIntegration = integration || this.typeIntegration.integrations.find(int =>
		int.integrationSubsidiary.flagActive);
	const newCategory = category || this.typeIntegration.integrationCategory.find(cat =>
		cat.code === newIntegration.codeCategory);
	if (type === 'switch') {
		this.dialogMessage = newIntegration.flagActive ?
			`¿Desea quitar la selección de ${newIntegration.name} como servicio de ${newCategory.name}?`
			: `¿Desea seleccionar ${newIntegration.name} como servicio de ${newCategory.name}?`;
		this.dialogBtnLeft = 'NO';
		this.dialogBtnRight = 'SÍ';
		this.dialog = true;
		this.dialogCode = type;
		this.dataDialog = { category: newCategory, integration: newIntegration };
	} else if (type === 'save') {
		const messageValid = this.typeIntegration.integrations.some(i => i.flagActive);
		this.dialogMessage = messageValid ?
			`¿Desea guardar ${newIntegration.name} como servicio de ${newCategory.name}?` :
			'No ha seleccionado ninguna integración como servicio. ¿Desea guardar las configuraciones realizadas?';
		this.dialogBtnLeft = 'NO';
		this.dialogBtnRight = 'SÍ';
		this.dialog = true;
		this.dialogCode = 'finish';
		this.dataDialog = { category: newCategory, integration: newIntegration };
	} else {
		this.typeIntegration.integrationCategory = this.typeIntegration.integrationCategory.map((c) => {
			const newCat = { ...c };
			if (category.id === c.id) {
				newCat.integrations = c.integrations.map((i) => {
					const newInt = { ...i };
					if (type !== 'finish') {
						newInt.flagActive = (integration.id === i.id && !i.flagActive);
					}
					return newInt;
				});
			}
			return newCat;
		});
		this.typeIntegration.integrations = this.typeIntegration.integrationCategory
			.reduce((a, ic) => a.concat(ic.integrations), []);
		this.disabledValue = this.typeIntegration.integrations ?
			this.typeIntegration.integrations.every(ph => !ph.flagCustomizer) : true;
		this.actionLeft();
		if (type === 'finish') {
			this.saveData();
		}
	}
}

function closeDialog() {
	this.dialog = false;
	this.dialogTitle = '';
	this.dialogMessage = '';
	this.dialogBtnLeft = '';
	this.dialogBtnRight = '';
	this.dialogCode = '';
	this.dataSlide = {};
	this.dialogBtnLeftLink = {
		active: false,
		href: '',
	};
	this.mercadoPagoClicked = 0;
	this.mercadoPagoClicks = 0;
}

function closeModal() {
	this.action.open = false;
	this.configurationCode = null;
	this.configurationTemplate = {};
	this.form = {};
}

function disabledSave() {
	return this.loading || this.disabledValue;
}

function filterSubsidiary({ value }) {
	this.params.subsidiaryId = value.id;
	this.loadData();
}

function linkActivateValid({ category, integration, readonly }, open) {
	if (this.mercadoPagoClicked === this.mercadoPagoClicks) {
		this.loadingScreen = true;
		this.loadData('link-activate', { category, integration, readonly }, open);
	} else {
		this.dialogTitle = 'Es necesario estar asociado para continuar con la configuración';
		this.dialogMessage = '¿Desea asociarse a Mercado Pago?';
		this.dialogBtnLeft = 'NO, LUEGO';
		this.dialogBtnLeftLink = {
			active: true,
			href: integration.urlLinkActivate,
		};
		this.dialogBtnRight = 'SÍ, ASOCIAR AHORA';
		this.dialogCode = 'link-activate';
		this.dialog = true;
		this.dataSlide = { item: { category, integration } };
	}
	this.mercadoPagoClicked += 1;
	this.loadingScreen = false;
}

async function loadData(code, validData, open) {
	const params = { subsidiaryId: this.params.subsidiaryId };
	({ data: this.typeIntegration } = await this.$httpSales(
		`integrations/${TypeEntity.PaymentGateway}`, { params }));
	this.typeIntegration.integrationCategory = this.typeIntegration.integrationCategory.length > 0 ?
		this.typeIntegration.integrationCategory.map((cat) => {
			const newCategory = { ...cat };
			newCategory.integrations = cat.integrations.map((i) => {
				const newI = { ...i };
				newI.configTemplate = cat.configTemplate[i.code];
				newI.config = {};
				if (i.integrationSubsidiary) {
					newI.flagActive = i.integrationSubsidiary.flagCustomizer ?
						i.integrationSubsidiary.flagActive : false;
					newI.flagCustomizer = i.integrationSubsidiary.flagCustomizer;
					newI.seeConfig = i.integrationSubsidiary.flagCustomizer;
				} else {
					newI.flagActive = i.flagCustomizer ? i.flagActive : false;
					newI.flagCustomizer = i.flagCustomizer;
					newI.seeConfig = i.flagCustomizer;
				}
				newI.open = false;
				return newI;
			});
			return newCategory;
		}) : this.integrationCategory.map((cat) => {
			const newCategory = { ...cat };
			newCategory.integrations = cat.integrations.map((i) => {
				const newI = { ...i };
				newI.configTemplate = cat.configTemplate[i.code];
				newI.config = {};
				if (i.integrationSubsidiary) {
					newI.flagActive = i.integrationSubsidiary.flagCustomizer ?
						i.integrationSubsidiary.flagActive : false;
					newI.flagCustomizer = i.integrationSubsidiary.flagCustomizer;
					newI.seeConfig = i.integrationSubsidiary.flagCustomizer;
				} else {
					newI.flagActive = i.flagCustomizer ? i.flagActive : false;
					newI.flagCustomizer = i.flagCustomizer;
					newI.seeConfig = i.flagCustomizer;
				}
				newI.open = false;
				return newI;
			});
			return newCategory;
		});
	this.typeIntegration.integrations = this.typeIntegration.integrationCategory.reduce((a, i) =>
		a.concat(i.integrations), []);
	this.disabledValue = this.typeIntegration.integrations ?
		this.typeIntegration.integrations.every(ph => !ph.flagCustomizer) : true;
	if (code === 'link-activate') {
		const { category, integration, readonly } = validData;
		this.setLinkActivateData(code, { category, integration, readonly }, open);
	}
}

async function loadSubsidiaries() {
	const params = {
		flagActive: true,
	};
	try {
		({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries', { params }));
		const subsidiary = this.subsidiaries.find(s => s.flagCompanyDefault === 1);
		const subsidiarySelected = subsidiary || this.subsidiaries[0];
		this.filterSubsidiary({ value: subsidiarySelected });
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function openConfiguration({ category, integration, readonly }, open) {
	this.flagAdditionalInfo = false;
	const { integrationSubsidiary, urlLinkActivate } = integration;
	const customizerValidate = integrationSubsidiary ? integrationSubsidiary.flagCustomizer :
		integration.flagCustomizer;
	if (customizerValidate && !open && !readonly) {
		this.setDialogInfo(category, integration);
	} else if (!customizerValidate && urlLinkActivate && !open && !readonly) {
		this.linkActivateValid({ category, integration, readonly }, open);
	} else {
		this.setFormData(category, integration, readonly, integrationSubsidiary);
	}
}

async function saveData() {
	this.loading = true;
	// const configAdditional = this.configurationAdditional;
	const configAdditional = this.savingAdditionalInfo;
	const body = {
		integrationCategory: this.typeIntegration.integrationCategory.map(pc => ({
			code: pc.code,
			name: pc.name,
			integrations: pc.integrations.map((integration) => {
				const configBase = integration.integrationSubsidiary &&
					integration.integrationSubsidiary.additionalInformation.config ?
					integration.integrationSubsidiary.additionalInformation.config : {};
				const NewConfig = integration.config && Object.keys(integration.config).length > 0 ?
					integration.config : configBase;
				return {
					id: integration.id,
					code: integration.code,
					name: integration.name,
					flagCustomizer: !!integration.flagCustomizer,
					flagActive: !!integration.flagActive,
					config: NewConfig || {},
					// configAdditional: configAdditional || {},
					configAdditional: configAdditional[integration.code] || {},
				};
			}),
		})),
	};
	const params = { subsidiaryId: this.params.subsidiaryId };
	try {
		const { data: dataResponse } = await this.$httpSales.patch('integrations/TIP',
			body, { params });
		this.errors = dataResponse.allResponseServices.reduce((acc, res) => {
			const { nameIntegration, responseIntegration } = res;
			if (responseIntegration) {
				const { message, success } = responseIntegration;
				if (!success && message) {
					acc.push({ message, name: nameIntegration });
				}
			}
			return acc;
		}, []);
		this.showNotification('La integración ha sido configurada correctamente.');
		this.loadData();
		this.flagAdditionalInfo = false;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function setAdditionalInformationData({ model, value, creditCard }) {
	if (creditCard) {
		const ccSaved = this.form[this.configurationCode][model];
		const existInForm = ccSaved && ccSaved.options && ccSaved.options.length > 0;

		if (existInForm) {
			const indexInForm = ccSaved.options.findIndex(cc => cc.code === creditCard.code);

			if (indexInForm > -1) {
				ccSaved.options.splice(indexInForm, 1, creditCard);
			} else {
				const newCreditCards = [].concat(ccSaved.options, creditCard);
				this.$set(this.form[this.configurationCode][model], 'options', newCreditCards);
			}
		} else {
			this.$set(this.form[this.configurationCode], model, [creditCard]);
		}
	} else {
		this.$set(this.form[this.configurationCode][model], 'options', value);
	}
}

function setData(ev, flagAdditionalInfo) {
	const { model, value, creditCard } = ev;
	if (flagAdditionalInfo) {
		this.setAdditionalInformationData({ model, value, creditCard });
	} else {
		this.$set(this.form[this.configurationCode], model, value);
	}

	// guardar form en otra variable que se consultará en el servicio
	// actualizar
	this.savingAdditionalInfo = this.form;

	// validación de campos
	const configuration = flagAdditionalInfo
		? this.configurationAdditional : this.configurationTemplate;
	const templateKeys = Object.keys(configuration);
	this.disabled = templateKeys.some(k =>
		configuration[k].required && !this.form[this.configurationCode][k]);
}

function setDialogInfo(category, integration) {
	this.dialogTitle = 'Esta integración ya está configurada';
	this.dialogMessage = '¿Desea reemplazar esta configuración?';
	this.dialogBtnLeft = 'NO';
	this.dialogBtnRight = 'SÍ';
	this.dialogCode = 'configuration';
	this.dialog = true;
	this.dataSlide = { item: { category, integration } };
}

function setFormData(categoryData, integrationData, readonlyValue, intSubData) {
	const { configTemplate, configAdditional } = categoryData;
	const { code, config, name } = integrationData;
	const { additionalInformation } = intSubData || {};
	this.configurationCode = code;
	this.configurationTemplate = this.flagAdditionalInfo
		? configAdditional[code]
		: configTemplate[code];
	this.readonlyForm = !!readonlyValue;
	const keysFormByCode = Object.keys(this.configurationTemplate);
	if (readonlyValue) {
		const newConfig = additionalInformation ? additionalInformation.config || config : config;
		this.action.code = 'configuration';
		this.action.title = `Datos ingresados - ${name}`;
		this.action.open = true;
		this.$set(this.form, this.configurationCode, {});
		keysFormByCode.forEach((k) => {
			this.$set(this.form[this.configurationCode], k, newConfig[k]);
		});
	} else {
		this.action.code = 'configuration';
		this.action.title = `Configurar - ${name}`;
		this.action.open = true;
		this.$set(this.form, code, {});
		keysFormByCode.forEach((k) => {
			this.$set(this.form[code], k, null);
		});
	}
	this.actionLeft();
}

function setLinkActivateData(code, { category, integration, readonly }, open) {
	if (code === 'link-activate') {
		this.active = '1';
		this.openConfiguration({ category, integration, readonly }, open);
	}
}

function setMessengerData({ code, content }) {
	const { model, value } = content;
	this.$set(this.formMessenger[code], model, value);
}

function showErrors() {
	this.action.code = 'errors';
	this.action.title = 'ERRORES DE INTEGRACIONES';
	this.action.open = true;
}

function data() {
	return {
		action: {
			code: null,
			open: false,
			title: '',
			width: 357,
		},
		active: '0',
		configurationAdditional: {},
		configurationCode: null,
		configurationTemplate: {},
		dataDialog: {},
		dataSlide: {},
		flagIntegrationGroup: null,
		dialogTitle: '',
		dialogMessage: '',
		dialogBtnLeft: '',
		dialogBtnRight: '',
		dialogCode: '',
		dialogBtnLeftLink: {
			active: false,
			href: '',
		},
		dialog: false,
		disabled: true,
		disabledValue: true,
		errors: [],
		flagAdditionalInfo: false,
		form: {},
		formMessenger: {},
		integrationCategory: [],
		loading: false,
		loadingScreen: false,
		mercadoPagoClicked: 0,
		mercadoPagoClicks: 0,
		params: {
			subsidiaryId: null,
		},
		readonlyForm: false,
		savingAdditionalInfo: {},
		subsidiaries: [],
		tabs: [],
		typeIntegration: {},
		warningMessage: 'Integra tu pasarela de pago para que aparezca en tu ecommerce.',
	};
}

export default {
	name: 'page-payment-gateway',
	data,
	components: {
		actionSidebar,
		DataFastConfigurationForm,
		formConfiguration,
		formErrors,
		headerPage,
		sectionTab,
	},
	computed: {
		disabledSave,
	},
	created,
	methods: {
		acceptAction,
		actionLeft,
		actionRight,
		checkAdditionalInformation,
		checkIntegration,
		closeDialog,
		closeModal,
		filterSubsidiary,
		getAdditionalInformationIfExist,
		linkActivateValid,
		loadData,
		loadSubsidiaries,
		openConfiguration,
		openModal,
		saveData,
		setAdditionalInformationData,
		setData,
		setDialogInfo,
		setFormData,
		setLinkActivateData,
		setMessengerData,
		showErrors,
	},
	watch: {
		active,
	},
};
</script>
<style lang="scss">
.page-configuration {
	.buttons-configuration {
		background-color: white;
		bottom: 0%;
		left: 0px;
		padding: 12px 0;
		position: fixed;
		right: 0px;
		width: 100%;
		z-index: 2;
	}

	.tabs__container {
		padding: 0 100px;
	}

	.tabs__item--active {
		background: color(maki-grey) !important;
		color: color(primary);
		font-weight: 600;
	}

	.tabs__item {
		background: color(silver-detail);
		padding: 5px 36px;
	}

	.tabs__slider-wrapper {
		z-index: 4;
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
	padding: 0px !important;
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

.href-decoration-none {
	text-decoration: none !important;
}

.loading-screen {
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
    bottom: 0;
	color: color(paginationText);
	display: flex;
	font-family: font(open-bold);
	font-size: size(small13);
    height: 100vh;
	justify-content: center;
    left: 0;
    margin: auto;
    position: absolute;
    right: 0;
    top: 0px;
    width: 100vw;
	z-index: 11;

	&-content {
		background-color: color(maki-white);
		border: 2px solid color(background-sidebar);
		border-radius: 5px;
		padding: 10px 15px;
	}
}
</style>
