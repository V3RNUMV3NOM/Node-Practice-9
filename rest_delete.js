const http = require('http');
const fs = require('fs');

const port = process.argv[2];

const server = http.createServer((req, res) => {
  // Перевіряємо, чи це метод DELETE та правильний маршрут
  if (req.method === 'DELETE' && req.url.startsWith('/items/')) {
    const urlParts = req.url.split('/');
    
    // Переконуємось, що URL має формат /items/id
    if (urlParts.length === 3 && urlParts[1] === 'items') {
      const idToDelete = urlParts[2];

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
        } catch (e) {
          items = [];
        }

        // Знаходимо індекс елемента, який треба видалити
        const itemIndex = items.findIndex(i => i.id.toString() === idToDelete);

        if (itemIndex !== -1) {
          // Якщо елемент знайдено, видаляємо його з масиву
          // Метод splice змінює оригінальний масив: (починаючи_з_індексу, скільки_елементів_видалити)
          items.splice(itemIndex, 1);

          // Записуємо оновлений масив (без віддаленого елемента) назад у файл
          fs.writeFile('data.json', JSON.stringify(items, null, 2), (writeErr) => {
            if (writeErr) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
              return;
            }

            // Повертаємо 200 статус (в інструкції не вимагається повертати JSON у відповідь)
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Deleted');
          });
        } else {
          // Якщо елемент з таким ID не знайдено — 404
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });
      return; // Вихід, щоб не спрацював код нижче
    }
  }

  // Для всіх інших маршрутів або методів повертаємо 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});