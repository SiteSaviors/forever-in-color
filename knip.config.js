module.exports = {
  entry: ['src/index.tsx'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['**/*.test.{ts,tsx}', '**/*.stories.tsx']
};
{
  "scripts": {
    "knip": "knip",
    "knip:fix": "knip --fix",
    "knip:ci": "knip --no-progress --reporter compact"
  }
}
