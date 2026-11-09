<template>
  <div>
    <section>
			<v-layout row wrap>
				<v-flex xs12 md12 pa-3 class="form-input--height">
					<v-text-field
						class="filter-select shadow-inset"
						label="Nombre"
						single-line
						v-model="countable.name"
					>
					</v-text-field>
						<span class="form-group__message"
							v-if="$v.countable.name && $v.countable.name.$invalid">
							Nombre es requerido
						</span>
						</v-flex>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs12 md6 pa-3 class="form-input--height">
							<v-text-field
								class="filter-select shadow-inset"
								label="Ruc"
								single-line
								v-model="countable.ruc"
								>
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.countable.ruc && $v.countable.ruc.$invalid">
								Ruc es requerido
							</span>
						</v-flex>
						<v-flex xs12 md6 pa-3 class="form-input--height">
							<v-text-field
								class="filter-select shadow-inset"
								label="Teléfono"
								single-line
								type="number"
								required
								v-model="countable.phone"
							>
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.countable.phone && $v.countable.phone.$invalid">
								Número de Celular es requerido
							</span>
						</v-flex>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs12 md6 pa-3 class="form-input--height">
							<v-text-field
								class="filter-select shadow-inset"
								label="Correo"
								single-line
								v-model="countable.mail"
								>
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.countable.mail && $v.countable.mail.$invalid">
								Ruc es requerido
							</span>
						</v-flex>
						<v-flex xs12 md6 pa-3 class="form-input--height">
							<v-text-field
								class="filter-select shadow-inset"
								label="Contraseña"
								single-line
								type="password"
								required
								v-model="countable.password"
							>
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.countable.password && $v.countable.password.$invalid">
								Contraseña es requerida
							</span>	
						</v-flex>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs12 pa-3 class="form-input--height">
							<v-select
								bottom
								single-line
								hide-details
								label="Tipo de roles"
								class="filter-select shadow-inset"
								v-bind:items="roles"
								item-text="name"
								item-value="id"
								content-class="filter-select-content"
								v-model="countable.rol"
							 ></v-select>
							<span class="form-group__message"
								v-if="$v.countable.rol && $v.countable.rol.$invalid">
								Rol es requerido
							</span>
						</v-flex>
						
					</v-layout>
				</section>
				<section class="fast-register-footer">
					<modal-sidebar-button
						:isLoading="$v.$invalid"
						v-on:cancel-button-clicked="closeModal"
						v-on:accept-button-clicked="saveData"/>
				</section>
    </div>
</template>
<script>
	import { required } from 'vuelidate/lib/validators';
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';


	function closeModal() {
		this.countable = {
			name: '',
			ruc: '',
			phone: '',
			mail: '',
			password: '',
			rol: null,
		};
		this.$emit('close-modal');
	}

	function validations() {
		return {
			countable: {
				name: {
					required,
				},
				ruc: {
					required,
				},
				phone: {
					required,
				},
				mail: {
					required,
				},
				password: {
					required,
				},
				rol: {
					required,
				},
			},
		};
	}

	function saveData() {}

	function data() {
		return {
			countable: {
				name: '',
				ruc: '',
				phone: '',
				mail: '',
				password: '',
				rol: null,
			},
			roles: [
				{ id: 1, name: 'Rol 1' },
				{ id: 2, name: 'Rol 2' },
			],
		};
	}
	export default {
		name: 'new-countable',
		components: {
			modalSidebarButton,
		},
		data,
		methods: {
			closeModal,
			saveData,
		},
		validations,
	};
</script>

