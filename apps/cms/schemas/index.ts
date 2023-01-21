import { aboutPage } from './documents/about-page';
import { faqPage } from './documents/faq-page';
import { homePage } from './documents/home-page';
import { mainNavigation } from './documents/main-navigation';
import { testimonialsPage } from './documents/testimonial-page';
import { themePage } from './documents/theme-page';
import { aboutItem } from './objects/about-item';
import { categoryItem } from './objects/category-item';
import { collectionCardItem } from './objects/collection-card-item';
import { faqItem } from './objects/faq-item';
import { imageWithAlt } from './objects/image-with-alt';
import { navItem, sectionItem } from './objects/section-item';
import { testimonialItem } from './objects/testimonial-item';

const documents = [
	aboutPage,
	faqPage,
	homePage,
	mainNavigation,
	testimonialsPage,
	themePage,
];
const objects = [
	aboutItem,
	categoryItem,
	collectionCardItem,
	faqItem,
	imageWithAlt,
	navItem,
	sectionItem,
	testimonialItem,
];

export const schemaTypes = [...documents, ...objects];
