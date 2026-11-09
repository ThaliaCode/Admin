<template>
	<div class="products-search-form">
		<v-layout wrap px-2 py-3>
			<v-flex xs12>
				<app-table
					:isResponsive="isResponsive"
					selectByArrow
					selectable
					class="is-not-selectable"
					:clean-search="isClean"
					:columns="columns"
					:items-quantity="rows.length"
					:current-page="currentPage"
					:last-page="lastPage"
					name="person-search-form"
					:rows="rows"
					:items-total-quantity="detailQuantity"
					@on-search-event="search"
					@on-page="loadData"
					@enter-pressed="addPerson"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.fullName }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.doc || '-' }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.phone || '-' }}
						</td>
						<td v-show="showRow(columns, 4)">{{ props.row.addressLine1 || '-' }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.email || '-' }}</td>
						<td v-show="showRow(columns, 6)">
							<v-btn
								class="btn-action btn-auto btn-width-auto px-2 py-1"
								color="success"
								small
								@click.stop="addPerson(props.row)"
							>
								{{ text }}
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

function created() {
	this.params.search = null;
	this.loadData();
}

function addPerson(customer) {
	this.$emit('add-person', customer);
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = page;
	this.params.search = this.params.search || this.searchValue || null;
	this.params.warehouseId =
		this.params.typeId === 1 ? this.warehouseId || null : null;
	try {
		const { data: response, headers } = await this.$httpSales.get(this.url, {
			params: this.params,
		});

		this.rows = response.map((r) => {
			const newRow = { ...r };
			newRow.doc = r.dni || r.ruc || r.documentNumber;
			if (r.name || r.lastname) {
				newRow.fullName = `${r.name || ''} ${r.lastname || ''}`;
			} else if (r.rzSocial) {
				newRow.fullName = r.rzSocial;
			} else {
				newRow.fullName = '-';
			}
			newRow.addressLine1 = r.address || '-';
			return newRow;
		});
		this.detailQuantity = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);
		if (this.products.length === 0) {
			this.showNotification('No se han encontrado coincidencias.', 'info');
		}
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

function data() {
	return {
		isClean: false,
		columns: [
			{
				id: 1,
				name: 'Nombre/Razón Social',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Número de Documento',
				value: 'numberDocument',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Contacto',
				value: 'contact',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Direccion',
				value: 'direction',
				visible: true,
				checked: false,
			},
			{ id: 5, name: 'Correo', value: 'email', visible: true, checked: false },
			{
				id: 6,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		detailQuantity: 0,
		lastPage: 0,
		params: {
			page: 1,
			limit: 20,
			search: null,
		},
		rows: [],
	};
}

export default {
	name: 'person-search-form',
	components: {
		appTable,
	},
	created,
	data,
	methods: {
		addPerson,
		loadData,
		search,
	},
	props: {
		url: {
			type: String,
			default: 'customers',
		},
		text: {
			type: String,
			default: 'Agregar',
		},
		searchValue: String,
		isResponsive: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
