<template>
	<div>
		<header-page caption-navigation="Pedidos" title="Boleteo Masivo" />
		<v-flex xs12 class="mt-4">
			<app-table
				name="detail-warehouse"
				:last-page="lastPage"
				:selectable="false"
				:inputSearch="false"
				:current-page="currentPage"
				:rows="rows"
				:columns="columns"
				class="is-not-selectable"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">
						{{ props.row.documentNumber }}
					</td>
					<td v-show="showRow(columns, 2)">
						<span
							v-if="props.row.saleDocUnited.serie"
							mt-2
							v-for="(item, index) in props.row.saleDocUnited.serie"
						>
							{{ item }}
							<br
						/></span>
						<span v-else>--</span>
					</td>
					<td v-show="showRow(columns, 3)">
						{{
							props.row.saleDocUnited && props.row.saleDocUnited.customer
								? props.row.saleDocUnited.customerName.join(', ')
								: props.row.customer.typePerson.fullName
						}}
					</td>
					<td v-show="showRow(columns, 4)">
						<span
							mt-2
							v-for="(item, index) in props.row.saleDocUnited.document"
							:key="index"
						>
							<a :href="`/sales/convert/${item.id}`" target="_blank">{{
								item.documentNumber
							}}</a
							><br
						/></span>
					</td>
					<td v-show="showRow(columns, 5)">
						<span
							v-if="props.row.saleDocUnited"
							mt-2
							v-for="(item, index) in props.row.saleDocUnited.subtotal"
						>
							{{ item }}
							<br
						/></span>
						<span v-else>{{ props.row.subtotal }}</span>
					</td>
					<td v-show="showRow(columns, 6)">
						<span
							v-if="props.row.saleDocUnited"
							mt-2
							v-for="(item, index) in props.row.saleDocUnited.taxes"
						>
							{{ item }}
							<br
						/></span>
						<span v-else>{{ props.row.taxes }}</span>
					</td>
					<td v-show="showRow(columns, 7)">
						<span
							v-if="props.row.saleDocUnited"
							mt-2
							v-for="(item, index) in props.row.saleDocUnited.amount"
						>
							{{ item }}
							<br
						/></span>
						<span v-else>{{ props.row.total }}</span>
					</td>
					<td v-show="showRow(columns, 8)">
						<document-state
							:color="
								existSaleDocument(props.row.saleDocument) ? 'primary' : 'error'
							"
							:tooltip="
								existSaleDocument(props.row.saleDocument)
									? 'Generado'
									: props.row.messageError
							"
						/>
						<app-tooltip-button
							:disabled="existSaleDocument(props.row.saleDocument)"
							text="Eliminar"
							icon="delete"
							color="error"
							@click-icon="openDialog(props.row)"
						/>
					</td>
				</template>
			</app-table>
			<v-dialog v-model="dialogDelete" persistent max-width="380">
				<modal-items
					title="Eliminar Movimiento"
					name-action="Eliminar"
					name-cancel="Cerrar"
					v-if="dialogDelete"
					show-slot
					@close-modal="closeDialog"
					@action-modal="deleteRow"
				>
					<div class="pa-3">
						{{ textDialog }}
					</div>
				</modal-items>
			</v-dialog>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';

function created() {
	this.loadMassiveTecking();
}

async function loadMassiveTecking() {
	const id = this.$route.params.id;
	try {
		const typeDocuments = await this.getTypeDocuments('sales');
		const response = await this.$httpSales.get(`sal-order-annex/${id}`);
		this.rows = response.data.map((row) => {
			const newRow = { ...row };
			newRow.saleDocUnited = {
				document: row.saleDocument.map((rs) => {
					const code = typeDocuments.data.find(
						(d) => d.documentType.name === rs.typeDocument.name
					).documentType.code;
					const objDocument = {
						id: rs.id,
						documentNumber: `${code} - ${rs.documentNumber}`,
					};
					return objDocument;
				}),
				serie: this.mapItems(row.saleDocument, 'serie'),
				customerName: this.mapItems(
					row.saleDocument,
					'customer.typePerson.fullName'
				),
				subtotal: this.mapItems(row.saleDocument, 'subtotal'),
				taxes: this.mapItems(row.saleDocument, 'taxes'),
				amount: this.mapItems(row.saleDocument, 'amount'),
			};
			newRow.messageError = row.additionalInfo
				? row.additionalInfo.errorAnnex
				: 'No Generado';
			return newRow;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
}

function openDialog({ id, saleDocument, documentNumber }) {
	this.idRow = id;
	this.textDialog = `¿Estas seguro que sea eliminar el movimiento, con el Nro de Documento: '${
		saleDocument ? saleDocument.documentNumber : documentNumber
	}'?`;
	this.dialogDelete = true;
}

function closeDialog() {
	this.idRow = null;
	this.textDialog = '';
	this.dialogDelete = false;
}

async function deleteRow() {
	const idAnnex = this.$route.params.id;
	try {
		await this.$httpSales.delete(`sal-order-annex/${idAnnex}/${this.idRow}`);
		this.showNotification('El Movimiento fue eliminado correctamente.');
		this.loadMassiveTecking();
		this.closeDialog();
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: '# Pedido',
				value: 'ubication',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Serie', value: 'stock', visible: true, checked: true },
			{
				id: 3,
				name: 'Cliente',
				value: 'ubication',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Documento',
				value: 'document',
				tooltip: 'Tipo y numero de Documento',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Subtotal',
				value: 'ubication',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'IGV', value: 'ubication', visible: true, checked: true },
			{
				id: 7,
				name: 'Total',
				value: 'ubication',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Acción',
				value: 'ubication',
				visible: true,
				checked: true,
			},
		],
		dialogDelete: false,
		params: {
			limit: 20,
		},
		textDialog: '',
		currentPage: 1,
		lastPage: 0,
		rows: [],
	};
}

export default {
	name: 'page-massive-tecking',
	data,
	created,
	components: {
		appTable,
		documentState,
		headerPage,
		modalItems,
	},
	methods: {
		closeDialog,
		changePage,
		deleteRow,
		loadMassiveTecking,
		onSearch,
		openDialog,
		mapItems(arr, keyPath) {
			return arr.map((item) =>
				keyPath.split('.').reduce((obj, key) => obj[key], item)
			);
		},
		existSaleDocument(saleDocument) {
			if (!saleDocument) return false;
			return saleDocument.length > 0;
		},
	},
};
</script>

<style lang="scss" scoped></style>
