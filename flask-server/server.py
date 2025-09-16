from flask import Flask

app = Flask(__name__)

#empty route/Dashboard
@app.route('/')
def dashboard():
    return "Dashboard"

@app.route('/leaderboard')
def leaderboard():
    return {
        "leaderboard": [
            {"name": "Member 1", "score": 5},
            {"name": "Member 2", "score": 4},
            {"name": "Member 3", "score": 8},
            {"name": "Member 4", "score": 10}
        ]
    }

@app.route('/insights')
def insights():
    return "Insights"

@app.route('/profile')
def profile():
    return "My Profile"

@app.route('/settings')
def settings():
    return "Settings"


if __name__ == '__main__':
    app.run(debug=True)