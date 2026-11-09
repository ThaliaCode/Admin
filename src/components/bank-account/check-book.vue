<template>
	<div>
		<header-page :title="title"></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<general-filter class="mt-3">
			<v-layout row align-center justify-start>
				<v-flex xs12 md3>
					<span>Banco: </span>
					<span><b>{{bank.name}}</b></span>
				</v-flex>
				<v-flex xs12 md3>
					<span>Nro de Cuenta bancaria: </span>
					<span><b>{{bank.accountNumber}}</b></span>
				</v-flex>
			</v-layout>
		</general-filter>
		<check-book-table
			:columns="columns"
			:rows="rows"
			@check-book-selected="setCurrentCheckBook"
			@load-check-book-list="loadData"
		/>
		<action-sidebar
			:title="toogleTitle"
			v-model="open"
		>
			<new-check-book
				:current-check-book="currentCheckBook"
				@close-modal="closeModal"
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
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import checkBookTable from '@/components/bank-account/sub-components/check-book-table';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import newCheckBook from '@/components/bank-account/sub-components/new-check-book';

function created() {
	this.loadData();
}

async function loadData() {
	const params = { bankAccountId: this.$route.params.bankAccountId };
	const requests = [
		this.$httpSales.get('check-series', { params }),
	];
	([{ data: this.rows }] = await Promise.all(requests));
}

function closeModal() {
	this.open = false;
	this.currentCheckBook = {};
	this.loadData();
}

function setCurrentCheckBook(currentCheckBook) {
	this.currentCheckBook = currentCheckBook;
	this.open = true;
}

function runAction({ code }) {
	if (code === 'new-check-book') {
		this.open = true;
	}
}

function toogleTitle() {
	return this.currentCheckBook.id ? 'Actualizar Chequera' : 'Crear nueva Chequera';
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Secuencia Inicial', value: 'initSequence', visible: true, checked: false },
			{ id: 2, name: 'Secuencia Final', value: 'endSequence', visible: true, checked: false },
			{ id: 3, name: 'Monto girado', value: 'amount', visible: false, checked: false },
			{ id: 4, name: 'Acciones', value: 'actions', visible: true, checked: false },
		],
		currentCheckBook: {},
		open: false,
		rows: [],
	};
}

export default {
	name: 'check-book',
	components: {
		actionSidebar,
		appActions,
		checkBookTable,
		generalFilter,
		headerPage,
		newCheckBook,
	},
	computed: {
		toogleTitle,
	},
	created,
	data,
	methods: {
		closeModal,
		loadData,
		setCurrentCheckBook,
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

