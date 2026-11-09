<template>
	<div class="products-search-form">
		<v-layout wrap px-2 py-3>
			<v-flex xs12>
				<app-table
					class="is-not-selectable"
					:clean-search="isClean"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					local-storage
					name="accounts-search-form"
					:rows="accounts"
					@on-search-event="search"
					@on-page="loadData">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)"
							class="is-not-selectable">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.accountNumber }}</td>
						<td v-show="showRow(columns, 3)">
							<v-btn
								flat
								small
								type="button"
								class="table-icon"
								:color="props.row.flagActive === 1 ? 'success' : 'error'">
								{{ statusInWord(props.row) }}
							</v-btn>
						</td>
						<td v-show="showRow(columns, 4)">
							<v-btn
								class="btn-action btn-auto btn-width-auto px-2 py-1"
								color="success"
								small
								@click="$emit('add-product', props.row)"
							>
								{{text}}
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
	import helper from '@/shared/helper';

	function created() {
		this.params.search = null;
		this.isClean = true;
		helper.removeLocalData('accounts-search-form::search');
		this.loadData();
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = this.currentPage;
		this.params.search = this.params.search || this.searchValue || null;
		try {
			const { data: response, headers } = await this.getBankAccount(null, this.params);
			this.accounts = [...response];
			this.lastPage = Number(headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.isClean = false;
		}
	}

	function search(searchData) {
		if (searchData) {
			const searchVal = searchData.replace(/\?/g, '_');
			this.params.search = searchVal || null;
		}
		this.loadData();
	}
	
	function statusInWord({ flagActive }) {
		return flagActive === 1 ? 'ACTIVO' : 'DESACTIVADO';
	}

	function data() {
		return {
			accounts: [],
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 2, name: 'Cuenta', value: 'account', visible: true, checked: true },
				{ id: 3, name: 'Estado', value: 'state', visible: true, checked: true },
				{ id: 4, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			lastPage: 0,
			params: {
				page: 1,
				search: null,
			},
		};
	}

	export default {
		name: 'accounts-search-form',
		components: {
			appTable,
		},
		created,
		data,
		methods: {
			loadData,
			search,
			statusInWord,
		},
		props: {
			searchValue: String,
			text: {
				type: String,
				default: 'Agregar',
			},
		},
	};
</script>
