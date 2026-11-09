<template>
	<div app :height="heightToolbar" class="app-subheader">
		<v-container fluid pa-0>
			<v-layout row align-center>
				<v-flex v-if="navigation" xs12 md5 pl-3>
					<route-navigation
						:text-navigation="textNavigation"
						:route="route"
					></route-navigation>
				</v-flex>
			</v-layout>
		</v-container>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import routeNavigation from '@/components/field-sale/shared/route-navigation';

function created() {
	window.addEventListener('resize', this.toolbarHeight);
	this.toolbarHeight();
}

function destroyed() {
	window.removeEventListener('resize', this.toolbarHeight);
}

function toolbarHeight() {
	const windowWidth = window.innerWidth;
	if (windowWidth >= 768) {
		this.heightToolbar = 40;
	} else {
		this.heightToolbar = 80;
	}
}

function resources() {
	const modules = helper.getLocalData('sidebar');
	if (modules && modules.length > 0) {
		return modules.reduce((acum, module) => {
			const resource = acum.concat(module.resource.data);
			return resource;
		}, []);
	}
	return [];
}

async function checkBox(id, list) {
	const { data: response } = await this.$httpSales.get(`cash/${id}`);
	if (response.flagActive) {
		if ((list === 'new-sale' || list === 'purchases-new') && this.$route.name !== 'list-of-products') {
			this.goTo(list);
		} else if (list === 'purchases-new' && this.$route.name === 'list-of-products') {
			this.goTo(list, { params: { origin: 'products' } });
		} else {
			this.goTo(list);
		}
	} else {
		this.showGenericError('La caja esta bloqueada no puede ingresar al recurso');
	}
}

function data() {
	return {
		heightToolbar: 40,
	};
}

export default {
	name: 'app-subheader',
	components: {
		routeNavigation,
	},
	computed: {
		resources,
	},
	created,
	data,
	destroyed,
	methods: {
		toolbarHeight,
		checkBox,
	},
	props: {
		navigation: {
			default: false,
			type: Boolean,
		},
		textNavigation: {
			default: 'Volver',
			type: String,
		},
		route: {
			default: '',
			type: [String, Object],
		},
	},
};
</script>

<style lang="scss" scoped>
.toolbar {
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .2);
	top: 40px;
	z-index: 1;
}

a {
	display: block;
	line-height: 1;
	text-decoration: none;

	@media (min-width: 768px) {
		line-height: 1.5;
	}
}

.subheader {
	&-name {
		color: map-get($colors, subheaderText);
		cursor: pointer;
		font-size: 13px;
		text-align: center;

		@media (min-width: 768px) {
			text-align: left;
			vertical-align: super;
		}
	}

	&-image-container {
		align-items: center;
		height: 30px;

		@media (min-width: 768px) {
			display: inline-flex;
		}
	}

	&-items {
		font-family: map-get($fonts, open-regular);
		padding-top: 2px;

		@media (min-width: 768px) {
			padding-right: 16px;
			padding-top: 0px;
		}
	}
}

.local-flex {
	display: flex;
}

.app-subheader {
	padding: 9px 0;
}
</style>