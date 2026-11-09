
import Vue from 'vue';

Vue.directive('jailai', {
	update(el, binding) {
		if (binding.value && (binding.oldValue !== binding.value)) {
			el.classList.add('jailai');
			setTimeout(() => {
				el.classList.remove('jailai');
			}, 3000);
		}
	},
});

Vue.directive('scroll');

