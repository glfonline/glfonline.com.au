import * as arrays from './arrays/block-content';
import * as documents from './documents';
import * as objects from './objects';

export const schemaTypes = [...Object.values(documents), ...Object.values(objects), ...Object.values(arrays)];
