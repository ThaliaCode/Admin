<template>
	<div>
		<header-page
			name="rating-ecommerce"
			:title="$route.meta.title"
			:show-excel="false"
			to-show
			@clean-product-filter="onClean"
		></header-page>
		<filter-ecommerce
			:categories="categories"
			:categories-id="params.categoriesId"
			:clean-input-value="cleanInputValue"
			:close="closeModal"
			:end-date="params.endDate"
			:product-id="params.productId"
			rating
			:ratings="ratings"
			:rating-to="params.ratingTo"
			:start-date="params.startDate"
			:selected-product="selectedProduct"
			@get-params="getParams"
			@on-filter="onFilter"
		></filter-ecommerce>
		<ratings-list
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@change-state="onChange"
			@edit="onEdit"
			@on-page="loadData"
			@on-search="onSearch"
		></ratings-list>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeAction"
		>
			<rating-form
				v-if="isAction('edit-rating')"
				:is-loading="isLoading"
				:row="rowSelected"
				@close="closeAction"
				@save="editRating"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import { differenceInDays, format } from 'date-fns';
	import actionSidebar from '@/components/shared/action-sidebar';
	import filterEcommerce from '@/components/ecommerce/filter-ecommerce';
	import headerPage from '@/components/shared/header-page';
	import ratingForm from '@/components/ecommerce/rating-form';
	import ratingsList from '@/components/ecommerce/ratings-list';

	function created() {
		this.getResources();
	}

	function closeAction() {
		this.action.value = false;
		this.action.code = '';
		this.action.title = '';
		this.rowSelected = {};
	}

	async function editRating({ rating, description, orderId }) {
		this.isLoading = true;
		const body = { description, rating, orderId };
		try {
			await this.$httpProducts.patch(`question-answer/${this.rowSelected.id}`, body);
			this.showNotification('La valoración ha sido editada correctamente.');
			this.closeAction();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.isLoading = false;
		}
	}

	function getParams(paramsValue) {
		if (paramsValue) {
			const { model, value } = paramsValue;
			if (model === 'productId') {
				this.selectedProduct = value.id ? value.name : '';
				this.params.productId = value.id ? value.id : null;
				this.closeModal = true;
			} else {
				this.params[model] = model === 'endDate' || model === 'startDate' ?
					format(value, 'YYYY-MM-DD') : value;
			}
		}
	}

	async function getResources() {
		try {
			({ data: this.categories } = await this.$httpProducts.get('e-categories'));
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function isAction(code) {
		return this.action.code === code;
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = this.currentPage;
		const params = { ...this.params };
		try {
			const { data: rows, headers } = await this.$httpProducts.get('question-answer',
				{ params });
			this.lastPage = Number(headers['x-last-page']);
			this.rows = [...rows];
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.cleanInputValue = false;
		}
	}

	function onClean() {
		this.params = {
			categoriesId: null,
			endDate: null,
			limit: 30,
			page: 1,
			productId: null,
			ratingTo: null,
			startDate: null,
			search: null,
			typeQuestionAnswer: 3,
		};
		this.cleanSearch = !this.params.search;
		this.cleanInputValue = true;
		this.selectedProduct = '';
		this.loadData();
	}

	async function onChange({ id, value }) {
		const body = { flagActive: value };
		const message = value ? 'activada' : 'desactivada';
		try {
			await this.$httpProducts.patch(`question-answer/${id}/active`, body);
			this.showNotification(`La valoración ha sido ${message} correctamente.`);
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onEdit(row) {
		this.rowSelected = { ...row };
		this.action.title = 'EDITAR VALORACIÓN';
		this.action.width = 399;
		this.action.code = 'edit-rating';
		this.action.value = true;
	}

	function onFilter() {
		if (this.params.startDate && this.params.endDate) {
			if (differenceInDays(this.params.endDate, this.params.startDate) >= 0) {
				this.loadData();
			} else {
				this.showNotification('La fecha final no debe ser mayor a la inicial.',
					'info');
			}
		} else {
			this.loadData();
		}
	}

	function onSearch(search) {
		this.params.search = search ? search.trim() : null;
		this.cleanSearch = !this.params.search;
		this.loadData();
	}

	function data() {
		return {
			action: {
				code: '',
				title: '',
				width: 399,
				value: false,
			},
			categories: [],
			cleanInputValue: false,
			cleanSearch: false,
			closeModal: false,
			columns: [
				{
					id: 1,
					name: 'Producto',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Opinión',
					value: 'commentary',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Valoración',
					value: 'rating',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Acciones',
					checked: true,
					visible: true,
					flagVisible: true,
				},
			],
			currentPage: 1,
			isLoading: false,
			lastPage: 0,
			params: {
				categoriesId: null,
				endDate: null,
				limit: 30,
				page: 1,
				productId: null,
				ratingTo: null,
				startDate: null,
				search: null,
				typeQuestionAnswer: 3,
			},
			ratings: [1, 2, 3, 4, 5],
			rows: [],
			rowSelected: {},
			selectedProduct: '',
		};
	}

	export default {
		name: 'rating',
		components: {
			actionSidebar,
			filterEcommerce,
			headerPage,
			ratingForm,
			ratingsList,
		},
		created,
		data,
		methods: {
			closeAction,
			editRating,
			getParams,
			getResources,
			isAction,
			loadData,
			onClean,
			onChange,
			onEdit,
			onFilter,
			onSearch,
		},
	};
</script>
