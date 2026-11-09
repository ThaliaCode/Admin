<template>
	<div class="cms-report py-2">
		<!-- <v-layout>
			<v-flex xs12>
				<div>
					<span>Fecha: {{ localReport.date }}</span>
				</div>
			</v-flex>
		</v-layout> -->
		<v-layout class="mb-3">
			<v-flex xs12>
				<label class="label" style="color: rgb(89, 89, 89); font-size: 0.95rem"
					>Descripción:</label
				>
				<textarea
					class="textArea"
					v-model="localReport.report"
					@change="setData"
				></textarea>
				<!-- <hr />
				<v-text-field
					multi-line
					v-model="localReport.report"
					outline
					height="30"
					box
					:text="localReport.report"
					@input="setData"
				/> -->
			</v-flex>
		</v-layout>
		<v-layout justify-bewteen class="px-1">
			<v-flex xs11>
				<v-checkbox
					hide-details
					color="primary"
					v-model="localReport.status"
					@change="setData"
					label="Atendido"
				></v-checkbox>
				<!-- ----------- -->
			</v-flex>
			<v-flex xs1>
				<slot />
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
// function setCode({ model, value }) {
// 	this.localConversion[model] = value;
// 	this.$emit('set-conversion', this.localConversion);
// }

function setData() {
	// const newValue = model === 'id' ? value.id : Number(value);
	// this.localReport[model] = value;
	// if (model === 'code') {
	// 	const cmsUnit = this.units.find(u => u.code === value);
	// 	this.localReport.name = cmsUnit ? cmsUnit.name : null;
	// }
	// if (model === 'cost') {
	// 	this.localReport.cost = Number(value);
	// }
	this.$emit('set-report', this.localReport);
}

function reportHandler(newReport) {
	this.localReport = newReport;
}

function data() {
	return {
		localReport: { ...this.report },
	};
}

export default {
	name: 'cms-reporter',
	data,
	methods: {
		reportHandler,
		// setCode,
		setData,
	},
	props: {
		report: {
			default: () => {},
			type: Object,
		},
	},
	watch: {
		report: {
			deep: true,
			handler: reportHandler,
		},
		// selectedUnit() {
		// 	this.localConversion.unitCode = this.selectedUnit.code;
		// 	this.localConversion.code = null;
		// 	this.localConversion.name = null;
		// },
	},
};
</script>
<style lang="scss" scoped>
.cms-report {
	border: 1px solid rgb(205, 205, 205);
	padding: 5px 10px;
	border-radius: 0 0 7px 7px;
	// background: #ffffff;
	// box-shadow: 10px 14px 32px -28px rgba(0, 0, 0, 0.84);
	// -webkit-box-shadow: 10px 14px 32px -28px rgba(0, 0, 0, 0.84);
	// -moz-box-shadow: 10px 14px 32px -28px rgba(0, 0, 0, 0.84);
}

.wraper-container-conversion {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
}

.conversion-quantity {
	flex: 1 1 12%;
	text-align: left;
}

.conversion-selected {
	flex: 1 1 12%;
	text-align: left;
}

.code-conversion {
	flex: 1 1 17%;
	text-align: left;
}

.conversion-quantityTo {
	flex: 1 1 16%;
	text-align: left;
}

.eq {
	flex: 1 1 14%;
	margin-top: 18px;
	margin-right: 5px;
}

.conversion-id {
	flex: 23%;
	text-align: left;
}

.title-caption {
	color: color(sidebar);
	font-weight: bold;
}

.textArea {
	width: 100%;
	min-height: 100px;
	padding: 2px;
	overflow: hidden;
	background-color: transparent;
	// border: 2px solid #797979;
	border: 1px solid rgb(205, 205, 205);
	border-radius: 3px;
	font-size: 1rem;
	color: #000;
}

.textArea:focus {
	outline: none;
}
</style>
