<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			@clean-product-filter="onCleanData"
		></header-page>
		<v-layout row align-end px-4 pt-2 mb-4>
			<v-flex xs2 mr-3>
				<app-select
					chips
					multiple
					item-text="name"
					item-value="id"
					:items="batDocuments"
					label="Documentos"
					model="batDocumentIds"
					:item="params.batDocumentIds"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<v-flex xs2 mr-3>
				<label class="caption">Fecha Inicio</label>
				<app-date-select
					:date-formatted="params.startDate"
					label=""
					model="startDate"
					@input="setDate($event)"
				/>
			</v-flex>
			<v-flex xs2>
				<label class="caption">Fecha Final</label>
				<app-date-select
					:date-formatted="params.endDate"
					:min-date="params.startDate"
					:max-date="maxDate"
					:readonly="!params.startDate"
					label=""
					model="endDate"
					@input="setDate($event)"
				/>
			</v-flex>
		</v-layout>
		<app-table
			class="is-not-selectable"
			:columns="columns"
			:current-page="currentPage"
			:filter-columns="false"
			:input-search="false"
			:rows="rows"
			:selectable="false"
			:filterColumns="true"
			:caption-quantity="false"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 2)">
					<app-tooltip-button
						color="primary"
						icon="cloud_download"
						text="Descargar Documento"
						@click-icon="generateTxt(props.row)"
					>
					</app-tooltip-button>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import { format } from 'date-fns';

function data() {
	const endDate = new Date();
	const startDate = new Date(endDate);
	startDate.setDate(endDate.getDate() - 30);
	return {
		rows: [],
		maxDate: null,
		params: {
			startDate: startDate.toISOString().split('T')[0],
			endDate: endDate.toISOString().split('T')[0],
			batDocumentIds: [],
		},
		batDocuments: [
			{ id: 1, name: 'Articulos' },
			{ id: 2, name: 'Bonificaciones' },
			{ id: 3, name: 'Clientes' },
			{ id: 4, name: 'Canales' },
			{ id: 5, name: 'Devolucion' },
			{ id: 6, name: 'Stock' },
			{ id: 7, name: 'Vendedor' },
			{ id: 8, name: 'Ventas' },
			{ id: 9, name: 'Distrito' },
		],
		currentPage: 1,
		columns: [
			{
				id: 1,
				name: 'Nombre del Documento',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
	};
}

function created() {
	const docs = [...this.batDocuments];
	docs.pop();
	this.rows = docs;
}

function setParams({ model, value }) {
	this.params[model] = value;
}

export default {
	name: '',
	created,
	components: {
		appTable,
		headerPage,
	},
	data,
	methods: {
		setParams,
		setDate({ model, value }) {
			this.params[model] = format(value, 'YYYY-MM-DD');
			if (model === 'startDate') {
				this.params.endDate = null;
			}
			const date = new Date(this.params.startDate);
			date.setDate(date.getDate() + 6);
			this.maxDate = date.toISOString().split('T')[0];
		},
		async generateTxt(doc) {
			const body = {
				date: new Date().toISOString().slice(0, 10),
				startDate: this.params.startDate || undefined,
				endDate: this.params.endDate || undefined,
			};
			try {
				const response = await this.$httpSales.post(
					`sale-bat-distributors/${doc.id}`,
					body
				);
				this.downloadTxtFile(response.data.url);
			} catch (err) {
				if (err.status === 400) {
					this.showGenericError(err.data.message);
				} else {
					this.showGenericError();
				}
			}
		},
		async downloadTxtFile(url) {
			const newWindow = window.open('', '_blank');
			const a = newWindow.document.createElement('a');
			a.href = url;
			a.download = 'fileName';
			newWindow.document.body.appendChild(a);
			a.click();
		},
		onCleanData() {
			this.params = {
				startDate: null,
				endDate: null,
			};
			this.maxDate = null;
		},
	},
};
</script>
