import { faqPage } from './documents/faq-page';
import { themePage } from './documents/theme-page';
import { collectionCardItem } from './objects/collection-card-item';
import { faqItem } from './objects/faq-item';
import { imageWithAlt } from './objects/image-with-alt';

const documents = [themePage, faqPage];
const objects = [collectionCardItem, imageWithAlt, faqItem];

export const schemaTypes = [...documents, ...objects];
