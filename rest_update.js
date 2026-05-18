const http = require('http');
const fs = require('fs');

const port = process.argv[2];

const server = http.createServer((req, res) => {
  // Перевіряємо метод PUT та правильний формат маршруту
  if (req.method === 'PUT' && req.url.startsWith('/items/')) {
    const urlParts = req.url.split('/');
    
    if (urlParts.length === 3 && urlParts[1] === 'items') {
      const idToUpdate = urlParts[2];
      let body = '';

      // Збираємо дані з тіла запиту
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          // Парсимо дані, які потрібно оновити
          const updates = JSON.parse(body);

          // Читаємо поточний файл
          fs.readFile('data.json', 'utf8', (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
              return;
            }

            let items = [];
            try {
              items = JSON.parse(data);
            } catch (e) {
              items = [];
            }

            // Шукаємо індекс елемента, який потрібно оновити
            const itemIndex = items.findIndex(i => i.id.toString() === idToUpdate);

            if (itemIndex !== -1) {
              // Якщо елемент знайдено, оновлюємо його
              // Використовуємо спред-оператор (...) щоб злити старі дані з новими
              items[itemIndex] = { ...items[itemIndex], ...updates };

              // Записуємо оновлений масив назад у файл
              fs.writeFile('data.json', JSON.stringify(items, null, 2), (writeErr) => {
                if (writeErr) {
                  res.writeHead(500, { 'Content-Type': 'text/plain' });
                  res.end('Internal Server Error');
                  return;
                }

                // Повертаємо 200 та оновлений об'єкт
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(items[itemIndex]));
              });
            } else {
              // Якщо елемент з таким ID не знайдено, повертаємо 404
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('Not Found');
            }
          });
        } catch (parseError) {
          // Якщо прийшов невалідний JSON
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad Request');
        }
      });
      return; // Виходимо, щоб не спрацював код нижче
    }
  }

  // Для всіх інших маршрутів або методів повертаємо 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});