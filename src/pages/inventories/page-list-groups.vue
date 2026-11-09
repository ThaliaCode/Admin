<template>
	<div>
		<header-page
			name="list-groups"
			:title="$route.meta.title"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				name="list-group"
				:columns="columns"
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props" class="is-not-selectable">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.nameTypeIn }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.nameTypeOut }}</td>
					<td v-show="showRow(columns, 5)" class="w-14">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="editGroup(props.row)"
							>
								<v-icon color="success">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="openConfirmDelete(props.row)"
							>
								<v-icon color="error">delete</v-icon>
							</v-btn>
							<span>Eliminar</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteGroup"
					>
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get('groups', { params: this.params });
		this.data = response.data.map((r) => {
			const newData = { ...r };
			newData.nameTypeIn = r.typeIn.map(n => n.name).join(' , ');
			newData.nameTypeOut = r.typeOut.map(n => n.name).join(' , ');
			return newData;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	}
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
	this.groupId = id;
}

function closeDialog() {
	this.dialog = false;
	this.groupId = null;
}

async function deleteGroup() {
	try {
		await this.$httpProducts.delete(`groups/${this.groupId}`);
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError('Error');
	}
}

function runAction({ code }) {
	if (code === 'new-container') {
		this.goTo('group-inventory-new');
	}
}

function editGroup({ id }) {
	this.goTo('group-inventory-edit', { params: { id } });
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Entradas', value: 'entry', visible: true, checked: true },
			{ id: 4, name: 'Salidas', value: 'output', visible: true, checked: true },
			{ id: 5, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		currentPage: 1,
		data: [],
		dialog: false,
		lastPage: 0,
		groupId: null,
		dialogMessage: '',
		params: {
			page: '',
		},
	};
}
export default {
	name: 'list-groups',
	components: {
		appActions,
		appTable,
		headerPage,
	},
	created,
	data,
	methods: {
		changePage,
		closeDialog,
		deleteGroup,
		editGroup,
		loadData,
		openConfirmDelete,
		runAction,
	},
};
</script>
<style lang="scss" scoped>
	.w-14 {
		width: 14%;
	}
</style>