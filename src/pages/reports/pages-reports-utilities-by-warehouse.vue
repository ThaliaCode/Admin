<template>
	<div>
		<header-page
			name="utilities-by-warehouse"
			:columns="columns"
			:rows="warehouses"
			:title="$route.meta.title"
			@clean-product-filter="onCleanFilter"
		/>

		<div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
			<div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(226, 232, 240, 1); border-radius: 16px; padding: 3rem; text-align: center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); max-width: 450px; width: 100%;">
				<div style="background: #fef3c7; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
					<svg xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px; color: #d97706;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<h3 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.75rem; font-family: sans-serif;">Reportes Inhabilitados</h3>
				<p style="font-size: 1rem; color: #4b5563; line-height: 1.5; font-family: sans-serif;">Los reportes están inhabilitados de momento. Disculpe las molestias.</p>
			</div>
		</div>

		<!-- <reports-filters
			:clean-filters="cleanFilters"
			@return-data="setData"
			@search-data="loadData"
			@valid-disabled="validDisabled"
		/>
		<reports-utilities-list
			:columns="columns"
			:warehouses="warehouses"
		/> -->
	</div>
</template>

<script>
import headerPage from '@/components/shared/header-page';
import reportsFilters from '@/components/reports/reports-filters';
import reportsUtilitiesList from '@/components/reports/reports-utilities-list';

async function loadData() {
	this.cleanFilters = false;
	if (this.disabled) {
		this.showGenericError('La fecha inicial no puede ser mayor a la final.');
	} else {
		try {
			({ data: this.warehouses } = await this.$httpReportSales.get('warehouse-report', {
				params: this.params,
			}));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}
}

function onCleanFilter() {
	this.cleanFilters = true;
}

function setData({ model, value }) {
	this.params[model] = value;
}

function validDisabled(val) {
	this.disabled = val;
}

function data() {
	return {
		cleanFilters: false,
		columns: [
			{
				id: 1,
				checked: true,
				name: 'Tienda',
				value: 'name',
				visible: true,
			},
			{
				id: 2,
				checked: true,
				name: 'Total ingreso',
				value: 'totalIncome',
				visible: true,
			},
			{
				id: 3,
				checked: true,
				name: 'Total egreso',
				value: 'totalExpense',
				visible: true,
			},
			{
				id: 4,
				checked: true,
				name: 'Utilidades',
				value: 'utility',
				visible: true,
			},
		],
		disabled: false,
		params: {
			endDate: null,
			startDate: null,
		},
		warehouses: [],
	};
}

export default {
	name: 'utilities-by-warehouse',
	components: {
		headerPage,
		reportsFilters,
		reportsUtilitiesList,
	},
	data,
	methods: {
		loadData,
		onCleanFilter,
		setData,
		validDisabled,
	},
};
</script>
