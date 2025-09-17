import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "price-timeline-card.js",  
  output: {
    file: "dist/price-timeline-card.js",
    format: "es"
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
