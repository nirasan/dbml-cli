export function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    format: 'json', // 'json' or 'dbml'
    dbType: 'mysql', // 'mysql', 'postgres', 'mssql', etc.
    pretty: true,
    help: false,
    version: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      args.help = true;
    } else if (arg === '-v' || arg === '--version') {
      args.version = true;
    } else if (arg === '-o' || arg === '--output') {
      args.output = argv[++i];
    } else if (arg === '-f' || arg === '--format') {
      args.format = argv[++i];
    } else if (arg === '-t' || arg === '--db-type') {
      args.dbType = argv[++i];
    } else if (arg === '--no-pretty') {
      args.pretty = false;
    } else if (!arg.startsWith('-')) {
      if (!args.input) {
        args.input = arg;
      }
    }
  }

  return args;
}

export function printHelp() {
  console.log(`
dbml-cli - Convert DDL to DBML JSON intermediate data

Usage:
  dbml-cli <input-file> [options]

Options:
  -o, --output <file>     Output file path (default: stdout)
  -f, --format <format>   Output format: 'json' or 'dbml' (default: json)
  -t, --db-type <type>    Database type: mysql, postgres, mssql, etc. (default: mysql)
  --no-pretty             Disable pretty printing for JSON output
  -h, --help              Show this help message
  -v, --version           Show version number

Examples:
  # Convert DDL to JSON (stdout)
  dbml-cli schema.sql

  # Convert DDL to JSON file
  dbml-cli schema.sql -o output.json

  # Convert DDL to DBML text format
  dbml-cli schema.sql -o output.dbml -f dbml

  # Convert PostgreSQL DDL
  dbml-cli schema.sql -t postgres -o output.json
`);
}
