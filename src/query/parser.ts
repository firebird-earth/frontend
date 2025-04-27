/**
 * Input: a string expression using:
 *   - Raster layer names (e.g., burn, slope)
 *   - Vector layer attributes (e.g., landownership)
 *   - Predefined constants (e.g., thresholds)
 *
 * Supports:
 *   - Logical ops: AND, OR, NOT
 *   - Comparison ops: >, <, >=, <=, ==, !=
 *   - Math ops: +, -, *, /
 *   - Unary negation (e.g., -slope or -5)
 *   - Functions: abs(), min(), max()
 *   - Vector-to-raster functions:
 *       - mask(layer)
 *       - label(layer, "attribute")
 *       - category(layer, "attribute")
 *       - distance_to(layer)
 *       - edge(layer)
 *   - Spatial ops: INTERSECTS(), WITHIN(), CONTAINS(), TOUCHES()
 *   - Categorical IN queries: e.g., ownership IN ('federal', 'blm')
 *   - Null checks: IS NULL, IS NOT NULL
 *   - Range checks: BETWEEN a AND b
 *   - Ternary expressions: condition ? value1 : value2
 *   - Variable assignment (LET var = expr)
 *   - Unit literals: e.g., 0.25 miles, 1000 meters, 500 ft
 *   - Comments using // or #
 *   - Support for named constants and string escaping (e.g., 'O\'Connor')
 *   - Support for quoted layer names with spaces (e.g., "Canopy Bulk Density")
 *
 * Output: an abstract syntax tree (AST) representing the expression or a sequence of assignments
 */

export type LiteralNode = { type: 'literal'; value: string | number | boolean | null };
export type LayerNode = { type: 'layer'; name: string };
export type UnaryNode = { op: 'NOT' | 'neg'; expr: ASTNode };
export type BinaryNode = { op: string; left: ASTNode; right: ASTNode };
export type FunctionNode = { type: 'function'; name: string; args: ASTNode[] };
export type SpatialOpNode = { op: string; args: ASTNode[] };
export type InNode = { op: 'in'; layer: ASTNode; values: ASTNode[] };
export type NullCheckNode = { op: 'isnull' | 'isnotnull'; layer: ASTNode };
export type BetweenNode = { op: 'between'; layer: ASTNode; low: ASTNode; high: ASTNode };
export type TernaryNode = { op: 'ternary'; condition: ASTNode; trueExpr: ASTNode; falseExpr: ASTNode };

export type ASTNode =
  | LiteralNode
  | LayerNode
  | UnaryNode
  | BinaryNode
  | FunctionNode
  | SpatialOpNode
  | InNode
  | NullCheckNode
  | BetweenNode
  | TernaryNode
  | ASTNodeMap;

export interface ASTNodeMap {
  [key: string]: ASTNode;
}

export function parseExpression(expr: string): ASTNode | ASTNodeMap {
  const tokens = expr
    .replace(/#.*/g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|LET|[\w.]+|>=|<=|==|!=|>|<|IN|IS NOT NULL|IS NULL|IS|BETWEEN|AND|OR|NOT|\?|:|=|\+|-|\*|\/|,|\(|\)/gi);

  if (!tokens) throw new Error('Failed to parse expression: no valid tokens');

  let i = 0;
  const assignments: ASTNodeMap = {};

  function peek(): string | undefined { return tokens[i]; }
  function consume(expected?: string): string {
    const token = tokens[i++];
    if (expected && token !== expected) {
      throw new Error(`Expected '${expected}' but found '${token}' at position ${i - 1}`);
    }
    if (!token) {
      throw new Error(`Unexpected end of input at position ${i}`);
    }
    return token;
  }

  function convertToMeters(value: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'mile':
      case 'miles': return value * 1609.34;
      case 'km': return value * 1000;
      case 'meter':
      case 'meters': return value;
      case 'ft':
      case 'feet': return value * 0.3048;
      default: throw new Error(`Unknown unit: ${unit}`);
    }
  }

  function parseValue(token: string): ASTNode {
    if (/^".*"$/.test(token)) return { type: 'layer', name: token.slice(1, -1) };
    if (/^'.*'$/.test(token)) return { type: 'literal', value: token.slice(1, -1).replace(/\\'/g, "'") };
    if (token === 'true') return { type: 'literal', value: true };
    if (token === 'false') return { type: 'literal', value: false };
    if (token === 'null') return { type: 'literal', value: null };

    const num = parseFloat(token);
    if (!isNaN(num)) {
      const next = peek();
      if (next && ['miles', 'mile', 'km', 'meters', 'meter', 'ft', 'feet'].includes(next.toLowerCase())) {
        const unit = consume();
        return { type: 'literal', value: convertToMeters(num, unit) };
      }
      return { type: 'literal', value: num };
    }

    return { type: 'layer', name: token };
  }

  function parseAtom(): ASTNode {
    if (peek() === '(') {
      consume('(');
      const node = parseTernary();
      consume(')');
      return node;
    }
    if (peek() === 'NOT') {
      consume('NOT');
      return { op: 'NOT', expr: parseAtom() };
    }
    if (peek() === '-') {
      consume('-');
      return { op: 'neg', expr: parseAtom() };
    }

    const token = consume();

    if (peek() === '(') {
      const fnName = token.toLowerCase();
      consume('(');
      const args: ASTNode[] = [];
      while (peek() !== ')') {
        args.push(parseTernary());
        if (peek() === ',') consume(',');
      }
      consume(')');

      const spatialOps = ["intersects", "within", "contains", "touches"];
      const vectorRasterFns = ["mask", "label", "category", "distance_to", "edge"];

      if (spatialOps.includes(fnName)) {
        return { op: fnName, args };
      }

      if (vectorRasterFns.includes(fnName)) {
        return { type: 'function', name: fnName, args };
      }

      return { type: 'function', name: fnName, args };
    }

    if (peek() === 'IN') {
      const layer = parseValue(token);
      consume('IN');
      consume('(');
      const values: ASTNode[] = [];
      while (peek() !== ')') {
        values.push(parseValue(consume()));
        if (peek() === ',') consume(',');
      }
      consume(')');
      return { op: 'in', layer, values };
    }

    if (peek() === 'IS') {
      const layer = parseValue(token);
      consume('IS');
      if (peek() === 'NOT') {
        consume('NOT');
        consume('NULL');
        return { op: 'isnotnull', layer };
      } else {
        consume('NULL');
        return { op: 'isnull', layer };
      }
    }

    if (peek() === 'BETWEEN') {
      const layer = parseValue(token);
      consume('BETWEEN');
      const low = parseAddSub();
      consume('AND');
      const high = parseAddSub();
      return { op: 'between', layer, low, high };
    }

    return assignments[token] || parseValue(token);
  }

  function parseMulDiv(): ASTNode {
    let node = parseAtom();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      node = { op, left: node, right: parseAtom() };
    }
    return node;
  }

  function parseAddSub(): ASTNode {
    let node = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      node = { op, left: node, right: parseMulDiv() };
    }
    return node;
  }

  function parseComparison(): ASTNode {
    let left = parseAddSub();
    const op = peek();
    if ([">", "<", ">=", "<=", "==", "!="].includes(op!)) {
      consume();
      const right = parseAddSub();
      return { op: op!, left, right };
    }
    return left;
  }

  function parseAnd(): ASTNode {
    let node = parseComparison();
    while (peek() === 'AND') {
      consume('AND');
      node = { op: 'AND', left: node, right: parseComparison() };
    }
    return node;
  }

  function parseOr(): ASTNode {
    let node = parseAnd();
    while (peek() === 'OR') {
      consume('OR');
      node = { op: 'OR', left: node, right: parseAnd() };
    }
    return node;
  }

  function parseTernary(): ASTNode {
    let condition = parseOr();
    if (peek() === '?') {
      consume('?');
      const trueExpr = parseTernary();
      consume(':');
      const falseExpr = parseTernary();
      return { op: 'ternary', condition, trueExpr, falseExpr };
    }
    return condition;
  }

  if (peek() === 'LET') {
    while (peek() === 'LET') {
      consume('LET');
      const name = consume();
      consume('=');
      assignments[name] = parseTernary();
    }
    return assignments;
  }

  return parseTernary();
}
