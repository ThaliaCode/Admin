<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
			toda la información de los comercios`"
		/>
		<header-page
			:title="$route.meta.title"
			show-actions
			:resource-uri="$route.name"
			:value-disabled="valueDisabled"
			@run-action="runAction"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="valueDisabled"
			@run-action="runAction"
		/>
		<!-- <v-flex v-if="!rows.length" text-xs-center class="text-opacity">
			Usted actualmente no tiene configurada su tienda online, para configurarla
			debe comunicarse con soporte.
		</v-flex> -->
		<!-- <div class="banner-whatsapp" v-if="!!showBanner">
			<div class="txt">
				¡Hola! Desde hoy CasaMarket solo atenderá por este número:
				{{ NUMBER_SUPPORT }}. ¡Escríbenos y te atenderemos rápido!
			</div>
			<v-btn @click="closeBanner" icon class="close-btn">
				<v-icon color="white">close</v-icon>
			</v-btn>
		</div> -->
		<v-layout row wrap justify-end my-3 pr-5 v-if="!isMibodega">
			<v-flex xs1>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="openNewCommerceModal"
				>
					Nuevo comercio
				</v-btn>
			</v-flex>
		</v-layout>
		<div
			v-if="showUpsellings && showButtons"
			class="layout justify-center component-shortcut-wrapper"
		>
			<component-shortcut @close-upselling="closeUpselling" />
		</div>
		<v-layout row wrap px-2 justify-center>
			<div v-for="row in rows" :key="row.id">
				<group-commerce
					:fairs="fairs"
					:fair-commerce="fairCommerce"
					:actions="actions"
					:buttons="buttons"
					:commerce="row"
					:dialog-fair="dialogFair"
					@click-action="clickAction"
					@click-icon="clickIcon"
					@change-active="changeActive"
					@change-select="rowIsSelected"
					@upload-list="listCommerce"
					@open-plan="openPlan"
					@orders="goToOrder"
					@change-password="openDialogPassword"
					@open-plan-header="openPlanHeader"
				/>
			</div>
		</v-layout>
		<action-sidebar
			v-model="action.value"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<new-commerce-form
				v-if="action.code === 'new-commerce'"
				:subsidiaries="subsidiaries"
				:items="items"
				@saved="reLoadCommerce"
				@cancel="closeModal"
			/>
			<sale-points-form
				v-if="isSalePoints"
				:is-loading="isLoading"
				:sale-points="salePoints"
				:type-documents="typeDocuments"
				:war-code-taxes="warehouse.codeTaxes"
				:war-subsidiary-id="warehouse.subsidiaryId"
				:war-warehouses-id="warehouse.id"
				@cancel="cancelSalePoints"
				@save="saveSalePoints"
			/>
			<create-ecommerce-group
				v-if="action.code === 'create-grouping-comerce'"
				:subsidiaries="subsidiaries"
				@create-commerce="createCommerce"
				@close="closeModal"
			/>
			<product-limit-catalog
				v-if="action.code === 'product-limit-catalog'"
				:commerce="dataSelected[0]"
				@change-limit-product="changeLimitProduct"
				@close="closeModal"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline"> ¿Deseas resetear el token? </v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDialog"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="resetToken"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogPlan" max-width="640">
			<show-plan :plan="selectPlan" value="upsellingDomain" />
		</v-dialog>
		<v-dialog v-model="dialogPassword" max-width="400">
			<modal-change-password @close="closeChangePassword" @update="changePassword" />
		</v-dialog>
		<v-dialog v-model="dialogPlanHeader" max-width="640">
			<show-plan :plan="selectPlan" />
		</v-dialog>
		<div class="modal-fair" v-if="dialogFair">
			<div class="modal-content-fair">
				<v-card-title class="headline bg-header">
					<v-layout row align-center>
						<v-flex class="title-fair-dialog">Sincronizar Comercio:</v-flex>
						<v-flex text-xs-right>
							<button type="button" @click="closeDialogFair">
								<v-icon color="primary">clear</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text class="relative px-4">
					<v-layout
						v-for="(item, index) in fairs"
						:key="index"
						row
						justify-space-between
						align-center
						pt-2
						pb-2
						class="border-bottom"
					>
						<v-flex xs6>
							<v-layout column>
								<v-flex>
									<img v-if="item.fair.urlImage" height="35" :src="item.fair.urlImage" />
									<span class="label-gray" v-else>
										{{ item.fair.name }}
									</span>
								</v-flex>
								<v-flex
									class="label-gray mt-2"
									v-if="item.fair.startDate && item.fair.endDate"
								>
									{{ item.fair.startDate | exactDate }} al
									{{ item.fair.endDate | exactDate }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs6 pl-5>
							<v-layout class="switch-commerce" column>
								<v-flex text-xs-right class="content-image-action">
									<button
										type="button"
										class="btn-assign mx-2"
										color="assignGray"
										x-small
										fab
										:class="{ 'btn-active': item.flagSync }"
										@click="assignFair(item)"
									>
										<img
											class="icon-refresh"
											src="/static/img/icons/refresh-1.svg"
											height="12"
										/>
										<img
											v-if="item.flagSync"
											src="/static/img/icons/check-assync.svg"
											class="check-async"
										/>
										<div class="message-action">
											<p class="mb-1 primary--text bold title-modal">Sincronizar</p>
											<p class="mb-0 subtitle-modal">Sincroniza tu comercio.</p>
										</div>
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card-text>
			</div>
		</div>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import componentShortcut from '@/components/ecommerce/component-shortcut';
import createEcommerceGroup from '@/components/ecommerce/create-ecommerce-group';
import groupCommerce from '@/components/ecommerce/group-commerce';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import migratePlan from '@/components/ecommerce/migrate-plan';
import modalChangePassword from '@/components/ecommerce/modal-change-password';
import newCommerceForm from '@/components/ecommerce/new-commerce';
import productLimitCatalog from '@/components/ecommerce/product-limit-catalog';
import salePointsForm from '@/components/warehouses/sale-points-form';
import showPlan from '@/components/ecommerce/show-plan';

const { setLocalData } = helper;

function created() {
	this.listCommerce();
	this.loadCategories();
	this.loadSubsidiaries();
	// const show = getLocalData('show-banner');
	// this.showBanner = show === null ? true : show;
}

function onPage(page) {
	this.listCommerce(page);
}

function edit({ id }) {
	this.goTo('configuration', { params: { id } });
}

function runAction({ code }) {
	if (code === 'create-commerce') {
		this.goTo('configuration');
	} else if (code === 'sale-points') {
		this.action.code = code;
		this.action.title = 'PUNTO DE VENTA';
		this.action.value = true;
		this.loadTypeDocuments();
	} else if (code === 'new-ecommerce') {
		this.openNewCommerceModal();
	} else if (code === 'reset-token') {
		this.dialog = true;
	} else if (code === 'create-grouping-comerce') {
		this.action.code = code;
		this.action.title = 'Crear comercio agrupado';
		this.action.value = true;
	} else if (code === 'product-limit-catalog') {
		this.action.code = code;
		this.action.title = 'Crear comercio agrupado';
		this.action.value = true;
		this.action.width = 400;
	}
}

async function listCommerce() {
	this.loadingGeneral = true;
	try {
		const { data: response, headers } = await this.$httpSales.get(
			'com-ecommerce-companies',
			{ params: this.params }
		);
		this.rows = response;
		this.setRowSelected(false);
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
}

async function changeActive({ id }, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.listCommerce();
	} catch (error) {
		this.showGenericError();
	}
}

function rowIsSelected() {
	this.setDataSelected();
	this.checkAll = this.rows.every((r) => r.isSelected);
}

function valueDisabled() {
	const code = 'sale-points';
	const disabled = this.dataSelected.length !== 1;
	return [
		{ code, disabled },
		{ code: 'reset-token', disabled },
		{ code: 'product-limit-catalog', disabled },
	];
}

function closeModal() {
	this.action.value = false;
	this.action.code = null;
	this.action.title = '';
	this.salePoints = [];
	this.setRowSelected(false);
	this.setDataSelected();
}

function setDataSelected() {
	this.dataSelected = this.rows.filter((r) => r.isSelected);
	const [selected] = this.dataSelected;
	this.warehouse.subsidiaryId = selected ? selected.subsidiaryId : null;
	this.warehouse.codeTaxes = selected ? selected.settings.codeTaxes : null;
}

function setRowSelected(selected) {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = selected;
		return newRow;
	});
}

function isSalePoints() {
	return this.action.code === 'sale-points';
}

function cancelSalePoints() {
	this.closeModal();
}

async function saveSalePoints(newSalePoints) {
	this.isLoading = true;
	const body = newSalePoints.map((sp) => {
		const newSalePoint = {
			cashId: sp.cashId,
			codeTaxes: null,
			comSubsidiariesId: sp.comSubsidiariesId,
			employeesId: sp.employeesId,
			flagActive: sp.flagActive,
			name: sp.name,
			typeDevice: sp.typeDevice || null,
			series: sp.documents.reduce((acum, spd) => {
				let acumRet = [...acum];
				const newDocument = {};
				if (spd.isSelected) {
					if (spd.billing) {
						const newBill = spd.billing.reduce((ac, bill) => {
							if (bill.serie !== '') {
								const newRe = {
									codeTaxes: this.isEcuador ? bill.codeTaxes : null,
									companyTemplateId: bill.companyTemplateId,
									description: bill.description,
									details: bill.details.map((d) => {
										const newDetail = {
											codeTaxes: this.isEcuador ? d.codeTaxes : null,
											companyTemplateId: d.companyTemplateId,
											description: d.description,
											serie: d.serie,
											number: d.number,
											salTypeDocumentsId: d.salTypeDocumentsId,
										};
										if (d.id) {
											newDetail.id = d.id;
										}
										return newDetail;
									}),
									serie: bill.serie,
									number: bill.number,
									salTypeDocumentsId: bill.salTypeDocumentsId,
									comSubsidiariesId: bill.comSubsidiariesId,
									typeBilling: bill.typeBilling,
									flagSendBilling: bill.flagSendBilling,
								};
								if (bill.id) {
									newRe.id = bill.id;
								}
								ac.push({ ...newRe });
							}
							return ac;
						}, []);
						acumRet = acumRet.concat(newBill);
					} else {
						newDocument.codeTaxes = this.isEcuador ? spd.codeTaxes : null;
						newDocument.companyTemplateId = spd.companyTemplateId;
						newDocument.description = spd.description;
						newDocument.details = spd.details.map((d) => {
							const newDetail = {
								codeTaxes: this.isEcuador ? d.codeTaxes : null,
								companyTemplateId: d.companyTemplateId,
								description: d.description,
								serie: d.serie,
								number: d.number,
								salTypeDocumentsId: d.salTypeDocumentsId,
							};
							if (d.id) {
								newDetail.id = d.id;
							}
							return newDetail;
						});
						newDocument.serie = spd.serie;
						newDocument.number = spd.number;
						newDocument.salTypeDocumentsId = spd.salTypeDocumentsId;
						newDocument.comSubsidiariesId = spd.comSubsidiariesId;
						newDocument.typeBilling = spd.typeBilling;
						newDocument.flagSendBilling = spd.flagSendBilling;
						if (spd.id) {
							newDocument.id = spd.id;
						}
						acumRet.push({ ...newDocument });
					}
				}
				return acumRet;
			}, []),
			warWarehousesId: sp.warWarehousesId,
			warWarehousesName: this.warehouse.name,
		};
		if (this.salePoints.length && sp.id) {
			newSalePoint.id = sp.id;
		}
		return newSalePoint;
	});
	try {
		await this.$httpSales.post('terminals-series', body);
		this.showNotification('La edición de puntos de venta se realizó correctamente.');
		this.closeModal();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.messge === 'CORRELATIVE_EXISTS') {
				this.showGenericError('Los correlativos se repiten');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

async function loadTypeDocuments() {
	const params = { flagType: 1, flagTemplate: 1, flagSerie: 1 };
	({ data: this.typeDocuments } = await this.$httpSales.get('type-documents-all', {
		params,
	}));
	this.loadSalePoints();
}

async function loadSalePoints() {
	const params = { commerceId: this.dataSelected[0].id, typeTerminalId: 2 };
	({ data: this.salePoints } = await this.$httpSales.get('terminals', {
		params,
	}));
	this.salePoints = this.salePoints.map((salePoint) => {
		const { employees } = salePoint;
		const newSalePoint = { ...salePoint };
		newSalePoint.employeesId = lib.map(lib.getPropertysValue('id'), employees);
		return newSalePoint;
	});
	this.action.open = true;
}

function openNewCommerceModal() {
	this.action.code = 'new-commerce';
	this.action.title = 'Nuevo Comercio';
	this.action.value = true;
}

function goToMasterProduct(commerce) {
	const { id, code, name, subsidiaryId } = commerce;
	setLocalData('commerce-selected', commerce);
	this.goTo('master-product-ecommerce', {
		params: {
			commerceId: id,
			commerceCode: code,
			subsidiaryId,
		},
		query: {
			name,
			origin: '/ecommerce/commerce',
		},
	});
}

function goToCategory({ id, name }) {
	this.goTo('categories-ecommerce', {
		params: { id },
		query: { name, origin: '/ecommerce/commerce' },
	});
}

function reLoadCommerce() {
	this.listCommerce();
	this.closeModal();
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries'));
}

async function loadCategories() {
	const params = { type: 2 };
	({ data: this.items } = await this.$httpSales.get('items', { params }));
}

function icon() {
	return this.isMibodega ? 'settings' : 'edit';
}

function goToHelp({ id }) {
	this.goTo('page-help-center', {
		params: { commerceId: id },
		query: { origin: '/ecommerce/commerce' },
	});
}

function clickAction(action, commerce) {
	const options = {
		'go-to-master-product': this.goToMasterProduct.bind(null, commerce),
		'edit-commerce': this.edit.bind(null, commerce),
		'go-to-category': this.goToCategory.bind(null, commerce),
		'go-to-banners': this.goToBanners.bind(null, commerce),
		'go-to-help': this.goToHelp.bind(null, commerce),
	};
	options[action].call();
}

function cancelDialog() {
	this.dialog = false;
}

async function resetToken() {
	const id = this.dataSelected[0].id;
	const body = { flagAssigned: false };
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/refresh`, body);
		this.showNotification('Se reseteo el token correctamente');
		this.cancelDialog();
	} catch (error) {
		this.showGenericError();
	}
}

function clickIcon({ action }, commerce) {
	const { id } = commerce;
	if (action !== 'open-fairs') {
		this.goTo(action, { params: { id }, query: { origin: 'commerce' } });
	} else {
		this.fairs = commerce.fairCommerce;
		this.dialogFair = true;
	}
}

function closeDialogFair() {
	this.dialogFair = false;
}

async function createCommerce(model) {
	const body = { ...model };
	try {
		await this.$httpSales.post('com-ecommerce-companies/simple', body);
		this.showNotification('Se creó correctamente el comercio');
		this.reLoadCommerce();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ACL_REGISTER_USER_ERROR') {
				this.showGenericError(
					'El correo asociado ya se encuentra registrado en el sistema.'
				);
			} else if (err.data.messageError) {
				this.showGenericError(err.data.messageError.email);
			}
		}
	}
}

function goToBanners({ id, name }) {
	this.goTo('banner', {
		params: { id },
		query: { name, origin: '/ecommerce/commerce' },
	});
}

async function changeLimitProduct(quantity, id) {
	const body = {
		limitCatalog: Number(quantity),
	};
	try {
		await this.$httpSales.patch(`com-ecommerce-companies/${id}/update-catalog`, body);
		this.showNotification('Se creó correctamente eñ comercio');
		this.reLoadCommerce();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ECOMMERCE_COMPANY_NOT_EXIST') {
				this.showGenericError('El comercio no existe.');
			} else if (err.data.message === 'ACTION_NOT_ALLOWED') {
				this.showGenericError('El usuario no tiene permisos para esta acción.');
			}
		}
	}
}

async function assignFair(row) {
	const { commerceId, fairId } = row;
	try {
		const { data: response } = await this.$httpProducts.post(
			`sync-firebase/commerces/${commerceId}/fairs/${fairId}`
		);
		this.showNotification('El comercio fue sincronizada correctamente.');
		this.listCommerce();
		const index = this.rows.findIndex((l) => l.id === row.commerceId);
		if (index > -1) {
			const indexFair = this.rows[index].fairCommerce.findIndex(
				(e) => e.fairId === response.fairId
			);
			if (indexFair > -1) {
				this.fairs[indexFair].flagSync = response.flagSync;
			}
		}
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'NO_COMMERCE_FOUND') {
				this.showGenericError('No tiene productos asignados al comercio.');
			} else if (error.data.message === 'NO_COMMERCE_SLUG') {
				this.showNotification(
					'Se debe configurar el slug del comercio para proceder con la sincronización.',
					'warning'
				);
			} else if (error.data.message === 'SYNC_NOT_AVAILABLE') {
				this.showNotification(
					'La sincronización no se encuentra habilitada en estos momentos.',
					'warning'
				);
			} else if (error.data.message === 'PAYMENT_INTEGRATION_NOT_SET_UP') {
				this.showNotification(
					'Para sincronizar, debe integrarse con un medio de pago online.',
					'warning'
				);
			} else if (error.data.message === 'PRODUCT_NO_STOCK') {
				this.showNotification('No se puede sincronizar productos sin stock.', 'warning');
			} else if (error.data.message === 'PRODUCT_NO_PRICE') {
				this.showNotification(
					'No se pueden sincronizar productos sin precio.',
					'warning'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function openPlan(plan) {
	this.selectPlan = { ...plan };
	this.dialogPlan = true;
}

function goToOrder(page, { id }) {
	this.goTo(page, { query: { commerceId: id } });
}

function openDialogPassword(commerce) {
	this.selectCommerce = { ...commerce };
	this.dialogPassword = true;
}

function closeChangePassword() {
	this.dialogPassword = false;
}

async function changePassword(password) {
	this.closeChangePassword();
	const codeUser = this.selectCommerce.employee
		? this.selectCommerce.employee.aclUserCode
		: null;
	const url = '/users/password';
	const body = {
		password,
		codeUser,
	};
	try {
		await this.$httpAcl.patch(url, body);
	} catch (error) {
		this.showGenericError();
	}
}

function openPlanHeader(plan) {
	this.selectPlan = { ...plan };
	this.dialogPlanHeader = true;
}

function showUpsellings() {
	if (this.$userInfo.company) {
		if (this.$userInfo.company.plans) {
			if (this.$userInfo.company.plans.upsellings) {
				if (Object.keys(this.$userInfo.company.plans.upsellings).length > 0) {
					return true;
				}
				return false;
			}
			return false;
		}
		return false;
	}
	return false;
}

function closeUpselling() {
	this.showButtons = false;
}

function data() {
	return {
		action: {
			code: null,
			title: '',
			value: false,
			width: 450,
		},
		dataSelected: [],
		dialogFair: false,
		isLoading: false,
		items: [],
		fairs: [],
		params: {
			totalOrders: true,
		},
		rows: [],
		salePoints: [],
		typeDocuments: [],
		warehouse: {
			subsidiaryId: null,
			codeTaxes: null,
		},
		subsidiaries: [],
		buttons: [
			{
				id: 1,
				image: '/static/img/menu.svg',
				name: 'Categorías',
				action: 'go-to-category',
			},
			{
				id: 2,
				image: '/static/img/received.svg',
				name: 'Productos',
				action: 'go-to-master-product',
			},
			{
				id: 3,
				image: '/static/img/banner.svg',
				name: 'Banners',
				action: 'go-to-banners',
			},
			{
				id: 4,
				image: '/static/img/informacion.svg',
				name: 'Centro de ayuda',
				action: 'go-to-help',
			},
		],
		actions: [
			// {
			// 	id: 1,
			// 	height: 20,
			// 	image: '/static/icon/config-general.svg',
			// 	name: 'General',
			// 	action: 'configuration',
			// },
			{
				id: 1,
				height: 22,
				image: '/static/icon/config-desktop.svg',
				name: 'Tienda WEB',
				action: 'page-configuration-desktop',
				key: 'onlineStore',
				tooltip: 'Tienda WEB',
			},
			{
				id: 2,
				height: 27,
				image: '/static/icon/config-mobile.svg',
				name: 'Tienda APP',
				action: 'page-configuration-mobile',
				key: 'appStore',
				tooltip: 'Tienda APP',
			},
			{
				id: 3,
				height: 27,
				image: '/static/icon/config-mobile.svg',
				name: 'Sinc. Ecomm.',
				tooltip: 'Sincronizar Ecommerce',
				action: 'open-fairs',
				key: 'fair',
			},
		],
		dialog: false,
		fairCommerce: [],
		dialogPlan: false,
		dialogPassword: false,
		selectCommerce: {},
		selectPlan: {},
		dialogPlanHeader: false,
		showButtons: true,
		salesUrl: null,
		loadingGeneral: false,
		NUMBER_SUPPORT: process.env.NUMBER_SUPPORT,
		showBanner: false,
	};
}

export default {
	name: 'page-commerce',
	data,
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
		newCommerceForm,
		salePointsForm,
		groupCommerce,
		createEcommerceGroup,
		productLimitCatalog,
		migratePlan,
		modalChangePassword,
		showPlan,
		componentShortcut,
	},
	computed: {
		isSalePoints,
		valueDisabled,
		icon,
		showUpsellings,
	},
	methods: {
		assignFair,
		cancelSalePoints,
		changeActive,
		closeDialogFair,
		closeModal,
		edit,
		goToMasterProduct,
		listCommerce,
		loadCategories,
		loadSalePoints,
		loadSubsidiaries,
		loadTypeDocuments,
		onPage,
		openNewCommerceModal,
		reLoadCommerce,
		rowIsSelected,
		runAction,
		saveSalePoints,
		setDataSelected,
		setRowSelected,
		goToCategory,
		clickAction,
		clickIcon,
		goToHelp,
		cancelDialog,
		resetToken,
		createCommerce,
		goToBanners,
		changeLimitProduct,
		openPlan,
		goToOrder,
		openDialogPassword,
		closeChangePassword,
		changePassword,
		openPlanHeader,
		closeUpselling,
		closeBanner() {
			this.showBanner = false;
			setLocalData('show-banner', false);
		},
	},
};
</script>
<style lang="scss" scoped>
.master-product {
	border: 1px solid color(primary);
	border-radius: 8px;
	color: color(primary);
	padding: 1px 7px;
}

.title-modal {
	font-family: map-get($fonts, open-semibold);
	font-size: 11px;
	text-align: left;
}

.border-bottom {
	border-bottom: 1px solid #9ca6b0;
	&:last-child {
		border-bottom: none !important;
	}
}

.modal-fair {
	background-color: rgba(0, 0, 0, 0.1);
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 20;
}

.modal-content-fair {
	background-color: white;
	border-radius: 12px;
	margin: 25% auto;
	position: relative;
	width: 403px;
}

.btn-active {
	background-color: color(success);
}

.check-async {
	bottom: 13px;
	left: 6px;
	position: relative;
}

.title-fair-dialog {
	color: color(primary);
	font-family: map-get($fonts, lato-regular);
	font-weight: 900;
	font-size: 14px;
}

.bg-header {
	background-color: rgba(195, 231, 232, 0.21);
	border-top-left-radius: 12px;
	border-top-right-radius: 12px;
}

.btn-assign {
	background-color: #d2d2d2;
	border-radius: 50%;
	height: 23px !important;
	box-shadow: none !important;
	margin: 0 !important;
	position: relative;
	width: 23px !important;
	&:hover {
		.message-action {
			display: block;
			width: 158px !important;
			z-index: 300 !important;
		}
	}
}

.label-gray {
	color: #4a4a4a;
	font-family: map-get($fonts, lato-regular);
	font-size: 8px;
}

.check-async {
	bottom: 13px;
	left: 6px;
	position: relative;
}

.btn-active {
	background-color: color(success);
}

.message-action {
	background-color: color(white);
	border: 1px solid color(item-select);
	border-radius: 5px;
	box-shadow: 0 2px 4px 0 rgba(157, 157, 157, 0.5);
	color: color(brown-grey);
	display: none;
	font-size: 12px;
	left: -90px;
	padding: 12px;
	position: absolute;
	text-transform: none;
	top: 36px;
	transition: all 0.5s ease-in-out 0s;
	width: 100%;
	z-index: 2;
	&::before {
		background: color(white);
		border: 1px solid color(item-select);
		border-bottom-width: 0;
		border-right-width: 0;
		content: '';
		height: 15px;
		left: 60%;
		position: absolute;
		top: -9px;
		width: 15px;
		-webkit-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		transform: rotate(45deg);
	}
}

.content-images-action {
	&:hover {
		.message-action {
			display: block;
			width: 158px !important;
			z-index: 433 !important;
		}
	}
}

.subtitle-modal {
	font-family: map-get($fonts, open-regular);
	font-size: 10px !important;
	line-height: 1.1;
	max-width: 100px;
	text-align: left;
}

.text-opacity {
	background-color: color(white);
	border: 3px solid color(primary);
	border-style: dashed;
	color: #828282;
	font-size: 25px;
	font-family: map-get($fonts, open-semibold);
	margin: 14% auto 0 auto;
	padding: 15px 20px;
	max-width: 55%;
}

.banner-whatsapp {
	padding: 0.8rem 0;
	margin-top: 10px;
	color: white;
	background: #b62128;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	.txt {
		text-align: center;
	}
}

.close-btn {
	position: absolute;
	right: 10px;
	top: 40%;
	transform: translateY(-50%);
	padding: 0;
	min-width: 0;
}
</style>
