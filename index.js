import compile from "@chicory-lang/compiler";

export default function chicory() {
  return {
    name: 'vite-plugin-chicory',
    enforce: 'pre', 
    config() {
      return {
        esbuild: {
          include: /\.chic$/,
          loader: 'jsx',
        },
      }
    },
    transform(source, id) {
      if (!id.endsWith('.chic')) {
        return null
      }

      try {
        const {code} = compile(source)
        return {
          code,
          map: null,
        };
      } catch (error) {
        console.error(`Error compiling ${id}:`, error);
        throw error;
      }
    }
  };
}