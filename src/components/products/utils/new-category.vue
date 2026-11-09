<template>
	<div class="new-category">
		<v-progress-linear 
			v-bind:indeterminate="isLoading"
			v-if="isLoading">
		</v-progress-linear>
		<div class="new-category-main">
			<section>
				<div class="new-category-name">
					<v-text-field
					required
					class="japi-input-text"
					name="new-category-name"
					label="Nombre"
					v-model="categoryObject.name"></v-text-field>
				</div>
				<v-layout px-3>
					<v-text-field
					required
					class="japi-input-text"
					name="new-category-name"
					label="Código"
					v-model="categoryObject.code"></v-text-field>
				</v-layout>
				<span
					class="text-not-code-blank px-3"
					v-if="checkBlankCode(categoryObject.code)">
					No se permite espacios en blanco
				</span>
				<div class="new-category-features">
					<div class="ncf-title">
						<v-checkbox
						class="chk-all"
						color="white"
						label="Características"
						v-model="checkAll"
						v-on:change="selectAllFeatures()"></v-checkbox>
					</div>
					<div class="ncf-all">
						<v-checkbox
						class="chk-all"
						v-for="(feature, index) in categoryObject.features"
						:key="index"
						color="primary"
						v-bind:label="feature.name"
						v-model="feature.checked"
						v-on:change="selectedFeatures(feature)"></v-checkbox>
					</div>
				</div>
				<div class="new-product-list-features">
					<p class="npfl-title">
						Lista de Características
					</p>
					<div class="npfl-content">
						<app-table
						:isDraggable="true"
						:inputSearch="false"
						:filterColumns="false"
						:columns="headerFeatures"
						:rows="featuresSelected"
						@on-drag-over="overDrag"
						@on-drag-start="startDrag"
						@on-drag-end="endDrag">
							<template slot="rows" slot-scope="props">
								<td>{{ props.row.position }}</td>
								<td>{{ props.row.name }}</td>
								<td>
									<v-checkbox
									class="chk-all ml-5"
									color="primary"
									v-model="props.row.showInMobile"></v-checkbox>
								</td>
							</template>
						</app-table>
					</div>
				</div>
			</section>
			<section class="feature-footer">
				<modal-sidebar-button
					:is-loading="disabled"
					v-on:cancel-button-clicked="closeModal"
					v-on:accept-button-clicked="registerCategory"/>
			</section>
		</div>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';
import appTable from './../../shared/table/app-table';

function created() {
	this.loadCategories();
	this.getData();
}

async function getData() {
	this.isLoading = true;
	try {
		const response = await this.$httpProducts.get('features');
		this.categoryObject.features = response.data;
		this.isLoading = false;
		this.$bus.$emit('is-loading', false);
	} catch (e) {
		this.showGenericError();
	}
}

function closeModal() {
	this.checkAll = false;
	this.selectAllFeatures();
	this.clearData();
	this.$emit('cancel-modal', false);
}

function clearData() {
	const clean = {
		name: '',
		features: this.categoryObject.features,
	};
	this.featuresSelected = [];
	Object.assign(this.categoryObject, clean);
}

async function registerCategory() {
	this.disabled = true;
	const value = this.commerceId ? 'relationalName' : 'name';
	const valueCode = 'code';
	const nameExist = this.rows.find(r =>
		this.formatText(r[value]) === this.formatText(this.categoryObject.name));
	const codeExist = this.rows.find(r =>
		this.formatText(r[valueCode]) === this.formatText(this.categoryObject.code));
	if (this.$v.$invalid) {
		this.showNotification('La categoría debe tener NOMBRE', 'error');
	} else if (nameExist) {
		this.showGenericError('Ya existe una categoría con el nombre ingresado.');
	} else if (codeExist) {
		this.showGenericError('Ya existe una categoría con el código ingresado.');
	}	else {
		const newFeaturesSelected = this.featuresSelected.map((el) => {
			const features = {
				id: el.id,
				name: el.name,
				includeInCode: el.includeInCode,
				filterable: el.filterable,
				showInMobile: el.showInMobile,
			};
			return features;
		});
		const body = {
			code: this.categoryObject.code,
			name: this.categoryObject.name,
			features: newFeaturesSelected,
			flagActive: true,
		};
		try {
			const { data: catSelected } = await this.$httpProducts.post('categories', body);
			this.showNotification('Se creo correctamente la categoría');
			this.closeModal();
			this.$emit('update-category', catSelected);
		} catch (e) {
			if (e.status === 400) {
				this.showGenericError();
			} else {
				this.showGenericError();
			}
			this.disabled = false;
		} finally {
			this.disabled = false;
		}
	}
	this.disabled = false;
}

function selectAllFeatures() {
	const lengthFeatures = this.categoryObject.features.length;
	for (let i = 0; i < lengthFeatures; i += 1) {
		this.categoryObject.features[i].checked = this.checkAll;
		this.selectedFeatures(this.categoryObject.features[i]);
	}
}

function selectedFeatures(feature) {
	const size = this.featuresSelected.length;
	const position = size + 1;
	const newFeature = {
		position,
		name: feature.name,
		includeInCode: true,
		id: feature.id,
		filterable: true,
		showInMobile: true,
	};
	if (feature.checked) {
		const exist = this.featuresSelected.find(f => f.id === feature.id);
		if (!exist) {
			this.featuresSelected.push(newFeature);
		}
	} else {
		const index = this.featuresSelected.findIndex(f => f.id === feature.id);
		if (index > -1) {
			this.featuresSelected.splice(index, 1);
			this.featuresSelected = this.featuresSelected.map((f, indexF) => {
				const newF = { ...f };
				newF.position = indexF + 1;
				return newF;
			});
		}
	}
	this.originalSize = this.featuresSelected.length + 1;
}

function overDrag(event) {
	this.index = event.target.parentElement.dataset.index;
}

function endDrag() {
	this.featuresSelected.splice(this.index, 0, this.itemToDrag);
	this.featuresSelected = this.featuresSelected.map((f, indexF) => {
		const newF = { ...f };
		newF.position = indexF + 1;
		return newF;
	});
}

function startDrag(event) {
	const index = event.target.dataset.index;
	this.itemToDrag = this.featuresSelected[index];
	this.featuresSelected.splice(index, 1);
}

function formatText(text) {
	if (text) {
		return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
	}
	return '';
}

async function loadCategories() {
	if (this.commerceId) {
		const params = { commerceId: this.commerceId };
		({ data: this.rows } = await this.$httpProducts.get('e-categories', { params }));
	} else {
		({ data: this.rows } = await this.categoriesList());
	}
}

function data() {
	return {
		checkAll: false,
		isLoading: false,
		categoryObject: {
			name: '',
			features: [],
		},
		disabled: false,
		featuresSelected: [],
		headerFeatures: [
			{ id: 1, name: 'Posición', value: 'position', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Ver en móvil', value: 'movil', visible: true, checked: true },
		],
		index: 0,
		itemToDrag: {},
		rows: [],
	};
}

function validations() {
	return {
		categoryObject: {
			name: {
				required,
			},
		},
	};
}

export default {
	name: 'new-category',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		clearData,
		closeModal,
		formatText,
		getData,
		loadCategories,
		startDrag,
		endDrag,
		overDrag,
		registerCategory,
		selectAllFeatures,
		selectedFeatures,
	},
	props: {
		commerceId: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.new-category-features {
	margin-bottom: 30px;
	.ncf-title {
		background-color: map-get($colors, primary);
		color: white;
		height: 30px;
		margin-bottom: 20px;
		padding-left: 15px;
		.chk-all label {
			color: white;
		}
	}
	.ncf-all {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		padding-left: 15px;
		.chk-all:nth-child(2n) {
			background-color: map-get($colors, gray);
		}
	}
}
.new-category-name {
	padding: 0 20px; 
	width: 100%;
}
.npfl-title {
	margin-left: 15px;
}
.header-table {
	background-color: map-get($colors, primary);
	color: white;
}
.row:nth-child(2n+1) {
	background-color: white;
}
.features-column {
	padding: 10px;
	text-align: center;
}
</style>


