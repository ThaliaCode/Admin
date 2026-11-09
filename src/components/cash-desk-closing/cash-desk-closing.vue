<template>
	<div>
		<header-page
			v-if="
				$route.name === 'cash-desk-closing' || $route.name === 'cash-desk-closing-list'
			"
			toShow
			:showClean="false"
			:showExcel="false"
			name="cash-desk-closing"
			:title="cashClosingTitle"
		>
			<h3 class="mr-5" v-if="$route.name !== 'cash-desk-closing-list'">
				{{ this.totalAmount.totalCash }} {{ totalAmount | round }}
			</h3>
		</header-page>
		<router-view
			@total-amount="setTotalAmount"
			@download-report="downloadReportExcel"
		></router-view>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import headerPage from './../shared/header-page';

function cashClosingTitle() {
	return this.$route.meta.title;
}

function setTotalAmount({ totalAmount, currency }) {
	this.totalAmount = totalAmount;
	this.currency = currency;
}

async function downloadReportExcel({ rows, columns, paramsRow }) {
	this.isLoading = true;
	const code = 'xlsx';
	const name = 'Reporte Movimiento de Cajas';
	const body = {
		columns: columns.reduce((acum, pl) => {
			const newAcum = [...acum];
			if (pl.id !== 11) {
				const newCol = {
					name: pl.name,
					value: pl.value,
				};
				newAcum.push(newCol);
			}
			return newAcum;
		}, []),
		rows: [...rows],
		code: 'xlsx',
	};
	const params = { ...paramsRow };
	try {
		const response = await this.$httpSales.post('reports', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		currency: '',
		isLoading: false,
		totalAmount: 0,
	};
}

export default {
	name: 'cash-desk-closing',
	components: {
		headerPage,
	},
	computed: {
		cashClosingTitle,
	},
	data,
	methods: {
		downloadReportExcel,
		setTotalAmount,
	},
};
</script>
