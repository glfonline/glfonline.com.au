import * as arrays from './arrays';
import * as documents from './documents';
import * as objects from './objects';

export const schemaTypes = [...Object.values(documents), ...Object.values(objects), ...Object.values(arrays)];
