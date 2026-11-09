<template>
	<div class="page-configuration">
		<header-page
			caption-navigation="Integración"
			:title="$route.meta.title"
			list-subsidiaries
			:subsidiaries="subsidiaries"
			:subsidiary-id="params.subsidiaryId"
			@selected-subsidiary="filterSubsidiary"
		></header-page>
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
					@check-integration="checkIntegration($event, 'switch')"
					@get-data="setMessengerData"
					@open-slide="openConfiguration"
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
				:configuration-template="configurationTemplate"
				:disabled="disabled"
				:errors-quantity="errors.length"
				:form="form"
				:readonly="readonlyForm"
				@accept-action="acceptAction"
				@close-modal="closeModal"
				@get-data="setData"
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
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-auto btn-action py-2 px-4 white--text"
								@click.native="actionLeft">
								{{ dialogBtnLeft }}
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="primary"
								class="btn-auto btn-action py-2 px-4 white--text"
								@click.native="actionRight">
								{{ dialogBtnRight }}
							</v-btn>
						</v-flex>
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

function created() {
	this.loadSubsidiaries();
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
						newIntegration.config = { ...newForm };
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
	}
}

function active(value) {
	if (value === '0') {
		this.warningMessage = 'Integra tu servicio de delivery  para que  aparezca en tu ecommerce.';
	} else if (value === '1') {
		this.warningMessage = 'Integra tu servicio de delivery  para que  aparezca en tu ecommerce.';
	} else if (value === '2') {
		this.warningMessage = 'Integra tu servicio de delivery  para que  aparezca en tu ecommerce.';
	}
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

async function loadData() {
	const params = { subsidiaryId: this.params.subsidiaryId };
	try {
		({ data: this.typeIntegration } = await this.$httpSales(
			`integrations/${TypeEntity.Delivery}`, { params }));
		this.typeIntegration.integrationCategory = this.typeIntegration.integrationCategory.length > 0 ?
			this.typeIntegration.integrationCategory.map((category) => {
				const newCategory = { ...category };
				const newConfigTemplate = { ...category.configTemplate };
				const newConfigTemplateKeys = Object.keys(newConfigTemplate);
				const makiChatKey = newConfigTemplateKeys.find(k => k === 'maki_chat');
				if (makiChatKey) {
					newConfigTemplate.WMAKI = newConfigTemplate[makiChatKey];
				}
				newCategory.configTemplate = { ...newConfigTemplate };
				newCategory.integrations = category.integrations.map((i) => {
					const newI = { ...i };
					newI.configTemplate = newConfigTemplate[i.code];
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
			}) : this.integrationCategory.map((category) => {
				const newCategory = { ...category };
				const newConfigTemplate = { ...category.configTemplate };
				const newConfigTemplateKeys = Object.keys(newConfigTemplate);
				const makiChatKey = newConfigTemplateKeys.find(k => k === 'maki_chat');
				if (makiChatKey) {
					newConfigTemplate.WMAKI = newConfigTemplate[makiChatKey];
				}
				newCategory.configTemplate = { ...newConfigTemplate };
				newCategory.integrations = category.integrations.map((i) => {
					const newI = { ...i };
					newI.configTemplate = newConfigTemplate[i.code];
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
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PROCESS_INTEGRATION_NOT_FOUND') {
				this.showGenericError('El tipo de integración no se ha encontrado.');
			}
		}
	}
}

async function loadSubsidiaries() {
	try {
		({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
		const subsidiary = this.subsidiaries.find(s => s.id === this.$userInfo.comSubsidiariesId);
		const subsidiarySelected = subsidiary || this.subsidiaries[0];
		this.filterSubsidiary({ value: subsidiarySelected });
	} catch (error) {
		this.showGenericError();
	}
}

function openConfiguration({ category, integration, readonly }, open) {
	const { integrationSubsidiary } = integration;
	if (integrationSubsidiary) {
		if (integrationSubsidiary.flagCustomizer && !open && !readonly) {
			this.dialogTitle = 'Esta integración ya está configurada';
			this.dialogMessage = '¿Desea reemplazar esta configuración?';
			this.dialogBtnLeft = 'NO';
			this.dialogBtnRight = 'SÍ';
			this.dialogCode = 'configuration';
			this.dialog = true;
			this.dataSlide = { item: { category, integration } };
		} else {
			this.setFormData(category, integration, readonly, integrationSubsidiary);
		}
	} else if (integration.flagCustomizer && !open && !readonly) {
		this.dialogTitle = 'Esta integración ya está configurada';
		this.dialogMessage = '¿Desea reemplazar esta configuración?';
		this.dialogBtnLeft = 'NO';
		this.dialogBtnRight = 'SÍ';
		this.dialogCode = 'configuration';
		this.dialog = true;
		this.dataSlide = { item: { category, integration } };
	} else {
		this.setFormData(category, integration, readonly);
	}
}

async function saveData() {
	this.loading = true;
	const body = {
		integrationCategory: this.typeIntegration.integrationCategory.map(pc => ({
			code: pc.code,
			name: pc.name,
			integrations: pc.integrations.map(integration => ({
				id: integration.id,
				code: integration.code,
				name: integration.name,
				flagCustomizer: !!integration.flagCustomizer,
				flagActive: !!integration.flagActive,
				config: integration.config,
			})),
		})),
	};
	const params = { subsidiaryId: this.params.subsidiaryId };
	try {
		const { data: dataResponse } = await this.$httpSales.patch('integrations/TID',
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
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function setData({ model, value }) {
	this.$set(this.form[this.configurationCode], model, value);
	const templateKeys = Object.keys(this.configurationTemplate);
	this.disabled = templateKeys.some(k =>
		this.configurationTemplate[k].required && !this.form[this.configurationCode][k]);
}

function setFormData(categoryData, integrationData, readonlyValue, intSubData) {
	const { configTemplate } = categoryData;
	const { code, config, name } = integrationData;
	const { additionalInformation } = intSubData || {};
	this.configurationCode = code;
	this.configurationTemplate = configTemplate[code];
	this.readonlyForm = !!readonlyValue;
	const keysFormByCode = Object.keys(this.configurationTemplate);
	if (readonlyValue) {
		const newConfig = additionalInformation ? additionalInformation.config : config;
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
		configurationCode: null,
		configurationTemplate: {},
		dataDialog: {},
		dataSlide: {},
		dialogTitle: '',
		dialogMessage: '',
		dialogBtnLeft: '',
		dialogBtnRight: '',
		dialogCode: '',
		dialog: false,
		disabled: true,
		disabledValue: true,
		errors: [],
		form: {},
		formMessenger: {},
		integrationCategory: [],
		loading: false,
		params: {
			subsidiaryId: null,
		},
		readonlyForm: false,
		subsidiaries: [],
		tabs: [],
		typeIntegration: {},
		warningMessage: 'Integra tu servicio de delivery  para que  aparezca en tu ecommerce.',
	};
}

export default {
	name: 'page-delivery-integration',
	data,
	components: {
		actionSidebar,
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
		checkIntegration,
		closeModal,
		filterSubsidiary,
		loadData,
		loadSubsidiaries,
		openConfiguration,
		saveData,
		setData,
		setFormData,
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
</style>