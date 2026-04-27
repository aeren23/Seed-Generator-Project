import sqlite3

def setup_complex_db():
    conn = sqlite3.connect('complex_test.db')
    cursor = conn.cursor()
    
    # 1. Categories Table
    cursor.execute('''
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url VARCHAR(255)
    )
    ''')
    
    # 2. Users Table
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        avatar_url VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 3. Products Table (Foreign Key to categories)
    cursor.execute('''
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name VARCHAR(200) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL,
        cover_image_url VARCHAR(255),
        FOREIGN KEY (category_id) REFERENCES categories (id)
    )
    ''')
    
    # 4. Orders Table (Foreign Key to users)
    cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # 5. Order Items Table (Foreign Keys to orders and products)
    cursor.execute('''
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Complex database 'complex_test.db' created successfully with relations and image URL fields.")

if __name__ == "__main__":
    setup_complex_db()
