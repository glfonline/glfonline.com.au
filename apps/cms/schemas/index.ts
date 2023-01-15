import { faqPage } from './documents/faq-page';
import { testimonialsPage } from './documents/testimonial-page';
import { themePage } from './documents/theme-page';
import { collectionCardItem } from './objects/collection-card-item';
import { faqItem } from './objects/faq-item';
import { imageWithAlt } from './objects/image-with-alt';
import { testimonialItem } from './objects/testimonial-item';

const documents = [themePage, faqPage, testimonialsPage];
const objects = [collectionCardItem, imageWithAlt, faqItem, testimonialItem];

export const schemaTypes = [...documents, ...objects];
