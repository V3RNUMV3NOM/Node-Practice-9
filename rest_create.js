const http = require('http');
const fs = require('fs');

const port = process.argv[2];

const server = http.createServer((req, res) => {
  // Перевіряємо метод POST та маршрут /items
  if (req.method === 'POST' && req.url === '/items') {
    let body = '';

    // Збираємо частини даних (chunks), що надходять у тілі запиту
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // Коли всі дані отримані
    req.on('end', () => {
      try {
        // Парсимо отриманий JSON
        const newItem = JSON.parse(body);

        // Читаємо поточний стан data.json
        fs.readFile('data.json', 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          let items = [];
          try {
            items = JSON.parse(data);
          } catch (parseErr) {
            // Якщо файл порожній або невалідний JSON, залишаємо порожній масив
            items = []; 
          }

          // Додаємо новий елемент до масиву
          items.push(newItem);

          // Записуємо оновлений масив назад у файл data.json
          // null та 2 використовуються для гарного форматування (відступи)
          fs.writeFile('data.json', JSON.stringify(items, null, 2), (writeErr) => {
            if (writeErr) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
              return;
            }

            // Повертаємо статус 201 (Created) та сам новостворений об'єкт
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
          });
        });
      } catch (error) {
        // Якщо надіслано невалідний JSON
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
  } else {
    // Для всіх інших маршрутів або методів повертаємо 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});