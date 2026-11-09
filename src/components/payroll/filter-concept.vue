<template>
  <div>
    <v-layout row wrap px-4>
			<v-flex xs12>
				<v-checkbox
					class="pt-4"
					label="Rubros Activos"
					v-model="params.flagActive"
				></v-checkbox>
			</v-flex>
			<v-flex xs12>
				<v-checkbox
					label="Rubros Provisión"
					v-model="params.flagProvision"
				></v-checkbox>
			</v-flex>
			<v-flex xs12>
				<v-select
					label="Tipo de rubro"
					:items="type"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					class="filter-select shadow-inset"
					v-model="params.conceptTypeId"
				></v-select>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('update-params', params)"
			/>
		</section>
  </div>
</template>
<script>
import groupTable from '@/shared/group-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
	this.params.flagActive = !!this.selects.flagActive;
	this.params.flagProvision = this.selects.flagProvision || null;
	this.params.conceptTypeId = this.selects.conceptTypeId || null;
}

async function loadData() {
	const response = await this.urlLoadData('get', groupTable.TypeConcepts);
	this.type = response.data;
}

function data() {
	return {
		type: [],
		params: {
			flagActive: true,
			flagProvision: false,
			conceptTypeId: null,
		},
	};
}

export default {
	name: 'filter-concept',
	created,
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		loadData,
	},
	props: {
		selects: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

