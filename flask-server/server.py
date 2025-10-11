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
    # cur.execute("""
    #             CREATE TABLE IF NOT EXISTS leaderboard
    #             (
    #                 id SERIAL PRIMARY KEY,
    #                 name TEXT NOT NULL,
    #                 score INT NOT NULL
    #             );
    #             """)


    # cur.execute("DELETE FROM leaderboard;") #delete this at some point
    # cur.execute("SELECT COUNT(*) FROM leaderboard;")
    # if cur.fetchone()[0] == 0:  # only inserts if empty
    #     cur.execute("""
    #                 INSERT INTO leaderboard (name, score)
    #                 VALUES ('Amber', 100),
    #                        ('Julie', 80),
    #                        ('Alyssa', 60);
    #                 """)

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
    Optional query parameter:
      type: "code", "comment", or "overall" (default: "overall")
    ---
    parameters:
      - name: type
        in: query
        type: string
        required: false
        description: Leaderboard type ("code", "comment", "overall")
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
    leaderboard_type = request.args.get("type", "overall").lower()
    if leaderboard_type == ["code", "comment", "overall"]:
        return jsonify({"error": "Invalid leaderboard type"}), 400

    conn = getdbconnection()
    cur = conn.cursor()

    if leaderboard_type == "code":
        cur.execute("SELECT id, githubId, code_score FROM users ORDER BY code_score DESC;")
    if leaderboard_type == "comment":
        cur.execute("SELECT id, githubId, comment_score FROM users ORDER BY comment_score DESC;")
    if leaderboard_type == "overall":
        cur.execute("SELECT id, githubId, (code_score + comment_score) AS total_score FROM users ORDER BY total_score DESC;")

    # cur.execute('SELECT id , name, score FROM leaderboard ORDER BY score DESC;')
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
                - githubId
                - score
              properties:
                githubId:
                  type: string
                comment_score:
                  type: integer
                code_score:
                  type: integer
              example:
                githubId: "githubId"
                comment_score: 0
                code_score: 0
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
    github_id = data.get('githubId')
    comment_score = data.get('comment_score')
    code_score =data.get('code_score')

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (githubId, comment_score, code_score) VALUES (%s, %s, %s) RETURNING id;",
                (github_id, comment_score, code_score)
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
            cur.execute("DELETE FROM users WHERE id = %s RETURNING id;", (entry_id,))
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
        description: Fields to update (at least one githubId/code_score/comment_score)
        schema:
          type: object
          properties:
            githubId:
              type: string
              example: "githubId"
            code_score:
              type: integer
              example: 0
            comment_score:
              type: integer
              example: 0
    responses:
      200:
        description: Entry updated successfully
      400:
        description: Invalid input
      404:
        description: Entry not found
    """
    data = request.get_json(force=True)
    github_id = data.get("githubId")
    code_score = data.get("code_score")
    comment_score = data.get("comment_score")

    if github_id is None and code_score is None and comment_score is None:
        return jsonify({"error": "At least one field must be provided"}), 400

    updates = []
    values = []

    if github_id is not None:
        updates.append("githubId = %s")
        values.append(github_id)
    if code_score is not None:
        updates.append("code_score = %s")
        values.append(code_score)
    if comment_score is not None:
        updates.append("comment_score = %s")
        values.append(comment_score)

    set_clause = ", ".join(updates)
    values.append(entry_id)

    query = f"UPDATE users SET {set_clause} WHERE id = %s RETURNING id;"

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
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

@app.route('/api/achievements')
def profile():
    return "Acheivements"

@app.route('/api/settings')
def settings():
    return "Settings"


if __name__ == '__main__':
    initdb()
    app.run(host="0.0.0.0", port=5000, debug=True)