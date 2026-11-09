<template>
	<v-app>
		<router-view name="login"></router-view>
		<v-content
			:class="{
				'pa-0':
					$route.name === 'login' ||
					$route.name === 'maintenance' ||
					$route.name === 'blocked-company',
				'content-accountant': $route.name === 'accountant-configuration',
				'padding-top-none':
					(!($route.name === 'commerce' || $route.name === 'dashboard-report') &&
						!$route.meta.navigation &&
						$route.query.origin !== 'dashboard') ||
					$route.query.navigationValidation,
			}"
		>
			<v-progress-linear
				class="progress-bar"
				v-bind:indeterminate="isLoading"
				v-if="isLoading"
			>
			</v-progress-linear>
			<app-show-dialog
				:color-dialog="notification.colorDialog"
				:color-hex="notification.colorHex"
				:show-modal-init="notification.show"
				:text-content="notification.text"
				:title-header="notification.title"
				@close-dialog="closeNotification"
			></app-show-dialog>
			<!-- <intermittence-alert /> -->
			<router-view></router-view>
		</v-content>
		<v-snackbar
			:timeout="snackbar.timeout"
			:color="snackbar.color"
			top
			centered
			auto-height
			v-model="snackbar.isVisible"
			:style="{ fontSize: snackbar.fontSize }"
			@click="snackbar.onClick && snackbar.onClick()"
		>
			<span v-html="snackbar.text"></span>
			<v-btn flat @click.stop="snackbar.isVisible = false">Cerrar</v-btn>
		</v-snackbar>
	</v-app>
</template>

<script>
import appShowDialog from '@/components/shared/app-show-dialog';
// import IntermittenceAlert from '@/components/shared/intermittence-alert';
import helper from '@/shared/helper';

function created() {
	const hash = window.location.hash;
	if (hash && hash.includes('access_token')) {
		const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
		const token = params.get('access_token');

		if (token) {
			sessionStorage.setItem('netlify_token', token);
			const returnTo = helper.getLocalData('returnTo') || '/ecommerce/commerce';
			helper.removeLocalData('returnTo');
			window.history.replaceState(null, '', returnTo);
			this.$router.replace(returnTo).catch(() => {});
		}
	}

	this.onToggleSnackBar();
	this.$bus.$on('is-loading', (result) => {
		this.isLoading = result;
	});
	this.$bus.$on('show-modal-error', (result) => {
		this.notification.title = 'ANULAR VENTA';
		this.notification.text =
			'La acción no es válida por que actualmente hay una apertura de caja y usted no esta asociado al punto de venta.';
		this.notification.show = result;
	});
	this.$bus.$on('show-close-login', (result) => {
		this.notification.title = 'ACTUALIZAR APLICACIÓN';
		this.notification.text =
			'Actualmente se encuentra la aplicacion con una version anterior, al cerrar se le actualizará la pagina.';
		this.notification.show = result;
		this.notification.code = 'actualize';
		this.notification.colorHex = '#D5331A';
	});

	// this.$gtag.event('screen_view', {
	// 	app_name: 'myAppName',
	// 	screen_name: 'Home',
	// });
}

function closeNotification() {
	if (this.notification.code === 'actualize') {
		window.location.reload();
	}
	this.notification.show = false;
	this.notification.title = '';
	this.notification.text = '';
}

function data() {
	return {
		isLoading: false,
		k: true,
		notification: {
			code: null,
			colorDialog: 'error',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
	};
}

export default {
	name: 'app',
	created,
	data,
	components: {
		appShowDialog,
		// IntermittenceAlert,
	},
	methods: {
		closeNotification,
	},
};
</script>

<style lang="scss">
html {
	font-size: 16px;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

img {
	vertical-align: middle;
}

.content {
	background: white;
	padding: 133px 12px 0px !important;

	&--wrap {
		background-color: map-get($colors, background-table);
		padding: 0px;
	}

	@media (min-width: 768px) {
		padding: 42px 0px 0px !important;
	}

	@media (min-width: 760px) {
		padding: 40px 0px 0px 48px !important;
	}

	@media (max-width: 760px) {
		padding: 0px !important;
	}
}

.chk-all {
	&.input-group {
		.input-group__input {
			.icon {
				font-size: 18px !important;
				height: 18px;
			}
		}
		.input-group__details {
			display: none;
		}
	}
}

.check-active {
	.input-group__details {
		display: none;
	}
}

.japi-input-text {
	margin-bottom: 17px;
	label {
		padding-left: 15px;
	}
	&.input-group {
		.input-group__input {
			background-color: white;
			border-radius: 3px;
			box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
			height: 33px;
			padding-left: 15px;
		}
		.input-group__details {
			display: none;
		}
	}
}

.japi-input-text-table {
	margin: 10px 0;
	label {
		padding-left: 5px;
	}
	&.input-group {
		padding: 0;
		.input-group__input {
			background-color: white;
			border-radius: 3px;
			box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
			padding-left: 5px;
			input {
				height: 100%;
				font-size: 13px;
			}
		}
		.input-group__details {
			display: none;
		}
	}
}

.japi-input-text-error {
	margin-bottom: 10px;
	label {
		color: map-get($colors, error) !important;
		padding-left: 15px;
	}
}

.japi-input-textarea {
	margin-bottom: 10px;
	label {
		padding-left: 15px;
	}
	&.input-group {
		.input-group__input {
			background-color: white;
			border-radius: 3px;
			box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
			padding-left: 15px;
		}
		.input-group__details {
			display: none;
		}
	}
}

.japi-input-select {
	margin-bottom: 10px;
	label {
		padding-left: 15px;
	}
	&.input-group {
		.input-group__input {
			background-color: white;
			border-radius: 3px;
			box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
			height: 33px;
			padding-left: 15px;
		}
		.input-group__details {
			display: none;
		}
	}
}

.icon-maki {
	.list__tile {
		justify-content: center;
	}
}

.icon-maki-mini {
	.list__tile {
		display: block;
	}
}

.align-image {
	.list__tile {
		box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
		justify-content: center;
	}
}

.bars-align {
	.app-actions-list {
		left: 10px !important;
	}

	.list__tile {
		height: 33px !important;
		justify-content: flex-end;
		padding: 0;

		&--avatar {
			height: 26px;
		}
	}
}

.background-bar {
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
	background-color: color(primary);
	justify-content: center;
}

main.content.pa-0 {
	padding: 0px !important;
}

.progress-bar {
	left: 0px !important;
	margin: 0px !important;
	position: absolute !important;
	right: 0px !important;
	top: 120px !important;

	@media (min-width: 768px) {
		top: 41px !important;
	}
}

.sidebar-bg {
	background-color: color(primary) !important;
	height: calc(100vh - 70px);

	&.list {
		background-color: color(primary) !important;

		.list__group {
			&__header {
				&__prepend-icon,
				&__append-icon {
					display: none;
				}

				&:hover {
					background: transparent;
				}

				.list__tile {
					font-family: map-get($fonts, open-regular);
					font-size: 13px;
					height: 31px;
					padding: 0 19px 0 0;
					text-transform: uppercase;

					&:hover,
					&--active {
						background: transparent;
						opacity: 1;
					}

					.list__tile__action {
						padding: 0;

						small {
							text-align: center;
							width: 100%;
						}
					}
				}

				&--active {
					.list__tile {
						opacity: 1;
					}
				}
			}

			&__items {
				&.padding-items {
					padding-bottom: 12px;
				}

				.list__tile {
					font-family: map-get($fonts, open-regular);
					font-size: 12px;
					height: 28px;
					padding: 0 0 0 21px;

					&:hover,
					&--active {
						background: transparent;
						opacity: 1;
					}

					&__action {
						justify-content: flex-start;
						min-width: 26px;

						.icon {
							font-size: 6px;
						}
					}
				}
			}

			&:before,
			&:after {
				background: rgba(0, 0, 0, 0.12);
			}
		}
	}

	@media (max-width: 760px) {
		height: calc(100vh);
	}
}

.char-value-select {
	&.input-group {
		.input-group__input {
			.icon {
				font-size: 18px !important;
				height: 18px;
			}
		}

		label {
			color: map-get($colors, paginationText) !important;
			font-size: 13px;
		}
	}
}

.checkbox-value {
	&.input-group {
		label {
			color: #4a4a4a !important;
			font-family: map-get($fonts, open-regular);
			font-size: 14px !important;
		}
	}
}

.sidebar-border {
	z-index: 205;
	transform: translateX(0px) !important;

	&.navigation-drawer--mini-variant {
		.list__group__header {
			.list__tile {
				padding-left: 0px;

				&__content {
					display: none;
				}
			}
		}

		@media (max-width: 760px) {
			left: -70%;
		}
	}

	@media (max-width: 760px) {
		padding: 0 !important;
		top: 40px !important;
		width: 70% !important;
	}
}

.columns-menu {
	&.menu__content {
		background-color: white;
		border-radius: 4px;
		box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.4);
		max-width: 170px;
		padding-left: 5px;
		padding-right: 5px;

		.input-group {
			label {
				color: map-get($colors, subheaderText);
				font-family: map-get($fonts, opens-semibold);
				font-size: 13px;
				line-height: 21px;
			}

			&__input {
				min-height: 20px;

				.icon {
					font-size: map-get($sizes, medium);
					height: 5px !important;
				}
			}

			&--selection-controls__ripple {
				height: 10px;
				transform: translate(2px, 0%);
				width: 10px;
			}
		}

		.apply {
			border-top: 1px solid #e5e5e5;
			margin-top: 5px;

			button {
				color: map-get($colors, info);
				font-family: map-get($fonts, opens-semibold);
				font-size: 13px;
				outline: none;
			}
		}
	}
}

.select-chips_code {
	&.input-group {
		background: white;
		border: 1px solid map-get($colors, background-card);
		border-radius: 3px;
		box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
		color: map-get($colors, paginationText) !important;
		font-size: 12px !important;
		min-height: 30px;

		&.input-group.input-group--solo {
			box-shadow: none;

			label {
				color: map-get($colors, paginationText) !important;
				font-family: map-get($fonts, open-light) !important;
				font-size: 12px;
				top: 1px;
			}
		}
	}
	&.shadow-inset {
		border-radius: 3px;
		box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.2);
	}

	&.input-group--focused.primary--text {
		border-color: color(primary) !important;
	}
}

.filter-select {
	&.input-group--text-field.input-group--multi-line textarea {
		padding: 4px 15px !important;
	}

	&.input-group {
		background-color: color(white) !important;
		border: 0.5px solid color(silver-detail-table) !important;
		border-radius: 5px !important;
		box-shadow: none !important;
		min-height: 0 !important;
		padding: 0px !important;

		&.input-group--focused.primary--text {
			border: 0.5px solid color(primary) !important;

			& + .label {
				color: color(primary) !important;
			}

			&.new-error {
				border: 0.5px solid color(error) !important;

				& + .label {
					color: color(error) !important;
				}
			}
		}

		input {
			color: color(paginationText) !important;
			font-family: font(open-regular) !important;
			font-size: size(small) !important;
			height: auto !important;
			min-height: 29px !important;
			padding-left: 9px !important;
			padding-right: 9px !important;

			&[disabled] {
				color: color(brown-grey) !important;
			}
		}

		input::placeholder {
			color: color(brown-grey) !important;
		}

		input::-moz-placeholder {
			color: color(brown-grey) !important;
		}

		input::-webkit-input-placeholder {
			color: color(brown-grey) !important;
		}

		&.shadow-inset {
			border-radius: 3px;
			box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.2);

			&-chip {
				border-radius: 5px;
				box-shadow: inset 0px 0px 1px 0px rgba(0, 0, 0, 0.5);
				height: 30px;
				left: 33px;
				max-width: 124px;
				position: absolute;
				top: 1.5px;
				width: 100%;

				input {
					color: map-get($colors, subheaderText);
					font-family: map-get($fonts, open-semibold);
					font-size: map-get($sizes, medium);
					padding: 0 19px;
					text-align: right;
				}

				label {
					color: map-get($colors, subheaderText);
					font-family: map-get($fonts, open-semibold);
					font-size: map-get($sizes, medium);
					height: 30px;
					left: auto;
					line-height: 30px;
					text-align: right;
					right: 19px;
				}
			}

			&-table {
				border-radius: 3px;
				box-shadow: none;
				display: inline-flex;
				height: 22px;
				max-width: 72px;

				.input-group__input {
					min-height: 22px;
				}

				input {
					border-radius: 3px;
					box-shadow: inset 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
					color: map-get($colors, paginationText);
					font-size: map-get($sizes, small);
					height: 22px;
					padding: 0 5px;
					text-align: right;
				}

				label {
					color: map-get($colors, subheaderText);
					font-size: map-get($sizes, medium);
					height: 22px;
					left: auto;
					line-height: 22px;
					text-align: right;
					right: 5px;
				}
			}

			.input-group__selections {
				border-width: 1px;
				height: 24px;

				&__comma {
					color: map-get($colors, paginationText) !important;
				}
			}

			.input-group__append-icon {
				width: 26px;
			}

			input {
				color: map-get($colors, paginationText) !important;
				font-family: map-get($fonts, open-semibold);
				font-size: map-get($sizes, medium);
				height: 30px;
				padding-left: 14px;

				&[readonly] {
					color: map-get($colors, subheaderText) !important;
				}
			}

			label {
				color: map-get($colors, paginationText) !important;
				height: 30px;
				line-height: 30px;
			}

			&-calendar {
				.icon {
					background: map-get($colors, primary);
					border-bottom-right-radius: 2px;
					border-top-right-radius: 2px;
					color: white !important;
					font-size: 24px;
					height: 30px;
					line-height: 32px;
					padding-left: 3px;
					width: 30px;
				}

				&.shadow-inset-calendar-start {
					.icon {
						background: map-get($colors, success);
					}
				}

				&.shadow-inset-calendar-start,
				&.shadow-inset-calendar-end {
					.icon {
						height: 28px;
						line-height: 30px;
					}
				}

				&.shadow-inset-calendar-requirement {
					.icon {
						background: white;
						border: 1px solid map-get($colors, success);
						color: map-get($colors, success) !important;
						height: 28px;
						line-height: 30px;
					}
				}
			}

			&.input-address {
				.input-group__input {
					padding-right: 7px;
				}

				.input-group__append-icon {
					background-color: map-get($colors, orange-btn);
					border-radius: 4px;
					box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.3);
					color: white !important;
					font-size: 16px;
					height: 20px;
					padding-top: 2px;
					text-align: center;
					width: 20px;
				}
			}

			&.input-time-picker {
				.input-group--text-field__suffix {
					color: map-get($colors, paginationText) !important;
					font-family: map-get($fonts, open-);
					font-size: map-get($sizes, medium);
					height: 28px;
					margin: 0px;
					padding-right: 20px;
				}
			}

			&.textarea-content {
				border: none !important;
				min-height: 85px;

				label {
					top: -1px;
				}

				.input-group__input {
					border: none !important;
				}

				textarea {
					padding-top: 7px;
				}
			}
		}

		&--autocomplete {
			input {
				color: map-get($colors, subheaderText);
				font-size: 13px;
				padding-left: 14px;
			}
		}

		&--text-field {
			label {
				color: map-get($colors, subheaderText) !important;
				font-family: map-get($fonts, open-light);
				font-size: 13px;
				height: 23px;
				left: 13px;
				line-height: 23px;
				top: 0px;
			}
		}

		&--select {
			.input-group__selections {
				height: 30px;
				margin-top: 0px;

				&__comma {
					color: map-get($colors, paginationText) !important;
					font-family: map-get($fonts, open-regular);
					font-size: 13px;
					padding: 0px 4px 0px 13px;
				}
			}
		}

		.input-group__append-icon {
			color: map-get($colors, subheaderText) !important;
			font-size: 24px;
			height: 23px;
			padding: 0px;
			width: 25px;
		}

		.input-group__details {
			display: none;
		}

		&.new-error {
			border: 0.5px solid color(error) !important;

			& + .label {
				color: color(error) !important;
			}
		}
	}

	&.input-group.input-group--multiple {
		height: auto;

		.input-group__selections {
			height: auto;
			margin: 0px;
			padding-left: 10px;
		}
	}

	&-content {
		.list {
			&__tile {
				color: map-get($colors, subheaderText);
				font-family: map-get($fonts, open-light);
				font-size: 13px;
				height: 33px;
			}
		}
	}

	&.input-group--textarea {
		height: auto !important;
		min-height: 74px !important;

		.input-group__input {
			border: 0px !important;
			height: auto !important;
			min-height: 74px !important;
			padding: 0px !important;
		}

		textarea {
			color: color(paginationText);
			font-family: font(open-regular);
			font-size: size(small) !important;
			height: 74px;
			padding: 5px 9px !important;
		}
	}

	&.input-group--text-field.input-group--dirty:not(
			.input-group--full-width
		).input-group--textarea
		label {
		transform: translate(0, -19px) scale(0.75) !important;
	}

	.input-group__input {
		height: 29px;
		min-height: 29px;
	}

	&.input-group--chips {
		.input-group__input {
			height: auto !important;
		}
	}

	&.input-group--chips {
		.input-group__input {
			height: 29px;
			min-height: 29px;
		}
	}
}

.show-error {
	.input-group__details {
		font-size: map-get($sizes, small10);
		display: block !important;
		padding-top: 0;
	}
	.input-group__details:before {
		height: 0px;
	}
}

.table-style {
	.table__overflow {
		.table {
			thead tr {
				background-color: map-get($colors, primary);
				height: 30px;
				th {
					color: white !important;
				}
			}
			tbody tr:nth-child(even) {
				background-color: map-get($colors, white-content);
			}
		}
	}
}

.general-filter-button {
	height: 25px !important;
	min-width: auto !important;

	.btn__content {
		justify-content: center;
		padding: 0px;
	}
}

.header-page-download-document {
	.btn__content {
		padding: 0px;
	}
}

.application {
	font-family: font(open-regular) !important;
	line-height: normal !important;
}

.modal-filter-footer {
	background: white;
	bottom: 0px;
	position: fixed;
	width: 100%;
	z-index: 2;
}

.filter-by-row {
	.input-group {
		padding-left: 18px;

		label {
			color: map-get($colors, subheaderText) !important;
			font-family: map-get($fonts, open-semibold);
			font-size: 13px;
			margin-left: 18px;
		}

		&__input {
			.icon {
				font-size: map-get($sizes, medium);
				height: 12px !important;
			}
		}
	}

	&.filter-by-row-sales {
		.input-group {
			label {
				color: map-get($colors, paginationText) !important;
				font-family: map-get($fonts, open-semibold) !important;
				font-size: map-get($sizes, medium) !important;
				height: auto;
				line-height: 1.2;
				white-space: normal !important;
			}
		}

		.icon {
			top: 9px !important;
		}
	}
}

.chip-exchange {
	.chip__content {
		height: 20px;
		letter-spacing: normal;
		line-height: 1;
		padding: 0px 10px;
		white-space: normal;
	}
}

.edit-price-utility {
	.input-group {
		label {
			font-size: 12px;
			color: map-get($colors, subheaderText);
			left: 30px;
		}

		&__details {
			display: none;
		}
	}
}

.radio-group.sale-radio,
.selling-points {
	.input-group {
		&__input {
			min-height: 19px;

			label {
				color: map-get($colors, subheaderText);
				font-size: map-get($sizes, medium);
				height: 19px;
				left: 16px;
				line-height: 19px;
			}

			.icon {
				font-size: map-get($sizes, small);
				height: 13px !important;
			}
		}

		&__details {
			display: none;
		}
	}

	&.radio-expansion-panel {
		&.input-group {
			padding: 5px 0px;
		}

		.input-group {
			&__input {
				display: flex;
				flex: 1 1 auto;
				flex-direction: row;
				flex-wrap: wrap;
				min-height: 19px;
				min-width: 0;

				label {
					color: map-get($colors, paginationText);
					font-size: 13px;
					height: 19px;
					left: 20px;
					line-height: 21px;
					text-transform: capitalize;
				}

				.icon {
					font-size: 16px;
					height: 16px !important;
				}
			}

			&__details {
				display: none;
			}
		}
	}

	.sale-radio-ticket {
		padding-left: 0px;
		padding-right: 44px;

		label {
			width: auto;
		}
	}

	.sale-radio-note {
		padding-left: 0px;
		padding-right: 16px;

		@media (min-width: 768px) {
			padding-right: 75px;
		}

		label {
			left: 16px;
		}
	}

	.sale-radio-bill {
		padding-right: 28px;
	}
}

.align-col-responsive {
	margin-bottom: 5px;
	text-align: left;

	@media (min-width: 768px) {
		margin-bottom: 0px;
		text-align: center;
	}
}

.pd-col-responsive {
	padding-left: 20px;

	@media (min-width: 768px) {
		padding-left: 0px;
	}
}

.btn-action-requeriment {
	border-radius: 5px !important;
	box-shadow: none !important;
	color: white !important;
	height: 30px !important;
	margin: 0px;
	text-transform: none !important;

	.btn__content {
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small10);

		img {
			height: 20px;
			margin-left: 10px;
		}
	}
}

.btn-action-save {
	border: 1px solid map-get($colors, primary) !important;
	border-radius: 5px !important;
	box-shadow: none !important;
	color: map-get($colors, primary) !important;
	height: 30px !important;
	margin: 0px;
	text-transform: none !important;

	.btn__content {
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small10);

		img {
			height: 20px;
			margin-left: 10px;
		}
	}
}

.btn-action {
	border-radius: 5px !important;
	box-shadow: none !important;
	color: white !important;
	height: 30px !important;
	margin: 0px;
	text-transform: none !important;
	width: 97px !important;

	&-width {
		width: auto !important;
	}

	&-block {
		min-width: auto !important;
		width: 100% !important;
	}

	.btn__content {
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small10);
		padding: 0px;

		img {
			height: 20px;
			margin-left: 10px;
		}
	}

	&.text-large {
		.btn__content {
			font-family: map-get($fonts, open-bold);
			font-size: map-get($sizes, small);
		}
	}
}

.change-document-btn {
	.btn__content {
		padding: 0px;
	}
}

.overflow-auto {
	overflow: auto;
	margin-bottom: 105px;
}

.options-menu {
	.btn__content {
		padding: 0px 2px;
	}

	button:hover {
		&:before {
			background-color: transparent !important;
		}
	}

	&-content {
		.list {
			border-radius: 4px;
			box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.25);
			display: flex;
			padding: 0px;

			&__tile {
				height: 32px;
				padding: 0 8px;
			}
		}
	}
}

.progress-companies {
	.progress-linear__background {
		background-color: transparent !important;
	}
}

.notification {
	&-btn {
		.btn__content {
			padding: 0px;
		}
	}

	&-card {
		.btn__content {
			max-width: 100%;
			padding: 0px 0px 0px 17%;
			white-space: normal;
		}
	}
}

.theme--light {
	.table-icon {
		.btn__content {
			padding: 0px;
		}

		&.btn--disabled {
			&:not(.btn--icon):not(.btn--flat) {
				background-color: transparent !important;
				opacity: 0.6;
			}
		}
	}

	.switch-vendor {
		&.switch {
			.input-group--selection-controls__ripple--active:after {
				background-color: color(primary) !important;
			}
		}
	}
}

.application .theme--light {
	.switch-vendor {
		&.switch {
			.input-group--selection-controls__ripple--active:after {
				background-color: color(primary) !important;
			}
		}
	}
}

.application {
	font-family: font(open-regular) !important;
	line-height: normal !important;
}

.wrapper-create-employee {
	.theme--dark {
		&.btn {
			&.btn--disabled {
				&:not(.btn--icon):not(.btn--flat) {
					background-color: rgba(0, 0, 0, 0.12) !important;
				}
			}
		}
	}
}

.filter-toggle {
	.btn {
		background-color: transparent !important;

		.btn__content {
			height: 28px;

			&:before {
				background-color: transparent !important;
			}
		}

		&.btn--disabled {
			&:not(.btn--icon):not(.btn--flat) {
				background-color: transparent !important;
			}

			.btn__content {
				&:before {
					background-color: transparent !important;
				}
			}
		}
	}
}

.dialog.dialog-cancel {
	border-radius: 10px;
	height: 237px;

	.card {
		height: 237px !important;
		padding: 32px 65px 22px;

		&__title {
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, small);
		}
	}
}

.textarea-content {
	.input-group__input {
		border-radius: 0px !important;
		margin-bottom: 15px;
		max-height: 110px;
		padding: 0px !important;

		textarea {
			border-radius: 0px;
			color: map-get($colors, paginationText);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, small);
			padding-left: 10px;
			padding-top: 10px !important;
		}
	}

	input {
		height: 100% !important;
	}
}

button {
	min-width: 5px;
	outline: none;

	.table-icon {
		outline: none;
	}
}

.input-group--hide-details {
	.input-group__details {
		display: none;
	}
}

#calendar {
	padding: 0px 15px 15px;

	.fc {
		&-toolbar {
			&.fc-header-toolbar {
				margin-bottom: 0px;
			}
		}

		&-button {
			background-color: map-get($colors, background-sidebar);
			background-image: none;
			border: 1px solid map-get($colors, subheaderText);
			box-shadow: none;
			color: map-get($colors, subheaderText);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, medium);
			height: 25px;
			line-height: map-get($sizes, medium);
			outline: none;
			text-shadow: none;

			&:first-child {
				border-bottom-left-radius: 5px;
				border-top-left-radius: 5px;
			}

			&:last-child {
				border-bottom-right-radius: 5px;
				border-top-right-radius: 5px;
			}
		}

		&-center {
			h2 {
				color: map-get($colors, subheaderText);
				font-family: map-get($fonts, regular);
				font-size: map-get($sizes, medium18);
			}
		}
	}
}

.title-form {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: 13px;
}

.hr-info {
	background-color: map-get($colors, blue-grey) !important;
}

.form-group__message {
	color: map-get($colors, orange-btn);
	font-family: map-get($fonts, open-semibold);
	font-size: 11px;

	&--full {
		display: block;
	}
}

.pl-add-container {
	@include flex-center;
	background-color: color(primary) !important;
	border-radius: 5px;
	display: inline-flex;
	height: 20px;
	width: 20px;
}

.btn-list {
	border-radius: 5px !important;
	box-shadow: none !important;
	height: 20px !important;
	min-width: 20px !important;

	&-add {
		border: 1px solid map-get($colors, primary);
		color: map-get($colors, primary) !important;
	}

	&-remove {
		border: 1px solid map-get($colors, orange-btn);
		color: map-get($colors, orange-btn) !important;
	}

	.btn__content {
		height: 18px;
		padding: 0px;
	}

	.icon {
		font-size: 20px;
	}
}

.custom-loader {
	animation: loader 1s infinite;
	display: flex;
}

.tabs__container--overflow .tabs__div.customer-tabs {
	flex: 0 1 auto;
}

@-moz-keyframes loader {
	from {
		transform: rotate(0);
	}
	to {
		transform: rotate(360deg);
	}
}

@-webkit-keyframes loader {
	from {
		transform: rotate(0);
	}
	to {
		transform: rotate(360deg);
	}
}

@-o-keyframes loader {
	from {
		transform: rotate(0);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes loader {
	from {
		transform: rotate(0);
	}
	to {
		transform: rotate(360deg);
	}
}

.size {
	cursor: pointer;
	height: 34px;
	width: 34px;
}

.fast-register-footer {
	background-color: white;
	bottom: 0%;
	position: fixed;
	width: 100%;
}

.expansion-panel-component {
	.expansion-panel {
		&__header {
			background-color: map-get($map: $colors, $key: expansion-panel-header);
			color: white;
			font-family: map-get($map: $fonts, $key: open-semibold);
			font-size: 13px;
			height: 30px;
			line-height: 1.2;
			padding: 0px 0px 0px 34px;
			text-transform: capitalize;
		}

		&__container .header__icon {
			border-left: 1px solid white;
			height: 30px;
		}

		&__container .header__icon .icon {
			color: white !important;
			font-size: 44px;
			height: 30px;
			line-height: 0.7;
		}
	}
}

.row-background-grey {
	background-color: map-get($map: $colors, $key: background-table);
}

.feature-footer {
	background-color: white;
	bottom: 0;
	position: absolute;
	width: 100%;
}

.opacyble {
	opacity: 0.3;
}

.sidebar-active {
	.list__tile.list__tile--link {
		font-family: map-get($fonts, open-bold) !important;
		font-size: map-get($sizes, medium) !important;
		opacity: 1 !important;
	}

	.icon-rotate {
		transform: rotate(180deg);
	}
}

.btn-action-bar {
	.list__tile__action {
		min-width: 40px;
	}

	.btn__content {
		justify-content: flex-start;
		padding: 0px 4px;
	}
}

.action-bar {
	display: flex;
	flex-flow: column;
	width: 60px;
}

.action-bar_element {
	align-items: center;
	background-color: white;
	border: 1px solid color(blue-price);
	border-radius: 4px;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
	color: color(subheaderText);
	display: grid;
	font-size: size(small10);
	grid-template-columns: 35px 1fr;
	grid-template-rows: 40px;
	justify-content: center;
	margin-bottom: 5px;
	padding: 0 11px 0 9px;
	text-align: left;
	transform: translateX(10px);
	transition: transform 200ms ease-out;
	width: 120px;
}

.action-bar_element:hover {
	transform: translateX(-52px);
}

.title-section {
	border-bottom: 1px solid color(blue-grey);
	font-family: font(open-bold);
	font-size: size(medium);

	.btn__content {
		justify-content: space-between;
	}
}

.mr-adjust {
	margin-right: 0;
}

.image-button {
	min-width: 30px !important;
	width: 30px !important;
}

.view-image {
	height: 15px !important;
	margin: 0 !important;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
	transform: translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
	transition-property: opacity, transform;
	transition-duration: 0.2s;
}

.fade-left-enter-active {
	animation: lateral 0.3s;
}

.fade-left-leave-active {
	animation: lateral 0s reverse;
}

@keyframes lateral {
	0% {
		flex-basis: 0;
	}
	100% {
		flex-basis: 50%;
	}
}

.fade-lateral-enter,
.fade-lateral-leave-to {
	opacity: 0;
	transform: scaleX(0);
}

.fade-lateral-enter-active,
.fade-lateral-leave-active {
	transition-property: opacity, transform, transform-origin;
	transition-duration: 0.3s;
}

.text-field {
	&.input-group.input-group--solo .input-group__input {
		padding: 0 !important;
	}
	&.input-group.input-group--solo {
		min-height: 25px;
	}
	&.input-group--text-field input,
	.input-group--text-field textarea {
		font-size: size(small);
		position: absolute;
	}

	input::placeholder {
		color: color(brown-grey);
	}

	input::-moz-placeholder {
		color: color(brown-grey);
	}

	input::-webkit-input-placeholder {
		color: color(brown-grey);
	}
}

.select-actions {
	.select-app {
		&.input-group {
			background-color: color(success) !important;
			color: white !important;
			font-family: map-get($fonts, open-bold);
		}
	}

	.list__tile--link {
		background-color: color(success) !important;
	}
}

.select-app {
	padding-left: 9px !important;

	&.input-group {
		background: white;
		border: 0.5px solid color(silver-detail-table);
		border-radius: 5px;
		padding-top: 0px !important;

		&:not(.shadow-inset) {
			box-shadow: none !important;
		}

		.chip--select-multi {
			margin: 0px 4px 0px 0px !important;

			.chip__content {
				height: auto !important;
				min-height: 13px !important;
			}
		}
	}

	input {
		height: auto !important;
		min-height: 23px !important;
		padding-bottom: 0px !important;
	}

	.input-group__input {
		min-height: 29px;

		.input-group__icon-clearable {
			font-size: 17px !important;
		}
	}

	&.input-group--focused.primary--text {
		border-color: color(primary) !important;
	}

	&.input-group--focused {
		& + .label {
			color: color(primary);
		}
	}

	&.input-group--select .input-group__selections__comma {
		color: color(paginationText) !important;
		font-family: font(open-regular);
		font-size: size(small);
	}

	&-content {
		border: 1px solid color(primary);
		border-radius: 5px;

		.list {
			padding: 0px !important;
		}

		.list__tile {
			color: color(brown-grey);
			font-size: size(small);
			height: 25px !important;

			&__action {
				min-width: 24px !important;
			}
		}

		&.menu__content--autocomplete {
			.list__tile {
				padding: 0px !important;
			}

			.list__tile__content {
				padding: 0px 9px !important;

				&.btn-item {
					background-color: color(primary) !important;
					color: color(white) !important;
					font-family: font(open-semibold) !important;
				}
			}

			.list__tile__action--select-multi + .list__tile__content {
				padding: 0px 3px !important;
			}
		}

		.material-icons {
			&.icon--selection-control {
				font-size: size(medium16) !important;
				height: 16px !important;
				left: 6px !important;
				top: 6px !important;
			}
		}
	}

	.material-icons {
		font-size: 22px !important;

		&.input-group__append-icon {
			margin-left: auto !important;
		}
	}
}

.date-picker-input {
	.input-group.input-group--solo label {
		font-size: size(small);
		top: 0;
	}
}

.is-not-selectable {
	table th {
		&:first-child {
			width: auto !important;
		}
	}
}

.input-group.input-group--selection-controls
	.input-group__input
	.icon--selection-control {
	top: 3px;
}

.tabs-form {
	.tabs__slider {
		height: 3px;
	}
}

.tags-form {
	&.chip--small {
		height: 22px;
	}

	.chip__content {
		height: 24px;
	}

	.chip__close > .icon {
		font-size: 18px;
	}
}

button:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.jailai {
	animation: jailai 3s ease-in;
}

@keyframes jailai {
	from {
		background: yellow;
	}
	to {
		background: white;
	}
}

.due-btn {
	.btn__content {
		&:before {
			background-color: transparent !important;
		}
	}
}

.form-height {
	min-height: 100vh;
}

.text-uppercase {
	text-transform: uppercase;
}

.btn-auto {
	height: auto !important;
	min-width: auto !important;
	width: auto !important;
}

.btn-full {
	height: auto;
	min-width: auto !important;
	width: 100% !important;
}

.btn-total {
	.btn__content {
		padding: 0px;
	}
}

.primary-select .select-app {
	background-color: color(primary) !important;
	color: map-get($colors, white) !important;

	.input-group__selections__comma {
		color: map-get($colors, white) !important;
		font-family: map-get($fonts, open-bold);
		font-size: 11px;
	}

	.input-group__append-icon {
		color: map-get($colors, white) !important;
	}
}

.upload-button {
	&.btn {
		box-shadow: none;
		height: 30px;
		margin: 0;
		min-width: 0;

		.btn__content .icon {
			color: white;
		}
	}
}

.proof-delete-image {
	.btn--floating.btn--small .icon {
		font-size: size(large);
	}

	.material-icons {
		display: flex;
	}
}

.switch-status {
	&.switch:not(.input-group--dirty) {
		color: map-get($colors, error) !important;

		&.input-group .input-group--selection-controls__toggle {
			opacity: 0.5;
		}

		.input-group--selection-controls__container {
			color: inherit !important;
		}

		.input-group--selection-controls__ripple:after,
		.input-group--selection-controls__ripple:after {
			background-color: map-get($colors, error);
		}
	}
}

.delete-reason {
	.select-app {
		max-width: none !important;
	}
}

.tag-chip {
	.chip__content {
		border-radius: inherit;
		height: 18px;
	}
}

.tag-select {
	.input-group__selections {
		height: auto !important;
		min-height: 24px;
	}
}

.subtotal-container {
	position: relative;
}

.subtotal-menu {
	align-items: center;
	background-color: color(summary);
	display: flex;
	font-size: 12px;
	justify-content: center;
	min-width: 270px;
	padding: 10px 15px;
	position: absolute;
	right: 0;
	top: 115%;
	z-index: 3;
}

.subtotal-menu-content {
	font-size: 12px;
	width: 100%;

	p {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
		white-space: nowrap;

		.taxes-title {
			font-family: font(open-regular);
			margin-right: 10px;
		}
	}

	.input-group {
		label {
			font-size: 12px;
		}
	}
}

.prices-width {
	.filter-select.input-group.shadow-inset {
		input {
			padding-left: 5px;
			width: 85px !important;
		}
	}
}

.input-address-custom {
	.filter-select.input-group .input-group__append-icon {
		background-color: map-get($colors, orange-btn) !important;
		color: map-get($colors, white) !important;
		font-size: map-get($sizes, large);
		height: 100%;
		padding-left: 1.5px;
		padding-top: 3px;
	}
}

.btn-totals {
	border: 1px solid color(subheaderText);
}

.subtotal {
	align-items: center;
	display: flex;
	font-size: 12px;
	justify-content: center;

	button {
		color: color(info);
		margin-left: 8px;
	}
}

.totals-section {
	background-color: color(summary);
	font-family: font(open-bold);
}

.product-search-custom {
	.filter-select.input-group .input-group__append-icon {
		background-color: map-get($colors, primary);
		border-bottom-right-radius: 5px;
		border-top-right-radius: 5px;
		color: map-get($colors, white) !important;
		font-size: 24px;
		height: 100%;
		line-height: 31px;
		padding: 0px 3px;
		width: 30px;
	}
}

.btn-action.btn-width-auto {
	height: auto !important;
	width: auto !important;
}

.textarea-custom {
	&.filter-select {
		height: 80px !important;

		.input-group__input {
			border: 0px !important;
			padding: 5px 15px !important;

			textarea {
				font-family: map-get($fonts, open-semibold);
				font-size: 14px;
				resize: none;
			}
		}
	}
}

.custom-autocomplete {
	.filter-select.input-group.shadow-inset .input-group__selections {
		border-right: 0px;

		& + div + i {
			font-size: 20px;
		}
	}

	&.custom-autocomplete-search {
		.filter-select.input-group.shadow-inset .input-group__selections {
			& + div + i {
				color: map-get($colors, primary) !important;
				font-size: 24px;
				padding-right: 2px;
			}
		}
	}
}

.input-group--select.input-group--focused.input-group--open
	.input-group__append-icon:not(.input-group__icon-clearable) {
	transform: none;
}

.chip.chip-search {
	.chip__content {
		border-radius: 8px;
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small10);
		height: 17px;
		padding: 0px 6px;
	}
}

.filter-select-content.custom-select-content-search .list__tile {
	height: 68px;

	.input-group--select.input-group--focused.input-group--open
		.input-group__append-icon:not(.input-group__icon-clearable) {
		transform: none;
	}
}

.custom-select-content {
	border-radius: 0px;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;

	.list__tile--highlighted {
		border-bottom: 1px solid map-get($colors, blue-grey);
	}

	.list__tile__title,
	.list__tile__sub-title {
		color: map-get($colors, paginationText);
		font-size: 11px;
		height: 13px;
		line-height: 11px;
	}

	.list__tile__sub-title {
		height: auto;
		margin-top: 2px;
	}
}

.custom-select-content-open {
	display: inline-block !important;
	z-index: 8 !important;
}

.switch-status.switch-tax {
	label {
		color: map-get($colors, paginationText) !important;
		font-family: map-get($fonts, open-bold);
		font-size: map-get($sizes, small);
		padding-left: 10px !important;
	}
}

.hide-and-print,
.menuable__content__active {
	@media print {
		display: none !important;
	}
}

.item-container {
	.progress-circular__info {
		width: 80%;
	}
}

.warehouse-btn {
	.btn__content {
		justify-content: space-between !important;
	}
}

.filter-checkbox {
	align-items: center !important;

	&.input-group.input-group--selection-controls
		.input-group__input
		.icon--selection-control {
		top: 9px !important;
	}
}

.action-td {
	min-width: 128px !important;
}

.switch-inline {
	display: inline-block !important;
	margin-right: 8px;
	vertical-align: middle;
	width: auto !important;
}

.br-8 {
	border: 1px solid map-get($colors, border-tab);
	border-radius: 8px;

	.tabs__bar,
	.tabs__items {
		border-color: map-get($colors, border-tab);
		border-radius: 8px;
	}
}

.btn-new-product {
	height: 30px !important;
	min-width: auto !important;

	.btn__content {
		min-width: auto !important;
		padding: 0 4px !important;
	}
}

.collapse-btn {
	.btn__content {
		justify-content: space-between !important;
		padding: 0px !important;
	}
}

.excel-menu-content {
	border: 1px solid map-get($colors, borderRowSelected);
	border-radius: 3px;

	.list {
		border-radius: 3px;
		padding: 0px;

		& > div {
			border-bottom: 1px solid map-get($colors, blue-grey);
			margin: 0px 16px;

			a div {
				text-align: center;
			}

			&:last-child {
				border-bottom: 0px;
			}
		}
	}

	.list__tile {
		height: 28px !important;
	}

	.list__tile__title {
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small11);
	}
}

.navigation-drawer--temporary:not(.navigation-drawer--close) {
	z-index: 11;
}

.bank-to-bank {
	.input-group--disabled {
		background-color: color(grey) !important;
	}
}

.new-create {
	.input-group__input {
		padding: 0 5px !important;
	}
}

.vue-star-rating-rating-text {
	font-family: font(lato-bold) !important;
	font-size: size(medium);
	margin-top: -2px !important;
}

.configuration-ecommerce {
	.filter-select.input-group.shadow-inset {
		height: 25px !important;
		margin-top: 20px !important;
	}

	.filter-select.input-group--select .input-group__selections {
		border-right: none;
		margin-top: 0px !important;
	}

	.filter-select.input-group.shadow-inset label {
		color: color(brown-grey) !important;
		font-family: 'Opens_regular';
		font-size: 13px;
	}

	.input-group--text-field.input-group--dirty.input-group--select label,
	.input-group--text-field.input-group--dirty:not(.input-group--textarea) label {
		transform: translate(-11px, -26px) scale(1) !important;
	}

	.stepper {
		box-shadow: none !important;
	}

	.stepper__step__step {
		display: none;
	}

	.stepper__header {
		background: #f5f5f5;
		border-bottom: 3px solid #e4e4e4;
		box-shadow: none !important;
		justify-content: flex-start;
		height: 40px;
		padding: 0 2%;
	}

	.stepper__content {
		background: map-get($colors, maki-white);
		padding: 0 0 0 12px !important;

		@media (max-width: 760px) {
			padding: 0 !important;
		}
	}

	.stepper__step {
		padding: 3px 19px;

		&::before {
			content: '';
			position: absolute;
			right: 0;
			height: 22.5px;
			width: 1px;
			background: color(silver-detail-table);
		}

		&:last-child {
			&::before {
				content: none;
			}
		}
	}

	.stepper__label {
		font-size: 14px;
	}

	.stepper__step--active {
		background-color: color(primary);
		color: color(white);

		.stepper__label {
			color: color(white) !important;
			text-shadow: none !important;
		}

		&.stepper__step--editable:hover {
			background: rgba(63, 151, 155, 0.82) !important;
		}

		&::before {
			content: none;
		}
	}

	.divider {
		display: none;
	}

	@media (max-width: 959px) {
		.stepper:not(.stepper--vertical) .stepper__label {
			display: inline-block !important;
		}
	}

	@media (max-width: 850px) {
		.stepper__header {
			display: block;
			height: 50px;
			margin: 0 auto;
			overflow-y: hidden;
			overflow-x: scroll;
			padding: 0px;
			width: 100vw;
			white-space: nowrap;
		}

		.stepper__step {
			display: inline-block;
			height: 100%;
			padding: 13px 20px;
		}
	}
}

.app-select-full {
	.select-app {
		height: 46px;
	}

	.text-field.input-group--text-field input,
	.text-field .input-group--text-field textarea {
		color: color(paginationText);
		font-size: size(medium);
	}
}

.reconcilement-checkbox {
	flex: initial;
	min-width: auto;
	width: 138px;

	label {
		min-width: auto;
		width: auto;
	}
}

.border-select {
	.select-app {
		border: 1px solid color(primary);
	}
}

.search-input-container {
	.input-group__input input {
		border-radius: 3px;
		height: 37px !important;
		padding-left: 50px !important;
		padding-right: 14px !important;
	}

	.filter-select.input-group .input-group__icon-clearable {
		color: color(error) !important;
		font-size: size(medium20) !important;
	}
}

.products-search-form {
	.material-icons,
	label {
		font-size: 15px;
	}

	.input-group.input-group--selection-controls
		.input-group__input
		.icon--selection-control {
		top: 8px;
	}
}

.warehouses-search-form {
	.material-icons,
	label {
		font-size: 15px;
	}

	.input-group.input-group--selection-controls
		.input-group__input
		.icon--selection-control {
		top: 8px;
	}
}

.card-btn {
	.btn__content {
		flex-wrap: wrap;
		padding: 0px;
	}
}

.checkbox-text {
	label {
		color: color(paginationText) !important;
		font-family: font(open-regular) !important;
		font-size: size(small11) !important;
		left: 18px !important;
	}

	.icon--selection-control {
		font-size: size(small) !important;
		height: 12px !important;
		top: 9px !important;
	}
}

.select-outline {
	.select-app {
		background: transparent !important;
		padding-left: 5px !important;
	}

	input {
		color: color(primary) !important;
	}

	input::-webkit-input-placeholder {
		color: color(primary) !important;
	}

	input::-moz-placeholder {
		color: color(primary) !important;
	}

	.icon {
		font-size: size(medium18) !important;
	}

	&.border-outline {
		.select-app {
			border-color: color(primary);
			border-radius: 18.5px;
			font-family: font(open-bold);
			font-size: size(small11) !important;
			padding-left: 16px !important;
			min-width: fit-content;
			min-width: -moz-fit-content;
		}

		.input-group__selections__comma {
			color: color(primary) !important;
			font-family: font(open-bold);
			font-size: size(small11) !important;
		}

		.icon {
			color: color(primary) !important;
		}
	}
}

.card-checkbox {
	.icon {
		font-size: size(medium15) !important;
		height: 15px !important;
		top: 0px !important;
	}
}

.selling-points {
	.wrapper-text-point {
		&.active {
			label,
			input {
				color: map-get($colors, paginationText) !important;
			}
		}
	}
}

.table-scroll-tooltip.btn-add {
	.btn--flat {
		background-color: color(white) !important;
		border-radius: 2px !important;
	}
}

.slug-input {
	color: color(brown-grey);

	.filter-select {
		.input-group__input {
			padding-right: 0px !important;
		}

		.icon {
			background-color: color(blue-card) !important;
			border-radius: 2px !important;
			color: color(white) !important;
			font-size: size(medium20) !important;
			height: 30px !important;
			line-height: 30px !important;
			text-align: center !important;
			width: 30px !important;
		}
	}
}

.new-sale {
	.totals-section {
		.btn-totals-sale {
			.material-icons {
				font-size: 12px;
			}
		}
	}

	.input-chip {
		border-radius: 0px 5px 5px 0 !important;
		width: 38px;
	}

	.title-sidebar {
		color: color(primary) !important;
		font-family: map-get($fonts, lato-regular);
		font-size: 17px !important;
		font-weight: 800;
	}
}

.gmap-container .menu {
	display: none !important;
}

.content-outline {
	border: 1px solid color(primary);
	border-bottom-left-radius: 18.5px;
	border-bottom-right-radius: 18.5px;
	border-top-left-radius: 18.5px;
	border-top-right-radius: 18.5px;

	.list__tile {
		height: auto;
	}

	.card,
	.list {
		background-color: color(background-table) !important;
	}

	.list__tile__title {
		color: color(primary) !important;
		font-family: font(open-bold) !important;
		font-size: size(small11) !important;
		height: auto;
	}
}

.btn.user-config:hover .btn__content {
	&:before,
	&:after {
		background-color: transparent !important;
	}
}

.page-composite-products-new {
	.select-chips_code {
		.icon {
			display: none;
		}
	}
}

.container-view {
	padding-left: 0;
	transition: 0.05s cubic-bezier(0.4, 0, 0.2, 1);
}

.navigation-drawer--open:not(.navigation-drawer--mini-variant) + .container-view {
	padding-left: 149px !important;
}

.scroll-sidebar-bg {
	overflow-y: auto;
}

.menu-content-actions.menu-content-actions {
	border-radius: 0px;

	.list {
		border-radius: 0px;
	}

	.list__tile {
		height: 24px !important;
	}
}

.background-table {
	.overflow-auto {
		margin-bottom: 0;
		overflow: hidden;
		padding: 11px 5px !important;
	}
}

.btn-new-section {
	.btn__content {
		font-size: 14px;
	}
}

.graphic-container > div {
	position: relative !important;
}

.cash-box-close {
	.tabs__div {
		margin-left: initial !important;
		max-width: inherit !important;
		width: 50% !important;
	}
	.tabs__slider-wrapper {
		display: none;
	}
	.tabs__item--active {
		background: map-get($colors, item-select);
		color: map-get($colors, primary);
	}
}

.page-consolidation-orders {
	.tabs__item {
		font-family: map-get($fonts, open-bold);
		font-size: map-get($sizes, small10);
		text-transform: initial !important;
		background-color: #fff;
	}

	.tabs__item--active {
		background-color: #e0f3f3;
		color: color(primary);
		width: 50% !important;
	}

	.tabs__wrapper {
		border: 1px solid color(primary);
		border-radius: 3px;
	}

	.tabs__container {
		height: 35px !important;
	}

	.tabs__slider-wrapper {
		display: none !important;
	}

	.tabs__div {
		width: 50% !important;
	}
	.v-tabs__prev-icon,
	.v-tabs__next-icon {
		color: color(primary);
		font-size: 24px;
	}
	.theme--light .icon,
	.application .theme--light.icon {
		color: color(primary);
		margin-top: 6px;
	}
}
.theme--light .tabs__bar,
.application .theme--light.tabs__bar {
	background-color: #dff30000;
}
.app-table {
	table {
		thead {
			.material-icons {
				font-size: 17px;
			}
		}
	}
}

.mx-datepicker .mx-input-wrapper {
	.mx-input {
		border: 0.5px solid color(silver-detail-table) !important;
		border-radius: 5px !important;
		box-shadow: none !important;
		color: color(brown-grey) !important;
		font-family: font(open-regular) !important;
		font-size: size(small) !important;
		height: 31px !important;
		padding: 0px 6px !important;
	}

	.mx-icon-calendar {
		right: 13px !important;
	}
}

input.mx-input::placeholder {
	color: #9ca6b0;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
}

input.mx-input::-webkit-input-placeholder {
	color: #9ca6b0;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
}

input.mx-input::-moz-placeholder {
	color: #9ca6b0;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
}

input.mx-input:-ms-input-placeholder {
	color: #9ca6b0;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
}

.mx-datepicker {
	width: 100% !important;
}

.filter-select.input-group.shadow-inset.select-input-tag {
	.input-group__selections {
		border-right: 0px !important;
		height: auto;
		margin-top: 0px !important;
		max-height: 90px !important;
		min-height: 30px !important;
		overflow: auto !important;

		& + .menu + .icon {
			display: none !important;
		}
	}
}

.major-price-check {
	label {
		font-size: size(small) !important;
	}
}

.master-product-flag {
	&.input-group label {
		color: color(paginationText) !important;
		font-family: font(open-regular) !important;
		font-size: size(small) !important;
		padding-left: 0px !important;
	}

	.input-group--selection-controls__container {
		width: 22px !important;
	}

	.input-group--selection-controls__ripple {
		height: 13px !important;
		transform: translate(-6px, -6.5px) !important;
		width: 22px !important;

		&:after {
			background-color: color(grey-border) !important;
			height: 13px !important;
			width: 13px !important;
		}

		&.input-group--selection-controls__ripple--active {
			transform: translate(6px, -6.5px) !important;

			&:after {
				background-color: color(bullet-list) !important;
			}
		}
	}

	.input-group--selection-controls__toggle {
		background-color: rgba(color(grey-border), 0.48) !important;
		height: 9px !important;
		width: 22px !important;

		&.input-group--selection-controls__toggle--active {
			background-color: rgba(color(bullet-list), 0.48) !important;
		}
	}
}

.conversion-btn {
	.btn__content {
		padding: 0;
	}
}

.ecommerce-btn {
	width: 120px !important;
}

.align-image {
	.list__tile {
		box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06) !important;
		height: 40px !important;
		padding: 0 !important;
	}
}

.switch-vendor {
	&.input-group {
		&.input-group--selection-controls {
			&.switch {
				label {
					left: 0;
					margin-right: 10px;
					max-width: fit-content;
					max-width: -moz-fit-content;
					padding-left: 0;
					position: relative;
				}

				.input-group__input {
					max-width: 130px !important;
				}

				.input-group--selection-controls__toggle {
					background-color: color(background-card) !important;
					border-radius: 16px !important;
					height: 32px !important;
					opacity: 1 !important;
					width: 124px !important;

					&:after {
						content: '$';
						right: 26px;
					}

					&:before {
						content: '%';
						left: 26px;
					}

					&:after,
					&:before {
						bottom: 0;
						color: #898686;
						font-family: font(open-regular);
						font-size: size(small13);
						line-height: 32px;
						margin: auto;
						position: absolute;
						text-align: center;
						top: 0;
					}
				}

				.input-group--selection-controls__ripple {
					height: 32px !important;
					transform: translate(-3px, -16px);
					width: 70px !important;

					&:after {
						background-color: color(primary) !important;
						content: '%';
					}

					&:after,
					&:before {
						border-radius: 16px !important;
						color: color(white);
						font-family: font(open-regular);
						font-size: size(small13);
						height: 32px !important;
						line-height: 32px;
						text-align: center;
						width: 65px !important;
					}

					&--active {
						transform: translate(60px, -16px) !important;

						&:after {
							content: '$';
							color: color(white);
						}
					}
				}

				&.switch-integration {
					.input-group--selection-controls__toggle {
						background-color: color(btn-toggle-text) !important;

						&:after,
						&:before {
							color: color(grey-border);
							font-family: font(open-bold);
							font-size: size(small11);
							line-height: 35px;
						}

						&:after {
							content: 'SÍ';
						}

						&:before {
							content: 'NO';
						}
					}

					.input-group--selection-controls__ripple {
						&:after,
						&:before {
							font-family: font(open-bold);
							font-size: size(small);
							line-height: 34px;
						}

						&:after {
							content: 'NO';
						}

						&--active {
							&:after {
								content: 'SÍ';
							}
						}
					}
				}

				&.switch-prices {
					.input-group__input {
						max-width: 78px !important;
					}

					.input-group--selection-controls__toggle {
						width: 78px !important;
					}

					.input-group--selection-controls__ripple {
						width: 46px !important;
					}

					.input-group--selection-controls__toggle {
						background-color: color(btn-toggle-text) !important;

						&:after,
						&:before {
							color: color(grey-border);
							font-family: font(open-bold);
							font-size: size(medium);
							line-height: 32px;
						}

						&:after {
							content: 'PV';
							right: 8px !important;
						}

						&:before {
							content: 'PU';
							left: 8px !important;
						}
					}

					.input-group--selection-controls__ripple {
						&:after,
						&:before {
							font-family: font(open-bold);
							font-size: size(medium16);
							line-height: 34px;
							width: 46px !important;
						}

						&:after {
							content: 'PU';
						}

						&--active {
							transform: translate(34px, -16px) !important;

							&:after {
								content: 'PV';
							}
						}
					}
				}
			}
		}
	}
}

.switch-reseller {
	&.input-group {
		&.input-group--selection-controls {
			&.switch {
				.input-group--selection-controls__toggle {
					background-color: color(silver-detail-table) !important;
					border-radius: 16px !important;
					height: 32px !important;
					opacity: 1 !important;
					width: 130px !important;

					&:after {
						content: 'Externo';
						right: 10px;
					}

					&:before {
						content: 'Interno';
						left: 10px;
					}

					&:after,
					&:before {
						bottom: 0;
						color: color(brown-grey);
						font-family: font(open-bold);
						font-size: size(small);
						line-height: 32px;
						margin: auto;
						position: absolute;
						text-align: center;
						top: 0;
					}
				}

				.input-group--selection-controls__ripple {
					height: 32px !important;
					transform: translate(-3px, -17px);
					width: 70px !important;

					&:after {
						background-color: color(success) !important;
						content: 'Interno';
					}

					&:after,
					&:before {
						border-radius: 16px !important;
						color: color(white);
						font-family: font(open-bold);
						font-size: size(small);
						height: 32px !important;
						line-height: 32px;
						text-align: center;
						width: 65px !important;
					}

					&--active {
						transform: translate(60px, -17px) !important;

						&:after {
							content: 'Externo';
							color: color(white);
						}
					}
				}
			}
		}
	}
}

.checkbox-vendor {
	label {
		color: #a6a6a6 !important;
		font-family: font(open-regular) !important;
		font-size: size(small13) !important;
	}
}

.content-list-prices {
	.input-group__details {
		display: none !important;
	}

	.input-group {
		padding: 2px 0;
	}
}

.radio-assign-group {
	label {
		margin-left: 16px;
	}

	.icon {
		font-size: 18px;
	}
}

.graphic-circle {
	.progress-circular__underlay {
		stroke: color(success) !important;
	}

	.progress-circular__info {
		width: 90% !important;
	}
}

.checkbox-customers {
	.input-group__details {
		display: none !important;
	}

	label {
		font-size: 12px !important;
	}
}

.login-btn.mibodega {
	.btn__content {
		font-size: size(medium20) !important;

		@media (max-width: 960px) {
			font-size: size(medium17) !important;
		}
	}
}

.btn-actions {
	height: 25px;
	font-size: 14px;
	margin: 0;
	width: 107px;
	text-transform: uppercase !important;
}

.app-actions-list {
	.list__tile {
		border-bottom: 2px solid #f8f8f8;
	}

	.list {
		padding: 0 !important;
	}

	.list__tile {
		padding: 0 18px !important;
		width: 197px !important;
	}

	.list__tile {
		height: 35px !important;
	}

	.btn__content {
		text-transform: none !important;
	}

	.menu__content .menuable__content__active {
		top: 50px !important;
	}
}

.configuration-ecommerce {
	.theme--dark {
		&.btn {
			&.btn--disabled {
				&:not(.btn--icon):not(.btn--flat) {
					background-color: rgba(0, 0, 0, 0.12) !important;
				}
			}
		}
	}
}

.card-top-btn {
	.btn__content {
		color: color(primary);
		font-size: size(medium);
		text-transform: none !important;
	}
}

.btn-type-notification {
	.btn__content {
		display: initial;
		white-space: initial;
		width: 100%;
	}
}

.select-subsidiaries {
	label {
		color: map-get($colors, selector-color) !important;
		font-family: map-get($fonts, open-bold);
		font-size: 15px;
	}

	.icon {
		color: map-get($colors, selector-color) !important;
	}
}

.sale-points-form {
	.footer-modal {
		height: 5vh !important;
	}
}

.btn-commerce-action {
	.btn__content {
		padding: 0px !important;
		text-transform: none !important;
	}
}

.menu-bar-actions {
	border: 1px solid #ebebeb;
	border-radius: 2px;
	box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);

	.list {
		border-radius: 2px;
	}

	.item-resource {
		.list__tile {
			height: 45px !important;
		}
	}
}

.mx-datepicker.date-component-round {
	.mx-input {
		border: 1px solid color(silver-footer) !important;
		border-radius: 19px !important;
		box-shadow: none !important;
		padding: 0px 10px !important;
	}

	.mx-icon-calendar {
		display: none !important;
	}

	.mx-icon-clear {
		right: 4px !important;
		top: 52% !important;
	}
}

.btn-dashboard-general.btn-dashboard-mini {
	.btn__content {
		padding: 0px;
	}
}

.cdc-legend {
	margin-left: 46px !important;
}

.graphics-circular-legend-bar {
	.progress-linear__background {
		background-color: currentColor !important;
	}

	.progress-linear__bar__determinate {
		background-color: currentColor !important;
		border-radius: 4px !important;
	}
}

.btn-show-categories {
	.btn__content {
		padding: 0px !important;
		text-transform: none !important;
	}
}

.radio-attributes {
	.input-group.input-group--selection-controls {
		display: inline-block;
		max-width: 45%;

		label {
			color: color(paginationText) !important;
			font-family: font(open-semibold);
			font-size: size(medium);
		}
	}
}

.content-accountant {
	padding: 40px 0px 0px 0px !important;

	@media (min-width: 1200px) {
		padding: 40px 0px 0px 48px !important;
	}
}

.step-process-accounted {
	.accountant-switch {
		&.input-group.input-group--selection-controls.switch {
			.input-group--selection-controls__container {
				color: #d2d2d2 !important;
			}

			.input-group--selection-controls__toggle {
				background-color: transparent !important;
				border: 1px solid currentColor !important;
				height: 15px !important;
				width: 35px !important;
			}

			.input-group--selection-controls__ripple {
				color: #d2d2d2 !important;

				&:after {
					background-color: currentColor !important;
					box-shadow: none !important;
					height: 15px !important;
					width: 18px !important;
				}
			}

			&.input-group--dirty.success--text {
				.input-group--selection-controls__container,
				.input-group--selection-controls__ripple {
					color: color(success) !important;
				}
			}
		}
	}

	.step-process-label {
		color: color(primary) !important;
		font-family: map-get($fonts, open-semibold) !important;
		font-size: map-get($sizes, small10) !important;
	}
}

.accountant-steps {
	.stepper__header {
		background-color: color(group);
		border-bottom: 3px solid color(silver-detail-table);
		border-top: 3px solid color(silver-detail-table);
		box-shadow: none;
		height: 56px;
		justify-content: center;

		&-start {
			justify-content: flex-start;
		}

		&-height {
			border-bottom: 0px;
			height: 40px;
		}

		&.stepper-header-container {
			background-color: transparent;
			border: 0px;
			height: auto;
			margin: 0px auto;
			width: 100%;

			@media (min-width: 900px) {
				max-width: 848px;
			}

			.stepper__step {
				padding: 0px 8px;

				&__step {
					border: 0px;
					box-shadow: 0 1px 4px 0 rgba(148, 148, 148, 0.5);
					display: none;
				}
			}

			.stepper__label {
				color: #9ca6b0 !important;
				display: flex !important;
				font-family: font(open-semibold);
				font-size: size(small);
				text-shadow: none !important;
			}

			.divider {
				background: #d2d2d2 !important;
				height: 2px;
				margin: 0px;
				max-width: 36px;
			}

			.stepper__label {
				color: #d2d2d2 !important;
			}

			.stepper__step--complete {
				.stepper__step__step {
					display: inline-flex;
					background-color: color(background-sidebar) !important;
					margin-right: 8px !important;
				}

				.stepper__label {
					color: color(background-sidebar) !important;
					font-family: font(open-bold);
				}

				& + .divider {
					background: color(primary) !important;
				}
			}

			.stepper__step--active {
				.stepper__label {
					color: color(primary) !important;
					font-family: font(open-bold);
				}

				&.stepper__step--active-border {
					border-bottom: 4px solid color(primary) !important;
				}
			}
		}
	}

	.stepper__content {
		background-color: color(maki-white);
		min-height: calc(100vh - 148px);
		padding: 0px;
	}

	.accountant-switch {
		&.input-group.input-group--selection-controls.switch {
			.input-group--selection-controls__container {
				color: #d2d2d2 !important;
			}

			.input-group--selection-controls__toggle {
				background-color: transparent !important;
				border: 1px solid currentColor !important;
				height: 15px !important;
				width: 35px !important;
			}

			.input-group--selection-controls__ripple {
				color: #d2d2d2 !important;

				&:after {
					background-color: currentColor !important;
					box-shadow: none !important;
					height: 15px !important;
					width: 18px !important;
				}
			}

			&.input-group--dirty.success--text {
				.input-group--selection-controls__container,
				.input-group--selection-controls__ripple {
					color: color(success) !important;
				}
			}
		}
	}
}

.check-attribute {
	label {
		color: color(paginationText);
		font-family: font(open-light);
		font-size: size(small13);
	}
}

.checkbox-sale {
	label {
		color: color(paginationText);
		font-family: font(open-light) !important;
		font-size: size(small13) !important;
	}
}

.check-list-control {
	label {
		font-size: size(small);
	}
}

.title-select {
	color: color(brown-grey);
	font-family: font(lato-regular);
	font-size: size(medium);
	line-height: 0.8;
}

.item-select {
	align-items: center;
	color: map-get($colors, paginationText);
	display: flex;
	font-family: map-get($fonts, open-semibold);
	font-size: 18px;
	line-height: 0.8;
	margin: 0px;
}

.header-title-header {
	color: map-get($colors, selector-color);
	font-family: map-get($fonts, open-bold);
	font-size: 16px;
}

.page-cost-centers {
	.accountant-steps {
		justify-content: center !important;
	}
}

.step-accountant {
	.select-outline {
		border-radius: none !important;
	}
}

.btn-back {
	.btn__content {
		text-transform: none !important;
	}
}

.select-autocomplete-create {
	border: 1px solid rgba(169, 186, 194, 0.49) !important;
	border-radius: 5px !important;
	box-shadow: none !important;

	.input-group__selections {
		.input-group--select__autocomplete {
			&::-webkit-input-placeholder {
				color: color(paginationText) !important;
				font-family: font(open-light) !important;
				font-size: size(small13) !important;
			}

			&:-ms-input-placeholder {
				color: color(paginationText) !important;
				font-family: font(open-light) !important;
				font-size: size(small13) !important;
			}

			&::-moz-placeholder {
				color: color(paginationText) !important;
				font-family: font(open-light) !important;
				font-size: size(small13) !important;
			}
		}
	}

	&.input-group--chips.input-group--multiple {
		.input-group__selections__comma {
			background-color: #e0e0e0;
			border-radius: 20px;
			margin-right: 6px;
			padding: 3px 10px;
		}
	}
}

.select-autocomplete-create-content {
	border-bottom-left-radius: 8px !important;
	border-bottom-right-radius: 8px !important;

	.list {
		padding: 0px !important;

		&__tile {
			color: color(paginationText) !important;
			font-size: size(small11) !important;
			height: 28px !important;
			padding: 0px 10px !important;
		}

		div:last-of-type {
			.list__tile {
				.btn-item {
					background-color: color(primary) !important;
					color: color(white) !important;
					font-family: font(open-bold) !important;
					margin: 0px -10px !important;
					padding: 0px 10px !important;
					text-decoration: underline !important;
				}
			}
		}
	}
}

.app-actions {
	.btn--floating.btn--small {
		box-shadow: none !important;
		height: 23px !important;
		width: 23px !important;
	}

	.icon {
		margin-top: -8px;
	}

	.border-right {
		// position: relative;
		border-right: 1px solid #d8d8d8;
		// &::after {
		// 	height: 20px;
		// 	display: inline-block;
		// 	width: 1px;
		// 	background: #d8d8d8 !important;
		// 	content: '';
		// 	margin-left: 5px;
		// 	// position: absolute;
		// 	// top: 30%;
		// }
	}

	.btn-help {
		box-shadow: none !important;
		margin-left: 15px !important;
	}

	.theme--light .btn.btn--disabled:not(.btn--icon):not(.btn--flat),
	.application .theme--light.btn.btn--disabled:not(.btn--icon):not(.btn--flat) {
		background-color: none !important;
	}

	.width-content {
		.theme--light .btn.btn--disabled:not(.btn--icon):not(.btn--flat),
		.application .theme--light.btn.btn--disabled:not(.btn--icon):not(.btn--flat) {
			background-color: none !important;
		}
	}

	.menu-bar-actions {
		border: 1px solid map-get($colors, border-action);
		border-radius: 2px;
		box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
		top: 175px !important;

		.list {
			border-radius: 2px;
		}

		.item-resource {
			.list__tile {
				height: 45px !important;
			}
		}
	}
}

.content.padding-top-none {
	padding-top: 60px !important;
}

.btn-transform-none {
	.btn__content {
		text-transform: none !important;
	}
}

.btn-decoration-underline {
	.btn__content {
		font-family: font(open-bold) !important;
		font-size: size(small11) !important;
		text-decoration: underline !important;
	}
}

.btn-underline {
	.btn__content {
		text-decoration: underline !important;
	}
}

.group-commerce {
	.input-group--selection-controls__toggle {
		background: transparent !important;
		border: 2px solid color(gray-switch);
		height: 20px !important;
		width: 37px !important;
		border-radius: 10px !important;

		&.input-group--selection-controls__toggle--active {
			border: 2px solid color(success);
		}
	}

	.input-group.input-group--selection-controls.switch
		.input-group--selection-controls__ripple:after {
		box-shadow: none !important;
		height: 16px;
		width: 17px;
	}

	.input-group--selection-controls__ripple {
		&::after {
			background-color: color(error) !important;
		}

		&.input-group--selection-controls__ripple--active {
			&::after {
				background-color: color(success) !important;
			}
		}
	}

	.progress-linear__bar {
		background-color: color(silver-detail-table);
	}

	.card__actions > *,
	.card__actions .btn {
		margin: 0 !important;
	}

	.card__actions {
		padding: 0 !important;
	}
}

.create-ecommerce-group {
	.input-group.input-group--selection-controls:not(.input-group--disabled) label {
		color: color(primary);
	}
}

.config-product {
	.input-group.input-group--selection-controls:not(.input-group--disabled) label {
		color: color(primary);
		font-size: 11px;
	}
}

.vue__time-picker {
	width: 100% !important;
}

.vue__time-picker input.display-time {
	background-color: color(white) !important;
	font-size: size(medium) !important;
	height: 30px !important;
	width: 100% !important;
}

.product-description {
	.input-group__input {
		min-height: 15px !important;
		width: 15px !important;
	}

	.material-icons {
		font-size: 17px !important;
		height: 15px !important;
		top: 0px !important;
	}

	.input-group--selection-controls__ripple {
		height: 15px !important;
		left: 13px !important;
		top: 12px !important;
		width: 15px !important;
	}
}

.accounting-input-disabled {
	min-height: 25px !important;
	margin-left: 5px;

	.filter-select {
		background-color: rgba(156, 166, 176, 0.12) !important;
		border: 0px !important;
		border-radius: 3px !important;
		min-height: 25px !important;

		.input-group__input {
			min-height: 25px !important;
		}

		input {
			color: #9ca6b0 !important;
			font-family: font(open-regular) !important;
			font-size: size(medium) !important;
			min-height: 25px !important;

			&::placeholder {
				color: #9ca6b0 !important;
				font-family: font(open-regular) !important;
				font-size: size(medium) !important;
			}

			&:-moz-placeholder {
				color: #9ca6b0 !important;
				font-family: font(open-regular) !important;
				font-size: size(medium) !important;
			}

			&:-ms-input-placeholder {
				color: #9ca6b0 !important;
				font-family: font(open-regular) !important;
				font-size: size(medium) !important;
			}

			&::-webkit-input-placeholder {
				color: #9ca6b0 !important;
				font-family: font(open-regular) !important;
				font-size: size(medium) !important;
			}
		}
	}
}

.component-shortcut {
	.card {
		border-radius: 10px !important;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.09) !important;
	}
}

.modal-items {
	label {
		font-size: 13px;
	}

	.modal-items-all {
		label {
			color: color(primary) !important;
		}
	}

	.material-icons {
		font-size: 22px;
	}
}

.filter-select.input-group.shadow-inset {
	box-shadow: none !important;
}

.product-modal {
	background-color: color(white) !important;
	border-radius: 12px !important;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5) !important;
	margin: 0px !important;
	max-height: 531px !important;
	overflow-y: inherit !important;

	.modal-card-container {
		border-radius: 12px !important;
	}
}

.product-modal {
	background-color: color(white);
	border-radius: 12px;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	margin: 0px !important;
	max-height: 427px !important;
}

.menu__activator--active {
	.modal-table-button {
		background-color: color(primary);
		color: color(white) !important;
	}
}

.modal-table-action {
	background-color: color(white) !important;
	border-radius: 2px !important;
	min-width: 87px !important;

	.menu-action-text {
		font-family: font(open-semibold) !important;
		font-size: size(small10) !important;
		text-align: center !important;
	}

	.list {
		padding: 5px 0px !important;
	}

	.list__tile {
		height: 21px !important;

		&:hover {
			background-color: #e2f1f1 !important;
		}
	}
}

.price-list-tooltip {
	display: block;
	height: 10px;
	line-height: 7px;
}

.component-shortcut-wrapper {
	.dialog {
		margin: 0 !important;
	}
}

.text-filed-autocomplete {
	&.input-group.input-group--solo {
		min-height: 25px;
	}

	.input-group--select__autocomplete {
		font-size: size(small);
	}

	.input-group__input {
		padding: 0px !important;
	}
}

.overlay-menu {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
	background: #212121;
	z-index: 3;
	opacity: 0.46;
	@media (min-width: 760px) {
		display: none;
	}
}

.show-mobile {
	display: none;

	@media (max-width: 760px) {
		display: block;
	}
}

.show-desktop {
	@media (max-width: 760px) {
		display: none;
	}
}

.cost-center-account {
	.select-app .input-group__input {
		min-height: 28px !important;
	}
}

.assign-delivery {
	.input-group.input-group--selection-controls {
		align-items: center !important;
		height: 40px !important;
	}

	label {
		align-items: center;
		display: flex;
		height: 40px !important;
		max-width: 100% !important;
	}
}

.autocomplete-cm {
	.select-app .input-group__input {
		min-height: 29px !important;
	}
}

.chip {
	&.chip--small {
		height: 18px !important;
	}
	.chip__content {
		// background: cadetblue;
		// height: 16px !important;
		// white-space: normal !important;
		height: auto;
		padding: 0px 8px;
		font-size: 11px;
		margin: 2px;
		border: none;
	}
}

.content-btn-prize {
	bottom: 0;
	left: 0;
	position: absolute !important;
	right: 0;

	.list__group__items {
		display: block !important;
	}
}

.sidebar-bg {
	padding-bottom: 75px;
}

.modal-customers {
	.input-group.input-group--selection-controls {
		background-color: rgba(195, 231, 232, 0.29) !important;
		padding: 3px 8px !important;
	}
}

.warehouse {
	.dialog {
		border-radius: 12px !important;
	}
}

.page-customers {
	table.table-list thead th:first-child {
		width: 65% !important;
	}
}

.master-product {
	.header-modal {
		min-height: 60px !important;
		padding-top: 10px !important;
	}

	.title-sidebar {
		font-family: map-get($fonts, lato-bold);
		font-size: 17px !important;
	}
}

.master-product {
	.filter-select.input-group--select .input-group__selections__comma {
		padding: 0px 4px 3px 13px !important;
	}

	.autocomplete-cm {
		.select-app .input-group__input {
			min-height: 29px !important;
		}
	}

	.text-not-code-blank {
		color: color(error);
		font-size: 12px;
	}

	.subtype-checkbox {
		label {
			font-size: size(medium) !important;
		}

		.material-icons {
			font-size: size(medium17) !important;
			height: 18px !important;
			top: 7px !important;
		}
	}

	.page-sync-process {
		.list__group__header__append-icon {
			display: none !important;
		}
		.list__tile {
			height: 56px;
		}
		.list {
			padding: 0 !important;
		}
	}
}

.border-round-select {
	.filter-select.input-group {
		border: 1px solid color(primary) !important;
		border-radius: 19px !important;
	}

	&.select-outline.border-outline .icon {
		height: 16px !important;
	}
}

.input-warranty {
	.filter-select.input-group .input-group__append-icon {
		text-align: center !important;
	}

	.filter-select.input-group input {
		text-align: center !important;
	}
}

.k-chart {
	height: 330px !important;
}

.dashboard-report-menu {
	.list {
		background-color: color(top-background) !important;
		color: color(background-sidebar) !important;
		padding: 0px !important;

		&__tile {
			font-size: size(medium) !important;
			height: 35px !important;
		}
	}
}

.btn-return-select.tooltip {
	position: absolute !important;
	right: 0px !important;
	top: -5px !important;
}

.amortization-date {
	padding-top: 0px !important;

	input {
		font-family: font(open-regular);
		font-size: size(small) !important;
	}
}

.label-input-retention {
	label.label,
	label.caption-autocomplete {
		color: color(paginationText) !important;
		font-family: font(open-semibold) !important;
		font-size: size(small10) !important;
	}
}

.input-total-retention {
	.filter-select {
		border: 0px !important;

		input {
			background-color: #e1f0f1 !important;
			box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.1) !important;
		}
	}
}

.app-show-dialog {
	border-radius: 12px !important;
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15) !important;

	.card {
		border-bottom-left-radius: 0px !important;
		border-bottom-right-radius: 0px !important;
		border-top-left-radius: 12px !important;
		border-top-right-radius: 12px !important;
		box-shadow: none !important;

		&__actions {
			background-color: color(background-modal) !important;
			border-bottom-left-radius: 12px !important;
			border-bottom-right-radius: 12px !important;
			border-top-left-radius: 0px !important;
			border-top-right-radius: 0px !important;
		}
	}
}

.app-header {
	.list__tile {
		height: 34px;
	}

	.menu__content {
		width: 178px !important;
	}
}

.transfer-cash {
	label {
		color: #4a4a4a !important;
		font-family: map-get($fonts, lato-bold);
		font-size: 12px !important;
	}
}

.group-atributte {
	.input-group__input {
		display: grid !important;
		grid-template-columns: auto auto auto !important;
	}
}

.page-detail-history {
	tfoot {
		tr {
			td:first-child {
				border-bottom-right-radius: 0px !important;
			}
			td:last-child {
				border-bottom-left-radius: 0px !important;
			}
		}
	}
}

.page-orders-liquidations {
	tfoot {
		tr {
			td:first-child {
				border-bottom-right-radius: 0px !important;
			}
			td:last-child {
				border-bottom-left-radius: 0px !important;
			}
		}
	}

	.btn__content {
		padding: 0 !important;
	}
}

.apply-discount {
	.filter-select.input-group input {
		text-align: center;
	}
}

.footer-table {
	background-color: #e2f1f1;
	font-size: 12px;

	&--select {
		background-color: rgba(195, 231, 232, 0.42);
		color: color(background-sidebar);
		font-size: 13px;
		font-weight: bold;
		text-align: center;
	}

	&--text {
		color: color(paginationText);
		font-size: 11px;
	}
}

.btn-download-excel {
	@include flex-center;
	background-color: map-get($colors, primary) !important;
	height: 25px;
	min-width: 25px !important;
	margin: 0px;
	position: relative;
	width: 25px !important;

	&:before {
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 6.5px solid map-get($colors, primary);
		content: '';
		position: absolute;
		bottom: -6.5px;
		z-index: 9;
	}
}

.content-semi-green {
	background-color: map-get($colors, title-green);
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small);
	font-weight: 600;
}

.commentary-text {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: 14px;
}

.header-modal-information {
	background-color: #fbfbfb;
	border-radius: 3px;
	padding: 7px;
}

.item-information {
	color: map-get($colors, paginationText);
	font-size: map-get($sizes, small11);
	font-family: map-get($fonts, bold);
}

.num-information {
	color: map-get($colors, number-header);
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, small11);
}

.payment {
	.input-group label {
		font-size: 14px;
	}
}

.column-label {
	background-color: color(title-green);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(small);
	height: 25px;
	max-width: 100px;
}

// .column-value {
// 	background-color: color(white);
// 	color: color(paginationText);
// 	font-family: font(open-regular);
// 	font-size: size(small);
// 	height: 25px;
// 	padding-left: 9px;
// }

.detail {
	&-title-row {
		font-size: 12px;
		font-family: map-get($fonts, open-bold);
	}

	&-description-row {
		color: #232323;
		font-family: map-get($fonts, open-semibold);
		font-size: 12px;

		a {
			color: #232323;
		}
	}
}

.value-info {
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(medium);
	line-height: 1;
	margin: 0px !important;
}

.label-info {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(small10);
	line-height: 1;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

label.product-add-btn-icon {
	display: flex;
}

.btn-common {
	@include flex-center;
	background-color: color(primary);
	border-radius: 5px;
	padding: 2px;
	display: inline-flex;
	font-size: 12px;
	color: white;
}

.print-area {
	font-family: 'Arial', sans-serif;
	font-size: 12px;
	color: #000;
	background: #fff;
	padding: 20px;
	width: 100%;
}

@media print {
	@page {
		margin: 0;
	}

	.print-area {
		display: block !important;
		position: absolute !important;
		left: 0 !important;
		top: 0 !important;
		width: 100% !important;
		z-index: 9999 !important;
		background: #fff !important;
	}

	body.printing-mode .hide-and-print,
	body.printing-mode .v-application,
	body.printing-mode .application,
	body.printing-mode aside,
	body.printing-mode header,
	body.printing-mode footer,
	body.printing-mode nav,
	body.printing-mode .modal,
	body.printing-mode .v-dialog {
		display: none !important;
	}

	body {
		background: #fff !important;
	}
}

.print-container {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
}

.print-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 2px solid #000;
	padding-bottom: 15px;
	margin-bottom: 20px;
}

.header-left {
	display: flex;
	align-items: center;
}

.logo-print {
	width: 80px;
	height: auto;
	margin-right: 15px;
}

.company-info {
	text-align: left;
}

.company-name {
	font-size: 16px;
	font-weight: bold;
	margin: 0;
}

.print-header-simple {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #000;
	padding-bottom: 10px;
	margin-bottom: 15px;
}

.company-info-simple {
	text-align: left;
}

.company-name-sm {
	font-size: 14px;
	font-weight: bold;
	margin: 0;
}

.company-desc-sm {
	font-size: 10px;
	margin: 2px 0;
}

.header-right-simple {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.title-note {
	font-size: 16px;
	font-weight: bold;
	margin: 0;
	color: #b71c1c;
}

.print-info-simple {
	display: flex;
	justify-content: space-between;
	margin-bottom: 15px;
	font-size: 11px;
}

.info-left-sm,
.info-right-sm {
	width: 48%;
}

.info-left-sm p,
.info-right-sm p {
	margin: 3px 0;
}

.print-table-warehouse {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.print-table-warehouse th {
	background: #000;
	color: #fff;
	padding: 8px;
	text-align: center;
	font-size: 11px;
	text-transform: uppercase;
}

.print-table-warehouse td {
	border: 1px solid #000;
	padding: 8px;
	font-size: 11px;
}

.text-center {
	text-align: center;
}

.text-left {
	text-align: left;
}

.text-right {
	text-align: right;
}
</style>
