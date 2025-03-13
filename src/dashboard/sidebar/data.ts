import HomeIcon from './icons/HomeIcon.svelte';
import MediasIcon from './icons/MediasIcon.svelte';
import ContactIcon from './icons/ContactIcon.svelte';

export const data = [
	{
		section: 'APPLICATIONS',
		content: [
			{
				title: 'Curreny prices',
				icon: HomeIcon,
				link: '/'
			},
			{
				title: 'Gold prices',
				icon: MediasIcon,
				link: '/admin/goldprices'
			},
			{
				title: 'About',
				icon: ContactIcon,
				link: '/admin/about'
			}
		]
	}
];
