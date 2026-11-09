<template>
	<div class="autocomplete-address" style="position: relative">
		<v-text-field
			v-model="searchText"
			label="Busca una dirección"
			class="filter-select"
			hide-details
			v-bind="$attrs"
			@input="onInput"
			@focus="onFocus"
			@blur="suggestions = []"
			ref="addressInput"
			autocomplete="off"
		/>

		<v-list
			v-if="loading || suggestions.length || noResults"
			class="suggestion-list"
			style="
				position: absolute;
				top: 100%;
				z-index: 10;
				background: white;
				width: 100%;
				max-height: 250px;
				overflow-y: auto;
			"
		>
			<v-list-tile v-if="loading">
				<v-list-tile-content class="text-center py-2">
					<v-progress-circular indeterminate color="primary" size="20" />
				</v-list-tile-content>
			</v-list-tile>
			<v-list-tile v-else-if="noResults">
				<v-list-tile-content class="text-center py-2">
					<em>No se encontraron resultados</em>
				</v-list-tile-content>
			</v-list-tile>
			<v-list-tile
				v-else
				v-for="prediction in suggestions"
				:key="prediction.place_id"
				@mousedown.prevent="selectSuggestion(prediction)"
			>
				{{ prediction.description }}
			</v-list-tile>
		</v-list>
	</div>
</template>

<script>
// import helper from '@/shared/helper';

// const { debounce } = helper;
import helper from '@/shared/helper';

const { debounce } = helper;

function onInput() {
	if (!this.searchText || this.searchText.length < 3) {
		this.suggestions = [];
		this.loading = false;
		this.noResults = false;
		return;
	}
	this.loading = true;
	this.noResults = false;

	this.debouncedSearchPredictions();
}

export default {
	name: 'AutocompleteAddress',
	props: {
		value: String,
	},
	data() {
		return {
			searchText: this.value || '',
			suggestions: [],
			showSuggestions: false,
			autocompleteService: null,
			placesService: null,
			loading: false,
			noResults: false,
		};
	},
	watch: {
		value(val) {
			this.searchText = val;
		},
	},
	methods: {
		onInput,
		onFocus() {
			if (
				!this.autocompleteService &&
				window.google &&
				window.google.maps &&
				window.google.maps.places
			) {
				this.autocompleteService =
					new window.google.maps.places.AutocompleteService();
				const map = document.createElement('div');
				this.placesService = new window.google.maps.places.PlacesService(map);
			}
		},
		selectSuggestion(prediction) {
			this.searchText = prediction.description;
			// this.showSuggestions = false;
			this.loading = false;
			this.noResults = false;

			this.placesService.getDetails(
				{
					placeId: prediction.place_id,
					fields: ['formatted_address', 'geometry'],
				},
				(place, status) => {
					if (status === window.google.maps.places.PlacesServiceStatus.OK) {
						const address = place.formatted_address || '';
						this.$emit('input', address);
						this.$emit('place-selected', place);
						this.suggestions = [];
					}
				}
			);
		},
		debouncedSearchPredictions: debounce(function () {
			this.searchPredictions();
		}, 600),
		searchPredictions() {
			this.autocompleteService.getPlacePredictions(
				{
					input: this.searchText,
					types: ['geocode'],
					componentRestrictions: { country: 'pe' },
				},
				(predictions, status) => {
					this.loading = false;

					if (
						status === window.google.maps.places.PlacesServiceStatus.OK &&
						predictions &&
						predictions.length
					) {
						this.suggestions = predictions;
						this.noResults = false;
					} else {
						this.suggestions = [];
						this.noResults = true;
					}
				}
			);
		},
	},
};
</script>

<style scoped>
.suggestion-list {
	border: 1px solid #ccc;
	border-top: none;
}
</style>
