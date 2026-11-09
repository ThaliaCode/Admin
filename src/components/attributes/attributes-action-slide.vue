<template>
	<div>
		<v-layout row wrap pt-3 px-3>
			<v-flex xs9 mb-2 pr-2 v-if="!row">
				<v-flex xs12 class="caption">
					Tipo de Modo:
				</v-flex>
				<v-radio-group class="pt-2" row v-model="row.mode">
					<v-radio
						hide-details
						color="success"
						label="Modo Online"
						value="online"
					></v-radio>
					<v-radio
						hide-details
						color="success"
						label="Modo Ventas"
						value="sales"
					></v-radio>
				</v-radio-group>
			</v-flex>
			<v-flex xs6 mb-2 pr-2>
				<app-input-text
					:disabled="!!row.id"
					label="Código"
					model="code"
					:readonly="!!row.id"
					:text="row.code"
					@input="$emit('get-data', $event)"
				></app-input-text>
				<span class="error--text caption" v-if="!row.code">
					El código es requerido
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(row.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs6 mb-2 pl-2>
				<app-input-text
					label="Nombre"
					model="name"
					:text="row.name"
					@input="$emit('get-data', $event)"
				></app-input-text>
				<span class="error--text caption" v-if="!row.name">
					El nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<app-select
					:item="row.type"
					item-text="name"
					item-value="id"
					:items="types"
					label="Tipo"
					model="type"
					:return-object="false"
					@input="$emit('get-data', $event)"
				></app-select>
				<span class="error--text caption" v-if="!row.type">
					El tipo es requerido
				</span>
			</v-flex>
		</v-layout>
		<v-layout row wrap px-3 class="identifier-section">
			<v-flex xs11>
				<v-layout row wrap align-start>
					<v-flex xs6 mb-2 pr-2>
						<app-input-text
							label="Código del identificador"
							model="code"
							:text="identifier.code"
							@input="getDataLocal"
							@input-enter="addIdentifier"
						></app-input-text>
						<span class="error--text caption" v-if="!identifier.code">
							El código es requerido
						</span>
					</v-flex>
					<v-flex xs6 mb-2 pl-2>
						<app-input-text
							label="Nombre del identificador"
							model="name"
							:text="identifier.name"
							@input="getDataLocal"
							@input-enter="addIdentifier"
						></app-input-text>
						<span class="error--text caption" v-if="!identifier.name">
							El nombre es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 pt-4 text-xs-center>
				<app-tooltip-button
					color="success"
					:disabled="(!identifier.code && !identifier.name) || checkBlankCode(row.code)"
					height="30"
					icon="add_circle"
					:text="edit ? 'Actualizar identificador' : 'Agregar identificador'"
					@click-icon="addIdentifier"
				></app-tooltip-button>
			</v-flex>
		</v-layout>
		<v-layout row wrap px-3 pb-5 mb-5 class="identifier-section-table">
			<v-flex xs12 pt-3>
				<label class="label-table pl-1 pb-2">IDENTIFICADORES</label>
				<app-table
					class="no-main-list"
					:columns="columns"
					:filter-columns="false"
					:input-search="false"
					key-value="code"
					:main-list="false"
					name="attributes-details"
					padding="px-0"
					:rows="row.attributeDetail"
				>
					<template slot="rows" slot-scope="props">
						<td
							class="is-not-selectable"
							v-show="showRow(columns, 1)"
						>
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">
							<app-tooltip-button
								color="success"
								icon="edit"
								text="Editar"
								@click-icon="editIdentifier(props.row, props.index)"
							></app-tooltip-button>
							<app-tooltip-button
								color="error"
								icon="delete"
								text="Eliminar"
								@click-icon="$emit('delete-identifier', props.index)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!row.code || !row.name || row.attributeDetail.length === 0"
				@accept-button-clicked="$emit('save-attribute')"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function addIdentifier() {
		if (this.identifier.code && this.identifier.name) {
			this.$emit('add-identifier', this.identifier, this.index);
			this.identifier = {
				code: '',
				name: '',
			};
		} else {
			this.showNotification('Los dos campos son requeridos', 'warning');
		}
	}

	function editIdentifier(form, index) {
		this.edit = true;
		this.identifier = { ...form };
		this.index = index;
	}

	function getDataLocal({ model, value }) {
		this.identifier[model] = value;
	}

	function data() {
		return {
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: '',
					value: 'actions',
					checked: true,
					visible: true,
					flagVisible: true,
				},
			],
			edit: false,
			identifier: {
				code: '',
				name: '',
			},
			index: null,
			types: [
				{
					id: 1,
					name: 'Selección Múltiple',
				},
				{
					id: 2,
					name: 'Selección Única',
				},
				{
					id: 3,
					name: 'Informativo',
				},
			],
		};
	}

	export default {
		name: 'attributes-action-slide',
		components: {
			appTable,
			modalSidebarButton,
		},
		data,
		methods: {
			addIdentifier,
			editIdentifier,
			getDataLocal,
		},
		props: {
			row: {
				default: () => {},
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.label-table {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium16);
	}

	.identifier-section {
		background-color: rgba(195, 231, 232, 0.16);
		border-bottom: 1px solid rgba(195, 231, 232, 0.2);
		border-top: 1px solid color(item-select);
		margin-top: 20px;
		
		&-table {
			background-color: rgba(195, 231, 232, 0.1);
		}
	}
</style>