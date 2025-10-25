import { Parser } from '@dbml/core';

export class SQLParseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'SQLParseError';
    this.originalError = originalError;
  }
}

/**
 * Preprocess SQL to remove unsupported statements
 */
function preprocessSQL(sqlContent, options) {
  // Default to true if not specified
  if (options.skipUnsupported === false) {
    return sqlContent;
  }

  let processed = sqlContent;

  // Remove PostgreSQL-style functions with $$ delimiters
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$[\s\S]*?;/gi, '');

  // Remove MySQL-style triggers (with BEGIN...END blocks)
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER[\s\S]*?BEGIN[\s\S]*?END\s*;/gi, '');

  // Remove simple triggers (without BEGIN...END)
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER[\s\S]*?;/gi, '');

  // Remove procedure calls
  processed = processed.replace(/CALL\s+[\s\S]*?;/gi, '');

  // Remove other unsupported PostgreSQL-specific statements
  processed = processed.replace(/DROP\s+(?:TRIGGER|FUNCTION)[\s\S]*?;/gi, '');

  // Clean up multiple empty lines
  processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');

  return processed.trim();
}

export function parseSQLToRawJSON(sqlContent, options = {}) {
  try {
    const { dialect = 'postgres' } = options;

    // Preprocess SQL to remove unsupported statements
    const processedSQL = preprocessSQL(sqlContent, options);

    let rawDatabase;
    switch (dialect) {
      case 'postgres':
        rawDatabase = Parser.parsePostgresToJSONv2(processedSQL);
        break;
      case 'mysql':
        rawDatabase = Parser.parseMySQLToJSONv2(processedSQL);
        break;
      default:
        throw new Error(`Unsupported dialect: ${dialect}`);
    }

    return rawDatabase;
  } catch (error) {
    // Enhanced error reporting
    let errorMessage = 'Failed to parse SQL';

    if (error instanceof Error) {
      errorMessage += `\nError: ${error.message}`;
      if (error.stack) {
        errorMessage += `\nStack trace:\n${error.stack}`;
      }
    } else {
      errorMessage += `\nUnknown error: ${JSON.stringify(error)}`;
    }

    // Log the SQL content length for debugging
    errorMessage += `\nSQL content length: ${sqlContent.length} characters`;
    errorMessage += `\nDialect: ${options.dialect || 'postgres'}`;

    throw new SQLParseError(errorMessage, error);
  }
}

export function parseSQLToDatabase(sqlContent, options = {}) {
  try {
    const rawDatabase = parseSQLToRawJSON(sqlContent, options);
    const database = Parser.parseJSONToDatabase(rawDatabase);
    return database;
  } catch (error) {
    throw new SQLParseError(
      `Failed to parse SQL to Database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    );
  }
}

export function simplifyReferences(obj, visited = new WeakSet(), path = '') {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (visited.has(obj)) {
    return `[Circular Reference to ${obj.constructor?.name || 'Object'}]`;
  }

  visited.add(obj);

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      simplifyReferences(item, visited, `${path}[${index}]`)
    );
  }

  const simplified = {};

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    // Skip certain verbose properties
    if (key === 'database' || key === 'schema' || key === 'table') {
      if (value && typeof value === 'object' && 'name' in value) {
        simplified[key] = `[Reference to ${value.constructor?.name}: "${value.name}"]`;
      } else {
        simplified[key] = `[Reference to ${value?.constructor?.name || 'Object'}]`;
      }
    } else {
      simplified[key] = simplifyReferences(value, visited, currentPath);
    }
  }

  visited.delete(obj);
  return simplified;
}

export function parseSQLToSimplifiedJSON(sqlContent, options = {}) {
  try {
    const rawDatabase = parseSQLToRawJSON(sqlContent, options);
    return JSON.stringify(rawDatabase, null, 2);
  } catch (error) {
    throw new SQLParseError(
      `Failed to parse SQL to simplified JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    );
  }
}
