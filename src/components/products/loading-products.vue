<template>
	<div class="px-4">
		<v-layout wrap mt-3>
			<v-flex xs6>
				<app-select
					:item="loadProducts.salPriceListId"
					:items="listPrices"
					:disabled="loadProducts.useCost"
					item-text="name"
					item-value="id"
					label="Lista de precio"
					model="salPriceListId"
					:return-object="false"
					@input="setDataCommerce"
				></app-select>
			</v-flex>
		</v-layout>
		<v-layout row wrap mt-3>
			<!-- PRECIO DE VENTA -->
			<p class="sub-label-input mr-2 pt-1">Precio Venta</p>
			<!-- SWITCH -->
			<v-flex xs1 mx-2>
				<v-tooltip top>
					<template slot="activator">
						<v-switch
							color="primary"
							hide-details
							:disabled="$userInfo.company.settings.flagKardexValued"
							v-model="loadProducts.useCost"
							@change="handleSwitchChange"
						></v-switch>
					</template>

					<span v-if="$userInfo.company.settings.flagKardexValued">
						Esta utilizando costo promedio, no puede usar la opcion precio de costo
					</span>
					<span v-else> Tipos de precios </span>
				</v-tooltip>
			</v-flex>
			<!-- PRECIO DE COSTO -->
			<p class="sub-label-input mr-2 pt-1">Precio de Costo</p>
		</v-layout>

		<v-layout wrap mt-3>
			<v-flex xs12 mt-2>
				<v-layout class="title-form">
					<v-flex xs8 class="show-desktop">
						<v-layout row wrap align-center pl-4>
							<v-flex xs6 pl-2>
								<label ref="label" for="upload-file-prices">
									<vue-six-four
										id="upload-file-prices"
										hidden
										@vue-six-four="importPrices"
									/>
									<v-btn
										class="btn-action btn-auto btn-full py-2"
										color="success"
										outline
										@click="onClick('import')"
									>
										<img src="/static/img/excel.svg" height="19" class="ml-0 mr-2" />
										<span class="primary--text"
											>Importar {{ loadProducts.useCost ? 'costos' : 'precios' }}</span
										>
									</v-btn>
								</label>
							</v-flex>
							<v-flex xs6 pl-2>
								<v-btn
									class="btn-action btn-auto btn-full py-2"
									color="success"
									outline
									@click="onClick('export')"
								>
									<img src="/static/img/excel.svg" height="19" class="ml-0 mr-2" />
									<span class="primary--text"
										>Exportar {{ loadProducts.useCost ? 'costos' : 'precios' }}</span
									>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout mt-4 xs8 v-if="!loadProducts.useCost">
			<span style="color: red; font-size: 12px">
				Tener en cuenta que esta carga masiva de precios de venta actualizará el precio de
				todas las tiendas/almacenes
			</span>
		</v-layout>

		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="false"
				hidden-save-btn
				:cancel-text="'Atras'"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import helper from '@/shared/helper';

const { generateBlob, showDownloadDialog } = helper;

async function importPrices(fileInfo) {
	const name = fileInfo.name.replace(/\s/g, '-');
	const body = {
		base64: fileInfo.sixFour,
		type: Number(this.type),
		salPriceListId: this.loadProducts.salPriceListId || undefined,
		useCost: this.loadProducts.useCost,
		columns: this.loadProducts.useCost ? ['id', 'code', 'name', 'cost'] : undefined,
	};
	this.loading = true;
	try {
		const words = name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFilesPrices.indexOf(extension) > -1) {
			const { data: response } = await this.$httpProducts.post('products/imports', body);
			this.showNotification(
				`Se han importado ${response.length} productos correctamente.`,
				'success'
			);
			this.$emit('close-modal');
			this.$emit('reload-products');
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFilesPrices.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showNotification(
					'No se pudo leer el archivo excel. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			} else if (error.data.message === 'WRITE_FILE_XLSX_ERROR') {
				this.showNotification(
					'Se produjo un error de escritura en el archivo. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			} else if (error.data.message === 'MISSING_COLUMN_ERROR') {
				this.showNotification(
					`El archivo contiene productos sin columna de ${
						this.loadProducts.useCost ? 'costo' : 'precio'
					}, verifique los datos.`,
					'error'
				);
			} else if (error.data.message) {
				this.showNotification(error.data.message, 'error');
			} else {
				this.showGenericError();
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function buildBody() {
	const productsOrder = this.products.map((p) => ({
		productId: p.id,
		order: p.order || 0,
	}));

	return { productsOrder };
}

async function exportPrices() {
	const responseType = 'blob';
	const body = {
		type: Number(this.type),
		salPriceListId: this.loadProducts.salPriceListId || undefined,
		useCost: this.loadProducts.useCost,
		columns: this.loadProducts.useCost ? ['id', 'code', 'name', 'cost'] : undefined,
	};
	this.loading = true;
	try {
		const { data: response } = await this.$httpProducts.post('products/exports', body, {
			responseType,
		});
		const blob = generateBlob(
			response,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		if (this.loadProducts.salPriceListId) {
			const name = this.listPrices.find(
				(lp) => lp.id === this.loadProducts.salPriceListId
			).name;
			showDownloadDialog(blob, `precios-list-${name}`, 'xlsx');
		} else {
			showDownloadDialog(blob, 'costos-productos', 'xlsx');
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

export default {
	name: 'loading-products',
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	data() {
		return {
			listPrices: [],
			loadProducts: {
				salPriceListId: null,
				useCost: false,
			},
			allowedFilesPrices: ['xls', 'xlsx'],
		};
	},
	async created() {
		const request = [this.listPricingPromise()];
		try {
			[{ data: this.listPrices }] = await Promise.all(request);
			this.listPrices = this.listPrices.map((price) => {
				const newPrice = Object.assign({}, price);
				newPrice.type = 'salPriceId';
				return newPrice;
			});
		} catch (error) {
			this.showGenericError();
		}
	},
	methods: {
		buildBody,
		importPrices,
		exportPrices,
		showDialogPrices() {
			this.$refs.label.click();
		},
		setDataCommerce({ model, value }) {
			if (model === 'salPriceListId') {
				this.loadProducts.salPriceListId = value;
			}
		},
		handleSwitchChange() {
			this.loadProducts.salPriceListId = null;
		},
		onClick(code) {
			const { useCost, salPriceListId } = this.loadProducts;
			if (code === 'import') {
				if (useCost) {
					this.showDialogPrices();
				} else if (!salPriceListId) {
					this.showNotification(
						'Debe seleccionar una lista de precios para continuar con la operación.',
						'info'
					);
				} else {
					this.showDialogPrices();
				}
			} else if (code === 'export') {
				if (useCost) {
					this.exportPrices();
				} else if (!salPriceListId) {
					this.showNotification(
						'Debe seleccionar una lista de precios para continuar con la operación.',
						'info'
					);
				} else {
					this.exportPrices();
				}
			}
		},
	},
	props: {
		type: [Number, String],
		products: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped>
.sub-label-input {
	color: #95999c;
	font-family: font(open-bold);
	font-size: size(small13);
	justify-content: flex-start;
	text-align: left;
	margin: 0;
}
</style>
