import fs from "fs";
import path from "path";

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeTrailingS(str: string) {
  return str.endsWith("s") ? str.slice(0, -1) : str;
}

function fieldToTs(name: string, def: any): string {
  if (typeof def === "string") {
    return `${name}: f.string(),`;
  }
  switch (def.type) {
    case "date":
      return `${name}: f.date(${def.optional ? "{ optional: true }" : ""}),`;
    case "day":
      return `${name}: f.day(${def.optional ? "{ optional: true }" : ""}),`;
    case "int":
      return `${name}: f.int(${def.optional ? "{ optional: true }" : ""}),`;
    case "bigint":
      return `${name}: f.bigint(${def.optional ? "{ optional: true }" : ""}),`;
    case "bool":
      return `${name}: f.bool(${def.optional ? "{ optional: true }" : ""}),`;
    case "json":
      return `${name}: f.object<any>(${def.optional ? "{ optional: true }" : ""}),`;
    case "array":
      return `${name}: f.array<any>(${def.optional ? "{ optional: true }" : ""}),`;
    case "string":
    case undefined:
      return `${name}: f.string(${def.optional ? "{ optional: true }" : ""}),`;
    default:
      throw new Error(`Unknown type for field '${name}: ${def.type}'`);
  }
}

function generateTs(schema: any): string {
  const name = schema.name;
  const Name = capitalizeFirst(name);
  const descImports = new Set(["makeModel"]);
  const modelImports = new Map<string, string[]>();

  let imports = ['import * as f from "./_fields";'];

  const fieldLines: string[] = [];
  const belongsToLines: string[] = [];
  const hasManyLines: string[] = [];
  const belongsToFields = new Map<string, string>();

  // fields
  for (const fItem of schema.fields || []) {
    if (typeof fItem === "string") {
      fieldLines.push(fieldToTs(fItem, "string"));
    } else if (typeof fItem === "object") {
      for (const [fname, fdef] of Object.entries(fItem)) {
        fieldLines.push(fieldToTs(fname, fdef));
      }
    }
  }

  // belongsTo
  for (const b of schema.belongsTo || []) {
    if (typeof b === "string") {
      const fk = `${b}Id`;
      belongsToFields.set(fk, b);
      belongsToLines.push(`${fk}: g.belongsTo<${fk}>("${b}"),`);
      modelImports.set(b, [`${b}Id`]);
    } else if (typeof b === "object") {
      for (const [alias, def] of Object.entries<any>(b)) {
        const model = def.model ?? alias;
        const fk = `${alias}Id`;
        belongsToFields.set(fk, model);
        belongsToLines.push(
          `${fk}: f.belongsTo<${fk}>("${alias}", ${def.optional ? ", { optional: true }" : ""}),`,
        );
        modelImports.set(model, [`${fk}`]);
      }
    }
  }

  // hasMany
  for (const h of schema.hasMany || []) {
    if (typeof h === "string") {
      descImports.add("hasMany");
      hasManyLines.push(`${h}: hasMany(() => ${removeTrailingS(h)}Desc),`);
      modelImports.set(removeTrailingS(h), [`${removeTrailingS(h)}Desc`]);
    } else if (typeof h === "object") {
      for (const [alias, def] of Object.entries<any>(h)) {
        const model = def.model ?? removeTrailingS(alias);
        const type = def.isSingleton ? "hasOne" : "hasMany";
        descImports.add(type);
        hasManyLines.push(`${alias}: ${type}(() => ${model}Desc),`);
        modelImports.set(model, [`${model}Desc`]);
      }
    }
  }

  let idDefinition = "";

  // compoundKey or key
  const getKeyLine = () => {
    const addIdField = (idField: string) => {
      if (belongsToFields.has(idField)) {
        const model = belongsToFields.get(idField)!;
        const modelList = modelImports.get(model);
        if (!modelList)
          throw new Error(`No ${idField} is defined as belongsTo for ${name}?`);
        modelList.push(`${model}Id`);
        fieldLines.unshift(`${idField}: f.id<${model}Id>(),`);
      } else {
        imports.push('import type { Nominal } from "./_type-helpers";');
        idDefinition = `export type ${Name}Id = Nominal<string, "${name}">;`;
        fieldLines.unshift(`${idField}: f.id<${Name}Id>(),`);
      }
    };
    if (schema.idProp) {
      if (Array.isArray(schema.idProp)) {
        return `.compoundKey(${schema.idProp.map((id: string) => `"${id}"`).join(", ")})`;
      } else {
        addIdField(schema.idProp);
        return `.key("${schema.idProp}")`;
      }
    } else {
      addIdField("id");
      return `.key("id")`;
    }
  };
  const keyLine = getKeyLine();
  for (const [key, list] of modelImports) {
    if (key === name) continue;
    imports.push(
      `import { ${list.join(", ")} } from "./${capitalizeFirst(key)}";`,
    );
  }

  imports.unshift(`import { ${[...descImports].join(", ")} } from "./_desc";`);

  return `
${[...new Set(imports)].join("\n")}

${idDefinition}
export const ${name}Desc = makeModel("${name}")
  .fields({
    ${fieldLines.join("\n    ")}
    ${belongsToLines.join("\n    ")}
  })
  .hasMany({
    ${hasManyLines.join("\n    ")}
  })
  ${keyLine};
`;
}

// --- Main CLI ---
const inputPaths = process.argv.slice(2);
if (inputPaths.length === 0) {
  console.error("Usage: ts-node generate.ts <schema1.json> [schema2.json] ...");
  process.exit(1);
}

for (const inputPath of inputPaths) {
  const schema = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const tsOutput = generateTs(schema);

  const outPath = path.join(
    process.cwd(),
    "src/models",
    capitalizeFirst(schema.name) + ".ts",
  );
  fs.writeFileSync(outPath, tsOutput);
  console.log(`Generated ${outPath}`);
}
