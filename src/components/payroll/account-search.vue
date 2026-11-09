<template>
	<div>
		<v-layout wrap px-2 py-3>
			<v-flex xs12>
				<app-table
					class="is-not-selectable"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					name="account-search"
					:rows="data"
					@on-page="loadData">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)"
							class="is-not-selectable">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.account }}</td>
						<td v-show="showRow(columns, 3)">
							<v-btn
								class="btn-action btn-auto btn-width-auto px-2 py-1"
								color="success"
								small
								@click="$emit('add-account', props.row, name)"
							>
								Agregar
							</v-btn>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		data: [],
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Cuenta', value: 'account', visible: true, checked: true },
			{ id: 3, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			page: 1,
		},
	};
}

function created() {
	this.loadData();
}

async function loadData() {
	const id = this.$userInfo.company.id;
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpQuipu.get(`accounting-plan/${id}/quipu?search=facturacion`, { params: this.params });
		this.data = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

export default {
	name: 'account-search',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	methods: {
		loadData,
	},
	props: {
		name: {
			type: String,
		},
	},
};
</script>

