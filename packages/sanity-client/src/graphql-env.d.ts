export type introspection_types = {
	AboutItem: {
		kind: 'OBJECT';
		name: 'AboutItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			aboutImage: {
				name: 'aboutImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			contentRaw: {
				name: 'contentRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			subheading: {
				name: 'subheading';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	AboutItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'AboutItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'aboutImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'subheading';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	AboutItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'AboutItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'aboutImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'subheading';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	AboutPage: {
		kind: 'OBJECT';
		name: 'AboutPage';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			sections: {
				name: 'sections';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'AboutItem';
						ofType: null;
					};
				};
			};
		};
	};
	AboutPageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'AboutPageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	AboutPageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'AboutPageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Author: {
		kind: 'OBJECT';
		name: 'Author';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			bioRaw: {
				name: 'bioRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			image: {
				name: 'image';
				type: {
					kind: 'OBJECT';
					name: 'Image';
					ofType: null;
				};
			};
			name: {
				name: 'name';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			slug: {
				name: 'slug';
				type: {
					kind: 'OBJECT';
					name: 'Slug';
					ofType: null;
				};
			};
		};
	};
	AuthorFilter: {
		kind: 'INPUT_OBJECT';
		name: 'AuthorFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'name';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'slug';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SlugFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	AuthorSorting: {
		kind: 'INPUT_OBJECT';
		name: 'AuthorSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'name';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'slug';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SlugSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Block: {
		kind: 'OBJECT';
		name: 'Block';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			children: {
				name: 'children';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'Span';
						ofType: null;
					};
				};
			};
			level: {
				name: 'level';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			listItem: {
				name: 'listItem';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			style: {
				name: 'style';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	BlockOrImage: {
		kind: 'UNION';
		name: 'BlockOrImage';
		fields: {};
		possibleTypes: 'Block' | 'Image';
	};
	Boolean: unknown;
	BooleanFilter: {
		kind: 'INPUT_OBJECT';
		name: 'BooleanFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Brand: {
		kind: 'OBJECT';
		name: 'Brand';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			href: {
				name: 'href';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			image: {
				name: 'image';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			theme: {
				name: 'theme';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	BrandFilter: {
		kind: 'INPUT_OBJECT';
		name: 'BrandFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	BrandSorting: {
		kind: 'INPUT_OBJECT';
		name: 'BrandSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Category: {
		kind: 'OBJECT';
		name: 'Category';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			description: {
				name: 'description';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			title: {
				name: 'title';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	CategoryFilter: {
		kind: 'INPUT_OBJECT';
		name: 'CategoryFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	CategorySorting: {
		kind: 'INPUT_OBJECT';
		name: 'CategorySorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	CollectionCardItem: {
		kind: 'OBJECT';
		name: 'CollectionCardItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			href: {
				name: 'href';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			image: {
				name: 'image';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			span: {
				name: 'span';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	CollectionCardItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'CollectionCardItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'span';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	CollectionCardItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'CollectionCardItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'span';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	CrossDatasetReference: {
		kind: 'OBJECT';
		name: 'CrossDatasetReference';
		fields: {
			_dataset: {
				name: '_dataset';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_projectId: {
				name: '_projectId';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_ref: {
				name: '_ref';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_weak: {
				name: '_weak';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
			};
		};
	};
	CrossDatasetReferenceFilter: {
		kind: 'INPUT_OBJECT';
		name: 'CrossDatasetReferenceFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_dataset';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_projectId';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_ref';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_weak';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'BooleanFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	CrossDatasetReferenceSorting: {
		kind: 'INPUT_OBJECT';
		name: 'CrossDatasetReferenceSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_dataset';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_projectId';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_ref';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_weak';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Date: unknown;
	DateFilter: {
		kind: 'INPUT_OBJECT';
		name: 'DateFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gt';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gte';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lt';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lte';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'Date';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	DateTime: unknown;
	DatetimeFilter: {
		kind: 'INPUT_OBJECT';
		name: 'DatetimeFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gte';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lte';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Document: {
		kind: 'INTERFACE';
		name: 'Document';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
		};
		possibleTypes:
			| 'AboutPage'
			| 'Author'
			| 'Brand'
			| 'Category'
			| 'FaqPage'
			| 'HomePage'
			| 'MainNavigation'
			| 'Post'
			| 'SanityFileAsset'
			| 'SanityImageAsset'
			| 'TestimonialsPage'
			| 'ThemePage';
	};
	DocumentFilter: {
		kind: 'INPUT_OBJECT';
		name: 'DocumentFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	DocumentSorting: {
		kind: 'INPUT_OBJECT';
		name: 'DocumentSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FaqItem: {
		kind: 'OBJECT';
		name: 'FaqItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			answerRaw: {
				name: 'answerRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			question: {
				name: 'question';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	FaqItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'FaqItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'question';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FaqItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'FaqItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'question';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FaqPage: {
		kind: 'OBJECT';
		name: 'FaqPage';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			faqs: {
				name: 'faqs';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'FaqItem';
						ofType: null;
					};
				};
			};
			heroImage: {
				name: 'heroImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
		};
	};
	FaqPageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'FaqPageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FaqPageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'FaqPageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FeaturedNavItem: {
		kind: 'OBJECT';
		name: 'FeaturedNavItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			href: {
				name: 'href';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			image: {
				name: 'image';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	FeaturedNavItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'FeaturedNavItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FeaturedNavItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'FeaturedNavItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	File: {
		kind: 'OBJECT';
		name: 'File';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			asset: {
				name: 'asset';
				type: {
					kind: 'OBJECT';
					name: 'SanityFileAsset';
					ofType: null;
				};
			};
			media: {
				name: 'media';
				type: {
					kind: 'OBJECT';
					name: 'GlobalDocumentReference';
					ofType: null;
				};
			};
		};
	};
	FileFilter: {
		kind: 'INPUT_OBJECT';
		name: 'FileFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'asset';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityFileAssetFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	FileSorting: {
		kind: 'INPUT_OBJECT';
		name: 'FileSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Float: unknown;
	FloatFilter: {
		kind: 'INPUT_OBJECT';
		name: 'FloatFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gt';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gte';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lt';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lte';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Geopoint: {
		kind: 'OBJECT';
		name: 'Geopoint';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			alt: {
				name: 'alt';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			lat: {
				name: 'lat';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			lng: {
				name: 'lng';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
		};
	};
	GeopointFilter: {
		kind: 'INPUT_OBJECT';
		name: 'GeopointFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'alt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lat';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lng';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	GeopointSorting: {
		kind: 'INPUT_OBJECT';
		name: 'GeopointSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'alt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lat';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lng';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	GlobalDocumentReference: {
		kind: 'OBJECT';
		name: 'GlobalDocumentReference';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_ref: {
				name: '_ref';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_weak: {
				name: '_weak';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
			};
		};
	};
	GlobalDocumentReferenceFilter: {
		kind: 'INPUT_OBJECT';
		name: 'GlobalDocumentReferenceFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_ref';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_weak';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'BooleanFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	GlobalDocumentReferenceSorting: {
		kind: 'INPUT_OBJECT';
		name: 'GlobalDocumentReferenceSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_ref';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_weak';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	HomePage: {
		kind: 'OBJECT';
		name: 'HomePage';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			brandsWeLove: {
				name: 'brandsWeLove';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'Brand';
						ofType: null;
					};
				};
			};
			descriptionRaw: {
				name: 'descriptionRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			heading: {
				name: 'heading';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'SCALAR';
						name: 'String';
						ofType: null;
					};
				};
			};
			heroImage: {
				name: 'heroImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			themeCards: {
				name: 'themeCards';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'ThemeCardItem';
						ofType: null;
					};
				};
			};
		};
	};
	HomePageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'HomePageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	HomePageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'HomePageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ID: unknown;
	IDFilter: {
		kind: 'INPUT_OBJECT';
		name: 'IDFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'in';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'NON_NULL';
						name: never;
						ofType: {
							kind: 'SCALAR';
							name: 'ID';
							ofType: null;
						};
					};
				};
				defaultValue: null;
			},
			{
				name: 'matches';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'nin';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'NON_NULL';
						name: never;
						ofType: {
							kind: 'SCALAR';
							name: 'ID';
							ofType: null;
						};
					};
				};
				defaultValue: null;
			},
		];
	};
	Image: {
		kind: 'OBJECT';
		name: 'Image';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			asset: {
				name: 'asset';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageAsset';
					ofType: null;
				};
			};
			crop: {
				name: 'crop';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageCrop';
					ofType: null;
				};
			};
			hotspot: {
				name: 'hotspot';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageHotspot';
					ofType: null;
				};
			};
			media: {
				name: 'media';
				type: {
					kind: 'OBJECT';
					name: 'GlobalDocumentReference';
					ofType: null;
				};
			};
		};
	};
	ImageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'ImageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'asset';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageAssetFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'crop';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageCropFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hotspot';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageHotspotFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ImageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'ImageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'crop';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageCropSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hotspot';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageHotspotSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ImageWithAlt: {
		kind: 'OBJECT';
		name: 'ImageWithAlt';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			alt: {
				name: 'alt';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			asset: {
				name: 'asset';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageAsset';
					ofType: null;
				};
			};
			crop: {
				name: 'crop';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageCrop';
					ofType: null;
				};
			};
			hotspot: {
				name: 'hotspot';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageHotspot';
					ofType: null;
				};
			};
			media: {
				name: 'media';
				type: {
					kind: 'OBJECT';
					name: 'GlobalDocumentReference';
					ofType: null;
				};
			};
		};
	};
	ImageWithAltFilter: {
		kind: 'INPUT_OBJECT';
		name: 'ImageWithAltFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'alt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'asset';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageAssetFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'crop';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageCropFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hotspot';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageHotspotFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ImageWithAltSorting: {
		kind: 'INPUT_OBJECT';
		name: 'ImageWithAltSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'alt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'crop';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageCropSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hotspot';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageHotspotSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'media';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GlobalDocumentReferenceSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Int: unknown;
	IntFilter: {
		kind: 'INPUT_OBJECT';
		name: 'IntFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gt';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'gte';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lt';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lte';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'Int';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	JSON: unknown;
	MainNavigation: {
		kind: 'OBJECT';
		name: 'MainNavigation';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			navCategories: {
				name: 'navCategories';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'NavCategory';
						ofType: null;
					};
				};
			};
			pages: {
				name: 'pages';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'NavItem';
						ofType: null;
					};
				};
			};
		};
	};
	MainNavigationFilter: {
		kind: 'INPUT_OBJECT';
		name: 'MainNavigationFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	MainNavigationSorting: {
		kind: 'INPUT_OBJECT';
		name: 'MainNavigationSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavCategory: {
		kind: 'OBJECT';
		name: 'NavCategory';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			featuredItems: {
				name: 'featuredItems';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'FeaturedNavItem';
						ofType: null;
					};
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			navSections: {
				name: 'navSections';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'NavSection';
						ofType: null;
					};
				};
			};
			theme: {
				name: 'theme';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	NavCategoryFilter: {
		kind: 'INPUT_OBJECT';
		name: 'NavCategoryFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavCategorySorting: {
		kind: 'INPUT_OBJECT';
		name: 'NavCategorySorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavItem: {
		kind: 'OBJECT';
		name: 'NavItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			href: {
				name: 'href';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	NavItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'NavItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'NavItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavSection: {
		kind: 'OBJECT';
		name: 'NavSection';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			items: {
				name: 'items';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'NavItem';
						ofType: null;
					};
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	NavSectionFilter: {
		kind: 'INPUT_OBJECT';
		name: 'NavSectionFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	NavSectionSorting: {
		kind: 'INPUT_OBJECT';
		name: 'NavSectionSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Post: {
		kind: 'OBJECT';
		name: 'Post';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			author: {
				name: 'author';
				type: {
					kind: 'OBJECT';
					name: 'Author';
					ofType: null;
				};
			};
			bodyRaw: {
				name: 'bodyRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			categories: {
				name: 'categories';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'Category';
						ofType: null;
					};
				};
			};
			mainImage: {
				name: 'mainImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			publishedAt: {
				name: 'publishedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			slug: {
				name: 'slug';
				type: {
					kind: 'OBJECT';
					name: 'Slug';
					ofType: null;
				};
			};
			title: {
				name: 'title';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	PostFilter: {
		kind: 'INPUT_OBJECT';
		name: 'PostFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'author';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'AuthorFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mainImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'publishedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'slug';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SlugFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	PostSorting: {
		kind: 'INPUT_OBJECT';
		name: 'PostSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mainImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'publishedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'slug';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SlugSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	RootQuery: {
		kind: 'OBJECT';
		name: 'RootQuery';
		fields: {
			AboutPage: {
				name: 'AboutPage';
				type: {
					kind: 'OBJECT';
					name: 'AboutPage';
					ofType: null;
				};
			};
			Author: {
				name: 'Author';
				type: {
					kind: 'OBJECT';
					name: 'Author';
					ofType: null;
				};
			};
			Brand: {
				name: 'Brand';
				type: {
					kind: 'OBJECT';
					name: 'Brand';
					ofType: null;
				};
			};
			Category: {
				name: 'Category';
				type: {
					kind: 'OBJECT';
					name: 'Category';
					ofType: null;
				};
			};
			Document: {
				name: 'Document';
				type: {
					kind: 'INTERFACE';
					name: 'Document';
					ofType: null;
				};
			};
			FaqPage: {
				name: 'FaqPage';
				type: {
					kind: 'OBJECT';
					name: 'FaqPage';
					ofType: null;
				};
			};
			HomePage: {
				name: 'HomePage';
				type: {
					kind: 'OBJECT';
					name: 'HomePage';
					ofType: null;
				};
			};
			MainNavigation: {
				name: 'MainNavigation';
				type: {
					kind: 'OBJECT';
					name: 'MainNavigation';
					ofType: null;
				};
			};
			Post: {
				name: 'Post';
				type: {
					kind: 'OBJECT';
					name: 'Post';
					ofType: null;
				};
			};
			SanityFileAsset: {
				name: 'SanityFileAsset';
				type: {
					kind: 'OBJECT';
					name: 'SanityFileAsset';
					ofType: null;
				};
			};
			SanityImageAsset: {
				name: 'SanityImageAsset';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageAsset';
					ofType: null;
				};
			};
			TestimonialsPage: {
				name: 'TestimonialsPage';
				type: {
					kind: 'OBJECT';
					name: 'TestimonialsPage';
					ofType: null;
				};
			};
			ThemePage: {
				name: 'ThemePage';
				type: {
					kind: 'OBJECT';
					name: 'ThemePage';
					ofType: null;
				};
			};
			allAboutPage: {
				name: 'allAboutPage';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'AboutPage';
								ofType: null;
							};
						};
					};
				};
			};
			allAuthor: {
				name: 'allAuthor';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'Author';
								ofType: null;
							};
						};
					};
				};
			};
			allBrand: {
				name: 'allBrand';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'Brand';
								ofType: null;
							};
						};
					};
				};
			};
			allCategory: {
				name: 'allCategory';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'Category';
								ofType: null;
							};
						};
					};
				};
			};
			allDocument: {
				name: 'allDocument';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'INTERFACE';
								name: 'Document';
								ofType: null;
							};
						};
					};
				};
			};
			allFaqPage: {
				name: 'allFaqPage';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'FaqPage';
								ofType: null;
							};
						};
					};
				};
			};
			allHomePage: {
				name: 'allHomePage';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'HomePage';
								ofType: null;
							};
						};
					};
				};
			};
			allMainNavigation: {
				name: 'allMainNavigation';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'MainNavigation';
								ofType: null;
							};
						};
					};
				};
			};
			allPost: {
				name: 'allPost';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'Post';
								ofType: null;
							};
						};
					};
				};
			};
			allSanityFileAsset: {
				name: 'allSanityFileAsset';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'SanityFileAsset';
								ofType: null;
							};
						};
					};
				};
			};
			allSanityImageAsset: {
				name: 'allSanityImageAsset';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'SanityImageAsset';
								ofType: null;
							};
						};
					};
				};
			};
			allTestimonialsPage: {
				name: 'allTestimonialsPage';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'TestimonialsPage';
								ofType: null;
							};
						};
					};
				};
			};
			allThemePage: {
				name: 'allThemePage';
				type: {
					kind: 'NON_NULL';
					name: never;
					ofType: {
						kind: 'LIST';
						name: never;
						ofType: {
							kind: 'NON_NULL';
							name: never;
							ofType: {
								kind: 'OBJECT';
								name: 'ThemePage';
								ofType: null;
							};
						};
					};
				};
			};
		};
	};
	SanityAssetSourceData: {
		kind: 'OBJECT';
		name: 'SanityAssetSourceData';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			id: {
				name: 'id';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			name: {
				name: 'name';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			url: {
				name: 'url';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	SanityAssetSourceDataFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityAssetSourceDataFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'name';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityAssetSourceDataSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityAssetSourceDataSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'name';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityFileAsset: {
		kind: 'OBJECT';
		name: 'SanityFileAsset';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			altText: {
				name: 'altText';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			assetId: {
				name: 'assetId';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			description: {
				name: 'description';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			extension: {
				name: 'extension';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			mimeType: {
				name: 'mimeType';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			originalFilename: {
				name: 'originalFilename';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			path: {
				name: 'path';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			sha1hash: {
				name: 'sha1hash';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			size: {
				name: 'size';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			source: {
				name: 'source';
				type: {
					kind: 'OBJECT';
					name: 'SanityAssetSourceData';
					ofType: null;
				};
			};
			title: {
				name: 'title';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			uploadId: {
				name: 'uploadId';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			url: {
				name: 'url';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	SanityFileAssetFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityFileAssetFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'altText';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'assetId';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'extension';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mimeType';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'originalFilename';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'path';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'sha1hash';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'size';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityAssetSourceDataFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'uploadId';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityFileAssetSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityFileAssetSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'altText';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'assetId';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'extension';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mimeType';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'originalFilename';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'path';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'sha1hash';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'size';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityAssetSourceDataSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'uploadId';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageAsset: {
		kind: 'OBJECT';
		name: 'SanityImageAsset';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			altText: {
				name: 'altText';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			assetId: {
				name: 'assetId';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			description: {
				name: 'description';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			extension: {
				name: 'extension';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			metadata: {
				name: 'metadata';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageMetadata';
					ofType: null;
				};
			};
			mimeType: {
				name: 'mimeType';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			originalFilename: {
				name: 'originalFilename';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			path: {
				name: 'path';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			sha1hash: {
				name: 'sha1hash';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			size: {
				name: 'size';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			source: {
				name: 'source';
				type: {
					kind: 'OBJECT';
					name: 'SanityAssetSourceData';
					ofType: null;
				};
			};
			title: {
				name: 'title';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			uploadId: {
				name: 'uploadId';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			url: {
				name: 'url';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	SanityImageAssetFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageAssetFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'altText';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'assetId';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'extension';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'metadata';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageMetadataFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mimeType';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'originalFilename';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'path';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'sha1hash';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'size';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityAssetSourceDataFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'uploadId';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageAssetSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageAssetSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'altText';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'assetId';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'description';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'extension';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'metadata';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageMetadataSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'mimeType';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'originalFilename';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'path';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'sha1hash';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'size';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityAssetSourceDataSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'uploadId';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'url';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageCrop: {
		kind: 'OBJECT';
		name: 'SanityImageCrop';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			bottom: {
				name: 'bottom';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			left: {
				name: 'left';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			right: {
				name: 'right';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			top: {
				name: 'top';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
		};
	};
	SanityImageCropFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageCropFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'bottom';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'left';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'right';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'top';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageCropSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageCropSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'bottom';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'left';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'right';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'top';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageDimensions: {
		kind: 'OBJECT';
		name: 'SanityImageDimensions';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			aspectRatio: {
				name: 'aspectRatio';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			height: {
				name: 'height';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			width: {
				name: 'width';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
		};
	};
	SanityImageDimensionsFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageDimensionsFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'aspectRatio';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'height';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'width';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageDimensionsSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageDimensionsSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'aspectRatio';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'height';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'width';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageHotspot: {
		kind: 'OBJECT';
		name: 'SanityImageHotspot';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			height: {
				name: 'height';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			width: {
				name: 'width';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			x: {
				name: 'x';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			y: {
				name: 'y';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
		};
	};
	SanityImageHotspotFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageHotspotFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'height';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'width';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'x';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'y';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageHotspotSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageHotspotSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'height';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'width';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'x';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'y';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageMetadata: {
		kind: 'OBJECT';
		name: 'SanityImageMetadata';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			blurHash: {
				name: 'blurHash';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			dimensions: {
				name: 'dimensions';
				type: {
					kind: 'OBJECT';
					name: 'SanityImageDimensions';
					ofType: null;
				};
			};
			hasAlpha: {
				name: 'hasAlpha';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
			};
			isOpaque: {
				name: 'isOpaque';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
			};
			location: {
				name: 'location';
				type: {
					kind: 'OBJECT';
					name: 'Geopoint';
					ofType: null;
				};
			};
			lqip: {
				name: 'lqip';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			palette: {
				name: 'palette';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePalette';
					ofType: null;
				};
			};
		};
	};
	SanityImageMetadataFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageMetadataFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'blurHash';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'dimensions';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageDimensionsFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hasAlpha';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'BooleanFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'isOpaque';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'BooleanFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'location';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GeopointFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lqip';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'palette';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImageMetadataSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImageMetadataSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'blurHash';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'dimensions';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImageDimensionsSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'hasAlpha';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'isOpaque';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'location';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'GeopointSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lqip';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'palette';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImagePalette: {
		kind: 'OBJECT';
		name: 'SanityImagePalette';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			darkMuted: {
				name: 'darkMuted';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			darkVibrant: {
				name: 'darkVibrant';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			dominant: {
				name: 'dominant';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			lightMuted: {
				name: 'lightMuted';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			lightVibrant: {
				name: 'lightVibrant';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			muted: {
				name: 'muted';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
			vibrant: {
				name: 'vibrant';
				type: {
					kind: 'OBJECT';
					name: 'SanityImagePaletteSwatch';
					ofType: null;
				};
			};
		};
	};
	SanityImagePaletteFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImagePaletteFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'darkMuted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'darkVibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'dominant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lightMuted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lightVibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'muted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'vibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImagePaletteSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImagePaletteSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'darkMuted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'darkVibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'dominant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lightMuted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'lightVibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'muted';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'vibrant';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'SanityImagePaletteSwatchSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImagePaletteSwatch: {
		kind: 'OBJECT';
		name: 'SanityImagePaletteSwatch';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			background: {
				name: 'background';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			foreground: {
				name: 'foreground';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			population: {
				name: 'population';
				type: {
					kind: 'SCALAR';
					name: 'Float';
					ofType: null;
				};
			};
			title: {
				name: 'title';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	SanityImagePaletteSwatchFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImagePaletteSwatchFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'background';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'foreground';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'population';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'FloatFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SanityImagePaletteSwatchSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SanityImagePaletteSwatchSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'background';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'foreground';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'population';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'title';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Sanity_DocumentFilter: {
		kind: 'INPUT_OBJECT';
		name: 'Sanity_DocumentFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'is_draft';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'references';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	Slug: {
		kind: 'OBJECT';
		name: 'Slug';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			current: {
				name: 'current';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			source: {
				name: 'source';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	SlugFilter: {
		kind: 'INPUT_OBJECT';
		name: 'SlugFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'current';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SlugSorting: {
		kind: 'INPUT_OBJECT';
		name: 'SlugSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'current';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'source';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	SortOrder: {
		name: 'SortOrder';
		enumValues: 'ASC' | 'DESC';
	};
	Span: {
		kind: 'OBJECT';
		name: 'Span';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			marks: {
				name: 'marks';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'SCALAR';
						name: 'String';
						ofType: null;
					};
				};
			};
			text: {
				name: 'text';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	String: unknown;
	StringFilter: {
		kind: 'INPUT_OBJECT';
		name: 'StringFilter';
		isOneOf: false;
		inputFields: [
			{
				name: 'eq';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'in';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'NON_NULL';
						name: never;
						ofType: {
							kind: 'SCALAR';
							name: 'String';
							ofType: null;
						};
					};
				};
				defaultValue: null;
			},
			{
				name: 'is_defined';
				type: {
					kind: 'SCALAR';
					name: 'Boolean';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'matches';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'neq';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'nin';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'NON_NULL';
						name: never;
						ofType: {
							kind: 'SCALAR';
							name: 'String';
							ofType: null;
						};
					};
				};
				defaultValue: null;
			},
		];
	};
	TestimonialItem: {
		kind: 'OBJECT';
		name: 'TestimonialItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			author: {
				name: 'author';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			quoteRaw: {
				name: 'quoteRaw';
				type: {
					kind: 'SCALAR';
					name: 'JSON';
					ofType: null;
				};
			};
			testimonialImage: {
				name: 'testimonialImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
		};
	};
	TestimonialItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'TestimonialItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'author';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'testimonialImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	TestimonialItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'TestimonialItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'author';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'testimonialImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	TestimonialsPage: {
		kind: 'OBJECT';
		name: 'TestimonialsPage';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			heroImage: {
				name: 'heroImage';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			testimonials: {
				name: 'testimonials';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'TestimonialItem';
						ofType: null;
					};
				};
			};
		};
	};
	TestimonialsPageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'TestimonialsPageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	TestimonialsPageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'TestimonialsPageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heroImage';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ThemeCardItem: {
		kind: 'OBJECT';
		name: 'ThemeCardItem';
		fields: {
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			heading: {
				name: 'heading';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			href: {
				name: 'href';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			image: {
				name: 'image';
				type: {
					kind: 'OBJECT';
					name: 'ImageWithAlt';
					ofType: null;
				};
			};
			label: {
				name: 'label';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			theme: {
				name: 'theme';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	ThemeCardItemFilter: {
		kind: 'INPUT_OBJECT';
		name: 'ThemeCardItemFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heading';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ThemeCardItemSorting: {
		kind: 'INPUT_OBJECT';
		name: 'ThemeCardItemSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'heading';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'href';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'image';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'ImageWithAltSorting';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'label';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ThemePage: {
		kind: 'OBJECT';
		name: 'ThemePage';
		fields: {
			_createdAt: {
				name: '_createdAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			_id: {
				name: '_id';
				type: {
					kind: 'SCALAR';
					name: 'ID';
					ofType: null;
				};
			};
			_key: {
				name: '_key';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_rev: {
				name: '_rev';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_type: {
				name: '_type';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
			_updatedAt: {
				name: '_updatedAt';
				type: {
					kind: 'SCALAR';
					name: 'DateTime';
					ofType: null;
				};
			};
			brandsWeLove: {
				name: 'brandsWeLove';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'Brand';
						ofType: null;
					};
				};
			};
			collectionCards: {
				name: 'collectionCards';
				type: {
					kind: 'LIST';
					name: never;
					ofType: {
						kind: 'OBJECT';
						name: 'CollectionCardItem';
						ofType: null;
					};
				};
			};
			theme: {
				name: 'theme';
				type: {
					kind: 'SCALAR';
					name: 'String';
					ofType: null;
				};
			};
		};
	};
	ThemePageFilter: {
		kind: 'INPUT_OBJECT';
		name: 'ThemePageFilter';
		isOneOf: false;
		inputFields: [
			{
				name: '_';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'Sanity_DocumentFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_createdAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'IDFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'DatetimeFilter';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'INPUT_OBJECT';
					name: 'StringFilter';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
	ThemePageSorting: {
		kind: 'INPUT_OBJECT';
		name: 'ThemePageSorting';
		isOneOf: false;
		inputFields: [
			{
				name: '_createdAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_id';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_key';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_rev';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_type';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: '_updatedAt';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
			{
				name: 'theme';
				type: {
					kind: 'ENUM';
					name: 'SortOrder';
					ofType: null;
				};
				defaultValue: null;
			},
		];
	};
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
	name: never;
	query: 'RootQuery';
	mutation: never;
	subscription: never;
	types: introspection_types;
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
	interface setupSchema {
		introspection: introspection;
	}
}
