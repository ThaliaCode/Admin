<template>
	<div class="warehouse">
		<header-page
			:title="this.$route.meta.title"
		/>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout>
			<v-flex xs12 mt-4 pt-4>
				<app-table
					name="countable-auxiliary"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					class="is-not-selectable"
					>
						<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">{{ props.row.name }}</td>
						<td>{{props.row.ruc}}</td>
						<td>{{props.row.phone}}</td>
						<td>{{props.row.mail}}</td>
						<td>
							<v-btn
								class="table-icon blue--text"
								icon
								@click.prevent="openAsignClient"
							>
								<v-icon
								color="primary"
								>
									done
								</v-icon>
							</v-btn>
							<v-btn
								class="table-icon blue--text"
								icon
								@click.prevent="openNewCountable"
							>
								<v-icon
								color="primary"
								>
									edit
								</v-icon>
							</v-btn>
							<v-btn
								class="table-icon red--text"
								icon
								@click="deleteCountable"
							>
								<v-icon>
									delete
								</v-icon>
							</v-btn>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:active="action.active"
			:value="action.open"
			:width="action.width"
			:help-actions="actionsToHelp"
			:code-action="action.code"
			@close-modal="closeModal"
		>
			<new-countable
				v-if="actionNewCountable"
				@close-modal="closeModal"
			/>
			<asign-client
				v-if="actionAsignClient"
				@close-modal="closeModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import appActions from '@/components/shared/app-actions';
	import { required } from 'vuelidate/lib/validators';
	import actionSidebar from './../shared/action-sidebar';
	import appTable from './../shared/table/app-table';
	import asignClient from './asign-client';
	import headerPage from './../shared/header-page';
	import helpAction from './../shared/help-action';
	import newCountable from './new-countable';
	
	function created() {
		this.loadData();
	}

	function loadData() {}

	function deleteCountable() {}

	function closeModal() {
		this.action.code = '';
		this.action.open = false;
		this.action.title = '';
	}

	function actionNewCountable() {
		return this.action.code === 'NEW-COUNTABLE';
	}

	function actionAsignClient() {
		return this.action.code === 'ASIGN-CLIENT';
	}

	function isActionHelp() {
		return this.action.code === 'HELP';
	}

	function openAsignClient() {
		this.action.code = 'ASIGN-CLIENT';
		this.action.open = true;
		this.action.title = 'ASIGNAR CLIENTE';
	}

	function openNewCountable() {
		this.action.code = 'NEW-COUNTABLE';
		this.action.open = true;
		this.action.title = 'EDITAR AUXILIAR CONTABLE';
	}

	function runAction() {
		this.action.code = 'NEW-COUNTABLE';
		this.action.open = true;
		this.action.title = 'Nuevo Auxiliar Contable';
	}

	function validations() {
		return {
			countable: {
				name: {
					required,
				},
				ruc: {
					required,
				},
				phone: {
					required,
				},
				mail: {
					required,
				},
				password: {
					required,
				},
				rol: {
					required,
				},
			},
		};
	}

	function data() {
		return {
			action: {
				open: false,
				title: '',
				code: '',
				width: 600,
			},
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true },
				{ id: 2, name: 'Ruc', value: 'ruc', visible: true },
				{ id: 3, name: 'Teléfono', value: 'name', visible: true },
				{ id: 4, name: 'Correo', value: 'store', visible: true },
				{ id: 5, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			helpItems: [],
			rows: [
				{ name: 'Lewis Rose', ruc: '111 111 111', phone: 99999999, mail: 'test@mail.com' },
				{ name: 'Lewis Rose', ruc: '111 111 111', phone: 99999999, mail: 'test@mail.com' },
				{ name: 'Lewis Rose', ruc: '111 111 111', phone: 99999999, mail: 'test@mail.com' },
			],
		};
	}
	export default {
		name: 'countable-auxiliary',
		components: {
			actionSidebar,
			appTable,
			appActions,
			asignClient,
			headerPage,
			helpAction,
			newCountable,
		},
		created,
		data,
		methods: {
			deleteCountable,
			loadData,
			closeModal,
			openNewCountable,
			openAsignClient,
			runAction,
		},
		computed: {
			actionNewCountable,
			actionAsignClient,
			isActionHelp,
		},
		validations,
	};
</script>

<style lang="scss" scoped>
</style>