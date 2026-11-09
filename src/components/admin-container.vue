<template>
	<v-container fluid pa-0>
		<app-header
			:quantity-notifications="0"
			@open-notifications-event="openNotificationsModal"
			@open-sidebar="toggleMini"
			:mini="mini"
		/>

		<div
			class="plan-expiration-alert"
			:class="[
				planExpirationAlertClass,
				`plan-expiration-alert--${planExpirationAlertState}`,
			]"
			v-if="showPlanExpirationAlert"
		>
			<div class="plan-expiration-alert__icon">
				<v-icon color="white" size="26">warning</v-icon>
			</div>
			<div class="plan-expiration-alert__content">
				<p class="plan-expiration-alert__title">
					{{ planExpirationAlertTitle }}
				</p>
			</div>
			<button type="button" class="plan-expiration-alert__button" @click="goToPlan">
				Renovar plan
			</button>
			<button
				type="button"
				class="plan-expiration-alert__close mt-2"
				aria-label="Cerrar alerta"
				@click="hidePlanAlert"
			>
				&times;
			</button>
		</div>

		<customer-service-banner :mini="mini" />

		<app-sidebar
			:is-visible="isVisible"
			:mini="mini"
			@toogle-mini="toggleMini"
			@toggle-siderbar="toggle"
		/>
		<router-view
			class="container-view"
			:class="{ 'container-view--with-plan-alert': showPlanExpirationAlert }"
		></router-view>
		<component-support-whatsapp :min="mini" v-if="false" />
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			v-model="action.open"
		>
			<notifications-center
				v-if="action.active"
				:notifications="notifications"
				@close-notifications-center="closeNotificationsModal"
			/>
		</action-sidebar>
		<div v-if="!mini" class="overlay-menu" @click="clickListItem"></div>
	</v-container>
</template>

<script>
import componentSupportWhatsapp from '@/components/shared/component-support-whatsapp';
import customerServiceBanner from '@/components/shared/customer-service-banner';
import actionSidebar from './shared/action-sidebar';
import appHeader from './shared/app-header';
import appSidebar from './shared/app-sidebar';
import appSubheader from './shared/app-subheader';
import notificationsCenter from './shared/notifications-center';

function closeNotificationsModal() {
	this.action.active = false;
	this.action.open = false;
}

function notifications() {
	const allNotifications = [];
	if (this.productsNotifications.length > 0) {
		this.productsNotifications.forEach((productNot) => {
			allNotifications.push(productNot);
		});
	}
	if (this.salesNotifications.length > 0) {
		this.salesNotifications.forEach((saleNot) => {
			allNotifications.push(saleNot);
		});
	}
	if (this.oitNotifications.length > 0) {
		this.oitNotifications.forEach((oitNot) => {
			allNotifications.push(oitNot);
		});
	}
	return allNotifications;
}

function openNotificationsModal() {
	this.action.active = true;
	this.action.open = true;
}

function quantityNotifications() {
	return this.salesNotifications.length +
		this.productsNotifications.length +
		this.oitNotifications.length >
		99
		? '99+'
		: this.salesNotifications.length + this.productsNotifications.length;
}

function toggle(value) {
	this.min = value;
}

function toggleMini() {
	this.mini = !this.mini;
}

function clickListItem() {
	this.mini = true;
}

function planEndDate() {
	if (
		this.$userInfo &&
		this.$userInfo.additionalInformation &&
		this.$userInfo.additionalInformation.plan
	) {
		return this.$userInfo.additionalInformation.plan.endDate || null;
	}
	return null;
}

function planExpirationAlertClass() {
	return this.mini ? 'plan-expiration-alert--mini' : 'plan-expiration-alert--expanded';
}

function planExpirationAlertState() {
	if (
		!this.planAlertVisible ||
		!this.$levelProgress ||
		!this.$levelProgress.expirationDate
	) {
		return 'hidden';
	}

	const parsedExpirationDate = new Date(
		this.$levelProgress.expirationDate.replace(' ', 'T')
	);

	if (Number.isNaN(parsedExpirationDate.getTime())) {
		return 'hidden';
	}

	const today = new Date();
	const alertStartDate = new Date(parsedExpirationDate.getTime());
	alertStartDate.setDate(alertStartDate.getDate() - 30);

	if (today > parsedExpirationDate) {
		return 'expired';
	}

	if (today >= alertStartDate) {
		return 'warning';
	}

	return 'hidden';
}

function planExpirationAlertDaysRemaining() {
	if (!this.$levelProgress || !this.$levelProgress.expirationDate) {
		return null;
	}

	const parsedExpirationDate = new Date(
		this.$levelProgress.expirationDate.replace(' ', 'T')
	);

	if (Number.isNaN(parsedExpirationDate.getTime())) {
		return null;
	}

	const today = new Date();
	const todayAtStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const expirationAtStart = new Date(
		parsedExpirationDate.getFullYear(),
		parsedExpirationDate.getMonth(),
		parsedExpirationDate.getDate()
	);

	return Math.round(
		(expirationAtStart.getTime() - todayAtStart.getTime()) / (1000 * 60 * 60 * 24)
	);
}

function planExpirationAlertTitle() {
	if (this.planExpirationAlertState === 'expired') {
		return 'Tu plan ya venció';
	}

	if (this.planExpirationAlertDaysRemaining === 0) {
		return 'Tu plan vence hoy';
	}

	if (this.planExpirationAlertDaysRemaining === 1) {
		return 'Te queda 1 dia para que venza tu plan';
	}

	return `Te quedan ${this.planExpirationAlertDaysRemaining} dias para que venza tu plan`;
}

function hidePlanAlert() {
	this.planAlertVisible = false;
}

function goToPlan() {
	window.open(
		`https://api.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${this.numberRenewals}`,
		'_blank'
	);
}

function created() {
	if (window.innerWidth <= 760) {
		this.mini = true;
		this.min = true;
	}
}

function data() {
	return {
		action: {
			active: false,
			code: 'NOT',
			open: false,
			title: 'Notificaciones',
			width: 468,
		},
		helpActions: [],
		isVisible: true,
		loading: false,
		min: false,
		mini: false,
		numberSupport: process.env.NUMBER_SUPPORT,
		numberRenewals: process.env.NUMBER_RENEWALS,
		planAlertVisible: true,
	};
}

export default {
	name: 'admin-container',
	created,
	components: {
		actionSidebar,
		appHeader,
		appSidebar,
		appSubheader,
		componentSupportWhatsapp,
		customerServiceBanner,
		notificationsCenter,
	},
	computed: {
		notifications,
		planEndDate,
		planExpirationAlertClass,
		planExpirationAlertDaysRemaining,
		planExpirationAlertState,
		planExpirationAlertTitle,
		quantityNotifications,
		showPlanExpirationAlert() {
			return this.planExpirationAlertState !== 'hidden';
		},
	},
	data,
	methods: {
		closeNotificationsModal,
		goToPlan,
		hidePlanAlert,
		openNotificationsModal,
		toggle,
		toggleMini,
		clickListItem,
	},
	watch: {
		$route() {
			this.planAlertVisible = true;
		},
	},
};
</script>
<style lang="scss" scoped>
.plan-expiration-alert {
	align-items: center;
	background: linear-gradient(90deg, #fff7ea 0%, #fffdfa 54%, #fff7ea 100%);
	border: 1px solid #f2d9a8;
	border-radius: 10px;
	box-shadow: 0 8px 20px rgba(240, 165, 0, 0.08);
	display: flex;
	gap: 16px;
	margin: 13px 10px;
	max-width: none;
	padding: 14px 18px;
	transition: margin-left 0.2s ease, width 0.2s ease;

	&__icon {
		align-items: center;
		background: linear-gradient(180deg, #ffb11a 0%, #f39a05 100%);
		border-radius: 10px;
		display: flex;
		flex: 0 0 40px;
		height: 40px;
		justify-content: center;
	}

	&__content {
		flex: 1;
		min-width: 0;
	}

	&__title,
	&__text {
		margin: 0;
	}

	&__title {
		color: #e39310;
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 4px;
	}

	&__text {
		color: #736658;
		font-size: 14px;
		line-height: 1.45;
	}

	&__button,
	&__close {
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	&__button {
		background: linear-gradient(180deg, #ffb11a 0%, #f39a05 100%);
		border-radius: 8px;
		color: white;
		flex: 0 0 auto;
		font-size: 13px;
		font-weight: 700;
		padding: 12px 18px;
		transition: filter 0.2s ease;
	}

	&__button:hover {
		filter: brightness(0.98);
	}

	&__close {
		align-self: flex-start;
		color: #c4ae8f;
		font-size: 28px;
		line-height: 1;
		padding: 0 4px;
	}
}

.plan-expiration-alert--expired {
	background: linear-gradient(90deg, #fdecec 0%, #fff7f7 54%, #fdecec 100%);
	border-color: #f2b8b5;
	box-shadow: 0 8px 20px rgba(215, 56, 44, 0.1);

	.plan-expiration-alert__icon {
		background: linear-gradient(180deg, #ef5350 0%, #d7382c 100%);
	}

	.plan-expiration-alert__title {
		color: #c62828;
	}

	.plan-expiration-alert__text {
		color: #7a4b4b;
	}

	.plan-expiration-alert__button {
		background: linear-gradient(180deg, #ef5350 0%, #d7382c 100%);
	}

	.plan-expiration-alert__close {
		color: #d1a0a0;
	}
}

.plan-expiration-alert--mini {
	margin-left: 28px;
	width: calc(100% - 68px);
}

.plan-expiration-alert--expanded {
	margin-left: 170px;
	width: calc(100% - 220px);
}

.container-view--with-plan-alert {
	padding-top: 12px;
}

@media (max-width: 600px) {
	.plan-expiration-alert {
		gap: 12px;
		margin-left: 10px;
		padding: 14px;
		width: calc(100% - 20px);

		&__title {
			font-size: 17px;
		}

		&__text {
			font-size: 13px;
		}

		&__button {
			margin-left: 0;
			width: 100%;
		}
	}

	.container-view--with-plan-alert {
		padding-top: 8px;
	}
}
</style>
