<template>
	<div>
		<v-layout px-4 mt-4 wrap row>
			<v-flex xs12>
				<v-select
					bottom
					single-line
					hide-details
					:items="groups"
					item-text="name"
					item-value="id"
					class="filter-select"
					content-class="filter-select-content"
					v-model="group"
					@change="changeGroup"
				></v-select>
				<span class="form-group__message" v-if="!$v.group.required">
					El grupo es requerido
				</span>
			</v-flex>
			<v-flex xs12 mt-5 class="title-section" v-if="typesMovements.length">
				<span>Tipos de Movimientos</span>
			</v-flex>
			<v-flex xs12>
				<v-radio-group
					colums
					class="sale-radio"
					v-model="typeDocumentId"
				>
					<v-radio
						v-for="t in typesMovements"
						class="mb-3"
						:key="t.id"
						:label="`${t.code} - ${t.name}`"
						:value="t.id"
						color="success"
					></v-radio>
				</v-radio-group>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('detail-group', group, typeDocumentId)"
			/>
		</section>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function changeGroup(id) {
	const namePage = this.$route.name;
	const groupSelect = this.groups.find(g => g.id === id);
	this.typesMovements = namePage === 'new-entry' ? groupSelect.typeIn : groupSelect.typeOut;
	this.typeDocumentId = this.typesMovements.length === 1 ? this.typesMovements[0].id : null;
}

function validations() {
	return {
		group: { required },
		typeDocumentId: { required },
	};
}

function created() {
	if (this.groups.length === 1) {
		this.typeDocumentId = this.groups[0].id;
		this.changeGroup(this.typeDocumentId);
	}
}

function data() {
	return {
		typeDocumentId: null,
		typesMovements: [],
	};
}
export default {
	name: 'group',
	components: {
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		changeGroup,
	},
	props: {
		groups: {
			type: Array,
			default: () => [],
		},
		group: Number,
	},
	validations,
};
</script>