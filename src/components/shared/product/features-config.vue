<template>
	<div class="py-3">
		<v-layout row wrap align-center mb-3 px-3>
			<v-flex xs2>
				<p class="features-label">Producto:</p>
			</v-flex>
			<v-flex xs10>
				<span class="features-value">{{ product.name }}</span>
			</v-flex>
		</v-layout>
		<v-layout row justify-center>
			<v-flex xs10>
				<v-alert
					:value="!featuresSelectedValid"
					type="warning"
				>
					Debe seleccionar una opción en cada característica
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 v-if="validFeatures">
			<v-flex xs12>
				<v-alert :value="validFeatures" type="info">
					No existen características para la categoría seleccionada.
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-expansion-panel
				class="expansion-panel-component">
				<v-expansion-panel-content
					v-for="(feature, featIndex) in features"
					:key="feature.id"
					expand-icon="arrow_drop_down"
					:value="feature.active">
					<div slot="header">{{ feature.name }}</div>
					<v-card>
						<v-layout row wrap align-center pa-2
							class="row-background-grey">
							<v-flex xs5>
								<v-text-field
									class="filter-select"
									hide-details
									label="Buscar"
									single-line
									v-model="feature.search"
									@keyup="filterFeatures(feature)"
								></v-text-field>
							</v-flex>
						</v-layout>
						<v-radio-group row v-model="featuresSelected[featIndex]"
							class="sale-radio radio-expansion-panel px-2">
							<v-radio
								v-for="feat in feature.features"
								:key="feat.code"
								:label="feat.value"
								:value="feat.code"
								color="primary"
								class="flex xs4 py-1"
								:ripple="false">
							</v-radio>
						</v-radio-group>
					</v-card>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="validFeatures || loading"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="applyFilter"
			/>
		</section>
	</div>
</template>

<script>
	import lib from '@/shared/lib';
	import modalSidebarButton from './../utils/modal-sidebar-button';

	const { matchBetweenArrays } = lib;

	function created() {
		const categoryByProduct = this.categories.find(category =>
			category.id === this.product.categoryId);
		if (categoryByProduct.features.length > 0) {
			this.features = categoryByProduct.features.reduce((acum, feature) => {
				const newAcum = [...acum];
				const newFeature = { ...feature };
				newFeature.active = true;
				newFeature.search = '';
				if (feature.features) {
					newFeature.features = feature.features.features.map((feat) => {
						const newFeat = {
							filterable: feature.filterable,
							flagSeparator: feature.flagSeparator || 0,
							id: feature.id,
							includeInCode: feature.includeInCode,
							code: feat.id,
							name: feature.name,
							value: feat.name.toString(),
						};
						return newFeat;
					});
					newFeature.features.sort((a, b) =>
						a.value.toLowerCase().localeCompare(b.value.toLowerCase()));
					newFeature.featuresComplete = [...newFeature.features];
					newAcum.push(newFeature);
				}
				return newAcum;
			}, []);
			if (this.features.length > 0 && this.product.id) {
				this.product.features.forEach((prodFeat) => {
					const productFeat = {
						id: prodFeat.code,
						name: prodFeat.value,
					};
					const productFeature = {
						id: prodFeat.id,
						name: prodFeat.name,
						filterable: prodFeat.filterable,
						flagSeparator: prodFeat.flagSeparator,
						includeInCode: prodFeat.includeInCode,
					};
					this.setFeaturesSelected(productFeat, productFeature);
				});
			}
		} else {
			this.features = [];
		}
	}

	function applyFilter() {
		let features = [];
		this.features.forEach((feature) => {
			const [match] = matchBetweenArrays(
				[this.featuresSelected],
				[feature.features, 'code'],
			);
			features = features.concat(match);
		});
		features = features.filter(f => typeof f !== 'undefined');
		this.$emit('config-features', features);
	}

	function closeModal() {
		this.features = [];
		this.$emit('cancel-modal');
	}

	function filterFeatures({ id, search }) {
		if (search) {
			this.features = this.features.map((feature) => {
				const newFeature = { ...feature };
				if (feature.id === id) {
					newFeature.features = feature.featuresComplete.filter(feat =>
						feat.value.toLowerCase().indexOf(search.toLowerCase()) > -1);
					newFeature.features.sort((a, b) =>
						a.value.toLowerCase().localeCompare(b.value.toLowerCase()));
				}
				return newFeature;
			});
		} else {
			this.features = this.features.map((feature) => {
				const newFeature = { ...feature };
				if (feature.id === id) {
					newFeature.features = [...feature.featuresComplete];
				}
				return newFeature;
			});
		}
	}

	function setFeaturesSelected(feat, feature) {
		if (this.featuresSelected.length > 0) {
			const index = this.featuresSelected.findIndex(featureSelected =>
				featureSelected === feat.id);
			if (index > -1) {
				this.featuresSelected.splice(index, 1);
			}
		}
		if (this.featuresSelected.length === 0) {
			this.createFeaturesSelectedArray();
		}
		const index = this.features.findIndex(f => f.id === feature.id);
		this.featuresSelected[index] = feat.id;
	}

	function createFeaturesSelectedArray() {
		const n = this.features.length;
		for (let i = 0; i < n; i += 1) {
			this.featuresSelected[i] = '';
		}
	}

	function validFeatures() {
		const noExistFeatures = this.features.length === 0;
		return noExistFeatures;
	}

	function featuresSelectedValid() {
		const sameLength = this.features.length === this.featuresSelected.length;
		const complete = this.featuresSelected.some(f => !!f);
		return sameLength && complete;
	}

	function data() {
		return {
			features: [],
			featuresSelected: [],
		};
	}

	export default {
		name: 'features-config',
		components: {
			modalSidebarButton,
		},
		computed: {
			featuresSelectedValid,
			validFeatures,
		},
		created,
		data,
		methods: {
			applyFilter,
			closeModal,
			createFeaturesSelectedArray,
			filterFeatures,
			setFeaturesSelected,
		},
		props: {
			categories: {
				default: () => [],
				type: Array,
			},
			loading: {
				default: false,
				type: Boolean,
			},
			product: {
				default: () => {},
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.features {
		&-label {
			color: map-get($map: $colors, $key: paginationText);
			font-family: map-get($map: $fonts, $key: open-semibold);
			font-size: 13px;
			margin: 0px;
		}

		&-value {
			color: map-get($map: $colors, $key: paginationText);
			font-family: map-get($map: $fonts, $key: open-regular);
			font-size: 13px;
		}
	}
</style>