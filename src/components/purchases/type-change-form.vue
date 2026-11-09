<template>
	<div class="type-change-form">
		<v-layout row align-center pt-3 px-4>
			<v-flex xs4 pr-3>
				<app-select
					:item="month"
					item-text="name"
					item-value="name"
					label="Mes"
					model="month"
					:items="monthsFilters"
					:return-object="false"
					@input="$emit('set-date', $event)"
				></app-select>
			</v-flex>
			<v-flex xs4>
				<app-select
					:item="year"
					item-text="year"
					item-value="year"
					:items="years"
					label="Año"
					model="year"
					:return-object="false"
					@input="$emit('set-date', $event)"
				></app-select>
			</v-flex>
		</v-layout>
		<v-flex mt-5>
			<app-table
				:columns="columns"
				:rows="rows"
				:selectable="false"
				:filterColumns="false"
				:input-search="false"
				:caption-quantity="false"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.destinationCurrency }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.lastUpdate | exactDate }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.amount }}</td>
					<td v-show="showRow(columns, 4)">
						<button
							type="button"
							class="btn-sunat"
							@click="$emit('add-type', props.row)"
						>
							Agregar
						</button>
					</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				hidden
				success-color="error"
				@accept-button-clicked="$emit('close-modal')"
				success-text="Cerrar"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Entidad', value: 'entity', visible: true, checked: true },
			{ id: 2, name: 'Fecha', value: 'entity', visible: true, checked: true },
			{ id: 3, name: 'TC', value: 'entity', visible: true, checked: true },
			{
				id: 4,
				name: 'Acciones',
				value: 'entity',
				visible: true,
				checked: true,
			},
		],
		years: [
			{
				id: 1,
				year: '2019',
			},
			{
				id: 2,
				year: '2020',
			},
			{
				id: 3,
				year: '2021',
			},
			{
				id: 4,
				year: '2022',
			},
			{
				id: 5,
				year: '2023',
			},
			{
				id: 6,
				year: '2024',
			},
			{
				id: 7,
				year: '2025',
			},
		],
		months: [
			{
				id: 1,
				name: 'enero',
			},
			{
				id: 2,
				name: 'febrero',
			},
			{
				id: 3,
				name: 'marzo',
			},
			{
				id: 4,
				name: 'abril',
			},
			{
				id: 5,
				name: 'mayo',
			},
			{
				id: 6,
				name: 'junio',
			},
			{
				id: 7,
				name: 'julio',
			},
			{
				id: 8,
				name: 'agosto',
			},
			{
				id: 9,
				name: 'setiembre',
			},
			{
				id: 10,
				name: 'octubre',
			},
			{
				id: 11,
				name: 'noviembre',
			},
			{
				id: 12,
				name: 'diciembre',
			},
		],
		monthsFilters: [],
	};
}

export default {
	name: 'type-change-form',
	data,
	created() {
		const currentMonth = new Date().getMonth() + 1;
		this.monthsFilters = this.months.filter(
			(month) => month.id <= currentMonth
		);
	},
	props: {
		year: [String, Number],
		month: [String, Number],
		day: [String, Number],
		rows: {
			type: Array,
			default: () => [],
		},
	},
	components: {
		appTable,
		modalSidebarButton,
	},
};
</script>

<style lang="scss" scoped>
.btn-sunat {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-semibold);
	font-size: 10px;
	height: 20px;
	width: 64px;
}
</style>
