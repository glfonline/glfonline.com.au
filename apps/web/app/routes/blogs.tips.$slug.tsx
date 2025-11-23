import { assert, isString } from 'emery';
import { type LoaderFunctionArgs, redirect } from 'react-router';
import { notFound } from '../lib/errors.server';

export function loader({ params }: LoaderFunctionArgs) {
	const { slug } = params;
	assert(isString(slug));
	const obj = redirects.find((r) => r.slug === slug);
	if (obj) {
		return redirect(obj.destination);
	}
	notFound();
}

const redirects = [
	{
		destination: '/blog/glf-pro-tip-1-bunker-shots',
		slug: '83675463-golf-ladies-first-pro-tip-1-bunker-shots',
	},
	{
		destination: '/blog/glf-pro-tip-2-putting-practice',
		slug: '150528903-golf-ladies-first-pro-tip-2-putting-practice',
	},
	{
		destination: '/blog/glf-pro-tip-3-pre-shot-routine',
		slug: '161425159-tip-3-test',
	},
	{
		destination: '/blog/glf-pro-tip-4-cure-your-shank',
		slug: 'golf-ladies-first-pro-tip-4',
	},
	{
		destination: '/blog/glf-pro-tip-5-pitch-chip-or-putt',
		slug: 'golf-ladies-first-pro-tip-5',
	},
	{
		destination: '/blog/glf-pro-tip-6-pitching',
		slug: 'golf-ladies-first',
	},
	{
		destination: '/blog/glf-pro-tip-7-grip-and-ball-position',
		slug: 'golf-ladies-first-pro-top-7-grip-and-ball-position',
	},
	{
		destination: '/blog/glf-pro-tip-8-playing-in-the-wind',
		slug: 'golf-ladies-first-pro-tip-no-8',
	},
	{
		destination: '/blog/glf-pro-tip-9-keep-your-head-down',
		slug: 'golf-ladies-first-pro-tip-no-9',
	},
	{
		destination: '/blog/glf-pro-tip-10-course-management',
		slug: 'golf-ladies-first-pro-tip-10-course-management',
	},
	{
		destination: '/blog/glf-pro-tip-11-practice-on-the-course',
		slug: 'golf-ladies-first-tip-no-11',
	},
	{
		destination: '/blog/glf-pro-tip-12-warm-up-before-your-round',
		slug: 'golf-ladies-first-pro-tip-12',
	},
	{
		destination: '/blog/glf-pro-tip-13-short-game-drill',
		slug: 'golf-ladies-first-pro-tip-no-13',
	},
	{
		destination: '/blog/glf-pro-tip-14-fit-for-golf',
		slug: 'golf-ladies-first-tip-no-14-fit-for-golf',
	},
	{
		destination: '/blog/glf-pro-tip-15-how-to-putt',
		slug: 'golf-ladies-first-tip-no-15-how-to-putt',
	},
	{
		destination: '/blog/glf-pro-tip-16-improve-your-iron-play',
		slug: 'golf-ladies-first-tip-no-16-improve-your-iron-play',
	},
	{
		destination: '/blog/glf-pro-tip-17-uphill-downhill-lies',
		slug: 'golf-ladies-first-tip-no-17-uphill-downhill-lies',
	},
	{
		destination: '/blog/glf-pro-tip-18-sidehill-lies',
		slug: 'golf-ladies-first-1',
	},
	{
		destination: '/blog/glf-pro-tip-19-distance-for-slower-swing-speeds',
		slug: 'golf-ladies-first-tip-no-19-distance-for-slower-swing-speeds',
	},
];
