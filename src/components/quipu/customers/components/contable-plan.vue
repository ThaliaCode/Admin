<template>
	<v-container>
		<v-layout row d-flex>
			<v-flex xs6 mr-3>
				<v-select
					bottom
					hide-details
					label="Sector"
					class="filter-select shadow-inset"
					v-bind:items="[]"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
			<v-flex xs6 mr-3>
				<v-select
					bottom
					hide-details
					label="Template"
					class="filter-select shadow-inset"
					v-bind:items="[]"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	name: 'contable-plan',
};
</script>
