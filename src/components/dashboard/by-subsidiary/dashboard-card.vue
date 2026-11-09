<template>
	<btn-card @on-click="$emit('on-click')" class="head-container">
		<heading-card
			slot="heading"
			:icon="showIcon"
			:title="title"
			:btn-off="btnOff"
			:show-btn-off="showBtnOff"
			:sale-point="salePoint"
			:background="computedBackground"
		>
			<template v-if="currentUser">
				<row-detail
					:background="deviceSpec.type === 'Web' ? '#3280dc' : '#3cb179'"
					label="Tipo de disp.:"
					tooltip="Tipo de dispositivo"
					:value="deviceSpec.type"
				></row-detail>
				<row-detail
					:background="deviceSpec.type === 'Web' ? '#3280dc' : '#3cb179'"
					:label="
						deviceSpec.type === 'Web' ? 'Versión Navegador' : 'Versión Android'
					"
					tooltip="IP"
					:value="deviceSpec.clientIp"
				></row-detail>
				<row-detail
					:background="deviceSpec.type === 'Web' ? '#3280dc' : '#3cb179'"
					label="IP:"
					tooltip="IP"
					:value="deviceSpec.ip"
				></row-detail>
			</template>
		</heading-card>
		<v-layout wrap pa-1>
			<v-flex
				xs12
				text-xs-left
				px-2
				v-for="(user, userIndex) in users"
				:key="userIndex"
			>
				<user-data
					v-if="user.devices"
					:user-full-name="user.fullname"
					:date="user.devices && user.devices.inDate"
					:user-avatar="user.urlImage"
					:is-visible-user="userIndex === 0"
					@click="selectUser(user)"
					@open-users="openUsers"
				></user-data>
			</v-flex>
			<v-flex xs12 v-for="row in rows" :key="row.id">
				<row-data
					:amount="row.amount"
					:details="row.details"
					:devices="{ online: row.devicesOnline, offline: row.devicesOffline }"
					:devices-data="row.devices"
					:quantity-data="row.total"
					:title-data="row.title"
					:cash-config="row.cashConfig"
					:warehouses="{ open: row.warehousesOpen, close: row.warehousesClose }"
					:warehouses-data="row.warehouses"
				></row-data>
			</v-flex>
		</v-layout>
	</btn-card>
</template>

<script>
import btnCard from '@/components/dashboard/by-subsidiary/btn-card';
import headingCard from '@/components/dashboard/by-subsidiary/heading-card';
import rowData from '@/components/dashboard/by-subsidiary/row-data';
import rowDetail from '@/components/dashboard/by-subsidiary/row-detail';
import userData from '@/components/dashboard/by-subsidiary/user-data';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function selectUser(user) {
	this.currentUser = user;
}

function deviceSpec() {
	const { devices } = this.currentUser || {};
	const { typeConexionName } = devices || {};
	const ip = getDeeper('additionalInformation', 'clientIp')(devices);
	const navigation = getDeeper('additionalInformation', 'name')(devices);
	return {
		ip,
		navigation,
		type: typeConexionName,
	};
}

function computedBackground() {
	if (this.currentUser) {
		const color = this.deviceSpec.type === 'Web' ? 'color(primary)' : '#4DC68C';
		return color;
	}
	return 'color(primary)';
}

function openUsers() {
	this.$emit('open-users', this.title, this.users, this.idPoint);
}

function showIcon() {
	if (!this.icon) {
		return this.deviceSpec.type === 'Web' ? this.iconWeb : this.iconMovil;
	}
	return this.icon;
}

function data() {
	return {
		currentUser: this.users[0],
		iconMovil: '/static/img/sale-point-icon.jpg',
		iconWeb: '/static/img/sale-point-icon-web.jpg',
	};
}

export default {
	name: 'dashboard-card',
	components: {
		btnCard,
		headingCard,
		rowData,
		rowDetail,
		userData,
	},
	computed: {
		computedBackground,
		deviceSpec,
		showIcon,
	},
	data,
	methods: {
		selectUser,
		openUsers,
	},
	props: {
		btnOff: {
			default: false,
			type: Boolean,
		},
		icon: String,
		details: {
			default: () => [],
			type: Array,
		},
		rows: {
			default: () => [],
			type: Array,
		},
		salePoint: {
			default: false,
			type: Boolean,
		},
		showBtnOff: {
			default: false,
			type: Boolean,
		},
		title: String,
		users: {
			default: () => [],
			type: Array,
		},
		idPoint: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
.head-container {
	max-width: 244px;
}
</style>
