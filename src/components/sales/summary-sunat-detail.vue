<template>
	<v-layout wrap>
		<v-flex xs12 class="mb-2 pa-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="21" height="28" viewBox="0 0 21 28">
				<g fill="#1F87E5" fill-rule="evenodd">
					<path d="M11.234 2.18c.236 0 .427-.213.427-.477v-.89c0-.265-.19-.478-.427-.478h-1.226V2.18h1.226zM8.355 2.657v.89c0 .264.191.477.428.477h1.225V2.18H8.783c-.237 0-.428.213-.428.477z"/>
					<path d="M11.234 5.7c.236 0 .427-.212.427-.476v-.89c0-.265-.19-.478-.427-.478h-1.226v1.845h1.226z"/>
					<path d="M8.355 6.178v.89c0 .264.191.477.428.477h.798c.236 0 .427-.213.427-.477V5.701H8.783c-.237 0-.428.21-.428.477zM11.228 8.383H8.954a.602.602 0 0 0-.599.603v3.825c0 .331.27.602.599.602h2.274c.33 0 .598-.27.598-.602V8.986a.602.602 0 0 0-.598-.603zM9.223 12.51h1.736v-.844H9.223v.844zM15.271 21.293h-.965v1.845h.991c.625 0 .992-.396.992-.915v-.015c-.003-.595-.393-.915-1.018-.915z"/>
					<path d="M20.417 6.11a42.09 42.09 0 0 0-.354-.407c-.162-.186-.32-.371-.482-.56-.192-.222-.384-.444-.575-.67l-.636-.736c-.218-.253-.437-.508-.656-.76l-.644-.746c-.197-.229-.395-.46-.593-.688-.17-.198-.338-.393-.51-.59l-.386-.448-.23-.265c-.117-.137-.273-.24-.456-.24H1.833C1.237 0 .752.493.752 1.099V26.9c0 .606.485 1.099 1.081 1.099h17.838c.596 0 1.081-.493 1.081-1.099V6.771c0-.021 0-.043-.003-.064-.015-.255-.18-.417-.332-.596zM8.84 20.88a.945.945 0 0 1-.237.614L5.548 25.1h2.718c.311 0 .572.265.572.581 0 .317-.26.572-.572.572H4.407a.583.583 0 0 1-.572-.581v-.024c0-.232.084-.435.236-.615l3.056-3.606H4.51a.575.575 0 0 1-.572-.572c0-.317.26-.581.572-.581h3.763c.311 0 .572.264.572.58v.025H8.84zm2.534 4.77a.648.648 0 1 1-1.294 0v-4.77a.648.648 0 1 1 1.294 0v4.77zm6.133-3.292c0 1.385-1.06 2.103-2.382 2.103h-.986v1.187a.648.648 0 1 1-1.294 0V20.93c0-.368.288-.657.647-.657h1.759c1.405 0 2.256.845 2.256 2.069v.015zm2.166-3.719H1.839V1.092h7.182v1.31c0 .252.2.456.449.456h1.288V1.092h3.604V6.71c0 .304.243.548.54.548h4.775v11.381h-.003z"/>
				</g>
			</svg>
			<a
				class="download-link info--text"
				@click.prevent="downloadFile('xml')"
			>
				Descargar XML
			</a>
		</v-flex>
		<v-flex xs12 class="mb-2 pa-3" v-if="isPeru && statusTaxValue('Validated')">
			<v-layout row wrap align-center>
				<v-flex xs1>
					<img src="/static/img/download-cdr.png" height="28">
				</v-flex>
				<v-flex xs11>
					<a
						class="download-link info--text"
						@click.prevent="downloadFile('cdr')"
					>
						Descargar CDR
					</a>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12 class="mb-2 pa-3">
			<v-alert :value="statusTaxValue('Error')" type="error">
				{{ summary.sunatError }}
			</v-alert>
		</v-flex>
		<v-flex xs12>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					hidden-save-btn
					@cancel-button-clicked="$emit('close')"
				/>
			</section>
		</v-flex>
	</v-layout>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import StatusTax from '@/shared/status-tax';
import TypeSummary from '@/shared/type-summary';

async function downloadFile(typeFile) {
	const { subsidiaryRuc } = this.summary;
	const numberDocument = this.summary.numericalIdentification.slice(3);
	const summaryCode = this.summary.typeSummary === TypeSummary.Ballot ? 'RC' : 'RA';
	const { dataResponseTaxes } = this.summary;
	if (dataResponseTaxes && dataResponseTaxes.xmlUrl && typeFile === 'xml') {
		window.open(dataResponseTaxes.xmlUrl);
	} else if (dataResponseTaxes && dataResponseTaxes.cdrUrl && typeFile === 'cdr') {
		window.open(dataResponseTaxes.cdrUrl);
	} else {
		const validType = typeFile === 'xml' ? 'zip' : 'cdr';
		const requestUrl = `admin/download/${subsidiaryRuc}/document/${numberDocument}/typeDocument/${summaryCode}/${validType}`;
		const url = `${process.env.FACTURACION_SUNAT_URL}/${requestUrl}`;
		window.open(url);
	}
}

function statusTaxValue(code) {
	return this.summary.statusTax === StatusTax[code];
}

export default {
	name: 'summary-sunat-detail',
	components: {
		modalSidebarButton,
	},
	methods: {
		downloadFile,
		statusTaxValue,
	},
	props: {
		summary: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
.download-link {
	margin-left: 10.2px;
	vertical-align: super;
}
</style>