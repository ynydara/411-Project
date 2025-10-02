from flask import Flask, jsonify, request
import psycopg2
from flasgger import Swagger
# from flask_cors import CORS
# CORS(app)
# import jose import jwt
import requests



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


    # cur.execute("DELETE FROM leaderboard;") #delete this at some point
    cur.execute("SELECT COUNT(*) FROM leaderboard;")
    if cur.fetchone()[0] == 0:  # only inserts if empty
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
swagger = Swagger(app)

#empty route/login screen
@app.route('/api/')
def default():
    return "default"


@app.route('/api/dashboard')
def dashboard():
    return "Dashboard"


@app.route('/api/leaderboard', methods=['GET'])
def getleaderboard():
    """
    Get the leaderboard
    ---
    responses:
      200:
        description: Returns leaderboard
        content:
          application/json:
            schema:
              type: object
              properties:
                leaderboard:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: integer
                      name:
                        type: string
                      score:
                        type: integer
    """
    conn = getdbconnection()
    cur = conn.cursor()
    cur.execute('SELECT id , name, score FROM leaderboard ORDER BY score DESC;')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    data = [{"id" : r[0] , "name": r[1], "score": r[2]} for r in rows]
    return jsonify({"leaderboard": data})

@app.route('/api/leaderboard', methods=['POST'])
def addLeaderboardEntry():
    """
        Add a new entry to the leaderboard
        ---
        parameters:
          - name: body
            in: body
            required: true
            description: Add leaderboard entry
            schema:
              type: object
              required:
                - name
                - score
              properties:
                name:
                  type: string
                score:
                  type: integer
              example:
                name: "name"
                score: 0
        responses:
          201:
            description: New entry created
            schema:
              type: object
              properties:
                id:
                  type: integer
        """
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO leaderboard (name, score) VALUES (%s, %s) RETURNING id;",
                (name, score)
            )
            new_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return jsonify({"id": new_id}), 201

@app.route('/api/leaderboard/<int:entry_id>', methods=['DELETE'])
def deleteLeaderboardEntry(entry_id):
    """
    Delete a leaderboard entry ID
    ---
    parameters:
      - name: entry_id
        in: path
        type: integer
        required: true
        description: ID to delete
    responses:
      200:
        description: Entry successfully deleted
        schema:
          type: object
          properties:
            message:
              type: string
              example: Entry deleted successfully
      404:
        description: Entry not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: Entry not found
    """
    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM leaderboard WHERE id = %s RETURNING id;", (entry_id,))
            deleted = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if deleted:
        return jsonify({"message": "Entry deleted successfully"}), 200
    else:
        return jsonify({"error": "Entry not found"}), 404

@app.route('/api/leaderboard/<int:entry_id>', methods=['PUT'])
def updateLeaderboardEntry(entry_id):
    """
    Update a leaderboard entry by ID
    ---
    parameters:
      - name: entry_id
        in: path
        type: integer
        required: true
        description: ID to update
      - in: body
        name: body
        required: true
        description: Fields to update (at least one name/score)
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Name"
            score:
              type: integer
              example: 0
    responses:
      200:
        description: Entry updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Entry updated successfully
      400:
        description: Invalid input
        schema:
          type: object
          properties:
            error:
              type: string
              example: At least one of name or score is required
      404:
        description: Entry not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: Not found
    """
    data = request.get_json(force=True)
    name = data.get("name")
    score = data.get("score")

    if name is None and score is None:
        return jsonify({"error": "At least one name/score is required"}), 400

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            query = "UPDATE leaderboard SET "
            values = []
            if name is not None:
                query += "name = %s"
                values.append(name)
            if score is not None:
                if values:
                    query += ", "
                query += "score = %s"
                values.append(score)
            query += " WHERE id = %s RETURNING id;"
            values.append(entry_id)

            cur.execute(query, tuple(values))
            updated = cur.fetchone()
            conn.commit()

            if not updated:
                return jsonify({"error": "Not found"}), 404
    finally:
        conn.close()

    return jsonify({"message": f"Entry {entry_id} updated successfully"}), 200






@app.route('/api/insights')
def insights():
    return "Insights"

@app.route('/api/profile')
def profile():
    return "My Profile"

@app.route('/api/settings')
def settings():
    return "Settings"


if __name__ == '__main__':
    initdb()
    app.run(host="0.0.0.0", port=5000, debug=True)