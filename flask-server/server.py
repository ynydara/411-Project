from flask import Flask

app = Flask(__name__)

#empty route/Dashboard
@app.route('/api/')
def dashboard():
    return "Dashboard"

@app.route('/api/leaderboard')
def leaderboard():
    return {"leaderboard": ["member1 on leaderboard", "member2 on leaderboard"]}

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
    app.run(host="0.0.0.0", port=5000, debug=True)