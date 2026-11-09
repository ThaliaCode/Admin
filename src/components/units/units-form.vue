<template>
	<v-form method="post" @submit.prevent="$emit('save')">
		<v-layout wrap px-2>
			<v-flex xs12 px-2>
				<app-input-text
					label="Nombre"
					model="name"
					:text="name"
					@input="$emit('set-data', $event)"
				/>
				<span class="form-group__message" v-if="!$v.name.required">
					El nombre de la unidad es requerido
				</span>
			</v-flex>
			<v-flex xs6 px-2>
				<app-input-text
					label="Código"
					model="code"
					:text="code"
					@input="$emit('set-data', $event)"
				/>
				<span class="form-group__message" v-if="!$v.code.required">
					El código de la unidad es requerido
				</span>
				<span class="form-group__message" v-if="!$v.code.maxLength">
					Máximo 3 caracteres
				</span>
				<span
					class="form-group__message"
					v-if="checkBlankCode(code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs6 px-2>
				<app-input-text
					label="Color"
					model="color"
					:text="color"
					type="color"
					@input="$emit('set-data', $event)"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(code)"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</v-form>
</template>

<script>
	import { maxLength, required } from 'vuelidate/lib/validators';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function validations() {
		return {
			code: {
				maxLength: maxLength(3),
				required,
			},
			name: {
				required,
			},
		};
	}

	export default {
		name: 'units-form',
		components: {
			modalSidebarButton,
		},
		props: {
			code: String,
			color: String,
			name: String,
		},
		validations,
	};
</script>
