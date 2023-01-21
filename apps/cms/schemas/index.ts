import { aboutPage } from './documents/about-page';
import { faqPage } from './documents/faq-page';
import { homePage } from './documents/home-page';
import { testimonialsPage } from './documents/testimonial-page';
import { themePage } from './documents/theme-page';
import { aboutItem } from './objects/about-item';
import { collectionCardItem } from './objects/collection-card-item';
import { faqItem } from './objects/faq-item';
import { imageWithAlt } from './objects/image-with-alt';
import { testimonialItem } from './objects/testimonial-item';

const documents = [homePage, themePage, faqPage, testimonialsPage, aboutPage];
const objects = [
	collectionCardItem,
	imageWithAlt,
	faqItem,
	testimonialItem,
	aboutItem,
];

export const schemaTypes = [...documents, ...objects];
