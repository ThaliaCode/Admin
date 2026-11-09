<template>
	<v-layout
		wrap
		class="group-commerce"
		:class="{ 'select-group': commerce.isSelected }"
	>
		<v-flex xs12 class="group-header">
			<v-layout justify-end>
				<v-flex xs1 v-if="false">
					<v-checkbox
						v-model="commerce.isSelected"
						hide-details
						color="success"
						@change="$emit('change-select')"
					></v-checkbox>
				</v-flex>
				<v-flex xs10 v-if="getInformationPlan">
					<div class="layout">
						<div class="mr-2">
							<div class="wrapper-btn-icon layout justify-between align-center">
								<img
									:src="getInformationPlan.logo"
									:alt="getInformationPlan.name"
									height="19px"
								/>
							</div>
						</div>
						<div class="align-v mr-2">
							<span class="primary--text">{{ getInformationPlan.name }}</span>
						</div>
						<div class="align-v">
							<button
								@click="$emit('open-plan-header', getInformationPlan)"
								class="primary--text btn-plan"
							>
								Ver Plan
							</button>
						</div>
					</div>
				</v-flex>
				<v-flex xs2>
					<v-switch
						slot="activator"
						class="switch-inline"
						hide-details
						color="success"
						v-model="commerce.flagActive"
						@change="$emit('change-active', commerce, $event)"
					></v-switch>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs4 my-2 pa-2 class="border-r">
			<div class="h-100">
				<p class="mb-1 caption-image">Logo</p>
				<div class="text-xs-center">
					<div v-if="commerce.urlImage" class="h-25">
						<div class="text-xs-right wrapper-upload">
							<label
								:ref="`label-btn-logo-${commerce.id}`"
								:for="`upload-btn-logo-${commerce.id}`"
							>
								<vue-six-four
									:id="`upload-btn-logo-${commerce.id}`"
									hidden
									@vue-six-four="getFile('logo', $event)"
								/>
								<v-tooltip top>
									<button
										slot="activator"
										@click="showDialog(`label-btn-logo-${commerce.id}`)"
									>
										<img src="/static/img/change-image.svg" alt="Cambiar" />
									</button>
									<span>Cambiar</span>
								</v-tooltip>
							</label>
						</div>
						<div v-show="!isLodingImage">
							<img
								:src="commerce.urlImage"
								:alt="commerce.name"
								class="image-logo"
							/>
						</div>
						<div class="wrapper-text-loader" v-show="isLodingImage">
							<span>Cargando</span>
							<div class="container-loader">
								<div class="mb-0 loader"></div>
							</div>
						</div>
					</div>
					<div v-else class="h-25 border-not-image">
						<label
							:ref="`label-logo-commerce-${commerce.id}`"
							:for="`upload-image-logo-commerce-${commerce.id}`"
							v-show="!isLodingImage"
						>
							<vue-six-four
								:id="`upload-image-logo-commerce-${commerce.id}`"
								hidden
								@vue-six-four="getFile('logo', $event)"
							/>
							<button
								class="btn-upload"
								@click="showDialog(`label-logo-commerce-${commerce.id}`)"
							>
								SUBIR
							</button>
						</label>
						<div class="wrapper-text-loader" v-show="isLodingImage">
							<span>Cargando</span>
							<div class="container-loader">
								<div class="mb-0 loader"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</v-flex>
		<v-flex xs8 my-2 pa-2>
			<section-links
				:commerce="commerce"
				@change-password="changePassword"
				@open-plan="$emit('open-plan', getInformationPlan)"
				:show-links="!!getInformationPlan"
			/>
		</v-flex>
		<v-flex xs12 pa-2>
			<div class="wrapper-title">
				<span>Gestiona tus pedidos:</span>
			</div>
		</v-flex>
		<v-flex xs12 px-2 pb-2 v-if="commerce.totalOrders">
			<v-layout>
				<v-flex xs4>
					<button
						class="primary white--text btn-order"
						@click="$emit('orders', 'orders', commerce)"
					>
						Ver mis pedidos
					</button>
				</v-flex>
				<v-flex xs8 v-if="Number(commerce.totalOrders) > 50" pl-2>
					<span class="success--text text-order"
						>+ de {{ getCountOrder }} pedidos</span
					>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 mx-2 class="wrapper-conf-g">
			<button
				class="btn-100"
				@click="$emit('click-icon', { action: 'configuration' }, commerce)"
			>
				<v-layout>
					<v-flex text-xs-left>
						<span xs5>Configura tu tienda</span>
					</v-flex>
					<v-flex xs6 pt-1>
						<v-progress-linear
							color="success"
							rounded
							height="3"
							class="mt-1 mb-2"
							:value="getProgress({ action: 'configuration' }, commerce)"
						></v-progress-linear>
					</v-flex>
					<v-flex xs1 text-xs-right>
						<button
							class="btn-conf"
							@click="
								$emit('click-icon', { action: 'configuration' }, commerce)
							"
						>
							<img
								src="/static/icon/config-general.svg"
								alt="configuracion"
								height="14"
							/>
						</button>
					</v-flex>
				</v-layout>
			</button>
		</v-flex>
		<v-flex xs12 pa-2>
			<div class="wrapper-title">
				<span>Crea tus:</span>
			</div>
		</v-flex>
		<v-flex xs12>
			<v-layout wrap justify-space-between mt-1>
				<v-flex v-for="button in buttons" xs6 :key="button.name" px-2>
					<button
						class="btn-commerce-action mb-1"
						@click="$emit('click-action', button.action, commerce)"
					>
						<v-layout px-2>
							<v-flex xs2>
								<img :src="button.image" :alt="button.name" height="12" />
							</v-flex>
							<v-flex xs10>
								<span>{{ button.name }}</span>
							</v-flex>
						</v-layout>
					</button>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 pa-2>
			<v-flex xs12 pa-2 v-if="isSupport">
				<CreatePageOnlineFlow :commerce="commerce" />
			</v-flex>
			<div class="wrapper-title">
				<span>Mis canales de venta:</span>
			</div>
		</v-flex>
		<v-flex xs12>
			<v-layout row wrap mt-1 mb-2 align-center justify-center px-2>
				<div v-for="action in actions" :key="action.id" class="group-action">
					<button
						:disabled="isDisabledChannel(action)"
						@click="$emit('click-icon', action, commerce)"
					>
						<div>
							<img
								:src="action.image"
								:alt="action.name"
								height="14"
								:class="{ 'gray-image': isDisabledChannel(action) }"
							/>
						</div>
						<div>
							<v-tooltip top>
								<span
									slot="activator"
									:class="{ 'gray-label': isDisabledChannel(action) }"
									class="text-label"
								>
									{{ action.name }}
								</span>
								<span>
									{{ action.tooltip }}
								</span>
							</v-tooltip>
						</div>
					</button>
					<div v-if="!isDisabledChannel(action)">
						<v-progress-linear
							color="success"
							rounded
							height="3"
							class="mt-1 mb-2"
							:value="getProgress(action, commerce)"
						></v-progress-linear>
					</div>
				</div>
			</v-layout>
		</v-flex>
	</v-layout>
</template>
<script>
import VueSixFour from 'vue-six-four';
import lib from '@/shared/lib';
import sectionLinks from '@/components/ecommerce/section-links';
import CreatePageOnlineFlow from '@/components/ecommerce/CreatePageOnlineFlow';

const { getDeeper } = lib;

function stateName({ flagActive }) {
	return flagActive ? 'Activo' : 'Inactivo';
}

function getClassFair(action, commerce) {
	if (this.isCompany) {
		if (action.id === 3) {
			if (commerce.fairCommerce.length === 0) {
				return 'gray-image';
			}
		} else {
			return 'gray-image';
		}
	} else if (action.id === 3) {
		if (commerce.fairCommerce.length === 0) {
			return 'gray-image';
		}
	}
	return null;
}

function getTextFair(action, commerce) {
	if (this.isCompany) {
		if (action.id === 3) {
			if (commerce.fairCommerce.length === 0) {
				return 'gray-label';
			}
		} else {
			return 'gray-label';
		}
	} else if (action.id === 3) {
		if (commerce.fairCommerce.length === 0) {
			return 'gray-label';
		}
	}
	return 'text-label';
}

function getProgress({ action }, commerce) {
	let value = 0;
	if (action === 'page-configuration-desktop') {
		if (commerce.settings.template) {
			if (
				Object.keys(commerce.settings.template).length &&
				Object.keys(commerce.settings.theme).length
			) {
				value = 100;
			} else if (
				Object.keys(commerce.settings.template).length ||
				Object.keys(commerce.settings.theme).length
			) {
				value = 50;
			}
		} else {
			value = 0;
		}
	} else if (action === 'page-configuration-mobile') {
		value = commerce.urlQr ? 100 : 0;
	} else if (action === 'configuration') {
		let num = 0;
		Object.keys(commerce).forEach((n) => {
			if (getDeeper(n)(commerce)) {
				num += 1;
			}
		});
		value = (num * 100) / 30;
	} else if (action === 'open-fairs') {
		if (commerce.fairCommerce.length) {
			let numF = 0;
			commerce.fairCommerce.forEach((n) => {
				if (n.flagSync) {
					numF += 1;
				}
			});
			value = (numF * 100) / commerce.fairCommerce.length;
		}
	}
	return value;
}

function showDialog(name) {
	this.$refs[name].click();
}

async function uploadImageCommerce(image, name) {
	const body =
		name === 'favicon' ? { favicon: { value: image } } : { urlImage: image };
	try {
		await this.$httpSales.patch(
			`ecommerce-companies/${this.getIdCommerce}/update`,
			body
		);
		this.showNotification('Se actualizó correctamente');
		this.$emit('upload-list');
	} catch (error) {
		this.showGenericError();
	} finally {
		setTimeout(() => {
			this.isLodingImage = false;
			this.isLoadingFavicon = false;
		}, 300);
	}
}

async function getFile(name, fileInfo) {
	if (name === 'favicon') {
		this.isLoadingFavicon = true;
	} else {
		this.isLodingImage = true;
	}
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
			this.image = file.Location;
			this.uploadImageCommerce(this.image, name);
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
		this.isLodingImage = false;
		this.isLoadingFavicon = false;
	}
}

function getIdCommerce() {
	return this.commerce.id;
}

function getCountOrder() {
	return Number(this.commerce.totalOrders > 50)
		? Number(this.commerce.totalOrders) - 10
		: 0;
}

function copy(id, url) {
	const cb = document.getElementById(id);
	cb.value = url;
	cb.style.display = 'block';
	cb.select();
	document.execCommand('copy');
	cb.style.display = 'none';
}

function changePassword(commerce) {
	this.$emit('change-password', commerce);
}

function getInformationPlan() {
	if (this.commerce.plan) {
		if (Object.keys(this.commerce.plan).length) {
			return this.commerce.plan;
		}
		return null;
	}
	return null;
}

function isCompany() {
	return Number(this.$userInfo.companyId) === 269;
}

function isDisabledChannel(action) {
	if (action.id === 3) {
		return this.commerce.fairCommerce.length === 0;
	} else if (this.commerce.plan) {
		if (Object.keys(this.commerce.plan).length > 0) {
			if (this.commerce.plan.channels) {
				return !this.commerce.plan.channels[action.key].active;
			}
			return false;
		}
		return false;
	}
	return false;
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		image: null,
		show: false,
		isLodingImage: false,
		isLoadingFavicon: false,
	};
}


export default {
	name: 'group-commerce',
	data,
	components: {
		VueSixFour,
		sectionLinks,
		CreatePageOnlineFlow,
	},
	computed: {
		getIdCommerce,
		getCountOrder,
		getInformationPlan,
		isCompany,
	},
	methods: {
		getClassFair,
		getTextFair,
		stateName,
		getProgress,
		uploadImageCommerce,
		getFile,
		showDialog,
		copy,
		changePassword,
		isDisabledChannel,
	},
	props: {
		actions: {
			type: Array,
			default: () => [],
		},
		buttons: {
			type: Array,
			default: () => [],
		},
		commerce: {
			type: Object,
			default: () => {},
		},
		fairCommerce: {
			type: Array,
			default: () => [],
		},
		fairs: {
			tpye: Array,
			default: () => [],
		},
		dialogFair: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style lang="scss" scoped>
.group-commerce {
	background-color: color(white);
	border-radius: 7px;
	box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.1);
	margin: 30px 30px 20px 0px;
	min-height: 510px;
	max-width: 370px;
	position: relative;

	@media (max-width: 760px) {
		margin: 15px auto;
	}
}

.group-header {
	background-color: color(top-background);
	border-radius: 7px 7px 0 0;
	padding: 7px 20px;
	text-align: center;

	@media (max-width: 760px) {
		padding: 12px;
	}
}

.border-r {
	border-right: 1px solid color(silver-detail);
}

.group-text {
	background-color: color(top-background);
	font-size: 12px;
	padding: 0 20px;
}

.text-label {
	color: color(primary);
}

.gray-label {
	color: color(gray-font-two);
}

.text {
	color: color(paginationText);
}

.gray-image {
	filter: brightness(0) invert(0.7);
	-webkit-filter: brightness(0) invert(0.7);
	-moz-filter: brightness(0) invert(0.7);
}

.group-action {
	border-right: 1px solid color(maki-success);
	flex: 1 1 auto;
	font-size: size(small13);
	padding: 0 6px;
	text-align: center;

	&:last-child {
		border-right: none;
	}

	@media (max-width: 760px) {
		font-size: 11px;
	}
}

.h-25 {
	align-items: center;
	display: flex;
	height: 85px;
	justify-content: center;
	position: relative;
}

.text-success {
	color: color(maki-success);
	font-size: size(small13);
}

.text-error {
	color: color(makiRed);
	font-size: size(small13);
}

.caption-image {
	color: color(caption-grey);
	font-size: size(small10);
}

.select-group {
	border: 1px solid color(primary);
}

.image-logo {
	max-height: 55px;
	max-width: 85%;
}

.group-token {
	min-height: 45px;
	overflow-wrap: break-word;
}

.btn-commerce-action {
	background-color: rgba(195, 231, 232, 0.4);
	border: 1px solid color(item-select);
	border-radius: 5px !important;
	color: color(primary);
	padding: 0px 8px;
	width: 100%;
	span {
		font-size: size(small) !important;
	}
}

.wrapper-btn-icon {
	align-items: center;
	background-color: map-get($colors, primary);
	border-radius: 50%;
	display: flex;
	justify-content: center;
	height: 33px;
	width: 33px;
}

.btn-plan {
	border: 1px solid map-get($colors, primary);
	border-radius: 7px;
	font-size: 11px;
	padding: 1px 10px;
}

.align-v {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.wrapper-title {
	background-color: color(top-background);
	border-radius: 3px;
	color: color(primary);
	font-size: 13px;
	padding: 1px 4px;
}

.border-not-image {
	align-items: center;
	background-color: rgba(156, 166, 176, 0.07);
	border: 1px dotted color(grey-border);
	border-radius: 2px;
	display: flex;
	justify-content: center;
	height: 85px;
}

.h-100 {
	height: 75px;
}

.btn-upload {
	border: 1px solid color(grey-border);
	border-radius: 2px;
	color: color(grey-border);
	font-size: 12px;
	padding: 2px 5px;
}

.bottom-title {
	border-bottom: 1px solid rgba(156, 166, 176, 0.2);
}

.card-actions {
	background-color: color(primary) !important;
	color: white !important;
	border-bottom-left-radius: 7px;
	border-bottom-right-radius: 7px;
	font-family: map-get($fonts, open-semibold);
	width: 100%;
}

.label-gray {
	color: #4a4a4a;
	font-family: map-get($fonts, lato-regular);
	font-size: 8px;
}

.img-fire {
	height: 29px;
	max-width: 100px;
}

.border-bottom:first-child {
	border-bottom: 0.5px solid #9ca6b0;
}

.wrapper-text-loader {
	align-items: center;
	color: color(grey-border);
	display: flex;
	font-size: 12px;
	justify-content: center;
}

.url-domain {
	color: color(paginationText);
}

.wrapper-upload {
	position: absolute;
	right: 0;
	top: 0;
}

.container-loader {
	height: 50px;
	width: 37px;
}

.wrapper-conf-g {
	background-color: color(green-opacity-two);
	border-radius: 3px;
	color: color(primary);
	font-size: 13px;
	padding: 1px 4px;
}

.btn-conf {
	align-items: center;
	display: flex;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.btn-order {
	border-radius: 2px;
	font-size: 13px;
	padding: 2px 5px;
}

.text-order {
	font-size: 13px;
	font-weight: 600;
}

.btn-100 {
	width: 100%;
}

.loader:before,
.loader:after,
.loader {
	border-radius: 50%;
	width: 4px;
	height: 4px;
	-webkit-animation-fill-mode: both;
	animation-fill-mode: both;
	-webkit-animation: load7 1.8s infinite ease-in-out;
	animation: load7 1.8s infinite ease-in-out;
}
.loader {
	margin: 0 auto;
	font-size: 10px;
	position: relative;
	text-indent: -9999em;
	-webkit-animation-delay: 0.16s;
	animation-delay: 0.16s;
}
.loader:before {
	left: -0.9em;
}
.loader:after {
	left: 0.9em;
	-webkit-animation-delay: 0.32s;
	animation-delay: 0.32s;
}
.loader:before,
.loader:after {
	content: '';
	position: absolute;
	top: 0;
}
@-webkit-keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}
@keyframes load7 {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em color(grey-border);
	}
	40% {
		box-shadow: 0 2.5em 0 0 color(grey-border);
	}
}
</style>
