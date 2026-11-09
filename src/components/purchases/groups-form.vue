<template>
	<div>
		<v-form method="post" @submit.prevent="save">
			<v-layout wrap px-4 pt-4>
				<v-flex xs12 mb-3>
					<app-input-text
						label="Nombre del Grupo"
						model="name"
						:text="model.name"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.name.$invalid">
						El nombre es requerido
					</span>
				</v-flex>
				<v-flex xs12 mb-3>
					<app-input-text
						label="Código"
						model="code"
						:text="model.code"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.code.$invalid">
						El código es requerido
					</span>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(model.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12>
					<app-input-text
						label="Descripción"
						model="description"
						:text="model.description"
						@input="getValue"
					/>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
	import { required } from 'vuelidate/lib/validators';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		if (this.id) {
			this.loadData();
		}
	}

	function close() {
		this.$emit('close');
	}

	async function loadData() {
		const { data: model } = await this.$httpSales.get(`group/${this.id}`);
		this.model = {
			code: model.code,
			description: model.description,
			name: model.name,
			typeEntityId: model.typeEntityId,
		};
	}

	function getValue({ model, value }) {
		if (model === 'code') {
			this.model.code = value;
		} else if (model === 'name') {
			this.model.name = value;
		}
		this.model[model] = value;
	}

	function save() {
		this.model.typeEntityId = this.model.typeEntityId ? this.model.typeEntityId :
			this.typeEntityId;
		this.$emit('save', this.model);
	}

	function data() {
		return {
			model: {
				code: '',
				description: '',
				name: '',
			},
		};
	}

	function validations() {
		return {
			model: {
				code: {
					required,
				},
				name: {
					required,
				},
			},
		};
	}

	export default {
		name: 'groups-form',
		components: {
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			close,
			getValue,
			loadData,
			save,
		},
		props: {
			id: {
				type: [Number, String],
			},
			typeEntityId: {
				type: [Number, String],
			},
		},
		validations,
	};
</script>
