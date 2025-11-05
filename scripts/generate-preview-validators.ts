import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { zodToJsonSchema } from 'zod-to-json-schema';

import {
  previewRequestSchema,
  previewCompleteSchema,
  previewProcessingSchema,
  previewStatusSchema,
} from '../shared/validation/previewSchemaDefinitions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = resolve(__dirname, '../shared/validation/generated');

type SchemaEntry = {
  name: string;
  filename: string;
  schema: Parameters<typeof zodToJsonSchema>[0];
};

const schemaEntries: SchemaEntry[] = [
  { name: 'previewRequest', filename: 'preview-request.schema.json', schema: previewRequestSchema },
  { name: 'previewComplete', filename: 'preview-complete.schema.json', schema: previewCompleteSchema },
  { name: 'previewProcessing', filename: 'preview-processing.schema.json', schema: previewProcessingSchema },
  { name: 'previewStatus', filename: 'preview-status.schema.json', schema: previewStatusSchema },
];

const buildJsonSchema = (entry: SchemaEntry) => {
  const jsonSchema = zodToJsonSchema(entry.schema, entry.name, {
    target: 'jsonSchema7',
    strictUnions: true,
  });

  const resolved = (() => {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) {
      return jsonSchema;
    }

    const definitions = (jsonSchema as Record<string, unknown>).definitions as
      | Record<string, unknown>
      | undefined;

    if (definitions && entry.name in definitions) {
      return definitions[entry.name];
    }

    return jsonSchema;
  })();

  if (typeof resolved === 'object' && resolved !== null) {
    (resolved as Record<string, unknown>).$id = entry.name;
  }

  return resolved;
};

const serializeSchema = (entry: SchemaEntry, schema: unknown) => {
  const outputPath = resolve(outputDir, entry.filename);
  writeFileSync(outputPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
  return outputPath;
};

const main = () => {
  mkdirSync(outputDir, { recursive: true });

  const schemas = schemaEntries.map((entry) => ({ entry, schema: buildJsonSchema(entry) }));

  const jsonArtifactPaths = schemas.map(({ entry, schema }) => serializeSchema(entry, schema));

  // eslint-disable-next-line no-console
  console.log('[preview-validator] Generated schemas:', jsonArtifactPaths);
};

main();
