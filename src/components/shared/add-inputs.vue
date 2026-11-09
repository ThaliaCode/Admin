<template>
	<transition-group name="fade" mode="out-in">
		<v-layout row wrap align-center
		v-for="(input, indexInput) in newInputs" :key="indexInput">
			<slot name="input" :input="input"></slot>
			<v-flex xs1 mb-2>
				<v-btn
					type="button"
					class="btn-list btn-list-add"
					v-if="indexInput === 0"
					@click="addInputs">
					<v-icon>add</v-icon>
				</v-btn>
				<v-btn
					v-else
					type="button"
					class="btn-list btn-list-remove"
					@click="removeInput(indexInput)">
					<v-icon>remove</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
	</transition-group>
</template>

<script>

function addInputs() {
	this.newInputs.push({ ...this.emptyInput });
	this.updateParent();
}

function removeInput(index) {
	this.newInputs.splice(index, 1);
	this.updateParent();
}

function updateParent() {
	this.$emit('update-parent', this.newInputs);
}

function data() {
	return {
		newInputs: [...this.inputs],
	};
}

export default {
	name: 'add-inputs',
	data,
	methods: {
		addInputs,
		removeInput,
		updateParent,
	},
	props: {
		emptyInput: {
			type: Object,
			default: () => {},
		},
		inputs: {
			type: Array,
			default: () => [],
		},
	},
};
</script>

