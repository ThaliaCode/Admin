<template>
	<div>
		<header-page
			caption-navigation="Notificaciones"
			name="type-notifications"
			:title="$route.meta.title"
			list-subsidiaries
			:subsidiaries="subsidiaries"
			:subsidiary-id="subsidiaryId"
			@selected-subsidiary="filterSubsidiary"
		></header-page>
		<div class="mt-5">
			<v-layout justify-center>
				<v-flex
					xs3
					v-for="typeNotification in typeNotfications"
					:key="typeNotification.id"
				>
					<component-type-notification
						:active-value="typeNotification.flagConfig"
						:type-notification="typeNotification"
						@selected-card="selectedCard"
						@whatsapp-conection="whatsappConection(typeNotification, true)"
					/>
				</v-flex>
			</v-layout>
		</div>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="whatsappConection({}, false)"
		>
			<connection-slide
				v-if="actionIs('WMAKI')"
				:action-success-text="actionSuccessText"
				:connection-data="connectionData"
				:counter="counter"
				:show-message="showMessage"
				:show-number="showNumber"
				@action-cancel="whatsappConection({}, false)"
				@action-success="actionSuccess"
			></connection-slide>
		</action-sidebar>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				:is-loading="disabled"
				success-color="primary"
				success-text="Guardar"
				@accept-button-clicked="saveConfiguration"
				@cancel-button-clicked="loadTypeNotifications"
			/>
		</section>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import componentTypeNotification from '@/components/notifications/component-type-notification';
import connectionSlide from '@/components/notifications/connection-slide';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadSubsidiaries();
}

function actionIs(code) {
	return this.action.code === code;
}

function actionSuccess() {
	if (this.connectionData.Location) {
		this.showMessage = true;
		this.counterActivate();
	} else if (this.connectionData.myNumber) {
		this.userDisconnected();
	}
}

function buildData() {
	this.typeNotfications = this.typeNotfications.map((typeNotification) => {
		const newTypeNotification = { ...typeNotification };
		newTypeNotification.label = this.setDataNotification(typeNotification.code,
			'label');
		newTypeNotification.urlImage = this.setDataNotification(typeNotification.code,
			'urlImage', typeNotification.urlImage);
		newTypeNotification.flagActive = typeNotification.flagActive || false;
		newTypeNotification.flagConfig = typeNotification.flagConfig || false;
		newTypeNotification.totalNotifications = typeNotification.totalNotifications || 0;
		return newTypeNotification;
	});
}

function connectedAction() {
	clearInterval(this.interval);
	this.showMessage = false;
	this.userConnected();
}

function counterActivate() {
	this.interval = setInterval(() => {
		if (this.counter > 0) {
			this.counter -= 1;
		} else {
			this.connectedAction();
		}
	}, 1000);
}

function disabled() {
	return this.loading || this.typeNotfications.every(tn => !tn.flagConfig);
}

function filterSubsidiary({ value }) {
	this.subsidiaryId = value.id;
	this.params.subsidiaryCode = value.sucursalCode;
	this.params.subsidiaryAclCode = value.subsidiaryAclCode;
	this.loadTypeNotifications();
}

async function loadDataConnected() {
	const params = {
		subsidiaryCode: this.params.subsidiaryAclCode,
	};
	try {
		({ data: this.connectionData } = await this.$httpNotifications.get(
			'notification-chat/information', { params }));
		this.showNumber = true;
		this.counterCode = 1;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadInfo() {
	const params = {
		subsidiaryCode: this.params.subsidiaryAclCode,
	};
	try {
		({ data: this.connectionData } = await this.$httpNotifications.post(
			'notification-chat/connect', params));
		const valid = Boolean(this.connectionData.Location);
		if (valid) {
			if (this.counterCode < 3) {
				this.actionSuccess();
			} else {
				this.whatsappConection({}, false);
			}
		} else if (this.connectionData.code === 'CONNECTION_STATUS_CONNECTED') {
			this.loadDataConnected();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.showMessage = false;
	}
}

async function loadSubsidiaries() {
	const params = { flagIntegrations: true };
	try {
		({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries', { params }));
		const subsidiary = this.subsidiaries.find(s => s.id === this.$userInfo.comSubsidiariesId)
			|| this.subsidiaries[0];
		this.filterSubsidiary({ value: subsidiary });
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTypeNotifications() {
	const params = { subsidiaryCode: this.params.subsidiaryAclCode };
	try {
		({ data: this.typeNotfications } = await this.$httpNotifications.get(
			'notification-types-unique', { params }));
		this.buildData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function saveConfiguration() {
	this.loading = true;
	const body = {
		data: this.typeNotfications.map(tn => ({
			code: tn.code,
			subsidiaryCode: this.params.subsidiaryCode,
			flagActive: !!tn.flagActive,
			flagConfig: !!tn.flagConfig,
		})),
	};
	try {
		await this.$httpNotifications.patch('notification-types/config', body);
		this.showNotification('La configuración ha sido guardada correctamente.');
		this.loadTypeNotifications();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function selectedCard({ row, value }) {
	this.$set(row, 'flagConfig', value);
}

function setDataNotification(code, prop, urlImage) {
	if (code === 'EMAIL') {
		return prop === 'label' ? 'Correos' : urlImage || '/static/img/notification-email.svg';
	} else if (code === 'PUSH') {
		return prop === 'label' ? 'Push' : urlImage || '/static/img/notification-push.svg';
	} else if (code === 'WTAPP') {
		return prop === 'label' ? 'Whatsapp' : urlImage || '/static/img/notification-whatsapp.svg';
	} else if (code === 'SMS') {
		return prop === 'label' ? 'SMS' : urlImage || '/static/img/notification-sms.svg';
	} else if (code === 'WMAKI') {
		return prop === 'label' ? 'MakiChat' : urlImage || '/static/img/notification-maki-chat.svg';
	}
	return false;
}

function userConnected() {
	this.counter = 15;
	this.counterCode += 1;
	this.loadInfo();
}

async function userDisconnected() {
	this.showMessage = true;
	const params = {
		subsidiaryCode: this.params.subsidiaryCode,
	};
	try {
		await this.$httpNotifications.post('notification-chat/desconnect', params);
		this.showNotification('Se ha desconectado correctamente.');
		this.showNumber = false;
		this.loadInfo();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function whatsappConection({ code }, open) {
	this.action.value = open;
	this.action.code = code;
	this.action.title = open ? 'MAKICHAT - ESTADO DE CONEXIÓN' : '';
	if (!open) {
		clearInterval(this.interval);
		this.counterCode = 1;
		this.connectionData = {
			state: {
				id: 1,
				code: 'offline',
				name: 'Desconectado',
			},
			user: {},
		};
		this.counter = 15;
		this.showMessage = false;
		this.showNumber = false;
	} else if (code === 'WMAKI') {
		this.counterCode = 1;
		this.loadInfo(code);
	}
}

function data() {
	return {
		action: {
			code: '',
			title: '',
			value: false,
			width: 500,
		},
		actionSuccessText: 'Desconectar',
		callToActionCode: 'generate-qr',
		connectionData: {},
		counter: 15,
		counterCode: 1,
		interval: null,
		loading: false,
		notificationInfo: {},
		params: {
			subsidiaryCode: null,
			subsidiaryAclCode: null,
		},
		showMessage: false,
		showNumber: false,
		subsidiaries: [],
		subsidiaryId: 0,
		typeNotfications: [],
	};
}

export default {
	name: 'type-notifications',
	created,
	data,
	components: {
		actionSidebar,
		componentTypeNotification,
		connectionSlide,
		headerPage,
		modalSidebarButton,
	},
	computed: {
		disabled,
	},
	methods: {
		actionIs,
		actionSuccess,
		buildData,
		connectedAction,
		counterActivate,
		filterSubsidiary,
		loadDataConnected,
		loadInfo,
		loadSubsidiaries,
		loadTypeNotifications,
		saveConfiguration,
		selectedCard,
		setDataNotification,
		userConnected,
		userDisconnected,
		whatsappConection,
	},
};
</script>
