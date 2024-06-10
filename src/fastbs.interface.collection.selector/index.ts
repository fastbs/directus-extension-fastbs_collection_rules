import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'fastbs.interface.collection.selector',
	name: 'Collection selector',
	icon: 'fact_check',
	description: 'This is Fastbs custom collection selector interface',
	component: InterfaceComponent,
	types: ['string'],
	relational: false,
	group: 'selection',
	options: [
		{
			field: 'placeholder',
			type: 'string',
			name: 'Placeholder',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					placeholder: 'Выберите коллекцию',
				},
			},
		},
	],
});
