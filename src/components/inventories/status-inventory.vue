<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12>
				<v-layout>
					<v-flex xs4>
						<v-radio-group v-model="model.status">
							<v-radio
								v-for="(statu, index) in status"
								:key="index"
								:label="statu.name"
								:value="statu.value"
							></v-radio>
						</v-radio-group>
					</v-flex>
					<v-flex xs8 v-if="isRejected">
						<v-select
							class="filter-select mt-3"
							item-text="name"
							item-value="id"
							label="Inventariador"
							v-model="model.employeeId"
							:items="employees"
						></v-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select"
					label="Comentario"
					v-model="model.commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('send-status', model)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, requiredIf } from 'vuelidate/lib/validators';

function validations() {
	return {
		model: {
			status: {
				required,
			},
			employeeId: {
				required: requiredIf(() => this.isRejected),
			},
		},
	};
}

function isRejected() {
	return this.model.status === 5;
}

function data() {
	return {
		model: {
			commentary: null,
			status: null,
			employeeId: null,
		},
		status: [
			{
				name: 'Rechazar',
				value: 5,
			},
			{
				name: 'Observar',
				value: 3,
			},
			{
				name: 'Aprobar',
				value: 2,
			},
		],
	};
}
export default {
	name: 'status-inventory',
	data,
	components: {
		modalSidebarButton,
	},
	computed: {
		isRejected,
	},
	props: {
		employees: {
			type: Array,
			default: () => [],
		},
	},
	validations,
};
</script>