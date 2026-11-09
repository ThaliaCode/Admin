<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<div class="page-prize">
			<v-layout row align-center>
				<v-flex>
					<v-layout column wrap align-center>
						<v-flex>
							<img src="/static/icon/prize.svg" alt="icon-premio" height="61" />
						</v-flex>
						<v-flex text-xs-center class="title-prize mt-3">
							<span class="green-color">Gánate</span> un <br />
							módulo de fidelizacion
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex ml-5>
					<v-flex text-xs-center class="section-video-tutorial">
						¿Qué es un módulo?
						<v-flex text-xs-center class="video-tutorial mt-2">
							VIDEO TUTORIAL
						</v-flex>
						<div></div>
					</v-flex>
				</v-flex>
			</v-layout>
			<v-layout row mt-4 justify-space-between>
				<v-flex
					class="content-prize"
					v-for="(item, index) in links"
					:key="index"
				>
					<v-flex text-xs-center>
						<a href="">
							<img src="/static/img/pregunta.svg" alt="icon-question" />
						</a>
					</v-flex>
					<a
						class="mt-3 btn-prize"
						:style="`background-color: ${item.backgroundColor}; box-shadow: ${item.boxShadow}`"
						:href="item.url"
						target="_blank"
					>
						<v-layout class="btn-link" row align-center>
							<v-flex :style="`border-right: 1px solid ${item.colorText}`" xs2>
								<img :src="item.icon" alt="" />
							</v-flex>
							<v-flex :style="`color: ${item.colorText}`" xs10 text-xs-center>
								{{ item.title }}
							</v-flex>
						</v-layout>
					</a>
					<v-flex text-xs-center mt-4 v-if="item.id === 2">
						<img src="/static/img/loyalty-star.svg" alt="" height="18" />
						<img src="/static/img/loyalty-star.svg" alt="" height="18" />
						<img src="/static/img/loyalty-star.svg" alt="" height="18" />
						<img src="/static/img/loyalty-star.svg" alt="" height="18" />
						<img src="/static/img/loyalty-star.svg" alt="" height="18" />
					</v-flex>
					<v-flex class="mt-4 text-gray" text-xs-center>
						<v-layout row align-center>
							<v-flex v-if="item.image">
								<img :src="item.image" alt="" />
							</v-flex>
							<v-flex>
								{{ item.description }}
							</v-flex>
						</v-layout>
					</v-flex>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

<script>
import headerPage from '@/components/shared/header-page';

function data() {
	return {
		links: [
			{
				id: 1,
				backgroundColor: '#0076fc',
				colorText: '#ffffff',
				icon: '/static/icon/facebook-white.svg',
				title: 'Recomiendanos en facebook',
				description:
					'Recomiendanos valorandonos en nuestro facebook captura la pantalla y envialo a soporte. ',
				url: process.env.FACEBOOK_URL,
			},
			{
				id: 2,
				backgroundColor: '#ffffff',
				colorText: '#8f8f8f',
				boxShadow: '-2px 1px 9px 0 rgba(0, 0, 0, 0.08)',
				icon: '/static/icon/play-store.png',
				title: 'Valoranos en Google Play',
				description:
					'Valoranos en Google play captura la pantalla y envialo a soporte',
				url: 'https://play.google.com/store/apps/details?id=com.quipu.makipos.bodega&hl=es_PA',
			},
			{
				id: 3,
				backgroundColor: '#0076fc',
				colorText: '#ffffff',
				icon: '/static/icon/facebook-white.svg',
				title: 'Comparte 5 publicaciones',
				description:
					'Comparte 5 publicaciones de nuestro facebook y comunicate con soporte',
				image: '/static/img/image-prize.png',
				url: process.env.FACEBOOK_URL,
			},
		],
	};
}

export default {
	name: 'page-prize',
	data,
	components: {
		headerPage,
	},
};
</script>

<style lang="scss" scoped>
.page-prize {
	padding: 45px 48px 61px 48px;
}

.title-prize {
	color: #4a4a4a;
	font-family: map-get($fonts, lato-bold);
	font-size: 34px;
}

.green-color {
	color: color(primary);
	font-weight: 900;
}

.section-video-tutorial {
	background-color: white;
	border-radius: 9px;
	box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.07);
	color: color(primary);
	font-size: 16px;
	font-weight: 800;
	padding: 21px 14px 12px 14px;
}

.video-tutorial {
	align-items: center;
	background-color: rgba(195, 231, 232, 0.22);
	border-radius: 5px;
	display: flex;
	height: 227px;
	justify-content: center;
	font-size: 13px;
}

.content-prize {
	background-color: white;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
	font-family: map-get($fonts, lato-bold);
	padding: 29px 26px 31px 26px;
	max-width: 367px;
	margin-left: 13px;

	&:first-child {
		margin: 0;
	}
}

.btn-prize {
	border-radius: 25px;
	display: inline-block;
	text-decoration: none;
	width: 100%;
}

.text-gray {
	color: #4a4a4a;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
}

.btn-link {
	padding: 11px 20px;
}
</style>
