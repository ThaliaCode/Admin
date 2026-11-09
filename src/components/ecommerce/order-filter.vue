<template>
	<div>
		<v-layout wrap>
			<v-flex
				mt-1
				xs12
				v-for="(item, index) in items"
				:key="item.id"
				class="filter-by-row"
			>
				<v-checkbox
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs12 pl-2 px-2>
				<app-select
					deletable-chips
					chips
					multiple
					label="Vendedor"
					item-text="name"
					item-value="id"
					model="employeeIds"
					:items="sellers"
					:item="employeeIds"
					@input="$emit('on-input', $event)"
				/>
			</v-flex>
			<v-flex xs12 mt-2 pl-2 px-2>
				<app-select
					label="Repartidor"
					item-text="name"
					item-value="id"
					model="deliveryId"
					:items="distributors"
					:item="deliveryId"
					:return-object="false"
					@input="$emit('on-input', $event)"
				/>
			</v-flex>
			<v-flex xs12 mt-2 pl-2 px-2>
				<app-select
					label="Agencia de Transporte"
					item-text="name"
					item-value="id"
					model="transportAgencyId"
					:items="transports"
					:item="transportAgencyId"
					:return-object="false"
					@input="$emit('on-input', $event)"
				/>
			</v-flex>
			<v-flex xs12 mt-2 pl-2 px-2>
				<label class="caption">Fecha de entrega</label>
				<date-component
					:date="deliveryDateParams"
					icon="/static/img/calendar.svg"
					@on-input="
						$emit('on-input', { model: 'deliveryDate', value: $event })
					"
				></date-component>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('apply-filter', items)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import dateComponent from '@/components/shared/date-component';

function created() {
	this.employeeIds = this.sellersParams;
	this.deliveryId = this.deliveryParams;
	this.transportAgencyId = this.transportParams;
	this.items = this.items.map((i) => {
		const newI = { ...i };
		const arrayP = Object.keys(this.params);
		if (arrayP.includes(i.filter)) {
			newI.value = this.params[i.filter];
		}
		return newI;
	});
}

function data() {
	return {
		items: [
			{
				id: 1,
				name: 'Convertidos a Ventas',
				value: 0,
				filter: 'flagSale',
			},
			{
				id: 2,
				name: 'Pedidos Cancelados',
				value: 0,
				filter: 'flagShowCancel',
			},
		],
	};
}
export default {
	name: 'order-filter',
	data,
	created,
	components: {
		modalSidebarButton,
		dateComponent,
	},
	props: {
		params: {
			type: Object,
			default: () => {},
		},
		sellers: {
			type: Array,
			default: () => [],
		},
		distributors: {
			type: Array,
			default: () => [],
		},
		transports: {
			type: Array,
			default: () => [],
		},
		sellersParams: {
			type: Array,
			default: () => [],
		},
		deliveryParams: [String, Number],
		transportParams: [String, Number],
		deliveryDateParams: [String],
	},
};
</script>
<style lang="scss" scoped>
.filter-by-row {
	&:nth-child(even) {
		background: map-get($colors, background-even-modal);
	}
}
</style>
