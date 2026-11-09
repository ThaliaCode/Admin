<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 mt-3>
				<v-layout wrap align-center justify-end>
					<v-flex>
						<span class="small--text">Nombre del archivo</span>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-product-model"
							label=""
							disabled
							v-model="nameExcel"
						></v-text-field>
					</v-flex>
					<label ref="label" for="upload-file-reconciliation" class="mx-2">
						<vue-six-four
							id="upload-file-reconciliation"
							hidden
							@vue-six-four="getFile"
						/>
						<v-btn
							@click="showDialog"
							class="ma-0 btn-auto mt-3"
							small
							color="info"
							style="padding: 4px 10px"
						>
							<v-icon color="white" size="20">file_download</v-icon>
						</v-btn>
					</label>
				</v-layout>
				<p class="error--text ma-0 mt-3" style="font-size: 12px; line-height: 1.2;">
					* Nota: La columna "Ubicación" del Excel es solo de referencia para el conteo. Al importar, no actualizará la ubicación maestra del producto en el almacén.
				</p>
			</v-flex>
			<v-flex xs12 mt-3>
				<app-date-select
					label="Fecha del inventario"
					:date-formatted="model.inventoryDate"
					model="inventoryDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 mt-3>
				<span class="small--text">Inventariadores</span>
				<v-select
					:items="fatherInventory.responsible"
					v-model="model.responsible"
					class="filter-select shadow-inset"
					placeholder="Inventariadores"
					item-text="fullname"
					item-value="fullname"
					item-disabled="disabled"
					chips
					return-object
					@change="setResponsable"
				></v-select>
			</v-flex>
			<v-flex xs12 mt-3>
				<span class="small--text">Zona</span>
				<v-text-field
					class="filter-select shadow-inset"
					name="new-product-model"
					label=""
					v-model="model.zone"
				></v-text-field>
			</v-flex>
			<v-flex xs12 mt-3>
				<v-layout row wrap align-center>
					<v-flex xs12 sm9 md10>
						<p class="company-text-regular ma-0">
							¿Desea cerrar inventario al cargar archivo?
						</p>
					</v-flex>
					<v-flex xs2>
						<v-layout row align-center>
							<v-flex>
								<app-tooltip-button
									:img="'/static/img/new-icons/icon-help-fill.svg'"
									text="Si activas esta opción, el inventario se guardará y se cerrará. De lo contrario, el inventario se creará."
								></app-tooltip-button>
							</v-flex>
							<v-flex>
								<v-switch
									color="success"
									hide-details
									v-model="model.flagCloseInventory"
								></v-switch>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex v-if="errorProducts" mt-4>
				<p class="company-text-regular ma-0">Producto con error</p>
				<app-table
					class="is-not-selectable mt-2"
					:columns="columns"
					:rows="rows"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="pa-2 is-not-selectable">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)" class="pa-2">
							{{ props.row.name }}
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="saveData"
			/>
		</section>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import vueSixFour from 'vue-six-four';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Codigo',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
		],
		rows: [],
		errorProducts: false,
		model: {
			base64data: null,
			inventoryDate: null,
			responsible: [],
			zone: null,
			warInventoryId: null,
			flagCloseInventory: false,
		},
		nameExcel: null,
	};
}

function validations() {
	return {
		model: {
			base64data: { required },
			inventoryDate: { required },
			responsible: { required },
		},
	};
}

export default {
	data,
	components: {
		modalSidebarButton,
		vueSixFour,
		appTable,
	},
	methods: {
		getFile(fileInfo) {
			const name = fileInfo.name.replace(/\s/g, '-');
			const allowedFiles = ['xls', 'xlsx'];
			try {
				const words = name.split('.');
				const lastItem = words.length;
				const extension = words[lastItem - 1];
				if (allowedFiles.indexOf(extension) > -1) {
					this.model.base64data = fileInfo.sixFour;
					this.nameExcel = name;
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (error) {
				this.showGenericError();
			}
		},
		showDialog() {
			this.$refs.label.click();
		},
		closeModal() {
			this.model = {
				base64data: null,
				inventoryDate: null,
				responsible: [],
				zone: null,
				warInventoryId: null,
				flagCloseInventory: false,
			};
			this.nameExcel = null;
			this.$emit('close-modal');
		},
		async saveData() {
			this.model.warInventoryId = this.fatherInventory.id;
			const body = {
				...this.model,
				responsible: [this.model.responsible],
			};
			try {
				await this.$httpProducts.post('inventories/orders-import-excel', body);
				this.$emit('close-modal');
				this.$emit('load-data');
				this.errorProducts = false;
			} catch (error) {
				this.rows = [];
				if (error.data.details.length > 0) {
					this.showGenericError(
						'Error al importar los productos al inventario'
					);
					this.rows = error.data.details;
					this.errorProducts = true;
				} else {
					this.showGenericError();
				}
			}
		},
		setDate({ model, value }) {
			this.model[model] = value;
		},
		setResponsable(value) {
			this.model.responsible = [];
			this.model.responsible.push(value);
		},
	},
	props: {
		fatherInventory: {
			type: Object,
			default: () => {},
		},
	},
	validations,
};
</script>
<style lang="scss">
.company-text-regular {
	font-size: 16px;
	font-weight: normal;
}
.small--text {
	font-size: 14px !important;
}
</style>
