module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  "parserOptions": {
    "ecmaVersion": 2017,
    'sourceType': 'module',
    "ecmaFeatures": {
      "jsx": true
    }
  },
  extends: ["standard", "prettier"],
  plugins: [
    "prettier"
  ],
  rules: {
    "prettier/prettier": "error",
    "no-shadow": "warn",
    "no-return-await": "off"
  }
};
