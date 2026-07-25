const generateTsconfig = (): string => {
  const tsconfig = {
    compilerOptions: {
      lib: ["esnext"],
      // TypeScript 6 no longer picks up @types/google-apps-script implicitly.
      types: ["google-apps-script"],
    },
    include: ["./src"],
  };

  return `${JSON.stringify(tsconfig, null, 2)}\n`;
};

export { generateTsconfig };
