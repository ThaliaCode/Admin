<template>
	<v-toolbar app height="40" color="maki-white" class="hide-and-print app-header">
		<v-container fluid py-0>
			<v-layout row justify-end align-center>
				<v-flex xs1 class="wrapper-btn-siderbar" text-xs-left>
					<button @click="$emit('open-sidebar')" class="btn-siderbar">
						<img
							src="/static/img/siderbar/menu.svg"
							alt="menu-bars"
							width="19px"
							v-if="mini"
						/>
						<img
							src="/static/img/siderbar/close.svg"
							alt="menu-bars"
							width="19px"
							height="13px"
							v-else
						/>
					</button>
				</v-flex>
				<v-flex xs11 text-xs-right>
					<div class="flex-item justify-end align-center">
						<div
							@click="redirectWsp()"
							id="redirect-wsp"
							class="cursor-pointer hidden-mobile"
						>
							<v-layout row align-center slot="activator">
								<v-flex>
									<v-btn icon class="btn-auto ma-0 btn-cut">
										<img src="/static/img/whatsapp-white.svg" alt="" height="18" />
									</v-btn>
								</v-flex>
								<v-flex text-xs-center class="text-cut number">{{
									numberSupport
								}}</v-flex>
							</v-layout>
						</div>
						<div class="">
							<v-menu offset-y left attach lazy transition="scale-transition">
								<v-layout row align-center slot="activator">
									<v-flex>
										<v-btn icon class="btn-auto ma-0 btn-cut">
											<v-icon size="20" color="white">add</v-icon>
										</v-btn>
									</v-flex>
									<v-flex text-xs-center class="text-cut">Atajos</v-flex>
								</v-layout>
								<v-list class="list-cut">
									<v-list-tile @click="goToList('new-sale')" class="content-menu-cut">
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/new-sale.svg"
												alt="icon-ventas"
											/>
											<span class="ml-2">Nueva Venta</span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										class="content-menu-cut"
										@click="goToList('purchases-new')"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/purchase.svg"
												alt="icon-compras"
											/>
											<span class="ml-2">Nueva Compra</span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										class="content-menu-cut"
										@click="goToList('customers-new')"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/customers.svg"
												alt="icon-compras"
											/>
											<span class="ml-2">Nuevo Cliente</span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										class="content-menu-cut"
										@click="goToList('list-of-sales')"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/new-sale.svg"
												alt="icon-compras"
											/>
											<span class="ml-2"> Lista de Ventas </span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile class="content-menu-cut" @click="validCreateProduct">
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/product.svg"
												alt="icon-producto"
											/>
											<span class="ml-2"> Nuevo Producto </span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										class="content-menu-cut"
										@click="goToList('new-quotation')"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/new-sale.svg"
												alt="icon-ventas"
											/>
											<span class="ml-2"> Nueva Cotización </span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile class="content-menu-cut">
										<a
											:href="
												$isJapiSale
													? 'https://pos.japisale.com/'
													: 'http://pos.casamarket.pe/'
											"
											target="_blank"
											class="outline"
										>
											<v-list-tile-title class="name-content-menu">
												<v-icon size="18.5">storefront</v-icon>
												<span class="ml-2"> Punto de Venta </span>
											</v-list-tile-title>
										</a>
									</v-list-tile>
									<v-list-tile
										class="content-menu-cut"
										v-if="showGuide"
										@click="goToList('reference-guide-detail')"
									>
										<v-tooltip left>
											<v-list-tile-title slot="activator" class="name-content-menu">
												<img
													height="20"
													width="17.5"
													src="/static/icon/new-sale.svg"
													alt="icon-ventas"
												/>
												<span class="ml-2"> Nueva Guia de Remisión </span>
											</v-list-tile-title>
											<span>Nueva Guia de Remisión</span>
										</v-tooltip>
									</v-list-tile>
									<v-list-tile
										@click="goToList('accounts-receivable')"
										class="content-menu-cut"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/new-sale.svg"
												alt="icon-ventas"
											/>
											<span class="ml-2">Movimiento CxC</span>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile
										@click="goToList('accounts-to-pay')"
										class="content-menu-cut"
									>
										<v-list-tile-title class="name-content-menu">
											<img
												height="20"
												width="17.5"
												src="/static/icon/new-sale.svg"
												alt="icon-ventas"
											/>
											<span class="ml-2">Movimiento CxP</span>
										</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
						</div>
						<div v-if="getPlans">
							<button class="btn-plan" @click="goToPlan">
								<div class="mr-2">
									<img src="/static/img/plan-gratuito.svg" alt="" height="20" />
								</div>
								<span>MEJORA TU PLAN</span>
							</button>
						</div>
						<div class="option hidden-mobile">
							<v-icon color="primary" size="18">account_circle</v-icon>
							{{ userName }}
						</div>

						<div @click="logout" class="cursor-pointer option" style="min-width: 110px">
							Cerrar sesión <v-icon color="primary" size="18">logout</v-icon>
						</div>
					</div>
				</v-flex>
			</v-layout>
		</v-container>
		<transition name="slide-down">
			<div v-if="storePending" class="toast-notification">
				<span class="toast-notification__text">Tu tienda fue creada de manera exitosa</span>
				<span class="toast-notification__close" @click="storePending = false">✕</span>
			</div>
		</transition>
		<transition name="slide-down">
			<div v-if="noProducts" class="toast-notification toast-notification--warning">
				<span class="toast-notification__text">
					Debes asignar productos antes de crear la tienda online
				</span>
				<span class="toast-notification__close" @click="noProducts = false">✕</span>
			</div>
		</transition>
	</v-toolbar>
</template>

<script>
import helper from '@/shared/helper';

const TOAST_STORE_KEY = 'toast_tienda_mostrado';
const TOAST_STORE_TIME_KEY = 'toast_tienda_mostrado_time';

function isStoreToastVisible() {
	return helper.getLocalData(TOAST_STORE_KEY) === 'true';
}

function markStoreToastVisible() {
	helper.setLocalData(TOAST_STORE_KEY, 'true');
	helper.setLocalData(TOAST_STORE_TIME_KEY, String(Date.now()));
}

function clearStoreToastState() {
	helper.removeLocalData(TOAST_STORE_KEY);
	helper.removeLocalData(TOAST_STORE_TIME_KEY);
}

function created() {
	this.showGuide =
		this.$userInfo.company.settings &&
		this.$userInfo.company.settings.flagElectronicGuide;
	const validStorage = helper.getLocalData('valid-product');
	if (!validStorage) {
		this.validActionProduct();
	}
	this.$bus.$off('tienda-creada');
	this.$bus.$on('tienda-creada', () => {
		if (this.isStoreToastVisible()) return;

		this.markStoreToastVisible();
		this.storePending = true;

		setTimeout(() => {
			this.storePending = false;
			this.clearStoreToastState();
		}, 6000);
	});
		this.$bus.$off('tienda-sin-productos');
		this.$bus.$on('tienda-sin-productos', () => {
		  this.noProducts = true;
		  setTimeout(() => { this.noProducts = false; }, 6000);
		});
	}

function openNotifications() {
	this.$emit('open-notifications-event');
}

function validCreateProduct() {
	const validStorage = helper.getLocalData('valid-product');
	this.showProduct =
		validStorage.data.some((p) => p.code === 'master-product-create') || false;
	if (this.showProduct) {
		this.goTo('new-master-product');
	} else {
		this.showGenericError('No cuenta con permisos para ingresar al recurso.');
	}
}

async function validActionProduct() {
	const appCode = process.env.APP_CODE;
	const params = {
		languages: 'es',
	};
	const headers = {
		Accept: 'application/vnd.apiacl.v2+json',
	};
	const response = await this.$httpAcl.get(`sidebar/${appCode}/resource/master-product`, {
		params,
		headers,
	});
	helper.setLocalData('valid-product', response.data);
}

function profileImage() {
	const userImage =
		helper.getLocalData('admin-user') && helper.getLocalData('admin-user').url_image
			? helper.getLocalData('admin-user').url_image
			: '/static/img/icon-default-perfil.svg';
	return userImage;
}

function userName() {
	const username = helper.getLocalData('admin-user')
		? `${helper.getLocalData('admin-user').name} ${
				helper.getLocalData('admin-user').lastname
		  }`
		: 'Sin nombre';
	const truncateName = username.length > 20 ? `${username.slice(0, 30)}...` : username;
	return truncateName;
}

async function logout() {
	const token = helper.getLocalToken();
	window.localStorage.clear();
	await this.$httpAcl.post(
		'logout',
		{},
		{
			headers: {
				authorization: `Bearer ${token}`,
			},
		}
	);
	this.goTo('login');
}

function goToPlan() {
	this.goTo('plan');
}

function getPlans() {
	if (this.$userInfo.company.plans) {
		return Object.keys(this.$userInfo.company.plans).length;
	}
	return false;
}

function goToList(list) {
	const index = this.resources.findIndex((r) => r.uri === list);
	if (index > -1) {
		if (list === 'purchases-new') {
			if (this.$route.name === 'list-of-products') {
				this.goTo(list, { query: { origin: 'products' } });
			} else {
				this.goTo(list);
			}
		} else {
			this.goTo(list);
		}
	} else {
		this.showGenericError('No cuenta con permisos para ingresar al recurso.');
	}
}

function resources() {
	const modules = helper.getLocalData('sidebar');
	if (modules && modules.length > 0) {
		return modules.reduce((acum, module) => {
			const resource = acum.concat(module.resource.data);
			return resource;
		}, []);
	}
	return [];
}

function data() {
	return {
		showGuide: false,
		showMenu: false,
		showProduct: false,
		numberSupport: process.env.NUMBER_SUPPORT,
		storePending: false,
		noProducts: false,
	};
}

export default {
	name: 'app-header',
	computed: {
		profileImage,
		userName,
		getPlans,
		resources,
	},
	created,
	data,
	methods: {
		goToList,
		logout,
		openNotifications,
		goToPlan,
		validActionProduct,
		validCreateProduct,
		isStoreToastVisible,
		markStoreToastVisible,
		clearStoreToastState,
		redirectWsp() {
			window.open(`https://api.whatsapp.com/send?phone=${this.numberSupport}`, '_blank');
		},
	},
	props: {
		quantityNotifications: {
			default: 0,
			type: [Number, String],
		},
		mini: {
			type: Boolean,
			default: false,
		},
	},
	mounted() {
	const flagTime = helper.getLocalData(TOAST_STORE_TIME_KEY);
	if (flagTime && (Date.now() - Number(flagTime)) > 10000) {
		this.clearStoreToastState();
	}
	},
	beforeDestroy() {   
        this.$bus.$off('tienda-creada');
        this.$bus.$off('tienda-sin-productos');
    },
};
</script>

<style lang="scss" scoped>
.container {
	@media (max-width: 599px) {
		margin-left: 0px !important;
		margin-right: 0px !important;
		padding: 16px;
	}
}

.toolbar {
	box-shadow: none;
}

.flex-item {
	display: flex;
}

.profile {
	&-name {
		color: color(background-sidebar);
		font-family: map-get($fonts, open-bold);
		font-size: 13px;
		font-weight: bold;
		min-width: max-content;
		min-width: -moz-max-content;
		padding-right: 9px;
		max-width: max-content;
		max-width: -moz-max-content;
		min-width: max-content;
		min-width: -moz-max-content;
		position: relative;
		vertical-align: super;
		width: max-content;
		width: -moz-max-content;

		@media (max-width: 760px) {
			display: none;
		}
	}

	&-image-container {
		align-items: center;
		background-color: white;
		border: 1px solid map-get($colors, warning);
		border-radius: 100%;
		display: inline-flex;
		height: 30px;
		justify-content: center;
		max-width: 30px;
		min-width: 30px;

		@media (max-width: 760px) {
			background-color: transparent;
			border: none;
		}
	}
}

.notification {
	&-btn {
		background-color: transparent !important;
		border-radius: 0px;
		box-shadow: none;
		height: auto;
		margin: 0px;
		min-width: auto;
		width: auto;
	}

	&-quantity {
		background-color: map-get($colors, notifications);
		border-radius: 100%;
		color: white;
		font-family: map-get($fonts, lato-regular);
		font-size: map-get($sizes, small10);
		height: 12px;
		line-height: 10px;
		position: absolute;
		text-align: center;
		top: -4px;
		width: 12px;
	}
}

.outline {
	text-decoration: none;
}

.app-header {
	box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);

	@media (max-width: 760px) {
		background-color: color(primary) !important;
		box-shadow: none;
		z-index: 4;
	}
}

.content-menu {
	bottom: -49px;
	border: 1px solid color(border-action);
	box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
	border-radius: 5px;
	background: white;
	color: color(primary);
	font-size: 13px;
	position: absolute;
	padding: 10px 20px 10px 20px;
	right: 0;
	width: 140px;
	z-index: 400;

	&::before {
		background: color(white);
		border: 1px solid color(border-action);
		border-bottom-width: 0;
		border-right-width: 0;
		content: '';
		height: 15px;
		left: 74%;
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

.btn-plan {
	background-color: rgba(195, 231, 232, 0.69);
	border-radius: 20px;
	display: flex;
	color: color(primary);
	font-weight: 700;
	margin-right: 30px;
	padding: 4px 8px;

	@media (max-width: 760px) {
		font-size: 12px;
	}
}

.wrapper-btn-siderbar {
	margin-right: 12px;
	@media (min-width: 760px) {
		display: none;
	}
}

.img-mobile {
	display: inline-block;
	@media (min-width: 760px) {
		display: none;
	}
}

.img-desktop {
	display: none;
	@media (min-width: 760px) {
		display: inline-block;
	}
}

.btn-cut {
	background-color: color(primary);
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
	height: 32px !important;
	width: 32px !important;
	z-index: 2;
}

.text-cut {
	background-color: color(success);
	border-radius: 11px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
	color: #fbfbfb;
	font-size: 13px;
	font-weight: 600;
	right: 14px;
	padding: 2px 0;
	position: relative;
	width: 86px;
}

.option {
	background: white;
	border: 1px solid color(primary);
	border-radius: 6px;
	box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.23);
	color: color(primary);
	font-size: 12px;
	font-weight: 600;
	padding: 3px 7px;
	margin-left: 6px;
	white-space: nowrap;
	&button:hover {
		opacity: 0.85;
	}
}

.number {
	width: 130px;
}

.content-menu-cut {
	color: color(primary);
	border-bottom: 1px solid #f8f8f8;
}

.list-cut {
	padding: 0 !important;
}

.name-content-menu {
	cursor: pointer;
	font-size: 13px !important;
	font-weight: 600;
}

.cursor-pointer {
	cursor: pointer;
}

.hidden-mobile {
	@media (max-width: 600px) {
		display: none;
	}
}

.toast-notification {
  align-items: center;
  background: color(primary);
  border-radius: 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  left: 50%;
  padding: 16px 32px;
  position: fixed;
  top: 50px;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 999;

  &__text {
    color: white;
    font-size: 13px;
    font-weight: 600;
  }

  &__close {
    color: white;
    font-size: 14px;
    font-weight: 700;
    margin-left: 16px;
  }
}

.toast-notification--warning {
  background: #eb5029;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter,
.slide-down-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style>
