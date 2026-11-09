<template>
	<div>
		<v-form method="post" @submit.prevent="save">
			<v-layout wrap px-4 pt-4>
				<v-flex xs12 md6 pr-2 v-if="!isEdit">
					<app-select
						:item="model.comSubsidiariesId"
						item-text="sucursalName"
						item-value="id"
						:items="subsidiaries"
						:label="labelSucursal()"
						model="comSubsidiariesId"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.comSubsidiariesId.$invalid">
						La {{labelSucursal()}} es requerida
					</span>
				</v-flex>
				<v-flex xs12 md6 pl-2 v-if="!isEdit">
					<app-select
						:item="model.warWarehousesId"
						item-text="name"
						item-value="id"
						:items="warehouses"
						:label="labelWarehouse()"
						model="warWarehousesId"
						:readonly="!model.comSubsidiariesId"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.warWarehousesId.$invalid">
						El almacén es requerido
					</span>
				</v-flex>
				<v-flex xs12 md6 pr-2 mt-3>
					<app-input-text
						label="Nombre"
						model="name"
						:text="model.name"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 md6 pl-2 mt-3>
					<app-input-text
						label="Código"
						model="code"
						:text="model.code"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.code.$invalid">
						El código es requerido
					</span>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(model.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 mt-3>
					<app-input-text
						label="Descripción"
						model="description"
						:text="model.description"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 md6 pr-2 mt-3>
					<app-input-text
						label="Autorización de Sunat"
						model="sunatCode"
						:text="model.sunatCode"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 md6 pl-2 mt-3>
					<app-input-text
						label="Serie de Impresora"
						model="printCode"
						:text="model.printCode"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 md6 pr-2 mt-3 v-if="isEcuador">
					<app-input-text
						label="Punto de Emisión"
						model="codeTaxes"
						:text="model.codeTaxes"
						@input="getValue"
					/>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
	import { required } from 'vuelidate/lib/validators';
	import appSelect from '@/components/shared/app-select';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.loadResources();
	}

	function buildName(name) {
		this.model.name = name;
	}

	function close() {
		this.$emit('close');
	}

	function filterWarehouses(subsidiaryId) {
		this.warehouses = this.warehousesComplete.filter(w => w.subsidiaryId === subsidiaryId);
	}

	function getData({ model, value }) {
		this.model[model] = value.id;
		if (model === 'comSubsidiariesId') {
			this.subsidiaryName = value.sucursalName;
			this.filterWarehouses(value.id);
		} else {
			this.warehouseName = value.name;
		}
		if (this.subsidiaryName && this.warehouseName) {
			const name = `${this.warehouseName}-${this.subsidiaryName}`;
			this.buildName(name);
		}
	}

	function getValue({ model, value }) {
		this.model[model] = value;
	}

	async function loadData() {
		const { data: model } = await this.$httpSales.get(`terminals/${this.id}`);
		this.model = {
			comSubsidiariesId: 0,
			code: model.code,
			description: model.description,
			name: model.name,
			printCode: model.printCode,
			salTypeTerminalsId: 1,
			sunatCode: model.sunatCode,
			warWarehousesId: 0,
		};
		if (this.isEcuador) {
			this.model.codeTaxes = model.codeTaxes;
		}
		const subsidiary = this.subsidiaries.find(s => s.id === model.comSubsidiariesId);
		const warehouse = this.warehousesComplete.find(w => w.id === model.warWarehousesId);
		this.getData({ model: 'comSubsidiariesId', value: subsidiary });
		this.getData({ model: 'warWarehousesId', value: warehouse });
	}

	async function loadResources() {
		const request = [
			this.$httpSales.get('subsidiaries'),
			this.warehousesList(),
		];
		[{ data: this.subsidiaries }, { data: this.warehousesComplete }] = await Promise.all(request);
		if (this.id) {
			this.loadData();
		}
	}

	function save() {
		const newModel = { ...this.model };
		if (!this.isEcuador) {
			delete newModel.codeTaxes;
		}
		this.$emit('save', newModel, this.isEdit);
	}

	function isEcuador() {
		return this.labelsByCountry.id === 2;
	}

	function isEdit() {
		return !!this.id;
	}

	function data() {
		return {
			model: {
				comSubsidiariesId: null,
				code: '',
				codeTaxes: '',
				description: '',
				name: '',
				printCode: '',
				salTypeTerminalsId: 1,
				sunatCode: '',
				warWarehousesId: null,
			},
			subsidiaries: [],
			subsidiaryName: '',
			warehouseName: '',
			warehousesComplete: [],
			warehouses: [],
		};
	}

	function validations() {
		return {
			model: {
				code: {
					required,
				},
				comSubsidiariesId: {
					required,
				},
				warWarehousesId: {
					required,
				},
			},
		};
	}

	export default {
		name: 'terminals-form',
		components: {
			appSelect,
			modalSidebarButton,
		},
		computed: {
			isEcuador,
			isEdit,
		},
		created,
		data,
		methods: {
			buildName,
			close,
			filterWarehouses,
			getData,
			getValue,
			loadData,
			loadResources,
			save,
		},
		props: {
			id: {
				type: [Number, String],
			},
		},
		validations,
	};
</script>
