from flask import Flask, jsonify, request
import psycopg2
from flasgger import Swagger
from flask_cors import CORS
import traceback
import requests

def initdb():
    conn = psycopg2.connect(
        host="postgres",
        database="mydb",
        user="user",
        password="password"
    )
    cur = conn.cursor()
    conn.commit()
    cur.close()
    conn.close()

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
CORS(app,
    resources={r"/*": {"origins": ["http://localhost:3000"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"]
)


# empty route/login screen
@app.route('/api/')
def default():
    return "default"


@app.route('/api/dashboard')
def dashboard():
    return "Dashboard"


@app.route('/api/users', methods=['GET'])
def getUsers():
    """
    Gets all users / Get the leaderboard
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
    if leaderboard_type not in ["code", "comment", "overall"]:
        return jsonify({"error": "Invalid leaderboard type"}), 400

    conn = getdbconnection()
    cur = conn.cursor()

    if leaderboard_type == "code":
        cur.execute("SELECT id, githubId, code_score FROM users ORDER BY code_score DESC;")
    if leaderboard_type == "comment":
        cur.execute("SELECT id, githubId, comment_score FROM users ORDER BY comment_score DESC;")
    if leaderboard_type == "overall":
        cur.execute(
            "SELECT id, githubId, (code_score + comment_score) AS total_score FROM users ORDER BY total_score DESC;")

    rows = cur.fetchall()
    cur.close()
    conn.close()
    data = [{"id": r[0], "name": r[1], "score": r[2]} for r in rows]
    return jsonify({"leaderboard": data})


@app.route('/api/users', methods=['POST'])
def addUser():
    """
        Add a new user to the leaderboard
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
                comment_score:
                  type: integer
                code_score:
                  type: integer
              example:
                githubId: username
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
    code_score = data.get('code_score')

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (githubId, comment_score, code_score)
                VALUES (%s, %s, %s) ON CONFLICT (githubId) DO NOTHING

                RETURNING id;
                """,
                (github_id, comment_score, code_score)
            )

            new_row = cur.fetchone()

            if new_row is None:
                cur.execute("SELECT id FROM users WHERE githubId = %s;", (github_id,))
                new_row = cur.fetchone()
            new_id = new_row[0]
        conn.commit()
    finally:
        conn.close()

    return jsonify({"id": new_id}), 201

@app.route('/api/users/<int:entry_id>', methods=['DELETE'])
def deleteUser(entry_id):
    """
    Delete a user
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


@app.route('/api/user/<int:entry_id>', methods=['PUT'])
def updateUser(entry_id):
    """
    Update a user
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


# ====================awards stuff =============================
@app.route('/api/achievements', methods=['GET'])
def getAchievements():
    """
    Get the achievements
    ---
    responses:
      200:
        description: Returns achievements
        content:
          application/json:
            schema:
              type: object
              properties:
                achievements:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: integer
                      awardname:
                        type: string
                      description:
                        type: string
    """

    conn = getdbconnection()
    cur = conn.cursor()

    cur.execute('SELECT id , awardname, description FROM awards')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    data = [{"id": r[0], "awardname": r[1], "description": r[2]} for r in rows]
    return jsonify({"leaderboard": data})


@app.route('/api/achievements', methods=['POST'])
def addAchievements():
    """
        Add a new entry to the achievements
        ---
        parameters:
          - name: body
            in: body
            required: true
            description: Add achievements
            schema:
              type: object
              required:
                - awardname
                - description
              properties:
                awardname:
                  type: string
                description:
                  type: string
              example:
                awardname: awardname
                description: award description
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
    awardname = data.get('awardname')
    description = data.get('description')

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO awards (awardname, description)
                VALUES (%s, %s) ON CONFLICT (awardname) DO NOTHING

                RETURNING id;
                """,
                (awardname, description)
            )

            new_row = cur.fetchone()[0]

        conn.commit()
    finally:
        conn.close()

    return jsonify({"id": new_row}), 201


@app.route('/api/achievements/<int:entry_id>', methods=['DELETE'])
def deleteachievements(entry_id):
    """
    Delete an achievement
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
            cur.execute("DELETE FROM awards WHERE id = %s RETURNING id;", (entry_id,))
            deleted = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if deleted:
        return jsonify({"message": "Entry deleted successfully"}), 200
    else:
        return jsonify({"error": "Entry not found"}), 404


# =============== give acievements to users section =================
@app.route('/api/users/<int:user_id>/achievements', methods=['GET'])
def get_user_achievements(user_id):
    """
    Get all achievements for a user
    ---
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID of the user
    responses:
      200:
        description: List of achievements
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              awardname:
                type: string
              description:
                type: string
    """
    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT a.id, a.awardname, a.description
                FROM awards a
                         JOIN user_awards ua ON a.id = ua.awardId
                WHERE ua.userId = %s;
                """,
                (user_id,)
            )
            achievements = [
                {"id": row[0], "awardname": row[1], "description": row[2]}
                for row in cur.fetchall()
            ]
    finally:
        conn.close()

    return jsonify(achievements), 200


@app.route('/api/users/<int:user_id>/achievements', methods=['POST'])
def give_user_achievement(user_id):
    """
    Give an achievement to a user
    ---
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID of the user
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - awardId
          properties:
            awardId:
              type: integer
          example:
            awardId: 1
    responses:
      201:
        description: Achievement granted
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing awardId
        schema:
          type: object
          properties:
            error:
              type: string
    """
    data = request.get_json()
    award_id = data.get('awardId')

    if not award_id:
        return jsonify({"error": "awardId is required"}), 400

    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_awards (userId, awardId)
                VALUES (%s, %s)
                ON CONFLICT (userId, awardId) DO NOTHING;
                """,
                (user_id, award_id)
            )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Achievement granted"}), 201



@app.route('/api/users/by-nickname/<nickname>/achievements', methods=['GET'])
def achievements_by_nickname(nickname):
    conn = getdbconnection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT a.id, a.awardname, a.description
                FROM awards a
                JOIN user_awards ua ON a.id = ua.awardId
                JOIN users u ON u.id = ua.userId
                WHERE u.githubId = %s;
                """,
                (nickname,)
            )
            rows = cur.fetchall()
            data = [{"id": r[0], "awardname": r[1], "description": r[2]} for r in rows]
            return jsonify(data)
    finally:
        conn.close()

@app.route('/api/settings')
def settings():
    return "Settings"

ai_url = "http://ai-service:8000/api"

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data:
        return jsonify({"error": "no JSON body received"}), 400

    try:
        resp = requests.post(f"{ai_url}/analyze", json=data, timeout=60)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.RequestException as e:
        print("ERROR in /api/analyze:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/api/classify', methods=['POST'])
def classify_route():
    data = request.json  # { "text": "some PR description" }
    try:
        resp = requests.post(f"{ai_url}/classify", json=data, timeout=60)
        resp.raise_for_status()
        return jsonify(resp.json())
        # send AI's response back to frontend
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/review', methods=['POST'])
def review():
    data = request.json

    try:
        resp = requests.post(f"{ai_url}/review", json=data, timeout=60)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/github_data")
def github_data():

    auth_header = request.headers.get("Authorization")
    print(auth_header)
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header", "authheader": auth_header}), 401

    token = auth_header[len("Bearer "):].strip()
    headers = {"Authorization": f"token {token}"}
    user_resp = requests.get("https://api.github.com/user", headers=headers)
    if user_resp.status_code != 200:
        return jsonify({"error": "Failed to fetch GitHub user", "details": user_resp.text}), user_resp.status_code

    user_data = user_resp.json()

    #username = user_data["login"]
    username = "ynydara"
    repo = "411-project"
    url = f"https://api.github.com/repos/{username}/{repo}/pulls"
    print(url)
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "GitHub API request failed", "details": response.text, "url":url}), response.status_code

    return jsonify(response.json())


if __name__ == '__main__':
    initdb()
    app.run(host="0.0.0.0", port=5000, debug=True)