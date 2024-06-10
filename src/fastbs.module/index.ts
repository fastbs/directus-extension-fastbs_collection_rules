import ModuleComponent from './module.vue';

export default {
	id: 'fastbs.module',
	name: 'Fastbs Collection Rules',
	icon: 'rocket_launch',
	color: '#FF0000',
	routes: [
		{
			name: 'home',
			path: '',
			props: true,
			component: ModuleComponent,
		},
		{
			name: 'page',
			path: ':page',
			props: true,
			component: ModuleComponent,
		},
	],
};