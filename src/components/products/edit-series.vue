<template>
	<div>
		<v-layout wrap pa-3>
			<v-flex xs12 mb-4>
				<v-text-field
					label="Serie"
					v-model="model.serie"
					hide-details
					class="filter-select shadow-inset"
				></v-text-field>
				<span class="form-group__message" v-if="$v.model.serie.$invalid">
					La serie es requerida
				</span>
			</v-flex>
			<!-- <v-flex xs12 mb-4>
				<app-date-mask
					id="date"
					v-model="dateInput"
					single-line
					@format-date="setData('date', $event)"
				/>
			</v-flex> -->
			<v-flex xs12 mb-4>
				<v-text-field
					label="Comentario 1"
					v-model="model.comments"
					hide-details
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
			<v-flex xs12 mb-4>
				<v-text-field
					label="Comentario 2"
					v-model="model.observation"
					hide-details
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					type="number"
					label="Cantidad"
					v-model="model.quantity"
					hide-details
					class="filter-select shadow-inset"
					disabled
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid "
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="updateSerie"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';
import { required } from 'vuelidate/lib/validators';

function setData(model, date) {
	this.model[model] = date;
}

function created() {
	this.loadData();
}

async function loadData() {
	try {
		const response = await this.$httpProducts.get(`products-detail/${this.id}`);
		this.model.serie = response.data.serie;
		this.model.date = helper.exactDate(response.data.date, 'YYYY-MM-DD');
		this.dateInput = helper.exactDate(response.data.date, 'DD/MM/YYYY');
		this.model.comments = response.data.comments;
		this.model.observation = response.data.observation;
		this.model.quantity = response.data.quantity;
	} catch (error) {
		this.showGenericError('Error');
	}
}

async function updateSerie() {
	try {
		await this.$httpProducts.patch(`products-detail/${this.id}`, this.model);
		this.showNotification('Se actualizó correctamente');
		this.$emit('update-serie');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SERIES_REPEATED') {
				this.showGenericError('Serie repetida');
			}
		} else {
			this.showGenericError('Error');
		}
	}
}

function validations() {
	return {
		model: {
			serie: { required },
		},
	};
}

function data() {
	return {
		model: {
			serie: null,
			date: null,
			comments: null,
			observation: null,
			quantity: null,
		},
		dateInput: null,
	};
}
export default {
	name: 'edit-series',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		setData,
		loadData,
		updateSerie,
	},
	props: {
		id: {
			type: [Number, String],
		},
	},
	validations,
};
</script>

