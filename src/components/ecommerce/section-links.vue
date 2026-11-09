<template>
	<v-layout wrap>
		<v-flex xs12 class="group-text">
			<v-layout class="bottom-title py-2-page">
				<v-flex xs3 class="text-label">Nombre:</v-flex>
				<v-flex xs9 class="text">
					<v-tooltip top v-if="commerce.name && commerce.name.length > 29">
						<span slot="activator">{{ commerce.name | limitTo(29) }}</span>
						<span>{{ commerce.name }}</span>
					</v-tooltip>
					<span v-else>{{commerce.name}}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 class="group-text">
			<v-layout class="bottom-title py-2-page">
				<v-flex xs3 class="text-label">Código:</v-flex>
				<v-flex xs9 class="text">
					<v-tooltip top v-if="commerce.code && commerce.code.length > 29">
						<span slot="activator">{{ commerce.code | limitTo(29) }}</span>
						<span>{{ commerce.code }}</span>
					</v-tooltip>
					<span v-else>{{commerce.code}}</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 class="group-text">
			<v-layout class="bottom-title py-2-page">
				<v-flex xs3 class="text-label">Mi Web:</v-flex>
				<v-flex xs6 class="text">
					<a 
						:href="commerce.urlDomain" 
						v-if="commerce.urlDomain" 
						target="_blank"
						class="url-domain">
						<v-tooltip top v-if="commerce.urlDomain && commerce.urlDomain.length > 20">
							<span slot="activator">{{ commerce.urlDomain | limitTo(20) }}</span>
							<span>{{ commerce.urlDomain }}</span>
						</v-tooltip>
						<span v-else>{{commerce.urlDomain}}</span>
					</a>
				</v-flex>
					<v-flex xs3>
						<v-layout justify-end>
							<v-flex xs6 v-if="commerce.urlDomain" text-xs-right>
								<app-tooltip-button
									img="/static/img/copiar-contenido.svg"
									height="20"
									text="Copiar"
									@click-icon="copy(`cb-${commerce.id}`, commerce.urlDomain)"
								></app-tooltip-button>
								<input :id="`cb-${commerce.id}`" type="text" hidden>
							</v-flex>
							<v-flex xs6 text-xs-right v-if="showLinks">
								<app-tooltip-button
									img="/static/img/pregunta.svg"
									height="20"
									text="¿Quieres tu propio dominio?"
									@click-icon="$emit('open-plan')"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
		</v-flex>
		<v-flex xs12 class="group-text">
			<v-layout class="bottom-title py-2-page">
				<v-flex xs3 class="text-label">Mi app:</v-flex>
				<v-flex xs9 class="text">
					<div class="layout">
						<a :href="linkAppStore" class="mr-2" v-if="showLinkAppStore">
							<img src="/static/img/app-store.svg" alt="app-store" height="16">
						</a>
						<img src="/static/img/app-store-disabled.svg" alt="app-store" height="16" class="mr-2" v-else>
						<a :href="linkGooglePlay" v-if="showLinkGooglePlay">
							<img src="/static/img/google-play.png" alt="google-play" height="16">
						</a>
						<img src="/static/img/google-play-disabled.svg" alt="google-play" height="16" v-else>
					</div>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 class="group-text">
			<v-layout class="py-2-page">
				<v-flex xs3 class="text-label">Usuario:</v-flex>
				<v-flex xs6 class="text">
					<v-tooltip top v-if="isEmail && isEmail.length > 15">
						<span slot="activator">{{ isEmail | limitTo(15) }}</span>
						<span>{{ isEmail }}</span>
					</v-tooltip>
					<span v-else>{{ isEmail }}</span>
				</v-flex>
				<v-flex xs3 text-xs-right>
					<app-tooltip-button
						v-if="isEmail && isEmail.length > 15"
						img="/static/img/copiar-contenido.svg"
						height="20"
						text="Copiar"
						@click-icon="copy(`email-${commerce.id}`, isEmail)"
					></app-tooltip-button>
					<input :id="`email-${commerce.id}`" type="text" hidden>
					<app-tooltip-button
						v-if="disabledEmail"
						img="/static/img/contrasena.svg"
						height="20"
						text="Cambiar contraseña"
						@click-icon="$emit('change-password', commerce)"
					></app-tooltip-button>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>
<script>

function copy(id, url) {
	const cb = document.getElementById(id);
	cb.value = url;
	cb.style.display = 'block';
	cb.select();
	document.execCommand('copy');
	cb.style.display = 'none';
}

function showLinkGooglePlay() {
	if (this.commerce.plan) {
		if (Object.keys(this.commerce.plan).length) {
			if (this.commerce.plan.components) {
				return this.commerce.plan.components.androidApp;
			}
		}
		return false;
	}
	return false;
}

function showLinkAppStore() {
	if (this.commerce.plan) {
		if (Object.keys(this.commerce.plan).length) {
			if (this.commerce.plan.components) {
				return this.commerce.plan.components.iosApp;
			}
		}
		return false;
	}
	return false;
}

function linkGooglePlay() {
	if (this.commerce.settings) {
		return this.commerce.settings.playStoreLink;
	}
	return null;
}

function linkAppStore() {
	if (this.commerce.settings) {
		return this.commerce.settings.appleStoreLink;
	}
	return null;
}

function disabledEmail() {
	if (this.commerce.employee) {
		return this.commerce.employee.aclUserCode;
	}
	return false;
}

function isEmail() {
	if (this.commerce.employee) {
		return this.commerce.employee.email;
	}
	return null;
}

export default {
	name: 'section-links',
	computed: {
		showLinkGooglePlay,
		showLinkAppStore,
		linkGooglePlay,
		linkAppStore,
		disabledEmail,
		isEmail,
	},
	methods: {
		copy,
	},
	props: {
		commerce: {
			type: Object,
			default: () => {},
		},
		showLinks: {
			type: Boolean,
			default: true,
		},
	},
};
</script>
<style lang="scss" scoped>
	.group-text {
		background-color: color(top-background);
		font-size: 12px;
		padding: 0 8px;

		@media (max-width: 760px) {
    	font-size: 11px;
  	}
	}

	.bottom-title {
		border-bottom: 1px solid rgba(156, 166, 176, 0.2);
	}

	.text-label {
		color: color(primary);
		font-weight: 600;
	}

	.text {
		color: color(paginationText);
	}

	.py-2-page {
		padding: 8px 0;

		@media (max-width: 760px) {
    	padding: 5px 0;
  	}
	}
</style>