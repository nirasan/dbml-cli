/**
 * @dbml/core の database オブジェクトを循環参照のない
 * 正規化された JSON データに変換する
 */
export function normalizeDatabase(database) {
  return {
    name: database.name || null,
    note: database.note || null,
    schemas: database.schemas.map(schema => normalizeSchema(schema))
  };
}

function normalizeSchema(schema) {
  return {
    name: schema.name || null,
    note: schema.note || null,
    tables: schema.tables.map(table => normalizeTable(table)),
    enums: schema.enums.map(e => normalizeEnum(e)),
    refs: schema.refs.map(ref => normalizeRef(ref)),
    tableGroups: schema.tableGroups.map(tg => normalizeTableGroup(tg))
  };
}

function normalizeTable(table) {
  return {
    name: table.name,
    alias: table.alias || null,
    note: table.note || null,
    headerColor: table.headerColor || null,
    fields: table.fields.map(field => normalizeField(field)),
    indexes: table.indexes.map(idx => normalizeIndex(idx))
  };
}

function normalizeField(field) {
  return {
    name: field.name,
    type: {
      type_name: field.type.type_name,
      args: field.type.args || null,
      schemaName: field.type.schemaName || null
    },
    pk: field.pk || false,
    unique: field.unique || false,
    not_null: field.not_null || false,
    increment: field.increment || false,
    note: field.note || null,
    dbdefault: field.dbdefault ? {
      type: field.dbdefault.type,
      value: field.dbdefault.value
    } : null
  };
}

function normalizeIndex(index) {
  return {
    name: index.name || null,
    columns: index.columns.map(col => ({
      value: col.value,
      type: col.type || 'column'
    })),
    unique: index.unique || false,
    type: index.type || null,
    pk: index.pk || false,
    note: index.note || null
  };
}

function normalizeEnum(enumObj) {
  return {
    name: enumObj.name,
    values: enumObj.values.map(v => ({
      name: v.name,
      note: v.note || null
    })),
    note: enumObj.note || null
  };
}

function normalizeRef(ref) {
  return {
    name: ref.name || null,
    endpoints: ref.endpoints.map(ep => ({
      tableName: ep.tableName,
      schemaName: ep.schemaName || null,
      fieldNames: ep.fieldNames,
      relation: ep.relation
    })),
    onUpdate: ref.onUpdate || null,
    onDelete: ref.onDelete || null
  };
}

function normalizeTableGroup(tableGroup) {
  return {
    name: tableGroup.name,
    tables: tableGroup.tables.map(t => ({
      tableName: t.tableName,
      schemaName: t.schemaName || null
    }))
  };
}
