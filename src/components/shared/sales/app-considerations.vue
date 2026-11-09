<template>
	<v-container>
		<v-layout row px-2 mb-4 align-center justify-space-between>
			<v-flex xs10>
				<v-text-field
					required
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select"
					name="comments"
					label="Comentarios"
					v-model="consideration"
					@keyup.enter="addConsideration"
				></v-text-field>
			</v-flex>
			<v-flex xs1>
				<button
					@click="addConsideration"
					class="pl-add-container size">
						<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout row>
			<v-flex xs12 px-2>
				<app-table
				name="considerations"
				:columns="columns"
				:rows="considerations"
				:include-filter="false"
				:inputSearch="false"
				:filterColumns="false"
				:selectable="false"
				class="is-not-selectable">
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">{{props.row.text}}</td>
						<td>
							<button
								class="table-icon"
								v-on:click="removeItem(props.index)">
								<v-icon
									color="pink"
									size="19">
									highlight_off
								</v-icon>
							</button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import appTable from './../table/app-table';

function addConsideration() {
	let id = 0;
	if (this.considerations.length) {
		id = this.considerations[this.considerations.length - 1].id + 1;
	} else {
		id = this.considerations.length + 1;
	}
	const item = {
		id,
		text: this.consideration,
	};
	this.considerations.push(item);
	this.consideration = '';
	if (this.edit) {
		this.$emit('add-considerations', this.considerations);
	}
}

function removeItem(index) {
	this.considerations.splice(index, 1);
	if (this.edit) {
		this.$emit('add-considerations', this.considerations);
	}
}

function registerConsiderations() {
	if (!this.newConsideration) {
		this.$emit('add-considerations', this.considerations);
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Lista de consideraciones', value: 'status', visible: true, checked: true },
			{ id: 2, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		consideration: '',
		considerations: [...this.data],
	};
}

export default {
	name: 'app-considerations',
	components: {
		appTable,
	},
	data,
	methods: {
		addConsideration,
		registerConsiderations,
		removeItem,
	},
	props: {
		data: {
			type: Array,
			default: () => [],
			required: false,
		},
		newConsideration: {
			type: Boolean,
			required: false,
		},
		edit: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		newConsideration: registerConsiderations,
	},
};
</script>

