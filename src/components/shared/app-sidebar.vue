<template>
	<v-navigation-drawer
		:mini-variant.sync="mini"
		fixed
		width="200"
		app
		mini-variant-width="48"
		height="100vh"
		class="secondary sidebar-border"
	>
		<v-toolbar flat height="50" class="background-bar hide-and-print">
			<v-list class="pt-0">
				<v-list-tile class="align-image">
					<v-list-tile-action>
						<router-link :to="{ name: nameRoute }">
							<img
								:src="imageMini"
								alt=""
								:height="mini ? 30 : heightImgLong"
								class="icon-maki-ocult mt-1"
							/>
						</router-link>
					</v-list-tile-action>
				</v-list-tile>
			</v-list>
		</v-toolbar>
		<v-toolbar flat height="35" class="background-bar background-btn">
			<v-list class="pt-0">
				<v-list-tile avatar class="bars-align">
					<v-list-tile-action>
						<v-btn icon @click.native.stop="$emit('toogle-mini')" class="icon-open-menu">
							<img src="/static/img/open-menu.svg" width="24" height="24" v-if="mini" />
							<img src="/static/icon/close.svg" height="18" v-else />
						</v-btn>
					</v-list-tile-action>
				</v-list-tile>
			</v-list>
		</v-toolbar>
		<v-list class="sidebar-bg pt-0" :class="{ 'scroll-sidebar-bg': !mini }">
			<v-list-group v-for="item in items" :key="item.id" no-action>
				<v-list-tile
					v-if="item.resource.data.length === 0"
					class="sidebar-resource"
					:class="{ 'sidebar-active': item.active }"
					color="white"
					slot="activator"
					@click="changeRoute(item)"
				>
					<v-list-tile-content>
						<v-list-tile-title class="name-module">{{ item.name }}</v-list-tile-title>
					</v-list-tile-content>
					<v-list-tile-action>
						<v-tooltip right>
							<img slot="activator" :src="item.pathIcon" />
							<span>{{ item.name }}</span>
						</v-tooltip>
					</v-list-tile-action>
				</v-list-tile>
				<v-list-tile
					v-else
					slot="activator"
					class="padding-items"
					color="white"
					@click="openSidebar(item.id)"
				>
					<v-list-tile-action>
						<v-tooltip top>
							<!-- <img slot="activator" :src="item.pathIcon" width="20" height="20"> -->
							<v-icon slot="activator" color="white" class="title-action" size="20">
								keyboard_arrow_right
							</v-icon>
							<span>{{ item.name }}</span>
						</v-tooltip>
					</v-list-tile-action>
					<v-list-tile-content class="content-open">
						<v-list-tile-title>{{ item.name }}</v-list-tile-title>
						<button :class="{ 'rotate-icon': item.open }">
							<v-icon slot="activator" color="white" class="title-action" size="20">
								arrow_drop_down
							</v-icon>
						</button>
					</v-list-tile-content>
				</v-list-tile>
				<v-list-tile
					v-for="subItem in item.resource.data"
					:key="subItem.uri"
					class="sidebar-resource"
					:class="{ 'sidebar-active': subItem.active }"
					color="white"
					@click="changeRoute(item, subItem)"
				>
					<v-tooltip right>
						<v-icon slot="activator" color="white" class="title-action"> lens </v-icon>
						<span>{{ subItem.name }}</span>
					</v-tooltip>
					<v-list-tile-content>
						<v-list-tile-title>
							<template v-if="showTooltip(subItem)">
								<v-tooltip right>
									<template slot="activator">
										{{ subItem.name }}
										<span class="new" v-if="subItem.flagNew">
											<template v-if="subItem.newTitle">
												{{ subItem.newTitle }}
											</template>
											<template v-else> Nuevo </template>
										</span>
									</template>
									<span v-if="subItem.name > 27 && subItem.newTitle">
										{{ subItem.name }} - {{ subItem.newTitle }}
									</span>
									<span v-else-if="subItem.newTitle">
										{{ subItem.newTitle }}
									</span>
									<span v-else> Nuevo </span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ subItem.name }}
								<span class="new" v-if="subItem.flagNew">
									<template v-if="subItem.newTitle">
										{{ subItem.newTitle }}
									</template>
									<template v-else> Nuevo </template>
								</span>
							</template>
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list-group>
			<!-- <v-list-group class="content-btn-prize" v-if="isMibodega">
				<btn-win-prizes :mini="mini"/>
			</v-list-group> -->
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import helper from '@/shared/helper';
// import btnWinPrizes from '@/components/shared/btn-win-prizes';

function created() {
	this.widthIcon();
	// this.changeImage();
	this.iconOpen = 'https://japi-static.s3.amazonaws.com/undefined/logo-maki-open.png';
	this.iconClose =
		'https://japi-static.s3.amazonaws.com/undefined/icon-ocult-makipos.png';
	const sidebarItems = helper.getLocalData('sidebar');

	if (sidebarItems) {
		this.items = sidebarItems;
	} else {
		this.loadData();
	}
}

function openSidebar(id) {
	this.items = this.items.map((p) => {
		const newRow = { ...p };
		newRow.open = p.id === id ? !newRow.open : false;
		return newRow;
	});
}

function changeRoute({ id, uri }, { id: subId, uri: subUri }) {
	if (window.innerWidth <= 760) {
		this.$emit('toogle-mini');
	}
	const admin = helper.getLocalData('admin-user');
	if (subUri === 'new-sale' || subUri === 'purchases-new') {
		if (admin.flagAdmin) {
			this.change(id, uri, subId, subUri);
		} else {
			this.checkBox(admin.cash.id, id, uri, subId, subUri);
		}
	} else {
		this.change(id, uri, subId, subUri);
	}
}

async function loadData() {
	const params = {
		languages: 'es',
	};
	const headers = {
		Accept: 'application/vnd.apiacl.v2+json',
	};
	try {
		const { data: items } = await this.$httpAcl.get(`sidebar/${process.env.APP_CODE}`, {
			params,
			headers,
		});

		this.items = items.data
			.map((item) => {
				const newItem = Object.assign({}, item);
				newItem.active = false;
				newItem.open = false;
				newItem.resource.data = newItem.resource.data.map((src) => {
					const newSrc = { ...src };
					newSrc.active = false;
					newSrc.open = false;
					if (src.uri === this.$route.path || src.uri === this.$route.name) {
						newSrc.active = true;
					}
					return newSrc;
				});
				if (item.resource.data.length === 0) {
					if (item.uri === this.$route.path || item.uri === this.$route.name) {
						newItem.active = true;
					}
				} else {
					item.resource.data.forEach((src) => {
						if (
							src.uri === this.$route.path ||
							`/${src.uri}` === this.$route.path ||
							src.uri === this.$route.name
						) {
							newItem.active = true;
						}
					});
					item.resource.data.sort((a, b) => a.position - b.position);
				}
				return newItem;
			})
			.sort((a, b) => a.position - b.position);
		helper.setLocalData('sidebar', this.items);
	} catch (err) {
		this.showNotification(
			'Ocurrió un error en el servidor, recargue la página.',
			'error'
		);
	}
}

function change(id, uri, subId, subUri) {
	this.items = this.items.map((item) => {
		const newItem = { ...item };
		newItem.active = false;
		newItem.resource.data = newItem.resource.data.map((src) => {
			const newSrc = { ...src };
			newSrc.active = false;
			return newSrc;
		});
		if (newItem.id === id) {
			newItem.active = true;
			newItem.resource.data = newItem.resource.data.map((src) => {
				const newSrc = { ...src };
				if (src.id === subId) {
					newSrc.active = true;
				}
				return newSrc;
			});
		}
		return newItem;
	});
	if (subUri) {
		if (subUri === 'purchases-new' && this.$route.name === 'list-of-products') {
			this.goTo(subUri, { query: { origin: 'products' } });
		} else if (subUri === 'accounting-new-product') {
			this.goTo(subUri, { params: { route: 'products' } });
		} else if (subUri === 'banner') {
			this.goTo(subUri, { query: { navigationValidation: 1 } });
		} else if (subUri === 'pending-orders-list' && this.isTwoDrivers) {
			this.goTo('orders-to-deliver');
		} else {
			this.goTo(subUri);
		}
	} else {
		this.goTo(uri);
	}
}

async function checkBox(cashId, id, uri, subId, subUri) {
	const { data: response } = await this.$httpSales.get(`cash/${cashId}`);
	if (response.flagActive) {
		this.change(id, uri, subId, subUri);
	} else {
		this.showGenericError('La caja esta bloqueada no puede ingresar al recurso');
	}
}

function mini(value) {
	this.$emit('toggle-siderbar', value);
}

function routeSelected(item, index, e) {
	this.selected = item;
	this.elementHeight = this.selected.resource.data.length * 40;
	this.clientY = e.clientY;
	this.layerY = e.layerY;
	this.viewInnerHeight = e.view.innerHeight;
	this.bottomY = this.clientY - 40;
	const validate = this.bottomY > this.viewInnerHeight / 2;
	this.y = validate
		? this.clientY - this.layerY - this.elementHeight + 30
		: this.clientY - this.layerY - 40;
}

function hideMenu(e) {
	if (e.x > 95) {
		this.selected = { resource: {} };
	}
}

function nameRoute() {
	return this.isMibodega ? 'dashboard-report' : 'list-of-products';
}

function showTooltip(resource = {}) {
	const name = resource.name || '';
	const newTitle = resource.newTitle || '';
	const title = resource.title || '';
	const flagNew = resource.flagNew || '';
	const label = name || title || newTitle;
	if (flagNew && !newTitle) {
		return label.length + 'Nuevo'.length > 26 || label.length + 'New'.length > 26;
	} else if (newTitle) {
		return label.length + newTitle.length > 26;
	}
	return label.length > 28;
}

function data() {
	return {
		currentDate: new Date(),
		items: [],
		heightImgLong: 24,
		selected: {
			resource: {},
		},
		y: 0,
		bottomY: 0,
		clientY: 0,
		elementHeight: 0,
		screenY: 0,
		offsetY: 0,
		layerY: 0,
		viewInnerHeight: 0,
		viewScrollY: 0,
		viewScreenY: 0,
	};
}

function widthIcon() {
	return this.iconOpen ? '110px' : '65px';
}

export default {
	name: 'app-sidebar',
	computed: {
		nameRoute,
		imageMini() {
			return this.$isJapiSale
				? '/static/img/logos/logo-js-w-y.svg'
				: this.mini
				? '/static/img/logos/logo-basket.png'
				: '/static/img/logos/logo-cm.svg';
		},
	},
	created,
	// components: {
	// 	btnWinPrizes,
	// },
	data,
	methods: {
		widthIcon,
		changeRoute,
		change,
		checkBox,
		hideMenu: helper.debounce(hideMenu, 300),
		loadData,
		openSidebar,
		routeSelected,
		showTooltip,
		// changeImage() {
		// 	const currentMonth = this.currentDate.getMonth();
		// 	const currentDay = this.currentDate.getDate();
		// 	const isDecember =
		// 		currentMonth === 11 && currentDay >= 1 && currentDay <= 26;
		// 	if (isDecember) {
		// 		this.heightImgLong = 45;
		// 		this.imageLong = '/static/img/logo-cm-christmas-long.png';
		// 		this.imageMini = '/static/img/logo-cm-Christmas.png';
		// 	}
		// },
	},
	watch: {
		mini,
	},
	props: {
		mini: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.list {
	background-color: color(primary) !important;

	&__tile__action {
		height: 30px;
		justify-content: center;
		padding: 0 !important;
	}
}

.navigation-drawer {
	overflow-x: inherit !important;
	overflow-y: initial !important;

	&--mini-variant {
		.list__tile__action {
			justify-content: center;
		}
	}
}

.sidebar-resource {
	background-color: color(secondary);
	cursor: pointer;
}

.new {
	color: map-get($colors, warning);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, small10);
	font-style: italic;
	padding: 1px;
}

.tile-action {
	font-size: map-get($sizes, small8);
	margin-right: 5px;
}

.item-route-selected,
.item-route:hover {
	background-color: color(background-sidebar-selected) !important;
}

.background-bar {
	background-color: map-get($colors, primary);
	justify-content: center;
	margin-top: 1px;

	@media (max-width: 760px) {
		display: none;
	}
}

.title-action {
	font-size: map-get($sizes, small8);
	margin-right: 5px;
}

.icon-open-menu {
	height: 24px;
	width: 24px;
}

.content-open {
	align-items: center;
	display: flex;
	flex-direction: row;
}

.background-btn {
	@media (max-width: 760px) {
		display: none;
	}
}
</style>
