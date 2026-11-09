<template>
	<v-layout row wrap>
		<v-flex :class="showIcon ? 'xs10' : 'xs12'">
			<autocomplete-component
				append-icon="search"
				class="custom-autocomplete custom-autocomplete-search"
				custom-search
				customer
				http-code="$httpSales"
				:item="entitySelected"
				item-text="autocomplete"
				item-value="id"
				:items="entities"
				:placeholder-value="entityPlaceholder"
				:resource-url="entity"
				return-object
				@return-data="$emit('set-entity', $event)"
			></autocomplete-component>
		</v-flex>
		<span v-if="showIcon" class="searching-image success darken-1">
			<img 
				src="https://s3.amazonaws.com/apprunn-acl/icons/kVkuszmF8fXHl4lCZmqlVcI0J2sHtz.svg" 
				alt="" 
				height="16" 
				width="16"
			/>
		</span>
	</v-layout>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

	export default {
		name: 'searching-by-entity',
		components: {
			autocompleteComponent,
		},
		props: {
			entities: {
				default: () => [],
				type: Array,
			},
			entity: String,
			entityPlaceholder: String,
			entitySelected: {
				default: () => {},
				type: Object,
			},
			showIcon: {
				default: true,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.searching-image {
		border-radius: 2px;
		display: inline-block;
		height: 25px;
		line-height: 23px;
		text-align: center;
		width: 25px;
	}
</style>