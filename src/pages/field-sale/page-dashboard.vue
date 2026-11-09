<template>
	<div>
		<header-page
			column-class="xs12"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<bar-information
				label-color
				:information="info"
				:show-colon="false"
			></bar-information>
		</header-page>
		<v-layout row wrap px-4 py-3>
			<v-flex xs6 pr-2>
				<graphic-card
					category="de vendedores"
					divider
					draggable
					show-slot
					title="Top 10"
				>
					<v-layout slot="content" row wrap>
						<graphic-bar></graphic-bar>
					</v-layout>
				</graphic-card>
			</v-flex>
			<v-flex xs6 pl-2>
				<graphic-card
					category="de ventas"
					divider
					draggable
					show-slot
					title="Reporte"
				>
					<v-layout
						slot="content"
						mt-3 py-4 pl-3
						row wrap align-center
					>
						<v-flex xs6>
							<graphic-circle
								:sellers-assigned="sellersAssigned"
							></graphic-circle>
						</v-flex>
						<v-flex xs6 pr-2>
							<v-layout
								wrap align-center mb-2
								class="label-report label-report-border"
							>
								<v-flex xs12>
									Supervisores asignados
								</v-flex>
								<v-flex xs3>
									<span>{{ supervisorAssigned }}</span>
								</v-flex>
								<v-flex xs7 pl-4>
									<v-progress-linear
										color="success"
										v-model="supervisorAssigned"
									></v-progress-linear>
								</v-flex>
								<v-flex xs2 text-xs-center>
									<span class="percentage-small">43%</span>
								</v-flex>
							</v-layout>
							<v-layout wrap align-center class="label-report">
								<v-flex xs12>
									Vendedores asignados
								</v-flex>
								<v-flex xs3>
									<span>{{ sellersAssigned }}</span>
								</v-flex>
								<v-flex xs7 pl-4>
									<v-progress-linear v-model="sellersAssigned"></v-progress-linear>
								</v-flex>
								<v-flex xs2 text-xs-center>
									<span class="percentage-small">56%</span>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</graphic-card>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import barInformation from '@/components/field-sale/shared/bar-information';
	import graphicBar from '@/components/field-sale/dashboard/graphic-bar';
	import graphicCard from '@/components/field-sale/shared/graphic-card';
	import graphicCircle from '@/components/field-sale/shared/graphic-circle';
	import headerPage from '@/components/shared/header-page';

	function title() {
		return 'REPORTES';
	}

	function data() {
		return {
			info: [
				{
					id: 1,
					label: 10,
					value: 'Supervisores asignados',
				},
				{
					id: 2,
					label: '100',
					value: 'Vendedores',
				},
				{
					id: 3,
					label: 'Total de ventas',
					rowStyle: true,
					value: '$100,000',
				},
			],
			sellersAssigned: 80,
			supervisorAssigned: 20,
		};
	}

	export default {
		name: 'dashboard-vendor',
		components: {
			barInformation,
			graphicBar,
			graphicCard,
			graphicCircle,
			headerPage,
		},
		computed: {
			title,
		},
		data,
	};
</script>

<style lang="scss" scoped>
	.label-report {
		color: color(opacity-list-price);
		font-family: font(open-semibold);
		font-size: size(small);
		text-transform: uppercase;

		span {
			color: color(black-light);
			font-family: font(open-regular);
			font-size: size(medium);

			&.percentage-small {
				color: color(opacity-list-price);
				font-size: size(small10);
			}
		}

		&-border {
			border-bottom: 1px solid color(maki-grey);
		}
	}
</style>