<template>
	<div class="mb-5 pb-5">
		<header-page
			column-class="xs12"
			justify-class="justify-start"
			:show-clean="false"
			:show-excel="false"
			:title="title"
			to-show
		>
			<v-flex v-if="false">
				<v-layout wrap justify-end align-center class="lh-regular">
					<span>
						<span class="value-text">{{ totalDevices }}</span>
						<span class="caption">Dispositivos</span>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Total de Compras</label>
						<p class="value-text ma-0 text-xs-center">S/. 4.500,00</p>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Total de Ventas</label>
						<p class="value-text ma-0 text-xs-center">S/. 10.250,00</p>
					</span>
					<span class="px-2"> | </span>
					<app-select
						append-icon="keyboard_arrow_down"
						class="border-select select-outline border-outline"
						content-class="content-outline"
						:item="item"
						item-text="name"
						item-value="id"
						:items="items"
						place-holder="Valores"
						model="item"
						@input="setData"
					></app-select>
				</v-layout>
			</v-flex>
		</header-page>
		<v-layout row wrap>
			<v-flex xs6 text-xs-center>
				<button
					type="button"
					:class="[
						'tab-button',
						activeDevices ? 'tab-button-active' : 'tab-button-notactive',
					]"
					@click="changeTab('active')"
				>Dispositivos en Uso ({{numberActiveDevice}})</button>
			</v-flex>
			<v-flex xs6 text-xs-center>
				<button
					type="button"
					:class="[
						'tab-button',
						notActiveDevices ? 'tab-button-active' : 'tab-button-notactive',
					]"
					@click="changeTab('notActive')"
				>Dispositivos Desconectados ({{numberNotActiveDevice}})</button>
			</v-flex>
		</v-layout>
		<v-layout wrap py-3 v-if="!isLoading">
			<v-flex
				xs3 px-3 mb-3
				v-for="salePoint in salePointsFiltered"
				:key="salePoint.id"
			>
				<dashboard-card
					sale-point
					show-btn-off
					:btn-off="activeDevices"
					:details="[]"
					:rows="[]"
					:title="salePoint.name"
					:users="salePoint.employees"
					:id-point="salePoint.id"
					@open-users="openUsers"
				></dashboard-card>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				:img="false"
				padding-success="px-5"
				success-color="primary"
				success-text="Atrás"
				@accept-button-clicked="goBack"
			/>
		</section>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal">
				<users
					:customers="customers"
					:users="usersSelect"
					:id-point="idPointSelect"
					v-if="action.code === 'users'"
					@close-modal="cancelModal"
					@update="updateLoad"/>
		</action-sidebar>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';
	import dashboardCard from '@/components/dashboard/by-subsidiary/dashboard-card';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import actionSidebar from '@/components/shared/action-sidebar';
	import users from '@/components/dashboard/users';

	function created() {
		this.isLoading = true;
		this.loadData();
		this.loadCustomers();
	}

	async function loadData() {
		const params = {
			comSubsidiariesId: this.$route.params.subsidiaryId,
			warWarehousesId: this.$route.params.warehouseId,
		};
		({ data: this.salePoints } = await this.$httpSales.get('terminals-dashboard', { params }));
		this.isLoading = false;
	}

	function setData({ model, value }) {
		this[model] = value;
	}

	function title() {
		const parseSubName = this.subsidiaryName.split('-').join(' ').toLowerCase();
		const warehouseName = this.warehouseName.split('-').join(' ').toLowerCase();
		return `${this.$route.meta.title} > ${parseSubName} > ${warehouseName}`;
	}

	function numberActiveDevice() {
		return this.salePointsActive.length;
	}

	function numberNotActiveDevice() {
		return this.salePointsNotActive.length;
	}

	function totalDevices() {
		return 10;
	}

	function changeTab(label) {
		this.activeDevices = label === 'active';
		this.notActiveDevices = label === 'notActive';
	}

	function salePointsFiltered() {
		return this.activeDevices ? this.salePointsActive : this.salePointsNotActive;
	}

	function salePointsActive() {
		return this.salePoints.filter(
			s => s.employees
			&& s.employees.length > 0 && s.employees.some(d => d.devices),
		);
	}

	function salePointsNotActive() {
		return this.salePoints.filter(
			s => !s.employees
			|| (s.employees && s.employees.length === 0)
			|| (s.employees && s.employees.every(d => !d.devices)),
		);
	}

	function goBack() {
		this.$router.back();
	}

	function openUsers(warehouse, listUsers, id) {
		this.usersSelect = listUsers;
		this.idPointSelect = id;
		this.action.code = 'users';
		this.action.open = true;
		this.action.title = `${warehouse}-usuarios`;
	}

	function cancelModal() {
		this.action.code = null;
		this.action.open = false;
		this.action.title = '';
	}

	async function loadCustomers() {
		try {
			const { data: response } = await this.$httpSales.get('employees');
			this.customers = response;
		} catch (error) {
			this.showGenericError();
		}
	}

	function updateLoad() {
		this.cancelModal();
		this.loadData();
	}

	function data() {
		return {
			activeDevices: true,
			currency: 'S/',
			item: 1,
			items: [
				{
					id: 1,
					name: 'Última semana',
				},
				{
					id: 2,
					name: 'Ayer',
				},
				{
					id: 3,
					name: 'Hoy',
				},
			],
			isLoading: false,
			notActiveDevices: false,
			totalPurchases: 100000,
			totalSales: 100000,
			salePoints: [
				{
					employees: [
						{
							devices: {
								inDate: '',
							},
						},
					],
				},
			],
			action: {
				active: false,
				code: null,
				open: false,
				title: '',
				width: 508,
			},
			usersSelect: [],
			customers: [],
			idPointSelect: null,
		};
	}

	export default {
		name: 'pages-sale-point-dashboard',
		components: {
			headerPage,
			dashboardCard,
			modalSidebarButton,
			actionSidebar,
			users,
		},
		computed: {
			numberActiveDevice,
			numberNotActiveDevice,
			salePointsActive,
			salePointsFiltered,
			salePointsNotActive,
			title,
			totalDevices,
		},
		created,
		data,
		methods: {
			changeTab,
			goBack,
			loadData,
			setData,
			openUsers,
			cancelModal,
			loadCustomers,
			updateLoad,
		},
		props: {
			subsidiaryName: String,
			warehouseId: [Number, String],
			warehouseName: String,
		},
	};
</script>

<style lang="scss" scoped>
	span {
		line-height: 1;
	}

	.value-text {
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium);
	}

	p.value-text {
		font-size: size(medium16);
	}

	.tab-button {
		font-size: size(small);
		height: 38px;
		width: 100%;
		font-family: font(open-bold);
	}

	.tab-button-active {
		color: color(primary);
	}

	.tab-button-notactive {
		color: color(grey-border);
	}
</style>