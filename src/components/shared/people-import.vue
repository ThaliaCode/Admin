<template>
	<div>
		<v-layout wrap align-center pa-4 body-1>
			<v-flex xs12 body-2> Descargar plantilla de excel: </v-flex>
			<v-flex xs12 mb-4>
				<a
					href="/static/excel/plantilla-importar-personas.xlsx"
					download="plantilla-excel-importar-personas"
				>
					Plantilla excel para carga de {{ typePersonName }}
				</a>
			</v-flex>
			<v-flex xs12 body-2> Carga de clientes con coordenadas: </v-flex>
			<v-flex xs12>
				<a
					href="/static/excel/carga-de-clientes-con-coordenadas_2443.xlsx"
					download="plantilla-excel-importar-personas"
				>
					Plantilla excel para carga de {{ typePersonName }} con coordenadas
				</a>
			</v-flex>
			<v-flex xs12 mt-3>
				<label ref="label" for="download-excel">
					<vue-six-four
						ref="vueSixFour"
						id="download-excel"
						hidden
						@vue-six-four="getFile"
					/>
					<v-layout align-end pr-2>
						<v-flex xs11>
							<app-input-text label="Subir Excel" readonly :text="name" />
						</v-flex>
						<v-flex xs1 text-xs-left class="pb2">
							<v-btn
								@click="showDialog"
								class="ma-0 pl-0 btn-auto"
								small
								color="pink"
							>
								<v-icon color="white">attach_file</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!name || isLoading"
				@cancel-button-clicked="close"
				@accept-button-clicked="importRegisters"
			/>
		</section>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeEntity from '@/shared/type-entity';

function mounted() {
	this.clear();
}

function clear() {
	this.file = {};
	this.name = '';
	this.$refs.vueSixFour.$el.value = '';
}

function close() {
	this.clear();
	this.$emit('close');
}

function getFile(fileInfo) {
	this.name = fileInfo.name.replace(/\s/g, '-');
	const base64data = fileInfo.sixFour.split('base64,');
	this.file = {
		base64: base64data[1],
		typeEntity: typeEntity[this.typePerson],
	};
}

async function importRegisters() {
	try {
		this.isLoading = true;
		const words = this.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: response } = await this.$httpSales.post(
				'import-customers',
				this.file
			);
			this.showNotification(
				`La importación de ${this.typePersonName} se realizo exitosamente.`
			);
			this.$emit('people-imported');
			if (response.importError.length) {
				const messageError = `No se pudieron agregar los siguientes clientes${
					response.importSuccessful
						? `, solo pudimos agregar ${response.importSuccessful} cliente(s).`
						: '.'
				}`;
				this.$emit('customers-errors', {
					details: response.importError,
					messageError,
				});
			}
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
		this.close();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'TYPE_ENTITY_NOT_FOUND') {
				this.showGenericError('Tipo de persona no encontrado.');
			} else if (err.data.message === 'FILE_XLSX_EMPTY') {
				this.showGenericError('La plantilla se encuentra vacía.');
			} else if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
				this.showGenericError(
					'Uno o más números de documento de la plantilla ya se encuentran registrados.'
				);
			} else if (err.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showGenericError('Error de lectura de excel.');
			} else if (err.data.message === 'FLAG_TYPE_PERSON_EMPTY') {
				this.showGenericError(
					'El tipo de persona es requerido en todas las filas.'
				);
			} else if (err.data.message === 'DOCUMENT_NUMBER_EMPTY') {
				this.showGenericError(
					'El número de documento es requerido en todas las filas.'
				);
			}
			if (err.data && err.data.details) {
				this.$emit('customers-errors', err.data);
			}
		}
		this.clear();
	} finally {
		this.isLoading = false;
	}
}

function showDialog() {
	this.$refs.label.click();
}

function typePersonName() {
	return this.typePerson === 'Customer' ? 'clientes' : 'proveedores';
}

function data() {
	return {
		allowedFiles: ['xls', 'xlsx'],
		file: {},
		name: '',
		isLoading: false,
	};
}

export default {
	name: 'people-import',
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		typePersonName,
	},
	data,
	methods: {
		clear,
		close,
		getFile,
		importRegisters,
		showDialog,
	},
	mounted,
	props: {
		typePerson: {
			default: 'Customer',
			type: String,
		},
	},
};
</script>

<style lang="scss" scoped>
.pb2 {
	padding-bottom: 2px;
}
</style>
