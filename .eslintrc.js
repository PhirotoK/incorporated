module.exports = {
  "env": { "es6": true },
  "parserOptions": {
    "ecmaVersion": 2017,
    'sourceType': 'module',
    "ecmaFeatures": {
      "jsx": true
    }
  },
  extends: ["standard", "prettier"],
  plugins: [
    "prettier",
    "react-hooks"
  ],
  rules: {
    "prettier/prettier": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-shadow": "warn",
    "no-return-await": "off",
    "camelcase": 2,
    "space-before-function-paren": ["error", "never"]
  }
};
