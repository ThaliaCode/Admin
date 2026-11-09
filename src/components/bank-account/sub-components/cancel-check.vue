<template>
	<v-container>
		<app-table
		:inputSearch="false"
		:filterColumns="false"
		:columns="columns"
		:rows="rows"
		:currentPage="currentPage"
		@on-page="changePage"
		class="is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">{{ props.row.createdAt}}</td>
				<td>{{ props.row.number}}</td>
				<td>{{ props.row.bankAccount.currencySymbol }} {{ props.row.amount}}</td>
				<td>{{ props.row.status }}</td>
				<td>
					<v-tooltip top v-if="props.row.statusId === 1">
						<v-btn
							flat
							icon
							slot="activator"
							@click="cancelCheck(props.row)">
							<v-icon
								color="error">not_interested</v-icon>
						</v-btn>
						<span>Anular cheque</span>
					</v-tooltip>
					<v-tooltip top v-else>
						<v-btn
							flat
							icon
							slot="activator"
							@click="activateCheck(props.row)">
							<v-icon
								color="primary">undo</v-icon>
						</v-btn>
						<span>Activar cheque</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="true"
				@cancel-button-clicked="closeModal"/>
		</section>
	</v-container>
</template>

<script>
import appTable from './../../shared/table/app-table';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		({ data: this.rows } = await this.getChecks(this.params));
		this.rows = this.rows.map((ch) => {
			const newCh = { ...ch };
			newCh.status = ch.statusId === 1 ? 'Activo' : 'Anulado';
			return newCh;
		});
	} catch (error) {
		this.showGenericError();
	}
}

async function cancelCheck({ id }) {
	const url = `check-cancel/${id}`;
	try {
		await this.$httpSales.patch(url);
		this.showNotification('Cheque anulado');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

async function activateCheck(check) {
	const url = `check/${check.id}`;
	const body = {
		checkSerieId: check.id,
		statusId: check.statusId === 1 ? 0 : 1,
		bankAccountId: check.bankAccountId,
		issueDate: check.issueDate,
		checkDate: check.checkDate,
		personDocument: check.personDocument,
		personType: check.personType,
		personName: check.personName,
		number: check.number,
		amount: check.amount,
		amountPenalty: check.amountPenalty,
		documentNumber: check.documentNumber,
		description: check.description,
	};
	try {
		await this.$httpSales.patch(url, body);
		this.showNotification('Cheque activado');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function closeModal() {
	this.$emit('close-modal');
}

function changePage(page) {
	this.currentPage = page;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'F. emisión', value: 'emittingDate', visible: true, checked: true },
			{ id: 2, name: 'N cheque', value: 'check', visible: true, checked: true },
			{ id: 3, name: 'Monto', value: 'amount', visible: true, checked: true },
			{ id: 4, name: 'Estado', value: 'status', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		params: {
			page: 1,
		},
		rows: [],
	};
}

export default {
	name: 'cancel-check',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		activateCheck,
		cancelCheck,
		changePage,
		closeModal,
		loadData,
	},
};
</script>

