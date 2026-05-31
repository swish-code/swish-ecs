#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import nextEnv from "@next/env";
import snowflake from "snowflake-sdk";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function printUsage() {
  console.log("Usage: node scripts/run-sql-file.mjs <path-to-sql> [--execute]");
  console.log("Without --execute, the script runs in dry-run mode and only prints parsed statements.");
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function splitSqlStatements(sqlText) {
  const statements = [];
  let buffer = "";
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sqlText.length; index += 1) {
    const current = sqlText[index];
    const next = sqlText[index + 1];

    if (inLineComment) {
      buffer += current;

      if (current === "\n") {
        inLineComment = false;
      }

      continue;
    }

    if (inBlockComment) {
      buffer += current;

      if (current === "*" && next === "/") {
        buffer += next;
        index += 1;
        inBlockComment = false;
      }

      continue;
    }

    if (!inSingleQuote && current === "-" && next === "-") {
      buffer += current;
      buffer += next;
      index += 1;
      inLineComment = true;
      continue;
    }

    if (!inSingleQuote && current === "/" && next === "*") {
      buffer += current;
      buffer += next;
      index += 1;
      inBlockComment = true;
      continue;
    }

    if (current === "'") {
      buffer += current;

      if (inSingleQuote && next === "'") {
        buffer += next;
        index += 1;
        continue;
      }

      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (!inSingleQuote && current === ";") {
      const statement = buffer.trim();

      if (statement) {
        statements.push(statement);
      }

      buffer = "";
      continue;
    }

    buffer += current;
  }

  const finalStatement = buffer.trim();

  if (finalStatement) {
    statements.push(finalStatement);
  }

  return statements;
}

function previewStatement(sqlText) {
  const cleanedStatement = sqlText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/--.*$/, "").trim())
    .find((line) => line.length > 0);

  if (!cleanedStatement) {
    return "<empty statement>";
  }

  return cleanedStatement.replace(/\s+/g, " ").slice(0, 120);
}

function connect(connection) {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroy(connection) {
  return new Promise((resolve, reject) => {
    connection.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function executeStatement(connection, sqlText) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      complete: (error, _statement, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(rows ?? []);
      },
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const fileArg = args.find((arg) => !arg.startsWith("--"));

  if (!fileArg) {
    printUsage();
    process.exit(1);
  }

  const shouldExecute = args.includes("--execute");
  const sqlFilePath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file not found: ${sqlFilePath}`);
  }

  const sqlText = fs.readFileSync(sqlFilePath, "utf8");
  const statements = splitSqlStatements(sqlText);
  const relativePath = path.relative(process.cwd(), sqlFilePath);

  if (statements.length === 0) {
    throw new Error(`No SQL statements found in ${relativePath}`);
  }

  console.log(`Loaded ${statements.length} statements from ${relativePath}.`);

  for (let index = 0; index < statements.length; index += 1) {
    console.log(`[${index + 1}/${statements.length}] ${previewStatement(statements[index])}`);
  }

  if (!shouldExecute) {
    console.log("Dry run complete. Re-run with --execute to apply statements.");
    return;
  }

  const connection = snowflake.createConnection({
    account: getRequiredEnv("SNOWFLAKE_ACCOUNT"),
    username: getRequiredEnv("SNOWFLAKE_USERNAME"),
    password: getRequiredEnv("SNOWFLAKE_PASSWORD"),
    database: getRequiredEnv("SNOWFLAKE_DATABASE"),
    schema: getRequiredEnv("SNOWFLAKE_SCHEMA"),
    warehouse: getRequiredEnv("SNOWFLAKE_WAREHOUSE"),
    role: process.env.SNOWFLAKE_ROLE?.trim() || undefined,
  });

  console.log(
    `Executing against ${process.env.SNOWFLAKE_DATABASE}.${process.env.SNOWFLAKE_SCHEMA} using warehouse ${process.env.SNOWFLAKE_WAREHOUSE}.`,
  );

  await connect(connection);

  try {
    for (let index = 0; index < statements.length; index += 1) {
      const statement = statements[index];
      console.log(`Running [${index + 1}/${statements.length}] ${previewStatement(statement)}`);
      const rows = await executeStatement(connection, statement);

      if (rows.length > 0) {
        console.table(rows);
      }
    }
  } finally {
    await destroy(connection);
  }

  console.log(`Execution complete for ${relativePath}.`);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
