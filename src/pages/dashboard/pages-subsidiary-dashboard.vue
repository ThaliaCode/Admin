<template>
	<div>
		<header-page
			column-class="xs12"
			justify-class="justify-start"
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		>
			<v-flex v-if="false">
				<v-layout wrap justify-end align-center class="lh-regular">
					<span>
						<span class="value-text">{{ totalSubsidiaries }}</span>
						<span class="caption">{{labelSucursal(true)}}</span>
					</span>
					<span class="px-2"> | </span>
					<span>
						<span class="value-text">{{ totalWarehouses }}</span>
						<span class="caption">Locales</span>
					</span>
					<span class="px-2"> | </span>
					<span>
						<span class="value-text">{{ totalDevices }}</span>
						<span class="caption">Dispositivos</span>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Total de Compras</label>
						<p class="value-text ma-0 text-xs-center">{{ currency }} {{ totalPurchases }}</p>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Total de Ventas</label>
						<p class="value-text ma-0 text-xs-center">{{ currency }} {{ totalSales }}</p>
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
		<v-layout wrap py-3>
			<v-flex
				xs3 px-3 mb-3
				v-for="subsidiary in subsidiaries"
				:key="subsidiary.id"
			>
				<dashboard-card
					icon="/static/img/subsidiary-icon.svg"
					:title="subsidiary.sucursalName"
					:rows="subsidiary.rows"
					@on-click="goDetails(subsidiary)"
				></dashboard-card>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';
	import dashboardCard from '@/components/dashboard/by-subsidiary/dashboard-card';

	function created() {
		this.loadData();
	}

	async function loadData() {
		try {
			({ data: this.subsidiaries } = await this.subsidiariesList());
			this.totalSubsidiaries = this.subsidiaries.length;
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function setData({ model, value }) {
		this[model] = value;
	}

	function setRows(subsidiary) {
		return [
			{
				id: 1,
				title: 'Locales',
				total: subsidiary.warehouses,
				warehouses: true,
				warehousesClose: (subsidiary.warehouses / 2),
				warehousesOpen: (subsidiary.warehouses / 2),
			},
			{
				id: 2,
				title: 'Dispositivos',
				devices: true,
				devicesOnline: (subsidiary.devices / 2),
				devicesOffline: (subsidiary.devices / 2),
				total: subsidiary.devices,
			},
			{
				id: 3,
				title: 'Usuarios',
				total: subsidiary.users,
			},
			{
				id: 4,
				amount: subsidiary.PEN.sales,
				title: 'Ventas (S/)',
				total: subsidiary.PEN.quantitySales || 0,
			},
			{
				id: 5,
				amount: subsidiary.USD.sales,
				title: 'Ventas ($)',
				total: subsidiary.USD.quantitySales || 0,
			},
			{
				id: 6,
				amount: subsidiary.PEN.purchases,
				title: 'Compras (S/)',
				total: subsidiary.PEN.quantityPurchases || 0,
			},
			{
				id: 7,
				amount: subsidiary.USD.purchases,
				title: 'Compras ($)',
				total: subsidiary.USD.quantityPurchases || 0,
			},
		];
	}

	function goDetails(sub) {
		const params = {
			id: sub.id,
			subsidiaryName: sub.sucursalName.split(' ').join('-'),
		};
		this.goTo('dashboard-warehouses', { params });
	}

	function data() {
		return {
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
			subsidiaries: [],
			totalDevices: 15,
			totalPurchases: 100000,
			totalSales: 100000,
			totalSubsidiaries: 0,
			totalWarehouses: 10,
		};
	}

	export default {
		name: 'pages-subsidiary-dashboard',
		components: {
			dashboardCard,
			headerPage,
		},
		created,
		data,
		methods: {
			goDetails,
			loadData,
			setData,
			setRows,
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
</style>