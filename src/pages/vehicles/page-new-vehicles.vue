<template>
	<action-sidebar
		:title="$route.meta.title"
		:value="action.open"
		:code-action="action.code"
		:width="action.width"
		:help-actions="actionsToHelp"
		@close-modal="close"
	>
		<v-layout wrap px-4 pt-4>
			<v-flex xs12 mb-3>
				<v-select
					class="filter-select mt-3"
					item-text="name"
					item-value="id"
					label="Tipo de transporte"
					v-model="newVehicle.typeTransportId"
					:items="types"
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					label="Placa"
					model="plate"
					:text="newVehicle.plate"
					@input="setData"
				/>
				<!-- <v-text-field
					class="filter-select"
					label="Placa"
					hide-details
					v-model="newVehicle.plate"
					@input="setData"
				></v-text-field> -->
				<span class="form-group__message ml-2" v-if="$v.newVehicle.plate.$invalid">
					La placa es requerida
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Marca"
					hide-details
					v-model="newVehicle.brandName"
				></v-text-field>
				<span class="form-group__message ml-2" v-if="$v.newVehicle.brandName.$invalid">
					La marca es requerida
				</span>
			</v-flex>
			<v-flex xs6 mb-3 mr-3>
				<v-text-field
					class="filter-select"
					label="Modelo"
					hide-details
					v-model="newVehicle.model"
				></v-text-field>
			</v-flex>
			<v-flex xs5 mb-3>
				<v-text-field
					class="filter-select"
					label="Color"
					hide-details
					type="color"
					v-model="newVehicle.color"
				></v-text-field>
			</v-flex>
			<!-- <v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Tipo de Motor"
					hide-details
					v-model="newVehicle.typeEngine"
				></v-text-field>
			</v-flex> -->
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Capacidad en m3"
					hide-details
					type="number"
					v-model="newVehicle.capacity"
				></v-text-field>
				<span class="form-group__message ml-2" v-if="$v.newVehicle.capacity.$invalid">
					La capacidad es requerida
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Peso de vehiculos (toneladas)"
					hide-details
					type="number"
					v-model="newVehicle.payloadTons"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					class="textarea-content filter-select mt-3"
					label="Observaciones"
					v-model="newVehicle.observations"
				></v-text-field>
			</v-flex>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.$invalid || showValidNumber"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-layout>
	</action-sidebar>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function close() {
	this.goTo('vehicle-list');
}

async function save() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `vehicles/${this.id}` : 'vehicles';
	const message = this.id ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.newVehicle);
		this.showNotification(`Se ${message} correctamente`);
		this.close();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'VEHICLE_CODE_REPEATED') {
				this.showGenericError('El código ya está asignado a otro vehículo.');
			}
		}
	}
}

async function loadData() {
	try {
		const { data: response } = await this.$httpSales(`vehicles/${this.id}`);
		this.newVehicle = {
			plate: response.plate || null,
			brandName: response.brandName || null,
			model: response.model || null,
			color: response.color || null,
			typeEngine: response.typeEngine || null,
			capacity: response.capacity || null,
			payloadTons: response.payloadTons || 0,
			observations: response.observations || null,
			typeTransportId: response.typeTransportId || null,
		};
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.listType();
	if (this.id) {
		this.loadData();
	}
}

function setData({ model, value }) {
	const showValid = /^[0-9A-Z]+$/gi.test(value);
	this.showValidNumber = !showValid;
	if (this.showValidNumber) {
		this.showGenericError('Solamente se permite digitos alfanumericos');
	}
	this.newVehicle[model] = value;
}

async function listType() {
	try {
		const { data: response } = await this.$httpSales.get('type-transport');
		this.types = response;
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		newVehicle: {
			plate: { required },
			capacity: { required },
			brandName: { required },
		},
	};
}

function data() {
	return {
		action: {
			code: '',
			open: true,
			title: '',
			width: 434,
		},
		newVehicle: {
			plate: null,
			brandName: null,
			model: null,
			color: null,
			typeEngine: null,
			capacity: null,
			payloadTons: 0,
			observations: null,
			typeTransportId: null,
		},
		showValidNumber: false,
		types: [],
	};
}
export default {
	name: 'page-new-vehicles',
	data,
	created,
	components: {
		actionSidebar,
		modalSidebarButton,
	},
	methods: {
		close,
		loadData,
		save,
		listType,
		setData,
	},
	props: {
		id: [Number, String],
	},
	validations,
};
</script>
