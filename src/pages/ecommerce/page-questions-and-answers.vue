<template>
	<div>
		<header-page
			name="questions-and-answers-ecommerce"
			:title="$route.meta.title"
			:show-excel="false"
			to-show
			@clean-product-filter="onClean"
		></header-page>
		<filter-ecommerce
			:categories="categories"
			:categories-id="params.categoriesId"
			:close="closeModal"
			:end-date="params.endDate"
			:product-id="params.productId"
			:start-date="params.startDate"
			:selected-product="selectedProduct"
			@get-params="getParams"
			@on-filter="onFilter"
		></filter-ecommerce>
		<questions-and-answers-list
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@change-state="onChange"
			@on-page="loadData"
			@on-search="onSearch"
			@send-answer="onSend"
		></questions-and-answers-list>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeAction"
		>
			<questions-and-answers-form
				v-if="isAction('send-answer')"
				:is-loading="isLoading"
				:row="rowSelected"
				@close="closeAction"
				@save="sendAnswer"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import { differenceInDays, format } from 'date-fns';
	import actionSidebar from '@/components/shared/action-sidebar';
	import filterEcommerce from '@/components/ecommerce/filter-ecommerce';
	import headerPage from '@/components/shared/header-page';
	import questionsAndAnswersForm from '@/components/ecommerce/questions-and-answers-form';
	import questionsAndAnswersList from '@/components/ecommerce/questions-and-answers-list';

	function created() {
		this.getResources();
	}

	function closeAction() {
		this.action.value = false;
		this.action.code = '';
		this.action.title = '';
		this.rowSelected = {};
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
			this.rows = rows.map((row) => {
				const newRow = { ...row };
				newRow.answer = row.answer || {};
				return newRow;
			});
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function onChange({ id, value }) {
		const body = { flagActive: value };
		const message = value ? 'activadas' : 'desactivadas';
		try {
			await this.$httpProducts.patch(`question-answer/${id}/active`, body);
			this.showNotification(`La pregunta y respuesta han sido ${message} correctamente.`);
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onClean() {
		this.params = {
			categoriesId: null,
			endDate: null,
			limit: 30,
			page: 1,
			productId: null,
			startDate: null,
			search: null,
			typeQuestionAnswer: 1,
		};
		this.cleanSearch = !this.params.search;
		this.loadData();
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

	function onSend(row) {
		this.rowSelected = { ...row };
		this.action.title = 'RESPONDER PREGUNTA';
		this.action.width = 399;
		this.action.code = 'send-answer';
		this.action.value = true;
	}

	async function sendAnswer(answer) {
		this.isLoading = true;
		const productId = this.rowSelected.productId;
		const body = {
			questionAnswerId: this.rowSelected.id,
			description: answer,
			typeQuestionAnswer: 2,
		};
		try {
			await this.$httpProducts.post(`question-answer/${productId}/product`, body);
			this.showNotification('La respuesta ha sido enviada correctamente.');
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

	function data() {
		return {
			action: {
				code: '',
				title: '',
				width: 399,
				value: false,
			},
			categories: [],
			cleanSearch: false,
			closeModal: false,
			columns: [
				{
					id: 1,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Correo',
					value: 'email',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Pregunta',
					value: 'question',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Respuesta',
					value: 'answer',
					checked: true,
					visible: true,
				},
				{
					id: 5,
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
				startDate: null,
				search: null,
				typeQuestionAnswer: 1,
			},
			rows: [],
			rowSelected: {},
			selectedProduct: '',
		};
	}

	export default {
		name: 'questions-and-answers',
		components: {
			actionSidebar,
			filterEcommerce,
			headerPage,
			questionsAndAnswersForm,
			questionsAndAnswersList,
		},
		created,
		data,
		methods: {
			closeAction,
			getParams,
			getResources,
			isAction,
			loadData,
			onChange,
			onClean,
			onFilter,
			onSearch,
			onSend,
			sendAnswer,
		},
	};
</script>
