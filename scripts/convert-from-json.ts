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
    return `${name}: f.string({}),`;
  }
  switch (def.type) {
    case "date":
      return `${name}: f.date(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "day":
      return `${name}: f.day(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "int":
      return `${name}: f.int(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "bigint":
      return `${name}: f.bigint(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "bool":
      return `${name}: f.bool(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "json":
      return `${name}: f.object(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "array":
      return `${name}: f.array(${def.optional ? "{ optional: true }" : "{}"}),`;
    case "string":
    case undefined:
      return `${name}: f.string(${def.optional ? "{ optional: true }" : "{}"}),`;
    default:
      throw new Error(`Unknown type for field '${name}: ${def.type}'`);
  }
}

function generateTs(schema: any): string {
  const name = schema.name;
  const Name = capitalizeFirst(name);
  const descImports = new Set(["makeModel"]);
  const modelImports = new Map<string, string[]>();

  const imports: string[] = [];

  const fieldLines: string[] = [];
  const belongsToLines: string[] = [];
  const hasManyLines: string[] = [];

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
    descImports.add("relation");
    if (typeof b === "string") {
      const fk = `${b}Id`;
      const fkType = `${capitalizeFirst(b)}Id`;
      belongsToLines.push(`${fk}: f.belongsTo({}).type<${fkType}>(),`);
      modelImports.set(b, [`type ${fkType}`]);
      hasManyLines.push(
        `${b}: relation("${b}", { type: "belongsTo", fk: "${fk}" }),`,
      );
    } else if (typeof b === "object") {
      for (const [alias, def] of Object.entries<any>(b)) {
        const model = def.model ?? alias;
        const fk = `${alias}Id`;
        const fkType = `${capitalizeFirst(model)}Id`;
        belongsToLines.push(
          `${fk}: f.belongsTo(${def.optional ? "{ optional: true }" : "{}"}).type<${fkType}>(),`,
        );
        modelImports.set(model, [`type ${fkType}`]);
        hasManyLines.push(
          `${alias}: relation("${model}", { type: "belongsTo", fk: "${fk}" }),`,
        );
      }
    }
  }

  // hasMany
  for (const h of schema.hasMany || []) {
    descImports.add("relation");
    if (typeof h === "string") {
      hasManyLines.push(
        `${h}: relation("${removeTrailingS(h)}", { type: "hasMany" }),`,
      );
    } else if (typeof h === "object") {
      for (const [alias, def] of Object.entries<any>(h)) {
        const model = def.model ?? removeTrailingS(alias);
        const type = def.isSingleton ? "hasOne" : "hasMany";
        hasManyLines.push(
          `${alias}: relation("${model}", { type: "${type}" }),`,
        );
      }
    }
  }

  let idDefinition = "";

  // compoundKey or key
  const getKeyLine = () => {
    if (name === "_root") return "";
    const addIdField = (idField: string) => {
      imports.push('import type { Nominal } from "./_type-helpers";');
      idDefinition = `export type ${Name}Id = Nominal<string, "${name}">;`;
      fieldLines.unshift(`${idField}: f.id<${Name}Id>(),`);
    };
    if (schema.idProp) {
      if (Array.isArray(schema.idProp)) {
        return schema.idProp.map((id: string) => `"${id}"`).join(", ");
      } else {
        addIdField(schema.idProp);
        return `"${schema.idProp}"`;
      }
    } else {
      addIdField("id");
      return `"id"`;
    }
  };
  const keyLine = getKeyLine();
  for (const [key, list] of modelImports) {
    if (key === name) continue;
    imports.push(
      `import { ${list.join(", ")} } from "./${capitalizeFirst(key)}";`,
    );
  }

  if (fieldLines.length || belongsToLines.length) {
    imports.unshift('import * as f from "./_fields";');
  }
  imports.unshift(`import { ${[...descImports].join(", ")} } from "./_desc";`);

  return `
${[...new Set(imports)].join("\n")}

${idDefinition}
export const ${name}Desc = makeModel({
  name: "${name}",
  fields: {
    ${fieldLines.join("\n    ")}
    ${belongsToLines.join("\n    ")}
  },
  relations: {
    ${hasManyLines.join("\n    ")}
  },
  keys: [${keyLine}]
})`;
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
