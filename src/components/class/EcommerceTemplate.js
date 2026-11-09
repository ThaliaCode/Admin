import lib from '@/shared/lib';

class TemplateClass {
	constructor() {
		this.template = {};
		this.themes = [];
		this.selectedTheme = {};
	}
	avaliableThemes() {
		return this.themes;
	}
	getTemplate() {
		return this.template;
	}
	getTheme() {
		return this.selectedTheme;
	}
	setThemes(template) {
		this.themes = lib.getDeeper('aditionalInformation', 'themes')(template);
	}
	updateTheme(theme) {
		this.selectedTheme = theme;
	}
	updateTemplate(newTemplate) {
		this.template = newTemplate;
		this.setThemes(newTemplate);
	}
}

export default new TemplateClass();
