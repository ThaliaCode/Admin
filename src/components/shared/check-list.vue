<template>
	<div>
		<label class="caption">{{ label }}</label>
		<ul class="check-list">
			<li
				v-for="item in items"
				:key="item.id"
				class="check-list-item"
			>
				<v-checkbox
					class="check-list-control my-0 ml-0 mr-1"
					color="primary"
					hide-details
					:label="item.name"
					v-model="item.flagActive"
					@change="sendValue(item)"
				></v-checkbox>
				<div v-if="item.flagChildren" class="ml-4">
					<check-list
						:items="item.children.options"
						:label="item.labelName"
						@input="sendValue(item, $event)"
					/>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import lib from '@/shared/lib';

const { setNewProperty } = lib;

function sendValue(item, $e) {
	if (item.flagChildren) {
		const index = this.items.findIndex(i => i.code === item.code);
		const newItem = item;
		const { flagActive } = item;
		newItem.flagActive = $e ? $e.value.some(i => i.flagActive) : flagActive;
		if ((flagActive && $e) || (!flagActive && $e)) {
			newItem.children.options = $e.value;
		} else if ((flagActive && !$e) || (!flagActive && !$e)) {
			const setAllTrue = item.children.options.map(setNewProperty('flagActive', flagActive));
			newItem.children.options = setAllTrue;
		}
		this.items.splice(index, 1, newItem);
		this.$emit('input', { model: this.model, value: this.items });
	} else {
		this.$emit('input', { model: this.model || 'syncPlatforms', value: this.items });
	}
}

export default {
	name: 'check-list',
	methods: {
		sendValue,
	},
	props: {
		items: {
			default: () => [],
			type: Array,
		},
		label: String,
		model: {
			default: '',
			type: String,
		},
	},
};
</script>

<style lang="scss" scoped>
	.check-list {
		color: color(paginationText);
		font-family: font(open-semibold);
		list-style: none !important;
		text-transform: capitalize;
	}
</style>