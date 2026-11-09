<template>
	<v-container>
		<add-inputs
		:empty-input="emptyPeriod"
		:inputs="periods"
		@update-parent="updatePeriods">
			<template slot="input" slot-scope="props">
				<v-flex xs3 mr-2>
					<v-menu
						lazy
						v-model="props.input.activeCreatedAt"
						transition="scale-transition"
						offset-y
						full-width
					>
						<v-text-field
							slot="activator"
							label="Fecha inicio"
							v-model="props.input.createdAt"
							single-line
							append-icon="event"
							class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
							readonly
						></v-text-field>
						<v-date-picker
							v-model="props.input.createdAt"
							no-title
							scrollable
						></v-date-picker>
					</v-menu>
				</v-flex>
				<v-flex xs3 mr-2>
					<v-menu
						lazy
						v-model="props.input.activeEndAt"
						transition="scale-transition"
						offset-y
						full-width
					>
						<v-text-field
							slot="activator"
							label="Fecha fin"
							v-model="props.input.endAt"
							single-line
							append-icon="event"
							class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
							readonly
						></v-text-field>
						<v-date-picker
							v-model="props.input.endAt"
							no-title
							scrollable
						></v-date-picker>
					</v-menu>
				</v-flex>
				<v-flex xs4>
					<v-text-field
					single-line
						class="filter-select shadow-inset show-error"
						name="new-product-from"
						label="Mes"
						v-model="props.input.month"
					></v-text-field>
				</v-flex>
			</template>
		</add-inputs>
	</v-container>
</template>

<script>
import addInputs from './../../../shared/add-inputs';

function data() {
	return {
		emptyPeriod: {
			createdAt: '',
			endAt: '',
			month: '',
			activeCreatedAt: false,
			activeEndAt: false,
		},
		entryDateActive: false,
		entryDate: '',
		periods: [
			{
				createdAt: '',
				endAt: '',
				month: '',
				activeCreatedAt: false,
				activeEndAt: false,
			},
		],
	};
}

function updatePeriods(periods) {
	this.periods = [...periods];
}

export default {
	name: 'contable-period',
	components: {
		addInputs,
	},
	data,
	methods: {
		updatePeriods,
	},
};
</script>

