<template>
	<div>
		<div class="background-select">
			<v-flex xs12 md3 pr-3 mb-3>
				<v-select
					bottom
					single-line
					hide-details
					return-object
					:items="templates"
					label="Template"
					item-text="name"
					item-value="id"
					class="filter-select"
					content-class="filter-select-content"
					@input="setTemplate"
					:value="selectedTemplate.getTemplate()"
				></v-select>
			</v-flex>
			<v-flex xs11 md3 pr-1 mb-3>
				<v-select
					single-line
					bottom
					hide-details
					return-object
					label="Colores"
					item-text="name"
					item-value="id"
					class="filter-select"
					content-class="filter-select-content"
					:items="selectedTemplate.avaliableThemes()"
					@input="setTheme"
					:value="selectedTemplate.getTheme()"
				>
					<template slot="item" slot-scope="data">
						<div class="theme-container">
							<div>{{ data.item.name }}</div>
							<ul>
								<li
									class="color-theme"
									:style="`background-color:${data.item.primary}`"
								></li>
								<li
									class="color-theme"
									:style="`background-color:${data.item.secondary}`"
								></li>
								<li
									class="color-theme"
									:style="`background-color:${data.item.title}`"
								></li>
								<li
									class="color-theme"
									:style="`background-color:${data.item.subTitle}`"
								></li>
								<li
									class="color-theme"
									:style="`background-color:${data.item.border}`"
								></li>
							</ul>
						</div>
					</template>
				</v-select>
			</v-flex>
			<v-flex xs1 pr-2 mb-3>
				<button
					@click="$emit('open-slide', 'CC')"
					class="pl-add-container"
					:style="{ cursor: 'pointer', height: '30px', width: '30px' }"
				>
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</div>
		<div class="background-upload-template mb-5">
			<img
				:src="selectedTemplate.getTheme().image"
				alt=""
				width="540px"
				class="image-template"
			/>
		</div>
	</div>
</template>
<script>
import TemplateInstance from '@/components/class/EcommerceTemplate';

function created() {
	this.loadTemplates();
}

async function loadTemplates() {
	const url = 'group/TEMP/table';
	({ data: this.templates } = await this.$httpSales.get(url));
}

function setTemplate(template) {
	this.selectedTemplate.updateTemplate(template);
	this.$emit('set-data', {
		model: 'template',
		value: this.selectedTemplate.getTemplate(),
	});
}

function setTheme(theme) {
	this.selectedTemplate.updateTheme(theme);
	this.$emit('set-data', {
		model: 'theme',
		value: this.selectedTemplate.getTheme(),
	});
}

function handlerTheme(theme) {
	this.selectedTemplate.updateTheme(theme);
}

function handlerTemplate(template) {
	this.selectedTemplate.updateTemplate(template);
}

function data() {
	return {
		selectedTemplate: TemplateInstance,
		templates: [],
	};
}

export default {
	name: 'table-upload-image',
	created,
	data,
	methods: {
		loadTemplates,
		handlerTheme,
		setTemplate,
		setTheme,
	},
	props: {
		template: {
			default: () => {},
			type: Object,
		},
		theme: {
			default: () => {},
			type: Object,
		},
	},
	watch: {
		template: {
			deep: true,
			handler: handlerTemplate,
		},
		theme: {
			deep: true,
			handler: handlerTheme,
		},
	},
};
</script>

<style lang="scss" scoped>
.background-select {
	display: flex;
	justify-content: center;
	padding: 14px 14px 32px 14px;
}

.background-upload-template {
	background-color: color(white);
	border: 1px solid color(item-select);
	border-radius: 8px;
	max-width: 593px;
	margin: auto;
	padding: 25px;
}

.theme-container {
	align-items: center;
	display: flex;
	justify-content: space-between;
	width: 100%;

	ul {
		display: flex;

		.color-theme {
			border-radius: 50%;
			height: 25px;
			list-style-type: none;
			margin: 0 10px;
			width: 25px;
		}
	}
}

.image-template {
	max-width: 100%;
}
</style>
