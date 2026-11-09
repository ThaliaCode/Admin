<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="mt-4">
			<v-layout ml-5 mt-5>
				<v-layout row d-flex justify-space-around>
					<v-flex xs5>
						<label class="title-transfers-detail">Compañia: <span class="gray-detail">{{product.company}}</span></label>
					</v-flex>
					<v-flex>
						<label class="title-transfers-detail">#Serie: <span class="gray-detail">{{product.serie}}</span></label>
					</v-flex>
				</v-layout>
			</v-layout>
			<v-layout row d-flex ml-5 mt-2>
				<v-flex xs5>
					<label class="title-transfers-detail">Tipo: <span class="gray-detail">{{product.type}}</span></label>
				</v-flex>
				<v-flex>
					<label class="title-transfers-detail">Motivo: <span class="gray-detail">{{product.reason}}</span></label>
				</v-flex>
			</v-layout>
			<v-layout mt-2 ml-5 d-flex justify-space-around>
				<v-flex xs5>
					<label class="title-transfers-detail">Empleado: <span class="gray-detail">{{product.employee}}</span></label>
				</v-flex>
				<v-flex ml-2>
					<label class="title-transfers-detail">Alm. de Origen: <span class="gray-detail">{{product.warehouse}}</span></label>
					<label class="title-transfers-detail ml-5">Alm. de Destino: <span class="gray-detail">{{product.destiny}}</span></label>
				</v-flex>
			</v-layout>
		</div>
		<div class="mt-5 ml-2">
			<table-transfers-detail />
		</div>
	</div>    
</template>

<script>
import tableTransfersDetail from '@/components/transfers/table-transfers-detail';
import headerPage from '@/components/shared/header-page';

function data() {
	return {
		product: {
			company: '',
			serie: 234124,
			type: 'Transferencias Interna',
			reason: 'Solicitar',
			employee: 'Marcelo',
			warehouse: 'Central',
			destiny: 'Mall de Sur',
		},
	};
}

export default {
	data,
	name: 'page-new-transfers-detail',
	components: {
		headerPage,
		tableTransfersDetail,
	},
};
</script>

<style lang="scss" scoped>
.title-transfers-detail {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($fonts, medium);
}

.gray-detail {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($fonts, medium);
}
</style>
