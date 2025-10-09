from flask import Flask, jsonify, request
import psycopg2
import requests
import os
from flask_cors import CORS
from jose import jwt


#run this only once pls
def initdb():
    conn = psycopg2.connect(
        host="postgres",
        database="mydb",
        user="user",
        password="password"
    )
    cur = conn.cursor()
    cur.execute("""
                CREATE TABLE IF NOT EXISTS leaderboard
                (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    score INT NOT NULL
                );
                """)

    # Insert some default data
    cur.execute("DELETE FROM leaderboard;")
    cur.execute("SELECT COUNT(*) FROM leaderboard;")
    if cur.fetchone()[0] == 0:  # only insert if empty
        cur.execute("""
                    INSERT INTO leaderboard (name, score)
                    VALUES ('Amber', 100),
                           ('Julie', 80),
                           ('Alyssa', 60);
                    """)

    conn.commit()
    cur.close()
    conn.close()

#this is the connection for da database
def getdbconnection():
    conn = psycopg2.connect(
        host="postgres",
        database="mydb",
        user="user",
        password="password"
    )
    return conn

app = Flask(__name__)
CORS(app)

#empty route/login screen
@app.route('/api/')
def default():
    return "default"

@app.route('/api/leaderboard', methods=['GET'])
def getleaderboard():
    conn = getdbconnection()
    cur = conn.cursor()
    cur.execute('SELECT id , name, score FROM leaderboard ORDER BY score DESC;')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    data = [{"id" : r[0] , "name": r[1], "score": r[2]} for r in rows]
    return jsonify({"leaderboard": data})

@app.route('/api/insights')
def insights():
    return "Insights"

@app.route('/api/achievements')
def profile():
    return "Acheivements"

@app.route('/api/settings')
def settings():
    return "Settings"


if __name__ == '__main__':
    initdb()
    app.run(host="0.0.0.0", port=5000, debug=True)