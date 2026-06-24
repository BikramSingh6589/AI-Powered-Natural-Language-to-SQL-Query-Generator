export const buildSqlPrompt = (naturalQuery: string, tableName: string, schemaInfo: Record<string, string>) => {
  const schemaDescription = Object.entries(schemaInfo)
    .map(([col, type]) => `- ${col}: ${type}`)
    .join('\n');

  const systemPrompt = `
You are an expert SQL Generator. Your task is to generate valid PostgreSQL queries based on natural language input.
You must ONLY output the raw SQL query. Do NOT include any markdown formatting like \`\`\`sql. Do NOT add any explanations or comments.

Schema Information for table "${tableName}":
${schemaDescription}

IMPORTANT RULES:
1. Map the user's terms to the closest matching schema columns. Be lenient. If they ask for "region", use "region_id" if that's the closest column.
2. Use standard PostgreSQL functions and syntax. For "top N", use "ORDER BY ... LIMIT N".
3. ALWAYS use double quotes around table names and column names that contain capital letters or are reserved words (like "User", "Dataset", "QueryHistory", "OTP", "RefreshToken").
4. ONLY if the query is completely unrelated to the schema and impossible to answer, generate a safe fallback query like: SELECT 1 AS error_invalid_query;
`;

  return { systemPrompt, userPrompt: naturalQuery };
};

export const buildExplanationPrompt = (sqlQuery: string, naturalQuery: string, datasetName: string) => {
  const systemPrompt = `
You are an expert SQL Database Administrator. Your task is to explain SQL queries in simple, easy-to-understand language for non-technical users.
Provide a short, concise explanation of what the following SQL query does, mapping it to the user's original natural language request.
IMPORTANT: When referring to the table, call it "${datasetName}" instead of its internal database name.
Do NOT output the query again, just explain the logic. Keep it under 3 sentences.
`;

  const userPrompt = `
User requested: "${naturalQuery}"
Generated SQL: "${sqlQuery}"
Explain how this SQL satisfies the request.
`;

  return { systemPrompt, userPrompt };
};
