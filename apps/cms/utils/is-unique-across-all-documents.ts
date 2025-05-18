import type { SlugIsUniqueValidator } from 'sanity';

const REGEX = /^drafts\./;

export const isUniqueAcrossAllDocuments: SlugIsUniqueValidator = async (slug, context) => {
	const { document, getClient } = context;
	const client = getClient({
		apiVersion: '2022-12-07',
	});
	const id = document?._id.replace(REGEX, '');
	const params = {
		draft: `drafts.${id}`,
		published: id,
		slug,
	};
	const query = '!defined(*[!(_id in [$draft, $published]) && slug.current == $slug][0]._id)';
	const result = await client.fetch(query, params);
	return result;
};
