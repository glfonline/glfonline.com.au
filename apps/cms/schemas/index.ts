import { blockContent } from './arrays/block-content';
import { aboutPage } from './documents/about-page';
import { author } from './documents/author';
import { blogPosts } from './documents/blog-posts';
import { category } from './documents/category';
import { faqPage } from './documents/faq-page';
import { homePage } from './documents/home-page';
import { testimonialsPage } from './documents/testimonial-page';
import { themePage } from './documents/theme-page';
import { aboutItem } from './objects/about-item';
import { collectionCardItem } from './objects/collection-card-item';
import { faqItem } from './objects/faq-item';
import { imageWithAlt } from './objects/image-with-alt';
import { testimonialItem } from './objects/testimonial-item';

const documents = [
	aboutPage,
	author,
	blogPosts,
	category,
	faqPage,
	homePage,
	testimonialsPage,
	themePage,
];
const objects = [
	aboutItem,
	collectionCardItem,
	faqItem,
	imageWithAlt,
	testimonialItem,
];
const arrays = [blockContent];

export const schemaTypes = [...documents, ...objects, ...arrays];
