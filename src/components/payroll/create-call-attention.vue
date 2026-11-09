<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex  xs12 md12 pr-2 mb-3>
				<app-date-mask
				label="Fecha"
				id="date-attention"
				v-model="valueDate"
				@format-date="setData({ model: 'date', value: $event })"
				/>
				<span class="form-group__message"
				v-if="$v.model.date.$invalid">
					Este campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3> 
				<v-text-field
				class="filter-select mt-3"
				label="Motivo"
				v-model="model.reason"
				></v-text-field>
				<span class="form-group__message"
					v-if="$v.model.reason.$invalid">
					Este campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
				class="filter-select mt-3"
				label="Remitente"
				v-model="model.sender"
				></v-text-field>
			</v-flex>
			<v-flex>
				<v-select
				class="filter-select mt-3"
				label="Tipo"
				item-text="name"
				item-value="id"
				:items="typeAttention"
				v-model="model.reprimandId"></v-select>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createAttention"></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';
import { format } from 'date-fns';
import helper from '@/shared/helper';

async function createAttention() {
	const url = this.idEdit ? `employee/${this.id}/reprimands/${this.idEdit}` : `employee/${this.id}/reprimands`;
	const method = this.idEdit ? 'patch' : 'post';
	const message = this.idEdit ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente`);
		this.$emit('update');
	} catch (error) {
		if (error.data.message === 'Bad Request') {
			this.showGenericError('Incorrecto');
		} else {
			this.showGenericError();
		}
	}
}

async function editAttention() {
	try {
		const response = await this.$httpSales.get(`employee/${this.id}/reprimands/${this.idEdit}`);
		this.model.reason = response.data.dataEmployee.reason || '';
		this.model.sender = response.data.dataEmployee.sender || '';
		this.model.reprimandId = response.data.reprimands ? response.data.reprimands.id : '';
		this.valueDate = format(helper.exactDate(response.data.date), 'DD/MM/YYYY') || null;
		this.model.date = format(helper.exactDate(response.data.date), 'DD-MM-YYYY') || null;
	} catch (error) {
		this.showGenericError();
	}
}

function setData({ model, value }) {
	this.model[model] = value;
}

function created() {
	this.getTypeAttention();
	if (this.idEdit) {
		this.editAttention();
	}
}

async function getTypeAttention() {
	try {
		const response = await this.$httpSales.get('/group/typeReprimands/table');
		this.typeAttention = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			date: { required },
			reason: { required },
		},
	};
}

function closeModal() {
	this.$emit('close-modal');
}

function data() {
	return {
		valueDate: null,
		typeAttention: [],
		model: {
			date: null,
			reason: '',
			sender: '',
			reprimandId: null,
		},
	};
}

export default {
	data,
	name: 'create-call-attention',
	validations,
	created,
	methods: {
		editAttention,
		createAttention,
		closeModal,
		getTypeAttention,
		setData,
	},
	components: {
		modalSidebarButton,
	},
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
