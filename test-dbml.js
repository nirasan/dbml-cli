import { Parser, ModelExporter } from '@dbml/core';

// テスト用の簡単な DDL
const sampleDDL = `
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200),
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

console.log('Testing @dbml/core...\n');

try {
  // DDL を DBML にパース
  const parser = new Parser('mysql');
  const database = parser.parse(sampleDDL, 'mysql');

  console.log('✓ DDL parsing successful');
  console.log('Database name:', database.name || '(default)');
  console.log('Schemas:', database.schemas.length);

  // database オブジェクトから直接 JSON データを構築
  const schema = database.schemas[0];
  console.log('\nTables found:', schema.tables.length);

  const normalizedData = {
    name: database.name,
    schemas: database.schemas.map(schema => ({
      name: schema.name,
      tables: schema.tables.map(table => ({
        name: table.name,
        note: table.note,
        fields: table.fields.map(field => ({
          name: field.name,
          type: {
            type_name: field.type.type_name,
            args: field.type.args
          },
          pk: field.pk || false,
          unique: field.unique || false,
          not_null: field.not_null || false,
          note: field.note,
          dbdefault: field.dbdefault ? field.dbdefault.value : null
        })),
        indexes: table.indexes.map(idx => ({
          name: idx.name,
          columns: idx.columns.map(c => ({ value: c.value })),
          unique: idx.unique || false
        }))
      })),
      refs: schema.refs.map(ref => ({
        name: ref.name,
        endpoints: ref.endpoints.map(ep => ({
          tableName: ep.tableName,
          fieldNames: ep.fieldNames,
          relation: ep.relation
        }))
      }))
    }))
  };

  console.log('\nNormalized JSON output:');
  console.log(JSON.stringify(normalizedData, null, 2));

  console.log('\n✓ @dbml/core is working correctly!');
  console.log('\nテスト完了！DDL から DBML の JSON 中間データへの変換が機能します。');
} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
