<template>
    <div>
			<v-layout wrap px-4 py-3>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-text-field
						label="Código"
						class="filter-select shadow-inset mt-3"
						v-model="model.code"
						:readonly="!!idEdit">
					</v-text-field>
					<span class="form-group__message"
						v-if="$v.model.code.$invalid">
						El código es requerido.
					</span>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(model.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-4>
					<v-text-field
						class="filter-select shadow-inset mt-3"
						label="Nombre"
						v-model="model.name">
					</v-text-field>
					<span class="form-group__message"
						v-if="$v.model.name.$invalid">
						El nombre es requerido.
					</span>
				</v-flex>
				<v-flex  xs12 md12 pr-2 mb-4>
					<v-select
						class="filter-select shadow-inset mt-3s"
						:items="areas"
						v-model="model.areaId"
						item-text="name"
						item-value="id"
						label="Áreas">
					</v-select>
				</v-flex>
				<v-flex  xs12 md9 pr-2 mb-4>
					<v-text-field
						label="Valor Bono"
						type="number"
						class="filter-select shadow-inset mt-3s"
						v-model="model.amount"
					></v-text-field>
				</v-flex>
				<v-flex xs12 md3 pr-2 mb-4>
					<v-checkbox
						class="fast-register-code-chk mt-3s mr-4"
						color="primary"
						:label="'Descuento'"
						hide-details
						v-model="model.flagDiscount"
					></v-checkbox>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-4>
					<v-text-field
						class="filter-select shadow-inset mt-3 textarea-content"
						label="Descripción"
						v-model="model.description"
						textarea
						multi-line
						no-resize
					></v-text-field>
				</v-flex>
			</v-layout>
			<section class="fast-register-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="createTypePosition">
				</modal-sidebar-button>
			</section>
		</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function closeModal() {
	this.$emit('close');
}

function validations() {
	return {
		model: {
			code: { required },
			name: { required },
		},
	};
}

function created() {
	this.loadAreas();
	if (this.idEdit) {
		this.loadData();
	}
}

async function loadAreas() {
	try {
		const response = await this.$httpSales.get('/group/areasCompany/table');
		this.areas = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function createTypePosition() {
	const url = this.idEdit ? `type-staff/${this.id}/changes/${this.idEdit}` : `type-staff/${this.id}/changes`;
	const method = this.idEdit ? 'patch' : 'post';
	const message = this.idEdit ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente.`);
		this.$emit('update');
	} catch (error) {
		if (error.data.message === 'GROUP_EXISTS') {
			this.showGenericError('Código ya existe');
		} else {
			this.showGenericError();
		}
	}
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`type-staff/${this.id}/changes/${this.idEdit}`);
		this.model.name = response.data.name || '';
		this.model.code = response.data.code || '';
		this.model.description = response.data.description || '';
		this.model.flagDiscount = response.data.flagDiscount === 1;
		this.model.areaId = response.data.generalId;
		this.model.amount = response.data.amount || '';
	} catch (error) {
		this.showGenericError();
	}
}


function data() {
	return {
		model: {
			name: null,
			code: null,
			description: null,
			amount: null,
			flagDiscount: false,
			areaId: null,
		},
		areas: [],
	};
}

export default {
	name: 'create-type-position',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		closeModal,
		loadAreas,
		createTypePosition,
		loadData,
	},
	validations,
	props: {
		id: {
			type: [String, Number],
		},
		idEdit: {
			type: [String, Number],
		},
	},
};
</script>
