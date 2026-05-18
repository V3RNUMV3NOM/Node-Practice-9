const http = require('http');
const fs = require('fs');

// Отримуємо порт з аргументів командного рядка (як вимагає інструкція node <file>.js 3000)
const port = process.argv[2];

const server = http.createServer((req, res) => {
  // Перевіряємо метод та маршрут
  if (req.method === 'GET' && req.url === '/items') {
    // Читаємо файл data.json
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      
      // Встановлюємо статус 200 та правильний Content-Type
      res.writeHead(200, { 'Content-Type': 'application/json' });
      // Відправляємо вміст файлу як відповідь
      res.end(data);
    });
  } else {
    // Для всіх інших маршрутів або методів повертаємо помилку (не 200 статус)
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Запускаємо сервер
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});