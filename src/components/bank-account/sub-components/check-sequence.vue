<template>
	<v-container>
		<v-layout row d-flex justify-space-between mb-3>
			<v-flex xs10>
				<span>{{slideLabel}}</span>
			</v-flex>
			<v-flex xs2>
				<button	
					class="expand-arrow"
					:class="{ 'arrow-active': addNew }"
					@click="addNew = !addNew">
					<v-icon id="add-icon">expand_more</v-icon>
				</button>
			</v-flex>
			<v-flex xs1 v-if="addNew">
				<button
					@click="addCheckSequence"
					class="pl-add-container size">
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout row wrap mb-4 justify-space-between
			class="collpase-container"
			:class="{ 'expand-container': addNew }">
			<v-flex xs5>
				<v-text-field
					autofocus
					single-line
					label="Secuencia Inicio"
					class="filter-select shadow-inset"
					type="number"
					v-model.number="newCheckSequence.serieStart"
				></v-text-field>
			</v-flex>
			<v-flex xs5>
				<v-text-field
					single-line
					label="Secuencia Fin"
					class="filter-select shadow-inset"
					type="number"
					v-model.number="newCheckSequence.serieEnd"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					bottom
					single-line
					multi-line
					type="number"
					v-model="newCheckSequence.description"
					label="Descripción"
					class="textarea-content filter-select shadow-inset mt-3"
				></v-text-field>
			</v-flex>
		</v-layout>
		<app-table
		:inputSearch="false"
		:filterColumns="false"
		:columns="columns"
		:rows="rows"
		:currentPage="currentPage"
		@on-page="changePage"
		class="is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">{{ props.row.numberStart}}</td>
				<td>{{ props.row.numberEnd }}</td>
				<td>{{ props.row.status }}</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="true"
				@cancel-button-clicked="closeModal"/>
		</section>
	</v-container>
</template>

<script>
import appTable from './../../shared/table/app-table';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		({ data: this.rows } = await this.getCheckSeries(this.params));
	} catch (error) {
		this.showGenericError();
	}
}

function closeModal() {
	this.$emit('close-modal');
	this.newCheckSequence = {
		serieStart: '',
		serieEnd: '',
	};
}

async function addCheckSequence() {
	const body = {
		serieStart: '',
		serieEnd: '',
		numberStart: this.newCheckSequence.serieStart,
		numberEnd: this.newCheckSequence.serieEnd,
		description: this.newCheckSequence.description || '',
		bankAccountId: this.bankAccountId,
	};
	try {
		await this.$httpSales.post('check-series', body);
		this.showNotification('Secuencia creada con éxito');
		this.currentPage = 1;
		this.newCheckSequence = {
			serieStart: '',
			serieEnd: '',
		};
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function slideLabel() {
	return 'Crear Cheque';
}

function data() {
	return {
		addNew: true,
		columns: [
			{ id: 1, name: 'Sec. Inicio', value: 'init', visible: true, checked: true },
			{ id: 2, name: 'Sec. Fin', value: 'check', visible: true, checked: true },
			{ id: 3, name: 'Estado', value: 'amount', visible: true, checked: true },
		],
		rows: [],
		currentPage: 1,
		newCheckSequence: {
			serieStart: '',
			serieEnd: '',
		},
		params: {
			page: 1,
		},
	};
}

export default {
	name: 'check-sequence',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		slideLabel,
	},
	created,
	data,
	methods: {
		addCheckSequence,
		changePage,
		closeModal,
		loadData,
	},
	props: {
		bankAccountId: {
			type: Number,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.collpase-container {
	height: 0px;
	overflow: hidden;
	transition: height 200ms cubic-bezier(0.19, 1, 0.22, 1);
}
.expand-container {
	height: 130px;
}
.expand-arrow {
	transform: rotateZ(180deg);
}
.arrow-active {
	transform: rotateZ(0deg);
}
</style>


