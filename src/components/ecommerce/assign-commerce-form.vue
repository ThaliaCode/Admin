<template>
  <div>
	<v-flex mt-3 pr-3 pl-3>
			<v-select
				chips
				class="filter-select shadow-inset"
				:items="commerce"
				label="Comercios"
				item-text="name"
				item-value="id"
				multiple
				:item="filtersItem"
				autocomplete
				return-object
				@input="setData($event, 'filtersItem')"
				>
				<template slot="selection" slot-scope="data">
					<v-chip
						:selected="data.selected"
						:key="data.item.id"
						close
						class="chip--select-multi"
						@input="data.parent.selectItem(data.item)"
					>
					{{ data.item.name }}
					</v-chip>
				</template>
			</v-select>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button 
				@cancel-button-clicked="$emit('on-close')"
				@accept-button-clicked="$emit('on-assign', model)"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.listCommerce();
}

function mounted() {
	this.model.products = this.dataSelected.map(p => p.id);
}

function setData(value) {
	if (value) {
		this.model.commerce = value.map(v => ({ code: v.code, commerceId: v.id }));
	}
}

async function listCommerce() {
	const params = {
		search: 'mistore',
	};
	try {
		({ data: this.commerce } = await this.$httpSales.get('com-ecommerce-companies', { params }));
	} catch (error) {
		this.showNotificationError();
	}
}

function data() {
	return {
		commerceList: [],
		filtersItem: [],
		commerce: [],
		model: {
			commerce: [],
		},
	};
}

export default {
	name: 'assign-commerce',
	created,
	components: {
		modalSidebarButton,
	},
	data,
	mounted,
	props: {
		dataSelected: {
			default: () => [],
			type: Array,
		},
	},
	methods: {
		listCommerce,
		setData,
	},
};
</script>
