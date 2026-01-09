// import { AliasReplacerArguments } from 'tsc-alias';

const appendJs = ["protobufjs/minimal"];

const FROM_IMPORT = /^from ['"](.*)['"]$/i;
const HAS_JS = /.js['"]$/i;

const parseImport = (input) => {
  const result = input.match(FROM_IMPORT);
  if (result) {
    return result[1];
  }

  return undefined;
};

const hasJS = (input) => {
  return !!input.match(HAS_JS);
};

export default function replacer({ orig, file, config }) {
  const importPath = parseImport(orig);
  if (importPath) {
    // ignore relative paths
    if (importPath.startsWith(".")) {
      return orig;
    }

    if (appendJs.includes(importPath)) {
      return `from "${importPath}.js"`;
    }
  }

  if (hasJS(orig)) {
    return orig;
  }

  return orig;
}
