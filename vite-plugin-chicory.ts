import compile from "../compile";

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
    transform(code, id) {
      if (!id.endsWith('.chic')) {
        return null
      }

      try {
        return {
          code: compile(code),
          map: null,
        };
      } catch (error) {
        console.error(`Error compiling ${id}:`, error);
        throw error;
      }
    }
  };
}