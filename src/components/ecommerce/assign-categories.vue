<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12>
				<v-select
					autocomplete
					:items="categories"
					v-model="categoriesItem"
					item-text="relationalName"
					item-value="id"
					label="Categorías"
					multiple
					chips
					solo
				></v-select>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save', categoriesItem)"
			/>
		</section>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadCategories();
	}

	async function loadCategories() {
		const params = {
			commerceId: this.$route.params.commerceId,
		};
		try {
			if (this.$route.params.commerceId) {
				({ data: this.categories } = await this.$httpProducts.get('e-categories', { params }));
			} else {
				({ data: this.categories } = await this.$httpProducts.get('e-categories'));
			}
			if (this.categoriesSelected.length > 0) {
				this.setData([...this.categoriesSelected]);
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function setData(values) {
		if (values) {
			this.categoriesItem = [...values];
		}
	}

	function data() {
		return {
			categories: [],
			categoriesItem: [],
		};
	}

	export default {
		name: 'assign-categories',
		components: {
			autocompleteComponent,
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			loadCategories,
			setData,
		},
		props: {
			categoriesSelected: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
