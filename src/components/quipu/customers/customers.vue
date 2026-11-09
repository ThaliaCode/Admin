<template>
	<div>
		<header-page
			:title="this.$route.meta.title"/>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<customer-list
			:columns="columns"
			:rows="rows"
			@open-side-modal="openSideModal"/>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open">
				<contable-period v-if="action.code === 'CPE'"/>
				<contable-plan v-if="action.code === 'PLC'"/>
				<credentials-app v-if="action.code === 'CAPP'"/>
				<contable-customer-register
					v-if="action.code === 'NC'"
					@close-modal="cancelModal"
					:edit-user="editCustomerData"
					:edit-data="editCustomerData" />
		</action-sidebar>
		<router-view></router-view>
	</div>
</template>

<script>
	import appActions from '@/components/shared/app-actions';
	import actionSidebar from './../../shared/action-sidebar';
	import customerList from './components/customer-list';
	import headerPage from './../../shared/header-page';
	import contablePlan from './components/contable-plan';
	import credentialsApp from './components/credentials-app';
	import contablePeriod from './components/contable-period';
	import contableCustomerRegister from './components/contable-customer-register';

	function created() {
		this.loadData();
	}
	async function loadData() {
		const url = 'customer';
		try {
			({ data: this.rows } = await this.$httpQuipu.get(url));
		} catch (error) {
			this.showGenericError();
		}
	}

	function openSideModal(action, customerData = {}) {
		if (customerData.id) this.editCustomerData = { ...customerData };
		this.action = { ...action };
	}

	function cancelModal() {
		this.action = { ...this.actionDefault };
		this.loadData();
	}

	function runAction(action) {
		if (action.code === 'NC') {
			this.goTo('customers-new');
		} else {
			this.editCustomerData = {};
			this.action.active = true;
			this.action.code = action.code;
			this.action.title = action.description;
			this.action.open = true;
			this.action.width = 600;
		}
	}

	function data() {
		return {
			action: {
				active: false,
				code: '',
				title: '',
				open: false,
				width: 0,
			},
			actionDefault: {
				active: false,
				code: '',
				title: '',
				open: false,
				width: 0,
			},
			columns: [
				{ id: 1, name: 'Fecha inicio', value: 'createdAt', visible: true, checked: true },
				{ id: 2, name: 'Empresa', value: 'company', visible: true, checked: true },
				{ id: 3, name: 'RUC', value: 'ruc', visible: true, checked: true },
				{ id: 4, name: 'Teléfono', value: 'phone', visible: true, checked: true },
				{ id: 5, name: 'Correo', value: 'email', visible: true, checked: true },
				{ id: 6, name: 'Acciones', value: 'actions', visible: true, checked: true },
			],
			editCustomerData: {},
			helpItems: [],
			rows: [
				{
					id: 1,
					createdAt: '14-07-2018',
					company: { name: 'Banco Nacional de Crédito' },
					ruc: '20204565234',
					phone: '970127070',
					email: 'j@mail.com',
				},
			],
		};
	}

	export default {
		name: 'quipu-customers',
		created,
		components: {
			actionSidebar,
			appActions,
			contableCustomerRegister,
			contablePlan,
			contablePeriod,
			credentialsApp,
			customerList,
			headerPage,
		},
		data,
		methods: {
			cancelModal,
			loadData,
			openSideModal,
			runAction,
		},
	};
</script>
<style lang="scss" scoped>
.title-contable-movements {
	border-bottom: 1px solid color(blue-grey);
	font-size: size(medium);
}
</style>
