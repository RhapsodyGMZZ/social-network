CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    creation DATETIME NOT NULL,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
);