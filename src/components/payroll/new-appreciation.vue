<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<app-date-mask
					id="date"
					label="Fecha"
					v-model="date"
					@format-date="onDate($event, 'date')"
				>
				</app-date-mask>
				<span class="form-group__message"
					v-if="$v.date.$invalid">
					La fecha es requerido.
				</span>
			</v-flex>
			<v-flex x12 md12 pr-2 mb-3>
				<v-select
					label="Motivos"
					:items="typeRecognitions"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.recognitionId"
					class="filter-select shadow-inset"
				></v-select>
				<span class="form-group__message"
					v-if="$v.model.recognitionId.$invalid">
					El motivo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Remitente"
					v-model="model.description">
				</v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid || $v.date.$invalid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createRecognitions"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';
import { format } from 'date-fns';
import { required } from 'vuelidate/lib/validators';

function onDate(value, modelName) {
	this.model[modelName] = value;
}

function closeModal() {
	this.$emit('close');
	this.clearModal();
}

function clearModal() {
	this.model = {
		date: null,
		reason: '',
		sender: '',
	};
	this.date = null;
}

async function createRecognitions() {
	const method = this.idEdit ? 'patch' : 'post';
	const message = this.idEdit ? 'actualizó' : 'creó';
	const url = this.idEdit ? `employee/${this.id}/recognitions/${this.idEdit}` : `employee/${this.id}/recognitions`;
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
		const response = await this.$httpSales.get(`/employee/${this.id}/recognitions/${this.idEdit}`);
		this.date = response.data.date ?
			format(helper.exactDate(response.data.date), 'DD/MM/YYYY') : null;
		this.model.recognitionId = response.data.recognitions.id || '';
		this.model.description = response.data.description || '';
		this.model.date = response.data.date ?
			format(helper.exactDate(response.data.date), 'YYYY-MM-DD') : null;
	} catch (error) {
		this.showGenericError();
	}
}

function twoDigits(n) {
	return n >= 10 ? n : `0${n}`;
}

function created() {
	const currentDay = new Date();
	const day = this.twoDigits(currentDay.getDate());
	const month = this.twoDigits(currentDay.getMonth() + 1);
	const year = currentDay.getFullYear();
	this.date = `${day}-${month}-${year}`;
	if (this.idEdit) {
		this.loadData();
	}
}

function validations() {
	return {
		model: {
			recognitionId: { required },
		},
		date: { required },
	};
}

function data() {
	return {
		date: null,
		model: {
			date: null,
			recognitionId: '',
			description: '',
		},
	};
}
export default {
	name: 'new-appreciation',
	data,
	components: {
		modalSidebarButton,
	},
	created,
	methods: {
		onDate,
		closeModal,
		clearModal,
		createRecognitions,
		loadData,
		twoDigits,
	},
	props: {
		id: {
			type: [String, Number],
		},
		typeRecognitions: {
			type: [Array],
			default: () => [],
		},
		idEdit: {
			type: [String, Number],
		},
	},
	validations,
};
</script>

