<template>
	<div class="page-cost-centers">
		<header-page
			caption-navigation="Contabilidad"
			:title="$route.meta.title"
		></header-page>
		<app-actions
			v-if="step === 2"
			:resource-uri="$route.name"
			@run-action="openSlide"
		/>
		<v-stepper v-model="step" non-linear class="accountant-steps">
			<v-stepper-header>
				<div class="stepper-header-container stepper__header justify-center">
					<v-stepper-step :step="1" :complete="step > 1">INTRODUCCIÓN</v-stepper-step>
					<v-divider></v-divider>
					<v-stepper-step :step="2" :complete="step > 2">CENTRO DE COSTOS</v-stepper-step>
				</div>
			</v-stepper-header>
			<v-stepper-items>
				<v-stepper-content step="1">
					<step-question
						accept-title="CENTRO DE COSTOS"
						accept-description="Es una segmentación que genera costos para la organización, que le añaden beneficio o utilidad de manera indirecta. No opera con la intención de generar ingresos directamente, es la parte del negocio que genera costos sin ganancia.<br><br>Por ejemplo, un centro de costos puede ser un vehículo, incluso un departamento. El vehículo genera costos de seguros, combustible, mantenimiento, reparaciones, etc., y un departamento genera costos de salarios, material de oficina e insumos, etc. que no traen beneficio económico directo a la empresa."
						negative-title="YO LLEVO MIS CENTROS DE COSTOS"
						question="¿DESEAS LLEVAR TUS <br/>CENTROS DE COSTOS FÁCILMENTE?"
						:subsidiaries="subsidiaries"
						:subsidiary-id="subsidiary.id"
						:valid-integration="false"
						@following-question="nextStep"
						@selected-subsidiary="filterSubsidiary"
					></step-question>
				</v-stepper-content>
				<v-stepper-content step="2">
					<cost-centers-list
						:clean-search="cleanSearch"
						:columns="columns"
						:current-page="currentPage"
						:last-page="lastPage"
						:rows="rows"
						@click-icon="clickIcon"
						@on-page="onPage"
						@on-search="onSearch"
					/>
				</v-stepper-content>
			</v-stepper-items>
		</v-stepper>
		<template v-if="step === 2">
			<action-sidebar
				:title="action.title"
				:value="action.open"
				:width="action.width"
				@close-modal="closeSlide"
			>
				<cost-centers-form
					v-if="isActionCode('cost-center-new', 'edit')"
					:cost-centers="rows"
					:id="costCenterId"
					:loading="loading"
					:subsidiary-id="subsidiary.id"
					@on-close="closeSlide"
					@on-save="onSave"
				/>
				<cost-centers-delete
					v-if="isActionCode('delete')"
					:id="costCenterId"
					:loading="loading"
					:name="costCenterName"
					@on-close="closeSlide"
					@on-delete="onDelete"
				/>
			</action-sidebar>
		</template>
	</div>
</template>

<script>
	import appActions from '@/components/shared/app-actions';
	import actionSidebar from '@/components/shared/action-sidebar';
	import costCentersDelete from '@/components/cost-centers/cost-centers-delete';
	import costCentersForm from '@/components/cost-centers/cost-centers-form';
	import costCentersList from '@/components/cost-centers/cost-centers-list';
	import headerPage from '@/components/shared/header-page';
	import stepQuestion from '@/components/accountant/step-question';

	function created() {
		this.loadSubsidiaries();
	}

	function clickIcon(option, { id, name }) {
		if (option === 'edit') {
			this.costCenterId = id;
			this.openSlide(option);
		} else {
			this.costCenterId = id;
			this.costCenterName = name;
			this.openSlide(option);
		}
	}

	function closeSlide() {
		this.action.open = false;
		this.action.code = '';
		this.action.title = '';
		this.costCenterId = null;
	}

	function filterSubsidiary({ value }) {
		this.subsidiary = { ...value };
	}

	function isActionCode(code, orCode) {
		return this.action.code === code || this.action.code === orCode;
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = page;
		const params = { ...this.params, subsidiaryId: this.subsidiary.id };
		try {
			const { data: response, headers } = await this.$httpSales.get('cost-center', { params });
			this.rows = [...response];
			this.lastPage = Number(headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadSubsidiaries() {
		const params = { flagIntegrations: true };
		try {
			({ data: this.subsidiaries } = await this.$httpSales.get('subsidiaries', { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function nextStep() {
		this.step += 1;
		this.loadData();
	}

	async function onDelete() {
		this.loading = true;
		try {
			await this.$httpSales.delete(`cost-center/${this.costCenterId}`);
			this.showNotification('El centro de costos ha sido eliminado correctamente.');
			this.closeSlide();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}

	function onPage(page) {
		this.loadData(page);
	}

	async function onSave(model) {
		this.loading = true;
		const method = this.costCenterId ? 'patch' : 'post';
		const url = this.costCenterId ? `cost-center/${this.costCenterId}` :
			'cost-center';
		const message = this.costCenterId ? 'editado' : 'creado';
		const { account, code, costCenterId, name } = model;
		const body = { account, code, costCenterId, name };
		if (!this.costCenterId) {
			body.subsidiaryId = this.subsidiary.id;
		}
		try {
			await this.$httpSales[method](url, body);
			this.showNotification(`El centro de costos ha sido ${message} correctamente.`);
			this.closeSlide();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'COST_CENTER_CODE_EXISTS') {
					this.showGenericError('Ya existe un centro de costos con el código que ha ingresado.');
				}
			}
		} finally {
			this.loading = false;
		}
	}

	function onSearch(search) {
		this.params.search = search ? search.trim() : null;
		this.loadData();
	}

	function openSlide(option) {
		const module = 'Centro de Costos';
		if (option !== 'delete') {
			this.action.title = option === 'edit' ? `Editar ${module}` : `Crear ${module}`;
		} else {
			this.action.title = `Eliminar ${module}`;
		}
		this.action.code = option.code || option;
		this.action.width = 600;
		this.action.open = true;
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
				title: '',
				width: 600,
			},
			cleanSearch: false,
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Cta. Contable',
					tooltip: 'Cuenta Contable',
					value: 'account',
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
			costCenterId: null,
			costCenterName: '',
			currentPage: 1,
			lastPage: 0,
			loading: false,
			params: {
				page: 1,
				limit: 20,
			},
			step: 0,
			subsidiaries: [],
			subsidiary: {},
			rows: [],
		};
	}

	export default {
		name: 'page-cost-centers',
		components: {
			appActions,
			actionSidebar,
			costCentersDelete,
			costCentersForm,
			costCentersList,
			headerPage,
			stepQuestion,
		},
		created,
		data,
		methods: {
			clickIcon,
			closeSlide,
			filterSubsidiary,
			isActionCode,
			loadData,
			loadSubsidiaries,
			nextStep,
			onDelete,
			onPage,
			onSave,
			onSearch,
			openSlide,
		},
	};
</script>
