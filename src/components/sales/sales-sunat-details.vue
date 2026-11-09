<template>
	<section class="pa-3">
		<v-layout v-if="sale.statusTaxName && sale.statusTaxName.showDetails && isPeru" wrap>
			<v-flex xs12 class="mb-2" v-if="showXmlDownload">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="21"
					height="28"
					viewBox="0 0 21 28"
				>
					<g fill="#1F87E5" fill-rule="evenodd">
						<path
							d="M11.234 2.18c.236 0 .427-.213.427-.477v-.89c0-.265-.19-.478-.427-.478h-1.226V2.18h1.226zM8.355 2.657v.89c0 .264.191.477.428.477h1.225V2.18H8.783c-.237 0-.428.213-.428.477z"
						/>
						<path
							d="M11.234 5.7c.236 0 .427-.212.427-.476v-.89c0-.265-.19-.478-.427-.478h-1.226v1.845h1.226z"
						/>
						<path
							d="M8.355 6.178v.89c0 .264.191.477.428.477h.798c.236 0 .427-.213.427-.477V5.701H8.783c-.237 0-.428.21-.428.477zM11.228 8.383H8.954a.602.602 0 0 0-.599.603v3.825c0 .331.27.602.599.602h2.274c.33 0 .598-.27.598-.602V8.986a.602.602 0 0 0-.598-.603zM9.223 12.51h1.736v-.844H9.223v.844zM15.271 21.293h-.965v1.845h.991c.625 0 .992-.396.992-.915v-.015c-.003-.595-.393-.915-1.018-.915z"
						/>
						<path
							d="M20.417 6.11a42.09 42.09 0 0 0-.354-.407c-.162-.186-.32-.371-.482-.56-.192-.222-.384-.444-.575-.67l-.636-.736c-.218-.253-.437-.508-.656-.76l-.644-.746c-.197-.229-.395-.46-.593-.688-.17-.198-.338-.393-.51-.59l-.386-.448-.23-.265c-.117-.137-.273-.24-.456-.24H1.833C1.237 0 .752.493.752 1.099V26.9c0 .606.485 1.099 1.081 1.099h17.838c.596 0 1.081-.493 1.081-1.099V6.771c0-.021 0-.043-.003-.064-.015-.255-.18-.417-.332-.596zM8.84 20.88a.945.945 0 0 1-.237.614L5.548 25.1h2.718c.311 0 .572.265.572.581 0 .317-.26.572-.572.572H4.407a.583.583 0 0 1-.572-.581v-.024c0-.232.084-.435.236-.615l3.056-3.606H4.51a.575.575 0 0 1-.572-.572c0-.317.26-.581.572-.581h3.763c.311 0 .572.264.572.58v.025H8.84zm2.534 4.77a.648.648 0 1 1-1.294 0v-4.77a.648.648 0 1 1 1.294 0v4.77zm6.133-3.292c0 1.385-1.06 2.103-2.382 2.103h-.986v1.187a.648.648 0 1 1-1.294 0V20.93c0-.368.288-.657.647-.657h1.759c1.405 0 2.256.845 2.256 2.069v.015zm2.166-3.719H1.839V1.092h7.182v1.31c0 .252.2.456.449.456h1.288V1.092h3.604V6.71c0 .304.243.548.54.548h4.775v11.381h-.003z"
						/>
					</g>
				</svg>
				<a class="download-link info--text" @click.prevent="downloadFile('zip')">
					Descargar XML
				</a>
			</v-flex>
			<v-flex
				xs12
				class="mb-2"
				v-if="
					(sale.typeDocument && sale.typeDocument.code && sale.typeDocument.code !== 'BOL') || !isSale
				"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="21"
					height="28"
					viewBox="0 0 21 28"
				>
					<g fill="#1F87E5" fill-rule="evenodd">
						<path
							d="M11.234 2.18c.236 0 .427-.213.427-.477v-.89c0-.265-.19-.478-.427-.478h-1.226V2.18h1.226zM8.355 2.657v.89c0 .264.191.477.428.477h1.225V2.18H8.783c-.237 0-.428.213-.428.477z"
						/>
						<path
							d="M11.234 5.7c.236 0 .427-.212.427-.476v-.89c0-.265-.19-.478-.427-.478h-1.226v1.845h1.226z"
						/>
						<path
							d="M8.355 6.178v.89c0 .264.191.477.428.477h.798c.236 0 .427-.213.427-.477V5.701H8.783c-.237 0-.428.21-.428.477zM11.228 8.383H8.954a.602.602 0 0 0-.599.603v3.825c0 .331.27.602.599.602h2.274c.33 0 .598-.27.598-.602V8.986a.602.602 0 0 0-.598-.603zM9.223 12.51h1.736v-.844H9.223v.844zM15.271 21.293h-.965v1.845h.991c.625 0 .992-.396.992-.915v-.015c-.003-.595-.393-.915-1.018-.915z"
						/>
						<path
							d="M20.417 6.11a42.09 42.09 0 0 0-.354-.407c-.162-.186-.32-.371-.482-.56-.192-.222-.384-.444-.575-.67l-.636-.736c-.218-.253-.437-.508-.656-.76l-.644-.746c-.197-.229-.395-.46-.593-.688-.17-.198-.338-.393-.51-.59l-.386-.448-.23-.265c-.117-.137-.273-.24-.456-.24H1.833C1.237 0 .752.493.752 1.099V26.9c0 .606.485 1.099 1.081 1.099h17.838c.596 0 1.081-.493 1.081-1.099V6.771c0-.021 0-.043-.003-.064-.015-.255-.18-.417-.332-.596zM8.84 20.88a.945.945 0 0 1-.237.614L5.548 25.1h2.718c.311 0 .572.265.572.581 0 .317-.26.572-.572.572H4.407a.583.583 0 0 1-.572-.581v-.024c0-.232.084-.435.236-.615l3.056-3.606H4.51a.575.575 0 0 1-.572-.572c0-.317.26-.581.572-.581h3.763c.311 0 .572.264.572.58v.025H8.84zm2.534 4.77a.648.648 0 1 1-1.294 0v-4.77a.648.648 0 1 1 1.294 0v4.77zm6.133-3.292c0 1.385-1.06 2.103-2.382 2.103h-.986v1.187a.648.648 0 1 1-1.294 0V20.93c0-.368.288-.657.647-.657h1.759c1.405 0 2.256.845 2.256 2.069v.015zm2.166-3.719H1.839V1.092h7.182v1.31c0 .252.2.456.449.456h1.288V1.092h3.604V6.71c0 .304.243.548.54.548h4.775v11.381h-.003z"
						/>
					</g>
				</svg>
				<a
					v-if="showCdrDownload"
					class="download-link info--text"
					@click.prevent="downloadFile('cdr')"
				>
					Descargar CDR
				</a>
			</v-flex>
			<v-flex
				xs12
				class="mb-2"
				v-if="sale.dataResponseTaxes && sale.dataResponseTaxes.documentUrl"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="21"
					height="28"
					viewBox="0 0 60 83"
				>
					<g fill="#1F87E5" fill-rule="evenodd">
						<path
							d="M28.406 61.838c-.98 0-1.613.085-1.988.171v12.7c.375.086.98.086 1.527.086 3.973.027 6.567-2.161 6.567-6.797.027-4.032-2.332-6.16-6.106-6.16zM11.441 61.779c-.89 0-1.496.086-1.812.172v5.73c.375.086.836.117 1.465.117 2.336 0 3.773-1.179 3.773-3.168 0-1.785-1.238-2.851-3.426-2.851z"
						/>
						<path
							d="M59.184 19.955a1.566 1.566 0 0 0-.379-1.035L43.07.947l-.011-.012a1.589 1.589 0 0 0-.426-.328 1.445 1.445 0 0 0-.313-.133c-.031-.008-.058-.019-.086-.027A1.466 1.466 0 0 0 41.867.4H3.199A3.206 3.206 0 0 0 0 3.599v75.199a3.207 3.207 0 0 0 3.199 3.204H56a3.204 3.204 0 0 0 3.199-3.204V20.134c0-.062-.008-.121-.015-.179zM17.43 69.123c-1.496 1.41-3.711 2.043-6.305 2.043-.574 0-1.094-.028-1.496-.086v6.941H5.281V58.869c1.352-.227 3.254-.403 5.93-.403 2.707 0 4.637.52 5.934 1.555 1.238.981 2.07 2.594 2.07 4.492 0 1.903-.629 3.516-1.785 4.61zm18.519 6.593c-2.043 1.7-5.152 2.504-8.953 2.504-2.273 0-3.887-.144-4.984-.285V58.869c1.613-.258 3.718-.403 5.933-.403 3.684 0 6.075.664 7.95 2.075 2.015 1.496 3.281 3.886 3.281 7.316 0 3.715-1.356 6.277-3.227 7.859zm17.973-13.503h-7.461v4.433h6.969v3.57h-6.969v7.805h-4.402v-19.41h11.863v3.602zM3.199 54.732V3.599h37.067v16.375a1.6 1.6 0 0 0 1.601 1.598H56v33.16H3.199z"
						/>
						<path
							d="M46.016 34.791c-.094-.008-2.348-.215-5.809-.215-1.086 0-2.176.019-3.254.062-6.836-5.129-12.433-10.261-15.43-13.14.055-.317.09-.567.11-.758.394-4.172-.043-6.988-1.301-8.371-.824-.906-2.035-1.207-3.297-.864-.781.208-2.23.965-2.695 2.512-.512 1.711.312 3.785 2.476 6.192.032.035.77.804 2.102 2.109-.867 4.133-3.137 13.059-4.238 17.344-2.586 1.383-4.742 3.047-6.41 4.957l-.11.125-.07.148c-.176.363-.996 2.238-.379 3.742.281.684.809 1.184 1.527 1.446l.192.054s.172.036.476.036c1.336 0 4.633-.7 6.399-7.211l.429-1.653c6.168-3 13.879-3.965 19.469-4.234a130.437 130.437 0 0 0 8.508 5.824l.09.051c.133.07 1.351.672 2.773.672 2.035 0 3.52-1.25 4.074-3.426l.028-.148c.152-1.243-.156-2.364-.903-3.239-1.57-1.847-4.496-2.008-4.757-2.015zM9.957 47.771a.128.128 0 0 1-.023-.047c-.133-.32.027-1.094.261-1.66 1.004-1.125 2.211-2.16 3.606-3.09-1.356 4.395-3.332 4.774-3.844 4.797zm8.617-29.195c-2.082-2.321-2.051-3.469-1.941-3.856.187-.648 1.015-.894 1.023-.894.418-.113.672-.094.899.156.511.563.949 2.258.777 5.363a59.432 59.432 0 0 1-.758-.769zM17.5 38.338l.035-.141-.004.004c1.043-4.09 2.547-10.074 3.414-13.918l.032.027v-.015c2.8 2.636 7.093 6.492 12.234 10.503h-.055l.082.067c-4.84.41-10.625 1.363-15.738 3.473zm31.801 1.339c-.367 1.356-1.078 1.539-1.727 1.539-.754 0-1.48-.312-1.648-.39a122.31 122.31 0 0 1-5.766-3.852h.047c3.34 0 5.566.203 5.652.211.559.02 2.325.281 3.082 1.176.301.352.414.769.36 1.316z"
						/>
					</g>
				</svg>
				<a class="download-link info--text" @click.prevent="downloadFile('pdf')">
					Descargar PDF
				</a>
			</v-flex>
		</v-layout>
		<v-layout v-if="sale.statusTaxName.showDetails && isEcuador" wrap>
			<v-flex xs12 class="mb-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="21"
					height="28"
					viewBox="0 0 21 28"
				>
					<g fill="#1F87E5" fill-rule="evenodd">
						<path
							d="M11.234 2.18c.236 0 .427-.213.427-.477v-.89c0-.265-.19-.478-.427-.478h-1.226V2.18h1.226zM8.355 2.657v.89c0 .264.191.477.428.477h1.225V2.18H8.783c-.237 0-.428.213-.428.477z"
						/>
						<path
							d="M11.234 5.7c.236 0 .427-.212.427-.476v-.89c0-.265-.19-.478-.427-.478h-1.226v1.845h1.226z"
						/>
						<path
							d="M8.355 6.178v.89c0 .264.191.477.428.477h.798c.236 0 .427-.213.427-.477V5.701H8.783c-.237 0-.428.21-.428.477zM11.228 8.383H8.954a.602.602 0 0 0-.599.603v3.825c0 .331.27.602.599.602h2.274c.33 0 .598-.27.598-.602V8.986a.602.602 0 0 0-.598-.603zM9.223 12.51h1.736v-.844H9.223v.844zM15.271 21.293h-.965v1.845h.991c.625 0 .992-.396.992-.915v-.015c-.003-.595-.393-.915-1.018-.915z"
						/>
						<path
							d="M20.417 6.11a42.09 42.09 0 0 0-.354-.407c-.162-.186-.32-.371-.482-.56-.192-.222-.384-.444-.575-.67l-.636-.736c-.218-.253-.437-.508-.656-.76l-.644-.746c-.197-.229-.395-.46-.593-.688-.17-.198-.338-.393-.51-.59l-.386-.448-.23-.265c-.117-.137-.273-.24-.456-.24H1.833C1.237 0 .752.493.752 1.099V26.9c0 .606.485 1.099 1.081 1.099h17.838c.596 0 1.081-.493 1.081-1.099V6.771c0-.021 0-.043-.003-.064-.015-.255-.18-.417-.332-.596zM8.84 20.88a.945.945 0 0 1-.237.614L5.548 25.1h2.718c.311 0 .572.265.572.581 0 .317-.26.572-.572.572H4.407a.583.583 0 0 1-.572-.581v-.024c0-.232.084-.435.236-.615l3.056-3.606H4.51a.575.575 0 0 1-.572-.572c0-.317.26-.581.572-.581h3.763c.311 0 .572.264.572.58v.025H8.84zm2.534 4.77a.648.648 0 1 1-1.294 0v-4.77a.648.648 0 1 1 1.294 0v4.77zm6.133-3.292c0 1.385-1.06 2.103-2.382 2.103h-.986v1.187a.648.648 0 1 1-1.294 0V20.93c0-.368.288-.657.647-.657h1.759c1.405 0 2.256.845 2.256 2.069v.015zm2.166-3.719H1.839V1.092h7.182v1.31c0 .252.2.456.449.456h1.288V1.092h3.604V6.71c0 .304.243.548.54.548h4.775v11.381h-.003z"
						/>
					</g>
				</svg>
				<a class="download-link info--text" @click.prevent="downloadFile">
					Descargar XML
				</a>
			</v-flex>
		</v-layout>
		<v-layout v-if="sale.statusTaxName && sale.statusTaxName.showDetails" wrap>
			<v-flex xs12 class="mb-2">
				<v-alert :value="!!sale.sunatError" type="error">
					<template v-if="sale.sunatError === 'ERROR_FROM_SUNAT' && isPeru">
						La SUNAT ha dado un error y no se pudo completar la operación.
					</template>
					<template v-else>
						{{ sale.sunatError }}
					</template>
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout
			v-if="isPeru && sale.statusTaxName && Object.keys(sale.statusTaxName).length"
			class="listItem"
		>
			<span>Estado actual de la venta: </span>
			<document-state :color="sale.statusTaxName ? sale.statusTaxName.color : 'grey'" />
			<b v-if="sale.statusTaxName && sale.statusTaxName.name">
				{{ sale.statusTaxName.name.toUpperCase() }}
			</b>
		</v-layout>
		<v-layout wrap v-if="isPeru">
			<h3 :style="{ margin: '20px 0px' }">Leyenda de estados SUNAT</h3>
			<div v-for="(status, index) in sunatStatusLegend" :key="index" class="listItem">
				<document-state :color="status.themeColor" />
				<div :style="{ color: status.color, fontWeight: 'bold', minWidth: '130px' }">
					{{ status.name }}:
				</div>
				<div>{{ status.description }}</div>
			</div>
		</v-layout>
	</section>
</template>

<script>
import documentState from '@/components/shared/document-state';

async function downloadFile(typeFile) {
	if (this.isPeru) {
		const {
			documentNumberComplete,
			subsidiaryRuc,
			subsidiary,
			dataResponseTaxes,
		} = this.sale;
		const ruc = (subsidiary && subsidiary.ruc) || subsidiaryRuc;
		const codeTaxes = this.computedCodeTaxes;
		const docNumber = documentNumberComplete || this.sale.numericalIdentification;

		if (!ruc || !codeTaxes || !docNumber) {
			this.showNotification('Información insuficiente para la descarga', 'error');
			return;
		}

		const requestUrl = `admin/download/${ruc}/document/${docNumber}/typeDocument/${codeTaxes}/${typeFile}`;
		const url = `${process.env.FACTURACION_SUNAT_URL}/${requestUrl}`;
		const fileNamePath = `${subsidiaryRuc}-${codeTaxes}-${docNumber}`;
		if (dataResponseTaxes && typeFile === 'zip') {
			// Nueva facturacion
			const s3Base = process.env.AWS_S3_SUNAT_FILES;
			if (s3Base && s3Base !== 'undefined') {
				const newUrl = `${s3Base}/${ruc}/${fileNamePath}.ZIP`;
				if (
					this.sale.subsidiary &&
					this.sale.subsidiary.typeBillingAgreed === 'sunatFactV4' &&
					!dataResponseTaxes.xmlUrl
				) {
					this.dataResponse = await this.loadSunatInvoicing();
				}
				window.open(
					(this.dataResponse &&
						this.dataResponse.documentS3 &&
						this.dataResponse.documentS3.URL_XML) ||
						dataResponseTaxes.xmlUrl ||
						newUrl
				);
			} else if (dataResponseTaxes.xmlUrl) {
				window.open(dataResponseTaxes.xmlUrl);
			} else {
				window.open(url);
			}
		} else if (dataResponseTaxes && typeFile === 'cdr') {
			// Nueva facturacion
			const s3Base = process.env.AWS_S3_SUNAT_FILES;
			const newUrl =
				s3Base && s3Base !== 'undefined'
					? `${s3Base}/${ruc}/R-${fileNamePath}.xml.ZIP`
					: null;
			if (dataResponseTaxes.cdrUrl) {
				window.open(dataResponseTaxes.cdrUrl);
			} else if (newUrl) {
				window.open(newUrl);
			} else {
				window.open(url);
			}
		} else if (dataResponseTaxes && dataResponseTaxes.documentUrl && typeFile === 'pdf') {
			window.open(dataResponseTaxes.documentUrl);
		} else if (codeTaxes) {
			window.open(url);
		} else {
			this.showNotification('Tipo de documento no válido', 'error');
		}
	} else if (this.isEcuador) {
		if (this.sale.qrUrl) {
			window.open(this.sale.qrUrl);
		} else {
			this.showNotification('No se encontró ningún documento para descargar.', 'info');
		}
	}
}

function isEcuador() {
	return this.$userInfo.company.comCountryId === 2;
}

function isPeru() {
	return this.$userInfo.company.comCountryId === 1;
}

function data() {
	return {
		sunatStatusLegend: [
			{
				name: 'Sin enviar',
				color: 'black',
				themeColor: 'black',
				description: 'Documento sin enviar a SUNAT.',
			},
			{
				name: 'En proceso',
				color: '#FBC02D',
				themeColor: 'amber',
				description: 'Documento en proceso de validación por SUNAT.',
			},
			{
				name: 'Firmado',
				color: '#9C27B0',
				themeColor: 'purple',
				description: 'Documento firmado y pendiente de envio a SUNAT.',
			},
			{
				name: 'Validado',
				color: '#cddc39',
				themeColor: 'lime',
				description: 'Documento enviado y validado por SUNAT.',
			},
			{
				name: 'Error',
				color: 'red',
				themeColor: 'red',
				description: 'Documento con error al firmar y pendiente de envio a SUNAT.',
			},
			{
				name: 'Error al firmar',
				color: 'red',
				themeColor: 'red',
				description:
					'El documento de venta ya ha sido enviado a SUNAT y firmado corectamente.',
			},
			{
				name: 'Error de SUNAT',
				color: '#ff5c00',
				themeColor: 'orange',
				description:
					'Documento con error por falla en la plataforma de SUNAT, se reenviara en cuanto la plataforma de sunat este operativo de nuevo.',
			},
		],
		dataResponse: null,
	};
}

export default {
	name: 'sales-sunat-details',
	computed: {
		isEcuador,
		isPeru,
		isSale() {
			return this.$route.name === 'list-of-sales';
		},
		computedCodeTaxes() {
			const { typeDocument, numericalIdentification } = this.sale;
			const typeDocCode = typeDocument ? typeDocument.code : null;
			const typeDoc = this.typeDocuments.find((t) => t.code === typeDocCode) || {};
			let codeTaxes = typeDoc.codeTaxes || this.summaryCode;

			if (!codeTaxes && numericalIdentification) {
				if (numericalIdentification.startsWith('RC-')) codeTaxes = 'RC';
				else if (numericalIdentification.startsWith('RA-')) codeTaxes = 'RA';
			}

			return codeTaxes;
		},
		showXmlDownload() {
			if (!this.isPeru) return false;
			const { dataResponseTaxes, subsidiary, subsidiaryRuc } = this.sale;
			if (dataResponseTaxes && dataResponseTaxes.xmlUrl) return true;

			const ruc = (subsidiary && subsidiary.ruc) || subsidiaryRuc;
			return !!(
				ruc &&
				this.computedCodeTaxes &&
				dataResponseTaxes &&
				dataResponseTaxes.xmlUrl
			);
		},
		showCdrDownload() {
			if (!this.isPeru) return false;
			const { typeDocument, dataResponseTaxes, subsidiary, subsidiaryRuc } = this.sale;
			if (typeDocument && typeDocument.code === 'BOL') return false;
			if (dataResponseTaxes && dataResponseTaxes.cdrUrl) return true;

			const ruc = (subsidiary && subsidiary.ruc) || subsidiaryRuc;
			return !!(ruc && this.computedCodeTaxes);
		},
	},
	props: {
		sale: {
			type: Object,
			required: true,
		},
		summaryCode: String,
		typeDocuments: {
			type: Array,
			default: () => [],
		},
	},
	methods: {
		downloadFile,
		async loadSunatInvoicing() {
			const isSummary = this.$route.name === 'cancel-summary' || this.$route.name === 'daily-summary';
			try {
				const sunat = await this.$httpSales.get(
					`facturacion-sunat/${this.sale.id}/document`,
					{
						params: { documentTypeCode: isSummary ? 'summary' : 'sale' }
					}
				);
				return sunat;
			} catch (err) {
				this.showGenericError();
				return null;
			}
		},
	},
	components: {
		documentState,
	},
	data,
};
</script>

<style scoped>
.download-link {
	margin-left: 10.2px;
	vertical-align: super;
}

.listItem {
	display: flex;
	gap: 20px;
	margin: 10px 0px;
}
</style>