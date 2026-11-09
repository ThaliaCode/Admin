<template>
  <div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-2>
				<v-text-field
				class="filter-select shadow-inset mt-3"
				v-model="name"
				readonly
				>
				</v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<v-text-field
				class="filter-select shadow-inset mt-3"
				label="Código"
				:readonly="!!idWorking"
				v-model="model.code"></v-text-field>
				<span class="form-group__message" v-if="$v.model.code.$invalid">
					Este campo es requerido.
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
				class="filter-select shadow-inset mt-3 textarea-content"
				label="Descripción"
				v-model="model.description"></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<div>
				<v-select
				:items="typeIES"
				item-text="name"
				item-value="id"
				class="filter-select shadow-inset mt-3"
				v-model="model.iesTypeId"
				label="Tipo">
				</v-select>
				<span class="form-group__message" v-if="$v.model.iesTypeId.$invalid">
					Este Campo es requerido
			</span>
				</div>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
				class="filter-select shadow-inset mt-3"
				label="Aporte"
				v-model="model.observation"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-select
				:items="validIES"
				item-text="name"
				item-value="id"
				class="filter-select shadow-inset mt-3"
				label="Válida"
				v-model="model.iesValidId">
				</v-select>
				<span class="form-group__message" v-if="$v.model.iesValidId.$invalid">
					Este Campo es requerido
			</span>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<v-checkbox
					hide-details
					color="primary"
					label="IECE"
					v-model="model.flagIece"
				></v-checkbox>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<v-checkbox
					hide-details
					color="primary"
					label="SECAP"
					v-model="model.flagSecap"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
			:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
			@cancel-button-clicked="closeModal"
			@accept-button-clicked="relationshipWorking"></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function validations() {
	return {
		model: {
			code: { required },
			iesValidId: { required },
			iesTypeId: { required },
		},
	};
}

function closeModal() {
	this.$emit('close');
}

function created() {
	this.getType();
	if (this.idWorking) {
		this.loadData();
	}
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`type-employer/${this.id}/type-working/${this.idWorking}`);
		this.model.name = response.data.name || '';
		this.model.code = response.data.code || '';
		this.model.description = response.data.description || '';
		this.model.iesValidId = response.data.iesValid ? response.data.iesValid.id : '';
		this.model.flagSecap = !!response.data.flagSecap;
		this.model.flagIece = !!response.data.flagIece;
		this.model.observation = response.data.observation || '';
		this.model.iesTypeId = response.data.typeIes ? response.data.typeIes.id : '';
	} catch (error) {
		this.showGenericError();
	}
}

async function relationshipWorking() {
	const url = this.idWorking ? `type-employer/${this.id}/type-working/${this.idWorking}` : `type-employer/${this.id}/type-working`;
	const method = this.idWorking ? 'patch' : 'post';
	const message = this.idWorking ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente.`);
		this.$emit('update');
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.data.message === 'TYPE_WORKING_RELATIONSIP_NOT_EXIST') {
			this.showGenericError('Tipo de Relación de Trabajo no existe');
		} else if (error.data.message === 'TYPE_WORKING_RELATIONSIP_EXISTS') {
			this.showGenericError('El código existe');
		}
	}
}

async function getType() {
	const request = [
		this.$httpSales.get('/group/typeIes/table'),
		this.$httpSales.get('/group/typeIesValid/table'),
	];
	[
		{ data: this.typeIES },
		{ data: this.validIES },
	] = await Promise.all(request);
}

function data() {
	return {
		validIES: [],
		typeIES: [],
		model: {
			name: this.$route.params.code,
			code: this.code,
			description: '',
			iesValidId: null,
			flagSecap: false,
			flagIece: false,
			observation: '',
			iesTypeId: null,
		},
	};
}

export default {
	name: 'create-working-relationship',
	data,
	created,
	validations,
	props: {
		id: {
			type: [String, Number],
		},
		idWorking: {
			type: [String, Number],
		},
		name: {
			type: [String, Number],
		},
	},
	methods: {
		loadData,
		getType,
		relationshipWorking,
		closeModal,
	},
	components: {
		modalSidebarButton,
	},
};
</script>
