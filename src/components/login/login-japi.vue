<template>
	<v-app>
		<v-container fluid fill-height class="pa-0">
			<v-layout row wrap>
				<!-- Left side with illustration -->
				<v-flex xs12 lg6 class="hidden-md-and-down pa-0 left-image-panel">
					<img
						src="/static/img/login/bg-login-japi.webp"
						alt="BG Japisale"
						class="panel-background-image"
					/>
				</v-flex>

				<!-- Right side with login form -->
				<v-flex xs12 lg6>
					<div class="login-panel d-flex flex-column align-center justify-center pa-8">
						<div class="login-form-container">
							<!-- Header -->
							<div class="text-xs-center mb-5">
								<img
									src="/static/img/logos/japisale-logo-bicolor.webp"
									alt="Logo Japisale"
									height="160"
								/>
								<h2 class="welcome-text primary--text text--darken-1">
									Bienvenido de nuevo
								</h2>
							</div>

							<!-- Login Form -->
							<form autocomplete="off" @submit.prevent="signin" id="login-form">
								<v-layout column>
									<!-- Email/Username Field -->
									<v-flex class="mb-3">
										<label class="field-label primary--text">Correo:</label>
										<v-text-field
											v-model="user"
											solo
											flat
											hide-details
											class="custom-input mt-1"
											required
											type="email"
										></v-text-field>
									</v-flex>

									<!-- Password Field -->
									<v-flex class="mt-2 mb-4">
										<label class="field-label primary--text">Contraseña</label>
										<v-text-field
											v-model="password"
											type="password"
											solo
											flat
											hide-details
											required
											class="custom-input mt-1"
										></v-text-field>
									</v-flex>
									<v-flex class="mb-2">
										<span v-show="loginError" class="error--text subheading my-2">
											{{ loginError }}
										</span>
									</v-flex>

									<!-- Forgot Password Link -->
									<v-flex class="text-xs-right mb-4">
										<a
											:href="urlForgotPassword"
											class="forgot-link secondary--text text--darken-1"
											target="_blank"
											>Recuperar contrase&ntilde;a</a
										>
									</v-flex>
								</v-layout>
							</form>
							<!-- Sign In Button -->
							<v-flex class="mb-4">
								<v-btn
									type="submit"
									form="login-form"
									block
									large
									class="primary"
									style="border-radius: 8px"
									:loading="isLoading"
									:disabled="isLoading"
								>
									INICIAR SESIÓN
								</v-btn>
							</v-flex>

							<!-- Create Account Link -->
							<v-flex class="text-xs-center">
								<span class="primary--text">
									No tienes una cuenta, contacta con
									<a
										:href="urlSupport"
										target="_blank"
										class="create-account-link primary--text text--darken-2"
										>Soporte</a
									>
								</span>
							</v-flex>
						</div>
					</div>
				</v-flex>
			</v-layout>
		</v-container>
	</v-app>
</template>

<script>
import loginMixin from '@/mixins/login-mixin';

const phone = process.env.NUMBER_SUPPORT;
function generateWhatsAppUrl(message) {
	const baseUrl = 'https://api.whatsapp.com/send';
	const params = new URLSearchParams({ phone });
	if (message) params.append('text', message);

	return `${baseUrl}?${params.toString()}`;
}

export default {
	name: 'login-japi',
	mixins: [loginMixin],
	data() {
		return {
			urlForgotPassword: generateWhatsAppUrl(
				'Hola, necesito ayuda para recuperar mi contrase&ntildea.'
			),
			urlSupport: generateWhatsAppUrl('Hola, necesito ayuda.'),
		};
	},
	methods: {},
};
</script>

<style scoped lang="scss">
.left-image-panel {
	position: relative;
	overflow: hidden;
}

.panel-background-image {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.panel-overlay-content {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	background-color: rgba(0, 0, 0, 0.3); /* opcional, da contraste */
}

.illustration-container {
	max-width: 400px;
}

.illustration-image {
	width: 300px;
	height: 300px;
	object-fit: contain;
}

.text-opacity {
	opacity: 0.8;
}

.login-panel {
	min-height: 100vh;
	background-color: white;
}

.login-form-container {
	width: 100%;
	max-width: 400px;
}

.lovebirds-title {
	font-family: cursive;
	font-size: 28px;
	color: #333;
	font-weight: 400;
}

.welcome-text {
	font-size: 20px;
	font-weight: 400;
}

.field-label {
	font-size: 14px;
	display: block;
	margin-bottom: 4px;
}

.custom-input ::v-deep .v-input__control {
	min-height: 48px;
}

.custom-input {
	&.input-group {
		border: 1px solid color(primary) !important;
		border-radius: 8px !important;
		box-shadow: none !important;
	}
}

.custom-input ::v-deep .v-text-field__slot input {
	padding: 12px 16px;
}

.forgot-link {
	text-decoration: none;
	font-size: 14px;
}

.forgot-link:hover {
	text-decoration: underline;
}

/* .sign-in-btn {
	background-color: #616161 !important;
	color: white !important;
	text-transform: none !important;
	font-weight: 400 !important;
	letter-spacing: normal !important;
} */

// .sign-in-btn:hover {
// 	background-color: #424242 !important;
// }

.divider-container {
	position: relative;
	text-align: center;
}

.divider-text {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: white;
	padding: 0 16px;
	font-size: 14px;
}

.google-btn {
	text-transform: none !important;
	font-weight: 400 !important;
	letter-spacing: normal !important;
	border-color: #e0e0e0 !important;
}

.google-icon {
	width: 20px;
	height: 20px;
}

.create-account-link {
	text-decoration: none;
	font-weight: 500;
}

.create-account-link:hover {
	text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 959px) {
	.login-panel {
		min-height: 100%;
		padding: 32px 16px;
	}

	.login-form-container {
		max-width: 100%;
	}
}
</style>
