<template>
	<div>
		<header-page
			name="fair"
			:title="$route.meta.title"
			/>
		<div class="px-4 mt-5">
			<app-table
			name="fair-list"
			:current-page="currentPage"
			:last-page="lastPage"
			:columns="columns"
			:rows="rows">
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.name }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.name }}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.startDate | exactDate }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.endDate | exactDate }}
					</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<v-btn
								type="button"
								slot="activator"
								icon
								@click="openSlide(props.row)"
								>
									<v-icon color="green">add</v-icon>
								</v-btn>
								<span>Asignar Comercio</span>
						</v-tooltip>
					</td>
				</template>		
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<assign-commerce
				:commerce="commerce"
				:plans="plans"
				@cancel-modal="closeModal"
				@save="saveModal"
				@on-search-commerce="onSearch"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import assignCommerce from '@/components/ecommerce/assign-commerce';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadFair();
	this.loadEcommerce();
}

function onSearch(search) {
	if (search) {
		setTimeout(() => {
			this.commerce = this.completedCommerce.filter(
				row => row.name.toLowerCase().indexOf(search) > -1
				|| row.code.toLowerCase().indexOf(search) > -1);
		}, 300);
	} else {
		this.commerce = [...this.completedCommerce];
	}
}

async function saveModal() {
	try {
		const arrayFilter = this.completedCommerce.filter(a => a.isSelected);
		const body = arrayFilter.map((r) => {
			const array = {};
			array.commerceId = r.id;
			array.type = r.planId;
			array.flagStatusFair = r.isSelected ? 1 : 0;
			return array;
		});
		await this.$httpSales.post(`fairs/commerce/${this.idRowFair}`, body);
		this.showNotification('Los comercios fueron asignados correctamente.');
		this.closeModal();
		this.loadFair();
	} catch (error) {
		this.showGenericError();
	}
}

async function loadFair() {
	try {
		({ data: this.rows } = await this.$httpSales.get('fairs'));
	} catch (error) {
		this.showGenericError();
	}
}

async function loadEcommerce() {
	try {
		const response = await this.$httpSales.get('com-ecommerce-companies');
		this.completedCommerce = response.data.map((p) => {
			const newArray = { ...p };
			newArray.planId = 1;
			newArray.isSelected = false;
			return newArray;
		});
		this.commerce = [...this.completedCommerce];
	} catch (error) {
		this.showGenericError();
	}
}

function commercesSelected(fairCommerce) {
	this.completedCommerce = this.completedCommerce.map((p) => {
		const newArray = { ...p };
		const fairSelected = fairCommerce.find(fc => fc.commerceId === p.id);
		newArray.isSelected = !!fairSelected;
		newArray.planId = fairSelected ? fairSelected.jsonPlans.type : 1;
		return newArray;
	});
	this.commerce = [...this.completedCommerce];
}

function openSlide({ id, fairCommerce }) {
	this.commercesSelected(fairCommerce);
	this.action = {
		active: true,
		open: true,
		title: 'Asignar Comercios',
		width: 550,
	};
	this.idRowFair = id;
}

function closeModal() {
	this.action = {
		active: false,
		open: false,
		title: '',
	};
	this.idRowFair = null;
	this.search = null;
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Fecha Inicio', value: 'dateStart', visible: true, checked: true },
			{ id: 4, name: 'Fecha Final', value: 'dateEnd', visible: true, checked: true },
			{ id: 5, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		commerce: [],
		currentPage: 1,
		idRowFair: null,
		lastPage: 0,
		plans: [
			{
				id: 1,
				name: 'Basico',
			},
			{
				id: 2,
				name: 'Oro',
			},
		],
		rows: [
			{
				id: 1,
				code: '12',
			},
		],
	};
}

export default {
	name: 'page-fair',
	data,
	created,
	components: {
		actionSidebar,
		assignCommerce,
		appTable,
		headerPage,
	},
	methods: {
		commercesSelected,
		closeModal,
		loadEcommerce,
		loadFair,
		onSearch,
		openSlide,
		saveModal,
	},
};
</script>