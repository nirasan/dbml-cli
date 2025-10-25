export function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    format: 'json', // 'json' or 'dbml'
    dbType: null, // 'mysql', 'postgres', 'mssql', etc. (required)
    pretty: true,
    help: false,
    version: false,
    stdin: false
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
    } else if (arg === '--stdin') {
      args.stdin = true;
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
  dbml-cli <input-file> -t <db-type> [options]
  dbml-cli --stdin -t <db-type> [options]

Options:
  -t, --db-type <type>    Database type: mysql, postgres, etc. (required)
  -o, --output <file>     Output file path (default: stdout)
  --stdin                 Read DDL from standard input
  -f, --format <format>   Output format: 'json' or 'dbml' (default: json)
  --no-pretty             Disable pretty printing for JSON output
  -h, --help              Show this help message
  -v, --version           Show version number

Examples:
  # Convert MySQL DDL to JSON (stdout)
  dbml-cli schema.sql -t mysql

  # Convert MySQL DDL to JSON file
  dbml-cli schema.sql -t mysql -o output.json

  # Convert PostgreSQL DDL from stdin
  cat schema.sql | dbml-cli --stdin -t postgres

  # Convert PostgreSQL DDL to file
  dbml-cli schema.sql -t postgres -o output.json
`);
}
