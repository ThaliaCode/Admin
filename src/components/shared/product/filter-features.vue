<template>
	<div class="feature">
		<template v-if="featuresFiltered.length > 0">
			<v-layout
				v-for="(item, indexFeatures) in featuresFiltered"
				:key="indexFeatures"
			>
				<v-flex xs12>
					<collapse
						:title="item.name"
						:index="indexFeatures"
						@select-all-features="selectAllFeatures"
					>
						<v-text-field
							class="japi-input-text feature-search"
							name="search-feature"
							label="Buscar"
							@input="filteredChar(indexFeatures, $event)"
						></v-text-field>
						<div class="feature-content">
							<div
								class="feature-value"
								v-for="(char, index) in item.features"
								:key="index"
							>
								<v-checkbox
									class="char-value-select"
									color="primary"
									hide-details
									:label="char.name"
									size="small"
									v-model="char.active"
									@change="
										selectedFeatures({ indexFeatures, index, value: $event })
									"
								>
								</v-checkbox>
							</div>
						</div>
					</collapse>
				</v-flex>
			</v-layout>
		</template>
		<template v-else>
			<div class="opacity-warehouse">
				<p class="text-opacity">
					No se encontraron características que pertenezcan a la sucursal del
					almacén seleccionado.
				</p>
			</div>
		</template>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="featuresFiltered.length === 0"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="saveFeatures"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from './../utils/modal-sidebar-button';
import collapse from './../utils/collapse';

function created() {
	this.featuresFiltered = [...this.sections];
}

function closeModal(from) {
	this.$emit('cancel-modal', false, from);
	this.clearModal();
}

function saveFeatures() {
	this.$emit('filter-by-features', this.dataSelected);
	this.closeModal('features');
}

function selectedFeatures({ indexFeatures, index, value }) {
	this.featuresFiltered[indexFeatures].features[index].active = value;
	if (!value) {
		const name = this.featuresFiltered[indexFeatures].features[index].name;
		this.updateDataSelected(name);
	} else {
		this.updateDataSelected();
	}
}

function selectAllFeatures(index, value) {
	this.featuresFiltered[index].features = this.featuresFiltered[
		index
	].features.map((feat) => {
		const newFeat = { ...feat };
		newFeat.active = value;
		return newFeat;
	});
	this.updateDataSelected();
}

function clearModal() {
	this.sections.forEach((sec, index) => {
		this.selectAllFeatures(index, false);
	});
	this.dataSelected = [];
}

function filteredChar(index, e) {
	if (e) {
		this.featuresFiltered[index].features = [
			...this.sections[index].features.reduce((acum, f) => {
				if (f.name.toLowerCase().indexOf(e.toLowerCase()) > -1) {
					const newF = { ...f };
					newF.active = this.dataSelected.findIndex((ds) => ds === f.name) > -1;
					acum.push(newF);
				}
				return acum;
			}, []),
		];
	} else {
		this.featuresFiltered[index].features = [
			...this.sections[index].features.map((f) => {
				const newF = { ...f };
				newF.active = this.dataSelected.findIndex((ds) => ds === f.name) > -1;
				return newF;
			}),
		];
	}
}

function updateDataSelected(featName) {
	if (featName) {
		const index = this.dataSelected.findIndex((ds) => ds === featName);
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	} else {
		const featuresSelected = this.featuresFiltered.reduce((acum, feature) => {
			const featuresActive = feature.features.filter((feat) => feat.active);
			const selected = acum.concat(featuresActive);
			return selected;
		}, []);
		this.dataSelected = featuresSelected.map((fs) => fs.name);
	}
}

function data() {
	return {
		dataSelected: [],
		featuresFiltered: [],
	};
}
export default {
	name: 'filter-features',
	components: {
		collapse,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		clearModal,
		closeModal,
		filteredChar,
		saveFeatures,
		selectAllFeatures,
		selectedFeatures,
		updateDataSelected,
	},
	props: {
		sections: {
			type: Array,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.feature {
	height: 100%;
	overflow-y: scroll;
	position: relative;

	.layout {
		max-height: 33%;
	}

	.feature-input {
		margin-bottom: 15px;
	}

	.feature-content {
		display: grid;
		grid-template-columns: 33% 33% 33%;

		.feature-value:nth-child(2n + 1) {
			background-color: map-get($colors, white-content);
		}
	}

	.feature-search {
		width: 245px;
	}
}

.opacity-warehouse {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 15%;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 2;
}

.text-opacity {
	background-color: white;
	border: solid 3px color(primary);
	border-style: dashed;
	color: #828282;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0 auto;
	max-width: 405px;
	padding: 28px 27px;
}
</style>
