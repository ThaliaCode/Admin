<template>
	<div>
		<header-page :title="title"></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<general-filter class="mt-3">
			<div class="bank-info">
				<div class="mr-3">
					<span>Banco: </span>
					<span><b>{{bank.name}}</b></span>
				</div>
				<div class="mr-3">
					<span>Nro de Cuenta bancaria: </span>
					<span><b>{{bank.accountNumber}}</b></span>
				</div>
				<div class="mr-3">
					<span>Serie: </span>
					<span><b>{{checkBookSerie}}</b></span>
				</div>
				<div class="vertical-divider"></div>
				<div>
					<v-select
						solo
						class="text-field select-app"
						placeholder="Estados"
						item-text="name"
						item-value="id"
						:items="states"
						v-model="statusId"
						@input="getCheckStatus"
					></v-select>
				</div>
				<v-flex xs1 ml-2>
					<v-btn
						color="error"
						class="btn-action"
						@click="clean">
						Limpiar
					</v-btn>
				</v-flex>
			</div>
		</general-filter>
		<check-table
			:columns="columns"
			:rows="rows"
			@edit-check="editingCheck"
			@re-load="loadChecks"
		/>
		<action-sidebar
			:title="slideTitle"
			:width="450"
			v-model="open"
			@close-modal="closeModal"
		>
			<new-check
				v-if="open"
				:bank="bank"
				:edit-check="editCheck"
				:check-book-serie="checkBookSerie"
				@close-modal="closeModal"
				@re-load="loadChecks"
			/>
		</action-sidebar>
		<section>
			<v-layout row align-center justify-center>
				<v-flex xs1>
					<v-btn
						type="button"
						color="success"
						class="btn-action btn-action-block"
						@click="goBack"
					>
						Atrás
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import newCheck from '@/components/bank-account/sub-components/new-check';
import checkTable from '@/components/bank-account/sub-components/chek-table';

function created() {
	this.loadResources();
}

async function loadChecks() {
	const { checkBookId } = this.$route.params;
	({ data: this.rows } = await this.$httpSales.get(
		`check?checkSerieId=${checkBookId}`,
		{ params: this.params },
	));
}

async function loadResources() {
	const { checkBookId } = this.$route.params;
	const requests = [
		this.$httpSales.get('check-status'),
		this.$httpSales.get(`check?checkSerieId=${checkBookId}`),
		this.$httpSales.get(`check-series/${checkBookId}`),
	];
	[
		{ data: this.states },
		{ data: this.rows },
		{ data: this.checkBook },
	] = await Promise.all(requests);
}

function checkBookSerie() {
	return `${this.checkBook.numberStart}-${this.checkBook.numberEnd}`;
}

function closeModal() {
	this.open = false;
	this.editCheck = {};
}

function runAction(action) {
	this.open = true;
	this.slideTitle = action.description;
}

function editingCheck(check) {
	this.runAction({ description: `Editar cheque N ${check.number}` });
	this.editCheck = { ...check };
}

function getCheckStatus(id) {
	this.params.statusId = id;
	this.loadChecks();
}

function clean() {
	this.params.statusId = null;
	this.statusId = null;
	this.loadChecks();
}

function data() {
	return {
		checkBook: {
			numberEnd: '',
			numberStart: '',
		},
		columns: [
			{ id: 1, name: 'Nro', value: 'number', visible: true, checked: false },
			{ id: 2, name: 'Nombre o Razón social', value: 'rzSocial', visible: true, checked: false },
			{ id: 3, name: 'Documento', value: 'document', visible: true, checked: false },
			{ id: 4, name: 'Doc. Referencia', value: 'documentNumber', visible: true, checked: false },
			{ id: 5, name: 'Foto de cheque', value: 'checkImage', visible: true, checked: false },
			{ id: 6, name: 'Monto', value: 'amount', visible: true, checked: false },
			{ id: 7, name: 'Estado', value: 'state', visible: true, checked: false },
			{ id: 8, name: 'Acciones', value: 'actions', visible: true, checked: false },
		],
		editCheck: {},
		open: false,
		params: {
			statusId: null,
		},
		rows: [],
		statusId: null,
		slideTitle: '',
		states: [],
	};
}

export default {
	name: 'check',
	components: {
		actionSidebar,
		appActions,
		checkTable,
		generalFilter,
		headerPage,
		newCheck,
	},
	computed: {
		checkBookSerie,
	},
	created,
	data,
	methods: {
		clean,
		closeModal,
		editingCheck,
		getCheckStatus,
		loadChecks,
		loadResources,
		runAction,
	},
	props: {
		bank: {
			default: () => {},
			type: Object,
		},
		title: {
			default: '',
			type: String,
		},
	},
};
</script>
<style lang="scss" scoped>
	.vertical-divider {
		border: 1px solid color(blue-grey);
		height: 40px;
		margin-left: 20px;
		margin-right: 20px;
		width: 1px;
	}

	.bank-info {
		align-items: center;
		color: color(blue-check);
		display: flex;
		justify-content: flex-start;
	}
</style>

