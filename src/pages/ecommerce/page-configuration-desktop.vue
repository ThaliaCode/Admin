<template>
	<div>
		<header-page :title="`CONFIGURACIÓN DESKTOP - ${listCommerces.name}`" />
		<v-stepper v-model="step" non-linear>
			<v-stepper-header class="companies-stepper">
				<v-stepper-step step="1" editable :complete="step > 1"
					>Template</v-stepper-step
				>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1" class="step-background">
					<v-flex px-5 mt-4 xs12 px-2 mb-5 pb-5>
						<table-upload-image
							:template="template"
							:theme="theme"
							@set-data="setData"
							@open-slide="openSlide"
						/>
					</v-flex>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<v-layout wrap px-4 mt-4 v-if="action.code === 'CC'">
				<v-flex xs12 px-2>
					<app-input-text
						label="Nombre"
						:text="themeEdit.name"
						@input="onColorChange($event, 'name')"
					></app-input-text>
				</v-flex>
				<v-flex xs12 px-2 mt-3 mb-1>
					<span class="body-2 title-details-table label">Colores: </span>
				</v-flex>
				<v-flex xs12 px-3 mb-3>
					<v-layout>
						<v-flex xs2 mr-3 pt-2 class="detail-title-row label">
							Titulo:
						</v-flex>
						<app-input-text
							style="width: 100px"
							:text="themeEdit.title"
							@input="onColorChange($event, 'title')"
						></app-input-text>
						<input
							type="color"
							id="colorPicker"
							style="margin-left: 5px; margin-top: 2px"
							v-model="themeEdit.title"
							@input="onColorChange($event, 'title')"
						/>
					</v-layout>
				</v-flex>
				<v-flex xs12 px-3 mb-3>
					<v-layout>
						<v-flex xs2 mr-3 pt-2 class="detail-title-row label">
							Border:
						</v-flex>
						<app-input-text
							style="width: 100px"
							:text="themeEdit.border"
							@input="onColorChange($event, 'border')"
						></app-input-text>
						<input
							type="color"
							id="colorPicker"
							style="margin-left: 5px; margin-top: 2px"
							v-model="themeEdit.border"
							@input="onColorChange($event, 'border')"
						/>
					</v-layout>
				</v-flex>
				<v-flex xs12 px-3 mb-3>
					<v-layout>
						<v-flex xs2 mr-3 pt-2 class="detail-title-row label">
							Primario:
						</v-flex>
						<app-input-text
							style="width: 100px"
							:text="themeEdit.primary"
							@input="onColorChange($event, 'primary')"
						></app-input-text>
						<input
							type="color"
							id="colorPicker"
							style="margin-left: 5px; margin-top: 2px"
							v-model="themeEdit.primary"
							@input="onColorChange($event, 'primary')"
						/>
					</v-layout>
				</v-flex>
				<v-flex xs12 px-3 mb-3>
					<v-layout>
						<v-flex xs2 mr-3 pt-2 class="detail-title-row label">
							Secundario:
						</v-flex>
						<app-input-text
							style="width: 100px"
							:text="themeEdit.secondary"
							@input="onColorChange($event, 'secondary')"
						></app-input-text>
						<input
							type="color"
							id="colorPicker"
							style="margin-left: 5px; margin-top: 2px"
							v-model="themeEdit.secondary"
							@input="onColorChange($event, 'secondary')"
						/>
					</v-layout>
				</v-flex>
				<v-flex xs12 px-3 mb-3>
					<v-layout>
						<v-flex xs2 mr-3 pt-2 class="detail-title-row label">
							Subtitulo:
						</v-flex>
						<app-input-text
							style="width: 100px"
							:text="themeEdit.subTitle"
							@input="onColorChange($event, 'subTitle')"
						></app-input-text>
						<input
							type="color"
							id="colorPicker"
							style="margin-left: 5px; margin-top: 2px"
							v-model="themeEdit.subTitle"
							@input="onColorChange($event, 'subTitle')"
						/>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveTheme"
				/>
			</section>
		</action-sidebar>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="loading"
				:img="false"
				success-color="primary"
				success-text="Guardar"
				@cancel-button-clicked="goTo('commerce')"
				@accept-button-clicked="saveProduct"
			/>
		</section>
	</div>
</template>

<script>
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import actionSidebar from '@/components/shared/action-sidebar';
import tableUploadImage from '@/components/ecommerce/table-upload-image';

function created() {
	this.detailCommerce();
}

function buildHelpCenter() {
	return this.listCommerces.helperCenter.length === 0
		? []
		: this.listCommerces.helperCenter.map((hc) => ({
				id: hc.id,
				name: hc.name,
				subTitle: hc.subTitle,
				type: hc.type,
				urlImage: hc.urlImage,
				description: hc.description,
				orderNumber: hc.orderNumber,
				typeHelperCenter: hc.typeHelperCenter,
		  }));
}

async function detailCommerce() {
	try {
		({ data: this.listCommerces } = await this.$httpSales.get(
			`com-ecommerce-companies/${this.id}`
		));
		this.listCommerces.deliveryType = this.listCommerces.deliveryType || [];
		this.listCommerces.settings.flagGrouper =
			this.listCommerces.settings.flagGrouper || 2;
		this.setTemplateAndTheme();
		this.detailWayPaymet();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function saveProduct() {
	this.loading = true;
	const newCommerce = { ...this.listCommerces };
	newCommerce.settings.template = this.template;
	newCommerce.settings.theme = this.theme;
	newCommerce.helperCenter = this.buildHelpCenter();
	newCommerce.wayPayment = this.buildWayPayment();
	delete newCommerce.aclCode;
	delete newCommerce.code;
	delete newCommerce.documentNumber;
	delete newCommerce.employee;
	delete newCommerce.employeeId;
	delete newCommerce.flagActive;
	delete newCommerce.id;
	delete newCommerce.location;
	delete newCommerce.metadata;
	delete newCommerce.promotionSettings;
	delete newCommerce.rzSocial;
	delete newCommerce.subsidiary;
	delete newCommerce.subsidiaryId;
	delete newCommerce.terminals;
	delete newCommerce.urlDomain;
	delete newCommerce.wayPaymentCommerce;
	delete newCommerce.plan;
	delete newCommerce.createdAt;
	delete newCommerce.ubigeoData;
	delete newCommerce.gateway;
	const body = { ...newCommerce };
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${this.id}`, body);
		this.showNotification('El template del comercio ha sido actualizado');
		this.goTo(this.$route.query.origin);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function setData({ model, value }) {
	this[model] = value;
}

function setTemplateAndTheme() {
	this.template = this.listCommerces.settings.template || {};
	this.theme = this.listCommerces.settings.theme || {};
}

function data() {
	return {
		listCommerces: {
			deliveryType: [],
			settings: {
				codeTaxes: null,
				defaultWarehouse: null,
				flagGrouper: 2,
				imageQR: null,
				salPriceListId: null,
				serviceCost: null,
				shippingCost: null,
				whatsappNumber: null,
			},
		},
		loading: false,
		step: 0,
		template: {},
		theme: {},
		listPayments: [],
		wayPaymentByCommerce: [],
		action: {
			code: '',
			open: false,
			width: 500,
			title: '',
		},
		themeEdit: {},
	};
}

export default {
	name: 'page-configuration-desktop',
	components: {
		headerPage,
		modalSidebarButton,
		tableUploadImage,
		actionSidebar,
	},
	created,
	data,
	methods: {
		buildHelpCenter,
		detailCommerce,
		saveProduct,
		setData,
		setTemplateAndTheme,
		buildWayPayment() {
			const gateKeys = Object.keys(this.listCommerces.gateway);
			return gateKeys.reduce((a, k) => {
				const wayPaymentK = this.listCommerces.wayPaymentRelated.findIndex(
					(wp) => Number(wp) === Number(k)
				);
				if (wayPaymentK > -1) {
					const newItem = {
						wayPaymentId: Number(k),
						gatewayConfiguration: this.listCommerces.gateway[
							k
						].gatewayConfiguration.map((gwc) => this.setGateway(gwc)),
					};
					a.push(newItem);
				}
				return a;
			}, []);
		},
		setGateway(gatewayInfo) {
			if (gatewayInfo) {
				const { code, fields, name } = gatewayInfo;
				if (fields) {
					const fieldsData = fields.reduce((a, f) => {
						const newA = { ...a };
						newA[f.name] = f.value;
						return newA;
					}, {});
					return { code, name, ...fieldsData };
				}
				return { code, name };
			}
			return {};
		},
		async detailWayPaymet() {
			const params = {
				flagCompany: true,
				commerceId: this.id,
			};
			const request = [
				this.$httpSales.get('way-payment'),
				this.$httpSales.get('way-payment', { params }),
			];
			[{ data: this.listPayments }, { data: this.wayPaymentByCommerce }] =
				await Promise.all(request);
			try {
				this.listCommerces.wayPayment = this.setWayPayment();
				this.listCommerces.gateway = this.setGatewayItem(
					this.listCommerces.wayPayment
				);
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				}
			} finally {
				this.loadingServices = false;
			}
		},
		setWayPayment() {
			return this.wayPaymentByCommerce.reduce((a, wpr) => {
				const item = this.listPayments.find((lp) => lp.id === wpr.wayPaymentId);
				if (item) {
					a.push(item);
				}
				return a;
			}, []);
		},
		setGatewayItem(items) {
			const newItems = items.reduce((a, item) => {
				const newA = { ...a };
				const wpCommerce =
					this.wayPaymentByCommerce.find(
						(wpc) => wpc.wayPaymentId === item.id
					) || {};
				newA[item.id] = {
					gatewayConfiguration: wpCommerce.gateWayPaymentCommerce || [],
					isSelected: true,
				};
				return newA;
			}, {});
			if (this.wayPaymentByCommerce.length < this.listPayments.length) {
				this.listPayments.forEach((lp) => {
					const index = items.findIndex((i) => i.id === lp.id);
					if (index === -1) {
						newItems[lp.id] = {
							gatewayConfiguration: [],
							isSelected: false,
						};
					}
				});
			}
			return newItems;
		},
		openSlide(code) {
			const themes = this.template.aditionalInformation.themes;
			this.themeEdit = {
				...this.theme,
				id: themes.length + 1,
			};
			this.action.code = code;
			this.action.open = true;
			this.action.title = 'Personalizar colores';
		},
		closeModal() {
			this.action.code = '';
			this.action.open = false;
			this.action.title = '';
			this.action.width = 500;
			this.themeEdit = {};
		},
		saveTheme() {
			this.theme = this.themeEdit;
			this.template.aditionalInformation.themes.push(this.themeEdit);
			this.closeModal();
		},
		onColorChange(value, model) {
			this.themeEdit[model] = value.target ? value.target.value : value.value;
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.step-background {
	background-color: color(maki-white);
}

.label {
	color: color(brown-grey) !important;
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}
</style>
