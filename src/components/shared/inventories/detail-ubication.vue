<template>
	<div>
		<div class="detail-general">
			<div>
				<span>Invent. : {{ inventors }}</span>
			</div>
			<div>
				<span v-if="rows[0]">Stock: {{ rows[0].stock }}</span>
			</div>
		</div>
		<app-table
			class="is-not-selectable mb-3"
			name="detail-inventory"
			:columns="columns"
			:filter-columns="false"
			:input-search="false"
			:main-list="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<template>
					<td class="is-not-selectable">{{ props.row.computed }}</td>
					<td>{{ props.row.location }}</td>
				</template>
			</template>
		</app-table>
		<v-layout wrap mb-2>
			<v-flex xs12 pl-5 py-2 class="content-semi-green">
				<p class="my-0">Comentario</p>
			</v-flex>
			<v-flex xs12 pl-5 mt-3 class="commentary-text">
				{{ rows[0].commentary }}
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="false"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from './../utils/modal-sidebar-button';

function closeModal() {
	this.$emit('cancel-modal');
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Ubicación',
				value: 'location',
				visible: true,
				checked: true,
			},
		],
	};
}

export default {
	name: 'detail-ubication',
	data,
	components: {
		modalSidebarButton,
		appTable,
	},
	methods: {
		closeModal,
	},
	props: {
		rows: {
			type: [Array, Object],
			default: () => [],
		},
		inventors: {
			type: String,
		},
	},
};
</script>
<style lang="scss" scoped>
.detail-general {
	background: map-get($colors, header-table);
	display: flex;
	justify-content: space-around;
	margin-bottom: 20px;
	padding: 10px 0;
}
</style>
