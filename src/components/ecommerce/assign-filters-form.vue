<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12>
				<autocomplete-component
					chips
					multiple
					append-icon="arrow_drop_down"
					clearable
					http-code="$httpProducts"
					:item="filtersItem"
					item-text="title"
					item-value="id"
					:items="filters"
					label-value="Filtros"
					placeholder="Seleccionar"
					prop="title"
					resource-url="filters"
					return-object
					@return-data="setData($event, 'filtersItem')"
				></autocomplete-component>
			</v-flex>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					@cancel-button-clicked="$emit('on-close')"
					@accept-button-clicked="$emit('on-assign', model)"
				/>
			</section>
		</v-layout>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.model.products = this.dataSelected.map(ds => ds.id);
		this.loadData();
	}

	function setData(value, modelName) {
		if (value) {
			this[modelName] = [...value];
			this.model.filters = this[modelName].map(f => f.id);
		}
	}

	async function loadData() {
		try {
			const { data: response } = await this.$httpProducts.get('filters');
			this.filters = response;
		} catch (error) {
			this.showGenericError();
		}
	}

	function data() {
		return {
			filters: [],
			filtersItem: [],
			model: {
				filters: [],
				products: [],
			},
		};
	}

	export default {
		name: 'assign-filters-form',
		components: {
			autocompleteComponent,
			modalSidebarButton,
		},
		data,
		methods: {
			setData,
			loadData,
		},
		created,
		props: {
			dataSelected: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
