const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 80;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

async function main() {
  app.listen(PORT, () => {
    console.log(`Server opened at port ${PORT}`);
  });
}

main();