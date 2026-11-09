<template>
	<div>
		<app-table
			name="assign-seller"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="onPage"
			class="mt-4"
			>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.fullname }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
				<td v-show="showRow(columns, 4)">
					<button class="btn-more" @click="$emit('change-employee', props.row)">
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
				</td>
			</template>
		</app-table>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';

function created() {
	this.loadData();
}

async function loadData() {
	const params = {
		page: this.currentPage,
		assigned: true,
	};
	try {
		const response = await this.$httpSales('employees', { params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Documento', value: 'document', visible: true, checked: true },
			{ id: 4, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		rows: [],
	};
}

export default {
	name: 'assign-seller',
	created,
	components: {
		appTable,
	},
	methods: {
		onPage,
		loadData,
	},
	data,
};
</script>

<style lang="scss" scoped>
	.btn-more {
		background: map-get($colors, success);
    border-radius: 6px;
    width: 34px;
	}
</style>