<template>
	<div class="container-table-action">
		<v-layout wrap class="background-actions-blue">
			<v-flex xs8>{{ dataSelect.warehouse ?  dataSelect.warehouse.name : null }}</v-flex>
			<v-flex xs3>{{ dataSelect.createdAt | exactDate }}</v-flex>
			<v-flex xs1>
				<button class="border-white" @click="$emit('close-detail')">
					<v-icon color="white">close</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout wrap class="wrapper-list-total">
			<v-flex mb-2 v-if="dataSelect.quantityIn !== 0" :class="byProduct ? 'xs6' : 'xs12'">
				<v-layout wrap>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="font-blue right-blue center"
					>
						ENTRADAS
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="right-blue center"
					>
						<span class="font-sky">Cant</span> {{ dataSelect.quantityIn || 0 }}
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="right-blue center"
						v-if="!byProduct"
					>
						<span class="font-sky">Costo:</span> {{ option(dataSelect.priceCost, 1, dataSelect.operation) }}
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="center"
						v-if="!byProduct"
					>
						<span class="font-sky">Total:</span> {{ option(dataSelect.total, 1, dataSelect.operation) }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mb-2 v-if="dataSelect.quantityOut !== 0" :class="byProduct ? 'xs6' : 'xs12'">
				<v-layout wrap>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="font-blue right-blue center"
					>
						SALIDAS
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="right-blue center"
					>
						<span class="font-sky">Cant:</span> {{ dataSelect.quantityOut || 0 }}
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="right-blue center"
						v-if="!byProduct"
					>
						<span class="font-sky">Costo:</span> {{ option(dataSelect.priceCost, 0, dataSelect.operation) }}
					</v-flex>
					<v-flex
						:class="byProduct ? 'xs6' : 'xs3'"
						class="center"
						v-if="!byProduct"
					>
						<span class="font-sky">Total:</span> {{ option(dataSelect.total, 0, dataSelect.operation) }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex :class="byProduct ? 'xs6' : 'xs12'">
				<v-layout>
					<v-flex
						class="font-blue right-blue center"
						:class="byProduct ? 'xs6' : 'xs3'"
					>
						SALDOS
					</v-flex>
					<v-flex
						class="right-blue center"
						:class="byProduct ? 'xs6' : 'xs3'"
					>
						<span class="font-sky">Cant:</span> {{ dataSelect.balanceQuantity || 0}}
					</v-flex>
					<v-flex
						class="right-blue center"
						:class="byProduct ? 'xs6' : 'xs3'"
						v-if="!byProduct"
					>
						<span class="font-sky">Costo:</span> {{ dataSelect.balanceCost || 0 }}
					</v-flex>
					<v-flex
						class="center" v-if="!byProduct"
						:class="byProduct ? 'xs6' : 'xs3'"
					>
						<span class="font-sky">Total:</span> {{ dataSelect.balanceTotal || 0 }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<div class="row-table-action">
			<div class="item-action item-action-block">
				<p class="item-header item-header-block">Referencia:</p>
				<button 
					@click="$emit('go-to-reference', dataSelect)" 
					class="btn-link item-body item-body-block"
					v-if="isLink(dataSelect.moduleName)">{{ dataSelect.documentNumber }}</button>
				<span class="text-gray" v-else>{{ dataSelect.documentNumber }}</span>
			</div>
			<div class="item-action item-action-block">
				<p class="item-header item-header-block">Tipo Doc.:</p>
				<p class="item-body item-body-block">{{ dataSelect.documentType }}</p>
			</div>
			<p class="item-action">
				<span class="item-header">Origen:</span>
				<span class="text-gray item-body">{{ dataSelect.moduleName }}</span>
			</p>
			<v-layout row wrap>
				<v-flex xs6 pr-1>
					<p class="item-action">
						<span class="item-header">Nro:</span>
						<span class="text-gray item-body">{{ dataSelect.documentNumber }}</span>
					</p>
				</v-flex>
				<v-flex xs6 pl-1>
					<p class="item-action">
						<span class="item-header">Cant:</span>
						<span class="text-gray item-body">{{ dataSelect.quantityIn + dataSelect.quantityOut }}</span>
					</p>
				</v-flex>
				<v-flex xs6 pr-1>
					<p class="item-action">
						<span class="item-header">Costo:</span>
						<span class="text-gray item-body">{{ dataSelect.priceCost }}</span>
					</p>
				</v-flex>
				<v-flex xs6 pl-1>
					<p class="item-action">
						<span class="item-header">Precio:</span>
						<span class="text-gray item-body">{{ dataSelect.price }}
							<span class="value-info" v-if="dataSelect.additionalInformation &&
								dataSelect.additionalInformation.flagFree === 1">- GRATIS</span>
						</span>
					</p>
				</v-flex>
			</v-layout>
			<p class="item-action">
				<span class="item-header">Client./Prov.:</span>
				<span class="text-gray item-body">{{ dataSelect.entityName }}</span>
			</p>
			<p class="item-action">
				<span class="item-header">Empleado:</span>
				<span class="text-gray item-body">{{ dataSelect.userName }}</span>
			</p>
		</div>
	</div>	
</template>
<script>

function option(model, number, numbeData) {
	if (number === numbeData) {
		return model || 0;
	}
	return 0;
}

function isLink(moduleName) {
	return moduleName === 'INVENTARIO' || moduleName === 'INGRESO' || moduleName === 'VENTAS' || moduleName === 'TRANSFERENCIA';
}

export default {
	name: 'detail-kardex',
	methods: {
		isLink,
		option,
	},
	props: {
		byProduct: {
			default: false,
			type: Boolean,
		},
		dataSelect: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
	.background-actions-blue {
		background-color: color(primary);
		color: map-get($colors, white);
		font-family: map-get($fonts, open-semibold);
		font-size: 14px;
		height: 40px;
		padding: 9px 12px;
	}

	.border-white {
		border-left: 1px solid map-get($colors, white);
		padding-left: 6px;
	}

	.wrapper-list-total {
		border: 1px solid map-get($colors, blue-grey);
		font-size: 12px;
		padding: 6px 0;
	}

	.font-blue {
		color: map-get($colors, background-sidebar);
		font-weight: 900;
	}

	.right-blue {
		border-right: 1px solid map-get($colors, blue-grey);
	}

	.font-sky {
		color: map-get($colors, primary);
	}

	.center {
		text-align: center;
	}

	.row-table-action {
		background-color: map-get($colors, white);
		border: 1px solid map-get($colors, blue-grey);
		border-radius: 0 0 19px 0;
		border-top: 0px;
		padding: 13px;
	}

	.item-action {
		color: map-get($colors, paginationText);
		background: map-get($colors, stepper-content);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, small13);
		height: 30px;
		margin-bottom: 12px;

		&-block {
			height: auto;
		}
	}

	.btn-link {
		border-bottom: 1px solid map-get($colors, primary);
		color: map-get($colors, primary);
	}

	.text-gray {
		color: map-get($colors, paginationText);
		font-size: size(small11);
	}

	.item-header {
		background: map-get($colors, blue-grey);
		color: map-get($colors, background-sidebar);
		display: inline-block;
		height: 100%;
		padding: 5px 10px;
		width: 40%;

		&-block {
			margin: 0px;
			width: 100%;
		}
	}

	.item-body {
		display: inline-block;
		padding: 5px 10px;

		&-block {
			display: block;
			text-align: left;
			width: 100%;
		}
	}
</style>