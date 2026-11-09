<template>
	<v-layout row mt-4 d-flex justify-center class="help">
		<v-flex xs10>
			<article
				class="article mb-3"
				v-for="(help, indexH) in helps"
				:key="indexH">

				<v-layout row class="article-title">
					<v-flex xs1>
						<img src="/static/img/link-action.svg" width="20" :alt="help.languages">
					</v-flex>
					<v-flex>
						<h3>{{help.languages}}</h3>
					</v-flex>
				</v-layout>
				<section class="article-description">
					<h4 class="article-description_title">Descripción</h4>
					<p class="article-description_content">{{help.description}}</p>
				</section>
				<span><h4 class="article-description_title">Tutorial:</h4>
					<a :href="help.link" target="_blank">{{help.link}}</a>
				</span>
				<h4 class="article-description_title mt-2">Manuales:</h4>
				<ul class="list-none">
					<li v-for="(man, index) in help.manuals" :key="index">
						<a :href="man.file"
						target="_blank">
							{{man.file}}
						</a>
					</li>
				</ul>
			</article>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'help-component',
	props: {
		helps: {
			type: Array,
			default: () => [],
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.help {
	font-size: size(medium);
}
.article {
	margin: 20px 0;
}
.article-title {
	border-bottom: 1px solid color(blue-grey);
	padding-bottom: 8px;
}
.article-description {
	margin: 25px 0 10px;
}
.list-none {
	list-style: none !important;
}
</style>


