<template>
	<div>
		<header-page
			name="documents"
			title="Documentos"
		>
		</header-page>
		<v-layout row align-end px-4 pt-2>
			<v-flex>
				<app-select
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					label="Empresa"
					model="subsidiaryId"
					:item="params.subsidiaryId"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<v-flex ml-2>
				<app-date-select
					label="Fecha Inicio"
					model="startDate"
					:date-formatted="params.startDate"
					@input="setParams"
				/>
			</v-flex>
			<v-flex ml-2>
				<app-date-select
					label="Fecha Fin"
					model="endDate"
					:date-formatted="params.endDate"
					@input="setParams"
				/>
			</v-flex>
			<v-flex ml-2>
				<v-btn
					class="btn-action mr-3"
					color="primary"
					@click="loadData"
				>
					Buscar
				</v-btn>
			</v-flex>
		</v-layout>
		<documents-list
			:rows="documents"
			:last-page="lastPage"
			@on-page="onPage"
		>
		</documents-list>
	</div>
</template>

<script>
import { subDays, format } from 'date-fns';
import headerPage from '@/components/shared/header-page';
import documentsList from '@/components/documents/documents-list';
import generalFilter from '@/components/shared/general-filter';

function data() {
	return {
		documents: [],
		lastPage: 1,
		params: {
			endDate: null,
			subsidiaryId: null,
			limit: 10,
			startDate: null,
			page: 1,
		},
		subsidiaries: [],
	};
}

async function loadData() {
	const { data: documents, headers } = await this.$httpReports.get('documents', { params: this.params });
	this.lastPage = Number(headers['x-last-page']);
	this.documents = documents.map(doc =>
		({
			createdAt: doc.createdAt,
			comment: doc.comment,
			email: doc.user.email,
			filename: doc.filename,
			status: doc.status,
			statusName: doc.statusName,
			urlFile: doc.urlFile,
		}),
	);
}

function created() {
	this.params.startDate = format(subDays(this.$today(), 15), 'YYYY-MM-DD');
	this.params.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.loadData();
	this.loadSubsidiaries();
}

async function loadSubsidiaries() {
	try {
		const response = await this.$httpSales.get('subsidiaries');
		this.subsidiaries = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.params.page = page;
	this.loadData();
}

function setParams({ model, value }) {
	if (model === 'subsidiaryId') {
		this.params[model] = value;
	} else {
		this.params[model] = format(value, 'YYYY-MM-DD');
	}
}

export default {
	name: 'pages-documents',
	created,
	components: {
		documentsList,
		headerPage,
		generalFilter,
	},
	data,
	methods: {
		loadData,
		loadSubsidiaries,
		onPage,
		setParams,
	},
};
</script>
