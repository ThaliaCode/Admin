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
						<span class="value-text">{{ totalUsers }}</span>
						<span class="caption">Usuarios</span>
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
				xs3 px-3
				v-for="warehouse in warehouses"
				:key="warehouse.id"
			>
				<dashboard-card
					icon="/static/img/warehouse-icon.svg"
					:title="warehouse.name"
					:rows="warehouse.rows"
					@on-click="onClick(warehouse)"
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
				@accept-button-clicked="goTo('dashboard')"
			/>
		</section>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';
	import dashboardCard from '@/components/dashboard/by-subsidiary/dashboard-card';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadData();
	}

	async function loadData() {
		const subsidiaryId = this.$route.params.id;
		const params = { subsidiaryId };
		({ data: this.warehouses } = await this.warehousesList(params));
	}

	function onClick({ id, name }) {
		this.goTo(
			'dashboard-sale-points',
			{ params:
				{
					subsidiaryId: this.id,
					subsidiaryName: this.subsidiaryName,
					warehouseId: id,
					warehouseName: name.split(' ').join('-'),
				},
			},
		);
	}

	function setData({ model, value }) {
		this[model] = value;
	}

	function title() {
		return `${this.$route.meta.title} > ${this.subsidiaryName.split('-').join(' ').toLowerCase()}`;
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
			totalDevices: 6,
			totalPurchases: 100000,
			totalSales: 100000,
			totalUsers: 6,
			totalWarehouses: 4,
			warehouses: [],
		};
	}

	export default {
		name: 'pages-warehouse-dashboard',
		components: {
			headerPage,
			dashboardCard,
			modalSidebarButton,
		},
		computed: {
			title,
		},
		created,
		data,
		methods: {
			loadData,
			onClick,
			setData,
		},
		props: {
			id: [Number, String],
			subsidiaryName: String,
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