<template>
	<div>
		<label class="caption">{{ labelValue }}</label>
		<v-select
			hide-details
			single-line
			no-data-text="No se encontraron resultados para su búsqueda"
			class="filter-select"
			:autocomplete="autocomplete === 'on'"
			:content-class="`filter-select-content custom-select-content custom-select-content-search
				${!!search && noData ? 'custom-select-content-open' : ''}`"
			:search-input.sync="search"
			v-bind="$attrs"
			@input="setData"
		>
			<template slot="no-data">
				<v-list-tile-content class="pl-2">
					<v-list-tile-title>No se encontraron resultados para su búsqueda</v-list-tile-title>
				</v-list-tile-content>
			</template>
			<template slot="item" slot-scope="data">
				<v-list-tile-content>
					<v-list-tile-title v-if="customer && data.item.typePerson"
						v-html="data.item.typePerson.fullName"
					></v-list-tile-title>
					<v-list-tile-sub-title v-else v-html="data.item.name"></v-list-tile-sub-title>
					<v-list-tile-sub-title>
						<v-chip color="pink" text-color="white" class="chip-search ma-0"
							v-if="customer && data.item.typePerson">
							{{ data.item.typePerson.documentName }}: {{ data.item.typePerson.documentNumber }}
						</v-chip>
						<v-chip color="pink" text-color="white" class="chip-search ma-0"
							v-if="data.item.commercialName">
							Nombre Comercial: {{ data.item.commercialName }}
						</v-chip>
						<v-chip color="primary" text-color="white" class="chip-search ma-0"
							v-if="data.item.documentNumber">
							{{ data.item.msTypePerson.name }}: {{ data.item.documentNumber }}
						</v-chip>
						<v-chip color="warning" text-color="white" class="chip-search ma-0"
							v-if="data.item.contactName">
							Contacto: {{ data.item.contactName }}
						</v-chip>
						<v-chip color="success" text-color="white" class="chip-search ma-0"
							v-if="data.item.email">
							Correo: {{ data.item.email }}
						</v-chip>
					</v-list-tile-sub-title>
				</v-list-tile-content>
			</template>
		</v-select>
	</div>
</template>

 <script>
function search(value) {
	if (value) {
		this.$emit('search', value);
	} else {
		this.setData(value);
	}
}

function setData(itemData) {
	this.$emit('set-data', itemData);
}

function data() {
	return {
		search: null,
	};
}

function cleanData(newValue) {
	if (newValue) {
		this.search = null;
	}
}

export default {
	name: 'input-autocomplete-search',
	data,
	inheritAttrs: false,
	methods: {
		setData,
	},
	props: {
		autocomplete: {
			default: 'on',
			type: String,
		},
		labelValue: {
			type: String,
		},
		cleanData: {
			default: false,
			type: Boolean,
		},
		customer: {
			default: false,
			type: Boolean,
		},
		noData: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		search,
		cleanData,
	},
};
</script>
