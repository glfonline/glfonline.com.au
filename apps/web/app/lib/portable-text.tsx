import { PortableText as PortableTextBase } from '@portabletext/react';

import { config } from './sanity-image';

type PortableTextBaseProps = React.ComponentProps<typeof PortableTextBase>;
type PortableTextProps = Pick<PortableTextBaseProps, 'value'>;

export function PortableText({ value = [] }: PortableTextProps) {
	return <PortableTextBase {...config} value={value} />;
}
