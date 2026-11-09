<template>
  <div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					label="Nombre"
					hide-details
					v-model="model.fullName">
				</v-text-field>
				<span class="form-group__message"
					v-if="$v.model.fullName.$invalid">
					El nombre es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-select
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Parentesco"
					item-value="id"
					item-text="name"
					:items="relation"
					v-model="model.relationshipId">
				</v-select>
				<span class="form-group__message"
					v-if="$v.model.relationshipId.$invalid">
					El parentesco es requerido.
				</span>
			</v-flex>
			<v-layout align-center>
				<v-flex xs12 md6 pr-2>
					<v-switch
						hide-details
						label="Carga"
						color="success"
						v-model="model.flagBurden"
					></v-switch>
				</v-flex>
				<v-flex xs12 md6 pr-2 mb-3>
					<app-date-mask
						id="birth-date"
						label="Fecha de Nacimiento"
						v-model="valueDateBirth"
						@format-date="setData({ model: 'dateBirth', value: $event })"
					/>
					<span class="form-group__message"
						v-if="$v.model.dateBirth.$invalid">
						La fecha de nacimiento es requerida.
					</span>
				</v-flex>
			</v-layout>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-select
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Ocupación"
					item-value="id"
					item-text="name"
					:items="occupations"
					v-model="model.occupationId">
				</v-select>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Dirección"
					v-model="model.address">
				</v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Teléfono"
					type="number"
					v-model="model.phone">
				</v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Empresa"
					v-model="model.enterprise">
				</v-text-field>
			</v-flex>
			<v-flex>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					hide-details
					label="Profeción o Ocupación"
					v-model="model.profession">
				</v-text-field>
			</v-flex>
		</v-layout>
		<section  class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createFamily">
			</modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import { format } from 'date-fns';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';
import { required } from 'vuelidate/lib/validators';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function closeModal() {
	this.$emit('close');
}

function setData({ model, value }) {
	this.model[model] = value;
}

async function loadData() {
	try {
		const response = await this.$httpSales(`employee/${this.id}/relationship/${this.idEdit}`);
		this.model.fullName = response.data.dataEmployee ? response.data.dataEmployee.fullName : '';
		this.model.relationshipId = response.data.relationship ? response.data.relationship.id : '';
		this.model.flagBurden = !!response.data.flagBurden;
		this.model.occupationId = getDeeper('data', 'occupation', 'id')(response);
		this.model.address = response.data.dataEmployee ? response.data.dataEmployee.address : '';
		this.model.phone = response.data.dataEmployee ? response.data.dataEmployee.phone : '';
		this.model.enterprise = response.data.dataEmployee ? response.data.dataEmployee.enterprise : '';
		this.model.profession = response.data.dataEmployee ? response.data.dataEmployee.profession : '';
		this.valueDateBirth = response.data.dataEmployee ? format(helper.exactDate(response.data.dataEmployee.dateBirth), 'DD/MM/YYYY') : null;
		this.model.dateBirth = response.data.dataEmployee ? format(helper.exactDate(response.data.dataEmployee.dateBirth), 'YYYY-MM-DD') : null;
	} catch (error) {
		this.showGenericError();
	}
}

async function createFamily() {
	const method = this.idEdit ? 'patch' : 'post';
	const message = this.idEdit ? 'actualizó' : 'creó';
	const url = this.idEdit ? `employee/${this.id}/relationship/${this.idEdit}` : `employee/${this.id}/relationship`;
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

function created() {
	this.loadOcupation();
	if (this.idEdit) {
		this.loadData();
	}
}

function validations() {
	return {
		model: {
			dateBirth: { required },
			relationshipId: { required },
			fullName: { required },
		},
	};
}

async function loadOcupation() {
	const url = 'group/typeOccupation/table';
	({ data: this.occupations } = await this.$httpSales.get(url));
}

function data() {
	return {
		valueDateBirth: null,
		model: {
			fullName: '',
			relationshipId: '',
			phone: '',
			flagBurden: false,
			dateBirth: null,
			address: '',
			enterprise: '',
			profession: '',
			occupationId: '',
		},
		occupations: [],
	};
}

export default {
	name: 'page-family-create-employee',
	data,
	components: {
		modalSidebarButton,
	},
	methods: {
		closeModal,
		createFamily,
		loadData,
		loadOcupation,
		setData,
	},
	created,
	props: {
		id: {
			type: [String, Number],
		},
		idEdit: {
			type: [String, Number],
		},
		relation: {
			type: Array,
			default: () => [],
		},
	},
	validations,
};
</script>