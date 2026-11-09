<template>
	<div class="config-product">
		<v-alert type="warning" :value="showNewSupplier">
			El producto relacionado a la venta ya se encuentra registrado en la
			garantia, para continuar seleccione otra venta relacionada.
		</v-alert>
		<div class="px-4 pt-3">
			<v-flex xs12>
				<app-select
					:disabled="viewModal"
					label="Proovedor (Opcional)"
					item-value="id"
					item-text="name"
					:items="suppliers"
					:item="model.supplierId"
					model="supplierId"
					@input="$emit('set-input', $event)"
				/>
			</v-flex>
			<v-checkbox
				v-if="!showView"
				class="pt-2"
				hide-details
				label="Agregar Documento"
				:true-value="1"
				color="primary"
				:false-value="0"
				v-model="model.addDocument"
			></v-checkbox>
			<v-flex xs12 mt-2>
				<v-layout row align-center>
					<v-flex xs4 v-if="model.addDocument">
						<app-select
							:disabled="viewModal"
							label="Tipo de Doc."
							item-value="id"
							item-text="documentType.name"
							:items="documentsType"
							:item="model.typeDocument"
							model="typeDocument"
							@input="$emit('set-input', $event)"
						/>
					</v-flex>
					<v-flex xs5 ml-2 v-if="model.addDocument">
						<v-layout row>
							<v-flex>
								<app-input-text
									:disabled="viewModal"
									label="Serie"
									:item="model.serie"
									model="serie"
									@input="$emit('set-input', $event)"
								/>
							</v-flex>
							<v-flex ml-1>
								<app-input-text
									:disabled="viewModal"
									label="Número"
									:item="model.number"
									model="number"
									@input="$emit('set-input', $event)"
								/>
							</v-flex>
							<v-flex pt-3 pl-2>
								<v-btn
									color="primary"
									@click="$emit('valid-note')"
									class="btn-action btn-auto px-1"
								>
									Validar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex v-if="showView">
						<label class="caption">Documento: {{ model.saleId }}</label>
					</v-flex>
					<v-flex xs9 v-if="!model.addDocument && !showView">
						<app-select
							:disabled="viewModal"
							label="Seleccionar venta"
							item-value="documentNumber"
							item-text="typeDocumentComplete"
							:item="model.saleId"
							:items="salesProduct"
							model="saleId"
							@input="$emit('set-input', $event)"
						/>
						<span class="form-group__message" v-if="$v.model.saleId.$invalid">
							Este Campo es requerido
						</span>
					</v-flex>
					<v-flex xs3 ml-2>
						<app-input-text
							:disabled="true"
							label="P. Venta"
							:text="model.priceSale"
							model="priceSale"
							type="number"
							@input="$emit('set-input', $event)"
						/>
						<span
							class="form-group__message"
							v-if="$v.model.priceSale.$invalid"
						>
							Este Campo es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mt-2>
				<v-layout row justify-space-between align-end>
					<v-flex xs7>
						<app-select
							:disabled="viewModal"
							label="Estado"
							item-value="id"
							item-text="statusName"
							:items="states"
							model="stateId"
							:item="model.stateId"
							@input="$emit('set-input', $event)"
						/>
						<span class="form-group__message" v-if="$v.model.stateId.$invalid">
							Este Campo es requerido
						</span>
					</v-flex>
					<v-flex xs4 ml-2>
						<app-input-text
							:disabled="viewModal || disabledQuantity"
							label="Cantidad"
							:text="model.quantity"
							model="quantity"
							type="number"
							@input="$emit('set-input', $event)"
						/>
						<span class="form-group__message" v-if="$v.model.quantity.$invalid">
							Este Campo es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mt-2>
				<v-layout row align-end>
					<v-flex xs10>
						<app-input-text
							:disabled="viewModal"
							label="Descripción del Problema"
							:text="model.description"
							model="description"
							@input="$emit('set-input', $event)"
							@keypress.enter.native="addDescription(model.description)"
						/>
					</v-flex>
					<v-flex xs2 ml-2>
						<app-tooltip-button
							:disabled="viewModal"
							color="primary"
							icon="add_circle"
							text="Agregar Descripción"
							@click-icon="addDescription(model.description)"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mt-2 class="title-problem" v-if="model.problemDescription">
				Problema
			</v-flex>
			<v-flex>
				<v-layout
					mb-2
					v-for="(item, index) in model.problemDescription"
					:key="index"
				>
					<v-flex class="item-name" xs11>{{ item.description }}</v-flex>
					<v-flex xs1 ml-1>
						<v-layout row mb-1>
							<v-flex>
								<app-tooltip-button
									:disabled="viewModal"
									color="error"
									icon="remove_circle"
									text="Eliminar Descripción"
									@click-icon="deleteDescription(item)"
								></app-tooltip-button>
							</v-flex>
							<v-flex ml-2>
								<app-tooltip-button
									:disabled="viewModal"
									color="success"
									icon="edit"
									text="Editar"
									@click-icon="editDescription(item)"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5 mt-3>
				<label ref="label" for="upload-file">
					<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
					<button
						class="product-add-btn mt-1"
						type="button"
						@click="addImage"
						:disabled="viewModal"
					>
						<span>Agregar Fotos</span>
						<v-icon class="product-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</label>
			</v-flex>
			<v-flex mt-3 class="flex-image">
				<div v-for="(item, index) in model.arrayImages" :key="index">
					<div class="relative">
						<v-layout row class="content-image">
							<v-flex xs4>
								<app-tooltip-button
									color="error"
									icon="remove_circle"
									text="Eliminar Imagen"
									@click-icon="deleteImage(item)"
								></app-tooltip-button>
							</v-flex>
							<v-flex xs4 ml-2>
								<v-tooltip top>
									<a slot="activator" target="_blank" :href="item.urlImage">
										<v-icon color="primary"> remove_red_eye </v-icon>
									</a>
									<span>Visualizar Imagen</span>
								</v-tooltip>
							</v-flex>
						</v-layout>
						<img
							class="ml-2"
							:src="item.urlImage"
							:alt="item.nameImage"
							width="125"
							height="120"
						/>
					</div>
				</div>
			</v-flex>
		</div>
		<div v-if="showView">
			<v-flex class="title-table mt-4 mb-3" px-4> Historial de Cambios </v-flex>
			<app-table
				name="selecting-sale-account"
				:rows="rows"
				:columns="columns"
				:input-search="false"
				:filter-columns="false"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.nameEmployee }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 2)">
						{{ props.row.date | exactDate }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 3)">
						{{ props.row.status }}
					</td>
				</template>
			</app-table>
		</div>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				:success-text="textSave"
				success-color="primary"
				:hiddenSaveBtn="model.stateWarranty === 3"
				@cancel-button-clicked="$emit('cancel-action')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import lib from '@/shared/lib';

const { equality, find } = lib;

function created() {
	this.loadSuppliers();
	this.loadTypeDocuments();
}

async function loadTypeDocuments() {
	const params = {
		flagType: 1,
	};
	try {
		({ data: this.documentsType } = await await this.$httpSales.get(
			'type-documents',
			{ params }
		));
		this.documentsType = this.filterTypeDocuments(1, 'BOL', 'FAC', 'NTV');
		this.documentType = this.documentsType.map((p) => {
			const newRow = { ...p };
			newRow.nameTypeDocument = p.documentType.name;
			return newRow;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function filterTypeDocuments(...args) {
	const [flag, ...rest] = args;
	return this.documentsType.reduce((list, item) => {
		const { documentType } = item;
		const { code, flagType } = documentType;
		const documentExist = find(equality(code), rest);
		if (flagType === flag && documentExist) {
			return list.concat(item);
		}
		return list;
	}, []);
}

async function loadSuppliers() {
	try {
		const response = await await this.$httpSales.get('suppliers');
		this.suppliers = response.data;
		if (this.suppliers.length === 1) {
			this.model.supplierId = this.suppliers[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function addDescription(description) {
	if (this.model.description) {
		if (this.model.descriptionId) {
			const index = this.model.problemDescription.findIndex(
				(p) => p.id === this.model.descriptionId
			);
			if (index > -1) {
				this.model.problemDescription[index].description =
					this.model.description;
				this.model.description = null;
				this.model.descriptionId = null;
			}
		} else {
			const index = this.model.problemDescription.length;
			this.model.problemDescription.push({
				id: index + 1,
				description,
			});
			this.model.description = null;
		}
	} else {
		this.showNotification(
			'Es necesario agregar una descripción al producto.',
			'warning'
		);
	}
}

function deleteDescription({ id }) {
	const index = this.model.problemDescription.findIndex((ad) => ad.id === id);
	if (index > -1) {
		this.model.problemDescription.splice(index, 1);
	}
}

function deleteImage(row) {
	const indexRow = this.model.arrayImages.findIndex((p) => p.id === row.id);
	if (indexRow > -1) {
		this.model.arrayImages.splice(indexRow, 1);
	}
}

function editDescription({ description, id }) {
	this.model.descriptionId = id;
	this.model.description = description;
}

function addImage() {
	this.$refs.label.click();
}

async function getFile(fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post(
				'upload-files',
				newFile
			);
			this.model.urlImage = file.Location;
			this.model.nameImage = file.Key;
			const index = this.model.arrayImages.length;
			this.model.arrayImages.push({
				id: index + 1,
				urlImage: this.model.urlImage,
				nameImage: this.model.nameImage,
			});
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			stateId: { required },
			saleId: { required },
			quantity: { required },
			priceSale: { required },
		},
	};
}

function data() {
	return {
		documentsType: [],
		suppliers: [],
	};
}

export default {
	name: 'config-product',
	data,
	created,
	components: {
		appTable,
		modalSidebarButton,
		VueSixFour,
	},
	methods: {
		addDescription,
		addImage,
		deleteImage,
		deleteDescription,
		editDescription,
		filterTypeDocuments,
		getFile,
		loadSuppliers,
		loadTypeDocuments,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		model: {
			type: Object,
			default: () => {},
		},
		states: {
			type: Array,
			default: () => [],
		},
		showView: {
			type: Boolean,
			default: false,
		},
		salesProduct: {
			type: Array,
			default: () => [],
		},
		allowedFiles: {
			type: Array,
			default: () => [],
		},
		viewModal: {
			type: Boolean,
			default: false,
		},
		disabledQuantity: {
			type: Boolean,
			default: false,
		},
		textSave: {
			type: String,
			default: 'Agregar Producto',
		},
		showNewSupplier: {
			type: Boolean,
			default: false,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-table {
	border-bottom: 0.5px solid color(sidebar);
	color: color(sidebar);
	font-family: font(open-bold);
	font-size: 12px;
	padding-bottom: 3px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.title-problem {
	color: color(primary);
	font-size: 10px;
}

.item-name {
	background-color: rgba(195, 231, 232, 0.29);
	border-radius: 2px;
	color: #4a4a4a;
	font-size: 12px;
	padding: 4px 4px 4px 10px;
}

.content-image {
	position: absolute;
	right: 0;
}

.flex-image {
	display: flex;
}

.relative {
	position: relative;
}
</style>
