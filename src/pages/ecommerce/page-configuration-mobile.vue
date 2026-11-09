<template>
	<div class="configuration-ecommerce">
		<header-page :title="`CONFIGURACIÓN MÓVIL - ${listCommerces.name}`" />
		<v-stepper v-model="step" non-linear>
			<v-stepper-header class="companies-stepper">
				<v-stepper-step step="1" editable :complete="step > 1"
					>Código Qr y Template</v-stepper-step
				>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1">
					<v-layout px-3 mt-2 mb-5 pb-5>
						<v-flex xs6>
							<v-layout wrap align-center>
								<v-flex :class="[listCommerces.urlQr ? 'xs9' : 'xs12']">
									<label
										ref="label-imageQr"
										for="upload-image-imageQr"
										class="w-100"
									>
										<vue-six-four
											id="upload-image-imageQr"
											hidden
											@vue-six-four="getFile('urlQr', $event)"
										/>
										<v-layout wrap xs12>
											<v-flex xs11>
												<app-input-text
													label="Imagen QR"
													readonly
													:text="listCommerces.urlQr"
												/>
											</v-flex>
											<v-flex xs1 text-left pt-4>
												<v-btn
													class="ma-0 pl-0 btn-auto"
													small
													@click="showDialogFavicon('label-imageQr')"
													color="info"
												>
													<v-icon color="white">image</v-icon>
												</v-btn>
											</v-flex>
										</v-layout>
									</label>
								</v-flex>
								<v-flex
									v-if="listCommerces.urlQr"
									:class="{ xs3: listCommerces.urlQr }"
									pt-3
									text-xs-center
								>
									<a
										class="link-green"
										target="_blank"
										:href="listCommerces.urlQr"
										>Ver Imagen</a
									>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex px-5 mt-4 xs6 px-2>
							<table-upload-image
								:template="template"
								:theme="theme"
								@set-data="setData"
							/>
						</v-flex>
					</v-layout>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
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
import tableUploadImage from '@/components/ecommerce/table-upload-image';
import VueSixFour from 'vue-six-four';

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
	delete newCommerce.gateway;
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

function showDialogFavicon(name) {
	this.$refs[name].click();
}

async function getFile(name, fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post(
				'upload-files',
				newFile
			);
			this.listCommerces[name] = file.Location;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	}
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
			urlQr: null,
		},
		loading: false,
		step: 0,
		template: {},
		theme: {},
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'pdf',
			'txt',
			'svg',
		],
		listPayments: [],
		wayPaymentByCommerce: [],
	};
}

export default {
	name: 'page-configuration-mobile',
	components: {
		headerPage,
		modalSidebarButton,
		tableUploadImage,
		VueSixFour,
	},
	created,
	data,
	methods: {
		buildHelpCenter,
		detailCommerce,
		saveProduct,
		setData,
		setTemplateAndTheme,
		showDialogFavicon,
		getFile,
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
	},
	props: {
		id: [Number, String],
	},
};
</script>
