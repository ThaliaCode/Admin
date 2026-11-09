<template>
	<div>
		<general-filter>
			<v-layout row wrap align-center>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-select
						v-bind:items="items"
						v-model="item"
						label="Rubro"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-select
						v-bind:items="meetings"
						v-model="meeting"
						label="Visita"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-select
						v-bind:items="status"
						v-model="state"
						label="Estado"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-select
						v-bind:items="amounts"
						v-model="amount"
						label="Monto Estimado"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="projects"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				local-storage
				include-filter
				add-button
				selectable
				:check-all="checkAll"
				:last-page="lastPage"
				@on-toggle-columns="toggleColumns"
				v-on:on-search-event="callServiceAndSearch"
				v-on:on-page="changePage"
				v-on:row-is-selected="rowIsSelected"
				v-on:on-selected-all="selectedAll">
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.customer }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.item }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.meeting }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.time }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.estimatedAmount }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.status.name }}</td>
					<td v-show="showRow(columns, 8)">
						<button
							type="button"
							v-on:click="showQuotation(props.row)"
							class="table-icon">
							<img :src="`${$imageUrl}/see-details.svg`" alt="" class="align-img">
						</button>
						<router-link
							to="/"
							class="table-icon">
							<img :src="`${$imageUrl}/editar.svg`" alt=""
								class="align-img" height="14" width="15">
						</router-link>
						<a
							@click.prevent="downloadSale(props.row)"
							class="table-icon">
							<img :src="`${$imageUrl}/download.svg`" alt="" class="align-img">
						</a>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:is-loading="loading"
			:help-actions="actionsToHelp"
			v-on:close-modal="closeModal">
			<v-layout
				v-if="rowSelected"
				row wrap align-center
				class="modal-quotation">
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Código de Requerimiento:
					</label>
					<span class="modal-quotation-text">

					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Nombre:
					</label>
					<span class="modal-quotation-text">
						Luis Cardoza Carrera
					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Empresa:
					</label>
					<span class="modal-quotation-text">
						Grupo Incot S.A.C.
					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Rubro:
					</label>
					<span class="modal-quotation-text">
						Constructora
					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Teléfono:
					</label>
					<span class="modal-quotation-text">
						987 786 546
					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Visita Programada:
					</label>
					<span class="modal-quotation-text">
						10-02-2018
					</span>
				</v-flex>
				<v-flex xs12 px-4>
					<label class="modal-quotation-label">
						Dirección:
					</label>
					<span class="modal-quotation-text">
						José Pardo 123 - Miraflores
						<span class="modal-quotation-location">
							<img :src="`${$imageUrl}/location.svg`" alt="">
						</span>
					</span>
				</v-flex>
				<v-flex xs12 mt-3 mb-4 px-4>
					<label class="modal-quotation-label">
						Descripción de Requerimiento:
					</label>
					<span class="modal-quotation-text light">
						Es un hecho establecido hace demasiado tiempo que un
						lector se distraerá con el contenido del texto de un sitio
						mientras que mira su diseño. El punto de usar Lorem Ipsum
						es que tiene una distribución más o menos normal de las letras,
						al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí".
					</span>
				</v-flex>
				<v-flex xs12>
					<v-divider class="modal-divider"></v-divider>
				</v-flex>
				<v-flex xs12 mt-4 mb-3>
					<v-text-field
						class="filter-select"
						hide-details
						single-line
						type="text"
						label="Código de Cotización"
						v-model="rowSelected.code"
					></v-text-field>
				</v-flex>
				<v-flex xs6 mb-3 pr-1>
					<v-text-field
						class="filter-select"
						hide-details
						single-line
						type="number"
						label="Horas Estimadas"
						v-model.number="rowSelected.estimatedTime"
					></v-text-field>
				</v-flex>
				<v-flex xs6 mb-3 pl-1>
					<v-text-field
						class="filter-select"
						hide-details
						single-line
						type="number"
						label="Monto Estimado"
						v-model.number="rowSelected.estimatedAmount"
					></v-text-field>
				</v-flex>
				<v-flex xs6 mb-3 pr-1>
					<v-text-field
						class="filter-select"
						hide-details
						single-line
						type="number"
						label="Cantidad de Personal"
						v-model="rowSelected.staffAmount"
					></v-text-field>
				</v-flex>
				<v-flex xs6 mb-3 pl-1>
					<v-select
						v-bind:items="rowSelected.status"
						v-model="rowSelected.state"
						label="Estado"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 my-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						single-line
						label="Materiales"
						no-resize
						v-model="rowSelected.equipment"
					></v-text-field>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						class="filter-select"
						hide-details
						type="text"
						no-resize
						single-line
						label="Herramientas"
						v-model="rowSelected.tools"
					></v-text-field>
				</v-flex>
				<v-flex xs12>
					<v-text-field
						class="filter-select"
						hide-details
						single-line
						type="text"
						no-resize
						label="Observaciones"
						v-model="rowSelected.observations"
					></v-text-field>
				</v-flex>
			</v-layout>
			<section class="footer-modal">
				<div class="footer-container">
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						@click="applyAction"
						:disabled="isLoading">
						{{ btnActionText }}
						<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
					</v-btn>
				</div>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import actionSidebar from './../../shared/action-sidebar';
	import appTable from './../../shared/table/app-table';
	import generalFilter from './../../shared/general-filter';

	function applyAction() {
		this.showNotification('Acción realizada con éxito');
		this.closeModal();
	}

	function btnActionText() {
		const text = this.rowSelected && this.rowSelected.state === 'Confirmado' ?
			'Enviar' : 'Aceptar';
		return text;
	}

	function callServiceAndSearch(search) {
		this.searchData = search;
		if (search) {
			this.params.search = search;
		} else {
			this.params.search = null;
		}
		this.currentPage = 1;
	}

	function changePage(page) {
		this.currentPage = page;
		this.allIsSelected();
	}

	function closeModal() {
		this.action.code = '';
		this.action.open = false;
		this.action.title = '';
		this.action.width = 0;
	}

	async function downloadSale({ id, serie, number }) {
		try {
			const downloadDialog = this.$userInfo.company.settings.downloadSale;
			const params = { html: downloadDialog || null };
			const model = { code: 'pdf' };
			const responseType = 'blob';
			const response = await this.$httpReportSales.post(`sale-documents/${id}/pdf`, model, { params, responseType });
			const contentType = downloadDialog ? 'application/pdf' : 'text/html';
			const blob = helper.generateBlob(response.data, contentType);
			helper.showDownloadDialog(blob, `${serie}-${number}`, 'pdf', false);
		} catch (error) {
			this.showGenericError();
		}
	}

	function rowIsSelected(row, all) {
		if (row.isSelected) {
			if (this.dataSelected.length > 0 && all) {
				const dataToAdd = this.dataSelected.find(rowSelected =>
					rowSelected.id === row.id);
				if (!dataToAdd) {
					this.dataSelected.push(row);
				}
			} else {
				this.dataSelected.push(row);
			}
		} else {
			const index = this.dataSelected.findIndex(rowData => rowData.id
				=== row.id);
			this.dataSelected.splice(index, 1);
		}
		this.checkAll = this.data.every(check => check.isSelected);
	}

	function selectedAll(value) {
		this.checkAll = value;
		if (this.data.length > 0) {
			this.data = this.data.map((dataSingle) => {
				const newData = Object.assign({}, dataSingle);
				newData.isSelected = value;
				if (newData.isSelected) {
					if (this.dataSelected.length > 0) {
						const dataToAdd = this.dataSelected.find(rowSelected =>
							rowSelected.id === newData.id);
						if (!dataToAdd) {
							this.dataSelected.push(newData);
						}
					} else {
						this.dataSelected.push(newData);
					}
				} else {
					const index = this.dataSelected.findIndex(rowData => rowData.id
						=== newData.id);
					this.dataSelected.splice(index, 1);
				}
				return newData;
			});
		}
	}

	function showQuotation(row) {
		this.rowSelected = Object.assign({}, row);
		this.rowSelected.status = ['Pre-confirmado', 'Confirmado'];
		this.action.code = 'PC';
		this.action.title = 'Cotización';
		this.action.width = 651;
		this.action.open = true;
	}

	function toggleColumns() {
		return true;
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
				title: '',
				width: 0,
			},
			amount: null,
			amounts: [],
			checkAll: false,
			columns: [
				{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 2, name: 'Cliente', value: 'customer', visible: true, checked: true },
				{ id: 3, name: 'Rubro', value: 'item', visible: true, checked: true },
				{ id: 4, name: 'Visita Programada', value: 'meeting', visible: true, checked: true },
				{ id: 5, name: 'Nº Horas', value: 'time', visible: true, checked: true },
				{ id: 6, name: 'Monton estimado', value: 'estimatedAmount', visible: true, checked: true },
				{ id: 7, name: 'Estado', value: 'status', visible: true, checked: true },
				{ id: 8, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			data: [
				{
					id: 1,
					code: 'ABC123',
					customer: 'Cliente 1',
					item: 'TI',
					meeting: '23-02-2018, 3:00 p.m.',
					time: 300,
					estimatedAmount: 5000,
					status: {
						id: 1,
						name: 'Pendiente',
					},
				},
			],
			dataSelected: [],
			isLoading: false,
			item: null,
			items: [],
			lastPage: 1,
			loading: false,
			meeting: null,
			meetings: [],
			project: '',
			rowSelected: null,
			searchData: '',
			state: null,
			status: [],
		};
	}

	export default {
		name: 'list-of-quotations',
		components: {
			actionSidebar,
			appTable,
			generalFilter,
		},
		computed: {
			btnActionText,
		},
		data,
		methods: {
			applyAction,
			callServiceAndSearch,
			changePage,
			closeModal,
			downloadSale,
			rowIsSelected,
			selectedAll,
			showQuotation,
			toggleColumns,
		},
	};
</script>

<style lang="scss" scoped>
	.align-img {
		vertical-align: middle;
	}

	.modal {
		&-quotation {
			padding: 23px 29px 37px;

			&-label {
				color: map-get($colors, paginationText);
				font-family: map-get($fonts, open-semibold);
				font-size: 13px;
				font-weight: normal;
				line-height: 20px;
			}

			&-text {
				color: map-get($colors, paginationText);
				font-family: map-get($fonts, open-regular);
				font-size: map-get($sizes, small);
				line-height: 20px;

				&.light {
					font-family: map-get($fonts, open-light);
				}
			}

			&-location {
				background-color: map-get($colors, orange-btn);
				border-radius: 4px;
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .26);
				display: inline-block;
				height: 18px;
				line-height: 18px;
				text-align: center;
				width: 20px;

				img {
					vertical-align: sub;
				}
			}
		}

		&-divider {
			height: 2px;
		}
	}

	.footer-modal {
		background-color: white;
		border: 1px solid map-get($colors, grey);
		bottom: 0px;
		height: 9vh;
		position: fixed;
		width: 100%;

		.footer-container {
			@include flex-center;
			height: 100%;
		}
	}
</style>
