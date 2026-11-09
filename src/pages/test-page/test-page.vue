<template>
	<div>
		<div v-if="false">
			<app-input-text label="Dirección" id="wwwww-a" @input-map="setValue" google-map :text="address" />
			<div v-if="markers.length > 0">
				<static-map :google-api-key="apiKey" :markers="markers" :center="address" :zoom="15"></static-map>
			</div>
			<bank-table-reconciliation
				:bank-rows="bankRows"
				:daily-rows="dailyRows"
				:reconciliation="generateReconciliation"
				:records="records"
				:with-excel="true"
				@summary="summary"
				@reconciliation-bank-match="reconciliationBankMatch($event, 'add')"
				@reconciliation-bank-unmatch="reconciliationBankMatch($event, 'delete')"
			>
			</bank-table-reconciliation>
			<router-view></router-view>
			<template v-for="row in rows">
				<div class="counter ma-4" :key="row.id">
					<button
						@click="add(row)"
					>
						+
					</button>
					{{ row.quantity }}
					<button
						@click="sub(row)"
					>
						-
					</button>
				</div>
			</template>
			<div class="ma-4">
				<input type="date" class="input-date">
			</div>
		</div>
		<div>
			<button class="ma-4 btn-facebook" @click="loginFacebook">Facebook</button>
			<div class="ma-4">
				<div id="fb-root"></div>
				<div
					class="fb-login-button"
					data-scope="public_profile,email"
					scope="public_profile,email"
					data-size="medium"
					data-button-type="login_with"
					data-auto-logout-link="false"
					data-use-continue-as="true"
					onlogin="afterLogin();"
				></div>
			</div>
		</div>
	</div>
</template>

<script>

import StaticMap from 'vue-static-map';
import bankTableReconciliation from '@/components/bank-reconciliation/bank-table-reconciliation';

function add(row) {
	const counter = row.quantity + 1;
	this.$set(row, 'quantity', counter);
}

function sub(row) {
	const { quantity } = row;
	if (quantity > 1) {
		const counter = quantity - 1;
		this.$set(row, 'quantity', counter);
	}
}

function reconciliationBankMatch(row, value) {
	if (value === 'add') {
		this.reconciliationFinal.push(row);
	} else {
		const index = this.reconciliationFinal.findIndex(rf => rf.id === row.id);
		if (index > -1) {
			this.reconciliationFinal.splice(index, 1);
		}
	}
}

function setValue(body) {
	this.address = body.formatted_address;
	this.markers.push({
		label: 'B',
		color: 'blue',
		lat: body.geometry.location.lat(),
		lng: body.geometry.location.lng(),
		size: 'normal',
	});
}

function summary(summaryData) {
	this.reconciliation = summaryData;
}

async function loginFacebook() {
	const { data: response } = await this.$auth.authenticate('facebook');
	this.loginFacebookResponse = response;
}

export default {
	name: 'test-page',
	components: {
		bankTableReconciliation,
		StaticMap,
	},
	data() {
		return {
			apiKey: process.env.GOOGLE_MAP_KEY,
			address: '',
			dailyRows: [
				{
					amount: 200,
					date: new Date(),
					document: '0023',
					id: 1,
					origin: '01',
					type: 'ND',
				},
				{
					amount: 230.50,
					date: new Date(),
					document: '0024',
					id: 2,
					origin: '02',
					type: 'ND',
				},
				{
					amount: 1569.83,
					date: new Date(),
					document: '32024',
					id: 20,
					origin: '05',
					type: 'FAC',
				},
			],
			bankRows: [
				{
					amount: 830.12,
					date: new Date(),
					document: '0027',
					id: 8,
					origin: '02',
					type: 'CH',
				},
				{
					amount: 200,
					date: new Date(),
					document: '0023',
					id: 12,
					origin: '01',
					type: 'FA',
				},
				{
					amount: 230.50,
					date: new Date(),
					document: '0024',
					id: 15,
					origin: '02',
					type: 'FA',
				},
			],
			latitude: null,
			longitude: null,
			markers: [],
			records: [],
			generateReconciliation: 0,
			loginFacebookResponse: null,
			reconciliationFinal: [],
			reconciliation: {},
			rows: [
				{
					id: 1,
					quantity: 1,
				},
				{
					id: 2,
					quantity: 1,
				},
				{
					id: 3,
					quantity: 1,
				},
			],
		};
	},
	methods: {
		add,
		loginFacebook,
		reconciliationBankMatch,
		setValue,
		sub,
		summary,
	},
};
</script>

<style lang="scss" scoped>
.input-date {
	background-color: color(white);
	border-radius: 3px;
	box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, .2);
	color: color(paginationText);
	height: 30px;
	outline: none;
	padding-left: 14px;
}
</style>
