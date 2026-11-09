<template>
	<div>
		<header-page
		emit-excel
		to-show
		:show-clean="false"
		:title="$route.meta.title"
		@emit-excel="emitExcel"
		:excel-loading="isLoading"
		/>
		<v-layout row wrap px-5 mt-5>
			<v-flex xs4 mr-1>
				<p><span class="label">Compañía: </span>{{company}}</p>
				<p><span class="label">Tipo: </span>{{row.typeDocument ? row.typeDocument.name : null}}</p>
				<p><span class="label">Alm. de Origen: </span>{{row.warehouseOrigin ? row.warehouseOrigin.name : null}}</p>
			</v-flex>
			<v-flex xs4>
				<p><span class="label">#Serie: </span>{{row.serie}}-{{row.number}}</p>
				<p><span class="label">Motivo: </span>{{row.observations}}</p>
				<p><span class="label">Alm. de Destino: </span>{{row.warehouseDestination ? row.warehouseDestination.name : null}}</p>
			</v-flex>
		</v-layout>
		<table-tracking 
			class="px-5 mt-5"
			:status="status"
			:type="type"
			:details="details"
			:total="total"
			:employees="employees"
			:warehouses="warehouses"/>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import tableTracking from '@/components/transfers/table-tracking';
import helper from '@/shared/helper';

function created() {
	this.loadData();
	this.status = Number(this.$route.query.status);
	this.type = this.$route.query.type;
	this.company = helper.getLocalData('admin-user').company.companyName;
}

async function loadData() {
	try {
		const { data: response } = await this.$httpProducts.get(`transfers/${this.id}`);
		this.row = response;
		let totalDelivery = 0;
		this.details = response.details.map((d) => {
			const newDetail = { ...d };
			if (Number(this.$route.query.status) === 2) {
				newDetail.delivery = 0;
				totalDelivery = 0;
			} else {
				newDetail.delivery = d.clearanceAmountSent - d.devolution;
				totalDelivery = newDetail.delivery + totalDelivery;
			}
			return newDetail;
		});
		response.totalDetails.totalDelivery = totalDelivery;
		this.total = response.totalDetails;
		this.employees = {
			createdUserName: response.createdUserInfo ? response.createdUserInfo.name : null,
			createdAt: helper.exactDate(response.createdAt),
			clearanceUserName: response.clearanceUserInfo ? response.clearanceUserInfo.name : null,
			clearanceDate: helper.exactDate(response.clearanceDate),
			deliveryUserName: response.deliveryUserInfo ? response.deliveryUserInfo.name : null,
			deliveryDate: response.deliveryDate ? helper.exactDate(response.deliveryDate) : null,
		};
		this.warehouses = {
			origin:	response.warehouseOrigin ? response.warehouseOrigin.code : null,
			destination: response.warehouseDestination ? response.warehouseDestination.code : null,
		};
	} catch (error) {
		this.showGenericError();
	}
}

async function emitExcel() {
	try {
		const codeReport = 'movement-product';
		const prefixName = 'reporte_tracking';
		this.onEmitExcel(codeReport, prefixName);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		isLoading: false,
		row: {},
		status: null,
		type: null,
		details: [],
		total: {},
		company: null,
		employees: {},
		warehouses: {},
	};
}

export default {
	name: 'transfers-tracking',
	components: {
		headerPage,
		tableTracking,
	},
	created,
	data,
	methods: {
		emitExcel,
		loadData,
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.label {
		color: map-get($colors, background-sidebar);
		font-family: map-get($fonts, open-semibold);
	}
</style>

