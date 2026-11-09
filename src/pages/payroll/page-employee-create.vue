<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="employee-create"
		/>
		<payroll-create-employee
			:id="id"
			:tabs="tabs"
			:code="code"
		/>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import payrollCreateEmployee from '@/components/payroll/payroll-create-employee-tab';

function data() {
	return {
		tabs: [
			{ id: 1, name: 'DATOS DE EMPLEADO', disabled: false },
			{ id: 2, name: 'DATOS DE EMPRESA', disabled: false },
			{ id: 3, name: 'IESS', disabled: false },
		],
	};
}
export default {
	name: 'employee-create',
	components: {
		headerPage,
		payrollCreateEmployee,
	},
	data,
	props: {
		id: [String, Number],
		code: {
			type: Boolean,
			default: true,
		},
	},
};
</script>