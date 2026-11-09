<template>
	<v-layout wrap align-center justify-center class="login-background">
		<v-flex xs10 md8>
			<v-layout row wrap align-center class="login-container">
				<v-flex sm12 md6 class="content-logo">
					<v-layout row wrap justify-end class="login-image">
						<v-flex xs12 text-xs-center>
							<img src="/static/img/logo-casamarket.svg" alt="casamarket" class="logo" />
						</v-flex>
						<v-flex xs12 text-xs-center class="login-social">
							<a :href="facebookUrl" target="_blank">
								<img src="/static/icon/facebook-logo.svg" alt="" height="54" />
							</a>
							<a href="https://www.instagram.com/casamarketapp/" target="_blank">
								<img
									src="/static/icon/instagram-logo.svg"
									alt=""
									height="54"
									class="ml-4"
								/>
							</a>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex sm12 md6 white class="login-form-container">
					<v-layout row wrap justify-center class="content-img-user">
						<v-flex xs12 text-xs-center>
							<img src="/static/icon/user-image-mibodega.svg" alt="" class="img-user" />
							<h3 class="user-text">INICIAR SESIÓN</h3>
						</v-flex>
					</v-layout>
					<form
						autocomplete="off"
						class="login-form"
						id="login-mibodega-form"
						@submit.prevent="signin"
					>
						<div class="login-input-container">
							<img src="/static/icon/user.svg" class="input-icon" alt="user" />
							<div>
								<input
									type="email"
									placeholder="Usuario"
									class="login-input"
									v-model="user"
									autocomplete="off"
									required
								/>
							</div>
						</div>
						<div class="login-input-container">
							<img src="/static/icon/password.svg" class="input-icon" alt="password" />
							<div class="login-input-wrap">
								<input
									type="password"
									placeholder="Contraseña"
									class="login-input"
									v-model="password"
									autocomplete="off"
									required
								/>
							</div>
						</div>
						<v-flex class="mb-2">
							<span v-show="loginError" class="error--text subheading my-2">
								{{ loginError }}
							</span>
						</v-flex>
					</form>
					<v-btn
						type="submit"
						class="login-btn btn-auto btn-full btn-action white--text mibodega"
						color="success"
						form="login-mibodega-form"
						:loading="isLoading"
						:class="{ disabled: isLoading }"
						accesskey="13"
						:disabled="isLoading"
					>
						INICIAR SESIÓN
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
import loginMixin from '@/mixins/login-mixin';

export default {
	name: 'login-mibodega',
	mixins: [loginMixin],
	data() {
		return {
			countryId: null,
			facebookUrl: process.env.FACEBOOK_URL,
		};
	},
};
</script>

<style lang="scss" scoped>
.login-background {
	background-color: color(primary);
	height: 100vh;
}

.login-container {
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.27);

	@media (max-width: 960px) {
		height: 500px;
		max-height: 90vh;
	}
}

.login-form-container {
	border-bottom-right-radius: 7px;
	border-top-right-radius: 7px;
	padding: 104px 58px;

	@media (max-width: 960px) {
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
		border-top-right-radius: 0;
		display: flex;
		height: calc(100% - 120px);
		flex-direction: column;
		justify-content: center;
		padding: 20px;
	}
}

.login-form {
	padding: 40px 0px;

	@media (max-width: 960px) {
		padding: 30px 0px;
	}
}

.login-image {
	background-image: url('/static/img/casamarket-login-background.png');
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	border-bottom-left-radius: 7px;
	border-top-left-radius: 7px;
	height: 610px;
	padding: 265px 0px 35px;

	@media (max-width: 960px) {
		align-items: center;
		border-bottom-left-radius: 0;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		display: flex;
		height: 120px;
		justify-content: center;
		padding: 0;
	}
}

.user-text {
	color: color(success);
	font-family: font(lato-regular);
	font-size: size(medium16) !important;
	font-weight: 600 !important;
}

.login-social {
	margin-top: 206px;
	color: color(success);

	@media (max-width: 960px) {
		display: none;
	}
}

.login-input {
	background-color: color(main-grey);
	border: 1px solid color(input-border);
	border-radius: 7px;
	color: color(paginationText);
	font-family: font(lato-regular);
	font-size: size(medium20);
	height: 73px;
	outline: none;
	padding-left: 62px;
	width: 100%;

	@media (max-width: 960px) {
		height: 50px;
		font-size: size(medium17);
	}
}

.login-input-container {
	margin-bottom: 11px;
	position: relative;
}

input::placeholder {
	color: color(input-text);
	font-family: font(lato-regular);
	font-size: size(medium20);

	@media (max-width: 960px) {
		font-size: size(medium17);
	}
}

input::-webkit-input-placeholder {
	color: color(input-text);
	font-family: font(lato-regular);
	font-size: size(medium20);
}

input::-moz-placeholder {
	color: color(input-text);
	font-family: font(lato-regular);
	font-size: size(medium20);
}

.input-icon {
	bottom: 0;
	height: 28px;
	left: 24px;
	margin: auto;
	position: absolute;
	top: 0;

	@media (max-width: 960px) {
		height: 18px;
	}
}

.login-btn {
	font-family: font(lato-bold);
	font-size: size(medium20);
	padding: 25px 0px;

	@media (max-width: 960px) {
		padding: 16px 0px;
	}
}

.logo {
	height: 73px;

	@media (max-width: 960px) {
		height: 45px;
		max-width: 90%;
	}
}

.img-user {
	height: 50px;

	@media (max-width: 960px) {
		height: 25px;
		margin-bottom: 6px;
	}
}

.content-img-user {
	@media (max-width: 960px) {
		max-height: 50px;
	}
}
</style>
