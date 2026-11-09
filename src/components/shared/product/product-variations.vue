<template>
	<div>
		<v-container pl-5 pb-0>
			<v-layout wrap>
				<v-flex xs12>
					<span class="title">Agregar Variaciones:</span>
				</v-flex>
				<v-flex xs12 v-if="showAddVariations">
					<v-layout wrap mt-3>
						<v-flex xs12>
							<span class="features">Selecciona las características</span>
						</v-flex>
					</v-layout>
					<v-layout wrap justify-center>
						<v-flex xs10
							v-for="(f, indexF) in category.features"
							:key="indexF">
							<autocomplete-component
								:label-value="f.name"
								item-text="name"
								:items="f.features"
								local-search
								:item="variations[indexF]"
								@return-data="setFeature({ indexF, value: $event })"
							></autocomplete-component>
						</v-flex>
					</v-layout>
					<v-layout wrap align-center justify-end mt-3>
						<v-flex xs1>
							<button
								:disabled="disabledAddBtn || loading"
								class="pl-add-container size"
								@click="saveData"
							>
								<v-icon id="add-icon" color="white">add</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 v-else my-2>
					<v-alert :value="!showAddVariations" type="info">
						No se puede crear variaciones porque la categoría
						del producto no cuenta con características.
					</v-alert>
				</v-flex>
			</v-layout>
		</v-container>
		<section>
			<v-layout row ml-5>
				<v-flex>
					<span class="features">Variaciones</span>
				</v-flex>
			</v-layout>
			<v-layout row>
				<v-flex>
					<div class="new-features-content">
						<v-data-table
							class="table-style"
							v-bind:headers="headers"
							:items="childs"
							hide-actions
						>
							<template slot="items" slot-scope="props">
								<td class="text-xs-center">
									<v-text-field
									v-model="props.item.description"
									disabled
									class="japi-input-text"
									label="Nombre del identificador"></v-text-field>
								</td>
								<td class="text-xs-center">
									<v-text-field
									required
									:disabled="!editCode"
									v-model="props.item.code"
									class="japi-input-text"
									label="Código del identificador"></v-text-field>
									<span
										class="text-not-code-blank"
										v-if="checkBlankCode(props.item.code)">
										No se permite espacios en blanco
									</span>
								</td>
								<td>
									<button
										v-if="!editCode"
										class="table-icon"
										v-on:click="editCode = true">
										<img :src="`${$imageUrl}/editar.svg`" alt="">
									</button>
									<div v-else>
										<button
											class="table-icon"
											@click="updateCode(props.item)">
											<img :src="`${$imageUrl}/check.svg`" alt="user">
										</button>
										<button
											class="table-icon"
											@click="reloadChilds">
											<img :src="`${$imageUrl}/close.svg`" alt="user">
										</button>
									</div>
								</td>
							</template>
						</v-data-table>
					</div>
				</v-flex>
			</v-layout>
		</section>
		<section class="feature-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="true"
				@cancel-button-clicked="closeModal"/>
		</section>
	</div>
</template>

<script>
import lib from '@/shared/lib';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import modalSidebarButton from './../utils/modal-sidebar-button';

const { compose, setNewProperty } = lib;

function created() {
	this.id = this.product.categoryId;
	if (this.product.typeCode === 'variantes') {
		this.category.features = [...this.product.features];
		this.loadChilds();
	} else {
		this.loadData();
	}
}

async function loadChilds() {
	try {
		({ data: this.childs } = await this.$httpProducts.get(this.urlChilds));
		this.childsFormat();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadData() {
	const urlCategories = 'categories';
	const params = {
		id: this.id,
	};
	const requests = [
		this.$httpProductsRead.get(urlCategories, { params }),
		this.$httpProducts.get(this.urlChilds),
	];
	try {
		[{ data: this.category }, { data: this.childs }] = await Promise.all(requests);
		this.childsFormat();
	} catch (error) {
		this.showGenericError();
	}
}

function childsFormat() {
	if (this.childs.length === 0) {
		this.childs.push(this.featuresValues);
	} else {
		this.childs = this.childs.sort((a, b) => b.id - a.id);
	}
}

function clearInfo() {
	this.featuresValues = [
		{ name: '', id: '' },
	];
}

function closeModal() {
	this.clearInfo();
	this.$emit('cancel-modal', false);
}

function getNewData(value) {
	let flag = value === 'id' ? [this.product.code] : [];
	this.variations.forEach((v) => {
		if (value === 'id') {
			flag = flag.concat(v[value].substr(0, 3));
		} else {
			flag.push(v[value]);
		}
	});
	return value === 'id' ? flag.join('') : flag.join(', ');
}

function getFeatures() {
	const newFeatures = [];
	const size = this.category.features.length;
	for (let i = 0; i < size; i += 1) {
		const newFeature = { ...this.category.features[i] };
		delete newFeature.features;
		delete newFeature.subsidiaryId;
		if (newFeature.companyId) {
			delete newFeature.companyId;
		}
		if (newFeature.createdAt) {
			delete newFeature.createdAt;
		}
		if (newFeature.updatedAt) {
			delete newFeature.updatedAt;
		}
		if (newFeature.flagActive) {
			delete newFeature.flagActive;
		}
		newFeature.flagSeparator = false;
		if (this.variations[i]) {
			newFeature.code = this.variations[i].id;
			newFeature.value = this.variations[i].name;
			newFeatures.push(newFeature);
		}
	}
	return newFeatures;
}

async function saveData() {
	this.loading = true;
	const parentId = this.product.id;
	const url = `products-parent/${parentId}`;
	const body = {
		code: this.getNewData('id'),
		description: this.getNewData('name'),
		features: this.getFeatures(),
		name: this.product.name,
		price: 0,
		setting: false,
		urlImage: 'https://s3.amazonaws.com/japi-admin/place-holder.svg',
	};
	try {
		await this.$httpProductsRead.patch(url, { childs: [body] });
		this.showNotification('Transacción exitosa');
		this.variations = [];
		this.reloadChilds();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'DUPLICATE CODE') {
				this.showNotification('Ese código no está disponible', 'error');
			} else if (error.data.message === 'PRODUCT_NOT_PARENT') {
				this.showGenericError('Se crea variaciones solo a productos padres');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function setFeature({ indexF, value }) {
	if (value) {
		this.$set(this.variations, indexF, value);
	}
}

function showAddVariations() {
	return this.category.features && this.category.features.length > 0;
}

async function reloadChilds() {
	try {
		({ data: this.childs } = await this.$httpProducts.get(this.urlChilds));
		this.childsFormat();
	} catch (error) {
		this.showGenericError();
	}
	this.editCode = false;
}

async function updateCode(product) {
	const url = `/products-step-1/${product.id}`;
	const body = this.buildBody(product);
	try {
		await this.$httpProducts.patch(url, body);
		this.showNotification('Código actualizado correctamente');
	} catch (error) {
		if (error.data.message === 'code already exists') {
			const message = 'Código duplicado';
			this.showNotification(message, 'error');
		} else {
			this.showGenericError();
		}
		this.reloadChilds();
	}
	this.editCode = false;
}

function buildBody(product) {
	return compose(
		setNewProperty('categoryId', product.categoryId),
		setNewProperty('code', product.code),
		setNewProperty('description', product.description),
		setNewProperty('features', product.features),
		setNewProperty('model', product.model),
		setNewProperty('name', product.name),
		setNewProperty('price', product.price),
		setNewProperty('setting', false),
		setNewProperty('type', product.type),
		setNewProperty('unitId', product.unitId),
		setNewProperty('urlImage', product.urlImage),
		setNewProperty('warrantyFrequency', product.warrantyFrequency),
		setNewProperty('warrantyQuantity', product.warrantyQuantity),
		setNewProperty('weight', product.weight),
		setNewProperty('weightType', product.weightType),
	)({});
}

function validVariations(values) {
	this.disabledAddBtn = values.length !== this.category.features.length;
}

function data() {
	return {
		category: {},
		childs: [],
		disabledAddBtn: true,
		editCode: false,
		featuresValues: {
			description: '',
			code: '',
		},
		headers: [
			{ text: 'Característica', sortable: false, align: 'center' },
			{ text: 'Código', sortable: false, align: 'center' },
			{ text: '', sortable: false, align: 'center' },
		],
		id: 0,
		urlChilds: `products-parent/${this.product.id}/childs`,
		variations: [],
		loading: false,
	};
}

export default {
	name: 'product-variations',
	components: {
		autocompleteComponent,
		modalSidebarButton,
	},
	computed: {
		showAddVariations,
	},
	created,
	data,
	methods: {
		buildBody,
		clearInfo,
		closeModal,
		childsFormat,
		getFeatures,
		getNewData,
		loadChilds,
		loadData,
		reloadChilds,
		saveData,
		setFeature,
		updateCode,
	},
	props: {
		product: {
			type: Object,
			default: () => {},
		},
	},
	watch: {
		variations: {
			deep: true,
			handler: validVariations,
		},
	},
};
</script>

<style lang="scss" scoped>
.title {
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, medium) !important;
}

.product-name {
	font-family: map-get($fonts, open-regular) !important;
	font-size: map-get($sizes, medium) !important;
}

.features {
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium18) !important;
}
</style>


