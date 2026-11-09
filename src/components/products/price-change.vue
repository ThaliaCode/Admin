<template>
	<div>
		<v-flex xs12 pb-0 pt-3>
			<app-table
				class="mb-0"
				:columns="columns"
				:rows="rows"
				:items-quantity="rows.length"
				@on-page="changePage"
				:input-search="false"
				>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable width-war">{{ props.row.moduleName }}</td>
					<td v-show="showRow(columns, 2)" class="width-war">{{ props.row.price }}</td>
					<td v-show="showRow(columns, 3)" class="width-war">{{ props.row.priceList }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.method }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.codeApp }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.nameEmail }}</td>
					<td v-show="showRow(columns, 7)" class="width-war">{{ props.row.createdAt }}</td>
				</template>
			</app-table>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.getChangePrice(this.id);
}

async function getChangePrice() {
	try {
		this.params.moduleId = 12;
		this.params.itemId = this.id;
		const response = await this.$httpProducts.get('consumption-audit', { params: this.params });
		// Process the rows to keep the props that the table needs
		this.rows = response.data.map(row => ({
			moduleName: row.moduleName,
			price: row.payloadFilters.price ||
				row.payloadFilters.priceSale || row.payloadFilters.priceOld,
			// eslint-disable-next-line no-nested-ternary
			priceList: row.payloadFilters.priceList ?
				row.payloadFilters.priceList[this.priceListIdTable] ?
					row.payloadFilters.priceList[this.priceListIdTable].price :
					row.payloadFilters.priceList[this.$userInfo.company.salPriceListDefault.id].price : '',
			method: row.method,
			codeApp: row.codeApp,
			nameEmail: `${row.dataUser.email} ${row.dataUser.nameEmployee}`,
			createdAt: row.createdAt ? row.createdAt.slice(0, 10) : '',
		}));
	} catch (err) {
		this.showNotification('Ocurrió un error al intentar cargar la data.', 'error');
		console.error(err);
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Módulo', checked: true, visible: true },
			{ id: 2, name: 'Campos Actualizados', checked: true, visible: true },
			{ id: 3, name: 'Cambios por lista de Precios', checked: true, visible: true },
			{ id: 4, name: 'Métodos', checked: true, visible: true },
			{ id: 5, name: 'Aplicación', checked: true, visible: true },
			{ id: 6, name: 'Realizado por', checked: true, visible: true },
			{ id: 7, name: 'Fecha', checked: true, visible: true },
		],
		params: {
			page: 1,
			moduleId: null,
			itemId: null,
		},
		currentPage: 1,
		lastPage: 1,
		rows: [{}],
	};
}

export default {
	name: 'price-change',
	created,
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	methods: {
		getChangePrice,
		changePage(page) {
			this.currentPage = page;
		},
	},
	props: {
		id: {
			type: Number,
			required: true,
		},
		priceListIdTable: {
			type: Number,
			required: true,
		},
		priceSelected: {
			type: Number,
			required: true,
		},
	},
};
</script>

<style lang="scss">
.width-war {
	width: 190px;
}
</style>