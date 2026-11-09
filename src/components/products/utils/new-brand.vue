<template>
	<div class="new-brand">
		<div class="new-brand-conten">
			<v-text-field
				required
				class="japi-input-text"
				label="Código"
				v-model="code"
			></v-text-field>
			<span
				class="text-not-code-blank"
				v-if="checkBlankCode(code)">
				No se permite espacios en blanco
			</span>
			<v-text-field
				required
				class="japi-input-text"
				label="Nombre"
				v-model="name"
			></v-text-field>
		</div>
		<section class="brand-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="registerBrand"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function clearInfo() {
	this.name = '';
	this.code = '';
}

function closeModal() {
	this.clearInfo();
	this.$emit('cancel-modal', false);
}

async function registerBrand() {
	if (this.$v.$invalid) {
		this.showNotification('Todos los campos son requeridos.', 'error');
	} else {
		const body = { name: this.name, code: this.code };
		try {
			await this.$httpProducts.post('brands', body);
			this.$emit('update-brand');
			this.clearInfo();
			this.closeModal();
		} catch (e) {
			if (e.status === 400) {
				if (e.data.message === 'BRAND_DUPLICATE_CODE') {
					this.showGenericError('No se pudo crear la marca porque el código ingresado ya existe. Modificar el código y volver a intentar.');
				}
			} else if (e.status === 500) {
				this.showGenericError();
			}
		}
	}
}

function data() {
	return {
		name: '',
		code: '',
	};
}

function validations() {
	return {
		name: {
			type: required,
		},
		code: {
			type: required,
		},
	};
}

export default {
	name: 'new-brand',
	components: {
		modalSidebarButton,
	},
	methods: {
		closeModal,
		registerBrand,
		clearInfo,
	},
	data,
	validations,
};
</script>

<style lang="scss" scoped>
.new-brand-conten {
    padding: 20px;
}

.brand-footer {
	background-color: white;
	bottom: 0;
	position: absolute;
	width: 100%,
}
</style>
