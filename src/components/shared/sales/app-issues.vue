<template>
	<v-container>
		<v-layout row px-2 mb-4 align-center justify-space-between>
			<v-flex xs10>
				<v-text-field
					required
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select shadow-inset"
					name="issue"
					label="Tareas"
					v-model="issue"
					@keyup.enter="addIssues"
				></v-text-field>
			</v-flex>
			<v-flex xs1>
				<button
					@click="addIssues"
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
				:rows="issues"
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

function addIssues() {
	let id = 0;
	if (this.issues.length) {
		id = this.issues[this.issues.length - 1].id + 1;
	} else {
		id = this.issues.length + 1;
	}
	const item = {
		id,
		text: this.issue,
	};
	this.issues.push(item);
	this.issue = '';
	if (this.edit) {
		this.$emit('add-issues', this.issues);
	}
}

function removeItem(index) {
	this.issues.splice(index, 1);
	if (this.edit) {
		this.$emit('add-issues', this.issues);
	}
}

function registerIssues() {
	if (!this.newIssue) {
		this.$emit('add-issues', this.issues);
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Lista de tareas', value: 'status', visible: true, checked: true },
			{ id: 2, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		issue: '',
		issues: [...this.data],
	};
}

export default {
	name: 'app-issues',
	components: {
		appTable,
	},
	data,
	methods: {
		addIssues,
		registerIssues,
		removeItem,
	},
	props: {
		data: {
			type: Array,
			default: () => [],
			required: true,
		},
		newIssue: {
			type: Boolean,
			required: false,
		},
		edit: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		newIssue: registerIssues,
	},
};
</script>

