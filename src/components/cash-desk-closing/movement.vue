<template>
	<div>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout row mt-5>
			<v-flex xs12>
				<app-table
					name="cash-desk-closing-movement"
					:include-filter="true"
					:current-page="currentPage"
					:last-page="lastPage"
					:columns="columns"
					:rows="data"
					@on-search-event="searching"
					@on-page="changePage"
					class="is-not-selectable">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)"
							class="is-not-selectable">{{ props.row.dateOpened | formatDate }}</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.currency }}{{ props.row.startAmount }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ employeeName(props.row.employee) }}
						</td>
						<td v-show="showRow(columns, 4)">{{ props.row.closedAt | formatDate }}</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.currency }}{{ props.row.endAmount }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{ employeeName(props.row.employee) }}
						</td>
						<td v-show="showRow(columns, 7)">
							<app-tooltip-button
								v-if="props.row.closedEmployeeId"
								color="primary"
								icon="remove_red_eye"
								text="Ver Detalle"
								@click-icon="openDetail(props.row)"
							/>
							<app-tooltip-button
								v-if="!props.row.closedEmployeeId"
								color="info"
								icon="account_balance_wallet"
								text="Cierre de Caja"
								@click-icon="openClosingCash(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<opening-cash-desk-closing
				v-if="validateOpeiningCashDeskClosing"
				@accept="loadData"
				@close-modal="closeModal"
			/>
			<closing-cash-desk
				v-if="isClosing"
				:closed-at="closedAt"
				:currencies="currencies"
				:end-amount="cashDeskSelected.endAmount"
				@accept="closeCashDesk"
				@close="closeModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format } from 'date-fns';
import appActions from '@/components/shared/app-actions';
import actionSidebar from './../shared/action-sidebar';
import appTable from './../shared/table/app-table';
import closingCashDesk from './sub-components/closing-cash-desk';
import headerPage from './../shared/app-header';
import openingCashDeskClosing from './sub-components/opening-cash-desk-closing';

function created() {
	this.loadCurrencies();
	this.loadData();
}

async function closeCashDesk({ currency }) {
	const params = {
		cashId: this.id,
		currency,
	};
	try {
		await this.$httpSales.post('cash-desk-closing/mobile', null, { params });
		this.showNotification('El cierre de caja se realizó correctamente.');
		this.closeModal();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'TRANSACTION_NOT_FOUND') {
				this.showNotification('La caja no cuenta con transacciones por cerrar.',
					'error');
			} else if (err.data.message === 'CASH_ID_NOT_FOUND') {
				this.showNotification('El código de caja no existe.',
					'error');
			} else if (err.data.message === 'CASH_DESK_CLOSING_EXIST') {
				this.showNotification('La caja ya ha sido cerrada.',
					'error');
			}
		}
	}
}

function closedAt() {
	return format(new Date(), 'YYYY-MM-DD');
}

function closeModal() {
	this.action = {
		active: false,
		code: '',
		open: false,
		title: '',
		width: 0,
	};
	this.loadData();
}

function employeeName(employee) {
	let fullName = '';
	if (employee) {
		fullName = `${employee.name} ${employee.lastname}`;
	}
	return fullName;
}

function isClosing() {
	return this.action.code === 'CCD';
}

async function loadCurrencies() {
	({ data: this.currencies } = await this.$httpSales.get('currency-company',
		{ params: { company: true } }));
}

async function loadData() {
	const params = {
		cashId: this.id,
		search: this.search,
		page: this.currentPage,
	};
	try {
		const response = await this.$httpSales.get('cash-closing', { params });
		this.data = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		this.showGenericError();
	}
}

function openClosingCash(row) {
	this.cashDeskSelected = { ...row };
	this.action = {
		active: true,
		code: 'CCD',
		open: true,
		title: 'Cierre de Caja',
		width: 444,
	};
}

function openDetail({ id, cashId }) {
	this.goTo('cash-desk-closing-transactions',
		{ params: { salCashDeskClosingId: id, cashId } });
}

function runAction({ code, name }) {
	this.action = {
		active: true,
		code,
		open: true,
		title: name,
		width: 450,
	};
}

function validateOpeiningCashDeskClosing() {
	return this.action.code === 'cash-desk-opening';
}

function searching(search) {
	this.search = search;
	const len = search.length;
	if (len > 0 && len <= 3) {
		this.showNotification(
			'Debe agregar mas de 3 caracteres continuos para la búsqueda',
			'info',
		);
	} else {
		this.loadData();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 0,
		},
		cashDeskSelected: {},
		columns: [
			{ id: 1, name: 'Fecha de Apertura', value: 'dateOpened', visible: true, checked: true },
			{ id: 2, name: 'Saldo inicial', value: 'startAmount', visible: true, checked: true },
			{ id: 3, name: 'Empleado de apertura', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Fecha de cierre', value: 'closedAt', visible: true, checked: true },
			{ id: 5, name: 'Saldo final', value: 'endAmount', visible: true, checked: true },
			{ id: 6, name: 'Empleado de cierre', value: 'name', visible: true, checked: true },
			{ id: 7, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		currencies: [],
		currentPage: 1,
		data: [],
		lastPage: 0,
		search: '',
	};
}

export default {
	name: 'cash-desk-closing-movement',
	components: {
		actionSidebar,
		appTable,
		appActions,
		closingCashDesk,
		headerPage,
		openingCashDeskClosing,
	},
	computed: {
		closedAt,
		isClosing,
		validateOpeiningCashDeskClosing,
	},
	created,
	data,
	methods: {
		closeCashDesk,
		closeModal,
		employeeName,
		loadCurrencies,
		loadData,
		openClosingCash,
		openDetail,
		runAction,
		searching,
		changePage,
	},
	props: {
		id: [Number, String],
	},
};
</script>
