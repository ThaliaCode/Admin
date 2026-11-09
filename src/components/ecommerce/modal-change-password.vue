<template>
	<v-layout wrap class="modal-change-password">
		<v-flex xs12 mb-3>
			<v-layout class="wrapper-title" py-2 px-3>
				<v-flex xs11>
					<p class="mb-0">Cambiar contraseña</p>
				</v-flex>
				<v-flex xs1>
					<button @click="closeDialog">
						<v-icon color="primary" size="18">clear</v-icon>
					</button>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 mb-3>
			<v-layout wrap px-3>
				<v-flex xs12 mb-2>
					<label
						class="caption-gray">
						Nueva contraseña(*)
					</label>
					<v-text-field
						class="filter-select shadow-inset"
						v-model="model.password"
					></v-text-field>
					<span class="form-group__message" v-if="!$v.model.password.required && showError">
						Este campo es requerido.
					</span>
					<span class="form-group__message" v-if="!$v.model.password.minLength && showError">
						Mínimo 6 caracteres alfanuméricos.
					</span>
				</v-flex>
				<v-flex xs12 mb-2>
					<label
						class="caption-gray">
						Confirme contraseña(*)
					</label>
					<v-text-field
						class="filter-select shadow-inset"
						v-model="model.confirmPassword"
					></v-text-field>
					<span class="form-group__message" v-if="!$v.model.confirmPassword.required && showError">
						Este campo es requerido.
					</span>
					<span class="form-group__message" v-if="!$v.model.confirmPassword.sameAs && showError">
						Las contraseñas no coinciden.
					</span>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-layout row wrap>
				<v-flex xs6 pr-1
					text-xs-right>
					<v-btn
						color="pink"
						class="btn-action white--text"
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs6 pl-1
					text-xs-left>
					<v-btn
						color="primary"
						class="btn-action white--text"
						@click.native="changePassword">
						Aceptar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>
<script>
import { required, sameAs, minLength } from 'vuelidate/lib/validators';

function changePassword() {
	if (this.$v.$invalid) {
		this.showError = true;
	} else {
		this.$emit('update', this.model.password);
		setTimeout(() => {
			this.model.password = null;
			this.model.confirmPassword = null;
		}, 1000);
	}
}

function closeDialog() {
	this.showError = false;
	this.model = {
		password: null,
		confirmPassword: null,
	};
	this.$emit('close');
}

function validations() {
	return {
		model: {
			password: {
				required,
				minLength: minLength(6),
			},
			confirmPassword: {
				required,
				sameAs: sameAs('password'),
			},
		},
	};
}

function data() {
	return {
		model: {
			password: null,
			confirmPassword: null,
		},
		showError: false,
	};
}

export default {
	name: 'modal-change-password',
	data,
	methods: {
		changePassword,
		closeDialog,
	},
	validations,
};
</script>

<style lang="scss" scoped>
	.modal-change-password {
		background: color(white);
		padding-bottom: 24px;

		.wrapper-title {
			background-color: rgba(195, 231, 232, 0.21);
			color: color(primary);
			font-weight: 700;
			text-transform: uppercase;
		}

		.caption-gray {
			color: color(brown-grey);
			font-size: 13px;
				&.c-error {
				color: color(error);
			}
		}

		.border-error {
			border: 1px solid color(error);
		}
	}
</style>