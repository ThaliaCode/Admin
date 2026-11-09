<template>
	<div>
		<v-layout wrap pa-4 align-end>
			<v-flex xs2 pr-2>
				<app-select
					:item="categoriesId"
					:items="categories"
					item-text="description"
					item-value="id"
					label="Categorías"
					model="categoriesId"
					:return-object="false"
					@input="$emit('get-params', $event)"
				></app-select>
			</v-flex>
			<v-flex xs2 px-2 v-if="rating">
				<app-select
					:item="ratingTo"
					:items="ratings"
					label="Estrellas (Hasta)"
					model="ratingTo"
					@input="$emit('get-params', $event)"
				></app-select>
			</v-flex>
			<v-flex xs4 px-2>
				<products-search-input
					id="searcher-e-product"
					ref-value="searcher-e-product"
					:clean-input="cleanInputValue"
					:search-value="selectedProduct"
					@clean-input="$emit('get-params', { model: 'productId', value: '' })"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs3>
				<v-layout wrap>
					<v-flex xs6 px-2>
						<app-date-mask
							label="Fecha de Inicio"
							v-model="valueStartDate"
							@format-date="$emit('get-params', { model: 'startDate', value: $event })"
						></app-date-mask>
					</v-flex>
					<v-flex xs6 px-2>
						<app-date-mask
							id="end-date"
							label="Fecha de Fin"
							v-model="valueEndDate"
							@format-date="$emit('get-params', { model: 'endDate', value: $event })"
						></app-date-mask>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1>
				<v-btn
					class="btn-action white--text"
					color="success"
					:disabled="disabled"
					@click="$emit('on-filter')"
				>
					Filtrar
				</v-btn>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeModal"
		>
			<products-search-form
				v-if="isAction('product-searcher')"
				ecommerce
				:search-value="searchVal"
				@add-product="$emit('get-params', { model: 'productId', value: $event })"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import productsSearchForm from '@/components/shared/searcher/products-search-form';
	import productsSearchInput from '@/components/shared/searcher/products-search-input';

	function close(val) {
		if (val) {
			this.closeModal();
		}
	}

	function cleanInputValue(val) {
		if (val) {
			this.searchVal = null;
		}
	}

	function closeModal() {
		this.action.value = false;
		this.action.code = '';
		this.action.title = '';
	}

	function disabled() {
		return this.startDate || this.endDate ? (!this.startDate && this.endDate) ||
			(this.startDate && !this.endDate) : !this.categoriesId && !this.productId &&
			!this.ratingTo;
	}

	function endDate(val) {
		if (!val) {
			this.valueEndDate = '';
		}
	}

	function isAction(code) {
		return this.action.code === code;
	}

	function openSearch(value) {
		this.searchVal = value ? value.trim() : '';
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 739;
		this.action.value = true;
	}

	function startDate(val) {
		if (!val) {
			this.valueStartDate = '';
		}
	}

	function data() {
		return {
			action: {
				code: '',
				title: '',
				value: false,
				width: 622,
			},
			searchVal: null,
			valueEndDate: '',
			valueStartDate: '',
		};
	}

	export default {
		name: 'filter-ecommerce',
		components: {
			actionSidebar,
			productsSearchForm,
			productsSearchInput,
		},
		computed: {
			disabled,
		},
		data,
		methods: {
			closeModal,
			isAction,
			openSearch,
		},
		props: {
			categories: {
				default: () => [],
				type: Array,
			},
			categoriesId: [Number, String],
			close: {
				default: false,
				type: Boolean,
			},
			cleanInputValue: {
				default: false,
				type: Boolean,
			},
			endDate: [Date, Number, String],
			productId: [Number, String],
			selectedProduct: String,
			startDate: [Date, Number, String],
			rating: {
				default: false,
				type: Boolean,
			},
			ratings: {
				default: () => [],
				type: Array,
			},
			ratingTo: [Number, String],
		},
		watch: {
			cleanInputValue,
			close,
			endDate,
			startDate,
		},
	};
</script>
