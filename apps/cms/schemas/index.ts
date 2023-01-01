import { themePage } from './documents/theme';
import { collectionCardItem } from './objects/collection-card-item';
import { imageWithAlt } from './objects/image-with-alt';

const documents = [themePage];
const objects = [collectionCardItem, imageWithAlt];

export const schemaTypes = [...documents, ...objects];
