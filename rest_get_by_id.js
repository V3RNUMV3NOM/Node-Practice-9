const http = require('http');
const fs = require('fs');

const port = process.argv[2];

const server = http.createServer((req, res) => {
  // Перевіряємо, чи це GET запит і чи починається URL з '/items/'
  if (req.method === 'GET' && req.url.startsWith('/items/')) {
    
    // Розбиваємо URL на частини. Наприклад, '/items/1' стане ['', 'items', '1']
    const urlParts = req.url.split('/');
    
    // Перевіряємо формат (має бути рівно 3 частини)
    if (urlParts.length === 3 && urlParts[1] === 'items') {
      const idToFind = urlParts[2];

      fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        try {
          const items = JSON.parse(data);
          
          // Шукаємо елемент з відповідним id. 
          // Використовуємо .toString(), щоб уникнути проблем із типами (рядок vs число)
          const item = items.find(i => i.id.toString() === idToFind);

          if (item) {
            // Якщо знайшли — повертаємо 200 і сам об'єкт
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
          } else {
            // Якщо не знайшли — повертаємо 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        } catch (parseError) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error parsing JSON data');
        }
      });
      return; // Виходимо з функції, щоб не спрацював код нижче
    }
  }

  // Для всіх інших маршрутів повертаємо 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});