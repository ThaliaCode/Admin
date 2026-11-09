<template>
	<v-layout column px-3 pt-3>
		<v-flex>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				:label="isPeru ? 'Departamento' : 'Provincia'"
				:place-holder="isPeru ? 'Departamento' : 'Provincia'"
				model="departmentId"
				item-text="name"
				item-value="id"
				:item="model.departmentId"
				return-object
				:items="departments"
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
		<v-flex mt-2>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				:label="isPeru ? 'Provincia' : 'Ciudad'"
				item-text="name"
				item-value="id"
				:place-holder="isPeru ? 'Provincia' : 'Ciudad'"
				return-object
				model="provinceId"
				:item="model.provinceId"
				:items="provinces"
				@input="$emit('set-data', $event)"
			/>
		</v-flex>
		<v-flex mt-2>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				item-text="name"
				item-value="id"
				:label="isPeru ? 'Distrito' : 'Parroquia'"
				:place-holder="isPeru ? 'Distrito' : 'Parroquia'"
				return-object
				model="distritId"
				:item="model.distritId"
				:items="distrits"
				@input="$emit('set-data', $event)"
			/>
		</v-flex>
		<v-flex mt-2>
			<app-input-text
				label="Dirección"
				model="direction"
				:text="model.direction"
				@input="$emit('set-information', $event)"
			/>
		</v-flex>
		<v-flex mt-2>
			<app-input-text
				label="Dirección Exacta"
				model="exactDirection"
				:text="model.exactDirection"
				@input="$emit('set-information', $event)"
			/>
		</v-flex>
		<v-flex mt-2>
			<app-input-text
				label="Interior"
				model="lowerExactAddress"
				:text="model.lowerExactAddress"
				@input="$emit('set-information', $event)"
			/>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				success-color="primary"
				@accept-button-clicked="$emit('save-direction', model)"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</v-layout>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function validations() {
	return {
		model: {
			departmentId: { required },
			provinceId: { required },
			distritId: { required },
			direction: { required },
		},
	};
}

export default {
	name: 'new-direction',
	components: {
		modalSidebarButton,
	},
	props: {
		departments: {
			default: () => [],
			type: Array,
		},
		provinces: {
			default: () => [],
			type: Array,
		},
		distrits: {
			default: () => [],
			type: Array,
		},
		model: {
			default: () => {},
			type: Object,
		},
		departmentId: [String, Number],
	},
	validations,
};
</script>
